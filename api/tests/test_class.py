import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
import uuid

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")

class TestStudent_year_level(unittest.TestCase):

    def setUp(self):
        """
        Creates a new flask instance for the unit test
        """

        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['CORS_HEADERS'] = 'Content-Type'
        self.app.config["SQLALCHEMY_DATABASE_URI"] = \
            "postgresql://{}:{}@{}:{}/{}".format(POSTGRES_USER,
                                                 POSTGRES_PASSWORD,
                                                 POSTGRES_HOST,
                                                 POSTGRES_PORT,
                                                 POSTGRES_DB)
        db.init_app(self.app)

        self.api = Webapi()
        self.client = self.api.app.test_client()

        with open("tests/configs/class_config.json",
                  "r") as fr:
            self.class_ = json.load(fr)

        with open("tests/configs/subject_config.json",
                  "r") as fr:
            self.subject = json.load(fr)

        with open("tests/configs/department_config.json",
                  "r") as fr:
            self.department = json.load(fr)

        with open("tests/configs/teacher_config.json",
                  "r") as fr:
            self.teacher = json.load(fr)
        with open("tests/configs/school_year_config.json",
                  "r") as fr:
            self.school_year = json.load(fr)
        with open("tests/configs/term_config.json",
                  "r") as fr:
            self.term = json.load(fr)
        with open("tests/configs/period_config.json",
                  "r") as fr:
            self.period = json.load(fr)
        with open("tests/configs/classroom_types_config.json",
                  "r") as fr:
            self.classroom_types = json.load(fr)
        with open("tests/configs/classroom_config.json",
                  "r") as fr:
            self.classroom = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """
        # Delete entries from postgres
        if self.class_id is not None:
            self.client.delete("/class/{}".format(
                               self.student_id),
                               headers={"Authorization": API_KEY})
        if self.subject_id is not None:
            self.client.delete("/subject/{}".format(
                               self.subject_id),
                               headers={"Authorization": API_KEY})
        if self.department_id is not None:
            self.client.delete("/department/{}".format(
                               self.department_id),
                               headers={"Authorization": API_KEY})
        if self.teacher_id is not None:
            self.client.delete("/teacher/{}".format(
                               self.teacher_id),
                               headers={"Authorization": API_KEY})
        if self.school_year_id is not None:
            self.client.delete("/school_year/{}".format(
                               self.school_year_id),
                               headers={"Authorization": API_KEY})
        if self.term_id is not None:
            self.client.delete("/term/{}".format(
                               self.term_id),
                               headers={"Authorization": API_KEY})
        if self.period_id is not None:
            self.client.delete("/period/{}".format(
                               self.period_id),
                               headers={"Authorization": API_KEY})
        if self.classroom_types_id is not None:
            self.client.delete("/classroom_types/{}".format(
                               self.classroom_types_id),
                               headers={"Authorization": API_KEY})
        if self.classroom_id is not None:
            self.client.delete("/classroom/{}".format(
                               self.classroom_id),
                               headers={"Authorization": API_KEY})
        else:
            pass
