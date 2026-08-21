-- ============================================================
-- Basit ziyaretçi istatistikleri — hangi sayfalar görüntüleniyor,
-- kaç tekil ziyaretçi var, kabaca oturum süresi ne kadar.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at);
create index if not exists page_views_session_id_idx on page_views (session_id);

alter table page_views enable row level security;

-- cart_events'teki ile aynı desen: "authenticated" şartlı policy admin oturumunda
-- güvenilir çalışmadığı için (bkz. 02_orders_fix.sql), select de public bırakıldı.
-- Gerçek koruma Admin.jsx'in kendi login kontrolünde — bu tablo herkese açık
-- bir sipariş/ödeme bilgisi değil, sadece anonim sayfa gezinme kaydı.
drop policy if exists "Public insert page_views" on page_views;
create policy "Public insert page_views" on page_views for insert with check (true);
drop policy if exists "Public read page_views" on page_views;
create policy "Public read page_views" on page_views for select using (true);
