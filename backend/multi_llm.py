"""
Multi-LLM Orchestration Pipeline — Groq GPT-OSS 120B + Tavily Research.

Pipeline Architecture:
  1. CLASSIFIER (Groq / openai/gpt-oss-120b — fast & powerful)
     → Classifies query intent and determines complexity
  2. EXTRACTOR (Groq / openai/gpt-oss-120b — with Tavily research context)
     → Reads research context + query, extracts structured JSON intelligence
"""

import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ── Model Client ──
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
print(f"[INIT] Groq API key: {'[OK] loaded' if os.getenv('GROQ_API_KEY') else '[FAIL] NOT SET'}")


# ═══════════════════════════════════════════════════════════════
# STAGE 1: CLASSIFIER — Groq / openai/gpt-oss-120b
# ═══════════════════════════════════════════════════════════════

CLASSIFIER_PROMPT = """You are a query classifier. Analyze the research query and return a JSON object with:

- intent_category: one of ["market_research", "competitive_analysis", "technology_trends", "industry_overview", "company_profiling", "geographic_analysis", "investment_research", "general_inquiry"]
- complexity: one of ["simple", "moderate", "complex"]
- needs_research: boolean — true if the query needs live internet data for accuracy, false if LLM knowledge is sufficient
- search_queries: array of 1-3 optimized search queries to use for internet research (only if needs_research is true, else empty array)
- reasoning: brief explanation of your classification

Respond in pure JSON only — no markdown, no code fences."""


def classify_query(raw_query: str) -> dict:
    """Stage 1: Use Groq (openai/gpt-oss-120b) to classify the query intent."""
    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": CLASSIFIER_PROMPT},
                {"role": "user", "content": f'Classify this research query: "{raw_query}"'},
            ],
            temperature=0.2,
            max_tokens=512,
            response_format={"type": "json_object"},
        )

        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])

        classification = json.loads(text)
        classification.setdefault("intent_category", "general_inquiry")
        classification.setdefault("complexity", "moderate")
        classification.setdefault("needs_research", True)
        classification.setdefault("search_queries", [raw_query])
        classification.setdefault("reasoning", "")

        return {
            "model_used": "openai/gpt-oss-120b (Groq)",
            "stage": "classification",
            **classification,
        }

    except Exception as e:
        return {
            "model_used": "openai/gpt-oss-120b (Groq)",
            "stage": "classification",
            "intent_category": "general_inquiry",
            "complexity": "moderate",
            "needs_research": True,
            "search_queries": [raw_query],
            "reasoning": f"Fallback due to error: {str(e)}",
            "error": str(e),
        }


# ═══════════════════════════════════════════════════════════════
# STAGE 2: EXTRACTOR — Groq / openai/gpt-oss-120b (with research context)
# ═══════════════════════════════════════════════════════════════

EXTRACTOR_PROMPT = """You are an advanced intelligence extraction engine. You analyze research queries along with live internet research data to extract highly accurate, real-time structured information.

RULES:
- Always respond in pure JSON only — no markdown, no code fences, no extra text.
- Every field must be present in your response.
- confidence_score must be a float between 0 and 1.
- keywords must be an array of strings.
- If a field cannot be determined, use "Unknown" for strings or an empty array for keywords.
- Use the provided research context to make your extraction as accurate and current as possible.
- If research data contradicts your training data, prefer the research data as it is more recent."""


def build_extraction_prompt(raw_query: str, research_context: str = "", sources: list = None) -> str:
    """Build the extraction prompt with optional research context."""
    source_text = ""
    if sources:
        source_list = "\n".join(
            [f"  - {s.get('title', 'N/A')} ({s.get('url', 'N/A')})" for s in sources[:5]]
        )
        source_text = f"\n\nResearch Sources:\n{source_list}"

    context_block = ""
    if research_context:
        context_block = f"""

LIVE RESEARCH DATA (from internet search):
---
{research_context[:6000]}
---
{source_text}
"""

    return f"""Extract structured information from this research query and return JSON with exactly these fields:

- topic (string): The main topic or subject
- geography (string): The geographic region mentioned or implied
- industry (string): The industry or sector
- entity_type (string): The type of entity referenced (e.g., company, person, product, market, technology, organization)
- intent (string): The underlying purpose or intent of the query
- keywords (array of strings): Key terms and phrases
- confidence_score (float 0-1): Your confidence in the extraction accuracy
- research_summary (string): A 2-3 sentence summary of the key findings from the research data. If no research data is available, summarize based on your knowledge.

Research query: "{raw_query}"
{context_block}"""


def extract_intelligence(raw_query: str, research_context: str = "", sources: list = None) -> dict:
    """
    Stage 2: Use Groq (openai/gpt-oss-120b) to extract structured intelligence.
    Enhanced with Tavily research context for real-time accuracy.
    """
    try:
        prompt = build_extraction_prompt(raw_query, research_context, sources)

        print(f"[EXTRACT] Calling Groq openai/gpt-oss-120b...")

        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": EXTRACTOR_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        text = response.choices[0].message.content.strip()
        print(f"[EXTRACT] [OK] Success! Response length: {len(text)} chars")

        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])

        extracted = json.loads(text)

        required_fields = [
            "topic", "geography", "industry",
            "entity_type", "intent", "keywords", "confidence_score",
        ]
        for field in required_fields:
            if field not in extracted:
                if field == "keywords":
                    extracted[field] = []
                elif field == "confidence_score":
                    extracted[field] = 0.0
                else:
                    extracted[field] = "Unknown"

        extracted.setdefault("research_summary", "")
        extracted["confidence_score"] = max(0.0, min(1.0, float(extracted["confidence_score"])))

        return {
            "model_used": "openai/gpt-oss-120b (Groq)",
            "stage": "extraction",
            **extracted,
        }

    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}")
    except Exception as e:
        raise RuntimeError(f"Groq extraction error: {e}")
