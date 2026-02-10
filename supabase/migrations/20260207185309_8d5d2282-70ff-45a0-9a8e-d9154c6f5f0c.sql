-- =============================================
-- BROTHERHOOD STUDIO DATABASE SCHEMA
-- =============================================

-- Step 1: Create Role Enum
create type public.app_role as enum ('admin', 'moderator');

-- Step 2: Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamptz default now(),
    unique (user_id, role)
);

-- Step 3: Security definer function for role check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Step 4: Create galleries table
create table public.galleries (
    id uuid primary key default gen_random_uuid(),
    project_name text not null,
    story_text text,
    location text,
    category text check (category in ('Wedding', 'Pre-Wedding')),
    thumbnail_type text check (thumbnail_type in ('upload', 'url')),
    thumbnail_url text,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Step 5: Create gallery_photos table
create table public.gallery_photos (
    id uuid primary key default gen_random_uuid(),
    gallery_id uuid references public.galleries(id) on delete cascade not null,
    image_type text check (image_type in ('upload', 'url')),
    image_url text not null,
    display_order integer default 0,
    created_at timestamptz default now()
);

-- Step 6: Create home_projects table
create table public.home_projects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    subtitle text,
    image_type text check (image_type in ('upload', 'url')),
    image_url text,
    gallery_id uuid references public.galleries(id) on delete set null,
    display_order integer default 0,
    is_visible boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Step 7: Create films table
create table public.films (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    category text check (category in ('Wedding', 'Pre-Wedding', 'Reel')),
    thumbnail_type text check (thumbnail_type in ('upload', 'url')),
    thumbnail_url text,
    youtube_url text,
    location text,
    is_visible boolean default true,
    display_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Step 8: Create plans table
create table public.plans (
    id uuid primary key default gen_random_uuid(),
    plan_name text not null,
    price text not null,
    duration text,
    services text[] default '{}',
    bonus_items text[] default '{}',
    is_highlighted boolean default false,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Step 9: Create enquiries table
create table public.enquiries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null,
    email text,
    event_type text,
    event_date date,
    location text,
    message text,
    source text,
    status text default 'New' check (status in ('New', 'Contacted', 'Closed')),
    created_at timestamptz default now()
);

-- Step 10: Create team_members table
create table public.team_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    role text not null,
    photo_type text check (photo_type in ('upload', 'url')),
    photo_url text,
    bio text,
    view_work_enabled boolean default false,
    is_visible boolean default true,
    display_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Step 11: Create team_work table
create table public.team_work (
    id uuid primary key default gen_random_uuid(),
    team_member_id uuid references public.team_members(id) on delete cascade not null,
    image_type text check (image_type in ('upload', 'url')),
    image_url text not null,
    display_order integer default 0,
    created_at timestamptz default now()
);

-- Step 12: Create site_settings table
create table public.site_settings (
    id uuid primary key default gen_random_uuid(),
    whatsapp_number text default '919301781585',
    instagram_url text,
    youtube_url text,
    facebook_url text,
    updated_at timestamptz default now()
);

-- Step 13: Create locations table
create table public.locations (
    id uuid primary key default gen_random_uuid(),
    city_name text not null,
    google_map_url text,
    status text default 'Active' check (status in ('Active', 'ComingSoon')),
    display_order integer default 0,
    created_at timestamptz default now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

alter table public.user_roles enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.home_projects enable row level security;
alter table public.films enable row level security;
alter table public.plans enable row level security;
alter table public.enquiries enable row level security;
alter table public.team_members enable row level security;
alter table public.team_work enable row level security;
alter table public.site_settings enable row level security;
alter table public.locations enable row level security;

-- =============================================
-- PUBLIC READ POLICIES (Website Visitors)
-- =============================================

create policy "Public can view active galleries" on public.galleries
for select using (is_active = true);

create policy "Public can view gallery photos" on public.gallery_photos
for select using (true);

create policy "Public can view visible home projects" on public.home_projects
for select using (is_visible = true);

create policy "Public can view visible films" on public.films
for select using (is_visible = true);

create policy "Public can view active plans" on public.plans
for select using (is_active = true);

create policy "Public can view visible team members" on public.team_members
for select using (is_visible = true);

create policy "Public can view team work" on public.team_work
for select using (true);

create policy "Public can view site settings" on public.site_settings
for select using (true);

create policy "Public can view locations" on public.locations
for select using (true);

-- Public can submit enquiries
create policy "Anyone can submit enquiry" on public.enquiries
for insert with check (true);

-- =============================================
-- ADMIN FULL ACCESS POLICIES
-- =============================================

create policy "Admin full access galleries" on public.galleries
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access gallery_photos" on public.gallery_photos
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access home_projects" on public.home_projects
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access films" on public.films
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access plans" on public.plans
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access enquiries" on public.enquiries
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access team_members" on public.team_members
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access team_work" on public.team_work
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access site_settings" on public.site_settings
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin full access locations" on public.locations
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admin can manage user_roles" on public.user_roles
for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- STORAGE BUCKET FOR MEDIA
-- =============================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true);

-- Storage policies
create policy "Admin can upload media" on storage.objects
for insert to authenticated with check (
  bucket_id = 'media' and public.has_role(auth.uid(), 'admin')
);

create policy "Public can view media" on storage.objects
for select using (bucket_id = 'media');

create policy "Admin can delete media" on storage.objects
for delete to authenticated using (
  bucket_id = 'media' and public.has_role(auth.uid(), 'admin')
);

create policy "Admin can update media" on storage.objects
for update to authenticated using (
  bucket_id = 'media' and public.has_role(auth.uid(), 'admin')
);

-- =============================================
-- INSERT DEFAULT SITE SETTINGS
-- =============================================

insert into public.site_settings (whatsapp_number, instagram_url, youtube_url, facebook_url)
values ('919301781585', 'https://instagram.com/brotherhood.studio', 'https://youtube.com/@brotherhoodstudio', 'https://facebook.com/brotherhoodstudio');