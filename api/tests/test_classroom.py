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


class TestClassroom(unittest.TestCase):

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

        # Create a classroom type first (required for classroom)
        with open("tests/configs/classroom_types_config.json", "r") as fr:
            type_data = json.load(fr)
        
        response = self.client.post('/classroom_types',
                                   headers={"Authorization": API_KEY},
                                   json=type_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.classroom_type_id = res_answer["message"]["_id"]
        else:
            self.classroom_type_id = None

        with open("tests/configs/classroom_config.json", "r") as fr:
            self.classroom = json.load(fr)
            if self.classroom_type_id:
                self.classroom["room_type"] = self.classroom_type_id
        
        with open("tests/configs/classroom_config_missing.json", "r") as fr:
            self.classroom_missing = json.load(fr)
        
        with open("tests/configs/classroom_config_update.json", "r") as fr:
            self.classroom_update = json.load(fr)

        self.classroom_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.classroom_id is not None:
            self.client.delete("/classroom/{}".format(self.classroom_id),
                               headers={"Authorization": API_KEY})
        
        if self.classroom_type_id is not None:
            self.client.delete("/classroom_types/{}".format(self.classroom_type_id),
                               headers={"Authorization": API_KEY})

    def test_create_classroom(self):
        """Test creating a classroom"""
        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.classroom_id = res_answer["message"]["_id"]

    def test_create_classroom_missing(self):
        """Test creating classroom with missing required fields"""
        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.classroom_id = None

    def test_create_classroom_invalid_type(self):
        """Test creating classroom with invalid room_type"""
        invalid_classroom = self.classroom.copy()
        invalid_classroom["room_type"] = str(uuid.uuid4())
        
        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_classroom)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Classroom type does not exist in the database")
        self.classroom_id = None

    def test_get_classroom(self):
        """Test getting a specific classroom"""
        # Create classroom first
        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        # Get the classroom
        response = self.client.get("/classroom/{}".format(self.classroom_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["room_name"], "1")

    def test_get_classroom_missing(self):
        """Test getting a non-existent classroom"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/classroom/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Classroom not found")
        self.classroom_id = None

    def test_get_all_classrooms(self):
        """Test getting all classrooms"""
        response = self.client.get("/classroom",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_put_classroom(self):
        """Test updating a classroom"""
        # Create classroom first
        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        # Update classroom
        update_data = {
            "_id": self.classroom_id,
            "room_type": self.classroom_type_id,
            **self.classroom_update
        }
        response = self.client.put("/classroom",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["room_name"], "Room 2")

    def test_put_classroom_wrong(self):
        """Test updating a non-existent classroom"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            "room_type": self.classroom_type_id,
            **self.classroom_update
        }
        response = self.client.put("/classroom",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "classroom does not exist")
        self.classroom_id = None

    def test_delete_classroom(self):
        """Test deleting a classroom"""
        # Create classroom first
        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        # Delete classroom
        response = self.client.delete("/classroom/{}".format(self.classroom_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "Classroom record deleted")
        self.classroom_id = None  # Already deleted

    def test_delete_classroom_wrong(self):
        """Test deleting a non-existent classroom"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/classroom/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "classroom does not exist")
        self.classroom_id = None


if __name__ == '__main__':
    unittest.main()

