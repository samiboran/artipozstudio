import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import heroImgDefault from '../assets/process/studyo.jpg'

// Supabase Storage'ta tek dosya için pratik üst sınır — ihtiyaç olursa
// buradan değiştir, kod içinde başka yerde hardcode edilmedi.
const MAX_FILE_SIZE_MB = 50

const PHOTO_SIZES = ['A2', 'A3', 'A4', 'A5', 'A6']
const PHOTO_FINISHES = ['Mat', 'Parlak']

// Supabase'e hiç bağlanamazsa veya fiyat tablosu boşsa gösterilecek yedek veri —
// FineArtBaski.jsx / Cerceve.jsx'teki aynı desen.
const FALLBACK_PRICES = {
  'A2:Mat': 950, 'A2:Parlak': 950,
  'A3:Mat': 650, 'A3:Parlak': 650,
  'A4:Mat': 450, 'A4:Parlak': 450,
  'A5:Mat': 280, 'A5:Parlak': 280,
  'A6:Mat': 180, 'A6:Parlak': 180,
}

const heading = { fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--ink)' }
const eyebrow = {
  fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500,
  letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)',
}
const body = { fontFamily: 'var(--font-body)', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--muted)' }
const label = { fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }

const inputStyle = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

const placeholderBox = (label) => (
  <div style={{
    width: '100%', height: '100%', minHeight: 160,
    background: 'var(--surface)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-body)', fontSize: '.68rem',
    letterSpacing: '.05em', color: 'var(--muted)', textAlign: 'center', padding: '1rem'
  }}>
    {label}
  </div>
)

