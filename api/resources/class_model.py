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
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        subject_id: SubjectModel = SubjectModel.find_by_id(
                                   data.get('subject_id'))
        if not subject_id:
            response = {
                'success': False,
                'message': 'Subject id does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        tearcher_id: TeacherModel = TeacherModel.find_by_id(
                                    data.get('tearcher_id'))
        if not tearcher_id:
            response = {
                'success': False,
                'message': 'Teacher id does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        term_id: TermModel = TermModel.find_by_id(
                             data.get('term_id'))
        if not term_id:
            response = {
                'success': False,
                'message': 'Term does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        period_id: PeriodModel = PeriodModel.find_by_id(
                                 data.get('period_id'))
        if not period_id:
            response = {
                'success': False,
                'message': 'Period does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        classroom_id: ClassroomModel = ClassroomModel.find_by_id(
                                       data.get('classroom_id'))
        if not classroom_id:
            response = {
                'success': False,
                'message': 'Classroom does not exist in the database'
            }
            return Response(json.dumps(response), 400)

        new_class = ClassModel(
            subject_id=data['subject_id'],
            tearcher_id=data['tearcher_id'],
            term_id=term_id._id,
            period_id=period_id._id,
            classroom_id=classroom_id._id,
            class_id=data['class_id']
            )
        new_class.save_to_db()

        response = {
            'success': True,
            'message': new_class.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, class_name):
        class_id = ClassModel.find_by_class_name(class_name)

        if class_id is None:
            response = {
                'success': False,
                'message': 'class not found'
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
        class_id = ClassroomModel.find_by_id(id)

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
