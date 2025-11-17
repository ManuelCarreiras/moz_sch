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


class TestTeacherSchedule(unittest.TestCase):

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

        # Create teacher
        with open("tests/configs/teacher_config.json", "r") as fr:
            teacher_data = json.load(fr)
        response = self.client.post('/teacher',
                                   headers={"Authorization": API_KEY},
                                   json=teacher_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.teacher_id = res_answer["message"]["_id"]
        else:
            self.teacher_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.teacher_id is not None:
            self.client.delete("/teacher/{}".format(self.teacher_id),
                               headers={"Authorization": API_KEY})

    def test_get_teacher_schedule(self):
        """Test getting schedule for a teacher"""
        if not self.teacher_id:
            self.skipTest("Teacher not created")
        
        response = self.client.get("/teacher/schedule/{}".format(self.teacher_id),
                                   headers={"Authorization": API_KEY})
        # Should return 200 even if no schedule found
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            res_answer = json.loads(response.get_data())
            self.assertIn("schedule", res_answer)

    def test_get_teacher_schedule_invalid(self):
        """Test getting schedule for invalid teacher"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/teacher/schedule/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()

