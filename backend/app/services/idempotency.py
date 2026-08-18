import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Redis optional connection for high-speed atomic SETNX
try:
    import redis
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=1)
    # Ping test
    redis_client.ping()
    HAS_REDIS = True
    logger.info("Connected to Redis for Idempotency Lock Engine")
except Exception:
    redis_client = None
    HAS_REDIS = False
    logger.info("Redis unavailable; using Database Unique Key constraint for Idempotency")

def check_and_acquire_idempotency_key(idempotency_key: str, ttl_seconds: int = 86400) -> bool:
    """
    Checks if idempotency key exists. If new, acquires lock key.
    Returns True if key is newly acquired (valid request), False if key already exists (duplicate request).
    """
    if not idempotency_key:
        return True
        
    if HAS_REDIS and redis_client:
        try:
            is_new = redis_client.set(f"idempotency:{idempotency_key}", "LOCKED", nx=True, ex=ttl_seconds)
            return bool(is_new)
        except Exception as e:
            logger.warning(f"Redis error during idempotency check: {e}")
            return True
            
    # If Redis is disabled/unavailable, fallback to database level UNIQUE constraint
    return True
