-- ============================================================
-- Admin'de bir görsel slotuna tıklayıp dosya seçince görsel eklenmiyordu
-- (herhangi bir hata mesajı da görünmüyordu — Admin.jsx'teki bu sessiz
-- hata yutma ayrı bir commit'te düzeltildi). En olası sebep: page_images
-- tablosunda hiç RLS policy'si yoktu — bu tablo, projedeki diğer tüm
-- tablolar için uygulanan "public (using (true))" düzeltmesini
-- (02_orders_fix.sql, 06_admin_audit_fixes.sql, vb.) hiç almamıştı.
-- Bu dosya idempotent — zaten doğruysa hiçbir şeyi bozmaz.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

alter table page_images enable row level security;

drop policy if exists "Public read page_images" on page_images;
create policy "Public read page_images" on page_images for select using (true);

drop policy if exists "Public write page_images" on page_images;
create policy "Public write page_images" on page_images for all using (true) with check (true);
