-- Migration: Create Performance Pages Table (Idempotent)
-- Run this in Supabase SQL Editor

-- 1. Create table (safely)
CREATE TABLE IF NOT EXISTS performance_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    load_time NUMERIC, -- in ms
    score INTEGER, -- 0-100
    lcp NUMERIC, -- Largest Contentful Paint in seconds
    cls NUMERIC, -- Cumulative Layout Shift
    inp NUMERIC, -- Interaction to Next Paint in ms
    device_type TEXT, -- mobile, desktop
    status TEXT DEFAULT 'unknown', -- good, needs_improvement, poor
    last_checked TIMESTAMPTZ DEFAULT now(),
    UNIQUE(page_url, device_type)
);

-- 2. Enable RLS
ALTER TABLE performance_pages ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read performance_pages" ON performance_pages;
CREATE POLICY "Allow public read performance_pages" ON performance_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert performance_pages" ON performance_pages;
CREATE POLICY "Allow authenticated insert performance_pages" ON performance_pages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update performance_pages" ON performance_pages;
CREATE POLICY "Allow authenticated update performance_pages" ON performance_pages FOR UPDATE TO authenticated USING (true);
