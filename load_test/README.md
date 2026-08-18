# QueryIQ Load Testing

## Prerequisites

```bash
pip install locust
```

## Quick Start (Headless)

Run 50 concurrent users, ramping up 5 users/second, for 1 minute:

```bash
locust -f locustfile.py --headless -u 50 -r 5 --run-time 1m --host http://localhost:8000
```

## Web UI Mode

Start Locust with the web interface:

```bash
locust -f locustfile.py --host http://localhost:8000
```

Then open [http://localhost:8089](http://localhost:8089) in your browser.

## Test Scenarios

| Task | Weight | Description |
|------|--------|-------------|
| Submit Query | 5x | POST /queries with random research queries |
| Health Check | 3x | GET / to verify API is online |
| List Queries | 2x | GET /queries to fetch recent results |
| 404 Test | 1x | GET /queries/{fake-id} to test error handling |

## Generate HTML Report

```bash
locust -f locustfile.py --headless -u 50 -r 5 --run-time 2m --host http://localhost:8000 --html report.html
```

## Tips

- Monitor Grafana dashboard at `http://localhost:3001` during load tests
- Watch Celery worker logs: `docker-compose logs -f worker`
- Scale workers: `docker-compose up -d --scale worker=5`
