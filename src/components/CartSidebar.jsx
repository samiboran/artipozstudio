import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import CheckoutModal from './CheckoutModal'

export default function CartSidebar({ open, onClose }) {
  const { items, removeItem, updateQty, total, clearCart, loggedIn } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleSuccess() {
    setCheckoutOpen(false)
    setSuccess(true)
    clearCart()
    setTimeout(() => { setSuccess(false); onClose() }, 3000)
  }

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)'
        }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 301,
        width: 'min(420px, 100vw)', background: '#fff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-body)'
      }}>

        <div style={{
          padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase' }}>
            Sepet {items.length > 0 && `(${items.length})`}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', color: 'var(--muted)', lineHeight: 1
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.8rem' }}>
          {success ? (
            <div style={{
              textAlign: 'center', paddingTop: '4rem',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem', color: '#4a9a6a', fontStyle: 'italic'
            }}>
              ✓ Siparişiniz alındı!<br />
              <span style={{ fontSize: '.85rem', color: '#aaa', fontStyle: 'normal' }}>En kısa sürede sizinle iletişime geçeceğiz.</span>
            </div>
          ) : items.length === 0 ? (
            <div style={{
              textAlign: 'center', paddingTop: '4rem',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem', color: 'var(--muted)', fontStyle: 'italic'
            }}>
              Sepetiniz boş
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} style={{
                display: 'flex', gap: '1rem', paddingBottom: '1.2rem',
                marginBottom: '1.2rem', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ width: 72, height: 90, flexShrink: 0, background: 'var(--surface)', overflow: 'hidden' }}>
                  {item.artwork.image_url
                    ? <img src={item.artwork.image_url} alt={item.artwork.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#eee' }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 500, marginBottom: '.2rem' }}>{item.artwork.title}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginBottom: '.5rem' }}>{item.size}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <button onClick={() => updateQty(item.key, item.qty - 1)} style={{ background: 'none', border: '1px solid var(--border)', width: 24, height: 24, cursor: 'pointer', fontSize: '.8rem' }}>−</button>
                      <span style={{ fontSize: '.8rem', minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, item.qty + 1)} style={{ background: 'none', border: '1px solid var(--border)', width: 24, height: 24, cursor: 'pointer', fontSize: '.8rem' }}>+</button>
                    </div>
                    <div style={{ fontSize: '.9rem', fontFamily: 'var(--font-heading)' }}>
                      ₺{(item.price * item.qty).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '.9rem', alignSelf: 'flex-start' }}>×</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && !success && (
          <div style={{ padding: '1.5rem 1.8rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Toplam</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>₺{total.toLocaleString('tr-TR')}</span>
            </div>
            {loggedIn ? (
              <button
                onClick={() => setCheckoutOpen(true)}
                style={{
                  width: '100%', padding: '.9rem', background: 'var(--ink)', color: '#fff', border: 'none',
                  fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer'
                }}>
                Ödemeye Geç
              </button>
            ) : (
              // Üyelik olmadan da satın alınabilsin (Etsy'deki gibi) — kayıt
              // olma ve misafir olarak devam etme aynı ağırlıkta iki seçenek.
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <Link to="/signup" onClick={onClose} style={{
                  width: '100%', padding: '.9rem', background: 'var(--ink)', color: '#fff', border: 'none',
                  fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', textAlign: 'center',
                  boxSizing: 'border-box', textDecoration: 'none', display: 'block',
                }}>
                  Üye Ol ve Devam Et
                </Link>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  style={{
                    width: '100%', padding: '.9rem', background: '#fff', color: 'var(--ink)',
                    border: '1px solid var(--ink)', fontSize: '.68rem', letterSpacing: '.2em',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}>
                  Kayıt Olmadan Devam Et
                </button>
              </div>
            )}
            <div style={{ fontSize: '.6rem', textAlign: 'center', color: 'var(--muted)', marginTop: '.8rem', letterSpacing: '.08em' }}>
              Ücretsiz kargo · Güvenli ödeme · 14 gün iade
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        total={total}
        onSuccess={handleSuccess}
      />
    </>
  )
}