import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { FONT_PRESETS, setFont } from '../lib/siteFonts'

// Sami "sitede şu an ne görünüyor onu da görmem lazım" dedi — bir slotta
// hiç admin görseli yoksa (page_images'ta satır yok) sayfanın kendi
// dosyasındaki hardcoded fallback görsel sitede gösteriliyor, ama Admin bunu
// bilmiyordu, sadece düz metin gösteriyordu. Aynı fallback görselleri burada
// da import edip önizlemede göstermek için.
import galleryHeroDefault from '../assets/fine-art/hero.jpg'
import galleryFotografDefault from '../assets/fine-art/ornek-botanik.jpg'
import galleryFineArtDefault from '../assets/process/baski-sureci.jpg'
import galleryCerceveDefault from '../assets/cerceve/ornek-ahsap-cerceve.jpg'
import cerceveHeroDefault from '../assets/cerceve/hero.jpg'
import cerceveRenkSecenekleriDefault from '../assets/cerceve/renk-secenekleri.jpg'
import cerceveRenkDetayDefault from '../assets/cerceve/renk-secenekleri-detay.jpg'
import cerceveOrnekSiyahDefault from '../assets/cerceve/ornek-siyah-cerceve.jpg'
import cerceveOrnekAhsapDefault from '../assets/cerceve/ornek-ahsap-cerceve.jpg'
import fineArtHeroDefault from '../assets/fine-art/hero.jpg'
import fineArtKagitSecenekleriDefault from '../assets/fine-art/kagit-secenekleri.jpg'
import fineArtOrnekBotanikDefault from '../assets/fine-art/ornek-botanik.jpg'
import fineArtOrnekBotanik2Default from '../assets/fine-art/ornek-botanik-2.jpg'
import fineArtOrnekDoku1Default from '../assets/fine-art/ornek-doku-1.jpg'
import fineArtOrnekDoku2Default from '../assets/fine-art/ornek-doku-2.jpg'
import fotografBaskiHeroDefault from '../assets/process/studyo.jpg'

// İşler ürünlerinde kullanılan sabit boy/fiyat seçenekleri — yeni eser
// eklerken varsayılan olarak bunlarla başlanır (gerekirse elle değiştirilebilir).
const DEFAULT_SIZES = [
  { label: 'A4', price: 1240 },
  { label: 'A3', price: 2420 },
  { label: 'A2', price: 3640 },
]

const EMPTY_FORM = {
  title: '', slug: '', artist: 'Sami Boran',
  year: new Date().getFullYear(), medium: '', type: '', material: '', description: '',
  tags: '', sizes: DEFAULT_SIZES.map(s => ({ ...s })),
  is_original: false, stock: 0, image_url: ''
}

const EMPTY_FRAME = { size: '', note: '', prices: [{ color: '', price: '', swatch_hex: '#111111' }] }
const EMPTY_PAPER = {
  name: '', surface: '', gsm: '', texture: '', color: '', composition: '', description: '',
  texture_photo_url: '', preview_photo_url: '', featured_in_guide: false,
}

// Fotoğraf Baskı sayfasındaki boy/yüzey fiyat matrisi.
// Fiyat tablosunun eksenleri — Fotoğraf Baskı sihirbazındaki Kağıt/Ölçü
// butonlarıyla birebir aynı olmalı (Özel Ölçü'nün sabit fiyatı yok, bu
// yüzden burada yer almıyor). Fiyat sadece boya göre değişiyor, yüzeye göre
// değişmiyor — bu yüzden Admin'de tek bir "boy başına fiyat" alanı var,
// kaydedilirken bu değer 4 yüzeyin de satırına aynen yazılıyor.
const PHOTO_SIZES = ['A5', 'A4', 'A3', 'A2']
const PHOTO_FINISHES = ['Glossy', 'Satin', 'Matte', 'Metallic']

// Görseller sekmesinde yönetilen sabit alanlar. multiple:false => tek görsel (yeni yükleme
// eskisinin yerine geçer). multiple:true => istenildiği kadar görsel eklenip silinebilir.
const IMAGE_SLOTS = [
  { page: 'gallery', section: 'hero', label: 'Ana Sayfa — Hero Görselleri, Masaüstü (yatay, 3 görsel önerilir, sırayla dönen slayt)', multiple: true, aspect: '21 / 9', defaultImgs: [galleryHeroDefault] },
  { page: 'gallery', section: 'hero-mobile', label: 'Ana Sayfa — Hero Görselleri, Mobil (dikey/portre, 3 görsel önerilir)', multiple: true, aspect: '9 / 16' },
  { page: 'gallery', section: 'hizmet-fotograf', label: 'Ana Sayfa — Hizmetlerimiz: Fotoğraf Baskı', multiple: false, aspect: '4 / 3', defaultImg: galleryFotografDefault },
  { page: 'gallery', section: 'hizmet-fine-art', label: 'Ana Sayfa — Hizmetlerimiz: Fine Art / Giclée Baskı', multiple: false, aspect: '4 / 3', defaultImg: galleryFineArtDefault },
  { page: 'gallery', section: 'hizmet-edisyon', label: 'Ana Sayfa — Hizmetlerimiz: Edisyon & Art Print Üretimi', multiple: false, aspect: '4 / 3' },
  { page: 'gallery', section: 'hizmet-poster', label: 'Ana Sayfa — Hizmetlerimiz: Poster & Kartpostal Baskı', multiple: false, aspect: '4 / 3' },
  { page: 'gallery', section: 'hizmet-sergi', label: 'Ana Sayfa — Hizmetlerimiz: Sergi & Portfolyo Baskıları', multiple: false, aspect: '4 / 3' },
  { page: 'gallery', section: 'hizmet-cerceve', label: 'Ana Sayfa — Hizmetlerimiz: Çerçeveleme', multiple: false, aspect: '4 / 3', defaultImg: galleryCerceveDefault },
  { page: 'gallery', section: 'dosya-format-gorsel', label: 'Ana Sayfa — Dosya Hazırlığı: Dosya Formatı', multiple: false, aspect: '3 / 4' },
  { page: 'gallery', section: 'renk-profili-gorsel', label: 'Ana Sayfa — Dosya Hazırlığı: Renk Profili', multiple: false, aspect: '3 / 4' },
  { page: 'gallery', section: 'cozunurluk-olcu-gorsel', label: 'Ana Sayfa — Dosya Hazırlığı: Çözünürlük ve Ölçü', multiple: false, aspect: '3 / 4' },
  { page: 'gallery', section: 'tasma-payi-gorsel', label: 'Ana Sayfa — Dosya Hazırlığı: Taşma Payı ve Kesim', multiple: false, aspect: '3 / 4' },
  { page: 'gallery', section: 'dosya-gonderimi-gorsel', label: 'Ana Sayfa — Dosya Hazırlığı: Dosya Gönderimi', multiple: false, aspect: '3 / 4' },
  { page: 'gallery', section: 'sertifikali-kagit-1', label: 'Ana Sayfa — Sertifikalı Kağıt 1: Museum Etching', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-2', label: 'Ana Sayfa — Sertifikalı Kağıt 2: German Etching', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-3', label: 'Ana Sayfa — Sertifikalı Kağıt 3: Photo Rag Ultra Smooth', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-4', label: 'Ana Sayfa — Sertifikalı Kağıt 4: Photo Rag Bright White', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-5', label: 'Ana Sayfa — Sertifikalı Kağıt 5: William Turner', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-6', label: 'Ana Sayfa — Sertifikalı Kağıt 6: Photo Rag Matt Baryta', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-7', label: 'Ana Sayfa — Sertifikalı Kağıt 7: Photo Rag Pearl', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-8', label: 'Ana Sayfa — Sertifikalı Kağıt 8: Bamboo', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-9', label: 'Ana Sayfa — Sertifikalı Kağıt 9: Photo Rag Duo', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'sertifikali-kagit-10', label: 'Ana Sayfa — Sertifikalı Kağıt 10: Photo Rag (308 gsm, Matt Baryta değil)', multiple: false, aspect: '4 / 5' },
  { page: 'gallery', section: 'iletisim-gorsel', label: 'Ana Sayfa — İletişim Üstü Görsel', multiple: false, aspect: '16 / 7' },
  { page: 'cerceve', section: 'hero', label: 'Çerçeve — Hero Görseli', multiple: false, aspect: '21 / 9', defaultImg: cerceveHeroDefault },
  { page: 'cerceve', section: 'renk-secenekleri', label: 'Çerçeve — Renk Seçenekleri', multiple: false, aspect: '4 / 3', defaultImg: cerceveRenkSecenekleriDefault },
  { page: 'cerceve', section: 'renk-detay', label: 'Çerçeve — Renk Detayı', multiple: false, aspect: '4 / 3', defaultImg: cerceveRenkDetayDefault },
  { page: 'cerceve', section: 'ornekler', label: 'Çerçeve — Örnek Çerçeveli İşler', multiple: true, aspect: '4 / 5', defaultImgs: [cerceveOrnekSiyahDefault, cerceveOrnekAhsapDefault] },
  { page: 'fine-art-baski', section: 'hero', label: 'Fine Art Baskı — Hero Görseli', multiple: false, aspect: '21 / 9', defaultImg: fineArtHeroDefault },
  { page: 'fine-art-baski', section: 'kagit-secenekleri', label: 'Fine Art Baskı — Kağıt Seçenekleri', multiple: false, aspect: '4 / 3', defaultImg: fineArtKagitSecenekleriDefault },
  { page: 'fine-art-baski', section: 'ornekler', label: 'Fine Art Baskı — Örnek Baskılarımız', multiple: true, aspect: '4 / 5', defaultImgs: [fineArtOrnekBotanikDefault, fineArtOrnekBotanik2Default, fineArtOrnekDoku1Default, fineArtOrnekDoku2Default] },
  { page: 'fotograf-baski', section: 'hero', label: 'Fotoğraf Baskı — Hero Görseli', multiple: false, aspect: '21 / 9', defaultImg: fotografBaskiHeroDefault },
  { page: 'fotograf-baski', section: 'kodak-glossy-gorsel', label: 'Fotoğraf Baskı — Kodak Glossy Görseli', multiple: false, aspect: '4 / 3' },
  { page: 'fotograf-baski', section: 'kodak-satin-gorsel', label: 'Fotoğraf Baskı — Kodak Satin Görseli', multiple: false, aspect: '4 / 3' },
  { page: 'fotograf-baski', section: 'kodak-matte-gorsel', label: 'Fotoğraf Baskı — Kodak Matte Görseli', multiple: false, aspect: '4 / 3' },
  { page: 'fotograf-baski', section: 'kodak-metallic-gorsel', label: 'Fotoğraf Baskı — Kodak Metallic Görseli', multiple: false, aspect: '4 / 3' },
  { page: 'fotograf-baski', section: 'wizard-mockup', label: 'Fotoğraf Baskı — "Baskını Oluştur" Örnek Baskı Görseli', multiple: false, aspect: '4 / 5' },
]

