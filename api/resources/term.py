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

        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if (
            not data.get('term_number') or
            not data.get('start_date') or
            not data.get('end_date')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), 400)
        year_id = SchoolYearModel.find_by_dates(start_date,
                                                end_date)
        if not year_id:
            response = {
                'success': False,
                'message':
                'Start and end dates do not correspond to a school year'
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
