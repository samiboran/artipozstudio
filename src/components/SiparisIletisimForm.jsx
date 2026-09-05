import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { SIZE_MM } from '../lib/artworks'

// Ana Sayfa'nın altındaki "Sipariş & İletişim" formuyla birebir aynı
// bileşen — Fine Art Baskı sayfasının altında da kullanılıyor. Sami'nin
// kararı: Fine Art Baskı için ayrı bir yükleme + fiyat matrisi + sepet
// akışı kurulmasına gerek yok, bu form ikisi için de yeterli. Kopyala-
// yapıştır ikinci bir kod kopyası oluşturmamak için tek bileşen olarak
// çıkarıldı; `source` ve `showDigitalPapers` prop'larıyla sayfaya göre
// davranışı ayarlanıyor.
//
// - `source`: bu formun hangi sayfada göründüğü ('ana-sayfa' |
//   'fine-art-baski') — hem contact_messages kaydına hem e-postalara
//   geçiyor ki gelen talebin nereden geldiği belli olsun.
// - `showDigitalPapers`: Kodak dijital baskı (Fotoğraf Baskı hizmeti)
//   kağıt seçeneklerinin listede görünüp görünmeyeceği. Fine Art Baskı
//   sayfasında bu "dijital baskı" seçenekleri anlamsız olduğu için
//   false geçiliyor — sabit bir kod dışlaması değil, bileşene verilen
//   bir parametre.
const KODAK_PAPERS = ['Kodak Mat', 'Kodak Parlak']

