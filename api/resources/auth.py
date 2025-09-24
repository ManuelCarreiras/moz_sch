import os
import json
from flask import request, Response
from flask_restful import Resource
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt


class AuthLoginResource(Resource):
    def post(self):
        data = request.get_json() or {}
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            response = {"success": False, "message": "Missing credentials"}
            return Response(json.dumps(response), status=400)

        admin_user = os.getenv('ADMIN_USERNAME', '')
        admin_pass = os.getenv('ADMIN_PASSWORD', '')

        # Simple env-based auth for now; replace with DB lookup when available
        if username != admin_user or password != admin_pass:
            response = {"success": False, "message": "Invalid username or password"}
            return Response(json.dumps(response), status=401)

        access_token = create_access_token(identity=username, additional_claims={"role": "admin"})
        response = {"success": True, "token": access_token}
        return Response(json.dumps(response), status=200)


class AuthMeResource(Resource):
    @jwt_required()
    def get(self):
        identity = get_jwt_identity()
        claims = get_jwt()
        response = {
            "success": True,
            "user": {
                "username": identity,
                "role": claims.get("role")
            }
        }
        return Response(json.dumps(response), status=200)



