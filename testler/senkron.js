// Senkron uçtan uca: iki "cihaz" (127.0.0.1 ve localhost = ayrı kayıt alanları) + sahte GitHub Gist API'si.
// Ayrıca file:// sayfasından gerçek api.github.com'a CORS erişimi (geçersiz sahte anahtarla, 401 okunabiliyor mu).
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8768, API_PORT = 8769, DPORT = 9336, CIKTI = path.dirname(PROFIL);
const TUR = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const d = path.join(KOK, p);
  if (!d.startsWith(KOK) || !fs.existsSync(d) || p === '/sw.js') { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TUR[path.extname(d)] || 'application/octet-stream' }); r.end(fs.readFileSync(d));
}).listen(PORT);

// ---- sahte Gist API ----
const gistler = {}; let sayac = 0; const istekler = [];
http.createServer((q, r) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept', 'Access-Control-Allow-Methods': 'GET, POST, PATCH' };
  if (q.method === 'OPTIONS') { r.writeHead(204, cors); return r.end(); }
  let govde = ''; q.on('data', (c) => (govde += c)); q.on('end', () => {
    const u = new URL(q.url, 'http://x'); istekler.push(q.method + ' ' + u.pathname);
    const yanit = (kod, json) => { r.writeHead(kod, { ...cors, 'Content-Type': 'application/json' }); r.end(JSON.stringify(json)); };
    if (q.headers.authorization !== 'Bearer test-anahtar') return yanit(401, { message: 'Bad credentials' });
    const gistJson = (g) => ({ id: g.id, description: g.description, files: Object.fromEntries(Object.entries(g.files).map(([a, f]) => [a, { filename: a, content: f.content, truncated: false }])) });
    if (q.method === 'GET' && u.pathname === '/gists') return yanit(200, Object.values(gistler).map(gistJson));
    if (q.method === 'POST' && u.pathname === '/gists') { const b = JSON.parse(govde); const id = 'g' + ++sayac; gistler[id] = { id, description: b.description, public: b.public, files: b.files }; return yanit(201, gistJson(gistler[id])); }
    const m = /^\/gists\/(\w+)$/.exec(u.pathname);
    if (m && !gistler[m[1]]) return yanit(404, { message: 'Not Found' });
    if (m && q.method === 'GET') return yanit(200, gistJson(gistler[m[1]]));
    if (m && q.method === 'PATCH') { const b = JSON.parse(govde); Object.assign(gistler[m[1]].files, b.files); return yanit(200, gistJson(gistler[m[1]])); }
    yanit(404, {});
  });
}).listen(API_PORT);
const bulut = () => { const g = Object.values(gistler)[0]; return g ? JSON.parse(g.files['ilerleme.json'].content) : null; };

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
let ws, sira = 0; const bekleyen = new Map(); const konsol = [];
const gonder = (method, params = {}, sessionId) => { const id = ++sira; ws.send(JSON.stringify({ id, method, params, sessionId })); return new Promise((c, r) => bekleyen.set(id, { c, r })); };
async function d(o, ifade) { const r = await gonder('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true }, o); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; }
const sonuc = (ad, ok, ek = '') => console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`);
async function sekme(url) {
  const { targetId } = await gonder('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await gonder('Target.attachToTarget', { targetId, flatten: true });
  for (const m of ['Page.enable', 'Runtime.enable']) await gonder(m, {}, sessionId);
  await gonder('Page.navigate', { url }, sessionId); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(sessionId, `!!document.querySelector('.istatistik')`)) break; } catch (e) {} }
  return sessionId;
}
const API = `Senkron.BulutSurucusu.API = 'http://127.0.0.1:${API_PORT}'`;

(async () => {
  const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${DPORT}`, `--user-data-dir=${PROFIL}`, 'about:blank'], { stdio: 'ignore' });
  let v; for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DPORT}/json/version`)).json(); } catch (e) { await bekle(250); } }
  ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise((c) => ws.addEventListener('open', c));
  ws.addEventListener('message', (m) => { const x = JSON.parse(m.data);
    if (x.id && bekleyen.has(x.id)) { const b = bekleyen.get(x.id); bekleyen.delete(x.id); x.error ? b.r(new Error(x.error.message)) : b.c(x.result); }
    if (x.method === 'Runtime.exceptionThrown') konsol.push('İSTİSNA ' + (x.params.exceptionDetails.exception || {}).description); });
  try {
    // 0) file:// → gerçek api.github.com (geçersiz anahtar): CORS engeli var mı?
    const f = await sekme('file:///' + path.join(KOK, 'index.html').replace(/\\/g, '/'));
    const cors = await d(f, `fetch('https://api.github.com/gists?per_page=1', { headers: { Authorization: 'Bearer gecersiz', Accept: 'application/vnd.github+json' } }).then((r) => 'durum ' + r.status, (e) => 'ENGEL ' + e.message)`);
    sonuc('file:// açılışta GitHub API\'ye erişilebiliyor (CORS engeli yok)', /durum 401/.test(cors), cors);

    // 1) Bilgisayar (A): ilerlemesi var; yanlış anahtar → hata; doğru anahtar → Gist oluşur
    const A = await sekme(`http://127.0.0.1:${PORT}/`);
    await d(A, `(() => { ${API}; Depo.veri.uniteler.u01 = { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 0.95 };
      Tekrar.sonuc('u01_h', true); Depo.veri.ayarlar.ingilizce = false; Depo.veri.ayarlar.sesAdi = 'Microsoft Sabina'; Depo.kaydet(); return true; })()`);
    const yanlis = await d(A, `Senkron.bagla('yanlis-anahtar').then(() => 'bağlandı?!', (e) => e.kod)`);
    sonuc('yanlış anahtar reddediliyor ve kaydedilmiyor', yanlis === 'anahtar' && !(await d(A, `Senkron.bagliMi()`)), yanlis);
    await d(A, `Senkron.bagla('test-anahtar').then(() => true)`);
    const b1 = bulut();
    sonuc('doğru anahtar: gizli Gist oluştu, ilerleme yüklendi', b1 && b1.uniteler.u01 && b1.kelimeler.u01_h && Object.values(gistler)[0].public === false, istekler.join(', '));
    const anahtarYeri = await d(A, `JSON.stringify({ ilerlemede: JSON.stringify(Depo.veri).includes('test-anahtar'), cihazda: Cihaz.al('gistAnahtar') === 'test-anahtar', bulutta: ${JSON.stringify(JSON.stringify(b1))}.includes('test-anahtar') })`);
    sonuc('anahtar yalnızca cihazda (ilerlemede ve bulutta yok)', anahtarYeri === '{"ilerlemede":false,"cihazda":true,"bulutta":false}', anahtarYeri);

    // 2) Telefon (B, ayrı kayıt alanı): boş; aynı anahtarla bağlanınca Gist'i bulur, ilerleme gelir
    const B = await sekme(`http://localhost:${PORT}/`);
    const once = await d(B, `document.querySelector('.istatistik b').textContent`);
    await d(B, `(${API}, Senkron.bagla('test-anahtar').then(() => true))`);
    await bekle(300);
    const sonra = await d(B, `JSON.stringify({ ekran: document.querySelector('.istatistik b').textContent, u01: !!(Depo.veri.uniteler.u01 || {}).tamamlandi, ingilizce: Depo.veri.ayarlar.ingilizce, ses: Depo.veri.ayarlar.sesAdi || null, gist: Object.keys(${JSON.stringify(gistler)}).length })`);
    sonuc('telefon: Gist bulundu (yeni oluşmadı), ilerleme ve ayarlar geldi, ses gelmedi, ana ekran yenilendi', once === '0/27' && /"ekran":"1\/27","u01":true,"ingilizce":false,"ses":null,"gist":1/.test(sonra), `${once} → ${sonra}`);

    // 3) telefonda çalış → buluta → bilgisayara
    await d(B, `(Tekrar.sonuc('u02_hola', true), Depo.veri.uniteler.u02 = { adimlar: { not: true }, tamamlandi: false, enIyiSkor: 0 }, Depo.kaydet(), Senkron.esitle('test'))`);
    sonuc('telefondaki çalışma buluta gitti', !!bulut().kelimeler.u02_hola && !!bulut().kelimeler.u01_h);
    await d(A, `(Tekrar.sonuc('u01_j', false), Senkron.esitle('test'))`);
    const a3 = await d(A, `JSON.stringify({ hola: !!Depo.veri.kelimeler.u02_hola, j: !!Depo.veri.kelimeler.u01_j, u02: !!Depo.veri.uniteler.u02, ses: Depo.veri.ayarlar.sesAdi })`);
    sonuc('bilgisayar: telefondaki çalışma geldi, kendi yenisi kaldı, kendi sesi korundu', a3 === '{"hola":true,"j":true,"u02":true,"ses":"Microsoft Sabina"}', a3);
    await d(B, `Senkron.esitle('test')`);
    sonuc('telefon: bilgisayarın yeni cevabı geldi', await d(B, `!!Depo.veri.kelimeler.u01_j`));

    // 4) gereksiz yazma yok: değişiklik yokken eşitleme PATCH göndermez
    const patchOnce = istekler.filter((x) => x.startsWith('PATCH')).length;
    await d(A, `Senkron.esitle('test')`); await d(B, `Senkron.esitle('test')`);
    sonuc('değişiklik yokken buluta yazılmıyor', istekler.filter((x) => x.startsWith('PATCH')).length === patchOnce);

    // 5) bilgisayarda sıfırla → telefonda da sıfırlanır, eski ilerleme geri gelmez
    await d(A, `Depo.sifirla().then(() => Senkron.esitle('test'))`);
    await d(B, `Senkron.esitle('test')`);
    const s5 = await d(B, `JSON.stringify({ kelime: Object.keys(Depo.veri.kelimeler).length, unite: Object.keys(Depo.veri.uniteler).length, ekran: document.querySelector('.istatistik b').textContent })`);
    sonuc('sıfırlama öbür cihaza geçti, eski ilerleme geri gelmedi', s5 === '{"kelime":0,"unite":0,"ekran":"0/27"}', s5);
    await d(A, `Senkron.esitle('test')`);
    sonuc('bilgisayar sıfır kaldı (telefondan geri gelmedi)', await d(A, `Object.keys(Depo.veri.kelimeler).length === 0`));

    // 6) sürüm koruması: bulutta daha yeni sürüm → yazılmaz, uyarı
    const g = Object.values(gistler)[0]; const ham = JSON.parse(g.files['ilerleme.json'].content); ham.surum = 99; g.files['ilerleme.json'].content = JSON.stringify(ham);
    await d(B, `(Tekrar.sonuc('u03_uno', true), Senkron.esitle('test'))`);
    const s6 = await d(B, `JSON.stringify({ kod: Senkron.hata && Senkron.hata.kod, yazi: Senkron.durumYazisi() })`);
    sonuc('bulutta yeni sürüm varsa eski uygulama yazmıyor, uyarı veriyor', /"kod":"surum"/.test(s6) && bulut().surum === 99, s6);
    ham.surum = 2; g.files['ilerleme.json'].content = JSON.stringify(ham);

    // 7) çevrimdışı: hata yazısı, uygulama çalışmaya devam
    await d(B, `(Senkron.BulutSurucusu.API = 'http://127.0.0.1:1', Senkron.esitle('test'))`);
    const s7 = await d(B, `Senkron.hata && Senkron.hata.kod`);
    sonuc('internet yoksa "çevrimdışı" deniyor, uygulama çalışıyor', s7 === 'ag', s7);
    await d(B, `(${API}, Senkron.esitle('test'))`);

    // 8) Ayarlar ekranı (390 px): bağlı görünüm ve bağlantıyı kes
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, B);
    await d(B, `(document.querySelector('[data-git="ayarlar"]').click(), true)`); await bekle(600);
    const kutu = await d(B, `document.querySelector('#senkron-kutu').innerText`);
    sonuc('Ayarlar: senkron bölümü bağlı görünüyor', /Bağlı/.test(kutu) && /Şimdi eşitle/.test(kutu), kutu.replace(/\n/g, ' ').slice(0, 120));
    await d(B, `(document.querySelector('#senkron-kutu').scrollIntoView(), true)`);
    let gg = await gonder('Page.captureScreenshot', { format: 'png' }, B); fs.writeFileSync(path.join(CIKTI, 'ekran-senkron-bagli.png'), Buffer.from(gg.data, 'base64'));
    await d(B, `(window.confirm = () => true, document.querySelector('#senkron-kes').click(), true)`); await bekle(300);
    const kes = await d(B, `JSON.stringify({ bagli: Senkron.bagliMi(), anahtar: !!Cihaz.al('gistAnahtar'), kutu: !!document.querySelector('#senkron-anahtar') })`);
    sonuc('Bağlantıyı kes: anahtar cihazdan silindi, giriş kutusu geldi', kes === '{"bagli":false,"anahtar":false,"kutu":true}', kes);
    await d(B, `(document.querySelector('#senkron-kutu details').open = true, document.querySelector('#senkron-kutu').scrollIntoView(), true)`);
    gg = await gonder('Page.captureScreenshot', { format: 'png' }, B); fs.writeFileSync(path.join(CIKTI, 'ekran-senkron-giris.png'), Buffer.from(gg.data, 'base64'));
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 4).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); process.exit(0);
})();



