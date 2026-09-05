-- KRİTİK DÜZELTME: photo_print_prices tablosundaki fiyatlar yanlış.
--
-- Kök neden: 18_photo_print_prices_pivot.sql, FotografBaski.jsx'teki eski
-- (ve o zaman zaten uydurma/onaysız olduğu belirtilen) SIZE_DEFAULT_PRICES
-- sabitindeki rakamları (A5=250, A4=350, A3=600, A2=1000) veritabanına
-- "on conflict do update" ile yazmış — yani bu sahte rakamlar gerçek
-- fiyatların ÜZERİNE yazılmış. Aynı migration ayrıca
-- "delete from photo_print_prices where size not in ('A5','A4','A3','A2')"
-- satırıyla A6 fiyatlarını tamamen silmiş. Sonuç: A6 hiç fiyatlanamıyor
-- ("Fiyat için iletişime geçin" gösteriliyor, sipariş veremiyor), A5-A2
-- yanlış/onaysız fiyatlarla satılıyor.
--
-- Ayrıca 05_photo_print.sql'in seed'i finish alanını 'Mat'/'Parlak' olarak
-- girmişti ama uygulama (FotografBaski.jsx PHOTO_FINISHES) 'Glossy' /
-- 'Satin' / 'Matte' / 'Metallic' arıyor — o yüzden 05'in doğru rakamları
-- zaten hiç okunmuyordu, sadece kullanılmayan artık satır olarak duruyordu.
--
-- Bu migration: gerçek fiyatları (yalnızca boya göre değişir, yüzey/kağıt
-- türü fiyatı etkilemez — 4 yüzey de aynı fiyat) doğru finish adlarıyla
-- yazıyor, ve artık okunmayan eski 'Mat'/'Parlak' satırlarını temizliyor.

insert into photo_print_prices (size, finish, price)
values
  ('A6', 'Glossy', 180), ('A6', 'Satin', 180), ('A6', 'Matte', 180), ('A6', 'Metallic', 180),
  ('A5', 'Glossy', 280), ('A5', 'Satin', 280), ('A5', 'Matte', 280), ('A5', 'Metallic', 280),
  ('A4', 'Glossy', 450), ('A4', 'Satin', 450), ('A4', 'Matte', 450), ('A4', 'Metallic', 450),
  ('A3', 'Glossy', 650), ('A3', 'Satin', 650), ('A3', 'Matte', 650), ('A3', 'Metallic', 650),
  ('A2', 'Glossy', 950), ('A2', 'Satin', 950), ('A2', 'Matte', 950), ('A2', 'Metallic', 950)
on conflict (size, finish) do update set price = excluded.price;

-- Eski Türkçe finish adlarıyla girilmiş, uygulama tarafından hiç
-- sorgulanmayan artık satırları temizle.
delete from photo_print_prices where finish in ('Mat', 'Parlak');
