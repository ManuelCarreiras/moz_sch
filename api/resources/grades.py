from flask import request, g
from flask_restful import Resource
from models.grades import GradesModel

class GradesResource(Resource):
    def get(self, _id):
        grade = GradesModel.find_by_id(_id)
        if grade:
            return grade.json(), 200
        return {'message': 'Grade not found'}, 404

    def post(self):
        data = request.get_json()
        if not data or 'student_id' not in data or 'class_id' not in data or 'grade_value' not in data:
            return {'message': 'Invalid input'}, 400
        
        grade = GradesModel(
            student_id=data['student_id'],
            class_id=data['class_id'],
            grade_value=data['grade_value']
        )
        grade.save_to_db()
        return grade.json(), 201

    def put(self, _id):
        data = request.get_json()
        grade = GradesModel.find_by_id(_id)
        if not grade:
            return {'message': 'Grade not found'}, 404
        
        grade.update_entry(data)
        return grade.json(), 200

    def delete(self, _id):
        grade = GradesModel.find_by_id(_id)
        if not grade:
            return {'message': 'Grade not found'}, 404
        
        grade.delete_by_id(_id)
        return {'message': 'Grade deleted'}, 200