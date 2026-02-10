-- Migration: Fix RLS and Add Constraints for analytics_cache (Idempotent)
-- Run this in Supabase SQL Editor

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    date_range TEXT NOT NULL,
    data JSONB NOT NULL,
    last_fetched_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Handle Constraint (Drop first to avoid "already exists" error)
ALTER TABLE analytics_cache DROP CONSTRAINT IF EXISTS analytics_cache_unique_metric_date;
ALTER TABLE analytics_cache ADD CONSTRAINT analytics_cache_unique_metric_date UNIQUE (metric_type, date_range);

-- 3. Enable RLS
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- 4. Re-create Policies
DROP POLICY IF EXISTS "Allow public read analytics_cache" ON analytics_cache;
CREATE POLICY "Allow public read analytics_cache" ON analytics_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert analytics_cache" ON analytics_cache;
CREATE POLICY "Allow authenticated insert analytics_cache" ON analytics_cache FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update analytics_cache" ON analytics_cache;
CREATE POLICY "Allow authenticated update analytics_cache" ON analytics_cache FOR UPDATE TO authenticated USING (true);
