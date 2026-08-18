"""
Celery tasks for the QueryIQ async pipeline.

Pipeline Stages:
  1. classify_query_task — Intent classification via Groq
  2. deep_research_task — Live internet research via Tavily
  3. extract_intelligence_task — Structured extraction via Groq
  4. save_query_task — Persist to Supabase with 'pending_review' status

Each task publishes SSE events via Redis Pub/Sub so the frontend
can display real-time progress.
"""

import os
import sys
import uuid
import time
import logging

# Ensure module directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from celery_app import celery_app
from sse import publish_stage_event, publish_completion_event, publish_error_event
from cache import (
    get_cached_groq_classification, cache_groq_classification,
    get_cached_tavily, cache_tavily,
    get_cached_groq_extraction, cache_groq_extraction,
)
try:
    from metrics import (
        record_stage_duration, record_pipeline_success, record_pipeline_error
    )
except ImportError:
    def record_stage_duration(s, d): pass
    def record_pipeline_success(): pass
    def record_pipeline_error(): pass

logger = logging.getLogger("queryiq.tasks")


@celery_app.task(bind=True, name="tasks.classify_query_task", max_retries=2)
def classify_query_task(self, query_id: str, raw_query: str) -> dict:
    """
    Stage 1: Classify query intent using Groq.
    Returns classification dict with intent, complexity, search queries.
    """
    publish_stage_event(query_id, "classify", "started", "Classifying query intent...")

    start = time.time()

    try:
        # Check cache first
        cached = get_cached_groq_classification(raw_query)
        if cached:
            duration_ms = int((time.time() - start) * 1000)
            publish_stage_event(query_id, "classify", "completed",
                              f"Intent: {cached.get('intent_category', 'N/A')} (cached)", duration_ms)
            return {
                "query_id": query_id,
                "raw_query": raw_query,
                "classification": cached,
                "cached": True,
            }

        from multi_llm import classify_query
        classification = classify_query(raw_query)

        # Cache the result
        cache_groq_classification(raw_query, classification)

        duration_ms = int((time.time() - start) * 1000)
        record_stage_duration("classify", time.time() - start)
        publish_stage_event(query_id, "classify", "completed",
                          f"Intent: {classification.get('intent_category', 'N/A')} | "
                          f"Complexity: {classification.get('complexity', 'N/A')}", duration_ms)

        return {
            "query_id": query_id,
            "raw_query": raw_query,
            "classification": classification,
            "cached": False,
        }

    except Exception as e:
        record_pipeline_error()
        logger.error(f"[TASK] Classification failed: {e}")
        publish_stage_event(query_id, "classify", "error", str(e))
        raise self.retry(exc=e, countdown=3)


@celery_app.task(bind=True, name="tasks.deep_research_task", max_retries=2)
def deep_research_task(self, classify_result: dict) -> dict:
    """
    Stage 2: Perform deep internet research using Tavily.
    Receives output from classify_query_task.
    """
    query_id = classify_result["query_id"]
    raw_query = classify_result["raw_query"]
    classification = classify_result["classification"]

    publish_stage_event(query_id, "research", "started", "Searching live internet...")

    start = time.time()
    sources = []
    research_context = ""
    tavily_summary = ""

    try:
        if classification.get("needs_research", True):
            search_queries = classification.get("search_queries", [raw_query])
            search_query = search_queries[0] if search_queries else raw_query

            # Check cache first
            cached = get_cached_tavily(search_query)
            if cached:
                sources = cached.get("sources", [])
                research_context = cached.get("research_context", "")
                tavily_summary = cached.get("tavily_summary", "")
                duration_ms = int((time.time() - start) * 1000)
                publish_stage_event(query_id, "research", "completed",
                                  f"Found {len(sources)} sources (cached)", duration_ms)
            else:
                from research import deep_research
                research_data = deep_research(search_query)
                sources = research_data.get("sources", [])
                research_context = research_data.get("research_context", "")
                tavily_summary = research_data.get("tavily_summary", "")

                # Cache the result
                cache_tavily(search_query, research_data)

                duration_ms = int((time.time() - start) * 1000)
                record_stage_duration("research", time.time() - start)
                publish_stage_event(query_id, "research", "completed",
                                  f"Found {len(sources)} sources", duration_ms)
        else:
            duration_ms = int((time.time() - start) * 1000)
            record_stage_duration("research", time.time() - start)
            publish_stage_event(query_id, "research", "completed",
                              "Skipped — LLM knowledge sufficient", duration_ms)

        return {
            **classify_result,
            "sources": sources,
            "research_context": research_context,
            "tavily_summary": tavily_summary,
        }

    except Exception as e:
        logger.error(f"[TASK] Research failed: {e}")
        publish_stage_event(query_id, "research", "error", str(e))
        # Continue with empty research on failure (non-critical stage)
        return {
            **classify_result,
            "sources": [],
            "research_context": "",
            "tavily_summary": "",
            "research_error": str(e),
        }


