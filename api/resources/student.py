from flask import request, g
from flask_restful import Resource
from models.student import StudentModel

class StudentResource(Resource):
    def post(self):
        data = request.get_json()
        new_student = StudentModel(_id=g.student, **data)

        if StudentModel.find_by_id(g.student):
            return {'message': 'Student already exists'}, 400

        new_student.save_to_db()
        return new_student.json(), 201

    def get(self):
        student = StudentModel.find_by_id(g.student)

        if student is None:
            return {'message': 'Student not found'}, 404

        return student.json(), 200

    def put(self):
        data = request.get_json()
        student = StudentModel.find_by_id(g.student)

        if student is None:
            return {'message': 'Student not found'}, 404

        student.update_entry(data)
        return student.json(), 200

    def delete(self):
        student = StudentModel.find_by_id(g.student)

        if student is None:
            return {'message': 'Student not found'}, 404

        StudentModel.delete_by_id(g.student)
        return {'message': 'Student deleted'}, 200 