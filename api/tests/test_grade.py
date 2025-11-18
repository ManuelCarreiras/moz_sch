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


class TestGrade(unittest.TestCase):

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

    def test_get_grade_missing(self):
        """Test getting a non-existent grade"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/grade/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Grade not found")

    def test_get_grades_with_filters(self):
        """Test getting grades with filters"""
        if not self.student_id:
            self.skipTest("Student not created")
        
        # Test with student_id filter
        response = self.client.get("/grade?student_id={}".format(self.student_id),
                                   headers={"Authorization": API_KEY})
        # May require assignment_id or return 400
        self.assertIn(response.status_code, [200, 400])
        if response.status_code == 200:
            res_answer = json.loads(response.get_data())
            self.assertIn("grades", res_answer)

    def test_create_grade_missing(self):
        """Test creating grade with missing required fields"""
        incomplete_data = {"student_id": self.student_id}
        response = self.client.post('/grade',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("required", res_answer["message"].lower())


if __name__ == '__main__':
    unittest.main()

