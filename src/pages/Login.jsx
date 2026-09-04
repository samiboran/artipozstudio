import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('Email veya şifre hatalı'); return }
    navigate('/admin')
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
      fontFamily: 'var(--font-body)'
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
        </div>

      </div>
    </div>
  )
}

export default Login