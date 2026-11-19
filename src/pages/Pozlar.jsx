// POZLAR — film fotoğrafçıları topluluğu (GİZLİ ÖNİZLEME)
// Menüde yok, arama motorlarına kapalı (noindex), prerender listesinde yok.
// Örnek verilerle çalışır (src/lib/pozlarDemo.js); yükleme / onay / üye
// paneli henüz yok. Plan: "Pozlar — Topluluk Bölümü Planı" dokümanı.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { POZLAR, RENKLER, POPULAR_CHIPS, searchPozlar, suggestions, photographer, topicName } from '../lib/pozlarDemo'
import { AJANDA, ETIKETLER } from '../lib/pozlarAjanda'
import { TEKNIKLER, ALANLAR, GUVENLIK } from '../lib/pozlarOgren'

// Pozlar'ın kendi imzası: film kenarı baskısı hissi (monospace + film turuncusu)
const MONO = "'Space Mono', ui-monospace, 'SF Mono', Menlo, monospace"
const FILM_ORANGE = '#D9622B'

// Film karelerinin sol üst köşesinde filmin modeli (Portra 400 gibi); dijitalde rozet yok
const MARKALAR = /^(kodak|ilford|fujifilm|fuji|lomography|rollei|foma|agfa|kentmere|harman)\s+(?=\S)/i
const kisaFilm = f => /bilinmeyen|etiketsiz/i.test(f) ? 'ETİKETSİZ' : f.replace(MARKALAR, '').toLocaleUpperCase('en')

function FilmRozet({ film, buyuk }) {
  if (!film) return null
  return (
    <span style={{ position: 'absolute', top: buyuk ? 14 : 8, left: buyuk ? 14 : 8, zIndex: 2, fontFamily: MONO, fontSize: buyuk ? '.66rem' : '.56rem', letterSpacing: '.1em', padding: buyuk ? '.3rem .55rem' : '.18rem .4rem', background: FILM_ORANGE, color: '#fff', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
      {kisaFilm(film)}
    </span>
  )
}

const label = { fontFamily: MONO, fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }

function PozlarHead({ title }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" />
    </Helmet>
  )
}

function PreviewBanner() {
  return (
    <div style={{ background: '#111', color: '#FAF7F1', textAlign: 'center', padding: '.55rem 1rem', fontFamily: MONO, fontSize: '.7rem', letterSpacing: '.1em' }}>
      ÖNİZLEME · ÖRNEK İÇERİK · HENÜZ YAYINDA DEĞİL
    </div>
  )
}

function Brand({ small }) {
  return (
    <Link to="/pozlar" style={{ fontFamily: MONO, fontWeight: 700, color: FILM_ORANGE, letterSpacing: '.28em', fontSize: small ? '1rem' : 'clamp(2rem, 5vw, 3.2rem)', textDecoration: 'none' }}>
      POZLAR
    </Link>
  )
}

function Tabs({ active }) {
  const t = [['kesfet', 'Keşfet', '/pozlar'], ['ajanda', 'Ajanda', '/pozlar/ajanda'], ['ogren', 'Öğren', '/pozlar/ogren']]
  return (
    <div style={{ display: 'flex', gap: '1.6rem', justifyContent: 'center', marginTop: '1.4rem' }}>
      {t.map(([k, ad, to]) => (
        <Link key={k} to={to} style={{ fontFamily: MONO, fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', color: active === k ? 'var(--ink)' : 'var(--muted)', borderBottom: `2px solid ${active === k ? FILM_ORANGE : 'transparent'}`, paddingBottom: '.3rem' }}>{ad}</Link>
      ))}
    </div>
  )
}

// Flickr tarzı hizalı grid: her satır aynı yükseklikte, fotoğraflar kendi
// oranında, kırpma yok; satırın genişliği kapsayıcıya tam oturur.
function JustifiedGrid({ items, target = 260, gap = 6 }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(1200)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  const rowTarget = width < 640 ? 140 : target
  // Satır yükseklikleri hedefe yakın kalsın: çok geniş (panoramik) bir kare
  // satırı aşırı basık yapacaksa o kare yeni satıra geçer; az kareli bir
  // satır da tam genişliğe zorlanıp aşırı büyütülmez (hedefin en fazla
  // 1.3 katı). Oranlar hiçbir zaman bozulmaz, kırpma yok.
  const rows = useMemo(() => {
    const out = []
    const fit = r => (width - gap * (r.length - 1)) / r.reduce((a, p) => a + p.w / p.h, 0)
    const close = (r, last) => {
      const h = fit(r)
      out.push({ row: r, h: last || h > rowTarget * 1.3 ? Math.min(rowTarget, h) : h })
    }
    // Satırı aşırı basıklaştıracak (panoramik) kareyi bekletip mevcut
    // satır dolunca kendi satırında gösteriyoruz — sıra hafifçe değişir,
    // ama hiçbir satır basık ya da dev olmaz.
    let row = [], waiting = []
    const add = p => {
      if (row.length && fit([...row, p]) < rowTarget * 0.7) { waiting.push(p); return }
      row.push(p)
      if (fit(row) <= rowTarget) {
        close(row); row = []
        const w = waiting; waiting = []; w.forEach(add)
      }
    }
    items.forEach(add)
    waiting.forEach(p => { if (row.length) { close(row, true); row = [] } row.push(p); if (fit(row) <= rowTarget) { close(row); row = [] } })
    if (row.length) close(row, true)
    return out
  }, [items, width, rowTarget, gap])

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap }}>
          {r.row.map(p => <GridItem key={p.id} p={p} w={r.h * p.w / p.h} h={r.h} />)}
        </div>
      ))}
    </div>
  )
}

