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

        response = {
            'success': True,
            'message': new_student.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific student by ID
            student = StudentModel.find_by_id(id)
            if student is None:
                response = {
                    'success': False,
                    'message': 'Student not found'
                }
                return Response(json.dumps(response), 404)
            response = {
                'success': True,
                'message': student.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all students or search by name
            given_name = request.args.get('given_name')
            middle_name = request.args.get('middle_name')
            surname = request.args.get('surname')
            
            if given_name or middle_name or surname:
                # Search by full name
                students = StudentModel.find_by_full_name(given_name, middle_name, surname)
            else:
                # Get all students
                students = StudentModel.find_all()
            
            students_list = [student.json_with_year_levels() for student in students]
            response = {
                'success': True,
                'message': students_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()
        id = data.get('_id')
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        student.update_entry(data)
        response = {
            'success': True,
            'message': student.json()
        }
        return Response(json.dumps(response), 200)

    def delete(self, id):
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        student.delete_by_id(id)
        return {'message': 'Student deleted'}, 200
