import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/fine-art/hero.jpg'

// Masaüstü/mobil için ayrı yüklenen görsel setinden birer sırayla dönen
// crossfade slayt gösterir. İki set birbirinden bağımsız kendi tempolarında
// döner (aynı anda sadece biri CSS ile görünür oluyor).
function HeroSlideStack({ urls }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    if (urls.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % urls.length), 3000)
    return () => clearInterval(id)
  }, [urls])

  return urls.map((url, i) => (
    <img
      key={url}
      src={url}
      alt="Artı Poz"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: i === index ? 1 : 0, transition: 'opacity 1s ease',
      }}
    />
  ))
}

export default function Hero() {
  // Başlangıçta boş — Admin'de gerçek hero görselleri zaten yüklüyse,
  // paketlenmiş varsayılan görseli bir an için gösterip sonra gerçek
  // görsele geçmek (flash/titreme) yerine, veri gelene kadar sadece koyu
  // zemin görünür.
  const [desktopUrls, setDesktopUrls] = useState([])
  const [mobileUrls, setMobileUrls] = useState([])

  useEffect(() => {
    supabase
      .from('page_images')
      .select('section, image_url')
      .eq('page', 'gallery')
      .in('section', ['hero', 'hero-mobile'])
      .order('sort_order')
      .order('id')
      .then(({ data }) => {
        const desktop = (data || []).filter(r => r.section === 'hero').map(r => r.image_url)
        const mobile = (data || []).filter(r => r.section === 'hero-mobile').map(r => r.image_url)
        setDesktopUrls(desktop.length ? desktop : [heroImgDefault])
        setMobileUrls(mobile)
      })
      .catch(err => { console.error('Hero görselleri yüklenemedi:', err); setDesktopUrls([heroImgDefault]) })
  }, [])

  // Meltem'in mobil için ayrıca hazırladığı dikey/portre kırpımlar
  // yüklenmişse onlar kullanılıyor (tam ekran, kırpma sorunu yok — zaten
  // mobile için hazırlanmışlar). Henüz yüklenmemişse, masaüstü için
  // hazırlanan yatay görsellere geri düşülüyor; o durumda agresif
  // kırpmayı azaltmak için Hero'nun boyu kısaltılıyor.
  const hasMobileSet = mobileUrls.length > 0
  const mobileStackUrls = hasMobileSet ? mobileUrls : desktopUrls

  return (
    <section className={`hero-section${hasMobileSet ? ' hero-section--mobile-set' : ''}`} style={{
      position: 'relative', minHeight: 520,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', overflow: 'hidden', background: '#2b2f28',
    }}>
      {/* Mobil tarayıcılarda (özellikle Android/Chrome) adres çubuğu ilk
          açılışta görünürken 100vh, tarayıcı çubuğu gizliyken hesaplanan
          en büyük yüksekliği baz alıyor — bu yüzden Hero, ekranın
          gerçekte görünen kısmından daha kısa/"küçük" kalıyordu. 100dvh
          (dynamic viewport height) tarayıcı arayüzünü hesaba katıyor;
          desteklenmeyen tarayıcılarda @supports ile 100vh'ye düşüyor.

          Mobil için özel (dikey/portre) hero görselleri yüklenmişse
          (.hero-section--mobile-set) mobilde de tam ekran gösteriliyor —
          zaten o ekran için hazırlanmışlar, kırpma sorunu yok. Henüz
          yüklenmemişse masaüstü görselleri kullanılıyor ve agresif
          kırpmayı azaltmak için Hero'nun boyu kısaltılıyor. */}
      <style>{`
        .hero-section { height: 100vh; }
        @supports (height: 100dvh) {
          .hero-section { height: 100dvh; }
        }
        @media (max-width: 640px) {
          .hero-section:not(.hero-section--mobile-set) { height: 55vh; }
          @supports (height: 100dvh) {
            .hero-section:not(.hero-section--mobile-set) { height: 55dvh; }
          }
        }
        .hero-desktop-imgs { display: block; }
        .hero-mobile-imgs { display: none; }
        @media (max-width: 640px) {
          .hero-desktop-imgs { display: none; }
          .hero-mobile-imgs { display: block; }
        }
      `}</style>

      <div className="hero-desktop-imgs">
        <HeroSlideStack urls={desktopUrls} />
      </div>
      <div className="hero-mobile-imgs">
        <HeroSlideStack urls={mobileStackUrls} />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.6))'
      }} />
    </section>
  )
}
