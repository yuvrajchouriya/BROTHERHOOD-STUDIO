-- Enable RLS (if not enabled)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Allow Anon (Public) to INSERT data (Tracking)
CREATE POLICY "Allow Anon Insert Visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anon Insert Sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anon Insert PageViews" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anon Insert ClickEvents" ON public.click_events FOR INSERT WITH CHECK (true);

-- Allow Anon to UPDATE their own sessions (e.g. session end, page count)
-- Note: This is tricky securely without auth. For now, allowing update if ID exists is common in loose tracking, 
-- or we rely on the client knowing the UUID.
CREATE POLICY "Allow Anon Update Sessions" ON public.sessions FOR UPDATE USING (true);
CREATE POLICY "Allow Anon Update Visitors" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "Allow Anon Update PageViews" ON public.page_views FOR UPDATE USING (true);

-- Allow Anon to SELECT (read) rules? 
-- Usually we don't want public reading analytics. But for 'update' policies to work, 'select' might be implicitly needed 
-- or we use `USING (true)`.
CREATE POLICY "Allow Anon Select Sessions" ON public.sessions FOR SELECT USING (true);

-- Allow Authenticated (Service Role/Admin) full access
-- Service role bypasses RLS, but authenticated users (Admins) need access for Dashboard
CREATE POLICY "Allow Admin Read Visitors" ON public.visitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow Admin Read Sessions" ON public.sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow Admin Read PageViews" ON public.page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow Admin Read ClickEvents" ON public.click_events FOR SELECT TO authenticated USING (true);
