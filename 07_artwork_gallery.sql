-- ============================================================
-- Eserler (Admin.jsx) sekmesinde tek görsel yerine çoklu görsel/galeri desteği.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

create table if not exists artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);

alter table artwork_images enable row level security;
drop policy if exists "Public read artwork_images" on artwork_images;
create policy "Public read artwork_images" on artwork_images for select using (true);
drop policy if exists "Public insert artwork_images" on artwork_images;
create policy "Public insert artwork_images" on artwork_images for insert with check (true);
drop policy if exists "Public delete artwork_images" on artwork_images;
create policy "Public delete artwork_images" on artwork_images for delete using (true);
