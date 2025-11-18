import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
import uuid
import time
from models.student_guardian import StudentGuardianModel

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestStudentGuardian(unittest.TestCase):

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

        # Initialize IDs
        self.student_id = None
        self.guardian_id = None
        self.guardian_type_id = None
        self.student_guardian_id = None

        # Create dependencies
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
            self.student_id = None

        with open("tests/configs/guardian_config.json", "r") as fr:
            guardian_data = json.load(fr)
        # Generate unique email and phone number for guardian
        unique_guardian_email = (
            f"guardian.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        unique_phone = uuid.uuid4().hex[:10]
        guardian_data['email_address'] = unique_guardian_email
        guardian_data['phone_number'] = unique_phone
        response = self.client.post('/guardian',
                                    headers={"Authorization": API_KEY},
                                    json=guardian_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.guardian_id = res_answer["message"]["_id"]
        else:
            self.guardian_id = None

        # Create guardian type with unique name
        unique_guardian_type_name = f"Parent_{uuid.uuid4().hex[:8]}"
        guardian_type_data = {"guardian_type_name": unique_guardian_type_name}
        response = self.client.post('/guardian/types',
                                    headers={"Authorization": API_KEY},
                                    json=guardian_type_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.guardian_type_id = res_answer["message"]["_id"]
        else:
            self.guardian_type_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        # Delete all student_guardian records for this guardian first
        # (before guardian due to FK constraint)
        if self.guardian_id is not None:
            # Find and delete all student_guardian records for this guardian
            with self.app.app_context():
                student_guardian_records = StudentGuardianModel.find_by_guardian_id(
                    self.guardian_id
                )
                # Delete records directly using db.session
                for record in student_guardian_records:
                    db.session.delete(record)
                db.session.commit()

        # Also delete the specific student_guardian if we tracked it
        if self.student_guardian_id is not None:
            with self.app.app_context():
                record = StudentGuardianModel.find_by_id(self.student_guardian_id)
                if record:
                    db.session.delete(record)
                    db.session.commit()
            self.student_guardian_id = None

        # Delete guardian (after all student_guardian records are deleted)
        if self.guardian_id is not None:
            self.client.delete("/guardian/{}".format(self.guardian_id),
                               headers={"Authorization": API_KEY})
            self.guardian_id = None

        # Delete student
        if self.student_id is not None:
            self.client.delete("/student/{}".format(self.student_id),
                               headers={"Authorization": API_KEY})
            self.student_id = None

        # Delete guardian_type
        if self.guardian_type_id is not None:
            self.client.delete("/guardian/types/{}".format(self.guardian_type_id),
                               headers={"Authorization": API_KEY})
            self.guardian_type_id = None

    def test_create_student_guardian(self):
        """Test creating a student-guardian relationship"""
        if not all([self.student_id, self.guardian_id, self.guardian_type_id]):
            self.skipTest("Missing required dependencies")

        data = {
            "student_id": self.student_id,
            "guardian_id": self.guardian_id,
            "guardian_type_id": self.guardian_type_id
        }

        response = self.client.post('/student_guardian',
                                    headers={"Authorization": API_KEY},
                                    json=data)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.student_guardian_id = res_answer["message"]["_id"]

    def test_create_student_guardian_missing(self):
        """Test creating student-guardian with missing required fields"""
        incomplete_data = {"student_id": self.student_id}
        response = self.client.post('/student_guardian',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.student_guardian_id = None


if __name__ == '__main__':
    unittest.main()
