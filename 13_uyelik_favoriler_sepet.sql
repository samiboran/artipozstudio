-- ============================================================
-- Favoriler artık cihaz bazlı localStorage yerine hesaba (auth.users)
-- bağlı — sadece giriş yapmış kullanıcılar favori/sepete ekleyebilir.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

create table if not exists user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references artworks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artwork_id)
);

alter table user_favorites enable row level security;

drop policy if exists "Users select own favorites" on user_favorites;
create policy "Users select own favorites" on user_favorites
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own favorites" on user_favorites;
create policy "Users insert own favorites" on user_favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own favorites" on user_favorites;
create policy "Users delete own favorites" on user_favorites
  for delete using (auth.uid() = user_id);
