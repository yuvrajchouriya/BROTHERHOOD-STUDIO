-- =================================================================
-- COMPLETE SPEED MONITORING SYSTEM SETUP (SAFE & SELF-HEALING)
-- Run this entire script in Supabase SQL Editor.
-- It resolves "table exists" and "column missing" errors automatically.
-- =================================================================

-- 1. RUM METRICS (Real User Monitoring)
CREATE TABLE IF NOT EXISTS rum_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'LCP', 'CLS', 'INP', 'INTERACTION', 'LONG_TASK'
    value NUMERIC NOT NULL,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    city TEXT,
    country TEXT,
    region TEXT,
    network_type TEXT,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SAFE UPGRADE: Add 'metadata' column if it was missing from previous version
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rum_metrics' AND column_name = 'metadata') THEN
        ALTER TABLE rum_metrics ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create index for faster querying on metadata
CREATE INDEX IF NOT EXISTS idx_rum_metrics_metadata ON rum_metrics USING gin (metadata);


-- 2. RESOURCE METRICS (Micro Level)
CREATE TABLE IF NOT EXISTS resource_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    resource_type TEXT, 
    duration NUMERIC NOT NULL,
    initiator_type TEXT,
    transfer_size INTEGER,
    decoded_body_size INTEGER,
    is_cache_hit BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. API METRICS
CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    status_code INTEGER,
    duration NUMERIC NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INCIDENT ALERTS
CREATE TABLE IF NOT EXISTS incident_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BENCHMARK DATA
CREATE TABLE IF NOT EXISTS speed_benchmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name TEXT NOT NULL,
    lcp NUMERIC,
    cls NUMERIC,
    inp NUMERIC,
    ttfb NUMERIC,
    captured_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RESET & ENABLE RLS (Fixes Policy Conflicts)
ALTER TABLE rum_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_benchmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent "Policy already exists" errors
DROP POLICY IF EXISTS "Allow public read" ON rum_metrics;
DROP POLICY IF EXISTS "Allow public insert" ON rum_metrics;
DROP POLICY IF EXISTS "Allow public read" ON resource_metrics;
DROP POLICY IF EXISTS "Allow public insert" ON resource_metrics;
DROP POLICY IF EXISTS "Allow public read" ON api_metrics;
DROP POLICY IF EXISTS "Allow public read" ON incident_alerts;
DROP POLICY IF EXISTS "Allow public read" ON speed_benchmarks;
DROP POLICY IF EXISTS "Allow admin full access alerts" ON incident_alerts;
DROP POLICY IF EXISTS "Allow admin full access benchmarks" ON speed_benchmarks;

-- Re-create Policies
CREATE POLICY "Allow public read" ON rum_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON rum_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON resource_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON resource_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON api_metrics FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON incident_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON speed_benchmarks FOR SELECT USING (true);

CREATE POLICY "Allow admin full access alerts" ON incident_alerts TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access benchmarks" ON speed_benchmarks TO authenticated USING (true) WITH CHECK (true);

-- Success Message
SELECT 'Speed Monitoring Setup Completed Successfully' as status;
