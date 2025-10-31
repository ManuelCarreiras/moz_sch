import os
import json
import time
from typing import Optional, Any

try:
    import redis
except Exception:  # pragma: no cover
    redis = None


class AuthRedisService:
    """Lightweight session helper backed by Redis.

    Exposes only the minimal API used by auth_middleware:
    - get_session(session_id)
    - update_session_activity(session_id)
    """

    def __init__(self) -> None:
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.client = None
        if redis is not None:
            try:
                self.client = redis.Redis.from_url(self.redis_url, decode_responses=True)
                # Test connection
                self.client.ping()
            except Exception:
                self.client = None

    def get_session(self, session_id: str) -> Optional[Any]:
        if not self.client:
            return None
        data = self.client.get(f"session:{session_id}")
        if not data:
            return None
        try:
            return json.loads(data)
        except Exception:
            return data

    def update_session_activity(self, session_id: str) -> None:
        if not self.client:
            return
        key = f"session:{session_id}:last_active"
        self.client.set(key, int(time.time()))


auth_redis_service = AuthRedisService()