function FinishCard({ label: cardLabel, img1, img2, onClick }) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="finish-card" style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', position: 'relative', background: 'var(--surface)' }}>
        {img1 ? (
          <img src={img1} alt={`${cardLabel} baskı örneği`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : placeholderBox(`${cardLabel} — Admin'den yükle`)}
        {img2 && (
          <img className="img-2" src={img2} alt={`${cardLabel} baskı örneği, yakın çekim`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <p style={{ ...eyebrow, textAlign: 'center', marginTop: '.9rem' }}>{cardLabel}</p>
    </div>
  )
}

export default function FotografBaski() {
  const [images, setImages] = useState({
    hero: heroImgDefault,
    'mat-1': null, 'mat-2': null, 'parlak-1': null, 'parlak-2': null,
  })
  const [content, setContent] = useState({})
  const [prices, setPrices] = useState(FALLBACK_PRICES)

  // --- Sipariş satırı formu ---
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [size, setSize] = useState('A4')
  const [finish, setFinish] = useState('Mat')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const fileRef = useRef()

  // --- Liste (sepet) ---
  const [list, setList] = useState([])

  // --- Sipariş formu ---
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [orderStatus, setOrderStatus] = useState('idle') // idle | submitting | sent
  const [orderError, setOrderError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [{ data: imgs }, { data: priceRows }, { data: contentRows }] = await Promise.all([
        supabase.from('page_images').select('*').eq('page', 'fotograf-baski').order('sort_order').order('id'),
        supabase.from('photo_print_prices').select('*'),
        supabase.from('page_content').select('section, content').eq('page', 'fotograf-baski'),
      ])

      if (contentRows && contentRows.length) {
        const map = {}
        contentRows.forEach(row => { if (row.content) map[row.section] = row.content })
        setContent(map)
      }

      if (imgs && imgs.length) {
        setImages(prev => {
          const next = { ...prev }
          const bySection = {}
          imgs.forEach(row => { (bySection[row.section] ||= []).push(row) })
          ;['hero', 'mat-1', 'mat-2', 'parlak-1', 'parlak-2'].forEach(section => {
            if (bySection[section]?.[0]) next[section] = bySection[section][0].image_url
          })
          return next
        })
      }

      if (priceRows && priceRows.length) {
        const map = {}
        priceRows.forEach(p => { map[`${p.size}:${p.finish}`] = p.price })
        setPrices(map)
      }
    } catch (err) {
      console.error('Fotoğraf Baskı sayfası verisi yüklenemedi:', err)
    }
  }

  const unitPrice = prices[`${size}:${finish}`] || 0
  const lineTotal = unitPrice * (Number(quantity) || 0)
  const listTotal = list.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  // Supabase JS client'ının oturum kilidiyle ilgili bilinen bir durum: birden fazla
  // sekme/istemci aynı anda aynı Supabase session'ına erişmeye çalışınca "lock ...
  // was released because another request stole it" hatası dönebiliyor. Bu geçici
  // bir durum olduğu için birkaç kez kısa gecikmeyle otomatik tekrar deniyoruz.
  async function uploadWithRetry(path, file, attempt = 0) {
    const { error } = await supabase.storage.from('site-images').upload(path, file)
    if (!error) return
    const isLockError = error.message?.toLowerCase().includes('lock')
    if (isLockError && attempt < 2) {
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
      return uploadWithRetry(path, file, attempt + 1)
    }
    throw error
  }

  async function handleFileSelect(file) {
    if (!file) return
    setUploadError('')
    if (!file.type.startsWith('image/')) {
      setUploadError('Lütfen bir görsel dosyası seçin.')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`Dosya çok büyük — maksimum ${MAX_FILE_SIZE_MB} MB.`)
      return
    }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `photo-print/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    try {
      await uploadWithRetry(path, file)
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error)
      setUploadError('Yükleme başarısız oldu, lütfen tekrar deneyin.')
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    setUploadedUrl(data.publicUrl)
    setUploading(false)
  }

  function addToList() {
    if (!uploadedUrl) { setUploadError('Önce bir fotoğraf yükleyin.'); return }
    setList(l => [...l, {
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      imageUrl: uploadedUrl, size, finish,
      quantity: Math.max(1, Number(quantity) || 1),
      unitPrice, note: note.trim(),
    }])
    // Formu bir sonraki fotoğraf için sıfırla, boy/yüzey tercihini koru.
    setUploadedUrl('')
    setQuantity(1)
    setNote('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeFromList(key) {
    setList(l => l.filter(item => item.key !== key))
  }

  function updateOrderForm(e) {
    const { name, value } = e.target
    setOrderForm(f => ({ ...f, [name]: value }))
  }

  async function submitOrder(e) {
    e.preventDefault()
    if (!orderForm.email?.trim() || !orderForm.email.includes('@')) { setOrderError('Geçerli bir e-posta adresi giriniz.'); return }
    if (!orderForm.phone?.trim() || orderForm.phone.trim().length < 10) { setOrderError('Geçerli bir telefon numarası giriniz.'); return }
    if (!orderForm.address?.trim() || orderForm.address.trim().length < 10) { setOrderError('Geçerli bir adres giriniz.'); return }
    if (list.length === 0) { setOrderError('Listeniz boş.'); return }

    setOrderStatus('submitting')
    setOrderError('')

    const payload = {
      name: orderForm.name,
      email: orderForm.email,
      phone: orderForm.phone,
      address: orderForm.address,
      session_id: getSessionId(),
      items: list.map(item => ({
        image_url: item.imageUrl, size: item.size, finish: item.finish,
        quantity: item.quantity, note: item.note,
      })),
    }

    try {
      const res = await fetch('https://qrbkzjosorimiwdbwyyl.supabase.co/functions/v1/create-photo-print-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setOrderStatus('idle'); setOrderError(data.error || 'Sipariş gönderilemedi.'); return }
    } catch {
      setOrderStatus('idle')
      setOrderError('Sipariş gönderilemedi: bağlantı hatası.')
      return
    }

    setOrderStatus('sent')
    setList([])
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>
      <style>{`
        @media (hover: hover) {
          .finish-card:hover .img-2 { opacity: 1; }
        }
        .finish-card .img-2 { opacity: 0; transition: opacity .4s ease; }
      `}</style>

      {/* Hero */}
      <section style={{
        position: 'relative', height: '46vh', minHeight: 320,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden',
      }}>
        <img
          src={images.hero}
          alt="Stüdyoda hazırlanan fotoğraf baskıları"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,17,17,.15), rgba(17,17,17,.55))' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
          <p style={{ ...eyebrow, color: '#fff', opacity: .85, marginBottom: '1rem' }}>Hizmetlerimiz</p>
          <h1 style={{ ...heading, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', margin: '0 0 1rem' }}>
            Fotoğraf Baskı
          </h1>
          <p style={{ ...body, color: 'rgba(255,255,255,.85)', maxWidth: 480, margin: '0 auto' }}>
            {content['hero-aciklama'] || 'Yüksek çözünürlükte, profesyonel fotoğraf kağıtlarına baskı.'}
          </p>
        </div>
      </section>

      {/* Yüzey seçenekleri: mat / parlak karşılaştırma */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
          <FinishCard label="Mat" img1={images['mat-1']} img2={images['mat-2']} onClick={() => setFinish('Mat')} />
          <FinishCard label="Parlak" img1={images['parlak-1']} img2={images['parlak-2']} onClick={() => setFinish('Parlak')} />
        </div>
        <p style={{ ...body, textAlign: 'center', marginTop: '2rem', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          {content['yuzey-aciklama'] || `Seçtiğiniz yüzeye göre baskı hazırlıyoruz — mat yüzey yumuşak, yansımasız bir görünüm,
          parlak yüzey ise derin renkler ve yüksek kontrast sunar. Kartların üzerine gelerek
          yakın çekim detayını görebilirsiniz.`}
        </p>
      </section>

      {/* Dosya yükleme */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={label}>Fotoğrafınızı Yükleyin</p>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]) }}
          style={{
            marginTop: '.8rem', border: '1px dashed var(--border)', padding: '2rem 1rem',
            textAlign: 'center', cursor: 'pointer', minHeight: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: uploadedUrl ? 'transparent' : 'var(--surface)',
          }}
        >
          {uploading ? (
            <span style={{ ...body, fontSize: '.82rem' }}>Yükleniyor…</span>
          ) : uploadedUrl ? (
            <img src={uploadedUrl} alt="Yüklenen fotoğraf önizlemesi" style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }} />
          ) : (
            <span style={{ ...body, fontSize: '.82rem' }}>
              Fotoğrafınızı buraya sürükleyin<br />veya tıklayarak dosya seçin
            </span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleFileSelect(e.target.files[0])} />
        {uploadError && <p style={{ color: '#c33', fontSize: '.78rem', marginTop: '.5rem' }}>{uploadError}</p>}

        <p style={{ ...body, fontSize: '.76rem', marginTop: '1.2rem', lineHeight: 1.9 }}>
          Önerilen formatlar: <b>JPEG, PNG, TIFF veya PDF.</b> En iyi sonuç için en az{' '}
          <b>300 DPI</b> çözünürlük ve <b>RGB renk profili</b> kullanın. Dosya başına
          en fazla <b>{MAX_FILE_SIZE_MB} MB</b> yükleyebilirsiniz.
        </p>
      </section>

      {/* Boy / yüzey / adet / not + listeye ekle */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '1rem 2rem 3rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ ...label, display: 'block', marginBottom: '.5rem' }}>Boy & Yüzey</label>
          <button
            type="button" onClick={() => setSelectorOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '.75rem 1rem', border: '1px solid var(--border)', background: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--ink)', cursor: 'pointer',
            }}
          >
            <span>{size} · {finish} · {quantity} adet — <b>₺{lineTotal.toLocaleString('tr-TR')}</b></span>
            <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{selectorOpen ? '▲' : '▼'}</span>
          </button>

          {selectorOpen && (
            <div style={{ border: '1px solid var(--border)', borderTop: 'none', padding: '1.2rem 1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>Boy</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  {PHOTO_SIZES.map(s => (
                    <button key={s} type="button" onClick={() => setSize(s)} style={{
                      padding: '.5rem 1rem', border: `1px solid ${size === s ? 'var(--ink)' : 'var(--border)'}`,
                      background: size === s ? 'var(--ink)' : 'none', color: size === s ? '#fff' : 'var(--ink)',
                      fontFamily: 'var(--font-body)', fontSize: '.78rem', cursor: 'pointer',
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>Yüzey</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  {PHOTO_FINISHES.map(f => (
                    <button key={f} type="button" onClick={() => setFinish(f)} style={{
                      padding: '.5rem 1rem', border: `1px solid ${finish === f ? 'var(--ink)' : 'var(--border)'}`,
                      background: finish === f ? 'var(--ink)' : 'none', color: finish === f ? '#fff' : 'var(--ink)',
                      fontFamily: 'var(--font-body)', fontSize: '.78rem', cursor: 'pointer',
                    }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ ...label, display: 'block', marginBottom: '.4rem', fontSize: '.68rem' }}>Adet</label>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ ...inputStyle, maxWidth: 140 }} />
              </div>
              <div style={{ ...body, fontSize: '.85rem', color: 'var(--ink)', marginTop: '1rem', paddingTop: '.8rem', borderTop: '1px solid var(--border)' }}>
                Birim fiyat: <b>₺{unitPrice.toLocaleString('tr-TR')}</b>
                <span style={{ margin: '0 .5rem', color: 'var(--border)' }}>·</span>
                Satır toplamı: <b>₺{lineTotal.toLocaleString('tr-TR')}</b>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Not (opsiyonel)</label>
          <textarea
            value={note} maxLength={300} onChange={e => setNote(e.target.value)}
            style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
            placeholder="Kırpma, kadraj veya özel bir isteğiniz varsa yazabilirsiniz"
          />
        </div>

        <button
          type="button" onClick={addToList} disabled={uploading}
          style={{
            width: '100%', padding: '.85rem', background: 'var(--accent)', color: '#fff',
            border: 'none', fontFamily: 'var(--font-body)', fontSize: '.75rem',
            letterSpacing: '.14em', textTransform: 'uppercase', cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? .6 : 1,
          }}
        >
          Listeye Ekle
        </button>
      </section>

      {/* Liste */}
      {list.length > 0 && (
        <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem 3rem' }}>
          <p style={label}>Listeniz</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem', marginTop: '1rem' }}>
            {list.map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)', padding: '.8rem' }}>
                <img src={item.imageUrl} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, ...body, fontSize: '.82rem' }}>
                  {item.size} · {item.finish} · {item.quantity} adet
                  {item.note && <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.2rem' }}>Not: {item.note}</div>}
                </div>
                <div style={{ ...label, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                  ₺{(item.unitPrice * item.quantity).toLocaleString('tr-TR')}
                </div>
                <button
                  type="button" onClick={() => removeFromList(item.key)}
                  aria-label="Kaldır"
                  style={{ background: 'none', border: 'none', color: '#c33', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1, padding: '0 .3rem' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ ...heading, fontSize: '1.1rem' }}>Toplam</span>
            <span style={{ ...heading, fontSize: '1.3rem' }}>₺{listTotal.toLocaleString('tr-TR')}</span>
          </div>

          {!orderOpen && (
            <button
              type="button" onClick={() => setOrderOpen(true)}
              style={{
                width: '100%', marginTop: '1.2rem', padding: '.9rem', background: 'var(--ink)', color: '#fff',
                border: 'none', fontFamily: 'var(--font-body)', fontSize: '.75rem',
                letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Sipariş Ver
            </button>
          )}
        </section>
      )}

      {/* Sipariş formu */}
      {list.length > 0 && orderOpen && (
        <section style={{ background: 'var(--surface)', padding: '3rem 2rem' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {orderStatus === 'sent' ? (
              <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '2rem', textAlign: 'center', ...body }}>
                Siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.
              </div>
            ) : (
              <>
                <h2 style={{ ...heading, fontSize: '1.5rem', textAlign: 'center', margin: '0 0 .6rem' }}>İletişim Bilgileri</h2>
                <p style={{ ...body, textAlign: 'center', marginBottom: '1.8rem' }}>
                  Siparişinizi tamamlamak için bilgilerinizi girin.
                </p>
                <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Ad Soyad *</label>
                      <input name="name" required value={orderForm.name} onChange={updateOrderForm} style={inputStyle} placeholder="Adınız ve soyadınız" />
                    </div>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>E-posta *</label>
                      <input name="email" type="email" required value={orderForm.email} onChange={updateOrderForm} style={inputStyle} placeholder="E-posta adresiniz" />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Telefon *</label>
                    <input name="phone" type="tel" required value={orderForm.phone} onChange={updateOrderForm} style={inputStyle} placeholder="Telefon numaranız" />
                  </div>
                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Teslimat Adresi *</label>
                    <textarea name="address" required value={orderForm.address} onChange={updateOrderForm} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Açık adresiniz" />
                  </div>

                  {orderError && <div style={{ color: '#c33', fontSize: '.78rem' }}>{orderError}</div>}

                  <button
                    type="submit" disabled={orderStatus === 'submitting'}
                    style={{
                      marginTop: '.5rem', padding: '.9rem', background: 'var(--accent)', color: '#fff',
                      border: 'none', fontFamily: 'var(--font-body)', fontSize: '.75rem',
                      letterSpacing: '.14em', textTransform: 'uppercase',
                      cursor: orderStatus === 'submitting' ? 'not-allowed' : 'pointer',
                      opacity: orderStatus === 'submitting' ? .7 : 1,
                    }}
                  >
                    {orderStatus === 'submitting' ? 'Gönderiliyor…' : `Siparişi Gönder — ₺${listTotal.toLocaleString('tr-TR')}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
