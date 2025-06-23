from flask import request
from flask_restful import Resource
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.auth import role_required   

class UserResource(Resource):
    @jwt_required()
    @role_required('admin')
    def post(self):
        data = request.get_json()
        # Only admins can create users
        new_user = User(**data)
        if User.find_by_username(data.get('username')):
            return {'message': 'User already exists'}, 400
        new_user.save_to_db()
        return new_user.json(), 201

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if user is None:
            return {'message': 'User not found'}, 404
        return user.json(), 200

    @jwt_required()
    @role_required('admin')
    def put(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if user is None:
            return {'message': 'User not found'}, 404
        user.update_entry(data)
        return user.json(), 200

    @jwt_required()
    @role_required('admin')
    def delete(self):
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if user is None:
            return {'message': 'User not found'}, 404
        user.delete_by_id(user_id)
        return {'message': 'User deleted'}, 200 