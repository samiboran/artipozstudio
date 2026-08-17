import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Edge Functions bu üç env var'ı otomatik sağlar, ekstra kurulum gerekmez.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// TEK yer: siteni buradan yönet. Wildcard (*) KULLANMA.
const ALLOWED_ORIGIN = 'https://samiboran.github.io'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { orderId, trackingNumber } = await req.json()
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId gerekli' }), { status: 400, headers: JSON_HEADERS })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: order, error } = await supabase
      .from('orders')
      .select('name, email, address')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return new Response(JSON.stringify({ error: 'Sipariş bulunamadı' }), { status: 404, headers: JSON_HEADERS })
    }

    if (!order.email) {
      // E-posta yoksa gönderilecek bir şey yok, hata değil.
      return new Response(JSON.stringify({ ok: true, skipped: 'no-email' }), { headers: JSON_HEADERS })
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'Artı Poz <onboarding@resend.dev>',
        to: order.email,
        subject: 'Siparişiniz Kargoya Verildi — Artı Poz',
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111">
            <h1 style="font-size:24px;font-weight:300;border-bottom:1px solid #eee;padding-bottom:16px">Artı Poz</h1>
            <p>Merhaba ${esc(order.name)},</p>
            <p>Siparişiniz kargoya verildi.</p>
            ${trackingNumber ? `<p><strong>Kargo takip numarası:</strong> ${esc(trackingNumber)}</p>` : ''}
            <p style="color:#666;font-size:14px">Teslimat adresi: ${esc(order.address)}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:12px">Artı Poz · Fine Art Print Lab · İstanbul</p>
          </div>
        `,
      }),
    })

    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: JSON_HEADERS })
  }
})
