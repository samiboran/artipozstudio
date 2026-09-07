// TEK yer: canlı site adresi. Hem Seo.jsx (OG/canonical) hem
// scripts/prerender.mjs (sitemap) aynı sabiti kullanır — burada JSX
// olmayan düz bir dosyada olması bilinçli: prerender.mjs bunu doğrudan
// Node'da import edebiliyor (JSX içeren bir dosyayı Node parse edemez).
export const SITE_URL = 'https://artipozstudio.com'
