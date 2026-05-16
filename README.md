# 🧠 Query Intelligence Engine (QueryIQ)

> Transform natural language research queries into structured, actionable intelligence — powered by Groq + LLaMA 3.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)

---

## What It Does

QueryIQ takes **natural language research queries** like:

> *"What companies are leading autonomous vehicle development in Europe?"*

…and extracts structured intelligence:

| Field            | Value                                  |
|------------------|----------------------------------------|
| **Topic**        | Autonomous Vehicle Development         |
| **Geography**    | Europe                                 |
| **Industry**     | Automotive / Technology                |
| **Entity Type**  | Company                                |
| **Intent**       | Market research / Competitive analysis |
| **Keywords**     | autonomous vehicles, Europe, leaders   |
| **Confidence**   | 92%                                    |

All results are persisted in **Supabase** and viewable in a sleek React dashboard.

---

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React 19 + Vite + Tailwind CSS v4 |
| Backend    | FastAPI + Uvicorn         |
| AI Engine  | Groq (LLaMA 3.3 70B Versatile) |
| Database   | Supabase (PostgreSQL)     |
| Deployment | Render (API) + Vercel (UI) |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase project with `queries` table (see SQL below)
- Groq API key

### Supabase Table Setup

Run this in the Supabase SQL Editor:

```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_query TEXT NOT NULL,
  topic TEXT,
  geography TEXT,
  industry TEXT,
  entity_type TEXT,
  intent TEXT,
  keywords TEXT[] DEFAULT '{}',
  confidence_score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (optional)
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service_role
CREATE POLICY "Allow all for service_role" ON queries
  FOR ALL USING (true) WITH CHECK (true);
```

### Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env with your keys
# GROQ_API_KEY=gsk_...
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_KEY=eyJhbGciOi...

uvicorn main:app --reload
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| POST   | `/queries`         | Submit a query for extraction      |
| GET    | `/queries/{id}`    | Retrieve a specific query result   |
| GET    | `/queries`         | List 10 most recent queries        |

---

## Project Structure

```
QueryIQ/
├── backend/
│   ├── main.py           # FastAPI app + endpoints + CORS
│   ├── llm.py            # Groq/LLaMA 3 integration + prompt engineering
│   ├── database.py       # Supabase client + CRUD operations
│   ├── schemas.py        # Pydantic request/response models
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main layout + state management
│   │   ├── api.js        # API client functions
│   │   └── components/
│   │       ├── QueryForm.jsx      # Input form
│   │       ├── ResultCard.jsx     # Extraction results display
│   │       ├── QueryHistory.jsx   # Past queries list
│   │       └── LoadingSpinner.jsx # Loading animation
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
└── README.md
```

---

## Deployment

### Backend → Render.com

1. Push `backend/` to GitHub
2. Create a **Web Service** on Render
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add environment variables in Render dashboard
6. Copy the live URL

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

---

## What I'd Do Differently With More Time

- 🔐 Add user authentication (Supabase Auth / Clerk)
- 🔄 Support multi-turn query refinement
- 📊 Add export to CSV/PDF
- 🔎 Add query similarity search with embeddings
- 📈 Analytics dashboard for query patterns
- 🧪 Comprehensive test suite

---

## License

MIT