-- ============================================================
-- Kağıt Rehberi sayfası için papers tablosuna iki yeni kolon +
-- Pearl/Awagami satırları + mevcut kağıtların kategorilenmesi.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

alter table papers add column if not exists guide_category text;
alter table papers add column if not exists featured_in_guide boolean not null default false;

-- Bölüm 3 (Giclee Kağıtlar): mevcut kağıtlardan üçünü giclee olarak işaretle
update papers set guide_category = 'giclee' where name in ('German Etching', 'Rice Paper', 'Bamboo');

-- Bölüm 3: Pearl ve Awagami tabloda yoktu, ekleniyor (Sami sonra Admin'den düzenleyebilir)
insert into papers (name, surface, texture, description, guide_category, sort_order)
select 'Pearl', 'Parlak', 'Sedefli',
  'İnci parlaklığında, hafif sedef dokulu yüzeyiyle fotoğraf baskılarına zarif bir parlaklık katar. Renkler canlı, detaylar keskin çıkar — özellikle portre ve doğa fotoğrafları için tercih edilir.',
  'giclee', (select coalesce(max(sort_order), 0) + 1 from papers)
where not exists (select 1 from papers where name = 'Pearl');

insert into papers (name, surface, texture, description, guide_category, sort_order)
select 'Awagami', 'Mat', 'Kabartılı, elde üretilmiş doku',
  'Japonya''nın geleneksel washi kağıt ustalığından gelen, elde üretilmiş dokulu bir kağıt. Organik, sanatsal bir doku ve karakter arayan fine art baskılar için özgün bir seçim sunar.',
  'giclee', (select coalesce(max(sort_order), 0) + 1 from papers)
where not exists (select 1 from papers where name = 'Awagami');

-- Bölüm 4 (En Popüler Baskı Kağıtlarımız): featured galeri
update papers set featured_in_guide = true
where name in ('German Etching', 'William Turner', 'Bamboo Gloss Baryta', 'Photo Rag', 'Torchon');
