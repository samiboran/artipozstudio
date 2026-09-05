import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchArtworks } from '../lib/artworks'
import Hero from '../components/Hero'
import ArtCard from '../components/ArtCard'
import SiparisIletisimForm from '../components/SiparisIletisimForm'
import fotografDefault from '../assets/fine-art/ornek-botanik.webp'
import fineArtDefault from '../assets/process/baski-sureci.webp'
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
  // Kutu/object-fit kuralı diğer 4 kartla birebir aynı (aşağıdaki .fp-card
  // ve img style'ı hepsi için ortak) — Dosya Gönderimi'nin kendi fotoğrafı
  // farklı kadrajlı olduğundan ortak %18 ekstra zoom onu diğerlerinden daha
  // "yakın/büyük" gösteriyordu, bu kart için zoom kaldırıldı.
  { key: 'dosya-gonderimi', title: 'Dosya Gönderimi', hasDesc: true, zoom: 1 },
]

const displayHeading = { fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--ink)' }

const HIZMETLER = [
  {
    key: 'hizmet-fotograf', to: '/fotograf-baski', title: 'Fotoğraf Baskı', defaultImg: fotografDefault,
    desc: 'Kodak ve profesyonel fotoğraf kağıtları ile mat, parlak veya saten yüzey seçenekleri.',
    imgScale: .8,
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
    imgScale: .8,
  },
  {
    key: 'hizmet-sergi', to: '/fine-art-baski', title: 'Sergi & Portfolyo Baskıları',
    desc: 'Sergiler, portfolyolar ve projeleriniz için büyük format baskı ve sunum çözümleri.',
  },
  {
    key: 'hizmet-cerceve', to: '/film-yikama-tarama', title: 'Çerçeveleme', defaultImg: cerceveDefault,
    desc: 'Eserlerinizi estetik ve koruyucu çerçeve çözümleriyle tamamlıyoruz. Özel ölçü seçenekleriyle.',
  },
]

const eyebrow = { fontFamily: 'var(--font-body)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)' }

