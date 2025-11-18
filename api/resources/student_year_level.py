from flask import request, g, Response
from flask_restful import Resource
from models.student_year_level import StudentYearLevelModel
from models.student import StudentModel
from models.year_level import YearLevelModel
from models.school_year import SchoolYearModel
from db import db

import json
from uuid import UUID
from utils.auth_middleware import require_role


class StudentYearLevelResourceLevel(Resource):
    @require_role('admin')
    def post(self):
        data = request.get_json()

        student_id = data.get('student_id')
        level_id = data.get('level_id')
        year_id = data.get('year_id')
        score = data.get('score', 0.0)  # Default score for basic assignment

        # Validate required fields
        if not student_id or not level_id:
            response = {
                'success': False,
                'message': 'Missing required fields: student_id and level_id'
            }
            return Response(json.dumps(response), 400)

        # Validate student exists
        if not StudentModel.find_by_id(UUID(student_id)):
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)

        # Validate year level exists
        if not YearLevelModel.find_by_id(UUID(level_id)):
            response = {
                'success': False,
                'message': 'Year Level does not exist'
            }
            return Response(json.dumps(response), 404)

        # Validate school year exists (if provided)
        if year_id and not SchoolYearModel.find_by_id(UUID(year_id)):
            response = {
                'success': False,
                'message': 'School Year does not exist'
            }
            return Response(json.dumps(response), 404)

        # Check if assignment already exists
        existing_assignment = StudentYearLevelModel.find_by_student_and_level(
            UUID(student_id), UUID(level_id)
        )
        if existing_assignment:
            response = {
                'success': False,
                'message': 'Student is already assigned to this year level'
            }
            return Response(json.dumps(response), 400)

        # Create assignment data with defaults
        assignment_data = {
            'student_id': UUID(student_id),
            'level_id': UUID(level_id),
            'year_id': UUID(year_id) if year_id else None,
            'score': score
        }

        new_assignment = StudentYearLevelModel(**assignment_data)
        new_assignment.save_to_db()

        response = {
            'success': True,
            'message': new_assignment.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        student_year_level = StudentYearLevelModel.find_by_level_id(id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student Year level not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': student_year_level.json()
        }
        return Response(json.dumps(response), 200)

    @require_role('admin')
    def put(self):
        data = request.get_json()

        student_year_level = StudentYearLevelModel.find_by_student_id(
                                                   data['student_id'])

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student year level not found'
            }
            return Response(json.dumps(response), 404)

        if StudentYearLevelModel.find_by_level_id(data['level_id']) is None:
            response = {
                'success': False,
                'message': 'Student year level not found'
            }
            return Response(json.dumps(response), 404)

        if StudentYearLevelModel.find_by_year_id(data['year_id']) is None:
            response = {
                'success': False,
                'message': 'Student year level not found'
            }
            return Response(json.dumps(response), 404)
        student_year_level.update_entry(data)

        response = {
            'success': True,
            'message': student_year_level.json()
        }

        return Response(json.dumps(response), 200)

    @require_role('admin')
    def delete(self, id):
        student_year_level = StudentYearLevelModel.find_by_level_id(id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student year level not found'
            }
            return Response(json.dumps(response), 404)

        student_year_level.delete_by_level_id(id)

        response = {
                'success': True,
                'message': 'Student year level record deleted'
            }

        return Response(json.dumps(response), 200)


class StudentYearLevelResourceStudent(Resource):

    def get(self, id):
        student_year_level = StudentYearLevelModel.find_by_student_id(
            id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student Year level not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': student_year_level.json()
        }
        return Response(json.dumps(response), 200)

    @require_role('admin')
    def delete(self, id):
        student_year_level = StudentYearLevelModel.find_by_student_id(
                                                id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student year level not found'
            }
            return Response(json.dumps(response), 404)

        student_year_level.delete_by_student_id(id)

        response = {
                'success': True,
                'message': 'Student year level record deleted'
            }

        return Response(json.dumps(response), 200)


