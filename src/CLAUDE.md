# Artı Poz Studio — Claude için Proje Notu

## Proje Nedir?
Türkiye'de fine art baskı hizmeti veren e-ticaret sitesi (eski adı "Fossil
Garden" — isim ve marka artık "Artı Poz"). Hahnemühle fine art baskı, fotoğraf
baskı, çerçeve ve film yıkama/tarama hizmetleri satılıyor.

## Canlı Site
https://artipozstudio.com (GitHub Pages, `gh-pages` branch'inden yayınlanıyor)

## GitHub
https://github.com/samiboran/artipozstudio — geliştirme branch'i
`claude/incomplete-conversation-qs4gw2`, PR ile `main`'e alınıyor.

## Stack
- React + Vite, react-router-dom
- @supabase/supabase-js (Postgres + Storage + Edge Functions + Auth)
- Resend (e-posta)
- gh-pages (deploy)

## ⚠️ Build/Deploy — HER SEFERİNDE ENV VAR GEREKİR
Bu repoda `.env` dosyası YOK. `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY`
her `build`/`deploy` komutunda inline geçilmeli, aksi halde `vite.config.js`
build'i hata ile durdurur (bilinçli bir güvenlik önlemi — bkz. aşağıdaki
"Kritik Dersler"). Standart iş akışı:

```bash
VITE_SUPABASE_URL=https://qrbkzjosorimiwdbwyyl.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_publishable_l1UHa6JT_zZGr5KaU6MXFQ_I1GJxajT \
npm run build
# grep ile dist/ içinde yeni kod var mı doğrula
git add -f dist/index.html   # dist .gitignore'da, index.html PR'a özel eklenir
git commit -m "..." && git push
# PR aç, merge et, sonra:
git fetch origin main && git merge origin/main   # genelde dist/index.html çakışır, rebuild ile çöz
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run deploy
# gh-pages'i doğrula:
git fetch origin gh-pages && git show origin/gh-pages:<path> | grep ...
```

## Klasör Yapısı (güncel)
```
src/
  components/    Navbar, Footer, CartSidebar, CheckoutModal, SiparisIletisimForm, ...
  pages/         Gallery, ProductDetail, Admin, Login, Signup, ResetPassword,
                 Siparislerim, FineArtBaski, Cerceve, FotografBaski, FilmYikama, ...
  lib/
    supabase.js    → Supabase client (env var yoksa build zaten patlar)
    authHeader.js  → getAuthHeader(): giriş yapan kullanıcının access_token'ı,
                     yoksa anon key (bkz. "user_id ile sipariş eşleme" altta)
    session.js     → misafir session_id (localStorage)
    heroOverlay.js → HERO_OVERLAY_GRADIENT — TÜM hero görsellerinin ortak
                     karartma gradyanı, tek yerden yönetilir
supabase/functions/  Edge functions (create-order, create-photo-print-order,
                     create-frame-order, create-film-request, send-contact-email, ...)
*.sql (repo kökünde)  Migration dosyaları, numaralı (01_..., 25_...) — bkz.
                     "Migration dosyası ≠ canlıda çalıştı" aşağıda
```

## Deploy
```bash
npm run deploy
```

## Mimari Kararlar / Standart Desenler
- **Fiyatlar sunucuda doğrulanır.** Hiçbir edge function client'tan gelen
  `price`'a güvenmez; her zaman ilgili fiyat tablosundan (`artworks.sizes`,
  `photo_print_prices`, `frame_option_prices`) yeniden hesaplanır. Fiyat
  tabloda yoksa sipariş REDDEDİLİR — asla uydurma bir varsayılan fiyata
  düşülmez (`create-photo-print-order`'da böyle bir bug vardı, düzeltildi).
- **RLS + admin rolü.** `profiles` tablosu (`id`, `role default 'customer'`)
  + `is_admin()` SQL fonksiyonu (`security definer stable`) — tüm admin
  gate'leri (RLS policy'leri + `Admin.jsx`'in client-side guard'ı) bunu
  kullanır. `Admin.jsx` **fail-closed**: `profiles` sorgusu hata verirse ya
  da `role !== 'admin'` ise `/`'e yönlendirir.
- **Kullanıcıyı JWT'den doğrula, client'tan gelen alana güvenme.** Sipariş
  tablolarına yazılan `user_id`, client'ın gönderdiği bir alan DEĞİL —
  edge function, isteğin `Authorization` header'ındaki gerçek oturum
  token'ını `supabase.auth.getUser(jwt)` ile sunucu tarafında doğrulayıp
  kendisi yazıyor. Frontend, `getAuthHeader()` (giriş yapılmışsa
  `access_token`, yoksa anon key) gönderiyor — statik anon key'i asla
  elle yazma. Bu desen 4 edge function'da da var: `create-order`,
  `create-photo-print-order`, `create-frame-order`, `create-film-request`.
- **RLS policy değiştirirken isim TAHMİN ETME.** `drop policy if exists
  "<tahmin edilen isim>"` canlıdaki gerçek isimle eşleşmezse SESSİZCE
  NO-OP olur ve eski (genelde `using (true)`) policy hâlâ aktif kalır —
  bu bir kez değil, iki kez böyle bir hataya yol açtı. Doğru desen:
  `pg_policies`'ten dinamik olarak bul + sil + yeniden oluştur + sonunda
  doğrulama sorgusu ile bitir. Örnek: `25_siparislerim_user_id.sql`.
- **Escaping.** E-posta HTML'ine gömülen her kullanıcı verisi `esc()`
  helper'ından geçmeli (XSS/injection önlemi) — her edge function'da var.
