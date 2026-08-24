import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/process/kagit-detayi.jpg'
import sanatBaskisiImgDefault from '../assets/fine-art/kagit-secenekleri.jpg'

const heading = { fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--ink)' }
const eyebrow = {
  fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500,
  letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)',
}
const body = { fontFamily: 'var(--font-body)', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--muted)' }
const label = { fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }

const placeholderBox = (text) => (
  <div style={{
    width: '100%', height: '100%', minHeight: 220,
    background: 'var(--surface)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-body)', fontSize: '.7rem',
    letterSpacing: '.05em', color: 'var(--muted)', textAlign: 'center', padding: '1rem'
  }}>
    {text}
  </div>
)

// Fotoğraf Baskı sayfasındaki Mat/Parlak yüzeyleriyle aynı içerik — burada sabit,
// çünkü papers tablosundaki "giclee" kağıtlarından ayrı bir ürün grubu.
const SANAT_BASKISI = {
  title: 'Sanat Baskısı Kağıtlar',
  definition: 'Fotoğraflarınız için mat ve parlak yüzey seçenekleri.',
  badge: 'Günlük kullanım için ideal',
  description: 'Fotoğraf baskılarımızda iki temel yüzey seçeneği sunuyoruz: mat yüzey yumuşak, yansımasız bir görünüm verirken; parlak yüzey derin renkler ve yüksek kontrast sunar. İkisi de yüksek çözünürlükte, profesyonel fotoğraf kağıtlarına basılır.',
  details: 'Her iki yüzey de A2\'den A6\'ya kadar 5 farklı boyutta sunulur. Sipariş sırasında boy ve yüzey seçiminizi Fotoğraf Baskı sayfasından yapabilirsiniz.',
  subcards: [
    { key: 'mat', label: 'Mat', desc: 'Yumuşak, yansımasız yüzey.' },
    { key: 'parlak', label: 'Parlak', desc: 'Derin renkler, yüksek kontrast.' },
  ],
}

// "En Popüler" rozeti dışında, Giclee kağıtlarına kendi takdirimizle atadığımız kısa rozetler.
const GICLEE_BADGES = {
  'german etching': 'En Popüler',
  'rice paper': 'Hafif ve Zarif',
  bamboo: 'Doğa Dostu',
  pearl: 'Fotoğraflar İçin İdeal',
  awagami: 'Sanatsal Doku',
}

function AccordionButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '1rem',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontFamily: 'var(--font-body)', fontSize: '.72rem', letterSpacing: '.1em',
        textTransform: 'uppercase', color: 'var(--ink)',
      }}
    >
      Kağıt Detayları
      <span style={{ transition: 'transform .3s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
    </button>
  )
}

function ExploreButton({ to, children }) {
  return (
    <Link to={to} style={{
      display: 'inline-block', marginTop: '1.4rem', padding: '.7rem 1.6rem',
      border: '1px solid var(--ink)', color: 'var(--ink)',
      fontFamily: 'var(--font-body)', fontSize: '.7rem',
      letterSpacing: '.14em', textTransform: 'uppercase',
    }}>
      {children}
    </Link>
  )
}

