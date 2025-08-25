import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
from models.teacher import TeacherModel

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestTeacher(unittest.TestCase):

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

        with open("tests/configs/teacher_config.json",
                  "r") as fr:
            self.teacher = json.load(fr)
        # Delete entries from postgres
        try:
            with self.app.app_context():
                TeacherModel.delete_from_db(self.teacher)
        except Exception:
            print("profile does not exists in db")

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
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
        # Delete entries from postgres
        try:
            with self.app.app_context():
                TeacherModel.delete_from_db(self.teacher)
        except Exception:
            print("profile does not exists in db")

    def test_create_teacher(self):

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["given_name"],
                         "Venâncio")
        self.teacher['_id'] = res_answer["message"]['_id']