import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/fine-art/hero.jpg'
import kagitSecenekleriImgDefault from '../assets/fine-art/kagit-secenekleri.jpg'
import tanitimImgDefault from '../assets/fine-art/tanitim-studyo.jpg'
import ornekBotanikImgDefault from '../assets/fine-art/ornek-botanik.jpg'
import ornekBotanik2ImgDefault from '../assets/fine-art/ornek-botanik-2.jpg'
import ornekDoku1ImgDefault from '../assets/fine-art/ornek-doku-1.jpg'
import ornekDoku2ImgDefault from '../assets/fine-art/ornek-doku-2.jpg'

// Supabase'e hiç bağlanamazsa veya papers tablosu boşsa gösterilecek yedek veri.
const FALLBACK_PAPERS = [
  { no: '01', name: 'Bamboo', surface: 'Mat', gsm: '290gsm', texture: 'Pürüzsüz', color: 'Natural White', composition: '90% Bamboo fibre, 10% Cotton', description: 'Bambu liflerinden üretilen bu kağıt, doğal beyaz tonu ve mat yüzeyiyle organik bir sıcaklık sunar. Çevre dostu yapısı ve yumuşak dokusuyla doğa temalı eserler için mükemmel bir seçimdir.' },
  { no: '02', name: 'Bamboo Gloss Baryta', surface: 'Parlak', gsm: '305gsm', texture: 'Pürüzsüz', color: 'Natural White', composition: '90% Bamboo fibre, 10% Cotton', description: 'Yüksek parlak baryta yüzeyi, fotoğraflara derin siyahlar ve olağanüstü ton zenginliği katar.' },
  { no: '03', name: 'Rice Paper', surface: 'Mat', gsm: '100gsm', texture: 'Pürüzsüz', color: 'White', composition: '100% α-Cellulose', description: 'İnce ve şeffaf yapısıyla benzersiz bir hafiflik sunan pirinç kağıdı.' },
  { no: '04', name: 'Photo Rag Ultra Smooth', surface: 'Mat', gsm: '305gsm', texture: 'Pürüzsüz', color: 'White', composition: '100% Cotton', description: 'Ultra pürüzsüz yüzeyi, en ince detayları mükemmel netlikte aktarır.' },
  { no: '05', name: 'Photo Rag', surface: 'Mat', gsm: '308gsm', texture: 'Yumuşak', color: 'White', composition: '100% Cotton' },
  { no: '06', name: 'William Turner', surface: 'Mat', gsm: '190gsm', texture: 'Kabartılı', color: 'White', composition: '100% Cotton' },
  { no: '07', name: 'Albrecht Dürer', surface: 'Mat', gsm: '210gsm', texture: 'Kabartılı', color: 'White', composition: '50% Cotton, 50% α-Cellulose' },
  { no: '08', name: 'Torchon', surface: 'Mat', gsm: '285gsm', texture: 'Kabartılı', color: 'Bright White', composition: '100% α-Cellulose' },
  { no: '09', name: 'German Etching', surface: 'Mat', gsm: '310gsm', texture: 'Kabartılı', color: 'White', composition: '100% α-Cellulose' },
]

const heading = { fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--ink)' }
const eyebrow = { fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)' }
const body = { fontFamily: 'var(--font-body)', fontSize: '.92rem', lineHeight: 1.7, color: 'var(--muted)' }

