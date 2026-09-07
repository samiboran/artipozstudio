-- Fine Art Baskı sayfasındaki canlı `papers` tablosunda 5 kağıdın açıklaması
-- boştu (sadece teknik özellik yazıyordu) — AI arama motorları (ChatGPT,
-- Perplexity vb.) bu açıklamaları doğrudan alıntıladığı için eksik olmaları
-- görünürlüğü zayıflatıyordu. Sadece açıklaması BOŞ olan satırları doldurur,
-- Admin panelinden elle girilmiş bir açıklamanın üzerine yazmaz.
--
-- Not: aynı 5 kağıt için aynı metinler src/pages/FineArtBaski.jsx'teki
-- FALLBACK_PAPERS dizisine de eklendi (Supabase'e hiç ulaşılamadığı
-- durumlarda kullanılan yedek veri) — ikisi birbiriyle tutarlı olsun diye.

update papers set description =
  'Hahnemühle''nin klasik pamuklu kağıdı; yumuşak dokusu ve nötr beyazlığıyla hem renkli hem siyah-beyaz baskılarda doğal, sıcak bir görünüm sunar. Sanat baskısında en çok tercih edilen kağıtlardan biridir.'
where name = 'Photo Rag' and (description is null or trim(description) = '');

update papers set description =
  'Belirgin kabartılı dokusuyla tuval hissi veren, gerçek su baskı (mould-made) yöntemiyle üretilmiş pamuklu bir kağıt. Suluboya ve resim eserlerinin baskısında dokuyu ön plana çıkarır.'
where name = 'William Turner' and (description is null or trim(description) = '');

update papers set description =
  'Hafif kabartılı yüzeyi ve dengeli pamuk-selüloz karışımıyla hem detay netliğini hem de doğal bir kağıt dokusunu bir arada sunar; illüstrasyon ve çizim çalışmalarının baskısı için uygundur.'
where name = 'Albrecht Dürer' and (description is null or trim(description) = '');

update papers set description =
  'Belirgin, kaba dokulu yüzeyiyle güçlü bir sanatsal karakter taşır; parlak beyazlığı canlı renklerin öne çıkmasını sağlar, özellikle güçlü kontrastlı eserlerde etkileyicidir.'
where name = 'Torchon' and (description is null or trim(description) = '');

update papers set description =
  'Hafif dokulu, gravür kağıdını andıran yüzeyiyle klasik ve zamansız bir görünüm sunar; hem fotoğraf hem sanat eseri baskılarında sık tercih edilir.'
where name = 'German Etching' and (description is null or trim(description) = '');
