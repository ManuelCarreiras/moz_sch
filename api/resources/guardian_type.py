from flask import request, Response
from flask_restful import Resource
from models.guardian_type import GuardianTypeModel
import json


class GuardianTypeResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('guardian_type_name')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        # Map guardian_type_name to name for the model
        new_guardian_type = GuardianTypeModel(name=data['guardian_type_name'])
        new_guardian_type.save_to_db()

        response = {
            'success': True,
            'message': new_guardian_type.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific guardian type by ID
            guardian_type = GuardianTypeModel.find_by_id(id)
            if guardian_type is None:
                response = {
                    'success': False,
                    'message': 'Guardian type not found'
                }
                return Response(json.dumps(response), 404)
            response = {
                'success': True,
                'message': guardian_type.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Create default guardian types if they don't exist
            GuardianTypeModel.create_default_types()

            # Get all guardian types
            guardian_types = GuardianTypeModel.find_all()
            guardian_types_list = [guardian_type.json() for guardian_type in guardian_types]  # noqa: E501
            response = {
                'success': True,
                'message': guardian_types_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Guardian type does not exist'
            }
            return Response(json.dumps(response), 404)
        guardian_type = GuardianTypeModel.find_by_id(data['_id'])

        if guardian_type is None:
            response = {
                'success': False,
                'message': 'Guardian type not found'
            }
            return Response(json.dumps(response), 404)

        guardian_type.update_entry(data)
        response = {
            'success': True,
            'message': guardian_type.json()
        }
        return Response(json.dumps(response), 200)

    def delete(self, id):
        guardian_type = GuardianTypeModel.find_by_id(id)

        if guardian_type is None:
            response = {
                'success': False,
                'message': 'Guardian type not found'
            }
            return Response(json.dumps(response), 404)

        guardian_type.delete_by_id(id)
        response = {
            'success': True,
            'message': 'Guardian type record deleted'
        }
        return Response(json.dumps(response), 200)
