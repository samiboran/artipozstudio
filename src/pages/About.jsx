function About() {
  const wrap = { maxWidth: 720, margin: '0 auto', padding: '3.5rem 2rem 6rem' }
  const h2 = {
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: '1.5rem', fontWeight: 400, marginTop: '3rem', marginBottom: '1rem'
  }
  const p = { fontSize: '.88rem', lineHeight: 1.9, color: '#333', marginBottom: '1rem' }

  return (
    <div style={{ paddingTop: '4.2rem' }}>
      <div style={wrap}>
        <h1 style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: '2.4rem', fontWeight: 300, marginBottom: '.5rem'
        }}>
          Hakkımızda
        </h1>
        <div style={{ fontSize: '.62rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '2.5rem' }}>
          Fine Art Print Studio · İstanbul
        </div>

        <p style={p}>
          Artı Poz, İstanbul merkezli bağımsız bir fine art baskı stüdyosudur.
          Fotoğraf, resim ve özgün eserleri; müze kalitesinde malzeme ve
          titiz bir baskı süreciyle koleksiyonerlerle buluşturuyoruz.
        </p>
        <p style={p}>
          [BURAYA KENDİ HİKÂYENİ YAZ — 2-3 cümle: neden kurdun, neye inanıyorsun,
          sanata bakışın. Örn: analog fotoğrafla ilişkin, baskının fiziksel
          nesne olarak değeri, duvarda yaşayan işler...]
        </p>

        <h2 style={h2}>Baskı Kalitesi</h2>
        <p style={p}>
          Tüm baskılarımız Hahnemühle sertifikalı fine art kâğıtlara,
          arşivsel pigment mürekkeplerle yapılır. Doğru saklama koşullarında
          solmadan nesiller boyu dayanacak şekilde üretilir.
        </p>

        <h2 style={h2}>Orijinallik Sertifikası</h2>
        <p style={p}>
          Her eser, sanatçı imzalı ve numaralı orijinallik sertifikası ile
          gönderilir. Sınırlı edisyonlarda edisyon numarası sertifika üzerinde
          belirtilir.
        </p>

        <h2 style={h2}>Güvenli Teslimat</h2>
        <p style={p}>
          Eserler, köşe korumaları ve sert silindir ya da düz kutu ambalajla,
          sigortalı kargo ile gönderilir. Teslimat süresi yurt içinde 3–5 iş günüdür.
          14 gün içinde koşulsuz iade hakkınız vardır.
        </p>

        <h2 style={h2}>İletişim</h2>
        <p style={p}>
          Sorularınız için <a href="mailto:info@fossilgarden.com" style={{ color: 'var(--gold)' }}>info@fossilgarden.com</a> adresinden
          ya da ürün sayfalarındaki WhatsApp hattından bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  )
}

export default About