import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Hero from '../components/Hero'
import fotografDefault from '../assets/fine-art/ornek-botanik.jpg'
import fineArtDefault from '../assets/process/baski-sureci.jpg'
import cerceveDefault from '../assets/cerceve/ornek-ahsap-cerceve.jpg'
import kagitlarDefault from '../assets/fine-art/kagit-secenekleri.jpg'

const PRINT_SIZES = ['A4', 'A3', 'A2', 'A1', 'A0', 'B0', '150×230 cm']
const PRINT_MM = ['210×297', '297×420', '420×594', '594×841', '841×1189', '1030×1456', '1500×2300']
const PRINT_TIERS = [
  { label: '1 adet', prices: [750, 1200, 1800, 2700, 4500, 6000, 12000] },
  { label: '2-10', prices: [720, 1170, 1740, 2610, 4380, 5820, 11760] },
  { label: '11-50', prices: [705, 1140, 1680, 2550, 4230, 5640, 11640] },
  { label: '51-100', prices: [690, 1080, 1650, 2460, 4110, 5460, 11520] },
]
const PAYMENT_BADGES = ['Visa', 'Mastercard', 'TROY', 'Havale / EFT']

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
  const [papers, setPapers] = useState([])
  const [contact, setContact] = useState({
    isim: '', postaKodu: '', adres: '', email: '', telefon: '',
    odemeYontemi: '', numune: '', mesaj: '',
  })
  const [contactStatus, setContactStatus] = useState('idle') // idle | sent

  useEffect(() => {
    supabase.from('papers').select('name').order('sort_order').then(({ data }) => setPapers(data || []))
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
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => { if (!map[row.section]) map[row.section] = row.image_url })
        setImages(map)
      })
  }, [])

  return (
    <div>
      <Hero />

      {/* Hizmetlerimiz */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem' }}>
        <h2 style={{
          fontFamily: "'Archivo Black', sans-serif", fontWeight: 300,
          fontSize: '2.2rem', margin: '0 0 3rem', textAlign: 'left',
        }}>
          Hizmetlerimiz
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {HIZMETLER.map(h => (
            <div key={h.key}>
              <img
                src={images[h.key] || h.defaultImg}
                alt={h.title}
                style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', marginBottom: '1.2rem' }}
              />
              <p style={{ ...eyebrow, marginBottom: '.5rem' }}>{h.title.toUpperCase()}</p>
              <p style={{
                fontFamily: "'Archivo', sans-serif", fontSize: '.88rem', lineHeight: 1.7,
                color: 'var(--muted)', textAlign: 'left', margin: '0 0 1.2rem',
              }}>
                {h.desc}
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
          ))}
        </div>
      </section>

      {/* Sertifikalı Fine Art Kağıtları */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 2rem 5rem', textAlign: 'center' }}>
        <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.2rem' }}>
          Sertifikalı Fine Art Kağıtları
        </h2>
        <div style={{ width: 60, height: 1, background: 'var(--border)', margin: '0 auto 1.5rem' }} />
        <p style={{
          fontFamily: "'Archivo', sans-serif", fontSize: '.92rem', lineHeight: 1.8,
          color: 'var(--muted)', maxWidth: 640, margin: '0 auto 3rem',
        }}>
          Hahnemühle'nin arşivsel kalitedeki fine art kağıtlarıyla, eserlerinizde üstün renk
          doğruluğu, derin tonlar ve yüksek detay elde edilir. Her baskı, uzun yıllar boyunca
          ilk günkü etkisini koruyacak kalıcılık ve premium sunum anlayışıyla üretilir.
        </p>
        <div style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
          <img
            src={images['sertifikali-kagit'] || kagitlarDefault}
            alt="Hahnemühle fine art kağıt numuneleri"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </section>

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
          indirimli fiyat geçerlidir. Baskılarınızı 1 mm hassasiyetle özel ölçülerde de sipariş edebilirsiniz.
        </p>

        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Archivo', sans-serif", fontSize: '.82rem', minWidth: 640 }}>
            <thead>
              <tr style={{ background: 'var(--ink)' }}>
                <th style={{ padding: '.7rem .9rem', textAlign: 'left', color: '#fff', fontWeight: 600 }}>Size</th>
                {PRINT_SIZES.map(s => (
                  <th key={s} style={{ padding: '.7rem .9rem', textAlign: 'left', color: '#fff', fontWeight: 600 }}>{s}</th>
                ))}
              </tr>
              <tr style={{ background: 'var(--surface)' }}>
                <td style={{ padding: '.6rem .9rem', textAlign: 'left', color: 'var(--muted)' }}>mm</td>
                {PRINT_MM.map(mm => (
                  <td key={mm} style={{ padding: '.6rem .9rem', textAlign: 'left', color: 'var(--muted)' }}>{mm}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRINT_TIERS.map(tier => (
                <tr key={tier.label} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '.7rem .9rem', textAlign: 'left', color: 'var(--muted)' }}>{tier.label}</td>
                  {tier.prices.map((p, i) => (
                    <td key={i} style={{ padding: '.7rem .9rem', textAlign: 'left', color: 'var(--ink)' }}>
                      {p.toLocaleString('tr-TR')} TL
                    </td>
                  ))}
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '.9rem', flexWrap: 'wrap' }}>
          {PAYMENT_BADGES.map(b => (
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
          {FILE_PREP.map(item => (
            <div key={item.title} style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '2.2rem' }}>
              <h3 style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.95rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 .9rem' }}>
                {item.title}
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
                {item.text}
              </p>
            </div>
          ))}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={contactLabel}>E-posta *</label>
                <input name="email" type="email" required value={contact.email} onChange={updateContact} style={contactInput} placeholder="E-posta" />
              </div>
              <div>
                <label style={contactLabel}>Telefon *</label>
                <input name="telefon" type="tel" required value={contact.telefon} onChange={updateContact} style={contactInput} placeholder="Telefon" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={contactLabel}>Ödeme Yöntemi</label>
                <select name="odemeYontemi" value={contact.odemeYontemi} onChange={updateContact} style={contactInput}>
                  <option value="">Ödeme yöntemi seçin</option>
                  {PAYMENT_BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={contactLabel}>Fine Art Kağıt Numune Seti</label>
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
          <a href="mailto:info@fossilgarden.com" style={{
            fontFamily: "'Archivo', sans-serif", fontSize: '.82rem', color: 'var(--muted)',
          }}>
            info@fossilgarden.com
          </a>
        </div>
      </section>

    </div>
  )
}

export default Gallery