class StudentYearLevelResourceYear(Resource):

    def get(self, id):
        student_year_level = StudentYearLevelModel.find_by_year_id(id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student Year level not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': student_year_level.json()
        }
        return Response(json.dumps(response), 200)

    @require_role('admin')
    def delete(self, id):
        student_year_level = StudentYearLevelModel.find_by_year_id(id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student year level not found'
            }
            return Response(json.dumps(response), 404)

        student_year_level.delete_by_year_id(id)

        response = {
                'success': True,
                'message': 'Student year level record deleted'
            }

        return Response(json.dumps(response), 200)


class StudentYearLevelAssignmentResource(Resource):
    """Simplified resource for student-year level assignments (without school year/score complexity)"""
    
    def get(self, student_id=None):
        if student_id:
            # Get all year levels for a specific student
            assignments = StudentYearLevelModel.find_all_by_student_id(UUID(student_id))
            year_levels = []
            for assignment in assignments:
                year_level = YearLevelModel.find_by_id(assignment.level_id)
                if year_level:
                    year_level_data = year_level.json()
                    year_level_data['assignment_id'] = str(assignment._id)
                    year_levels.append(year_level_data)
            
            response = {
                'success': True,
                'message': year_levels
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all assignments
            assignments = StudentYearLevelModel.query.all()
            assignments_list = []
            for assignment in assignments:
                student = StudentModel.find_by_id(assignment.student_id)
                year_level = YearLevelModel.find_by_id(assignment.level_id)
                if student and year_level:
                    assignment_data = assignment.json()
                    assignment_data['student_name'] = f"{student.given_name} {student.surname}"
                    assignment_data['year_level_name'] = year_level.year_level_name
                    assignments_list.append(assignment_data)
            
            response = {
                'success': True,
                'message': assignments_list
            }
            return Response(json.dumps(response), 200)

    @require_role('admin')
    def post(self):
        data = request.get_json()

        student_id = data.get('student_id')
        level_id = data.get('level_id')

        # Validate required fields
        if not student_id or not level_id:
            response = {
                'success': False,
                'message': 'Missing required fields: student_id and level_id'
            }
            return Response(json.dumps(response), 400)

        # Validate student exists
        if not StudentModel.find_by_id(UUID(student_id)):
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)

        # Validate year level exists
        if not YearLevelModel.find_by_id(UUID(level_id)):
            response = {
                'success': False,
                'message': 'Year Level does not exist'
            }
            return Response(json.dumps(response), 404)

        # Check if assignment already exists
        existing_assignment = StudentYearLevelModel.find_by_student_and_level(
            UUID(student_id), UUID(level_id)
        )
        if existing_assignment:
            response = {
                'success': False,
                'message': 'Student is already assigned to this year level'
            }
            return Response(json.dumps(response), 400)

        # Create assignment with defaults
        new_assignment = StudentYearLevelModel(
            student_id=UUID(student_id),
            level_id=UUID(level_id),
            year_id=None,  # Optional for basic assignment
            score=0.0      # Default score
        )
        new_assignment.save_to_db()

        response = {
            'success': True,
            'message': new_assignment.json()
        }
        return Response(json.dumps(response), 201)

    @require_role('admin')
    def delete(self, student_id, level_id=None):
        if level_id:
            # Delete specific student-year level assignment
            success = StudentYearLevelModel.delete_by_student_and_level(
                UUID(student_id), UUID(level_id)
            )
            if success:
                response = {
                    'success': True,
                    'message': 'Student-year level assignment deleted successfully'
                }
                return Response(json.dumps(response), 200)
            else:
                response = {
                    'success': False,
                    'message': 'Assignment not found'
                }
                return Response(json.dumps(response), 404)
        else:
            # Delete all assignments for a student
            assignments = StudentYearLevelModel.find_all_by_student_id(UUID(student_id))
            for assignment in assignments:
                db.session.delete(assignment)
            db.session.commit()
            
            response = {
                'success': True,
                'message': 'All student-year level assignments deleted successfully'
            }
            return Response(json.dumps(response), 200)
