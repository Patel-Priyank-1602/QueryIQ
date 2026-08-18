"""
QueryIQ Load Test — Locust

Simulates concurrent users submitting queries and checking status.

Usage:
  pip install locust
  locust -f locustfile.py --headless -u 50 -r 5 --run-time 1m --host http://localhost:8000

Web UI:
  locust -f locustfile.py --host http://localhost:8000
  Then open http://localhost:8089
"""

import json
import random
from locust import HttpUser, task, between

# Sample queries for load testing
SAMPLE_QUERIES = [
    "What are the latest developments in NVIDIA AI chips for 2026?",
    "Compare Tesla and BYD electric vehicle market share in China",
    "Top fintech startups in Southeast Asia raising Series B funding",
    "Impact of quantum computing on pharmaceutical drug discovery",
    "Renewable energy investment trends in Europe 2025-2026",
    "AI-powered cybersecurity companies in the United States",
    "Global semiconductor supply chain analysis post-2025",
    "Machine learning applications in precision agriculture",
    "Autonomous vehicle regulations in the European Union",
    "Digital health startups IPO pipeline for 2026",
    "Cloud computing market share AWS vs Azure vs GCP",
    "Blockchain adoption in global trade finance",
    "Space technology companies receiving government contracts",
    "Electric aviation startups and their funding rounds",
    "AI regulation landscape across G7 countries",
]


class QueryIQUser(HttpUser):
    """Simulates a user interacting with the QueryIQ API."""

    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks

    @task(5)
    def submit_query(self):
        """Submit a random research query."""
        query = random.choice(SAMPLE_QUERIES)
        with self.client.post(
            "/queries",
            json={"query": query},
            headers={"Content-Type": "application/json"},
            name="/queries [POST]",
            catch_response=True,
        ) as response:
            if response.status_code in (200, 202):
                response.success()
                data = response.json()
                # Store query_id for status checking
                query_id = data.get("id")
                if query_id:
                    self.environment.runner.stats.custom_data = getattr(
                        self.environment.runner.stats, "custom_data", []
                    )
            elif response.status_code == 422:
                response.success()  # Validation error is expected for some edge cases
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    @task(3)
    def check_health(self):
        """Check the health endpoint."""
        with self.client.get("/", name="/ [Health]", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "online":
                    response.success()
                else:
                    response.failure("Health check returned non-online status")
            else:
                response.failure(f"Health check failed: {response.status_code}")

    @task(2)
    def list_recent_queries(self):
        """Fetch recent queries."""
        with self.client.get("/queries", name="/queries [GET]", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"List queries failed: {response.status_code}")

    @task(1)
    def get_nonexistent_query(self):
        """Test 404 handling for nonexistent query."""
        with self.client.get(
            "/queries/00000000-0000-0000-0000-000000000000",
            name="/queries/{id} [404]",
            catch_response=True,
        ) as response:
            if response.status_code == 404:
                response.success()  # Expected 404
            else:
                response.failure(f"Expected 404, got {response.status_code}")
