-- ============================================================
-- Admin paneli denetimi sırasında bulunan düzeltmeler.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

-- ------------------------------------------------------------
-- 1) papers tablosu — "Yeni Kağıt" kaydetme çalışmıyordu.
--    Kök neden: bu tabloya insert/update/delete için public-role policy
--    hiç tanımlanmamış (ya da "authenticated" şartlıydı — bu projede admin
--    oturumunda güvenilir çalışmadığı defalarca görüldü, bkz. 02_orders_fix.sql).
--    artworks/frame_options'ta çalışan aynı public deseni burada da uyguluyoruz.
-- ------------------------------------------------------------
alter table papers enable row level security;

drop policy if exists "Public read papers" on papers;
create policy "Public read papers" on papers for select using (true);

drop policy if exists "Public insert papers" on papers;
create policy "Public insert papers" on papers for insert with check (true);

drop policy if exists "Public update papers" on papers;
create policy "Public update papers" on papers for update using (true) with check (true);

drop policy if exists "Public delete papers" on papers;
create policy "Public delete papers" on papers for delete using (true);

-- ------------------------------------------------------------
-- 2) Sanatçı Hakkında (artist bio) — daha önce planlanmış ama hiç
--    yapılmamış. site_settings tablosuna (font_pair'in zaten yaşadığı
--    tablo) iki yeni kolon ekleniyor.
-- ------------------------------------------------------------
alter table site_settings add column if not exists artist_bio text;
alter table site_settings add column if not exists artist_photo_url text;

-- ------------------------------------------------------------
-- 3) Çerçeve sipariş formu (Cerceve.jsx) aslında hiç çalışmıyordu —
--    sadece arayüzdü, hiçbir yere kaydetmiyordu, Admin'de "Gelen Çerçeve
--    Siparişleri" diye bir şey de yoktu. Gerçek bir backend'e bağlıyoruz.
-- ------------------------------------------------------------
create table if not exists frame_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  size text not null,
  color text not null,
  quantity int not null default 1,
  image_url text not null,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  status text not null default 'hazirlaniyor',
  tracking_number text,
  session_id text,
  created_at timestamptz not null default now()
);

alter table frame_orders enable row level security;
drop policy if exists "Public insert frame_orders" on frame_orders;
create policy "Public insert frame_orders" on frame_orders for insert with check (true);
drop policy if exists "Public read frame_orders" on frame_orders;
create policy "Public read frame_orders" on frame_orders for select using (true);
drop policy if exists "Public update frame_orders" on frame_orders;
create policy "Public update frame_orders" on frame_orders for update using (true) with check (true);
drop policy if exists "Public delete frame_orders" on frame_orders;
create policy "Public delete frame_orders" on frame_orders for delete using (true);
