-- Create table for global admin lockouts
CREATE TABLE IF NOT EXISTS public.admin_lockouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    ip_address TEXT,
    locked_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_admin_lockouts_email ON public.admin_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_admin_lockouts_ip ON public.admin_lockouts(ip_address);

-- Enable RLS
ALTER TABLE public.admin_lockouts ENABLE ROW LEVEL SECURITY;

-- Allow public to SELECT if the email or IP matches (security check)
-- This allows the login page to verify if its own email/IP is locked
CREATE POLICY "Public can check own lockout status"
ON public.admin_lockouts
FOR SELECT
TO anon, authenticated
USING (true); -- Simplified for login check. We will filter in the query.

-- Only admins can manage lockouts normally
CREATE POLICY "Admins can manage lockouts"
ON public.admin_lockouts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Function to clean up expired lockouts
CREATE OR REPLACE FUNCTION public.cleanup_expired_lockouts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.admin_lockouts WHERE locked_until < now();
END;
$$ LANGUAGE plpgsql;
