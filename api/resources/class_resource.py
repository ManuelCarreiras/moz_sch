from flask import request, g
from flask_restful import Resource
from models.class_model import Class as ClassModel

class ClassResource(Resource):
    def post(self):
        data = request.get_json()
        new_class = ClassModel(_id=g.class_, **data)

        if ClassModel.find_by_id(g.class_):
            return {'message': 'Class already exists'}, 400

        new_class.save_to_db()
        return new_class.json(), 201

    def get(self):
        class_ = ClassModel.find_by_id(g.class_)

        if class_ is None:
            return {'message': 'Class not found'}, 404

        return class_.json(), 200

    def put(self):
        data = request.get_json()
        class_ = ClassModel.find_by_id(g.class_)

        if class_ is None:
            return {'message': 'Class not found'}, 404

        class_.update_entry(data)
        return class_.json(), 200

    def delete(self):
        class_ = ClassModel.find_by_id(g.class_)

        if class_ is None:
            return {'message': 'Class not found'}, 404

        class_.delete_by_id(g.class_)
        return {'message': 'Class deleted'}, 200 