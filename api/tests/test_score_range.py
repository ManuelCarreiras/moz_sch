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


class TestScore_Range(unittest.TestCase):

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

        with open("tests/configs/score_range_config.json",
                  "r") as fr:
            self.score_range = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.score_range_id is not None:
            self.client.delete("/score_range/{}".format(self.score_range_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_score_range(self):

        response = self.client.post('/score_range',
                                    headers={"Authorization": API_KEY},
                                    json=self.score_range)

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["max_score"],
                         20.00)
        self.score_range_id = res_answer["message"]["_id"]

    def test_create_score_range_missing(self):
        self.score_range.pop('max_score')
        response = self.client.post('/score_range',
                                    headers={"Authorization": API_KEY},
                                    json=self.score_range)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required field")
        self.score_range_id = None

    def test_get_score_range(self):
        response = self.client.post('/score_range',
                                    headers={"Authorization": API_KEY},
                                    json=self.score_range)

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.score_range_id = res_answer["message"]["_id"]

        response = self.client.get("/score_range/{}".format(
                                   self.score_range_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["max_score"],
                         20.00)

    def test_get_score_range_missing(self):

        self.score_range_id = None

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/score_range/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Score range not found")

    def test_put_score_range(self):
        response = self.client.post('/score_range',
                                    headers={"Authorization": API_KEY},
                                    json=self.score_range)

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.score_range_id = res_answer["message"]["_id"]

        self.score_range['grade'] = '2nd grade'
        self.score_range['_id'] = self.score_range_id

        response = self.client.put("/score_range",
                                   headers={"Authorization": API_KEY},
                                   json=self.score_range)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["grade"],
                         '2nd grade')

    def test_put_score_range_wrong(self):

        wrong_id = str(uuid.uuid4())
        self.score_range['_id'] = wrong_id
        response = self.client.put("/score_range",
                                   headers={"Authorization": API_KEY},
                                   json=self.score_range)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Score range does not exist")
        self.score_range_id = None

    def test_delete_score_range(self):
        response = self.client.post('/score_range',
                                    headers={"Authorization": API_KEY},
                                    json=self.score_range)

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.score_range_id = res_answer["message"]["_id"]
        response = self.client.delete("/score_range/{}".format(
                                      self.score_range_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Score range record deleted")

    def test_delete_score_range_wrong(self):
        response = self.client.post('/score_range',
                                    headers={"Authorization": API_KEY},
                                    json=self.score_range)

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.score_range_id = res_answer["message"]["_id"]

        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/score_range/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.score_range)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Score range not found")
