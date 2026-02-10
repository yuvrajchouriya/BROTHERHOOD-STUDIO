-- Speed Monitoring System Schema
-- To be run in Supabase SQL Editor

-- 1. RUM METRICS (Real User Monitoring)
CREATE TABLE IF NOT EXISTS rum_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'LCP', 'CLS', 'INP', 'TTFB'
    value NUMERIC NOT NULL,
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    browser TEXT,
    os TEXT,
    city TEXT,
    country TEXT,
    region TEXT,
    network_type TEXT, -- '4g', '5g', 'wifi'
    session_id UUID, -- Link to existing sessions table if possible
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RESOURCE METRICS (Micro Level)
CREATE TABLE IF NOT EXISTS resource_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    resource_type TEXT, -- 'script', 'img', 'css', 'fetch'
    duration NUMERIC NOT NULL,
    initiator_type TEXT,
    transfer_size INTEGER, -- bytes
    decoded_body_size INTEGER, -- bytes
    is_cache_hit BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. API METRICS (Backend Speed)
CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    status_code INTEGER,
    duration NUMERIC NOT NULL, -- ms
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INCIDENT ALERTS
CREATE TABLE IF NOT EXISTS incident_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL, -- 'LCP_SPIKE', 'API_FAILURE', 'Deploy_Slowdown'
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'open', -- 'open', 'resolved', 'ignored'
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BENCHMARK DATA (Competitor Comparison)
CREATE TABLE IF NOT EXISTS speed_benchmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name TEXT NOT NULL, -- 'Your Site', 'Amazon', 'Flipkart'
    lcp NUMERIC,
    cls NUMERIC,
    inp NUMERIC,
    ttfb NUMERIC,
    captured_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable RLS
ALTER TABLE rum_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_benchmarks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Allow public insert via Edge Function (Service Role will bypass, but good to have explicit policy if using client direct)
-- Actually, typically we want Edge Function to write, so Service Role is enough. 
-- But for Admin Panel to READ:

DROP POLICY IF EXISTS "Allow public read" ON rum_metrics;
CREATE POLICY "Allow public read" ON rum_metrics FOR SELECT USING (true); -- Or restricted to authenticated

DROP POLICY IF EXISTS "Allow public read" ON resource_metrics;
CREATE POLICY "Allow public read" ON resource_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read" ON api_metrics;
CREATE POLICY "Allow public read" ON api_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read" ON incident_alerts;
CREATE POLICY "Allow public read" ON incident_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read" ON speed_benchmarks;
CREATE POLICY "Allow public read" ON speed_benchmarks FOR SELECT USING (true);

-- Allow Authenticated (Admin) to insert/update alerts and benchmarks
CREATE POLICY "Allow admin full access alerts" ON incident_alerts TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin full access benchmarks" ON speed_benchmarks TO authenticated USING (true) WITH CHECK (true);
