// PWA testi: Edge'i uzaktan yöneterek file://, localhost + service worker, çevrimdışı ve güncelleme şeridini dener.
// Kullanım: node pwa-test.js <proje klasörü> <edge.exe> <geçici profil klasörü>
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8765, DPORT = 9333;
let swEki = '';   // güncelleme testinde sw.js'ye eklenecek fark

const TUR = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const sunucu = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const d = path.join(KOK, p);
  if (!d.startsWith(KOK) || !fs.existsSync(d)) { r.writeHead(404); return r.end('yok'); }
  let govde = fs.readFileSync(d);
  if (p === '/sw.js' && swEki) govde = Buffer.from(govde.toString().replace(/const SURUM = '[^']*'/, `const SURUM = '${swEki}'`));
  r.writeHead(200, { 'Content-Type': TUR[path.extname(d)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); r.end(govde);
}).listen(PORT, '127.0.0.1');

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
let ws, sira = 0; const bekleyen = new Map(); const konsol = [];
function gonder(method, params = {}, sessionId) {
  const id = ++sira; ws.send(JSON.stringify({ id, method, params, sessionId }));
  return new Promise((coz, red) => bekleyen.set(id, { coz, red }));
}
async function degerlendir(oturum, ifade) {
  const r = await gonder('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true }, oturum);
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}
// sayfa açılana (ana ekran çizilene) kadar bekle; yavaş makinede sabit süre yetmeyebilir
async function git(oturum, url) { await gonder('Page.navigate', { url }, oturum); await bekle(1000);
  for (let i = 0; i < 40; i++) { try { if (await degerlendir(oturum, `/ünite/.test((document.querySelector('#uygulama') || {}).innerText || '')`)) break; } catch (e) {} await bekle(250); }
  await bekle(800); }
const sonuc = (ad, ok, ek = '') => console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`);

(async () => {
  const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${DPORT}`, `--user-data-dir=${PROFIL}`, 'about:blank'], { stdio: 'ignore' });
  let surum; for (let i = 0; i < 40 && !surum; i++) { try { surum = await (await fetch(`http://127.0.0.1:${DPORT}/json/version`)).json(); } catch (e) { await bekle(250); } }
  ws = new WebSocket(surum.webSocketDebuggerUrl);
  await new Promise((c) => ws.addEventListener('open', c));
  ws.addEventListener('message', (m) => {
    const v = JSON.parse(m.data);
    if (v.id && bekleyen.has(v.id)) { const b = bekleyen.get(v.id); bekleyen.delete(v.id); v.error ? b.red(new Error(v.error.message)) : b.coz(v.result); }
    if (v.method === 'Runtime.consoleAPICalled' && v.params.type === 'error') konsol.push(v.params.args.map((a) => a.value || a.description).join(' '));
    if (v.method === 'Runtime.exceptionThrown') konsol.push('İSTİSNA ' + (v.params.exceptionDetails.exception || {}).description);
    if (v.method === 'Log.entryAdded' && v.params.entry.level === 'error') konsol.push(v.params.entry.text + ' ' + (v.params.entry.url || ''));
  });
  const { targetId } = await gonder('Target.createTarget', { url: 'about:blank' });
  const { sessionId: o } = await gonder('Target.attachToTarget', { targetId, flatten: true });
  for (const m of ['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable']) await gonder(m, {}, o);

  try {
    // 1) file:// ile açılış
    const dosyaUrl = 'file:///' + path.join(KOK, 'index.html').replace(/\\/g, '/');
    konsol.length = 0; await git(o, dosyaUrl);
    const t1 = await degerlendir(o, `document.querySelector('#uygulama').innerText.slice(0, 40)`);
    const pwa1 = await degerlendir(o, `JSON.stringify({ aktif: window.PWA && PWA.aktif, manifest: !!document.querySelector('link[rel=manifest]') })`);
    sonuc('file:// açılış', /ünite/.test(t1), JSON.stringify(t1.replace(/\n/g, ' ')));
    sonuc('file:// PWA kapalı, manifest yok', pwa1 === '{"aktif":false,"manifest":false}', pwa1);
    sonuc('file:// konsol hatasız', konsol.length === 0, konsol.join(' | '));

    // 2) http://127.0.0.1 (https yerine geçer): service worker kurulumu
    const site = `http://127.0.0.1:${PORT}/`;
    konsol.length = 0; await git(o, site);
    await degerlendir(o, `window.__isaret = 1, true`);
    await degerlendir(o, `navigator.serviceWorker.ready.then(() => true)`);
    await bekle(3000);
    sonuc('ilk ziyarette sayfa kendiliğinden yenilenmedi', await degerlendir(o, `window.__isaret === 1`));
    await git(o, site);   // ikinci açılışta sayfa service worker'dan gelir
    const d2 = await degerlendir(o, `(async () => { const ad = (await caches.keys()).find((a) => a.startsWith('ispanyolca-')); const c = await caches.open(ad); return JSON.stringify({ kontrol: !!navigator.serviceWorker.controller, onbellek: ad, dosya: (await c.keys()).length, surum: PWA.surum, manifest: !!document.querySelector('link[rel=manifest]'), metin: document.querySelector('#uygulama').innerText.slice(0, 20) }); })()`);
    const v2 = JSON.parse(d2);
    sonuc('service worker kuruldu ve sayfayı yönetiyor', v2.kontrol && v2.dosya >= 48, d2);
    sonuc('localhost konsol hatasız', konsol.length === 0, konsol.join(' | '));

    // 3) çevrimdışı açılış
    await gonder('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, o);
    konsol.length = 0; await git(o, site + '?mini=deneme');
    const t3 = await degerlendir(o, `document.querySelector('#uygulama').innerText.slice(0, 40)`);
    sonuc('çevrimdışı açılış (parametreli adres dahil)', /ünite/.test(t3), JSON.stringify(t3.replace(/\n/g, ' ')));
    await gonder('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, o);

    // 4) güncelleme: sw.js'de SURUM değişir → şerit çıkar → Yenile → yeni sürüm
    swEki = 'TEST-YENI';
    await degerlendir(o, `navigator.serviceWorker.getRegistration().then((r) => r.update()).then(() => true)`);
    let serit = false;
    for (let i = 0; i < 30 && !serit; i++) { await bekle(500); serit = await degerlendir(o, `!!document.querySelector('.surum-serit')`); }
    sonuc('yeni sürümde şerit çıktı', serit);
    if (serit) {
      const g = await gonder('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 800, height: 120, scale: 1 } }, o);
      fs.writeFileSync(path.join(path.dirname(PROFIL), 'serit.png'), Buffer.from(g.data, 'base64'));
    }
    if (serit) {
      await bekle(2000);   // insan gibi: şerit çıktıktan biraz sonra dokun
      await degerlendir(o, `document.querySelector('.surum-serit button').click(), true`);
      // sayfa yenilenirken sorulan değerler yarım kalabilir: yenilemenin bitmesini bekleyip etkin sürümü kayıttan sor
      let s4, onb;
      for (let i = 0; i < 20; i++) {
        await bekle(1000);
        try {
          s4 = await degerlendir(o, `navigator.serviceWorker.getRegistration().then((r) => r && r.active ? new Promise((c) => { const k = new MessageChannel(); k.port1.onmessage = (e) => c(e.data); r.active.postMessage('surum', [k.port2]); setTimeout(() => c(null), 1500); }) : null)`);
          onb = await degerlendir(o, `caches.keys().then((k) => k.join(','))`);
        } catch (e) {}
        if (s4 === 'TEST-YENI' && onb === 'ispanyolca-TEST-YENI') break;
      }
      sonuc('Yenile sonrası yeni sürüm etkin, eski önbellek silindi', s4 === 'TEST-YENI' && onb === 'ispanyolca-TEST-YENI', `${s4} · ${onb}`);
    }

    // 5) 390 px genişlikte taşma yok
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }, o);
    await git(o, site);
    const tasma = await degerlendir(o, `document.documentElement.scrollWidth > innerWidth`);
    sonuc('390 px yana taşma yok', !tasma);
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
