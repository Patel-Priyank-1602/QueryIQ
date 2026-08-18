"""
Backend tests for QueryIQ pipeline.

Tests health endpoints, schema validation, cache key generation,
and task formatting without requiring external API keys.
"""

import pytest
import json
import hashlib


# ── Test: Health Endpoint ──
def test_health_endpoint():
    """Verify the health check response structure."""
    from fastapi.testclient import TestClient
    import os

    # Ensure sync mode for testing
    os.environ["ASYNC_PIPELINE"] = "false"

    from main import app
    client = TestClient(app)

    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "QueryIQ" in data["service"]
    assert "version" in data
    assert "features" in data


# ── Test: Schema Validation ──
def test_query_request_validation():
    """Verify QueryRequest rejects empty queries."""
    from schemas import QueryRequest
    from pydantic import ValidationError

    # Valid query
    req = QueryRequest(query="Test query about AI")
    assert req.query == "Test query about AI"

    # Empty query should fail
    with pytest.raises(ValidationError):
        QueryRequest(query="")


def test_extracted_data_schema():
    """Verify ExtractedData schema accepts valid data."""
    from schemas import ExtractedData

    data = ExtractedData(
        topic="AI Chips",
        geography="United States",
        industry="Semiconductors",
        entity_type="Technology",
        intent="Market Research",
        keywords=["AI", "chips", "NVIDIA"],
        confidence_score=0.95,
        research_summary="Test summary.",
    )
    assert data.topic == "AI Chips"
    assert data.confidence_score == 0.95
    assert len(data.keywords) == 3


def test_review_status_enum():
    """Verify ReviewStatus enum values."""
    from schemas import ReviewStatus

    assert ReviewStatus.PENDING_REVIEW == "pending_review"
    assert ReviewStatus.APPROVED == "approved"
    assert ReviewStatus.REJECTED == "rejected"


# ── Test: Cache Key Generation ──
def test_cache_key_generation():
    """Verify cache keys are deterministic and namespaced."""
    from cache import _make_cache_key

    key1 = _make_cache_key("tavily", "test query")
    key2 = _make_cache_key("tavily", "test query")
    key3 = _make_cache_key("groq", "test query")

    # Same input → same key
    assert key1 == key2
    # Different namespace → different key
    assert key1 != key3
    # Key starts with prefix
    assert key1.startswith("queryiq:tavily:")
    assert key3.startswith("queryiq:groq:")


def test_cache_key_uniqueness():
    """Verify different inputs produce different cache keys."""
    from cache import _make_cache_key

    key1 = _make_cache_key("tavily", "query A")
    key2 = _make_cache_key("tavily", "query B")
    assert key1 != key2


# ── Test: Pipeline Step Schema ──
def test_pipeline_step_schema():
    """Verify PipelineStep accepts valid step data."""
    from schemas import PipelineStep

    step = PipelineStep(
        step=1,
        name="Query Classification",
        model="openai/gpt-oss-120b (Groq)",
        status="completed",
        duration_ms=150,
        details="Intent: market_research",
    )
    assert step.step == 1
    assert step.status == "completed"
    assert step.duration_ms == 150


# ── Test: Source Schema ──
def test_source_schema():
    """Verify Source model defaults."""
    from schemas import Source

    # Default values
    source = Source()
    assert source.title == "Untitled"
    assert source.url == ""
    assert source.snippet == ""

    # Custom values
    source = Source(title="Test", url="https://example.com", snippet="A test snippet.")
    assert source.title == "Test"


# ── Test: Query Response Schema ──
def test_query_response_schema():
    """Verify QueryResponse builds correctly."""
    from schemas import QueryResponse, ExtractedData

    response = QueryResponse(
        id="test-uuid-1234",
        raw_query="Tell me about NVIDIA AI chips",
        extracted_data=ExtractedData(
            topic="AI Chips",
            geography="Global",
            industry="Semiconductors",
            entity_type="Company",
            intent="Research",
            keywords=["NVIDIA", "AI"],
            confidence_score=0.88,
        ),
        created_at="2026-08-18T00:00:00Z",
        status="pending_review",
    )
    assert response.id == "test-uuid-1234"
    assert response.status == "pending_review"
    assert response.extracted_data.confidence_score == 0.88


# ── Test: Empty Query Rejection via API ──
def test_create_query_empty_body():
    """Verify POST /queries rejects empty/invalid bodies."""
    from fastapi.testclient import TestClient
    import os

    os.environ["ASYNC_PIPELINE"] = "false"

    from main import app
    client = TestClient(app)

    # Missing query field
    response = client.post("/queries", json={})
    assert response.status_code == 422

    # Empty query string
    response = client.post("/queries", json={"query": ""})
    assert response.status_code == 422
