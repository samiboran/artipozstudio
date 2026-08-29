-- ============================================================
-- UYARI (sonradan eklendi): Bu dosyadaki A5=250/A4=350/A3=600/A2=1000
-- rakamları GERÇEK değildi — Code'un o an elindeki referanstan uydurduğu
-- placeholder değerlerdi. Gerçek fiyatlar bunlar değil. Bu migration'ı
-- daha önce çalıştırdıysan, Admin panelinden (Fotoğraf Baskı Fiyatları)
-- bu 16 hücrenin (4 ölçü × 4 kağıt yüzeyi) üzerine gerçek rakamları
-- elle yaz. Çalıştırmadıysan bu dosyayı hiç çalıştırma — sadece Admin
-- panelinden gerçek fiyatları gir, site artık o tabloyu birebir okuyor.
-- ============================================================
--
-- Fotoğraf Baskı fiyat pivotu: ölçü ekseni A5/A4/A3/A2'ye sabitlendi,
-- fiyat artık sadece ölçüye göre değişiyor (kağıt yüzeyinden bağımsız —
-- Meltem'in verdiği referans: A5 250, A4 350, A3 600, A2 1000).
-- Veritabanı yapısı hâlâ boy×yüzey olduğundan aynı fiyat 4 yüzeyin
-- (Glossy, Satin, Matte, Metallic) hepsine yazılıyor.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

insert into photo_print_prices (size, finish, price)
values
  ('A5', 'Glossy', 250), ('A5', 'Satin', 250), ('A5', 'Matte', 250), ('A5', 'Metallic', 250),
  ('A4', 'Glossy', 350), ('A4', 'Satin', 350), ('A4', 'Matte', 350), ('A4', 'Metallic', 350),
  ('A3', 'Glossy', 600), ('A3', 'Satin', 600), ('A3', 'Matte', 600), ('A3', 'Metallic', 600),
  ('A2', 'Glossy', 1000), ('A2', 'Satin', 1000), ('A2', 'Matte', 1000), ('A2', 'Metallic', 1000)
on conflict (size, finish) do update set price = excluded.price;

-- Artık kullanılmayan eski ölçü satırlarını (10×15, 13×18, 20×30 —
-- sihirbaz A5/A4/A3/A2'ye geçmeden önceki geçici eksen) temizle.
delete from photo_print_prices where size not in ('A5', 'A4', 'A3', 'A2');
