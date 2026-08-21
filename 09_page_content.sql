-- ============================================================
-- Sayfa metinlerini Admin'den düzenlenebilir yapmak için page_content
-- tablosu — page_images ile birebir aynı desen (page, section, unique
-- (page, section)). Satır yoksa/boşsa sayfa kendi hardcoded metnini
-- fallback olarak gösterir, böylece Admin'den hiç dokunulmamış alanlar
-- site bozulmadan eski haliyle kalır.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

create table if not exists page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (page, section)
);
alter table page_content enable row level security;
drop policy if exists "Public read page_content" on page_content;
create policy "Public read page_content" on page_content for select using (true);
drop policy if exists "Public write page_content" on page_content;
create policy "Public write page_content" on page_content for all using (true) with check (true);
