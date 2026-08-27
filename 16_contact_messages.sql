-- ============================================================
-- Ana Sayfa "Sipariş & İletişim" formundan gelen mesajları kaydeder.
-- Form daha önce sadece arayüzde "gönderildi" gösteriyordu, hiçbir
-- yere kaydedilmiyor/mail atılmıyordu — send-contact-email fonksiyonu
-- bu tabloya kayıt atıp info@artipozstudio.com'a bildirim maili gönderiyor.
-- Supabase SQL Editor'de çalıştır.
-- ============================================================

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  isim text not null,
  posta_kodu text,
  adres text,
  email text not null,
  telefon text,
  kagit text,
  boyut text,
  mesaj text not null,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on contact_messages (created_at);

alter table contact_messages enable row level security;

-- Site genelindeki desenle aynı: gerçek koruma Admin.jsx'in kendi login
-- kontrolünde, bu yüzden select de public bırakıldı (bkz. page_views).
drop policy if exists "Public insert contact_messages" on contact_messages;
create policy "Public insert contact_messages" on contact_messages for insert with check (true);
drop policy if exists "Public read contact_messages" on contact_messages;
create policy "Public read contact_messages" on contact_messages for select using (true);
