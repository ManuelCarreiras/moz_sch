from flask import request, g
from flask_restful import Resource
from models.professor import Professor

class ProfessorResource(Resource):
    def post(self):
        data = request.get_json()
        new_professor = Professor(_id=g.professor, **data)

        if Professor.find_by_id(g.professor):
            return {'message': 'Professor already exists'}, 400

        new_professor.save_to_db()
        return new_professor.json(), 201

    def get(self):
        professor = Professor.find_by_id(g.professor)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        return professor.json(), 200

    def put(self):
        data = request.get_json()
        professor = Professor.find_by_id(g.professor)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.update_entry(data)
        return professor.json(), 200

    def delete(self):
        professor = Professor.find_by_id(g.professor)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.delete_by_id(g.professor)
        return {'message': 'Professor deleted'}, 200 