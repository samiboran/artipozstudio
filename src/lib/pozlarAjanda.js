// POZLAR — AJANDA (önizleme verisi, 19 Kasım 2026'da derlendi)
// Her kayıt kendi cümlemizle tek satır + kaynağa link. Haber metni kopyalanmaz.
// Gerçek sürümde Supabase'de "ajanda" tablosu olacak; haftalık taslak liste
// Claude tarafından hazırlanıp Sami'nin onayıyla yayına girecek.
// bitis boşsa tek günlük; baslangic bilinmiyorsa null (sadece bitiş gösterilir).
export const ETIKETLER = ['Sergi', 'Gösterim', 'Festival', 'Atölye', 'Film/Ürün']

export const AJANDA = [
  {
    id: 'manuel-citak', etiket: 'Sergi',
    baslik: 'Manuel Çıtak: Kendine Ait Bir Ada',
    yer: 'İstanbul Modern · Fotoğraf Galerisi', baslangic: '2026-11-05', bitis: '2027-05-23',
    ozet: 'Fotoğrafçının 1980\'lerden 2023\'e uzanan kırk yılı aşkın üretiminden kapsamlı bir seçki.',
    kaynak: 'https://indigodergisi.com/2026/11/manuel-citak-kendine-ait-bir-ada/', kaynakAd: 'Indigo Dergisi',
  },
  {
    id: 'ara-guler-leica', etiket: 'Sergi',
    baslik: 'Ara Güler – Master of Leica',
    yer: 'Ara Güler Müzesi · Bomontiada', baslangic: null, bitis: '2027-04-18',
    ozet: 'Ara Güler\'in Leica ile geçen kariyeri: dergi fotoğrafları, makineleri ve mektupları dört galeride.',
    kaynak: 'https://www.dailysabah.com/arts/events/ara-gulers-leica-journey-explored-in-new-istanbul-exhibition', kaynakAd: 'Daily Sabah',
  },
  {
    id: 'cumhuriyetin-kamera-arkasi', etiket: 'Sergi',
    baslik: 'Cumhuriyetin Kamera Arkası',
    yer: 'Pera Müzesi', baslangic: null, bitis: '2027-03-28',
    ozet: 'İstanbul\'da erken Cumhuriyet dönemi basın fotoğrafçılığı üzerine bir sergi.',
    kaynak: 'https://www.forbes.com.tr/forbes-life/pera-muzesi-nde-cumhuriyetin-kamera-arkasi-geride-kalan-fotograflar', kaynakAd: 'Forbes Türkiye',
  },
  {
    id: 'ifsak-67', etiket: 'Sergi',
    baslik: 'İFSAK: İlk Adım / Nefes / Gönül',
    yer: 'Bulgur Palas · ücretsiz', baslangic: null, bitis: '2027-02-21',
    ozet: 'İFSAK\'ın 67. yılı: dernek arşivinden üyelerin ve destekçi fotoğrafçıların işleri.',
    kaynak: 'https://tr.euronews.com/2026/10/21/ifsakin-67-yillik-fotograf-birikimi-bulgur-palasta-sergileniyor', kaynakAd: 'Euronews',
  },
  {
    id: 'kibris-osmanli', etiket: 'Sergi',
    baslik: 'Kıbrıs\'ta Osmanlı İzleri',
    yer: 'AKM Galeri', baslangic: '2026-11-15', bitis: '2026-11-24',
    ozet: 'Osmanlı dönemi Kıbrıs\'ından nadir tarihi fotoğraflar.',
    kaynak: 'https://www.turkiyetoday.com/culture/rare-ottoman-era-photos-of-cyprus-to-go-on-display-in-istanbul-3232308', kaynakAd: 'Türkiye Today',
  },
  {
    id: 'futurescope', etiket: 'Gösterim',
    baslik: 'FutureScope Kısa Film Festivali',
    yer: 'İstanbul Gelişim Üniversitesi', baslangic: '2026-11-17', bitis: '2026-11-19',
    ozet: 'Kurmaca, belgesel, deneysel ve animasyon kısa filmler; tema "Geleceğe Bakış".',
    kaynak: 'https://filmfreeway.com/IGUGelecekKapsam', kaynakAd: 'FilmFreeway',
  },
  {
    id: 'kisadan-hisse', etiket: 'Gösterim',
    baslik: 'Kısa\'dan Hisse Kısa Film Festivali (11.)',
    yer: 'İstanbul', baslangic: '2026-11-21', bitis: '2026-11-28',
    ozet: 'Türkiye\'de kısa film üretimini destekleyen festivalin 11. edisyonu.',
    kaynak: 'https://www.gzt.com/sinema/11-kisadan-hisse-kisa-film-festivali-basvurulari-acildi-4235223', kaynakAd: 'GZT',
  },
  {
    id: 'istanbul-film-festivali-46', etiket: 'Festival',
    baslik: '46. İstanbul Film Festivali',
    yer: 'İstanbul · İKSV', baslangic: '2027-04-08', bitis: '2027-04-18',
    ozet: 'Altın Lale, Yeni Bakışlar ve Kısa Film Yarışması ile.',
    kaynak: 'https://www.evrensel.net/haber/6007572/46-istanbul-film-festivali-8-18-nisan-2027de-duzenlenecek', kaynakAd: 'Evrensel',
  },
  {
    id: 'deneysel-film-8', etiket: 'Gösterim',
    baslik: '8. İstanbul Uluslararası Deneysel Film Festivali',
    yer: 'İstanbul', baslangic: '2027-05-25', bitis: '2027-06-30',
    ozet: 'Deneysel kısa filmler; önceki edisyonlarda Salt Beyoğlu gibi mekânlarda gösterimler.',
    kaynak: 'https://www.festivalfinder.eu/festivals/8th-istanbul-international-experimental-film-festival', kaynakAd: 'Festival Finder',
  },
]
