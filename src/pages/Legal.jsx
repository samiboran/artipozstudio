import { useParams, Link } from 'react-router-dom'

// ==============================================================
// ÖNEMLİ: Köşeli parantezli [ALANLARI] kendi bilgilerinle doldur.
// Bu metinler şablondur, hukuki danışmanlık yerine geçmez.
// Şirket kurulunca bir avukata kontrol ettirmen önerilir.
// ==============================================================

const SELLER = {
  name: 'Artı Poz Studio',
  email: 'info@artipozstudio.com',
  phone: '[TELEFON]',
}

const PAGES = {
  'mesafeli-satis': {
    title: 'Mesafeli Satış Sözleşmesi',
    sections: [
      ['1. Taraflar', `SATICI: ${SELLER.name}, ${SELLER.email}. ALICI: Sipariş formunda bilgileri yer alan kişi. İşbu sözleşme, ALICI'nın Artı Poz üzerinden sipariş verdiği ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.`],
      ['2. Sözleşme Konusu Ürün', `Ürünün türü, adedi, ebadı ve satış bedeli sipariş özetinde belirtildiği gibidir. Eserler fine art baskı veya orijinal eser niteliğindedir.`],
      ['3. Teslimat', `Ürünler, sipariş onayını takiben en geç 30 gün içinde, taahhüt edilen sürede (olağan koşullarda 3–5 iş günü) ALICI'nın bildirdiği adrese teslim edilir; teslimat, istek doğrultusunda sigortalı kargo ile yollanabilir.`],
      ['4. Cayma Hakkı', `ALICI, ürünü teslim aldığı tarihten itibaren 14 gün içinde hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma bildirimi ${SELLER.email} adresine yazılı olarak yapılmalıdır. İade edilen ürünün, teslim edildiği haliyle, hasarsız ve orijinal ambalajında gönderilmesi gerekir. Kişiye özel üretilen (özel ölçü, özel çerçeve vb.) ürünlerde cayma hakkı bulunmamaktadır.`],
      ['5. Bedel İadesi', `Cayma hakkının kullanılması halinde, ürünün SATICI'ya ulaşmasını takiben 14 gün içinde ödenen bedel ALICI'ya iade edilir.`],
      ['6. Uyuşmazlıklar', `İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri, üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.`],
    ],
  },
  'iade': {
    title: 'İade & Değişim Koşulları',
    sections: [
      ['14 Gün Koşulsuz İade', `Teslim aldığınız eseri, teslim tarihinden itibaren 14 gün içinde koşulsuz olarak iade edebilirsiniz. İade talebinizi ${SELLER.email} adresine, sipariş numaranızla birlikte iletin.`],
      ['İade Şartları', `Eserin hasarsız, teslim edildiği haliyle ve orijinal ambalajında (silindir/kutu, köşe korumaları) gönderilmesi gerekir. Sertifika eserle birlikte iade edilmelidir.`],
      ['Hasarlı Teslimat', `Kargo tesliminde paketi kontrol edin. Gözle görülür hasar varsa kargo görevlisine tutanak tutturun ve aynı gün bize fotoğraflarıyla bildirin. Hasarlı ürünler ücretsiz olarak yenisiyle değiştirilir.`],
      ['Özel Üretim', `Kişiye özel ölçü veya özel çerçeve ile üretilen eserlerde, yasa gereği cayma hakkı bulunmamaktadır.`],
      ['İade Süreci', `İade talebiniz onaylandıktan sonra anlaşmalı kargo kodu gönderilir. Eser bize ulaştıktan sonra 14 gün içinde ödemeniz iade edilir.`],
    ],
  },
  'gizlilik': {
    title: 'Gizlilik ve Kişisel Verilerin Korunması (KVKK)',
    sections: [
      ['Veri Sorumlusu', `6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu: ${SELLER.name}.`],
      ['Toplanan Veriler', `Sipariş sürecinde ad soyad, e-posta, telefon ve teslimat adresi bilgileriniz toplanır. Sitede ödeme bilgisi (kart numarası vb.) toplanmaz ve saklanmaz.`],
      ['İşleme Amacı', `Verileriniz yalnızca siparişinizin oluşturulması, teslimatın sağlanması ve sizinle sipariş hakkında iletişim kurulması amacıyla işlenir. Pazarlama amaçlı kullanılmaz, üçüncü taraflarla paylaşılmaz (teslimat için kargo firmasına iletilen ad-adres-telefon bilgisi hariç).`],
      ['Saklama', `Veriler, yasal saklama süreleri boyunca güvenli sunucularda (Supabase) saklanır.`],
      ['Haklarınız', `KVKK m.11 kapsamında verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme hakkına sahipsiniz. Talepleriniz için ${SELLER.email} adresine yazabilirsiniz.`],
    ],
  },
  'teslimat': {
    title: 'Teslimat Bilgileri',
    sections: [
      ['Hazırlama Süresi', `Fine art baskılar sipariş üzerine üretilir. Baskı ve kalite kontrol süreci 1–3 iş günü sürer.`],
      ['Kargo Süresi', `Yurt içi teslimat, kargoya verildikten sonra 1–3 iş günüdür. Toplam teslim süresi olağan koşullarda 3–5 iş günüdür.`],
      ['Ambalaj', `Baskılar asit içermeyen koruyucu kâğıda sarılır; sert silindir veya düz kutu ile, köşe korumalarıyla, istek doğrultusunda sigortalı olarak gönderilebilir.`],
      ['Kargo Ücreti', `Kargo ücreti sipariş özetinde belirtilir.`],
      ['Takip', `Siparişiniz kargoya verildiğinde e-posta ile takip numarası gönderilir.`],
    ],
  },
}

function Legal() {
  const { page } = useParams()
  const doc = PAGES[page]

  if (!doc) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--muted)' }}>
      Sayfa bulunamadı
    </div>
  )

  return (
    <div style={{ paddingTop: '4.2rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3.5rem 2rem 6rem' }}>
        {/* Site genelindeki diğer sayfa başlıklarıyla (About.jsx vb.) aynı
            font ve renk — önceden eski Archivo Black/ince stildeydi. */}
        <h1 style={{
          fontFamily: 'var(--font-heading)', color: 'var(--blue)',
          fontSize: '2.2rem', fontWeight: 600, marginBottom: '2rem'
        }}>
          {doc.title}
        </h1>

        {doc.sections.map(([heading, text]) => (
          <div key={heading} style={{ marginBottom: '1.8rem' }}>
            <div style={{ fontSize: '.68rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '.5rem' }}>
              {heading}
            </div>
            <p style={{ fontSize: '.82rem', lineHeight: 1.9, color: '#444', margin: 0 }}>
              {text}
            </p>
          </div>
        ))}

        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(PAGES).filter(([k]) => k !== page).map(([k, v]) => (
            <Link key={k} to={`/yasal/${k}`} style={{ fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              {v.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Legal
