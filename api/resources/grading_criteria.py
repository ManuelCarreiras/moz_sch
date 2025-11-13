from flask import request
from flask_restful import Resource
from models.grading_criteria import GradingCriteriaModel
from models.subject import SubjectModel
from models.year_level import YearLevelModel
from models.school_year import SchoolYearModel
from utils.auth_middleware import require_role
import logging

class GradingCriteriaResource(Resource):
    """Admin-only: Manage grading criteria for subjects (simplified: one row per subject+year)"""
    
    @require_role('admin')
    def get(self, criteria_id=None):
        """Get grading criteria"""
        if criteria_id:
            criteria = GradingCriteriaModel.find_by_id(criteria_id)
            if not criteria:
                return {'message': 'Grading criteria not found'}, 404
            
            # Enhance with related data
            crit_data = criteria.json()
            subject = SubjectModel.find_by_id(criteria.subject_id)
            if subject:
                crit_data['subject_name'] = subject.subject_name
            
            year_level = YearLevelModel.find_by_id(criteria.year_level_id)
            if year_level:
                crit_data['year_level_order'] = year_level.level_order
            
            school_year = SchoolYearModel.find_by_id(criteria.school_year_id)
            if school_year:
                crit_data['school_year_name'] = school_year.year_name
            
            return crit_data, 200
        
        # Get criteria with filters
        subject_id = request.args.get('subject_id')
        year_level_id = request.args.get('year_level_id')
        school_year_id = request.args.get('school_year_id')
        
        if subject_id and year_level_id and school_year_id:
            # Get specific criteria
            criteria = GradingCriteriaModel.find_by_subject_year_level(subject_id, year_level_id, school_year_id)
            if criteria:
                crit_data = criteria.json()
                subject = SubjectModel.find_by_id(criteria.subject_id)
                if subject:
                    crit_data['subject_name'] = subject.subject_name
                
                year_level = YearLevelModel.find_by_id(criteria.year_level_id)
                if year_level:
                    crit_data['year_level_order'] = year_level.level_order
                
                school_year = SchoolYearModel.find_by_id(criteria.school_year_id)
                if school_year:
                    crit_data['school_year_name'] = school_year.year_name
                
                return {'grading_criteria': [crit_data]}, 200
            else:
                return {'grading_criteria': []}, 200
        else:
            # Get all criteria
            criteria_list = GradingCriteriaModel.find_all()
            
            enhanced_criteria = []
            for criteria in criteria_list:
                crit_data = criteria.json()
                
                subject = SubjectModel.find_by_id(criteria.subject_id)
                if subject:
                    crit_data['subject_name'] = subject.subject_name
                
                year_level = YearLevelModel.find_by_id(criteria.year_level_id)
                if year_level:
                    crit_data['year_level_order'] = year_level.level_order
                
                school_year = SchoolYearModel.find_by_id(criteria.school_year_id)
                if school_year:
                    crit_data['school_year_name'] = school_year.year_name
                
                enhanced_criteria.append(crit_data)
            
            return {
                'grading_criteria': enhanced_criteria,
                'count': len(enhanced_criteria)
            }, 200
    
    @require_role('admin')
    def post(self):
        """Create grading criteria"""
        data = request.get_json()
        
        required_fields = ['subject_id', 'year_level_id', 'school_year_id', 'tests_weight', 'homework_weight', 'attendance_weight']
        for field in required_fields:
            if field not in data:
                return {'message': f'Missing required field: {field}'}, 400
        
        # Validate weights
        total_weight = float(data['tests_weight']) + float(data['homework_weight']) + float(data['attendance_weight'])
        if abs(total_weight - 100) > 0.01:  # Allow small floating point errors
            return {'message': f'Weights must add up to 100%. Current total: {total_weight}%'}, 400
        
        # Check if criteria already exists
        existing = GradingCriteriaModel.find_by_subject_year_level(
            data['subject_id'],
            data['year_level_id'],
            data['school_year_id']
        )
        
        if existing:
            return {'message': 'Grading criteria already exists for this subject, year level, and school year. Use PUT to update.'}, 409
        
        try:
            criteria = GradingCriteriaModel(
                subject_id=data['subject_id'],
                year_level_id=data['year_level_id'],
                school_year_id=data['school_year_id'],
                tests_weight=data['tests_weight'],
                homework_weight=data['homework_weight'],
                attendance_weight=data['attendance_weight'],
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
        
        # If updating weights, validate total
        if 'tests_weight' in data or 'homework_weight' in data or 'attendance_weight' in data:
            tests = float(data.get('tests_weight', criteria.tests_weight))
            homework = float(data.get('homework_weight', criteria.homework_weight))
            attendance = float(data.get('attendance_weight', criteria.attendance_weight))
            total_weight = tests + homework + attendance
            
            if abs(total_weight - 100) > 0.01:
                return {'message': f'Weights must add up to 100%. Current total: {total_weight}%'}, 400
        
        try:
            if 'tests_weight' in data:
                criteria.tests_weight = data['tests_weight']
            if 'homework_weight' in data:
                criteria.homework_weight = data['homework_weight']
            if 'attendance_weight' in data:
                criteria.attendance_weight = data['attendance_weight']
            if 'description' in data:
                criteria.description = data['description']
            
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
