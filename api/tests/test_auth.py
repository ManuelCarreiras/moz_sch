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


class TestAuth(unittest.TestCase):

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

        # Get admin credentials from environment
        self.admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        self.admin_password = os.getenv('ADMIN_PASSWORD', 'admin')

    def tearDown(self) -> None:
        """
        No cleanup needed for auth tests
        """
        pass

    def test_login_missing_credentials(self):
        """Test login with missing credentials"""
        response = self.client.post('/auth/login',
                                    json={})
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Missing credentials")

    def test_login_missing_username(self):
        """Test login with missing username"""
        response = self.client.post('/auth/login',
                                    json={"password": self.admin_password})
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Missing credentials")

    def test_login_missing_password(self):
        """Test login with missing password"""
        response = self.client.post('/auth/login',
                                    json={"username": self.admin_username})
        self.assertEqual(response.status_code, 400)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Missing credentials")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post('/auth/login',
                                    json={
                                        "username": "invalid_user",
                                        "password": "invalid_pass"
                                    })
        self.assertEqual(response.status_code, 401)
        res_answer = json.loads(response.get_data())
        self.assertFalse(res_answer["success"])
        self.assertEqual(res_answer["message"], "Invalid username or password")

    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        response = self.client.post('/auth/login',
                                    json={
                                        "username": self.admin_username,
                                        "password": self.admin_password
                                    })

        if response.status_code != 200:
            res_answer = json.loads(response.get_data())
            print(f"Error response: {res_answer}")
            print(f"Username used: {self.admin_username}")
            print(f"Password used: {self.admin_password}")
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("token", res_answer)
        self.assertIsNotNone(res_answer["token"])

    def test_me_without_token(self):
        """Test /auth/me without authentication token"""
        response = self.client.get('/auth/me')
        # Should return 401 or 422 depending on JWT implementation
        self.assertIn(response.status_code, [401, 422])

    def test_me_with_valid_token(self):
        """Test /auth/me with valid authentication token"""
        # First login to get token
        login_response = self.client.post('/auth/login',
                                          json={
                                              "username": self.admin_username,
                                              "password": self.admin_password
                                          })
        self.assertEqual(login_response.status_code, 200)
        login_data = json.loads(login_response.get_data())
        token = login_data["token"]

        # Use token to access /auth/me
        response = self.client.get(
            '/auth/me',
            headers={"Authorization": f"Bearer {token}"})

        if response.status_code != 200:
            res_answer = json.loads(response.get_data())
            print(f"Error response: {res_answer}")
        self.assertEqual(response.status_code, 200)
        res_answer = json.loads(response.get_data())
        self.assertTrue(res_answer["success"])
        self.assertIn("user", res_answer)
        self.assertEqual(res_answer["user"]["username"], self.admin_username)
        self.assertEqual(res_answer["user"]["role"], "admin")


if __name__ == '__main__':
    unittest.main()
