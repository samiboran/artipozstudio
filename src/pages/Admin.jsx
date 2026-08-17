import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { FONT_PRESETS, setFont } from '../lib/siteFonts'

const EMPTY_FORM = {
  title: '', slug: '', artist: 'Sami Boran',
  year: new Date().getFullYear(), medium: '', description: '',
  tags: '', sizes: [{ label: 'A4', price: '' }],
  is_original: false, stock: 0, image_url: ''
}

const EMPTY_FRAME = { size: '', note: '', prices: [{ color: '', price: '', swatch_hex: '#111111' }] }
const EMPTY_PAPER = { name: '', surface: '', gsm: '', texture: '', color: '', composition: '', description: '', texture_photo_url: '', preview_photo_url: '' }

// Görseller sekmesinde yönetilen sabit alanlar. multiple:false => tek görsel (yeni yükleme
// eskisinin yerine geçer). multiple:true => istenildiği kadar görsel eklenip silinebilir.
const IMAGE_SLOTS = [
  { page: 'gallery', section: 'hero', label: 'Ana Sayfa — Hero Görseli', multiple: false, aspect: '21 / 9' },
  { page: 'gallery', section: 'hizmet-fotograf', label: 'Ana Sayfa — Hizmetlerimiz: Fotoğraf Baskı', multiple: false, aspect: '4 / 3' },
  { page: 'gallery', section: 'hizmet-fine-art', label: 'Ana Sayfa — Hizmetlerimiz: Fine Art Baskı', multiple: false, aspect: '4 / 3' },
  { page: 'gallery', section: 'hizmet-cerceve', label: 'Ana Sayfa — Hizmetlerimiz: Çerçeveler', multiple: false, aspect: '4 / 3' },
  { page: 'gallery', section: 'sertifikali-kagit', label: 'Ana Sayfa — Sertifikalı Fine Art Kağıtları', multiple: false, aspect: '16 / 9' },
  { page: 'gallery', section: 'iletisim-gorsel', label: 'Ana Sayfa — İletişim Üstü Görsel', multiple: false, aspect: '16 / 7' },
  { page: 'cerceve', section: 'hero', label: 'Çerçeve — Hero Görseli', multiple: false, aspect: '21 / 9' },
  { page: 'cerceve', section: 'renk-secenekleri', label: 'Çerçeve — Renk Seçenekleri', multiple: false, aspect: '4 / 3' },
  { page: 'cerceve', section: 'renk-detay', label: 'Çerçeve — Renk Detayı', multiple: false, aspect: '4 / 3' },
  { page: 'cerceve', section: 'ornekler', label: 'Çerçeve — Örnek Çerçeveli İşler', multiple: true, aspect: '4 / 5' },
  { page: 'fine-art-baski', section: 'hero', label: 'Fine Art Baskı — Hero Görseli', multiple: false, aspect: '21 / 9' },
  { page: 'fine-art-baski', section: 'kagit-secenekleri', label: 'Fine Art Baskı — Kağıt Seçenekleri', multiple: false, aspect: '4 / 3' },
  { page: 'fine-art-baski', section: 'ornekler', label: 'Fine Art Baskı — Örnek Baskılarımız', multiple: true, aspect: '4 / 5' },
]

