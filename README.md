<div align="center">

<img src="./frontend/public/fav.png" alt="QueryIQ Logo" width="110" />

# QueryIQ
### Distributed Autonomous Intelligence Engine & Scalable AI Pipeline

**Transforming natural language queries into structured, verified intelligence via Multi-LLM Orchestration, Live Internet Research, Distributed Celery Pipelines, and Real-Time SSE Streaming.**

[![Live Web App](https://img.shields.io/badge/🟢_Live_Web_App-queryiqsearch.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://queryiqsearch.vercel.app)
[![API Documentation](https://img.shields.io/badge/⚡_Live_API_Docs-pqueryiq--api.onrender.com-46E3B7?style=for-the-badge&logo=fastapi&logoColor=black)](https://pqueryiq-api.onrender.com/docs)
[![Load Test Status](https://img.shields.io/badge/Load_Test-100%25_Pass_(50_Users)-brightgreen?style=for-the-badge&logo=locust&logoColor=white)](https://pqueryiq-api.onrender.com)

<br />

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Celery](https://img.shields.io/badge/Task_Queue-Celery_5.4+-37814A?style=flat-square&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/Broker_&_Cache-Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Prometheus](https://img.shields.io/badge/Metrics-Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Dashboard-Grafana-F46800?style=flat-square&logo=grafana&logoColor=white)](https://grafana.com/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes_(k8s)-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Containers-Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Inference-Groq_GPT--OSS_120B-F55036?style=flat-square&logo=groq&logoColor=white)](https://groq.com/)
[![Tavily](https://img.shields.io/badge/Search-Tavily_AI-1E40AF?style=flat-square&logo=googlechrome&logoColor=white)](https://tavily.com/)

</div>

---

## 🎯 What is QueryIQ?

**QueryIQ** is an enterprise-grade, distributed autonomous intelligence engine. Given any unstructured research question (e.g., *"What is the market share and technology breakdown of AI GPU chips in 2026?"*), QueryIQ autonomously:

1. **Classifies intent and research requirements** with ultra-fast LLM inference.
2. **Executes live autonomous web search** to overcome LLM training cutoffs and hallucination.
3. **Synthesizes grounded intelligence into strict JSON schemas** with confidence scores and source citations.
4. **Enforces Human-in-the-Loop (HITL) moderation** with interactive review and instant export.
5. **Streams real-time stage progression** via Server-Sent Events (SSE) and Redis Pub/Sub.
6. **Caches results intelligently** using SHA256 hashed keys to minimize external API costs.
7. **Monitors cluster health, latency percentiles (p50/p95/p99), and throughput** via Prometheus and Grafana.

---

## 🏗️ Production Architecture

```mermaid
graph TD
    User([👨‍💻 User / Client]) -->|HTTPS / WSS| CDN[🌐 Vercel Global CDN (React 19 + TanStack Query)]
    CDN -->|REST API / SSE| API[⚙️ FastAPI Application Server (Render / k8s)]
    
    subgraph Distributed Backend Stack
        API -->|Enqueue Task Chain| Broker[(🔴 Redis 7 Broker)]
        API -->|SSE Pub/Sub Stream| PubSub[(🔴 Redis Pub/Sub)]
        API -->|Cache Read/Write| Cache[(🔴 Redis Cache - SHA256 1h TTL)]
        
        Broker -->|Task Ingestion| Worker[⚙️ Celery Worker Cluster (Prefork Pool)]
        Worker -->|Stage 1: Intent Classification| Groq1[🧠 Groq GPT-OSS 120B]
        Worker -->|Stage 2: Live Deep Search| Tavily[🔍 Tavily Search API]
        Worker -->|Stage 3: Structured Extraction| Groq2[🧠 Groq GPT-OSS 120B]
        Worker -->|Stage 4: Persist pending_review| Supabase[(🗄️ Supabase PostgreSQL)]
        Worker -->|Broadcast Stage Events| PubSub
    end

    subgraph Observability Stack
        Prometheus[📊 Prometheus Engine] -->|Scrapes /metrics (15s)| API
        Grafana[📈 Grafana Dashboard] -->|PromQL Queries| Prometheus
        Sentry[🚨 Sentry SDK] -->|Error & Trace Tracking| API
    end
```

---

## ⚡ Key Features & Engineering Highlights

### 1. 🔄 Asynchronous Distributed Pipeline (Celery + Redis)
- Decouples client HTTP connections from long-running LLM and web research workflows.
- `POST /queries` returns an asynchronous `task_id` in **< 50ms**, eliminating client timeouts.
- Dual-mode operation: Automatically uses Celery worker clusters when available with seamless zero-downtime fallback to synchronous in-memory execution.

### 2. 📡 Real-Time Server-Sent Events (SSE) Streaming
- Real-time Redis Pub/Sub broadcasts progress events (`classify`, `research`, `extract`, `save`, `complete`) to connected clients.
- Custom EventSource listener in React with automatic exponential-backoff polling fallback for resilience across unstable connections.

### 3. 🛡️ Smart Multi-Tier Redis Caching
- Generates SHA256-hashed query and context fingerprints.
- 1-hour configurable TTL caches Tavily search results and Groq completions.
- **Reduces external API consumption by over 80%** during repeated search topics and load spikes.

### 4. 📊 Full Observability & Telemetry (Prometheus + Grafana)
- Exposes standard and custom Prometheus metrics at `/metrics`:
  - `http_requests_total` (Throughput & Route distribution)
  - `queryiq_pipeline_stage_duration_seconds` (Stage-by-stage latency histograms)
  - `queryiq_cache_operations_total` (Real-time Cache Hit Ratio Gauge)
  - `queryiq_pipeline_status_total` (Success vs Error counters)
- Pre-provisioned Grafana Dashboard with real-time **p50, p95, and p99 latency percentiles**.

### 5. 🧑‍⚖️ Human-in-the-Loop (HITL) Verification Workflow
- Extracted intelligence is staged in a `pending_review` database state.
- Reviewers can edit fields inline (Topic, Geography, Industry, Keywords, Confidence) and `Approve` or `Reject` before permanent commitment.
- One-click JSON export auto-downloads structured intelligence upon approval.

### 6. 🧪 Verified Under High Concurrency Load (Locust)
- Benchmarked with **50 simultaneous concurrent users** attacking the live API.
- **100% Success Rate (0 Failures)** with sub-second median response times.

---

## 📂 Project Structure

```text
QueryIQ/
├── backend/                              # ⚙️ Python FastAPI & Celery Engine
│   ├── main.py                           # REST API endpoints, dual-mode routing & SSE handler
│   ├── celery_app.py                     # Celery cluster configuration & broker settings
│   ├── tasks.py                          # 4-stage pipeline tasks (classify → research → extract → save)
│   ├── cache.py                          # Redis SHA256 caching layer with TTL
│   ├── sse.py                            # Redis Pub/Sub event broadcaster & async SSE generator
│   ├── metrics.py                        # Prometheus custom metrics registry
│   ├── multi_llm.py                      # Groq GPT-OSS 120B classification & synthesis
│   ├── research.py                       # Tavily Search API wrapper
│   ├── database.py                       # Supabase PostgreSQL client & CRUD operations
│   ├── schemas.py                        # Strict Pydantic models (Request/Response/Review)
│   ├── start.sh                          # Production multi-process startup script
│   ├── Dockerfile                        # Multi-stage lightweight Python 3.11 container
│   ├── requirements.txt                  # Python dependencies
│   └── tests/                            # Automated test suite
│       └── test_pipeline.py              # Pytest unit & integration tests
│
├── frontend/                             # 🎨 React 19 + Vite Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx        # Real-time SSE stage animation & progress cards
│   │   │   ├── ResultCard.jsx            # Interactive JSON inspector, HITL editor & downloader
│   │   │   ├── QueryForm.jsx             # Query input with quick-suggestion chips
│   │   │   ├── HistoryPage.jsx           # Query history dashboard with status filters
│   │   │   └── AboutPage.jsx             # System architecture & developer info
│   │   ├── api.js                        # SSE EventSource streaming & TanStack Query fetchers
│   │   ├── App.jsx                       # Root routing & QueryClientProvider setup
│   │   └── index.css                     # Custom glassmorphism design system
│   ├── Dockerfile                        # Multi-stage Node.js build + Nginx production server
│   └── nginx.conf                        # Reverse proxy & gzip optimization config
│
├── monitoring/                           # 📊 Observability & Metrics
│   ├── prometheus.yml                    # Prometheus scrape targets (Local & Cloud)
│   └── grafana/
│       ├── provisioning/                 # Auto-provisioned Prometheus datasources & dashboards
│       └── dashboards/
│           └── queryiq-overview.json     # Pre-built QueryIQ production Grafana dashboard
│
├── k8s/                                  # ☸️ Production Kubernetes Manifests
│   ├── 00-namespace.yaml                 # QueryIQ isolated namespace
│   ├── 01-configmap.yaml                 # Application configuration maps
│   ├── 02-secrets-template.yaml          # Encrypted secret templates
│   ├── 10-redis.yaml                     # Redis StatefulSet with persistent volume
│   ├── 20-api.yaml                       # FastAPI Deployment & Service with HPA
│   ├── 30-worker.yaml                    # Celery Worker Deployment
│   └── 40-ingress.yaml                   # NGINX Ingress Controller with SSL/TLS
│
├── load_test/                            # 🧪 Performance & Stress Testing
│   ├── locustfile.py                     # 50-user concurrent scenario benchmark
│   └── README.md                         # Load testing instructions
│
├── .github/workflows/                    # 🔄 CI/CD Automation
│   └── ci-cd.yml                         # Automated Pytest validation & Docker image builds
│
├── docker-compose.yml                    # Full stack orchestration (Redis, API, Worker, UI)
├── docker-compose.monitoring.yml         # Prometheus & Grafana stack
└── README.md                             # Project Documentation
```

---

## 🚀 Quick Start (Local Docker Compose)

You can run the entire production stack (Redis, Backend, Celery Worker, Frontend, Prometheus, and Grafana) locally with a single command:

### 1. Clone the Repository & Configure Secrets
```bash
git clone https://github.com/Patel-Priyank-1602/QueryIQ.git
cd QueryIQ

# Create backend .env file
cat <<EOF > backend/.env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
EOF
```

### 2. Start Full Stack + Monitoring
```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build -d
```

### 3. Open Services
- 🌐 **React Frontend**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📈 **Grafana Overview Dashboard**: [http://localhost:3001](http://localhost:3001) *(User: `admin` / Password: `queryiq`)*
- 📊 **Prometheus Target Status**: [http://localhost:9090](http://localhost:9090)

---

## 🧪 Running Automated Tests & Load Benchmarks

### Run Unit & Integration Tests (Pytest)
```bash
pytest backend/tests/test_pipeline.py -v
```

### Run 50-User Concurrency Load Test (Locust)
```bash
pip install locust
locust -f load_test/locustfile.py --headless -u 50 -r 5 --run-time 1m --host http://localhost:8000
```

---

## 🌐 Production Cloud Deployments

| Component | Platform | URL |
|---|---|---|
| **Frontend Application** | **Vercel** | [https://queryiqsearch.vercel.app](https://queryiqsearch.vercel.app) |
| **Backend API Engine** | **Render** | [https://pqueryiq-api.onrender.com](https://pqueryiq-api.onrender.com) |
| **API Documentation** | **Swagger UI** | [https://pqueryiq-api.onrender.com/docs](https://pqueryiq-api.onrender.com/docs) |
| **Broker & Caching** | **Upstash** | `rediss://...` Serverless Redis |
| **PostgreSQL Database** | **Supabase** | `https://kqqvinjcgztcvqavmuoi.supabase.co` |

---

## ☸️ Kubernetes Deployment (k3s / EKS / GKE)

Apply the production manifests in order:
```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secrets-template.yaml
kubectl apply -f k8s/10-redis.yaml
kubectl apply -f k8s/20-api.yaml
kubectl apply -f k8s/30-worker.yaml
kubectl apply -f k8s/40-ingress.yaml
```

---

<div align="center">
  <b>Designed & Architected by <a href="https://github.com/Patel-Priyank-1602">Priyank Patel</a></b><br>
  <i>Built for high throughput, zero hallucination, and real-time observability.</i>
</div>