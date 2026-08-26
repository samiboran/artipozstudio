import { useState } from 'react'
import { getSessionId } from '../lib/session'

// Sami banka bilgilerini iletince buradaki placeholder'lar gerçek IBAN/hesap
// bilgileriyle değiştirilecek.
const BANK_INFO = {
  accountName: '[HESAP SAHİBİ ADI]',
  bankName: '[BANKA ADI]',
  iban: '[IBAN NUMARASI GİRİLECEK]',
}

export default function CheckoutModal({ open, onClose, items, total, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // 'form' → kişi bilgileri, 'bank' → sipariş oluşturuldu, havale bilgileri gösteriliyor
  const [step, setStep] = useState('form')

  if (!open) return null

  async function handleSubmit() {
    if (!form.email?.trim() || !form.email.includes('@')) {
  setError('Geçerli bir e-posta adresi giriniz.')
  return
}
    if (!form.phone?.trim() || form.phone.trim().length < 10) {
      setError('Geçerli bir telefon numarası giriniz.')
      return
    }
    if (!form.address?.trim() || form.address.trim().length < 10) {
      setError('Geçerli bir adres giriniz.')
      return
    }

    setSaving(true)
    setError('')

    // Dikkat: price GÖNDERMİYORUZ. Fiyat sunucuda (create-order fonksiyonu içinde)
    // artworks tablosundan yeniden hesaplanıyor, client'tan gelen fiyata güvenilmiyor.
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      session_id: getSessionId(),
      items: items.map(i => ({
        artwork_id: i.artwork.id,
        size: i.size,
        qty: i.qty,
      })),
    }

    try {
      const res = await fetch('https://qrbkzjosorimiwdbwyyl.supabase.co/functions/v1/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) { setSaving(false); setError(data.error || 'Sipariş gönderilemedi.'); return }
    } catch (e) {
      setSaving(false)
      setError('Sipariş gönderilemedi: bağlantı hatası.')
      return
    }

    setSaving(false)
    setStep('bank')
  }

  function handleClose() {
    setStep('form')
    onClose()
  }

  function handleDone() {
    setStep('form')
    onSuccess()
  }

  const inp = {
    width: '100%', padding: '.65rem .85rem',
    border: '1px solid #ddd', fontSize: '.85rem',
    fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', marginBottom: '.9rem'
  }

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)'
      }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 401,
        transform: 'translate(-50%, -50%)',
        width: 'min(480px, 92vw)',
        background: '#fff', padding: '2.5rem',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.8rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.7rem', fontWeight: 300, margin: 0 }}>
              {step === 'form' ? 'Sipariş Ver' : 'Ödeme Bilgileri'}
            </h2>
            <div style={{ fontSize: '.68rem', color: '#aaa', letterSpacing: '.1em', marginTop: '.3rem' }}>
              Toplam: ₺{total.toLocaleString('tr-TR')}
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#aaa' }}>×</button>
        </div>

        {step === 'form' ? (
          <>
            <input style={inp} placeholder="Ad Soyad *" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={inp} placeholder="E-posta *" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input style={inp} placeholder="Telefon *" value={form.phone} type="tel"
              onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, '') }))} />
            <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }}
              placeholder="Teslimat adresi *" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />

            <div style={{ background: '#fafafa', padding: '1rem', marginBottom: '1.2rem', fontSize: '.78rem', lineHeight: 1.8 }}>
              {items.map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.artwork.title} — {item.size} × {item.qty}</span>
                  <span>₺{(item.price * item.qty).toLocaleString('tr-TR')}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #eee', marginTop: '.6rem', paddingTop: '.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Toplam</span>
                <span>₺{total.toLocaleString('tr-TR')}</span>
              </div>
            </div>

            {error && <div style={{ color: '#cc4444', fontSize: '.78rem', marginBottom: '.8rem' }}>{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                width: '100%', padding: '.9rem',
                background: '#111', color: '#fff', border: 'none',
                fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1
              }}
            >
              {saving ? 'Gönderiliyor…' : 'Siparişi Onayla'}
            </button>

            <div style={{ fontSize: '.6rem', textAlign: 'center', color: '#aaa', marginTop: '.8rem', letterSpacing: '.08em' }}>
              Siparişiniz tarafımıza iletilecek, en kısa sürede sizinle iletişime geçeceğiz.
            </div>
          </>
        ) : (
          // Sipariş kaydedildi — havale/EFT ile ödeme yapılabilmesi için banka
          // bilgileri gösteriliyor. Ödeme onayı/tamamlanması ayrı bir aşama,
          // burada akış tamamlanmış sayılıyor.
          <>
            <div style={{ background: '#fafafa', padding: '1.4rem', marginBottom: '1.4rem', fontSize: '.85rem', lineHeight: 2 }}>
              <div style={{ fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#999', marginBottom: '.6rem' }}>
                Havale / EFT ile Ödeme
              </div>
              <div><strong>Hesap Sahibi:</strong> {BANK_INFO.accountName}</div>
              <div><strong>Banka:</strong> {BANK_INFO.bankName}</div>
              <div><strong>IBAN:</strong> {BANK_INFO.iban}</div>
            </div>
            <div style={{ fontSize: '.78rem', lineHeight: 1.8, color: '#555', marginBottom: '1.4rem' }}>
              Siparişiniz alındı. Ödemenizi yukarıdaki hesaba yapıp dekontu{' '}
              <a href="mailto:info@artipozstudio.com" style={{ color: 'var(--gold)' }}>info@artipozstudio.com</a>{' '}
              adresine iletebilirsiniz — ödemeniz onaylandığında siparişiniz işleme alınır.
            </div>
            <button
              onClick={handleDone}
              style={{
                width: '100%', padding: '.9rem',
                background: '#111', color: '#fff', border: 'none',
                fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Tamam
            </button>
          </>
        )}
      </div>
    </>
  )
}
