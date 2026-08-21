import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchArtworks } from '../lib/artworks'
import { useFavorites } from '../hooks/useFavorites'
import ArtCard from '../components/ArtCard'

function Favorites() {
  const { ids } = useFavorites()
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
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '2rem', fontWeight: 300, margin: 0
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          borderLeft: '1px solid var(--border)'
        }}>
          {favs.map((artwork, i) => (
            <ArtCard
              key={artwork.id}
              artwork={artwork}
              index={i}
              onClick={() => navigate(`/product/${artwork.slug}`)}
              onTagClick={tag => navigate(`/isler?category=${tag}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites