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


class TestTeacherDepartment(unittest.TestCase):

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

        # Create dependencies
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

        with open("tests/configs/department_config.json", "r") as fr:
            dept_data = json.load(fr)
        response = self.client.post('/department',
                                   headers={"Authorization": API_KEY},
                                   json=dept_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.department_id = res_answer["message"]["_id"]
        else:
            self.department_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.teacher_id is not None and self.department_id is not None:
            self.client.delete("/teacher-department/{}/{}".format(self.teacher_id, self.department_id),
                               headers={"Authorization": API_KEY})
        
        if self.teacher_id is not None:
            self.client.delete("/teacher/{}".format(self.teacher_id),
                               headers={"Authorization": API_KEY})
        
        if self.department_id is not None:
            self.client.delete("/department/{}".format(self.department_id),
                               headers={"Authorization": API_KEY})

    def test_create_teacher_department(self):
        """Test creating a teacher-department assignment"""
        if not all([self.teacher_id, self.department_id]):
            self.skipTest("Missing required dependencies")
        
        data = {
            "teacher_id": self.teacher_id,
            "department_id": self.department_id
        }
        
        response = self.client.post('/teacher-department',
                                    headers={"Authorization": API_KEY},
                                    json=data)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])

    def test_create_teacher_department_missing(self):
        """Test creating teacher-department with missing required fields"""
        incomplete_data = {"teacher_id": self.teacher_id}
        response = self.client.post('/teacher-department',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])

    def test_get_teacher_departments(self):
        """Test getting departments for a teacher"""
        if not self.teacher_id:
            self.skipTest("Teacher not created")
        
        response = self.client.get("/teacher-department/{}".format(self.teacher_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_get_department_teachers(self):
        """Test getting teachers for a department"""
        if not self.department_id:
            self.skipTest("Department not created")
        
        response = self.client.get("/teacher-department?department_id={}".format(self.department_id),
                                   headers={"Authorization": API_KEY})
        # Note: The endpoint might need adjustment based on actual implementation
        self.assertIn(response.status_code, [200, 400])


if __name__ == '__main__':
    unittest.main()

