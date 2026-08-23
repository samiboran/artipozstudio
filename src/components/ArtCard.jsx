import { useState } from 'react'
import { makeSVG } from '../lib/makeSVG'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../hooks/useCart'
import { SIZE_MM } from '../lib/artworks'

function ArtCard({ artwork, index, onClick }) {
  const { isFav, toggle } = useFavorites()
  const { addItem } = useCart()
  const liked = isFav(artwork.id)
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

  const iconBtn = {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, fontSize: '1rem',
  }

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        breakInside: 'avoid',
        marginBottom: '1.8rem',
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
      </div>

      {/* Bilgi — İkonlar / Fiyat / Başlık / Malzeme / Ölçü */}
      <div style={{ padding: '.6rem .2rem 0' }}>
        {/* Favori + sepete ekle — her zaman görünür, fiyattan önce (mobilde
            hover olmadığı için önceki hover-only overlay butonları görünmüyordu) */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.4rem' }}>
          <button
            onClick={e => { e.stopPropagation(); toggle(artwork.id) }}
            aria-label="Favorilere ekle"
            style={{ ...iconBtn, color: liked ? 'var(--red)' : 'var(--muted)' }}
          >
            {liked ? '♥' : '♡'}
          </button>
          <button
            onClick={quickAdd}
            aria-label="Sepete ekle"
            style={{ ...iconBtn, fontSize: '1.05rem', color: added ? 'var(--gold)' : 'var(--muted)' }}
          >
            {added ? '✓' : '⊕'}
          </button>
        </div>

        {priceLabel && (
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 500, fontSize: '.82rem', color: 'var(--ink)', marginBottom: '.3rem' }}>
            {priceLabel}
          </div>
        )}
        <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.78rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, marginBottom: '.2rem' }}>
          {titleLine}
        </div>
        {artwork.material && (
          <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.4, marginBottom: '.1rem' }}>
            {artwork.material}
          </div>
        )}
        {sizeLabel && (
          <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.7rem', color: 'var(--muted)' }}>
            {sizeLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtCard
