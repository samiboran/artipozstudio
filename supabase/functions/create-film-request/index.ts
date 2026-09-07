import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Edge Functions bu üç env var'ı otomatik sağlar, ekstra kurulum gerekmez.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Film Yıkama & Tarama talep bildirimleri hep buraya gider — site
// genelindeki desenle aynı (bkz. send-contact-email, create-photo-print-order).
// Sami'nin isteğiyle hem site hesabına hem kişisel adresine gidiyor.
const NOTIFY_EMAILS = ['info@artipozstudio.com', 's.borankocoglu@gmail.com']

// TEK yer: siteni buradan yönet. Wildcard (*) KULLANMA.
const ALLOWED_ORIGIN = 'https://artipozstudio.com'

const HIZMET_OPTIONS = ['Yıkama + Tarama', 'Yalnızca Yıkama', 'Yalnızca Tarama']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' }

// Mail HTML'ine gömülen her kullanıcı verisi bundan geçmeli.
function esc(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), { status: 400, headers: JSON_HEADERS })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const { isim, telefon, email, hizmet, filmAdedi, filmTuru, notunuz, session_id } = body

    // --- Girdi doğrulama ---
    if (!isim?.trim()) return badRequest('Ad soyad gerekli.')
    // Form arayüzünde de aynı kural var: telefon ya da e-posta'dan biri
    // yeterli, ikisi birden zorunlu değil.
    if (!telefon?.trim() && !email?.trim()) return badRequest('Telefon veya e-posta adresinizden birini giriniz.')
    if (email?.trim() && !email.includes('@')) return badRequest('Geçerli bir e-posta adresi giriniz.')
    if (!hizmet || !HIZMET_OPTIONS.includes(hizmet)) return badRequest('Geçerli bir hizmet seçiniz.')

    // Adet'i makul bir aralığa sıkıştır (1-100) — client'tan gelen her sayıya güvenme.
    const filmAdediNum = Math.max(1, Math.min(100, Math.floor(Number(filmAdedi)) || 1))

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Kullanıcı giriş yapmışsa (bkz. src/lib/authHeader.js) talebi hesabına
    // bağlıyoruz — "Siparişlerim" sayfası bunu okuyor. Misafir taleplerinde
    // user_id null kalır, akış aynı şekilde devam eder.
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    const { data: { user } } = await supabase.auth.getUser(jwt).catch(() => ({ data: { user: null } }))
    const user_id = user?.id || null

    const { error: insertError } = await supabase.from('film_requests').insert({
      isim: isim.trim(),
      telefon: telefon?.trim() || null,
      email: email?.trim() || null,
      hizmet,
      film_adedi: filmAdediNum,
      film_turu: filmTuru?.trim() ? String(filmTuru).trim().slice(0, 200) : null,
      notunuz: notunuz?.trim() ? String(notunuz).trim().slice(0, 500) : null,
      session_id: session_id || null, user_id,
    })

    if (insertError) return new Response(JSON.stringify({ error: 'Talep kaydedilemedi: ' + insertError.message }), { status: 500, headers: JSON_HEADERS })

    if (RESEND_API_KEY) {
      const sendMail = (to: string | string[], subject: string, html: string, extra: Record<string, string> = {}) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: 'Artı Poz <onboarding@resend.dev>', to, subject, html, ...extra }),
        }).catch((e) => { console.error('Mail gönderilemedi:', e); return null })

      // Müşteriye onay maili — SADECE e-posta girilmişse (telefon-only
      // başvurularda mail atılamaz, o durumda müşteri zaten telefonla aranır).
      if (email?.trim()) {
        await sendMail(email.trim(), 'Film Yıkama & Tarama Talebiniz Alındı — Artı Poz', `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
            <h1 style="font-size:24px;font-weight:300;border-bottom:1px solid #eee;padding-bottom:16px">Artı Poz</h1>
            <p>Merhaba ${esc(isim)},</p>
            <p>Film yıkama &amp; tarama talebiniz alındı. Fiyat, işlem detayları ve filmlerinizi teslim etmeniz için en kısa sürede sizinle iletişime geçeceğiz.</p>
            <p style="font-size:16px;font-weight:bold;margin:24px 0">${esc(hizmet)} — ${filmAdediNum} adet${filmTuru ? ' · ' + esc(filmTuru) : ''}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:12px">Artı Poz · Fine Art Print Studio · İstanbul</p>
          </div>
        `)
      }

      const res = await sendMail(NOTIFY_EMAILS, `🎞️ Yeni Film Yıkama & Tarama Talebi: ${isim}`, `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="font-weight:300">Yeni Film Yıkama &amp; Tarama Talebi</h2>
          <p><strong>Ad Soyad:</strong> ${esc(isim)}</p>
          <p><strong>Telefon:</strong> ${esc(telefon) || '—'}</p>
          <p><strong>E-posta:</strong> ${esc(email) || '—'}</p>
          <p><strong>Hizmet:</strong> ${esc(hizmet)}</p>
          <p><strong>Film Adedi:</strong> ${filmAdediNum}</p>
          <p><strong>Film Türü/Formatı:</strong> ${esc(filmTuru) || '—'}</p>
          ${notunuz ? `<hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="white-space:pre-wrap">${esc(notunuz)}</p>` : ''}
        </div>
      `, email?.trim() ? { reply_to: email.trim() } : {})
      if (res && !res.ok) console.error('Resend hata:', await res.text())
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Beklenmeyen hata: ' + (e as Error).message }), { status: 500, headers: JSON_HEADERS })
  }
})
