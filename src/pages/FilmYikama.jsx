import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { HERO_OVERLAY_GRADIENT } from '../lib/heroOverlay'
import heroImgDefault from '../assets/film-yikama/hero.jpg'
import adim01ImgDefault from '../assets/film-yikama/adim-01-teslim.jpg'
import adim02ImgDefault from '../assets/film-yikama/adim-02-yikama-tarama.jpg'
import adim03ImgDefault from '../assets/film-yikama/adim-03-karelerinize.jpg'
import galeri1ImgDefault from '../assets/film-yikama/galeri-1.jpg'
import galeri2ImgDefault from '../assets/film-yikama/galeri-2.jpg'
import galeri3ImgDefault from '../assets/film-yikama/galeri-3.jpg'
import galeri4ImgDefault from '../assets/film-yikama/galeri-4.jpg'

const HIZMET_OPTIONS = ['Yıkama + Tarama', 'Yalnızca Yıkama', 'Yalnızca Tarama']

const STEPS = [
  {
    no: '01', title: 'Filminizi teslim edin', imgKey: 'adim-01',
    text: 'Çekimi tamamlanmış filmlerinizi atölyemize getirebilirsiniz. Yıkama yapılmamış filmleri kasetinden çıkarmadan, ışık almayacak şekilde teslim edin. Film türünüze uygun işlem, fiyat ve teslim süresi için öncesinde bizimle iletişime geçin.',
  },
  {
    no: '02', title: 'Yıkayalım, tarayalım', imgKey: 'adim-02',
    text: 'Filmlerinizin yıkama ve tarama işlemlerini gerçekleştiriyoruz. Daha önce yıkanmış negatifleriniz için yalnızca tarama hizmetimizden de yararlanabilirsiniz.',
  },
  {
    no: '03', title: 'Karelerinize ulaşın', imgKey: 'adim-03',
    text: 'Taramalarınızı dijital indirme bağlantısıyla sizinle paylaşıyoruz. Negatiflerinizi işlem tamamlandığında atölyemizden geri alabilirsiniz.',
  },
]

const heading = { fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--ink)' }
const eyebrow = {
  fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500,
  letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)',
}
const body = { fontFamily: 'var(--font-body)', fontSize: '.92rem', lineHeight: 1.7, color: 'var(--muted)' }
const label = { fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }

const inputStyle = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

const placeholderBox = (text) => (
  <div style={{
    width: '100%', height: '100%', minHeight: 200,
    background: 'var(--surface)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-body)', fontSize: '.68rem',
    letterSpacing: '.05em', color: 'var(--muted)', textAlign: 'center', padding: '1rem'
  }}>
    {text}
  </div>
)

