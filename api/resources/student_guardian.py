from flask import request, Response
from flask_restful import Resource
from models.student_guardian import StudentGuardianModel
from models.student import StudentModel
from models.guardian import GuardianModel
from models.guardian_type import GuardianTypeModel
import json


class StudentGuardianResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('student_id') or
            not data.get('guardian_type_id') or
            not data.get('guardian_id') 
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        student = StudentModel.find_by_id(data.get('student_id'))
        if not student:
            response = {
                'success': False,
                'message': 'Student does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        guardian_type = GuardianTypeModel.find_by_id(data.get('guardian_type_id'))
        if not guardian_type:
            response = {
                'success': False,
                'message': 'Guardian type does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        guardian = GuardianModel.find_by_id(data.get('guardian_id'))
        if not guardian:
            response = {
                'success': False,
                'message': 'Guardian does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        new_student_guardian = StudentGuardianModel(**data)

        new_student_guardian.save_to_db()

        response = {
            'success': True,
            'message': new_student_guardian.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        student_guardian = StudentGuardianModel.find_by_id(id)

        if student_guardian is None:
            response = {
                'success': False,
                'message': 'Student guardian does not exist'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': student_guardian.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Student guardian does not exist'
            }
            return Response(json.dumps(response), 404)

        student_guardian = StudentGuardianModel.find_by_id(data['_id'])

        if student_guardian is None:
            response = {
                'success': False,
                'message': 'Student guardian does not exist'
            }
            return Response(json.dumps(response), 404)

        student_guardian.update_entry(data)
        response = {
            'success': True,
            'message': student_guardian.json()
        }
        return Response(json.dumps(response), 200)        

    def delete(self, id):
        student_guardian = StudentGuardianModel.find_by_id(id)

        if student_guardian is None:
            response = {
                'success': False,
                'message': 'Student guardian does not exist'
            }
            return Response(json.dumps(response), 404)

        student_guardian.delete_by_id(id)
        response = {
            'success': True,
            'message': 'Student guardian record deleted'
        }
        return Response(json.dumps(response), 200)
