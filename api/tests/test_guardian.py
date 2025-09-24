import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestGuardian(unittest.TestCase):

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

        with open("tests/configs/guardian_config.json",
                  "r") as fr:
            self.guardian = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.guardian_id is not None:
            self.client.delete("/guardian/{}".format(self.guardian_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_guardian(self):
        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["message"]["given_name"], "John")
        self.guardian_id = response.json["_id"]

    def test_create_guardian_missing(self):
        self.guardian.pop("given_name")
        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian)
        self.assertEqual(response.status_code, 400)
        self.guardian_id = None

    def test_get_guardian(self):
        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian)
        self.assertEqual(response.status_code, 201)
        self.guardian_id = response.json["_id"]

        response = self.client.get("/guardian/{}".format(self.guardian_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"]["given_name"], "John")
        self.guardian_id = response.json["_id"]

    def test_get_guardian_missing(self):
        self.guardian_id = None
        response = self.client.get("/guardian/{}".format(self.guardian_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json["message"], "Guardian not found")

    def test_put_guardian(self):
        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian)
        self.assertEqual(response.status_code, 201)
        self.guardian_id = response.json["_id"]

        self.guardian["given_name"] = "Jane"
        response = self.client.put("/guardian/{}".format(self.guardian_id),
                                   headers={"Authorization": API_KEY},
                                   json=self.guardian)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"]["given_name"], "Jane")

    def test_put_guardian_wrong(self):
        response = self.client.put("/guardian/{}".format(self.guardian_id),
                                   headers={"Authorization": API_KEY},
                                   json=self.guardian)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json["message"], "Guardian not found")
        self.guardian_id = None

    def test_delete_guardian(self):
        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian)
        self.assertEqual(response.status_code, 201)
        self.guardian_id = response.json["_id"]
        response = self.client.delete("/guardian/{}".format(self.guardian_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "Guardian record deleted")
        self.guardian_id = response.json["_id"]

    def test_delete_guardian_wrong(self):
        response = self.client.delete("/guardian/{}".format(self.guardian_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json["message"], "Guardian not found")
        self.guardian_id = None
