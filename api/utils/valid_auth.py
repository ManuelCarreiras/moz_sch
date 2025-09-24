import os
import secrets

from flask import request, g, Response
from utils.decode_verify_jwt import verify_accessToken

API_KEY = os.getenv("API_KEY")
SCHOOL_EMAIL = os.getenv("SCHOOL_EMAIL")


def check_api_key():
    key = request.headers.get('Authorization')
    if key:
        return secrets.compare_digest(key, API_KEY)
    return False


# Auth validation
def validAuth():

    exempt_routes = ["home"]
    if request.endpoint in exempt_routes:
        return

    api_key = check_api_key()
    if api_key:
        g.user = "debug_user"
        g.admin = True
        g.email = SCHOOL_EMAIL
        return
    # Obtain access token and check api key
    try:
        if request.method != 'OPTIONS':
            accessToken = request.headers.get('accessToken')
            # Verify token autenticity
            if accessToken:
                auth = verify_accessToken(accessToken)
                if auth:
                    g.user = auth["sub"]
                    g.email = auth["email"]
                    if "cognito:groups" in auth and \
                       "ADMIN" in auth["cognito:groups"]:
                        g.admin = True
                    else:
                        g.admin = False
                    return
                else:
                    response = {"success": False,
                                "message": "Invalid User Token."}
                    return Response(response, status=401)
            else:
                response = {"success": False,
                            "message": "Invalid User Token."}
                return Response(response, status=401)
    except Exception as e:
        print(e)
        response = {"success": False,
                    "message": "Invalid User Token."}
        return Response(response, status=401)
