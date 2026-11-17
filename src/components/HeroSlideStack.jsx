import { useState, useEffect } from 'react'

// Bir görsel setinden birer sırayla dönen crossfade slayt gösterir.
// Gallery.jsx'in Hero'su ve tek görselli hero yerine çoklu görsel
// slaytı kullanan diğer sayfalar (ör. Fotoğraf Baskı) arasında paylaşılıyor.
export default function HeroSlideStack({ urls }) {
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
      // lazy: Hero masaüstü ve mobil için iki ayrı slayt seti render ediyor,
      // biri display:none ile gizli. eager olunca gizli set de iniyordu
      // (masaüstünde ~6.6 MB boşa). lazy görseller display:none iken inmez;
      // görünen ilk kare yine hemen yüklenir.
      loading="lazy"
      decoding="async"
      fetchPriority={i === 0 ? 'high' : 'low'}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: i === index ? 1 : 0, transition: 'opacity 1s ease',
      }}
    />
  ))
}
