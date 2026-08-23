import { useState } from 'react'
import { makeSVG } from '../lib/makeSVG'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../hooks/useCart'
import { SIZE_MM } from '../lib/artworks'

function ArtCard({ artwork, index, onClick }) {
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

  const firstSize = artwork.sizes?.[0]
  const priceLabel = firstSize?.price ? `${Number(firstSize.price).toLocaleString('tr-TR')} TL` : null
  const sizeLabel = firstSize ? (SIZE_MM[firstSize.label] || firstSize.label) : null
  const titleLine = artwork.type ? `${artwork.title} / ${artwork.type}` : artwork.title

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        breakInside: 'avoid',
        marginBottom: '1.8rem',
        background: hovered ? 'var(--surface)' : 'var(--bg)',
        transition: 'background .2s',
        animation: `fadeUp .4s ease ${index * 0.04}s both`
      }}
    >
      {/* Görsel — gerçek fotoğraflarda kendi en/boy oranı korunur (masonry) */}
      <div style={{
        overflow: 'hidden', position: 'relative', background: 'var(--surface)',
        ...(artwork.image_url ? {} : { aspectRatio: '4/5' }),
      }}>
        {artwork.image_url
          ? <img src={artwork.image_url} alt={artwork.title}
              style={{ width: '100%', height: 'auto', display: 'block' }} />
          : <div dangerouslySetInnerHTML={{ __html: makeSVG(index) }}
              style={{ width: '100%', height: '100%' }} />
        }
        {/* Edisyon badge */}
        {artwork.edition && (
          <div style={{
            position: 'absolute', top: '.75rem', left: '.75rem',
            background: 'var(--ink)', color: '#fff',
            fontSize: '.52rem', letterSpacing: '.18em',
            textTransform: 'uppercase', padding: '.22rem .6rem'
          }}>
            {artwork.edition}
          </div>
        )}

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

      {/* Bilgi — Fiyat / Başlık / Malzeme / Ölçü */}
      <div style={{ padding: '.85rem .2rem 0' }}>
        {priceLabel && (
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1rem', marginBottom: '.35rem' }}>
            {priceLabel}
          </div>
        )}
        <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, marginBottom: '.25rem' }}>
          {titleLine}
        </div>
        {artwork.material && (
          <div style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.4, marginBottom: '.15rem' }}>
            {artwork.material}
          </div>
        )}
        {sizeLabel && (
          <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>
            {sizeLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtCard
