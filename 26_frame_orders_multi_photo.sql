-- Çerçeve sipariş formunda artık tek yerine en fazla 5 fotoğraf
-- yüklenebiliyor. Eski tek-fotoğraf kolonu (image_url) geriye dönük
-- uyumluluk için duruyor (ilk yüklenen fotoğrafı tutar — eski e-posta/
-- Admin kodu bunu hâlâ okuyabilir), yeni image_urls dizisi TÜM
-- yüklenen fotoğrafları tutar.
alter table frame_orders add column if not exists image_urls text[];
