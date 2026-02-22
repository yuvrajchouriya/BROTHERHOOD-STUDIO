-- ============================================================
-- BROTHERHOOD STUDIO - COMPLETE IMAGE TABLES SETUP
-- Supabase SQL Editor me yeh poora SQL run karo
-- Yeh sabhi image/photo sections ke liye tables banata hai
-- ============================================================

-- ============================================================
-- 1. SERVICES TABLE (thumbnail image ke liye)
--    Admin Panel: Services section
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_type TEXT DEFAULT 'url',
  thumbnail_url TEXT,
  video_urls TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. FILMS TABLE (thumbnail image ke liye)
--    Admin Panel: Films section
-- ============================================================
CREATE TABLE IF NOT EXISTS films (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  thumbnail_type TEXT DEFAULT 'url',
  thumbnail_url TEXT,
  youtube_url TEXT,
  location TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. GALLERIES TABLE (thumbnail image ke liye)
--    Admin Panel: Galleries section
-- ============================================================
CREATE TABLE IF NOT EXISTS galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  story_text TEXT,
  location TEXT,
  category TEXT,
  thumbnail_type TEXT DEFAULT 'url',
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. GALLERY_PHOTOS TABLE (gallery ke andar multiple photos)
--    Admin Panel: Galleries > Photos section
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_type TEXT DEFAULT 'url',
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SERVICE_PHOTOS TABLE (service ke andar multiple photos)
--    Admin Panel: Services > Photos section
-- ============================================================
CREATE TABLE IF NOT EXISTS service_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_type TEXT DEFAULT 'url',
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TEAM_MEMBERS TABLE (profile photo ke liye)
--    Admin Panel: Team Members section
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_type TEXT DEFAULT 'url',
  photo_url TEXT,
  bio TEXT,
  view_work_enabled BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TEAM_WORK TABLE (team member ke portfolio photos)
--    Admin Panel: Team Members > Work section
-- ============================================================
CREATE TABLE IF NOT EXISTS team_work (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  image_type TEXT DEFAULT 'url',
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. HOME_PROJECTS TABLE (home page projects/galleries + home films)
--    Admin Panel: Home Projects section & Home Films section
-- ============================================================
CREATE TABLE IF NOT EXISTS home_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_type TEXT DEFAULT 'url',
  image_url TEXT,
  gallery_id UUID REFERENCES galleries(id) ON DELETE SET NULL,
  film_id UUID REFERENCES films(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'gallery', -- 'gallery' ya 'film'
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read services" ON services;
DROP POLICY IF EXISTS "Admin full access services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin full access services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Films
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read films" ON films;
DROP POLICY IF EXISTS "Admin full access films" ON films;
CREATE POLICY "Public read films" ON films FOR SELECT USING (true);
CREATE POLICY "Admin full access films" ON films FOR ALL USING (auth.role() = 'authenticated');

-- Galleries
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read galleries" ON galleries;
DROP POLICY IF EXISTS "Admin full access galleries" ON galleries;
CREATE POLICY "Public read galleries" ON galleries FOR SELECT USING (true);
CREATE POLICY "Admin full access galleries" ON galleries FOR ALL USING (auth.role() = 'authenticated');

-- Gallery Photos
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read gallery_photos" ON gallery_photos;
DROP POLICY IF EXISTS "Admin full access gallery_photos" ON gallery_photos;
CREATE POLICY "Public read gallery_photos" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Admin full access gallery_photos" ON gallery_photos FOR ALL USING (auth.role() = 'authenticated');

-- Service Photos
ALTER TABLE service_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read service_photos" ON service_photos;
DROP POLICY IF EXISTS "Admin full access service_photos" ON service_photos;
CREATE POLICY "Public read service_photos" ON service_photos FOR SELECT USING (true);
CREATE POLICY "Admin full access service_photos" ON service_photos FOR ALL USING (auth.role() = 'authenticated');

-- Team Members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read team_members" ON team_members;
DROP POLICY IF EXISTS "Admin full access team_members" ON team_members;
CREATE POLICY "Public read team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Admin full access team_members" ON team_members FOR ALL USING (auth.role() = 'authenticated');

-- Team Work
ALTER TABLE team_work ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read team_work" ON team_work;
DROP POLICY IF EXISTS "Admin full access team_work" ON team_work;
CREATE POLICY "Public read team_work" ON team_work FOR SELECT USING (true);
CREATE POLICY "Admin full access team_work" ON team_work FOR ALL USING (auth.role() = 'authenticated');

-- Home Projects
ALTER TABLE home_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read home_projects" ON home_projects;
DROP POLICY IF EXISTS "Admin full access home_projects" ON home_projects;
CREATE POLICY "Public read home_projects" ON home_projects FOR SELECT USING (true);
CREATE POLICY "Admin full access home_projects" ON home_projects FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET SETUP
-- 'media' bucket banao agar exist nahi karta
-- ============================================================

-- Media bucket create karo (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public media read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;

CREATE POLICY "Public media read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ============================================================
-- VERIFY: Check karo ki sabhi tables exist hain
-- ============================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'services', 
    'films', 
    'galleries', 
    'gallery_photos', 
    'service_photos', 
    'team_members', 
    'team_work', 
    'home_projects'
  )
ORDER BY table_name;
