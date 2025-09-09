import json
import logging
import os
# import traceback
# import secrets

from db import db
from flask import Flask, Response
# , g, request
from flask_cors import CORS
from flask_restful import Api, Resource

from resources.school_year import SchoolYearResource
from resources.student import StudentResource
from resources.teacher import TeacherResource
from resources.student_year_level import StudentYearLevelResourceStudent, StudentYearLevelResourceLevel, StudentYearLevelResourceYear  # noqa
from resources.year_level import YearLevelResource
from resources.student_class import StudentClassResource
from resources.class_model import ClassModelResource, ClassResourceSubjectList, ClassResourceTeacherList, ClassResourceTermList, ClassResourcePeriodList, ClassResourceClassroomList  # noqa
from resources.classroom_types import ClassroomTypesResource
from resources.classroom import ClassroomResource
from resources.department import DepartmentResource
from resources.subject import SubjectResource
from resources.term import TermResource
from resources.period import PeriodResource
from resources.score_range import ScoreRangeResource

# Get environment variables and print them for debugging
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres-db")

DEBUG = os.getenv("DEBUG", False)

API_KEY = os.getenv("API_KEY")


class Webapi:

    def __init__(self):
        self.app = app
        app.api = self


class Home(Resource):

    def get(self):
        app.logger.debug('DEBUG message')
        app.logger.info('INFO message')
        app.logger.warning('WARNING message')
        app.logger.error('ERROR message')
        app.logger.critical('CRITICAL message')

        response = {'status': 'Scale4Audit API online!'}
        return Response(json.dumps(response), status=200)  # HTTP OK


app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = \
    "postgresql://{}:{}@{}:{}/{}".format(POSTGRES_USER,
                                         POSTGRES_PASSWORD,
                                         POSTGRES_HOST,
                                         POSTGRES_PORT,
                                         POSTGRES_DB)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = True
api = Api(app)

db.init_app(app)

# Create postgres tables with error handling
with app.app_context():
    db.create_all()

# def check_api_key():
#     key = request.headers.get('Authorization')
#     if key:
#         return secrets.compare_digest(key, API_KEY)
#     return False


# def check_user_test_permissions():
#     '''User test for user without permissions'''

#     if request.headers.get('UserClient'):
#         return True
#     return False


# def check_if_is_device_request():
#     '''If is device making request
#        it is not needed api key'''

#     device_key = request.headers.get('MONITORING_DEVICE_KEY')
#     device_id = request.headers.get('MONITORING_DEVICE_ID')
#     device_url = "/monitoring_data"

#     if device_key and device_id and device_url in request.url:
#         return True
#     return False

# # Auth validation
# def validAuth():  # pragma: no cover

#     # g.method = request.method  # for permissions
#     # g.url = request.url  # for permissions
#     # user_client = check_user_test_permissions()
#     api_key = check_api_key()
#     # Check if is device making request
#     if api_key is False and check_if_is_device_request():
#         return
#     # Check if debug
#     if app.api.debug:
#         from datetime import datetime
#         print("[{}] NO AUTH VALIDATION!"
#               .format(datetime.now().isoformat()))
#         g.user = "00000000-0000-0000-0000-0000"  # Dummy user
#         g.admin = True
#         return
#     elif api_key:  # and not user_client:
#         # TODO: Check if this is okay. Using for test purpose
#         g.user = "00000000-0000-0000-0000-0000"  # Dummy user
#         g.admin = True
#         return
#     # elif api_key and user_client:
#     #     g.user = "debug_user_client"
#     #     g.admin = False
#     #     return
#     # Obtain access token and check api key
#     try:
#         if request.method == 'OPTIONS':
#             return Response(status=200)
#         if request.method != 'OPTIONS':
#             accessToken = request.headers.get('accessToken')
#             # Verify token autenticity
#             if accessToken:
#                 auth = verify_accessToken(accessToken)
#                 if auth:
#                     g.user = auth["sub"]
#                     if "ADMIN" in auth["cognito:groups"]:
#                         g.admin = True
#                     else:
#                         g.admin = False
#                     return
#                 else:
#                     response = {"success": False,
#                                 "message": "Invalid User Token."}
#                     return Response(response, status=401)
#             else:
#                 response = {"success": False,
#                             "message": "Invalid User Token."}
#                 return Response(response, status=401)
#     except Exception as e:
#         print(e)
#         response = {"success": False,
#                     "message": "Invalid User Token."}
#         return Response(response, status=401)

api.add_resource(Home, "/")

api.add_resource(StudentResource, "/student",
                                  "/student/<id>")

api.add_resource(TeacherResource, "/teacher",
                                  "/teacher/<id>")

api.add_resource(SchoolYearResource, "/school_year",
                                     "/school_year/<id>")

api.add_resource(YearLevelResource, "/year_level",
                                    "/year_level/<id>")

api.add_resource(StudentYearLevelResourceLevel, "/student_year_level",
                                                "/student_year_level/level/<id>")  # noqa
api.add_resource(StudentYearLevelResourceYear, "/student_year_level/year/<id>")
api.add_resource(StudentYearLevelResourceStudent, "/student_year_level/student/<id>")  # noqa

api.add_resource(StudentClassResource, "/student_class",
                                              "/student_class/<id>")

api.add_resource(ClassroomTypesResource, "/classroom_types",
                                         "/classroom_types/<id>")

api.add_resource(ClassroomResource, "/classroom",
                                    "/classroom/<id>")

api.add_resource(DepartmentResource, "/department",
                                     "/department/<id>")

api.add_resource(SubjectResource, "/subject",
                                  "/subject/<id>")

api.add_resource(TermResource, "/term",
                               "/term/<id>")

api.add_resource(PeriodResource, "/period",
                                 "/period/<id>")

api.add_resource(ClassModelResource, "/class",
                                     "/class/<id>")
api.add_resource(ClassResourceSubjectList, "/class/list/subject/<id>")
api.add_resource(ClassResourceTeacherList, "/class/list/teacher/<id>")
api.add_resource(ClassResourceTermList, "/class/list/term/<id>")
api.add_resource(ClassResourcePeriodList, "/class/list/period/<id>")
api.add_resource(ClassResourceClassroomList, "/class/list/classroom/<id>")

api.add_resource(ScoreRangeResource, "/score_range",
                                     "/score_range/<id>")

if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
