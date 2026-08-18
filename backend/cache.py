"""
Redis caching utilities for QueryIQ.

Caches Tavily search results and Groq extraction results
using SHA256-hashed keys with configurable TTL.
"""

import os
import json
import hashlib
import logging
from typing import Optional

try:
    from metrics import record_cache_hit, record_cache_miss
except ImportError:
    def record_cache_hit(n): pass
    def record_cache_miss(n): pass

logger = logging.getLogger("queryiq.cache")

# ── Redis Client (lazy-initialized) ──
_redis_client = None


def _get_redis():
    """Lazy-initialize Redis client. Returns None if Redis is unavailable."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        _redis_client = redis.from_url(redis_url, decode_responses=True)
        # Test connection
        _redis_client.ping()
        logger.info(f"[CACHE] Redis connected: {redis_url}")
        return _redis_client
    except Exception as e:
        logger.warning(f"[CACHE] Redis unavailable, caching disabled: {e}")
        return None


def _make_cache_key(prefix: str, content: str) -> str:
    """Generate a SHA256-hashed cache key with a prefix."""
    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]
    return f"queryiq:{prefix}:{content_hash}"


def cache_get(prefix: str, content: str) -> Optional[dict]:
    """
    Retrieve a cached result.

    Args:
        prefix: Cache namespace (e.g., 'tavily', 'groq_classify', 'groq_extract')
        content: The input content to hash for the cache key

    Returns:
        Cached dict or None if not found / Redis unavailable.
    """
    r = _get_redis()
    if r is None:
        return None

    key = _make_cache_key(prefix, content)
    try:
        cached = r.get(key)
        if cached:
            record_cache_hit(prefix)
            logger.info(f"[CACHE] HIT — {prefix} (key={key[:30]}...)")
            return json.loads(cached)
        else:
            record_cache_miss(prefix)
            logger.info(f"[CACHE] MISS — {prefix} (key={key[:30]}...)")
            return None
    except Exception as e:
        logger.warning(f"[CACHE] Read error: {e}")
        return None


def cache_set(prefix: str, content: str, data: dict, ttl: int = 3600) -> bool:
    """
    Store a result in cache.

    Args:
        prefix: Cache namespace
        content: The input content to hash for the cache key
        data: The dict to cache
        ttl: Time-to-live in seconds (default: 1 hour)

    Returns:
        True if cached successfully, False otherwise.
    """
    r = _get_redis()
    if r is None:
        return False

    key = _make_cache_key(prefix, content)
    try:
        r.setex(key, ttl, json.dumps(data, default=str))
        logger.info(f"[CACHE] SET — {prefix} (key={key[:30]}..., ttl={ttl}s)")
        return True
    except Exception as e:
        logger.warning(f"[CACHE] Write error: {e}")
        return False


def cache_tavily(query: str, data: dict, ttl: int = 3600) -> bool:
    """Cache Tavily search results by query string."""
    return cache_set("tavily", query, data, ttl)


def get_cached_tavily(query: str) -> Optional[dict]:
    """Get cached Tavily search results."""
    return cache_get("tavily", query)


def cache_groq_extraction(query: str, data: dict, ttl: int = 3600) -> bool:
    """Cache Groq extraction results by query + context hash."""
    return cache_set("groq_extract", query, data, ttl)


def get_cached_groq_extraction(query: str) -> Optional[dict]:
    """Get cached Groq extraction results."""
    return cache_get("groq_extract", query)


def cache_groq_classification(query: str, data: dict, ttl: int = 3600) -> bool:
    """Cache Groq classification results."""
    return cache_set("groq_classify", query, data, ttl)


def get_cached_groq_classification(query: str) -> Optional[dict]:
    """Get cached Groq classification results."""
    return cache_get("groq_classify", query)
