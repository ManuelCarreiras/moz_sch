from flask import request, g
from flask_restful import Resource
from api.models.user import User

class UserResource(Resource):
    def post(self):
        data = request.get_json()
        new_user = User(_id=g.user, **data)

        if User.find_by_id(g.user):
            return {'message': 'User already exists'}, 400

        new_user.save_to_db()
        return new_user.json(), 201

    def get(self):
        user = User.find_by_id(g.user)

        if user is None:
            return {'message': 'User not found'}, 404

        return user.json(), 200

    def put(self):
        data = request.get_json()
        user = User.find_by_id(g.user)

        if user is None:
            return {'message': 'User not found'}, 404

        user.update_entry(data)
        return user.json(), 200

    def delete(self):
        user = User.find_by_id(g.user)

        if user is None:
            return {'message': 'User not found'}, 404

        user.delete_by_id(g.user)
        return {'message': 'User deleted'}, 200 