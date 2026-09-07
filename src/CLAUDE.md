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

## ⚠️ Build artık Supabase'e AĞ ERİŞİMİ gerektiriyor (prerender)
`npm run build` → `vite build`'in hemen ardından npm otomatik olarak
`postbuild` (`node scripts/prerender.mjs`) çalıştırır. Bu script build
MAKİNESİNDEN Supabase'e gerçek bir bağlantı kurar (ürün slug'larını çekmek
için) VE headless bir Chromium (`/opt/pw-browsers/chromium`) açıp her
public route'u ziyaret edip GERÇEK render sonucunu `dist/<route>/index.html`
olarak yazar — böylece Google/ChatGPT/Perplexity gibi JS çalıştırmayan
botlar sitenin gerçek içeriğini (kağıt isimleri, fiyatlar, ürün detayları)
görebilir. Önceden build tamamen offline çalışabiliyordu (veri sadece
tarayıcıda runtime'da çekiliyordu) — **artık build makinesi Supabase'e
erişemiyorsa `npm run build`/`npm run deploy` BAŞARISIZ olur** (bilinçli:
sessizce eksik/boş bir prerender deploy edilmesin diye). Bu Claude Code
sandbox'ı Supabase'e ağ erişimine İZİN VERMİYOR (egress allowlist) — yani
bu repodaki prerender değişiklikleri BURADAN uçtan uca test edilemedi,
sadece mekanizması (statik sayfalarla) doğrulandı. Gerçek doğrulama
kullanıcının kendi makinesinde veya gerçek ağ erişimi olan bir CI'da
yapılmalı.

Her prerender edilen sayfa, canlı veri çekimi bitince kök elemanına
`data-prerender-ready="true"` yazar (bkz. ilgili sayfa bileşenleri) —
script bunu görmeden ASLA snapshot almaz, 15 saniyede görünmezse build'i
hata ile durdurur. Yeni bir SEO'ya konu sayfa eklerken bu işaretleyiciyi
eklemeyi unutma, yoksa o sayfa hiç prerender edilmez (script "ready
görünmedi" hatasıyla durur).

Prerender EDİLMEYEN route'lar (bilinçli): `/admin`, `/login`, `/kayit`,
`/sifre-sifirla`, `/siparislerim`, `/favoriler` — bunlar `scripts/prerender.mjs`
içindeki route listesine hiç eklenmiyor, GitHub Pages'te normal SPA
(404.html→client-side routing) olarak kalmaya devam ediyor.

Sayfa başı title/description/OG/canonical/JSON-LD `src/components/Seo.jsx`
(react-helmet-async) üzerinden yazılıyor — yeni bir sayfa eklerken oraya
bakıp aynı deseni kullan.

**Önemli davranış değişikliği**: Admin panelinden yapılan içerik
değişiklikleri (fiyat, kağıt açıklaması, sayfa metni/görseli, yeni ürün)
artık botların gördüğü statik HTML'e ANINDA yansımıyor — bir sonraki
`npm run deploy` çalıştırılana kadar prerender edilmiş HTML eski kalır.
Gerçek kullanıcılar için sorun yok (sayfa JS ile hydrate olunca React
Supabase'den güncel veriyi tekrar çekiyor, tarayıcıda hep canlı veri
görünür) — sadece "botların gördüğü ilk HTML" eski kalabilir. Sami'ye
göre bu kabul edilebilir bir davranış (fiyat değişince zaten deploy
gerektiği zaten biliniyordu) ama kapsamı sadece fiyatla sınırlı değil,
TÜM prerender edilen sayfa içeriğini kapsıyor — bunu netleştir.

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
Bu komut artık build sırasında Supabase'e gerçek ağ erişimi + headless
Chromium gerektiriyor (bkz. yukarıdaki "Build artık Supabase'e AĞ ERİŞİMİ
gerektiriyor" notu) — çalıştırdığın makinenin Supabase'e ve
`https://qrbkzjosorimiwdbwyyl.supabase.co`'ya erişebildiğinden emin ol.

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

- **SEO canlı denetim düzeltmeleri (bu segment)**: kullanıcının deploy
  sonrası canlı sayfa denetiminde bulduğu 3 hata düzeltildi:
  1. Yinelenen title/meta/OG etiketleri — kök nedenler ve çözüm için
     aşağıdaki "Kritik Dersler" madde 7-9'a bak (madde 9 en sonunda bulunan
     ve asıl kalıcı çözümü açıklayan madde).
  2. 4 sayfada (`Gallery.jsx`, `FineArtBaski.jsx`, `FotografBaski.jsx`,
     `Cerceve.jsx`) hiç `<h1>` yoktu — Gallery ve Cerceve'ye görsel olarak
     gizli (sr-only) bir `<h1>` eklendi (hero'ları saf görsel, başlık metni
     yok), FineArtBaski/FotografBaski'de zaten var olan en büyük `<h2>`
     `<h1>`'e yükseltildi (arama niyetini yansıtacak şekilde metni de
     güncellendi).
  3. `FineArtBaski.jsx`'in SEO açıklaması sabit "9 Hahnemühle kağıt"
     diyordu ama canlıda kağıt sayısı/markası değişebiliyor (Admin'den
     kağıt eklenip çıkarılabiliyor) — artık `papers.length`'e göre dinamik
     hesaplanıyor ve marka adı yerine "Hahnemühle ve seçili özel kağıtlar"
     gibi genel bir ifade kullanılıyor. Ayrıca `FALLBACK_PAPERS`'taki 5
     kağıdın (Photo Rag, William Turner, Albrecht Dürer, Torchon, German
     Etching) eksik açıklamaları dolduruldu; aynı 5 kağıt canlı `papers`
     tablosunda da açıklamasızsa `27_papers_missing_descriptions.sql`
     (sadece BOŞ olan açıklamaları doldurur, elle girilmiş bir şeyin
     üzerine yazmaz) çalıştırılmalı.

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
7. **`<Helmet>` (react-helmet-async), `index.html`'de zaten var olan
   STATİK bir `<title>`/`<meta>`/`og:*` etiketini SİLMEZ, sadece kendi
   yönettiği (önceden kendisinin eklediği) etiketleri diff'ler.** Statik
   bir etiket varsa Helmet'inki bunun YANINA eklenir → canlıda 2-3 tane
   `<title>` / `<meta name="description">` / `og:*` birden görülür (Google
   hangisini kullanacağını tahmin etmek zorunda kalır — genelde YANLIŞ
   olanı, çünkü statik/eski etiket DOM'da daha önce gelir). Kural: SEO
   etiketi ya `index.html`'de statik olarak dursun YA DA `<Seo>` (Helmet)
   ile yönetilsin — ASLA ikisi birden. Bu repoda `index.html`'de artık
   hiç statik title/description/OG yok; tek kaynak `App.jsx`'teki
   varsayılan `<Seo>` + her sayfanın kendi `<Seo>`'su. **DİKKAT: "tree'de
   daha geç render olan kazanır" varsayımı YANLIŞ çıktı — bkz. madde 9.**
8. **Kendi yazdığın statik dosya sunucusu bile aynı bug'ı ikinci kez
   üretebilir.** `scripts/prerender.mjs`'nin sunucusu, route'a özel bir
   `dist/<route>/index.html` yoksa "boş SPA kabuğu" olarak `dist/index.html`'i
   DİSKTEN okuyordu — ama `/` (listede ilk route) işlenince tam da bu dosya
   Ana Sayfa'nın render edilmiş çıktısıyla ÜZERİNE YAZILIYORDU. Sonuç:
   `/`'dan SONRAKİ her route, "boş kabuk" sandığı ama aslında Ana Sayfa'nın
   title/meta/OG/içeriğini taşıyan KİRLENMİŞ bir dosyayı temel alıyor,
   Helmet kendi etiketlerini bunun YANINA ekliyordu — yukarıdaki (7)
   maddesiyle birleşince canlıda 2-3 kopya etikete yol açtı. Düzeltme:
   kabuğu döngü başlamadan ÖNCE bir kere belleğe al, sunucudan hep o
   bellek kopyasını dön — dosyayı bir daha ASLA diskten okuma.
9. **`react-helmet-async`, App seviyesindeki varsayılan `<Seo>` ile bir
   sayfanın KENDİ `<Seo>`'su AYNI ANDA (aynı ilk render/commit içinde)
   mount olduğunda beklenen "sonuncusu kazanır" birleştirmesini
   YAPMADI** — canlı gh-pages çıktısında doğrulandı: FineArtBaski
   sayfasında hem Ana Sayfa'nın varsayılan başlığı/açıklaması/OG'si HEM
   DE sayfanın kendi Seo'su birlikte, ikisi de tam olarak yazılmış
   şekilde HTML'e girmişti (React 19 + react-helmet-async 3.0.0
   kombinasyonunda, iki `<Helmet>` aynı commit'te mount olunca bir
   sıralama/senkronizasyon sorunu gibi görünüyor — kütüphanenin iç
   mekanizmasına daha fazla girmeye gerek kalmadan kökten önlendi).
   **Kalıcı çözüm — madde 7'deki varsayımın yerini alır**: App.jsx artık
   `useLocation()` ile geçerli path'in kendi `<Seo>`'su olup olmadığını
   kontrol ediyor (`ROUTES_WITH_OWN_SEO` listesi + `/product/`, `/yasal/`
   prefix'leri + `/`) ve varsayılan `<Seo>`'yu SADECE kendi Seo'su
   OLMAYAN route'larda render ediyor — yani herhangi bir anda en fazla
   BİR `<Seo>` hiç mount olmuyor, kütüphanenin çoklu-instance birleştirme
   mekanizmasına güvenmeye hiç gerek kalmıyor. Yeni bir sayfaya `<Seo>`
   eklerken bu listeye de route'u eklemeyi UNUTMA — unutulursa o sayfada
   yine iki Seo birden mount olur ve bug geri gelir.

## Önemli Notlar
- `vite.config.js`'de `base: '/'` — GitHub Pages custom domain
  (`artipozstudio.com`) kullanıyor, alt path YOK.
- Kod, yorumlar, commit mesajları ve UI metni Türkçe — tutarlılığı koru.
