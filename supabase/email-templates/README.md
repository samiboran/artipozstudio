# Supabase Auth E-posta Şablonları

Bu dosyalar Supabase Dashboard → **Authentication → Emails** altındaki
şablon düzenleyicisine elle yapıştırılır — Supabase bunları otomatik
okumaz, repoda sadece kayıt/versiyon amaçlı tutuluyor.

Her şablonun Supabase'de karşılığı olan satır + kullanılacak "Subject
heading" metni:

| Dosya | Supabase satırı | Subject heading |
|---|---|---|
| `confirm-signup.html` | Confirm signup | Artı Poz — Hesabını Onayla |
| `reset-password.html` | Reset password | Artı Poz — Şifreni Sıfırla |
| `magic-link.html` | Magic Link | Artı Poz — Giriş Bağlantın |
| `change-email.html` | Change Email Address | Artı Poz — E-posta Değişikliğini Onayla |

Uygulama adımı: satıra tıkla → "Message body" alanına ilgili `.html`
dosyasının TAMAMINI yapıştır → "Subject heading" alanına yukarıdaki
metni yaz → kaydet.

## Tasarım
Tek sütun, tablo tabanlı (Outlook uyumluluğu için), inline CSS, site ile
aynı görsel dil (düz siyah buton, büyük harf + harf aralıklı etiket,
`artı poz` wordmark). Her şablonda: kimden geldiği, ne için gönderildiği
tek cümleyle, buton çalışmazsa düz metin bağlantı, "bu isteği siz
yapmadıysanız yok sayın" satırı ve alt bilgide site adresi var — gövde
sadece bir bağlantıdan ibaret değil (spam skorunu düşürmek için).

## Kullanılan Supabase değişkeni
Hepsinde tek değişken: `{{ .ConfirmationURL }}` — Supabase'in varsayılan
şablonlarındaki ile birebir aynı, İstemci tarafında ekstra bir işlem
gerekmiyor.

## İlgili kod
`/sifre-sifirla` (reset-password linkinin gittiği yer) için
`src/pages/ResetPassword.jsx` + `src/App.jsx`'teki route zaten mevcut —
bu şablonlar sadece e-postanın GÖRÜNÜMÜNÜ değiştirir, linkin hedefi
Supabase'in kendi `redirectTo` ayarına (bkz. `Login.jsx`'teki
`resetPasswordForEmail` çağrısı) bağlı, burada değişmiyor.
