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
from utils.auth import role_required
import os
from flask_cors import CORS
from db import db
import logging

#env variables from doppler

DEBUG = os.getenv("DEBUG", True)

POSTGRES_USER = os.getenv("POSTGRES_USER","app_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD","app_password")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB","app_db")
POSTGRES_HOST = os.getenv("POSTGRES_HOST","postgres-db")

API_KEY = os.getenv("API_KEY")

TIMESCALE_USER = os.getenv("TIMESCALE_USER")
TIMESCALE_PASSWORD = os.getenv("TIMESCALE_PASSWORD")
TIMESCALE_HOST = os.getenv("TIMESCALE_HOST")
TIMESCALE_PORT = os.getenv("TIMESCALE_PORT")
TIMESCALE_DB = os.getenv("TIMESCALE_DB")

class Webapi:

    def __init__(self):
        self.app = app
        app.api = self
        app.api.debug = DEBUG

# Flask app with sqlalchemy
app: Flask = Flask(__name__)
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

app.config['SQLALCHEMY_DATABASE_URI'] = \
    "postgresql://{}:{}@{}:{}/{}".format(POSTGRES_USER,
                                         POSTGRES_PASSWORD,
                                         POSTGRES_HOST,
                                         POSTGRES_PORT,
                                         POSTGRES_DB)
app.config['SQLALCHEMY_BINDS'] = {
    "timescale":
        {"url":
            "postgresql://{}:{}@{}:{}/{}".format(TIMESCALE_USER,
                                                 TIMESCALE_PASSWORD,
                                                 TIMESCALE_HOST,
                                                 TIMESCALE_PORT,
                                                 TIMESCALE_DB)
         }
    }
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True

api = Api(app)

db.init_app(app)


# Create postgres tables
def create_tables():
    db.create_all(bind_key=[None, "timescale"])


if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)


# Create SQL Tables
# noqa: E501 see https://stackoverflow.com/a/74629704
with app.app_context():
    create_tables()
    import time


if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)



api = Api(app)
api.add_resource(UserResource, '/users')
api.add_resource(StudentResource, '/students')
api.add_resource(ClassResource, '/classes')
api.add_resource(ProfessorResource, '/professors')
api.add_resource(MensalityResource, '/mensalities')
api.add_resource(ExpenseResource, '/expenses')
api.add_resource(LoginResource, '/login')


if __name__ == '__main__':
    app.run(host='0.0.0.0') 