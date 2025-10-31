# Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# A copy of the License is located at
#
#     http://aws.amazon.com/apache2.0/
#
# or in the "license" file accompanying this file.
# This file is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
# either express or implied. See the
# License for the specific language governing
# permissions and limitations under the License.
import os
from flask import request
import json
import time
import secrets
import urllib.request
import jwt
from jwt import PyJWKClient


USER_POOL_ID = os.getenv("AWS_COGNITO_USERPOOL_ID")
CLIENT_ID = os.getenv("AWS_COGNITO_APP_CLIENT_ID") or os.getenv("AWS_COGNITO_APPCLIENT_ID")
API_KEY = os.getenv("API_KEY")

# CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")  # noqa:E501
REGION_NAME = os.getenv("COGNITO_REGION_NAME", 'eu-west-1')

# Create JWK client for Cognito
jwks_url = f'https://cognito-idp.{REGION_NAME}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json'
jwks_client = PyJWKClient(jwks_url)


def decode_token_without_verification(accessToken):
    """Decode JWT token without verification (for DEBUG mode only)"""
    try:
        # Decode without verification - this is UNSAFE and only for development
        # Provide empty key and disable all verification
        claims = jwt.decode(
            accessToken,
            key="",
            options={"verify_signature": False, "verify_exp": False, "verify_aud": False}
        )
        return claims
    except Exception as e:
        print(f'Token decode failed: {e}')
        return None

def verify_accessToken(accessToken):
    try:
        # Get the signing key from Cognito
        signing_key = jwks_client.get_signing_key_from_jwt(accessToken)
        
        # Verify and decode the token
        claims = jwt.decode(
            accessToken,
            signing_key.key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            options={"verify_exp": True}
        )
        
        print('Token successfully verified')
        return claims
        
    except jwt.ExpiredSignatureError:
        print('Token is expired')
        return False
    except jwt.InvalidTokenError as e:
        print(f'Invalid token: {e}')
        return False
    except Exception as e:
        print(f'Token verification failed: {e}')
        return False


def check_user_group(groups: list) -> bool:
    def decorator(func):
        def wrapper(*args, **kwargs):
            key = request.headers.get('Authorization')
            if key and secrets.compare_digest(key, API_KEY):
                return func(*args, **kwargs)
            accessToken = request.headers.get('accessToken')
            if accessToken:
                auth = verify_accessToken(accessToken)
                if auth:
                    groups_cognito = auth.get("cognito:groups", [])
                    if "admin" in groups_cognito or len(set(groups_cognito).intersection(groups)) != 0:  # noqa: E501
                        return func(*args, **kwargs)
            return False
        return wrapper
    return decorator