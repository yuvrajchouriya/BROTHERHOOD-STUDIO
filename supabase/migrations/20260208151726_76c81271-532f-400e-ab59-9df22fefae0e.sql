-- Drop existing restrictive policies and create permissive ones for home_projects
DROP POLICY IF EXISTS "Admin full access home_projects" ON public.home_projects;
DROP POLICY IF EXISTS "Public can view visible home projects" ON public.home_projects;

-- Create permissive policies (default behavior)
CREATE POLICY "Public can view visible home projects" 
ON public.home_projects 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admin full access home_projects" 
ON public.home_projects 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also fix site_settings policies
DROP POLICY IF EXISTS "Admin full access site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;

CREATE POLICY "Public can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admin full access site_settings" 
ON public.site_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix galleries policies
DROP POLICY IF EXISTS "Admin full access galleries" ON public.galleries;
DROP POLICY IF EXISTS "Public can view active galleries" ON public.galleries;

CREATE POLICY "Public can view active galleries" 
ON public.galleries 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access galleries" 
ON public.galleries 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));