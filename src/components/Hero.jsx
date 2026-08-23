import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import heroImgDefault from '../assets/fine-art/hero.jpg'

export default function Hero() {
  // Başlangıçta boş — Admin'de gerçek hero görselleri zaten yüklüyse,
  // paketlenmiş varsayılan görseli bir an için gösterip sonra gerçek
  // görsele geçmek (flash/titreme) yerine, veri gelene kadar sadece koyu
  // zemin görünür. Supabase'den hiç satır dönmezse (Sami henüz hiç
  // görsel yüklemediyse) varsayılana geri düşülür.
  const [heroUrls, setHeroUrls] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    supabase
      .from('page_images')
      .select('image_url')
      .eq('page', 'gallery')
      .eq('section', 'hero')
      .order('sort_order')
      .order('id')
      .then(({ data }) => setHeroUrls(data?.length ? data.map(row => row.image_url) : [heroImgDefault]))
      .catch(err => { console.error('Hero görselleri yüklenemedi:', err); setHeroUrls([heroImgDefault]) })
  }, [])

  useEffect(() => {
    if (heroUrls.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % heroUrls.length), 3000)
    return () => clearInterval(id)
  }, [heroUrls])

  return (
    <section className="hero-section" style={{
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

          object-fit: cover + tam ekran (100dvh) yükseklik, geniş/panoramik
          fotoğrafları dar bir telefon ekranına sığdırmak için çok agresif
          kırpıp konuyu (ör. çerçeveli baskı) küçültüyordu. object-fit:
          contain ise kırpmıyordu ama görseli küçültüp etrafını koyu
          boşlukla dolduruyordu. İkisi arasında bir denge için mobilde
          Hero'nun yüksekliği düşürüldü (cover + daha kısa kutu = daha az
          agresif kırpma, gri/boş şerit yok çünkü cover her zaman kutuyu
          dolduruyor). */}
      <style>{`
        .hero-section { height: 100vh; }
        @supports (height: 100dvh) {
          .hero-section { height: 100dvh; }
        }
        @media (max-width: 640px) {
          .hero-section { height: 55vh; }
          @supports (height: 100dvh) {
            .hero-section { height: 55dvh; }
          }
        }
      `}</style>
      {heroUrls.map((url, i) => (
        <img
          key={url}
          src={url}
          alt="Artı Poz"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            opacity: i === index ? 1 : 0, transition: 'opacity 1s ease',
          }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.6))'
      }} />
    </section>
  )
}
