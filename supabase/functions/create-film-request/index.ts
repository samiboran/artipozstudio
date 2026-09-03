import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Edge Functions bu üç env var'ı otomatik sağlar, ekstra kurulum gerekmez.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Film Yıkama & Tarama talep bildirimleri hep buraya gider — site
// genelindeki desenle aynı (bkz. send-contact-email, create-photo-print-order).
const NOTIFY_EMAIL = 'info@artipozstudio.com'

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

    const { error: insertError } = await supabase.from('film_requests').insert({
      isim: isim.trim(),
      telefon: telefon?.trim() || null,
      email: email?.trim() || null,
      hizmet,
      film_adedi: filmAdediNum,
      film_turu: filmTuru?.trim() ? String(filmTuru).trim().slice(0, 200) : null,
      notunuz: notunuz?.trim() ? String(notunuz).trim().slice(0, 500) : null,
      session_id: session_id || null,
    })

    if (insertError) return new Response(JSON.stringify({ error: 'Talep kaydedilemedi: ' + insertError.message }), { status: 500, headers: JSON_HEADERS })

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Artı Poz <onboarding@resend.dev>',
          to: NOTIFY_EMAIL,
          ...(email?.trim() ? { reply_to: email.trim() } : {}),
          subject: `🎞️ Yeni Film Yıkama & Tarama Talebi: ${isim}`,
          html: `
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
          `,
        }),
      }).catch((e) => { console.error('Mail gönderilemedi:', e); return null })
      if (res && !res.ok) console.error('Resend hata:', await res.text())
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Beklenmeyen hata: ' + (e as Error).message }), { status: 500, headers: JSON_HEADERS })
  }
})
