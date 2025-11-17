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


class TestTeacher(unittest.TestCase):

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

        with open("tests/configs/teacher_config.json",
                  "r") as fr:
            self.teacher = json.load(fr)
        with open("tests/configs/teacher_config_missing.json",
                  "r") as fr:
            self.teacher_missing = json.load(fr)
        with open("tests/configs/teacher_config_update.json",
                  "r") as fr:
            self.teacher_update = json.load(fr)
        
        self.teacher_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.teacher_id is not None:
            self.client.delete("/teacher/{}".format(self.teacher_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_teacher(self):

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["given_name"],
                         "Venâncio")
        self.teacher_id = res_answer["message"]["_id"]

    def test_creat_teacher_missing(self):

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required fields")
        self.teacher_id = None

    def test_get_teacher(self):
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.get("/teacher/{}".format(self.teacher_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"],
                         "Venâncio")

    def test_get_teacher_missing(self):
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/teacher/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Professor not found")

    def test_put_teacher(self):
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        self.teacher_update['_id'] = self.teacher_id
        response = self.client.put("/teacher",
                                   headers={"Authorization": API_KEY},
                                   json=self.teacher_update)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"],
                         "Manuel")

    def test_put_teacher_wrong(self):
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        self.teacher_update['_id'] = str(uuid.uuid4())
        response = self.client.put("/teacher",
                                   headers={"Authorization": API_KEY},
                                   json=self.teacher_update)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Professor not found")

    def test_delete_teacher(self):
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]
        response = self.client.delete("/teacher/{}".format(self.teacher_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.teacher)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Professor deleted")

    def test_delete_teacher_wrong(self):
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/teacher/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.teacher)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Professor not found")

    def test_update_teacher_base_salary(self):
        """Test updating teacher base_salary field"""
        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        # Update with base_salary
        update_data = {
            "_id": self.teacher_id,
            "base_salary": 2500.00
        }
        response = self.client.put("/teacher",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["base_salary"], 2500.00)
