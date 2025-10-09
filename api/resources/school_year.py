from flask import request, Response
from flask_restful import Resource
from models.school_year import SchoolYearModel
from db import db
import json


class SchoolYearResource(Resource):
    def post(self):
        data = request.get_json()

        if (
            not data.get('year_name') or
            not data.get('start_date') or
            not data.get('end_date')
        ):
            response = {
                'success': False,
                'message': 'Missing required fields'
            }
            return Response(json.dumps(response), 400)

        new_school_year = SchoolYearModel(**data)

        new_school_year.save_to_db()

        response = {
            'success': True,
            'message': new_school_year.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            school_year = SchoolYearModel.find_by_id(id)

            if school_year is None:
                response = {
                    'success': False,
                    'message': 'School Year not found'
                }
                return Response(json.dumps(response), 404)

            response = {
                'success': True,
                'message': school_year.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all school years
            school_years = SchoolYearModel.query.all()
            school_years_list = [school_year.json() for school_year in school_years]
            response = {
                'success': True,
                'message': school_years_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'School year not found'
            }
            return Response(json.dumps(response), 404)

        school_year = SchoolYearModel.find_by_id(data['_id'])

        if school_year is None:
            response = {
                'success': False,
                'message': 'School year not found'
            }
            return Response(json.dumps(response), 404)

        school_year.update_entry(data)

        response = {
            'success': True,
            'message': school_year.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        school_year = SchoolYearModel.find_by_id(id)

        if school_year is None:
            response = {
                'success': False,
                'message': 'School year not found'
            }
            return Response(json.dumps(response), 404)

        school_year.delete_by_id(id)

        response = {
                'success': True,
                'message': 'School year record deleted'
            }

        return Response(json.dumps(response), 200)
