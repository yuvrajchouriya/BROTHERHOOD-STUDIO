-- Migration: Initialize Admin Logs table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'login'
    module TEXT NOT NULL, -- 'settings', 'services', 'films', 'analytics'
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all logs" ON admin_logs
    FOR SELECT
    TO authenticated
    USING (true); -- In a real app, check for admin role

CREATE POLICY "Admins can insert logs" ON admin_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
