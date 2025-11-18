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


class TestStudent(unittest.TestCase):

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

        with open("tests/configs/student_config.json",
                  "r") as fr:
            self.student = json.load(fr)
        with open("tests/configs/student_config_missing.json",
                  "r") as fr:
            self.student_missing = json.load(fr)
        with open("tests/configs/student_config_update.json",
                  "r") as fr:
            self.student_update = json.load(fr)

        # Initialize student_id to None
        self.student_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.student_id is not None:
            self.client.delete("/student/{}".format(self.student_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_student(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["given_name"],
                         "Vena")
        self.student_id = res_answer["message"]["_id"]

    def test_create_student_missing(self):

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required fields")
        self.student_id = None

    def test_get_student(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        response = self.client.get("/student/{}".format(self.student_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"],
                         "Vena")

    def test_get_student_missing(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/student/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student not found")

    def test_put_student(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_update['_id'] = self.student_id
        response = self.client.put("/student",
                                   headers={"Authorization": API_KEY},
                                   json=self.student_update)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"],
                         "Manuel")

    def test_put_student_wrong(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_update['_id'] = str(uuid.uuid4())
        response = self.client.put("/student",
                                   headers={"Authorization": API_KEY},
                                   json=self.student_update)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Student not found")

    def test_delete_student(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]
        response = self.client.delete("/student/{}".format(self.student_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        self.student_id = None  # Already deleted
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Student deleted")

    def test_delete_student_wrong(self):
        # Add unique email field (required for student creation)
        test_student = self.student.copy()
        unique_student_email = (
            f"student.{int(time.time() * 1000)}."
            f"{uuid.uuid4().hex[:8]}@example.com"
        )
        test_student['email'] = unique_student_email

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=test_student)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Student creation failed: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/student/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Student not found")
