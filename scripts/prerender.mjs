#!/usr/bin/env node
// `vite build` sonrası (npm'in otomatik "postbuild" adımı olarak) çalışır.
// dist/ zaten normal SPA build'i — bu script her hedef route'u yerel bir
// statik sunucuda gerçek bir tarayıcıda (headless Chromium) açıp, sayfa
// GERÇEKTEN render olduktan sonra tam HTML'i dist/<route>/index.html'e
// yazar. Google/ChatGPT/Perplexity gibi JS çalıştırmayan botlar bu statik
// HTML'i görür; gerçek kullanıcılar için hiçbir şey değişmiyor (React
// normal şekilde mount olup devam ediyor).
//
// KRİTİK KURAL: "networkidle" gibi belirsiz bir sinyal beklenmiyor — her
// sayfa kendi kök elemanına canlı veri geldiğinde data-prerender-ready="true"
// yazıyor (bkz. ilgili sayfa bileşenleri). Bu görünmeden ASLA snapshot
// alınmaz; süre aşımında script HATA ile durur (sessizce boş/eksik bir
// HTML yazıp devam etmez) — build bu şekilde başarısız olur, kötü bir
// prerender asla deploy edilmez.

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '../src/lib/siteUrl.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PORT = 4321
const BASE_URL = `http://127.0.0.1:${PORT}`

// Ürün detayları hariç, sabit route listesi.
const STATIC_ROUTES = [
  '/', '/isler', '/fine-art-baski', '/fotograf-baski', '/cerceve',
  '/film-yikama-tarama', '/hakkimizda',
]

// Legal.jsx'teki PAGES sabitiyle BİREBİR aynı olmalı — burada ayrıca
// tanımlı çünkü bu sayfaların içeriği DB'de değil, kod içinde.
const LEGAL_PAGES = ['mesafeli-satis', 'iade', 'gizlilik', 'teslimat']

// Kullanıcıya özel/oturuma bağlı route'lar — ASLA prerender edilmez.
// (App.jsx'teki tam liste: /admin, /login, /kayit, /sifre-sifirla,
// /siparislerim, /favoriler — burada ayrıca kod olarak yok, çünkü bunlar
// zaten yukarıdaki listelere hiç eklenmiyor. Bu yorum sadece bilinçli bir
// dışlama olduğunu belgeliyor.)

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.json': 'application/json',
  '.txt': 'text/plain', '.xml': 'application/xml', '.woff2': 'font/woff2',
}

async function fileExists(p) {
  try { await stat(p); return true } catch { return false }
}

// dist/'i statik olarak servis eden basit bir sunucu — bilinen bir dosya
// varsa onu, yoksa (SPA navigasyonu varsayımıyla) ORİJİNAL (bozulmamış) SPA
// kabuğunu döner. Bu, GitHub Pages'teki gerçek 404.html→index.html
// yönlendirmesinin yerel eşdeğeri; sadece Playwright'ın doğru sayfayı
// render edebilmesi için var.
//
// KRİTİK: pristineShell, döngü başlamadan ÖNCE bir kere diskten okunup
// belleğe alınıyor ve buradan sonra HİÇ diskten tekrar okunmuyor. Çünkü
// "/" route'u (listede ilk sırada) işlendiğinde dist/index.html'in kendisi
// tam render edilmiş Ana Sayfa çıktısıyla ÜZERİNE YAZILIYOR — eğer kabuk
// her istekte diskten okunsaydı, "/"den SONRAKİ her route bu artık kirlenmiş
// (Ana Sayfa'nın title/meta/OG/içeriğini taşıyan) dosyayı "boş kabuk" sanıp
// kullanır, Helmet kendi etiketlerini bunun YANINA eklerdi — tekilleştirme
// bug'ının ikinci (ve asıl telafi edici) nedeni buydu.
function startServer(pristineShell) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0])
      const hasExt = path.extname(urlPath) !== ''

      if (!hasExt) {
        // Navigasyon isteği: bu path için önceden yazılmış bir
        // <route>/index.html varsa onu, yoksa bellekteki orijinal SPA
        // kabuğunu (diskten değil) döner.
        const asIndex = path.join(DIST, urlPath, 'index.html')
        if (await fileExists(asIndex)) {
          res.writeHead(200, { 'Content-Type': MIME['.html'] })
          createReadStream(asIndex).pipe(res)
        } else {
          res.writeHead(200, { 'Content-Type': MIME['.html'] })
          res.end(pristineShell)
        }
        return
      }

      const filePath = path.join(DIST, urlPath)
      if (!(await fileExists(filePath))) {
        res.writeHead(404); res.end('Not found'); return
      }
      const ext = path.extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      createReadStream(filePath).pipe(res)
    })
    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

