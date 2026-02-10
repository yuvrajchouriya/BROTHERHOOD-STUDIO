-- Consolidated Migration Script: Analytics, SEO, Insights, and Admin Logs
-- Safe to run multiple times (Idempotent)

-- 1. Update site_settings table with new columns
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ga_property_id TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ga_client_email TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ga_private_key TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pagespeed_api_key TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS gsc_site_url TEXT;

-- 2. Create Decision Insights Table
CREATE TABLE IF NOT EXISTS decision_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    suggested_action TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create SEO Cache Table
CREATE TABLE IF NOT EXISTS seo_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date_range)
);

-- 4. Create SEO Keywords Table
CREATE TABLE IF NOT EXISTS seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT NOT NULL,
    keyword TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr NUMERIC DEFAULT 0,
    avg_position NUMERIC DEFAULT 0,
    page_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create SEO Pages Table
CREATE TABLE IF NOT EXISTS seo_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    avg_position NUMERIC DEFAULT 0,
    indexed BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'valid',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    module TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Enable Row Level Security (RLS) on all new tables
ALTER TABLE decision_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create Policies safely (Drop first to avoid conflicts)

-- Insights Policies
DROP POLICY IF EXISTS "Allow public read insights" ON decision_insights;
CREATE POLICY "Allow public read insights" ON decision_insights FOR SELECT USING (true);

-- SEO Policies
DROP POLICY IF EXISTS "Allow public read seo_cache" ON seo_cache;
CREATE POLICY "Allow public read seo_cache" ON seo_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read seo_keywords" ON seo_keywords;
CREATE POLICY "Allow public read seo_keywords" ON seo_keywords FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read seo_pages" ON seo_pages;
CREATE POLICY "Allow public read seo_pages" ON seo_pages FOR SELECT USING (true);

-- Admin Logs Policies
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs" ON admin_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert logs" ON admin_logs;
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT TO authenticated WITH CHECK (true);
