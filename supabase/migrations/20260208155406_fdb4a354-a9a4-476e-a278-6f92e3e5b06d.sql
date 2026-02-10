-- Create service_galleries table to link services with galleries
CREATE TABLE public.service_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(service_id, gallery_id)
);

-- Create service_films table to link services with films
CREATE TABLE public.service_films (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(service_id, film_id)
);

-- Enable RLS on both tables
ALTER TABLE public.service_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_films ENABLE ROW LEVEL SECURITY;

-- Admin policies for service_galleries
CREATE POLICY "Admin full access service_galleries"
ON public.service_galleries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view service_galleries"
ON public.service_galleries
FOR SELECT
USING (true);

-- Admin policies for service_films
CREATE POLICY "Admin full access service_films"
ON public.service_films
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view service_films"
ON public.service_films
FOR SELECT
USING (true);