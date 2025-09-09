from flask import request, Response
from flask_restful import Resource
from models.student_class import StudentClassModel
from models.student import StudentModel
from models.class_model import ClassModel
import json


class StudentClassResource(Resource):
    def post(self):
        data = request.get_json()

        if (
            not data.get('score')
            or not data.get('student_id')
            or not data.get('class_id')
             ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), 400)
        student_id = data.get('student_id')
        class_id = data.get('class_id')

        if not StudentModel.find_by_id(student_id):
            return {'message': 'Student Class not found'}, 400

        if not ClassModel.find_by_id(class_id):
            return {'message': 'Student Class not found'}, 400

        new_student_class = StudentClassModel(**data)

        new_student_class.save_to_db()

        response = {
            'success': True,
            'message': new_student_class.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        student_class = StudentClassModel.find_by_id(id)

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': student_class.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        student_class = StudentClassModel.find_by_id(data['_id'])

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class not found'
            }
            return Response(json.dumps(response), 404)

        student_class.update_entry(data)

        response = {
            'success': True,
            'message': student_class.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        student_class = StudentClassModel.find_by_id(id)

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class not found'
            }
            return Response(json.dumps(response), 404)

        student_class.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Student Class record deleted'
            }

        return Response(json.dumps(response), 200)
