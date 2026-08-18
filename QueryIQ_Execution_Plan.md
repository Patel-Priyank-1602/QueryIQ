# QueryIQ Scalability Execution Plan
### Free Stack · Phase-Wise Rollout · AI-Agent Ready

Use this as a working checklist. Each phase has a checkpoint, and an "AI Agent Prompt" you can paste into Claude Code (or any coding agent) to execute that phase directly against your repo.

---

## 🧰 Tech Stack (All Free)

| Layer | Tool | Free Option |
|---|---|---|
| Reverse proxy | Traefik | Open-source, self-hosted |
| Queue | Redis + Celery | Redis OSS — start here (Kafka/Redpanda later if needed) |
| Cache | Redis | Self-hosted OSS or Upstash free tier (10k cmds/day) |
| Containers | Docker | Free |
| Orchestration | Kubernetes (k3s) | Free, hosted on Oracle Cloud Always Free ARM VM |
| Database | Supabase Postgres | Free tier (500MB, 50k MAU, built-in PgBouncer) |
| Realtime updates | SSE (native) | Free, no extra infra |
| Metrics | Prometheus + Grafana | Self-hosted, open-source |
| Error tracking | Sentry | Free tier: 5k errors/month |
| CI/CD | GitHub Actions | Free: 2,000 min/month |
| Frontend caching | TanStack Query | Open-source npm package |
| Image registry | GitHub Container Registry (ghcr.io) | Free for images |
| Compute host | Oracle Cloud Always Free Tier | 4 ARM vCPUs / 24GB RAM, forever free |

**Total cost: $0/month**

---

## 📅 Phase-Wise Plan

### Phase 1 — Dockerize (1–2 days)
**Goal:** App runs identically in containers.
- [ ] Write `Dockerfile` for backend (FastAPI)
- [ ] Write `Dockerfile` for frontend (or keep on Netlify)
- [ ] Create `docker-compose.yml` (api, redis, env vars for Supabase)
- [ ] Confirm `docker-compose up` reproduces current app behavior

**✅ Checkpoint:** `docker-compose up` → app works exactly as before.

**AI Agent Prompt:**
> "Containerize this FastAPI backend and add a docker-compose.yml with services for the API and Redis. Use environment variables for Supabase/Groq/Tavily keys. Verify the app builds and runs with `docker-compose up`."

---

### Phase 2 — Redis + Celery Async Pipeline (3–4 days)
**Goal:** Pipeline runs in background; API responds instantly.
- [ ] Install Celery, configure Redis as broker + result backend
- [ ] Convert `intent_classify`, `web_scrape`, `data_synthesize`, `hitl_review` into Celery tasks
- [ ] `POST /queries` returns `task_id` immediately
- [ ] Add `GET /queries/{task_id}/status` endpoint
- [ ] Chain tasks so failure at one stage doesn't kill the whole pipeline

**✅ Checkpoint:** Submitting a query returns instantly; status endpoint shows progress.

**AI Agent Prompt:**
> "Refactor the QueryIQ pipeline (intent classification → Tavily scraping → Groq synthesis → HITL review) into separate Celery tasks chained together, using Redis as broker. Update the POST /queries endpoint to enqueue the chain and return a task_id immediately. Add a GET /queries/{task_id}/status endpoint that reports current stage and result when complete."

---

### Phase 3 — Redis Caching (1 day)
**Goal:** Repeated queries return near-instantly.
- [ ] Cache Tavily search results by query hash (TTL ~1hr)
- [ ] Cache Groq extraction results for identical inputs
- [ ] Add cache-hit logging for visibility

**✅ Checkpoint:** Same query run twice → second run is near-instant.

**AI Agent Prompt:**
> "Add Redis caching to the Tavily search call and Groq extraction call in the QueryIQ pipeline. Key the cache by a hash of the input query/content, set a 1-hour TTL, and log cache hits vs misses."

---

### Phase 4 — Real-Time Progress via SSE (2–3 days)
**Goal:** Frontend shows live pipeline progress instead of a static spinner.
- [ ] Add SSE endpoint (`GET /queries/{task_id}/stream`) that emits stage updates
- [ ] Update `LoadingSpinner.jsx` to consume the SSE stream
- [ ] Show stage labels: Classifying → Scraping → Synthesizing → Awaiting Review

**✅ Checkpoint:** Frontend visibly updates through each pipeline stage in real time.

