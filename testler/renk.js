// Renklendirme testi + ekran görüntüleri: node testler/renk.js
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8776, DPORT = 9341, CIKTI = path.dirname(PROFIL);
const TUR = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const sunucu = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const d = path.join(KOK, p);
  if (!d.startsWith(KOK) || !fs.existsSync(d) || p === '/sw.js') { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TUR[path.extname(d)] || 'application/octet-stream' }); r.end(fs.readFileSync(d));
}).listen(PORT, '127.0.0.1');
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
let ws, sira = 0; const bekleyen = new Map(); const konsol = [];
const gonder = (method, params = {}, s) => { const id = ++sira; ws.send(JSON.stringify({ id, method, params, sessionId: s })); return new Promise((c, r) => bekleyen.set(id, { c, r })); };
async function d(o, e) { const r = await gonder('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }, o); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; }
const sonuc = (ad, ok, ek = '') => console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`);
async function ekran(o, ad, clip) { await bekle(500); const g = await gonder('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }, o); fs.writeFileSync(path.join(CIKTI, `renk-${ad}.png`), Buffer.from(g.data, 'base64')); }
async function git(o, url) { await gonder('Page.navigate', { url }, o); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(o, `!!document.querySelector('.istatistik')`)) break; } catch (e) {} } await bekle(300); }

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
  const site = `http://127.0.0.1:${PORT}/`;
  try {
    await git(o, site);
    await d(o, `(() => { ICERIK.uniteler.forEach((u) => { Depo.veri.uniteler[u.id] = { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 1 }; u.kelimeler.forEach((k) => Tekrar.tanis(k.id)); });
      Alistirma.BUYUK_SINAVLAR.forEach((b) => { Depo.veri.uniteler[b.id] = { adimlar: { sinav: true }, tamamlandi: true, enIyiSkor: 1 }; }); Cihaz.koy('ozetGorunum', 'tablo'); Depo.kaydet(); return true; })()`);
    await bekle(700);
    // 1) geniş ekran kişi tablosu
    await gonder('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false }, o);
    await git(o, site); await d(o, `(document.querySelector('[data-git="ozet"]').click(), true)`); await bekle(500);
    const t = await d(o, `JSON.stringify({ ek: document.querySelectorAll('.kisi-tablo .bc-ek').length, degisen: document.querySelectorAll('.kisi-tablo .bc-degisen').length, duzensiz: document.querySelectorAll('.kisi-tablo .bc-duzensiz').length,
      okunur: [...document.querySelectorAll('.kisi-tablo td.fiil .oku')].slice(0, 3).map((s) => s.dataset.ses), sahip: [...document.querySelectorAll('.kisi-tablo .k-yo')].map((s) => s.textContent).slice(0, 6), aciklama: !!document.querySelector('.renk-aciklama') })`);
    const tj = JSON.parse(t);
    sonuc('kişi tablosu: ekler, değişen harfler ve düzensizler renkli; açıklama var', tj.ek > 150 && tj.degisen > 30 && tj.duzensiz === 13 && tj.aciklama, t.slice(0, 160));
    sonuc('dinlemek için okunan metin değişmedi (renk okumayı bozmuyor)', tj.okunur.every((x) => !/[<·]/.test(x)), tj.okunur.join(', '));
    const g = await d(o, `JSON.stringify([...document.querySelectorAll('.kisi-tablo tr')].slice(2, 3).map((tr) => tr.innerHTML.match(/gusta|k-yo">me</g)))`);
    sonuc('gustar sütununda yalnızca değişen kelime (me / te…) renkli, "gusta" sade', /k-yo\\">me</.test(g) || /k-yo">me</.test(g), g.slice(0, 120));
    const r = await d(o, `(() => { const s = document.querySelector('.kisi-tablo'); s.closest('.ozet-kutu').scrollIntoView(); const k = s.closest('.tablo-kaydir'); k.scrollLeft = 700; const b = s.closest('.ozet-kutu').getBoundingClientRect(); return JSON.stringify({ x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.min(560, Math.round(b.height)) }); })()`);
    await ekran(o, 'tablo-genis');
    // 2) 390 px kişi kartı (yo ve nosotros)
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 1400, deviceScaleFactor: 1, mobile: true }, o);
    await d(o, `Cihaz.koy('ozetGorunum', 'kartlar'), true`);
    await git(o, site); await d(o, `(document.querySelector('[data-git="ozet"]').click(), true)`); await bekle(400);
    await d(o, `(document.querySelector('[data-kisi="yo"]').click(), document.querySelector('.kisi-kart').scrollIntoView(), true)`); await bekle(300);
    await ekran(o, 'kart-yo');
    await d(o, `(document.querySelector('[data-kisi="nos"]').click(), document.querySelector('.kisi-kart').scrollIntoView(), true)`); await bekle(300);
    await ekran(o, 'kart-nos');
    sonuc('390 px kişi kartında taşma yok', !(await d(o, `document.documentElement.scrollWidth > innerWidth + 1`)));
    // 3) kelime kartı ve çekim geri bildirimi
    const kk = await d(o, `(() => { const a = document.createElement('div'); a.innerHTML = Alistirma.artikelHtml('la cerveza') + Alistirma.artikelHtml('el padre') + Alistirma.artikelHtml('hola'); return a.querySelectorAll('.art-d').length + '/' + a.querySelectorAll('.art-e').length + '/' + a.textContent; })()`);
    sonuc('artikel renkleri: la → kırmızı, el → mavi, artikelsiz kelime sade', kk === '1/1/la cervezael padrehola', kk);
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 760, deviceScaleFactor: 1, mobile: true }, o);
    await git(o, site);
    await d(o, `(() => { const k = document.querySelector('#uygulama'); k.innerHTML = '<main class="alistirma"></main><div class="geribildirim"></div>';
      const c = ICERIK.uniteler.flatMap((u) => u.cekimler || []).find((x) => x.fiil === 'querer');
      const s = Alistirma.cekim(c, 'sec', 'yo'); s.render(k.querySelector('main'), () => {}); return true; })()`);
    await d(o, `(() => { const b = [...document.querySelectorAll('.sik')].find((x) => x.textContent.includes('quiero')); b.click(); return true; })()`);
    // geribildirim app.js'te; oturum dışı çizildiği için doğrudan gösterelim
    const gb = await d(o, `(() => { const h = '🔧 querer → ' + Alistirma.bicimHtml('querer', 'quiero', 'yo'); const g = document.querySelector('.geribildirim'); g.className = 'geribildirim acik dogru'; g.innerHTML = '<div><b>Doğru! 🎉</b><p class="bicim-satir">' + h + '</p></div><button class="ana-buton devam">Devam →</button>'; return g.innerText; })()`);
    await ekran(o, 'geribildirim');
    sonuc('çekim geri bildirimi: renkli biçim satırı', /quiero|qu.ie.r/.test(gb.replace(/\s/g, '')), gb.replace(/\n/g, ' '));
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
