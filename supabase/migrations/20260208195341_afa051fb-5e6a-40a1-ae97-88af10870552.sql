-- =============================================
-- ANALYTICS SYSTEM DATABASE SCHEMA
-- =============================================

-- 1. VISITORS TABLE (Unique visitors with fingerprint)
CREATE TABLE public.visitors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT NOT NULL UNIQUE,
    first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    total_visits INTEGER NOT NULL DEFAULT 1,
    country TEXT,
    city TEXT,
    region TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. SESSIONS TABLE (Each visit session)
CREATE TABLE public.sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    entry_page TEXT,
    exit_page TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    page_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. PAGE VIEWS TABLE (Individual page views)
CREATE TABLE public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE NOT NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    time_on_page INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    referrer_path TEXT
);

-- 4. CLICK EVENTS TABLE (Button/Link clicks)
CREATE TABLE public.click_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    event_type TEXT NOT NULL,
    element_id TEXT,
    element_text TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. ANALYTICS CACHE TABLE (Aggregated stats for dashboard)
CREATE TABLE public.analytics_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    date_range TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(metric_type, date_range)
);

-- 6. ANALYTICS SETTINGS TABLE
CREATE TABLE public.analytics_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_enabled BOOLEAN NOT NULL DEFAULT true,
    refresh_interval INTEGER NOT NULL DEFAULT 5,
    scroll_tracking BOOLEAN NOT NULL DEFAULT true,
    click_tracking BOOLEAN NOT NULL DEFAULT true,
    geo_tracking BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.analytics_settings (tracking_enabled, refresh_interval, scroll_tracking, click_tracking, geo_tracking)
VALUES (true, 5, true, true, true);

-- 7. ADMIN LOGS TABLE (Admin activity logs)
CREATE TABLE public.admin_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    module TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. DECISION INSIGHTS TABLE (AI-Generated insights)
CREATE TABLE public.decision_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    suggested_action TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_visitors_fingerprint ON public.visitors(fingerprint);
CREATE INDEX idx_visitors_last_visit ON public.visitors(last_visit);
CREATE INDEX idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at);
CREATE INDEX idx_sessions_is_active ON public.sessions(is_active);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_click_events_session_id ON public.click_events(session_id);
CREATE INDEX idx_click_events_event_type ON public.click_events(event_type);
CREATE INDEX idx_click_events_clicked_at ON public.click_events(clicked_at);
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at);
CREATE INDEX idx_decision_insights_status ON public.decision_insights(status);
CREATE INDEX idx_decision_insights_priority ON public.decision_insights(priority);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_insights ENABLE ROW LEVEL SECURITY;

-- VISITORS: Anyone can insert (for tracking), only admin can read
CREATE POLICY "Anyone can insert visitors" ON public.visitors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read visitors" ON public.visitors
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update visitors" ON public.visitors
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- SESSIONS: Anyone can insert/update, only admin can read
CREATE POLICY "Anyone can insert sessions" ON public.sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" ON public.sessions
    FOR UPDATE USING (true);

CREATE POLICY "Admin can read sessions" ON public.sessions
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- PAGE VIEWS: Anyone can insert, only admin can read
CREATE POLICY "Anyone can insert page_views" ON public.page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read page_views" ON public.page_views
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- CLICK EVENTS: Anyone can insert, only admin can read
CREATE POLICY "Anyone can insert click_events" ON public.click_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read click_events" ON public.click_events
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- ANALYTICS CACHE: Only admin can access
CREATE POLICY "Admin full access analytics_cache" ON public.analytics_cache
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ANALYTICS SETTINGS: Public can read (for tracking), admin can update
CREATE POLICY "Public can read analytics_settings" ON public.analytics_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin can update analytics_settings" ON public.analytics_settings
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- ADMIN LOGS: Only admin can access
CREATE POLICY "Admin full access admin_logs" ON public.admin_logs
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- DECISION INSIGHTS: Only admin can access
CREATE POLICY "Admin full access decision_insights" ON public.decision_insights
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- REALTIME (for live visitors)
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;