const eyebrow = { fontFamily: 'var(--font-body)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }
const displayHeading = { fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--ink)' }
const contactLabel = { display: 'block', marginBottom: '.4rem', fontFamily: 'var(--font-body)', fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)' }
const contactInput = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

export default function SiparisIletisimForm({ source, showDigitalPapers = true }) {
  const [papers, setPapers] = useState([])
  const [contact, setContact] = useState({
    isim: '', postaKodu: '', adres: '', email: '', telefon: '',
    numune: '', boyut: '', mesaj: '',
  })
  const [contactStatus, setContactStatus] = useState('idle') // idle | submitting | sent
  const [contactError, setContactError] = useState('')

  useEffect(() => {
    supabase.from('papers').select('name').order('sort_order')
      .then(({ data }) => setPapers(data || []))
      .catch(err => console.error('Kağıtlar yüklenemedi:', err))
  }, [])

  function updateContact(e) {
    const { name, value } = e.target
    setContact(c => ({ ...c, [name]: value }))
  }

  async function submitContact(e) {
    e.preventDefault()
    setContactError('')
    setContactStatus('submitting')

    try {
      const res = await fetch('https://qrbkzjosorimiwdbwyyl.supabase.co/functions/v1/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ ...contact, session_id: getSessionId(), source }),
      })
      const data = await res.json()
      if (!res.ok) { setContactStatus('idle'); setContactError(data.error || 'Mesaj gönderilemedi.'); return }
    } catch {
      setContactStatus('idle')
      setContactError('Mesaj gönderilemedi: bağlantı hatası.')
      return
    }

    setContactStatus('sent')
  }

  return (
    <section id="siparis-iletisim" className="gs-contact" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.5rem' }}>
          Sipariş &amp; İletişim
        </h2>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '.85rem', lineHeight: 1.9,
          color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <p style={{ margin: 0 }}>Sipariş, teklif talebi ve tüm sorularınız için bizimle iletişime geçebilirsiniz.</p>
          <p style={{ margin: 0 }}>
            Talebinizi iletirken tercih ettiğiniz <b>kağıt türü, baskı ölçüsü ve adet bilgisi</b>ni
            paylaşmanız hazırlık sürecini kolaylaştırır.
          </p>
          <p style={{ margin: 0 }}>
            Aynı gün değerlendirme için son dosya iletim saati: 15.00. Ödemesi{' '}
            <b>17.00'ye kadar tamamlanan siparişler</b>, üretim planına bağlı olarak aynı gün işleme alınabilir.
          </p>
          <p style={{ margin: 0 }}>Dosya teslimi için lütfen WeTransfer üzerinden paylaşım yapınız.</p>
        </div>

        <a
          href="https://wetransfer.com" target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-block', marginTop: '1.5rem', padding: '.7rem 1.6rem',
            border: '1px solid var(--ink)', color: 'var(--ink)',
            fontFamily: 'var(--font-body)', fontSize: '.7rem',
            letterSpacing: '.14em', textTransform: 'uppercase',
          }}
        >
          WeTransfer
        </a>
      </div>

      {contactStatus === 'sent' ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '2rem', textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: '.88rem', color: 'var(--muted)',
        }}>
          Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.
        </div>
      ) : (
        <form onSubmit={submitContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            <div>
              <label style={contactLabel}>İsim *</label>
              <input name="isim" required value={contact.isim} onChange={updateContact} style={contactInput} placeholder="İsim" />
            </div>
            <div>
              <label style={contactLabel}>Posta Kodu</label>
              <input name="postaKodu" value={contact.postaKodu} onChange={updateContact} style={contactInput} placeholder="Posta kodu" />
            </div>
          </div>

          <div>
            <label style={contactLabel}>Adres *</label>
            <input name="adres" required value={contact.adres} onChange={updateContact} style={contactInput} placeholder="Adres" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
            <div>
              <label style={contactLabel}>E-posta *</label>
              <input name="email" type="email" required value={contact.email} onChange={updateContact} style={contactInput} placeholder="E-posta" />
            </div>
            <div>
              <label style={contactLabel}>Telefon *</label>
              <input name="telefon" type="tel" required value={contact.telefon} onChange={updateContact} style={contactInput} placeholder="Telefon" />
            </div>
          </div>

          <div>
            <label style={contactLabel}>Kağıt Seçenekleri</label>
            <select name="numune" value={contact.numune} onChange={updateContact} style={contactInput}>
              <option value="">Kağıt seçin</option>
              <optgroup label="Fine Art Kağıtlar">
                {papers.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </optgroup>
              {showDigitalPapers && (
                <optgroup label="Kodak Dijital Baskı Kağıtları">
                  {KODAK_PAPERS.map(name => <option key={name} value={name}>{name}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label style={contactLabel}>Boyut</label>
            <select name="boyut" value={contact.boyut} onChange={updateContact} style={contactInput}>
              <option value="">Boyut seçin</option>
              {Object.entries(SIZE_MM).map(([label, mm]) => (
                <option key={label} value={label}>{label} — {mm}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={contactLabel}>Mesaj *</label>
            <textarea
              name="mesaj" required maxLength={500} value={contact.mesaj} onChange={updateContact}
              style={{ ...contactInput, minHeight: 110, resize: 'vertical' }}
              placeholder="Mesajınızı buraya yazın"
            />
            <div style={{ textAlign: 'right', fontSize: '.68rem', color: 'var(--muted)', marginTop: '.2rem' }}>
              {contact.mesaj.length}/500
            </div>
          </div>

          {contactError && <div style={{ color: '#c33', fontSize: '.78rem' }}>{contactError}</div>}

          <button
            type="submit"
            disabled={contactStatus === 'submitting'}
            style={{
              marginTop: '.5rem', padding: '.9rem', background: 'var(--ink)',
              color: '#fff', border: 'none', fontFamily: 'var(--font-body)',
              fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
              cursor: contactStatus === 'submitting' ? 'not-allowed' : 'pointer',
              opacity: contactStatus === 'submitting' ? .7 : 1,
            }}
          >
            {contactStatus === 'submitting' ? 'Gönderiliyor…' : 'Gönder'}
          </button>
        </form>
      )}

      <div style={{
        textAlign: 'center', marginTop: '3rem', paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
      }}>
        <p style={{ ...eyebrow, marginBottom: '.6rem' }}>İstanbul, Taksim Meydanı</p>
        <a href="mailto:info@artipozstudio.com" style={{
          fontFamily: 'var(--font-body)', fontSize: '.82rem', color: 'var(--muted)',
        }}>
          info@artipozstudio.com
        </a>
      </div>

      {/* Haritaya tıklayınca Google Maps'e yönlendirir — adres henüz kesin
          pinlenmedi, sadece genel konum aranıyor. */}
      <a
        href="https://www.google.com/maps/search/?api=1&query=Taksim+Meydan%C4%B1%2C+%C4%B0stanbul"
        target="_blank" rel="noopener noreferrer"
        aria-label="Google Maps'te görüntüle"
        style={{
          display: 'block', marginTop: '2rem', width: '100%', aspectRatio: '21 / 8',
          position: 'relative', overflow: 'hidden', background: 'var(--surface)',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 840 320" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
          <rect width="840" height="320" fill="var(--surface)" />
          <g stroke="var(--border)" strokeWidth="2" opacity=".9">
            <line x1="0" y1="60" x2="840" y2="90" />
            <line x1="0" y1="160" x2="840" y2="140" />
            <line x1="0" y1="260" x2="840" y2="230" />
            <line x1="120" y1="0" x2="200" y2="320" />
            <line x1="420" y1="0" x2="380" y2="320" />
            <line x1="700" y1="0" x2="660" y2="320" />
          </g>
          <circle cx="420" cy="150" r="120" fill="var(--border)" opacity=".35" />
          <path d="M420 90 c-28 0-50 22-50 50 0 37 50 90 50 90s50-53 50-90c0-28-22-50-50-50z" fill="var(--accent)" />
          <circle cx="420" cy="140" r="18" fill="#fff" />
        </svg>
        <span style={{
          position: 'absolute', bottom: '.9rem', left: '50%', transform: 'translateX(-50%)',
          background: '#fff', border: '1px solid var(--border)', padding: '.5rem 1rem',
          fontFamily: 'var(--font-body)', fontSize: '.68rem', letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap',
        }}>
          Google Maps'te Aç
        </span>
      </a>
    </section>
  )
}
