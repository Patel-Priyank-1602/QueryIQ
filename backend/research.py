"""
Deep Research Agent — Uses Tavily API to search the live internet,
retrieve relevant articles, and build enriched context for LLM extraction.

This module implements the "agentic" behavior:
1. Searches the internet for real-time information
2. Retrieves and summarizes top articles
3. Returns structured research context for the extraction LLM
"""

import os
from dotenv import load_dotenv

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")


def deep_research(query: str, max_results: int = 5) -> dict:
    """
    Perform deep internet research on a query using Tavily API.

    Args:
        query: The natural language research query.
        max_results: Maximum number of search results to retrieve.

    Returns:
        A dictionary with:
        - sources: list of {title, url, snippet} dicts
        - research_context: concatenated text from top articles
        - search_query: the query used for searching
    """
    try:
        from tavily import TavilyClient

        client = TavilyClient(api_key=TAVILY_API_KEY)

        # Perform a deep search with article content extraction
        response = client.search(
            query=query,
            search_depth="advanced",
            max_results=max_results,
            include_raw_content=False,
            include_answer=True,
        )

        sources = []
        context_parts = []

        for result in response.get("results", []):
            source = {
                "title": result.get("title", "Untitled"),
                "url": result.get("url", ""),
                "snippet": result.get("content", "")[:500],
            }
            sources.append(source)
            context_parts.append(
                f"Source: {source['title']}\nURL: {source['url']}\n{result.get('content', '')}"
            )

        # Tavily's built-in answer (AI-generated summary)
        tavily_answer = response.get("answer", "")

        research_context = "\n\n---\n\n".join(context_parts)

        return {
            "sources": sources,
            "research_context": research_context[:8000],  # Cap context length
            "tavily_summary": tavily_answer,
            "search_query": query,
            "results_count": len(sources),
        }

    except ImportError:
        return {
            "sources": [],
            "research_context": "",
            "tavily_summary": "",
            "search_query": query,
            "results_count": 0,
            "error": "tavily-python not installed",
        }
    except Exception as e:
        return {
            "sources": [],
            "research_context": "",
            "tavily_summary": "",
            "search_query": query,
            "results_count": 0,
            "error": str(e),
        }
