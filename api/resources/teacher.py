from flask import request, g, Response
from flask_restful import Resource
from models.teacher import TeacherModel
import json

class TeacherResource(Resource):
    def post(self):
        data = request.get_json()


        # if TeacherModel.find_by_id(g.professor):
        #     return {'message': 'Professor already exists'}, 400
        if (
            not data.get('given_name')
            or not data.get('surname')
            or not data.get('gender')
            or not data.get('email_address')
            or not data.get('phone_number')
        ):
            response = {
                'success': False,
                'message': 'Missing required fields'
            }
            return Response(json.dumps(response), 400)

        
        new_professor = TeacherModel(**data)
        new_professor.save_to_db()
        return new_professor.json(), 201

    def get(self, id):
        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        return professor.json(), 200

    def put(self):
        data = request.get_json()
        id = data.get('id')

        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.update_entry(data)
        return professor.json(), 200

    def delete(self,id):
        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.delete_by_id(id)
        return {'message': 'Professor deleted'}, 200 