import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Hero from '../components/Hero'
import fotografDefault from '../assets/fine-art/ornek-botanik.jpg'
import fineArtDefault from '../assets/process/baski-sureci.jpg'
import cerceveDefault from '../assets/cerceve/ornek-ahsap-cerceve.jpg'

// "Sertifikalı Fine Art Kağıtları" grid'i — Sami'nin mailde gönderdiği 9
// kağıdın adı ve kısa bilgisi, mail/WhatsApp referansındaki sırayla (1→9).
// Görseller Admin > Ana Sayfa'dan yüklenecek (section: sertifikali-kagit-1..9).
const CERTIFIED_PAPERS = [
  { key: 'sertifikali-kagit-1', name: 'Museum Etching', info: '350 gsm · 100% Cotton · Natural White' },
  { key: 'sertifikali-kagit-2', name: 'German Etching®', info: '310 gsm · 100% α-Cellulose · White · Genuine Mould-Made Paper' },
  { key: 'sertifikali-kagit-3', name: 'Photo Rag® Ultra Smooth', info: '305 gsm · 100% Cotton · White' },
  { key: 'sertifikali-kagit-4', name: 'Photo Rag® Bright White', info: '310 gsm · 100% Cotton · Bright White' },
  { key: 'sertifikali-kagit-5', name: 'William Turner', info: '190 / 310 gsm · 100% Cotton · White · Genuine Mould-Made Paper' },
  { key: 'sertifikali-kagit-6', name: 'Photo Rag® Matt Baryta', info: '308 gsm · 100% Cotton · White' },
  { key: 'sertifikali-kagit-7', name: 'Photo Rag® Pearl', info: '320 gsm · 100% Cotton · Natural White · Pearl Finish' },
  { key: 'sertifikali-kagit-8', name: 'Bamboo', info: '290 gsm · 90% Bamboo Fibres · 10% Cotton · Natural White' },
  { key: 'sertifikali-kagit-9', name: 'Photo Rag® Duo', info: '276 gsm · 100% Cotton · White · Printable on Both Sides' },
]

const PRINT_PRICES = [
  { size: 'A4', mm: '210×297', price: 1240 },
  { size: 'A3', mm: '297×420', price: 2240 },
  { size: 'A2', mm: '420×594', price: 3640 },
]
// Marka isimlerini yazı yerine tanınabilir, basitleştirilmiş logo işaretleriyle
// gösteriyoruz (gerçek marka dosyaları değil, stilize inline SVG'ler).
const PAYMENT_LOGOS = [
  {
    key: 'visa', label: 'Visa',
    node: (
      <svg width="44" height="16" viewBox="0 0 44 16" role="img" aria-label="Visa">
        <text x="0" y="13" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="16" fill="#1A1F71">VISA</text>
      </svg>
    ),
  },
  {
    key: 'mastercard', label: 'Mastercard',
    node: (
      <svg width="38" height="22" viewBox="0 0 38 22" role="img" aria-label="Mastercard">
        <circle cx="14" cy="11" r="10" fill="#EB001B" />
        <circle cx="24" cy="11" r="10" fill="#F79E1B" fillOpacity=".85" />
      </svg>
    ),
  },
  {
    key: 'paypal', label: 'PayPal',
    node: (
      <svg width="58" height="16" viewBox="0 0 58 16" role="img" aria-label="PayPal">
        <text x="0" y="13" fontFamily="'Archivo', sans-serif" fontWeight="800" fontSize="15" fill="#003087">Pay</text>
        <text x="25" y="13" fontFamily="'Archivo', sans-serif" fontWeight="800" fontSize="15" fill="#009CDE">Pal</text>
      </svg>
    ),
  },
]
const PAYMENT_TEXT_BADGES = ['TROY', 'Havale / EFT']

