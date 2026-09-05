import { Link, useNavigate } from 'react-router-dom'
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

// "Fine Art Baskı" tek İngilizce sözcük ("Fine") içerdiği için doküman
// lang="tr" olduğunda text-transform:uppercase Türkçe kurala göre "İ"
// üretip "FİNE ART BASKI" yazıyordu — bu öğe için lang="en" ile bunu
// engelliyoruz. "Baskı"daki noktasız ı hem Türkçe hem İngilizce
// kuralda aynı şekilde büyür (I), o yüzden lang="en" burada güvenli.
const NAV_LINKS = [
  { label: 'Ana Sayfa', to: '/' },
  { label: 'Fotoğraf Baskı', to: '/fotograf-baski' },
  { label: 'Fine Art Baskı', to: '/fine-art-baski', lang: 'en' },
  { label: 'Film Yıkama & Tarama', to: '/film-yikama-tarama' },
  { label: 'Çerçeve', to: '/cerceve' },
  { label: <><span lang="en">Fine Art</span> Seçkisi</>, to: '/isler' },
]

function Navbar({ cartCount = 0, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [customerName, setCustomerName] = useState(null)
  const navigate = useNavigate()

  // Önceden ana sayfada hero'nun üzerinde şeffaf + linkler sağa kaymış,
  // diğer sayfalarda opak + ortalı duruyordu — sayfa değiştikçe menü yer
  // değiştiriyordu ve şeffaf haldeyken linkler açık zeminde okunmuyordu.
  // Artık her sayfada aynı: her zaman opak, aynı hizada.
  const transparent = false

  useEffect(() => {
    async function loadCustomer(session) {
      if (!session) { setCustomerName(null); return }
      try {
        // Ad soyad, kayıt sırasında zaten auth kullanıcısının kendi
        // metadata'sına yazılıyor (bkz. Signup.jsx: options.data.full_name) —
        // ayrı bir "profiles" tablosuna gerek yok, doğrudan session'dan
        // okunuyor. "profiles" tablosu SADECE admin/müşteri ayrımı
        // (role) için var — bkz. 23_admin_roles_ve_rls_sikilastirma.sql.
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        // Admin hesabı navbar'da müşteri gibi görünmesin — Admin panelinde zaten kendi girişini görüyor.
        setCustomerName(profile?.role === 'admin' ? null : (session.user.user_metadata?.full_name || session.user.email))
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
                fontFamily: 'var(--font-heading)',
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
              lang={item.lang}
              style={{
                fontFamily: 'var(--font-body)',
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
                  Giriş Yap
                </Link>

                <Link to="/kayit" style={{
                  fontSize: '.68rem', letterSpacing: '.14em',
                  textTransform: 'uppercase', color: 'var(--bg)',
                  background: 'var(--accent)', padding: '.5rem 1rem'
                }}>
                  Üye Ol
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
              lang={item.lang}
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
                Giriş Yap
              </Link>

              <Link to="/kayit" onClick={() => setMenuOpen(false)} style={{
                fontSize: '.8rem', letterSpacing: '.16em',
                textTransform: 'uppercase', color: 'var(--bg)',
                background: 'var(--accent)', padding: '.7rem 1rem', textAlign: 'center'
              }}>
                Üye Ol
              </Link>
            </>
          )}

          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '.5rem', alignItems: 'center' }}>
            {SOCIAL_LINKS.map(s => (
              s.label === 'Etsy' ? (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: 'var(--font-body)', fontSize: '.7rem',
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
