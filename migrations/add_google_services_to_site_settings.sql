-- Migration: Add Google Services fields to site_settings table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT,
ADD COLUMN IF NOT EXISTS google_tag_manager_id TEXT,
ADD COLUMN IF NOT EXISTS google_search_console TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
AND column_name IN ('google_analytics_id', 'google_tag_manager_id', 'google_search_console');
