import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      paddingTop: '4.2rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '1.5rem'
    }}>
      <div style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 'clamp(6rem, 15vw, 12rem)',
        fontWeight: 300,
        lineHeight: 1,
        color: 'var(--border)',
        letterSpacing: '.1em'
      }}>
        404
      </div>

      <div style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 'clamp(1.4rem, 3vw, 2rem)',
        fontWeight: 300,
        color: 'var(--ink)'
      }}>
        Eser bulunamadı
      </div>

      <p style={{
        fontSize: '.75rem',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        maxWidth: 300,
        lineHeight: 1.8
      }}>
        Aradığın sayfa taşınmış ya da silinmiş olabilir.
      </p>

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '1rem',
          padding: '.8rem 2.5rem',
          background: 'var(--ink)',
          color: '#fff',
          border: 'none',
          fontSize: '.65rem',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}
      >
        Koleksiyona Dön
      </button>
    </div>
  )
}

export default NotFound