@celery_app.task(bind=True, name="tasks.extract_intelligence_task", max_retries=2)
def extract_intelligence_task(self, research_result: dict) -> dict:
    """
    Stage 3: Extract structured intelligence using Groq.
    Receives output from deep_research_task.
    """
    query_id = research_result["query_id"]
    raw_query = research_result["raw_query"]
    research_context = research_result.get("research_context", "")
    sources = research_result.get("sources", [])

    publish_stage_event(query_id, "extract", "started", "Extracting structured intelligence...")

    start = time.time()

    try:
        # Build a cache key from query + context hash
        cache_input = f"{raw_query}::{research_context[:500]}"

        cached = get_cached_groq_extraction(cache_input)
        if cached:
            duration_ms = int((time.time() - start) * 1000)
            publish_stage_event(query_id, "extract", "completed",
                              f"Confidence: {cached.get('confidence_score', 0):.0%} (cached)", duration_ms)
            return {
                **research_result,
                "extracted": cached,
            }

        from multi_llm import extract_intelligence
        extracted = extract_intelligence(
            raw_query=raw_query,
            research_context=research_context,
            sources=sources,
        )

        # Cache the result
        cache_groq_extraction(cache_input, extracted)

        duration_ms = int((time.time() - start) * 1000)
        record_stage_duration("extract", time.time() - start)
        publish_stage_event(query_id, "extract", "completed",
                          f"Confidence: {extracted.get('confidence_score', 0):.0%}", duration_ms)

        return {
            **research_result,
            "extracted": extracted,
        }

    except Exception as e:
        record_pipeline_error()
        logger.error(f"[TASK] Extraction failed: {e}")
        publish_stage_event(query_id, "extract", "error", str(e))
        raise self.retry(exc=e, countdown=3)


@celery_app.task(bind=True, name="tasks.save_query_task", max_retries=2)
def save_query_task(self, extraction_result: dict) -> dict:
    """
    Stage 4: Save extracted data to Supabase with 'pending_review' status.
    Receives output from extract_intelligence_task.
    Publishes completion event with the full response.
    """
    query_id = extraction_result["query_id"]
    raw_query = extraction_result["raw_query"]
    classification = extraction_result["classification"]
    extracted = extraction_result["extracted"]
    sources = extraction_result.get("sources", [])
    tavily_summary = extraction_result.get("tavily_summary", "")

    publish_stage_event(query_id, "save", "started", "Saving for human review...")

    start = time.time()

    try:
        # Build pipeline steps record
        pipeline_steps = [
            {
                "step": 1,
                "name": "Query Classification",
                "model": classification.get("model_used", "openai/gpt-oss-120b (Groq)"),
                "status": "completed",
                "details": f"Intent: {classification.get('intent_category', 'N/A')} | "
                          f"Complexity: {classification.get('complexity', 'N/A')}",
            },
            {
                "step": 2,
                "name": "Deep Research",
                "model": "Tavily Search API",
                "status": "completed" if sources else "skipped",
                "details": f"Found {len(sources)} sources" if sources else "Skipped",
            },
            {
                "step": 3,
                "name": "Intelligence Extraction",
                "model": extracted.get("model_used", "openai/gpt-oss-120b (Groq)"),
                "status": "completed",
                "details": f"Confidence: {extracted.get('confidence_score', 0):.0%}",
            },
        ]

        research_summary = extracted.get("research_summary", "") or tavily_summary

        from database import insert_query
        saved = insert_query(
            query_id=query_id,
            raw_query=raw_query,
            topic=extracted["topic"],
            geography=extracted["geography"],
            industry=extracted["industry"],
            entity_type=extracted["entity_type"],
            intent=extracted["intent"],
            keywords=extracted["keywords"],
            confidence_score=extracted["confidence_score"],
            status="pending_review",
            sources=[s if isinstance(s, dict) else s for s in sources],
            pipeline_steps=pipeline_steps,
            classifier_model=classification.get("model_used", ""),
            extractor_model=extracted.get("model_used", ""),
            research_summary=research_summary,
        )

        duration_ms = int((time.time() - start) * 1000)
        record_stage_duration("save", time.time() - start)
        record_pipeline_success()

        pipeline_steps.append({
            "step": 4,
            "name": "Save to Database",
            "model": "Supabase PostgreSQL",
            "status": "completed",
            "duration_ms": duration_ms,
            "details": "Saved as 'Pending Review' for human approval",
        })

        publish_stage_event(query_id, "save", "completed",
                          "Saved as 'Pending Review'", duration_ms)

        # Build the full response for the completion event
        result = {
            "id": query_id,
            "raw_query": raw_query,
            "extracted_data": {
                "topic": extracted["topic"],
                "geography": extracted["geography"],
                "industry": extracted["industry"],
                "entity_type": extracted["entity_type"],
                "intent": extracted["intent"],
                "keywords": extracted["keywords"],
                "confidence_score": extracted["confidence_score"],
                "research_summary": research_summary,
            },
            "created_at": saved.get("created_at", ""),
            "status": "pending_review",
            "sources": [
                {
                    "title": s.get("title", "Untitled") if isinstance(s, dict) else "Untitled",
                    "url": s.get("url", "") if isinstance(s, dict) else "",
                    "snippet": s.get("snippet", "") if isinstance(s, dict) else "",
                }
                for s in sources
            ],
            "pipeline_steps": pipeline_steps,
            "classifier_model": classification.get("model_used", ""),
            "extractor_model": extracted.get("model_used", ""),
        }

        # Publish final completion event
        publish_completion_event(query_id, result)

        return result

    except Exception as e:
        logger.error(f"[TASK] Save failed: {e}")
        publish_stage_event(query_id, "save", "error", str(e))
        publish_error_event(query_id, str(e))
        raise self.retry(exc=e, countdown=3)


def run_pipeline_async(query_id: str, raw_query: str):
    """
    Kick off the full async pipeline as a Celery chain.
    Returns the AsyncResult for tracking.

    Chain: classify → research → extract → save
    """
    from celery import chain

    pipeline = chain(
        classify_query_task.s(query_id, raw_query),
        deep_research_task.s(),
        extract_intelligence_task.s(),
        save_query_task.s(),
    )

    return pipeline.apply_async()
