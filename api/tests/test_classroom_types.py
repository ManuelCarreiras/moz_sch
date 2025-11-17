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


class TestClassroomTypes(unittest.TestCase):

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

        with open("tests/configs/classroom_types_config.json", "r") as fr:
            self.classroom_type = json.load(fr)
        
        with open("tests/configs/classroom_types_config_update.json", "r") as fr:
            self.classroom_type_update = json.load(fr)

        self.classroom_type_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.classroom_type_id is not None:
            self.client.delete("/classroom_types/{}".format(self.classroom_type_id),
                               headers={"Authorization": API_KEY})

    def test_create_classroom_type(self):
        """Test creating a classroom type"""
        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_type)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.classroom_type_id = res_answer["message"]["_id"]

    def test_create_classroom_type_missing(self):
        """Test creating classroom type with missing required fields"""
        incomplete_data = {}
        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.classroom_type_id = None

    def test_get_classroom_type(self):
        """Test getting a specific classroom type"""
        # Create classroom type first
        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_type)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_type_id = res_answer["message"]["_id"]

        # Get the classroom type
        response = self.client.get("/classroom_types/{}".format(self.classroom_type_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["name"], "class_name")

    def test_get_classroom_type_missing(self):
        """Test getting a non-existent classroom type"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/classroom_types/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Classroom type not found")
        self.classroom_type_id = None

    def test_get_all_classroom_types(self):
        """Test getting all classroom types"""
        response = self.client.get("/classroom_types",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_put_classroom_type(self):
        """Test updating a classroom type"""
        # Create classroom type first
        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_type)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_type_id = res_answer["message"]["_id"]

        # Update classroom type
        update_data = {
            "_id": self.classroom_type_id,
            **self.classroom_type_update
        }
        response = self.client.put("/classroom_types",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["name"], "Laboratory")

    def test_put_classroom_type_wrong(self):
        """Test updating a non-existent classroom type"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            **self.classroom_type_update
        }
        response = self.client.put("/classroom_types",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "classroom type does not exist")
        self.classroom_type_id = None

    def test_delete_classroom_type(self):
        """Test deleting a classroom type"""
        # Create classroom type first
        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_type)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_type_id = res_answer["message"]["_id"]

        # Delete classroom type
        response = self.client.delete("/classroom_types/{}".format(self.classroom_type_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "classroom type record deleted")
        self.classroom_type_id = None  # Already deleted

    def test_delete_classroom_type_wrong(self):
        """Test deleting a non-existent classroom type"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/classroom_types/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "classroom type record does not exist")
        self.classroom_type_id = None


if __name__ == '__main__':
    unittest.main()