function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('eserler')
  const [artworks, setArtworks] = useState([])
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  // --- Çerçeve ---
  const [frames, setFrames] = useState([])
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [frameForm, setFrameForm] = useState(EMPTY_FRAME)
  const [frameSaving, setFrameSaving] = useState(false)

  // --- Kağıtlar ---
  const [papers, setPapers] = useState([])
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [paperForm, setPaperForm] = useState(EMPTY_PAPER)
  const [paperSaving, setPaperSaving] = useState(false)

  // --- Görseller (genel dosya yükleme) ---
  const [pageImages, setPageImages] = useState({}) // "page:section" -> [rows]
  const [uploadTarget, setUploadTarget] = useState(null)
  const genericFileRef = useRef()

  // --- Site Ayarları ---
  const [fontPair, setFontPairState] = useState('archivo')
  const [fontSaving, setFontSaving] = useState(false)
  const [fontMsg, setFontMsg] = useState('')

  // --- Kullanıcılar ---
  const [profiles, setProfiles] = useState([])

  // --- Sepet Etkinliği ---
  const [cartEvents, setCartEvents] = useState([])
  const [orderSessionIds, setOrderSessionIds] = useState(new Set())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login')
    })
  }, [])

  useEffect(() => { loadArtworks() }, [])
  useEffect(() => { if (tab === 'siparisler') loadOrders() }, [tab])
  useEffect(() => { if (tab === 'cerceve') loadFrames() }, [tab])
  useEffect(() => { if (tab === 'kagitlar') loadPapers() }, [tab])
  useEffect(() => { if (tab === 'gorseller') loadPageImages() }, [tab])
  useEffect(() => { if (tab === 'site') loadSiteSettings() }, [tab])
  useEffect(() => { if (tab === 'kullanicilar') loadProfiles() }, [tab])
  useEffect(() => { if (tab === 'sepetler') loadCartEvents() }, [tab])

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
    setForm({ ...aw, tags: (aw.tags || []).join(', '), sizes: aw.sizes?.length ? aw.sizes : [{ label: 'A4', price: '' }] })
    setMsg('')
  }

  function newArtwork() { setSelected(null); setForm(EMPTY_FORM); setMsg('') }

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
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('artwork-images').upload(path, file)
    if (error) { setMsg('Görsel yüklenemedi: ' + error.message); setUploading(false); return }
    const { data } = supabase.storage.from('artwork-images').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: data.publicUrl }))
    setUploading(false)
  }

  async function save() {
    setSaving(true)
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    delete payload.id; delete payload.created_at
    let error
    if (selected) {
      ;({ error } = await supabase.from('artworks').update(payload).eq('id', selected))
    } else {
      ;({ error } = await supabase.from('artworks').insert(payload))
    }
    setSaving(false)
    if (error) { setMsg('Hata: ' + error.message); return }
    setMsg(selected ? 'Güncellendi ✓' : 'Eklendi ✓')
    loadArtworks()
  }

  async function deleteArtwork() {
    if (!selected) return
    if (!window.confirm('Bu eseri silmek istediğinden emin misin?')) return
    await supabase.from('artworks').delete().eq('id', selected)
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
    let frameId = selectedFrame
    if (frameId) {
      await supabase.from('frame_options').update({ size: frameForm.size, note: frameForm.note }).eq('id', frameId)
      await supabase.from('frame_option_prices').delete().eq('frame_option_id', frameId)
    } else {
      const nextOrder = frames.length ? Math.max(...frames.map(f => f.sort_order)) + 1 : 1
      const { data, error } = await supabase.from('frame_options').insert({ size: frameForm.size, note: frameForm.note, sort_order: nextOrder }).select().single()
      if (error) { setFrameSaving(false); alert('Hata: ' + error.message); return }
      frameId = data.id
    }
    const rows = frameForm.prices.filter(p => p.color).map((p, i) => ({
      frame_option_id: frameId, color: p.color, price: p.price || 0, swatch_hex: p.swatch_hex || '#111111', sort_order: i,
    }))
    if (rows.length) await supabase.from('frame_option_prices').insert(rows)
    setFrameSaving(false)
    setSelectedFrame(frameId)
    loadFrames()
  }

  async function deleteFrame() {
    if (!selectedFrame) return
    if (!window.confirm('Bu boyu silmek istediğinden emin misin? Fiyatları da silinecek.')) return
    await supabase.from('frame_options').delete().eq('id', selectedFrame)
    newFrame(); loadFrames()
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
    let error
    if (selectedPaper) {
      ;({ error } = await supabase.from('papers').update(payload).eq('id', selectedPaper))
    } else {
      const nextOrder = papers.length ? Math.max(...papers.map(p => p.sort_order)) + 1 : 1
      ;({ error } = await supabase.from('papers').insert({ ...payload, sort_order: nextOrder }))
    }
    setPaperSaving(false)
    if (error) { alert('Hata: ' + error.message); return }
    loadPapers()
  }

  async function deletePaper() {
    if (!selectedPaper) return
    if (!window.confirm('Bu kağıdı silmek istediğinden emin misin?')) return
    await supabase.from('papers').delete().eq('id', selectedPaper)
    newPaper(); loadPapers()
  }

  async function uploadPaperPhoto(file, field) {
    const url = await uploadToStorage(file)
    if (url) setPaperForm(f => ({ ...f, [field]: url }))
  }

  // ============================================================
  // GÖRSELLER — sayfa görselleri (hero, örnek galeriler)
  // ============================================================
  async function uploadToStorage(file) {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
    const { error } = await supabase.storage.from('site-images').upload(path, file)
    if (error) { alert('Görsel yüklenemedi: ' + error.message); return null }
    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function loadPageImages() {
    const { data } = await supabase.from('page_images').select('*').order('sort_order')
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
      await supabase.from('page_images').delete().eq('page', page).eq('section', section)
      await supabase.from('page_images').insert({ page, section, image_url: url, sort_order: 0 })
    } else {
      const existing = pageImages[`${page}:${section}`] || []
      const nextOrder = existing.length ? Math.max(...existing.map(r => r.sort_order)) + 1 : 0
      await supabase.from('page_images').insert({ page, section, image_url: url, sort_order: nextOrder })
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

  async function deletePageImage(id) {
    await supabase.from('page_images').delete().eq('id', id)
    loadPageImages()
  }

  // ============================================================
  // SİTE AYARLARI — font seçimi
  // ============================================================
  async function loadSiteSettings() {
    const { data } = await supabase.from('site_settings').select('font_pair').eq('id', 'default').single()
    if (data?.font_pair) setFontPairState(data.font_pair)
  }

  function previewFontPair(key) { setFontPairState(key); setFont(key) }

  async function saveSiteSettings() {
    setFontSaving(true)
    const { error } = await supabase.from('site_settings').upsert({ id: 'default', font_pair: fontPair, updated_at: new Date().toISOString() })
    setFontSaving(false)
    if (error) { setFontMsg('Hata: ' + error.message); return }
    setFont(fontPair)
    setFontMsg('Kaydedildi ✓')
    setTimeout(() => setFontMsg(''), 2000)
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

  const inp = { width: '100%', padding: '.6rem .8rem', border: '1px solid #ddd', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const label = { fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: '.3rem', display: 'block' }
  const sectionHeading = { fontFamily: "'Archivo Black', sans-serif", fontSize: '1.8rem', fontWeight: 300, margin: 0 }
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
    eserler: 'Eserler',
    siparisler: `Siparişler ${orders.length > 0 ? `(${orders.length})` : ''}`,
    cerceve: 'Çerçeve',
    kagitlar: 'Kağıtlar',
    gorseller: 'Görseller',
    site: 'Site Ayarları',
    kullanicilar: 'Kullanıcılar',
    sepetler: 'Sepet Etkinliği',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", paddingTop: '4.2rem' }}>
      <style>{`nav { display: none !important; }`}</style>
      <input ref={genericFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGenericFileChange} />

      {/* Sol panel */}
      <div style={{ width: 280, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #eee' }}>
          {Object.keys(TAB_LABELS).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: '1 1 33%', minWidth: 90, padding: '.6rem .3rem', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid #9a7a4a' : '2px solid transparent',
              fontSize: '.62rem', letterSpacing: '.1em', textTransform: 'uppercase',
              cursor: 'pointer', color: tab === t ? '#9a7a4a' : '#aaa', fontWeight: tab === t ? 600 : 400
            }}>
              {TAB_LABELS[t]}
            </button>
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

        {(tab === 'gorseller' || tab === 'site' || tab === 'kullanicilar' || tab === 'sepetler') && (
          <div style={{ padding: '1.5rem 1rem', fontSize: '.78rem', color: '#aaa', lineHeight: 1.6 }}>
            {tab === 'gorseller' && 'Çerçeve ve Fine Art Baskı sayfalarındaki tüm görseller sağda listeleniyor. Değiştirmek istediğin alana tıkla.'}
            {tab === 'site' && 'Sitenin tamamında kullanılan font çiftini buradan değiştirebilirsin.'}
            {tab === 'kullanicilar' && 'Siteye kayıt olan tüm kullanıcılar burada listeleniyor.'}
            {tab === 'sepetler' && 'Sepete eklenen ürünler burada listeleniyor. "Sipariş oldu" işaretli olmayanlar, sepete ekleyip almayanlardır.'}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div><span style={label}>Başlık</span><input style={inp} value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="Kırağı Botanik I" /></div>
                <div><span style={label}>Slug (otomatik)</span><input style={{ ...inp, color: '#aaa' }} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div><span style={label}>Sanatçı</span><input style={inp} value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} /></div>
                <div><span style={label}>Yıl</span><input style={inp} type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} /></div>
                <div><span style={label}>Medium</span><input style={inp} value={form.medium} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))} placeholder="Fotoğraf" /></div>
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

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={save} disabled={saving} style={btnPrimary}>
                  {saving ? 'Kaydediliyor…' : selected ? 'Güncelle' : 'Kaydet'}
                </button>
                {msg && <span style={{ fontSize: '.8rem', color: msg.includes('Hata') ? '#cc4444' : '#4a9a6a' }}>{msg}</span>}
              </div>
            </>
          )}

          {tab === 'cerceve' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={sectionHeading}>{selectedFrame ? 'Boyu Düzenle' : 'Yeni Boy'}</h2>
                {selectedFrame && <button onClick={deleteFrame} style={btnDanger}>Sil</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
            </>
          )}

          {tab === 'kagitlar' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={sectionHeading}>{selectedPaper ? 'Kağıdı Düzenle' : 'Yeni Kağıt'}</h2>
                {selectedPaper && <button onClick={deletePaper} style={btnDanger}>Sil</button>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
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
            </>
          )}

          {tab === 'gorseller' && (
            <>
              <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Görseller</h2>
              {IMAGE_SLOTS.map(slot => {
                const key = `${slot.page}:${slot.section}`
                const rows = pageImages[key] || []
                const singleImage = !slot.multiple && rows[0]
                return (
                  <div key={key} style={{ marginBottom: '2.5rem', borderBottom: '1px solid #eee', paddingBottom: '2rem' }}>
                    <span style={{ ...label, display: 'block', marginBottom: '.8rem' }}>{slot.label}</span>

                    <div
                      onClick={() => triggerSlotUpload(slot)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); uploadForSlot(e.dataTransfer.files[0], slot) }}
                      style={{
                        border: '2px dashed #ddd', padding: '1.5rem', textAlign: 'center',
                        cursor: 'pointer', background: '#fafafa',
                        minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {singleImage ? (
                        <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: slot.aspect, overflow: 'hidden' }}>
                          <img src={rows[0].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <button
                            onClick={e => { e.stopPropagation(); deletePageImage(rows[0].id) }}
                            style={{ position: 'absolute', top: 6, right: 6, background: '#cc4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '.8rem', lineHeight: 1 }}
                          >×</button>
                        </div>
                      ) : (
                        <span style={{ color: '#bbb', fontSize: '.85rem' }}>
                          {slot.multiple
                            ? 'Görsel eklemek için sürükle & bırak veya tıkla'
                            : 'Henüz görsel yok, sitede eski hazır görsel gösteriliyor — sürükle & bırak veya tıkla'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '.66rem', color: '#bbb', marginTop: '.4rem' }}>
                      Önizleme, sitede gerçekte nasıl kırpılacağını (oran: {slot.aspect}) gösteriyor.
                    </p>

                    {slot.multiple && rows.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '.8rem' }}>
                        {rows.map(row => (
                          <div key={row.id} style={{ position: 'relative', width: 130, aspectRatio: slot.aspect, overflow: 'hidden' }}>
                            <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', border: '1px solid #eee' }} />
                            <button
                              onClick={() => deletePageImage(row.id)}
                              style={{ position: 'absolute', top: 4, right: 4, background: '#cc4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '.72rem', lineHeight: 1 }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
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
                Not: şu an bu seçim sitenin geneline (yazı tipi) ve Çerçeve / Fine Art Baskı sayfalarına uygulanıyor.
                Diğer sayfaları da aynı sisteme bağlamamız gerekiyor — sırada o var.
              </p>
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

        </div>
      </div>
    </div>
  )
}

export default Admin