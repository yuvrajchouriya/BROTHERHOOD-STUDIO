-- Migration: Add redirect_enabled column to home_projects table
-- This allows admin to control whether clicking a home gallery card redirects to its detail page

ALTER TABLE home_projects 
  ADD COLUMN IF NOT EXISTS redirect_enabled boolean NOT NULL DEFAULT true;

-- Update all existing rows to have redirect_enabled = true (default behavior preserved)
UPDATE home_projects SET redirect_enabled = true WHERE redirect_enabled IS NULL;
