import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchArtworks, SIZE_MM } from '../lib/artworks'
import Hero from '../components/Hero'
import ArtCard from '../components/ArtCard'
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
  { key: 'sertifikali-kagit-10', name: 'Photo Rag®', info: '308 gsm · 100% Cotton · White · Matt' },
]

// Marka isimlerini yazı yerine tanınabilir, basitleştirilmiş logo işaretleriyle
// gösteriyoruz (gerçek marka dosyaları değil, stilize inline SVG'ler).
// Not: Sami "ödeme yöntemi ve visa/troy vs. şimdilik kaldırılsın, sonra
// ihtiyacımız olduğunda ekleriz" dedi — İletişim formundaki Ödeme Yöntemi
// seçimi kaldırıldı, bu sabitler şu an kullanılmıyor ama ileride tekrar
// eklenebilsin diye burada duruyor.
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

// Ana Sayfa'daki "Baskı İçin Dosya Hazırlığı" görsel-kart bölümü — 5 eşit
// genişlikte fotoğraf kartı, hepsi aynı tasarımda (fotoğraf + alt-sol
// başlık + altında ok). Sonuncusu (Dosya Gönderimi) aynı tasarımda ama
// ok yerine kısa bir açıklama + "Detayları Gör" linki gösteriyor.
// Görseller Admin > Görseller'den yüklenecek (section: ...-gorsel).
const FILE_PREP_CARDS = [
  { key: 'dosya-format', title: 'Dosya Formatı' },
  { key: 'renk-profili', title: 'Renk Profili' },
  { key: 'cozunurluk-olcu', title: 'Çözünürlük ve Ölçü' },
  { key: 'tasma-payi', title: 'Taşma Payı ve Kesim' },
  { key: 'dosya-gonderimi', title: 'Dosya Gönderimi', hasDesc: true },
]

const displayHeading = { fontFamily: "'Playfair Display', serif", fontWeight: 600, color: 'var(--ink)' }

const HIZMETLER = [
  {
    key: 'hizmet-fotograf', to: '/fotograf-baski', title: 'Fotoğraf Baskı', defaultImg: fotografDefault,
    desc: 'Kodak ve profesyonel fotoğraf kağıtları ile mat, parlak veya saten yüzey seçenekleri.',
  },
  {
    key: 'hizmet-fine-art', to: '/fine-art-baski', title: 'Fine Art / Giclée Baskı', defaultImg: fineArtDefault,
    desc: 'Hahnemühle arşiv kağıtları ve pigment mürekkeplerle, müze kalitesinde fine art baskılar.',
  },
  {
    key: 'hizmet-edisyon', to: '/fine-art-baski', title: 'Edisyon & Art Print Üretimi',
    desc: 'Sanatçılar için sınırlı sayıda edisyon, numaralandırma, imza ve sertifika desteği.',
  },
  {
    key: 'hizmet-poster', to: '/fotograf-baski', title: 'Poster & Kartpostal Baskı',
    desc: 'Poster, kartpostal ve küçük format baskılarınız için yüksek kaliteli çözümler.',
  },
  {
    key: 'hizmet-sergi', to: '/fine-art-baski', title: 'Sergi & Portfolyo Baskıları',
    desc: 'Sergiler, portfolyolar ve projeleriniz için büyük format baskı ve sunum çözümleri.',
  },
  {
    key: 'hizmet-cerceve', to: '/cerceve', title: 'Çerçeveleme', defaultImg: cerceveDefault,
    desc: 'Eserlerinizi estetik ve koruyucu çerçeve çözümleriyle tamamlıyoruz. Özel ölçü seçenekleriyle.',
  },
]

const eyebrow = { fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }

const contactLabel = { display: 'block', marginBottom: '.4rem', fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)' }
const contactInput = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

