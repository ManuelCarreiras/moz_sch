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


class TestSchool_Year(unittest.TestCase):

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

        with open("tests/configs/school_year_config.json",
                  "r") as fr:
            self.school_year = json.load(fr)
        with open("tests/configs/school_year_config_missing.json",
                  "r") as fr:
            self.school_year_missing = json.load(fr)
        with open("tests/configs/school_year_config_update.json",
                  "r") as fr:
            self.school_year_update = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.school_year_id is not None:
            self.client.delete("/school_year/{}".format(self.school_year_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_school_year(self):

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["year_name"],
                         "2026")
        self.school_year_id = res_answer["message"]["_id"]

    def test_create_school_year_missing(self):

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required fields")
        self.school_year_id = None

    def test_get_school_year(self):
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.get("/school_year/{}".format(
                                   self.school_year_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["year_name"],
                         "2026")

    def test_get_school_year_missing(self):
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/school_year/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "School Year not found")

    def test_put_school_year(self):
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        self.school_year_update['_id'] = self.school_year_id
        response = self.client.put("/school_year",
                                   headers={"Authorization": API_KEY},
                                   json=self.school_year_update)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["year_name"],
                         "2026_")

    def test_put_school_year_wrong(self):
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        self.school_year_update['_id'] = str(uuid.uuid4())
        response = self.client.put("/school_year",
                                   headers={"Authorization": API_KEY},
                                   json=self.school_year_update)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "School year not found")

    def test_delete_school_year(self):
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]
        response = self.client.delete("/school_year/{}".format(
                                      self.school_year_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.school_year)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "School year record deleted")

    def test_delete_school_year_wrong(self):
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/school_year/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.school_year)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "School year not found")
