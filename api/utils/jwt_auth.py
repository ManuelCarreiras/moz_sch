import os
import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Any
import jwt as pyjwt


class JWTAuth:
    """
    JWT authentication utilities for passwordless email authentication.
    Handles token generation, verification, and session management.
    """

    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY",
                                    self._generate_secret_key())
        self.algorithm = "HS256"
        self.access_token_expire_minutes = int(
            os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
        self.refresh_token_expire_days = int(
            os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    def _generate_secret_key(self) -> str:
        """Generate a secure secret key if not provided"""
        return secrets.token_urlsafe(32)

    def create_access_token(self, user_id: str, email: str, username: str,
                            admin: bool = False, role: str = 'analista',
                            additional_claims: Optional[Dict] = None) -> str:
        """
        Create a JWT access token for authenticated user.

        Args:
            user_id: User's unique identifier
            email: User's email address
            username: User's username
            admin: Whether the user has admin privileges
            role: User's role (analista, revisor, administrador)
            additional_claims: Additional claims to include in token

        Returns:
            JWT access token string
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=self.access_token_expire_minutes)

        payload = {
            "sub": user_id,
            "email": email,
            "username": username,
            "admin": admin,
            "role": role,
            "iat": now,
            "exp": expire,
            "type": "access"
        }

        if additional_claims:
            payload.update(additional_claims)

        return pyjwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: str) -> str:
        """
        Create a JWT refresh token for user.

        Args:
            user_id: User's unique identifier

        Returns:
            JWT refresh token string
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=self.refresh_token_expire_days)

        payload = {
            "sub": user_id,
            "iat": now,
            "exp": expire,
            "type": "refresh"
        }

        return pyjwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode a JWT token.

        Args:
            token: JWT token string

        Returns:
            Decoded token payload if valid, None if invalid
        """
        logger = logging.getLogger(__name__)
        try:
            payload = pyjwt.decode(
                token, self.secret_key, algorithms=[self.algorithm]
            )
            return payload
        except pyjwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            return None
        except pyjwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            return None

    def verify_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify an access token specifically.

        Args:
            token: JWT access token string

        Returns:
            Decoded token payload if valid access token, None otherwise
        """
        payload = self.verify_token(token)
        if payload and payload.get("type") == "access":
            return payload
        return None

    def verify_refresh_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify a refresh token specifically.

        Args:
            token: JWT refresh token string

        Returns:
            Decoded token payload if valid refresh token, None otherwise
        """
        payload = self.verify_token(token)
        if payload and payload.get("type") == "refresh":
            return payload
        return None

    def extract_user_info(self, token: str) -> Optional[Dict[str, str]]:
        """
        Extract user information from a valid access token.

        Args:
            token: JWT access token string

        Returns:
            Dictionary with user_id, email, username, role if valid,
            None otherwise
        """
        payload = self.verify_access_token(token)
        if payload:
            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "username": payload.get("username"),
                "role": payload.get("role", "analista"),
                "admin": payload.get("admin", False)
            }
        return None


# Global instance
jwt_auth = JWTAuth()