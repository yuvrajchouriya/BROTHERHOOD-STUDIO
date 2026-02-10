-- =================================================================
-- MASTER ANALYTICS & SPEED SETUP (FIXED & IDEMPOTENT)
-- Run this script to ensure ALL tables exist and permissions are fixed.
-- This version handles "Policy already exists" errors.
-- =================================================================

-- 1. TRACKING TABLES
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT UNIQUE,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES visitors(id),
    entry_page TEXT,
    is_active BOOLEAN DEFAULT true,
    page_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    page_path TEXT,
    viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT,
    date_range TEXT,
    data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(metric_type, date_range)
);

CREATE TABLE IF NOT EXISTS seo_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT UNIQUE,
    data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SPEED TABLES
CREATE TABLE IF NOT EXISTS rum_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT,
    metric_type TEXT,
    value NUMERIC,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rum_journeys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID,
    entry_page TEXT,
    step_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS rum_journey_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id UUID REFERENCES rum_journeys(id),
    event_type TEXT NOT NULL,
    page_url TEXT,
    element_selector TEXT,
    delay_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rum_replay_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id UUID REFERENCES rum_journeys(id),
    events_chunk JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FIX PERMISSIONS (RLS) & POLICIES
-- We drop policies first to avoid "already exists" errors
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_replay_events ENABLE ROW LEVEL SECURITY;

-- Visitors
DROP POLICY IF EXISTS "Public Access Visitors" ON visitors;
CREATE POLICY "Public Access Visitors" ON visitors FOR ALL USING (true) WITH CHECK (true);

-- Sessions
DROP POLICY IF EXISTS "Public Access Sessions" ON sessions;
CREATE POLICY "Public Access Sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Page Views
DROP POLICY IF EXISTS "Public Access PageViews" ON page_views;
CREATE POLICY "Public Access PageViews" ON page_views FOR ALL USING (true) WITH CHECK (true);

-- Cache
DROP POLICY IF EXISTS "Public Access Cache" ON analytics_cache;
CREATE POLICY "Public Access Cache" ON analytics_cache FOR ALL USING (true) WITH CHECK (true);

-- SEO
DROP POLICY IF EXISTS "Public Access SEO" ON seo_cache;
CREATE POLICY "Public Access SEO" ON seo_cache FOR ALL USING (true) WITH CHECK (true);

-- RUM Metrics (Fixing the specific error you saw)
DROP POLICY IF EXISTS "Allow public insert" ON rum_metrics;
CREATE POLICY "Allow public insert" ON rum_metrics FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read" ON rum_metrics;
CREATE POLICY "Allow public read" ON rum_metrics FOR SELECT USING (true);

-- RUM Journeys
DROP POLICY IF EXISTS "Public Full Access Journeys" ON rum_journeys;
CREATE POLICY "Public Full Access Journeys" ON rum_journeys FOR ALL USING (true) WITH CHECK (true);

-- RUM Journey Events
DROP POLICY IF EXISTS "Public Full Access Journey Events" ON rum_journey_events;
CREATE POLICY "Public Full Access Journey Events" ON rum_journey_events FOR ALL USING (true) WITH CHECK (true);

-- RUM Replay
DROP POLICY IF EXISTS "Public Full Access Replay" ON rum_replay_events;
CREATE POLICY "Public Full Access Replay" ON rum_replay_events FOR ALL USING (true) WITH CHECK (true);

SELECT 'All Analytics tables and policies fixed.' as status;