// Sertifikalı kağıtlar için kaydırmalı carousel: masaüstünde 4 kart görünür,
// sağ/sol oklarla bir sonraki/önceki "sayfa"ya geçer, sonuna gelince başa
// loop eder. Mobilde ise 1 kart + bir sonrakinin bir kısmı görünecek şekilde
// parmakla kaydırılır (native scroll-snap).
function PaperCarousel({ papers, images }) {
  const trackRef = useRef(null)
  const intervalRef = useRef(null)

  // Ok butonlarıyla MANUEL kaydırma — sonda/başta ok'a basmaya devam
  // edilirse başa/sona döner (loop). Otomatik kaymadan (autoAdvance) farklı
  // olarak kasıtlı burada loop var.
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

  // OTOMATİK kayma — manuel ok'tan farklı olarak sona gelince başa
  // dönmüyor, orada duruyor. Kullanıcı isterse sağ ok'a basıp elle
  // başa dönebilir (scrollByPage'in loop'u orada devrede).
  const autoAdvance = () => {
    const el = trackRef.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (atEnd) return
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
  }

  const stopAuto = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }
  const startAuto = () => {
    stopAuto()
    intervalRef.current = setInterval(autoAdvance, 3000)
  }

  // Mouse üzerine gelince duruyor, ayrılınca 3sn'lik döngü yeniden başlıyor.
  useEffect(() => {
    startAuto()
    return stopAuto
  }, [])

  return (
    <div style={{ position: 'relative' }} onMouseEnter={stopAuto} onMouseLeave={startAuto}>
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
                  fontFamily: 'var(--font-body)', fontSize: '.68rem', color: 'rgba(255,255,255,.4)',
                }}>
                  {`${paper.name} — Admin'den yükle`}
                </div>
              )}
              <span style={{
                position: 'absolute', top: 10, left: 10, background: '#fff', color: '#111',
                fontFamily: 'var(--font-body)', fontSize: '.56rem', fontWeight: 600,
                letterSpacing: '.1em', textTransform: 'uppercase', padding: '.3rem .6rem',
              }}>
                Hahnemühle
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#fff', fontSize: '1.02rem', margin: '0 0 .4rem' }}>
              {paper.name}
            </h3>
            <p lang="en" style={{ fontFamily: 'var(--font-body)', fontSize: '.76rem', lineHeight: 1.6, color: 'rgba(255,255,255,.6)', margin: 0 }}>
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
              // üstten/alttan kırpıyor (kart bazında ayarlanabilir, bkz. card.zoom).
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${card.zoom ?? 1.18})` }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '1rem',
              fontFamily: 'var(--font-body)', fontSize: '.68rem', color: 'var(--muted)',
            }}>
              {`${card.title} — Admin'den yükle`}
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 42%, rgba(0,0,0,.72) 100%)' }} />
          <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem' }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '.82rem',
              letterSpacing: '.04em', textTransform: 'uppercase', color: '#fff', lineHeight: 1.3,
            }}>
              {card.title}
            </div>
            {card.hasDesc ? (
              <a href="#siparis-iletisim" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.35rem', marginTop: '.6rem',
                fontFamily: 'var(--font-body)', fontSize: '.7rem', letterSpacing: '.06em',
                color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                Detayları Gör <span>→</span>
              </a>
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
  const [seckiArtworks, setSeckiArtworks] = useState([])

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

      {/* Bölümler arası dikey boşluk — tek bir tutarlı ölçeğe bağlandı: her
          bölüm kendi üstünde/altında aynı miktarda ("yarım boşluk") padding
          taşıyor, böylece iki bölüm yan yana geldiğinde aralarındaki toplam
          boşluk her zaman aynı ("tam boşluk") oluyor. Hero'nun kendi alt
          boşluğu olmadığından, ilk bölüm (gs-services) üstte tek başına
          "tam boşluk" taşıyor — aksi halde Hero ile Hizmetlerimiz arası
          diğer bölüm aralarının yarısı kadar kalırdı. */}
      <style>{`
        .gs-services { padding: 4rem 2rem 2rem; }
        .gs-showcase { padding: 2rem 2rem 2rem; }
        .gs-papers-intro { padding: 2rem 2rem 2rem; }
        .gs-papers-band { padding: 3rem 2.5rem; margin-bottom: 2rem; }
        .gs-contact { padding: 2rem 2rem 2rem; }
        @media (max-width: 768px) {
          .gs-services { padding: 2.4rem 1.5rem 1.2rem; }
          .gs-showcase { padding: 1.2rem 1.5rem 1.2rem; }
          .gs-papers-intro { padding: 1.2rem 1.5rem 1.2rem; }
          .gs-papers-band { padding: 2rem 1.5rem; margin-bottom: 1.2rem; }
          .gs-contact { padding: 1.2rem 1.5rem 1.2rem; }
        }
        /* Masaüstünde başlık altı açıklama metinleri başlığa çok uzak
           duruyordu — mobilde dokunmadan, sadece masaüstünde yaklaştırıyoruz. */
        @media (min-width: 769px) {
          .section-desc { margin-top: .5rem !important; }
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
          .hizmet-card { color: inherit; text-decoration: none; display: flex; flex-direction: column; height: 100%; }
          .hizmet-card .hizmet-ok { transition: transform .2s ease; display: inline-block; }
          .hizmet-card:hover .hizmet-ok { transform: translateX(4px); }
        `}</style>
        {/* maxWidth 1100 — 1500'lük geniş bölüm konteynerinde sabit 3
            sütun, masaüstünde her fotoğrafın aşırı büyük durmasına yol
            açıyordu; oranı bozmadan (aspect-ratio 4/3 aynı kalıyor) grid'i
            daraltıp kareleri küçültüyoruz. */}
        <div style={{ marginBottom: '2.4rem' }}>
          <h2 style={{ ...displayHeading, fontSize: '2.2rem', margin: 0 }}>
            Hizmetlerimiz
          </h2>
        </div>

        <div className="hizmetlerimiz-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {HIZMETLER.map(h => {
            const title = content[`${h.key}-baslik`] || h.title
            const desc = content[`${h.key}-aciklama`] || h.desc
            const imgSrc = images[h.key] || h.defaultImg
            return (
            <Link key={h.key} to={h.to} className="hizmet-card">
              {imgSrc ? (
                // "contain" (kırpmadan sığdırma) bazı fotoğraflarda siyah mat
                // boşluk bırakıyordu — kutuyu her zaman tam dolduran "cover"a
                // geri dönüldü, mat hiç oluşmuyor. Fotoğraf Baskı ve Poster &
                // Kartpostal Baskı kartlarındaki görseller diğerlerine göre
                // daha sıkışık/büyük durduğundan (h.imgScale) hafifçe küçültülüyor.
                <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: 'var(--surface)', flexShrink: 0 }}>
                  <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy" decoding="async"
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transform: h.imgScale ? `scale(${h.imgScale})` : undefined,
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '4 / 3', background: '#e4e2db', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)', fontSize: '.68rem',
                  letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', padding: '1rem',
                }}>
                  Görsel — Admin'den yükle
                </div>
              )}
              {/* Kart içeriği kutusu artık flex:1 ile kalan yüksekliği dolduruyor
                  ve title/açıklama+ok arasında justify-content:space-between
                  kullanıyor — bu sayede metin uzunluğu farklı olsa da (ör.
                  Çerçeveleme'nin 3 satırlık açıklaması) ok her kartta aynı
                  alt hizada kalıyor, satır sayısı grid satırının yüksekliğini
                  bozmuyor. */}
              <div style={{ background: 'var(--surface)', padding: '1.3rem 1.4rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.08rem', color: 'var(--ink)', margin: '0 0 .6rem' }}>
                  {title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '.78rem', lineHeight: 1.6,
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
          <p className="section-desc" style={{
            fontFamily: 'var(--font-body)', fontSize: '.88rem', lineHeight: 1.7,
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
            <Link to="/isler" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem', marginTop: '.9rem',
              fontFamily: 'var(--font-body)', fontSize: '.68rem',
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
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '.92rem', lineHeight: 1.8,
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
            fontFamily: 'var(--font-body)', fontSize: '.7rem',
            letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)',
          }}>
            Görsel — Admin → Görseller'den yükle
          </div>
        )}
      </div>

      {/* Sipariş & İletişim */}
      <SiparisIletisimForm source="ana-sayfa" />

    </div>
  )
}

export default Gallery