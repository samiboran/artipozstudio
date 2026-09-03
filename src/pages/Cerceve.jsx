import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import heroImgDefault from '../assets/cerceve/hero.jpg'

// Supabase Storage'ta tek dosya için pratik üst sınır.
const MAX_FILE_SIZE_MB = 10
import renkSecenekleriImgDefault from '../assets/cerceve/renk-secenekleri.webp'
import ornekSiyahImgDefault from '../assets/cerceve/ornek-siyah-cerceve.jpg'
import ornekAhsapImgDefault from '../assets/cerceve/ornek-ahsap-cerceve.jpg'

// Supabase'e hiç bağlanamazsa veya frame_options boşsa gösterilecek yedek veri —
// admin panel açılana kadar site hep bu haliyle doğru görünsün diye duruyor.
const FALLBACK_SIZES = [
  { size: '13×18 cm', note: 'Küçük boy, masa üstü veya kolaj için ideal', prices: { Siyah: 280, Beyaz: 260, 'Doğal Ahşap': 320 } },
  { size: '21×30 cm', note: 'A4 formatı, en çok tercih edilen boyut', prices: { Siyah: 380, Beyaz: 360, 'Doğal Ahşap': 420 } },
  { size: '30×50 cm', note: 'Dikey panoramik, uzun kompozisyonlar için', prices: { Siyah: 580, Beyaz: 550, 'Doğal Ahşap': 640 } },
  { size: '40×50 cm', note: 'Orta boy, duvar dekorasyonu için mükemmel', prices: { Siyah: 680, Beyaz: 650, 'Doğal Ahşap': 750 } },
  { size: '50×70 cm', note: 'Büyük format, etkileyici duvar sunumu', prices: { Siyah: 980, Beyaz: 940, 'Doğal Ahşap': 1100 } },
]
const FALLBACK_SWATCH = { Siyah: '#1a1a1a', Beyaz: '#f5f4f0', 'Doğal Ahşap': '#a97c50' }
// Çerçeve detayları'ndaki renk seçenekleri her zaman bu sırada gösterilir —
// colorSwatch nesnesinin anahtar sırası Admin'in girdiği sıraya bağlı,
// istenen görsel sıra bu değil.
const COLOR_DISPLAY_ORDER = ['Beyaz', 'Doğal Ahşap', 'Siyah']

const FEATURES = [
  {
    title: 'UV korumalı cam',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      </svg>
    ),
  },
  {
    title: 'Doğal malzeme',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 4c-8 0-14 5-14 13 0 1.5 0 3 1 3s1-1.5 1-3c0-8 6-13 12-13z" />
        <path d="M7 20c2-6 6-10 12-13" />
      </svg>
    ),
  },
  {
    title: 'Hazır asma',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 6a3 3 0 116 0v2H9V6z" />
        <rect x="5" y="8" width="14" height="12" rx="1" />
      </svg>
    ),
  },
]

const heading = { fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--ink)' }
const body = { fontFamily: 'var(--font-body)', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--muted)' }
const label = { fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }

const inputStyle = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