async function fetchProductSlugs() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tanımlı değil — prerender ürün slug\'larını çekemez.')
  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('artworks').select('slug, title, image_url')
  if (error) throw new Error('Ürün slug\'ları çekilemedi: ' + error.message)
  // Gallery.jsx'teki "Fine Art Seçkisi" vitriniyle aynı kalite eşiği —
  // başlığı/görseli olmayan yarım kalmış kayıtlar prerender edilmez.
  return (data || []).filter(a => a.slug && a.title?.trim() && a.image_url).map(a => a.slug)
}

async function snapshotRoute(page, route) {
  const url = `${BASE_URL}${route}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  try {
    await page.waitForSelector('[data-prerender-ready="true"]', { timeout: 15000 })
  } catch {
    throw new Error(
      `PRERENDER BAŞARISIZ: "${route}" — [data-prerender-ready="true"] 15 saniyede görünmedi.\n` +
      `Bu, canlı veri çekiminin bitmediği/hata verdiği ya da sayfanın işaretleyiciyi hiç yazmadığı anlamına gelir.\n` +
      `Boş/eksik bir snapshot deploy edilmesin diye build burada durduruluyor.`
    )
  }
  const html = await page.content()
  const outPath = route === '/'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, route.replace(/^\//, ''), 'index.html')
  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, html, 'utf-8')
  console.log(`✓ ${route} → ${path.relative(ROOT, outPath)}`)
}

// robots.txt'teki Sitemap satırının işaret ettiği dosya — elle yazılmıyor,
// aynı route listesinden (ürünler dahil) otomatik üretiliyor ki bir ürün
// eklendiğinde/kaldırıldığında unutulmasın.
async function writeSitemap(routes) {
  const urls = routes.map(route => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  await writeFile(path.join(DIST, 'sitemap.xml'), xml, 'utf-8')
  console.log(`✓ sitemap.xml → ${routes.length} URL`)
}

async function main() {
  if (!(await fileExists(DIST))) throw new Error('dist/ bulunamadı — önce `vite build` çalışmalı.')

  const productSlugs = await fetchProductSlugs()
  const routes = [
    ...STATIC_ROUTES,
    ...LEGAL_PAGES.map(p => `/yasal/${p}`),
    ...productSlugs.map(s => `/product/${s}`),
  ]

  // "/" işlenince dist/index.html üzerine yazılacağı için orijinal kabuğu
  // döngü başlamadan ÖNCE belleğe alıyoruz (bkz. startServer üstündeki not).
  const pristineShell = await readFile(path.join(DIST, 'index.html'), 'utf-8')
  const server = await startServer(pristineShell)
  // PLAYWRIGHT_CHROMIUM_PATH sadece belirli sandbox/CI ortamlarında (önceden
  // indirilmiş bir Chromium'a işaret etmek için) ayarlanır — normalde
  // (kullanıcının kendi makinesinde) tanımlı değildir ve Playwright kendi
  // yönettiği (`npx playwright install chromium` ile kurulan) tarayıcıyı
  // otomatik bulur.
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}),
    })
  } catch (err) {
    server.close()
    throw new Error(
      'Chromium başlatılamadı. Muhtemelen Playwright\'ın tarayıcısı henüz kurulmamış.\n' +
      'Şunu bir kere çalıştır: npx playwright install chromium\n\n' +
      'Orijinal hata: ' + err.message
    )
  }
  try {
    const page = await browser.newPage()
    for (const route of routes) {
      await snapshotRoute(page, route)
    }
  } finally {
    await browser.close()
    server.close()
  }

  await writeSitemap(routes)

  console.log(`\nPrerender tamamlandı — ${routes.length} route.`)
}

main().catch((err) => {
  console.error('\n' + err.message)
  process.exit(1)
})
