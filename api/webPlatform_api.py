import json
import logging
import os
# import traceback
# import secrets

from db import db
from flask import Flask, Response, request
# , g, request
from flask_cors import CORS
from flask_restful import Api, Resource

from resources.school_year import SchoolYearResource
from resources.student import StudentResource
from resources.teacher import TeacherResource
from resources.student_year_level import StudentYearLevelResourceStudent, StudentYearLevelResourceLevel, StudentYearLevelResourceYear, StudentYearLevelAssignmentResource  # noqa
from resources.year_level import YearLevelResource
from resources.student_class import StudentClassResource
from resources.student_schedule import StudentScheduleResource
from resources.teacher_schedule import TeacherScheduleResource
from resources.class_model import ClassModelResource, ClassResourceSubjectList, ClassResourceTeacherList, ClassResourceTermList, ClassResourcePeriodList, ClassResourceClassroomList  # noqa
from resources.class_timetable import ClassTimetableResource, ClassConflictsResource
from resources.classroom_types import ClassroomTypesResource
from resources.classroom import ClassroomResource
from resources.department import DepartmentResource
from resources.subject import SubjectResource
from resources.term import TermResource
from resources.period import PeriodResource
from resources.score_range import ScoreRangeResource
from resources.guardian import GuardianResource
from resources.student_guardian import StudentGuardianResource
from resources.guardian_type import GuardianTypeResource
from resources.teacher_department import TeacherDepartmentResource
from resources.auth import AuthLoginResource, AuthMeResource
from resources.assessment_type import AssessmentTypeResource
from resources.assignment import AssignmentResource, TeacherAssignmentResource
from resources.grade import GradeResource, GradebookResource
from resources.student_assignment import StudentAssignmentResource
from resources.grade_component import GradeComponentResource, GradeComponentBulkResource, GradeComponentAutoCreateResource
from resources.term_grade import TermGradeResource, TermGradeCalculateResource

# Get environment variables from Doppler
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres-db")

DEBUG = os.getenv("DEBUG", "false").lower() == "true"

API_KEY = os.getenv("API_KEY")

# Cognito Configuration
AWS_COGNITO_USERPOOL_ID = os.getenv("AWS_COGNITO_USERPOOL_ID")
AWS_COGNITO_APP_CLIENT_ID = os.getenv("AWS_COGNITO_APP_CLIENT_ID")
COGNITO_REGION_NAME = os.getenv("COGNITO_REGION_NAME", "eu-west-2")


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

        response = {'status': 'Sta Isabel API online!'}
        return Response(json.dumps(response), status=200)  # HTTP OK


app = Flask(__name__)

# Configure CORS to allow all origins for development
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
     allow_headers=["Content-Type", "Authorization", "accessToken"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

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


# Add authentication middleware
@app.before_request
def before_request():
    # Skip auth for static files and health checks
    if request.endpoint in ['static', 'home']:
        return

    # Skip auth during startup (when no endpoint is set)
    if not request.endpoint:
        return

    from utils.valid_auth import validAuth
    return validAuth()


# Auth validation
def validAuth():  # pragma: no cover
    from utils.valid_auth import validAuth as cognito_auth
    return cognito_auth()


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
api.add_resource(StudentScheduleResource, "/student/schedule", "/student/schedule/<student_id>")
api.add_resource(TeacherScheduleResource, "/teacher/schedule", "/teacher/schedule/<teacher_id>")

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
api.add_resource(ClassTimetableResource, "/class/timetable/<year_level_id>")
api.add_resource(ClassConflictsResource, "/class/conflicts/<year_level_id>")

api.add_resource(ScoreRangeResource, "/score_range", "/score_range/<id>")
api.add_resource(StudentGuardianResource, "/student_guardian")
api.add_resource(GuardianTypeResource, "/guardian/types", "/guardian/types/<id>")
api.add_resource(GuardianResource, "/guardian", "/guardian/<id>")
api.add_resource(TeacherDepartmentResource, "/teacher-department", "/teacher-department/<teacher_id>", "/teacher-department/<teacher_id>/<department_id>")
api.add_resource(StudentYearLevelAssignmentResource, "/student-year-level-assignment", "/student-year-level-assignment/<student_id>", "/student-year-level-assignment/<student_id>/<level_id>")

# Authentication endpoints
api.add_resource(AuthLoginResource, "/auth/login")
api.add_resource(AuthMeResource, "/auth/me")

# Phase 3: Grading System endpoints
api.add_resource(AssessmentTypeResource, "/assessment_type", "/assessment_type/<type_id>")
api.add_resource(AssignmentResource, "/assignment", "/assignment/<assignment_id>")
api.add_resource(TeacherAssignmentResource, "/assignment/teacher")
api.add_resource(StudentAssignmentResource, "/student/assignments", "/student/assignments/<student_id>")
api.add_resource(GradeResource, "/grade", "/grade/<grade_id>")
api.add_resource(GradebookResource, "/gradebook/class/<class_id>")

# ========== Phase 4: Attendance System ==========
from resources.attendance import AttendanceResource, AttendanceRosterResource
api.add_resource(AttendanceResource, "/attendance", "/attendance/<attendance_id>")
api.add_resource(AttendanceRosterResource, "/attendance/roster/<class_id>")

# Grade Components
api.add_resource(GradeComponentResource, "/grade_component", "/grade_component/<component_id>")
api.add_resource(GradeComponentAutoCreateResource, "/grade_component/auto_create")
api.add_resource(GradeComponentBulkResource, "/grade_component/bulk")

# Term Grades
api.add_resource(TermGradeResource, "/term_grade", "/term_grade/<grade_id>")
api.add_resource(TermGradeCalculateResource, "/term_grade/calculate")

if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
