-- ============================================================
-- Singularity Kit — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  name        TEXT,
  tier        TEXT,
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON public.waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_tier_idx       ON public.waitlist (tier);

-- 3. Row Level Security — only service role can insert/read
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Block all access by default (anon key cannot read or write)
CREATE POLICY "Deny all anon access"
  ON public.waitlist
  FOR ALL
  TO anon
  USING (false);

-- 4. (Optional) View for admin use — shows signups by tier
CREATE OR REPLACE VIEW public.waitlist_summary AS
  SELECT
    tier,
    COUNT(*) AS count,
    MIN(created_at) AS first_signup,
    MAX(created_at) AS last_signup
  FROM public.waitlist
  GROUP BY tier
  ORDER BY count DESC;

-- ============================================================
-- After running this, grab from Supabase → Settings → API:
--   SUPABASE_URL            → Project URL
--   SUPABASE_SERVICE_KEY    → service_role secret
-- Add both as Environment Variables in your Vercel project.
-- ============================================================
