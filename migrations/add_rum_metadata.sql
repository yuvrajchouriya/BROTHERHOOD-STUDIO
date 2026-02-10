-- Add metadata column to rum_metrics for advanced tracking (Interaction, Long Tasks)
ALTER TABLE rum_metrics ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for faster querying on metadata
CREATE INDEX IF NOT EXISTS idx_rum_metrics_metadata ON rum_metrics USING gin (metadata);

-- Ensure RLS is still valid (it should comprise the new column automatically)
