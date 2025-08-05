from flask import request, g, Response
from flask_restful import Resource
from models.subject import SubjectModel
from models.department import DepartmentModel
import json

class SubjectResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('department_id') or
            not data.get('subject_name') 
        ):
            response = {
                'success': False,
                'message':'Missing required field'
            }
            return Response(json.dumps(response), status=400)
        

        departmen_id : DepartmentModel = DepartmentModel.find_by_id(
            _id = data.get('_id')
        )
        if not departmen_id:
            response = {
                'success': False,
                'message': 'Department does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        
        new_subject = SubjectModel(
            departement_id= data['department_id'],
            subject_name = data['subject_name']
            )
        
        new_subject.save_to_db()

        response = {
            'success': True,
            'message': new_subject
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        subject_id: SubjectModel = SubjectModel.find_by_id(id)

        if subject_id is None:
            response = {
                'success': False,
                'message': 'Subject not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': subject_id.json()
        }
        return Response(json.dumps(response), 200)
    
    def put(self):
        data = request.get_json()
        
        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Subject does not exist'
            }
            return Response(json.dumps(response), 404)
        
        subject_id: SubjectModel = SubjectModel.find_by_id(data['_id'])

        if subject_id is None:
            response = {
                'success': False,
                'message': 'Subject does not exist'
            }
            return Response(json.dumps(response), 404)
        
        subject_id.update_entry(data)

        response = {
            'success': True,
            'message': subject_id.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        subject_id: SubjectModel = SubjectModel.find_by_id(id)

        if subject_id is None:
            response = {
                'success': False,
                'message': 'Subject does not exist'
            }
            return Response(json.dumps(response), 404)
        
        subject_id.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Subject record deleted'
            }

        return Response(json.dumps(response), 200)    