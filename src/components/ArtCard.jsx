import { useState } from 'react'
import { makeSVG } from '../lib/makeSVG'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../hooks/useCart'
import { SIZE_MM } from '../lib/artworks'

function ArtCard({ artwork, index, onClick, noBottomGap = false }) {
  const { isFav, toggle } = useFavorites()
  const { addItem } = useCart()
  const liked = isFav(artwork.id)
  const [added, setAdded] = useState(false)
  const [favShake, setFavShake] = useState(false)
  const [cartShake, setCartShake] = useState(false)

  // Giriş yapılmamışsa toggle/addItem hiçbir şey yapmaz (false döner) —
  // butonun yine de tepki verdiğini göstermek için kısa bir sallanma.
  async function handleFav(e) {
    e.stopPropagation()
    const ok = await toggle(artwork.id)
    if (!ok) { setFavShake(true); setTimeout(() => setFavShake(false), 500) }
  }

  function quickAdd(e) {
    e.stopPropagation()
    const s = artwork.sizes?.[0]
    if (!s) { onClick(); return } // boyut bilgisi yoksa ürün sayfasına götür
    const ok = addItem(artwork, s.label, Number(s.price) || 0)
    if (!ok) { setCartShake(true); setTimeout(() => setCartShake(false), 500); return }
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const firstSize = artwork.sizes?.[0]
  const priceLabel = firstSize?.price ? `${Number(firstSize.price).toLocaleString('tr-TR')} TL` : null
  const sizeLabel = firstSize ? (SIZE_MM[firstSize.label] || firstSize.label) : null
  const titleLine = artwork.type ? `${artwork.title} / ${artwork.type}` : artwork.title

  // justifyContent 'center' glifi 26px'lik kutunun ortasına alıyordu, bu da
  // altındaki fiyat/isim/ölçü metniyle (aynı .2rem sol padding'i paylaşıyor)
  // aynı hizada durmasını engelliyordu — 'flex-start' ile glif kutunun sol
  // kenarına, metinle aynı hizaya yaslanıyor.
  const iconBtn = {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
    width: 26, height: 26, fontSize: '1rem',
  }

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        breakInside: 'avoid',
        marginBottom: noBottomGap ? 0 : '1.8rem',
      }}
    >
      {/* Görsel — sabit 4/5 oranlı kutuya kırpılıyor (bazı yüklenen eser
          fotoğrafları, ör. büyük boş zeminli/mekan çekimleri, doğal
          oranıyla gösterilince vitrinde eserden çok boşluk gösteriyordu;
          tam görsel ürün sayfasında zaten görülüyor). */}
      <div style={{
        overflow: 'hidden', position: 'relative', background: 'var(--surface)', aspectRatio: '4/5',
      }}>
        {artwork.image_url
          ? <img src={artwork.image_url} alt={artwork.title}
              loading={index < 4 ? 'eager' : 'lazy'} decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
            onClick={handleFav}
            aria-label="Favorilere ekle"
            style={{ ...iconBtn, color: liked ? 'var(--red)' : 'var(--muted)', animation: favShake ? 'needsLogin .5s' : 'none' }}
          >
            {liked ? '♥' : '♡'}
          </button>
          <button
            onClick={quickAdd}
            aria-label="Sepete ekle"
            style={{ ...iconBtn, fontSize: '1.05rem', color: added ? 'var(--gold)' : 'var(--muted)', animation: cartShake ? 'needsLogin .5s' : 'none' }}
          >
            {added ? '✓' : '⊕'}
          </button>
        </div>

        {priceLabel && (
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 400, fontSize: '.82rem', color: 'var(--ink)', marginBottom: '.3rem' }}>
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
          <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 400, fontSize: '.7rem', color: 'var(--muted)' }}>
            {sizeLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtCard
