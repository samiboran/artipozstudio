-- ============================================================
-- Ana Sayfa "Fine Art Seçkisi" vitrini artık en çok görüntülenen
-- eserleri otomatik gösteriyor — Admin'de elle seçim yapmaya gerek yok.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

alter table artworks add column if not exists view_count integer not null default 0;

-- Atomik artırım: client'ta "oku, +1 yap, yaz" yapılırsa aynı anda iki
-- ziyaretçi aynı eseri görüntülediğinde bir görüntüleme kaybolabilir.
-- security definer, artworks tablosundaki RLS durumundan bağımsız olarak
-- sadece bu dar/güvenli işlemi (bir satırın view_count'unu +1 yapmak)
-- her ziyaretçinin tetikleyebilmesini sağlıyor.
create or replace function increment_artwork_view(artwork_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update artworks set view_count = view_count + 1 where id = artwork_id;
$$;

grant execute on function increment_artwork_view(uuid) to anon, authenticated;
