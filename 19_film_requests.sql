-- ============================================================
-- "Film Yıkama & Tarama" sayfasındaki talep formundan gelen istekleri
-- kaydeder. create-film-request fonksiyonu bu tabloya kayıt atıp
-- info@artipozstudio.com'a bildirim maili gönderiyor (site genelindeki
-- send-contact-email / create-photo-print-order ile aynı desen).
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

create table if not exists film_requests (
  id uuid primary key default gen_random_uuid(),
  isim text not null,
  telefon text,
  email text,
  hizmet text not null,
  film_adedi int not null default 1,
  film_turu text,
  notunuz text,
  status text not null default 'yeni',
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists film_requests_created_at_idx on film_requests (created_at);

alter table film_requests enable row level security;

-- Site genelindeki desenle aynı: gerçek koruma Admin.jsx'in kendi login
-- kontrolünde, bu yüzden select/update de public bırakıldı (bkz.
-- contact_messages, photo_print_orders).
drop policy if exists "Public insert film_requests" on film_requests;
create policy "Public insert film_requests" on film_requests for insert with check (true);
drop policy if exists "Public read film_requests" on film_requests;
create policy "Public read film_requests" on film_requests for select using (true);
drop policy if exists "Public update film_requests" on film_requests;
create policy "Public update film_requests" on film_requests for update using (true) with check (true);
