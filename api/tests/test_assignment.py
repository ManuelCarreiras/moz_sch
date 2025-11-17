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


class TestAssignment(unittest.TestCase):

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

        # Create dependencies (simplified - would need full setup in real scenario)
        # Create assessment type
        assessment_type_data = {"type_name": "Test"}
        response = self.client.post('/assessment_type',
                                   headers={"Authorization": API_KEY},
                                   json=assessment_type_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.assessment_type_id = res_answer["assessment_type"]["_id"]
        else:
            self.assessment_type_id = None

        self.assignment_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.assignment_id is not None:
            self.client.delete("/assignment/{}".format(self.assignment_id),
                               headers={"Authorization": API_KEY})
        
        if self.assessment_type_id is not None:
            self.client.delete("/assessment_type/{}".format(self.assessment_type_id),
                               headers={"Authorization": API_KEY})

    def test_get_assignment_missing(self):
        """Test getting a non-existent assignment"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/assignment/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Assignment not found")

    def test_get_all_assignments(self):
        """Test getting all assignments"""
        response = self.client.get("/assignment",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("assignments", res_answer)
        self.assertIsInstance(res_answer["assignments"], list)

    def test_create_assignment_missing(self):
        """Test creating assignment with missing required fields"""
        incomplete_data = {"title": "Test Assignment"}
        response = self.client.post('/assignment',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("required", res_answer["message"].lower())
        self.assignment_id = None


if __name__ == '__main__':
    unittest.main()