function PaperBlock({ paper, reverse }) {
  const [open, setOpen] = useState(false)
  const img = paper.preview_photo_url || paper.texture_photo_url
  // "Fine Art Kalite" yerine tamamen Türkçe bir varsayılan kullanılıyor —
  // uppercase transform'lu <span> içinde "Fine"deki İngilizce "i" doküman
  // lang="tr" olduğu için yanlışlıkla "FİNE" olarak büyüyordu.
  const badge = GICLEE_BADGES[paper.name.toLowerCase()] || 'Yüksek Kalite'

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem',
      alignItems: 'center', marginBottom: '4rem',
    }}>
      <div style={{ order: reverse ? 2 : 1, aspectRatio: '4 / 3', overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={paper.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : placeholderBox(`${paper.name} — Admin'den yükle`)}
      </div>
      <div style={{ order: reverse ? 1 : 2 }}>
        <h3 style={{ ...heading, fontSize: '1.6rem', margin: '0 0 .6rem' }}>{paper.name}</h3>
        <p style={{ ...body, fontSize: '.82rem', marginBottom: '.9rem' }}>
          {paper.gsm || paper.surface ? [paper.gsm, paper.surface].filter(Boolean).join(' · ') : 'Fine art baskı kağıdı'}
        </p>
        <span style={{
          display: 'inline-block', padding: '.35rem .8rem', background: 'var(--surface)',
          fontFamily: 'var(--font-body)', fontSize: '.66rem', letterSpacing: '.08em',
          textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          {badge}
        </span>
        <p style={{ ...body, marginTop: '1rem' }}>
          {paper.description || 'Bu kağıt için açıklama yakında eklenecek.'}
        </p>

        <AccordionButton open={open} onClick={() => setOpen(o => !o)} />
        {open && (
          <p style={{ ...body, fontSize: '.8rem', marginTop: '.7rem' }}>
            {[
              paper.texture && `Doku: ${paper.texture}`,
              paper.color && `Renk: ${paper.color}`,
              paper.composition && `Kompozisyon: ${paper.composition}`,
            ].filter(Boolean).join(' · ') || 'Detaylı bilgi yakında eklenecek.'}
          </p>
        )}

        <div><ExploreButton to="/fine-art-baski">Bu Kağıdı İncele</ExploreButton></div>
      </div>
    </div>
  )
}

export default function KagitRehberi() {
  const [heroUrl, setHeroUrl] = useState(heroImgDefault)
  const [gicleePapers, setGicleePapers] = useState([])
  const [featuredPapers, setFeaturedPapers] = useState([])
  const [finishImages, setFinishImages] = useState({})
  const [sanatDetailsOpen, setSanatDetailsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [{ data: papers }, { data: imgs }] = await Promise.all([
        supabase.from('papers').select('*').order('sort_order'),
        supabase.from('page_images').select('section, image_url').eq('page', 'fotograf-baski').order('sort_order').order('id'),
      ])

      if (papers) {
        setGicleePapers(papers.filter(p => p.guide_category === 'giclee'))
        setFeaturedPapers(papers.filter(p => p.featured_in_guide))
      }

      if (imgs) {
        const map = {}
        imgs.forEach(row => { if (!map[row.section]) map[row.section] = row.image_url })
        setFinishImages(map)
      }
    } catch (err) {
      console.error('Kağıt Rehberi verisi yüklenemedi:', err)
    } finally {
      setLoaded(true)
    }
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero */}
      <section style={{
        position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', overflow: 'hidden', background: '#0d0f14',
      }}>
        <img src={heroUrl} alt="Fine art kağıt numuneleri" loading="eager" fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .5 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,15,20,.55), rgba(13,15,20,.85))' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 1.5rem', maxWidth: 640 }}>
          <p style={{ ...eyebrow, color: '#fff', opacity: .85, marginBottom: '1rem' }}>Her esere uygun kağıt</p>
          <h1 style={{
            fontFamily: "'Archivo Black', sans-serif", fontWeight: 700, color: '#fff',
            fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', letterSpacing: '.02em', margin: '0 0 1.2rem',
          }}>
            BASKI KAĞITLARI
          </h1>
          <p style={{ ...body, color: 'rgba(255,255,255,.82)', margin: '0 auto 1.6rem' }}>
            Doğru kağıt seçimi, bir baskının ton geçişlerini, dokusunu ve ömrünü belirler.
            Eserinize en uygun yüzeyi bulabilmeniz için kullandığımız kağıtları bir araya getirdik.
          </p>
          <ExploreButtonLight />
        </div>
      </section>

      {/* Sanat Baskısı Kağıtlar */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem 2rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem',
          alignItems: 'center', marginBottom: '3rem',
        }}>
          <div style={{ aspectRatio: '4 / 3', overflow: 'hidden' }}>
            <img src={sanatBaskisiImgDefault} alt="Sanat baskısı kağıtlar" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            <h2 style={{ ...heading, fontSize: '1.8rem', margin: '0 0 .6rem' }}>{SANAT_BASKISI.title}</h2>
            <p style={{ ...body, fontSize: '.82rem', marginBottom: '.9rem' }}>{SANAT_BASKISI.definition}</p>
            <span style={{
              display: 'inline-block', padding: '.35rem .8rem', background: 'var(--surface)',
              fontFamily: 'var(--font-body)', fontSize: '.66rem', letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--muted)',
            }}>
              {SANAT_BASKISI.badge}
            </span>
            <p style={{ ...body, marginTop: '1rem' }}>{SANAT_BASKISI.description}</p>

            <AccordionButton open={sanatDetailsOpen} onClick={() => setSanatDetailsOpen(o => !o)} />
            {sanatDetailsOpen && <p style={{ ...body, fontSize: '.8rem', marginTop: '.7rem' }}>{SANAT_BASKISI.details}</p>}

            <div><ExploreButton to="/fotograf-baski">Bu Kağıdı İncele</ExploreButton></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
          {SANAT_BASKISI.subcards.map(c => (
            <div key={c.key}>
              <div style={{ aspectRatio: '4 / 3', overflow: 'hidden' }}>
                {finishImages[`${c.key}-1`]
                  ? <img src={finishImages[`${c.key}-1`]} alt={c.label} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : placeholderBox(`${c.label} — Admin'den yükle`)}
              </div>
              <p style={{ ...eyebrow, textAlign: 'center', marginTop: '.9rem' }}>{c.label}</p>
              <p style={{ ...body, fontSize: '.78rem', textAlign: 'center' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Giclee Kağıtlar */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={eyebrow}>Giclee Kağıtlar</p>
          <h2 style={{ ...heading, fontSize: '1.8rem', margin: '.5rem 0 0' }}>Fine Art Baskı için Kağıtlarımız</h2>
        </div>

        {!loaded ? (
          <p style={{ ...body, textAlign: 'center' }}>Kağıtlar yükleniyor…</p>
        ) : gicleePapers.length === 0 ? (
          <p style={{ ...body, textAlign: 'center' }}>
            Henüz Giclee kağıdı eklenmedi — Admin → Kağıtlar'dan "Kağıt Rehberi Bölümü"nü "Giclee Kağıtlar" olarak işaretleyin.
          </p>
        ) : (
          gicleePapers.map((p, i) => <PaperBlock key={p.id} paper={p} reverse={i % 2 === 1} />)
        )}
      </section>

      {/* En Popüler Baskı Kağıtlarımız */}
      {featuredPapers.length > 0 && (
        <section style={{ padding: '3rem 0 5rem', background: 'var(--surface)' }}>
          <p style={{ ...eyebrow, textAlign: 'center', marginBottom: '2rem' }}>En Popüler Baskı Kağıtlarımız</p>
          <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', padding: '0 2rem 1rem' }}>
            {featuredPapers.map(p => {
              const img = p.preview_photo_url || p.texture_photo_url
              return (
                <div key={p.id} style={{ flex: '0 0 200px', width: 200 }}>
                  <div style={{ aspectRatio: '4 / 5', overflow: 'hidden' }}>
                    {img
                      ? <img src={img} alt={p.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : placeholderBox(p.name)}
                  </div>
                  <p style={{ ...label, textAlign: 'center', marginTop: '.7rem' }}>{p.name}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function ExploreButtonLight() {
  return (
    <Link to="/fine-art-baski" style={{
      display: 'inline-block', padding: '.85rem 2.2rem',
      border: '1px solid rgba(255,255,255,.7)', color: '#fff',
      fontFamily: "'Archivo', sans-serif", fontSize: '.72rem',
      letterSpacing: '.22em', textTransform: 'uppercase',
    }}>
      {/* Sadece "Fine" İngilizce — lang="en" kapsamı ona özel tutuluyor,
          yoksa "Git" gibi gerçek Türkçe kelimeler de (GİT değil GIT
          olarak) yanlış büyürdü. */}
      <span lang="en">Fine</span> Art Baskı'ya Git
    </Link>
  )
}
