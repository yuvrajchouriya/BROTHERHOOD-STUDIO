-- =================================================================
-- MASTER ANALYTICS SCHEMA SETUP
-- Run this script to ensure ALL tables (General + Speed) exist.
-- This fixes "Simulate Traffic" 500 errors and RUM 400 errors.
-- =================================================================

-- 1. VISITORS & SESSIONS (General Analytics)
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT UNIQUE,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES visitors(id),
    entry_page TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_count INTEGER DEFAULT 0,
    exit_page TEXT
);

CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    visitor_id UUID REFERENCES visitors(id),
    page_path TEXT NOT NULL,
    page_title TEXT,
    time_on_page INTEGER,
    scroll_depth INTEGER,
    viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS click_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    visitor_id UUID REFERENCES visitors(id),
    page_path TEXT,
    event_type TEXT NOT NULL, -- 'click', 'submit', 'video_play'
    event_label TEXT,
    event_value TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CACHE TABLES (For Dashboard Performance)
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL, -- 'visitors', 'traffic', 'geo', 'pages', 'overview'
    date_range TEXT NOT NULL, -- 'today', '7d', '30d'
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(metric_type, date_range)
);

CREATE TABLE IF NOT EXISTS seo_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT UNIQUE NOT NULL, -- '7d', '28d'
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS performance_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT UNIQUE NOT NULL,
    load_time INTEGER,
    score INTEGER,
    lcp NUMERIC,
    cls NUMERIC,
    inp INTEGER,
    device_type TEXT,
    status TEXT, -- 'good', 'needs_improvement', 'poor'
    last_checked_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SPEED MONITORING & RUM (Advanced Modules)
CREATE TABLE IF NOT EXISTS rum_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    city TEXT,
    country TEXT,
    region TEXT,
    network_type TEXT,
    session_id UUID,          -- Can link to sessions.id if needed, or standalone
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rum_metrics_metadata ON rum_metrics USING gin (metadata);

CREATE TABLE IF NOT EXISTS rum_journeys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID,          -- This might be the RUM session ID (different from analytics sessions)
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    entry_page TEXT,
    exit_page TEXT,
    device_type TEXT,
    country TEXT,
    total_duration_sec INTEGER,
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
    chunk_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    resource_type TEXT,
    duration NUMERIC,
    initiator_type TEXT,
    transfer_size INTEGER,
    is_cache_hit BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT,
    status_code INTEGER,
    duration NUMERIC,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT,
    message TEXT,
    severity TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS speed_benchmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name TEXT,
    lcp NUMERIC,
    cls NUMERIC,
    captured_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ENABLE RLS & GRANTS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_replay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_benchmarks ENABLE ROW LEVEL SECURITY;

-- 5. PUBLIC PERMISSIONS (Simplifying for Development/Admin)
-- Note: In strict prod, 'anon' should only INSERT certain tables. 
-- Here we allow public read/insert to ensure "Simulate Traffic" and Dashboard works without complex Auth.

CREATE POLICY "Public read/write visitors" ON visitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write page_views" ON page_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write click_events" ON click_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write analytics_cache" ON analytics_cache FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write seo_cache" ON seo_cache FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write performance_pages" ON performance_pages FOR ALL USING (true) WITH CHECK (true);

-- Ensure RUM policies exist (using DO block to avoid 'already exists' error on re-run, or just drop/create)
DROP POLICY IF EXISTS "Allow public read" ON rum_metrics;
CREATE POLICY "Allow public read" ON rum_metrics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert" ON rum_metrics;
CREATE POLICY "Allow public insert" ON rum_metrics FOR INSERT WITH CHECK (true);

-- Repeat simplistic policy for others to guarantee access
DROP POLICY IF EXISTS "Public Full Access Journeys" ON rum_journeys;
CREATE POLICY "Public Full Access Journeys" ON rum_journeys FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Journey Events" ON rum_journey_events;
CREATE POLICY "Public Full Access Journey Events" ON rum_journey_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Replay" ON rum_replay_events;
CREATE POLICY "Public Full Access Replay" ON rum_replay_events FOR ALL USING (true) WITH CHECK (true);

-------------------------------------------------------------------------------
-- DONE
SELECT 'Full Analytics Schema Initialized Successfully' as status;
