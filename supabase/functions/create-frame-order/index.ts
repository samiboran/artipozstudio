import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Edge Functions bu üç env var'ı otomatik sağlar, ekstra kurulum gerekmez.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// Sipariş bildirimleri hep buraya gider — ADMIN_EMAIL env var'ına bağımlı
// değil (o secret hiç ayarlanmamışsa mail sessizce boş adrese gidip
// kayboluyordu, bu yüzden sipariş bildirimleri hiç ulaşmıyordu).
const NOTIFY_EMAIL = 'info@artipozstudio.com'

// TEK yer: siteni buradan yönet. Wildcard (*) KULLANMA.
const ALLOWED_ORIGIN = 'https://artipozstudio.com'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' }

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
    const { name, email, phone, address, size, color, quantity, image_url, session_id } = body

    // --- Girdi doğrulama ---
    if (!name?.trim()) return badRequest('Ad soyad gerekli.')
    if (!email?.trim() || !email.includes('@')) return badRequest('Geçerli bir e-posta adresi giriniz.')
    if (!phone?.trim() || phone.trim().length < 10) return badRequest('Geçerli bir telefon numarası giriniz.')
    if (!address?.trim() || address.trim().length < 10) return badRequest('Geçerli bir adres giriniz.')
    if (!size || !color) return badRequest('Boyut ve renk seçimi gerekli.')
    if (!image_url) return badRequest('Fotoğraf yüklenmedi.')

    const qty = Math.max(1, Math.min(100, Math.floor(Number(quantity)) || 1))

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // --- Fiyatı sunucuda, tek doğruluk kaynağından (frame_options/frame_option_prices) doğrula ---
    const { data: option, error: optionError } = await supabase
      .from('frame_options')
      .select('id, size, frame_option_prices(color, price)')
      .eq('size', size)
      .single()

    if (optionError || !option) return badRequest(`Geçersiz boyut: ${size}`)

    const priceRow = (option.frame_option_prices || []).find((p: any) => p.color === color)
    if (!priceRow) return badRequest(`Geçersiz renk: ${color}`)

    const unitPrice = priceRow.price
    const total = unitPrice * qty

    // --- Siparişi kaydet (service role ile — RLS'i bypass eder, client bunu yapamaz) ---
    const { data: order, error: insertError } = await supabase
      .from('frame_orders')
      .insert({
        customer_name: name, email, phone, address,
        size, color, quantity: qty, image_url,
        unit_price: unitPrice, total_price: total,
        session_id: session_id || null,
      })
      .select()
      .single()

    if (insertError) return new Response(JSON.stringify({ error: 'Sipariş kaydedilemedi: ' + insertError.message }), { status: 500, headers: JSON_HEADERS })

    // --- Mail (her kullanıcı alanı esc() ile sanitize edilmiş hâlde) ---
    if (RESEND_API_KEY) {
      const summary = `${esc(size)} — ${esc(color)} × ${qty} = ₺${total.toLocaleString('tr-TR')}`

      const sendMail = (to: string, subject: string, html: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: 'Artı Poz <onboarding@resend.dev>', to, subject, html }),
        }).catch((e) => console.error('Mail gönderilemedi:', e))

      if (email) {
        await sendMail(email, 'Çerçeve Siparişiniz Alındı — Artı Poz', `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
            <h1 style="font-size:24px;font-weight:300;border-bottom:1px solid #eee;padding-bottom:16px">Artı Poz</h1>
            <p>Merhaba ${esc(name)},</p>
            <p>Çerçeve siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
            <p style="font-size:16px;font-weight:bold;margin:24px 0">${summary}</p>
            <p style="color:#666;font-size:14px">Teslimat adresi: ${esc(address)}</p>
            <p style="color:#666;font-size:14px">Telefon: ${esc(phone)}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:12px">Artı Poz · Fine Art Print Studio · İstanbul</p>
          </div>
        `)
      }

      await sendMail(NOTIFY_EMAIL, `🖼 Yeni Çerçeve Siparişi: ${name} — ₺${total}`, `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="font-weight:300">Yeni Çerçeve Siparişi</h2>
          <p><strong>Ad:</strong> ${esc(name)}</p>
          <p><strong>E-posta:</strong> ${esc(email) || '—'}</p>
          <p><strong>Telefon:</strong> ${esc(phone)}</p>
          <p><strong>Adres:</strong> ${esc(address)}</p>
          <p style="font-size:16px;font-weight:bold;margin:24px 0">${summary}</p>
          <p><a href="${esc(image_url)}">Yüklenen fotoğrafı görüntüle</a></p>
        </div>
      `)
    }

    return new Response(JSON.stringify({ ok: true, order, total }), { headers: JSON_HEADERS })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Beklenmeyen hata: ' + (e as Error).message }), { status: 500, headers: JSON_HEADERS })
  }
})
