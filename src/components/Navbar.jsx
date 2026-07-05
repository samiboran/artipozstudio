import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const CATS = ['Fotoğraf', 'Resim', 'Baskı', 'Heykel']

function Navbar({ cartCount = 0, onCartClick }) {
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/?search=${search}`)
      setMenuOpen(false)
    }
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 2rem',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)'
      }}>

        <Link to="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: '1.35rem', letterSpacing: '-.02em',
            color: 'var(--blue)', textTransform: 'lowercase'
          }}>
            artı poz
          </span>
          <span style={{
            fontSize: '.5rem', letterSpacing: '.34em',
            textTransform: 'uppercase', color: 'var(--muted)', marginTop: '.2rem'
          }}>
            Fine Art Print Lab
          </span>
        </Link>

        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}
          className="desktop-nav">
          {CATS.map(cat => (
            <li key={cat}>
              <Link to={`/?category=${cat.toLowerCase()}`} style={{
                fontSize: '.68rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--muted)'
              }}>
                {cat}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }} className="desktop-nav">
            <input
              type="text"
              placeholder="ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                padding: '.42rem 2rem .42rem .85rem',
                fontSize: '.7rem', color: 'var(--ink)',
                width: '190px', outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute', right: '.6rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--muted)'
            }}>⌕</span>
          </div>

          <Link to="/favoriler" aria-label="Favoriler" style={{
            fontSize: '1rem', color: 'var(--muted)', lineHeight: 1
          }}>
            ♡
          </Link>

          <button onClick={onCartClick} style={{
            background: 'none', border: 'none',
            fontSize: '.68rem', letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--muted)', cursor: 'pointer'
          }}>
            Sepet ({cartCount})
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'none', flexDirection: 'column',
              gap: '5px', padding: '4px'
            }}
          >
            <span style={{ display: 'block', width: 22, height: 1.5, background: menuOpen ? 'transparent' : 'var(--ink)', transition: 'all .25s' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: 'var(--ink)', transition: 'all .25s',
              transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: 'var(--ink)', transition: 'all .25s',
              transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: '4.2rem', left: 0, right: 0, zIndex: 199,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem 2rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1.2rem'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              style={{
                width: '100%', background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '.55rem 2rem .55rem .85rem',
                fontSize: '.8rem', color: 'var(--ink)', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', right: '.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>⌕</span>
          </div>

          {CATS.map(cat => (
            <Link
              key={cat}
              to={`/?category=${cat.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '.8rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--ink)',
                borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar