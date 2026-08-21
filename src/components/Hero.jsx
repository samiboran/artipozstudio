import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/fine-art/hero.jpg'

export default function Hero() {
  const [heroUrl, setHeroUrl] = useState(heroImgDefault)

  useEffect(() => {
    supabase
      .from('page_images')
      .select('image_url')
      .eq('page', 'gallery')
      .eq('section', 'hero')
      .order('sort_order')
      .order('id')
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setHeroUrl(data[0].image_url) })
      .catch(err => console.error('Hero görseli yüklenemedi:', err))
  }, [])

  return (
    <section style={{
      position: 'relative', height: '100vh', minHeight: 520,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', overflow: 'hidden', background: '#2b2f28',
    }}>
      <img
        src={heroUrl}
        alt="Artı Poz"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

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

        <Link to="/fine-art-baski" style={{
          display: 'inline-block', marginTop: '2.5rem',
          padding: '.85rem 2.2rem', border: '1px solid rgba(255,255,255,.7)',
          color: '#fff', fontFamily: "'Archivo', sans-serif",
          fontSize: '.72rem', letterSpacing: '.22em', textTransform: 'uppercase',
        }}>
          Sipariş
        </Link>
      </div>
    </section>
  )
}