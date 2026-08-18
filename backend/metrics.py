"""
Prometheus custom metrics for QueryIQ.

Tracks:
  - Pipeline stage durations (histogram)
  - Cache hit/miss counters
  - Pipeline completion status counters
"""

from prometheus_client import Histogram, Counter

# ── Pipeline Stage Duration ──
PIPELINE_STAGE_DURATION = Histogram(
    "queryiq_pipeline_stage_duration_seconds",
    "Duration of each pipeline stage in seconds",
    labelnames=["stage"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0],
)

# ── Cache Operations ──
CACHE_OPERATIONS = Counter(
    "queryiq_cache_operations_total",
    "Total cache operations",
    labelnames=["type", "namespace"],
)

# ── Pipeline Status ──
PIPELINE_STATUS = Counter(
    "queryiq_pipeline_status_total",
    "Total pipeline completions by status",
    labelnames=["status"],
)

# ── Active Pipelines Gauge ──
# Using a counter approach since Gauge isn't easily thread-safe in Celery
PIPELINE_REQUESTS = Counter(
    "queryiq_pipeline_requests_total",
    "Total pipeline requests received",
)


def record_stage_duration(stage: str, duration_seconds: float):
    """Record the duration of a pipeline stage."""
    PIPELINE_STAGE_DURATION.labels(stage=stage).observe(duration_seconds)


def record_cache_hit(namespace: str):
    """Record a cache hit."""
    CACHE_OPERATIONS.labels(type="hit", namespace=namespace).inc()


def record_cache_miss(namespace: str):
    """Record a cache miss."""
    CACHE_OPERATIONS.labels(type="miss", namespace=namespace).inc()


def record_pipeline_success():
    """Record a successful pipeline completion."""
    PIPELINE_STATUS.labels(status="success").inc()


def record_pipeline_error():
    """Record a pipeline error."""
    PIPELINE_STATUS.labels(status="error").inc()
