from flask import request
from flask_restful import Resource
from models.grading_criteria import GradingCriteriaModel
from models.subject import SubjectModel
from models.year_level import YearLevelModel
from models.assessment_type import AssessmentTypeModel
from utils.auth_middleware import require_role
import logging

class GradingCriteriaResource(Resource):
    """Admin-only: Manage grading criteria for subjects"""
    
    @require_role('admin')
    def get(self, criteria_id=None):
        """Get grading criteria"""
        if criteria_id:
            criteria = GradingCriteriaModel.find_by_id(criteria_id)
            if not criteria:
                return {'message': 'Grading criteria not found'}, 404
            return criteria.json(), 200
        
        # Get criteria with filters
        subject_id = request.args.get('subject_id')
        year_level_id = request.args.get('year_level_id')
        
        if subject_id and year_level_id:
            criteria_list = GradingCriteriaModel.find_by_subject_year_level(subject_id, year_level_id)
        else:
            criteria_list = GradingCriteriaModel.find_all()
        
        # Enhance with related data
        enhanced_criteria = []
        for criteria in criteria_list:
            crit_data = criteria.json()
            
            # Add subject name
            subject = SubjectModel.find_by_id(criteria.subject_id)
            if subject:
                crit_data['subject_name'] = subject.subject_name
            
            # Add year level order
            year_level = YearLevelModel.find_by_id(criteria.year_level_id)
            if year_level:
                crit_data['year_level_order'] = year_level.level_order
            
            # Add assessment type name if applicable
            if criteria.assessment_type_id:
                assessment_type = AssessmentTypeModel.find_by_id(criteria.assessment_type_id)
                if assessment_type:
                    crit_data['assessment_type_name'] = assessment_type.type_name
            
            enhanced_criteria.append(crit_data)
        
        # Calculate total weight if filtering
        total_weight = 0
        if subject_id and year_level_id:
            total_weight = sum(float(c.weight) for c in criteria_list)
        
        return {
            'grading_criteria': enhanced_criteria,
            'count': len(enhanced_criteria),
            'total_weight': total_weight if subject_id and year_level_id else None,
            'is_complete': total_weight >= 100 if subject_id and year_level_id else None
        }, 200
    
    @require_role('admin')
    def post(self):
        """Create grading criteria"""
        data = request.get_json()
        
        required_fields = ['subject_id', 'year_level_id', 'component_name', 'weight', 'source_type']
        for field in required_fields:
            if field not in data:
                return {'message': f'Missing required field: {field}'}, 400
        
        # Validate source_type
        if data['source_type'] not in ['assignment', 'attendance']:
            return {'message': 'source_type must be "assignment" or "attendance"'}, 400
        
        # If source_type is assignment, assessment_type_id is required
        if data['source_type'] == 'assignment' and not data.get('assessment_type_id'):
            return {'message': 'assessment_type_id is required for assignment source_type'}, 400
        
        try:
            criteria = GradingCriteriaModel(
                subject_id=data['subject_id'],
                year_level_id=data['year_level_id'],
                component_name=data['component_name'],
                weight=data['weight'],
                source_type=data['source_type'],
                assessment_type_id=data.get('assessment_type_id'),
                description=data.get('description'),
                created_by=data.get('created_by')
            )
            
            criteria.save_to_db()
            
            return {
                'message': 'Grading criteria created successfully',
                'grading_criteria': criteria.json()
            }, 201
            
        except Exception as e:
            logging.error(f"Error creating grading criteria: {str(e)}")
            return {'message': f'Error: {str(e)}'}, 500
    
    @require_role('admin')
    def put(self, criteria_id):
        """Update grading criteria"""
        criteria = GradingCriteriaModel.find_by_id(criteria_id)
        if not criteria:
            return {'message': 'Grading criteria not found'}, 404
        
        data = request.get_json()
        
        try:
            if 'component_name' in data:
                criteria.component_name = data['component_name']
            if 'weight' in data:
                criteria.weight = data['weight']
            if 'description' in data:
                criteria.description = data['description']
            if 'assessment_type_id' in data:
                criteria.assessment_type_id = data['assessment_type_id']
            
            criteria.save_to_db()
            
            return {
                'message': 'Grading criteria updated successfully',
                'grading_criteria': criteria.json()
            }, 200
            
        except Exception as e:
            logging.error(f"Error updating grading criteria: {str(e)}")
            return {'message': f'Error: {str(e)}'}, 500
    
    @require_role('admin')
    def delete(self, criteria_id):
        """Delete grading criteria"""
        criteria = GradingCriteriaModel.find_by_id(criteria_id)
        if not criteria:
            return {'message': 'Grading criteria not found'}, 404
        
        try:
            criteria.delete_from_db()
            return {'message': 'Grading criteria deleted successfully'}, 200
            
        except Exception as e:
            logging.error(f"Error deleting grading criteria: {str(e)}")
            return {'message': f'Error: {str(e)}'}, 500

