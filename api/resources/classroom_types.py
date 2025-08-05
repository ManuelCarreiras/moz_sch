from flask import request, g
from flask_restful import Resource
from models.classroom_types import ClassroomTypesModel



class ClassroomTypesResource(Resource):

   def post(self):
        data = request.get_json()
        new_classroom_types = ClassroomTypesModel(_id=g.classroom_types, **data)

        if ClassroomTypesModel.find_by_id(g.classroom_types):
            return {'message': 'The classroom type already exists'}, 400

        new_classroom_types.save_to_db()
        return new_classroom_types.json(), 201
   
   def get(self):
        classroom_types = ClassroomTypesModel.find_by_id(g.classroom_types)

        if classroom_types is None:
            return {'message': 'Classroom type not found'}, 404

        return classroom_types.json(), 200

   def put(self):
        data = request.get_json()
        classroom_types: ClassroomTypesModel = ClassroomTypesModel.find_by_id(g.classroom_types)

        if classroom_types is None:
            return {'message': 'Classroom type not found'}, 404

        classroom_types.update_entry(data)
        return classroom_types.json(), 200

   def delete(self):
        classroom_types: ClassroomTypesModel = ClassroomTypesModel.find_by_id(g.classroom_types)

        if classroom_types is None:
            return {'message': 'Classroom type not found'}, 404

        classroom_types.delete_by_id(g.classroom_types)
        return {'message': 'Classroom type deleted'}, 200 