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


class TestDepartment(unittest.TestCase):

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

        with open("tests/configs/department_config.json", "r") as fr:
            self.department = json.load(fr)
        
        with open("tests/configs/department_config_update.json", "r") as fr:
            self.department_update = json.load(fr)

        self.department_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.department_id is not None:
            self.client.delete("/department/{}".format(self.department_id),
                               headers={"Authorization": API_KEY})

    def test_create_department(self):
        """Test creating a department"""
        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.department_id = res_answer["message"]["_id"]

    def test_create_department_missing(self):
        """Test creating department with missing required fields"""
        incomplete_data = {}
        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=incomplete_data)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.department_id = None

    def test_get_department(self):
        """Test getting a specific department"""
        # Create department first
        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        # Get the department
        response = self.client.get("/department/{}".format(self.department_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["department_name"], "ciências")

    def test_get_department_missing(self):
        """Test getting a non-existent department"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/department/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Department not found")
        self.department_id = None

    def test_get_all_departments(self):
        """Test getting all departments"""
        response = self.client.get("/department",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_put_department(self):
        """Test updating a department"""
        # Create department first
        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        # Update department
        update_data = {
            "_id": self.department_id,
            **self.department_update
        }
        response = self.client.put("/department",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["department_name"], "Ciências Exatas")

    def test_put_department_wrong(self):
        """Test updating a non-existent department"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            **self.department_update
        }
        response = self.client.put("/department",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Department not found")
        self.department_id = None

    def test_delete_department(self):
        """Test deleting a department"""
        # Create department first
        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        # Delete department
        response = self.client.delete("/department/{}".format(self.department_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "Department record deleted")
        self.department_id = None  # Already deleted

    def test_delete_department_wrong(self):
        """Test deleting a non-existent department"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/department/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Department not found")
        self.department_id = None


if __name__ == '__main__':
    unittest.main()

