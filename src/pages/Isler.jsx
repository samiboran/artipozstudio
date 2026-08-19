import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchArtworks } from '../lib/artworks'
import ArtCard from '../components/ArtCard'

const PER_PAGE = 10 // 5 sütun × 2 satır — sayfa başına kayan blok

function Isler() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const search = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    setPage(0)
    fetchArtworks({ search })
      .then(setArtworks)
      .finally(() => setLoading(false))
  }, [search])

  const pageCount = Math.ceil(artworks.length / PER_PAGE)

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '3rem 2rem 1.5rem' }}>
        <h1 style={{
          fontFamily: "'Archivo Black', sans-serif", fontWeight: 300,
          fontSize: '2rem', margin: '0 0 .4rem'
        }}>
          İşler
        </h1>
        {search && (
          <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.82rem', color: 'var(--muted)' }}>
            "{search}" için {artworks.length} sonuç
          </p>
        )}
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center', padding: '6rem 2rem',
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '1.5rem', color: '#bbb', fontStyle: 'italic'
        }}>
          Yükleniyor…
        </div>
      ) : artworks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '6rem 2rem',
          fontFamily: "'Archivo', sans-serif",
          fontSize: '.9rem', color: 'var(--muted)'
        }}>
          Sonuç bulunamadı.
        </div>
      ) : (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem 5rem', position: 'relative' }}>

          {/* Kaydırma alanı */}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              transition: 'transform .45s ease',
              transform: `translateX(-${page * 100}%)`,
            }}>
              {Array.from({ length: pageCount }).map((_, p) => (
                <div key={p} style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                  minWidth: '100%', flexShrink: 0,
                  border: '1px solid var(--border)', borderRight: 'none', borderBottom: 'none',
                }}>
                  {artworks.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE).map((artwork, i) => (
                    <ArtCard
                      key={artwork.id}
                      artwork={artwork}
                      index={i}
                      onClick={() => navigate(`/product/${artwork.slug}`)}
                      onTagClick={(tag) => navigate(`/isler?search=${tag}`)}
                    />
                  ))}
                  {/* Son sayfada 5'ten az eser varsa boş hücrelerle grid'i tamamla */}
                  {Array.from({ length: Math.max(0, PER_PAGE - artworks.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE).length) }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Ok butonları */}
          {pageCount > 1 && (
            <>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Önceki"
                style={{
                  position: 'absolute', left: '-1.4rem', top: '50%', transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#fff', border: '1px solid var(--border)',
                  boxShadow: '0 2px 10px rgba(0,0,0,.08)',
                  cursor: page === 0 ? 'default' : 'pointer',
                  opacity: page === 0 ? .35 : 1,
                  fontSize: '1.1rem', color: 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ‹
              </button>
              <button
                onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                disabled={page === pageCount - 1}
                aria-label="Sonraki"
                style={{
                  position: 'absolute', right: '-1.4rem', top: '50%', transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#fff', border: '1px solid var(--border)',
                  boxShadow: '0 2px 10px rgba(0,0,0,.08)',
                  cursor: page === pageCount - 1 ? 'default' : 'pointer',
                  opacity: page === pageCount - 1 ? .35 : 1,
                  fontSize: '1.1rem', color: 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Sayfa noktaları */}
          {pageCount > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '1.5rem' }}>
              {Array.from({ length: pageCount }).map((_, p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-label={`Sayfa ${p + 1}`}
                  style={{
                    width: 7, height: 7, borderRadius: '50%', padding: 0, border: 'none',
                    background: p === page ? 'var(--ink)' : 'var(--border)', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Isler
