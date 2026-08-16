import { useRef, useEffect } from 'react'
import './Hero.css'

import baskiSureciImg from '../assets/process/baski-sureci.jpg'
import kagitDetayiImg from '../assets/process/kagit-detayi.jpg'
import studyoImg from '../assets/process/studyo.jpg'
// TODO: paketleme fotoğrafını ekleyince buraya import et ve slides
// dizisindeki 'Paketleme' item'ına src ekle.

const slides = [
  { label: 'Baskı süreci', src: baskiSureciImg, alt: 'Canon yazıcıdan çıkan fine art baskı' },
  { label: 'Kağıt detayı', src: kagitDetayiImg, alt: 'Hahnemühle kağıt numuneleri' },
  { label: 'Paketleme' }, // görsel eklenene kadar placeholder
  { label: 'Stüdyo', src: studyoImg, alt: 'Baskı stüdyosunda çalışma anı' },
]

export default function Hero() {
  const viewportRef = useRef(null)

  function scrollByOne(direction) {
    const el = viewportRef.current
    if (!el) return
    const amount = el.clientWidth * 0.82 + 16
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const timer = setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollByOne(1)
      }
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero">
      <div className="hero-text">
        <p className="hero-eyebrow">İstanbul'da, elle basılıyor</p>
        <h1 className="hero-title">
          Gördüğünüz baskı,<br />
          gördüğünüz ellerden çıkıyor.
        </h1>
        <p className="hero-sub">
          Her eser Canon PROGRAF ile arşivsel pigment mürekkeple,
          asitsiz fine art kağıda tek tek basılıyor. Yorum değil,
          süreci gösteriyoruz.
        </p>
        <div className="hero-actions">
          <a href="/gallery" className="btn-primary">Koleksiyona Göz At</a>
          <a href="/custom" className="btn-secondary">Kendi Fotoğrafını Bastır</a>
        </div>
      </div>

      <div className="hero-carousel">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => scrollByOne(-1)}
          aria-label="Önceki görsel"
        >
          ‹
        </button>

        <div className="carousel-viewport" ref={viewportRef}>
          {slides.map((s, i) => (
            s.src ? (
              <img key={i} src={s.src} alt={s.alt} className="carousel-slide" />
            ) : (
              <div key={i} className="carousel-slide carousel-slide-placeholder">
                {s.label}
              </div>
            )
          ))}
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => scrollByOne(1)}
          aria-label="Sonraki görsel"
        >
          ›
        </button>
      </div>
    </section>
  )
}