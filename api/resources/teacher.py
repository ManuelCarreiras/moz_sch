from flask import request, Response
from flask_restful import Resource
from models.teacher import TeacherModel
from models.department import DepartmentModel
import json
from uuid import UUID


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

        new_professor: TeacherModel = TeacherModel(**data)
        new_professor.save_to_db()

        response = {
            'success': True,
            'message': new_professor.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific teacher by ID
            professor = TeacherModel.find_by_id(UUID(id))

            if professor is None:
                return {'message': 'Professor not found'}, 404

            response = {
                'success': True,
                'message': professor.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all teachers with department information
            professors = TeacherModel.find_all()
            professors_list = []
            for professor in professors:
                professor_data = professor.json()
                # Get department name
                if professor.department_id:
                    department = DepartmentModel.find_by_id(professor.department_id)
                    if department:
                        professor_data['department_name'] = department.department_name
                professors_list.append(professor_data)
            
            response = {
                'success': True,
                'message': professors_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()
        id = data.get('_id')

        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.update_entry(data)
        response = {
            'success': True,
            'message': professor.json()
        }
        return Response(json.dumps(response), 200)

    def delete(self, id):
        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.delete_by_id(id)
        return {'message': 'Professor deleted'}, 200
