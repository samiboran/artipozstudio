// POZLAR — GİZLİ ÖNİZLEME İÇİN ÖRNEK VERİ
// Gerçek topluluk henüz yok: kişiler ve makine/film bilgileri tasarımı
// görmek için uydurulmuş örneklerdir, görseller sitenin kendi görselleri.
// Gerçek sürümde bu dosya Supabase tablolarıyla (pozlar, poz_profiles,
// cameras, films, topics) değiştirilecek — bkz. "Pozlar — Topluluk Bölümü Planı".
import botanik1 from '../assets/fine-art/ornek-botanik.webp'
import botanik2 from '../assets/fine-art/ornek-botanik-2.webp'
import doku1 from '../assets/fine-art/ornek-doku-1.jpg'
import doku2 from '../assets/fine-art/ornek-doku-2.jpg'
import manzara1 from '../assets/fotograf-baski/hero-1.jpg'
import manzara2 from '../assets/fotograf-baski/hero-2.jpg'
import manzara3 from '../assets/fotograf-baski/hero-3.jpg'
import film1 from '../assets/film-yikama/galeri-1.jpg'
import film2 from '../assets/film-yikama/galeri-2.jpg'
import film3 from '../assets/film-yikama/galeri-3.jpg'
import film4 from '../assets/film-yikama/galeri-4.jpg'
import film5 from '../assets/film-yikama/adim-03-karelerinize.jpg'
import dij1 from '../assets/cerceve/hero.jpg'
import dij2 from '../assets/fine-art/hero.webp'
import dij3 from '../assets/fine-art/tanitim-studyo.jpg'
import dij4 from '../assets/film-yikama/hero.jpg'

const SB = 'https://qrbkzjosorimiwdbwyyl.supabase.co/storage/v1/object/public/artwork-images/'

// Konular: TR ad + aramada eşleşen eş anlamlılar (TR/EN)
export const TOPICS = [
  { slug: 'manzara', ad: 'Manzara', es: ['manzara', 'landscape', 'peyzaj', 'doğa manzarası'] },
  { slug: 'portre', ad: 'Portre', es: ['portre', 'portrait', 'insan'] },
  { slug: 'sokak', ad: 'Sokak', es: ['sokak', 'street'] },
  { slug: 'mimari', ad: 'Mimari', es: ['mimari', 'architecture', 'bina'] },
  { slug: 'doga', ad: 'Doğa', es: ['doğa', 'doga', 'nature', 'çiçek', 'cicek', 'flower', 'bitki', 'botanik'] },
  { slug: 'deniz', ad: 'Deniz', es: ['deniz', 'sea', 'ocean', 'sahil'] },
  { slug: 'gece', ad: 'Gece', es: ['gece', 'night'] },
  { slug: 'naturmort', ad: 'Natürmort', es: ['natürmort', 'naturmort', 'still life', 'nesne'] },
  { slug: 'deneysel', ad: 'Deneysel', es: ['deneysel', 'experimental', 'çift pozlama', 'double exposure', 'expired', 'tarihi geçmiş', 'light leak', 'ışık sızıntısı'] },
]

export const PHOTOGRAPHERS = [
  { u: 'deniz.k', ad: 'Deniz K.', unvan: '120 orta format, çoğunlukla doğa', aciklama: 'Mamiya ile yavaş fotoğraf. Kadıköy.', instagram: 'deniz.k.film', kurucu: true },
  { u: 'lena.m', ad: 'Lena M.', unvan: 'Erasmus · İstanbul sokakları', aciklama: 'Exchange student from Berlin. Shooting Istanbul on 35mm.', instagram: 'lena.shoots.film', kurucu: true },
  { u: 'arda.t', ad: 'Arda T.', unvan: 'Deneysel film, süresi geçmiş rulolar', aciklama: '', instagram: '', kurucu: false },
  { u: 'selin.a', ad: 'Selin A.', unvan: '', aciklama: 'Canon AE-1 ile her yere.', instagram: 'selin.analog', kurucu: true },
]

