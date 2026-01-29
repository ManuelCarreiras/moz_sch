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


class TestStaff(unittest.TestCase):

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

        with open("tests/configs/staff_config.json", "r") as fr:
            self.staff = json.load(fr)
        with open("tests/configs/staff_config_missing.json", "r") as fr:
            self.staff_missing = json.load(fr)
        with open("tests/configs/staff_config_update.json", "r") as fr:
            self.staff_update = json.load(fr)

        self.staff_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        # Delete entries from postgres
        if self.staff_id is not None:
            self.client.delete("/staff/{}".format(self.staff_id),
                               headers={"Authorization": API_KEY})

    def test_create_staff(self):
        """Test creating a staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["given_name"], "Maria")
        self.assertEqual(res_answer["message"]["role"], "financial")
        self.staff_id = res_answer["message"]["_id"]

    def test_create_staff_missing(self):
        """Test creating staff with missing required fields"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required fields")
        self.staff_id = None

    def test_create_staff_invalid_role(self):
        """Test creating staff with invalid role"""
        invalid_staff = self.staff.copy()
        invalid_staff["role"] = "invalid_role"
        invalid_staff["email_address"] = "invalid.role@test.mz"

        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_staff)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("Invalid role", res_answer["message"])
        self.staff_id = None

    def test_create_staff_secretary(self):
        """Test creating a secretary staff member"""
        secretary_staff = self.staff.copy()
        secretary_staff["role"] = "secretary"
        secretary_staff["email_address"] = "secretary@test.mz"

        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=secretary_staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["role"], "secretary")
        self.staff_id = res_answer["message"]["_id"]

    def test_get_staff(self):
        """Test getting a specific staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        response = self.client.get("/staff/{}".format(self.staff_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"], "Maria")

    def test_get_staff_missing(self):
        """Test getting a non-existent staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/staff/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Staff member not found")

    def test_get_all_staff(self):
        """Test getting all staff members"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        response = self.client.get("/staff",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("message", res_answer)
        self.assertIsInstance(res_answer["message"], list)

    def test_get_staff_by_role(self):
        """Test getting staff filtered by role"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        response = self.client.get("/staff?role=financial",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("message", res_answer)
        # All returned staff should be financial role
        for staff in res_answer["message"]:
            self.assertEqual(staff["role"], "financial")

    def test_put_staff(self):
        """Test updating a staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        self.staff_update['_id'] = self.staff_id
        response = self.client.put("/staff",
                                   headers={"Authorization": API_KEY},
                                   json=self.staff_update)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"], "Ana")

    def test_put_staff_wrong(self):
        """Test updating a non-existent staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        self.staff_update['_id'] = str(uuid.uuid4())
        response = self.client.put("/staff",
                                   headers={"Authorization": API_KEY},
                                   json=self.staff_update)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Staff member not found")

    def test_put_staff_invalid_role(self):
        """Test updating staff with invalid role"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        update_data = {
            "_id": self.staff_id,
            "role": "invalid_role"
        }
        response = self.client.put("/staff",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("Invalid role", res_answer["message"])

    def test_delete_staff(self):
        """Test deleting a staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        response = self.client.delete("/staff/{}".format(self.staff_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Staff member deleted")
        self.staff_id = None  # Already deleted

    def test_delete_staff_wrong(self):
        """Test deleting a non-existent staff member"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/staff/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Staff member not found")

    def test_update_staff_base_salary(self):
        """Test updating staff base_salary field"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        # Update with base_salary
        update_data = {
            "_id": self.staff_id,
            "base_salary": 1800.00
        }
        response = self.client.put("/staff",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["base_salary"], 1800.00)

    def test_duplicate_email(self):
        """Test creating staff with duplicate email"""
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.staff_id = res_answer["message"]["_id"]

        # Try to create another staff with same email
        response = self.client.post('/staff',
                                    headers={"Authorization": API_KEY},
                                    json=self.staff)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("already exists", res_answer["message"].lower())


if __name__ == '__main__':
    unittest.main()
