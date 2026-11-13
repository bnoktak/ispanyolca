// 1) Scriptable kelime kartı (widget-kart.html) Edge'de 390 px · 2) uygulama widget.json'u Gist'e yazıyor, Ayarlar kurulum bölümü
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const CIKTI = path.dirname(PROFIL), PORT = 8772, API_PORT = 8773, DPORT = 9338;
const TUR = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const d = path.join(KOK, p);
  if (!d.startsWith(KOK) || !fs.existsSync(d) || p === '/sw.js') { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TUR[path.extname(d)] || 'application/octet-stream' }); r.end(fs.readFileSync(d));
}).listen(PORT);
const gistler = {}; const istekler = [];
http.createServer((q, r) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept', 'Access-Control-Allow-Methods': 'GET, POST, PATCH' };
  if (q.method === 'OPTIONS') { r.writeHead(204, cors); return r.end(); }
  let b = ''; q.on('data', (c) => (b += c)); q.on('end', () => {
    const u = new URL(q.url, 'http://x'); const yan = (k, j) => { r.writeHead(k, { ...cors, 'Content-Type': 'application/json' }); r.end(JSON.stringify(j)); };
    if (q.headers.authorization !== 'Bearer test-anahtar') return yan(401, {});
    const gj = (g) => ({ id: g.id, description: g.description, owner: { login: 'ornekkisi' }, files: Object.fromEntries(Object.entries(g.files).map(([a, f]) => [a, { content: f.content, truncated: false }])) });
    if (q.method === 'GET' && u.pathname === '/gists') return yan(200, Object.values(gistler).map(gj));
    if (q.method === 'POST' && u.pathname === '/gists') { const j = JSON.parse(b); gistler.g1 = { id: 'g1', description: j.description, files: j.files }; return yan(201, gj(gistler.g1)); }
    const m = /^\/gists\/(\w+)$/.exec(u.pathname);
    if (m && q.method === 'GET') return yan(200, gj(gistler[m[1]]));
    if (m && q.method === 'PATCH') { istekler.push(Object.keys(JSON.parse(b).files).join('+')); Object.assign(gistler[m[1]].files, JSON.parse(b).files); return yan(200, gj(gistler[m[1]])); }
    yan(404, {});
  });
}).listen(API_PORT);
const widgetBulutta = () => { const f = gistler.g1 && gistler.g1.files['widget.json']; return f ? JSON.parse(f.content) : null; };

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
let ws, sira = 0; const bekleyen = new Map(); const konsol = [];
const gonder = (method, params = {}, s) => { const id = ++sira; ws.send(JSON.stringify({ id, method, params, sessionId: s })); return new Promise((c, r) => bekleyen.set(id, { c, r })); };
async function d(o, e) { const r = await gonder('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }, o); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; }
const sonuc = (ad, ok, ek = '') => console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`);
async function ekran(o, ad) { await bekle(600); const g = await gonder('Page.captureScreenshot', { format: 'png' }, o); fs.writeFileSync(path.join(CIKTI, ad + '.png'), Buffer.from(g.data, 'base64')); }
async function git(o, url, isaret) { await gonder('Page.navigate', { url }, o); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(o, `!!document.querySelector(${JSON.stringify(isaret)})`)) break; } catch (e) {} } await bekle(300); }
const kart = `JSON.stringify({ es: document.getElementById('es').textContent, cevrik: document.getElementById('kart').classList.contains('cevrik') })`;

(async () => {
  const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${DPORT}`, `--user-data-dir=${PROFIL}`, 'about:blank'], { stdio: 'ignore' });
  let v; for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DPORT}/json/version`)).json(); } catch (e) { await bekle(250); } }
  ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise((c) => ws.addEventListener('open', c));
  ws.addEventListener('message', (m) => { const x = JSON.parse(m.data);
    if (x.id && bekleyen.has(x.id)) { const b = bekleyen.get(x.id); bekleyen.delete(x.id); x.error ? b.r(new Error(x.error.message)) : b.c(x.result); }
    if (x.method === 'Runtime.exceptionThrown') konsol.push('İSTİSNA ' + (x.params.exceptionDetails.exception || {}).description); });
  const { targetId } = await gonder('Target.createTarget', { url: 'about:blank' });
  const { sessionId: o } = await gonder('Target.attachToTarget', { targetId, flatten: true });
  for (const m of ['Page.enable', 'Runtime.enable']) await gonder(m, {}, o);
  try {
    // 1) Scriptable kelime kartı
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 760, deviceScaleFactor: 1, mobile: true }, o);
    await gonder('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, o);
    await git(o, 'file:///' + path.join(CIKTI, 'widget-kart.html').replace(/\\/g, '/'), '#es');
    const k1 = await d(o, kart);
    await ekran(o, 'widget-kart-on');
    await d(o, `(document.getElementById('kart').click(), true)`);
    sonuc('kart: dokununca Türkçesi açılıyor', JSON.parse(await d(o, kart)).cevrik);
    await ekran(o, 'widget-kart-arka');
    await d(o, `(document.getElementById('gec').click(), true)`); const k2 = await d(o, kart);
    await d(o, `(document.getElementById('onceki').click(), true)`); const k3 = await d(o, kart);
    sonuc('kart: Geç yeni kelime, Önceki geri getiriyor (çevrik değil)', JSON.parse(k1).es !== JSON.parse(k2).es && JSON.parse(k3).es === JSON.parse(k1).es && !JSON.parse(k3).cevrik);
    const r = JSON.parse(await d(o, `JSON.stringify((() => { const b = document.getElementById('kart').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })())`));
    await gonder('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x + 100, y: r.y }] }, o);
    await gonder('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x - 100, y: r.y + 5 }] }, o);
    await gonder('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, o); await bekle(300);
    const k4 = await d(o, kart);
    sonuc('kart: sola kaydırınca sonraki kelime, kart çevrilmiyor', JSON.parse(k4).es !== JSON.parse(k1).es && !JSON.parse(k4).cevrik, k4);
    sonuc('kart: 390 px yana taşma yok', !(await d(o, `document.documentElement.scrollWidth > innerWidth + 1`)));

    // 2) uygulama: senkron bağlanınca widget.json da Gist'e gidiyor
    await gonder('Emulation.setTouchEmulationEnabled', { enabled: false }, o);
    const site = `http://127.0.0.1:${PORT}/`;
    await git(o, site, '.istatistik');
    await d(o, `(() => { ['u01','u02'].forEach((id) => { Depo.veri.uniteler[id] = { adimlar: { not: true, kart: true }, tamamlandi: false, enIyiSkor: 0 }; ICERIK.bul(id).kelimeler.forEach((k) => Tekrar.tanis(k.id)); }); return true; })()`);
    await d(o, `(Senkron.BulutSurucusu.API = 'http://127.0.0.1:${API_PORT}', Senkron.bagla('test-anahtar').then(() => true))`);
    const w1 = widgetBulutta();
    sonuc('bağlanınca widget.json Gist\'e yazıldı, öğrenilen kelimeler içinde', w1 && w1.k.length > 30 && w1.k.some((x) => x.id === 'u02_hola'), w1 ? w1.k.length + ' kelime' : 'yok');
    sonuc('Gist sahibi cihazda saklandı (widget adresi için)', (await d(o, `Cihaz.al('gistSahip')`)) === 'ornekkisi');
    const p1 = istekler.length;
    await d(o, `Senkron.esitle('test')`);
    sonuc('değişiklik yokken widget.json yeniden yazılmıyor', istekler.length === p1, istekler.join(', '));
    await d(o, `(Tekrar.sonuc('u02_hola', true), Senkron.esitle('test'))`);
    sonuc('yalnızca ilerleme değişince widget.json gönderilmiyor', istekler.at(-1) === 'ilerleme.json', istekler.at(-1));
    await d(o, `(() => { Depo.veri.uniteler.u03 = { adimlar: { not: true, kart: true } }; ICERIK.bul('u03').kelimeler.forEach((k) => Tekrar.tanis(k.id)); return Senkron.esitle('test'); })()`);
    const w2 = widgetBulutta();
    sonuc('yeni ünitenin kartları görülünce widget.json güncellendi', /widget\.json/.test(istekler.at(-1)) && w2.k.length > w1.k.length, `${w1.k.length} → ${w2.k.length} · ${istekler.at(-1)}`);

    // 3) Ayarlar: kurulum bölümü ve kopyalanacak kod
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 1200, deviceScaleFactor: 1, mobile: true }, o);
    await d(o, `(document.querySelector('[data-git="ayarlar"]').click(), true)`); await bekle(500);
    const kod = await d(o, `(document.querySelector('.widget-kod') || {}).value || ''`);
    sonuc('Ayarlar: widget kurulum kodu Gist adresiyle hazır', kod.includes('https://gist.githubusercontent.com/ornekkisi/g1/raw/widget.json') && kod.includes('importModule') && !kod.includes('test-anahtar'), kod.split('\n')[2]);
    await d(o, `(document.querySelector('#widget-kutu details').open = true, document.querySelector('#widget-kutu').scrollIntoView(), true)`);
    await ekran(o, 'widget-ayarlar');
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); process.exit(0);
})();
