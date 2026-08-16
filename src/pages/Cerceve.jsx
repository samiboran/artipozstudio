import { useState } from 'react'
import heroImg from '../assets/cerceve/hero.jpg'
import renkSecenekleriImg from '../assets/cerceve/renk-secenekleri.jpg'
import renkDetayImg from '../assets/cerceve/renk-secenekleri-detay.jpg'
import ornekSiyahImg from '../assets/cerceve/ornek-siyah-cerceve.jpg'
import ornekAhsapImg from '../assets/cerceve/ornek-ahsap-cerceve.jpg'

// TODO: form şu an sadece arayüz — gönderim henüz bir backend'e bağlı değil.
// Checkout'ta yaptığımız gibi (Supabase edge function + Resend) bağlamamız gerekiyor.

const SIZES = [
  {
    size: '13×18 cm',
    note: 'Küçük boy, masa üstü veya kolaj için ideal',
    prices: { Siyah: 280, Beyaz: 260, 'Doğal Ahşap': 320 },
  },
  {
    size: '21×30 cm',
    note: 'A4 formatı, en çok tercih edilen boyut',
    prices: { Siyah: 380, Beyaz: 360, 'Doğal Ahşap': 420 },
  },
  {
    size: '30×50 cm',
    note: 'Dikey panoramik, uzun kompozisyonlar için',
    prices: { Siyah: 580, Beyaz: 550, 'Doğal Ahşap': 640 },
  },
  {
    size: '40×50 cm',
    note: 'Orta boy, duvar dekorasyonu için mükemmel',
    prices: { Siyah: 680, Beyaz: 650, 'Doğal Ahşap': 750 },
  },
  {
    size: '50×70 cm',
    note: 'Büyük format, etkileyici duvar sunumu',
    prices: { Siyah: 980, Beyaz: 940, 'Doğal Ahşap': 1100 },
  },
]

const COLOR_SWATCH = { Siyah: '#1a1a1a', Beyaz: '#f5f4f0', 'Doğal Ahşap': '#a97c50' }

const FEATURES = [
  {
    title: 'UV Korumalı Cam',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      </svg>
    ),
  },
  {
    title: 'Doğal Malzeme',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 4c-8 0-14 5-14 13 0 1.5 0 3 1 3s1-1.5 1-3c0-8 6-13 12-13z" />
        <path d="M7 20c2-6 6-10 12-13" />
      </svg>
    ),
  },
  {
    title: 'Hazır Asma',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 6a3 3 0 116 0v2H9V6z" />
        <rect x="5" y="8" width="14" height="12" rx="1" />
      </svg>
    ),
  },
  {
    title: '3 Renk Seçeneği',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="8" r="1.4" fill="currentColor" />
        <circle cx="9" cy="14" r="1.4" fill="currentColor" />
        <circle cx="15" cy="14" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
]

