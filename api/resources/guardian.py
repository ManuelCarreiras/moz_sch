from flask import request, Response
from flask_restful import Resource
from models.guardian import GuardianModel
import json


class GuardianResource(Resource):

    def post(self):
        data = request.get_json()

        if (
            not data.get('given_name') or
            not data.get('surname') or
            not data.get('email_address') or
            not data.get('phone_number')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        new_guardian = GuardianModel(**data)
        new_guardian.save_to_db()

        response = {
            'success': True,
            'message': new_guardian.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id):
        guardian = GuardianModel.find_by_id(id)

        if guardian is None:
            response = {
                'success': False,
                'message': 'Guardian not found'
            }
            return Response(json.dumps(response), 404)

        response = {
            'success': True,
            'message': guardian.json()
        }
        return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Guardian does not exist'
            }
            return Response(json.dumps(response), 404)
        guardian = GuardianModel.find_by_id(data['_id'])

        if guardian is None:
            response = {
                'success': False,
                'message': 'Guardian not found'
            }
            return Response(json.dumps(response), 404)

        guardian.update_entry(data)
        response = {
            'success': True,
            'message': guardian.json()
        }
        return Response(json.dumps(response), 200)

    def delete(self, id):
        guardian = GuardianModel.find_by_id(id)

        if guardian is None:
            response = {
                'success': False,
                'message': 'Guardian not found'
            }
            return Response(json.dumps(response), 404)

        guardian.delete_by_id(id)
        response = {
            'success': True,
            'message': 'Guardian record deleted'
        }
        return Response(json.dumps(response), 200)
