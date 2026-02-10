-- =================================================================
-- ADVANCED RUM MODULES: USER JOURNEY & SESSION REPLAY
-- =================================================================

-- 1. JOURNEYS TABLE (Tracks entire visit flow)
CREATE TABLE IF NOT EXISTS rum_journeys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    entry_page TEXT,
    exit_page TEXT,
    device_type TEXT,
    country TEXT,
    total_duration_sec INTEGER,
    step_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' -- 'active', 'completed', 'bounced', 'abandoned'
);

-- 2. JOURNEY EVENTS (Steps within a journey)
CREATE TABLE IF NOT EXISTS rum_journey_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id UUID REFERENCES rum_journeys(id),
    event_type TEXT NOT NULL, -- 'page_view', 'click', 'api_call', 'error', 'custom'
    page_url TEXT,
    element_selector TEXT, -- For clicks
    delay_ms INTEGER, -- Duration of this step/action
    metadata JSONB DEFAULT '{}'::jsonb, -- Store API details, error msg, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SESSION REPLAY EVENTS (Lightweight coords & actions)
CREATE TABLE IF NOT EXISTS rum_replay_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id UUID REFERENCES rum_journeys(id),
    events_chunk JSONB, -- Array of compressed events [{t:100, x:50, y:50, e:'mousemove'}]
    chunk_index INTEGER, -- For reassembling user session (0, 1, 2...)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ENABLE RLS
ALTER TABLE rum_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rum_replay_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
CREATE POLICY "Allow public insert" ON rum_journeys FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON rum_journeys FOR SELECT USING (true); -- Admin read

CREATE POLICY "Allow public insert" ON rum_journey_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON rum_journey_events FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON rum_replay_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON rum_replay_events FOR SELECT USING (true);
