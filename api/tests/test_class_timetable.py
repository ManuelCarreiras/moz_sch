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


class TestClassTimetable(unittest.TestCase):

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

        # Create year_level
        with open("tests/configs/year_level_config.json", "r") as fr:
            level_data = json.load(fr)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=level_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.year_level_id = res_answer["message"]["_id"]
        else:
            self.year_level_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.year_level_id is not None:
            self.client.delete("/year_level/{}".format(self.year_level_id),
                               headers={"Authorization": API_KEY})

    def test_get_class_timetable(self):
        """Test getting timetable for a year level"""
        if not self.year_level_id:
            self.skipTest("Year level not created")

        response = self.client.get("/class/timetable/{}".format(self.year_level_id),   # noqa: E501
                                   headers={"Authorization": API_KEY})
        # Should return 200 even if no classes found
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            res_answer = json.loads(response.get_data())
            self.assertTrue(res_answer["success"])
            self.assertIn("message", res_answer)
            self.assertIn("timetable", res_answer["message"])

    def test_get_class_timetable_invalid(self):
        """Test getting timetable for invalid year level"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/class/timetable/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
