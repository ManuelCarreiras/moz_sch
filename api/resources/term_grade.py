from flask import request, Response
from flask_restful import Resource
from models.term_grade import TermGradeModel
from models.student import StudentModel
from models.subject import SubjectModel
from models.term import TermModel
from models.class_model import ClassModel
from models.school_year import SchoolYearModel
import json
import logging

class TermGradeResource(Resource):
    """CRUD operations for term grades"""
    
    def get(self, grade_id=None):
        """Get term grade(s)"""
        if grade_id:
            # Get specific grade
            grade = TermGradeModel.find_by_id(grade_id)
            if not grade:
                return {'message': 'Term grade not found'}, 404
            return grade.json(), 200
        
        # Get grades with filters
        student_id = request.args.get('student_id')
        subject_id = request.args.get('subject_id')
        term_id = request.args.get('term_id')
        class_id = request.args.get('class_id')
        year_id = request.args.get('year_id')
        class_name = request.args.get('class_name')
        is_finalized = request.args.get('is_finalized')
        
        # Build query
        query = TermGradeModel.query
        
        if student_id:
            query = query.filter_by(student_id=student_id)
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        if term_id:
            query = query.filter_by(term_id=term_id)
        if class_id:
            query = query.filter_by(class_id=class_id)
        if is_finalized is not None:
            query = query.filter_by(is_finalized=(is_finalized.lower() == 'true'))
        
        grades = query.all()
        
        # Filter by year_id if provided
        if year_id:
            grades = [g for g in grades if str(TermModel.find_by_id(g.term_id).year_id) == year_id]
        
        # Filter by class_name if provided
        if class_name:
            grades = [g for g in grades if g.class_id and ClassModel.find_by_id(g.class_id).class_name == class_name]
        
        # Enhance with related data
        enhanced_grades = []
        for grade in grades:
            grade_data = grade.json()
            
            # Add student name
            student = StudentModel.find_by_id(grade.student_id)
            if student:
                grade_data['student_name'] = f"{student.given_name} {student.surname}"
            
            # Add subject name
            subject = SubjectModel.find_by_id(grade.subject_id)
            if subject:
                grade_data['subject_name'] = subject.subject_name
            
            # Add term info
            term = TermModel.find_by_id(grade.term_id)
            if term:
                grade_data['term_number'] = term.term_number
                year = SchoolYearModel.find_by_id(term.year_id)
                if year:
                    grade_data['year_name'] = year.year_name
                    grade_data['year_id'] = str(year._id)
            
            # Add class name
            if grade.class_id:
                class_obj = ClassModel.find_by_id(grade.class_id)
                if class_obj:
                    grade_data['class_name'] = class_obj.class_name
            
            enhanced_grades.append(grade_data)
        
        return {
            'term_grades': enhanced_grades,
            'count': len(enhanced_grades)
        }, 200
    
    def post(self):
        """Create or recalculate term grade"""
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'subject_id', 'term_id']
        for field in required_fields:
            if field not in data:
                return {'message': f'Missing required field: {field}'}, 400
        
        try:
            # Calculate and save term grade
            term_grade = TermGradeModel.calculate_and_save(
                student_id=data['student_id'],
                subject_id=data['subject_id'],
                term_id=data['term_id'],
                class_id=data.get('class_id'),
                created_by=data.get('created_by')
            )
            
            if not term_grade:
                return {'message': 'No grade components found to calculate grade'}, 400
            
            return {
                'message': 'Term grade calculated successfully',
                'term_grade': term_grade.json()
            }, 201
            
        except Exception as e:
            logging.error(f"Error calculating term grade: {str(e)}")
            return {'message': f'Error calculating term grade: {str(e)}'}, 500
    
    def put(self, grade_id):
        """Update term grade (manual override or finalize)"""
        grade = TermGradeModel.find_by_id(grade_id)
        if not grade:
            return {'message': 'Term grade not found'}, 404
        
        data = request.get_json()
        
        try:
            # Update manual override
            if 'manual_override' in data:
                grade.manual_override = data['manual_override']
                grade.final_grade = data['manual_override']
            
            # Update finalized status
            if 'is_finalized' in data:
                grade.is_finalized = data['is_finalized']
                if data['is_finalized']:
                    from datetime import datetime
                    grade.finalized_date = datetime.utcnow()
                    if 'finalized_by' in data:
                        grade.finalized_by = data['finalized_by']
            
            # Update comments
            if 'comments' in data:
                grade.comments = data['comments']
            
            grade.save_to_db()
            
            return {
                'message': 'Term grade updated successfully',
                'term_grade': grade.json()
            }, 200
            
        except Exception as e:
            logging.error(f"Error updating term grade: {str(e)}")
            return {'message': f'Error updating term grade: {str(e)}'}, 500
    
    def delete(self, grade_id):
        """Delete term grade"""
        grade = TermGradeModel.find_by_id(grade_id)
        if not grade:
            return {'message': 'Term grade not found'}, 404
        
        try:
            grade.delete_from_db()
            return {'message': 'Term grade deleted successfully'}, 200
            
        except Exception as e:
            logging.error(f"Error deleting term grade: {str(e)}")
            return {'message': f'Error deleting term grade: {str(e)}'}, 500


