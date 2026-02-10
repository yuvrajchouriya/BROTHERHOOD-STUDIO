-- SEO Cache table for storing GSC data
CREATE TABLE public.seo_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  date_range TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  last_fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(metric_type, date_range)
);

-- SEO Keywords tracking
CREATE TABLE public.seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  avg_position DECIMAL(5,2) DEFAULT 0,
  page_url TEXT,
  date_range TEXT NOT NULL DEFAULT '7d',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SEO Pages status
CREATE TABLE public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  avg_position DECIMAL(5,2) DEFAULT 0,
  indexed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'unknown',
  last_checked TIMESTAMPTZ DEFAULT now()
);

-- Performance pages data for Core Web Vitals
CREATE TABLE public.performance_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  device_type TEXT DEFAULT 'mobile',
  load_time INTEGER DEFAULT 0,
  lcp DECIMAL(5,2) DEFAULT 0,
  cls DECIMAL(5,3) DEFAULT 0,
  inp INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'unknown',
  last_checked TIMESTAMPTZ DEFAULT now()
);

-- Performance alerts
CREATE TABLE public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  message TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

-- Growth metrics tracking
CREATE TABLE public.growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  previous_value DECIMAL(10,2) DEFAULT 0,
  growth_percent DECIMAL(5,2) DEFAULT 0,
  date_range TEXT NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Action history for Decision Engine
CREATE TABLE public.action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_taken TEXT NOT NULL,
  related_insight_id UUID REFERENCES public.decision_insights(id) ON DELETE SET NULL,
  result TEXT,
  admin_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access
CREATE POLICY "Admin full access seo_cache" ON public.seo_cache FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access seo_keywords" ON public.seo_keywords FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access seo_pages" ON public.seo_pages FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access performance_pages" ON public.performance_pages FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access performance_alerts" ON public.performance_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access growth_metrics" ON public.growth_metrics FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access action_history" ON public.action_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_seo_keywords_keyword ON public.seo_keywords(keyword);
CREATE INDEX idx_seo_keywords_date_range ON public.seo_keywords(date_range);
CREATE INDEX idx_seo_pages_page_url ON public.seo_pages(page_url);
CREATE INDEX idx_performance_pages_url ON public.performance_pages(page_url);
CREATE INDEX idx_performance_alerts_resolved ON public.performance_alerts(resolved);
CREATE INDEX idx_growth_metrics_name ON public.growth_metrics(metric_name);
CREATE INDEX idx_action_history_admin ON public.action_history(admin_id);