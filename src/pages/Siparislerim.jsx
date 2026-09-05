import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// "Kayıt olma avantajı": giriş yapan bir müşteri, geçmişte verdiği
// siparişleri/talepleri burada görür. RLS zaten her tabloda sadece
// auth.uid() = user_id (veya admin) satırlarını döndürüyor (bkz.
// 25_siparislerim_user_id.sql) — burada ekstra bir user_id filtresi
// GEREKMİYOR, ama okunabilirlik için sorgularda yine de belirtiyoruz.
// Admin.jsx'teki gerçek status anahtarlarıyla birebir aynı olmalı
// (bkz. Admin.jsx STATUS_LABELS / FILM_STATUS_LABELS) — burada uydurma
// bir status seti kullanılırsa müşteri hep "Bilinmiyor" görür.
const STATUS_LABELS = {
  yeni: 'Yeni', hazirlaniyor: 'Hazırlanıyor', kargoda: 'Kargoda',
  teslim: 'Teslim Edildi', iptal: 'İptal',
}
const FILM_STATUS_LABELS = {
  yeni: 'Yeni', iletisimde: 'İletişimde', tamamlandi: 'Tamamlandı', iptal: 'İptal',
}

function statusLabel(status, labels = STATUS_LABELS) {
  if (!status) return labels.yeni
  return labels[status] || status
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

function Siparislerim() {
  const [session, setSession] = useState(undefined) // undefined: yükleniyor, null: misafir
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [photoOrders, setPhotoOrders] = useState([])
  const [frameOrders, setFrameOrders] = useState([])
  const [filmRequests, setFilmRequests] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
  }, [])

  useEffect(() => {
    if (session === undefined) return
    if (!session) { setLoading(false); return }

    async function load() {
      const userId = session.user.id

      const [ordersRes, photoRes, frameRes, filmRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('photo_print_orders')
          .select('*, photo_print_order_items(*)')
          .eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('frame_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('film_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ])

      setOrders(ordersRes.data || [])
      setPhotoOrders(photoRes.data || [])
      setFrameOrders(frameRes.data || [])
      setFilmRequests(filmRes.data || [])
      setLoading(false)
    }
    load()
  }, [session])

  const sectionTitle = {
    fontFamily: 'var(--font-heading)', fontWeight: 600,
    fontSize: '1.2rem', margin: '0 0 1rem',
  }

  const card = {
    border: '1px solid var(--border)', padding: '1.2rem 1.4rem',
    marginBottom: '.9rem', fontSize: '.82rem', lineHeight: 1.7,
  }

  const rowTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }
  const badge = {
    fontSize: '.62rem', letterSpacing: '.08em', textTransform: 'uppercase',
    color: 'var(--muted)', border: '1px solid var(--border)', padding: '.25rem .6rem',
    whiteSpace: 'nowrap',
  }
  const meta = { color: 'var(--muted)', fontSize: '.72rem', marginTop: '.3rem' }

  const totalCount = orders.length + photoOrders.length + frameOrders.length + filmRequests.length

  if (session === undefined || loading) {
    return (
      <div style={{ paddingTop: '4.2rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--muted)' }}>
          Yükleniyor…
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ paddingTop: '4.2rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: '1rem' }}>
            Siparişlerini görmek için giriş yap
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.6rem' }}>
            Geçmiş siparişlerin ve taleplerin, hesabına giriş yaptığında burada listelenir.
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'var(--ink)', color: '#fff', border: 'none',
              padding: '.8rem 2rem', fontSize: '.65rem',
              letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer'
            }}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '4.2rem', minHeight: '60vh' }}>
      <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '2.2rem', margin: 0 }}>
          Siparişlerim
        </h1>
        <div style={{ fontSize: '.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '.4rem' }}>
          {totalCount} kayıt
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        {totalCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--muted)', marginBottom: '1.2rem' }}>
              Henüz bir siparişin veya talebin yok
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'var(--ink)', color: '#fff', border: 'none',
                padding: '.8rem 2rem', fontSize: '.65rem',
                letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer'
              }}
            >
              Koleksiyonu Keşfet
            </button>
          </div>
        ) : (
          <>
            {orders.length > 0 && (
              <section style={{ marginBottom: '2.4rem' }}>
                <h2 style={sectionTitle}>Eser Siparişleri</h2>
                {orders.map(o => (
                  <div key={o.id} style={card}>
                    <div style={rowTop}>
                      <div>
                        {(o.items || []).map((it, i) => (
                          <div key={i}>{it.title} — {it.size} × {it.qty}</div>
                        ))}
                      </div>
                      <span style={badge}>{statusLabel(o.status)}</span>
                    </div>
                    <div style={meta}>
                      {formatDate(o.created_at)} · Toplam ₺{Number(o.total || 0).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {photoOrders.length > 0 && (
              <section style={{ marginBottom: '2.4rem' }}>
                <h2 style={sectionTitle}>Fotoğraf Baskı Siparişleri</h2>
                {photoOrders.map(o => (
                  <div key={o.id} style={card}>
                    <div style={rowTop}>
                      <div>
                        {(o.photo_print_order_items || []).map((it, i) => (
                          <div key={i}>{it.size} — {it.finish} × {it.quantity}</div>
                        ))}
                      </div>
                      <span style={badge}>{statusLabel(o.status)}</span>
                    </div>
                    <div style={meta}>
                      {formatDate(o.created_at)} · Toplam ₺{Number(o.total_price || 0).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {frameOrders.length > 0 && (
              <section style={{ marginBottom: '2.4rem' }}>
                <h2 style={sectionTitle}>Çerçeve Siparişleri</h2>
                {frameOrders.map(o => (
                  <div key={o.id} style={card}>
                    <div style={rowTop}>
                      <div>{o.size} — {o.color} × {o.quantity}</div>
                      <span style={badge}>{statusLabel(o.status)}</span>
                    </div>
                    <div style={meta}>
                      {formatDate(o.created_at)} · Toplam ₺{Number(o.total_price || 0).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {filmRequests.length > 0 && (
              <section style={{ marginBottom: '2.4rem' }}>
                <h2 style={sectionTitle}>Film Yıkama & Tarama Talepleri</h2>
                {filmRequests.map(r => (
                  <div key={r.id} style={card}>
                    <div style={rowTop}>
                      <div>{r.hizmet}{r.film_turu ? ` — ${r.film_turu}` : ''} × {r.film_adedi}</div>
                      <span style={badge}>{statusLabel(r.status, FILM_STATUS_LABELS)}</span>
                    </div>
                    <div style={meta}>{formatDate(r.created_at)}</div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Siparislerim
