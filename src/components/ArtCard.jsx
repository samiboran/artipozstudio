import { useState } from 'react'
import { makeSVG } from '../lib/makeSVG'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../hooks/useCart'

function ArtCard({ artwork, index, onClick, onTagClick }) {
  const { isFav, toggle } = useFavorites()
  const { addItem } = useCart()
  const liked = isFav(artwork.id)
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)

  function quickAdd(e) {
    e.stopPropagation()
    const s = artwork.sizes?.[0]
    if (!s) { onClick(); return } // boyut bilgisi yoksa ürün sayfasına götür
    addItem(artwork, s.label, Number(s.price) || 0)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: hovered ? 'var(--surface)' : 'var(--bg)',
        transition: 'background .2s',
        animation: `fadeUp .4s ease ${index * 0.04}s both`
      }}
    >
   {/* Görsel */}
<div style={{ aspectRatio: '4/5', overflow: 'hidden', position: 'relative', background: 'var(--surface)' }}>
  {artwork.image_url
    ? <img src={artwork.image_url} alt={artwork.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <div dangerouslySetInnerHTML={{ __html: makeSVG(index) }}
        style={{ width: '100%', height: '100%' }} />
  }
        {/* Edisyon badge */}
        <div style={{
          position: 'absolute', top: '.75rem', left: '.75rem',
          background: 'var(--ink)', color: '#fff',
          fontSize: '.52rem', letterSpacing: '.18em',
          textTransform: 'uppercase', padding: '.22rem .6rem'
        }}>
          {artwork.edition}
        </div>

        {/* Favori butonu */}
        <button
          onClick={e => { e.stopPropagation(); toggle(artwork.id) }}
          style={{
            position: 'absolute', top: '.65rem', right: '.65rem',
            background: 'rgba(255,255,255,.88)',
            border: `1px solid ${liked ? 'var(--red)' : 'var(--border)'}`,
            width: 30, height: 30,
            display: hovered || liked ? 'flex' : 'none',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '.9rem', color: liked ? 'var(--red)' : 'var(--muted)',
            cursor: 'pointer'
          }}
        >
          {liked ? '♥' : '♡'}
        </button>

        {/* Hızlı sepete ekle */}
        <button
          onClick={quickAdd}
          aria-label="Sepete ekle"
          style={{
            position: 'absolute', top: 'calc(.65rem + 36px)', right: '.65rem',
            background: added ? 'var(--gold)' : 'rgba(255,255,255,.88)',
            border: `1px solid ${added ? 'var(--gold)' : 'var(--border)'}`,
            width: 30, height: 30,
            display: hovered || added ? 'flex' : 'none',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '.85rem', color: added ? '#fff' : 'var(--muted)',
            cursor: 'pointer', transition: 'background .2s'
          }}
        >
          {added ? '✓' : '+'}
        </button>
      </div>

      {/* Bilgi */}
      <div style={{ padding: '.85rem 1rem 1rem' }}>
        <div style={{ fontSize: '.58rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.2rem' }}>
          {artwork.artist}
        </div>
        <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.15rem', marginBottom: '.45rem', lineHeight: 1.2 }}>
          {artwork.title}
        </div>

        {/* Etiketler */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '.7rem' }}>
          {artwork.tags.map(tag => (
            <span
              key={tag}
              onClick={e => { e.stopPropagation(); onTagClick(tag) }}
              style={{
                fontSize: '.56rem', letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--gold)',
                padding: '.18rem .45rem',
                border: '1px solid rgba(18,42,150,.22)',
                cursor: 'pointer'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.25rem' }}>
            {artwork.price}
          </div>
          <div style={{ fontSize: '.58rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {artwork.type}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtCard