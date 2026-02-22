-- ============================================================
-- BROTHERHOOD STUDIO - COMPLETE DATABASE SETUP
-- Version: Final Clean (Only Active Features)
-- 
-- Supabase SQL Editor me yeh poora SQL ek baar me run karo.
-- Yeh sabhi currently-active admin panel features ke liye
-- required tables, RLS policies, aur storage bucket banata hai.
--
-- TABLES INCLUDED (13 total):
--   1. services           - Services management
--   2. service_photos     - Service gallery photos
--   3. service_galleries  - Service featured galleries
--   4. service_films      - Service featured films
--   5. films              - Films / reels management
--   6. galleries          - Gallery projects
--   7. gallery_photos     - Photos inside galleries
--   8. team_members       - Team member profiles
--   9. team_work          - Team member portfolio photos
--  10. home_projects      - Home page galleries + films section
--  11. enquiries          - Booking enquiries from contact form
--  12. locations          - Service locations / cities
--  13. plans              - Pricing packages
--
-- SECURITY TABLES (3):
--  14. admin_login_attempts - Track failed logins
--  15. admin_activity_log   - Admin action audit trail
--  16. admin_allowed_ips    - Whitelisted IPs
--
-- STORAGE: 'media' bucket for all image uploads
-- ============================================================


-- ============================================================
-- SECTION 1: CORE CONTENT TABLES
-- ============================================================

-- -----------------------------------------------------------
-- 1. SERVICES
--    Admin: Services section (thumbnail image supported)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  description   TEXT,
  thumbnail_type TEXT       DEFAULT 'url',
  thumbnail_url TEXT,
  video_urls    TEXT[]      DEFAULT '{}',
  is_active     BOOLEAN     DEFAULT TRUE,
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 2. SERVICE_PHOTOS
--    Admin: Services → Photos (multiple images per service)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_photos (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id    UUID        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_type    TEXT        DEFAULT 'url',
  image_url     TEXT        NOT NULL,
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 3. SERVICE_GALLERIES
--    Admin: ServiceContent → Featured Galleries per service
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_galleries (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id    UUID        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  gallery_id    UUID,       -- references galleries(id), set later
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 4. SERVICE_FILMS
--    Admin: ServiceContent → Featured Films per service
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_films (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id    UUID        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  film_id       UUID,       -- references films(id), set later
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 5. FILMS
--    Admin: Films section (thumbnail image supported)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS films (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT        NOT NULL,
  category       TEXT,
  thumbnail_type TEXT        DEFAULT 'url',
  thumbnail_url  TEXT,
  youtube_url    TEXT,
  location       TEXT,
  is_visible     BOOLEAN     DEFAULT TRUE,
  display_order  INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 6. GALLERIES
--    Admin: Galleries section (thumbnail image supported)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS galleries (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name   TEXT        NOT NULL,
  story_text     TEXT,
  location       TEXT,
  category       TEXT,
  thumbnail_type TEXT        DEFAULT 'url',
  thumbnail_url  TEXT,
  is_active      BOOLEAN     DEFAULT TRUE,
  display_order  INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 7. GALLERY_PHOTOS
--    Admin: Galleries → Photos (multiple images per gallery)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_photos (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id    UUID        NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_type    TEXT        DEFAULT 'url',
  image_url     TEXT        NOT NULL,
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Now add FK constraints that were deferred above
ALTER TABLE service_galleries
  ADD CONSTRAINT IF NOT EXISTS fk_sg_gallery
  FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE;

ALTER TABLE service_films
  ADD CONSTRAINT IF NOT EXISTS fk_sf_film
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE;

-- -----------------------------------------------------------
-- 8. TEAM_MEMBERS
--    Admin: Team Members section (profile photo supported)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name               TEXT        NOT NULL,
  role               TEXT        NOT NULL,
  photo_type         TEXT        DEFAULT 'url',
  photo_url          TEXT,
  bio                TEXT,
  view_work_enabled  BOOLEAN     DEFAULT FALSE,
  is_visible         BOOLEAN     DEFAULT TRUE,
  display_order      INTEGER     DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 9. TEAM_WORK
--    Admin: Team → Work Portfolio (multiple images per member)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_work (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id   UUID        NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  image_type       TEXT        DEFAULT 'url',
  image_url        TEXT        NOT NULL,
  display_order    INTEGER     DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 10. HOME_PROJECTS
--     Admin: Home Galleries + Home Films sections
--     category = 'gallery' for Home Projects
--     category = 'film'    for Home Films
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_projects (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  subtitle      TEXT,
  image_type    TEXT        DEFAULT 'url',
  image_url     TEXT,
  gallery_id    UUID        REFERENCES galleries(id) ON DELETE SET NULL,
  film_id       UUID        REFERENCES films(id) ON DELETE SET NULL,
  category      TEXT        DEFAULT 'gallery',
  is_visible    BOOLEAN     DEFAULT TRUE,
  display_order INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 11. ENQUIRIES
--     Admin: Enquiries section (booking form submissions)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS enquiries (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  phone       TEXT        NOT NULL,
  email       TEXT,
  event_type  TEXT,
  event_date  DATE,
  location    TEXT,
  message     TEXT,
  source      TEXT,
  status      TEXT        DEFAULT 'New',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 12. LOCATIONS
--     Admin: Locations section (service cities)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name       TEXT        NOT NULL,
  google_map_url  TEXT,
  status          TEXT        DEFAULT 'Active',
  display_order   INTEGER     DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 13. PLANS
--     Admin: Plans section (pricing packages)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name      TEXT        NOT NULL,
  price          TEXT        NOT NULL,
  duration       TEXT,
  services       TEXT[]      DEFAULT '{}',
  bonus_items    TEXT[]      DEFAULT '{}',
  is_highlighted BOOLEAN     DEFAULT FALSE,
  is_active      BOOLEAN     DEFAULT TRUE,
  display_order  INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SECTION 2: SECURITY TABLES (Admin Login Protection)
-- ============================================================

-- -----------------------------------------------------------
-- 14. ADMIN_LOGIN_ATTEMPTS
--     AdminLogin.tsx: Tracks failed login attempts
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address   TEXT,
  email        TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success      BOOLEAN     DEFAULT FALSE,
  user_agent   TEXT
);

-- -----------------------------------------------------------
-- 15. ADMIN_ACTIVITY_LOG
--     AdminLayout.tsx + SecurityDashboard: Admin action audit
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  action     TEXT        NOT NULL,
  details    TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 16. ADMIN_ALLOWED_IPS
--     AdminLogin.tsx + SecurityDashboard: IP whitelist
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_allowed_ips (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT        NOT NULL UNIQUE,
  label      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AdminLogin.tsx me admin_lockouts bhi use hota hai
CREATE TABLE IF NOT EXISTS admin_lockouts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address  TEXT,
  email       TEXT,
  locked_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  reason      TEXT
);


-- ============================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Helper: Enable RLS on all tables
ALTER TABLE services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_photos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_galleries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_films        ENABLE ROW LEVEL SECURITY;
ALTER TABLE films                ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_work            ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans                ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowed_ips    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_lockouts       ENABLE ROW LEVEL SECURITY;

-- Drop old policies cleanly before re-creating
DO $$ DECLARE
  t TEXT;
  p TEXT;
BEGIN
  FOR t, p IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
      'services','service_photos','service_galleries','service_films',
      'films','galleries','gallery_photos',
      'team_members','team_work','home_projects',
      'enquiries','locations','plans',
      'admin_login_attempts','admin_activity_log','admin_allowed_ips','admin_lockouts'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p, t);
  END LOOP;
END $$;

-- PUBLIC READ policies (website visitors can read content)
CREATE POLICY "public_read" ON services             FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON service_photos       FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON service_galleries    FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON service_films        FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON films                FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON galleries            FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON gallery_photos       FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON team_members         FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON team_work            FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON home_projects        FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON locations            FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON plans                FOR SELECT USING (TRUE);

-- PUBLIC INSERT for enquiries (contact form)
CREATE POLICY "public_insert_enquiry" ON enquiries  FOR INSERT WITH CHECK (TRUE);

-- ADMIN FULL ACCESS (authenticated users = admin)
CREATE POLICY "admin_all" ON services          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON service_photos    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON service_galleries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON service_films     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON films             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON galleries         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON gallery_photos    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON team_members      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON team_work         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON home_projects     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON enquiries         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON locations         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON plans             FOR ALL USING (auth.role() = 'authenticated');

-- Security tables: allow INSERT from anyone (login form needs it), admin reads all
CREATE POLICY "allow_insert" ON admin_login_attempts FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "allow_insert" ON admin_lockouts       FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "allow_insert" ON admin_activity_log   FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "admin_read"   ON admin_login_attempts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_read"   ON admin_activity_log   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all"    ON admin_allowed_ips    FOR ALL    USING (auth.role() = 'authenticated');
CREATE POLICY "admin_delete" ON admin_lockouts       FOR DELETE USING (auth.role() = 'authenticated');
-- Allow reading allowed IPs during login check (before auth)
CREATE POLICY "public_read_ips" ON admin_allowed_ips FOR SELECT USING (TRUE);


-- ============================================================
-- SECTION 4: STORAGE BUCKET SETUP
-- 'media' bucket - sabhi image uploads yahan store hote hain
--
-- Folders used:
--   services/         - Service thumbnails
--   service-photos/   - Service gallery photos
--   films/            - Film thumbnails
--   galleries/        - Gallery thumbnails
--   gallery-photos/   - Gallery photos
--   team-members/     - Team member profile photos
--   team-work/        - Team member portfolio photos
--   home_films/       - Home films section images
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  52428800,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public              = TRUE,
  file_size_limit     = 52428800,
  allowed_mime_types  = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml'];

-- Storage RLS
DROP POLICY IF EXISTS "media_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "media_auth_insert"  ON storage.objects;
DROP POLICY IF EXISTS "media_auth_update"  ON storage.objects;
DROP POLICY IF EXISTS "media_auth_delete"  ON storage.objects;

CREATE POLICY "media_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media_auth_insert"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "media_auth_update"  ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "media_auth_delete"  ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');


-- ============================================================
-- VERIFICATION: Run this to confirm all tables are created
-- ============================================================
SELECT
  table_name,
  CASE WHEN table_name IN (
    'services','service_photos','service_galleries','service_films',
    'films','galleries','gallery_photos',
    'team_members','team_work','home_projects',
    'enquiries','locations','plans',
    'admin_login_attempts','admin_activity_log','admin_allowed_ips','admin_lockouts'
  ) THEN '✅ Created' ELSE '❓ Other' END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'services','service_photos','service_galleries','service_films',
    'films','galleries','gallery_photos',
    'team_members','team_work','home_projects',
    'enquiries','locations','plans',
    'admin_login_attempts','admin_activity_log','admin_allowed_ips','admin_lockouts'
  )
ORDER BY table_name;

-- ============================================================
-- END OF SCRIPT
-- ============================================================
