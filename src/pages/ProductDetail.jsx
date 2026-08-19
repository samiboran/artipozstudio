import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchArtworkBySlug } from '../lib/artworks'
import { makeSVG } from '../lib/makeSVG'
import { useCart } from '../hooks/useCart'
import { useFavorites } from '../hooks/useFavorites'

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

  useEffect(() => {
    fetchArtworkBySlug(slug)
      .then(data => {
        setArtwork(data)
        if (data?.sizes?.length) setActiveSize(data.sizes[0].label)
        if (data?.title) document.title = `${data.title} — Artı Poz`
      })
      .finally(() => setLoading(false))
    return () => { document.title = 'Artı Poz — Fine Art Baskı & Özgün Eserler' }
  }, [slug])

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
  const accs = [
    { key: 'desc', label: 'Eser Hakkında', content: artwork.description },
    { key: 'specs', label: 'Teknik Detaylar', content: `${artwork.medium || '—'} · ${artwork.year || '—'}` },
    { key: 'ship', label: 'Kargo & İade', content: 'Yurt içi kargo ücretsiz, 3–5 iş günü. Eserler özel ambalajla gönderilir. 14 gün içinde iade edilebilir.' },
    { key: 'cert', label: 'Sertifika', content: 'Her eser sanatçı imzalı, numaralı orijinallik sertifikası ile gelir.' },
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

      {/* Ana grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '55% 45%',
        maxWidth: 1300, margin: '0 auto', padding: '0 2rem 6rem'
      }}>

        {/* Sol — görsel */}
        <div style={{
          position: 'sticky', top: '4.5rem',
          height: 'calc(100vh - 4.5rem)',
          display: 'flex', flexDirection: 'column',
          gap: '.8rem', paddingRight: '3rem', paddingTop: '1.5rem', paddingBottom: '1.5rem'
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

          <div style={{ flex: 1, overflow: 'hidden', background: 'var(--surface)', position: 'relative' }}>
            {artwork.is_original && view === 'print' && (
              <div style={{ position: 'absolute', top: '.9rem', left: '.9rem', zIndex: 2, background: 'var(--ink)', color: '#fff', fontSize: '.56rem', letterSpacing: '.18em', textTransform: 'uppercase', padding: '.28rem .7rem' }}>
                Orijinal
              </div>
            )}

            {view === 'print' ? (
              artwork.image_url
                ? <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    {artwork.image_url
                      ? <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div dangerouslySetInnerHTML={{ __html: makeSVG(0) }} style={{ width: '100%', height: '100%' }} />
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ — bilgi */}
        <div style={{ paddingLeft: '2.5rem', paddingTop: '2rem' }}>

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
                {artwork.medium}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 'clamp(1.9rem, 2.8vw, 2.8rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '.3rem' }}>
              {artwork.title}
            </h1>
            <button
              onClick={() => toggle(artwork.id)}
              aria-label="Favorilere ekle"
              style={{
                background: 'none', border: `1px solid ${isFav(artwork.id) ? 'var(--red)' : 'var(--border)'}`,
                width: 38, height: 38, flexShrink: 0, marginTop: '.3rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.05rem', color: isFav(artwork.id) ? 'var(--red)' : 'var(--muted)',
                cursor: 'pointer'
              }}
            >
              {isFav(artwork.id) ? '♥' : '♡'}
            </button>
          </div>
          <div style={{ fontSize: '.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.4rem' }}>
            {artwork.year} · {artwork.medium}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.4rem 0' }} />

          {activePrice && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '.8rem', marginBottom: '1.3rem' }}>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '2.1rem' }}>
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
              <div style={{ display: 'flex', gap: '.45rem', marginBottom: '1.4rem' }}>
                {artwork.sizes.map(s => (
                  <button key={s.label} onClick={() => setActiveSize(s.label)} style={{
                    padding: '.45rem .85rem',
                    border: `1px solid ${activeSize === s.label ? 'var(--ink)' : 'var(--border)'}`,
                    background: activeSize === s.label ? 'var(--ink)' : 'none',
                    color: activeSize === s.label ? '#fff' : 'var(--ink)',
                    fontSize: '.64rem', letterSpacing: '.1em', cursor: 'pointer'
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <button
  onClick={() => {
    addItem(artwork, activeSize, Number(activePrice) || 0)
setAdded(true)
setTimeout(() => setAdded(false), 1800)
    
  }}
  style={{
    width: '100%', padding: '.9rem',
    background: added ? 'var(--gold)' : 'var(--ink)',
    color: '#fff', border: 'none',
    fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'background .3s'
  }}
>
  {added ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
</button>

          {/* Garanti */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.85rem 1rem', background: 'var(--surface)', borderLeft: '2px solid var(--gold)', marginBottom: '1.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🛡</span>
            <div style={{ fontSize: '.64rem', lineHeight: 1.7 }}>
              <strong style={{ display: 'block', fontSize: '.68rem' }}>14 Gün İade Garantisi</strong>
              Ücretsiz iade · Orijinallik sertifikası · Güvenli ödeme
            </div>
          </div>

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
    </div>
  )
}

export default ProductDetail