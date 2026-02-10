-- Add film_id and category columns to home_projects table
ALTER TABLE public.home_projects 
ADD COLUMN IF NOT EXISTS film_id UUID REFERENCES public.films(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'gallery';

-- Update existing rows to have category as 'gallery' if they have gallery_id
UPDATE public.home_projects SET category = 'gallery' WHERE gallery_id IS NOT NULL;
UPDATE public.home_projects SET category = 'film' WHERE film_id IS NOT NULL;