"""
FastAPI application — Agentic AI pipeline with Deep Research,
Multi-LLM Orchestration, and Human-in-the-Loop review endpoints.
"""

import uuid
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    QueryRequest, QueryResponse, ExtractedData,
    ReviewRequest, Source, PipelineStep,
)
from research import deep_research
from multi_llm import classify_query, extract_intelligence
from database import (
    insert_query, get_query_by_id, get_recent_queries, update_query_status,
)

app = FastAPI(
    title="QueryIQ — Agentic Intelligence Engine",
    description=(
        "Agentic AI pipeline that performs deep internet research, "
        "multi-LLM orchestration (Groq + Gemini), and human-in-the-loop "
        "review for structured intelligence extraction."
    ),
    version="2.0.0",
)

# CORS — allow all origins so the React frontend can call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "QueryIQ — Agentic Intelligence Engine",
        "version": "2.0.0",
        "features": [
            "Deep Research (Tavily)",
            "Multi-LLM Orchestration (Groq + Gemini)",
            "Human-in-the-Loop Reviews",
        ],
    }


@app.post("/queries", response_model=QueryResponse, tags=["Queries"])
async def create_query(request: QueryRequest):
    """
    Agentic AI Pipeline — Full orchestration:
      1. CLASSIFY (Groq/openai/gpt-oss-120b) → Determine query intent & complexity
      2. RESEARCH (Tavily) → Search live internet for context
      3. EXTRACT  (Groq/openai/gpt-oss-120b) → Extract structured intelligence from context
      4. SAVE     (Supabase) → Persist in 'pending_review' state for HITL
    """
    pipeline_steps = []
    total_start = time.time()

    try:
        # ═══════════════════════════════════════════════════════
        # STEP 1: CLASSIFY — Groq / openai/gpt-oss-120b
        # ═══════════════════════════════════════════════════════
        step1_start = time.time()
        classification = classify_query(request.query)
        step1_ms = int((time.time() - step1_start) * 1000)

        pipeline_steps.append({
            "step": 1,
            "name": "Query Classification",
            "model": classification.get("model_used", "openai/gpt-oss-120b (Groq)"),
            "status": "completed",
            "duration_ms": step1_ms,
            "details": f"Intent: {classification.get('intent_category', 'N/A')} | "
                       f"Complexity: {classification.get('complexity', 'N/A')} | "
                       f"Needs Research: {classification.get('needs_research', True)}",
        })

        # ═══════════════════════════════════════════════════════
        # STEP 2: DEEP RESEARCH — Tavily (live internet search)
        # ═══════════════════════════════════════════════════════
        sources = []
        research_context = ""
        research_summary_from_tavily = ""

        step2_start = time.time()
        if classification.get("needs_research", True):
            # Use the first optimized search query from the classifier
            search_queries = classification.get("search_queries", [request.query])
            search_query = search_queries[0] if search_queries else request.query

            research_data = deep_research(search_query)
            sources = research_data.get("sources", [])
            research_context = research_data.get("research_context", "")
            research_summary_from_tavily = research_data.get("tavily_summary", "")

        step2_ms = int((time.time() - step2_start) * 1000)

        pipeline_steps.append({
            "step": 2,
            "name": "Deep Research",
            "model": "Tavily Search API",
            "status": "completed" if sources else "skipped",
            "duration_ms": step2_ms,
            "details": f"Found {len(sources)} sources" if sources else "Skipped — LLM knowledge sufficient",
        })

        # ═══════════════════════════════════════════════════════
        # STEP 3: EXTRACT — Groq openai/gpt-oss-120b (with research context)
        # ═══════════════════════════════════════════════════════
        step3_start = time.time()

        extracted = extract_intelligence(
            raw_query=request.query,
            research_context=research_context,
            sources=sources,
        )
        extractor_model = extracted.get("model_used", "openai/gpt-oss-120b (Groq)")

        step3_ms = int((time.time() - step3_start) * 1000)

        pipeline_steps.append({
            "step": 3,
            "name": "Intelligence Extraction",
            "model": extractor_model,
            "status": "completed",
            "duration_ms": step3_ms,
            "details": f"Confidence: {extracted.get('confidence_score', 0):.0%}",
        })

        # ═══════════════════════════════════════════════════════
        # STEP 4: SAVE — Supabase (pending_review for HITL)
        # ═══════════════════════════════════════════════════════
        step4_start = time.time()
        query_id = str(uuid.uuid4())

        # Use research summary from extraction, fallback to Tavily's
        research_summary = extracted.get("research_summary", "") or research_summary_from_tavily

        saved = insert_query(
            query_id=query_id,
            raw_query=request.query,
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
            extractor_model=extractor_model,
            research_summary=research_summary,
        )

        step4_ms = int((time.time() - step4_start) * 1000)

        pipeline_steps.append({
            "step": 4,
            "name": "Save to Database",
            "model": "Supabase PostgreSQL",
            "status": "completed",
            "duration_ms": step4_ms,
            "details": "Saved as 'Pending Review' for human approval",
        })

        # Build source objects for response
        source_objects = [
            Source(
                title=s.get("title", "Untitled"),
                url=s.get("url", ""),
                snippet=s.get("snippet", ""),
            )
            for s in sources
        ]

        pipeline_step_objects = [PipelineStep(**step) for step in pipeline_steps]

        # Build response
        return QueryResponse(
            id=query_id,
            raw_query=request.query,
            extracted_data=ExtractedData(
                topic=extracted["topic"],
                geography=extracted["geography"],
                industry=extracted["industry"],
                entity_type=extracted["entity_type"],
                intent=extracted["intent"],
                keywords=extracted["keywords"],
                confidence_score=extracted["confidence_score"],
                research_summary=research_summary,
            ),
            created_at=saved.get("created_at", ""),
            status="pending_review",
            sources=source_objects,
            pipeline_steps=pipeline_step_objects,
            classifier_model=classification.get("model_used", ""),
            extractor_model=extractor_model,
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# ═══════════════════════════════════════════════════════════════
# HUMAN-IN-THE-LOOP: Review Endpoints
# ═══════════════════════════════════════════════════════════════

@app.patch("/queries/{query_id}/review", response_model=QueryResponse, tags=["HITL Review"])
async def review_query(query_id: str, review: ReviewRequest):
    """
    Human-in-the-Loop review endpoint.
    Approve or reject a pending query, with optional field edits.
    The human reviewer can modify any extracted field before committing.
    """
    # Check if query exists
    existing = get_query_by_id(query_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Query not found")

    # Build updates dict from the review request
    updates = {}
    for field in ["topic", "geography", "industry", "entity_type", "intent", "keywords", "confidence_score", "research_summary"]:
        value = getattr(review, field, None)
        if value is not None:
            updates[field] = value

    # Update the database
    updated = update_query_status(
        query_id=query_id,
        status=review.status.value,
        updates=updates if updates else None,
    )

    if updated is None:
        raise HTTPException(status_code=500, detail="Failed to update query")

    # Re-fetch full record to get consistent data
    row = get_query_by_id(query_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Query not found after update")

    return _row_to_response(row)


@app.get("/queries/{query_id}", response_model=QueryResponse, tags=["Queries"])
async def get_query(query_id: str):
    """
    Retrieve a previously processed query by its UUID.
    """
    row = get_query_by_id(query_id)

    if row is None:
        raise HTTPException(status_code=404, detail="Query not found")

    return _row_to_response(row)


@app.get("/queries", response_model=list[QueryResponse], tags=["Queries"])
async def list_queries():
    """
    Retrieve the 10 most recent queries.
    """
    rows = get_recent_queries(limit=10)
    return [_row_to_response(row) for row in rows]


def _row_to_response(row: dict) -> QueryResponse:
    """Convert a database row dict into a QueryResponse."""
    # Parse sources
    raw_sources = row.get("sources", [])
    if isinstance(raw_sources, str):
        import json
        try:
            raw_sources = json.loads(raw_sources)
        except:
            raw_sources = []

    source_objects = [
        Source(
            title=s.get("title", "Untitled") if isinstance(s, dict) else "Untitled",
            url=s.get("url", "") if isinstance(s, dict) else "",
            snippet=s.get("snippet", "") if isinstance(s, dict) else "",
        )
        for s in (raw_sources or [])
    ]

    # Parse pipeline steps
    raw_steps = row.get("pipeline_steps", [])
    if isinstance(raw_steps, str):
        import json
        try:
            raw_steps = json.loads(raw_steps)
        except:
            raw_steps = []

    step_objects = [
        PipelineStep(**step) if isinstance(step, dict) else step
        for step in (raw_steps or [])
    ]

    return QueryResponse(
        id=row["id"],
        raw_query=row["raw_query"],
        extracted_data=ExtractedData(
            topic=row.get("topic", "Unknown"),
            geography=row.get("geography", "Unknown"),
            industry=row.get("industry", "Unknown"),
            entity_type=row.get("entity_type", "Unknown"),
            intent=row.get("intent", "Unknown"),
            keywords=row.get("keywords", []),
            confidence_score=row.get("confidence_score", 0),
            research_summary=row.get("research_summary", ""),
        ),
        created_at=row.get("created_at", ""),
        status=row.get("status", "pending_review"),
        sources=source_objects,
        pipeline_steps=step_objects,
        classifier_model=row.get("classifier_model", ""),
        extractor_model=row.get("extractor_model", ""),
    )
