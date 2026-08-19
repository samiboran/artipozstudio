import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignup() {
    setLoading(true)
    setError('')

    if (!name.trim()) { setError('Lütfen adını gir'); setLoading(false); return }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı'); setLoading(false); return }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    })
    setLoading(false)
    if (error) { setError(error.message === 'User already registered' ? 'Bu e-posta zaten kayıtlı' : 'Kayıt olunamadı: ' + error.message); return }
    navigate('/')
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
      fontFamily: "'DM Sans', sans-serif", paddingTop: '4.2rem'
    }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 2rem' }}>

        <div style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '1.8rem', fontWeight: 300,
          textAlign: 'center', marginBottom: '2.5rem',
          letterSpacing: '.1em'
        }}>
          Artı Poz
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            style={inp}
            type="text"
            placeholder="Ad Soyad"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={inp}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            style={inp}
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSignup()}
          />

          {error && (
            <div style={{ fontSize: '.75rem', color: '#cc4444', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              padding: '.8rem', background: '#111', color: '#fff',
              border: 'none', fontSize: '.7rem', letterSpacing: '.2em',
              textTransform: 'uppercase', cursor: 'pointer', marginTop: '.5rem'
            }}
          >
            {loading ? 'Kaydediliyor…' : 'Kayıt Ol'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '.78rem', color: '#888', marginTop: '.5rem' }}>
            Zaten hesabın var mı? <Link to="/login" style={{ color: 'var(--accent, #122A96)' }}>Giriş yap</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Signup
