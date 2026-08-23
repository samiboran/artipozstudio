-- ============================================================
-- İşler kataloğu geliştirmeleri: gerçek ürün alanları + "mockup"
-- (duvarda/mekanda gösterim) görselleri için ayrı tablo.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

-- Grid kartındaki "Lisianthus / Photograph" formatındaki tür bilgisi
-- (artworks.medium zaten fotoğraf/resim/baskı/heykel gibi geniş
-- kategori için kullanılıyor — type ayrı, daha spesifik bir alan).
alter table artworks add column if not exists type text;

-- Grid kartı ve ürün detayındaki malzeme satırı, ör:
-- "Black & White · Hahnemühle Museum Etching"
alter table artworks add column if not exists material text;

-- Ürünün bir mekanda/duvarda çerçeveli göründüğü mockup fotoğrafları —
-- artwork_images (ürünün kendi farklı açı/yakın çekim görselleri) ile
-- KARIŞTIRILMASIN, tamamen ayrı bir görsel seti. En fazla 4 adet,
-- Admin tarafında aşamalı (bir öncekine yüklenince bir sonraki slot
-- açılır) olarak yönetiliyor.
create table if not exists artwork_mockups (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);

alter table artwork_mockups enable row level security;
drop policy if exists "Public read artwork_mockups" on artwork_mockups;
create policy "Public read artwork_mockups" on artwork_mockups for select using (true);
drop policy if exists "Public insert artwork_mockups" on artwork_mockups;
create policy "Public insert artwork_mockups" on artwork_mockups for insert with check (true);
drop policy if exists "Public delete artwork_mockups" on artwork_mockups;
create policy "Public delete artwork_mockups" on artwork_mockups for delete using (true);