class TermGradeCalculateResource(Resource):
    """Bulk calculate term grades"""
    
    def post(self):
        """Calculate term grades for multiple students"""
        data = request.get_json()
        
        # Can provide either a list of student/subject/term combinations
        # or filters to calculate for all matching students
        
        if 'students' in data:
            # Specific students
            calculated = []
            errors = []
            
            for student_data in data['students']:
                try:
                    term_grade = TermGradeModel.calculate_and_save(
                        student_id=student_data['student_id'],
                        subject_id=student_data['subject_id'],
                        term_id=student_data['term_id'],
                        class_id=student_data.get('class_id'),
                        created_by=data.get('created_by')
                    )
                    if term_grade:
                        calculated.append(term_grade.json())
                except Exception as e:
                    errors.append({
                        'student_id': student_data.get('student_id'),
                        'error': str(e)
                    })
            
            return {
                'message': f'Calculated {len(calculated)} term grades',
                'calculated': calculated,
                'errors': errors
            }, 200
        
        else:
            # Calculate for all students matching filters
            term_id = data.get('term_id')
            subject_id = data.get('subject_id')
            class_id = data.get('class_id')
            
            if not term_id:
                return {'message': 'term_id is required'}, 400
            
            # Get all student assignments for this term to find students
            from models.student_assignment import StudentAssignmentModel
            from models.assignment import AssignmentModel
            
            # Get all assignments for this term/subject
            assignment_query = AssignmentModel.query.filter_by(term_id=term_id)
            if subject_id:
                assignment_query = assignment_query.filter_by(subject_id=subject_id)
            
            assignments = assignment_query.all()
            assignment_ids = [str(a._id) for a in assignments]
            
            # Get unique student/subject combinations from student assignments
            student_subjects = set()
            if assignment_ids:
                student_assignments = StudentAssignmentModel.query.filter(
                    StudentAssignmentModel.assignment_id.in_(assignment_ids)
                ).all()
                
                for sa in student_assignments:
                    assignment = next((a for a in assignments if str(a._id) == str(sa.assignment_id)), None)
                    if assignment:
                        student_subjects.add((
                            str(sa.student_id),
                            str(assignment.subject_id),
                            str(assignment.term_id),
                            str(class_id) if class_id else None
                        ))
            
            # Calculate grades
            calculated = []
            for student_id, subj_id, trm_id, cls_id in student_subjects:
                try:
                    term_grade = TermGradeModel.calculate_and_save(
                        student_id=student_id,
                        subject_id=subj_id,
                        term_id=trm_id,
                        class_id=cls_id,
                        created_by=data.get('created_by')
                    )
                    if term_grade:
                        calculated.append(term_grade.json())
                except Exception as e:
                    logging.error(f"Error calculating grade: {str(e)}")
            
            return {
                'message': f'Calculated {len(calculated)} term grades',
                'calculated': calculated
            }, 200

