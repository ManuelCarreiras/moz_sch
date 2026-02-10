from flask_restful import Resource, reqparse
from flask import Response, request
from models.assessment_type import AssessmentTypeModel
from utils.auth_middleware import require_role, require_any_role
import json


class AssessmentTypeResource(Resource):
    """
    Assessment Type Resource - Manage assessment types (Homework, Quiz, Test, etc.)
    """

    parser = reqparse.RequestParser()
    parser.add_argument('type_name', type=str, required=True, help="Type name is required")
    parser.add_argument('description', type=str, required=False)

    @require_any_role(['admin', 'teacher', 'student'])
    def get(self, type_id=None):
        """
        GET /assessment_type - Get all assessment types
        GET /assessment_type/<type_id> - Get specific assessment type
        """
        if type_id:
            # Get specific assessment type
            assessment_type = AssessmentTypeModel.find_by_id(type_id)
            if assessment_type:
                return {'assessment_type': assessment_type.json()}, 200
            return {'message': 'Assessment type not found'}, 404
        
        # Get all assessment types
        assessment_types = AssessmentTypeModel.find_all()
        return {
            'assessment_types': [at.json() for at in assessment_types],
            'count': len(assessment_types)
        }, 200

    @require_any_role(['admin', 'secretary'])
    def post(self):
        """
        POST /assessment_type - Create new assessment type (admin and secretary only)
        """
        data = request.get_json()
        
        if not data:
            return {'message': 'No data provided'}, 400
        
        type_name = data.get('type_name')
        description = data.get('description')
        
        if not type_name:
            return {'message': 'Type name is required'}, 400
        
        # Check if assessment type already exists
        existing = AssessmentTypeModel.find_by_name(type_name)
        if existing:
            return {'message': f'Assessment type "{type_name}" already exists'}, 400
        
        try:
            new_type = AssessmentTypeModel(
                type_name=type_name,
                description=description
            )
            new_type.save_to_db()
            
            response = {
                'success': True,
                'message': 'Assessment type created successfully',
                'assessment_type': new_type.json()
            }
            return Response(json.dumps(response), 201, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error creating assessment type: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'secretary'])
    def put(self):
        """
        PUT /assessment_type - Update assessment type (admin and secretary only)
        """
        data = request.get_json()
        
        if not data or '_id' not in data:
            return {'message': 'Assessment type ID is required'}, 400
        
        assessment_type = AssessmentTypeModel.find_by_id(data['_id'])
        
        if not assessment_type:
            return {'message': 'Assessment type not found'}, 404
        
        try:
            # Update fields
            if 'type_name' in data:
                # Check if new name already exists
                existing = AssessmentTypeModel.find_by_name(data['type_name'])
                if existing and str(existing._id) != data['_id']:
                    return {'message': f'Assessment type "{data["type_name"]}" already exists'}, 400
                assessment_type.type_name = data['type_name']
            
            if 'description' in data:
                assessment_type.description = data['description']
            
            assessment_type.save_to_db()
            
            response = {
                'success': True,
                'message': 'Assessment type updated successfully',
                'assessment_type': assessment_type.json()
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error updating assessment type: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'secretary'])
    def delete(self, type_id):
        """
        DELETE /assessment_type/<type_id> - Delete assessment type (admin and secretary only)
        """
        assessment_type = AssessmentTypeModel.find_by_id(type_id)
        
        if not assessment_type:
            return {'message': 'Assessment type not found'}, 404
        
        try:
            assessment_type.delete_from_db()
            response = {
                'success': True,
                'message': 'Assessment type deleted successfully'
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting assessment type: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

