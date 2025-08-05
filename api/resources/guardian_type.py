from flask import request, g
from flask_restful import Resource
from models.guardian_type import GuardianTypeModel



class GuardianTypeResource(Resource):

   def post(self):
        data = request.get_json()
        new_guardian_type = GuardianTypeModel(_id=g.guardian_type, **data)

        if GuardianTypeModel.find_by_id(g.guardian_type):
            return {'message': 'The guardian type already exists'}, 400

        new_guardian_type.save_to_db()
        return new_guardian_type.json(), 201
   
   def get(self):
        guardian_type = GuardianTypeModel.find_by_id(g.guardian_type)

        if guardian_type is None:
            return {'message': 'Guardian type not found'}, 404

        return guardian_type.json(), 200

   def put(self):
        data = request.get_json()
        guardian_type: GuardianTypeModel = GuardianTypeModel.find_by_id(g.guardian_type)

        if guardian_type is None:
            return {'message': 'Guardian type not found'}, 404

        guardian_type.update_entry(data)
        return guardian_type.json(), 200

   def delete(self):
        guardian_type: GuardianTypeModel = GuardianTypeModel.find_by_id(g.guardian_type)

        if guardian_type is None:
            return {'message': 'Guardian type not found'}, 404

        guardian_type.delete_by_id(g.guardian_type)
        return {'message': 'Guardian type deleted'}, 200