// tur: 'film' | 'dijital' — dijitalde film alanı boş, format = sensör
const FILM_POZLAR = [
  { id: 'p1', src: SB + 'compressed-1788711721878-juiwx.webp', w: 1800, h: 1197, baslik: 'Lisianthus, sabah ışığı', not: 'Pencere ışığı, 1/30 elde. HP5 1600\'e itildi, gren tam istediğim gibi.', u: 'deniz.k', makine: 'Mamiya RZ67 Pro II', lens: 'Sekor Z 110mm f/2.8', film: 'Ilford HP5 Plus 400', format: '120', konular: ['doga', 'naturmort'], tarandi: true, begeni: 48, tarih: '2026-11-12' },
  { id: 'p2', src: SB + 'compressed-1788711723490-4n44r.webp', w: 1800, h: 1197, baslik: 'Şebboy', not: '', u: 'deniz.k', makine: 'Mamiya RZ67 Pro II', lens: 'Sekor Z 110mm f/2.8', film: 'Kodak Tri-X 400', format: '120', konular: ['doga'], tarandi: true, begeni: 31, tarih: '2026-11-10' },
  { id: 'p3', src: manzara1, w: 2172, h: 724, baslik: 'Bozkır', not: 'Panoramik kırpım. Ektar\'ın renkleri bu ışıkta çok doygun çıktı.', u: 'selin.a', makine: 'Pentax 67', lens: 'SMC Takumar 105mm f/2.4', film: 'Kodak Ektar 100', format: '120', konular: ['manzara'], tarandi: false, begeni: 62, tarih: '2026-11-08' },
  { id: 'p4', src: film1, w: 1122, h: 1402, baslik: 'Rulolar', not: '', u: 'lena.m', makine: 'Canon AE-1', lens: 'Canon FD 50mm f/1.8', film: 'Kodak Portra 400', format: '35mm', konular: ['naturmort'], tarandi: true, begeni: 19, tarih: '2026-11-14' },
  { id: 'p5', src: doku1, w: 1080, h: 1350, baslik: 'Doku I', not: 'Expired 2009 Superia, iki stop fazla pozlandı.', u: 'arda.t', makine: 'Olympus OM-1', lens: 'Zuiko 50mm f/1.8', film: 'Bilinmeyen / etiketsiz film', format: '35mm', konular: ['deneysel', 'doga'], tarandi: false, begeni: 27, tarih: '2026-11-11' },
  { id: 'p6', src: manzara2, w: 2172, h: 724, baslik: 'Kıyı', not: '', u: 'lena.m', makine: 'Contax T2', lens: 'Carl Zeiss Sonnar 38mm f/2.8', film: 'Kodak Portra 400', format: '35mm', konular: ['manzara', 'deniz'], tarandi: true, begeni: 54, tarih: '2026-11-06' },
  { id: 'p7', src: SB + 'compressed-1788711725037-gbblr.webp', w: 1800, h: 1197, baslik: 'Orkide', not: 'Stüdyoda tek flaş.', u: 'deniz.k', makine: 'Mamiya 7 II', lens: 'N 80mm f/4', film: 'Ilford Delta 100', format: '120', konular: ['naturmort', 'doga'], tarandi: true, begeni: 40, tarih: '2026-11-04' },
  { id: 'p8', src: botanik1, w: 1024, h: 1024, baslik: '6×6', not: 'Kare format seviyorum.', u: 'selin.a', makine: 'Hasselblad 500C/M', lens: 'Planar 80mm f/2.8', film: 'Fujifilm Velvia 50', format: '120', konular: ['doga'], tarandi: false, begeni: 22, tarih: '2026-11-03' },
  { id: 'p9', src: film2, w: 1122, h: 1402, baslik: '', not: '', u: 'arda.t', makine: 'Olympus OM-1', lens: 'Zuiko 50mm f/1.8', film: 'Cinestill 800T', format: '35mm', konular: ['deneysel'], tarandi: true, begeni: 15, tarih: '2026-11-15' },
  { id: 'p10', src: manzara3, w: 2172, h: 724, baslik: 'Uzak dağlar', not: '', u: 'deniz.k', makine: 'Mamiya RZ67 Pro II', lens: 'Sekor Z 50mm f/4.5', film: 'Kodak Portra 160', format: '120', konular: ['manzara'], tarandi: true, begeni: 71, tarih: '2026-11-01' },
  { id: 'p11', src: doku2, w: 1080, h: 1350, baslik: 'Doku II', not: 'Çift pozlama, aynı karede iki yüzey.', u: 'arda.t', makine: 'Olympus OM-1', lens: 'Zuiko 50mm f/1.8', film: 'Lomography Color 400', format: '35mm', konular: ['deneysel'], tarandi: false, begeni: 33, tarih: '2026-11-09' },
  { id: 'p12', src: film3, w: 1086, h: 1448, baslik: 'Masa üstü', not: '', u: 'lena.m', makine: 'Canon AE-1', lens: 'Canon FD 50mm f/1.8', film: 'Kodak Gold 200', format: '35mm', konular: ['naturmort'], tarandi: true, begeni: 12, tarih: '2026-11-16' },
  { id: 'p13', src: SB + 'compressed-1788711729437-2q6w4.webp', w: 1800, h: 1197, baslik: 'Lisianthus II', not: '', u: 'selin.a', makine: 'Canon AE-1', lens: 'Canon FD 50mm f/1.4', film: 'Ilford HP5 Plus 400', format: '35mm', konular: ['doga'], tarandi: true, begeni: 26, tarih: '2026-11-07' },
  { id: 'p14', src: film5, w: 1536, h: 1024, baslik: 'Kontakt', not: '', u: 'lena.m', makine: 'Leica M6', lens: 'Summicron 35mm f/2', film: 'Ilford HP5 Plus 400', format: '35mm', konular: ['sokak'], tarandi: true, begeni: 38, tarih: '2026-11-13' },
  { id: 'p15', src: botanik2, w: 1024, h: 1024, baslik: '', not: '', u: 'deniz.k', makine: 'Mamiya 645 Pro', lens: 'Sekor C 80mm f/2.8', film: 'Kodak Portra 400', format: '120', konular: ['doga'], tarandi: false, begeni: 17, tarih: '2026-11-02' },
  { id: 'p16', src: film4, w: 1136, h: 1360, baslik: 'Akşam', not: '', u: 'selin.a', makine: 'Nikon FM2', lens: 'Nikkor 50mm f/1.4', film: 'Kodak Portra 800', format: '35mm', konular: ['gece'], tarandi: true, begeni: 21, tarih: '2026-11-05' },
].map(p => ({ tur: 'film', ...p }))

const DIJITAL_POZLAR = [
  { id: 'd1', src: dij1, w: 1600, h: 667, baslik: 'Duvar', not: 'Sergi kurulumundan sonra, boş salon.', u: 'selin.a', makine: 'Sony A7 IV', lens: 'FE 24-70mm f/2.8 GM II', film: '', format: 'Tam kare', konular: ['mimari'], begeni: 29, tarih: '2026-11-17' },
  { id: 'd2', src: dij2, w: 1254, h: 1254, baslik: 'Seçki günü', not: '', u: 'deniz.k', makine: 'Fujifilm X-T5', lens: 'XF 33mm f/1.4', film: '', format: 'APS-C', konular: ['naturmort'], begeni: 35, tarih: '2026-11-15' },
  { id: 'd3', src: dij3, w: 751, h: 810, baslik: 'Atölye', not: 'Baskı makineden çıkarken.', u: 'lena.m', makine: 'Ricoh GR III', lens: 'GR 18.3mm f/2.8', film: '', format: 'APS-C', konular: ['portre'], begeni: 24, tarih: '2026-11-12' },
  { id: 'd4', src: dij4, w: 1600, h: 900, baslik: 'Tarama masası', not: '', u: 'arda.t', makine: 'Fujifilm X100VI', lens: '23mm f/2', film: '', format: 'APS-C', konular: ['naturmort'], begeni: 18, tarih: '2026-11-10' },
].map(p => ({ tur: 'dijital', tarandi: false, ...p }))

export const POZLAR = [...FILM_POZLAR, ...DIJITAL_POZLAR]
export const TURLER = [['', 'Tümü'], ['film', 'Film'], ['dijital', 'Dijital']]

export const POPULAR_CHIPS = ['Portra 400', 'HP5', 'Mamiya', 'Canon AE-1', 'Manzara', 'Deneysel', 'Cinestill']

const norm = s => (s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i')

// Her kelime ya makine/lens/film/başlık/not/fotoğrafçı içinde geçmeli,
// ya da bir konunun eş anlamlısıyla eşleşmeli (manzara = landscape).
export function searchPozlar(q) {
  const words = norm(q).split(/\s+/).filter(Boolean)
  if (!words.length) return POZLAR
  return POZLAR.filter(p => {
    const ph = PHOTOGRAPHERS.find(x => x.u === p.u)
    const hay = norm([p.makine, p.lens, p.film, p.format, p.baslik, p.not, ph?.ad, p.tur === 'dijital' ? 'dijital digital' : 'film analog'].join(' '))
    const topicWords = p.konular.flatMap(k => TOPICS.find(t => t.slug === k)?.es || []).map(norm)
    return words.every(w => hay.includes(w) || topicWords.some(t => t.includes(w) || (w.length >= 4 && w.includes(t))))
  })
}

// Arama kutusu önerileri: makine/film/konu, kaç kare olduğu ile
export function suggestions(q) {
  const w = norm(q).trim()
  if (w.length < 2) return []
  const out = []
  const add = (tip, ad) => { const n = searchPozlar(ad).length; if (!out.find(o => o.ad === ad)) out.push({ tip, ad, n }) }
  POZLAR.forEach(p => { if (norm(p.makine).includes(w)) add('Makine', p.makine) })
  POZLAR.forEach(p => { if (p.film && norm(p.film).includes(w)) add('Film', p.film) })
  POZLAR.forEach(p => { if (norm(p.lens).includes(w)) add('Lens', p.lens) })
  TOPICS.forEach(t => { if (t.es.some(e => norm(e).includes(w))) add('Konu', t.ad) })
  return out.slice(0, 8)
}

export const photographer = u => PHOTOGRAPHERS.find(p => p.u === u)
export const topicName = slug => TOPICS.find(t => t.slug === slug)?.ad || slug