// page_content tablosunda yönetilen düzenlenebilir metin alanları — page_images ile
// aynı desen: her satır page+section ile anahtarlı, admin hiç dokunmadıysa (satır
// yok) sayfa kendi hardcoded metnini fallback olarak gösterir. placeholder, o
// fallback'in aynısı — admin boş kutuya bakınca sitede şu an ne yazdığını görsün diye.
const PAGE_TEXT_FIELDS = {
  gallery: [
    { section: 'hizmet-fotograf-baslik', label: 'Hizmetlerimiz — Fotoğraf Baskı Kart Başlığı', placeholder: 'Fotoğraf Baskı' },
    { section: 'hizmet-fotograf-aciklama', label: 'Hizmetlerimiz — Fotoğraf Baskı Kart Açıklaması', placeholder: 'Kodak ve profesyonel fotoğraf kağıtları ile mat, parlak veya saten yüzey seçenekleri.', tall: true },
    { section: 'hizmet-fine-art-baslik', label: 'Hizmetlerimiz — Fine Art / Giclée Baskı Kart Başlığı', placeholder: 'Fine Art / Giclée Baskı' },
    { section: 'hizmet-fine-art-aciklama', label: 'Hizmetlerimiz — Fine Art / Giclée Baskı Kart Açıklaması', placeholder: 'Hahnemühle arşiv kağıtları ve pigment mürekkeplerle, müze kalitesinde fine art baskılar.', tall: true },
    { section: 'hizmet-edisyon-baslik', label: 'Hizmetlerimiz — Edisyon & Art Print Üretimi Kart Başlığı', placeholder: 'Edisyon & Art Print Üretimi' },
    { section: 'hizmet-edisyon-aciklama', label: 'Hizmetlerimiz — Edisyon & Art Print Üretimi Kart Açıklaması', placeholder: 'Sanatçılar için sınırlı sayıda edisyon, numaralandırma, imza ve sertifika desteği.', tall: true },
    { section: 'hizmet-poster-baslik', label: 'Hizmetlerimiz — Poster & Kartpostal Baskı Kart Başlığı', placeholder: 'Poster & Kartpostal Baskı' },
    { section: 'hizmet-poster-aciklama', label: 'Hizmetlerimiz — Poster & Kartpostal Baskı Kart Açıklaması', placeholder: 'Poster, kartpostal ve küçük format baskılarınız için yüksek kaliteli çözümler.', tall: true },
    { section: 'hizmet-sergi-baslik', label: 'Hizmetlerimiz — Sergi & Portfolyo Baskıları Kart Başlığı', placeholder: 'Sergi & Portfolyo Baskıları' },
    { section: 'hizmet-sergi-aciklama', label: 'Hizmetlerimiz — Sergi & Portfolyo Baskıları Kart Açıklaması', placeholder: 'Sergiler, portfolyolar ve projeleriniz için büyük format baskı ve sunum çözümleri.', tall: true },
    { section: 'hizmet-cerceve-baslik', label: 'Hizmetlerimiz — Çerçeveleme Kart Başlığı', placeholder: 'Çerçeveleme' },
    { section: 'hizmet-cerceve-aciklama', label: 'Hizmetlerimiz — Çerçeveleme Kart Açıklaması', placeholder: 'Eserlerinizi estetik ve koruyucu çerçeve çözümleriyle tamamlıyoruz. Özel ölçü seçenekleriyle.', tall: true },
    { section: 'baski-hazirlik-aciklama', label: 'Baskı İçin Dosya Hazırlığı — Bölüm Açıklaması', placeholder: 'En iyi baskı sonucunu alabilmek için dosyalarınızı aşağıdaki teknik kriterlere göre hazırlayabilirsiniz.', tall: true },
    { section: 'sertifikali-kagit-aciklama', label: 'Sertifikalı Fine Art Kağıtları — Açıklama', placeholder: "Hahnemühle'nin arşivsel kalitedeki fine art kağıtlarıyla, eserlerinizde üstün renk doğruluğu, derin tonlar ve yüksek detay elde edilir. Her baskı, uzun yıllar boyunca ilk günkü etkisini koruyacak kalıcılık ve premium sunum anlayışıyla üretilir.", tall: true },
  ],
  'fotograf-baski': [
    { section: 'hero-aciklama', label: 'Hero — Alt Açıklama', placeholder: 'Yüksek çözünürlükte, profesyonel fotoğraf kağıtlarına baskı.' },
  ],
  'fine-art-baski': [
    { section: 'hero-aciklama', label: 'Hero — Alt Açıklama', placeholder: 'Müze ve galeri standartlarında, arşiv kalitesinde baskı. Sanatınızı nesiller boyu yaşatın.', tall: true },
  ],
  cerceve: [
    { section: 'hero-aciklama', label: 'Hero — Alt Açıklama', placeholder: 'Fotoğraflarınızı kalıcı kılın. Siyah, beyaz ve doğal ahşap çerçeve seçenekleriyle anılarınızı sanat eserine dönüştürün.', tall: true },
  ],
}

// supabase.js'teki 15sn'lik fetch timeout'u bir çağrının network seviyesinde
// asılı kalmasını önlüyor, ama "Kaydediliyor…" butonlarının kod içi bir
// sebepten (ör. beklenmeyen bir promise zinciri) hiç dönmemesine karşı ekstra
// bir güvenlik ağı: bu süre dolunca reddedip butonun sonsuza kadar kilitli
// kalmasını engelliyor.
function withTimeout(promise, ms = 20000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('İşlem zaman aşımına uğradı')), ms)),
  ])
}

