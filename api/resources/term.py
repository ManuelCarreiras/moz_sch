from flask import request, Response
from flask_restful import Resource
from models.term import TermModel
from models.school_year import SchoolYearModel
import json


class TermResource(Resource):
    def get(self, id=None):
        if id:
            # Get specific term by ID
            term = TermModel.find_by_id(id)
            if term is None:
                response = {
                    'success': False,
                    'message': 'Term not found'
                }
                return Response(json.dumps(response), 404)
            response = {
                'success': True,
                'message': term.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all terms
            terms = TermModel.query.all()
            terms_list = [term.json() for term in terms]
            response = {
                'success': True,
                'message': terms_list
            }
            return Response(json.dumps(response), 200)

    def post(self):
        data = request.get_json()

        if (
            not data.get('year_id') or
            not data.get('term_number') or
            not data.get('start_date') or
            not data.get('end_date')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), 400)
        
        # Validate that the school year exists
        school_year = SchoolYearModel.find_by_id(data.get('year_id'))
        if not school_year:
            response = {
                'success': False,
                'message': 'School year not found'
            }
            return Response(json.dumps(response), 400)
        
        # Validate term dates against school year dates
        from datetime import datetime
        try:
            term_start = datetime.fromisoformat(data.get('start_date').replace('Z', '+00:00'))
            term_end = datetime.fromisoformat(data.get('end_date').replace('Z', '+00:00'))
            year_start = school_year.start_date
            year_end = school_year.end_date
            
            if term_start < year_start or term_end > year_end:
                response = {
                    'success': False,
                    'message': 'Term dates must be within the school year dates'
                }
                return Response(json.dumps(response), 400)
                
            if term_start >= term_end:
                response = {
                    'success': False,
                    'message': 'Term start date must be before end date'
                }
                return Response(json.dumps(response), 400)
                
        except ValueError:
            response = {
                'success': False,
                'message': 'Invalid date format'
            }
            return Response(json.dumps(response), 400)
        
        new_term = TermModel(**data)
        new_term.save_to_db()

        response = {
            'success': True,
            'message': new_term.json()
        }
        return Response(json.dumps(response), 201)


    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Term does not exist'
            }
            return Response(json.dumps(response), 404)

        term = TermModel.find_by_id(data['_id'])

        if term is None:
            response = {
                'success': False,
                'message': 'Term does not exist'
            }
            return Response(json.dumps(response), 404)

        term.update_entry(data)

        response = {
            'success': True,
            'message': term.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        term = TermModel.find_by_id(id)

        if term is None:
            response = {
                'success': False,
                'message': 'Term does not exist'
            }
            return Response(json.dumps(response), 404)

        term.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Term record deleted'
            }

        return Response(json.dumps(response), 200)
