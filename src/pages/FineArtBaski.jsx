import heroImg from '../assets/fine-art/hero.jpg'
import kagitSecenekleriImg from '../assets/fine-art/kagit-secenekleri.jpg'
import ornekBotanikImg from '../assets/fine-art/ornek-botanik.jpg'
import ornekBotanik2Img from '../assets/fine-art/ornek-botanik-2.jpg'
import ornekDoku1Img from '../assets/fine-art/ornek-doku-1.jpg'
import ornekDoku2Img from '../assets/fine-art/ornek-doku-2.jpg'

// TODO: her kağıdın kendi doku/baskı önizleme fotoğrafları eklenene kadar
// kart içindeki PLACEHOLDER kutular kalacak.

const PAPERS = [
  {
    no: '01',
    name: 'Bamboo',
    surface: 'Mat',
    gsm: '290gsm',
    texture: 'Pürüzsüz',
    color: 'Natural White',
    composition: '90% Bamboo fibre, 10% Cotton',
    description:
      'Bambu liflerinden üretilen bu kağıt, doğal beyaz tonu ve mat yüzeyiyle organik bir sıcaklık sunar. Çevre dostu yapısı ve yumuşak dokusuyla doğa temalı eserler için mükemmel bir seçimdir.',
  },
  {
    no: '02',
    name: 'Bamboo Gloss Baryta',
    surface: 'Parlak',
    gsm: '305gsm',
    texture: 'Pürüzsüz',
    color: 'Natural White',
    composition: '90% Bamboo fibre, 10% Cotton',
    description:
      'Yüksek parlak baryta yüzeyi, fotoğraflara derin siyahlar ve olağanüstü ton zenginliği katar. Bambu liflerinin doğal yapısıyla birleşen bu kağıt, klasik darkroom baskıların dijital çağdaki karşılığıdır.',
  },
  {
    no: '03',
    name: 'Rice Paper',
    surface: 'Mat',
    gsm: '100gsm',
    texture: 'Pürüzsüz',
    color: 'White',
    composition: '100% α-Cellulose',
    description:
      'İnce ve şeffaf yapısıyla benzersiz bir hafiflik sunan pirinç kağıdı, ışığı içinden geçirerek eşsiz bir derinlik yaratır. Geleneksel Asya sanatından ilham alan eserler için ideal bir zemin.',
  },
  {
    no: '04',
    name: 'Photo Rag Ultra Smooth',
    surface: 'Mat',
    gsm: '305gsm',
    texture: 'Pürüzsüz',
    color: 'White',
    composition: '100% Cotton',
    description:
      'Ultra pürüzsüz yüzeyi, en ince detayları ve hassas ton geçişlerini mükemmel netlikte aktarır. %100 pamuklu yapısı ve asitsiz formülüyle arşiv kalitesinde uzun ömürlü baskılar için tercih edilen premium kağıttır.',
  },
  {
    no: '05',
    name: 'Photo Rag',
    surface: 'Mat',
    gsm: '308gsm',
    texture: 'Yumuşak',
    color: 'White',
    composition: '100% Cotton',
  },
  {
    no: '06',
    name: 'William Turner',
    surface: 'Mat',
    gsm: '190gsm',
    texture: 'Kabartılı',
    color: 'White',
    composition: '100% Cotton',
  },
  {
    no: '07',
    name: 'Albrecht Dürer',
    surface: 'Mat',
    gsm: '210gsm',
    texture: 'Kabartılı',
    color: 'White',
    composition: '50% Cotton, 50% α-Cellulose',
  },
  {
    no: '08',
    name: 'Torchon',
    surface: 'Mat',
    gsm: '285gsm',
    texture: 'Kabartılı',
    color: 'Bright White',
    composition: '100% α-Cellulose',
  },
  {
    no: '09',
    name: 'German Etching',
    surface: 'Mat',
    gsm: '310gsm',
    texture: 'Kabartılı',
    color: 'White',
    composition: '100% α-Cellulose',
  },
]

const heading = {
  fontFamily: "'Archivo Black', sans-serif",
  fontWeight: 400,
  color: 'var(--ink)',
}

const eyebrow = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: '.72rem',
  fontWeight: 500,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
}

const body = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: '.92rem',
  lineHeight: 1.7,
  color: 'var(--muted)',
}

const placeholderBox = (label) => (
  <div style={{
    width: '100%', height: '100%', minHeight: 220,
    background: 'var(--surface)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Archivo', sans-serif", fontSize: '.7rem',
    letterSpacing: '.05em', color: 'var(--muted)', textAlign: 'center', padding: '1rem'
  }}>
    {label}
  </div>
)

