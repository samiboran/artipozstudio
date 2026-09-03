-- Çerçeve sipariş formu "Siparis kaydedilemedi: Could not find the 'address'
-- column of 'frame_orders' in the schema cache" hatası veriyordu. 06_admin_audit_fixes.sql
-- dosyasındaki `create table if not exists frame_orders (...)` içinde address
-- sütunu tanımlıydı, ama tablo muhtemelen daha önce (address sütunu olmadan)
-- zaten oluşturulmuştu — bu yüzden "if not exists" hiçbir şey yapmadı ve
-- address sütunu canlı tabloya hiç eklenmedi. Idempotent (tekrar çalıştırılsa
-- da güvenli) bir ekleme ile düzeltiyoruz.
alter table frame_orders add column if not exists address text not null default '';
alter table frame_orders alter column address drop default;
