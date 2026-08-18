#!/bin/sh
set -e

# Start Celery worker in the background
celery -A celery_app worker --loglevel=info --concurrency=1 -Q default &

# Start Uvicorn FastAPI server in the foreground
exec uvicorn main:app --host 0.0.0.0 --port 8000
