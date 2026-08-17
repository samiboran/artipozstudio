-- ============================================================
-- 1) Kim kayıt oldu — auth.users'ı admin'den görebilmek için
--    (anon key ile auth.users'a doğrudan erişilemez, o yüzden
--    yeni kullanıcı olunca otomatik kopyalanan bir profiles tablosu kuruyoruz)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
drop policy if exists "Public read profiles" on profiles;
create policy "Public read profiles" on profiles for select using (true);

-- Yeni kayıt olan her kullanıcı otomatik profiles'a düşsün
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, new.created_at)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bu tetikleyici kurulmadan ÖNCE kayıt olmuş kullanıcılar için tek seferlik doldurma:
insert into profiles (id, email, created_at)
select id, email, created_at from auth.users
on conflict (id) do nothing;

-- ============================================================
-- 2) Sepete eklenip satın alınmayanlar
-- ============================================================
create table if not exists cart_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users(id),
  user_email text,
  artwork_title text,
  size text,
  price numeric,
  qty int,
  created_at timestamptz not null default now()
);

alter table cart_events enable row level security;
drop policy if exists "Public insert cart_events" on cart_events;
create policy "Public insert cart_events" on cart_events for insert with check (true);
drop policy if exists "Public read cart_events" on cart_events;
create policy "Public read cart_events" on cart_events for select using (true);

-- Sipariş tamamlanınca aynı session_id orders'a da yazılacak — böylece admin'de
-- "bu sepet siparişe dönüştü mü?" karşılaştırması yapılabilir.
alter table orders add column if not exists session_id text;