- **Dual-recipient e-posta.** Sipariş/talep e-postaları hem müşteriye hem
  admin'e gider — tek taraflı bir e-posta bulursan muhtemelen bir bug'dır
  (bkz. `send-contact-email` geçmişi). Admin bildirimi `NOTIFY_EMAILS`
  dizisine gider: `['info@artipozstudio.com', 's.borankocoglu@gmail.com']`
  (Sami'nin isteğiyle iki adrese birden — biri diğerinin yerine değil).
  `sendMail`'in `to` parametresi bu yüzden her yerde `string | string[]`.

## Son Eklenen Özellikler (2026-09, bu segment)
- **Şifremi Unuttum akışı** — `Login.jsx` (3 mod: login/forgot/forgot-sent) →
  `supabase.auth.resetPasswordForEmail(email, { redirectTo: .../sifre-sifirla })`
  → `ResetPassword.jsx` (`PASSWORD_RECOVERY` event'ini bekler, sonra
  `updateUser({ password })`). Route: `/sifre-sifirla`.
- **Siparişlerim sayfası** — `Siparislerim.jsx` (route: `/siparislerim`),
  giriş yapan kullanıcının `orders`/`photo_print_orders`(+items)/
  `frame_orders`/`film_requests` tablolarındaki KENDİ satırlarını listeler
  (RLS zaten filtreliyor, ekstra `.eq('user_id', ...)` sadece okunabilirlik
  için). Navbar'da "Merhaba, X" yanında "Siparişlerim" linki (giriş
  yapılmışsa, hem masaüstü hem mobil menü).
  - Status etiketleri `Admin.jsx`'teki gerçek anahtarlarla BİREBİR aynı
    olmalı: `yeni/hazirlaniyor/kargoda/teslim/iptal` (film talepleri için
    `yeni/iletisimde/tamamlandi/iptal`) — uydurma İngilizce anahtar
    kullanırsan müşteri hep ham status string'i görür.
- Bu ikisinin altyapısı: `25_siparislerim_user_id.sql` (4 tabloya `user_id`
  kolonu + `pg_policies` tabanlı doğru RLS policy'leri — **kullanıcı
  Supabase'de bunu henüz çalıştırmadıysa "Siparişlerim" sayfası boş/hatalı
  dönebilir, önce bu migration'ın canlıda çalıştığını doğrula**).

## Kritik Dersler (tekrar yapma)
1. **Env var olmadan `npm run deploy` = canlı site çöker.** `createClient(undefined, undefined)`
   "supabaseUrl is required" fırlatır, tüm site beyaz ekran olur. Artık
   `vite.config.js` production build'de bu iki env var yoksa hard-fail
   ediyor — build başarısızsa deploy ETME, önce env var'ları düzelt.
2. **RLS policy ismini tahmin etme.** Yukarıda anlatıldı — her zaman
   `pg_policies` sorgusuyla gerçek ismi bul, sil, yeniden oluştur, doğrula.
3. **Migration dosyası repo'da var ≠ canlıda çalıştı.** `film_requests`
   tablosu, dosyası (`19_film_requests.sql`) repoda olmasına rağmen canlıda
   HİÇ oluşturulmamıştı — form aylarca sessizce hata veriyordu. Bir
   migration'ın etkisini varsaymadan önce kullanıcıdan canlı şemayı
   (`information_schema.columns`, `pg_policies`) doğrulamasını iste; yeni
   migration'ları `if not exists` ile idempotent yaz.
4. **Canlı DB, git'te izlenenden farklı olabilir.** Kullanıcının hesabı
   `profiles.role = 'admin'` olarak zaten ayarlıydı, hiçbir git-tracked
   SQL dosyasında bunun kanıtı yoktu — DB'de manuel/izlenmeyen değişiklikler
   olmuş olabilir, "git'te yok" = "canlıda yok" değildir.
5. **Supabase-js hataları throw etmez.** `{data, error}` normal şekilde
   resolve olur — her çağrıda `.error`'ı açıkça kontrol et, sadece
   try/catch'e güvenme.
6. **`supabase/functions/` altına yapılan HER değişiklik için ayrı, ELLE
   bir deploy adımı gerekir — `git push`/PR merge bunu YAPMAZ.** Bu repoda
   edge function'ları otomatik canlıya alan bir CI yok. `create-film-request`
   GitHub'da aylarca güncellenmiş görünüp Supabase'de eski hâliyle
   çalışmaya devam etti — kimse fark etmedi, çünkü kod incelemesi "doğru
   görünüyor" diye canlıda da öyle olduğu anlamına gelmiyor. Bir edge
   function dosyasını her değiştirdiğinde: (a) kullanıcıya AÇIKÇA ve
   ATLANAMAZ şekilde "bunu Supabase'de deploy etmen lazım" de (CLI:
   `supabase functions deploy <isim>`, veya Dashboard → Edge Functions →
   ilgili fonksiyon → kodu güncelle → Deploy), (b) PR/commit mesajına da
   bunu yaz. Bu sandbox'ta `npx supabase` CLI'ı çalışıyor (network'ten
   çekilebiliyor) ama gerçek bir deploy için Supabase erişim token'ı ve
   proje ref'i gerekiyor — kullanıcı bunları vermeden kendi başına deploy
   YAPILAMAZ, sadece hazırlanabilir. `scripts/deploy-edge-functions.sh`
   (veya `npm run deploy:functions`) TÜM fonksiyonları tek seferde deploy
   eder — kullanıcının kendi makinesinde (Supabase CLI kurulu + login +
   link yapılmış) çalıştırması gerekir, tek tek hangisini unuttuğunu
   hatırlamaya gerek bırakmaz.

## Önemli Notlar
- `vite.config.js`'de `base: '/'` — GitHub Pages custom domain
  (`artipozstudio.com`) kullanıyor, alt path YOK.
- Kod, yorumlar, commit mesajları ve UI metni Türkçe — tutarlılığı koru.
