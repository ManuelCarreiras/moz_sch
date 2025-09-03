from flask import request, g, Response
from flask_restful import Resource
from models.classroom import ClassroomModel
from models.classroom_types import ClassroomTypesModel
import json

class ClassroomResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('room_type') or
            not data.get('room_name') or 
            not data.get('capacity')
        ):
            response = {
                'success': False,
                'message':'Missing required field'
            }
            return Response(json.dumps(response), status=400)
        

        roomtype_id : ClassroomTypesModel = ClassroomTypesModel.find_by_id(
            _id = data.get('_id')
        )
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
            'message': new_classroom
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        classroom_id: ClassroomModel = ClassroomModel.find_by_id(id)

        if classroom_id is None:
            response = {
                'success': False,
                'message': 'classroom not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': classroom_id.json()
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
        
        classroom_id: ClassroomModel = ClassroomModel.find_by_id(data['_id'])

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
        classroom_id: ClassroomModel = ClassroomModel.find_by_id(id)

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
