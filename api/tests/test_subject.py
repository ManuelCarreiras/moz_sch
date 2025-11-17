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


class TestSubject(unittest.TestCase):

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

        # Create a department first (required for subject)
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
            self.subject = json.load(fr)
            if self.department_id:
                self.subject["department_id"] = self.department_id
        
        with open("tests/configs/subject_config_missing.json", "r") as fr:
            self.subject_missing = json.load(fr)
        
        with open("tests/configs/subject_config_update.json", "r") as fr:
            self.subject_update = json.load(fr)

        self.subject_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.subject_id is not None:
            self.client.delete("/subject/{}".format(self.subject_id),
                               headers={"Authorization": API_KEY})
        
        if self.department_id is not None:
            self.client.delete("/department/{}".format(self.department_id),
                               headers={"Authorization": API_KEY})

    def test_create_subject(self):
        """Test creating a subject"""
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.subject_id = res_answer["message"]["_id"]

    def test_create_subject_missing(self):
        """Test creating subject with missing required fields"""
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.subject_id = None

    def test_create_subject_invalid_department(self):
        """Test creating subject with invalid department_id"""
        invalid_subject = self.subject.copy()
        invalid_subject["department_id"] = str(uuid.uuid4())
        
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_subject)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.subject_id = None

    def test_get_subject(self):
        """Test getting a specific subject"""
        # Create subject first
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        # Get the subject
        response = self.client.get("/subject/{}".format(self.subject_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["subject_name"], "matemática")

    def test_get_subject_missing(self):
        """Test getting a non-existent subject"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/subject/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Subject not found")
        self.subject_id = None

    def test_get_all_subjects(self):
        """Test getting all subjects"""
        response = self.client.get("/subject",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_put_subject(self):
        """Test updating a subject"""
        # Create subject first
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        # Update subject
        update_data = {
            "_id": self.subject_id,
            **self.subject_update
        }
        response = self.client.put("/subject",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["subject_name"], "Matemática Avançada")

    def test_put_subject_wrong(self):
        """Test updating a non-existent subject"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            **self.subject_update
        }
        response = self.client.put("/subject",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Subject does not exist")
        self.subject_id = None

    def test_delete_subject(self):
        """Test deleting a subject"""
        # Create subject first
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        # Delete subject
        response = self.client.delete("/subject/{}".format(self.subject_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "Subject record deleted")
        self.subject_id = None  # Already deleted

    def test_delete_subject_wrong(self):
        """Test deleting a non-existent subject"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/subject/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Subject does not exist")
        self.subject_id = None


if __name__ == '__main__':
    unittest.main()