export default function FineArtBaski() {
  return (
    <div style={{ paddingTop: '4.2rem' }}>

      {/* Hero */}
      <section style={{
        position: 'relative', height: '58vh', minHeight: 380,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden'
      }}>
        <img
          src={heroImg}
          alt="Fine art baskı hazırlığı — eldivenli ellerle siyah-beyaz baskılar"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(17,17,17,.15), rgba(17,17,17,.55))'
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
          {/* TODO: bu eyebrow metni Readdy'de "MELTEMS ARI" olarak duruyordu —
              kasıtlı mı, yoksa yer tutucu mu, netleştirelim */}
          <p style={{ ...eyebrow, color: '#fff', opacity: .85, marginBottom: '1rem' }}>
            Meltems Arı
          </p>
          <h1 style={{ ...heading, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#fff', margin: '0 0 1rem' }}>
            Fine Art Baskı
          </h1>
          <p style={{ ...body, color: 'rgba(255,255,255,.85)', maxWidth: 520, margin: '0 auto' }}>
            Müze ve galeri standartlarında, arşiv kalitesinde baskı.
            Sanatınızı nesiller boyu yaşatın.
          </p>
        </div>
      </section>

      {/* Nedir? / Kimler için? / Özellikleri */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div>
          <p style={{ ...eyebrow, marginBottom: '.6rem' }}>01</p>
          <h2 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 .8rem' }}>Fine Art Baskı Nedir?</h2>
          <p style={body}>
            Fine art baskı, sanat ve fotoğraf eserlerini müze ve galeri standartlarında,
            uzun ömürlü ve yüksek kaliteyle çoğaltan bir baskı yöntemidir. Hahnemühle gibi
            %100 pamuklu fine art kağıtlara yapılan baskılar, detayları, ton geçişlerini
            ve dokuyu olağanüstü netlikte sunar.
          </p>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
          <p style={{ ...eyebrow, marginBottom: '.6rem' }}>02</p>
          <h2 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 .8rem' }}>Kimler ve Hangi İşler İçin Uygun?</h2>
          <p style={body}>
            Sanatçılar, fotoğrafçılar ve koleksiyonerler için idealdir. Portreler,
            manzaralar, soyut ve estetik odaklı tüm eserler fine art baskıyla değer kazanır.
          </p>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
          <p style={{ ...eyebrow, marginBottom: '.6rem' }}>03</p>
          <h2 style={{ ...heading, fontSize: '1.3rem', margin: '0 0 .8rem' }}>Özellikleri ve Kalitesi</h2>
          <ul style={{ ...body, margin: 0, paddingLeft: '1.2rem' }}>
            <li>Uzun ömürlü, asitsiz arşiv kağıdı</li>
            <li>Derin siyahlar ve hassas ton geçişleri</li>
            <li>Dokusal yüzey ve mükemmel renk doğruluğu</li>
            <li>Müze ve galeri sergileri için premium kalite</li>
          </ul>
        </div>
      </section>

      {/* Spesifikasyon tablosu */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 4rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Archivo', sans-serif", fontSize: '.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)' }}>
              {['Marka', 'Kağıt Adı', 'Yüzey', 'Gramaj', 'Doku', 'Renk', 'Kompozisyon'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '.7rem .6rem', color: 'var(--ink)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAPERS.map(p => (
              <tr key={p.no} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '.7rem .6rem', color: 'var(--muted)' }}>Hahnemühle</td>
                <td style={{ padding: '.7rem .6rem', color: 'var(--ink)' }}>{p.name}</td>
                <td style={{ padding: '.7rem .6rem', color: 'var(--muted)' }}>{p.surface}</td>
                <td style={{ padding: '.7rem .6rem', color: 'var(--muted)' }}>{p.gsm}</td>
                <td style={{ padding: '.7rem .6rem', color: 'var(--muted)' }}>{p.texture}</td>
                <td style={{ padding: '.7rem .6rem', color: 'var(--muted)' }}>{p.color}</td>
                <td style={{ padding: '.7rem .6rem', color: 'var(--muted)' }}>{p.composition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Örnek Baskılarımız */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <p style={{ ...eyebrow, textAlign: 'center', marginBottom: '1.5rem' }}>Örnek Baskılarımız</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
          <img src={ornekBotanikImg} alt="Botanik seri fine art baskı örneği" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <img src={ornekBotanik2Img} alt="Botanik seri fine art baskı, detay" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <img src={ornekDoku1Img} alt="Kağıt dokusu ve baskı örneği" style={{ width: '100%', height: 'auto', display: 'block' }} />
          <img src={ornekDoku2Img} alt="Kağıt dokusu ve baskı örneği" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* Kağıt seçenekleri — detaylı kartlar */}
      <section style={{ background: 'var(--surface)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto 3.5rem', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: '.6rem' }}>Kağıt Seçenekleri</p>
          <h2 style={{ ...heading, fontSize: '1.8rem', margin: '0 0 1rem' }}>Hahnemühle Fine Art Kağıtları</h2>
          <p style={body}>
            Her eser, kendine özgü bir yüzey gerektirir. Aşağıda sunduğumuz Hahnemühle
            kağıt seçeneklerini keşfedin ve sanatınıza en uygun zemini bulun.
          </p>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto 3.5rem' }}>
          <img
            src={kagitSecenekleriImg}
            alt="Hahnemühle fine art kağıt numuneleri"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
          {PAPERS.map(p => (
            <div key={p.no}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.2rem' }}>
                <span style={{ ...heading, fontSize: '2.2rem', color: 'var(--border)' }}>{p.no}</span>
                <div>
                  <h3 style={{ ...heading, fontSize: '1.4rem', margin: 0 }}>{p.name}</h3>
                  <p style={{ ...body, fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase', margin: '.3rem 0 0' }}>
                    {p.gsm} · {p.composition} · {p.color} · {p.surface}
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ aspectRatio: '4/3' }}>{placeholderBox('Kağıt dokusu yakın çekim')}</div>
                <div style={{ aspectRatio: '4/3' }}>{placeholderBox('Baskı önizlemesi')}</div>
              </div>
              {p.description && <p style={body}>{p.description}</p>}
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}