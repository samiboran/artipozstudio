import { Link } from 'react-router-dom'

const INSTAGRAM_URL = 'https://www.instagram.com/artipozstudio/'
const ETSY_URL = 'https://www.etsy.com/shop/ArtiPozStudioShop'

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '3rem 2rem',
      marginTop: '6rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      background: 'var(--bg)'
    }}>

      {/* Bilgi */}
      <div>
        <div style={{ fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--ink)' }}>
          Bilgi
        </div>
        {[
          ['Hakkımızda', '/hakkimizda'],
          ['Teslimat', '/yasal/teslimat'],
          ['İade & Değişim', '/yasal/iade'],
          ['Mesafeli Satış Sözleşmesi', '/yasal/mesafeli-satis'],
          ['Gizlilik & KVKK', '/yasal/gizlilik'],
        ].map(([label, to]) => (
          <div key={to} style={{ marginBottom: '.5rem' }}>
            <Link to={to} style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
              {label}
            </Link>
          </div>
        ))}
      </div>

      {/* İletişim */}
      <div>
        <div style={{ fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--ink)' }}>
          İletişim
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--muted)', lineHeight: 2 }}>
          <div>info@artipozstudio.com</div>
          <div>İstanbul, Türkiye</div>
        </div>
        <div style={{ display: 'flex', gap: '.8rem', marginTop: '1rem' }}>
          {[['Instagram', INSTAGRAM_URL], ['Etsy', ETSY_URL]].map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--gold)',
              borderBottom: '1px solid rgba(18,42,150,.3)', paddingBottom: '.1rem'
            }}>
              {name}
            </a>
          ))}
        </div>
      </div>

      {/* Alt çizgi */}
      <div style={{
        gridColumn: '1 / -1',
        borderTop: '1px solid var(--border)',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '.5rem'
      }}>
        <span style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          © {new Date().getFullYear()} Artı Poz. Tüm hakları saklıdır.
        </span>
        <span style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <span lang="en">Fine Art Print Studio</span> · İstanbul
        </span>
      </div>

    </footer>
  )
}

export default Footer
