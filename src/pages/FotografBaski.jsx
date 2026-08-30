import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import heroImgDefault from '../assets/process/studyo.jpg'

// Supabase Storage'ta tek dosya için pratik üst sınır — ihtiyaç olursa
// buradan değiştir, kod içinde başka yerde hardcode edilmedi.
const MAX_FILE_SIZE_MB = 50

// Kodak kağıt tanıtım kartlarıyla aynı 4 seçenek (Fine Art kağıtları değil).
const PHOTO_FINISHES = ['Glossy', 'Satin', 'Matte', 'Metallic']
const PHOTO_SIZES = ['A5', 'A4', 'A3', 'A2']
const CUSTOM_SIZE = 'Özel Ölçü'
const BORDER_OPTIONS = ['Yok', 'Var']

// Hero'nun hemen altındaki Kodak kağıt tanıtım kartları — Meltem'in
// yazdığı metinler birebir, sıra: Glossy, Satin, Matte, Metallic.
// Görselleri Admin > Görseller'den yüklenecek (section: kodak-*-gorsel).
const KODAK_PAPERS = [
  {
    key: 'kodak-glossy', name: 'Kodak Glossy',
    subtitle: 'Yüksek parlaklık · canlı renkler · güçlü kontrast',
    paragraphs: [
      'Pürüzsüz ve parlak yüzeyi, fotoğraflara canlı ve dikkat çekici bir görünüm kazandırır. Renkleri doygun, siyahları derin ve ayrıntıları belirgin gösterir.',
      'Işığı güçlü biçimde yansıtan yüzeyi sayesinde özellikle renk ve kontrastın öne çıktığı fotoğraflarda etkileyici sonuç verir.',
    ],
    bullets: ['Yüksek parlaklık', 'Canlı ve doygun renkler', 'Derin siyahlar', 'Manzara, moda ve ürün fotoğrafları için ideal'],
  },
  {
    key: 'kodak-satin', name: 'Kodak Satin 260 gr',
    subtitle: '260 gr · düşük yansıma · dengeli saten yüzey',
    paragraphs: [
      'İnce ve ipeksi yüzeyi, parlak kâğıda göre ışığı daha kontrollü yansıtır. Fotoğrafın renklerini ve ayrıntılarını korurken daha sakin, dengeli bir görünüm sunar.',
      'Parmak izi ve yoğun parlamanın daha az fark edildiği zarif yüzeyiyle çok yönlü bir fotoğraf kâğıdıdır.',
    ],
    bullets: ['Kontrollü ve düşük yansıma', 'Dengeli renkler ve kontrast', 'Doğal cilt tonları', 'Portre, düğün ve günlük fotoğraf baskıları için ideal'],
  },
  {
    key: 'kodak-matte', name: 'Kodak Matte',
    subtitle: 'Yansımasız · sakin tonlar · yumuşak yüzey',
    paragraphs: [
      'Mat yüzeyi ışık yansımalarını en aza indirerek fotoğrafın farklı açılardan rahatça izlenmesini sağlar. Tonlara sakin, yumuşak ve rafine bir karakter kazandırır.',
      'Gösterişli bir parlaklık yerine fotoğrafın içeriğini ve ton geçişlerini öne çıkaran sade bir seçenektir.',
    ],
    bullets: ['Yansımasız görünüm', 'Yumuşak ton geçişleri', 'Sakin ve doğal renkler', 'Siyah-beyaz, portre ve sade çalışmalar için ideal'],
  },
  {
    key: 'kodak-metallic', name: 'Kodak Metallic 255 gr',
    subtitle: '255 gr · metalik parlama · yüksek görsel derinlik',
    paragraphs: [
      'Özel metalik yüzeyi, ışığa göre değişen gümüşümsü bir parlama oluşturur. Renkleri daha güçlü, siyahları daha yoğun ve parlak alanları daha dikkat çekici gösterir.',
      'Fotoğrafa belirgin bir derinlik ve üç boyut hissi kazandıran, serinin en çarpıcı yüzey seçeneğidir.',
    ],
    bullets: ['Metalik ve parlak görünüm', 'Güçlü ve doygun renkler', 'Derin siyahlar ve parlak beyazlar', 'Gece, mimari, otomobil ve yüksek kontrastlı fotoğraflar için ideal'],
  },
]

// Güncel fiyat tablosu (Sami/Meltem'in onayladığı rakamlar): A5=250, A4=350,
// A3=600, A2=1000 — Özel Ölçü'nün sabit fiyatı yok (teklif üzerine).
// Bu değerler varsayılan/başlangıç değeri olarak kullanılıyor; Admin
// panelindeki fiyat matrisinde (photo_print_prices, boy × kağıt yüzeyi
// bazında) bir (boy, yüzey) kombinasyonu için gerçek bir kayıt varsa o
// değer bunun üzerine yazılır (bkz. loadData) — yani Admin istediği an
// belirli bir ölçü/kağıt kombinasyonunu bu varsayılandan farklı bir
// fiyatla güncelleyebilir, kod bunu engellemiyor.
const SIZE_DEFAULT_PRICES = { 'A5': 250, 'A4': 350, 'A3': 600, 'A2': 1000 }
const DEFAULT_PRICES = {}
PHOTO_SIZES.forEach(s => PHOTO_FINISHES.forEach(f => { DEFAULT_PRICES[`${s}:${f}`] = SIZE_DEFAULT_PRICES[s] || 0 }))

const heading = { fontFamily: 'var(--font-heading)', fontWeight: 400, color: 'var(--ink)' }
const body = { fontFamily: 'var(--font-body)', fontSize: '.9rem', lineHeight: 1.7, color: 'var(--muted)' }
const label = { fontFamily: 'var(--font-body)', fontSize: '.72rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink)' }

const inputStyle = {
  width: '100%', padding: '.65rem .85rem', border: '1px solid var(--border)',
  fontFamily: 'var(--font-body)', fontSize: '.85rem', color: 'var(--ink)',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
}

const placeholderBox = (label) => (
  <div style={{
    width: '100%', height: '100%', minHeight: 160,
    background: 'var(--surface)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-body)', fontSize: '.68rem',
    letterSpacing: '.05em', color: 'var(--muted)', textAlign: 'center', padding: '1rem'
  }}>
    {label}
  </div>
)

// Yeni, boş bir baskı kalemi (bir fotoğraf + o fotoğrafa özel ayarlar).
// Her printItems elemanı diğerlerinden tamamen bağımsız — birini
// değiştirmek diğerlerini etkilemez (bkz. updatePrintItem).
function makePrintItem(file) {
  return {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    fileName: file.name,
    previewUrl: URL.createObjectURL(file),
    uploadedUrl: '',
    uploading: true,
    uploadError: '',
    finish: PHOTO_FINISHES[0],
    size: PHOTO_SIZES[0],
    quantity: 1,
    border: BORDER_OPTIONS[0],
    customSize: '',
  }
}

