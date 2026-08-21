import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SOCIAL_LINKS = [
  {
    label: 'Instagram', href: 'https://www.instagram.com/artipozstudio/', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    label: 'Etsy', href: 'https://www.etsy.com/shop/ArtiPozStudioShop', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 3h9l-1 4H8v5h5.5l-1 4H8v3.5h6.5L15 21H6z" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'E-posta', href: 'mailto:info@artipozstudio.com', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    )
  },
]

const NAV_LINKS = [
  { label: 'Ana Sayfa', to: '/' },
  { label: 'Fotoğraf Baskı', to: '/fotograf-baski' },
  { label: 'Fine Art Baskı', to: '/fine-art-baski' },
  { label: 'Kağıt Rehberi', to: '/kagit-rehberi' },
  { label: 'Çerçeve', to: '/cerceve' },
  { label: 'İşler', to: '/isler' },
]

function Navbar({ cartCount = 0, onCartClick }) {
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [customerName, setCustomerName] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'
  // Ana sayfada hero'nun üzerinde şeffaf, aşağı inince beyaz; diğer sayfalarda her zaman beyaz.
  const transparent = isHome && !scrolled

  useEffect(() => {
    async function loadCustomer(session) {
      if (!session) { setCustomerName(null); return }
      try {
        const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', session.user.id).single()
        // Admin hesabı navbar'da müşteri gibi görünmesin — Admin panelinde zaten kendi girişini görüyor.
        setCustomerName(profile?.role === 'admin' ? null : (profile?.full_name || session.user.email))
      } catch (err) {
        console.error('Kullanıcı bilgisi yüklenemedi:', err)
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => loadCustomer(session))
    // onAuthStateChange callback'i supabase-js'in kendi cross-tab auth kilidini
    // (lock:sb-...-auth-token) tutarken çalışıyor. loadCustomer() içeride
    // `await supabase.from(...)` yaptığı için, callback'in İÇİNDEN senkron
    // çağrılırsa (await edilmese bile) aynı kilidi tekrar istiyor ve kilit hiç
    // bırakılmadığı için site genelinde TÜM supabase isteklerini kilitliyordu
    // (görseller yüklenmiyor, Admin'de "Kaydediliyor…" hiç bitmiyor gibi
    // görünen sorunların kök nedeni buydu). setTimeout ile callback'in dışına,
    // kilit serbest kaldıktan sonraki bir tick'e taşıyoruz.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => loadCustomer(session), 0)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setCustomerName(null)
    navigate('/')
  }

  useEffect(() => {
    if (!isHome) { setScrolled(false); return }
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/isler?search=${search}`)
      setMenuOpen(false)
    }
  }

  const linkColor = transparent ? 'rgba(255,255,255,.9)' : 'var(--muted)'
  const iconColor = transparent ? '#fff' : 'var(--muted)'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 2rem',
        background: transparent ? 'transparent' : 'rgba(255,255,255,0.96)',
        borderBottom: transparent ? 'none' : '1px solid var(--border)',
        transition: 'background .25s, border-color .25s',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
            {SOCIAL_LINKS.filter(s => s.label !== 'Etsy').map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label} style={{ color: iconColor, display: 'flex' }}>
                {s.icon}
              </a>
            ))}
          </div>

          {!transparent && (
            <Link to="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: '1.2rem', letterSpacing: '-.02em',
                color: 'var(--blue)', textTransform: 'lowercase'
              }}>
                artı poz
              </span>
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }} className="desktop-nav">
          {NAV_LINKS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: '.68rem', letterSpacing: '.12em',
                textTransform: 'uppercase', color: linkColor,
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {!transparent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '.42rem 2rem .42rem .85rem',
                  fontFamily: "'Archivo', sans-serif",
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

            <span style={{ width: 1, height: 16, background: 'var(--border)' }} />

            {customerName ? (
              <>
                <span style={{ fontSize: '.72rem', color: 'var(--ink)' }}>
                  Merhaba, {customerName.split(' ')[0]}
                </span>
                <button onClick={handleLogout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '.68rem', letterSpacing: '.14em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                }}>
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  fontSize: '.68rem', letterSpacing: '.14em',
                  textTransform: 'uppercase', color: 'var(--muted)'
                }}>
                  Log in
                </Link>

                <Link to="/kayit" style={{
                  fontSize: '.68rem', letterSpacing: '.14em',
                  textTransform: 'uppercase', color: 'var(--bg)',
                  background: 'var(--accent)', padding: '.5rem 1rem'
                }}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'none', flexDirection: 'column',
            gap: '5px', padding: '4px'
          }}
        >
          <span style={{ display: 'block', width: 22, height: 1.5, background: menuOpen ? 'transparent' : iconColor, transition: 'all .25s' }} />
          <span style={{ display: 'block', width: 22, height: 1.5, background: iconColor, transition: 'all .25s',
            transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 1.5, background: iconColor, transition: 'all .25s',
            transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 199,
          background: 'rgba(255,255,255,0.98)',
          padding: '1.5rem 2rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1.2rem',
          overflowY: 'auto'
        }}>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              alignSelf: 'flex-end', background: 'none', border: 'none',
              fontSize: '1.4rem', color: 'var(--muted)', cursor: 'pointer'
            }}
            aria-label="Kapat"
          >
            ×
          </button>

          {NAV_LINKS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '.8rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--ink)',
                borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
              }}
            >
              {item.label}
            </Link>
          ))}

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

          <Link to="/favoriler" onClick={() => setMenuOpen(false)} style={{
            fontSize: '.8rem', letterSpacing: '.16em',
            textTransform: 'uppercase', color: 'var(--ink)',
            borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
          }}>
            Favoriler
          </Link>

          <button onClick={() => { onCartClick(); setMenuOpen(false) }} style={{
            background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
            fontSize: '.8rem', letterSpacing: '.16em',
            textTransform: 'uppercase', color: 'var(--ink)',
            borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
          }}>
            Sepet ({cartCount})
          </button>

          {customerName ? (
            <>
              <div style={{
                fontSize: '.8rem', letterSpacing: '.02em', color: 'var(--ink)',
                borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
              }}>
                Merhaba, {customerName.split(' ')[0]}
              </div>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} style={{
                background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                fontSize: '.8rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--ink)',
                borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
              }}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                fontSize: '.8rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--ink)',
                borderBottom: '1px solid var(--border)', paddingBottom: '.8rem'
              }}>
                Log in
              </Link>

              <Link to="/kayit" onClick={() => setMenuOpen(false)} style={{
                fontSize: '.8rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--bg)',
                background: 'var(--accent)', padding: '.7rem 1rem', textAlign: 'center'
              }}>
                Sign up
              </Link>
            </>
          )}

          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '.5rem', alignItems: 'center' }}>
            {SOCIAL_LINKS.map(s => (
              s.label === 'Etsy' ? (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: "'Archivo', sans-serif", fontSize: '.7rem',
                  letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)',
                }}>
                  Etsy
                </a>
              ) : (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label} style={{ color: 'var(--muted)', display: 'flex' }}>
                  {s.icon}
                </a>
              )
            ))}
          </div>
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
