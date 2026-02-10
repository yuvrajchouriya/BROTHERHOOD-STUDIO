-- Migration: Initialize SEO and Insights tables
-- Run this in Supabase SQL Editor

-- 1. Add GSC Site URL to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS gsc_site_url TEXT;

-- 2. Create Decision Insights Table
CREATE TABLE IF NOT EXISTS decision_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type TEXT NOT NULL, -- 'traffic', 'conversion', 'content', 'seo', 'performance'
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL, -- 'high', 'medium', 'low'
    suggested_action TEXT,
    status TEXT DEFAULT 'new', -- 'new', 'viewed', 'applied'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create SEO Cache Table (for storing daily aggregates or raw API responses)
CREATE TABLE IF NOT EXISTS seo_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT NOT NULL, -- '7d', '30d', '90d'
    data JSONB NOT NULL, -- Stores the full overview JSON
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

-- Enable RLS (Optional but recommended)
ALTER TABLE decision_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

-- Allow public read for now (or restrict to admin)
CREATE POLICY "Allow public read insights" ON decision_insights FOR SELECT USING (true);
CREATE POLICY "Allow public read seo_cache" ON seo_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read seo_keywords" ON seo_keywords FOR SELECT USING (true);
CREATE POLICY "Allow public read seo_pages" ON seo_pages FOR SELECT USING (true);