export default function FilmYikama() {
  const [images, setImages] = useState({
    hero: heroImgDefault,
    'adim-01': adim01ImgDefault,
    'adim-02': adim02ImgDefault,
    'adim-03': adim03ImgDefault,
    galeri: [
      { image_url: adim01ImgDefault, alt: 'Filmin ışık almayacak şekilde tüpe yerleştirilmesi' },
      { image_url: galeri1ImgDefault, alt: 'Negatif üzerinde deniz feneri karesi, yakın çekim' },
      { image_url: galeri2ImgDefault, alt: 'Tarama masası — ışık kutusu ve kopyalama standı' },
      { image_url: adim02ImgDefault, alt: 'Kırmızı ışıklı film tarama cihazı' },
      { image_url: adim03ImgDefault, alt: 'Negatifin kesilip bantlanması' },
      { image_url: galeri3ImgDefault, alt: 'Kontakt baskı, üzerinde büyüteç' },
      { image_url: galeri4ImgDefault, alt: 'Dağınık negatif şeritleri, renkli kareler' },
    ],
  })
  const [content, setContent] = useState({})

  const [modalOpen, setModalOpen] = useState(false)
  const [formStep, setFormStep] = useState('form') // form | sent
  const [form, setForm] = useState({
    isim: '', telefon: '', email: '', hizmet: HIZMET_OPTIONS[0],
    filmAdedi: 1, filmTuru: '', notunuz: '',
  })
  const [status, setStatus] = useState('idle') // idle | submitting
  const [error, setError] = useState('')
  const firstFieldRef = useRef()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [{ data: imgs }, { data: contentRows }] = await Promise.all([
        supabase.from('page_images').select('*').eq('page', 'film-yikama').order('sort_order').order('id'),
        supabase.from('page_content').select('section, content').eq('page', 'film-yikama'),
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
          ;['hero', 'adim-01', 'adim-02', 'adim-03'].forEach(section => {
            if (bySection[section]?.[0]) next[section] = bySection[section][0].image_url
          })
          if (bySection.galeri?.length) next.galeri = bySection.galeri
          return next
        })
      }
    } catch (err) {
      console.error('Film Yıkama & Tarama sayfası verisi yüklenemedi:', err)
    }
  }

  function openModal() {
    setFormStep('form')
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function updateForm(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function submitForm(e) {
    e.preventDefault()
    if (!form.isim.trim()) { setError('Ad soyad gerekli.'); return }
    if (!form.telefon.trim() && !form.email.trim()) { setError('Telefon veya e-posta adresinizden birini giriniz.'); return }
    if (form.email.trim() && !form.email.includes('@')) { setError('Geçerli bir e-posta adresi giriniz.'); return }

    setStatus('submitting')
    setError('')

    const payload = {
      isim: form.isim,
      telefon: form.telefon,
      email: form.email,
      hizmet: form.hizmet,
      filmAdedi: form.filmAdedi,
      filmTuru: form.filmTuru,
      notunuz: form.notunuz,
      session_id: getSessionId(),
    }

    try {
      const res = await fetch('https://qrbkzjosorimiwdbwyyl.supabase.co/functions/v1/create-film-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('idle'); setError(data.error || 'Talep gönderilemedi.'); return }
    } catch {
      setStatus('idle')
      setError('Talep gönderilemedi: bağlantı hatası.')
      return
    }

    setStatus('idle')
    setFormStep('sent')
  }

  function resetAndClose() {
    setModalOpen(false)
    setForm({ isim: '', telefon: '', email: '', hizmet: HIZMET_OPTIONS[0], filmAdedi: 1, filmTuru: '', notunuz: '' })
    setFormStep('form')
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero — site genelindeki diğer hero'larla aynı boy: 58vh, sadece görsel. */}
      <section style={{
        position: 'relative', height: '58vh', minHeight: 380,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden'
      }}>
        <img
          src={images.hero}
          alt="Film yıkama ve tarama atölyesi — tank, makara, negatif ve tarayıcı"
          loading="eager" fetchPriority="high" decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: HERO_OVERLAY_GRADIENT }} />
      </section>

      {/* Başlık + açıklama — 2 sütun. maxWidth aşağıdaki adım/CTA/galeri
          bölümleriyle aynı (1300px) — hepsi aynı sol/sağ kenara hizalı
          olsun diye (önceden bu bölüm 1200px'di, alttaki 1300px, kenarlar
          hizasızdı). */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '2.25rem 2rem 1.75rem' }}>
        <style>{`
          .fy-intro { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
          @media (max-width: 700px) {
            .fy-intro { grid-template-columns: 1fr; gap: 1.2rem; }
          }
        `}</style>
        <div className="fy-intro">
          <h1 style={{ ...heading, fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: 0, lineHeight: 1.15 }}>
            Film Yıkama<br />&amp; Tarama
          </h1>
          <p style={body}>
            {content['intro-aciklama'] || 'Analog filmlerinizi özenle yıkıyor, karelerinizi yüksek çözünürlüklü taramalarla dijitale aktarıyoruz. Filmin kendine özgü dokusunu ve tonlarını gözeterek fotoğraflarınızı arşivlemeye, paylaşmaya ve baskıya hazırlıyoruz.'}
          </p>
        </div>
      </section>

      {/* 01 / 02 / 03 — üç eşit sütun, hepsi aynı düzende (referans tasarıma
          göre: zigzag değil, yan yana 3 sütun). */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem 1rem' }}>
        <style>{`
          .fy-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
          .fy-step-img { aspect-ratio: 4 / 3; overflow: hidden; margin-bottom: 1.3rem; }
          @media (max-width: 900px) {
            .fy-steps { grid-template-columns: 1fr; gap: 2rem; }
          }
        `}</style>
        <div className="fy-steps">
          {STEPS.map(s => (
            <div key={s.no}>
              <div className="fy-step-img">
                {images[s.imgKey]
                  ? <img src={images[s.imgKey]} alt={s.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : placeholderBox(`${s.title} — Admin'den yükle`)}
              </div>
              <p style={{ ...eyebrow, marginBottom: '.6rem' }}>{s.no} —</p>
              <h2 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 .7rem' }}>{s.title}</h2>
              <p style={body}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dijitalden kâğıda — CTA: başlık + açıklama + buton aynı satırda
          (referans tasarıma göre), buton tam genişlik bir şerit değil. */}
      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '1.5rem 2rem 2.25rem' }}>
        <style>{`
          .fy-cta-row { display: flex; align-items: center; justify-content: space-between; gap: 2.5rem; }
          .fy-cta-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1.2rem; max-width: 460px; }
          .fy-cta-right p { text-align: right; }
          @media (max-width: 900px) {
            .fy-cta-row { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
            .fy-cta-right { align-items: flex-start; max-width: none; }
            .fy-cta-right p { text-align: left; }
            .fy-cta-right button { width: 100%; justify-content: center; }
          }
        `}</style>
        <div className="fy-cta-row">
          <h2 style={{ ...heading, fontSize: '1.6rem', margin: 0, flexShrink: 0 }}>Dijitalden kâğıda.</h2>
          <div className="fy-cta-right">
            <p style={body}>
              Dilerseniz seçtiğiniz kareleri fotoğraf veya fine art baskıyla tamamlayabilirsiniz.
              Baskı hizmeti ayrıca ücretlendirilir.
            </p>
            <button
              type="button" onClick={openModal}
              style={{
                flexShrink: 0, padding: '1.1rem 1.8rem', background: 'var(--ink)', color: '#fff',
                border: 'none', fontFamily: 'var(--font-body)', fontSize: '.85rem',
                letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: '.6rem',
                whiteSpace: 'nowrap', cursor: 'pointer',
              }}
            >
              Film Yıkama &amp; Tarama İçin İletişime Geçin
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Galeri — auto-fill: sabit 4 sütun yerine, kaç görsel varsa ona göre
          dizilir (Fine Art Baskı "Örnek Baskılarımız" ile aynı desen) —
          eksik satır kalırsa boş görünmez sütunlarla dolduruluyor. */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem 4.5rem' }}>
        <style>{`
          .fy-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
          @media (max-width: 700px) {
            .fy-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; }
          }
        `}</style>
        <div className="fy-gallery">
          {images.galeri.map((img, i) => (
            <div key={i} style={{ aspectRatio: '4 / 5', overflow: 'hidden' }}>
              <img
                src={img.image_url}
                alt={img.alt || 'Film yıkama ve tarama atölyesinden kareler'}
                loading="lazy" decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Talep formu modal'ı */}
      {modalOpen && (
        <div
          role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) (formStep === 'sent' ? resetAndClose() : closeModal()) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(17,17,17,.6)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.2rem',
          }}
        >
          <div style={{
            background: '#fff', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
            padding: '2.2rem', position: 'relative',
          }}>
            <button
              type="button" onClick={formStep === 'sent' ? resetAndClose : closeModal} aria-label="Kapat"
              style={{
                position: 'absolute', top: '1.4rem', right: '1.4rem', width: 30, height: 30,
                border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--ink)',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {formStep === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                  fontSize: '1.4rem',
                }}>
                  ✓
                </div>
                <h3 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 .8rem' }}>Talebinizi aldık.</h3>
                <p style={{ ...body, marginBottom: '1.8rem' }}>
                  Fiyat, işlem detayları ve filmlerinizi teslim etmeniz için sizinle iletişime geçeceğiz.
                </p>
                <button
                  type="button" onClick={resetAndClose}
                  style={{
                    padding: '.9rem 2rem', background: 'var(--ink)', color: '#fff', border: 'none',
                    fontFamily: 'var(--font-body)', fontSize: '.75rem', letterSpacing: '.14em',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ ...heading, fontSize: '1.35rem', margin: '0 0 .5rem' }}>Film Yıkama &amp; Tarama Talebi</h3>
                <p style={{ ...body, fontSize: '.85rem', marginBottom: '1.6rem' }}>
                  Filminizden bahsedin, detayları birlikte netleştirelim.
                </p>
                <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Ad Soyad</label>
                    <input ref={firstFieldRef} name="isim" value={form.isim} onChange={updateForm} style={inputStyle} placeholder="Adınız ve soyadınız" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Telefon</label>
                      <input name="telefon" type="tel" value={form.telefon} onChange={updateForm} style={inputStyle} placeholder="Telefon numaranız" />
                    </div>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>E-posta</label>
                      <input name="email" type="email" value={form.email} onChange={updateForm} style={inputStyle} placeholder="E-posta adresiniz" />
                    </div>
                  </div>
                  <p style={{ ...body, fontSize: '.72rem', margin: '-.5rem 0 0' }}>
                    Size ulaşabilmemiz için birini doldurmanız yeterli.
                  </p>

                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.5rem' }}>Hizmet Seçimi</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
                      {HIZMET_OPTIONS.map(h => (
                        <button key={h} type="button" onClick={() => setForm(f => ({ ...f, hizmet: h }))} style={{
                          padding: '.55rem 1rem', border: `1px solid ${form.hizmet === h ? 'var(--ink)' : 'var(--border)'}`,
                          background: form.hizmet === h ? 'var(--ink)' : 'none', color: form.hizmet === h ? '#fff' : 'var(--ink)',
                          fontFamily: 'var(--font-body)', fontSize: '.78rem', cursor: 'pointer',
                        }}>
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.5rem' }}>Film Adedi</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                        <button type="button" onClick={() => setForm(f => ({ ...f, filmAdedi: Math.max(1, (Number(f.filmAdedi) || 1) - 1) }))} style={{
                          width: 32, height: 32, border: '1px solid var(--border)', background: '#fff',
                          fontSize: '1rem', color: 'var(--ink)', cursor: 'pointer', lineHeight: 1,
                        }}>−</button>
                        <span style={{ ...label, color: 'var(--ink)', minWidth: 24, textAlign: 'center' }}>{form.filmAdedi}</span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, filmAdedi: Math.min(100, (Number(f.filmAdedi) || 1) + 1) }))} style={{
                          width: 32, height: 32, border: '1px solid var(--border)', background: '#fff',
                          fontSize: '1rem', color: 'var(--ink)', cursor: 'pointer', lineHeight: 1,
                        }}>+</button>
                      </div>
                    </div>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Film Türü / Formatı <span style={{ textTransform: 'none', fontWeight: 400 }}>(isteğe bağlı)</span></label>
                      <input name="filmTuru" value={form.filmTuru} onChange={updateForm} style={inputStyle} placeholder="Örn. 35 mm renkli" />
                    </div>
                  </div>
                  <p style={{ ...body, fontSize: '.72rem', margin: '-.5rem 0 0' }}>Bilmiyorsanız boş bırakabilirsiniz.</p>

                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Notunuz <span style={{ textTransform: 'none', fontWeight: 400 }}>(isteğe bağlı)</span></label>
                    <textarea name="notunuz" maxLength={500} value={form.notunuz} onChange={updateForm} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Talebinizle ilgili eklemek istedikleriniz…" />
                  </div>

                  <p style={{ ...body, fontSize: '.72rem' }}>
                    Film türünüz ve talebinize göre fiyat ve teslim süresi hakkında sizinle iletişime geçeceğiz.
                    Filmlerinizi atölyeye getirmeden önce bizden yanıt bekleyin.
                  </p>

                  {error && <div style={{ color: '#c33', fontSize: '.78rem' }}>{error}</div>}

                  <button
                    type="submit" disabled={status === 'submitting'}
                    style={{
                      width: '100%', padding: '1rem', background: 'var(--ink)', color: '#fff',
                      border: 'none', fontFamily: 'var(--font-body)', fontSize: '.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
                      cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                      opacity: status === 'submitting' ? .7 : 1,
                    }}
                  >
                    {status === 'submitting' ? 'Gönderiliyor…' : (<>Talebi Gönder <span aria-hidden="true">→</span></>)}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