function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('gorseller')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [artworks, setArtworks] = useState([])
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [artworkImages, setArtworkImages] = useState([])
  const [artworkMockups, setArtworkMockups] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()
  const galleryFileRef = useRef()
  const mockupFileRef = useRef()

  // --- Çerçeve ---
  const [frames, setFrames] = useState([])
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [frameForm, setFrameForm] = useState(EMPTY_FRAME)
  const [frameSaving, setFrameSaving] = useState(false)

  // --- Çerçeve Siparişleri ---
  const [frameOrders, setFrameOrders] = useState([])

  // --- Kağıtlar ---
  const [papers, setPapers] = useState([])
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [paperForm, setPaperForm] = useState(EMPTY_PAPER)
  const [paperSaving, setPaperSaving] = useState(false)

  // --- Görseller (genel dosya yükleme) ---
  const [pageImages, setPageImages] = useState({}) // "page:section" -> [rows]
  const [pageContent, setPageContent] = useState({}) // "page:section" -> content metni
  const [contentSaving, setContentSaving] = useState({}) // "page:section" -> bool
  const [uploadTarget, setUploadTarget] = useState(null)
  const genericFileRef = useRef()
  const hoveredSlotRef = useRef(null)
  const [compressing, setCompressing] = useState(false)
  const [compressLog, setCompressLog] = useState([])

  // --- Site Ayarları ---
  const [fontPair, setFontPairState] = useState('archivo')
  const [fontSaving, setFontSaving] = useState(false)
  const [fontMsg, setFontMsg] = useState('')
  const [artistBio, setArtistBio] = useState('')
  const [artistPhotoUrl, setArtistPhotoUrl] = useState('')

  // --- Kullanıcılar ---
  const [profiles, setProfiles] = useState([])

  // --- Sepet Etkinliği ---
  const [cartEvents, setCartEvents] = useState([])
  const [orderSessionIds, setOrderSessionIds] = useState(new Set())

  // --- İstatistikler ---
  const [pageViews, setPageViews] = useState([])

  // --- Fotoğraf Baskı Fiyatları ---
  const [photoPrices, setPhotoPrices] = useState({}) // "size:finish" -> price
  const [photoPriceSaving, setPhotoPriceSaving] = useState(false)
  const [photoPriceMsg, setPhotoPriceMsg] = useState('')

  // --- Fotoğraf Siparişleri ---
  const [photoOrders, setPhotoOrders] = useState([])
  const [photoOrderItems, setPhotoOrderItems] = useState({}) // order_id -> [items]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login')
    })
  }, [])

  useEffect(() => { loadArtworks() }, [])
  // Sanatçı Hakkında editörü İşler sekmesine taşındı ama font ayarları hâlâ
  // Site Ayarları'nda — ikisi de aynı site_settings satırını paylaştığı için
  // hangi sekme önce açılırsa açılsın veriler hazır olsun diye koşulsuz yükleniyor.
  useEffect(() => { loadSiteSettings() }, [])
  useEffect(() => { if (tab === 'siparisler') loadOrders() }, [tab])
  useEffect(() => { if (tab === 'cerceve') { loadFrames(); loadFrameOrders() } }, [tab])
  useEffect(() => { if (tab === 'kagitlar') loadPapers() }, [tab])
  useEffect(() => { if (['gorseller', 'cerceve', 'kagitlar', 'fotofiyat'].includes(tab)) { loadPageImages(); loadPageContent() } }, [tab])
  useEffect(() => { if (tab === 'kullanicilar') loadProfiles() }, [tab])
  useEffect(() => { if (tab === 'sepetler') loadCartEvents() }, [tab])
  useEffect(() => { if (tab === 'istatistikler') loadPageViews() }, [tab])
  useEffect(() => { if (tab === 'fotofiyat') loadPhotoPrices() }, [tab])
  useEffect(() => { if (tab === 'fotosiparis') loadPhotoOrders() }, [tab])

  async function loadArtworks() {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false })
    setArtworks(data || [])
  }

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function updateOrderStatus(id, status) {
    const payload = { status }

    if (status === 'kargoda') {
      const mevcut = orders.find(o => o.id === id)?.tracking_number || ''
      const tracking = window.prompt('Kargo takip numarası (boş bırakabilirsin):', mevcut)
      if (tracking !== null && tracking.trim()) payload.tracking_number = tracking.trim()
    }

    const { error } = await supabase.from('orders').update(payload).eq('id', id)
    if (error) { alert('Durum güncellenemedi: ' + error.message); return }
    await loadOrders()

    if (status === 'kargoda') {
      supabase.functions.invoke('notify-shipped', {
        body: { orderId: id, trackingNumber: payload.tracking_number || null },
      }).catch(() => {}) // müşteriye mail gönderimi arka planda, sessizce dener
    }
  }

  async function deleteOrder(id) {
    if (!window.confirm('Bu siparişi kalıcı olarak silmek istediğinden emin misin?')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) { alert('Silinemedi: ' + error.message); return }
    setSelected(null)
    loadOrders()
  }

  function selectArtwork(aw) {
    setSelected(aw.id)
    setForm({ ...aw, tags: (aw.tags || []).join(', '), sizes: aw.sizes?.length ? aw.sizes : DEFAULT_SIZES.map(s => ({ ...s })) })
    setMsg('')
    loadArtworkImages(aw.id)
    loadArtworkMockups(aw.id)
  }

  function newArtwork() { setSelected(null); setForm(EMPTY_FORM); setMsg(''); setArtworkImages([]); setArtworkMockups([]) }

  async function loadArtworkImages(artworkId) {
    const { data } = await supabase.from('artwork_images').select('*').eq('artwork_id', artworkId).order('sort_order')
    setArtworkImages(data || [])
  }

  async function uploadArtworkImage(file) {
    if (!selected) return
    const resized = await resizeImageFile(file, 1800)
    const ext = resized.name.split('.').pop()
    const path = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    const { error } = await supabase.storage.from('artwork-images').upload(path, resized)
    if (error) { alert('Görsel yüklenemedi: ' + error.message); return }
    const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
    const nextOrder = artworkImages.length ? Math.max(...artworkImages.map(i => i.sort_order)) + 1 : 0
    const { error: insertError } = await supabase.from('artwork_images').insert({ artwork_id: selected, image_url: data.publicUrl, sort_order: nextOrder })
    if (insertError) { alert('Görsel kaydedilemedi: ' + insertError.message); return }
    loadArtworkImages(selected)
  }

  async function deleteArtworkImage(id) {
    const { error } = await supabase.from('artwork_images').delete().eq('id', id)
    if (error) { alert('Görsel silinemedi: ' + error.message); return }
    loadArtworkImages(selected)
  }

  // Mockup görselleri — ürünün duvarda/mekanda gösterildiği ayrı görsel seti,
  // artwork_images'tan bağımsız. En fazla 4 adet, aşamalı yükleniyor: bir
  // öncekine görsel eklenene kadar bir sonraki slot gösterilmiyor.
  const MAX_MOCKUPS = 4

  async function loadArtworkMockups(artworkId) {
    const { data } = await supabase.from('artwork_mockups').select('*').eq('artwork_id', artworkId).order('sort_order')
    setArtworkMockups(data || [])
  }

  async function uploadArtworkMockup(file) {
    if (!selected || artworkMockups.length >= MAX_MOCKUPS) return
    const resized = await resizeImageFile(file, 1800)
    const ext = resized.name.split('.').pop()
    const path = `mockup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    const { error } = await supabase.storage.from('artwork-images').upload(path, resized)
    if (error) { alert('Mockup görseli yüklenemedi: ' + error.message); return }
    const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
    const nextOrder = artworkMockups.length ? Math.max(...artworkMockups.map(i => i.sort_order)) + 1 : 0
    const { error: insertError } = await supabase.from('artwork_mockups').insert({ artwork_id: selected, image_url: data.publicUrl, sort_order: nextOrder })
    if (insertError) { alert('Mockup görseli kaydedilemedi: ' + insertError.message); return }
    loadArtworkMockups(selected)
  }

  async function deleteArtworkMockup(id) {
    const { error } = await supabase.from('artwork_mockups').delete().eq('id', id)
    if (error) { alert('Mockup görseli silinemedi: ' + error.message); return }
    loadArtworkMockups(selected)
  }

  function autoSlug(title) {
    return title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleTitle(val) { setForm(f => ({ ...f, title: val, slug: autoSlug(val) })) }
  function addSize() { setForm(f => ({ ...f, sizes: [...f.sizes, { label: '', price: '' }] })) }
  function removeSize(i) { setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) })) }
  function updateSize(i, key, val) {
    setForm(f => {
      const sizes = [...f.sizes]
      sizes[i] = { ...sizes[i], [key]: key === 'price' ? Number(val) : val }
      return { ...f, sizes }
    })
  }

  async function uploadImage(file) {
    setUploading(true)
    const resized = await resizeImageFile(file, 1800)
    const ext = resized.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('artwork-images').upload(path, resized)
    if (error) { setMsg('Görsel yüklenemedi: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: data.publicUrl }))
    setUploading(false)
  }

  async function save() {
    // Başlıksız kayda izin verirsek slug boş kalır — "/product/" hiçbir rotaya
    // uymadığı için canlıda 404'e düşen, İşler listesinde görselsiz/boş bir
    // kart olarak takılı kalan "hayalet" eserler oluşuyordu.
    if (!form.title.trim()) { setMsg('Hata: Başlık boş olamaz.'); return }
    setSaving(true)
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    delete payload.id; delete payload.created_at
    try {
      let error
      if (selected) {
        ;({ error } = await withTimeout(supabase.from('artworks').update(payload).eq('id', selected)))
      } else {
        // Eklenen satırın id'sini geri alıyoruz — yoksa "selected" hep null kalır,
        // ek galeri görseli bölümü kaydedildikten sonra da hep kilitli görünür ve
        // "Kaydet"e ikinci kez basılırsa yeni bir kopya daha eklenir.
        let data
        ;({ data, error } = await withTimeout(supabase.from('artworks').insert(payload).select().single()))
        if (!error && data) setSelected(data.id)
      }
      setSaving(false)
      if (error) { setMsg('Hata: ' + error.message); return }
      setMsg(selected ? 'Güncellendi ✓' : 'Eklendi ✓')
      loadArtworks()
    } catch (err) {
      setSaving(false)
      setMsg('Hata: ' + err.message)
    }
  }

  async function deleteArtwork() {
    if (!selected) return
    if (!window.confirm('Bu eseri silmek istediğinden emin misin?')) return
    const { error } = await supabase.from('artworks').delete().eq('id', selected)
    if (error) { alert('Silinemedi: ' + error.message); return }
    newArtwork(); loadArtworks()
  }

  // ============================================================
  // ÇERÇEVE — boy / renk / fiyat yönetimi
  // ============================================================
  async function loadFrames() {
    const { data } = await supabase
      .from('frame_options')
      .select('id, size, note, sort_order, frame_option_prices(id, color, price, swatch_hex, sort_order)')
      .order('sort_order')
    setFrames((data || []).map(f => ({
      ...f,
      frame_option_prices: [...(f.frame_option_prices || [])].sort((a, b) => a.sort_order - b.sort_order),
    })))
  }

  function selectFrame(f) {
    setSelectedFrame(f.id)
    setFrameForm({
      size: f.size, note: f.note || '',
      prices: f.frame_option_prices.length
        ? f.frame_option_prices.map(p => ({ color: p.color, price: p.price, swatch_hex: p.swatch_hex }))
        : [{ color: '', price: '', swatch_hex: '#111111' }],
    })
  }
  function newFrame() { setSelectedFrame(null); setFrameForm(EMPTY_FRAME) }
  function addFramePrice() { setFrameForm(f => ({ ...f, prices: [...f.prices, { color: '', price: '', swatch_hex: '#111111' }] })) }
  function removeFramePrice(i) { setFrameForm(f => ({ ...f, prices: f.prices.filter((_, idx) => idx !== i) })) }
  function updateFramePrice(i, key, val) {
    setFrameForm(f => {
      const prices = [...f.prices]
      prices[i] = { ...prices[i], [key]: key === 'price' ? Number(val) : val }
      return { ...f, prices }
    })
  }

  async function saveFrame() {
    setFrameSaving(true)
    try {
      let frameId = selectedFrame
      if (frameId) {
        const { error: updateError } = await withTimeout(supabase.from('frame_options').update({ size: frameForm.size, note: frameForm.note }).eq('id', frameId))
        if (updateError) { setFrameSaving(false); alert('Hata: ' + updateError.message); return }
        const { error: deleteError } = await withTimeout(supabase.from('frame_option_prices').delete().eq('frame_option_id', frameId))
        if (deleteError) { setFrameSaving(false); alert('Hata: ' + deleteError.message); return }
      } else {
        const nextOrder = frames.length ? Math.max(...frames.map(f => f.sort_order)) + 1 : 1
        const { data, error } = await withTimeout(supabase.from('frame_options').insert({ size: frameForm.size, note: frameForm.note, sort_order: nextOrder }).select().single())
        if (error) { setFrameSaving(false); alert('Hata: ' + error.message); return }
        frameId = data.id
      }
      const rows = frameForm.prices.filter(p => p.color).map((p, i) => ({
        frame_option_id: frameId, color: p.color, price: p.price || 0, swatch_hex: p.swatch_hex || '#111111', sort_order: i,
      }))
      if (rows.length) {
        const { error: pricesError } = await withTimeout(supabase.from('frame_option_prices').insert(rows))
        if (pricesError) { setFrameSaving(false); alert('Hata: ' + pricesError.message); return }
      }
      setFrameSaving(false)
      setSelectedFrame(frameId)
      loadFrames()
    } catch (err) {
      setFrameSaving(false)
      alert('Hata: ' + err.message)
    }
  }

  async function deleteFrame() {
    if (!selectedFrame) return
    if (!window.confirm('Bu boyu silmek istediğinden emin misin? Fiyatları da silinecek.')) return
    const { error } = await supabase.from('frame_options').delete().eq('id', selectedFrame)
    if (error) { alert('Silinemedi: ' + error.message); return }
    newFrame(); loadFrames()
  }

  async function loadFrameOrders() {
    const { data } = await supabase.from('frame_orders').select('*').order('created_at', { ascending: false })
    setFrameOrders(data || [])
  }

  async function updateFrameOrderStatus(id, status) {
    const { error } = await supabase.from('frame_orders').update({ status }).eq('id', id)
    if (error) { alert('Durum güncellenemedi: ' + error.message); return }
    setFrameOrders(rows => rows.map(o => o.id === id ? { ...o, status } : o))
  }

  // ============================================================
  // KAĞITLAR
  // ============================================================
  async function loadPapers() {
    const { data } = await supabase.from('papers').select('*').order('sort_order')
    setPapers(data || [])
  }

  function selectPaper(p) { setSelectedPaper(p.id); setPaperForm({ ...p }) }
  function newPaper() { setSelectedPaper(null); setPaperForm(EMPTY_PAPER) }

  async function savePaper() {
    setPaperSaving(true)
    const payload = { ...paperForm }
    delete payload.id; delete payload.created_at
    try {
      let error
      if (selectedPaper) {
        ;({ error } = await withTimeout(supabase.from('papers').update(payload).eq('id', selectedPaper)))
      } else {
        const nextOrder = papers.length ? Math.max(...papers.map(p => p.sort_order)) + 1 : 1
        ;({ error } = await withTimeout(supabase.from('papers').insert({ ...payload, sort_order: nextOrder })))
      }
      setPaperSaving(false)
      if (error) { alert('Hata: ' + error.message); return }
      loadPapers()
    } catch (err) {
      setPaperSaving(false)
      alert('Hata: ' + err.message)
    }
  }

  async function deletePaper() {
    if (!selectedPaper) return
    if (!window.confirm('Bu kağıdı silmek istediğinden emin misin?')) return
    const { error } = await supabase.from('papers').delete().eq('id', selectedPaper)
    if (error) { alert('Silinemedi: ' + error.message); return }
    newPaper(); loadPapers()
  }

  async function uploadPaperPhoto(file, field) {
    const url = await uploadToStorage(file)
    if (url) setPaperForm(f => ({ ...f, [field]: url }))
  }

  // ============================================================
  // GÖRSELLER — sayfa görselleri (hero, örnek galeriler)
  // ============================================================
  // Telefon kameralarından gelen ham fotoğraflar (çoğunlukla birkaç MB)
  // olduğu gibi yükleniyordu, bu da siteyi yavaş açıyordu. Yüklemeden önce
  // tarayıcıda en uzun kenarı sınırlayıp WebP'ye çevirip sıkıştırıyoruz —
  // gözle fark edilmeyecek kadar küçük bir kalite kaybıyla dosya boyutu
  // genelde 5-10 kat küçülüyor. Zaten küçük bir görsel yüklenirse
  // dokunmadan olduğu gibi bırakılıyor. Hero gibi tam ekran görseller daha
  // büyük kalabilsin diye maxDim çağıran yere göre ayarlanabilir.
  function resizeImageFile(file, maxDim = 2200, quality = 0.8) {
    return new Promise(resolve => {
      if (!file.type.startsWith('image/')) { resolve(file); return }
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          let { width, height } = img
          if (width <= maxDim && height <= maxDim) { resolve(file); return }
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)
          canvas.toBlob(blob => {
            if (!blob) { resolve(file); return }
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' }))
          }, 'image/webp', quality)
        }
        img.onerror = () => resolve(file)
        img.src = reader.result
      }
      reader.onerror = () => resolve(file)
      reader.readAsDataURL(file)
    })
  }

  async function uploadToStorage(file) {
    const resized = await resizeImageFile(file)
    const ext = resized.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    const { error } = await supabase.storage.from('site-images').upload(path, resized)
    if (error) { alert('Görsel yüklenemedi: ' + error.message); return null }
    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    return data.publicUrl
  }

  // Bakım aracı: sıkıştırma sadece bundan sonra yüklenecek görseller için
  // geçerli — sistemde daha önce yüklenmiş, hâlâ büyük boyutlu görseller
  // için bir seferlik geçiş. Her görseli indirip aynı resizeImageFile
  // fonksiyonuyla sıkıştırıp yeni bir dosya olarak tekrar yüklüyor, ilgili
  // tablodaki image_url'i güncelliyor, sonra eski (büyük) dosyayı Storage'dan
  // siliyor. Zaten küçük olan görseller dokunulmadan atlanıyor.
  async function compressExisting(bucket, table, id, imageUrl, maxDim, column = 'image_url') {
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    if (blob.size < 300 * 1024) return 'skip' // zaten küçük, atla
    const original = new File([blob], 'x', { type: blob.type || 'image/jpeg' })
    const resized = await resizeImageFile(original, maxDim)
    if (resized === original) return 'skip' // resize yapılmadı (maxDim altında)
    const path = `compressed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, resized)
    if (upErr) throw new Error(`${table} #${id}: ${upErr.message}`)
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    const { error: dbErr } = await supabase.from(table).update({ [column]: data.publicUrl }).eq('id', id)
    if (dbErr) throw new Error(`${table} #${id} (db): ${dbErr.message}`)
    // Eski dosyayı sil — public URL'den bucket sonrası yolu ayıklıyoruz.
    const marker = `/public/${bucket}/`
    const idx = imageUrl.indexOf(marker)
    if (idx !== -1) {
      const oldPath = imageUrl.slice(idx + marker.length)
      supabase.storage.from(bucket).remove([oldPath]).catch(() => {})
    }
    return 'done'
  }

  async function compressAllExistingImages() {
    if (compressing) return
    if (!confirm('Sistemde şu anda kayıtlı tüm görseller (hero, eser, kağıt vb.) indirilip sıkıştırılıp yeniden yüklenecek. Görsel sayısına göre birkaç dakika sürebilir, sayfadan ayrılma. Devam edilsin mi?')) return
    setCompressing(true)
    setCompressLog(['Başlıyor…'])
    const log = msg => setCompressLog(l => [...l, msg])
    let done = 0, skipped = 0, failed = 0

    const jobs = []
    const { data: pImgs } = await supabase.from('page_images').select('id, image_url')
    ;(pImgs || []).forEach(r => jobs.push(['site-images', 'page_images', r.id, r.image_url, 2200, 'image_url']))
    const { data: arts } = await supabase.from('artworks').select('id, image_url').not('image_url', 'is', null)
    ;(arts || []).forEach(r => jobs.push(['artwork-images', 'artworks', r.id, r.image_url, 1800, 'image_url']))
    const { data: aImgs } = await supabase.from('artwork_images').select('id, image_url')
    ;(aImgs || []).forEach(r => jobs.push(['artwork-images', 'artwork_images', r.id, r.image_url, 1800, 'image_url']))
    const { data: aMockups } = await supabase.from('artwork_mockups').select('id, image_url')
    ;(aMockups || []).forEach(r => jobs.push(['artwork-images', 'artwork_mockups', r.id, r.image_url, 1800, 'image_url']))
    const { data: papers } = await supabase.from('papers').select('id, texture_photo_url, preview_photo_url')
    ;(papers || []).forEach(r => {
      if (r.texture_photo_url) jobs.push(['site-images', 'papers', r.id, r.texture_photo_url, 2000, 'texture_photo_url'])
      if (r.preview_photo_url) jobs.push(['site-images', 'papers', r.id, r.preview_photo_url, 2000, 'preview_photo_url'])
    })

    log(`${jobs.length} görsel bulundu, işleniyor…`)
    for (const [bucket, table, id, url, maxDim, column] of jobs) {
      try {
        const result = await compressExisting(bucket, table, id, url, maxDim, column)
        if (result === 'done') { done++; log(`✓ ${table} #${id} (${column}) sıkıştırıldı`) }
        else skipped++
      } catch (err) {
        failed++
        log(`✗ ${err.message}`)
      }
    }
    log(`Tamamlandı — ${done} sıkıştırıldı, ${skipped} zaten küçüktü, ${failed} hata.`)
    setCompressing(false)
    loadPageImages()
  }

  async function loadPageImages() {
    const { data } = await supabase.from('page_images').select('*').order('sort_order').order('id')
    const grouped = {}
    ;(data || []).forEach(row => { (grouped[`${row.page}:${row.section}`] ||= []).push(row) })
    setPageImages(grouped)
  }

  async function uploadForSlot(file, slot) {
    if (!file) return
    const url = await uploadToStorage(file)
    if (!url) return
    const { page, section, multiple } = slot
    if (!multiple) {
      // Önceden delete + insert (iki ayrı istek) yapılıyordu — delete başarılı
      // olup insert arada bir sebepten (ağ, RLS) başarısız olursa ya da tam
      // tersi, aynı page+section için 2 satır kalabiliyordu. Site tarafındaki
      // sorgular tek satır bekliyor (limit(1) veya rows[0]) ve ikisi arasında
      // hangisinin döneceği garanti değil — bu da "bir girişte bir görsel,
      // başka girişte başka görsel" görünmesine yol açıyordu (Hero görseli
      // dahil). Var olan satırı UPDATE ederek tekilliği garantiliyoruz.
      const existing = pageImages[`${page}:${section}`]?.[0]
      if (existing) {
        const { error } = await withTimeout(supabase.from('page_images').update({ image_url: url }).eq('id', existing.id))
        if (error) { alert('Görsel kaydedilemedi: ' + error.message); return }
      } else {
        const { error } = await withTimeout(supabase.from('page_images').insert({ page, section, image_url: url, sort_order: 0 }))
        if (error) { alert('Görsel kaydedilemedi: ' + error.message); return }
      }
    } else {
      const existing = pageImages[`${page}:${section}`] || []
      const nextOrder = existing.length ? Math.max(...existing.map(r => r.sort_order)) + 1 : 0
      const { error: insertError } = await supabase.from('page_images').insert({ page, section, image_url: url, sort_order: nextOrder })
      if (insertError) { alert('Görsel kaydedilemedi: ' + insertError.message); return }
    }
    loadPageImages()
  }

  function triggerSlotUpload(slot) { setUploadTarget(slot); genericFileRef.current?.click() }

  async function handleGenericFileChange(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file || !uploadTarget) return
    await uploadForSlot(file, uploadTarget)
  }

  // Görsel yükleme kutusunun üzerine gelip Ctrl+V ile panodan görsel
  // yapıştırma desteği — dosya seçme diyaloğu açmadan, ekran görüntüsünü
  // doğrudan yapıştırarak yükleyebilmek için.
  useEffect(() => {
    function onPaste(e) {
      const slot = hoveredSlotRef.current
      if (!slot) return
      const item = Array.from(e.clipboardData?.items || []).find(it => it.type.startsWith('image/'))
      if (!item) return
      e.preventDefault()
      const file = item.getAsFile()
      if (file) uploadForSlot(file, slot)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [pageImages])

  async function deletePageImage(id) {
    const { error } = await supabase.from('page_images').delete().eq('id', id)
    if (error) { alert('Silinemedi: ' + error.message); return }
    loadPageImages()
  }

  // Bir sayfaya ait tüm görsel slotlarını render eder — Ana Sayfa, Çerçeve,
  // Fine Art Baskı ve Fotoğraf Baskı sekmelerinde, o sayfanın kendi
  // içerik/fiyat düzenleyicisinin altında tek bir yerde gösterilsin diye
  // ortak fonksiyon olarak çıkarıldı. Kompakt grid: slot sayısı arttıkça
  // (10 kağıt + hizmetler + ... gibi) tek sütunda alt alta uzayıp
  // gitmesin diye her slot küçük bir kart olarak yan yana diziliyor.
  function renderPageImageSlots(pageKey) {
    const slots = IMAGE_SLOTS.filter(slot => slot.page === pageKey)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.2rem' }}>
        {slots.map(slot => {
          const key = `${slot.page}:${slot.section}`
          const rows = pageImages[key] || []
          const singleImage = !slot.multiple && rows[0]
          // Admin hiç görsel yüklemediyse (satır yok) sitede hâlâ sayfanın
          // kendi hardcoded fallback görseli gösteriliyor.
          const showingDefault = !slot.multiple && !rows[0] && slot.defaultImg
          return (
            <div key={key}>
              <div
                className="admin-slot-box"
                onClick={() => triggerSlotUpload(slot)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); uploadForSlot(e.dataTransfer.files[0], slot) }}
                onMouseEnter={() => { hoveredSlotRef.current = slot }}
                onMouseLeave={() => { if (hoveredSlotRef.current === slot) hoveredSlotRef.current = null }}
                style={{
                  border: '2px dashed #ddd', textAlign: 'center', cursor: 'pointer', background: '#fafafa',
                  aspectRatio: slot.aspect, position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {singleImage ? (
                  <>
                    <img src={rows[0].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button
                      onClick={e => { e.stopPropagation(); deletePageImage(rows[0].id) }}
                      style={{ position: 'absolute', top: 4, right: 4, background: '#cc4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.72rem', lineHeight: 1 }}
                    >×</button>
                  </>
                ) : showingDefault ? (
                  <>
                    <img src={slot.defaultImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: .85 }} />
                    <span style={{
                      position: 'absolute', bottom: 4, left: 4, right: 4, background: 'rgba(0,0,0,.65)', color: '#fff',
                      fontSize: '.56rem', padding: '.2rem .35rem', letterSpacing: '.02em',
                    }}>
                      Şu an bu — değiştir
                    </span>
                  </>
                ) : slot.multiple && rows.length > 0 ? (
                  <>
                    <img src={rows[0].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <span style={{
                      position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,.65)', color: '#fff',
                      fontSize: '.6rem', padding: '.15rem .4rem',
                    }}>
                      {rows.length}
                    </span>
                  </>
                ) : slot.multiple && rows.length === 0 && slot.defaultImgs?.length > 0 ? (
                  <>
                    <img src={slot.defaultImgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: .85 }} />
                    <span style={{
                      position: 'absolute', bottom: 4, left: 4, right: 4, background: 'rgba(0,0,0,.65)', color: '#fff',
                      fontSize: '.56rem', padding: '.2rem .35rem', letterSpacing: '.02em',
                    }}>
                      Şu an bunlar ({slot.defaultImgs.length}) — değiştir
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#bbb', fontSize: '.68rem', padding: '.6rem' }}>
                    {slot.multiple ? '+ Görsel Ekle' : 'Boş — Yükle'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '.66rem', color: '#888', marginTop: '.4rem', lineHeight: 1.35 }}>
                {slot.label}
              </p>
              {slot.multiple && rows.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.4rem' }}>
                  {rows.map(row => (
                    <div key={row.id} style={{ position: 'relative', width: 44, aspectRatio: slot.aspect, overflow: 'hidden' }}>
                      <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', border: '1px solid #eee' }} />
                      <button
                        onClick={() => deletePageImage(row.id)}
                        style={{ position: 'absolute', top: 1, right: 1, background: '#cc4444', color: '#fff', border: 'none', borderRadius: '50%', width: 14, height: 14, cursor: 'pointer', fontSize: '.58rem', lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  async function loadPageContent() {
    const { data } = await supabase.from('page_content').select('*')
    const map = {}
    ;(data || []).forEach(row => { map[`${row.page}:${row.section}`] = row.content })
    setPageContent(map)
  }

  function updatePageContentDraft(page, section, value) {
    setPageContent(prev => ({ ...prev, [`${page}:${section}`]: value }))
  }

  async function savePageContentField(page, section) {
    const key = `${page}:${section}`
    setContentSaving(s => ({ ...s, [key]: true }))
    const { error } = await supabase.from('page_content').upsert(
      { page, section, content: pageContent[key] || '', updated_at: new Date().toISOString() },
      { onConflict: 'page,section' }
    )
    setContentSaving(s => ({ ...s, [key]: false }))
    if (error) alert('Kaydedilemedi: ' + error.message)
  }

  // Bir sayfaya ait tüm düzenlenebilir metin alanlarını render eder — page_content
  // satırı yoksa textarea boş görünür ama placeholder'da sitedeki mevcut (hardcoded)
  // metin gösterilir, admin neyi değiştirdiğini/değiştirmediğini görebilsin diye.
  function renderPageTextFields(pageKey, fields) {
    return fields.map(f => {
      const key = `${pageKey}:${f.section}`
      const value = pageContent[key] ?? ''
      return (
        <div key={key} style={{ marginBottom: '1.5rem' }}>
          <span style={{ ...label, display: 'block', marginBottom: '.4rem' }}>{f.label}</span>
          <textarea
            value={value}
            onChange={e => updatePageContentDraft(pageKey, f.section, e.target.value)}
            placeholder={f.placeholder}
            style={{ ...inp, minHeight: f.tall ? 90 : 46, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.4rem' }}>
            <button onClick={() => savePageContentField(pageKey, f.section)} disabled={contentSaving[key]} style={btnGhost}>
              {contentSaving[key] ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
            {!value && <span style={{ fontSize: '.62rem', color: '#bbb' }}>Boş bırakılırsa sitede yukarıdaki varsayılan metin gösterilir.</span>}
          </div>
        </div>
      )
    })
  }

  // ============================================================
  // SİTE AYARLARI — font seçimi
  // ============================================================
  async function loadSiteSettings() {
    const { data } = await supabase.from('site_settings').select('font_pair, artist_bio, artist_photo_url').eq('id', 'default').single()
    if (data?.font_pair) setFontPairState(data.font_pair)
    setArtistBio(data?.artist_bio || '')
    setArtistPhotoUrl(data?.artist_photo_url || '')
  }

  function previewFontPair(key) { setFontPairState(key); setFont(key) }

  async function saveSiteSettings() {
    setFontSaving(true)
    try {
      const { error } = await withTimeout(supabase.from('site_settings').upsert({
        id: 'default', font_pair: fontPair,
        artist_bio: artistBio, artist_photo_url: artistPhotoUrl,
        updated_at: new Date().toISOString(),
      }))
      setFontSaving(false)
      if (error) { setFontMsg('Hata: ' + error.message); return }
      setFont(fontPair)
      setFontMsg('Kaydedildi ✓')
      setTimeout(() => setFontMsg(''), 2000)
    } catch (err) {
      setFontSaving(false)
      setFontMsg('Hata: ' + err.message)
    }
  }

  async function uploadArtistPhoto(file) {
    const url = await uploadToStorage(file)
    if (url) setArtistPhotoUrl(url)
  }

  // ============================================================
  // KULLANICILAR
  // ============================================================
  async function loadProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setProfiles(data || [])
  }

  // ============================================================
  // SEPET ETKİNLİĞİ
  // ============================================================
  async function loadCartEvents() {
    const [{ data: events }, { data: orderRows }] = await Promise.all([
      supabase.from('cart_events').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('orders').select('session_id').not('session_id', 'is', null),
    ])
    setCartEvents(events || [])
    setOrderSessionIds(new Set((orderRows || []).map(o => o.session_id)))
  }

  // ============================================================
  // İSTATİSTİKLER
  // ============================================================
  async function loadPageViews() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('page_views').select('*').gte('created_at', since).order('created_at', { ascending: false })
    setPageViews(data || [])
  }

  // ============================================================
  // FOTOĞRAF BASKI FİYATLARI
  // ============================================================
  async function loadPhotoPrices() {
    const { data } = await supabase.from('photo_print_prices').select('*')
    const map = {}
    ;(data || []).forEach(row => { map[`${row.size}:${row.finish}`] = row.price })
    setPhotoPrices(map)
  }

  function updatePhotoPrice(size, finish, value) {
    setPhotoPrices(p => ({ ...p, [`${size}:${finish}`]: value }))
  }

  async function savePhotoPrices() {
    setPhotoPriceSaving(true)
    const rows = []
    PHOTO_SIZES.forEach(size => PHOTO_FINISHES.forEach(finish => {
      rows.push({ size, finish, price: Number(photoPrices[`${size}:${finish}`]) || 0 })
    }))
    try {
      const { error } = await withTimeout(supabase.from('photo_print_prices').upsert(rows, { onConflict: 'size,finish' }))
      setPhotoPriceSaving(false)
      setPhotoPriceMsg(error ? 'Hata: ' + error.message : 'Kaydedildi ✓')
    } catch (err) {
      setPhotoPriceSaving(false)
      setPhotoPriceMsg('Hata: ' + err.message)
    }
    setTimeout(() => setPhotoPriceMsg(''), 2000)
  }

  // ============================================================
  // FOTOĞRAF SİPARİŞLERİ
  // ============================================================
  async function loadPhotoOrders() {
    const [{ data: orders }, { data: items }] = await Promise.all([
      supabase.from('photo_print_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('photo_print_order_items').select('*'),
    ])
    const byOrder = {}
    ;(items || []).forEach(row => { (byOrder[row.order_id] ||= []).push(row) })
    setPhotoOrders(orders || [])
    setPhotoOrderItems(byOrder)
  }

  async function updatePhotoOrderStatus(id, status) {
    const { error } = await supabase.from('photo_print_orders').update({ status }).eq('id', id)
    if (error) { alert('Durum güncellenemedi: ' + error.message); return }
    setPhotoOrders(rows => rows.map(o => o.id === id ? { ...o, status } : o))
  }

  const inp ={ width: '100%', padding: '.6rem .8rem', border: '1px solid #ddd', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const label = { fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: '.3rem', display: 'block' }
  // Archivo Black Google Font'ta tek ağırlık (400) olarak yükleniyor — 300 istemek
  // font takas anında (FOUT) yedek fontla eşleşmediği için başlıkların kesik/yarım
  // görünmesine sebep oluyordu.
  const sectionHeading = { fontFamily: "'Archivo Black', sans-serif", fontSize: '1.8rem', fontWeight: 400, margin: 0 }
  const listItem = (active) => ({
    padding: '.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
    background: active ? '#f9f6f1' : 'white',
    borderLeft: active ? '3px solid #9a7a4a' : '3px solid transparent',
  })
  const btnPrimary = { background: '#111', color: '#fff', border: 'none', padding: '.75rem 2rem', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer' }
  const btnGhost = { background: 'none', border: '1px solid #ddd', padding: '.25rem .7rem', fontSize: '.7rem', cursor: 'pointer' }
  const btnDanger = { background: 'none', border: '1px solid #ffcccc', color: '#cc4444', padding: '.4rem .9rem', fontSize: '.7rem', cursor: 'pointer' }
  const STATUS_COLORS = { yeni: '#f59e0b', hazirlaniyor: '#3b82f6', kargoda: '#8b5cf6', teslim: '#10b981', iptal: '#ef4444' }
  const STATUS_LABELS = { yeni: 'Yeni', hazirlaniyor: 'Hazırlanıyor', kargoda: 'Kargoda', teslim: 'Teslim Edildi', iptal: 'İptal' }

  const TAB_LABELS = {
    eserler: 'İşler',
    siparisler: `Siparişler ${orders.length > 0 ? `(${orders.length})` : ''}`,
    cerceve: 'Çerçeve',
    kagitlar: 'Fine Art Baskı',
    gorseller: 'Ana Sayfa',
    site: 'Site Ayarları',
    kullanicilar: 'Kullanıcılar',
    sepetler: 'Sepet Etkinliği',
    istatistikler: 'İstatistikler',
    fotofiyat: 'Fotoğraf Baskı',
    fotosiparis: `Foto Baskı Siparişleri ${photoOrders.length > 0 ? `(${photoOrders.length})` : ''}`,
  }

  // Sol panel, sitenin kendi nav sırasını takip edecek şekilde gruplanmış:
  // Ana Sayfa (Görseller) → Fotoğraf Baskı → Fine Art (Kağıtlar) → Çerçeve → İşler (Eserler).
  const TAB_GROUPS = [
    {
      heading: 'Sayfa İçerikleri',
      tabs: ['gorseller', 'fotofiyat', 'kagitlar', 'cerceve', 'eserler', 'site'],
    },
    {
      heading: 'Siparişler',
      tabs: ['siparisler', 'fotosiparis'],
    },
    {
      heading: 'Ziyaretçiler & Kullanıcılar',
      tabs: ['kullanicilar', 'sepetler', 'istatistikler'],
    },
  ]

  const now = Date.now()
  const views7d = pageViews.filter(v => now - new Date(v.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000)
  const uniqueSessions30d = new Set(pageViews.map(v => v.session_id))
  const uniqueSessions7d = new Set(views7d.map(v => v.session_id))

  const pathCounts = {}
  pageViews.forEach(v => { pathCounts[v.path] = (pathCounts[v.path] || 0) + 1 })
  const topPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const sessionSpans = {}
  pageViews.forEach(v => {
    const t = new Date(v.created_at).getTime()
    const s = sessionSpans[v.session_id]
    if (!s) sessionSpans[v.session_id] = { min: t, max: t }
    else { s.min = Math.min(s.min, t); s.max = Math.max(s.max, t) }
  })
  const durationsSec = Object.values(sessionSpans).map(s => (s.max - s.min) / 1000)
  const avgDurationSec = durationsSec.length ? durationsSec.reduce((a, b) => a + b, 0) / durationsSec.length : 0
  const formatDuration = sec => {
    if (sec < 60) return `${Math.round(sec)} sn`
    return `${Math.floor(sec / 60)} dk ${Math.round(sec % 60)} sn`
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", paddingTop: '4.2rem' }}>
      <style>{`
        nav { display: none !important; }
        .admin-mobile-toggle { display: none; }
        .admin-sidebar-backdrop { display: none; }
        .admin-slot-box:hover { border-color: #999 !important; background: #f2f2f2 !important; }
        @media (max-width: 860px) {
          .admin-sidebar {
            position: fixed; top: 4.2rem; left: 0; bottom: 0; z-index: 101;
            transform: translateX(-100%); transition: transform .25s ease;
            background: #fff; box-shadow: 2px 0 12px rgba(0,0,0,.08);
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-mobile-toggle { display: flex !important; }
          .admin-sidebar-backdrop.open {
            display: block; position: fixed; inset: 4.2rem 0 0 0;
            background: rgba(0,0,0,.25); z-index: 100;
          }
        }
      `}</style>
      <input ref={genericFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGenericFileChange} />

      <button
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Menüyü aç/kapat"
        style={{
          position: 'fixed', top: '.7rem', left: '1rem', zIndex: 102,
          width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
          background: '#fff', border: '1px solid #eee', cursor: 'pointer',
        }}
      >
        <div style={{ width: 18 }}>
          <span style={{ display: 'block', width: '100%', height: 1.5, background: '#111', marginBottom: 4 }} />
          <span style={{ display: 'block', width: '100%', height: 1.5, background: '#111', marginBottom: 4 }} />
          <span style={{ display: 'block', width: '100%', height: 1.5, background: '#111' }} />
        </div>
      </button>
      <div className={`admin-sidebar-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sol panel */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 280, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ borderBottom: '1px solid #eee', overflowY: 'auto', flexShrink: 0, maxHeight: '48vh' }}>
          {TAB_GROUPS.map((group, gi) => (
            <div key={group.heading} style={{ borderTop: gi > 0 ? '1px solid #f2f2f2' : 'none', padding: '.4rem 0' }}>
              <div style={{ padding: '.5rem 1rem .3rem', fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#bbb', fontWeight: 600 }}>
                {group.heading}
              </div>
              {group.tabs.map(t => (
                <button key={t} onClick={() => { setTab(t); setSidebarOpen(false) }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '.5rem 1rem',
                  background: tab === t ? '#f9f6f1' : 'none', border: 'none',
                  borderLeft: tab === t ? '3px solid #9a7a4a' : '3px solid transparent',
                  fontSize: '.72rem', letterSpacing: '.02em',
                  cursor: 'pointer', color: tab === t ? '#9a7a4a' : '#555', fontWeight: tab === t ? 600 : 400
                }}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
          ))}
        </div>

        {tab === 'eserler' && (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Eserler</span>
              <button onClick={newArtwork} style={{ ...btnPrimary, padding: '.35rem .8rem' }}>+ Yeni</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {artworks.map(aw => (
                <div key={aw.id} onClick={() => selectArtwork(aw)} style={listItem(selected === aw.id)}>
                  <div style={{ fontSize: '.82rem', fontWeight: 500, marginBottom: '.15rem' }}>{aw.title}</div>
                  <div style={{ fontSize: '.68rem', color: '#aaa' }}>{aw.slug}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'siparisler' && (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {orders.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '.8rem' }}>Henüz sipariş yok</div>
            ) : orders.map(o => (
              <div key={o.id} onClick={() => setSelected(o.id)} style={listItem(selected === o.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.2rem' }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 500 }}>{o.name}</div>
                  <span style={{ fontSize: '.6rem', padding: '.15rem .5rem', background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status], borderRadius: 99 }}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <div style={{ fontSize: '.68rem', color: '#aaa' }}>₺{Number(o.total).toLocaleString('tr-TR')} · {new Date(o.created_at).toLocaleDateString('tr-TR')}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'cerceve' && (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Boylar</span>
              <button onClick={newFrame} style={{ ...btnPrimary, padding: '.35rem .8rem' }}>+ Yeni</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {frames.map(f => (
                <div key={f.id} onClick={() => selectFrame(f)} style={listItem(selectedFrame === f.id)}>
                  <div style={{ fontSize: '.82rem', fontWeight: 500, marginBottom: '.15rem' }}>{f.size}</div>
                  <div style={{ fontSize: '.68rem', color: '#aaa' }}>{f.frame_option_prices.length} renk</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'kagitlar' && (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Kağıtlar</span>
              <button onClick={newPaper} style={{ ...btnPrimary, padding: '.35rem .8rem' }}>+ Yeni</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {papers.map(p => (
                <div key={p.id} onClick={() => selectPaper(p)} style={listItem(selectedPaper === p.id)}>
                  <div style={{ fontSize: '.82rem', fontWeight: 500, marginBottom: '.15rem' }}>{p.name}</div>
                  <div style={{ fontSize: '.68rem', color: '#aaa' }}>{p.gsm} · {p.surface}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {(tab === 'gorseller' || tab === 'site' || tab === 'kullanicilar' || tab === 'sepetler' || tab === 'istatistikler' || tab === 'fotofiyat' || tab === 'fotosiparis') && (
          <div style={{ padding: '1.5rem 1rem', fontSize: '.78rem', color: '#aaa', lineHeight: 1.6 }}>
            {tab === 'gorseller' && 'Ana sayfada (/) kullanılan görseller sağda listeleniyor. Değiştirmek istediğin alana tıkla.'}
            {tab === 'site' && 'Sitenin tamamında kullanılan font çiftini buradan değiştirebilirsin.'}
            {tab === 'kullanicilar' && 'Siteye kayıt olan tüm kullanıcılar burada listeleniyor.'}
            {tab === 'sepetler' && 'Sepete eklenen ürünler burada listeleniyor. "Sipariş oldu" işaretli olmayanlar, sepete ekleyip almayanlardır.'}
            {tab === 'istatistikler' && 'Son 30 günlük ziyaretçi özeti. Admin panelinin kendi gezinmesi bu sayıma dahil değil.'}
            {tab === 'fotofiyat' && 'Fotoğraf Baskı sayfasının fiyat matrisi ve görselleri sağda. Değiştirip Kaydet\'e bas.'}
            {tab === 'fotosiparis' && 'Fotoğraf Baskı sayfasından gelen siparişler ve içindeki fotoğraf/boy/yüzey satırları.'}
          </div>
        )}
      </div>

      {/* Sağ panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 3rem' }}>
        <div style={{ maxWidth: 680 }}>

          {tab === 'siparisler' && (() => {
            const o = orders.find(x => x.id === selected)
            if (!o) return <div style={{ color: '#aaa', paddingTop: '3rem', textAlign: 'center', fontFamily: "'Archivo Black', sans-serif", fontSize: '1.2rem', fontStyle: 'italic' }}>Bir sipariş seçin</div>
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={sectionHeading}>Sipariş Detayı</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '.65rem', color: '#aaa' }}>{new Date(o.created_at).toLocaleString('tr-TR')}</div>
                    <button onClick={() => deleteOrder(o.id)} style={btnDanger}>Sil</button>
                  </div>
                </div>
                {o.tracking_number && (
                  <div style={{ marginBottom: '1rem', fontSize: '.8rem', color: 'var(--muted, #666)' }}>
                    <strong>Kargo takip no:</strong> {o.tracking_number}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[['Ad Soyad', o.name], ['E-posta', o.email || '—'], ['Telefon', o.phone], ['Adres', o.address]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '.3rem' }}>{k}</div>
                      <div style={{ fontSize: '.85rem' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fafafa', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '.8rem' }}>Ürünler</div>
                  {(o.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '.4rem' }}>
                      <span>{item.artwork?.title || '—'} — {item.size} × {item.qty}</span>
                      <span>₺{(item.price * item.qty).toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #eee', marginTop: '.8rem', paddingTop: '.8rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Toplam</span>
                    <span>₺{Number(o.total).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '.6rem' }}>Durum Güncelle</div>
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_LABELS).map(([key, val]) => (
                      <button key={key} onClick={() => updateOrderStatus(o.id, key)} style={{
                        padding: '.4rem .9rem', border: `1px solid ${STATUS_COLORS[key]}`,
                        background: o.status === key ? STATUS_COLORS[key] : 'none',
                        color: o.status === key ? '#fff' : STATUS_COLORS[key],
                        fontSize: '.68rem', cursor: 'pointer', letterSpacing: '.08em'
                      }}>{val}</button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {tab === 'eserler' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={sectionHeading}>{selected ? 'Eseri Düzenle' : 'Yeni Eser'}</h2>
                {selected && <button onClick={deleteArtwork} style={btnDanger}>Sil</button>}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={label}>Görsel</span>
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); uploadImage(e.dataTransfer.files[0]) }}
                  style={{
                    border: '2px dashed #ddd', padding: '2rem', textAlign: 'center',
                    cursor: 'pointer', background: '#fafafa',
                    minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {uploading ? (
                    <span style={{ color: '#aaa', fontSize: '.85rem' }}>Yükleniyor…</span>
                  ) : form.image_url ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={form.image_url} alt="" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} />
                      <button
                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, image_url: '' })) }}
                        style={{
                          position: 'absolute', top: -8, right: -8,
                          background: '#cc4444', color: '#fff', border: 'none',
                          borderRadius: '50%', width: 22, height: 22,
                          cursor: 'pointer', fontSize: '.8rem', lineHeight: 1
                        }}
                      >×</button>
                    </div>
                  ) : (
                    <span style={{ color: '#bbb', fontSize: '.85rem' }}>Sürükle & bırak veya tıkla</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div><span style={label}>Başlık</span><input style={inp} value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="Kırağı Botanik I" /></div>
                <div><span style={label}>Slug (otomatik)</span><input style={{ ...inp, color: '#aaa' }} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div><span style={label}>Sanatçı</span><input style={inp} value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} /></div>
                <div><span style={label}>Yıl</span><input style={inp} type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} /></div>
                <div><span style={label}>Medium (kategori)</span><input style={inp} value={form.medium} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))} placeholder="Fotoğraf" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={label}>Tür (kart başlığında "Başlık / Tür" olarak görünür)</span>
                  <input style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="Photograph" />
                </div>
                <div>
                  <span style={label}>Malzeme satırı</span>
                  <input style={inp} value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="Black & White · Hahnemühle Museum Etching" />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={label}>Açıklama</span>
                <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={label}>Etiketler (virgülle ayır)</span>
                <input style={inp} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="botanik, siyah-beyaz, minimal" />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                  <span style={label}>Boyutlar & Fiyatlar</span>
                  <button onClick={addSize} style={btnGhost}>+ Ekle</button>
                </div>
                {form.sizes.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', marginBottom: '.5rem', alignItems: 'center' }}>
                    <input style={{ ...inp, width: 120 }} placeholder="A4" value={s.label} onChange={e => updateSize(i, 'label', e.target.value)} />
                    <input style={{ ...inp, width: 120 }} placeholder="450" type="number" value={s.price} onChange={e => updateSize(i, 'price', e.target.value)} />
                    <span style={{ fontSize: '.75rem', color: '#aaa' }}>₺</span>
                    {form.sizes.length > 1 && <button onClick={() => removeSize(i)} style={{ background: 'none', border: 'none', color: '#cc4444', cursor: 'pointer', fontSize: '1rem' }}>×</button>}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <input type="checkbox" id="original" checked={form.is_original} onChange={e => setForm(f => ({ ...f, is_original: e.target.checked }))} />
                <label htmlFor="original" style={{ fontSize: '.82rem', cursor: 'pointer' }}>Orijinal eser</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem' }}>
                <button onClick={save} disabled={saving} style={btnPrimary}>
                  {saving ? 'Kaydediliyor…' : selected ? 'Güncelle' : 'Kaydet'}
                </button>
                {msg && <span style={{ fontSize: '.8rem', color: msg.includes('Hata') ? '#cc4444' : '#4a9a6a' }}>{msg}</span>}
              </div>

              {/* Ek görseller ve mockup, eser kaydedildikten sonra ID'ye ihtiyaç
                  duyduğu için Kaydet/Güncelle butonunun hemen altına, kolayca
                  görülecek şekilde yerleştirildi. */}
              {!selected ? (
                <p style={{ fontSize: '.8rem', color: '#aaa', background: '#fafafa', padding: '1rem', border: '1px dashed #ddd' }}>
                  Ek görseller ve mockup fotoğrafları eklemek için önce yukarıdaki "Kaydet" butonuna bas — kaydettikten sonra bu alanlar burada açılacak.
                </p>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={label}>Ek Görseller (Galeri)</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.7rem', marginTop: '.6rem' }}>
                      {artworkImages.map(img => (
                        <div key={img.id} style={{ position: 'relative', width: 90, height: 90 }}>
                          <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #eee' }} />
                          <button
                            onClick={() => deleteArtworkImage(img.id)}
                            style={{ position: 'absolute', top: -6, right: -6, background: '#cc4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.72rem', lineHeight: 1 }}
                          >×</button>
                        </div>
                      ))}
                      <div
                        onClick={() => galleryFileRef.current.click()}
                        style={{
                          width: 90, height: 90, border: '2px dashed #ddd', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#bbb', fontSize: '1.4rem', background: '#fafafa',
                        }}
                      >+</div>
                    </div>
                    <input ref={galleryFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => e.target.files[0] && uploadArtworkImage(e.target.files[0])} />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={label}>Mockup Görselleri (mekanda/duvarda gösterim, en fazla {MAX_MOCKUPS})</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.7rem', marginTop: '.6rem' }}>
                      {artworkMockups.map(img => (
                        <div key={img.id} style={{ position: 'relative', width: 90, height: 90 }}>
                          <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #eee' }} />
                          <button
                            onClick={() => deleteArtworkMockup(img.id)}
                            style={{ position: 'absolute', top: -6, right: -6, background: '#cc4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.72rem', lineHeight: 1 }}
                          >×</button>
                        </div>
                      ))}
                      {/* Aşamalı: bir öncekine görsel yüklenene kadar bir sonraki
                          slot gösterilmez — MAX_MOCKUPS'a ulaşınca hiç gösterilmez. */}
                      {artworkMockups.length < MAX_MOCKUPS && (
                        <div
                          onClick={() => mockupFileRef.current.click()}
                          style={{
                            width: 90, height: 90, border: '2px dashed #ddd', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#bbb', fontSize: '1.4rem', background: '#fafafa',
                          }}
                        >+</div>
                      )}
                    </div>
                    <input ref={mockupFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => e.target.files[0] && uploadArtworkMockup(e.target.files[0])} />
                  </div>
                </>
              )}

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '.5rem' }}>Sanatçı Hakkında</h2>
                <p style={{ fontSize: '.72rem', color: '#aaa', margin: '0 0 1rem' }}>
                  Ürün detay sayfalarının altında gösterilir.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.2rem', alignItems: 'start' }}>
                  <div
                    onClick={() => document.getElementById('artist-photo-input').click()}
                    style={{
                      width: 160, aspectRatio: '1 / 1', border: '2px dashed #ddd', cursor: 'pointer',
                      background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {artistPhotoUrl
                      ? <img src={artistPhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: '#bbb', fontSize: '.7rem', textAlign: 'center', padding: '.5rem' }}>Fotoğraf seç</span>}
                  </div>
                  <input id="artist-photo-input" type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && uploadArtistPhoto(e.target.files[0])} />
                  <textarea
                    value={artistBio} onChange={e => setArtistBio(e.target.value)}
                    style={{ ...inp, minHeight: 140, resize: 'vertical' }}
                    placeholder="Sanatçı biyografisi…"
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                  <button onClick={saveSiteSettings} disabled={fontSaving} style={btnPrimary}>
                    {fontSaving ? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                  {fontMsg && <span style={{ fontSize: '.8rem', color: fontMsg.includes('Hata') ? '#cc4444' : '#4a9a6a' }}>{fontMsg}</span>}
                </div>
              </div>
            </>
          )}

          {tab === 'cerceve' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={sectionHeading}>{selectedFrame ? 'Boyu Düzenle' : 'Yeni Boy'}</h2>
                {selectedFrame && <button onClick={deleteFrame} style={btnDanger}>Sil</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div><span style={label}>Boy (ör. 21×30 cm)</span><input style={inp} value={frameForm.size} onChange={e => setFrameForm(f => ({ ...f, size: e.target.value }))} /></div>
                <div><span style={label}>Açıklama</span><input style={inp} value={frameForm.note} onChange={e => setFrameForm(f => ({ ...f, note: e.target.value }))} placeholder="A4 formatı, en çok tercih edilen boyut" /></div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                  <span style={label}>Renkler & Fiyatlar</span>
                  <button onClick={addFramePrice} style={btnGhost}>+ Renk Ekle</button>
                </div>
                {frameForm.prices.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.6rem', marginBottom: '.5rem', alignItems: 'center' }}>
                    <input type="color" value={p.swatch_hex} onChange={e => updateFramePrice(i, 'swatch_hex', e.target.value)} style={{ width: 34, height: 34, padding: 0, border: '1px solid #ddd', cursor: 'pointer' }} />
                    <input style={{ ...inp, flex: 1 }} placeholder="Renk adı (Siyah, Beyaz...)" value={p.color} onChange={e => updateFramePrice(i, 'color', e.target.value)} />
                    <input style={{ ...inp, width: 110 }} type="number" placeholder="Fiyat" value={p.price} onChange={e => updateFramePrice(i, 'price', e.target.value)} />
                    <span style={{ fontSize: '.75rem', color: '#aaa' }}>TL</span>
                    {frameForm.prices.length > 1 && <button onClick={() => removeFramePrice(i)} style={{ background: 'none', border: 'none', color: '#cc4444', cursor: 'pointer', fontSize: '1rem' }}>×</button>}
                  </div>
                ))}
              </div>

              <button onClick={saveFrame} disabled={frameSaving} style={btnPrimary}>
                {frameSaving ? 'Kaydediliyor…' : selectedFrame ? 'Güncelle' : 'Kaydet'}
              </button>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Çerçeve Sayfası Görselleri</h2>
                {renderPageImageSlots('cerceve')}
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Çerçeve Sayfası Metinleri</h2>
                {renderPageTextFields('cerceve', PAGE_TEXT_FIELDS.cerceve)}
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                  Gelen Çerçeve Siparişleri {frameOrders.length > 0 ? `(${frameOrders.length})` : ''}
                </h2>
                {frameOrders.length === 0 ? (
                  <p style={{ color: '#aaa', fontSize: '.85rem' }}>Henüz çerçeve siparişi yok.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {frameOrders.map(o => (
                      <div key={o.id} style={{ border: '1px solid #eee', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <img src={o.image_url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{o.customer_name}</div>
                          <div style={{ fontSize: '.72rem', color: '#888' }}>{o.email} · {o.phone}</div>
                          <div style={{ fontSize: '.72rem', color: '#888' }}>{o.address}</div>
                          <div style={{ fontSize: '.72rem', color: '#666', marginTop: '.2rem' }}>{o.size} · {o.color} · {o.quantity} adet</div>
                          <div style={{ fontSize: '.68rem', color: '#aaa', marginTop: '.2rem' }}>{new Date(o.created_at).toLocaleString('tr-TR')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '.4rem' }}>₺{Number(o.total_price).toLocaleString('tr-TR')}</div>
                          <select
                            value={o.status}
                            onChange={e => updateFrameOrderStatus(o.id, e.target.value)}
                            style={{ ...inp, width: 'auto', fontSize: '.72rem', padding: '.35rem .6rem' }}
                          >
                            {Object.entries(STATUS_LABELS).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'kagitlar' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={sectionHeading}>{selectedPaper ? 'Kağıdı Düzenle' : 'Yeni Kağıt'}</h2>
                {selectedPaper && <button onClick={deletePaper} style={btnDanger}>Sil</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}><span style={label}>Kağıt Adı</span><input style={inp} value={paperForm.name} onChange={e => setPaperForm(f => ({ ...f, name: e.target.value }))} placeholder="Bamboo" /></div>
                <div><span style={label}>Yüzey (Mat / Parlak)</span><input style={inp} value={paperForm.surface} onChange={e => setPaperForm(f => ({ ...f, surface: e.target.value }))} /></div>
                <div><span style={label}>Gramaj</span><input style={inp} value={paperForm.gsm} onChange={e => setPaperForm(f => ({ ...f, gsm: e.target.value }))} placeholder="290gsm" /></div>
                <div><span style={label}>Doku</span><input style={inp} value={paperForm.texture} onChange={e => setPaperForm(f => ({ ...f, texture: e.target.value }))} placeholder="Pürüzsüz / Kabartılı" /></div>
                <div><span style={label}>Renk</span><input style={inp} value={paperForm.color} onChange={e => setPaperForm(f => ({ ...f, color: e.target.value }))} placeholder="White" /></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={label}>Kompozisyon</span><input style={inp} value={paperForm.composition} onChange={e => setPaperForm(f => ({ ...f, composition: e.target.value }))} placeholder="100% Cotton" /></div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={label}>Açıklama</span>
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={paperForm.description} onChange={e => setPaperForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.5rem' }}>
                <input type="checkbox" id="featured-in-guide" checked={paperForm.featured_in_guide} onChange={e => setPaperForm(f => ({ ...f, featured_in_guide: e.target.checked }))} />
                <label htmlFor="featured-in-guide" style={{ fontSize: '.82rem', cursor: 'pointer' }}>"En Popüler" galerisinde göster</label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[['texture_photo_url', 'Kağıt Dokusu Yakın Çekim'], ['preview_photo_url', 'Baskı Önizlemesi']].map(([field, lbl]) => (
                  <div key={field}>
                    <span style={label}>{lbl}</span>
                    <div
                      onClick={() => document.getElementById(`paper-${field}`).click()}
                      style={{ border: '2px dashed #ddd', minHeight: 140, background: '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '.5rem' }}
                    >
                      {paperForm[field]
                        ? <img src={paperForm[field]} alt="" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain' }} />
                        : <span style={{ color: '#bbb', fontSize: '.75rem' }}>Tıkla, görsel seç</span>}
                    </div>
                    <input id={`paper-${field}`} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => e.target.files[0] && uploadPaperPhoto(e.target.files[0], field)} />
                  </div>
                ))}
              </div>

              <button onClick={savePaper} disabled={paperSaving} style={btnPrimary}>
                {paperSaving ? 'Kaydediliyor…' : selectedPaper ? 'Güncelle' : 'Kaydet'}
              </button>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Fine Art Baskı Sayfası Görselleri</h2>
                {renderPageImageSlots('fine-art-baski')}
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Fine Art Baskı Sayfası Metinleri</h2>
                {renderPageTextFields('fine-art-baski', PAGE_TEXT_FIELDS['fine-art-baski'])}
              </div>
            </>
          )}

          {tab === 'gorseller' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '.5rem' }}>Ana Sayfa Görselleri</h2>
              <p style={{ fontSize: '.78rem', color: '#aaa', marginBottom: '2rem' }}>
                Çerçeve, Fine Art Baskı ve Fotoğraf Baskı sayfalarının kendi görselleri artık
                kendi sekmelerinde — bu sekme yalnızca ana sayfada (/) kullanılan görselleri yönetir.
              </p>
              {renderPageImageSlots('gallery')}

              <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Ana Sayfa Metinleri</h2>
                {renderPageTextFields('gallery', PAGE_TEXT_FIELDS.gallery)}
              </div>
            </>
          )}

          {tab === 'site' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Site Ayarları</h2>
              <div style={{ marginBottom: '2rem' }}>
                <span style={label}>Font Çifti</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginTop: '.5rem' }}>
                  {Object.entries(FONT_PRESETS).map(([key, preset]) => (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: '.8rem', padding: '.8rem 1rem',
                      border: fontPair === key ? '2px solid #9a7a4a' : '1px solid #eee', cursor: 'pointer',
                    }}>
                      <input type="radio" name="font-pair" checked={fontPair === key} onChange={() => previewFontPair(key)} />
                      <div>
                        <div style={{ fontSize: '.78rem', color: '#888', marginBottom: '.2rem' }}>{preset.label}</div>
                        <div style={{ fontFamily: preset.heading, fontSize: '1.1rem' }}>Artı Poz</div>
                        <div style={{ fontFamily: preset.body, fontSize: '.85rem', color: '#666' }}>Fine art baskı ve özgün eserler.</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={saveSiteSettings} disabled={fontSaving} style={btnPrimary}>
                  {fontSaving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                {fontMsg && <span style={{ fontSize: '.8rem', color: fontMsg.includes('Hata') ? '#cc4444' : '#4a9a6a' }}>{fontMsg}</span>}
              </div>
              <p style={{ fontSize: '.72rem', color: '#aaa', marginTop: '1rem', lineHeight: 1.6 }}>
                Not: font seçimi sitenin geneline (yazı tipi) ve Çerçeve / Fine Art Baskı sayfalarına uygulanıyor.
                Diğer sayfaları da aynı sisteme bağlamamız gerekiyor — sırada o var. Sanatçı Hakkında
                editörü İşler sekmesine taşındı.
              </p>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '.8rem' }}>Bakım: Mevcut Görselleri Sıkıştır</h2>
                <p style={{ fontSize: '.78rem', color: '#888', marginBottom: '1.2rem', lineHeight: 1.6, maxWidth: 620 }}>
                  Bundan sonra Admin'den yüklenen görseller otomatik sıkıştırılıyor, ama daha önce
                  yüklenmiş büyük dosyalar (özellikle ham telefon fotoğrafları) sistemde hâlâ olduğu
                  gibi duruyor. Bu buton, sistemdeki tüm görselleri (hero, eserler, kağıtlar) tek
                  seferde indirip sıkıştırıp yeniden yükler ve eski büyük dosyaları siler. Görsel
                  sayısına göre birkaç dakika sürebilir, işlem bitene kadar sayfadan ayrılma.
                </p>
                <button onClick={compressAllExistingImages} disabled={compressing} style={btnPrimary}>
                  {compressing ? 'Sıkıştırılıyor…' : 'Mevcut Görselleri Sıkıştır'}
                </button>
                {compressLog.length > 0 && (
                  <div style={{
                    marginTop: '1rem', maxHeight: 220, overflowY: 'auto', background: '#fafafa',
                    border: '1px solid #eee', padding: '.8rem 1rem', fontFamily: 'monospace',
                    fontSize: '.72rem', lineHeight: 1.7, color: '#555',
                  }}>
                    {compressLog.map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'kullanicilar' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Kullanıcılar ({profiles.length})</h2>
              {profiles.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '.85rem' }}>Henüz kayıtlı kullanıcı yok.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ textAlign: 'left', padding: '.6rem' }}>E-posta</th>
                      <th style={{ textAlign: 'left', padding: '.6rem' }}>Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '.6rem' }}>{p.email}</td>
                        <td style={{ padding: '.6rem', color: '#888' }}>{new Date(p.created_at).toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {tab === 'sepetler' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Sepet Etkinliği ({cartEvents.length})</h2>
              {cartEvents.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '.85rem' }}>Henüz sepet etkinliği yok.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ textAlign: 'left', padding: '.5rem' }}>Ürün</th>
                      <th style={{ textAlign: 'left', padding: '.5rem' }}>Boy</th>
                      <th style={{ textAlign: 'left', padding: '.5rem' }}>Fiyat</th>
                      <th style={{ textAlign: 'left', padding: '.5rem' }}>Kim</th>
                      <th style={{ textAlign: 'left', padding: '.5rem' }}>Tarih</th>
                      <th style={{ textAlign: 'left', padding: '.5rem' }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartEvents.map(ev => {
                      const converted = orderSessionIds.has(ev.session_id)
                      return (
                        <tr key={ev.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '.5rem' }}>{ev.artwork_title || '—'}</td>
                          <td style={{ padding: '.5rem' }}>{ev.size}</td>
                          <td style={{ padding: '.5rem' }}>₺{Number(ev.price || 0).toLocaleString('tr-TR')}</td>
                          <td style={{ padding: '.5rem' }}>{ev.user_email || 'Ziyaretçi'}</td>
                          <td style={{ padding: '.5rem', color: '#888' }}>{new Date(ev.created_at).toLocaleString('tr-TR')}</td>
                          <td style={{ padding: '.5rem' }}>
                            <span style={{
                              fontSize: '.68rem', padding: '.15rem .5rem', borderRadius: 99,
                              background: converted ? '#10b98122' : '#f59e0b22',
                              color: converted ? '#10b981' : '#f59e0b',
                            }}>
                              {converted ? 'Sipariş oldu' : 'Almadı'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              <p style={{ fontSize: '.72rem', color: '#aaa', marginTop: '1.5rem', lineHeight: 1.6 }}>
                Not: bu takip {new Date().toLocaleDateString('tr-TR')} tarihinden itibaren başladı — geçmişe dönük veri yok.
                Aynı kişi bir ürünü birden fazla kez sepete eklerse (miktar artırma dahil) her tıklama ayrı bir satır olarak görünür.
              </p>
            </>
          )}

          {tab === 'istatistikler' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>İstatistikler</h2>

              {pageViews.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '.85rem' }}>
                  Henüz veri yok. Ziyaretçiler siteyi gezdikçe burada birikmeye başlayacak.
                </p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                    {[
                      ['Son 7 Gün Ziyaret', views7d.length],
                      ['Son 30 Gün Ziyaret', pageViews.length],
                      ['Tekil Ziyaretçi (7g)', uniqueSessions7d.size],
                      ['Tekil Ziyaretçi (30g)', uniqueSessions30d.size],
                      ['Ort. Oturum Süresi', formatDuration(avgDurationSec)],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ border: '1px solid #eee', padding: '1rem' }}>
                        <div style={{ fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: '.5rem' }}>{lbl}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>
                    En Çok Görüntülenen Sayfalar (son 30 gün)
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '.6rem' }}>Sayfa</th>
                        <th style={{ textAlign: 'left', padding: '.6rem' }}>Görüntülenme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPaths.map(([path, count]) => (
                        <tr key={path} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '.6rem' }}>{path}</td>
                          <td style={{ padding: '.6rem', color: '#888' }}>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p style={{ fontSize: '.72rem', color: '#aaa', marginTop: '1.5rem', lineHeight: 1.6 }}>
                    Oturum süresi kabaca hesaplanır: aynı ziyaretçinin ilk ve son sayfa görüntülemesi arasındaki fark.
                    Tek sayfa görüp ayrılanlarda süre 0 görünür, bu ortalamayı aşağı çeker — kesin değil, fikir vermesi içindir.
                  </p>
                </>
              )}
            </>
          )}

          {tab === 'fotofiyat' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Fotoğraf Baskı Fiyatları</h2>
              <p style={{ fontSize: '.8rem', color: '#888', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                Her ölçü × kağıt yüzeyi kombinasyonu için ayrı fiyat girilebilir — site bu tabloyu birebir kullanır.
                Bir yüzeyin tüm ölçüler için aynı fiyat olmasını istiyorsan hepsine aynı rakamı yaz.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '.6rem' }}>Boy</th>
                    {PHOTO_FINISHES.map(f => (
                      <th key={f} style={{ textAlign: 'left', padding: '.6rem' }}>{f} (₺)</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PHOTO_SIZES.map(size => (
                    <tr key={size} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '.6rem', fontWeight: 500 }}>{size}</td>
                      {PHOTO_FINISHES.map(finish => (
                        <td key={finish} style={{ padding: '.6rem' }}>
                          <input
                            type="number" min="0" style={{ ...inp, width: 110 }}
                            value={photoPrices[`${size}:${finish}`] ?? ''}
                            onChange={e => updatePhotoPrice(size, finish, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={savePhotoPrices} disabled={photoPriceSaving} style={btnPrimary}>
                  {photoPriceSaving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                {photoPriceMsg && <span style={{ fontSize: '.8rem', color: photoPriceMsg.includes('Hata') ? '#cc4444' : '#4a9a6a' }}>{photoPriceMsg}</span>}
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Fotoğraf Baskı Sayfası Görselleri</h2>
                {renderPageImageSlots('fotograf-baski')}
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <h2 style={{ ...sectionHeading, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Fotoğraf Baskı Sayfası Metinleri</h2>
                {renderPageTextFields('fotograf-baski', PAGE_TEXT_FIELDS['fotograf-baski'])}
              </div>
            </>
          )}

          {tab === 'fotosiparis' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Fotoğraf Baskı Siparişleri</h2>
              {photoOrders.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '.85rem' }}>Henüz fotoğraf baskı siparişi yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {photoOrders.map(o => (
                    <div key={o.id} style={{ border: '1px solid #eee', padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.8rem', marginBottom: '.8rem' }}>
                        <div>
                          <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{o.customer_name}</div>
                          <div style={{ fontSize: '.72rem', color: '#888' }}>{o.email} · {o.phone}</div>
                          <div style={{ fontSize: '.72rem', color: '#888' }}>{o.address}{o.posta_kodu ? ` ${o.posta_kodu}` : ''}</div>
                          {o.note && <div style={{ fontSize: '.72rem', color: '#888', marginTop: '.3rem' }}>Mesaj: {o.note}</div>}
                          <div style={{ fontSize: '.68rem', color: '#aaa', marginTop: '.3rem' }}>{new Date(o.created_at).toLocaleString('tr-TR')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '.4rem' }}>₺{Number(o.total_price).toLocaleString('tr-TR')}</div>
                          <select
                            value={o.status}
                            onChange={e => updatePhotoOrderStatus(o.id, e.target.value)}
                            style={{ ...inp, width: 'auto', fontSize: '.72rem', padding: '.35rem .6rem' }}
                          >
                            {Object.entries(STATUS_LABELS).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.8rem' }}>
                        {(photoOrderItems[o.id] || []).map(item => (
                          <div key={item.id} style={{ width: 110, fontSize: '.7rem', color: '#666' }}>
                            <img src={item.image_url} alt="" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', border: '1px solid #eee', marginBottom: '.3rem' }} />
                            {item.size} · {item.finish}{item.white_border ? ' · Kenarlıklı' : ''}<br />
                            {item.quantity} adet · {item.size === 'Özel Ölçü' ? 'Teklif üzerine' : `₺${Number(item.unit_price).toLocaleString('tr-TR')}`}
                            {item.note && <div style={{ marginTop: '.2rem', color: '#999' }}>{item.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Admin