from flask import request, g
from flask_restful import Resource
from models.guardian import GuardianModel



class GuardianResource(Resource):

   def post(self):
        data = request.get_json()
        new_guardian = GuardianModel(_id=g.guardian, **data)

        if GuardianModel.find_by_id(g.guardian):
            return {'message': 'The guardian already exists'}, 400

        new_guardian.save_to_db()
        return new_guardian.json(), 201
   
   def get(self):
        guardian = GuardianModel.find_by_id(g.guardian)

        if guardian is None:
            return {'message': 'Guardian not found'}, 404

        return guardian.json(), 200

   def put(self):
        data = request.get_json()
        guardian = GuardianModel.find_by_id(g.guardian)

        if guardian is None:
            return {'message': 'Guardian not found'}, 404

        guardian.update_entry(data)
        return guardian.json(), 200

   def delete(self):
        guardian = GuardianModel.find_by_id(g.guardian)

        if guardian is None:
            return {'message': 'Guardian not found'}, 404

        guardian.delete_by_id(g.guardiane)
        return {'message': 'guardian deleted'}, 200