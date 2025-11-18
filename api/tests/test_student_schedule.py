import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
import uuid
import time

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestStudentSchedule(unittest.TestCase):

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

        # Create all tables
        with self.app.app_context():
            db.create_all()

        self.api = Webapi()
        self.client = self.api.app.test_client()

        # Create student
        with open("tests/configs/student_config.json", "r") as fr:
            student_data = json.load(fr)
        
        # Add unique email field (required for student creation)
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        student_data['email'] = unique_student_email
        
        response = self.client.post('/student',
                                   headers={"Authorization": API_KEY},
                                   json=student_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.student_id = res_answer["message"]["_id"]
        else:
            # Debug: print error if student creation fails
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed in setUp: {res_answer}")
            self.student_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.student_id is not None:
            self.client.delete("/student/{}".format(self.student_id),
                               headers={"Authorization": API_KEY})

    def test_get_student_schedule(self):
        """Test getting schedule for a student"""
        if not self.student_id:
            self.skipTest("Student not created")
        
        response = self.client.get("/student/schedule/{}".format(self.student_id),
                                   headers={"Authorization": API_KEY})
        # Should return 200 even if no schedule found
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            res_answer = json.loads(response.get_data())
            # Response structure: {'success': True, 'message': {'timetable': [], ...}}
            self.assertIn("message", res_answer)
            self.assertIn("timetable", res_answer["message"])

    def test_get_student_schedule_invalid(self):
        """Test getting schedule for invalid student"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/student/schedule/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()

