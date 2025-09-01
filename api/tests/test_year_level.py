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


class TestYear_level(unittest.TestCase):

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

        with open("tests/configs/year_level_config.json",
                  "r") as fr:
            self.year_level = json.load(fr)
        with open("tests/configs/year_level_config_missing.json",
                  "r") as fr:
            self.year_level_missing = json.load(fr)
        with open("tests/configs/year_level_config_update.json",
                  "r") as fr:
            self.year_level_update = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.year_level_id is not None:
            self.client.delete("/year_level/{}".format(self.year_level_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_year_level(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["level_name"],
                         "level_1")
        self.year_level_id = res_answer["message"]["_id"]

    def test_create_year_level_missing(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required fields")
        self.year_level_id = None

    def test_get_year_level(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.get("/year_level/{}".format(
                                   self.year_level_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["level_name"],
                         "level_1")

    def test_get_year_level_missing(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/year_level/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Year level not found")

        self.year_level_id = None

    def test_put_year_level(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        self.year_level_update['_id'] = self.year_level_id
        response = self.client.put("/year_level",
                                   headers={"Authorization": API_KEY},
                                   json=self.year_level_update)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["level_name"],
                         "level_2")

    def test_put_year_level_wrong(self):

        self.year_level_update['_id'] = str(uuid.uuid4())
        response = self.client.put("/year_level",
                                   headers={"Authorization": API_KEY},
                                   json=self.year_level_update)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Year level not found")

        self.year_level_id = None

    def test_put_year_level_no_id(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.put("/year_level",
                                   headers={"Authorization": API_KEY},
                                   json=self.year_level_update)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Year level not found")

    def test_delete_year_level(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]
        response = self.client.delete("/year_level/{}".format(
                                      self.year_level_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.year_level)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Year level record deleted")

    def test_delete_year_level_wrong(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/year_level/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.year_level)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Year level not found")
        self.year_level_id = None
