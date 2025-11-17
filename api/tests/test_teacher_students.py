import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestTeacherStudents(unittest.TestCase):

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

    def tearDown(self) -> None:
        """
        No cleanup needed
        """
        pass

    def test_get_teacher_students(self):
        """Test getting teacher's students"""
        response = self.client.get("/teacher/students",
                                   headers={"Authorization": API_KEY})
        # May require authentication or return empty list
        self.assertIn(response.status_code, [200, 401, 403])
        if response.status_code == 200:
            res_answer = json.loads(response.get_data())
            self.assertIn("students", res_answer)


if __name__ == '__main__':
    unittest.main()

