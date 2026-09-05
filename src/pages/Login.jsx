import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // 'login' → normal giriş formu, 'forgot' → yalnızca e-posta isteyip
  // sıfırlama linki gönderen ekran, 'forgot-sent' → link gönderildi mesajı.
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('Email veya şifre hatalı'); return }
    // Önceden burası her zaman /admin'e yönlendiriyordu — artık üyelik
    // herkese açık olduğu için normal bir müşteri de buradan giriş yapıyor,
    // /admin'e atılıp oradan geri /'e sekmesine gerek yok.
    navigate('/')
  }

  async function handleForgotSubmit() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    })
    setLoading(false)
    // Supabase güvenlik gereği kayıtlı olmayan bir e-posta için de "hata"
    // döndürmeyebilir/döndürebilir — hangisi olursa olsun aynı "gönderildi"
    // mesajını gösteriyoruz, aksi halde bu ekran hangi e-postaların kayıtlı
    // olduğunu dışarıya sızdıran bir araca dönüşür.
    if (error) console.error('Şifre sıfırlama isteği:', error)
    setMode('forgot-sent')
  }

  const inp = {
    width: '100%', padding: '.7rem 1rem',
    border: '1px solid #ddd', fontSize: '.85rem',
    fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', paddingTop: '4.2rem'
    }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 2rem' }}>

        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.8rem', fontWeight: 300,
          textAlign: 'center', marginBottom: '2.5rem',
          letterSpacing: '.1em'
        }}>
          Artı Poz
        </div>

        {mode === 'forgot-sent' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', border: '2px solid #111',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.4rem',
              fontSize: '1.3rem',
            }}>
              ✓
            </div>
            <p style={{ fontSize: '.85rem', lineHeight: 1.8, color: '#555' }}>
              Bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı
              gönderildi. E-postanı (ve spam/gereksiz klasörünü) kontrol et.
            </p>
            <div style={{ textAlign: 'center', fontSize: '.78rem', color: '#888', marginTop: '1.4rem' }}>
              <Link to="/login" onClick={() => setMode('login')} style={{ color: 'var(--accent, #122A96)' }}>
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        ) : mode === 'forgot' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '.82rem', color: '#666', margin: '0 0 .3rem' }}>
              Hesabına kayıtlı e-posta adresini gir, sana şifreni sıfırlaman için bir bağlantı gönderelim.
            </p>
            <input
              style={inp}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()}
            />

            {error && (
              <div style={{ fontSize: '.75rem', color: '#cc4444', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleForgotSubmit}
              disabled={loading || !email.trim()}
              style={{
                padding: '.8rem', background: '#111', color: '#fff',
                border: 'none', fontSize: '.7rem', letterSpacing: '.2em',
                textTransform: 'uppercase', cursor: 'pointer', marginTop: '.5rem',
                opacity: loading || !email.trim() ? .6 : 1,
              }}
            >
              {loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '.78rem', color: '#888', marginTop: '.5rem' }}>
              <a href="#" onClick={e => { e.preventDefault(); setMode('login'); setError('') }} style={{ color: 'var(--accent, #122A96)' }}>
                Giriş sayfasına dön
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              style={inp}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <input
              style={inp}
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />

            {error && (
              <div style={{ fontSize: '.75rem', color: '#cc4444', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                padding: '.8rem', background: '#111', color: '#fff',
                border: 'none', fontSize: '.7rem', letterSpacing: '.2em',
                textTransform: 'uppercase', cursor: 'pointer', marginTop: '.5rem'
              }}
            >
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '.78rem', color: '#888', marginTop: '.5rem' }}>
              <a href="#" onClick={e => { e.preventDefault(); setMode('forgot'); setError('') }} style={{ color: 'var(--accent, #122A96)' }}>
                Şifremi unuttum
              </a>
            </div>
            <div style={{ textAlign: 'center', fontSize: '.78rem', color: '#888' }}>
              Hesabın yok mu? <Link to="/kayit" style={{ color: 'var(--accent, #122A96)' }}>Kayıt ol</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Login
