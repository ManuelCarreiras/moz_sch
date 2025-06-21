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

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

init_db(app)

api = Api(app)
api.add_resource(UserResource, '/users')
api.add_resource(StudentResource, '/students')
api.add_resource(ClassResource, '/classes')
api.add_resource(ProfessorResource, '/professors')
api.add_resource(MensalityResource, '/mensalities')
api.add_resource(ExpenseResource, '/expenses')

def ValidAuth():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return {'message': 'Missing token'}, 401
    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
        g.user = payload['user_id']
    except Exception:
        return {'message': 'Invalid token'}, 401

app.before_request(ValidAuth)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 