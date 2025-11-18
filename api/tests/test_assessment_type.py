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


class TestAssessmentType(unittest.TestCase):

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

        with open("tests/configs/assessment_type_config.json", "r") as fr:
            self.assessment_type = json.load(fr)

        with open("tests/configs/assessment_type_config_update.json", "r") as fr:  # noqa: E501
            self.assessment_type_update = json.load(fr)

        self.assessment_type_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.assessment_type_id is not None:
            self.client.delete("/assessment_type/{}".format(self.assessment_type_id),  # noqa: E501
                               headers={"Authorization": API_KEY})

    def test_create_assessment_type(self):
        """Test creating an assessment type"""
        # Use unique name to avoid conflicts with existing data
        unique_name = f"Test_{uuid.uuid4().hex[:8]}"
        test_data = {
            "type_name": unique_name,
            "description": self.assessment_type.get(
                "description", "Test assessment type")
        }
        response = self.client.post('/assessment_type',
                                    headers={"Authorization": API_KEY},
                                    json=test_data)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Error response: {res_answer}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["assessment_type"])
        self.assessment_type_id = res_answer["assessment_type"]["_id"]

    def test_create_assessment_type_missing(self):
        """Test creating assessment type with missing required fields"""
        incomplete_data = {}
        response = self.client.post('/assessment_type',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "No data provided")
        self.assessment_type_id = None

    def test_get_assessment_type(self):
        """Test getting a specific assessment type"""
        # Create assessment type first with unique name
        unique_name = f"Test_{uuid.uuid4().hex[:8]}"
        test_data = {
            "type_name": unique_name,
            "description": self.assessment_type.get(
                "description", "Test assessment type")
        }
        response = self.client.post('/assessment_type',
                                    headers={"Authorization": API_KEY},
                                    json=test_data)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assessment_type_id = res_answer["assessment_type"]["_id"]

        # Get the assessment type
        response = self.client.get("/assessment_type/{}".format(self.assessment_type_id),  # noqa: E501
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(
            res_answer["assessment_type"]["type_name"], unique_name)

    def test_get_assessment_type_missing(self):
        """Test getting a non-existent assessment type"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/assessment_type/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Assessment type not found")
        self.assessment_type_id = None

    def test_get_all_assessment_types(self):
        """Test getting all assessment types"""
        response = self.client.get("/assessment_type",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("assessment_types", res_answer)
        self.assertIsInstance(res_answer["assessment_types"], list)

    def test_put_assessment_type(self):
        """Test updating an assessment type"""
        # Create assessment type first with unique name
        unique_name = f"Test_{uuid.uuid4().hex[:8]}"
        test_data = {
            "type_name": unique_name,
            "description": self.assessment_type.get(
                "description", "Test assessment type")
        }
        response = self.client.post('/assessment_type',
                                    headers={"Authorization": API_KEY},
                                    json=test_data)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assessment_type_id = res_answer["assessment_type"]["_id"]

        # Update assessment type with unique name to avoid conflicts
        unique_update_name = f"Quiz_{uuid.uuid4().hex[:8]}"
        update_data = {
            "_id": self.assessment_type_id,
            "type_name": unique_update_name,
            "description": self.assessment_type_update.get(
                "description", "Updated assessment type")
        }
        response = self.client.put("/assessment_type",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)

        if response.status_code != 200:
            res_answer = json.loads(response.get_data())
            print(f"Error response: {res_answer}")
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(
            res_answer["assessment_type"]["type_name"], unique_update_name)

    def test_put_assessment_type_wrong(self):
        """Test updating a non-existent assessment type"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            **self.assessment_type_update
        }
        response = self.client.put("/assessment_type",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Assessment type not found")
        self.assessment_type_id = None

    def test_delete_assessment_type(self):
        """Test deleting an assessment type"""
        # Create assessment type first with unique name
        # Use timestamp + UUID for maximum uniqueness
        unique_name = f"Test_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"
        test_data = {
            "type_name": unique_name,
            "description": self.assessment_type.get(
                "description", "Test assessment type")
        }
        response = self.client.post('/assessment_type',
                                    headers={"Authorization": API_KEY},
                                    json=test_data)

        if response.status_code != 201:
            res_answer = json.loads(response.get_data())
            print(f"Error response: {res_answer}")
            print(f"Request data: {test_data}")
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assessment_type_id = res_answer["assessment_type"]["_id"]

        # Delete assessment type
        response = self.client.delete("/assessment_type/{}".format(self.assessment_type_id),  # noqa: E501
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "Assessment type deleted successfully")  # noqa: E501
        self.assessment_type_id = None  # Already deleted

    def test_delete_assessment_type_wrong(self):
        """Test deleting a non-existent assessment type"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/assessment_type/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Assessment type not found")  # noqa: E501
        self.assessment_type_id = None


if __name__ == '__main__':
    unittest.main()
