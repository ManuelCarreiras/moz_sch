import os
import secrets
from flask import request, g, Response
from utils.jwt_auth import jwt_auth
try:
    from services.auth_redis_service import auth_redis_service
except Exception:
    auth_redis_service = None
import json


def check_api_key():
    """Check if request has valid API key"""
    api_key = request.headers.get('Authorization')
    if api_key:
        return secrets.compare_digest(api_key, os.getenv("API_KEY"))
    return False


def valid_auth():
    """
    Enhanced authentication middleware supporting both API key and JWT
    authentication. Supports the new passwordless email authentication system.
    """

    # Routes that don't require authentication
    exempt_routes = [
        "home",
        "authrequestcoderesource",
        "authverifycoderesource",
        "authrefreshtokenresource"
    ]
    # Allow CORS preflight requests (OPTIONS method)
    if request.method == 'OPTIONS':
        return

    if request.endpoint in exempt_routes:
        return

    # Check API key first (for admin/debug access)
    if check_api_key():
        g.user = "debug_user"
        g.admin = True
        g.email = os.getenv("ISQ_EMAIL", "admin@example.com")
        g.role = "administrador"
        g.user_data = {
            "user_id": "00000000-0000-0000-0000-000000000000",
            "email": os.getenv("ISQ_EMAIL", "admin@example.com"),
            "username": "debug_user"
        }
        return

    # Check for JWT token in Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        response = {
            "success": False,
            "message": "Authorization header required"
        }
        return Response(json.dumps(response), status=401,
                        mimetype='application/json')

    # Extract token from "Bearer <token>" format
    try:
        scheme, token = auth_header.split(' ', 1)
        if scheme.lower() != 'bearer':
            raise ValueError("Invalid authorization scheme")
    except ValueError:
        response = {
            "success": False,
            "message": "Invalid authorization header format. "
                       "Use 'Bearer <token>'"
        }
        return Response(json.dumps(response), status=401,
                        mimetype='application/json')

    # Verify JWT token
    try:
        payload = jwt_auth.verify_access_token(token)
        if not payload:
            response = {
                "success": False,
                "message": "Invalid or expired token"
            }
            return Response(json.dumps(response), status=401,
                            mimetype='application/json')

        # Extract user information
        user_id = payload.get('sub')
        email = payload.get('email')
        username = payload.get('username')
        # Derive role/admin from Cognito groups if not explicitly present
        groups = payload.get('cognito:groups') or payload.get('groups') or []
        groups_norm = [str(g).lower() for g in groups]
        # If token has explicit role/admin, use them; otherwise infer from groups
        admin = bool(payload.get('admin', False)) or ('admin' in groups_norm)
        role = payload.get('role')
        if not role:
            if 'admin' in groups_norm:
                role = 'admin'
            elif 'teacher' in groups_norm or 'teachers' in groups_norm:
                role = 'teacher'
            elif 'student' in groups_norm or 'students' in groups_norm:
                role = 'student'
            else:
                role = None

        if not user_id or not email or not username:
            response = {
                "success": False,
                "message": "Invalid token payload"
            }
            return Response(json.dumps(response), status=401,
                            mimetype='application/json')

        # Check if session exists in Redis (optional for stateless JWT)
        session_id = request.headers.get('X-Session-ID')
        if session_id and auth_redis_service is not None:
            session_data = auth_redis_service.get_session(session_id)
            if not session_data:
                response = {
                    "success": False,
                    "message": "Session expired or invalid"
                }
                return Response(json.dumps(response), status=401,
                                mimetype='application/json')

            # Update session activity
            auth_redis_service.update_session_activity(session_id)

        # Set user information in Flask g object
        g.user = user_id
        g.email = email
        g.username = username
        g.admin = admin
        g.role = role
        g.user_data = {
            "user_id": user_id,
            "email": email,
            "username": username,
            "admin": admin,
            "role": role
        }

    except Exception as e:
        print(f"Authentication error: {e}")
        response = {
            "success": False,
            "message": "Authentication failed"
        }
        return Response(json.dumps(response), status=401,
                        mimetype='application/json')


