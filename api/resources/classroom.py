from flask import request, Response
from flask_restful import Resource
from models.classroom import ClassroomModel
from models.classroom_types import ClassroomTypesModel
import json


class ClassroomResource(Resource):

    def post(self):
        data = request.get_json()
        room_type = data.get('room_type')
        if (
            not data.get('room_type') or
            not data.get('room_name') or
            not data.get('capacity')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        roomtype_id = ClassroomTypesModel.find_by_id(room_type)

        if not roomtype_id:
            response = {
                'success': False,
                'message': 'Classroom type does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        new_classroom = ClassroomModel(**data)

        new_classroom.save_to_db()

        response = {
            'success': True,
            'message': new_classroom.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific classroom by ID
            classroom = ClassroomModel.find_by_id(id)
            if classroom is None:
                response = {
                    'success': False,
                    'message': 'Classroom not found'
                }
                return Response(json.dumps(response), 404)

            response = {
                'success': True,
                'message': classroom.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all classrooms with classroom type information
            classrooms = ClassroomModel.find_all()
            classrooms_list = []
            for classroom in classrooms:
                classroom_data = classroom.json()
                # Get classroom type name
                classroom_type = ClassroomTypesModel.find_by_id(classroom.room_type)
                if classroom_type:
                    classroom_data['room_type_name'] = classroom_type.name
                classrooms_list.append(classroom_data)
            
            response = {
                'success': True,
                'message': classrooms_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'classroom does not exist'
            }
            return Response(json.dumps(response), 404)

        classroom_id = ClassroomModel.find_by_id(data['_id'])

        if classroom_id is None:
            response = {
                'success': False,
                'message': 'classroom does not exist'
            }
            return Response(json.dumps(response), 404)

        classroom_id.update_entry(data)

        response = {
            'success': True,
            'message': classroom_id.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        classroom_id = ClassroomModel.find_by_id(id)

        if classroom_id is None:
            response = {
                'success': False,
                'message': 'classroom does not exist'
            }
            return Response(json.dumps(response), 404)

        classroom_id.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Classroom record deleted'
            }

        return Response(json.dumps(response), 200)
