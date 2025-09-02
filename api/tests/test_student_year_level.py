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


class TestStudent_year_level(unittest.TestCase):

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

        with open("tests/configs/student_year_level_config.json",
                  "r") as fr:
            self.student_year_level = json.load(fr)
        with open("tests/configs/year_level_config.json",
                  "r") as fr:
            self.year_level = json.load(fr)
        with open("tests/configs/student_config.json",
                  "r") as fr:
            self.student = json.load(fr)
        with open("tests/configs/school_year_config.json",
                  "r") as fr:
            self.school_year = json.load(fr)
        with open("tests/configs/student_year_level_config_missing.json",
                  "r") as fr:
            self.student_year_level_missing = json.load(fr)
        with open("tests/configs/student_year_level_config_update.json",
                  "r") as fr:
            self.student_year_level_update = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """

        # Delete entries from postgres
        if self.student_year_level_id is not None:
            self.client.delete("/student_year_level/student/{}".format(
                               self.student_id),
                               headers={"Authorization": API_KEY})
        if self.student_id is not None:
            self.client.delete("/student/{}".format(
                               self.student_id),
                               headers={"Authorization": API_KEY})
        if self.year_level_id is not None:
            self.client.delete("/year_level/{}".format(
                               self.year_level_id),
                               headers={"Authorization": API_KEY})
        if self.school_year_id is not None:
            self.client.delete("/school_year/{}".format(
                               self.school_year_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_student_year_level(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["message"])
        self.assertEqual(res_answer["message"]["score"], 19.8)
        self.student_year_level_id = res_answer["message"]["_id"]

    def test_create_student_year_level_missing_id(self):

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student does not exists")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None

    def test_create_student_missing_score(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level_missing['student_id'] = self.student_id
        self.student_year_level_missing['year_id'] = self.school_year_id
        self.student_year_level_missing['level_id'] = self.year_level_id
        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level_missing)
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Missing required field")

        self.student_year_level_id = None

    def test_get_student_year_level_by_level_id(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.get('/student_year_level/level/{}'.format(
                                   self.year_level_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["_id"],
                         self.student_year_level_id)
        self.assertEqual(res_answer["message"]["score"], 19.8)

    def test_get_student_year_level_by_level_id_wrong(self):
        wrong_id = uuid.uuid4()
        response = self.client.get('/student_year_level/level/{}'.format(
                                   wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student Year level not found")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None

    def test_get_student_year_level_by_student_id(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.get('/student_year_level/student/{}'.format(
                                   self.student_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["_id"],
                         self.student_year_level_id)
        self.assertEqual(res_answer["message"]["score"], 19.8)

    def test_get_student_year_level_by_student_id_wrong(self):
        wrong_id = uuid.uuid4()
        response = self.client.get('/student_year_level/student/{}'.format(
                                   wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student Year level not found")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None

    def test_get_student_year_level_by_year_id(self):

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.get('/student_year_level/year/{}'.format(
                                   self.school_year_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["_id"],
                         self.student_year_level_id)
        self.assertEqual(res_answer["message"]["score"], 19.8)

    def test_get_student_year_level_by_year_id_wrong(self):
        wrong_id = uuid.uuid4()
        response = self.client.get('/student_year_level/year/{}'.format(
                                   wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student Year level not found")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None

    def test_update_student_year_level(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.put('/student_year_level',
                                   headers={"Authorization": API_KEY},
                                   json=self.student_year_level)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["score"], 19.8)

    def test_update_student_year_level_wrong(self):
        wrong_id = uuid.uuid4()
        self.student_year_level['student_id'] = wrong_id
        response = self.client.put('/student_year_level',
                                   headers={"Authorization": API_KEY},
                                   json=self.student_year_level)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student year level not found")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None

    def test_delete_student_year_level_by_level_id(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.delete('/student_year_level/level/{}'.format(
                                      self.year_level_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student year level record deleted")

    def test_delete_student_year_level_by_level_id_wrong(self):
        wrong_id = uuid.uuid4()
        response = self.client.delete('/student_year_level/level/{}'.format(
                                      wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student year level not found")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None
        
    def test_delete_student_year_level_by_student_id(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.delete('/student_year_level/student/{}'.format(
                                      self.student_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student year level record deleted")

    def test_delete_student_year_level_by_student_id_wrong(self):
        wrong_id = uuid.uuid4()
        response = self.client.delete('/student_year_level/student/{}'.format(
                                      wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student year level not found")

        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None

    def test_delete_student_year_level_by_year_id(self):
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer["message"]["_id"]

        response = self.client.post('/student',
                                    headers={"Authorization": API_KEY},
                                    json=self.student)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_id = res_answer["message"]["_id"]

        self.student_year_level['student_id'] = self.student_id
        self.student_year_level['year_id'] = self.school_year_id
        self.student_year_level['level_id'] = self.year_level_id

        response = self.client.post('/student_year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.student_year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.student_year_level_id = res_answer["message"]["_id"]

        response = self.client.delete('/student_year_level/year/{}'.format(
                                      self.year_level_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Student year level record deleted")

    def test_delete_student_year_level_by_year_id_wrong(self):
        wrong_id = uuid.uuid4()
        response = self.client.delete('/student_year_level/year/{}'.format(
                                      wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Student year level not found")
        
        self.student_year_level_id = None
        self.student_id = None
        self.year_level_id = None
        self.school_year_id = None