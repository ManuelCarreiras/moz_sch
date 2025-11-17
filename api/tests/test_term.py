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


class TestTerm(unittest.TestCase):

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

        # Create a school year first (required for term)
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

        with open("tests/configs/term_config.json", "r") as fr:
            self.term = json.load(fr)
            if self.year_id:
                self.term["year_id"] = self.year_id
        
        with open("tests/configs/term_config_missing.json", "r") as fr:
            self.term_missing = json.load(fr)
        
        with open("tests/configs/term_config_update.json", "r") as fr:
            self.term_update = json.load(fr)

        self.term_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        if self.term_id is not None:
            self.client.delete("/term/{}".format(self.term_id),
                               headers={"Authorization": API_KEY})
        
        if self.year_id is not None:
            self.client.delete("/school_year/{}".format(self.year_id),
                               headers={"Authorization": API_KEY})

    def test_create_term(self):
        """Test creating a term"""
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("_id", res_answer["message"])
        self.term_id = res_answer["message"]["_id"]

    def test_create_term_missing(self):
        """Test creating term with missing required fields"""
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.term_id = None

    def test_create_term_invalid_year(self):
        """Test creating term with invalid year_id"""
        invalid_term = self.term.copy()
        invalid_term["year_id"] = str(uuid.uuid4())
        
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_term)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "School year not found")
        self.term_id = None

    def test_create_term_invalid_dates(self):
        """Test creating term with dates outside school year"""
        invalid_term = self.term.copy()
        invalid_term["start_date"] = "2025-01-01"  # Before school year
        invalid_term["end_date"] = "2025-12-31"
        
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_term)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertIn("within the school year", res_answer["message"])
        self.term_id = None

    def test_get_term(self):
        """Test getting a specific term"""
        # Create term first
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer["message"]["_id"]

        # Get the term
        response = self.client.get("/term/{}".format(self.term_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["term_number"], 1)

    def test_get_term_missing(self):
        """Test getting a non-existent term"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/term/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Term not found")
        self.term_id = None

    def test_get_all_terms(self):
        """Test getting all terms"""
        response = self.client.get("/term",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIsInstance(res_answer["message"], list)

    def test_put_term(self):
        """Test updating a term"""
        # Create term first
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer["message"]["_id"]

        # Update term
        update_data = {
            "_id": self.term_id,
            "year_id": self.year_id,
            **self.term_update
        }
        response = self.client.put("/term",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"]["term_number"], 2)

    def test_put_term_wrong(self):
        """Test updating a non-existent term"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            "year_id": self.year_id,
            **self.term_update
        }
        response = self.client.put("/term",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Term does not exist")
        self.term_id = None

    def test_delete_term(self):
        """Test deleting a term"""
        # Create term first
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer["message"]["_id"]

        # Delete term
        response = self.client.delete("/term/{}".format(self.term_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertEqual(res_answer["message"], "Term record deleted")
        self.term_id = None  # Already deleted

    def test_delete_term_wrong(self):
        """Test deleting a non-existent term"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/term/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Term does not exist")
        self.term_id = None


if __name__ == '__main__':
    unittest.main()

