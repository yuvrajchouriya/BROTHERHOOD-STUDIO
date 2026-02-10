-- Migration: Add Google Analytics and PageSpeed credentials to site_settings
-- Run this in Supabase SQL Editor

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS ga_property_id TEXT,
ADD COLUMN IF NOT EXISTS ga_client_email TEXT,
ADD COLUMN IF NOT EXISTS ga_private_key TEXT,
ADD COLUMN IF NOT EXISTS pagespeed_api_key TEXT;

-- Security Note: these fields contain sensitive keys. 
-- Ensure RLS (Row Level Security) is enabled on site_settings so only authenticated admins can read/write.
-- (RLS is likely already enabled, but good to verify manually if needed)
