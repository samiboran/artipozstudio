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
    const { isim, postaKodu, adres, email, telefon, numune, boyut, mesaj, session_id, source } = body

    // --- Girdi doğrulama ---
    if (!isim?.trim()) return badRequest('İsim gerekli.')
    if (!email?.trim() || !email.includes('@')) return badRequest('Geçerli bir e-posta adresi giriniz.')
    if (!mesaj?.trim()) return badRequest('Mesaj gerekli.')

    // Formu gönderen sayfa — Ana Sayfa'daki ve Fine Art Baskı'daki aynı
    // bileşenden geldiği için (bkz. SiparisIletisimForm.jsx) hangisinden
    // geldiği ayrıca işaretlenmezse kayıt/e-posta belirsiz kalırdı.
    const pageLabel = source === 'fine-art-baski' ? 'Fine Art Baskı' : 'Ana Sayfa'

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { error: insertError } = await supabase.from('contact_messages').insert({
      isim, posta_kodu: postaKodu || null, adres: adres || null, email,
      telefon: telefon || null, kagit: numune || null, boyut: boyut || null,
      mesaj, session_id: session_id || null, source: source || 'ana-sayfa',
    })

    if (insertError) return new Response(JSON.stringify({ error: 'Mesaj kaydedilemedi: ' + insertError.message }), { status: 500, headers: JSON_HEADERS })

    if (RESEND_API_KEY) {
      const sendMail = (to: string, subject: string, html: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: 'Artı Poz <onboarding@resend.dev>', to, subject, html }),
        }).then(async (r) => { if (!r.ok) console.error('Resend hata:', await r.text()) })
          .catch((e) => console.error('Mail gönderilemedi:', e))

      // Bize (Sami) — hangi sayfadan geldiği başlıkta ve içerikte belli.
      await sendMail(NOTIFY_EMAIL, `✉️ Yeni İletişim Mesajı (${pageLabel}): ${isim}`, `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="font-weight:300">${esc(pageLabel)}'dan Yeni Mesaj</h2>
          <p><strong>İsim:</strong> ${esc(isim)}</p>
          <p><strong>E-posta:</strong> ${esc(email)}</p>
          <p><strong>Telefon:</strong> ${esc(telefon) || 'Belirtilmedi'}</p>
          <p><strong>Posta Kodu:</strong> ${esc(postaKodu) || 'Belirtilmedi'}</p>
          <p><strong>Adres:</strong> ${esc(adres) || 'Belirtilmedi'}</p>
          <p><strong>Kağıt Seçeneği:</strong> ${esc(numune) || 'Belirtilmedi'}</p>
          <p><strong>Boyut:</strong> ${esc(boyut) || 'Belirtilmedi'}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="white-space:pre-wrap">${esc(mesaj)}</p>
        </div>
      `)

      // Müşteriye onay — önceden bu form yalnızca bize gidiyordu, müşteri
      // talebinin gerçekten ulaştığına dair hiçbir e-posta almıyordu.
      await sendMail(email, 'Talebiniz Alındı — Artı Poz', `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
          <h1 style="font-size:24px;font-weight:300;border-bottom:1px solid #eee;padding-bottom:16px">Artı Poz</h1>
          <p>Merhaba ${esc(isim)},</p>
          <p>Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
          <p><strong>Kağıt Seçeneği:</strong> ${esc(numune) || 'Belirtilmedi'}</p>
          <p><strong>Boyut:</strong> ${esc(boyut) || 'Belirtilmedi'}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#999;font-size:12px">Artı Poz · Fine Art Print Studio · İstanbul</p>
        </div>
      `)
    }

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Beklenmeyen hata: ' + (e as Error).message }), { status: 500, headers: JSON_HEADERS })
  }
})
