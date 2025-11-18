import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
import uuid
import time

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

        # Initialize guardian_id to None
        self.guardian_id = None

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
        # Use unique email and phone to avoid conflicts
        # Phone number must be <= 10 characters (DB constraint)
        unique_email = f"john.doe.{int(time.time() * 1000)}.{uuid.uuid4().hex[:8]}@example.com"  # noqa: E501
        unique_phone = uuid.uuid4().hex[:10]  # 10 chars max
        test_guardian = self.guardian.copy()
        test_guardian["email_address"] = unique_email
        test_guardian["phone_number"] = unique_phone

        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=test_guardian)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"], "John")
        self.guardian_id = res_answer["message"]["_id"]

    def test_create_guardian_missing(self):
        self.guardian.pop("given_name")
        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=self.guardian)
        self.assertEqual(response.status_code, 400)
        self.guardian_id = None

    def test_get_guardian(self):
        # Use unique email and phone to avoid conflicts
        # Phone number must be <= 10 characters (DB constraint)
        unique_email = f"john.doe.{int(time.time() * 1000)}.{uuid.uuid4().hex[:8]}@example.com"  # noqa: E501
        unique_phone = uuid.uuid4().hex[:10]  # 10 chars max
        test_guardian = self.guardian.copy()
        test_guardian["email_address"] = unique_email
        test_guardian["phone_number"] = unique_phone

        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=test_guardian)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.guardian_id = res_answer["message"]["_id"]

        response = self.client.get("/guardian/{}".format(self.guardian_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"], "John")
        self.guardian_id = res_answer["message"]["_id"]

    def test_get_guardian_missing(self):
        # Use a non-existent UUID instead of None
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/guardian/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Guardian not found")
        self.guardian_id = None

    def test_put_guardian(self):
        # Use unique email and phone to avoid conflicts
        # Phone number must be <= 10 characters (DB constraint)
        unique_email = f"john.doe.{int(time.time() * 1000)}.{uuid.uuid4().hex[:8]}@example.com"  # noqa: E501
        unique_phone = uuid.uuid4().hex[:10]  # 10 chars max
        test_guardian = self.guardian.copy()
        test_guardian["email_address"] = unique_email
        test_guardian["phone_number"] = unique_phone

        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=test_guardian)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.guardian_id = res_answer["message"]["_id"]

        test_guardian["given_name"] = "Jane"
        test_guardian["_id"] = self.guardian_id
        response = self.client.put("/guardian",
                                   headers={"Authorization": API_KEY},
                                   json=test_guardian)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["given_name"], "Jane")

    def test_put_guardian_wrong(self):
        # Use a non-existent UUID instead of None
        wrong_id = str(uuid.uuid4())
        test_guardian = self.guardian.copy()
        test_guardian["_id"] = wrong_id
        response = self.client.put("/guardian",
                                   headers={"Authorization": API_KEY},
                                   json=test_guardian)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Guardian not found")
        self.guardian_id = None

    def test_delete_guardian(self):
        # Use unique email and phone to avoid conflicts
        # Phone number must be <= 10 characters (DB constraint)
        unique_email = f"john.doe.{int(time.time() * 1000)}.{uuid.uuid4().hex[:8]}@example.com"  # noqa: E501
        unique_phone = uuid.uuid4().hex[:10]  # 10 chars max
        test_guardian = self.guardian.copy()
        test_guardian["email_address"] = unique_email
        test_guardian["phone_number"] = unique_phone

        response = self.client.post("/guardian",
                                    headers={"Authorization": API_KEY},
                                    json=test_guardian)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.guardian_id = res_answer["message"]["_id"]
        response = self.client.delete("/guardian/{}".format(self.guardian_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Guardian record deleted")
        # After deletion, set guardian_id to None since it's deleted
        self.guardian_id = None

    def test_delete_guardian_wrong(self):
        # Use a non-existent UUID instead of None
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/guardian/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Guardian not found")
        self.guardian_id = None
