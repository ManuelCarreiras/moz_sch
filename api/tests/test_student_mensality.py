import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
import uuid
from datetime import date

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestStudentMensality(unittest.TestCase):

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

        # Create a student first (required for mensality)
        with open("tests/configs/student_config.json", "r") as fr:
            student_data = json.load(fr)
        
        response = self.client.post('/student',
                                   headers={"Authorization": API_KEY},
                                   json=student_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.student_id = res_answer["message"]["_id"]
        else:
            self.student_id = None

        with open("tests/configs/student_mensality_config.json", "r") as fr:
            self.mensality = json.load(fr)
            if self.student_id:
                self.mensality["student_id"] = self.student_id
        
        with open("tests/configs/student_mensality_config_missing.json", "r") as fr:
            self.mensality_missing = json.load(fr)
        
        with open("tests/configs/student_mensality_config_update.json", "r") as fr:
            self.mensality_update = json.load(fr)

        self.mensality_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        # Delete mensality entry
        if self.mensality_id is not None:
            self.client.delete("/mensality/{}".format(self.mensality_id),
                               headers={"Authorization": API_KEY})
        
        # Delete student entry
        if self.student_id is not None:
            self.client.delete("/student/{}".format(self.student_id),
                               headers={"Authorization": API_KEY})

    def test_create_mensality(self):
        """Test creating a mensality record"""
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["mensality"])
        self.assertEqual(res_answer["mensality"]["value"], 500.00)
        self.mensality_id = res_answer["mensality"]["_id"]

    def test_create_mensality_missing(self):
        """Test creating mensality with missing required fields"""
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("required", res_answer["message"].lower())
        self.mensality_id = None

    def test_create_mensality_invalid_student(self):
        """Test creating mensality with invalid student_id"""
        invalid_mensality = self.mensality.copy()
        invalid_mensality["student_id"] = str(uuid.uuid4())
        
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_mensality)

        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student not found")
        self.mensality_id = None

    def test_get_mensality(self):
        """Test getting a specific mensality record"""
        # Create mensality first
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.mensality_id = res_answer["mensality"]["_id"]

        # Get the mensality
        response = self.client.get("/mensality/{}".format(self.mensality_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["mensality"]["value"], 500.00)
        self.assertEqual(res_answer["mensality"]["month"], 2)
        self.assertEqual(res_answer["mensality"]["year"], 2026)

    def test_get_mensality_missing(self):
        """Test getting a non-existent mensality record"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/mensality/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Mensality record not found")
        self.mensality_id = None

    def test_get_mensality_with_filters(self):
        """Test getting mensality records with filters"""
        # Create mensality first
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.mensality_id = res_answer["mensality"]["_id"]

        # Get with student_id filter
        response = self.client.get("/mensality?student_id={}".format(self.student_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("mensality_records", res_answer)
        self.assertGreaterEqual(len(res_answer["mensality_records"]), 1)

        # Get with month and year filter
        response = self.client.get("/mensality?month=2&year=2026",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("mensality_records", res_answer)

        # Get with paid filter
        response = self.client.get("/mensality?paid=false",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("mensality_records", res_answer)

    def test_put_mensality(self):
        """Test updating a mensality record"""
        # Create mensality first
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.mensality_id = res_answer["mensality"]["_id"]

        # Update mensality
        update_data = {
            "_id": self.mensality_id,
            **self.mensality_update
        }
        response = self.client.put("/mensality",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["mensality"]["paid"], True)

    def test_put_mensality_wrong(self):
        """Test updating a non-existent mensality record"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            **self.mensality_update
        }
        response = self.client.put("/mensality",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Mensality record not found")
        self.mensality_id = None

    def test_delete_mensality(self):
        """Test deleting a mensality record"""
        # Create mensality first
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.mensality_id = res_answer["mensality"]["_id"]

        # Delete mensality
        response = self.client.delete("/mensality/{}".format(self.mensality_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Mensality record deleted successfully")
        self.mensality_id = None  # Already deleted

    def test_delete_mensality_wrong(self):
        """Test deleting a non-existent mensality record"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/mensality/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Mensality record not found")
        self.mensality_id = None

    def test_duplicate_mensality(self):
        """Test creating duplicate mensality for same student/month/year"""
        # Create first mensality
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.mensality_id = res_answer["mensality"]["_id"]

        # Try to create duplicate
        response = self.client.post('/mensality',
                                    headers={"Authorization": API_KEY},
                                    json=self.mensality)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("already exists", res_answer["message"].lower())


if __name__ == '__main__':
    unittest.main()

