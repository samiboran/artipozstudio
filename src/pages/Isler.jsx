import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchArtworks } from '../lib/artworks'
import ArtCard from '../components/ArtCard'
import Seo from '../components/Seo'

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
    <div style={{ paddingTop: '4.2rem' }} data-prerender-ready={!loading}>
      <Seo
        title="Fine Art Seçkisi — Sanatçı İmzalı Özgün Eserler | Artı Poz"
        description="Fine art baskı ve özgün eserlerden oluşan Artı Poz koleksiyonu. Hahnemühle sertifikalı kağıtlara, sanatçı imzalı orijinallik sertifikasıyla baskı."
        path="/isler"
      />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '3rem 2rem 1.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 600,
          fontSize: '2.2rem', margin: '0 0 .4rem'
        }}>
          <span lang="en">Fine Art</span> Seçkisi
        </h1>
        {search && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '.82rem', color: 'var(--muted)' }}>
            "{search}" için {artworks.length} sonuç
          </p>
        )}
        {!search && category && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '.82rem', color: 'var(--muted)' }}>
            "{category}" kategorisinde {artworks.length} sonuç
          </p>
        )}
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center', padding: '6rem 2rem',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem', color: '#bbb', fontStyle: 'italic'
        }}>
          Yükleniyor…
        </div>
      ) : artworks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '6rem 2rem',
          fontFamily: 'var(--font-body)',
          fontSize: '.9rem', color: 'var(--muted)'
        }}>
          Sonuç bulunamadı.
        </div>
      ) : (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 2rem 5rem' }}>
          {/* Not: bu bir "masonry" (column-count) düzeniydi — CSS çoklu sütun
              her sütunu BAĞIMSIZ doldurur, satırları hizalamaz. Kart
              görselleri sabit oranlı (4/5) olsa da alttaki metin bloğu
              (başlık tek/iki satır olabiliyor) yükseklikleri hafif
              farklılaştırıyor, bu da sütunlar arasında birikerek kaymaya
              yol açıyordu (mobilde daha belirgin, 2 sütun). Grid'e geçince
              her satırın yüksekliği o satırdaki en uzun karta göre
              belirleniyor — sütunlar artık HER ZAMAN hizalı. */}
          <style>{`
            .isler-masonry { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem 1rem; }
            @media (min-width: 700px) {
              .isler-masonry { grid-template-columns: repeat(3, 1fr); gap: 1.8rem 1.8rem; }
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
