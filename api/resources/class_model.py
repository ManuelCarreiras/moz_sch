from flask import request, g, Response
from flask_restful import Resource
from models.class_model import ClassModel
from models.teacher import TeacherModel
from models.subject import SubjectModel
from models.period import PeriodModel
from models.term import TermModel
from models.classroom import ClassroomModel
import json


class ClassModelResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('subject_id') or
            not data.get('tearcher_id') or 
            not data.get('term_id') or
            not data.get('start_period_id') or
            not data.get('end_period_id') or
            not data.get('classroom_id') or
            not data.get('class_name')
        ):
            response = {
                'success': False,
                'message':'Missing required field'
            }
            return Response(json.dumps(response), status=400)
        

        subject_id : SubjectModel = SubjectModel.find_by_id(
            subject_id=data.get('subject_id')
        )
        if not subject_id:
            response = {
                'success': False,
                'message': 'Subject id does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        

        tearcher_id : TeacherModel = TeacherModel.find_by_id(
            tearcher_id=data.get('tearcher_id')
        )
        if not tearcher_id:
            response = {
                'success': False,
                'message': 'Teacher id does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        term_id : TermModel = TermModel.find_by_id(
            term_id=data.get('term_id')
        )
        if not term_id:
            response = {
                'success': False,
                'message': 'Term does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        period_id : PeriodModel = PeriodModel.find_by_id(
            period_id = data.get('period_id')
        )
        if not period_id:
            response = {
                'success': False,
                'message': 'Period does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        
        classroom_id : ClassroomModel = ClassroomModel.find_by_id(
            classroom_id = data.get('classroom_id')
        )
        if not classroom_id:
            response = {
                'success': False,
                'message': 'Classroom does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        new_class = ClassModel(
            subject_name = data['subject_name'],
            tearcher_given_name = data['given_name'],
            term_id = term_id._id,
            period_id = period_id._id,
            classroom_id = classroom_id._id,
            class_name = data['class_name']
            )
        
        new_class.save_to_db()

        response = {
            'success': True,
            'message': new_class
        }
        return Response(json.dumps(response), 201)        

    def get(self, id):
        class_id: ClassModel = ClassModel.find_by_id(id)

        if class_id is None:
            response = {
                'success': False,
                'message': 'class not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': class_id.json()
        }
        return Response(json.dumps(response), 200)
    
    def put(self):
        data = request.get_json()
        
        if '_id' not in data:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        
        class_id: ClassModel = ClassModel.find_by_id(data['_id'])

        if class_id is None:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        
        class_id.update_entry(data)

        response = {
            'success': True,
            'message': class_id.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        class_id: ClassroomModel = ClassroomModel.find_by_id(id)

        if class_id is None:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        
        class_id.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Class record deleted'
            }

        return Response(json.dumps(response), 200)    