export default function FineArtBaski() {
  const [papers, setPapers] = useState(FALLBACK_PAPERS)
  const [content, setContent] = useState({})
  const [images, setImages] = useState({
    hero: heroImgDefault,
    'kagit-secenekleri': kagitSecenekleriImgDefault,
    'tanitim-gorsel': tanitimImgDefault,
    ornekler: [
      { image_url: ornekBotanikImgDefault, alt: 'Botanik seri fine art baskı örneği' },
      { image_url: ornekBotanik2ImgDefault, alt: 'Botanik seri fine art baskı, detay' },
      { image_url: ornekDoku1ImgDefault, alt: 'Kağıt dokusu ve baskı örneği' },
      { image_url: ornekDoku2ImgDefault, alt: 'Kağıt dokusu ve baskı örneği' },
    ],
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [{ data: paperRows }, { data: imgs }, { data: contentRows }] = await Promise.all([
        supabase.from('papers').select('*').order('sort_order'),
        supabase.from('page_images').select('*').eq('page', 'fine-art-baski').order('sort_order').order('id'),
        supabase.from('page_content').select('section, content').eq('page', 'fine-art-baski'),
      ])

      if (contentRows && contentRows.length) {
        const map = {}
        contentRows.forEach(row => { if (row.content) map[row.section] = row.content })
        setContent(map)
      }

      if (paperRows && paperRows.length) {
        setPapers(paperRows.map((p, i) => ({
          no: String(i + 1).padStart(2, '0'),
          name: p.name, surface: p.surface, gsm: p.gsm, texture: p.texture,
          color: p.color, composition: p.composition, description: p.description,
          texturePhoto: p.texture_photo_url, previewPhoto: p.preview_photo_url,
          featured: p.featured_in_guide,
        })))
      }

      if (imgs && imgs.length) {
        setImages(prev => {
          const next = { ...prev }
          const bySection = {}
          imgs.forEach(row => { (bySection[row.section] ||= []).push(row) })
          if (bySection.hero?.[0]) next.hero = bySection.hero[0].image_url
          if (bySection['kagit-secenekleri']?.[0]) next['kagit-secenekleri'] = bySection['kagit-secenekleri'][0].image_url
          if (bySection['tanitim-gorsel']?.[0]) next['tanitim-gorsel'] = bySection['tanitim-gorsel'][0].image_url
          if (bySection.ornekler?.length) next.ornekler = bySection.ornekler
          return next
        })
      }
    } catch (err) {
      console.error('Fine Art Baskı sayfası verisi yüklenemedi:', err)
    }
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero */}
      <section style={{
        position: 'relative', height: '58vh', minHeight: 380,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden'
      }}>
        <img
          src={images.hero}
          alt="Fine art baskı hazırlığı — eldivenli ellerle siyah-beyaz baskılar"
          loading="eager" fetchPriority="high" decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(17,17,17,.15), rgba(17,17,17,.55))'
        }} />
      </section>

      {/* Tanıtım bölümü — hero'nun hemen altında, referans tasarıma göre:
          sol %51 metin (etiket + büyük başlık + açıklama + 3 özellik),
          sağ %49 stüdyo fotoğrafı + siyah etiket. Görsel Admin'den
          değiştirilebilir (section: tanitim-gorsel). */}
      <section>
        <style>{`
          .fab-intro { display: grid; grid-template-columns: 51fr 49fr; min-height: 600px; }
          .fab-intro-left { padding: 0 7vw; }
          @media (max-width: 768px) {
            .fab-intro { grid-template-columns: 1fr; min-height: 0; }
            .fab-intro-left { padding: 2.2rem 40px 1.8rem; }
            .fab-intro-title { font-size: clamp(2.3rem, 9vw, 2.7rem) !important; }
            .fab-intro-right { height: 435px; }
          }
        `}</style>
        <div className="fab-intro">
          <div className="fab-intro-left" style={{ background: '#f3efe6', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.3rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '.78rem', fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#111' }}>
                Fine Art Baskı
              </span>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e0492e', display: 'inline-block', flexShrink: 0 }} />
            </div>
            <h2 className="fab-intro-title" style={{ ...heading, fontSize: 'clamp(3.4rem, 4vw, 4.2rem)', lineHeight: 1.05, color: '#111', margin: '0 0 1.2rem' }}>
              Eseriniz için<br />arşiv kalitesinde<br />baskı.
            </h2>
            <p style={{ ...body, fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 470, color: '#333' }}>
              Renk, ton ve dokuyu en ince ayrıntısına kadar koruyan; sergileme, koleksiyon ve
              sınırlı edisyonlar için üretilen Fine Art baskılar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.9rem', marginTop: '2rem' }}>
              {['ASİTSİZ KÂĞIT', 'YÜKSEK RENK DOĞRULUĞU', 'UZUN ÖMÜR'].map((f, i) => (
                <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                  {i > 0 && <span style={{ color: '#e0492e', fontFamily: 'var(--font-body)', fontSize: '.8rem' }}>/</span>}
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', color: '#111', whiteSpace: 'nowrap' }}>{f}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="fab-intro-right" style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={images['tanitim-gorsel']}
              alt="Fine Art baskı stüdyosunda geniş format yazıcıdan çıkan renkli bir sanat eseri baskısı"
              loading="lazy" decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', left: '1.5rem', bottom: '1.5rem', background: '#111' }}>
              <span style={{
                display: 'block', padding: '.9rem 1.2rem', fontFamily: 'var(--font-body)',
                fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                color: '#fff', lineHeight: 1.5,
              }}>
                Müze ve Galeri<br />Standardında
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sertifikalı Fine Art Kağıtları — kart grid'i (WhatsApp referans tasarımı).
          Tanıtım bölümünün (kenardan kenara fotoğraf, kendi iç boşluğu yok)
          hemen altında geliyor, kendi üst/alt padding'i olduğu için ekstra
          boşluk gerekmiyor. */}
      <section style={{ background: '#111', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ ...eyebrow, color: 'rgba(255,255,255,.6)', marginBottom: '.6rem' }}>Koleksiyon</p>
            <h2 style={{ ...heading, color: '#fff', fontSize: '1.8rem', margin: 0 }}>Sertifikalı Fine Art Kağıtları</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {papers.map(p => (
              <div key={p.no}>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', marginBottom: '1rem', background: '#1a1a1a' }}>
                  {(p.previewPhoto || p.texturePhoto)
                    ? <img
                        src={p.previewPhoto || p.texturePhoto}
                        alt={`${p.name} baskı önizlemesi`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    : (
                      <div style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', textAlign: 'center', padding: '1rem',
                        fontFamily: 'var(--font-body)', fontSize: '.68rem', color: 'rgba(255,255,255,.4)',
                      }}>
                        {`${p.name} — Admin'den yükle`}
                      </div>
                    )}
                  {p.featured && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10, background: '#fff', color: '#111',
                      fontFamily: 'var(--font-body)', fontSize: '.58rem', fontWeight: 600,
                      letterSpacing: '.1em', textTransform: 'uppercase', padding: '.3rem .6rem',
                    }}>
                      Popüler
                    </span>
                  )}
                </div>
                <h3 style={{ ...heading, color: '#fff', fontSize: '1.05rem', margin: '0 0 .4rem' }}>{p.name}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '.8rem', lineHeight: 1.6,
                  color: 'rgba(255,255,255,.6)', margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {p.description || [p.gsm, p.surface].filter(Boolean).join(' · ') || 'Kağıt hakkında bilgi yakında eklenecek.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Örnek Baskılarımız — artık Sertifikalı Fine Art Kağıtları'nın
          altında (Sami'nin isteği: "kağıt seçeneklerinin altına gelsin"). */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ ...eyebrow, textAlign: 'center', marginBottom: '1.5rem' }}>Örnek Baskılarımız</p>
        {/* auto-fit yerine auto-fill — sadece 2-3 görsel yüklendiğinde
            auto-fit boş sütunları kaldırıp kalan görselleri konteynerin
            tamamına geriyordu, bu da masaüstünde fotoğrafların aşırı
            büyük görünmesine yol açıyordu. auto-fill boş sütunları
            (görünmez) yer tutucu olarak bırakıp görsellerin sabit bir
            üst boyutu aşmamasını sağlıyor. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem' }}>
          {images.ornekler.map((img, i) => (
            <div key={i} style={{ aspectRatio: '4 / 5', overflow: 'hidden' }}>
              <img
                src={img.image_url}
                alt={img.alt || 'Fine art baskı örneği'}
                loading="lazy" decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}