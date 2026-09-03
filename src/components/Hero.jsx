import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/fine-art/hero.jpg'
import HeroSlideStack from './HeroSlideStack'

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
  // mobil için hazırlanmışlar). Henüz yüklenmemişse, masaüstü için
  // hazırlanan yatay görsellere geri düşülüyor; o durumda aşırı
  // kırpmayı azaltmak için Hero'nun boyu kısaltılıyor (bkz. aşağıdaki
  // .hero-section CSS'i).
  const hasMobileSet = mobileUrls.length > 0
  const mobileStackUrls = hasMobileSet ? mobileUrls : desktopUrls
  // page_images sorgusu dönene kadar (desktopUrls henüz boş) koyu/siyah bir
  // zemin yerine site paletine uygun nötr bir yüzey + hafif bir "shimmer"
  // gösteriyoruz, "siyah ekran" hissi yaratmasın diye.
  const loading = desktopUrls.length === 0

  return (
    <section className={`hero-section${hasMobileSet ? ' hero-section--mobile-set' : ''}${loading ? ' hero-section--loading' : ''}`} style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', overflow: 'hidden', background: 'var(--surface)',
    }}>
      {/* Masaüstü Hero yüksekliği, site genelindeki tüm hero'larla (Fine Art
          Baskı, Fotoğraf Baskı, Çerçeve) tutarlı olsun diye 58vh'ye eşitlendi
          — Fine Art Baskı hero'sunun boyu referans alındı.

          Mobilde, dikey/portre hero görselleri henüz yüklenmemişse
          (.hero-section--mobile-set yoksa) aynı yatay (21:9) görseller
          kullanılıyor — dar bir dikey ekranda uzun bir kutuyu kaplamak
          için görsel çok daha fazla yakınlaştırılıp yanlardan kırpılırdı,
          bu yüzden o durumda kutu daha da kısa tutuluyor (42vh). Meltem'in
          hazırladığı portre görseller yüklenince (.hero-section--mobile-set)
          o görseller zaten dikey ekran için kesildiği için mobilde de
          39vh kullanılabiliyor. */}
      <style>{`
        .hero-section { height: 58vh; min-height: 380px; }
        @media (max-width: 640px) {
          .hero-section:not(.hero-section--mobile-set) { height: 42vh; min-height: 300px; }
        }
        .hero-desktop-imgs { display: block; }
        .hero-mobile-imgs { display: none; }
        @media (max-width: 640px) {
          .hero-desktop-imgs { display: none; }
          .hero-mobile-imgs { display: block; }
        }
        .hero-section--loading {
          background: linear-gradient(100deg, #efeee9 30%, #f6f5f1 50%, #efeee9 70%);
          background-size: 200% 100%;
          animation: heroShimmer 1.6s ease-in-out infinite;
        }
        @keyframes heroShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="hero-desktop-imgs">
        <HeroSlideStack urls={desktopUrls} />
      </div>
      <div className="hero-mobile-imgs">
        <HeroSlideStack urls={mobileStackUrls} />
      </div>

      {/* Önceden burada "artı poz" başlığı ve "Sipariş" butonu vardı, bu
          yüzden okunabilirlik için görselin üstüne koyu bir katman
          konmuştu. İkisi de kaldırıldığından artık koyulaştırmaya gerek
          yok — sadece altta hafif bir derinlik hissi için çok hafif bir
          gölge bırakıyoruz, fotoğrafın kendi ışığı/rengi olduğu gibi
          görünsün diye. */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.18) 100%)'
      }} />
    </section>
  )
}
