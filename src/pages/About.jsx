function About() {
  const wrap = { maxWidth: 720, margin: '0 auto', padding: '3.5rem 2rem 6rem' }
  const h2 = {
    fontFamily: "'Playfair Display', serif", color: 'var(--blue)',
    fontSize: '1.5rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1rem'
  }
  const p = { fontSize: '.88rem', lineHeight: 1.9, color: '#333', marginBottom: '1rem' }

  return (
    <div style={{ paddingTop: '4.2rem' }}>
      <div style={wrap}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", color: 'var(--blue)',
          fontSize: '2.4rem', fontWeight: 600, marginBottom: '.5rem'
        }}>
          Hakkımızda
        </h1>
        <div style={{ fontSize: '.62rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '2.5rem' }}>
          <span lang="en">Fine Art Print Studio</span> · İstanbul
        </div>

        <p style={p}>
          Artı Poz, İstanbul merkezli bağımsız bir fine art baskı stüdyosudur.
          Fotoğraf, resim ve özgün eserleri; müze kalitesinde malzeme ve
          titiz bir baskı süreciyle koleksiyonerlerle buluşturuyoruz.
        </p>
        <p style={p}>
          Fotoğraf bölümünden mezun oldum ve uzun yıllar müzelerde, çağdaş sanat
          galerilerinde çalıştım. O süreçte, asıl yapmam gerekenin kendi işimi
          ve kendi markamı kurmak olduğuna inanmaya başladım. Fotoğrafa ve baskı
          sürecine duyduğum ilgiyle bu yola çıktım — bugün kendi portföyümden
          ve sizlerden gelen eserlerle müze kalitesinde baskılar üretiyorum.
        </p>

        <h2 style={h2}>Baskı Kalitesi</h2>
        <p style={p}>
          Fine art baskılarımız için Hahnemühle ve Awagami kağıtları, arşivsel
          pigment mürekkeplerle kullanıyoruz. Doğru saklama koşullarında
          solmadan nesiller boyu dayanacak şekilde üretilir.
        </p>

        <h2 style={h2}>Güvenli Teslimat</h2>
        <p style={p}>
          Eserler, köşe korumaları ve sert silindir ya da düz kutu ambalajla,
          sigortalı kargo ile gönderilebilir. Teslimat süresi yurt içinde 3–5 iş günüdür.
          14 gün içinde koşulsuz iade hakkınız vardır.
        </p>

        <h2 style={h2}>İletişim</h2>
        <p style={p}>
          Sorularınız için <a href="mailto:info@artipozstudio.com" style={{ color: 'var(--gold)' }}>info@artipozstudio.com</a> adresinden
          ya da ürün sayfalarındaki WhatsApp hattından bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  )
}

export default About
