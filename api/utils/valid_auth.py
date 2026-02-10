import os
import secrets
import logging
import json

from flask import request, g, Response
from utils.decode_verify_jwt import verify_accessToken, decode_token_without_verification

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


def _normalize_claim_values(raw_value):
    """Normalize JWT claim values that may arrive as string/list/tuple/set."""
    if raw_value is None:
        return []
    if isinstance(raw_value, str):
        # Cognito/custom claims may arrive as comma-separated string.
        return [item.strip().lower() for item in raw_value.split(",") if item.strip()]
    if isinstance(raw_value, (list, tuple, set)):
        return [str(item).strip().lower() for item in raw_value if str(item).strip()]
    return [str(raw_value).strip().lower()]


def _extract_role_from_claims(claims):
    """Derive app role from explicit role claims first, then Cognito groups."""
    candidate_roles = []
    for role_key in ("role", "custom:role", "custom:roles", "roles"):
        candidate_roles.extend(_normalize_claim_values(claims.get(role_key)))

    # Include groups as fallback role source.
    groups = []
    groups.extend(_normalize_claim_values(claims.get("cognito:groups")))
    groups.extend(_normalize_claim_values(claims.get("groups")))
    groups.extend(_normalize_claim_values(claims.get("custom:groups")))

    normalized = candidate_roles + groups
    if not normalized:
        return None, groups

    # Canonical role mapping used across backend decorators/resources.
    role_aliases = {
        "admin": "admin",
        "administrador": "admin",
        "administrator": "admin",
        "teacher": "teacher",
        "teachers": "teacher",
        "student": "student",
        "students": "student",
        "financial": "financial",
        "finance": "financial",
        "financeiro": "financial",
        "secretary": "secretary",
        "secretaria": "secretary",
        "secretariat": "secretary",
        "revisor": "revisor",
    }

    for value in normalized:
        mapped = role_aliases.get(value)
        if mapped:
            return mapped, groups

    # If no alias matched, still surface first explicit role for visibility.
    return normalized[0], groups


# Auth validation
def validAuth():

    exempt_routes = ["home", "authloginresource", "authmeresource"]
    # Also exempt auth endpoints that use flask-jwt-extended
    exempt_paths = ['/auth/login', '/auth/me']
    if (request.endpoint in exempt_routes or
            request.path in exempt_paths or
            request.path.startswith('/auth/login')):
        return

    # Check for API key first (for admin/debug access)
    api_key = check_api_key()
    if api_key:
        g.user = "admin_user"
        g.admin = True
        g.role = "admin"
        g.email = "admin@system.local"  # No need for SCHOOL_EMAIL
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
            # Accept either custom header or standard Authorization: Bearer <token>
            token = request.headers.get('accessToken')
            if not token:
                auth_header = request.headers.get('Authorization')
                if auth_header and ' ' in auth_header:
                    scheme, token_val = auth_header.split(' ', 1)
                    if scheme.lower() == 'bearer':
                        token = token_val
            
            # Only use debug mode if no token is present
            # If token is present, verify it even in debug mode
            if not token:
                from flask import current_app
                if current_app.config.get('DEBUG') or os.getenv("DEBUG", "false").lower() == "true":
                    g.user = "debug_user"
                    g.admin = True
                    g.role = "admin"
                    g.email = "debug@system.local"
                    return
            
            logging.info(f"Auth attempt: has_token={bool(token)}, method={request.method}, path={request.path}")
            
            # Verify token authenticity
            if token:
                claims = verify_accessToken(token)
                if claims:
                    g.user = claims.get("sub")
                    g.username = claims.get("username") or claims.get("cognito:username")
                    g.email = claims.get("email")
                    g.role, groups_norm = _extract_role_from_claims(claims)
                    g.admin = g.role == "admin" or "admin" in groups_norm
                    logging.info(f"Auth success: user={g.user}, role={g.role}, groups={groups_norm}")
                    return
                else:
                    logging.warning("Token verification failed (returns False)")
                    # In DEBUG mode, try to decode token without verification to extract email
                    from flask import current_app
                    if current_app.config.get('DEBUG') or os.getenv("DEBUG", "false").lower() == "true":
                        logging.warning("Attempting to decode token without verification in DEBUG mode")
                        unverified_claims = decode_token_without_verification(token)
                        if unverified_claims:
                            # Log all token claims for debugging
                            logging.info(f"DEBUG mode: Token claims keys: {list(unverified_claims.keys())}")
                            
                            # Extract email and user info from unverified token
                            g.user = unverified_claims.get("sub")
                            g.username = unverified_claims.get("username") or unverified_claims.get("cognito:username")
                            # Try multiple possible email fields
                            g.email = unverified_claims.get("email") or (unverified_claims.get("cognito:username") if "@" in (unverified_claims.get("cognito:username") or "") else None) or (unverified_claims.get("username") if "@" in (unverified_claims.get("username") or "") else None)
                            
                            # If email is not in token, log all available fields
                            if not g.email:
                                logging.warning(f"Email not found in token. Available fields: {unverified_claims.keys()}")
                                logging.warning(f"Token contents: {json.dumps({k: v for k, v in unverified_claims.items() if k not in ['sub', 'iat', 'exp', 'aud', 'iss']})}")
                            
                            g.role, groups_norm = _extract_role_from_claims(unverified_claims)
                            g.admin = g.role == "admin" or "admin" in groups_norm
                            logging.info(f"DEBUG mode: Using unverified token - email={g.email}, username={g.username}, role={g.role}")
                            return
                        else:
                            logging.warning("Could not decode token, falling back to debug user")
                            g.user = "debug_user"
                            g.admin = True
                            g.role = "admin"
                            g.email = "debug@system.local"
                            return
                    response = {"success": False,
                                "message": "Invalid User Token."}
                    return Response(json.dumps(response), status=401,
                                    mimetype='application/json')
            else:
                logging.warning("No token in request")
                response = {"success": False,
                            "message": "Invalid User Token."}
                return Response(json.dumps(response), status=401,
                                mimetype='application/json')
    except Exception as e:
        logging.error(f"Auth exception: {e}")
        print(e)
        response = {"success": False,
                    "message": "Invalid User Token."}
        return Response(json.dumps(response), status=401,
                        mimetype='application/json')