function GridItem({ p, w, h }) {
  const [hover, setHover] = useState(false)
  const ph = photographer(p.u)
  return (
    <Link to={`/pozlar/${p.id}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: w, height: h, flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', display: 'block' }}>
      <FilmRozet film={p.film} />
      <img src={p.src} alt={p.baslik || p.film || p.makine} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '.7rem .8rem', color: '#fff', opacity: hover ? 1 : 0, transition: 'opacity .2s',
        background: 'linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,0) 55%)',
      }}>
        {p.baslik && <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{p.baslik}</div>}
        <div style={{ fontSize: '.72rem', opacity: .85 }}>{ph?.ad}</div>
        <div style={{ fontFamily: MONO, fontSize: '.62rem', letterSpacing: '.08em', marginTop: '.25rem', color: '#FFB27F' }}>{(p.film || p.makine).toUpperCase()} · ♥ {p.begeni}</div>
      </div>
    </Link>
  )
}

function SearchBox({ initial = '' }) {
  const [q, setQ] = useState(initial)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => setQ(initial), [initial])
  const sugg = suggestions(q)
  const go = val => { setOpen(false); navigate(val ? `/pozlar?q=${encodeURIComponent(val)}` : '/pozlar') }
  return (
    <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
      <form onSubmit={e => { e.preventDefault(); go(q.trim()) }}>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Makine, film, lens ya da konu ara… (Mamiya, Portra 400, manzara)"
          style={{ width: '100%', boxSizing: 'border-box', padding: '1rem 1.2rem', fontSize: '1rem', border: '1px solid var(--border)', background: '#fff', fontFamily: 'var(--font-body)', outline: 'none' }} />
      </form>
      {open && sugg.length > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: '#fff', border: '1px solid var(--border)', borderTop: 'none', zIndex: 20 }}>
          {sugg.map(s => (
            <button key={s.tip + s.ad} onMouseDown={() => go(s.ad)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--ink)' }}>
              <span><span style={{ ...label, marginRight: '.8rem' }}>{s.tip}</span>{s.ad}</span>
              <span style={{ ...label }}>{s.n} kare</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ to, children, active }) {
  return (
    <Link to={to} style={{ fontFamily: MONO, fontSize: '.7rem', letterSpacing: '.06em', padding: '.4rem .75rem', border: `1px solid ${active ? FILM_ORANGE : 'var(--border)'}`, color: active ? FILM_ORANGE : 'var(--ink)', background: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
      {children}
    </Link>
  )
}

function Explore() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const sort = params.get('s') || 'yeni'
  const renk = params.get('r') || ''
  const karisik = params.get('k') || ''
  const items = useMemo(() => {
    const r = searchPozlar(q).filter(p => !renk || p.renkler.includes(renk))
    if (karisik) {
      // tohumlu karıştırma: aynı link aynı sırayı verir
      let t = [...karisik].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
      const rnd = () => ((t = (t * 1664525 + 1013904223) >>> 0) / 4294967296)
      return r.map(p => [rnd(), p]).sort((a, b) => a[0] - b[0]).map(x => x[1])
    }
    return sort === 'populer' ? r.sort((a, b) => b.begeni - a.begeni) : r.sort((a, b) => b.tarih.localeCompare(a.tarih))
  }, [q, sort, renk, karisik])
  const qs = (over = {}) => {
    const o = { q, r: renk, s: sort === 'yeni' ? '' : sort, k: karisik, ...over }
    const u = new URLSearchParams(Object.entries(o).filter(([, v]) => v))
    return `/pozlar${u.toString() ? '?' + u : ''}`
  }

  return (
    <>
      <PozlarHead title={q ? `${q} — Pozlar` : 'Pozlar — Film fotoğrafçıları topluluğu'} />
      <section style={{ textAlign: 'center', padding: '3.5rem 1.5rem 2rem' }}>
        <Brand />
        <Tabs active="kesfet" />
        <p style={{ color: 'var(--muted)', margin: '1rem auto 2rem', maxWidth: 520, lineHeight: 1.6 }}>
          Film ve dijital fotoğrafçıların kareleri. Makineye, filme ya da konuya göre keşfet.
        </p>
        <SearchBox initial={q} />
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.2rem' }}>
          {POPULAR_CHIPS.map(c => <Chip key={c} to={`/pozlar?q=${encodeURIComponent(c)}`} active={q.toLowerCase() === c.toLowerCase()}>{c}</Chip>)}
        </div>
        <div style={{ display: 'flex', gap: '.55rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.1rem' }}>
          {RENKLER.map(c => {
            const n = POZLAR.filter(p => p.renkler.includes(c.k)).length
            const on = renk === c.k
            return (
              <Link key={c.k} to={qs({ r: on ? '' : c.k })} title={`${c.ad} · ${n} kare`} aria-label={c.ad} aria-pressed={on}
                style={{ width: 22, height: 22, borderRadius: '50%', background: c.hex, opacity: n ? 1 : .25, pointerEvents: n ? 'auto' : 'none', boxShadow: on ? `0 0 0 2px var(--bg), 0 0 0 4px ${FILM_ORANGE}` : '0 0 0 1px rgba(0,0,0,.12)', transition: 'box-shadow .15s' }} />
            )
          })}
          <span style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 .3rem' }} />
          <Link to={qs({ k: Math.random().toString(36).slice(2, 7) })} style={{ ...label, color: karisik ? FILM_ORANGE : 'var(--ink)', textDecoration: 'none' }}>⟳ Rastgele</Link>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1rem', flexWrap: 'wrap', gap: '.8rem' }}>
          <div style={{ ...label }}>
            {q && <>“{q}” · </>}{renk && <>{RENKLER.find(c => c.k === renk)?.ad} · </>}{items.length} kare{(q || renk || karisik) && <> · <Link to="/pozlar" style={{ color: FILM_ORANGE }}>temizle</Link></>}
          </div>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            {[['yeni', 'Yeni'], ['populer', 'Popüler']].map(([k, t]) => (
              <Link key={k} to={qs({ s: k === 'yeni' ? '' : k, k: '' })} style={{ ...label, color: !karisik && sort === k ? 'var(--ink)' : 'var(--muted)', borderBottom: !karisik && sort === k ? `2px solid ${FILM_ORANGE}` : '2px solid transparent', paddingBottom: '.2rem', textDecoration: 'none' }}>{t}</Link>
            ))}
          </div>
        </div>
        {items.length ? <JustifiedGrid items={items} /> : (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '4rem 0' }}>Bu aramayla eşleşen kare yok.</p>
        )}
      </section>
    </>
  )
}

function InfoRow({ k, v, to }) {
  if (!v) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: '.8rem', padding: '.7rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={label}>{k}</span>
      {to ? <Link to={to} style={{ color: 'var(--ink)', fontSize: '.92rem' }}>{v}</Link> : <span style={{ fontSize: '.92rem' }}>{v}</span>}
    </div>
  )
}

function Avatar({ ad, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#e8e3d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: size * .36, color: 'var(--ink)', flexShrink: 0 }}>
      {ad.split(' ').map(x => x[0]).join('').slice(0, 2)}
    </div>
  )
}

function Strip({ title, items }) {
  if (!items.length) return null
  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{ ...label, marginBottom: '.8rem' }}>{title}</div>
      <JustifiedGrid items={items.slice(0, 6)} target={180} />
    </div>
  )
}

function PhotoPage() {
  const { id } = useParams()
  const p = POZLAR.find(x => x.id === id)
  const [liked, setLiked] = useState(false)
  if (!p) return <Explore />
  const ph = photographer(p.u)
  const q = s => `/pozlar?q=${encodeURIComponent(s)}`
  return (
    <>
      <PozlarHead title={`${p.baslik || p.film || p.makine} — ${ph.ad} — Pozlar`} />
      <div style={{ background: '#151515', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem', minHeight: '60vh' }}>
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <FilmRozet film={p.film} buyuk />
          <img src={p.src} alt={p.baslik || p.film || p.makine} style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', display: 'block' }} />
        </div>
      </div>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        <div className="poz-detail" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '3rem' }}>
          <style>{`@media (max-width: 760px){ .poz-detail { grid-template-columns: 1fr !important; gap: 2rem !important; } }`}</style>
          <div>
            <Link to={`/pozlar/u/${ph.u}`} style={{ display: 'flex', alignItems: 'center', gap: '.8rem', textDecoration: 'none', color: 'var(--ink)' }}>
              <Avatar ad={ph.ad} />
              <div>
                <div style={{ fontWeight: 600 }}>{ph.ad}</div>
                {ph.unvan && <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{ph.unvan}</div>}
              </div>
            </Link>
            {p.baslik && <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.9rem', margin: '1.6rem 0 .6rem' }}>{p.baslik}</h1>}
            {p.not && <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: '.4rem 0 0', maxWidth: 560 }}>{p.not}</p>}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
              {p.konular.map(k => <Chip key={k} to={q(topicName(k))}>{topicName(k)}</Chip>)}
            </div>
            <button onClick={() => setLiked(!liked)} style={{ marginTop: '1.6rem', background: liked ? FILM_ORANGE : '#fff', color: liked ? '#fff' : 'var(--ink)', border: `1px solid ${liked ? FILM_ORANGE : 'var(--border)'}`, padding: '.6rem 1.1rem', cursor: 'pointer', fontFamily: MONO, fontSize: '.75rem', letterSpacing: '.08em' }}>
              ♥ {p.begeni + (liked ? 1 : 0)}
            </button>
          </div>
          <div>
            {p.tarandi && (
              <div style={{ fontFamily: MONO, fontSize: '.68rem', letterSpacing: '.1em', color: FILM_ORANGE, border: `1px solid ${FILM_ORANGE}`, display: 'inline-block', padding: '.35rem .6rem', marginBottom: '1rem' }}>
                ARTI POZ'DA TARANDI
              </div>
            )}
            <InfoRow k="Makine" v={p.makine} to={q(p.makine)} />
            <InfoRow k="Lens" v={p.lens} to={q(p.lens)} />
            <InfoRow k="Film" v={p.film} to={p.film && q(p.film)} />
            <InfoRow k={p.tur === 'dijital' ? 'Sensör' : 'Format'} v={p.format} />
            <InfoRow k="Tarih" v={new Date(p.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>
        </div>
        <Strip title={`${ph.ad} — diğer kareler`} items={POZLAR.filter(x => x.u === p.u && x.id !== p.id)} />
        {p.film ? <Strip title={`Aynı filmle: ${p.film}`} items={POZLAR.filter(x => x.film === p.film && x.id !== p.id)} />
          : <Strip title={`Aynı makineyle: ${p.makine}`} items={POZLAR.filter(x => x.makine === p.makine && x.id !== p.id)} />}
      </section>
    </>
  )
}

function ProfilePage() {
  const { kullanici } = useParams()
  const ph = photographer(kullanici)
  if (!ph) return <Explore />
  const mine = POZLAR.filter(p => p.u === ph.u)
  const top = key => Object.entries(mine.reduce((a, p) => ({ ...a, [p[key]]: (a[p[key]] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
  return (
    <>
      <PozlarHead title={`${ph.ad} — Pozlar`} />
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ display: 'flex', gap: '1.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <Avatar ad={ph.ad} size={96} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.8rem', margin: 0 }}>{ph.ad}</h1>
              {ph.kurucu && <span style={{ fontFamily: MONO, fontSize: '.62rem', letterSpacing: '.1em', color: FILM_ORANGE, border: `1px solid ${FILM_ORANGE}`, padding: '.2rem .45rem' }}>KURUCU ÜYE</span>}
            </div>
            {ph.unvan && <div style={{ color: 'var(--muted)', marginTop: '.3rem' }}>{ph.unvan}</div>}
            {ph.aciklama && <p style={{ margin: '.7rem 0 0', lineHeight: 1.6, maxWidth: 560 }}>{ph.aciklama}</p>}
            {/* Önizlemede link yok: örnek kullanıcı adları gerçek bir hesaba denk gelebilir.
                Gerçek sürümde https://instagram.com/<kullanıcı> linki olacak. */}
            {ph.instagram && <span style={{ display: 'inline-block', marginTop: '.6rem', fontSize: '.85rem', color: 'var(--ink)' }}>Instagram: @{ph.instagram}</span>}
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={{ ...label, marginBottom: '.5rem' }}>Çanta</div>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
              {[...top('makine'), ...top('film')].filter(Boolean).map(x => <Chip key={x} to={`/pozlar?q=${encodeURIComponent(x)}`}>{x}</Chip>)}
            </div>
          </div>
        </div>
        <div style={{ ...label, marginBottom: '1rem' }}>{mine.length} kare</div>
        <JustifiedGrid items={mine} />
      </section>
    </>
  )
}

const TR_AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const gun = d => `${Number(d.slice(8))} ${TR_AY.at(Number(d.slice(5, 7)) - 1)}${d.slice(0, 4) !== '2026' ? ' ' + d.slice(0, 4) : ''}`
const tarihYazi = e => e.baslangic ? (e.bitis && e.bitis !== e.baslangic ? `${gun(e.baslangic)} – ${gun(e.bitis)}` : gun(e.baslangic)) : `Son gün ${gun(e.bitis)}`

function AjandaPage() {
  const [params] = useSearchParams()
  const etiket = params.get('e') || ''
  const bugun = new Date().toISOString().slice(0, 10)
  const list = AJANDA.filter(e => !etiket || e.etiket === etiket).filter(e => (e.bitis || e.baslangic) >= bugun)
  const devam = list.filter(e => !e.baslangic || e.baslangic <= bugun).sort((a, b) => a.bitis.localeCompare(b.bitis))
  const yakinda = list.filter(e => e.baslangic && e.baslangic > bugun).sort((a, b) => a.baslangic.localeCompare(b.baslangic))

  const Kart = ({ e }) => (
    <a href={e.kaynak} target="_blank" rel="noopener noreferrer" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1.4rem', padding: '1.3rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--ink)' }} className="ajanda-kart">
      <div>
        <div style={{ fontFamily: MONO, fontSize: '.78rem', color: FILM_ORANGE, letterSpacing: '.04em' }}>{tarihYazi(e)}</div>
        <div style={{ ...label, marginTop: '.45rem' }}>{e.etiket}</div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{e.baslik}</div>
        <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.2rem' }}>{e.yer}</div>
        <p style={{ margin: '.55rem 0 0', lineHeight: 1.55, fontSize: '.92rem' }}>{e.ozet}</p>
        <div style={{ ...label, marginTop: '.55rem' }}>Kaynak: {e.kaynakAd} ↗</div>
      </div>
    </a>
  )
  const Bolum = ({ ad, items }) => items.length > 0 && (
    <div style={{ marginTop: '2.4rem' }}>
      <div style={{ ...label, color: 'var(--ink)', marginBottom: '.2rem' }}>{ad} · {items.length}</div>
      {items.map(e => <Kart key={e.id} e={e} />)}
    </div>
  )
  return (
    <>
      <PozlarHead title="Ajanda — Pozlar" />
      <style>{`@media (max-width: 640px){ .ajanda-kart { grid-template-columns: 1fr !important; gap: .6rem !important; } }`}</style>
      <section style={{ textAlign: 'center', padding: '3.5rem 1.5rem 1rem' }}>
        <Brand />
        <Tabs active="ajanda" />
        <p style={{ color: 'var(--muted)', margin: '1.4rem auto 1.6rem', maxWidth: 560, lineHeight: 1.6 }}>
          İstanbul'da fotoğraf sergileri, kısa film gösterimleri, festivaller ve atölyeler.
        </p>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip to="/pozlar/ajanda" active={!etiket}>Tümü</Chip>
          {ETIKETLER.filter(t => AJANDA.some(e => e.etiket === t)).map(t => <Chip key={t} to={`/pozlar/ajanda?e=${encodeURIComponent(t)}`} active={etiket === t}>{t}</Chip>)}
        </div>
      </section>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <Bolum ad="Devam ediyor" items={devam} />
        <Bolum ad="Yaklaşan" items={yakinda} />
        {!list.length && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem 0' }}>Bu etikette yaklaşan etkinlik yok.</p>}
        <p style={{ ...label, textAlign: 'center', marginTop: '3rem', lineHeight: 1.8 }}>Liste haftalık güncellenir · Etkinlik önermek için: info@artipozstudio.com</p>
      </section>
    </>
  )
}

function OgrenPage() {
  const [params] = useSearchParams()
  const alan = params.get('a') || ''
  const [acik, setAcik] = useState(null)
  const list = TEKNIKLER.filter(t => !alan || t.alan === alan)
  const baslik = { ...label, color: 'var(--ink)', margin: '1.2rem 0 .5rem' }
  return (
    <>
      <PozlarHead title="Öğren — Pozlar" />
      <section style={{ textAlign: 'center', padding: '3.5rem 1.5rem 1rem' }}>
        <Brand />
        <Tabs active="ogren" />
        <p style={{ color: 'var(--muted)', margin: '1.4rem auto 1.6rem', maxWidth: 580, lineHeight: 1.6 }}>
          Deneysel film teknikleri: ne işe yarar, ne gerekir, nasıl yapılır. Her tekniğin altında okumak ve örnek görmek için kaynak linkleri var.
        </p>
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip to="/pozlar/ogren" active={!alan}>Tümü</Chip>
          {ALANLAR.map(a => <Chip key={a} to={`/pozlar/ogren?a=${encodeURIComponent(a)}`} active={alan === a}>{a}</Chip>)}
        </div>
      </section>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1.5rem 5rem' }}>
        {list.map(t => {
          const open = acik === t.id
          return (
            <div key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setAcik(open ? null : t.id)} aria-expanded={open}
                style={{ all: 'unset', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', width: '100%', padding: '1.3rem 0', boxSizing: 'border-box' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.08rem', color: 'var(--ink)' }}>{t.ad} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>— {t.alt}</span></div>
                  <div style={{ ...label, marginTop: '.4rem' }}>{t.alan} · {t.zorluk}</div>
                  <p style={{ margin: '.6rem 0 0', lineHeight: 1.55, fontSize: '.92rem', color: 'var(--ink)' }}>{t.ozet}</p>
                </div>
                <div style={{ fontFamily: MONO, color: FILM_ORANGE, fontSize: '1.2rem', lineHeight: 1 }}>{open ? '–' : '+'}</div>
              </button>
              {open && (
                <div style={{ padding: '0 0 1.6rem', fontSize: '.92rem', lineHeight: 1.6 }}>
                  <div style={baslik}>Malzemeler</div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>{t.malzeme.map(m => <li key={m}>{m}</li>)}</ul>
                  <div style={baslik}>Adımlar</div>
                  <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>{t.adimlar.map(a => <li key={a}>{a}</li>)}</ol>
                  {t.not && <p style={{ margin: '.9rem 0 0', color: 'var(--muted)' }}>{t.not}</p>}
                  <div style={baslik}>Oku · örnek gör</div>
                  <div style={{ display: 'grid', gap: '.35rem' }}>
                    {t.linkler.map(l => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecorationColor: FILM_ORANGE, textUnderlineOffset: 3 }}>{l.ad} ↗</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div style={{ marginTop: '3rem', padding: '1.2rem 1.4rem', border: '1px solid var(--border)' }}>
          <div style={{ ...label, color: FILM_ORANGE, marginBottom: '.5rem' }}>Güvenlik</div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.6, fontSize: '.9rem' }}>{GUVENLIK.map(g => <li key={g}>{g}</li>)}</ul>
        </div>
        <p style={{ ...label, textAlign: 'center', marginTop: '2.4rem', lineHeight: 1.8 }}>Bir tekniği denedin mi? Karelerini Pozlar'a yükle, tekniği etiketle.</p>
      </section>
    </>
  )
}

export default function Pozlar({ view = 'explore' }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '80vh', paddingTop: '4.2rem' }}>
      <PreviewBanner />
      {view === 'photo' ? <PhotoPage /> : view === 'profile' ? <ProfilePage /> : view === 'ajanda' ? <AjandaPage /> : view === 'ogren' ? <OgrenPage /> : <Explore />}
    </div>
  )
}
