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


class TestClass(unittest.TestCase):

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

        with open("tests/configs/class_config.json",
                  "r") as fr:
            self.class_ = json.load(fr)

        with open("tests/configs/subject_config.json",
                  "r") as fr:
            self.subject = json.load(fr)

        with open("tests/configs/department_config.json",
                  "r") as fr:
            self.department = json.load(fr)

        with open("tests/configs/teacher_config.json",
                  "r") as fr:
            self.teacher = json.load(fr)
        with open("tests/configs/school_year_config.json",
                  "r") as fr:
            self.school_year = json.load(fr)
        with open("tests/configs/term_config.json",
                  "r") as fr:
            self.term = json.load(fr)
        with open("tests/configs/period_config.json",
                  "r") as fr:
            self.period = json.load(fr)
        with open("tests/configs/classroom_types_config.json",
                  "r") as fr:
            self.classroom_types = json.load(fr)
        with open("tests/configs/classroom_config.json",
                  "r") as fr:
            self.classroom = json.load(fr)

        # Initialize all ID attributes to None
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None
        self.year_level_id = None

        with open("tests/configs/year_level_config.json",
                  "r") as fr:
            self.year_level = json.load(fr)

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        # """
        # Delete entries from postgres
        if self.class_id is not None:
            self.client.delete("/class/{}".format(
                               self.class_id),
                               headers={"Authorization": API_KEY})
        if self.subject_id is not None:
            self.client.delete("/subject/{}".format(
                               self.subject_id),
                               headers={"Authorization": API_KEY})
        if self.department_id is not None:
            self.client.delete("/department/{}".format(
                               self.department_id),
                               headers={"Authorization": API_KEY})
        if self.teacher_id is not None:
            self.client.delete("/teacher/{}".format(
                               self.teacher_id),
                               headers={"Authorization": API_KEY})
        if self.term_id is not None:
            self.client.delete("/term/{}".format(
                               self.term_id),
                               headers={"Authorization": API_KEY})
        if self.period_id is not None:
            self.client.delete("/period/{}".format(
                               self.period_id),
                               headers={"Authorization": API_KEY})     
        if self.school_year_id is not None:
            self.client.delete("/school_year/{}".format(
                               self.school_year_id),
                               headers={"Authorization": API_KEY})
        if self.classroom_id is not None:
            self.client.delete("/classroom/{}".format(
                               self.classroom_id),
                               headers={"Authorization": API_KEY})
        if self.classroom_types_id is not None:
            self.client.delete("/classroom_types/{}".format(
                               self.classroom_types_id),
                               headers={"Authorization": API_KEY})
        if self.year_level_id is not None:
            self.client.delete("/year_level/{}".format(
                               self.year_level_id),
                               headers={"Authorization": API_KEY})
        else:
            pass

    def test_create_class(self):
        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        self.assertEqual(res_answer["message"]["class_name"], "class_test")

    def test_create_class_missing(self):

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json={})
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())

        self.assertIn("Missing required field", res_answer["message"])
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_create_class_fk_id_missing(self):
        # First create required dependencies
        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        # Now test with wrong IDs
        wrong_id = str(uuid.uuid4())
        self.class_['subject_id'] = wrong_id
        self.class_['teacher_id'] = wrong_id
        self.class_['classroom_id'] = wrong_id
        self.class_['period_id'] = wrong_id
        self.class_['term_id'] = self.term_id  # Valid term_id
        self.class_['year_level_id'] = self.year_level_id
        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        # Should get error about invalid subject_id since it's checked first
        self.assertIn('does not exist in the database', res_answer['message'])

        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None
        self.class_id = None

    def test_get_class(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.get('/class/{}'.format(
                                   self.class_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())

        res_answer = res_answer['message']
        self.assertEqual(res_answer['subject_id'], self.subject_id)

    def test_get_class_id_missing(self):
        wrong_id = str(uuid.uuid4())

        response = self.client.get('/class/{}'.format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)

        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer['message'], 'Class not found')

        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None
        self.class_id = None

    def test_put_class(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']
        self.class_['class_name'] = "update_test"
        self.class_['_id'] = self.class_id

        response = self.client.put("/class",
                                   headers={"Authorization": API_KEY},
                                   json=self.class_)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"]["class_name"],
                         "update_test")

    def test_put_class_id_missing(self):
        response = self.client.put("/class",
                                   headers={"Authorization": API_KEY},
                                   json=self.class_)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_put_class_id_wrong(self):
        wrong_id = str(uuid.uuid4())
        self.class_['_id'] = wrong_id
        response = self.client.put("/class",
                                   headers={"Authorization": API_KEY},
                                   json=self.class_)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_delete_class(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.delete("/class/{}".format(self.class_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.class_)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "Class record deleted")

    def test_delete_class_id_missing(self):
        wrong_id = str(uuid.uuid4())

        response = self.client.delete("/class/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY},
                                      json=self.class_)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_get_list_class_subject_id(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.get('/class/list/subject/{}'.format(
                                   self.subject_id),
                                   headers={"Authorization": API_KEY})

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())

        self.assertIsInstance(res_answer['message'], list)

    def test_get_list_class_subject_id_missing(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/class/list/subject/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_get_list_class_teacher_id(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.get('/class/list/teacher/{}'.format(
                                   self.teacher_id),
                                   headers={"Authorization": API_KEY})

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())

        self.assertIsInstance(res_answer['message'], list)

    def test_get_list_class_teacher_id_missing(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/class/list/teacher/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_get_list_class_term_id(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.get('/class/list/term/{}'.format(
                                   self.term_id),
                                   headers={"Authorization": API_KEY})

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())

        self.assertIsInstance(res_answer['message'], list)

    def test_get_list_class_term_id_missing(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/class/list/term/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_get_list_class_period_id(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.get('/class/list/period/{}'.format(
                                   self.period_id),
                                   headers={"Authorization": API_KEY})

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())

        self.assertIsInstance(res_answer['message'], list)

    def test_get_list_class_period_id_missing(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/class/list/period/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None

    def test_get_list_class_classroom_id(self):

        response = self.client.post('/department',
                                    headers={"Authorization": API_KEY},
                                    json=self.department)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.department_id = res_answer["message"]["_id"]

        self.subject['department_id'] = self.department_id
        response = self.client.post('/subject',
                                    headers={"Authorization": API_KEY},
                                    json=self.subject)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.subject_id = res_answer["message"]["_id"]

        response = self.client.post('/classroom_types',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom_types)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_types_id = res_answer["message"]["_id"]
        self.classroom['room_type'] = self.classroom_types_id

        response = self.client.post('/classroom',
                                    headers={"Authorization": API_KEY},
                                    json=self.classroom)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.classroom_id = res_answer["message"]["_id"]

        response = self.client.post('/teacher',
                                    headers={"Authorization": API_KEY},
                                    json=self.teacher)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.teacher_id = res_answer["message"]["_id"]

        response = self.client.post('/school_year',
                                    headers={"Authorization": API_KEY},
                                    json=self.school_year)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.school_year_id = res_answer['message']['_id']

        self.term['year_id'] = self.school_year_id
        self.period['year_id'] = self.school_year_id

        response = self.client.post('/term',
                                    headers={"Authorization": API_KEY},
                                    json=self.term)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.term_id = res_answer['message']['_id']

        response = self.client.post('/period',
                                    headers={"Authorization": API_KEY},
                                    json=self.period)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.period_id = res_answer['message']['_id']

        self.class_['subject_id'] = self.subject_id
        self.class_['teacher_id'] = self.teacher_id
        # Create year_level (required for class creation)
        response = self.client.post('/year_level',
                                    headers={"Authorization": API_KEY},
                                    json=self.year_level)
        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.year_level_id = res_answer['message']['_id']

        self.class_['term_id'] = self.term_id
        self.class_['period_id'] = self.period_id
        self.class_['classroom_id'] = self.classroom_id
        self.class_['year_level_id'] = self.year_level_id

        response = self.client.post('/class',
                                    headers={"Authorization": API_KEY},
                                    json=self.class_)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.class_id = res_answer['message']['_id']

        response = self.client.get('/class/list/classroom/{}'.format(
                                   self.classroom_id),
                                   headers={"Authorization": API_KEY})

        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())

        self.assertIsInstance(res_answer['message'], list)

    def test_get_list_class_classroom_id_missing(self):

        wrong_id = str(uuid.uuid4())
        response = self.client.get("/class/list/classroom/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"],
                         "class does not exist")
        self.class_id = None
        self.subject_id = None
        self.teacher_id = None
        self.department_id = None
        self.classroom_id = None
        self.classroom_types_id = None
        self.term_id = None
        self.period_id = None
        self.school_year_id = None
