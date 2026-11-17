// Supabase `page_images` tablosundaki site görsellerini (Admin → Görseller'den
// yüklenmiş, çoğu 1–3 MB'lık ham PNG) indirip WebP'ye çevirir ve
// public/images/site/ altına yazar. Orijinal URL → yerel yol eşlemesini
// src/lib/optimized-images.json'a kaydeder; site `optImg()` ile bunu kullanır.
//
// Supabase'deki dosyalara DOKUNMAZ (yedek olarak kalırlar). Zaten çevrilmiş
// görselleri tekrar indirmez. Sharp gerekir: `npm i --no-save sharp`.
// GitHub Actions deploy workflow'u bunu her deploy'da otomatik çalıştırır.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_ANON_KEY
if (!URL || !KEY) { console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY gerekli'); process.exit(1) }

const OUT_DIR = 'public/images/site'
const MAP_FILE = 'src/lib/optimized-images.json'
const MAX_WIDTH = { hero: 2000, 'hero-mobile': 1000 }   // section'a göre; diğerleri 1600
const DEFAULT_MAX = 1600

fs.mkdirSync(OUT_DIR, { recursive: true })
const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {}

const res = await fetch(`${URL}/rest/v1/page_images?select=page,section,image_url`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
})
if (!res.ok) { console.error('page_images okunamadı:', res.status, await res.text()); process.exit(1) }
const rows = await res.json()
console.log(`${rows.length} page_images satırı`)

let done = 0, skipped = 0, before = 0, after = 0
for (const { page, section, image_url } of rows) {
  if (!image_url || !image_url.includes('/storage/v1/object/public/')) { skipped++; continue }
  // Zaten WebP olanlar (Admin'in sıkıştırdıkları, hero'lar) tekrar sıkıştırılmaz —
  // ikinci kez kayıplı sıkıştırma görünür kalite kaybı yapıyordu (Fitz Roy hero'su).
  if (/\.webp($|\?)/i.test(image_url)) { skipped++; continue }
  const name = path.basename(new globalThis.URL(image_url).pathname).replace(/\.[^.]+$/, '') + '.webp'
  const outPath = path.join(OUT_DIR, name)
  const publicPath = `/images/site/${name}`
  if (map[image_url] === publicPath && fs.existsSync(outPath)) { skipped++; continue }

  const r = await fetch(image_url)
  if (!r.ok) { console.warn(`  ! indirilemedi (${r.status}): ${image_url}`); continue }
  const buf = Buffer.from(await r.arrayBuffer())
  const maxW = MAX_WIDTH[section] || DEFAULT_MAX
  const out = await sharp(buf).rotate().resize({ width: maxW, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer()

  // Küçültme kazanç sağlamıyorsa (zaten küçük bir webp) orijinali kullan.
  if (out.length >= buf.length) { skipped++; continue }
  fs.writeFileSync(outPath, out)
  map[image_url] = publicPath
  before += buf.length; after += out.length; done++
  console.log(`  ${page}/${section}: ${(buf.length / 1024).toFixed(0)} KB → ${(out.length / 1024).toFixed(0)} KB  ${name}`)
}

fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + '\n')
console.log(`Bitti: ${done} yeni görsel (${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB), ${skipped} atlandı`)
