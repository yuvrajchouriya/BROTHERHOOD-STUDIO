-- Migration: Add UNIQUE constraint to performance_pages (Idempotent)
-- Run this in Supabase SQL Editor

-- 1. Clean up potential duplicates before adding constraint
-- (Optional: keeps the most recent entry for each page_url)
DELETE FROM performance_pages a USING (
    SELECT MIN(ctid) as ctid, page_url
    FROM performance_pages 
    GROUP BY page_url HAVING COUNT(*) > 1
) b
WHERE a.page_url = b.page_url 
AND a.ctid <> b.ctid;

-- 2. Add Unique Constraint
DO $$ BEGIN
    ALTER TABLE performance_pages ADD CONSTRAINT performance_pages_unique_url UNIQUE (page_url);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
