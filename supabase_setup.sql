-- ============================================
-- QueryIQ v2.0 — Supabase Table Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- Drop old table if upgrading (OPTIONAL — only if you want a fresh start)
-- DROP TABLE IF EXISTS queries;

CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_query TEXT NOT NULL,
  topic TEXT,
  geography TEXT,
  industry TEXT,
  entity_type TEXT,
  intent TEXT,
  keywords TEXT[] DEFAULT '{}',
  confidence_score FLOAT DEFAULT 0,
  -- ── New Agentic + HITL Fields ──
  status TEXT DEFAULT 'pending_review',
  sources TEXT DEFAULT '[]',
  pipeline_steps TEXT DEFAULT '[]',
  classifier_model TEXT DEFAULT '',
  extractor_model TEXT DEFAULT '',
  research_summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Allow all operations (using service_role key from backend)
CREATE POLICY "Allow all for service_role" ON queries
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- MIGRATION: If you already have the old table,
-- run these ALTER statements instead:
-- ============================================
-- ALTER TABLE queries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_review';
-- ALTER TABLE queries ADD COLUMN IF NOT EXISTS sources TEXT DEFAULT '[]';
-- ALTER TABLE queries ADD COLUMN IF NOT EXISTS pipeline_steps TEXT DEFAULT '[]';
-- ALTER TABLE queries ADD COLUMN IF NOT EXISTS classifier_model TEXT DEFAULT '';
-- ALTER TABLE queries ADD COLUMN IF NOT EXISTS extractor_model TEXT DEFAULT '';
-- ALTER TABLE queries ADD COLUMN IF NOT EXISTS research_summary TEXT DEFAULT '';
