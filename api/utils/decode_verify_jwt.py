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
from jose import jwk, jwt
from jose.utils import base64url_decode


USER_POOL_ID = os.getenv("AWS_COGNITO_USERPOOL_ID")
CLIENT_ID = os.getenv("AWS_COGNITO_APPCLIENT_ID")
API_KEY = os.getenv("API_KEY")

# CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")  # noqa:E501
REGION_NAME = os.getenv("COGNITO_REGION_NAME", 'eu-west-1')

keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'\
           .format(REGION_NAME, USER_POOL_ID)

with urllib.request.urlopen(keys_url) as f:
    response = f.read()

keys = json.loads(response.decode('utf-8'))['keys']


def verify_accessToken(accessToken):

    # get the kid from the headers prior to verification
    headers = jwt.get_unverified_headers(accessToken)
    kid = headers['kid']
    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break
    if key_index == -1:
        print('Public key not found in jwks.json')
        return False

    # construct the public key
    public_key = jwk.construct(keys[key_index])
    # get the last two sections of the accessToken,
    # message and signature (encoded in base64)
    message, encoded_signature = str(accessToken).rsplit('.', 1)
    # decode the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
    # verify the signature
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        print('Signature verification failed')
        return False
    print('Signature successfully verified')
    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(accessToken)
    # additionally we can verify the accessToken expiration
    if time.time() > claims['exp']:
        print('accessToken is expired')
        return False
    # verify accessToken
    if 'client_id' in claims and claims['client_id'] != CLIENT_ID:
        print('accessToken has an invalid client_id')
        return False

    # now we can use the claims
    # print(claims)
    return claims


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
                    groups_cognito = auth["cognito:groups"]
                    if "admin" in groups_cognito or len(set(groups_cognito).intersection(groups)) != 0:  # noqa: E501
                        return func(*args, **kwargs)
            return False
        return wrapper
    return decorator