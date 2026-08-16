import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Edge Functions bu üç env var'ı otomatik sağlar, ekstra kurulum gerekmez.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')

// TEK yer: siteni buradan yönet. Wildcard (*) KULLANMA.
const ALLOWED_ORIGIN = 'https://samiboran.github.io'

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
    const { items, name, email, phone, address } = body

    // --- Girdi doğrulama ---
    if (!Array.isArray(items) || items.length === 0) return badRequest('Sepet boş.')
    if (!name?.trim()) return badRequest('Ad soyad gerekli.')
    if (!email?.trim() || !email.includes('@')) return badRequest('Geçerli bir e-posta adresi giriniz.')
    if (!phone?.trim() || phone.trim().length < 10) return badRequest('Geçerli bir telefon numarası giriniz.')
    if (!address?.trim() || address.trim().length < 10) return badRequest('Geçerli bir adres giriniz.')

    // items sadece {artwork_id, size, qty} içermeli — price KABUL EDİLMİYOR.
    for (const item of items) {
      if (!item.artwork_id || !item.size) return badRequest('Sepet verisi eksik.')
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // --- Fiyatları sunucuda, tek doğruluk kaynağından (artworks tablosu) doğrula ---
    const artworkIds = [...new Set(items.map((i: any) => i.artwork_id))]
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id, title, sizes')
      .in('id', artworkIds)

    if (fetchError) return new Response(JSON.stringify({ error: 'Ürünler doğrulanamadı: ' + fetchError.message }), { status: 500, headers: JSON_HEADERS })

    const artworkMap = new Map((artworks || []).map((a: any) => [a.id, a]))

    let total = 0
    const validatedItems: any[] = []

    for (const item of items) {
      const artwork = artworkMap.get(item.artwork_id)
      if (!artwork) return badRequest(`Ürün bulunamadı: ${item.artwork_id}`)

      const sizeInfo = artwork.sizes?.find((s: any) => s.label === item.size)
      if (!sizeInfo) return badRequest(`Geçersiz boyut: ${item.size}`)

      // qty'yi de makul bir aralığa sıkıştır (1-50) — client'tan gelen her sayıya güvenme.
      const qty = Math.max(1, Math.min(50, Math.floor(Number(item.qty)) || 1))
      const lineTotal = sizeInfo.price * qty
      total += lineTotal

      validatedItems.push({
        artwork_id: artwork.id,
        title: artwork.title,
        size: item.size,
        price: sizeInfo.price, // client'ın gönderdiği price tamamen yok sayıldı
        qty,
      })
    }

    // --- Siparişi kaydet (service role ile — RLS'i bypass eder, client bunu yapamaz) ---
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({ name, email, phone, address, items: validatedItems, total })
      .select()
      .single()

    if (insertError) return new Response(JSON.stringify({ error: 'Sipariş kaydedilemedi: ' + insertError.message }), { status: 500, headers: JSON_HEADERS })

    // --- Mail (her kullanıcı alanı esc() ile sanitize edilmiş hâlde) ---
    if (RESEND_API_KEY) {
      const itemsHtml = validatedItems.map((i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${esc(i.title)} — ${esc(i.size)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">x${i.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₺${(i.price * i.qty).toLocaleString('tr-TR')}</td>
        </tr>`
      ).join('')

      const sendMail = (to: string, subject: string, html: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: 'Fossil Garden <onboarding@resend.dev>', to, subject, html }),
        }).catch((e) => console.error('Mail gönderilemedi:', e))

      if (email) {
        await sendMail(email, 'Siparişiniz Alındı — Fossil Garden', `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
            <h1 style="font-size:24px;font-weight:300;border-bottom:1px solid #eee;padding-bottom:16px">Fossil Garden</h1>
            <p>Merhaba ${esc(name)},</p>
            <p>Siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
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
            <p style="color:#999;font-size:12px">Fossil Garden · Fine Art Print Studio · İstanbul</p>
          </div>
        `)
      }

      await sendMail(ADMIN_EMAIL || '', `🛍 Yeni Sipariş: ${name} — ₺${total}`, `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
          <h2 style="font-weight:300">Yeni Sipariş Geldi</h2>
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