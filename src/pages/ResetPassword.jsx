import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

// Kullanıcı, Login.jsx'teki "Şifremi unuttum" ile gönderilen e-postadaki
// linke tıklayınca buraya düşer. supabase-js, URL'deki recovery token'ı
// otomatik olarak yakalayıp geçici bir oturum açar ve PASSWORD_RECOVERY
// event'ini fırlatır — biz bunu bekleyip yeni şifre formunu ancak bu
// event geldikten sonra gösteriyoruz (linkin gerçekten geçerli/taze
// olduğunun tek güvenilir işareti bu).
function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Sayfa zaten açıkken event kaçırılmışsa (ör. hızlı yeniden render) —
    // geçerli bir oturum varsa formu yine de göster, tamamen kilitli kalmasın.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit() {
    setError('')
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return }
    if (password !== password2) { setError('Şifreler eşleşmiyor'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('Şifre güncellenemedi: ' + error.message); return }
    setDone(true)
    setTimeout(() => navigate('/'), 2000)
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

        {done ? (
          <div style={{ textAlign: 'center', fontSize: '.85rem', color: '#555' }}>
            Şifren güncellendi. Ana sayfaya yönlendiriliyorsun…
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', fontSize: '.85rem', lineHeight: 1.8, color: '#555' }}>
            Bağlantı doğrulanıyor…
            <div style={{ marginTop: '1.4rem', fontSize: '.78rem', color: '#888' }}>
              Bu ekranı doğrudan açtıysan ya da bağlantının süresi dolduysa,{' '}
              <Link to="/login" style={{ color: 'var(--accent, #122A96)' }}>giriş sayfasından</Link>{' '}
              "Şifremi unuttum"u tekrar dene.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '.82rem', color: '#666', margin: '0 0 .3rem' }}>
              Yeni şifreni belirle.
            </p>
            <input
              style={inp}
              type="password"
              placeholder="Yeni şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <input
              style={inp}
              type="password"
              placeholder="Yeni şifre (tekrar)"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />

            {error && (
              <div style={{ fontSize: '.75rem', color: '#cc4444', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '.8rem', background: '#111', color: '#fff',
                border: 'none', fontSize: '.7rem', letterSpacing: '.2em',
                textTransform: 'uppercase', cursor: 'pointer', marginTop: '.5rem'
              }}
            >
              {loading ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ResetPassword
