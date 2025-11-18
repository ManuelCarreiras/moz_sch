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


class TestPeriod(unittest.TestCase):

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

        # Create a school year first (required for period)
        with open("tests/configs/school_year_config.json", "r") as fr:
            year_data = json.load(fr)

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=year_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.year_id = res_answer["message"]["_id"]
        else:
            self.year_id = None

        with open("tests/configs/period_config.json", "r") as fr:
            self.period = json.load(fr)
            if self.year_id:
                self.period["year_id"] = self.year_id

        with open("tests/configs/period_config_missing.json", "r") as fr:
            self.period_missing = json.load(fr)

        with open("tests/configs/period_config_update.json", "r") as fr:
            self.period_update = json.load(fr)

        self.period_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.period_id is not None:
            self.client.delete("/period/{}".format(self.period_id),
                               headers={"Authorization": API_KEY})

        if self.year_id is not None:
            self.client.delete("/school_year/{}".format(self.year_id),
                               headers={"Authorization": API_KEY})

    def test_create_period(self):
        """Test creating a period"""
        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.period_id = res_answer["message"]["_id"]

    def test_create_period_missing(self):
        """Test creating period with missing required fields"""
        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.period_id = None

    def test_create_period_invalid_year(self):
        """Test creating period with invalid year_id"""
        invalid_period = self.period.copy()
        invalid_period["year_id"] = str(uuid.uuid4())

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_period)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "School year not found")
        self.period_id = None

    def test_create_period_invalid_time(self):
        """Test creating period with invalid time format"""
        invalid_period = self.period.copy()
        invalid_period["start_time"] = "invalid"
        invalid_period["end_time"] = "invalid"

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_period)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertIn("Invalid time format", res_answer["message"])
        self.period_id = None

    def test_create_period_invalid_time_order(self):
        """Test creating period with start_time >= end_time"""
        invalid_period = self.period.copy()
        invalid_period["start_time"] = "10:00"
        invalid_period["end_time"] = "08:00"  # End before start

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_period)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertIn("Start time must be before end time", res_answer["message"])  # noqa: E501
        self.period_id = None

    def test_get_period(self):
        """Test getting a specific period"""
        # Create period first
        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer["message"]["_id"]

        # Get the period
        response = self.client.get("/period/{}".format(self.period_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["name"], "1st Period")

    def test_get_period_missing(self):
        """Test getting a non-existent period"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/period/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Period not found")
        self.period_id = None

    def test_get_all_periods(self):
        """Test getting all periods"""
        response = self.client.get("/period",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_put_period(self):
        """Test updating a period"""
        # Create period first
        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer["message"]["_id"]

        # Update period
        update_data = {
            "_id": self.period_id,
            "year_id": self.year_id,
            **self.period_update
        }
        response = self.client.put("/period",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["name"], "2nd Period")

    def test_put_period_wrong(self):
        """Test updating a non-existent period"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            "year_id": self.year_id,
            **self.period_update
        }
        response = self.client.put("/period",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "period does not exist")
        self.period_id = None

    def test_delete_period(self):
        """Test deleting a period"""
        # Create period first
        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer["message"]["_id"]

        # Delete period
        response = self.client.delete("/period/{}".format(self.period_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "Period record deleted")
        self.period_id = None  # Already deleted

    def test_delete_period_wrong(self):
        """Test deleting a non-existent period"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/period/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Period does not exist")
        self.period_id = None


if __name__ == '__main__':
    unittest.main()
