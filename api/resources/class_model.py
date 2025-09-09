from flask import request, Response
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
            not data.get('teacher_id') or
            not data.get('term_id') or
            not data.get('period_id') or
            not data.get('classroom_id') or
            not data.get('class_name') 
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)
        teacher_id = data.get('teacher_id')
        subject_id = data.get('subject_id')
        period_id = data.get('period_id')
        term_id = data.get('term_id')
        classroom_id = data.get('classroom_id')

        subject_id = SubjectModel.find_by_id(subject_id)
        if not subject_id:
            response = {
                'success': False,
                'message': 'Subject id does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        teacher_id = TeacherModel.find_by_id(teacher_id)
        if not teacher_id:
            response = {
                'success': False,
                'message': 'Teacher id does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        term_id = TermModel.find_by_id(term_id)
        if not term_id:
            response = {
                'success': False,
                'message': 'Term does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        period_id = PeriodModel.find_by_id(period_id)
        if not period_id:
            response = {
                'success': False,
                'message': 'Period does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        classroom_id = ClassroomModel.find_by_id(classroom_id)
        if not classroom_id:
            response = {
                'success': False,
                'message': 'Classroom does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        new_class = ClassModel(**data)
        new_class.save_to_db()

        response = {
            'success': True,
            'message': new_class.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        class_id = ClassModel.find_by_id(id)

        if class_id is None:
            response = {
                'success': False,
                'message': 'Class not found'
            }
            return Response(json.dumps(response), 404)

        response = {
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

        class_id = ClassModel.find_by_id(data['_id'])

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
        class_id = ClassModel.find_by_id(id)

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


class ClassResourceSubjectList(Resource):
    def get(self, subject_id):
        class_subjects = ClassModel.list_by_subject_id(subject_id)

        response = {
            'success': True,
            'message': [class_.json() for class_ in class_subjects]
        }
        return Response(json.dumps(response), 200)


class ClassResourceTeacherList(Resource):
    def get(self, teacher_id):
        class_teachers = ClassModel.list_by_teacher_id(teacher_id)

        response = {
            'success': True,
            'message': [class_.json() for class_ in class_teachers]
        }
        return Response(json.dumps(response), 200)


class ClassResourceTermList(Resource):
    def get(self, term_id):
        class_terms = ClassModel.list_by_term_id(term_id)

        response = {
            'success': True,
            'message': [class_.json() for class_ in class_terms]
        }
        return Response(json.dumps(response), 200)


class ClassResourcePeriodList(Resource):
    def get(self, period_id):
        class_periods = ClassModel.list_by_period_id(period_id)

        response = {
            'success': True,
            'message': [class_.json() for class_ in class_periods]
        }
        return Response(json.dumps(response), 200)


class ClassResourceClassroomList(Resource):
    def get(self, classroom_id):
        class_classrooms = ClassModel.list_by_classroom_id(classroom_id)

        response = {
            'success': True,
            'message': [class_.json() for class_ in class_classrooms]
        }
        return Response(json.dumps(response), 200)
