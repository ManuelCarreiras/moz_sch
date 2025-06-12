from flask import request, g
from flask_restful import Resource
from api.models.mensality import Mensality

class MensalityResource(Resource):
    def post(self):
        data = request.get_json()
        new_mensality = Mensality(_id=g.mensality, **data)

        if Mensality.find_by_id(g.mensality):
            return {'message': 'Mensality already exists'}, 400

        new_mensality.save_to_db()
        return new_mensality.json(), 201

    def get(self):
        mensality = Mensality.find_by_id(g.mensality)

        if mensality is None:
            return {'message': 'Mensality not found'}, 404

        return mensality.json(), 200

    def put(self):
        data = request.get_json()
        mensality = Mensality.find_by_id(g.mensality)

        if mensality is None:
            return {'message': 'Mensality not found'}, 404

        mensality.update_entry(data)
        return mensality.json(), 200

    def delete(self):
        mensality = Mensality.find_by_id(g.mensality)

        if mensality is None:
            return {'message': 'Mensality not found'}, 404

        mensality.delete_by_id(g.mensality)
        return {'message': 'Mensality deleted'}, 200 