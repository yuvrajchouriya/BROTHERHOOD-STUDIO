-- ═══════════════════════════════════════════════════════════════
-- ADMIN SECURITY TABLES MIGRATION
-- Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Login Attempts (Brute Force Protection)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean NOT NULL DEFAULT false,
  failure_reason text,
  attempted_at timestamptz DEFAULT now()
);

-- Index for fast lookups by email + time
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
  ON admin_login_attempts(email, attempted_at DESC);

-- RLS: Only admins can read, edge functions can insert
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view login attempts" ON admin_login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert login attempts" ON admin_login_attempts
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════

-- 2. Admin Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  action text NOT NULL,        -- 'LOGIN', 'LOGOUT', 'DELETE_GALLERY', etc.
  resource text,               -- which resource was affected
  resource_id text,            -- id of affected resource
  details jsonb,               -- any extra context
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_admin_time 
  ON admin_activity_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_created 
  ON admin_activity_log(created_at DESC);

-- RLS: Only admins can read/insert
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert activity log" ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow anonymous insert for login/logout tracking (before auth check)
CREATE POLICY "Anyone can insert activity log" ON admin_activity_log
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: Run these to check tables were created
-- SELECT COUNT(*) FROM admin_login_attempts;
-- SELECT COUNT(*) FROM admin_activity_log;
-- ═══════════════════════════════════════════════════════════════
