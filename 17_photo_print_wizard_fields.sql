-- ============================================================
-- Fotoğraf Baskı "Baskını Oluştur" sihirbazı için 2 yeni alan.
-- (photo_print_orders.note ve photo_print_order_items.note zaten
-- vardı — sihirbazdaki "Mesaj" ve "Özel Ölçü" notu bunları kullanıyor,
-- şema değişikliği gerekmiyor.)
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

alter table photo_print_orders add column if not exists posta_kodu text;
alter table photo_print_order_items add column if not exists white_border boolean not null default false;
