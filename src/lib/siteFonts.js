// src/lib/siteFonts.js
// Admin panelden seçilen font çiftini siteye uygular.
// Yeni bir hazır çift eklemek istersen FONT_PRESETS'e bir satır eklemen yeterli —
// admin panelin "Site Ayarları" sekmesinde otomatik olarak seçilebilir hale gelir.

export const FONT_PRESETS = {
  archivo: {
    label: 'Archivo (şu anki)',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Archivo+Black&display=swap',
    body: "'Archivo', sans-serif",
    heading: "'Archivo Black', sans-serif",
  },
  playfair_inter: {
    label: 'Playfair Display + Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600&display=swap',
    body: "'Inter', sans-serif",
    heading: "'Playfair Display', serif",
  },
  cormorant_dm: {
    label: 'Cormorant Garamond + DM Sans (eski Fossil Garden)',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500&display=swap',
    body: "'DM Sans', sans-serif",
    heading: "'Cormorant Garamond', serif",
  },
  garamond_work: {
    label: 'EB Garamond + Work Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&family=Work+Sans:wght@400;500;600&display=swap',
    body: "'Work Sans', sans-serif",
    heading: "'EB Garamond', serif",
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