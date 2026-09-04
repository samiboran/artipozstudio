// src/lib/siteFonts.js
// Admin panelden seçilen font çiftini siteye uygular.
// Yeni bir hazır çift eklemek istersen FONT_PRESETS'e bir satır eklemen yeterli —
// admin panelin "Site Ayarları" sekmesinde otomatik olarak seçilebilir hale gelir.

// Sami'nin kararı: sitede serif YOK, tek bir modern sans-serif aile
// (Archivo) — başlıklar dahil. Eskiden burada Playfair Display / Cormorant
// Garamond / EB Garamond gibi serif seçenekler de vardı (admin'den
// değiştirilebiliyordu); tutarsız görünüme yol açtığı için kaldırıldı.
// Not: heading da body ile AYNI Archivo ailesi — "Archivo Black" ayrı bir
// font (yalnızca 900 ağırlık, fontWeight ile incelemiyor) olduğu için
// önceden tüm başlıklar gereğinden kalın görünüyordu; bu artık düzeltildi,
// ağırlık artık her başlığın kendi fontWeight'ıyla gerçek anlamda kontrol
// ediliyor (bkz. sayfalardaki heading sabitleri, çoğu 600).
// Archivo'nun geniş ağırlık + italik aralığı yüklü (300-700 + italik),
// context'e göre (örn. vurgu için italik, ince metin için 300) kullanılabilir.
export const FONT_PRESETS = {
  archivo: {
    label: 'Archivo (tek sistem)',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap',
    body: "'Archivo', sans-serif",
    heading: "'Archivo', sans-serif",
  },
}

const LINK_ID = 'site-font-link'

// App açılışında (App.jsx içinde) bir kere çağrılır. site_settings'teki font_pair'i
// okuyup <head>'e Google Fonts <link>'ini ekler ve --font-body / --font-heading
// CSS değişkenlerini ayarlar. global.css bu değişkenleri kullanıyor.
export async function applySiteFont(supabase) {
  try {
    const { data } = await supabase.from('site_settings').select('font_pair').eq('id', 'default').single()
    const key = data?.font_pair && FONT_PRESETS[data.font_pair] ? data.font_pair : 'archivo'
    setFont(key)
  } catch {
    setFont('archivo')
  }
}

export function setFont(key) {
  const preset = FONT_PRESETS[key] || FONT_PRESETS.archivo

  let link = document.getElementById(LINK_ID)
  if (!link) {
    link = document.createElement('link')
    link.id = LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = preset.googleFontsUrl

  document.documentElement.style.setProperty('--font-body', preset.body)
  document.documentElement.style.setProperty('--font-heading', preset.heading)
}