**AI Agent Prompt:**
> "Add a Server-Sent Events endpoint that streams Celery task stage updates for a given task_id. Update the React LoadingSpinner component to connect to this SSE stream and display the current pipeline stage live instead of a generic spinner."

---

### Phase 5 — Observability (2 days)
**Goal:** Visibility into latency and failures.
- [ ] Add `prometheus-fastapi-instrumentator` to FastAPI
- [ ] Add Celery task duration/failure metrics
- [ ] Run Prometheus + Grafana via Docker, build one dashboard
- [ ] Add Sentry SDK to backend and frontend

**✅ Checkpoint:** Grafana dashboard shows per-stage latency; Sentry catches errors.

**AI Agent Prompt:**
> "Add Prometheus instrumentation to the FastAPI app and Celery workers to track request latency, task duration per pipeline stage, and failure counts. Add Sentry error tracking to both backend and frontend. Provide a docker-compose service for Prometheus and Grafana with a starter dashboard config."

---

### Phase 6 — Deploy to Free Kubernetes (3–4 days)
**Goal:** Real horizontal scaling on free infrastructure.
- [ ] Provision Oracle Cloud Always Free ARM VM
- [ ] Install k3s
- [ ] Write K8s manifests: Deployment + Service for API, Deployment for Celery workers (replicas ≥ 2), Redis
- [ ] Deploy and verify pods scale independently

**✅ Checkpoint:** App runs on k3s; scaling worker replicas visibly increases throughput.

**AI Agent Prompt:**
> "Write Kubernetes manifests (Deployment + Service) for the QueryIQ FastAPI API, Celery workers (set replicas to 3), and a Redis deployment, suitable for a k3s cluster. Include resource limits appropriate for a small ARM VM (2 vCPU / 4GB per pod range)."

---

### Phase 7 — CI/CD (1–2 days)
**Goal:** Push to `main` auto-deploys.
- [ ] GitHub Actions workflow: build Docker images → push to ghcr.io
- [ ] Add deploy step to k3s (via `kubectl apply` over SSH or a self-hosted runner)
- [ ] Add basic test step before deploy

**✅ Checkpoint:** Merge to `main` → new version live on cluster automatically.

**AI Agent Prompt:**
> "Create a GitHub Actions workflow that builds the FastAPI and worker Docker images, pushes them to GitHub Container Registry, and deploys to the k3s cluster via kubectl on push to main. Include a test step that runs before the build."

---

### Phase 8 — Frontend Polish + Load Test (1–2 days)
**Goal:** Confirm scaling works, smooth UX confirmed.
- [ ] Add TanStack Query to frontend for HITL review polling/caching
- [ ] Write a simple load test script (e.g., 50 concurrent queries via `locust` or a bash loop)
- [ ] Observe Grafana dashboard under load, confirm worker autoscaling behavior

**✅ Checkpoint:** App stays responsive under concurrent load; dashboard confirms scaling.

**AI Agent Prompt:**
> "Integrate TanStack Query into the React frontend for fetching and caching HITL review data. Then write a simple Locust load test script that submits 50 concurrent queries to the /queries endpoint so I can validate the pipeline scales under load."

---

## ⏱️ Time Summary

| Phase | Days |
|---|---|
| 1. Dockerize | 1–2 |
| 2. Redis + Celery | 3–4 |
| 3. Redis Caching | 1 |
| 4. SSE Progress | 2–3 |
| 5. Observability | 2 |
| 6. K8s Deploy | 3–4 |
| 7. CI/CD | 1–2 |
| 8. Polish + Load Test | 1–2 |
| **Total** | **~15–20 working days** (3–5 weeks part-time, 7–10 days full-time) |

---

## 🤖 How to Execute with an AI Agent

Best approach: run this **phase by phase, one at a time**, not all at once.

1. Open the project in **Claude Code** (or similar agentic coding tool) pointed at your QueryIQ repo.
2. Paste the "AI Agent Prompt" for the current phase only.
3. Let the agent make changes, then **manually verify the checkpoint** before moving to the next phase.
4. Commit after each phase passes its checkpoint — gives you clean rollback points if a later phase breaks something.
5. Don't skip ahead: Phase 2 (Celery) must work before Phase 4 (SSE) can stream anything meaningful; Phase 6 (K8s) needs Phase 1 (Docker) images to already be solid.

**Why phase-by-phase works better with agents:** large multi-phase prompts tend to produce shallow, half-integrated changes across many files at once. One phase at a time gives the agent a narrow, verifiable scope, and gives you a working app after every step instead of a big-bang rewrite that might not run at all.
