// POZLAR · Öğren — deneysel film teknikleri rehberi.
// Kaynak doküman: "Deneysel Teknikler — Rehber" (Claude Docs).
// Görsel kuralı: telifi bitmiş görseller kaynakçasıyla konur, telifi
// sürenlere sadece link verilir. Şimdilik sadece açıklama + linkler.

export const ALANLAR = ['Banyo', 'Çekim', 'Karanlık oda']

export const TEKNIKLER = [
  {
    id: 'caffenol',
    ad: 'Caffenol',
    alt: 'Kahveyle siyah-beyaz banyo',
    alan: 'Banyo',
    zorluk: 'Kolay',
    ozet: 'Hazır kahve, çamaşır sodası ve C vitamininden yapılan, evde hazırlanan bir siyah-beyaz banyo. Hafif sıcak tonlu, grenli, karakterli negatifler verir.',
    malzeme: [
      '1000 ml su (20 °C)',
      '24 g susuz çamaşır sodası (kristal soda ise 65 g; karbonat değil)',
      '20 g C vitamini tozu (askorbik asit)',
      '45 g hazır kahve (en ucuzu da olur)',
    ],
    adimlar: [
      'Kahveyi ve sodayı ayrı ayrı suyun bir kısmında çöz, birleştir; C vitaminini en son ekle.',
      'Karışımı 5 dakika dinlendir.',
      '20 °C\'de 9–11 dakika banyo et: ilk 30 saniye sürekli, sonra her dakika 10 saniye çevir.',
      'Su ile durdur, normal fiksaj ve yıkama.',
    ],
    not: 'Fiksaj gerçek kimyasal ister. İlk denemede ISO 100–400 bir filmle başla.',
    linkler: [
      { ad: 'caffenol.org — tarifler', url: 'https://caffenol.org/recipes/' },
      { ad: '35mmc — Caffenol for Breakfast', url: 'https://www.35mmc.com/25/07/2021/caffenol-for-breakfast-my-first-experiments-with-homemade-developer-by-steven-bleistein/' },
      { ad: 'Field Mag — Kahveyle film banyosu', url: 'https://www.fieldmag.com/articles/how-to-develop-film-with-coffee-caffenol-guide' },
    ],
  },
  {
    id: 'stand',
    ad: 'Stand development',
    alt: 'Bekleterek banyo',
    alan: 'Banyo',
    zorluk: 'Kolay',
    ozet: 'Çok seyreltik banyoyu tanka koyup başta karıştırmak, sonra filmi uzun süre kendi haline bırakmak. Yumuşak tonlu, keskin kenarlı negatifler; farklı ISO\'da çekilmiş filmler aynı tankta banyo edilebilir.',
    malzeme: [
      'Rodinal / R09 One Shot, 1+100 seyreltme (1 ml + 100 ml su)',
      'Siyah-beyaz film, tank, stop ve fiksaj',
      'Rulo başına en az ~5 ml konsantre (gerekirse büyük tank)',
    ],
    adimlar: [
      'Filmi 5 dakika suyla ön ıslat.',
      'Banyoyu koy, ilk 1 dakika sürekli çevir.',
      '60 dakika dokunmadan beklet (yarı-stand: 30. dakikada 2 yavaş çevirme).',
      'Su ile durdur, normal fiksaj ve yıkama.',
    ],
    not: 'Hiç karıştırmamak "bromür izi" çizgileri bırakabilir. Negatifler çok yoğunsa 1+150 ya da 1+200 dene.',
    linkler: [
      { ad: 'Mr Leica — Rodinal Stand Development', url: 'https://mrleica.com/rodinal-stand-development/' },
      { ad: 'Film Photography Project — Stand developing', url: 'https://filmphotographyproject.com/stand-developing-bw-photos-use-best-results-tips/' },
      { ad: 'Parallax — How to stand develop film', url: 'https://parallaxphotographic.coop/how-to-stand-develop-film/' },
      { ad: 'filmdev.org — Rodinal 1:100 tarifleri', url: 'https://filmdev.org/recipe/show/9929' },
    ],
  },
  {
    id: 'push-pull',
    ad: 'Push / pull',
    alt: 'Filmi zorlamak ya da gevşetmek',
    alan: 'Çekim',
    zorluk: 'Kolay',
    ozet: 'Filmi kutudaki ISO\'dan farklı pozlayıp banyo süresini buna göre değiştirmek. Push: az ışıkta yüksek ISO, uzun banyo, daha çok kontrast ve gren. Pull: düşük ISO, kısa banyo, yumuşak kontrast.',
    malzeme: [
      'Herhangi bir film, ISO\'yu elle ayarlanabilen bir makine',
      'Evde banyo ya da push/pull yapan bir laboratuvar',
    ],
    adimlar: [
      'Ruloyu baştan sona aynı ISO\'da çek (ör. 400\'lük filmi 1600\'de = 2 stop push).',
      'Kasetin üzerine "+2" ya da "-1" yaz.',
      'Evde: film ve banyo için push/pull süresine bak (Massive Dev Chart). Laboratuvar: sipariş formuna yaz.',
    ],
    not: 'Bazı laboratuvarlar push/pull için ek ücret alır.',
    linkler: [
      { ad: 'Parallax — Pushing and pulling film', url: 'https://parallaxphotographic.coop/guide-to-pushing-and-pulling-film/' },
      { ad: 'Analog.Cafe — Push & pull başlangıç rehberi', url: 'https://www.analog.cafe/r/a-beginners-guide-to-push-and-pull-film-development-t6r8' },
      { ad: 'Richard Photo Lab — Ultimate guide', url: 'https://www.richardphotolab.com/blog/post/pushing-and-pulling-film-the-ultimate-guide' },
      { ad: 'Kodak — Push / pull processing', url: 'https://www.kodak.com/en/motion/page/push-pull-processing' },
    ],
  },
  {
    id: 'cross',
    ad: 'Cross-processing',
    alt: 'Dia filmi negatif kimyasında',
    alan: 'Banyo',
    zorluk: 'Orta',
    ozet: 'Filmi kendi kimyası yerine "yanlış" kimyada banyo etmek; en yaygını dia (E-6) filmini C-41\'de. Çok doygun, kaymış renkler, yüksek kontrast, belirgin gren.',
    malzeme: [
      'Bir rulo dia filmi (tarihi geçmiş de olur)',
      'C-41 kiti ya da cross-process kabul eden bir laboratuvar',
    ],
    adimlar: [
      'Normal çek (bazıları 1 stop az pozlamayı öneriyor).',
      'C-41 süresine yaklaşık 1 stop push kadar (~30 sn) ekle.',
      'Normal ağartıcı, fiksaj, stabilizatör.',
      'Taramada güçlü camgöbeği tonu istediğin yöne kaydır.',
    ],
    not: 'Tersi de var: C-41 filmi E-6\'da banyo etmek turuncu, soluk renkler verir.',
    linkler: [
      { ad: 'Neil van Niekerk — Cross-processing', url: 'https://neilvn.com/tangents/cross-processing/' },
      { ad: 'Fulltone — The Art of Cross Processing', url: 'https://fulltonephoto.pixfizz.com/site/blog/The-Art-of-Cross-Processing-Film' },
      { ad: '35mmc — Dia filmini E-6 olmadan banyo etmek', url: 'https://www.35mmc.com/?p=48775' },
    ],
  },
  {
    id: 'redscale',
    ad: 'Redscale',
    alt: 'Filmi ters yüzünden çekmek',
    alan: 'Çekim',
    zorluk: 'Orta',
    ozet: 'Renkli negatif filmi kasete ters sarıp ışığın önce film tabanından geçmesini sağlamak. Kareler kırmızı, turuncu, sarı tonlarda çıkar; fazla pozladıkça sarıya kayar.',
    malzeme: [
      'Renkli negatif 35mm film (C-41)',
      'Ucu dışarıda kalmış boş kaset, makas, bant',
      'Karanlık oda ya da film değiştirme torbası',
    ],
    adimlar: [
      'Karanlıkta filmi kasetinden tamamen çek, dipten düz kes.',
      'Kesik ucu ters yüzüyle boş kasetin ucuna bantla ve sar.',
      'Ucundan bir parça dışarıda bırakıp kes, lider ucu aç.',
      'DX kodunu bantla kapat; 1–2 stop fazla pozla (200\'lük film için ISO 50–100).',
      'Normal C-41; laboratuvara redscale olduğunu söyle.',
    ],
    linkler: [
      { ad: 'Parallax — How to make redscale film', url: 'https://parallaxphotographic.coop/?p=28434' },
      { ad: 'Analog.Cafe — The redscale film guide', url: 'https://www.analog.cafe/r/the-redscale-film-guide-jdmc' },
      { ad: 'Lomography — Easy redscale DIY', url: 'https://www.lomography.com/magazine/72839-redscale' },
      { ad: '35mmc — Home brew redscale', url: 'https://www.35mmc.com/?p=43657' },
    ],
  },
  {
    id: 'film-soup',
    ad: 'Film soup',
    alt: 'Filmi "çorbada" bekletmek',
    alan: 'Banyo',
    zorluk: 'Kolay',
    ozet: 'Çekilmiş filmi limon suyu, sirke, tuz, çay, deterjan gibi ev malzemeleriyle yapılan sıcak bir karışımda bekletmek. Renk dalgaları, lekeler, ışıltılı noktalar; sonuç tamamen sürpriz.',
    malzeme: [
      'Çekilmiş film (en iyi sonuç renkli negatifte)',
      'Kapaklı kavanoz, sıcak su',
      'Limon suyu (ışıltılı noktalar için), sirke, tuz, bitki çayı, birkaç damla deterjan',
    ],
    adimlar: [
      'Ruloyu normal çek ve geri sar (önce bekletip sonra çekmek makineye zarar verebilir).',
      'Kavanoza sıcak suyu ve malzemeleri koy, kaseti at, kapat.',
      '4–24 saat beklet, arada çalkala.',
      '1–2 dakika soğuk suda durula.',
      'Birkaç gün, hatta birkaç hafta kurumaya bırak.',
      'Banyoya ver; laboratuvara mutlaka söyle.',
    ],
    not: 'Bazı laboratuvarlar film soup kabul etmeyebilir; önceden sor.',
    linkler: [
      { ad: 'Shoot It With Film — 7 film soup tarifi', url: 'https://shootitwithfilm.com/7-awesome-film-soup-recipes/' },
      { ad: 'Shoot It With Film — Film soup tutorial', url: 'https://shootitwithfilm.com/film-soup-tutorial/' },
      { ad: 'Lomography — Film soup yemek kitabı', url: 'https://www.lomography.com/magazine/346305-lomography-s-international-cookbook-of-film-soups-recipes-part-ii' },
      { ad: 'Casual Photophile — Elzi Boba ile film soup', url: 'https://casualphotophile.com/2019/06/05/making-film-soup-with-elzi-boba-featured-photophile-no-019/' },
    ],
  },
  {
    id: 'retikulasyon',
    ad: 'Retikülasyon',
    alt: 'Emülsiyonu kırıştırmak',
    alan: 'Banyo',
    zorluk: 'Zor',
    ozet: 'Banyo sırasında filmi aniden çok sıcak, sonra çok soğuk suya sokmak. Jelatin şişip büzülür; emülsiyonda yılan derisine ya da çatlak toprağa benzeyen bir doku oluşur.',
    malzeme: [
      'Siyah-beyaz film ve normal banyo seti',
      '40 °C üstü sıcak su, buzlu su, termometre',
    ],
    adimlar: [
      'Normal banyo, stop, fiksaj.',
      'Yıkamada birkaç dakika sıcak su, hemen ardından buzlu su; gerekirse tekrarla.',
      'Normal yıkama ve kurutma.',
    ],
    not: 'Modern filmler sertleştirilmiş, etki her filmde çıkmaz; çok sıcak su emülsiyonu soyabilir. Önemsiz bir ruloyla dene.',
    linkler: [
      { ad: 'Photrio — Reticulation tartışması', url: 'https://www.photrio.com/forum/threads/reticulation.161446/' },
      { ad: 'Photrio — "Amoeba" dokusu örneği', url: 'https://www.photrio.com/forum/threads/head-scratcher-film-develops-out-amoeba-cells.57210' },
    ],
  },
  {
    id: 'cift-pozlama',
    ad: 'Çift pozlama · film swap',
    alt: 'Aynı kareye iki görüntü',
    alan: 'Çekim',
    zorluk: 'Kolay',
    ozet: 'Ruloyu bir kez çekip geri sarmak ve aynı ruloyu bir daha çekmek. Film swap ortak versiyonu: sen çekersin, ruloyu başka bir şehirdeki fotoğrafçıya gönderirsin, o da senin karelerinin üzerine çeker.',
    malzeme: [
      'Bir rulo film (dia ya da renkli negatif), kalem',
      'Film swap için bir ortak',
    ],
    adimlar: [
      'Takarken film ucuna, kasetin ağzı hizasına bir çizgi çiz.',
      'ISO\'yu filmin iki katına ayarla (400 → 800).',
      'Ruloyu bitir, geri sararken lider ucunu içeri kaçırma.',
      'Çizgiden hizalayıp yeniden tak ve ikinci turu çek — ya da ortağına gönder.',
      'Kasetin üzerine "çift pozlandı" yaz.',
    ],
    not: 'İlk turda koyu arka planlı konular seç; ikinci görüntü koyu bölgelerde daha net görünür.',
    linkler: [
      { ad: 'Lomography — Çoklu pozlama rehberi', url: 'https://microsites.lomography.com/multiple-exposures/' },
      { ad: 'Lomography — Film swap projesi başlatmak', url: 'https://www.lomography.com/magazine/340200-start-your-own-film-swap-project-tips' },
      { ad: 'Shoot It With Film — Blind double exposures', url: 'https://shootitwithfilm.com/how-to-shoot-blind-double-exposures-on-film/' },
      { ad: 'OldCamsByJens — Double exposure rehberi', url: 'https://www.oldcamsbyjens.com/blogs/all-about-cams/the-ultimate-guide-to-shooting-double-exposures-on-film' },
    ],
  },
  {
    id: 'solarizasyon',
    ad: 'Solarizasyon',
    alt: 'Sabattier etkisi',
    alan: 'Karanlık oda',
    zorluk: 'Orta',
    ozet: 'Banyo yarıdayken baskı kâğıdını ya da filmi kısa süre beyaz ışığa tutmak. Görüntünün bir kısmı tersine döner, kenarlarda ince parlak/koyu çizgiler oluşur. 1930 civarında Lee Miller ve Man Ray ile gerçeküstücü fotoğrafın imzası oldu.',
    malzeme: [
      'Siyah-beyaz baskı kâğıdı, büyüteç, banyo/stop/fiksaj tepsileri',
      'Kısa yakılabilen bir lamba (15–25 W)',
    ],
    adimlar: [
      'Baskıyı normal pozla, banyonun yarısı kadar geliştir.',
      'Tepsiyi sarsmadan lambayı 1–2 saniye yak.',
      'Banyoya devam, sonra stop, fiksaj, yıkama.',
      'Aynı kareyi 0,5 / 1 / 2 sn ışıkla dene.',
    ],
    not: 'Bu tekniğin ustalarının eserleri hâlâ telifli; aşağıdakiler müze sayfalarına link.',
    linkler: [
      { ad: 'Man Ray — Max Ernst, 1935 · High Museum', url: 'https://high.org/collection/max-ernst/' },
      { ad: 'Brassaï — Nude, y. 1931–33 · Cleveland Museum', url: 'https://www.clevelandart.org/art/2008.174' },
      { ad: 'Maurice Tabard — Gitarlı Adam · Smart Museum', url: 'https://smartcollection.uchicago.edu/objects/25348/magraitis-man-with-guitar-magraitis-homme-a-la-guitare' },
      { ad: 'Sabattier etkisi — Vikipedi', url: 'https://en.wikipedia.org/wiki/Sabattier_effect' },
    ],
  },
]

export const GUVENLIK = [
  'Eldiven ve iyi havalandırma; banyo ve fiksaj kimyasalları cildi ve gözü tahriş edebilir.',
  'Banyo için ayrı kap/kaşık/ölçü kabı kullan; sonra mutfakta kullanma.',
  'Kullanılmış fiksaj gümüş içerir; lavaboya dökme, atık toplama noktasına ver.',
  'Kimyasalları çocukların ve evcil hayvanların ulaşamayacağı yerde, etiketli sakla.',
]