export default function Cerceve() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', qty: '', size: '', color: '' })
  const [status, setStatus] = useState('idle') // idle | submitting | sent
  const [formError, setFormError] = useState('')

  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

  const [sizes, setSizes] = useState(FALLBACK_SIZES)
  const [colorSwatch, setColorSwatch] = useState(FALLBACK_SWATCH)
  const [content, setContent] = useState({})
  const [images, setImages] = useState({
    hero: heroImgDefault,
    'renk-secenekleri': renkSecenekleriImgDefault,
    ornekler: [
      { image_url: ornekSiyahImgDefault, alt: 'Siyah çerçeveli örnek eser' },
      { image_url: ornekAhsapImgDefault, alt: 'Koyu ahşap çerçeveli örnek eser' },
    ],
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [{ data: options }, { data: imgs }, { data: contentRows }] = await Promise.all([
        supabase.from('frame_options').select('id, size, note, sort_order, frame_option_prices(color, price, swatch_hex, sort_order)').order('sort_order'),
        supabase.from('page_images').select('*').eq('page', 'cerceve').order('sort_order').order('id'),
        supabase.from('page_content').select('section, content').eq('page', 'cerceve'),
      ])

      if (contentRows && contentRows.length) {
        const map = {}
        contentRows.forEach(row => { if (row.content) map[row.section] = row.content })
        setContent(map)
      }

      if (options && options.length) {
        const swatch = {}
        const mapped = options.map(o => {
          const prices = {}
          ;[...(o.frame_option_prices || [])].sort((a, b) => a.sort_order - b.sort_order).forEach(p => {
            prices[p.color] = p.price
            swatch[p.color] = p.swatch_hex
          })
          return { size: o.size, note: o.note, prices }
        })
        setSizes(mapped)
        setColorSwatch(swatch)
      }

      if (imgs && imgs.length) {
        setImages(prev => {
          const next = { ...prev }
          const bySection = {}
          imgs.forEach(row => { (bySection[row.section] ||= []).push(row) })
          if (bySection.hero?.[0]) next.hero = bySection.hero[0].image_url
          if (bySection['renk-secenekleri']?.[0]) next['renk-secenekleri'] = bySection['renk-secenekleri'][0].image_url
          if (bySection.ornekler?.length) next.ornekler = bySection.ornekler
          return next
        })
      }
    } catch (err) {
      console.error('Çerçeve sayfası verisi yüklenemedi:', err)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
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
    const path = `frame-order/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    const { error } = await supabase.storage.from('site-images').upload(path, file)
    if (error) {
      setUploadError('Yüklenemedi: ' + error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    setUploadedUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!uploadedUrl) { setFormError('Lütfen önce bir fotoğraf yükleyin.'); return }
    if (!form.address?.trim() || form.address.trim().length < 10) { setFormError('Geçerli bir teslimat adresi giriniz.'); return }

    setStatus('submitting')

    const payload = {
      name: form.name, email: form.email, phone: form.phone, address: form.address,
      size: form.size, color: form.color, quantity: form.qty,
      image_url: uploadedUrl, session_id: getSessionId(),
    }

    try {
      const res = await fetch('https://qrbkzjosorimiwdbwyyl.supabase.co/functions/v1/create-frame-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('idle'); setFormError(data.error || 'Sipariş gönderilemedi.'); return }
    } catch {
      setStatus('idle')
      setFormError('Sipariş gönderilemedi: bağlantı hatası.')
      return
    }

    setStatus('sent')
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero — site genelindeki diğer hero'larla (Fine Art Baskı referans) aynı boy: 58vh. */}
      <section style={{
        position: 'relative', height: '58vh', minHeight: 380,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden', background: 'var(--surface)',
      }}>
        <img
          src={images.hero}
          alt="Çerçeveli fotoğraflardan oluşan galeri duvarı"
          loading="eager" fetchPriority="high" decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(17,17,17,.1), rgba(17,17,17,.5))'
        }} />
      </section>

      {/* Çerçeve detayları (sol görsel, sağ özellik listesi + renk
          seçenekleri) ve altındaki Örnek Çerçeveli İşler galerisi — aynı
          beyaz, desensiz kapsayıcı içinde, kenarları hizalı. 1024px altında
          tek sütuna düşer. */}
      <section style={{ background: '#fff', padding: '2.5rem 2rem 3.5rem' }}>
        <style>{`
          .cerceve-wrap { max-width: 1360px; margin: 0 auto; }
          .cerceve-detay { display: grid; grid-template-columns: 56fr 44fr; gap: 48px; align-items: start; }
          .cerceve-gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
          .cerceve-gallery-img { aspect-ratio: 6 / 5; overflow: hidden; }
          @media (max-width: 1024px) {
            .cerceve-detay { grid-template-columns: 1fr; gap: 2rem; }
            .cerceve-gallery { grid-template-columns: 1fr; }
          }
        `}</style>
        <div className="cerceve-wrap">
          <div className="cerceve-detay">
            <div style={{ aspectRatio: '3 / 2', overflow: 'hidden' }}>
              <img
                src={images['renk-secenekleri']}
                alt="Siyah, beyaz ve doğal ahşap çerçeve renk seçenekleri"
                loading="lazy" decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div>
              <h2 style={{ ...heading, fontSize: '1.9rem', margin: '0 0 1.6rem' }}>Çerçeve detayları</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', marginBottom: '2.2rem' }}>
                {FEATURES.map(f => (
                  <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--ink)' }}>{f.title}</span>
                  </div>
                ))}
              </div>
              <p style={{ ...label, marginBottom: '1rem' }}>Renk seçenekleri</p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {[
                  ...COLOR_DISPLAY_ORDER.filter(c => c in colorSwatch),
                  ...Object.keys(colorSwatch).filter(c => !COLOR_DISPLAY_ORDER.includes(c)),
                ].map(color => (
                  <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem' }}>
                    <span style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: colorSwatch[color] || '#ccc',
                      border: color === 'Beyaz' ? '1px solid var(--border)' : 'none',
                      display: 'inline-block',
                    }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '.82rem', color: 'var(--muted)' }}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e5e5', margin: '2.5rem 0' }} />

          <div className="cerceve-gallery">
            {images.ornekler.map((img, i) => (
              <div key={i} className="cerceve-gallery-img">
                <img
                  src={img.image_url}
                  alt={img.alt || 'Örnek çerçeveli eser'}
                  loading="lazy" decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sipariş formu */}
      <section style={{ background: 'var(--surface)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ ...heading, fontSize: '1.6rem', textAlign: 'center', margin: '0 0 .6rem' }}>Sipariş Ver</h2>
          <p style={{ ...body, textAlign: 'center', marginBottom: '2rem' }}>
            Çerçeve siparişinizi oluşturmak için formu doldurun. En kısa sürede size dönüş yapacağız.
          </p>

          {status === 'sent' ? (
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              padding: '2rem', textAlign: 'center', ...body,
            }}>
              Siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Ad Soyad *</label>
                  <input name="name" required value={form.name} onChange={handleChange} style={inputStyle} placeholder="Adınız ve soyadınız" />
                </div>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>E-posta *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} style={inputStyle} placeholder="E-posta adresiniz" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Telefon *</label>
                  <input name="phone" type="tel" required value={form.phone} onChange={handleChange} style={inputStyle} placeholder="Telefon numaranız" />
                </div>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Adet *</label>
                  <input name="qty" type="number" min="1" required value={form.qty} onChange={handleChange} style={inputStyle} placeholder="Adet" />
                </div>
              </div>
              <div>
                <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Teslimat Adresi *</label>
                <textarea name="address" required value={form.address} onChange={handleChange} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Açık adresiniz" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Çerçeve Boyutu *</label>
                  <select name="size" required value={form.size} onChange={handleChange} style={inputStyle}>
                    <option value="">Boyut seçin</option>
                    {sizes.map(s => <option key={s.size} value={s.size}>{s.size}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Çerçeve Rengi *</label>
                  <select name="color" required value={form.color} onChange={handleChange} style={inputStyle}>
                    <option value="">Renk seçin</option>
                    {Object.keys(colorSwatch).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Fotoğraf Yükle * (maks. {MAX_FILE_SIZE_MB} MB)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]) }}
                  style={{
                    border: '1px dashed var(--border)', padding: uploadedUrl ? '1rem' : '2.5rem 1rem',
                    textAlign: 'center', ...body, fontSize: '.8rem', cursor: 'pointer',
                    minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {uploading ? (
                    <span>Yükleniyor…</span>
                  ) : uploadedUrl ? (
                    <img src={uploadedUrl} alt="Yüklenen fotoğraf önizlemesi" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <span>Fotoğrafınızı buraya sürükleyin<br />veya tıklayarak dosya seçin</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFileSelect(e.target.files[0])} />
                {uploadError && <p style={{ color: '#c33', fontSize: '.78rem', marginTop: '.5rem' }}>{uploadError}</p>}
              </div>

              {formError && <div style={{ color: '#c33', fontSize: '.78rem' }}>{formError}</div>}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  marginTop: '.5rem', padding: '.9rem', background: 'var(--accent)',
                  color: '#fff', border: 'none', fontFamily: 'var(--font-body)',
                  fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase',
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  opacity: status === 'submitting' ? .7 : 1,
                }}
              >
                {status === 'submitting' ? 'Gönderiliyor…' : 'Sipariş Gönder'}
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  )
}