"""
Pydantic models for request/response validation.
Updated to support: Deep Research, Multi-LLM Pipeline, and Human-in-the-Loop reviews.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ReviewStatus(str, Enum):
    """Status of a query in the Human-in-the-Loop pipeline."""
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class QueryRequest(BaseModel):
    """Input model — accepts a single natural language query string."""
    query: str = Field(..., min_length=1, description="The raw research query to analyze")


class Source(BaseModel):
    """A research source from the deep research agent."""
    title: str = Field(default="Untitled", description="Title of the source article")
    url: str = Field(default="", description="URL of the source")
    snippet: str = Field(default="", description="Brief excerpt from the source")


class PipelineStep(BaseModel):
    """A single step in the agentic pipeline."""
    step: int = Field(..., description="Step number in the pipeline")
    name: str = Field(..., description="Name of the pipeline stage")
    model: str = Field(default="", description="LLM model used for this step")
    status: str = Field(default="completed", description="Step status")
    duration_ms: Optional[int] = Field(default=None, description="Step duration in milliseconds")
    details: Optional[str] = Field(default=None, description="Additional details about this step")


class ExtractedData(BaseModel):
    """Structured intelligence extracted from the raw query via multi-LLM pipeline."""
    topic: str = Field(..., description="Main topic or subject of the query")
    geography: str = Field(..., description="Geographic region referenced in the query")
    industry: str = Field(..., description="Industry or sector the query relates to")
    entity_type: str = Field(..., description="Type of entity (company, person, product, etc.)")
    intent: str = Field(..., description="The underlying intent or purpose of the query")
    keywords: List[str] = Field(default_factory=list, description="Key terms extracted from the query")
    confidence_score: float = Field(..., ge=0, le=1, description="Model confidence in extraction accuracy (0-1)")
    research_summary: Optional[str] = Field(default="", description="Summary of findings from deep research")


class QueryResponse(BaseModel):
    """Full response returned to the client after processing a query."""
    id: str = Field(..., description="Unique identifier for the query record")
    raw_query: str = Field(..., description="The original query text submitted")
    extracted_data: ExtractedData
    created_at: str = Field(..., description="ISO timestamp of when the query was processed")
    # ── New agentic fields ──
    status: str = Field(default="pending_review", description="Review status: pending_review, approved, rejected")
    sources: List[Source] = Field(default_factory=list, description="Research sources from deep web search")
    pipeline_steps: List[PipelineStep] = Field(default_factory=list, description="Steps executed in the agentic pipeline")
    classifier_model: Optional[str] = Field(default=None, description="Model used for classification")
    extractor_model: Optional[str] = Field(default=None, description="Model used for extraction")


class ReviewRequest(BaseModel):
    """Request to approve or reject a pending query with optional edits."""
    status: ReviewStatus = Field(..., description="New status: approved or rejected")
    # Optional field edits (Human-in-the-Loop)
    topic: Optional[str] = Field(default=None)
    geography: Optional[str] = Field(default=None)
    industry: Optional[str] = Field(default=None)
    entity_type: Optional[str] = Field(default=None)
    intent: Optional[str] = Field(default=None)
    keywords: Optional[List[str]] = Field(default=None)
    confidence_score: Optional[float] = Field(default=None, ge=0, le=1)
    research_summary: Optional[str] = Field(default=None)
