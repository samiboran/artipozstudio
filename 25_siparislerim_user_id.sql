-- "Kayıt olma avantajı": giriş yapan bir müşteri, geçmişte verdiği
-- siparişleri/talepleri "Siparişlerim" sayfasında görebilsin. Bunun için
-- her sipariş/talep tablosuna, siparişi veren kullanıcıyı işaretleyen
-- nullable bir user_id ekleniyor (misafir siparişlerinde null kalır —
-- misafir checkout kaldırılmıyor) ve o kullanıcının SADECE KENDİ
-- satırlarını görebileceği bir RLS policy'si ekleniyor.
--
-- user_id artık edge function'lar tarafından, client'ın gönderdiği bir
-- alandan DEĞİL, isteğin Authorization header'ındaki gerçek oturum
-- token'ından (supabase.auth.getUser(token)) sunucu tarafında
-- doğrulanarak yazılıyor — bir müşteri başka birinin user_id'sini
-- göndererek onun siparişlerini kendi hesabına bağlayamaz.

alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table photo_print_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table frame_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table film_requests add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Bu 4 tablodaki MEVCUT SELECT policy'lerini (isimden bağımsız, önceki
-- "Admin select ..." olanlar dahil) temizleyip tek, doğru policy'yle
-- değiştiriyoruz — admin hâlâ hepsini görür, sahibi olan müşteri de
-- kendi satırlarını görür.
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('orders','photo_print_orders','frame_orders','film_requests')
      and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['orders','photo_print_orders','frame_orders','film_requests']
  loop
    execute format(
      'create policy "Own select %1$s" on public.%1$I for select using (is_admin() or auth.uid() = user_id)',
      t
    );
  end loop;
end $$;

-- photo_print_order_items'ın kendi user_id'si yok (siparişin bir satırı) —
-- sahiplik her zaman photo_print_orders.user_id üzerinden kontrol edilir.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'photo_print_order_items' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.photo_print_order_items', p.policyname);
  end loop;
end $$;

create policy "Own select photo_print_order_items" on public.photo_print_order_items
  for select using (
    is_admin() or exists (
      select 1 from photo_print_orders o
      where o.id = photo_print_order_items.order_id and o.user_id = auth.uid()
    )
  );

-- Doğrulama — her tablo için tam olarak 1 SELECT policy'si dönmeli.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('orders','photo_print_orders','photo_print_order_items','frame_orders','film_requests')
  and cmd = 'SELECT';
