import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchArtworks } from '../lib/artworks'
import { useFavorites } from '../hooks/useFavorites'
import ArtCard from '../components/ArtCard'

function Favorites() {
  const { ids, loggedIn } = useFavorites()
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchArtworks({})
      .then(data => setArtworks(data || []))
      .finally(() => setLoading(false))
  }, [])

  const favs = artworks.filter(a => ids.includes(a.id))

  return (
    <div style={{ paddingTop: '4.2rem', minHeight: '60vh' }}>
      <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600, fontSize: '2.2rem', margin: 0
        }}>
          Favoriler
        </h1>
        <div style={{ fontSize: '.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '.4rem' }}>
          {favs.length} eser
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--muted)' }}>
          Yükleniyor…
        </div>
      ) : !loggedIn ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem', color: 'var(--muted)', marginBottom: '1.2rem' }}>
            Favorilerini görmek için giriş yap
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'var(--ink)', color: '#fff', border: 'none',
              padding: '.8rem 2rem', fontSize: '.65rem',
              letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer'
            }}
          >
            Giriş Yap
          </button>
        </div>
      ) : favs.length === 0 ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.5rem', color: 'var(--muted)', marginBottom: '1.2rem' }}>
            Henüz favori eseriniz yok
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'var(--ink)', color: '#fff', border: 'none',
              padding: '.8rem 2rem', fontSize: '.65rem',
              letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer'
            }}
          >
            Koleksiyonu Keşfet
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 2rem' }}>
          <style>{`
            .favorites-masonry { column-count: 2; column-gap: 1rem; }
            @media (min-width: 700px) {
              .favorites-masonry { column-count: 3; column-gap: 1.8rem; }
            }
          `}</style>
          <div className="favorites-masonry">
            {favs.map((artwork, i) => (
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

export default Favorites