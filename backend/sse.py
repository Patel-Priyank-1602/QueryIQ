"""
Server-Sent Events (SSE) module for QueryIQ.

Uses Redis Pub/Sub to broadcast pipeline stage updates from
Celery workers to connected SSE clients in real time.
"""

import os
import json
import asyncio
import logging
from typing import AsyncGenerator

logger = logging.getLogger("queryiq.sse")

# ── Redis Pub/Sub Channel Prefix ──
SSE_CHANNEL_PREFIX = "queryiq:sse:"


def _get_redis_sync():
    """Get synchronous Redis client for publishing from Celery workers."""
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        return redis.from_url(redis_url, decode_responses=True)
    except Exception as e:
        logger.warning(f"[SSE] Redis unavailable for publishing: {e}")
        return None


def publish_stage_event(query_id: str, stage: str, status: str, details: str = "", duration_ms: int = 0):
    """
    Publish a pipeline stage event to Redis Pub/Sub.
    Called from Celery tasks to notify connected SSE clients.

    Args:
        query_id: UUID of the query being processed
        stage: Name of the current stage (e.g., 'classify', 'research', 'extract', 'save')
        status: Status of the stage ('started', 'completed', 'error')
        details: Optional details string
        duration_ms: Duration of the stage in milliseconds
    """
    r = _get_redis_sync()
    if r is None:
        return

    channel = f"{SSE_CHANNEL_PREFIX}{query_id}"
    event = {
        "stage": stage,
        "status": status,
        "details": details,
        "duration_ms": duration_ms,
    }

    try:
        r.publish(channel, json.dumps(event))
        logger.info(f"[SSE] Published: {stage}/{status} → {channel}")
    except Exception as e:
        logger.warning(f"[SSE] Publish error: {e}")


def publish_completion_event(query_id: str, result: dict):
    """
    Publish a pipeline completion event with the final result.

    Args:
        query_id: UUID of the completed query
        result: The final query response dict
    """
    r = _get_redis_sync()
    if r is None:
        return

    channel = f"{SSE_CHANNEL_PREFIX}{query_id}"
    event = {
        "stage": "complete",
        "status": "completed",
        "result": result,
    }

    try:
        r.publish(channel, json.dumps(event, default=str))
        logger.info(f"[SSE] Completion published → {channel}")
    except Exception as e:
        logger.warning(f"[SSE] Completion publish error: {e}")


def publish_error_event(query_id: str, error_message: str):
    """Publish an error event to notify SSE clients of failure."""
    r = _get_redis_sync()
    if r is None:
        return

    channel = f"{SSE_CHANNEL_PREFIX}{query_id}"
    event = {
        "stage": "error",
        "status": "error",
        "details": error_message,
    }

    try:
        r.publish(channel, json.dumps(event))
        logger.info(f"[SSE] Error published → {channel}")
    except Exception as e:
        logger.warning(f"[SSE] Error publish error: {e}")


async def stream_query_events(query_id: str, timeout: int = 120) -> AsyncGenerator[str, None]:
    """
    Async generator that yields SSE-formatted events from Redis Pub/Sub.
    Used by FastAPI's StreamingResponse for the SSE endpoint.

    Args:
        query_id: UUID of the query to stream updates for
        timeout: Maximum seconds to keep the stream open

    Yields:
        SSE-formatted event strings ("data: {...}\\n\\n")
    """
    try:
        import redis.asyncio as aioredis
    except ImportError:
        yield f"data: {json.dumps({'stage': 'error', 'status': 'error', 'details': 'Redis async not available'})}\n\n"
        return

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    channel = f"{SSE_CHANNEL_PREFIX}{query_id}"

    try:
        r = aioredis.from_url(redis_url, decode_responses=True)
        pubsub = r.pubsub()
        await pubsub.subscribe(channel)

        logger.info(f"[SSE] Client subscribed to {channel}")

        # Send initial connection event
        yield f"data: {json.dumps({'stage': 'connected', 'status': 'connected', 'details': 'SSE stream established'})}\n\n"

        start_time = asyncio.get_event_loop().time()

        while True:
            # Check timeout
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                yield f"data: {json.dumps({'stage': 'timeout', 'status': 'timeout', 'details': 'Stream timed out'})}\n\n"
                break

            # Listen for messages with a short timeout
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)

            if message and message["type"] == "message":
                data = message["data"]
                yield f"data: {data}\n\n"

                # Check if this is a completion or error event
                try:
                    event = json.loads(data)
                    if event.get("stage") in ("complete", "error"):
                        break
                except json.JSONDecodeError:
                    pass

            # Small sleep to prevent busy loop
            await asyncio.sleep(0.1)

        await pubsub.unsubscribe(channel)
        await pubsub.close()
        await r.close()
        logger.info(f"[SSE] Client disconnected from {channel}")

    except Exception as e:
        logger.error(f"[SSE] Stream error: {e}")
        yield f"data: {json.dumps({'stage': 'error', 'status': 'error', 'details': str(e)})}\n\n"