def check_user_permissions(required_permissions=None):
    """
    Decorator to check user permissions.

    Args:
        required_permissions: List of required permissions or None for any
        authenticated user
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Check if user is authenticated
            if not hasattr(g, 'user') or not g.user:
                response = {
                    "success": False,
                    "message": "Authentication required"
                }
                return Response(json.dumps(response), status=401,
                                mimetype='application/json')

            # Check admin status for now
            # (can be enhanced with role-based permissions)
            if required_permissions and not g.admin:
                response = {
                    "success": False,
                    "message": "Insufficient permissions"
                }
                return Response(json.dumps(response), status=403,
                                mimetype='application/json')

            return func(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    """Get current authenticated user information"""
    if hasattr(g, 'user_data') and g.user_data:
        return g.user_data
    return None


def is_authenticated():
    """Check if current request is authenticated"""
    return hasattr(g, 'user') and g.user is not None


def is_admin():
    """Check if current user is admin"""
    return hasattr(g, 'admin') and g.admin is True


def require_role(required_role):
    """Decorator to require specific role"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'role') or not g.role:
                response = {
                    "success": False,
                    "message": "Role information not available"
                }
                return Response(json.dumps(response), status=403,
                                mimetype='application/json')

            # Admin users have access to everything
            if g.admin:
                return func(*args, **kwargs)

            # Check specific role
            if g.role != required_role:
                response = {
                    "success": False,
                    "message": f"Role '{required_role}' required"
                }
                return Response(json.dumps(response), status=403,
                                mimetype='application/json')

            return func(*args, **kwargs)
        return wrapper
    return decorator


def require_any_role(required_roles):
    """Decorator to require any of the specified roles"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'role') or not g.role:
                response = {
                    "success": False,
                    "message": "Role information not available"
                }
                return Response(json.dumps(response), status=403,
                                mimetype='application/json')

            # Admin users have access to everything
            if g.admin:
                return func(*args, **kwargs)

            # Check if user has any of the required roles
            if g.role not in required_roles:
                response = {
                    "success": False,
                    "message": (f"One of these roles required: "
                                f"{', '.join(required_roles)}")
                }
                return Response(json.dumps(response), status=403,
                                mimetype='application/json')

            return func(*args, **kwargs)
        return wrapper
    return decorator


def require_administrador(func):
    """Decorator to require administrador role"""
    def wrapper(*args, **kwargs):
        if not hasattr(g, 'role') or not g.role:
            response = {
                "success": False,
                "message": "Role information not available"
            }
            return Response(json.dumps(response), status=403,
                            mimetype='application/json')

        # Admin users have access to everything
        if g.admin and g.role == 'administrador':
            return func(*args, **kwargs)

        if g.role != 'administrador':
            response = {
                "success": False,
                "message": "Administrador role required"
            }
            return Response(json.dumps(response), status=403,
                            mimetype='application/json')

        return func(*args, **kwargs)
    return wrapper


def require_revisor_or_higher(func):
    """Decorator to require revisor role or higher"""
    def wrapper(*args, **kwargs):
        if not hasattr(g, 'role') or not g.role:
            response = {
                "success": False,
                "message": "Role information not available"
            }
            return Response(json.dumps(response), status=403,
                            mimetype='application/json')

        # Admin users have access to everything
        if g.admin:
            return func(*args, **kwargs)

        if g.role not in ['revisor', 'administrador']:
            response = {
                "success": False,
                "message": "Revisor role or higher required"
            }
            return Response(json.dumps(response), status=403,
                            mimetype='application/json')

        return func(*args, **kwargs)
    return wrapper


def get_current_role():
    """Get current user's role"""
    if hasattr(g, 'role') and g.role:
        return g.role
    return None


def has_role(required_role):
    """Check if current user has the required role"""
    if not hasattr(g, 'role') or not g.role:
        return False
    return g.role == required_role or g.admin


def has_any_role(required_roles):
    """Check if current user has any of the required roles"""
    if not hasattr(g, 'role') or not g.role:
        return False
    return g.role in required_roles or g.admin
