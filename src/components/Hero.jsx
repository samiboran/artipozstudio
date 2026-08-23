import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/fine-art/hero.jpg'

export default function Hero() {
  const [heroUrls, setHeroUrls] = useState([heroImgDefault])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    supabase
      .from('page_images')
      .select('image_url')
      .eq('page', 'gallery')
      .eq('section', 'hero')
      .order('sort_order')
      .order('id')
      .then(({ data }) => { if (data?.length) setHeroUrls(data.map(row => row.image_url)) })
      .catch(err => console.error('Hero görselleri yüklenemedi:', err))
  }, [])

  useEffect(() => {
    if (heroUrls.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % heroUrls.length), 3000)
    return () => clearInterval(id)
  }, [heroUrls])

  return (
    <section className="hero-section" style={{
      position: 'relative', minHeight: 520,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', overflow: 'hidden', background: '#2b2f28',
    }}>
      {/* Mobil tarayıcılarda (özellikle Android/Chrome) adres çubuğu ilk
          açılışta görünürken 100vh, tarayıcı çubuğu gizliyken hesaplanan
          en büyük yüksekliği baz alıyor — bu yüzden Hero, ekranın
          gerçekte görünen kısmından daha kısa/"küçük" kalıyordu. 100dvh
          (dynamic viewport height) tarayıcı arayüzünü hesaba katıyor;
          desteklenmeyen tarayıcılarda @supports ile 100vh'ye düşüyor. */}
      <style>{`
        .hero-section { height: 100vh; }
        @supports (height: 100dvh) {
          .hero-section { height: 100dvh; }
        }
      `}</style>
      {heroUrls.map((url, i) => (
        <img
          key={url}
          src={url}
          alt="Artı Poz"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            opacity: i === index ? 1 : 0, transition: 'opacity 1s ease',
          }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.6))'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: "'Archivo', sans-serif", fontWeight: 300,
          fontSize: 'clamp(3.5rem, 11vw, 8rem)', letterSpacing: '.14em',
          textTransform: 'lowercase', color: 'var(--blue)', margin: 0,
        }}>
          artı poz
        </h1>
      </div>
    </section>
  )
}
