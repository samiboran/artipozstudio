-- ============================================================
-- KRİTİK GÜVENLİK DÜZELTMESİ — sipariş/mesaj tablolarının herkese açık
-- okuma/yazma/silme izni kapatılıyor, gerçek admin rolü tanımlanıyor.
--
-- BULGU: Bu denetimde, projenin tüm sipariş/mesaj tablolarında
-- (orders, photo_print_orders, photo_print_order_items, frame_orders,
-- contact_messages, film_requests) SELECT/UPDATE/DELETE RLS policy'lerinin
-- "using (true)" yani HERKESE AÇIK olduğu bulundu — bu görevi veren notta
-- "yakın zamanda is_admin()'e kilitlendi" denmişti ama bu repodaki hiçbir
-- migration dosyasında böyle bir kısıtlama yok; aksine 02_orders_fix.sql,
-- 05_photo_print.sql, 16_contact_messages.sql, 19_film_requests.sql'in
-- hepsinde AÇIKÇA "gerçek koruma Admin.jsx'in client-side login kontrolünde,
-- bu yüzden public bırakıldı" yorumu var. Sonuç: herkes, sadece herkese açık
-- anon key ile (siteyi hiç ziyaret etmeden, doğrudan Supabase REST API'ye
-- istek atarak) HER MÜŞTERİNİN adını, adresini, telefonunu, e-postasını
-- okuyabiliyor; her siparişi/mesajı değiştirebiliyor veya silebiliyordu.
-- Ayrıca Admin.jsx'teki tek kontrol "oturum var mı" idi — kayıt olan HERHANGİ
-- bir müşteri, giriş yapıp /admin adresine giderek tam Admin paneline
-- erişebiliyordu. Bu migration ikisini de kapatıyor.
--
-- Navbar.jsx zaten "profiles" tablosundan "role" okumaya çalışıyordu (bu
-- tablo da hiç var olmadığı için sorgu her zaman sessizce başarısız oluyor,
-- greeting her zaman e-postaya düşüyordu) — bu migration o tabloyu da
-- gerçekten oluşturuyor.
-- ============================================================

-- ------------------------------------------------------------
-- 1) profiles tablosu — SADECE rol için (ad/soyad zaten auth.users'ın
--    kendi metadata'sında duruyor, ayrıca tutulmuyor).
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Users select own profile" on profiles;
create policy "Users select own profile" on profiles for select using (auth.uid() = id);

-- Kasıtlı olarak: customers için insert/update policy YOK — satır sadece
-- aşağıdaki trigger'la (security definer, RLS'i bypass eder) veya admin
-- tarafından elle oluşturulur. Bir kullanıcı kendi rolünü "admin" yapamaz.

-- Yeni kayıt olan her kullanıcı için otomatik olarak role='customer' satırı.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bu migration çalıştırılmadan ÖNCE kayıt olmuş kullanıcılar için de
-- (trigger geriye dönük çalışmaz) satır oluştur — hepsi 'customer' olarak
-- başlar, Sami kendi hesabını aşağıdaki ayrı adımda admin yapmalı.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2) is_admin() — tüm RLS policy'lerinin kullanacağı tek kontrol.
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 3) orders — UPDATE/DELETE artık is_admin() gerektiriyor. SELECT de
--    admin'e kapatıldı (müşteri PII'si — isim/adres/telefon/e-posta —
--    herkese açık okunmasın). INSERT public kalıyor (gerçek sipariş
--    akışı zaten service_role ile create-order edge function'ından
--    yazıyor; anon insert engellenmese de fiyat sunucuda yeniden
--    hesaplanıp doğrulanıyor, bkz. create-order/index.ts).
-- ------------------------------------------------------------
drop policy if exists "Public read orders" on orders;
drop policy if exists "orders_select" on orders;
create policy "Admin select orders" on orders for select using (is_admin());

drop policy if exists "Public update orders" on orders;
create policy "Admin update orders" on orders for update using (is_admin()) with check (is_admin());

drop policy if exists "Public delete orders" on orders;
create policy "Admin delete orders" on orders for delete using (is_admin());

-- ------------------------------------------------------------
-- 4) photo_print_orders + photo_print_order_items
-- ------------------------------------------------------------
drop policy if exists "Public read photo_print_orders" on photo_print_orders;
create policy "Admin select photo_print_orders" on photo_print_orders for select using (is_admin());

drop policy if exists "Public update photo_print_orders" on photo_print_orders;
create policy "Admin update photo_print_orders" on photo_print_orders for update using (is_admin()) with check (is_admin());

drop policy if exists "Public delete photo_print_orders" on photo_print_orders;
create policy "Admin delete photo_print_orders" on photo_print_orders for delete using (is_admin());

drop policy if exists "Public read photo_print_order_items" on photo_print_order_items;
create policy "Admin select photo_print_order_items" on photo_print_order_items for select using (is_admin());

drop policy if exists "Public delete photo_print_order_items" on photo_print_order_items;
create policy "Admin delete photo_print_order_items" on photo_print_order_items for delete using (is_admin());

-- ------------------------------------------------------------
-- 5) photo_print_prices — fiyat listesi vitrinde gösterildiği için
--    SELECT public kalmalı; ama fiyatı DEĞİŞTİRMEK (yazma) artık
--    yalnızca admin'e açık — önceden "for all using(true)" ile herkes
--    fiyatları değiştirebiliyordu.
-- ------------------------------------------------------------
drop policy if exists "Public write photo_print_prices" on photo_print_prices;
create policy "Admin write photo_print_prices" on photo_print_prices for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 6) frame_orders + frame_options/frame_option_prices (fiyat listesi —
--    aynı prensip: okuma vitrin için public, yazma admin'e kapalı;
--    sipariş kayıtlarının kendisi ise tamamen admin'e kapalı).
-- ------------------------------------------------------------
drop policy if exists "Public read frame_orders" on frame_orders;
create policy "Admin select frame_orders" on frame_orders for select using (is_admin());

drop policy if exists "Public update frame_orders" on frame_orders;
create policy "Admin update frame_orders" on frame_orders for update using (is_admin()) with check (is_admin());

drop policy if exists "Public delete frame_orders" on frame_orders;
create policy "Admin delete frame_orders" on frame_orders for delete using (is_admin());

-- ------------------------------------------------------------
-- 7) contact_messages
-- ------------------------------------------------------------
drop policy if exists "Public read contact_messages" on contact_messages;
create policy "Admin select contact_messages" on contact_messages for select using (is_admin());

-- ------------------------------------------------------------
-- 8) film_requests
-- ------------------------------------------------------------
drop policy if exists "Public read film_requests" on film_requests;
create policy "Admin select film_requests" on film_requests for select using (is_admin());

drop policy if exists "Public update film_requests" on film_requests;
create policy "Admin update film_requests" on film_requests for update using (is_admin()) with check (is_admin());

-- ============================================================
-- ZORUNLU MANUEL ADIM — bu migration'ı çalıştırdıktan HEMEN sonra kendi
-- hesabını admin yap, yoksa Admin panelinden (RLS artık admin şartı
-- aradığı için) hiçbir sipariş/mesaj listesi görünmez:
--
--   update profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'BURAYA_KENDI_GIRIS_EMAILINI_YAZ');
--
-- (Bu oturumda hangi e-posta ile giriş yaptığından emin değilim — az
-- yukarıdaki placeholder'ı kendi gerçek giriş e-postanla değiştir.)
-- ============================================================
