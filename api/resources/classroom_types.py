from flask_restful import Resource
from flask import request, Response
from models.classroom_types import ClassroomTypesModel
import json


class ClassroomTypesResource(Resource):
    def post(self):
        data = request.get_json()

        if (
            not data.get('name')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        if ClassroomTypesModel.find_by_id(data.get('_id')):

            response = {
                'success': False,
                'message': 'The classroom type already exists'
            }

            return Response(json.dumps(response), status=400)

        new_classroom_types = ClassroomTypesModel(**data)

        new_classroom_types.save_to_db()

        response = {
            'success': True,
            'message': new_classroom_types.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific classroom type by ID
            classroom_type = ClassroomTypesModel.find_by_id(id)
            if classroom_type is None:
                response = {
                    'success': False,
                    'message': 'Classroom type not found'
                }
                return Response(json.dumps(response), 404)

            response = {
                'success': True,
                'message': classroom_type.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all classroom types
            classroom_types = ClassroomTypesModel.find_all()
            classroom_types_list = [classroom_type.json() for classroom_type in classroom_types]
            response = {
                'success': True,
                'message': classroom_types_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'classroom type does not exist'
            }
            return Response(json.dumps(response), 404)

        classroom_types = ClassroomTypesModel.find_by_id(data['_id'])

        if classroom_types is None:
            response = {
                'success': False,
                'message': 'classroom type does not exist'
            }
            return Response(json.dumps(response), 404)

        classroom_types.update_entry(data)

        response = {
            'success': True,
            'message': classroom_types.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        classroom_types = ClassroomTypesModel.find_by_id(id)

        if classroom_types is None:
            response = {
                'success': False,
                'message': 'classroom type record does not exist'
            }
            return Response(json.dumps(response), 404)

        classroom_types.delete_by_id(id)

        response = {
            'success': True,
            'message': 'classroom type record deleted'
        }
        return Response(json.dumps(response), 200)
