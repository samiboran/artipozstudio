// src/lib/heroOverlay.js
// Tüm sayfa hero'larındaki koyu katman (overlay gradient) tek bir yerden
// yönetilir — önceden her sayfa kendi değerini tekrarlıyordu ve aralarında
// belirgin fark vardı (Ana Sayfa hafif, diğer sayfalar çok daha koyuydu).
// Ana Sayfa'nın hafif değeri referans alındı: sadece alt kısımda, metin
// okunabilirliği için yeterli hafif bir karartma.
export const HERO_OVERLAY_GRADIENT = 'linear-gradient(180deg, rgba(17,17,17,0) 55%, rgba(17,17,17,.2) 100%)'
