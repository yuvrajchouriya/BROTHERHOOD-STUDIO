-- Create table for IP whitelisting
CREATE TABLE IF NOT EXISTS public.admin_allowed_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL UNIQUE,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_allowed_ips ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage allowed IPs"
ON public.admin_allowed_ips
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Note: We also need a way for the login function to check this table
-- without being authenticated yet. However, we can handle the check
-- in the application logic AFTER initial sign-in but before navigating
-- to the admin panel, OR use a Supabase Edge Function for pre-auth check.
-- For simplicity, we will check it in the AdminLogin.tsx logic.
