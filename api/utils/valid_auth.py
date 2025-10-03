import os
import secrets

from flask import request, g, Response
from utils.decode_verify_jwt import verify_accessToken

API_KEY = os.getenv("API_KEY")


def check_api_key():
    key = request.headers.get('Authorization')
    if key:
        return secrets.compare_digest(key, API_KEY)
    return False


def check_if_is_device_request():
    '''If is device making request it is not needed api key'''
    device_key = request.headers.get('MONITORING_DEVICE_KEY')
    device_id = request.headers.get('MONITORING_DEVICE_ID')
    device_url = "/monitoring_data"

    if device_key and device_id and device_url in request.url:
        return True
    return False


# Auth validation
def validAuth():

    exempt_routes = ["home"]
    if request.endpoint in exempt_routes:
        return

    # Check for API key first (for admin/debug access)
    api_key = check_api_key()
    if api_key:
        g.user = "admin_user"
        g.admin = True
        g.email = "admin@system.local"  # No need for SCHOOL_EMAIL
        return

    # Check if debug mode (bypass auth in development)
    from flask import current_app
    if current_app.config.get('DEBUG') or os.getenv("DEBUG", "false").lower() == "true":
        g.user = "debug_user"
        g.admin = True
        g.email = "debug@system.local"  # No need for SCHOOL_EMAIL
        return

    # Check if device request (for monitoring/IoT)
    if check_if_is_device_request():
        g.user = "device_user"
        g.admin = False
        g.email = "device@system.local"
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
