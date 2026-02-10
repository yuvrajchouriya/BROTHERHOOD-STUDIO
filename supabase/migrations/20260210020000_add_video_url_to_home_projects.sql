-- Add video_url column to home_projects table for custom home films
ALTER TABLE public.home_projects 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update specific home_projects items to ensure they are category 'home_film' if needed
-- (Optional, but we will use 'home_film' or just 'film' category)
