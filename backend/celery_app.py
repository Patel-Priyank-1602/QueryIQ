"""
Celery application configuration for QueryIQ async pipeline.

Broker: Redis (channel 0)
Result Backend: Redis (channel 1)
"""

import os
import sys
from celery import Celery
from dotenv import load_dotenv

# Ensure module directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

# Redis URLs — fallback to localhost if empty or unset
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL") or "redis://localhost:6379/0"
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND") or "redis://localhost:6379/1"

celery_app = Celery(
    "queryiq",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["tasks"],  # Auto-discover task modules
)

# ── Celery Configuration ──
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Result persistence
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,

    # Reliability
    task_acks_late=True,  # Acknowledge tasks after completion (not on receipt)
    worker_prefetch_multiplier=1,  # One task at a time per worker process

    # Task tracking
    task_track_started=True,

    # Retry policy for broker connection
    broker_connection_retry_on_startup=True,

    # Default queue
    task_default_queue="default",
)

print(f"[CELERY] Broker: {CELERY_BROKER_URL}")
print(f"[CELERY] Backend: {CELERY_RESULT_BACKEND}")