export default function FotografBaski() {
  const [images, setImages] = useState({
    hero: heroImgDefault,
    'kodak-glossy-gorsel': null, 'kodak-satin-gorsel': null,
    'kodak-matte-gorsel': null, 'kodak-metallic-gorsel': null,
    'wizard-mockup': null,
  })
  const [content, setContent] = useState({})
  // Gerçek fiyat matrisi yüklenene kadar güncel varsayılan tablo (DEFAULT_PRICES)
  // gösterilir — pricesLoaded false iken arayüz "…" gösterir, bu varsayımsal
  // değerle gerçek Admin verisi karıştırılmasın diye.
  const [prices, setPrices] = useState(DEFAULT_PRICES)
  const [pricesLoaded, setPricesLoaded] = useState(false)

  // --- "Baskını Oluştur" sihirbazı: 01 Dosya + 02 Kağıt & Ölçü aynı ekranda
  // (wizardStep === 'form'), 03 Bilgiler ayrı ekran (wizardStep === 'bilgiler').
  const [wizardStep, setWizardStep] = useState('form') // form | bilgiler | sent
  const [wizardError, setWizardError] = useState('')

  // Çoklu fotoğraf / bağımsız sipariş kalemi listesi — her fotoğrafın kendi
  // kağıt, ölçü, adet ve beyaz kenarlık seçimi var (bkz. makePrintItem).
  const [printItems, setPrintItems] = useState([])
  const fileRef = useRef()

  // --- Bilgiler formu (Ana Sayfa'daki Sipariş & İletişim ile aynı alan seti) ---
  const [orderForm, setOrderForm] = useState({ name: '', postaKodu: '', address: '', email: '', phone: '', mesaj: '' })
  const [orderStatus, setOrderStatus] = useState('idle') // idle | submitting
  const [orderError, setOrderError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [{ data: imgs }, { data: priceRows }, { data: contentRows }] = await Promise.all([
        supabase.from('page_images').select('*').eq('page', 'fotograf-baski').order('sort_order').order('id'),
        supabase.from('photo_print_prices').select('*'),
        supabase.from('page_content').select('section, content').eq('page', 'fotograf-baski'),
      ])

      if (contentRows && contentRows.length) {
        const map = {}
        contentRows.forEach(row => { if (row.content) map[row.section] = row.content })
        setContent(map)
      }

      if (imgs && imgs.length) {
        setImages(prev => {
          const next = { ...prev }
          const bySection = {}
          imgs.forEach(row => { (bySection[row.section] ||= []).push(row) })
          ;['hero', 'kodak-glossy-gorsel', 'kodak-satin-gorsel', 'kodak-matte-gorsel', 'kodak-metallic-gorsel',
            'wizard-mockup',
          ].forEach(section => {
            if (bySection[section]?.[0]) next[section] = bySection[section][0].image_url
          })
          return next
        })
      }

      // Gerçek fiyat matrisi — Admin panelinden (Fotoğraf Baskı Fiyatları)
      // girilen boy × kağıt yüzeyi rakamları. Admin bir kombinasyon için
      // 0'dan büyük bir fiyat girmişse o değer güncel varsayılan tabloyu
      // (DEFAULT_PRICES) geçersiz kılar; boş/0 ise (henüz hiç girilmemiş
      // ya da yanlışlıkla 0 kaydedilmiş) güncel varsayılan gösterilmeye
      // devam eder — 0 TL hiçbir zaman gerçek bir baskı fiyatı olamaz.
      const map = { ...DEFAULT_PRICES }
      ;(priceRows || []).forEach(p => {
        const price = Number(p.price) || 0
        if (price > 0) map[`${p.size}:${p.finish}`] = price
      })
      setPrices(map)
      setPricesLoaded(true)
    } catch (err) {
      console.error('Fotoğraf Baskı sayfası verisi yüklenemedi:', err)
      setPricesLoaded(true)
    }
  }

  // unitPrice, Admin'in gerçek matrisinden boy + kağıt yüzeyi baz alınarak
  // okunur — kağıt fiyatı etkiliyorsa (Admin farklı rakamlar girmişse) bu
  // otomatik yansır, "hepsi aynı fiyat" gibi bir varsayım yok.
  function priceForItem(item) {
    if (item.size === CUSTOM_SIZE) return null
    return prices[`${item.size}:${item.finish}`] ?? 0
  }
  function totalForItem(item) {
    const unit = priceForItem(item)
    return unit === null ? null : unit * (Number(item.quantity) || 0)
  }
  // Genel toplam — Özel Ölçü kalemleri sabit fiyatı olmadığı için (teklif
  // üzerine) sayısal toplama dahil edilmiyor.
  const grandTotal = printItems.reduce((sum, it) => sum + (totalForItem(it) || 0), 0)
  const hasCustomSizeItem = printItems.some(it => it.size === CUSTOM_SIZE)
  const anyUploading = printItems.some(it => it.uploading)
  const continueLabel = (pricesLoaded && grandTotal > 0)
    ? `Devam Et — ₺${grandTotal.toLocaleString('tr-TR')} →`
    : 'Devam Et →'

  // Supabase JS client'ının oturum kilidiyle ilgili bilinen bir durum: birden fazla
  // sekme/istemci aynı anda aynı Supabase session'ına erişmeye çalışınca "lock ...
  // was released because another request stole it" hatası dönebiliyor. Bu geçici
  // bir durum olduğu için birkaç kez kısa gecikmeyle otomatik tekrar deniyoruz.
  async function uploadWithRetry(path, file, attempt = 0) {
    const { error } = await supabase.storage.from('site-images').upload(path, file)
    if (!error) return
    const isLockError = error.message?.toLowerCase().includes('lock')
    if (isLockError && attempt < 2) {
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
      return uploadWithRetry(path, file, attempt + 1)
    }
    throw error
  }

  // Aynı anda seçilen/bırakılan tüm dosyalar için birer printItem oluşturur
  // (anında yerel önizlemeyle), sonra her biri kendi başına arka planda
  // yüklenir — biri başarısız olsa diğerlerini etkilemez.
  function addFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const invalid = []
    const valid = []
    files.forEach(file => {
      if (!file.type.startsWith('image/')) { invalid.push(`${file.name}: geçersiz dosya türü`); return }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { invalid.push(`${file.name}: ${MAX_FILE_SIZE_MB} MB sınırını aşıyor`); return }
      valid.push(file)
    })
    setWizardError(invalid.length ? invalid.join(' · ') : '')
    if (!valid.length) return

    const newItems = valid.map(makePrintItem)
    setPrintItems(items => [...items, ...newItems])
    newItems.forEach(item => uploadPrintItem(item.id, item.file))
  }

  async function uploadPrintItem(id, file) {
    const ext = file.name.split('.').pop()
    const path = `photo-print/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    try {
      await uploadWithRetry(path, file)
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error)
      setPrintItems(items => items.map(it => it.id === id ? { ...it, uploading: false, uploadError: 'Yükleme başarısız oldu, lütfen tekrar deneyin.' } : it))
      return
    }
    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    setPrintItems(items => items.map(it => it.id === id ? { ...it, uploading: false, uploadedUrl: data.publicUrl } : it))
  }

  // Tek bir fotoğrafın ayarını günceller — diğer printItems elemanlarına
  // dokunmaz (bağımsız sipariş kalemi gereksinimi).
  function updatePrintItem(id, patch) {
    setPrintItems(items => items.map(it => it.id === id ? { ...it, ...patch } : it))
  }

  function removePrintItem(id) {
    setPrintItems(items => {
      const target = items.find(it => it.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return items.filter(it => it.id !== id)
    })
  }

  // 01 Dosya + 02 Kağıt & Ölçü ekranından 03 Bilgiler ekranına geçiş.
  function goToBilgiler() {
    setWizardError('')
    if (printItems.length === 0) { setWizardError('Lütfen en az bir fotoğraf yükleyin.'); return }
    if (anyUploading) { setWizardError('Fotoğraflar yükleniyor, lütfen bekleyin.'); return }
    if (printItems.some(it => it.uploadError || !it.uploadedUrl)) {
      setWizardError('Bazı fotoğraflar yüklenemedi — lütfen tekrar deneyin veya listeden kaldırın.')
      return
    }
    for (const it of printItems) {
      if (it.size === CUSTOM_SIZE && !it.customSize.trim()) {
        setWizardError(`"${it.fileName}" için özel ölçü belirtilmedi.`)
        return
      }
    }
    setWizardStep('bilgiler')
  }

  function updateOrderForm(e) {
    const { name, value } = e.target
    setOrderForm(f => ({ ...f, [name]: value }))
  }

  async function submitOrder(e) {
    e.preventDefault()
    if (!orderForm.name?.trim()) { setOrderError('Ad soyad gerekli.'); return }
    if (!orderForm.email?.trim() || !orderForm.email.includes('@')) { setOrderError('Geçerli bir e-posta adresi giriniz.'); return }
    if (!orderForm.phone?.trim() || orderForm.phone.trim().length < 10) { setOrderError('Geçerli bir telefon numarası giriniz.'); return }
    if (!orderForm.address?.trim() || orderForm.address.trim().length < 10) { setOrderError('Geçerli bir adres giriniz.'); return }

    setOrderStatus('submitting')
    setOrderError('')

    const payload = {
      name: orderForm.name,
      posta_kodu: orderForm.postaKodu,
      email: orderForm.email,
      phone: orderForm.phone,
      address: orderForm.address,
      note: orderForm.mesaj,
      session_id: getSessionId(),
      // Her fotoğraf kendi kağıt/ölçü/adet/beyaz kenarlık ayarıyla bağımsız
      // bir sipariş kalemi olarak gönderiliyor — create-photo-print-order
      // zaten bir items dizisi bekliyor (backend'de değişiklik gerekmedi).
      items: printItems.map(it => ({
        image_url: it.uploadedUrl,
        size: it.size === CUSTOM_SIZE ? CUSTOM_SIZE : it.size,
        finish: it.finish,
        quantity: Math.max(1, Number(it.quantity) || 1),
        white_border: it.border === 'Var',
        note: it.size === CUSTOM_SIZE ? `Özel ölçü: ${it.customSize.trim()}` : null,
      })),
    }

    try {
      const res = await fetch('https://qrbkzjosorimiwdbwyyl.supabase.co/functions/v1/create-photo-print-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setOrderStatus('idle'); setOrderError(data.error || 'Sipariş gönderilemedi.'); return }
    } catch {
      setOrderStatus('idle')
      setOrderError('Sipariş gönderilemedi: bağlantı hatası.')
      return
    }

    setOrderStatus('idle')
    setWizardStep('sent')
  }

  return (
    <div style={{ paddingTop: '4.2rem' }}>
      {/* Hero — site genelindeki diğer hero'larla (Fine Art Baskı referans) aynı boy: 58vh. */}
      <section style={{
        position: 'relative', height: '58vh', minHeight: 380,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden',
      }}>
        <img
          src={images.hero}
          alt="Stüdyoda hazırlanan fotoğraf baskıları"
          loading="eager" fetchPriority="high" decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,17,17,.15), rgba(17,17,17,.55))' }} />
      </section>

      {/* Hero'nun hemen altında, ortalı tanıtım metni + öne çıkan özellik. */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '3.5rem 2rem 1rem', textAlign: 'center' }}>
        <h2 style={{ ...heading, fontSize: '2rem', margin: '0 0 1.2rem' }}>Fotoğraf Baskı</h2>
        <p style={{ ...body, fontSize: '.92rem', marginBottom: '2.5rem' }}>
          Fotoğraflarınızı profesyonel pigment mürekkepler ve özenle seçilmiş fotoğraf kâğıtlarıyla
          basıyoruz. Parlak ve saten yüzey seçenekleri; güçlü siyahlar, temiz ayrıntılar ve canlı
          tonlarla fotoğrafın karakterini korur.
        </p>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h3 style={{ ...heading, fontSize: '1.05rem', margin: '0 0 .5rem' }}>Profesyonel Renk Yönetimi</h3>
          <p style={{ ...body, fontSize: '.85rem' }}>
            Her çalışma, tutarlı tonlar ve doğru renkler için baskı öncesinde kontrollü bir renk
            sürecinden geçirilir.
          </p>
        </div>
      </section>

      {/* Kodak fotoğraf kağıtları — Hero'nun hemen altında, sırayla
          Glossy, Satin, Matte, Metallic. */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '3.5rem 2rem 1rem' }}>
        <style>{`
          .kodak-papers-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.8rem; }
          @media (max-width: 1100px) {
            .kodak-papers-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
          @media (max-width: 640px) {
            .kodak-papers-grid { grid-template-columns: 1fr; }
          }
        `}</style>
        <div className="kodak-papers-grid">
          {KODAK_PAPERS.map(paper => (
            <div key={paper.key} style={{ background: 'var(--surface)', padding: '1.2rem' }}>
              <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', marginBottom: '1.2rem' }}>
                {images[`${paper.key}-gorsel`]
                  ? <img
                      src={images[`${paper.key}-gorsel`]}
                      alt={paper.name}
                      loading="lazy" decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  : placeholderBox(`${paper.name} — Admin'den yükle`)
                }
              </div>
              <h3 style={{ ...heading, fontSize: '1.15rem', margin: '0 0 .5rem' }}>{paper.name}</h3>
              <p style={{ ...label, color: 'var(--ink)', marginBottom: '.9rem' }}>{paper.subtitle}</p>
              {paper.paragraphs.map((p, i) => (
                <p key={i} style={{ ...body, fontSize: '.82rem', marginBottom: '.9rem' }}>{p}</p>
              ))}
              <ul style={{ ...body, fontSize: '.8rem', margin: 0, paddingLeft: '1.1rem' }}>
                {paper.bullets.map(b => <li key={b} style={{ marginBottom: '.35rem' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* "Baskını Oluştur" sihirbazı — koyu temalı bölüm, 01 Dosya + 02 Kağıt
          & Ölçü aynı kart içinde, 03 Bilgiler ayrı bir ekranda. Mevcut backend
          (create-photo-print-order, photo_print_orders/_items) hiç değişmeden
          kullanılıyor — sadece arayüz değişti. */}
      <section style={{ background: 'var(--ink)', padding: '4rem 2rem' }}>
        <style>{`
          .fb-wizard { display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; max-width: 1200px; margin: 0 auto; align-items: stretch; }
          .fb-wizard-left { display: flex; flex-direction: column; height: 100%; }
          .fb-wizard-mockup { flex: 1; min-height: 240px; }
          @media (max-width: 900px) {
            .fb-wizard { grid-template-columns: 1fr; gap: 2.5rem; }
          }
          .fb-btn-group { display: flex; flex-wrap: wrap; gap: .6rem; }
        `}</style>

        <div className="fb-wizard">
          {/* Sol: başlık, alt metin, adım göstergesi, örnek baskı görseli —
              flex column + görsel flex:1, sağdaki "Baskını Oluştur" kartıyla
              aynı yükseklikte bitsin diye (kartın uzunluğuna göre esner). */}
          <div className="fb-wizard-left">
            <h2 style={{ ...heading, color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', margin: '0 0 1rem' }}>
              Fotoğrafını baskıya dönüştür.
            </h2>
            <p style={{ ...body, color: 'rgba(255,255,255,.65)', marginBottom: '2.2rem', maxWidth: 420 }}>
              Kağıdını ve ölçünü seç, dosyanı yükle. Baskıya uygunluğunu kontrol edip seninle iletişime geçelim.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2.5rem' }}>
              {[{ n: '01', label: 'DOSYA' }, { n: '02', label: 'KAĞIT & ÖLÇÜ' }, { n: '03', label: 'BİLGİLER' }].map((s, i) => {
                const currentIndex = wizardStep === 'bilgiler' ? 2 : wizardStep === 'sent' ? 3 : (printItems.length > 0 ? 1 : 0)
                const active = i === currentIndex
                const done = i < currentIndex
                return (
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {i > 0 && <span style={{ width: 18, height: 1, background: done ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.2)' }} />}
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '.66rem', letterSpacing: '.12em',
                      color: active ? '#fff' : done ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.3)',
                      fontWeight: active ? 700 : 400, whiteSpace: 'nowrap',
                    }}>
                      {s.n} {s.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="fb-wizard-mockup" style={{ width: '100%', maxWidth: 380, overflow: 'hidden' }}>
              {images['wizard-mockup'] ? (
                <img src={images['wizard-mockup']} alt="Örnek baskı" loading="lazy" decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', background: 'rgba(255,255,255,.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center',
                  fontFamily: 'var(--font-body)', fontSize: '.68rem', color: 'rgba(255,255,255,.4)',
                }}>
                  Örnek Baskı Görseli — Admin'den yükle
                </div>
              )}
            </div>
          </div>

          {/* Sağ: "Baskını Oluştur" kartı */}
          <div style={{ background: '#fff', padding: '2.2rem' }}>
            {wizardStep === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                <h3 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 .8rem' }}>Siparişin Alındı</h3>
                <p style={body}>Dosyanı kontrol edip en kısa sürede seninle iletişime geçeceğiz.</p>
              </div>
            ) : wizardStep === 'bilgiler' ? (
              <>
                <h3 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 1.5rem' }}>Bilgilerin</h3>
                <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Ad Soyad *</label>
                      <input name="name" required value={orderForm.name} onChange={updateOrderForm} style={inputStyle} placeholder="Adınız ve soyadınız" />
                    </div>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Posta Kodu</label>
                      <input name="postaKodu" value={orderForm.postaKodu} onChange={updateOrderForm} style={inputStyle} placeholder="Posta kodu" />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Teslimat Adresi *</label>
                    <textarea name="address" required value={orderForm.address} onChange={updateOrderForm} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Açık adresiniz" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>E-posta *</label>
                      <input name="email" type="email" required value={orderForm.email} onChange={updateOrderForm} style={inputStyle} placeholder="E-posta adresiniz" />
                    </div>
                    <div>
                      <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Telefon *</label>
                      <input name="phone" type="tel" required value={orderForm.phone} onChange={updateOrderForm} style={inputStyle} placeholder="Telefon numaranız" />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...label, display: 'block', marginBottom: '.4rem' }}>Mesaj (opsiyonel)</label>
                    <textarea name="mesaj" maxLength={500} value={orderForm.mesaj} onChange={updateOrderForm} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Eklemek istediğin bir not varsa yazabilirsin" />
                  </div>

                  {orderError && <div style={{ color: '#c33', fontSize: '.78rem' }}>{orderError}</div>}

                  <div style={{ display: 'flex', gap: '.8rem', marginTop: '.5rem' }}>
                    <button
                      type="button" onClick={() => setWizardStep('form')}
                      style={{
                        padding: '.9rem 1.1rem', background: 'none', color: 'var(--ink)',
                        border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '.75rem',
                        letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      ← Geri
                    </button>
                    <button
                      type="submit" disabled={orderStatus === 'submitting'}
                      style={{
                        flex: 1, padding: '.9rem', background: 'var(--accent)', color: '#fff',
                        border: 'none', fontFamily: 'var(--font-body)', fontSize: '.75rem',
                        letterSpacing: '.14em', textTransform: 'uppercase',
                        cursor: orderStatus === 'submitting' ? 'not-allowed' : 'pointer',
                        opacity: orderStatus === 'submitting' ? .7 : 1,
                      }}
                    >
                      {orderStatus === 'submitting' ? 'Gönderiliyor…' : 'Siparişi Gönder'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 1.5rem' }}>Baskını Oluştur</h3>

                {printItems.length === 0 && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
                    style={{
                      border: '1px dashed var(--border)', padding: '1.6rem 1rem',
                      textAlign: 'center', cursor: 'pointer', minHeight: 160,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.6rem',
                      background: 'var(--surface)', marginBottom: '1.4rem',
                    }}
                  >
                    <span style={{ ...body, fontSize: '.85rem', color: 'var(--ink)' }}>Fotoğraflarını buraya bırak</span>
                    <span style={{ ...body, fontSize: '.72rem' }}>JPG, TIFF veya PNG · birden fazla seçebilirsin</span>
                    <button
                      type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                      style={{
                        marginTop: '.3rem', padding: '.55rem 1.2rem', background: 'var(--ink)', color: '#fff',
                        border: 'none', fontFamily: 'var(--font-body)', fontSize: '.68rem',
                        letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      Dosya Seç
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

                {/* Her fotoğraf kendi bağımsız kartında — kağıt/ölçü/adet/beyaz
                    kenarlık seçimi burada değiştirilirse yalnızca bu kartı ve
                    genel toplamı etkiler, diğer fotoğraflara dokunmaz. */}
                {printItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginBottom: '1.2rem' }}>
                    {printItems.map((item, idx) => {
                      const itemIsCustom = item.size === CUSTOM_SIZE
                      const itemTotal = totalForItem(item)
                      return (
                        <div key={item.id} style={{ border: '1px solid var(--border)', padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '.9rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: 60, height: 60, flexShrink: 0, background: 'var(--surface)', overflow: 'hidden' }}>
                              <img src={item.previewUrl} alt={item.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ ...label, color: 'var(--ink)', margin: '0 0 .3rem' }}>Fotoğraf {idx + 1}</p>
                              <p style={{ ...body, fontSize: '.75rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.fileName}</p>
                              {item.uploading && <p style={{ ...body, fontSize: '.72rem', margin: '.3rem 0 0' }}>Yükleniyor…</p>}
                              {item.uploadError && <p style={{ color: '#c33', fontSize: '.72rem', margin: '.3rem 0 0' }}>{item.uploadError}</p>}
                            </div>
                            <button
                              type="button" onClick={() => removePrintItem(item.id)} aria-label="Fotoğrafı kaldır"
                              style={{
                                flexShrink: 0, width: 26, height: 26, border: '1px solid var(--border)', background: '#fff',
                                color: 'var(--ink)', cursor: 'pointer', fontSize: '.8rem', lineHeight: 1,
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>Kağıt</label>
                            <div className="fb-btn-group">
                              {PHOTO_FINISHES.map(f => (
                                <button key={f} type="button" onClick={() => updatePrintItem(item.id, { finish: f })} style={{
                                  padding: '.5rem 1rem', border: `1px solid ${item.finish === f ? 'var(--ink)' : 'var(--border)'}`,
                                  background: item.finish === f ? 'var(--ink)' : 'none', color: item.finish === f ? '#fff' : 'var(--ink)',
                                  fontFamily: 'var(--font-body)', fontSize: '.78rem', cursor: 'pointer',
                                }}>
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>Ölçü</label>
                            <div className="fb-btn-group">
                              {PHOTO_SIZES.map(s => (
                                <button key={s} type="button" onClick={() => updatePrintItem(item.id, { size: s })} style={{
                                  padding: '.5rem 1rem', border: `1px solid ${item.size === s ? 'var(--ink)' : 'var(--border)'}`,
                                  background: item.size === s ? 'var(--ink)' : 'none', color: item.size === s ? '#fff' : 'var(--ink)',
                                  fontFamily: 'var(--font-body)', fontSize: '.78rem', cursor: 'pointer',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.2rem', minWidth: 62,
                                }}>
                                  <span>{s}</span>
                                  <span style={{ fontSize: '.66rem', opacity: .75 }}>
                                    {pricesLoaded ? `${(prices[`${s}:${item.finish}`] ?? 0).toLocaleString('tr-TR')} TL` : '…'}
                                  </span>
                                </button>
                              ))}
                              <button type="button" onClick={() => updatePrintItem(item.id, { size: CUSTOM_SIZE })} style={{
                                padding: '.5rem 1rem', border: `1px solid ${itemIsCustom ? 'var(--ink)' : 'var(--border)'}`,
                                background: itemIsCustom ? 'var(--ink)' : 'none', color: itemIsCustom ? '#fff' : 'var(--ink)',
                                fontFamily: 'var(--font-body)', fontSize: '.78rem', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.2rem', minWidth: 62,
                              }}>
                                <span>{CUSTOM_SIZE}</span>
                                <span style={{ fontSize: '.66rem', opacity: .75 }}>Teklif üzerine</span>
                              </button>
                            </div>
                            {itemIsCustom && (
                              <div style={{ marginTop: '.9rem' }}>
                                <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>
                                  İstediğiniz ölçüyü belirtiniz
                                </label>
                                <input
                                  value={item.customSize}
                                  onChange={e => updatePrintItem(item.id, { customSize: e.target.value })}
                                  style={inputStyle}
                                  placeholder="Örn. 30 × 45 cm"
                                />
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>Adet</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                                <button type="button" onClick={() => updatePrintItem(item.id, { quantity: Math.max(1, (Number(item.quantity) || 1) - 1) })} style={{
                                  width: 32, height: 32, border: '1px solid var(--border)', background: '#fff',
                                  fontSize: '1rem', color: 'var(--ink)', cursor: 'pointer', lineHeight: 1,
                                }}>−</button>
                                <span style={{ ...label, color: 'var(--ink)', minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                <button type="button" onClick={() => updatePrintItem(item.id, { quantity: Math.min(100, (Number(item.quantity) || 1) + 1) })} style={{
                                  width: 32, height: 32, border: '1px solid var(--border)', background: '#fff',
                                  fontSize: '1rem', color: 'var(--ink)', cursor: 'pointer', lineHeight: 1,
                                }}>+</button>
                              </div>
                            </div>
                            <div>
                              <label style={{ ...label, display: 'block', marginBottom: '.5rem', fontSize: '.68rem' }}>Beyaz Kenarlık</label>
                              <select value={item.border} onChange={e => updatePrintItem(item.id, { border: e.target.value })} style={inputStyle}>
                                {BORDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          </div>

                          <div style={{ paddingTop: '.8rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ ...body, fontSize: '.82rem', color: 'var(--ink)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                              <span>Bu fotoğraf</span>
                              <span>{itemIsCustom ? 'Teklif üzerine' : (pricesLoaded ? `₺${(itemTotal || 0).toLocaleString('tr-TR')}` : '…')}</span>
                            </div>
                            {itemIsCustom && (
                              <p style={{ ...body, fontSize: '.72rem', margin: '.4rem 0 0' }}>
                                Özel ölçünüz fiyatlandırıldıktan sonra sizinle iletişime geçilecektir.
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {printItems.length > 0 && (
                  <button
                    type="button" onClick={() => fileRef.current?.click()}
                    style={{
                      width: '100%', padding: '.8rem', background: 'none', color: 'var(--ink)',
                      border: '1px dashed var(--border)', fontFamily: 'var(--font-body)', fontSize: '.75rem',
                      letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '1.4rem',
                    }}
                  >
                    + Fotoğraf Ekle
                  </button>
                )}

                {printItems.length > 0 && (
                  <div style={{ marginBottom: '1.2rem', paddingTop: '.9rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ ...label, color: 'var(--ink)', margin: '0 0 .8rem', fontSize: '.7rem' }}>Sipariş Özeti</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', marginBottom: '.8rem' }}>
                      {printItems.map((item, idx) => {
                        const itemIsCustom = item.size === CUSTOM_SIZE
                        const itemTotal = totalForItem(item)
                        return (
                          <div key={item.id} style={{ ...body, fontSize: '.8rem', display: 'flex', justifyContent: 'space-between', gap: '.6rem' }}>
                            <span>Fotoğraf {idx + 1} — {item.size} · {item.finish} · {item.quantity} adet</span>
                            <span style={{ color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                              {itemIsCustom ? 'Teklif üzerine' : (pricesLoaded ? `₺${(itemTotal || 0).toLocaleString('tr-TR')}` : '…')}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '.9rem', paddingTop: '.7rem', borderTop: '1px solid var(--border)' }}>
                      <span>TOPLAM</span>
                      <span>{pricesLoaded ? `₺${grandTotal.toLocaleString('tr-TR')}` : '…'}</span>
                    </div>
                    {hasCustomSizeItem && (
                      <p style={{ ...body, fontSize: '.72rem', margin: '.5rem 0 0' }}>
                        Özel ölçü seçilen fotoğraflar toplama dahil değildir — fiyat kontrol sonrası teklif olarak iletilecek.
                      </p>
                    )}
                    <p style={{ ...body, fontSize: '.72rem', margin: '.4rem 0 0' }}>Kargo ücreti dahil değildir.</p>
                  </div>
                )}

                {wizardError && <p style={{ color: '#c33', fontSize: '.78rem', marginTop: '-.6rem', marginBottom: '1rem' }}>{wizardError}</p>}

                <button
                  type="button" onClick={goToBilgiler} disabled={anyUploading || printItems.length === 0}
                  style={{
                    width: '100%', padding: '.9rem', background: 'var(--accent)', color: '#fff',
                    border: 'none', fontFamily: 'var(--font-body)', fontSize: '.75rem',
                    letterSpacing: '.14em', textTransform: 'uppercase',
                    cursor: (anyUploading || printItems.length === 0) ? 'not-allowed' : 'pointer',
                    opacity: (anyUploading || printItems.length === 0) ? .6 : 1,
                  }}
                >
                  {continueLabel}
                </button>

                <p style={{ ...body, fontSize: '.7rem', textAlign: 'center', marginTop: '1rem' }}>
                  Dosyaların baskıdan önce kontrol edilir.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
