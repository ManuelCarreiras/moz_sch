from flask import Flask
from flask_restful import Api
from resources.user import UserResource
from resources.student import StudentResource
from resources.class_resource import ClassResource
from resources.professor import ProfessorResource
from resources.mensality import MensalityResource
from resources.expense import ExpenseResource
from db import init_db

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 