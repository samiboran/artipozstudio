import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchArtworks } from '../lib/artworks'
import ArtCard from '../components/ArtCard'

function Isler() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  useEffect(() => {
    setLoading(true)
    fetchArtworks({ search, tag: category })
      .then(setArtworks)
      .catch(err => console.error('Eserler yüklenemedi:', err))
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <div style={{ paddingTop: '4.2rem' }}>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '3rem 2rem 1.5rem' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 600,
          fontSize: '2.2rem', margin: '0 0 .4rem'
        }}>
          İşler
        </h1>
        {search && (
          <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.82rem', color: 'var(--muted)' }}>
            "{search}" için {artworks.length} sonuç
          </p>
        )}
        {!search && category && (
          <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.82rem', color: 'var(--muted)' }}>
            "{category}" kategorisinde {artworks.length} sonuç
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
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem 5rem' }}>
          <style>{`
            .isler-masonry { column-count: 2; column-gap: 1rem; }
            @media (min-width: 700px) {
              .isler-masonry { column-count: 3; column-gap: 1.8rem; }
            }
          `}</style>
          <div className="isler-masonry">
            {artworks.map((artwork, i) => (
              <ArtCard
                key={artwork.id}
                artwork={artwork}
                index={i}
                onClick={() => navigate(`/product/${artwork.slug}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Isler