const heading = { fontFamily: "'Archivo Black', sans-serif", fontWeight: 400, color: 'var(--ink)' }
const eyebrow = {
  fontFamily: "'Archivo', sans-serif", fontSize: '.72rem', fontWeight: 500,
  letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)',
}
const body = { fontFamily: "'Archivo', sans-serif", fontSize: '.9rem', lineHeight: 1.7, color: 'var(--muted)' }
const label = { fontFamily: "'Archivo', sans-serif", fontSize: '.72rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }

const inputStyle = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

export default function Cerceve() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', qty: '', size: '', color: '',
  })
  const [status, setStatus] = useState('idle') // idle | submitting | sent

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: gerçek gönderim henüz bağlı değil — checkout'taki create-order
    // fonksiyonuna benzer bir edge function kuralım
    setStatus('sent')
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero */}
      <section style={{
        position: 'relative', height: '52vh', minHeight: 340,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden', background: 'var(--surface)',
      }}>
        <img
          src={heroImg}
          alt="Çerçeveli fotoğraflardan oluşan galeri duvarı"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(17,17,17,.1), rgba(17,17,17,.5))'
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
          <h1 style={{ ...heading, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', margin: '0 0 1rem' }}>
            Çerçeve
          </h1>
          <p style={{ ...body, color: 'rgba(255,255,255,.9)', maxWidth: 520, margin: '0 auto' }}>
            Fotoğraflarınızı kalıcı kılın. Siyah, beyaz ve doğal ahşap çerçeve
            seçenekleriyle anılarınızı sanat eserine dönüştürün.
          </p>
        </div>
      </section>

      {/* Özellikler */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              border: '1px solid var(--border)', padding: '1.8rem 1rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.8rem',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--accent)' }}>{f.icon}</div>
              <p style={label}>{f.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Renk seçenekleri */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 1rem' }}>
        <img
          src={renkSecenekleriImg}
          alt="Siyah, beyaz ve doğal ahşap çerçeve renk seçenekleri"
          style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '1rem' }}
        />
        <img
          src={renkDetayImg}
          alt="Ahşap çerçeve köşe detayı"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </section>

      {/* Örnek çerçeveli işler */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 1rem' }}>
        <p style={{ ...eyebrow, textAlign: 'center', marginBottom: '1.5rem' }}>Örnek Çerçeveli İşler</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <img src={ornekSiyahImg} alt="Siyah çerçeveli örnek eser" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <img src={ornekAhsapImg} alt="Koyu ahşap çerçeveli örnek eser" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* Boy / renk / fiyat tablosu */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem 2rem 3.5rem' }}>
        <p style={{ ...body, fontSize: '.78rem', textAlign: 'center', marginBottom: '2rem' }}>
          Tüm çerçeveler UV korumalı cam ve hazır asma aparatıyla teslim edilir.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s.size} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
              <h3 style={{ ...heading, fontSize: '1.1rem', margin: '0 0 .3rem' }}>{s.size}</h3>
              <p style={{ ...body, fontSize: '.78rem', marginBottom: '1rem' }}>{s.note}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.2rem' }}>
                {Object.entries(s.prices).map(([color, price]) => (
                  <div key={color} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', ...body, fontSize: '.85rem' }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: COLOR_SWATCH[color],
                        border: color === 'Beyaz' ? '1px solid var(--border)' : 'none',
                        display: 'inline-block',
                      }} />
                      {color}
                    </span>
                    <span style={{ ...label, color: 'var(--ink)' }}>{price.toLocaleString('tr-TR')} TL</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, size: s.size }))}
                style={{
                  width: '100%', padding: '.8rem', background: 'none',
                  border: '1px solid var(--ink)', color: 'var(--ink)',
                  fontFamily: "'Archivo', sans-serif", fontSize: '.72rem',
                  letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                Sipariş Ver
              </button>
            </div>
          ))}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Ad Soyad *</label>
                  <input name="name" required value={form.name} onChange={handleChange} style={inputStyle} placeholder="Adınız ve soyadınız" />
                </div>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>E-posta *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} style={inputStyle} placeholder="E-posta adresiniz" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Telefon *</label>
                  <input name="phone" type="tel" required value={form.phone} onChange={handleChange} style={inputStyle} placeholder="Telefon numaranız" />
                </div>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Adet *</label>
                  <input name="qty" type="number" min="1" required value={form.qty} onChange={handleChange} style={inputStyle} placeholder="Adet" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Çerçeve Boyutu *</label>
                  <select name="size" required value={form.size} onChange={handleChange} style={inputStyle}>
                    <option value="">Boyut seçin</option>
                    {SIZES.map(s => <option key={s.size} value={s.size}>{s.size}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Çerçeve Rengi *</label>
                  <select name="color" required value={form.color} onChange={handleChange} style={inputStyle}>
                    <option value="">Renk seçin</option>
                    {Object.keys(COLOR_SWATCH).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Fotoğraf Yükle * (JPG, PNG, WEBP — maks. 10 MB)</label>
                <div style={{
                  border: '1px dashed var(--border)', padding: '2.5rem 1rem',
                  textAlign: 'center', ...body, fontSize: '.8rem',
                }}>
                  Fotoğrafınızı buraya sürükleyin<br />veya tıklayarak dosya seçin
                </div>
              </div>
              <button
                type="submit"
                style={{
                  marginTop: '.5rem', padding: '.9rem', background: 'var(--accent)',
                  color: '#fff', border: 'none', fontFamily: "'Archivo', sans-serif",
                  fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Sipariş Gönder
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  )
}