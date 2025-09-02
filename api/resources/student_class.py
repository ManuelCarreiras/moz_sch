from flask import request, g, Response
from flask_restful import Resource
from models.student_class import StudentClassModel
from models.student import StudentModel
from models.class_model import ClassModel
import json

class StudentClassResourceStudent(Resource):
    def post(self):
        data = request.get_json()

        student_id = data.get('student_id')
        class_id = data.get('class_id')

        if not StudentModel.find_by_id(student_id):
            return {'message': 'Student does not exists'}, 400
        
        if not ClassModel.find_by_id(class_id):
            return {'message': 'Class does not exists'}, 400
        
        if not data.get('score'):
            response = {
                'success': False,
                'message':'Missing required field'
            }
            return Response(json.dumps(response), 400)
        
        new_student_class = StudentClassModel(
            student_id = data['student_id'],
            class_id = data['class_id'],
            score = data['score']
            )
        
        new_student_class.save_to_db()

        response = {
            'success': True,
            'message': new_student_class
        }
        return Response(json.dumps(response), 201)
    
    def get(self, student_id):
        student_class: StudentClassModel = StudentClassModel.find_by_student_id(student_id)

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': student_class.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()
        
        student_class: StudentClassModel = StudentClassModel.find_by_student_id(data['student_id'])

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)
        
        if StudentClassModel.find_by_class_id(data['class_id']) is None:
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)
        student_class.update_entry(data)

        response = {
            'success': True,
            'message': student_class.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, student_id):
        student_class: StudentClassModel = StudentClassModel.find_by_student_id(student_id)

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class does not exist'
            }
            return Response(json.dumps(response), 404)
        
        student_class.delete_by_student_id(id)

        response = {
                'success': True,
                'message': 'Student Class record deleted'
            }

        return Response(json.dumps(response), 200)
    

class StudentClassResourceClass(Resource):

    def get(self, class_id):
        student_class: StudentClassModel = StudentClassModel.find_by_class_id(class_id)

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': student_class.json()
        }
        return Response(json.dumps(response), 200)
    
    def delete(self, class_id):
        student_class: StudentClassModel = StudentClassModel.find_by_class_id(class_id)

        if student_class is None:
            response = {
                'success': False,
                'message': 'Student Class does not exist'
            }
            return Response(json.dumps(response), 404)
        
        student_class.delete_by_class_id(id)

        response = {
                'success': True,
                'message': 'Student Class record deleted'
            }

        return Response(json.dumps(response), 200)
