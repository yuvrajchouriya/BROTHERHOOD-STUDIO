-- FULL DATABASE SCHEMA :: BROTHERHOOD STUDIO
-- Run this script to initialize the entire database.
-- It is safe to run multiple times (uses IF NOT EXISTS).

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enum Types
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tables

-- ACTION HISTORY
CREATE TABLE IF NOT EXISTS action_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_taken TEXT NOT NULL,
    admin_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    related_insight_id UUID,
    result TEXT
);

-- ADMIN LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    module TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ANALYTICS CACHE
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    date_range TEXT NOT NULL,
    data JSONB NOT NULL,
    last_fetched_at TIMESTAMPTZ DEFAULT now()
);

-- ANALYTICS SETTINGS
CREATE TABLE IF NOT EXISTS analytics_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_enabled BOOLEAN DEFAULT true,
    click_tracking BOOLEAN DEFAULT true,
    scroll_tracking BOOLEAN DEFAULT true,
    geo_tracking BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 60,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- VISITORS (Needed for sessions)
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT NOT NULL,
    first_visit TIMESTAMPTZ DEFAULT now(),
    last_visit TIMESTAMPTZ DEFAULT now(),
    total_visits INTEGER DEFAULT 1,
    city TEXT,
    country TEXT,
    region TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT,
    screen_resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SESSIONS (Needed for page_views)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID REFERENCES visitors(id),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    entry_page TEXT,
    exit_page TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CLICK EVENTS
CREATE TABLE IF NOT EXISTS click_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    visitor_id UUID REFERENCES visitors(id),
    event_type TEXT NOT NULL,
    element_id TEXT,
    element_text TEXT,
    page_path TEXT NOT NULL,
    metadata JSONB,
    clicked_at TIMESTAMPTZ DEFAULT now()
);

-- DECISION INSIGHTS
CREATE TABLE IF NOT EXISTS decision_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    suggested_action TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    message TEXT,
    event_date TIMESTAMPTZ,
    event_type TEXT,
    location TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- FILMS
CREATE TABLE IF NOT EXISTS films (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_url TEXT,
    thumbnail_url TEXT,
    thumbnail_type TEXT,
    category TEXT,
    location TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- GALLERIES
CREATE TABLE IF NOT EXISTS galleries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_name TEXT NOT NULL,
    thumbnail_url TEXT,
    thumbnail_type TEXT,
    category TEXT,
    location TEXT,
    story_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- GALLERY PHOTOS
CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- GROWTH METRICS
CREATE TABLE IF NOT EXISTS growth_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    current_value NUMERIC,
    previous_value NUMERIC,
    growth_percent NUMERIC,
    date_range TEXT NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT now()
);

-- HOME FILMS
CREATE TABLE IF NOT EXISTS home_films (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    film_id UUID REFERENCES films(id),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- HOME PROJECTS
CREATE TABLE IF NOT EXISTS home_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    image_type TEXT,
    category TEXT,
    film_id UUID REFERENCES films(id),
    gallery_id UUID REFERENCES galleries(id),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_name TEXT NOT NULL,
    google_map_url TEXT,
    status TEXT DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PAGE VIEWS
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    visitor_id UUID REFERENCES visitors(id),
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer_path TEXT,
    time_on_page INTEGER,
    scroll_depth INTEGER,
    viewed_at TIMESTAMPTZ DEFAULT now()
);

-- PERFORMANCE ALERTS
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_type TEXT NOT NULL,
    severity TEXT,
    message TEXT,
    page_url TEXT NOT NULL,
    resolved BOOLEAN DEFAULT false,
    detected_at TIMESTAMPTZ DEFAULT now()
);

-- PERFORMANCE PAGES
CREATE TABLE IF NOT EXISTS performance_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL,
    device_type TEXT,
    score NUMERIC,
    lcp NUMERIC,
    cls NUMERIC,
    inp NUMERIC,
    load_time NUMERIC,
    status TEXT,
    last_checked TIMESTAMPTZ DEFAULT now()
);

-- PLANS
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name TEXT NOT NULL,
    price TEXT NOT NULL,
    duration TEXT,
    services TEXT[], -- Array of strings
    bonus_items TEXT[], -- Array of strings
    is_active BOOLEAN DEFAULT true,
    is_highlighted BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SEO CACHE
CREATE TABLE IF NOT EXISTS seo_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date_range)
);

-- SEO KEYWORDS
CREATE TABLE IF NOT EXISTS seo_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_range TEXT NOT NULL,
    keyword TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr NUMERIC DEFAULT 0,
    avg_position NUMERIC DEFAULT 0,
    page_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SEO PAGES
CREATE TABLE IF NOT EXISTS seo_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_url TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    avg_position NUMERIC DEFAULT 0,
    indexed BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'valid',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    thumbnail_type TEXT,
    video_url TEXT,
    video_urls TEXT[], -- Array of strings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICE FILMS
CREATE TABLE IF NOT EXISTS service_films (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    film_id UUID REFERENCES films(id) ON DELETE CASCADE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICE GALLERIES
CREATE TABLE IF NOT EXISTS service_galleries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICE PHOTOS
CREATE TABLE IF NOT EXISTS service_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    whatsapp_number TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    youtube_url TEXT,
    google_analytics_id TEXT,
    google_tag_manager_id TEXT,
    google_search_console TEXT,
    ga_property_id TEXT,
    ga_client_email TEXT,
    ga_private_key TEXT,
    pagespeed_api_key TEXT,
    gsc_site_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    photo_type TEXT,
    view_work_enabled BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TEAM WORK
CREATE TABLE IF NOT EXISTS team_work (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 4. Enable Row Level Security (RLS)
-- We enable RLS on all tables for security best practices.
-- You should create specific policies, but for now we will allow access to authenticated users or public read where typical.

ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Standard Public Read Policies (Simplify dev)
-- CAUTION: In production, you might want to restrict these further.

CREATE POLICY "Allow public read" ON films FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON galleries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON home_films FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON home_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON service_films FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON service_galleries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON service_photos FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON team_work FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON locations FOR SELECT USING (true);

-- Authenticated/Admin policies for modifying data would go here (e.g., insert/update/delete)
-- Example: 
-- CREATE POLICY "Allow admin full access" ON films TO authenticated USING (true) WITH CHECK (true);

