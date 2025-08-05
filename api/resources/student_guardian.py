from flask import request, g, Response
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
                'message':'Missing required field'
            }
            return Response(json.dumps(response), status=400)
        

        student_id : StudentModel = StudentModel.find_by_id(
            _id = data.get('_id')
        )
        if not student_id:
            response = {
                'success': False,
                'message': 'Student does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        guardian_type_id : GuardianTypeModel = GuardianTypeModel.find_by_id(
            _id = data.get('_id')
        )
        if not guardian_type_id:
            response = {
                'success': False,
                'message': 'Guardian type does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        guardian_id : GuardianModel = GuardianModel.find_by_id(
            _id = data.get('_id')
        )
        if not guardian_id:
            response = {
                'success': False,
                'message': 'Guardian does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        
        new_student_guardian = StudentGuardianModel(
            student_id = data['student_id'],
            guardian_type_id = data['guardian_type_id'],
            guardian_id = data['guardian_id']
            )
        
        new_student_guardian.save_to_db()

        response = {
            'success': True,
            'message': new_student_guardian
        }
        return Response(json.dumps(response), 201)

