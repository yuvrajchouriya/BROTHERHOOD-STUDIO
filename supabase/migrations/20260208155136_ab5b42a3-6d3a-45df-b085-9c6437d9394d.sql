-- Create home_films table for managing films shown on home page
CREATE TABLE public.home_films (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_films ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access home_films"
ON public.home_films
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view visible home films
CREATE POLICY "Public can view visible home films"
ON public.home_films
FOR SELECT
USING (is_visible = true);

-- Add trigger for updated_at
CREATE TRIGGER update_home_films_updated_at
BEFORE UPDATE ON public.home_films
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();