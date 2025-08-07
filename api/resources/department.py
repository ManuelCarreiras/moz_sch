from flask import request, g
from flask_restful import Resource
from models.department import DepartmentModel



class DepartmentResource(Resource):

   def post(self):
        data = request.get_json()
        new_department = DepartmentModel(_id=g.department, **data)

        if DepartmentModel.find_by_id(g.department):
            return {'message': 'The department type already exists'}, 400

        new_department.save_to_db()
        return new_department.json(), 201
   
   def get(self):
        departpament = DepartmentModel.find_by_id(g.department)

        if departpament is None:
            return {'message': 'Department not found'}, 404

        return departpament.json(), 200

   def put(self):
        data = request.get_json()
        department = DepartmentModel.find_by_id(g.department)

        if department is None:
            return {'message': 'Department not found'}, 404

        department.update_entry(data)
        return department.json(), 200

   def delete(self):
        department: DepartmentModel = DepartmentModel.find_by_id(g.department)

        if department is None:
            return {'message': 'Department not found'}, 404

        department.delete_by_id(g.department)
        return {'message': 'Department deleted'}, 200 