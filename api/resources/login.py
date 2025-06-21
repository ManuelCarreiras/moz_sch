from flask import request
from flask_restful import Resource
from models.user import User
from flask_jwt_extended import create_access_token

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return {'message': 'Username and password required'}, 400
        user = User.find_by_username(username)
        if not user or not user.verify_password(password):
            return {'message': 'Invalid credentials'}, 401
        access_token = create_access_token(identity=str(user._id), additional_claims={"role": user.role})
        return {'access_token': access_token}, 200 