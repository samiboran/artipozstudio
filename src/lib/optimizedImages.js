// Supabase'deki ham site görsellerinin (page_images) repoya alınmış,
// WebP'ye çevrilmiş kopyaları. Eşleme scripts/optimize-site-images.mjs
// tarafından üretilir (GitHub Actions deploy'unda otomatik çalışır).
// Eşlemede olmayan bir URL (ör. yeni yüklenmiş bir görsel) olduğu gibi döner.
import MAP from './optimized-images.json'

export const optImg = url => (url && MAP[url]) || url

// page_images satır dizisini (image_url alanıyla) optimize edilmiş URL'lerle döndürür.
export const optRows = rows => rows?.map(r => ({ ...r, image_url: optImg(r.image_url) }))
