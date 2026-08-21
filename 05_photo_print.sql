-- ============================================================
-- Fotoğraf Baskı sayfası: boy/yüzey fiyat matrisi + sipariş tabloları
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Fiyat matrisi (5 boy × 2 yüzey = 10 satır)
-- ------------------------------------------------------------
create table if not exists photo_print_prices (
  id uuid primary key default gen_random_uuid(),
  size text not null,
  finish text not null,
  price numeric not null default 0,
  unique (size, finish)
);

alter table photo_print_prices enable row level security;
drop policy if exists "Public read photo_print_prices" on photo_print_prices;
create policy "Public read photo_print_prices" on photo_print_prices for select using (true);
-- Fiyatları Admin panelden düzenleyebilmek için (bkz. 02_orders_fix.sql'deki
-- gerekçe: "authenticated" şartlı policy admin oturumunda güvenilir çalışmadı,
-- bu projede public + client-side login guard deseni kullanılıyor).
drop policy if exists "Public write photo_print_prices" on photo_print_prices;
create policy "Public write photo_print_prices" on photo_print_prices for all using (true) with check (true);

-- Seed data — mevcut fiyat yoksa doldur, varsa dokunma.
insert into photo_print_prices (size, finish, price)
values
  ('A2', 'Mat', 950),
  ('A2', 'Parlak', 950),
  ('A3', 'Mat', 650),
  ('A3', 'Parlak', 650),
  ('A4', 'Mat', 450),
  ('A4', 'Parlak', 450),
  ('A5', 'Mat', 280),
  ('A5', 'Parlak', 280),
  ('A6', 'Mat', 180),
  ('A6', 'Parlak', 180)
on conflict (size, finish) do nothing;

-- ------------------------------------------------------------
-- 2) Siparişler
-- ------------------------------------------------------------
create table if not exists photo_print_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  note text,
  total_price numeric not null default 0,
  status text not null default 'hazirlaniyor',
  session_id text,
  created_at timestamptz not null default now()
);

alter table photo_print_orders enable row level security;
drop policy if exists "Public insert photo_print_orders" on photo_print_orders;
create policy "Public insert photo_print_orders" on photo_print_orders for insert with check (true);
drop policy if exists "Public read photo_print_orders" on photo_print_orders;
create policy "Public read photo_print_orders" on photo_print_orders for select using (true);
drop policy if exists "Public update photo_print_orders" on photo_print_orders;
create policy "Public update photo_print_orders" on photo_print_orders for update using (true) with check (true);
drop policy if exists "Public delete photo_print_orders" on photo_print_orders;
create policy "Public delete photo_print_orders" on photo_print_orders for delete using (true);

-- ------------------------------------------------------------
-- 3) Sipariş satırları (bir siparişte birden fazla foto/boy/yüzey kombinasyonu olabilir)
-- ------------------------------------------------------------
create table if not exists photo_print_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references photo_print_orders(id) on delete cascade,
  image_url text not null,
  size text not null,
  finish text not null,
  quantity int not null default 1,
  unit_price numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

alter table photo_print_order_items enable row level security;
drop policy if exists "Public insert photo_print_order_items" on photo_print_order_items;
create policy "Public insert photo_print_order_items" on photo_print_order_items for insert with check (true);
drop policy if exists "Public read photo_print_order_items" on photo_print_order_items;
create policy "Public read photo_print_order_items" on photo_print_order_items for select using (true);
drop policy if exists "Public delete photo_print_order_items" on photo_print_order_items;
create policy "Public delete photo_print_order_items" on photo_print_order_items for delete using (true);
