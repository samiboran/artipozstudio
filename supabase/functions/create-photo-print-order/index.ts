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
    const { items, name, email, phone, address, session_id } = body

    // --- Girdi doğrulama ---
    if (!Array.isArray(items) || items.length === 0) return badRequest('Listeniz boş.')
    if (!name?.trim()) return badRequest('Ad soyad gerekli.')
    if (!email?.trim() || !email.includes('@')) return badRequest('Geçerli bir e-posta adresi giriniz.')
    if (!phone?.trim() || phone.trim().length < 10) return badRequest('Geçerli bir telefon numarası giriniz.')
    if (!address?.trim() || address.trim().length < 10) return badRequest('Geçerli bir adres giriniz.')

    // items sadece {image_url, size, finish, quantity, note} içermeli — unit_price KABUL EDİLMİYOR.
    for (const item of items) {
      if (!item.image_url || !item.size || !item.finish) return badRequest('Liste verisi eksik.')
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // --- Fiyatları sunucuda, tek doğruluk kaynağından (photo_print_prices) doğrula ---
    const { data: priceRows, error: priceError } = await supabase
      .from('photo_print_prices')
      .select('size, finish, price')

    if (priceError) return new Response(JSON.stringify({ error: 'Fiyatlar doğrulanamadı: ' + priceError.message }), { status: 500, headers: JSON_HEADERS })

    const priceMap = new Map((priceRows || []).map((p: any) => [`${p.size}:${p.finish}`, p.price]))

    let total = 0
    const validatedItems: any[] = []

    for (const item of items) {
      const unitPrice = priceMap.get(`${item.size}:${item.finish}`)
      if (unitPrice === undefined) return badRequest(`Geçersiz boy/yüzey kombinasyonu: ${item.size} / ${item.finish}`)

      // quantity'yi makul bir aralığa sıkıştır (1-100) — client'tan gelen her sayıya güvenme.
      const quantity = Math.max(1, Math.min(100, Math.floor(Number(item.quantity)) || 1))
      const lineTotal = unitPrice * quantity
      total += lineTotal

      validatedItems.push({
        image_url: String(item.image_url),
        size: item.size,
        finish: item.finish,
        quantity,
        unit_price: unitPrice,
        note: item.note ? String(item.note).slice(0, 300) : null,
      })
    }

    // --- Siparişi kaydet (service role ile — RLS'i bypass eder, client bunu yapamaz) ---
    const { data: order, error: orderError } = await supabase
      .from('photo_print_orders')
      .insert({
        customer_name: name, email, phone, address,
        total_price: total, session_id: session_id || null,
      })
      .select()
      .single()

    if (orderError) return new Response(JSON.stringify({ error: 'Sipariş kaydedilemedi: ' + orderError.message }), { status: 500, headers: JSON_HEADERS })

    const { error: itemsError } = await supabase
      .from('photo_print_order_items')
      .insert(validatedItems.map((i) => ({ ...i, order_id: order.id })))

    if (itemsError) return new Response(JSON.stringify({ error: 'Sipariş satırları kaydedilemedi: ' + itemsError.message }), { status: 500, headers: JSON_HEADERS })

    // --- Mail (her kullanıcı alanı esc() ile sanitize edilmiş hâlde) ---
    if (RESEND_API_KEY) {
      const itemsHtml = validatedItems.map((i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${esc(i.size)} — ${esc(i.finish)}${i.note ? ' · ' + esc(i.note) : ''}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">x${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₺${(i.unit_price * i.quantity).toLocaleString('tr-TR')}</td>
        </tr>`
      ).join('')

      const sendMail = (to: string, subject: string, html: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: 'Artı Poz <onboarding@resend.dev>', to, subject, html }),
        }).catch((e) => console.error('Mail gönderilemedi:', e))

      if (email) {
        await sendMail(email, 'Fotoğraf Baskı Siparişiniz Alındı — Artı Poz', `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
            <h1 style="font-size:24px;font-weight:300;border-bottom:1px solid #eee;padding-bottom:16px">Artı Poz</h1>
            <p>Merhaba ${esc(name)},</p>
            <p>Fotoğraf baskı siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0">
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding:12px 8px;font-weight:bold">Toplam</td>
                <td style="padding:12px 8px;text-align:right;font-weight:bold">₺${total.toLocaleString('tr-TR')}</td>
              </tr>
            </table>
            <p style="color:#666;font-size:14px">Teslimat adresi: ${esc(address)}</p>
            <p style="color:#666;font-size:14px">Telefon: ${esc(phone)}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:12px">Artı Poz · Fine Art Print Studio · İstanbul</p>
          </div>
        `)
      }

      await sendMail(NOTIFY_EMAIL, `📷 Yeni Fotoğraf Baskı Siparişi: ${name} — ₺${total}`, `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="font-weight:300">Yeni Fotoğraf Baskı Siparişi</h2>
          <p><strong>Ad:</strong> ${esc(name)}</p>
          <p><strong>E-posta:</strong> ${esc(email) || '—'}</p>
          <p><strong>Telefon:</strong> ${esc(phone)}</p>
          <p><strong>Adres:</strong> ${esc(address)}</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding:12px 8px;font-weight:bold">Toplam</td>
              <td style="padding:12px 8px;text-align:right;font-weight:bold">₺${total.toLocaleString('tr-TR')}</td>
            </tr>
          </table>
        </div>
      `)
    }

    return new Response(JSON.stringify({ ok: true, order, total }), { headers: JSON_HEADERS })

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Beklenmeyen hata: ' + (e as Error).message }), { status: 500, headers: JSON_HEADERS })
  }
})
