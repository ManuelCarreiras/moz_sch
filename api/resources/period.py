from flask import request, Response
from flask_restful import Resource
from models.period import PeriodModel
from models.school_year import SchoolYearModel
import json


class PeriodResource(Resource):
    def post(self):
        data = request.get_json()
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if (
            not data.get('year_id') or
            not data.get('name') or
            not data.get('start_time') or
            not data.get('end_time')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), 400)
        year_id = SchoolYearModel.find_by_dates(start_time, end_time)
        if not year_id:
            response = {
                'success': False,
                'message':
                'Start and end dates do not correspond to a school year'
            }
            return Response(json.dumps(response), 400)

        new_period = PeriodModel(**data)
        new_period.save_to_db()

        response = {
            'success': True,
            'message': new_period.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        period = PeriodModel.find_by_id(id)

        if period is None:
            response = {
                'success': False,
                'message': 'Period not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': period.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'period does not exist'
            }
            return Response(json.dumps(response), 404)

        period = PeriodModel.find_by_id(data['_id'])

        if period is None:
            response = {
                'success': False,
                'message': 'period does not exist'
            }
            return Response(json.dumps(response), 404)

        period.update_entry(data)

        response = {
            'success': True,
            'message': period.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        period = PeriodModel.find_by_id(id)

        if period is None:
            response = {
                'success': False,
                'message': 'Period does not exist'
            }
            return Response(json.dumps(response), 404)

        period.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Period record deleted'
            }

        return Response(json.dumps(response), 200)
