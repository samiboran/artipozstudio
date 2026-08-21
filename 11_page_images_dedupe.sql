-- ============================================================
-- Ana Sayfa'daki Hero görseli "bazen bir fotoğraf, bazen başka bir
-- fotoğraf" gösteriyordu — Admin.jsx'teki eski upload akışı (delete
-- sonra insert, iki ayrı istek) arada bir sebepten (ağ, önceden
-- sessizce yutulan hatalar) yarım kalırsa aynı page+section için 2
-- satır kalabiliyordu. Site tarafındaki sorgular tek satır bekliyor
-- (limit(1) veya rows[0]) ve Postgres eşit sort_order'da hangi
-- satırın döneceğini garanti etmiyor — bu da farklı sayfa
-- yüklemelerinde farklı görsel gösterilmesine yol açıyordu.
--
-- Kod tarafında (uploadForSlot artık delete+insert yerine var olan
-- satırı UPDATE ediyor) bu bir daha oluşmayacak şekilde düzeltildi.
-- Bu sorgu, hâlihazırda oluşmuş olabilecek kopyaları temizliyor —
-- her (page, section) çiftinden yalnızca birini (en yüksek ctid'i,
-- pratikte genelde en son eklenen) bırakıyor.
--
-- "ornekler" section'ları hariç tutuldu — onlar bilerek çoklu
-- görsel barındıran galeriler (Çerçeve ve Fine Art Baskı örnekleri).
--
-- Çalıştırmadan önce ne silineceğini görmek istersen SELECT ile de
-- kontrol edebilirsin (aşağıda yorumlu).
-- ============================================================

-- Önce ne silineceğine bakmak istersen:
-- select page, section, count(*) from page_images
-- where section <> 'ornekler'
-- group by page, section having count(*) > 1;

delete from page_images a
using page_images b
where a.page = b.page
  and a.section = b.section
  and a.section <> 'ornekler'
  and a.ctid < b.ctid;
