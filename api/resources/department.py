from flask import request, Response
from flask_restful import Resource
from models.department import DepartmentModel
import json


class DepartmentResource(Resource):
    def post(self):
        data = request.get_json()

        if (
            not data.get('department_name')
        ):
            response = {
                'success': False,
                'message': 'Missing required field'
            }
            return Response(json.dumps(response), status=400)

        new_department = DepartmentModel(**data)
        new_department.save_to_db()

        response = {
            'success': True,
            'message': new_department.json()
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific department by ID
            department = DepartmentModel.find_by_id(id)
            if department is None:
                response = {
                    'success': False,
                    'message': 'Department not found'
                }
                return Response(json.dumps(response), 404)
            response = {
                'success': True,
                'message': department.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all departments
            departments = DepartmentModel.find_all()
            departments_list = [department.json() for department in departments]
            response = {
                'success': True,
                'message': departments_list
            }
            return Response(json.dumps(response), 200)

    def put(self):
        data = request.get_json()

        if '_id' not in data:
            response = {
                'success': False,
                'message': 'Department does not exist'
            }
            return Response(json.dumps(response), 404)
        department = DepartmentModel.find_by_id(data['_id'])

        if department is None:
            response = {
                'success': False,
                'message': 'Department not found'
            }
            return Response(json.dumps(response), 404)

        department.update_entry(data)
        response = {
            'success': True,
            'message': department.json()
        }
        return Response(json.dumps(response), 200)

    def delete(self, id):
        department = DepartmentModel.find_by_id(id)

        if department is None:
            response = {
                'success': False,
                'message': 'Department not found'
            }
            return Response(json.dumps(response), 404)

        department.delete_by_id(id)

        response = {
            'success': True,
            'message': 'Department record deleted'
                    }

        return Response(json.dumps(response), 200)
