-- Fine Art Baskı sayfasındaki 11 kağıdın açıklamalarını tek, tutarlı ve
-- kısa bir üsluba getirir. Önceki açıklamalar karışıktı: bazıları uzun
-- paragraf (27_papers_missing_descriptions.sql ile eklenenler), bazıları
-- sadece teknik veri, bazıları hiç yoktu. Bu script HEPSİNİN üzerine
-- (boş olsun olmasın) yazar — 27 numaralı dosyanın aksine burada "sadece
-- boşsa doldur" koruması YOK, bilinçli olarak tüm 11 kağıt tek üsluba
-- getiriliyor.

update papers set description = 'Doğal beyaz tonlu, çevre dostu mat kâğıt.'
where name = 'Bamboo';

update papers set description = 'Parlak yüzey, derin siyahlar ve zengin tonlar.'
where name = 'Bamboo Gloss Baryta';

update papers set description = 'İnce, yarı şeffaf ve zarif dokulu kâğıt.'
where name = 'Rice Paper';

update papers set description = 'Pürüzsüz yüzey, yüksek detay ve yumuşak tonlar.'
where name = 'Photo Rag Ultra Smooth';

update papers set description = 'Doğal dokulu, klasik pamuklu fine art kâğıdı.'
where name = 'Photo Rag';

update papers set description = 'Belirgin dokulu, tuval hissi veren sanat kâğıdı.'
where name = 'William Turner';

update papers set description = 'Hafif dokulu, detayları güçlü pamuklu kâğıt.'
where name = 'Albrecht Dürer';

update papers set description = 'Kaba dokulu, güçlü karaktere sahip sanat kâğıdı.'
where name = 'Torchon';

update papers set description = 'Gravür dokulu, klasik ve zamansız kâğıt.'
where name = 'German Etching';

update papers set description = 'İnci parlaklığında, canlı ve zarif fotoğraf kâğıdı.'
where name = 'Pearl';

update papers set description = 'Geleneksel Japon dokusuyla zarif ve özgün baskılar sunar.'
where name = 'Awagami';
