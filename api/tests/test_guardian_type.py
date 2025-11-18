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


class TestGuardianType(unittest.TestCase):

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

        self.guardian_type = {
            "guardian_type_name": "Parent"
        }

        self.guardian_type_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.guardian_type_id is not None:
            self.client.delete("/guardian/types/{}".format(self.guardian_type_id),   # noqa: E501
                               headers={"Authorization": API_KEY})

    def test_create_guardian_type(self):
        """Test creating a guardian type"""
        response = self.client.post('/guardian/types',
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian_type)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.guardian_type_id = res_answer["message"]["_id"]

    def test_create_guardian_type_missing(self):
        """Test creating guardian type with missing required fields"""
        incomplete_data = {}
        response = self.client.post('/guardian/types',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.guardian_type_id = None

    def test_get_guardian_type(self):
        """Test getting a specific guardian type"""
        # Create first
        response = self.client.post('/guardian/types',
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian_type)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.guardian_type_id = res_answer["message"]["_id"]

        # Get the guardian type
        response = self.client.get("/guardian/types/{}".format(self.guardian_type_id),   # noqa: E501
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])

    def test_get_all_guardian_types(self):
        """Test getting all guardian types"""
        response = self.client.get("/guardian/types",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)


if __name__ == '__main__':
    unittest.main()
