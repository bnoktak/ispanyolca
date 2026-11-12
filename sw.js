/* =========================================================
   SERVICE WORKER (yalnızca https'te; file:// açılışını etkilemez)
   Uygulamanın tüm dosyalarını telefona kaydeder → çevrimdışı çalışır.
   SURUM her commit'te git kancası tarafından tarih-saatle değiştirilir
   (.githooks/pre-commit). SURUM değişince telefon yeni sürümü arka planda
   indirir ve "🔄 Yeni sürüm hazır" şeridi çıkar (js/pwa.js).
   Yeni dosya eklenirse DOSYALAR listesine de eklenmeli (node denetim.js kontrol eder).
   ========================================================= */
const SURUM = '2026-11-13_00-21-47';
const ONBELLEK = 'ispanyolca-' + SURUM;

const DOSYALAR = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'ikon/ikon-180.png',
  'ikon/ikon-192.png',
  'ikon/ikon-512.png',
  'icerik/icerik.js',
  'icerik/u01-alfabe.js',
  'icerik/u02-tanisma.js',
  'icerik/u03-sayilar.js',
  'icerik/u04-ser.js',
  'icerik/u05-estar.js',
  'icerik/u06-restoran.js',
  'icerik/u07-bar.js',
  'icerik/u08-iltifat.js',
  'icerik/u09-sayilar2.js',
  'icerik/u10-saat.js',
  'icerik/u11-yon.js',
  'icerik/u12-otel.js',
  'icerik/u13-ev.js',
  'icerik/u14-gezme.js',
  'icerik/u15-renkler.js',
  'icerik/u16-alisveris.js',
  'icerik/u17-saglik.js',
  'icerik/u18-guvenlik.js',
  'icerik/u19-tarih.js',
  'icerik/u20-aile.js',
  'icerik/u21-esyalar.js',
  'icerik/u22-market.js',
  'icerik/u23-fiiller.js',
  'icerik/u24-duzensiz.js',
  'icerik/u25-gustar.js',
  'icerik/u26-rutin.js',
  'icerik/u27-hava.js',
  'icerik/x01-trickler.js',
  'icerik/x02-sokak.js',
  'icerik/ozet.js',
  'icerik/sablonlar.js',
  'icerik/kelime-cumleleri.js',
  'js/storage.js',
  'js/srs.js',
  'js/puan.js',
  'js/ses.js',
  'js/ai.js',
  'js/alistirmalar.js',
  'js/uretici.js',
  'js/widget.js',
  'js/senkron.js',
  'js/app.js',
  'js/pwa.js'
];

// Kurulum: tüm dosyaları sunucudan taze indir (tarayıcı önbelleğini atla)
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(ONBELLEK).then((c) => c.addAll(DOSYALAR.map((d) => new Request(d, { cache: 'reload' })))));
  // skipWaiting yok: yeni sürüm, kullanıcı şeritteki "Yenile"ye basınca devreye girer
});

// Etkinleşme: eski sürümlerin önbelleklerini sil
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((adlar) => Promise.all(adlar.filter((a) => a.startsWith('ispanyolca-') && a !== ONBELLEK).map((a) => caches.delete(a))))
    .then(() => self.clients.claim()));
});

// İstekler: önce önbellek, yoksa ağ. Sayfa açılışları (?mini gibi parametreli olanlar dahil) index.html'e gider.
self.addEventListener('fetch', (e) => {
  const istek = e.request;
  if (istek.method !== 'GET' || new URL(istek.url).origin !== self.location.origin) return;
  if (istek.mode === 'navigate') {
    e.respondWith(caches.open(ONBELLEK).then((c) => c.match('index.html')).then((y) => y || fetch(istek)));
    return;
  }
  e.respondWith(caches.open(ONBELLEK).then((c) => c.match(istek, { ignoreSearch: true })).then((y) => y || fetch(istek)));
});

// Sayfadan gelen mesajlar
self.addEventListener('message', (e) => {
  if (e.data === 'atla') self.skipWaiting();                                  // şeritte "Yenile"
  if (e.data === 'surum' && e.ports[0]) e.ports[0].postMessage(SURUM);         // Ayarlar'da gösterilir
});
