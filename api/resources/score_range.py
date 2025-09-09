from flask import request, Response
from flask_restful import Resource
from models.score_range import ScoreRangeModel
import json


class ScoreRangeResource(Resource):
    def post(self):
        data = request.get_json()

        if (
            not data.get('max_score') or
            data.get('min_score') is None or
            not data.get('grade')
           ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), 400)

        new_score_range = ScoreRangeModel(**data)

        new_score_range.save_to_db()

        response = {
            'success': True,
            'message': new_score_range.json()
        }
        return Response(json.dumps(response), 200)

    def get(self, id):
        score_range = ScoreRangeModel.find_by_id(id)

        if score_range is None:
            response = {
                'success': False,
                'message': 'Score range not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': score_range.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Score range does not exist'
            }
            return Response(json.dumps(response), 404)

        score_range = ScoreRangeModel.find_by_id(data['_id'])

        if score_range is None:
            response = {
                'success': False,
                'message': 'Score range does not exist'
            }
            return Response(json.dumps(response), 404)

        score_range.update_entry(data)

        response = {
            'success': True,
            'message': score_range.json()
        }

        return Response(json.dumps(response), 200)

    def delete(self, id):
        score_range = ScoreRangeModel.find_by_id(id)

        if score_range is None:
            response = {
                'success': False,
                'message': 'Score range not found'
            }
            return Response(json.dumps(response), 404)

        score_range.delete_by_id(id)

        response = {
                'success': True,
                'message': 'Score range record deleted'
            }

        return Response(json.dumps(response), 200)
