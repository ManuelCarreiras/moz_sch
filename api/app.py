from flask import Flask, g, request
from flask_restful import Api
from resources.user import UserResource
from resources.student import StudentResource
from resources.class_resource import ClassResource
from resources.professor import ProfessorResource
from resources.mensality import MensalityResource
from resources.expense import ExpenseResource
from db import init_db
import jwt
from flask_jwt_extended import JWTManager, create_access_token, verify_jwt_in_request, get_jwt, jwt_required
from resources.login import LoginResource
from functools import wraps
from flask import abort
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production!

init_db(app)

api = Api(app)
api.add_resource(UserResource, '/users')
api.add_resource(StudentResource, '/students')
api.add_resource(ClassResource, '/classes')
api.add_resource(ProfessorResource, '/professors')
api.add_resource(MensalityResource, '/mensalities')
api.add_resource(ExpenseResource, '/expenses')
api.add_resource(LoginResource, '/login')

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") not in roles:
                abort(403, description="Forbidden: insufficient permissions")
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# To use role-based access control in your resource classes:
# from flask_jwt_extended import jwt_required
# from app import role_required
# class SomeResource(Resource):
#     @jwt_required()
#     @role_required('admin')
#     def get(self):
#         ...

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 