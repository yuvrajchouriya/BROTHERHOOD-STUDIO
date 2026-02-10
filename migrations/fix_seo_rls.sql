-- Migration: Fix RLS policies for SEO and Insights tables
-- Run this in Supabase SQL Editor

-- Allow INSERT and UPDATE for authenticated users on seo_cache
CREATE POLICY "Allow authenticated insert seo_cache" ON seo_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update seo_cache" ON seo_cache FOR UPDATE TO authenticated USING (true);

-- Allow INSERT and UPDATE for authenticated users on seo_keywords
CREATE POLICY "Allow authenticated insert seo_keywords" ON seo_keywords FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update seo_keywords" ON seo_keywords FOR UPDATE TO authenticated USING (true);

-- Allow INSERT and UPDATE for authenticated users on seo_pages
CREATE POLICY "Allow authenticated insert seo_pages" ON seo_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update seo_pages" ON seo_pages FOR UPDATE TO authenticated USING (true);

-- Allow INSERT and UPDATE for authenticated users on decision_insights
CREATE POLICY "Allow authenticated insert decision_insights" ON decision_insights FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update decision_insights" ON decision_insights FOR UPDATE TO authenticated USING (true);

-- Allow INSERT and UPDATE for authenticated users on performance_pages (if it exists and has RLS)
-- First check if table exists to avoid error, but in SQL script we just assume it does or user ignores error
-- Creating policy if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'performance_pages') THEN
        ALTER TABLE performance_pages ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read performance_pages" ON performance_pages;
        CREATE POLICY "Allow public read performance_pages" ON performance_pages FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert performance_pages" ON performance_pages FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Allow authenticated update performance_pages" ON performance_pages FOR UPDATE TO authenticated USING (true);
    END IF;
END
$$;
