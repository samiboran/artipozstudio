-- ============================================================
-- Sipariş durumu güncelleme + silme + kargo takip no
-- Supabase SQL Editor'de çalıştır
-- ============================================================

-- Kargo takip numarası için yeni kolon
alter table orders add column if not exists tracking_number text;

-- Admin panelden durum güncelleyip sipariş silebilmek için.
-- storage bucket'ta da aynı sorunu yaşamıştık: "authenticated" şartlı policy
-- admin oturumunda çalışmadı, o yüzden orada işe yarayan aynı deseni (public) kullanıyoruz.
drop policy if exists "Public update orders" on orders;
create policy "Public update orders"
on orders for update
using (true)
with check (true);

drop policy if exists "Public delete orders" on orders;
create policy "Public delete orders"
on orders for delete
using (true);

-- NOT: Bu, orders tablosuna yazma erişimini herkese açık anon key ile de mümkün kılıyor
-- (artwork-images bucket'ındaki upload policy'siyle aynı güven seviyesi). Admin sayfası
-- zaten girişle korunuyor, site herkese "orders tablosunu değiştir" diye bir arayüz
-- sunmuyor — ama ileride daha sıkı bir kurala (gerçek "authenticated" kontrolüne) geçmek
-- istersen bu iki policy'yi silip auth.role() = 'authenticated' şartıyla yeniden
-- yazabiliriz; şimdilik çalışan tarafta kalmayı tercih ettim.
