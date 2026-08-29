-- ============================================================
-- Boon.dev dynamic site: initial schema
-- Tables: site_config, nav_links, projects, blog_posts, tags,
--         post_tags, honors, resources, timeline_milestones, skills
-- RLS: anon (public) = SELECT only; authenticated (admin) = CRUD
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- site_config (single row)
-- ------------------------------------------------------------
create table if not exists public.site_config (
    id integer primary key default 1 check (id = 1),
    site_title text not null default 'Boon',
    brand text not null default 'BOON.DEV',
    tagline text not null default '',
    footer_text text not null default '',
    copyright text not null default '© 2025 APIWISH ANUTARAVANICHKUL.',
    socials jsonb not null default '[]'::jsonb, -- [{type,label,url,icon}]
    about text not null default '',
    contact_heading text not null default 'Let''s Build Something',
    contact_subtext text not null default '',
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- nav_links
-- ------------------------------------------------------------
create table if not exists public.nav_links (
    id uuid primary key default gen_random_uuid(),
    label text not null,
    href text not null default '/',
    sort_order int not null default 0,
    enabled boolean not null default true,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- projects
-- ------------------------------------------------------------
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title text not null,
    tagline text not null default '',
    description text not null default '',
    cover_url text not null default '',
    tags jsonb not null default '[]'::jsonb,   -- [{label,}]
    tech jsonb not null default '[]'::jsonb,   -- ["Python","AI"]
    live_url text not null default '',
    github_url text not null default '',
    body text not null default '',             -- markdown
    featured boolean not null default false,
    sort_order int not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- blog_posts + tags + post_tags
-- ------------------------------------------------------------
create table if not exists public.tags (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title text not null,
    date date not null default current_date,
    excerpt text not null default '',
    body text not null default '',             -- markdown
    image_url text not null default '',
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.post_tags (
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    primary key (post_id, tag_id)
);

-- ------------------------------------------------------------
-- honors (prizes / certificates)
-- ------------------------------------------------------------
create table if not exists public.honors (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null default '',
    image_url text not null default '',
    alt text not null default '',
    badge_class text not null default '',
    badge_icon text not null default '',
    badge_label text not null default '',
    badge_title text not null default '',
    pin_color text not null default 'bg-danger',
    rotation text not null default '0deg',
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- resources (file downloads, grouped by category)
-- ------------------------------------------------------------
create table if not exists public.resources (
    id uuid primary key default gen_random_uuid(),
    category text not null default 'Other',
    title text not null,
    description text not null default '',
    file_url text not null default '',
    preview_url text not null default '',
    file_type text not null default '',
    file_size text not null default '',
    protected boolean not null default false,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- timeline_milestones (about / journey)
-- ------------------------------------------------------------
create table if not exists public.timeline_milestones (
    id uuid primary key default gen_random_uuid(),
    period_label text not null default '',
    title text not null,
    description text not null default '',
    icon text not null default 'fa-star',
    is_current boolean not null default false,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- skills
-- ------------------------------------------------------------
create table if not exists public.skills (
    id uuid primary key default gen_random_uuid(),
    label text not null,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.site_config enable row level security;
alter table public.nav_links enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.honors enable row level security;
alter table public.resources enable row level security;
alter table public.timeline_milestones enable row level security;
alter table public.skills enable row level security;

-- Public read access (anon key) ----------
do $$
declare t text;
begin
  foreach t in array array['site_config','nav_links','projects','blog_posts','tags','post_tags','honors','resources','timeline_milestones','skills']
  loop
    execute format('create policy "Public read %1$s" on public.%1$s for select to anon using (true);', t);
  end loop;
end $$;

-- Admin (authenticated) full access ------
do $$
declare t text;
begin
  foreach t in array array['site_config','nav_links','projects','blog_posts','tags','post_tags','honors','resources','timeline_milestones','skills']
  loop
    execute format(
      'create policy "Admin all %1$s" on public.%1$s for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ============================================================
-- STORAGE: public bucket for uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- allow anon to read media
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media" on storage.objects
    for select to anon, authenticated using (bucket_id = 'media');

-- allow authenticated (admin) to upload/update/delete media
drop policy if exists "Admin write media" on storage.objects;
create policy "Admin write media" on storage.objects
    for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
