"""
Groq API integration — prompt engineering and JSON parsing.
"""

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an intelligence extraction engine. Your job is to analyze research queries and extract structured information.

RULES:
- Always respond in pure JSON only — no markdown, no code fences, no extra text.
- Every field must be present in your response.
- confidence_score must be a float between 0 and 1.
- keywords must be an array of strings.
- If a field cannot be determined, use "Unknown" for strings or an empty array for keywords."""

USER_PROMPT_TEMPLATE = """Extract structured information from this research query and return JSON with exactly these fields:

- topic (string): The main topic or subject
- geography (string): The geographic region mentioned or implied
- industry (string): The industry or sector
- entity_type (string): The type of entity referenced (e.g., company, person, product, market, technology, organization)
- intent (string): The underlying purpose or intent of the query
- keywords (array of strings): Key terms and phrases
- confidence_score (float 0-1): Your confidence in the extraction accuracy

Research query: "{query}"
"""


def extract_query_intelligence(raw_query: str) -> dict:
    """
    Send the raw query to Groq (LLaMA 3) and parse the structured JSON response.

    Args:
        raw_query: The natural language research query.

    Returns:
        A dictionary with extracted fields.

    Raises:
        ValueError: If the model returns invalid or unparseable JSON.
        Exception: If the API call fails.
    """
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT_TEMPLATE.format(query=raw_query)},
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        response_text = chat_completion.choices[0].message.content.strip()

        # Handle cases where model wraps JSON in code fences despite instructions
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        extracted = json.loads(response_text)

        # Validate required fields exist
        required_fields = [
            "topic", "geography", "industry",
            "entity_type", "intent", "keywords", "confidence_score",
        ]
        for field in required_fields:
            if field not in extracted:
                extracted[field] = "Unknown" if field != "keywords" else []
                if field == "confidence_score":
                    extracted[field] = 0.0

        # Clamp confidence score
        extracted["confidence_score"] = max(0.0, min(1.0, float(extracted["confidence_score"])))

        return extracted

    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}")
    except Exception as e:
        raise RuntimeError(f"Groq API error: {e}")
