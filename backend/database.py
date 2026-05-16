"""
Supabase client setup and database operations.
Updated to support: status tracking, sources, pipeline metadata, and HITL reviews.
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

try:
    from supabase import create_client, Client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except ImportError:
    from supabase._sync.client import SyncClient as Client
    from supabase._sync.client import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def insert_query(
    query_id: str,
    raw_query: str,
    topic: str,
    geography: str,
    industry: str,
    entity_type: str,
    intent: str,
    keywords: list,
    confidence_score: float,
    status: str = "pending_review",
    sources: list = None,
    pipeline_steps: list = None,
    classifier_model: str = None,
    extractor_model: str = None,
    research_summary: str = "",
) -> dict:
    """
    Insert a processed query record into the `queries` table.
    New records default to 'pending_review' status for HITL workflow.

    Returns:
        The inserted row as a dictionary.
    """
    data = {
        "id": query_id,
        "raw_query": raw_query,
        "topic": topic,
        "geography": geography,
        "industry": industry,
        "entity_type": entity_type,
        "intent": intent,
        "keywords": keywords,
        "confidence_score": confidence_score,
        "status": status,
        "sources": json.dumps(sources or []),
        "pipeline_steps": json.dumps(pipeline_steps or []),
        "classifier_model": classifier_model or "",
        "extractor_model": extractor_model or "",
        "research_summary": research_summary or "",
    }

    response = supabase.table("queries").insert(data).execute()
    return response.data[0] if response.data else data


def update_query_status(
    query_id: str,
    status: str,
    updates: dict = None,
) -> dict | None:
    """
    Update a query's review status and optionally edit extracted fields.
    Used by the HITL approve/reject workflow.

    Args:
        query_id: UUID of the query to update.
        status: New status ('approved' or 'rejected').
        updates: Optional dict of field edits from the human reviewer.

    Returns:
        The updated row as a dictionary, or None if not found.
    """
    data = {"status": status}

    # Apply any human edits
    if updates:
        editable_fields = [
            "topic", "geography", "industry", "entity_type",
            "intent", "keywords", "confidence_score", "research_summary",
        ]
        for field in editable_fields:
            if field in updates and updates[field] is not None:
                data[field] = updates[field]

    response = (
        supabase.table("queries")
        .update(data)
        .eq("id", query_id)
        .execute()
    )

    if response.data and len(response.data) > 0:
        return response.data[0]
    return None


def get_query_by_id(query_id: str) -> dict | None:
    """
    Fetch a single query record by its UUID.

    Returns:
        The row as a dictionary, or None if not found.
    """
    response = (
        supabase.table("queries")
        .select("*")
        .eq("id", query_id)
        .execute()
    )

    if response.data and len(response.data) > 0:
        row = response.data[0]
        # Parse JSON fields back to Python objects
        row = _parse_json_fields(row)
        return row
    return None


def get_recent_queries(limit: int = 10) -> list:
    """
    Fetch the most recent queries, ordered by created_at descending.

    Returns:
        A list of query row dictionaries.
    """
    response = (
        supabase.table("queries")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    rows = response.data if response.data else []
    return [_parse_json_fields(row) for row in rows]


def _parse_json_fields(row: dict) -> dict:
    """Parse JSON string fields back to Python objects."""
    for field in ["sources", "pipeline_steps"]:
        if field in row and isinstance(row[field], str):
            try:
                row[field] = json.loads(row[field])
            except (json.JSONDecodeError, TypeError):
                row[field] = []
    return row
