from flask import request, Response
from flask_restful import Resource
from models.guardian import GuardianModel
from models.student import StudentModel
from models.student_guardian import StudentGuardianModel
from models.guardian_type import GuardianTypeModel
import json
import uuid


class GuardianResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('given_name') or
            not data.get('surname') or
            not data.get('email_address') or
            not data.get('phone_number')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        # Create guardian
        guardian_data = {
            'given_name': data.get('given_name'),
            'surname': data.get('surname'),
            'email_address': data.get('email_address'),
            'phone_number': data.get('phone_number')
        }
        
        new_guardian = GuardianModel(**guardian_data)
        new_guardian.save_to_db()

        # If student assignment data is provided, create the relationship
        if data.get('student_id') and data.get('guardian_type_id'):
            student = StudentModel.find_by_id(data.get('student_id'))
            guardian_type = GuardianTypeModel.find_by_id(data.get('guardian_type_id'))
            
            if not student:
                response = {
                    'success': False,
                    'message': 'Student does not exist in the database'
                }
                return Response(json.dumps(response), 400)
                
            if not guardian_type:
                response = {
                    'success': False,
                    'message': 'Guardian type does not exist in the database'
                }
                return Response(json.dumps(response), 400)
            
            # Create student-guardian relationship
            student_guardian_data = {
                'student_id': str(student._id),
                'guardian_id': str(new_guardian._id),
                'guardian_type_id': str(guardian_type._id)
            }
            
            new_student_guardian = StudentGuardianModel(**student_guardian_data)
            new_student_guardian.save_to_db()

        response = {
            'success': True,
            'message': new_guardian.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific guardian by ID with student relationships
            guardian = GuardianModel.find_by_id(id)
            if guardian is None:
                response = {
                    'success': False,
                    'message': 'Guardian not found'
                }
                return Response(json.dumps(response), 404)
            
            # Get student relationships for this guardian
            student_guardians = StudentGuardianModel.find_by_guardian_id(id)
            students_info = []
            
            for sg in student_guardians:
                student = StudentModel.find_by_id(sg.student_id)
                guardian_type = GuardianTypeModel.find_by_id(sg.guardian_type_id)
                if student and guardian_type:
                    students_info.append({
                        'student': student.json(),
                        'guardian_type': guardian_type.json(),
                        'relationship_id': str(sg._id)
                    })
            
            guardian_info = guardian.json()
            guardian_info['students'] = students_info
            
            response = {
                'success': True,
                'message': guardian_info
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all guardians
            guardians = GuardianModel.find_all()
            guardians_list = [guardian.json() for guardian in guardians]
            response = {
                'success': True,
                'message': guardians_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Guardian does not exist'
            }
            return Response(json.dumps(response), 404)
        guardian = GuardianModel.find_by_id(data['_id'])

        if guardian is None:
            response = {
                'success': False,
                'message': 'Guardian not found'
            }
            return Response(json.dumps(response), 404)

        guardian.update_entry(data)
        response = {
            'success': True,
            'message': guardian.json()
        }
        return Response(json.dumps(response), 200)

    def delete(self, id):
        guardian = GuardianModel.find_by_id(id)

        if guardian is None:
            response = {
                'success': False,
                'message': 'Guardian not found'
            }
            return Response(json.dumps(response), 404)

        guardian.delete_by_id(id)
        response = {
            'success': True,
            'message': 'Guardian record deleted'
        }
        return Response(json.dumps(response), 200)