const FILE_PREP = [
  {
    title: 'Dosya Formatı', badges: ['TIFF', 'JPG', 'PDF'],
    text: <>Önerilen formatlar: <b>TIFF, PSD, JPG ve PDF.</b> RGB dosyalarda gömülü renk profili bulunması önerilir.</>,
  },
  {
    title: 'Renk Profili', badges: [],
    text: <><b>RGB çalışma alanında sRGB veya Adobe RGB</b> tercih edilebilir. Renk profili gömülmemiş dosyalar, varsayılan profil ile değerlendirilerek baskıya alınabilir.</>,
  },
  {
    title: 'Taşma Payı ve Kesim', badges: [],
    text: <>Kenara kadar baskı istenen çalışmalarda, dosyanıza her kenardan <b>3 mm taşma payı</b> eklenmelidir. Taşma payı bulunmayan dosyalarda kesim sırasında görselde çok küçük kayıplar oluşabilir. Beyaz kenarlıklı işler için net ölçü ve boşlukların dosyada doğru tanımlanması önemlidir.</>,
  },
]

const displayHeading = { fontFamily: "'Playfair Display', serif", fontWeight: 600, color: 'var(--ink)' }

const HIZMETLER = [
  {
    key: 'hizmet-fotograf', to: '/fotograf-baski', title: 'Fotoğraf Baskı', defaultImg: fotografDefault,
    desc: 'Mat, yarı mat, parlak ve saten yüzey seçenekli fotoğraf kağıtlarına, yüksek çözünürlükte profesyonel dijital fotoğraf baskıları üretiyoruz.',
  },
  {
    key: 'hizmet-fine-art', to: '/fine-art-baski', title: 'Fine Art Baskı', defaultImg: fineArtDefault,
    desc: 'Fine art baskı hizmetimizle, arşivlik pigment mürekkepler ve özel sanat kağıtları kullanarak eserlerinizi yüksek kalite, doğru renk ve uzun ömürle sunuyoruz.',
  },
  {
    key: 'hizmet-cerceve', to: '/cerceve', title: 'Çerçeveler', defaultImg: cerceveDefault,
    desc: 'Eserlerinizi tamamlayan estetik ve koruyucu çerçeve çözümlerini, farklı ölçü ve tarz seçenekleriyle sunarak baskılarımızı sergilemeye hazır hale getiriyoruz.',
  },
]

const eyebrow = { fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }

const contactLabel = { display: 'block', marginBottom: '.4rem', fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)' }
const contactInput = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

