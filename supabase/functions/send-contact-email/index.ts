import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Edge Functions bu üç env var'ı otomatik sağlar, ekstra kurulum gerekmez.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Ana Sayfa "Sipariş & İletişim" formunun bildirimleri hep buraya gider —
// ADMIN_EMAIL env var'ına bağımlı değil (o secret hiç ayarlanmamışsa mail
// sessizce boş adrese gidip kayboluyordu, bkz. create-order/create-frame-order).
const NOTIFY_EMAIL = 'info@artipozstudio.com'

// TEK yer: siteni buradan yönet. Wildcard (*) KULLANMA.
const ALLOWED_ORIGIN = 'https://artipozstudio.com'

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
    const { isim, postaKodu, adres, email, telefon, numune, boyut, mesaj, session_id } = body

    // --- Girdi doğrulama ---
    if (!isim?.trim()) return badRequest('İsim gerekli.')
    if (!email?.trim() || !email.includes('@')) return badRequest('Geçerli bir e-posta adresi giriniz.')
    if (!mesaj?.trim()) return badRequest('Mesaj gerekli.')

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { error: insertError } = await supabase.from('contact_messages').insert({
      isim, posta_kodu: postaKodu || null, adres: adres || null, email,
      telefon: telefon || null, kagit: numune || null, boyut: boyut || null,
      mesaj, session_id: session_id || null,
    })

    if (insertError) return new Response(JSON.stringify({ error: 'Mesaj kaydedilemedi: ' + insertError.message }), { status: 500, headers: JSON_HEADERS })

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Artı Poz <onboarding@resend.dev>',
          to: NOTIFY_EMAIL,
          reply_to: email,
          subject: `✉️ Yeni İletişim Mesajı: ${isim}`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
              <h2 style="font-weight:300">Ana Sayfadan Yeni Mesaj</h2>
              <p><strong>İsim:</strong> ${esc(isim)}</p>
              <p><strong>E-posta:</strong> ${esc(email)}</p>
              <p><strong>Telefon:</strong> ${esc(telefon) || '—'}</p>
              <p><strong>Posta Kodu:</strong> ${esc(postaKodu) || '—'}</p>
              <p><strong>Adres:</strong> ${esc(adres) || '—'}</p>
              <p><strong>Kağıt Seçeneği:</strong> ${esc(numune) || '—'}</p>
              <p><strong>Boyut:</strong> ${esc(boyut) || '—'}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
              <p style="white-space:pre-wrap">${esc(mesaj)}</p>
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
