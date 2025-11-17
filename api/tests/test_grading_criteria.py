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


class TestGradingCriteria(unittest.TestCase):

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

        # Create dependencies: school_year, department, subject, year_level
        with open("tests/configs/school_year_config.json", "r") as fr:
            year_data = json.load(fr)
        response = self.client.post('/school_year',
                                   headers={"Authorization": API_KEY},
                                   json=year_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.school_year_id = res_answer["message"]["_id"]
        else:
            self.school_year_id = None

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

        with open("tests/configs/subject_config.json", "r") as fr:
            subject_data = json.load(fr)
            if self.department_id:
                subject_data["department_id"] = self.department_id
        response = self.client.post('/subject',
                                   headers={"Authorization": API_KEY},
                                   json=subject_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.subject_id = res_answer["message"]["_id"]
        else:
            self.subject_id = None

        with open("tests/configs/year_level_config.json", "r") as fr:
            level_data = json.load(fr)
        response = self.client.post('/year_level',
                                   headers={"Authorization": API_KEY},
                                   json=level_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.year_level_id = res_answer["message"]["_id"]
        else:
            self.year_level_id = None

        # Create grading criteria data
        self.grading_criteria = {
            "subject_id": self.subject_id,
            "year_level_id": self.year_level_id,
            "school_year_id": self.school_year_id,
            "tests_weight": 0.4,
            "homework_weight": 0.3,
            "attendance_weight": 0.3
        }

        self.grading_criteria_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.grading_criteria_id is not None:
            self.client.delete("/grading_criteria/{}".format(self.grading_criteria_id),
                               headers={"Authorization": API_KEY})
        
        if self.subject_id is not None:
            self.client.delete("/subject/{}".format(self.subject_id),
                               headers={"Authorization": API_KEY})
        
        if self.department_id is not None:
            self.client.delete("/department/{}".format(self.department_id),
                               headers={"Authorization": API_KEY})
        
        if self.year_level_id is not None:
            self.client.delete("/year_level/{}".format(self.year_level_id),
                               headers={"Authorization": API_KEY})
        
        if self.school_year_id is not None:
            self.client.delete("/school_year/{}".format(self.school_year_id),
                               headers={"Authorization": API_KEY})

    def test_create_grading_criteria(self):
        """Test creating grading criteria"""
        if not all([self.subject_id, self.year_level_id, self.school_year_id]):
            self.skipTest("Missing required dependencies")
        
        response = self.client.post('/grading_criteria',
                                    headers={"Authorization": API_KEY},
                                    json=self.grading_criteria)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer)
        self.grading_criteria_id = res_answer["_id"]

    def test_create_grading_criteria_missing(self):
        """Test creating grading criteria with missing required fields"""
        incomplete_data = {"tests_weight": 0.4}
        response = self.client.post('/grading_criteria',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        self.grading_criteria_id = None

    def test_get_grading_criteria(self):
        """Test getting grading criteria"""
        if not all([self.subject_id, self.year_level_id, self.school_year_id]):
            self.skipTest("Missing required dependencies")
        
        # Create first
        response = self.client.post('/grading_criteria',
                                    headers={"Authorization": API_KEY},
                                    json=self.grading_criteria)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.grading_criteria_id = res_answer["_id"]

        # Get with filters
        response = self.client.get("/grading_criteria?subject_id={}&year_level_id={}&school_year_id={}".format(
            self.subject_id, self.year_level_id, self.school_year_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("grading_criteria", res_answer)

    def test_get_all_grading_criteria(self):
        """Test getting all grading criteria"""
        response = self.client.get("/grading_criteria",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("grading_criteria", res_answer)
        self.assertIsInstance(res_answer["grading_criteria"], list)


if __name__ == '__main__':
    unittest.main()