function Gallery() {
  const [images, setImages] = useState({})
  const [content, setContent] = useState({})
  const [papers, setPapers] = useState([])
  const [contact, setContact] = useState({
    isim: '', postaKodu: '', adres: '', email: '', telefon: '',
    odemeYontemi: '', numune: '', mesaj: '',
  })
  const [contactStatus, setContactStatus] = useState('idle') // idle | sent

  useEffect(() => {
    supabase.from('papers').select('name').order('sort_order')
      .then(({ data }) => setPapers(data || []))
      .catch(err => console.error('Kağıtlar yüklenemedi:', err))
  }, [])

  function updateContact(e) {
    const { name, value } = e.target
    setContact(c => ({ ...c, [name]: value }))
  }

  function submitContact(e) {
    e.preventDefault()
    // TODO: gerçek gönderim henüz bağlı değil — Cerceve.jsx'teki sipariş formuyla
    // birlikte, checkout'taki create-order deseniyle bağlanması gerekiyor
    setContactStatus('sent')
  }

  useEffect(() => {
    supabase
      .from('page_images')
      .select('section, image_url')
      .eq('page', 'gallery')
      .order('sort_order')
      .order('id')
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => { if (!map[row.section]) map[row.section] = row.image_url })
        setImages(map)
      })
      .catch(err => console.error('Ana sayfa görselleri yüklenemedi:', err))

    supabase
      .from('page_content')
      .select('section, content')
      .eq('page', 'gallery')
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => { if (row.content) map[row.section] = row.content })
        setContent(map)
      })
      .catch(err => console.error('Ana sayfa metinleri yüklenemedi:', err))
  }, [])

  return (
    <div>
      <Hero />

      {/* Hizmetlerimiz */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem' }}>
        <h2 style={{
          ...displayHeading,
          fontSize: '2.2rem', margin: '0 0 3rem', textAlign: 'left',
        }}>
          Hizmetlerimiz
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {HIZMETLER.map(h => {
            const title = content[`${h.key}-baslik`] || h.title
            const desc = content[`${h.key}-aciklama`] || h.desc
            return (
            <div key={h.key}>
              <img
                src={images[h.key] || h.defaultImg}
                alt={title}
                style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', marginBottom: '1.2rem' }}
              />
              <p style={{ ...eyebrow, fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>{title.toUpperCase()}</p>
              <p style={{
                fontFamily: "'Archivo', sans-serif", fontSize: '.88rem', lineHeight: 1.7,
                color: 'var(--muted)', textAlign: 'left', margin: '0 0 1.2rem',
              }}>
                {desc}
              </p>
              <Link to={h.to} style={{
                display: 'inline-block', padding: '.6rem 1.3rem',
                border: '1px solid var(--ink)', color: 'var(--ink)',
                fontFamily: "'Archivo', sans-serif", fontSize: '.68rem',
                letterSpacing: '.14em', textTransform: 'uppercase',
              }}>
                İncele
              </Link>
            </div>
            )
          })}
        </div>
      </section>

      {/* Sertifikalı Fine Art Kağıtları */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 3rem', textAlign: 'center' }}>
        <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.2rem' }}>
          Sertifikalı Fine Art Kağıtları
        </h2>
        <div style={{ width: 60, height: 1, background: 'var(--border)', margin: '0 auto 1.5rem' }} />
        <p style={{
          fontFamily: "'Archivo', sans-serif", fontSize: '.92rem', lineHeight: 1.8,
          color: 'var(--muted)', maxWidth: 900, margin: '0 auto',
        }}>
          {content['sertifikali-kagit-aciklama'] || `Hahnemühle'nin arşivsel kalitedeki fine art kağıtlarıyla, eserlerinizde üstün renk
          doğruluğu, derin tonlar ve yüksek detay elde edilir. Her baskı, uzun yıllar boyunca
          ilk günkü etkisini koruyacak kalıcılık ve premium sunum anlayışıyla üretilir.`}
        </p>
      </section>
      {/* Kağıt grid'i — referans tasarımdaki gibi koyu zeminde, sayfa
          genişliğinin dışına taşıp tam ekran genişliğinde (full-bleed). */}
      <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', background: '#111', padding: '3rem 2rem', marginBottom: '5rem' }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem',
        }}>
          {CERTIFIED_PAPERS.map(paper => (
            <div key={paper.key}>
              <div style={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', background: '#1a1a1a', marginBottom: '1rem' }}>
                {images[paper.key] ? (
                  <img
                    src={images[paper.key]}
                    alt={paper.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', textAlign: 'center', padding: '1rem',
                    fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', color: 'rgba(255,255,255,.4)',
                  }}>
                    {`${paper.name} — Admin'den yükle`}
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: 10, left: 10, background: '#fff', color: '#111',
                  fontFamily: "'Archivo', sans-serif", fontSize: '.56rem', fontWeight: 600,
                  letterSpacing: '.1em', textTransform: 'uppercase', padding: '.3rem .6rem',
                }}>
                  Hahnemühle
                </span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#fff', fontSize: '1.05rem', margin: '0 0 .4rem' }}>
                {paper.name}
              </h3>
              <p lang="en" style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.78rem', lineHeight: 1.6, color: 'rgba(255,255,255,.6)', margin: 0 }}>
                {paper.info}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Baskı Ölçüleri ve Fiyatları */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 5rem', textAlign: 'center' }}>
        <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.2rem' }}>
          Baskı Ölçüleri ve Fiyatları
        </h2>
        <p style={{
          fontFamily: "'Archivo', sans-serif", fontSize: '.92rem', fontWeight: 600,
          color: 'var(--ink)', margin: '0 0 .6rem',
        }}>
          Tüm fine art kağıt seçeneklerinde sabit fiyat avantajı
        </p>
        <p style={{
          fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', lineHeight: 1.8,
          color: 'var(--muted)', maxWidth: 700, margin: '0 auto 2.5rem',
        }}>
          Aynı ölçü ve aynı kağıt türünde hazırlanan baskılarda, farklı görseller için de aynı
          fiyat geçerlidir. Baskılarınızı 1 mm hassasiyetle özel ölçülerde de sipariş edebilirsiniz.
        </p>

        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', maxWidth: 480, margin: '0 auto', borderCollapse: 'collapse', fontFamily: "'Archivo', sans-serif", fontSize: '.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--ink)' }}>
                <th style={{ padding: '.7rem .9rem', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Boy</th>
                <th style={{ padding: '.7rem .9rem', textAlign: 'left', color: '#fff', fontWeight: 600 }}>mm</th>
                <th style={{ padding: '.7rem .9rem', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {PRINT_PRICES.map(row => (
                <tr key={row.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '.7rem .9rem', textAlign: 'left', color: 'var(--ink)', fontWeight: 600 }}>{row.size}</td>
                  <td style={{ padding: '.7rem .9rem', textAlign: 'left', color: 'var(--muted)' }}>{row.mm}</td>
                  <td style={{ padding: '.7rem .9rem', textAlign: 'left', color: 'var(--ink)' }}>
                    {row.price.toLocaleString('tr-TR')} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          textAlign: 'left', fontFamily: "'Archivo', sans-serif", fontSize: '.76rem',
          lineHeight: 1.9, color: 'var(--muted)', marginBottom: '2rem',
        }}>
          <p style={{ margin: 0 }}>Belirtilen fiyatlara KDV, kargo ve özel paketleme hizmeti dahil değildir.</p>
          <p style={{ margin: 0 }}>Baskılarınız, ödeme onayını takiben 2–3 iş günü içerisinde özenle hazırlanır.</p>
          <p style={{ margin: 0 }}>Aynı gün üretim planlaması için dosyaların 15:00'e kadar iletilmesi tavsiye edilir.</p>
          <p style={{ margin: 0 }}>Ödeme: havale/EFT ve online ödeme yöntemleriyle kabul edilmektedir.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.9rem', flexWrap: 'wrap' }}>
          {PAYMENT_LOGOS.map(p => (
            <span key={p.key} style={{
              padding: '.55rem 1.1rem', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center',
            }}>
              {p.node}
            </span>
          ))}
          {PAYMENT_TEXT_BADGES.map(b => (
            <span key={b} style={{
              padding: '.55rem 1.1rem', border: '1px solid var(--border)',
              fontFamily: "'Archivo', sans-serif", fontSize: '.72rem',
              fontWeight: 600, color: 'var(--muted)',
            }}>
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Baskı İçin Dosya Hazırlığı */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.2rem' }}>
            Baskı İçin Dosya Hazırlığı
          </h2>
          <p style={{
            fontFamily: "'Archivo', sans-serif", fontSize: '.88rem', lineHeight: 1.8,
            color: 'var(--muted)', maxWidth: 640, margin: '0 auto',
          }}>
            En iyi baskı sonucunu alabilmek için dosyalarınızı aşağıdaki teknik kriterlere göre
            hazırlayabilirsiniz. Özel bir durum varsa sipariş öncesinde bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.2rem' }}>
          {FILE_PREP.map((item, i) => {
            const n = i + 1
            const title = content[`dosya-hazirlik-${n}-baslik`] || item.title
            const desc = content[`dosya-hazirlik-${n}-aciklama`]
            return (
            <div key={item.title} style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '2.2rem' }}>
              <h3 style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.95rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 .9rem' }}>
                {title}
              </h3>
              {item.badges.length > 0 && (
                <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.9rem' }}>
                  {item.badges.map(b => (
                    <span key={b} style={{
                      padding: '.4rem .8rem', border: '1px solid var(--border)',
                      fontFamily: "'Archivo', sans-serif", fontSize: '.68rem',
                      fontWeight: 600, color: 'var(--muted)',
                    }}>
                      {b}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', lineHeight: 1.8, color: 'var(--muted)', margin: 0 }}>
                {desc || item.text}
              </p>
            </div>
            )
          })}
        </div>
      </section>

      {/* İletişim üstü görsel alanı — telifli olabilecek referans görsel kullanılmadı, Admin'den yüklenebilir */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        {images['iletisim-gorsel'] ? (
          <div style={{ width: '100%', aspectRatio: '16 / 7', overflow: 'hidden' }}>
            <img
              src={images['iletisim-gorsel']}
              alt="İletişim"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{
            width: '100%', aspectRatio: '16 / 7', background: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Archivo', sans-serif", fontSize: '.7rem',
            letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)',
          }}>
            Görsel — Admin → Görseller'den yükle
          </div>
        )}
      </div>

      {/* Sipariş & İletişim */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '4rem 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.5rem' }}>
            Sipariş &amp; İletişim
          </h2>
          <div style={{
            fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', lineHeight: 1.9,
            color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <p style={{ margin: 0 }}>Sipariş, teklif talebi ve tüm sorularınız için bizimle iletişime geçebilirsiniz.</p>
            <p style={{ margin: 0 }}>Baskı sürecine uygun kağıt seçimi, ölçü ve adet planlaması konusunda size memnuniyetle destek oluruz.</p>
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
              fontFamily: "'Archivo', sans-serif", fontSize: '.7rem',
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
            fontFamily: "'Archivo', sans-serif", fontSize: '.88rem', color: 'var(--muted)',
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
                <label style={contactLabel}>Posta Kodu *</label>
                <input name="postaKodu" required value={contact.postaKodu} onChange={updateContact} style={contactInput} placeholder="Posta kodu" />
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              <div>
                <label style={contactLabel}>Ödeme Yöntemi</label>
                <select name="odemeYontemi" value={contact.odemeYontemi} onChange={updateContact} style={contactInput}>
                  <option value="">Ödeme yöntemi seçin</option>
                  {[...PAYMENT_LOGOS.map(p => p.label), ...PAYMENT_TEXT_BADGES].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={contactLabel}><span lang="en">Fine</span> Art Kağıt Numune Seti</label>
                <select name="numune" value={contact.numune} onChange={updateContact} style={contactInput}>
                  <option value="">Numune seçin</option>
                  {papers.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={contactLabel}>
                Mesaj * <span style={{ textTransform: 'none', letterSpacing: 0 }}>(Sipariş verirken lütfen teslimat adresinizi ve telefon numaranızı belirtin!)</span>
              </label>
              <textarea
                name="mesaj" required maxLength={500} value={contact.mesaj} onChange={updateContact}
                style={{ ...contactInput, minHeight: 110, resize: 'vertical' }}
                placeholder="Mesajınızı buraya yazın"
              />
              <div style={{ textAlign: 'right', fontSize: '.68rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                {contact.mesaj.length}/500
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: '.5rem', padding: '.9rem', background: 'var(--ink)',
                color: '#fff', border: 'none', fontFamily: "'Archivo', sans-serif",
                fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Gönder
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center', marginTop: '3rem', paddingTop: '2rem',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{ ...eyebrow, marginBottom: '.6rem' }}>İstanbul, Taksim Meydanı</p>
          <a href="mailto:info@artipozstudio.com" style={{
            fontFamily: "'Archivo', sans-serif", fontSize: '.82rem', color: 'var(--muted)',
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
            fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', letterSpacing: '.1em',
            textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap',
          }}>
            Google Maps'te Aç
          </span>
        </a>
      </section>

    </div>
  )
}

export default Gallery