// Sertifikalı kağıtlar için kaydırmalı carousel: masaüstünde 4 kart görünür,
// sağ/sol oklarla bir sonraki/önceki "sayfa"ya geçer, sonuna gelince başa
// loop eder. Mobilde ise 1 kart + bir sonrakinin bir kısmı görünecek şekilde
// parmakla kaydırılır (native scroll-snap).
function PaperCarousel({ papers, images }) {
  const trackRef = useRef(null)

  const scrollByPage = (dir) => {
    const el = trackRef.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    const atStart = el.scrollLeft <= 4
    if (dir > 0 && atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else if (dir < 0 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
    }
  }

  // Sayfaya girildikten 5sn sonra kendiliğinden kaymaya başlıyor, sonra her
  // 5sn'de bir sonraki "sayfa"ya geçiyor. Kullanıcı parmakla/okla kendi
  // kaydırdığında bir sonraki otomatik adıma kadar dokunulmuyor.
  useEffect(() => {
    const id = setInterval(() => scrollByPage(1), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .paper-carousel-track { scrollbar-width: none; -ms-overflow-style: none; }
        .paper-carousel-track::-webkit-scrollbar { display: none; }
        .paper-carousel-card { flex: 0 0 calc((100% - 3 * 1.2rem) / 4); }
        @media (max-width: 900px) {
          .paper-carousel-card { flex: 0 0 calc((100% - 1 * 1.2rem) / 2); }
        }
        @media (max-width: 640px) {
          /* Önceden %80 idi — bir sonraki kartın küçük bir dilimi ekranın
             kenarında görünüyordu, bu da "kutucuklar farklı boyda" gibi
             bir bug izlenimi veriyordu. Her seferinde tek, tam ekran
             genişliğinde kart göstermek bu karışıklığı ortadan kaldırıyor. */
          .paper-carousel-card { flex: 0 0 100%; }
          .paper-carousel-arrow { display: none; }
        }
      `}</style>

      <button
        className="paper-carousel-arrow"
        onClick={() => scrollByPage(-1)}
        aria-label="Önceki kağıtlar"
        style={{
          position: 'absolute', left: '.4rem', top: '38%', transform: 'translateY(-50%)',
          zIndex: 2, background: '#fff', border: 'none', cursor: 'pointer',
          width: 42, height: 42, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', lineHeight: 1, color: '#111',
          boxShadow: '0 2px 10px rgba(0,0,0,.35)', transition: 'transform .15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
      >
        ‹
      </button>

      <div
        ref={trackRef}
        className="paper-carousel-track"
        style={{
          display: 'flex', gap: '1.2rem', overflowX: 'auto',
          scrollSnapType: 'x mandatory', scrollBehavior: 'smooth',
          padding: '0 .2rem',
        }}
      >
        {papers.map(paper => (
          <div key={paper.key} className="paper-carousel-card" style={{ scrollSnapAlign: 'start', minWidth: 0 }}>
            <div style={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', background: '#1a1a1a', marginBottom: '1rem' }}>
              {images[paper.key] ? (
                <img
                  src={images[paper.key]}
                  alt={paper.name}
                  loading="lazy" decoding="async"
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
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#fff', fontSize: '1.02rem', margin: '0 0 .4rem' }}>
              {paper.name}
            </h3>
            <p lang="en" style={{ fontFamily: "'Archivo', sans-serif", fontSize: '.76rem', lineHeight: 1.6, color: 'rgba(255,255,255,.6)', margin: 0 }}>
              {paper.info}
            </p>
          </div>
        ))}
      </div>

      <button
        className="paper-carousel-arrow"
        onClick={() => scrollByPage(1)}
        aria-label="Sonraki kağıtlar"
        style={{
          position: 'absolute', right: '.4rem', top: '38%', transform: 'translateY(-50%)',
          zIndex: 2, background: '#fff', border: 'none', cursor: 'pointer',
          width: 42, height: 42, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', lineHeight: 1, color: '#111',
          boxShadow: '0 2px 10px rgba(0,0,0,.35)', transition: 'transform .15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
      >
        ›
      </button>
    </div>
  )
}

// Ana Sayfa vitrini — Fine Art Seçkisi'nden (İşler) 8-10 eseri, referans
// tasarımdaki gibi 4'lü kaydırmalı bir şeritte gösterir (PaperCarousel ile
// aynı sağ/sol ok + loop deseni). Kartlar için mevcut ArtCard bileşeni
// yeniden kullanılıyor — tıklanınca doğrudan o eserin sayfasına gider.
function FineArtCarousel({ artworks }) {
  const trackRef = useRef(null)
  const navigate = useNavigate()

  const scrollByPage = (dir) => {
    const el = trackRef.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    const atStart = el.scrollLeft <= 4
    if (dir > 0 && atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else if (dir < 0 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
    }
  }

  // Mobilde ok butonları gizli, kaydırma parmakla yapılıyor — bu yüzden
  // yukarıdaki loop mantığı (sadece ok tıklamasında çalışıyordu) devreye
  // girmiyor, kullanıcı son karta gelince "sonu var" gibi takılı kalıyordu.
  // Parmakla kaydırma durunca son karta gelinmişse başa dön.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let timeout
    function onScroll() {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
          el.scrollTo({ left: 0, behavior: 'smooth' })
        }
      }, 150)
    }
    el.addEventListener('scroll', onScroll)
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(timeout) }
  }, [artworks])

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .fa-carousel-track { scrollbar-width: none; -ms-overflow-style: none; }
        .fa-carousel-track::-webkit-scrollbar { display: none; }
        .fa-carousel-card { flex: 0 0 calc((100% - 3 * 1.5rem) / 4); }
        @media (max-width: 900px) {
          .fa-carousel-card { flex: 0 0 calc((100% - 1 * 1.5rem) / 2); }
        }
        @media (max-width: 640px) {
          /* Aynı sebep: bir sonraki kartın kenarda görünen dilimi
             "kutucuklar farklı boyda" izlenimi veriyordu — tek, tam
             genişlikte kart göstermek bunu ortadan kaldırıyor. */
          .fa-carousel-card { flex: 0 0 100%; }
          .fa-carousel-arrow { display: none; }
        }
      `}</style>

      <button
        className="fa-carousel-arrow"
        onClick={() => scrollByPage(-1)}
        aria-label="Önceki eserler"
        style={{
          position: 'absolute', left: -6, top: '38%', transform: 'translateY(-50%)',
          zIndex: 2, background: '#fff', border: '1px solid var(--border)', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer', fontSize: '1.2rem', color: 'var(--ink)',
          boxShadow: '0 2px 10px rgba(0,0,0,.08)',
        }}
      >
        ‹
      </button>

      <div
        ref={trackRef}
        className="fa-carousel-track"
        style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {artworks.map((artwork, i) => (
          <div key={artwork.id} className="fa-carousel-card" style={{ scrollSnapAlign: 'start', minWidth: 0 }}>
            <ArtCard artwork={artwork} index={i} noBottomGap onClick={() => navigate(`/product/${artwork.slug}`)} />
          </div>
        ))}
      </div>

      <button
        className="fa-carousel-arrow"
        onClick={() => scrollByPage(1)}
        aria-label="Sonraki eserler"
        style={{
          position: 'absolute', right: -6, top: '38%', transform: 'translateY(-50%)',
          zIndex: 2, background: '#fff', border: '1px solid var(--border)', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer', fontSize: '1.2rem', color: 'var(--ink)',
          boxShadow: '0 2px 10px rgba(0,0,0,.08)',
        }}
      >
        ›
      </button>
    </div>
  )
}

// "Baskı İçin Dosya Hazırlığı" kartları — masaüstünde tek satırda 5 eşit
// genişlikte fotoğraf kartı, toplam genişlik yeterli olduğu için ok/loop
// mantığına gerek yok. Dar ekranlarda satır sığmadığından (max-width:
// 900px) parmakla kaydırılan, her seferinde tek tam genişlikte kart
// gösteren bir şeride dönüşüyor — aynı sayfadaki diğer carousel'lerde
// "bir sonraki kartın kenardaki dilimi" karışıklığa yol açtığı için
// buradan başlayarak hep tam genişlik kart kullanılıyor.
function FilePrepCards({ images, content }) {
  return (
    <div className="fp-track">
      <style>{`
        .fp-track { display: flex; gap: 1rem; }
        .fp-card { flex: 1 1 0; min-width: 0; height: 420px; position: relative; overflow: hidden; background: var(--surface); }
        @media (max-width: 900px) {
          .fp-track { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; }
          .fp-track::-webkit-scrollbar { display: none; }
          .fp-card { flex: 0 0 100%; height: 340px; scroll-snap-align: start; }
        }
      `}</style>

      {FILE_PREP_CARDS.map(card => (
        <div key={card.key} className="fp-card">
          {images[`${card.key}-gorsel`] ? (
            <img
              src={images[`${card.key}-gorsel`]}
              alt={card.title}
              loading="lazy" decoding="async"
              // Bazı referans fotoğraflar (ör. Photoshop ekran görüntüsü, masa
              // üstü çekimler) çok boş alan bırakıyor — hafif zoom bu boşluğu
              // üstten/alttan kırpıyor.
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.18)' }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '1rem',
              fontFamily: "'Archivo', sans-serif", fontSize: '.68rem', color: 'var(--muted)',
            }}>
              {`${card.title} — Admin'den yükle`}
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 42%, rgba(0,0,0,.72) 100%)' }} />
          <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem' }}>
            <div style={{
              fontFamily: "'Archivo', sans-serif", fontWeight: 700, fontSize: '.82rem',
              letterSpacing: '.04em', textTransform: 'uppercase', color: '#fff', lineHeight: 1.3,
            }}>
              {card.title}
            </div>
            {card.hasDesc ? (
              <>
                <p style={{
                  fontFamily: "'Archivo', sans-serif", fontSize: '.72rem', lineHeight: 1.6,
                  color: 'rgba(255,255,255,.85)', margin: '.5rem 0 0',
                }}>
                  {content['dosya-gonderimi-aciklama'] || 'Dosyalarınızı güvenli ve hızlı şekilde bize ulaştırın.'}
                </p>
                <a href="#siparis-iletisim" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.35rem', marginTop: '.6rem',
                  fontFamily: "'Archivo', sans-serif", fontSize: '.7rem', letterSpacing: '.06em',
                  color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                  Detayları Gör <span>→</span>
                </a>
              </>
            ) : (
              <div style={{ color: '#fff', fontSize: '.95rem', marginTop: '.3rem' }}>→</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Gallery() {
  const [images, setImages] = useState({})
  const [content, setContent] = useState({})
  const [papers, setPapers] = useState([])
  const [seckiArtworks, setSeckiArtworks] = useState([])
  const [contact, setContact] = useState({
    isim: '', postaKodu: '', adres: '', email: '', telefon: '',
    numune: '', boyut: '', mesaj: '',
  })
  const [contactStatus, setContactStatus] = useState('idle') // idle | sent

  useEffect(() => {
    supabase.from('papers').select('name').order('sort_order')
      .then(({ data }) => setPapers(data || []))
      .catch(err => console.error('Kağıtlar yüklenemedi:', err))
  }, [])

  useEffect(() => {
    // En çok görüntülenen eserler otomatik öne çıksın diye — Admin'de elle
    // seçim yapmaya gerek yok, ürün sayfası her ziyaret edildiğinde
    // view_count artıyor (bkz. ProductDetail.jsx).
    fetchArtworks({ orderBy: 'view_count' })
      // Başlığı veya görseli olmayan (yarım kalmış/test amaçlı) eserler bu
      // vitrine hiç girmesin — kartta boş/kayık görünmelerine yol açıyordu.
      .then(data => setSeckiArtworks((data || []).filter(a => a.title?.trim() && a.image_url).slice(0, 10)))
      .catch(err => console.error('Fine Art Seçkisi yüklenemedi:', err))
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

      {/* Bölümler arası dikey boşluk — masaüstü ve mobil için ayrı ayrı.
          Önceden her bölümün kendi padding'i (bazıları 5rem) art arda
          gelince toplamda 7rem+'a çıkıyordu; artık hem tekil değerler hem
          de mobildeki toplam boşluk azaltıldı. */}
      <style>{`
        .gs-services { padding: 3.5rem 2rem 3rem; }
        .gs-showcase { padding: 2rem 2rem 2.5rem; }
        .gs-papers-intro { padding: 1.5rem 2rem 2.5rem; }
        .gs-papers-band { padding: 3rem 2.5rem; margin-bottom: 3rem; }
        .gs-contact { padding: 3rem 2rem 3.5rem; }
        @media (max-width: 768px) {
          .gs-services { padding: 2.2rem 1.5rem 2rem; }
          .gs-showcase { padding: 1.5rem 1.5rem 1.6rem; }
          .gs-papers-intro { padding: 1.2rem 1.5rem 1.6rem; }
          .gs-papers-band { padding: 2rem 1.5rem; margin-bottom: 2rem; }
          .gs-contact { padding: 2rem 1.5rem 2.2rem; }
        }
        /* Masaüstünde başlık altı açıklama metinleri başlığa çok uzak
           duruyordu — mobilde dokunmadan, sadece masaüstünde yaklaştırıyoruz. */
        @media (min-width: 769px) {
          .section-desc { margin-top: .5rem !important; }
          .section-divider { margin-bottom: .6rem !important; }
        }
      `}</style>

      {/* 01-06 numaralı Hizmetlerimiz listesi — üstte, Hero'dan hemen sonra;
          ardından (aynı bölümde, ayrı başlık olmadan) Baskı İçin Dosya
          Hazırlığı kartları geliyor. */}
      <section className="gs-services" style={{ maxWidth: 1500, margin: '0 auto', textAlign: 'center' }}>
        <style>{`
          .hizmetlerimiz-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
          @media (max-width: 860px) {
            .hizmetlerimiz-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 560px) {
            .hizmetlerimiz-grid { grid-template-columns: 1fr; }
          }
          .hizmet-card { color: inherit; text-decoration: none; display: block; }
          .hizmet-card .hizmet-ok { transition: transform .2s ease; display: inline-block; }
          .hizmet-card:hover .hizmet-ok { transform: translateX(4px); }
        `}</style>
        {/* maxWidth 1100 — 1500'lük geniş bölüm konteynerinde sabit 3
            sütun, masaüstünde her fotoğrafın aşırı büyük durmasına yol
            açıyordu; oranı bozmadan (aspect-ratio 4/3 aynı kalıyor) grid'i
            daraltıp kareleri küçültüyoruz. */}
        <div className="hizmetlerimiz-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {HIZMETLER.map((h, i) => {
            const title = content[`${h.key}-baslik`] || h.title
            const desc = content[`${h.key}-aciklama`] || h.desc
            const imgSrc = images[h.key] || h.defaultImg
            return (
            <Link key={h.key} to={h.to} className="hizmet-card">
              {imgSrc ? (
                <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden' }}>
                  <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy" decoding="async"
                    // Bazı hizmet fotoğrafları konunun etrafında çok boş alan
                    // bırakıyor — hafif zoom bu boşluğu üstten/alttan kırpıyor.
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(1.18)' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '4 / 3', background: '#e4e2db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Archivo', sans-serif", fontSize: '.68rem',
                  letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', padding: '1rem',
                }}>
                  Görsel — Admin'den yükle
                </div>
              )}
              <div style={{ background: 'var(--surface)', padding: '1.3rem 1.4rem 1.5rem' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '1.08rem', color: 'var(--ink)', margin: '0 0 .6rem' }}>
                  {String(i + 1).padStart(2, '0')} — {title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
                  <p style={{
                    fontFamily: "'Archivo', sans-serif", fontSize: '.78rem', lineHeight: 1.6,
                    color: 'var(--muted)', margin: 0,
                  }}>
                    {desc}
                  </p>
                  <span className="hizmet-ok" style={{ fontSize: '1.1rem', color: 'var(--ink)', flexShrink: 0 }}>→</span>
                </div>
              </div>
            </Link>
            )
          })}
        </div>

        <div style={{ marginTop: '4rem' }} />

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ ...displayHeading, fontSize: '2.2rem', margin: 0 }}>
            Baskı İçin Dosya Hazırlığı
          </h2>
          <div style={{ width: 46, height: 1, background: 'var(--border)', margin: '.9rem auto 0' }} />
          <p className="section-desc" style={{
            fontFamily: "'Archivo', sans-serif", fontSize: '.88rem', lineHeight: 1.7,
            color: 'var(--muted)', maxWidth: 560, margin: '1.2rem auto 0',
          }}>
            {content['baski-hazirlik-aciklama'] || 'En iyi baskı sonucunu alabilmek için dosyalarınızı aşağıdaki teknik kriterlere göre hazırlayabilirsiniz.'}
          </p>
        </div>

        <FilePrepCards images={images} content={content} />
      </section>

      {/* Artı Poz Editions — Fine Art Seçkisi vitrini. Ana Sayfa'da ilgi
          çeken birkaç eseri gösterip tıklayınca doğrudan o eserin sayfasına,
          "Tümünü Gör" ile de Fine Art Seçkisi'nin (İşler) tamamına götürür. */}
      {seckiArtworks.length > 0 && (
        <section className="gs-showcase" style={{ maxWidth: 1500, margin: '0 auto' }}>
          {/* Sadece başlık bloğu ortalı — textAlign burada, section'ın tamamında
              değil, yoksa carousel kartlarındaki fiyat/başlık/ölçü metni de
              (ArtCard varsayılan olarak sola yaslı) yanlışlıkla ortalanıyordu. */}
          <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
            <p style={{ ...eyebrow, marginBottom: '.6rem' }}>Artı Poz Editions</p>
            <h2 style={{ ...displayHeading, fontSize: '2.2rem', margin: 0 }}>
              Fine Art Seçkisi
            </h2>
            <div style={{ width: 46, height: 1, background: 'var(--border)', margin: '.9rem auto 0' }} />
            <Link to="/isler" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem', marginTop: '.9rem',
              fontFamily: "'Archivo', sans-serif", fontSize: '.68rem',
              letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink)',
            }}>
              Tümünü Gör <span>→</span>
            </Link>
          </div>

          <FineArtCarousel artworks={seckiArtworks} />
        </section>
      )}

      {/* Sertifikalı Fine Art Kağıtları */}
      <section className="gs-papers-intro" style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.2rem' }}>
          Sertifikalı Fine Art Kağıtları
        </h2>
        <div className="section-divider" style={{ width: 60, height: 1, background: 'var(--border)', margin: '0 auto 1.5rem' }} />
        <p style={{
          fontFamily: "'Archivo', sans-serif", fontSize: '.92rem', lineHeight: 1.8,
          color: 'var(--muted)', maxWidth: 900, margin: '0 auto',
        }}>
          {content['sertifikali-kagit-aciklama'] || `Hahnemühle'nin arşivsel kalitedeki fine art kağıtlarıyla, eserlerinizde üstün renk
          doğruluğu, derin tonlar ve yüksek detay elde edilir. Her baskı, uzun yıllar boyunca
          ilk günkü etkisini koruyacak kalıcılık ve premium sunum anlayışıyla üretilir.`}
        </p>
      </section>
      {/* Kağıt carousel'i — referans tasarımdaki gibi koyu zeminde, sayfa
          genişliğinin dışına taşıp tam ekran genişliğinde (full-bleed),
          sağ/sol oklarla kaydırılan ve mobilde parmakla kaydırılabilen şerit. */}
      <div className="gs-papers-band" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', background: '#111' }}>
        <div style={{ maxWidth: 1800, margin: '0 auto' }}>
          <PaperCarousel papers={CERTIFIED_PAPERS} images={images} />
        </div>
      </div>

      {/* İletişim üstü görsel alanı — telifli olabilecek referans görsel kullanılmadı, Admin'den yüklenebilir */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        {images['iletisim-gorsel'] ? (
          <div style={{ width: '100%', aspectRatio: '16 / 7', overflow: 'hidden' }}>
            <img
              src={images['iletisim-gorsel']}
              alt="İletişim"
              loading="lazy" decoding="async"
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
      <section id="siparis-iletisim" className="gs-contact" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ ...displayHeading, fontSize: '2.4rem', margin: '0 0 1.5rem' }}>
            Sipariş &amp; İletişim
          </h2>
          <div style={{
            fontFamily: "'Archivo', sans-serif", fontSize: '.85rem', lineHeight: 1.9,
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

            <div>
              <label style={contactLabel}>Kağıt Seçenekleri</label>
              <select name="numune" value={contact.numune} onChange={updateContact} style={contactInput}>
                <option value="">Kağıt seçin</option>
                {papers.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
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