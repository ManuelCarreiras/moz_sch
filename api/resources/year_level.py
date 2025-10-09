from flask import request, Response
from flask_restful import Resource
from models.year_level import YearLevelModel
from db import db
import json


class YearLevelResource(Resource):
    def post(self):
        data = request.get_json()

        if (
            not data.get('level_name') or
            not data.get('level_order')
        ):
            response = {
                'success': False,
                'message': 'Missing required fields'
            }
            return Response(json.dumps(response), 400)

        new_year_level = YearLevelModel(**data)

        new_year_level.save_to_db()

        response = {
            'success': True,
            'message': new_year_level.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            year_level = YearLevelModel.find_by_id(id)

            if year_level is None:
                response = {
                    'success': False,
                    'message': 'Year level not found'
                }
                return Response(json.dumps(response), 404)

            response = {
                'success': True,
                'message': year_level.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all year levels
            year_levels = YearLevelModel.query.all()
            year_levels_list = [year_level.json() for year_level in year_levels]
            response = {
                'success': True,
                'message': year_levels_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Year level not found'
            }
            return Response(json.dumps(response), 404)

        year_level = YearLevelModel.find_by_id(data['_id'])

        if year_level is None:
            response = {
                'success': False,
                'message': 'Year level not found'
            }
            return Response(json.dumps(response), 404)

        year_level.update_entry(data)

        response = {
            'success': True,
            'message': year_level.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        year_level = YearLevelModel.find_by_id(id)

        if year_level is None:
            response = {
                'success': False,
                'message': 'Year level not found'
            }
            return Response(json.dumps(response), 404)

        year_level.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Year level record deleted'
            }

        return Response(json.dumps(response), 200)
