-- ============================================================
-- Uptime dashboard targets
-- Each target shows a live check ("auto"), a fixed status, or a
-- custom user-defined status (e.g. closed for maintenance).
-- ============================================================
create table if not exists public.uptime_targets (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    url text not null default '',
    mode text not null default 'auto'
        check (mode in ('auto', 'operational', 'degraded', 'maintenance', 'down', 'custom')),
    custom_label text not null default '',
    note text not null default '',
    enabled boolean not null default true,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

comment on column public.uptime_targets.mode is
  'auto = live-check via browser ping; operational/degraded/maintenance/down = fixed status; custom = use custom_label';

alter table public.uptime_targets enable row level security;

create policy "Public read uptime_targets"
    on public.uptime_targets for select to anon using (true);

create policy "Admin all uptime_targets"
    on public.uptime_targets for all to authenticated using (true) with check (true);

-- Seed the existing services so the dashboard is populated out of the box.
insert into public.uptime_targets (name, url, mode, sort_order)
values
    ('Main Portfolio', 'https://boon.is-a.dev', 'auto', 1),
    ('Blog', 'https://boon.is-a.dev/blog/', 'auto', 2),
    ('Admin', 'https://boon.is-a.dev/admin', 'auto', 3),
    ('Uptime Dashboard', 'https://boon.is-a.dev/uptime/', 'auto', 4)
on conflict do nothing;