from flask import request, g, Response
from flask_restful import Resource
from models.student_year_level import StudentYearLevelModel
from models.student import StudentModel
from models.year_level import YearLevelModel
from models.school_year import SchoolYearModel

import json

class StudentYearLevelResourceLevel(Resource):
    def post(self):
        data = request.get_json()

        student_id = data.get('student_id')
        level_id = data.get('level_id')
        year_id = data.get('year_id')

        if not StudentModel.find_by_id(student_id):
            return {'message': 'Student does not exists'}, 400
        
        if not YearLevelModel.find_by_id(level_id):
            return {'message': 'Year Level does not exists'}, 400
        
        if not SchoolYearModel.find_by_id(year_id):
            return {'message': 'School Year does not exists'}, 400

        if not data.get('score'):
            response = {
                'success': False,
                'message':'Missing required field'
            }
            return Response(json.dumps(response), 400)
        
        new_school_year_level = StudentYearLevelModel(**data)
        
        new_school_year_level.save_to_db()

        response = {
            'success': True,
            'message': new_school_year_level
        }
        return Response(json.dumps(response), 200)
    
    def get(self, level_id):
        student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_level_id(level_id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student Year level not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': student_year_level.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()
        
        student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_student_id(data['student_id'])

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)
        
        if StudentYearLevelModel.find_by_level_id(data['level_id']) is None:
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)
        
        if StudentYearLevelModel.find_by_year_id(data['year_id']) is None:
            response = {
                'success': False,
                'message': 'Student does not exist'
            }
            return Response(json.dumps(response), 404)
        student_year_level.update_entry(data)

        response = {
            'success': True,
            'message': student_year_level.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, level_id):
        student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_level_id(level_id)

        if student_year_level is None:
            response = {
                'success': False,
                'message': 'School year does not exist'
            }
            return Response(json.dumps(response), 404)
        
        student_year_level.delete_by_level_id(level_id)

        response = {
                'success': True,
                'message': 'School year record deleted'
            }

        return Response(json.dumps(response), 200)
    

    class StudentYearLevelResourceStudent(Resource):

        def get(self, student_id):
            student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_student_id(student_id)

            if student_year_level is None:
                response = {
                    'success': False,
                    'message': 'Student Year level not found'
                }
                return Response(json.dumps(response), 404)
            
            response =  {
                'success': True,
                'message': student_year_level.json()
            }
            return Response(json.dumps(response), 200)
        
        def delete(self, student_id):
            student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_level_id(student_id)

            if student_year_level is None:
                response = {
                    'success': False,
                    'message': 'School year does not exist'
                }
                return Response(json.dumps(response), 404)
            
            student_year_level.delete_by_student_id(student_id)

            response = {
                    'success': True,
                    'message': 'School year record deleted'
                }

            return Response(json.dumps(response), 200)
        

    class StudentYearLevelResourceYear(Resource):

        def get(self, year_id):
            student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_year_id(year_id)

            if student_year_level is None:
                response = {
                    'success': False,
                    'message': 'Student Year level not found'
                }
                return Response(json.dumps(response), 404)
            
            response =  {
                'success': True,
                'message': student_year_level.json()
            }
            return Response(json.dumps(response), 200)
        
        def delete(self, year_id):
            student_year_level: StudentYearLevelModel = StudentYearLevelModel.find_by_level_id(year_id)

            if student_year_level is None:
                response = {
                    'success': False,
                    'message': 'School year does not exist'
                }
                return Response(json.dumps(response), 404)
            
            student_year_level.delete_by_year_id(year_id)

            response = {
                    'success': True,
                    'message': 'School year record deleted'
                }

            return Response(json.dumps(response), 200)