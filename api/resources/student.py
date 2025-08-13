from flask import request, g, Response
from flask_restful import Resource
from models.student import StudentModel
import json

class StudentResource(Resource):
    def post(self):
        data = request.get_json()


        # if StudentModel.find_by_id(g.student):
        #     return {'message': 'Student already exists'}, 400
        if (
            not data.get('given_name')
            or not data.get('middle_name')
            or not data.get('surname')
            or not data.get('date_of_birth')
            or not data.get('gender')
            or not data.get('enrollment_date')
        ):
            response = {
                'success': False,
                'message': 'Missing required fields'
            }
            return Response(json.dumps(response), 400)
            
        new_student = StudentModel(**data)
        new_student.save_to_db()
        return new_student.json(), 201

    def get(self, id):
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        return student.json(), 200

    def put(self):
        data = request.get_json()
        id = data.get('id')
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        student.update_entry(data)
        return student.json(), 200

    def delete(self, id):
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        StudentModel.delete_by_id(id)
        return {'message': 'Student deleted'}, 200 