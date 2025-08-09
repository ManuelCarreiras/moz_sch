from flask import request, g, Response
from flask_restful import Resource
from models.school_year import SchoolYearModel
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
                'message':'Missing required field'
            }
            return Response(json.dumps(response), 400)
        
        new_school_year = SchoolYearModel(**data)
        
        new_school_year.save_to_db()

        response = {
            'success': True,
            'message': new_school_year
        }
        return Response(json.dumps(response), 200)
    
    def get(self, id):
        school_year: SchoolYearModel = SchoolYearModel.find_by_id(id)

        if school_year is None:
            response = {
                'success': False,
                'message': 'School Year not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': school_year.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()
        
        if '_id' not in data:
            response = {
                'success': False,
                'message': 'School year does not exist'
            }
            return Response(json.dumps(response), 404)
        
        school_year: SchoolYearModel = SchoolYearModel.find_by_id(data['_id'])

        if school_year is None:
            response = {
                'success': False,
                'message': 'School year does not exist'
            }
            return Response(json.dumps(response), 404)
        
        school_year.update_entry(data)

        response = {
            'success': True,
            'message': school_year.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        school_year: SchoolYearModel = SchoolYearModel.find_by_id(id)

        if school_year is None:
            response = {
                'success': False,
                'message': 'School year does not exist'
            }
            return Response(json.dumps(response), 404)
        
        school_year.delete_by_id(id)

        response = {
                'success': True,
                'message': 'School year record deleted'
            }

        return Response(json.dumps(response), 200)