-- ============================================================
-- Ensure the public 'media' storage bucket exists for admin uploads
-- (0001 referenced it, but this project's remote never had it applied).
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','application/pdf'])
on conflict (id) do update set
    public = true;

-- allow anon to read media
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media" on storage.objects
    for select to anon, authenticated using (bucket_id = 'media');

-- allow authenticated (admin) to upload/update/delete media
drop policy if exists "Admin write media" on storage.objects;
create policy "Admin write media" on storage.objects
    for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');