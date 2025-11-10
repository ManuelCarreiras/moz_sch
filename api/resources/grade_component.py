from flask import request, Response
from flask_restful import Resource
from models.grade_component import GradeComponentModel
from models.student import StudentModel
from models.subject import SubjectModel
from models.term import TermModel
from models.class_model import ClassModel
import json
import logging

class GradeComponentResource(Resource):
    """CRUD operations for grade components"""
    
    def get(self, component_id=None):
        """Get grade component(s)"""
        if component_id:
            # Get specific component
            component = GradeComponentModel.find_by_id(component_id)
            if not component:
                return {'message': 'Grade component not found'}, 404
            return component.json(), 200
        
        # Get components with filters
        student_id = request.args.get('student_id')
        subject_id = request.args.get('subject_id')
        term_id = request.args.get('term_id')
        class_id = request.args.get('class_id')
        component_type = request.args.get('component_type')
        
        # Build query
        query = GradeComponentModel.query
        
        if student_id:
            query = query.filter_by(student_id=student_id)
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        if term_id:
            query = query.filter_by(term_id=term_id)
        if class_id:
            query = query.filter_by(class_id=class_id)
        if component_type:
            query = query.filter_by(component_type=component_type)
        
        components = query.all()
        
        # Enhance with related data
        enhanced_components = []
        for component in components:
            comp_data = component.json()
            
            # Add student name
            student = StudentModel.find_by_id(component.student_id)
            if student:
                comp_data['student_name'] = f"{student.given_name} {student.surname}"
            
            # Add subject name
            subject = SubjectModel.find_by_id(component.subject_id)
            if subject:
                comp_data['subject_name'] = subject.subject_name
            
            # Add term info
            term = TermModel.find_by_id(component.term_id)
            if term:
                comp_data['term_number'] = term.term_number
            
            # Add class name
            if component.class_id:
                class_obj = ClassModel.find_by_id(component.class_id)
                if class_obj:
                    comp_data['class_name'] = class_obj.class_name
            
            enhanced_components.append(comp_data)
        
        return {
            'grade_components': enhanced_components,
            'count': len(enhanced_components)
        }, 200
    
    def post(self):
        """Create a new grade component"""
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'subject_id', 'term_id', 'component_type', 
                          'component_name', 'score', 'weight']
        for field in required_fields:
            if field not in data:
                return {'message': f'Missing required field: {field}'}, 400
        
        try:
            # Create component
            component = GradeComponentModel(
                student_id=data['student_id'],
                subject_id=data['subject_id'],
                term_id=data['term_id'],
                component_type=data['component_type'],
                component_name=data['component_name'],
                score=data['score'],
                weight=data['weight'],
                class_id=data.get('class_id'),
                description=data.get('description'),
                max_score=data.get('max_score', 20.0),
                notes=data.get('notes'),
                created_by=data.get('created_by')
            )
            
            component.save_to_db()
            
            # Recalculate term grade
            from models.term_grade import TermGradeModel
            TermGradeModel.calculate_and_save(
                student_id=data['student_id'],
                subject_id=data['subject_id'],
                term_id=data['term_id'],
                class_id=data.get('class_id'),
                created_by=data.get('created_by')
            )
            
            return {
                'message': 'Grade component created successfully',
                'grade_component': component.json()
            }, 201
            
        except Exception as e:
            logging.error(f"Error creating grade component: {str(e)}")
            return {'message': f'Error creating grade component: {str(e)}'}, 500
    
    def put(self, component_id):
        """Update a grade component"""
        component = GradeComponentModel.find_by_id(component_id)
        if not component:
            return {'message': 'Grade component not found'}, 404
        
        data = request.get_json()
        
        try:
            # Update fields
            if 'component_type' in data:
                component.component_type = data['component_type']
            if 'component_name' in data:
                component.component_name = data['component_name']
            if 'description' in data:
                component.description = data['description']
            if 'score' in data:
                component.score = data['score']
            if 'max_score' in data:
                component.max_score = data['max_score']
            if 'weight' in data:
                component.weight = data['weight']
            if 'notes' in data:
                component.notes = data['notes']
            
            component.save_to_db()
            
            # Recalculate term grade
            from models.term_grade import TermGradeModel
            TermGradeModel.calculate_and_save(
                student_id=component.student_id,
                subject_id=component.subject_id,
                term_id=component.term_id,
                class_id=component.class_id,
                created_by=data.get('created_by')
            )
            
            return {
                'message': 'Grade component updated successfully',
                'grade_component': component.json()
            }, 200
            
        except Exception as e:
            logging.error(f"Error updating grade component: {str(e)}")
            return {'message': f'Error updating grade component: {str(e)}'}, 500
    
    def delete(self, component_id):
        """Delete a grade component"""
        component = GradeComponentModel.find_by_id(component_id)
        if not component:
            return {'message': 'Grade component not found'}, 404
        
        try:
            student_id = component.student_id
            subject_id = component.subject_id
            term_id = component.term_id
            class_id = component.class_id
            
            component.delete_from_db()
            
            # Recalculate term grade
            from models.term_grade import TermGradeModel
            TermGradeModel.calculate_and_save(
                student_id=student_id,
                subject_id=subject_id,
                term_id=term_id,
                class_id=class_id
            )
            
            return {'message': 'Grade component deleted successfully'}, 200
            
        except Exception as e:
            logging.error(f"Error deleting grade component: {str(e)}")
            return {'message': f'Error deleting grade component: {str(e)}'}, 500


