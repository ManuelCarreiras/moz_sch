import unittest
import json
from db import db
import os
from flask import Flask
from webPlatform_api import Webapi
import uuid
from datetime import date

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
API_KEY = os.getenv("API_KEY")


class TestTeacherSalary(unittest.TestCase):

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

        # Create a teacher first (required for salary)
        with open("tests/configs/teacher_config.json", "r") as fr:
            teacher_data = json.load(fr)
        
        response = self.client.post('/teacher',
                                   headers={"Authorization": API_KEY},
                                   json=teacher_data)
        if response.status_code == 201:
            res_answer = json.loads(response.get_data())
            self.teacher_id = res_answer["message"]["_id"]
        else:
            self.teacher_id = None

        with open("tests/configs/teacher_salary_config.json", "r") as fr:
            self.salary = json.load(fr)
            if self.teacher_id:
                self.salary["teacher_id"] = self.teacher_id
        
        with open("tests/configs/teacher_salary_config_missing.json", "r") as fr:
            self.salary_missing = json.load(fr)
        
        with open("tests/configs/teacher_salary_config_update.json", "r") as fr:
            self.salary_update = json.load(fr)

        self.salary_id = None

    def tearDown(self) -> None:
        """
        Ensures that the database is emptied for next unit test
        """
        # Delete salary entry
        if self.salary_id is not None:
            self.client.delete("/teacher_salary/{}".format(self.salary_id),
                               headers={"Authorization": API_KEY})
        
        # Delete teacher entry
        if self.teacher_id is not None:
            self.client.delete("/teacher/{}".format(self.teacher_id),
                               headers={"Authorization": API_KEY})

    def test_create_salary(self):
        """Test creating a salary record"""
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.assertIn("_id", res_answer["salary"])
        self.assertEqual(res_answer["salary"]["value"], 1500.00)
        self.salary_id = res_answer["salary"]["_id"]

    def test_create_salary_missing(self):
        """Test creating salary with missing required fields"""
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary_missing)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("required", res_answer["message"].lower())
        self.salary_id = None

    def test_create_salary_invalid_teacher(self):
        """Test creating salary with invalid teacher_id"""
        invalid_salary = self.salary.copy()
        invalid_salary["teacher_id"] = str(uuid.uuid4())
        
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=invalid_salary)

        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Teacher not found")
        self.salary_id = None

    def test_get_salary(self):
        """Test getting a specific salary record"""
        # Create salary first
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.salary_id = res_answer["salary"]["_id"]

        # Get the salary
        response = self.client.get("/teacher_salary/{}".format(self.salary_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["salary"]["value"], 1500.00)
        self.assertEqual(res_answer["salary"]["month"], 2)
        self.assertEqual(res_answer["salary"]["year"], 2026)

    def test_get_salary_missing(self):
        """Test getting a non-existent salary record"""
        wrong_id = str(uuid.uuid4())
        response = self.client.get("/teacher_salary/{}".format(wrong_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Salary record not found")
        self.salary_id = None

    def test_get_salary_with_filters(self):
        """Test getting salary records with filters"""
        # Create salary first
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.salary_id = res_answer["salary"]["_id"]

        # Get with teacher_id filter
        response = self.client.get("/teacher_salary?teacher_id={}".format(self.teacher_id),
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("salary_records", res_answer)
        self.assertGreaterEqual(len(res_answer["salary_records"]), 1)

        # Get with month and year filter
        response = self.client.get("/teacher_salary?month=2&year=2026",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("salary_records", res_answer)

    def test_put_salary(self):
        """Test updating a salary record"""
        # Create salary first
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.salary_id = res_answer["salary"]["_id"]

        # Update salary
        update_data = {
            "_id": self.salary_id,
            **self.salary_update
        }
        response = self.client.put("/teacher_salary",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["salary"]["paid"], True)

    def test_put_salary_wrong(self):
        """Test updating a non-existent salary record"""
        wrong_id = str(uuid.uuid4())
        update_data = {
            "_id": wrong_id,
            **self.salary_update
        }
        response = self.client.put("/teacher_salary",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Salary record not found")
        self.salary_id = None

    def test_delete_salary(self):
        """Test deleting a salary record"""
        # Create salary first
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.salary_id = res_answer["salary"]["_id"]

        # Delete salary
        response = self.client.delete("/teacher_salary/{}".format(self.salary_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Salary record deleted successfully")
        self.salary_id = None  # Already deleted

    def test_delete_salary_wrong(self):
        """Test deleting a non-existent salary record"""
        wrong_id = str(uuid.uuid4())
        response = self.client.delete("/teacher_salary/{}".format(wrong_id),
                                      headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 404)
        res_answer = json.loads(response.get_data())
        self.assertEqual(res_answer["message"], "Salary record not found")
        self.salary_id = None

    def test_duplicate_salary(self):
        """Test creating duplicate salary for same teacher/month/year"""
        # Create first salary
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 201)
        res_answer = json.loads(response.get_data())
        self.salary_id = res_answer["salary"]["_id"]

        # Try to create duplicate
        response = self.client.post('/teacher_salary',
                                    headers={"Authorization": API_KEY},
                                    json=self.salary)

        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertIn("already exists", res_answer["message"].lower())

    def test_get_salary_grid(self):
        """Test getting teacher salary grid"""
        response = self.client.get("/teacher_salary/grid",
                                   headers={"Authorization": API_KEY})
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("salary_grid", res_answer)
        self.assertIn("count", res_answer)

    def test_get_salary_grid_with_department(self):
        """Test getting teacher salary grid filtered by department"""
        # First get all departments to get a valid department_id
        response = self.client.get("/department",
                                   headers={"Authorization": API_KEY})
        if response.status_code == 200:
            res_answer = json.loads(response.get_data())
            if res_answer.get("message") and len(res_answer["message"]) > 0:
                department_id = res_answer["message"][0]["_id"]
                response = self.client.get("/teacher_salary/grid?department_id={}".format(department_id),
                                         headers={"Authorization": API_KEY})
                self.assertEqual(response.status_code, 200)
                res_answer = json.loads(response.get_data())
                self.assertIn("salary_grid", res_answer)

    def test_update_salary_grid(self):
        """Test updating teacher salary grid"""
        # First ensure teacher exists and get its ID
        if not self.teacher_id:
            return  # Skip if teacher creation failed
        
        with open("tests/configs/teacher_salary_grid_config.json", "r") as fr:
            grid_data = json.load(fr)
            grid_data["salaries"][0]["teacher_id"] = self.teacher_id
        
        response = self.client.put("/teacher_salary/grid",
                                   headers={"Authorization": API_KEY},
                                   json=grid_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("success", res_answer)
        self.assertEqual(res_answer["success"], True)
        self.assertGreaterEqual(res_answer["updated"], 0)

    def test_generate_salary(self):
        """Test generating salaries for a month"""
        # First set base_salary for teacher
        if not self.teacher_id:
            return  # Skip if teacher creation failed
        
        # Set base_salary
        update_data = {
            "_id": self.teacher_id,
            "base_salary": 2000.00
        }
        response = self.client.put("/teacher",
                                   headers={"Authorization": API_KEY},
                                   json=update_data)
        self.assertEqual(response.status_code, 200)

        # Generate salaries
        with open("tests/configs/salary_generate_config.json", "r") as fr:
            generate_data = json.load(fr)
        
        response = self.client.post("/teacher_salary/generate",
                                    headers={"Authorization": API_KEY},
                                    json=generate_data)
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertIn("success", res_answer)
        self.assertEqual(res_answer["success"], True)
        self.assertGreaterEqual(res_answer["created"], 0)



if __name__ == '__main__':
    unittest.main()

