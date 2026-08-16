// TODO: içerik henüz eksik — Fine Art Baskı sayfasındaki gibi hero görseli,
// hizmet açıklaması, kağıt/yüzey seçenekleri ve fiyat tablosu eklenecek.

const heading = { fontFamily: "'Archivo Black', sans-serif", fontWeight: 400, color: 'var(--ink)' }
const eyebrow = {
  fontFamily: "'Archivo', sans-serif", fontSize: '.72rem', fontWeight: 500,
  letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--accent)',
}
const body = { fontFamily: "'Archivo', sans-serif", fontSize: '.92rem', lineHeight: 1.7, color: 'var(--muted)' }

export default function FotografBaski() {
  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero */}
      <section style={{
        position: 'relative', height: '46vh', minHeight: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', background: 'var(--surface)',
      }}>
        <div style={{ padding: '0 1.5rem' }}>
          <p style={{ ...eyebrow, marginBottom: '1rem' }}>Hizmetlerimiz</p>
          <h1 style={{ ...heading, fontSize: 'clamp(2rem, 5vw, 3.2rem)', margin: '0 0 1rem' }}>
            Fotoğraf Baskı
          </h1>
        </div>
      </section>

      {/* Yer tutucu içerik */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={body}>
          Bu sayfanın içeriği hazırlanıyor — mat, yarı mat, parlak ve saten yüzey
          seçenekleri, fiyat tablosu ve örnek baskılar yakında burada olacak.
        </p>
      </section>

    </div>
  )
}