class GradeComponentAutoCreateResource(Resource):
    """Auto-create grade components from assignments"""
    
    def post(self):
        """Auto-create grade components from graded assignments"""
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'subject_id', 'term_id']
        for field in required_fields:
            if field not in data:
                return {'message': f'Missing required field: {field}'}, 400
        
        try:
            components = GradeComponentModel.auto_create_from_assignments(
                student_id=data['student_id'],
                subject_id=data['subject_id'],
                term_id=data['term_id'],
                class_id=data.get('class_id'),
                created_by=data.get('created_by')
            )
            
            return {
                'message': f'Auto-created {len(components)} grade components',
                'components': [c.json() for c in components]
            }, 201
            
        except Exception as e:
            logging.error(f"Error auto-creating grade components: {str(e)}")
            return {'message': f'Error auto-creating grade components: {str(e)}'}, 500


class GradeComponentBulkResource(Resource):
    """Bulk operations for grade components"""
    
    def post(self):
        """Create multiple grade components at once"""
        data = request.get_json()
        
        if 'components' not in data or not isinstance(data['components'], list):
            return {'message': 'Missing or invalid components array'}, 400
        
        created_components = []
        errors = []
        
        for comp_data in data['components']:
            try:
                component = GradeComponentModel(
                    student_id=comp_data['student_id'],
                    subject_id=comp_data['subject_id'],
                    term_id=comp_data['term_id'],
                    component_type=comp_data['component_type'],
                    component_name=comp_data['component_name'],
                    score=comp_data['score'],
                    weight=comp_data['weight'],
                    class_id=comp_data.get('class_id'),
                    description=comp_data.get('description'),
                    max_score=comp_data.get('max_score', 20.0),
                    notes=comp_data.get('notes'),
                    created_by=comp_data.get('created_by')
                )
                component.save_to_db()
                created_components.append(component.json())
                
            except Exception as e:
                errors.append({
                    'component': comp_data.get('component_name', 'Unknown'),
                    'error': str(e)
                })
        
        # Recalculate term grades for affected students
        affected_students = set()
        for comp_data in data['components']:
            key = (comp_data['student_id'], comp_data['subject_id'], comp_data['term_id'])
            affected_students.add(key)
        
        from models.term_grade import TermGradeModel
        for student_id, subject_id, term_id in affected_students:
            try:
                TermGradeModel.calculate_and_save(student_id, subject_id, term_id)
            except Exception as e:
                logging.error(f"Error recalculating term grade: {str(e)}")
        
        return {
            'message': f'Created {len(created_components)} grade components',
            'created': created_components,
            'errors': errors
        }, 201 if not errors else 207  # 207 = Multi-Status

