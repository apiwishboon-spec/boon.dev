-- ============================================================
-- Editable tags on blog_posts (jsonb), backfilled from the
-- post_tags/tags join that the initial schema used.
-- ============================================================
alter table public.blog_posts add column if not exists tags jsonb not null default '[]'::jsonb;

update public.blog_posts bp
set tags = coalesce(
    (select jsonb_agg(t.name order by t.name)
     from public.post_tags pt
     join public.tags t on t.id = pt.tag_id
     where pt.post_id = bp.id),
    '[]'::jsonb
)
where bp.tags = '[]'::jsonb
  and exists (select 1 from public.post_tags pt where pt.post_id = bp.id);