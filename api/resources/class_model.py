from flask import request, Response
from flask_restful import Resource
from models.class_model import ClassModel
from models.teacher import TeacherModel
from models.subject import SubjectModel
from models.period import PeriodModel
from models.term import TermModel
from models.classroom import ClassroomModel
from utils.auth_middleware import require_role

import json


class ClassModelResource(Resource):

    @require_role('admin')
    def post(self):
        data = request.get_json()

        # Only term_id, year_level_id, and class_name are required
        # subject_id, teacher_id, period_id, classroom_id will be assigned in timetable
        if (
            not data.get('term_id') or
            not data.get('year_level_id') or
            not data.get('class_name')
        ):
            response = {
                'success': False,
                'message': 'Missing required field: term_id, year_level_id, or class_name'
            }
            return Response(json.dumps(response), status=400)
        
        # Get required fields
        term_id = data.get('term_id')
        year_level_id = data.get('year_level_id')
        
        # Get optional fields with defaults
        subject_id = data.get('subject_id', '')
        teacher_id = data.get('teacher_id', '')
        period_id = data.get('period_id', '')
        day_of_week = data.get('day_of_week')
        classroom_id = data.get('classroom_id', '')

        # Validate term_id (required)
        term_obj = TermModel.find_by_id(term_id)
        if not term_obj:
            response = {
                'success': False,
                'message': 'Term does not exist in the database'
            }
            return Response(json.dumps(response), 400)
        
        # Validate optional fields only if provided
        if subject_id:
            subject_obj = SubjectModel.find_by_id(subject_id)
            if not subject_obj:
                response = {
                    'success': False,
                    'message': 'Subject id does not exist in the database'
                }
                return Response(json.dumps(response), 400)
        
        if teacher_id:
            teacher_obj = TeacherModel.find_by_id(teacher_id)
            if not teacher_obj:
                response = {
                    'success': False,
                    'message': 'Teacher id does not exist in the database'
                }
                return Response(json.dumps(response), 400)
        
        if period_id:
            period_obj = PeriodModel.find_by_id(period_id)
            if not period_obj:
                response = {
                    'success': False,
                    'message': 'Period does not exist in the database'
                }
                return Response(json.dumps(response), 400)
        
        if classroom_id:
            classroom_obj = ClassroomModel.find_by_id(classroom_id)
            if not classroom_obj:
                response = {
                    'success': False,
                    'message': 'Classroom does not exist in the database'
                }
                return Response(json.dumps(response), 400)
        
        # Check for conflict only if period_id is provided
        # Now conflicts are checked by year_level + period + day_of_week
        if period_id and day_of_week:
            existing_class = ClassModel.find_by_year_level_period_and_day(year_level_id, period_id, day_of_week)
            if existing_class:
                response = {
                    'success': False,
                    'message': 'This period and day is already assigned to another class in this year level'
                }
                return Response(json.dumps(response), 400)

        # Convert empty strings to None for optional fields
        cleaned_data = data.copy()
        for field in ['subject_id', 'teacher_id', 'period_id', 'classroom_id', 'day_of_week']:
            if cleaned_data.get(field) == '' or not cleaned_data.get(field):
                cleaned_data[field] = None
        
        new_class = ClassModel(**cleaned_data)
        new_class.save_to_db()

        response = {
            'success': True,
            'message': new_class.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific class by ID
            class_id = ClassModel.find_by_id(id)

            if class_id is None:
                response = {
                    'success': False,
                    'message': 'Class not found'
                }
                return Response(json.dumps(response), 404)

            # Enhance with related data
            class_data = class_id.json()
            subject = SubjectModel.find_by_id(class_id.subject_id)
            teacher = TeacherModel.find_by_id(class_id.teacher_id)
            term = TermModel.find_by_id(class_id.term_id)
            period = PeriodModel.find_by_id(class_id.period_id)
            classroom = ClassroomModel.find_by_id(class_id.classroom_id)
            
            if subject:
                class_data['subject_name'] = subject.subject_name
            if teacher:
                class_data['teacher_name'] = f"{teacher.given_name} {teacher.surname}"
            if term:
                class_data['term_number'] = term.term_number
            if period:
                class_data['period_name'] = period.name
            if classroom:
                class_data['classroom_name'] = classroom.room_name

            response = {
                'success': True,
                'message': class_data
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all classes
            classes = ClassModel.query.all()
            classes_list = []
            
            for class_item in classes:
                class_data = class_item.json()
                
                # Enhance with related data
                subject = SubjectModel.find_by_id(class_item.subject_id)
                teacher = TeacherModel.find_by_id(class_item.teacher_id)
                term = TermModel.find_by_id(class_item.term_id)
                period = PeriodModel.find_by_id(class_item.period_id)
                classroom = ClassroomModel.find_by_id(class_item.classroom_id)
                
                if subject:
                    class_data['subject_name'] = subject.subject_name
                if teacher:
                    class_data['teacher_name'] = f"{teacher.given_name} {teacher.surname}"
                if term:
                    class_data['term_number'] = term.term_number
                if period:
                    class_data['period_name'] = period.name
                if classroom:
                    class_data['classroom_name'] = classroom.room_name
                
                classes_list.append(class_data)
            
            response = {
                'success': True,
                'message': classes_list
            }
            return Response(json.dumps(response), 200)

    @require_role('admin')
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

        # Check for conflict if year_level_id or period_id is being changed
        if data.get('year_level_id') or data.get('period_id'):
            check_year_level_id = data.get('year_level_id', class_id.year_level_id)
            check_period_id = data.get('period_id', class_id.period_id)
            
            existing_class = ClassModel.find_by_year_level_and_period(check_year_level_id, check_period_id)
            if existing_class and str(existing_class._id) != data['_id']:
                response = {
                    'success': False,
                    'message': 'This period is already assigned to another class in this year level'
                }
                return Response(json.dumps(response), 400)

        class_id.update_entry(data)

        response = {
            'success': True,
            'message': class_id.json()
        }

        return Response(json.dumps(response), 200)

    @require_role('admin')
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
    def get(self, id):
        class_subjects = ClassModel.list_by_subject_id(id)

        if len(class_subjects) == 0:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        response = {
            'success': True,
            'message': [class_.json() for class_ in class_subjects]
        }
        return Response(json.dumps(response), 200)


class ClassResourceTeacherList(Resource):
    def get(self, id):
        class_teachers = ClassModel.list_by_teacher_id(id)
        if len(class_teachers) == 0:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        response = {
            'success': True,
            'message': [class_.json() for class_ in class_teachers]
        }
        return Response(json.dumps(response), 200)


class ClassResourceTermList(Resource):
    def get(self, id):
        class_terms = ClassModel.list_by_term_id(id)
        if len(class_terms) == 0:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        response = {
            'success': True,
            'message': [class_.json() for class_ in class_terms]
        }
        return Response(json.dumps(response), 200)


class ClassResourcePeriodList(Resource):
    def get(self, id):
        class_periods = ClassModel.list_by_period_id(id)
        if len(class_periods) == 0:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        response = {
            'success': True,
            'message': [class_.json() for class_ in class_periods]
        }
        return Response(json.dumps(response), 200)


class ClassResourceClassroomList(Resource):
    def get(self, id):
        class_classrooms = ClassModel.list_by_classroom_id(id)
        if len(class_classrooms) == 0:
            response = {
                'success': False,
                'message': 'class does not exist'
            }
            return Response(json.dumps(response), 404)
        response = {
            'success': True,
            'message': [class_.json() for class_ in class_classrooms]
        }
        return Response(json.dumps(response), 200)
