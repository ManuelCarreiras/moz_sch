from flask import request, g, Response
from flask_restful import Resource
from models.year_level import YearLevelModel
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
                'message':'Missing required field'
            }
            return Response(json.dumps(response), 400)
        
        new_year_level = YearLevelModel(
            level_name = data['level_name'],
            level_order = data['level_order']
            )
        
        new_year_level.save_to_db()

        response = {
            'success': True,
            'message': new_year_level
        }
        return Response(json.dumps(response), 200)
    
    def get(self, id):
        year_level: YearLevelModel = YearLevelModel.find_by_id(id)

        if year_level is None:
            response = {
                'success': False,
                'message': 'Year level not found'
            }
            return Response(json.dumps(response), 404)
        
        response =  {
            'success': True,
            'message': year_level.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()
        
        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Year level does not exist'
            }
            return Response(json.dumps(response), 404)
        
        year_level: YearLevelModel = YearLevelModel.find_by_id(data['_id'])

        if year_level is None:
            response = {
                'success': False,
                'message': 'Year level does not exist'
            }
            return Response(json.dumps(response), 404)
        
        year_level.update_entry(data)

        response = {
            'success': True,
            'message': year_level.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        year_level: YearLevelModel = YearLevelModel.find_by_id(id)

        if year_level is None:
            response = {
                'success': False,
                'message': 'Year level does not exist'
            }
            return Response(json.dumps(response), 404)
        
        year_level.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Year level record deleted'
            }

        return Response(json.dumps(response), 200)