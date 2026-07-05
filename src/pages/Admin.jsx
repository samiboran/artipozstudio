import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const EMPTY_FORM = {
  title: '', slug: '', artist: 'Sami Boran',
  year: new Date().getFullYear(), medium: '', description: '',
  tags: '', sizes: [{ label: 'A4', price: '' }],
  is_original: false, stock: 0, image_url: ''
}

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login')
    })
  }, [])

  useEffect(() => { loadArtworks() }, [])
  useEffect(() => { if (tab === 'siparisler') loadOrders() }, [tab])

  async function loadArtworks() {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false })
    setArtworks(data || [])
  }

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function updateOrderStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
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

  const inp = { width: '100%', padding: '.6rem .8rem', border: '1px solid #ddd', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const label = { fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#888', marginBottom: '.3rem', display: 'block' }
  const STATUS_COLORS = { yeni: '#f59e0b', hazirlaniyor: '#3b82f6', kargoda: '#8b5cf6', teslim: '#10b981', iptal: '#ef4444' }
  const STATUS_LABELS = { yeni: 'Yeni', hazirlaniyor: 'Hazırlanıyor', kargoda: 'Kargoda', teslim: 'Teslim Edildi', iptal: 'İptal' }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", paddingTop: '4.2rem' }}>
      <style>{`nav { display: none !important; }`}</style>

      {/* Sol panel */}
      <div style={{ width: 280, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {['eserler', 'siparisler'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '.75rem', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid #9a7a4a' : '2px solid transparent',
              fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase',
              cursor: 'pointer', color: tab === t ? '#9a7a4a' : '#aaa', fontWeight: tab === t ? 600 : 400
            }}>
              {t === 'eserler' ? 'Eserler' : `Siparişler ${orders.length > 0 ? `(${orders.length})` : ''}`}
            </button>
          ))}
        </div>

        {tab === 'eserler' && (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Eserler</span>
              <button onClick={newArtwork} style={{ background: '#111', color: '#fff', border: 'none', padding: '.35rem .8rem', fontSize: '.7rem', cursor: 'pointer' }}>+ Yeni</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {artworks.map(aw => (
                <div key={aw.id} onClick={() => selectArtwork(aw)} style={{
                  padding: '.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
                  background: selected === aw.id ? '#f9f6f1' : 'white',
                  borderLeft: selected === aw.id ? '3px solid #9a7a4a' : '3px solid transparent'
                }}>
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
              <div key={o.id} onClick={() => setSelected(o.id)} style={{
                padding: '.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f5f5f5',
                background: selected === o.id ? '#f9f6f1' : 'white',
                borderLeft: selected === o.id ? '3px solid #9a7a4a' : '3px solid transparent'
              }}>
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
                  <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.8rem', fontWeight: 300, margin: 0 }}>Sipariş Detayı</h2>
                  <div style={{ fontSize: '.65rem', color: '#aaa' }}>{new Date(o.created_at).toLocaleString('tr-TR')}</div>
                </div>
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
                <h2 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.8rem', fontWeight: 300 }}>
                  {selected ? 'Eseri Düzenle' : 'Yeni Eser'}
                </h2>
                {selected && (
                  <button onClick={deleteArtwork} style={{ background: 'none', border: '1px solid #ffcccc', color: '#cc4444', padding: '.4rem .9rem', fontSize: '.7rem', cursor: 'pointer' }}>Sil</button>
                )}
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
                  <button onClick={addSize} style={{ background: 'none', border: '1px solid #ddd', padding: '.25rem .7rem', fontSize: '.7rem', cursor: 'pointer' }}>+ Ekle</button>
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
                <button onClick={save} disabled={saving} style={{ background: '#111', color: '#fff', border: 'none', padding: '.75rem 2rem', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {saving ? 'Kaydediliyor…' : selected ? 'Güncelle' : 'Kaydet'}
                </button>
                {msg && <span style={{ fontSize: '.8rem', color: msg.includes('Hata') ? '#cc4444' : '#4a9a6a' }}>{msg}</span>}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Admin