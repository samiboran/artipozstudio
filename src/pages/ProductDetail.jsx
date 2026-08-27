import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchArtworkBySlug, fetchArtworks, SIZE_MM } from '../lib/artworks'
import { makeSVG } from '../lib/makeSVG'
import { useCart } from '../hooks/useCart'
import { useFavorites } from '../hooks/useFavorites'
import { supabase } from '../lib/supabase'
import ArtCard from '../components/ArtCard'

// Mobilde tek görsel yerine, kapak + galeri + mockup görsellerinin hepsini
// tek bir kaydırmalı (scroll-snap) şeritte, alt nokta göstergesiyle sunan
// carousel — Saatchi Art referansındaki mobil ürün görünümüne benzer.
function MobileImageCarousel({ images, alt }) {
  const trackRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  function onScroll() {
    const el = trackRef.current
    if (!el) return
    setActiveIdx(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (!images.length) {
    return (
      <div style={{ width: '100%', aspectRatio: '4/5', background: 'var(--ink)' }}>
        <div dangerouslySetInnerHTML={{ __html: makeSVG(0) }} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {images.map((img, i) => (
          <div key={img.id || i} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', aspectRatio: '4/5', background: 'var(--ink)' }}>
            <img src={img.image_url} alt={alt}
              loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '.4rem', marginTop: '.7rem' }}>
          {images.map((img, i) => (
            <span key={img.id || i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === activeIdx ? 'var(--ink)' : 'var(--border)',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const { isFav, toggle } = useFavorites()
  const [view, setView] = useState('print') // 'print' | 'wall'
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSize, setActiveSize] = useState(null)
  const [openAcc, setOpenAcc] = useState('desc')
  const [artistInfo, setArtistInfo] = useState(null)
  const [activeImage, setActiveImage] = useState(null)
  const [moreFromSeller, setMoreFromSeller] = useState([])
  const [favShake, setFavShake] = useState(false)
  const [cartShake, setCartShake] = useState(false)

  useEffect(() => {
    fetchArtworkBySlug(slug)
      .then(data => {
        setArtwork(data)
        if (data?.sizes?.length) setActiveSize(data.sizes[0].label)
        if (data?.title) document.title = `${data.title} — Artı Poz`
        setActiveImage(data?.image_url || null)
        if (data?.artist) {
          fetchArtworks({})
            .then(all => setMoreFromSeller((all || []).filter(a => a.artist === data.artist && a.id !== data.id).slice(0, 4)))
            .catch(err => console.error('Sanatçının diğer eserleri yüklenemedi:', err))
        }
        // Ana Sayfa'daki "Fine Art Seçkisi" vitrini en çok görüntülenen
        // eserleri otomatik gösteriyor — arka planda, sayfayı bekletmeden.
        if (data?.id) {
          supabase.rpc('increment_artwork_view', { artwork_id: data.id })
            .then(({ error }) => { if (error) console.error('Görüntülenme sayılamadı:', error.message) })
        }
      })
      .catch(err => console.error('Eser yüklenemedi:', err))
      .finally(() => setLoading(false))
    return () => { document.title = 'Artı Poz — Fine Art Baskı & Özgün Eserler' }
  }, [slug])

  useEffect(() => {
    supabase.from('site_settings').select('artist_bio, artist_photo_url').eq('id', 'default').single()
      .then(({ data }) => { if (data?.artist_bio) setArtistInfo(data) })
      .catch(err => console.error('Sanatçı bilgisi yüklenemedi:', err))
  }, [])

  if (loading) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem', color: 'var(--muted)', fontStyle: 'italic' }}>
      Yükleniyor…
    </div>
  )

  if (!artwork) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem', color: 'var(--muted)' }}>
      Eser bulunamadı
    </div>
  )

  const activePrice = artwork.sizes?.find(s => s.label === activeSize)?.price
  // Mobil carousel için kapak + galeri + mockup görsellerinin hepsi tek şeritte.
  const allImages = [
    { id: 'cover', image_url: artwork.image_url },
    ...(artwork.artwork_images || []),
    ...(artwork.artwork_mockups || []),
  ].filter(img => img.image_url)
  const accs = [
    { key: 'desc', label: 'Eser Hakkında', content: artwork.description },
    { key: 'specs', label: 'Teknik Detaylar', content: `${artwork.type || artwork.medium || '—'} · ${artwork.material || '—'} · ${artwork.year || '—'}` },
    { key: 'ship', label: 'Kargo', content: 'Yurt içi kargo ücretsiz, 3–5 iş günü içinde teslim edilir. Eserler köşe korumalı özel ambalajla gönderilir. 14 gün içinde ücretsiz iade edilebilir.' },
    { key: 'cert', label: 'Baskı Kalitesi', content: 'Fine art baskılarımız için Hahnemühle ve Awagami kağıtları, arşivsel pigment mürekkeplerle kullanılır.' },
  ]

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Breadcrumb */}
      <div style={{
        padding: '1.2rem 2rem .4rem',
        display: 'flex', gap: '.45rem', alignItems: 'center',
        fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase',
        color: 'var(--muted)', borderBottom: '1px solid var(--border)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.4rem', padding: 0
          }}
        >
          ← Geri
        </button>
        <span style={{ opacity: .35 }}>/</span>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Artı Poz</span>
        <span style={{ opacity: .35 }}>/</span>
        <span style={{ color: 'var(--ink)' }}>{artwork.title}</span>
      </div>

      {/* Ana grid — masaüstünde 55/45 yan yana, mobilde (≤860px) alt alta;
          görsel kolonu masaüstünde sticky+tam yükseklik, mobilde doğal
          boyutta (aksi halde görsel "basık" görünüyordu). */}
      <style>{`
        .pd-grid { display: grid; grid-template-columns: 55% 45%; }
        .pd-image-col {
          position: sticky; top: 4.5rem; height: calc(100vh - 4.5rem);
          padding-right: 3rem;
        }
        .pd-desktop-viewer { display: flex; flex-direction: column; gap: .8rem; flex: 1; min-height: 0; }
        .pd-mobile-viewer { display: none; }
        @media (max-width: 860px) {
          .pd-grid { display: block; }
          .pd-image-col { position: static; height: auto; padding-right: 0; padding-top: 1rem; }
          .pd-desktop-viewer { display: none; }
          .pd-mobile-viewer { display: block; }
          .pd-info-col { padding-left: 0 !important; padding-top: 1.5rem !important; }
        }
      `}</style>
      <div className="pd-grid" style={{
        maxWidth: 1300, margin: '0 auto', padding: '0 2rem 6rem'
      }}>

        {/* Sol — görsel */}
        <div className="pd-image-col" style={{
          display: 'flex', flexDirection: 'column',
          gap: '.8rem', paddingTop: '1.5rem', paddingBottom: '1.5rem'
        }}>
          {/* Görünüm seçici */}
          <div style={{ display: 'flex', gap: '.4rem' }}>
            {[['print', 'Baskı'], ['wall', 'Duvarda']].map(([key, label]) => (
              <button key={key} onClick={() => setView(key)} style={{
                padding: '.4rem .9rem',
                border: `1px solid ${view === key ? 'var(--ink)' : 'var(--border)'}`,
                background: view === key ? 'var(--ink)' : 'none',
                color: view === key ? '#fff' : 'var(--muted)',
                fontSize: '.58rem', letterSpacing: '.16em', textTransform: 'uppercase',
                cursor: 'pointer'
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Mobil — kapak + galeri + mockup görselleri tek kaydırmalı şeritte */}
          <div className="pd-mobile-viewer">
            {view === 'print' ? (
              <MobileImageCarousel images={allImages} alt={artwork.title} />
            ) : (
              <div style={{
                width: '100%', aspectRatio: '4/5', position: 'relative',
                background: 'linear-gradient(180deg, #efece6 0%, #e9e5de 78%, #d8d3ca 78%, #cfc9bf 100%)'
              }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '76.5%', height: '1.5%', background: '#f4f1ec', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }} />
                <div style={{
                  position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)',
                  width: '52%', aspectRatio: '4/5',
                  background: '#1c1a18', padding: '1.1%',
                  boxShadow: '0 18px 40px rgba(0,0,0,.28), 0 4px 10px rgba(0,0,0,.18)'
                }}>
                  <div style={{ width: '100%', height: '100%', background: '#fbfaf7', padding: '9%', boxSizing: 'border-box' }}>
                    {activeImage
                      ? <img src={activeImage} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                      : <div dangerouslySetInnerHTML={{ __html: makeSVG(0) }} style={{ width: '100%', height: '100%' }} />
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Masaüstü — ana görsel + ayrı galeri/mockup thumbnail şeritleri */}
          <div className="pd-desktop-viewer">
          <div style={{ flex: 1, overflow: 'hidden', background: 'var(--ink)', position: 'relative' }}>
            {artwork.is_original && view === 'print' && (
              <div style={{ position: 'absolute', top: '.9rem', left: '.9rem', zIndex: 2, background: 'var(--ink)', color: '#fff', fontSize: '.56rem', letterSpacing: '.18em', textTransform: 'uppercase', padding: '.28rem .7rem' }}>
                Orijinal
              </div>
            )}

            {view === 'print' ? (
              activeImage
                ? <img src={activeImage} alt={artwork.title} loading="eager" fetchPriority="high" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <div dangerouslySetInnerHTML={{ __html: makeSVG(0) }} style={{ width: '100%', height: '100%' }} />
            ) : (
              /* Duvar mockup sahnesi */
              <div style={{
                width: '100%', height: '100%', position: 'relative',
                background: 'linear-gradient(180deg, #efece6 0%, #e9e5de 78%, #d8d3ca 78%, #cfc9bf 100%)'
              }}>
                {/* Süpürgelik */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: '76.5%', height: '1.5%', background: '#f4f1ec', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }} />
                {/* Çerçeve */}
                <div style={{
                  position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)',
                  width: '52%', aspectRatio: '4/5',
                  background: '#1c1a18', padding: '1.1%',
                  boxShadow: '0 18px 40px rgba(0,0,0,.28), 0 4px 10px rgba(0,0,0,.18)'
                }}>
                  {/* Paspartu */}
                  <div style={{ width: '100%', height: '100%', background: '#fbfaf7', padding: '9%', boxSizing: 'border-box' }}>
                    {activeImage
                      ? <img src={activeImage} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                      : <div dangerouslySetInnerHTML={{ __html: makeSVG(0) }} style={{ width: '100%', height: '100%' }} />
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {artwork.artwork_images?.length > 0 && (
            <div style={{ display: 'flex', gap: '.6rem', marginTop: '.8rem', flexWrap: 'wrap' }}>
              {[{ id: 'cover', image_url: artwork.image_url }, ...artwork.artwork_images].map(img => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  style={{
                    width: 56, height: 56, padding: 0, cursor: 'pointer',
                    border: `2px solid ${activeImage === img.image_url ? 'var(--ink)' : 'transparent'}`,
                    background: 'none', flexShrink: 0,
                  }}
                >
                  <img src={img.image_url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}

          {/* Mockup görselleri — ürünün bir mekanda/duvarda gösterildiği
              ayrı görsel seti, artwork_images'tan (ürünün kendi açı/yakın
              çekimleri) bağımsız. */}
          {artwork.artwork_mockups?.length > 0 && (
            <div style={{ marginTop: '.6rem' }}>
              <div style={{ fontSize: '.58rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>
                Mekanda Görünüm
              </div>
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                {artwork.artwork_mockups.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    style={{
                      width: 56, height: 56, padding: 0, cursor: 'pointer',
                      border: `2px solid ${activeImage === img.image_url ? 'var(--ink)' : 'transparent'}`,
                      background: 'none', flexShrink: 0,
                    }}
                  >
                    <img src={img.image_url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Sağ — bilgi */}
        <div className="pd-info-col" style={{ paddingLeft: '2.5rem', paddingTop: '2rem' }}>

          {/* Sanatçı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', marginBottom: '1.4rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Archivo Black', sans-serif", fontSize: '.95rem', color: 'var(--gold)'
            }}>
              {artwork.artist.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 500, color: 'var(--ink)' }}>{artwork.artist}</div>
              <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                {artwork.type || artwork.medium}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(1.9rem, 2.8vw, 2.8rem)', lineHeight: 1.15, marginBottom: '.3rem' }}>
              {artwork.title}
            </h1>
            <button
              onClick={async () => {
                const ok = await toggle(artwork.id)
                if (!ok) { setFavShake(true); setTimeout(() => setFavShake(false), 500) }
              }}
              aria-label="Favorilere ekle"
              style={{
                background: 'none', border: `1px solid ${isFav(artwork.id) ? 'var(--red)' : 'var(--border)'}`,
                width: 38, height: 38, flexShrink: 0, marginTop: '.3rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.05rem', color: isFav(artwork.id) ? 'var(--red)' : 'var(--muted)',
                cursor: 'pointer', animation: favShake ? 'needsLogin .5s' : 'none',
              }}
            >
              {isFav(artwork.id) ? '♥' : '♡'}
            </button>
          </div>
          <div style={{ fontSize: '.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.3rem' }}>
            {artwork.year} · {artwork.type || artwork.medium}
          </div>
          {artwork.material && (
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: '1.4rem' }}>
              {artwork.material}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.4rem 0' }} />

          {activePrice && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '.8rem', marginBottom: '1.3rem' }}>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: '1.7rem', color: 'var(--ink)' }}>
                ₺{activePrice.toLocaleString('tr-TR')}
              </div>
              <div style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                KDV dahil · Ücretsiz kargo
              </div>
            </div>
          )}

          {/* Boyut */}
          {artwork.sizes?.length > 0 && (
            <>
              <div style={{ fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.65rem' }}>Boyut</div>
              <div style={{ display: 'flex', gap: '.45rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
                {artwork.sizes.map(s => (
                  <button key={s.label} onClick={() => setActiveSize(s.label)} style={{
                    padding: '.45rem .85rem',
                    border: `1px solid ${activeSize === s.label ? 'var(--ink)' : 'var(--border)'}`,
                    background: activeSize === s.label ? 'var(--ink)' : 'none',
                    color: activeSize === s.label ? '#fff' : 'var(--ink)',
                    fontSize: '.64rem', letterSpacing: '.1em', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.15rem',
                  }}>
                    <span>{s.label}</span>
                    {SIZE_MM[s.label] && (
                      <span style={{ fontSize: '.54rem', opacity: .7, letterSpacing: '.02em' }}>{SIZE_MM[s.label]}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <button
  onClick={() => {
    const ok = addItem(artwork, activeSize, Number(activePrice) || 0)
    if (!ok) { setCartShake(true); setTimeout(() => setCartShake(false), 500); return }
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }}
  style={{
    width: '100%', padding: '.9rem', marginBottom: '1.6rem',
    background: added ? 'var(--gold)' : 'var(--ink)',
    color: '#fff', border: 'none',
    fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'background .3s',
    animation: cartShake ? 'needsLogin .5s' : 'none',
  }}
>
  {added ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
</button>

          {/* Etiketler */}
          {artwork.tags?.length > 0 && (
            <>
              <div style={{ fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.65rem' }}>Etiketler</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1.4rem' }}>
                {artwork.tags.map(tag => (
                  <span key={tag} onClick={() => navigate(`/isler?category=${tag}`)} style={{
                    fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase',
                    color: 'var(--gold)', padding: '.25rem .65rem',
                    border: '1px solid rgba(18,42,150,.28)', cursor: 'pointer'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Accordion */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {accs.map(acc => (
              <div key={acc.key} style={{ borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={() => setOpenAcc(openAcc === acc.key ? null : acc.key)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '.9rem 0', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '.64rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink)'
                  }}
                >
                  {acc.label}
                  <span style={{ transition: 'transform .3s', transform: openAcc === acc.key ? 'rotate(45deg)' : 'none', color: 'var(--muted)' }}>+</span>
                </button>
                {openAcc === acc.key && (
                  <div style={{ paddingBottom: '1rem', fontSize: '.76rem', lineHeight: 1.9, color: '#555' }}>
                    {acc.content}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bu sanatçıdan diğer eserler */}
      {moreFromSeller.length > 0 && (
        <section style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem 4rem', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '1.4rem', margin: '2.5rem 0 1.5rem' }}>
            {artwork.artist}'dan Diğer Eserler
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {moreFromSeller.map((a, i) => (
              <ArtCard key={a.id} artwork={a} index={i} noBottomGap onClick={() => navigate(`/product/${a.slug}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Sanatçı Hakkında */}
      {artistInfo && (
        <section style={{
          maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 5rem',
          display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap',
          borderTop: '1px solid var(--border)',
        }}>
          {artistInfo.artist_photo_url && (
            <img
              src={artistInfo.artist_photo_url} alt={artwork.artist}
              loading="lazy" decoding="async"
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '2rem' }}
            />
          )}
          <div style={{ flex: 1, minWidth: 260, marginTop: '2rem' }}>
            <div style={{ fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.65rem' }}>
              Sanatçı Hakkında
            </div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.9, color: '#444', margin: 0 }}>
              {artistInfo.artist_bio}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetail