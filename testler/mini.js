// Mini kart testi: node testler/mini.js
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8770, DPORT = 9337, CIKTI = path.dirname(PROFIL);
const TUR = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const sunucu = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const d = path.join(KOK, p);
  if (!d.startsWith(KOK) || !fs.existsSync(d) || p === '/sw.js') { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TUR[path.extname(d)] || 'application/octet-stream' }); r.end(fs.readFileSync(d));
}).listen(PORT, '127.0.0.1');
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
let ws, sira = 0; const bekleyen = new Map(); const konsol = [];
const gonder = (method, params = {}, sessionId) => { const id = ++sira; ws.send(JSON.stringify({ id, method, params, sessionId })); return new Promise((c, r) => bekleyen.set(id, { c, r })); };
async function d(o, ifade) { const r = await gonder('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true }, o); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; }
const sonuc = (ad, ok, ek = '') => console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`);
async function ekran(o, ad) { await bekle(600); const g = await gonder('Page.captureScreenshot', { format: 'png' }, o); fs.writeFileSync(path.join(CIKTI, `mini-${ad}.png`), Buffer.from(g.data, 'base64')); }
async function git(o, url) { await gonder('Page.navigate', { url }, o); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(o, `!!document.querySelector('.ust')`)) break; } catch (e) {} } await bekle(300); }
const kart = `JSON.stringify({ es: (document.querySelector('.flip .yuz.on .es') || {}).textContent, cumle: (document.querySelector('.yuz.on .mini-cumle') || {}).textContent || null, cevrik: !!document.querySelector('.flip.cevrik') })`;

(async () => {
  const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${DPORT}`, `--user-data-dir=${PROFIL}`, 'about:blank'], { stdio: 'ignore' });
  let v; for (let i = 0; i < 40 && !v; i++) { try { v = await (await fetch(`http://127.0.0.1:${DPORT}/json/version`)).json(); } catch (e) { await bekle(250); } }
  ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise((c) => ws.addEventListener('open', c));
  ws.addEventListener('message', (m) => { const x = JSON.parse(m.data);
    if (x.id && bekleyen.has(x.id)) { const b = bekleyen.get(x.id); bekleyen.delete(x.id); x.error ? b.r(new Error(x.error.message)) : b.c(x.result); }
    if (x.method === 'Runtime.exceptionThrown') konsol.push('İSTİSNA ' + (x.params.exceptionDetails.exception || {}).description);
    if (x.method === 'Runtime.consoleAPICalled' && x.params.type === 'error') konsol.push(x.params.args.map((a) => a.value || a.description).join(' ')); });
  const { targetId } = await gonder('Target.createTarget', { url: 'about:blank' });
  const { sessionId: o } = await gonder('Target.attachToTarget', { targetId, flatten: true });
  for (const m of ['Page.enable', 'Runtime.enable']) await gonder(m, {}, o);
  const site = `http://127.0.0.1:${PORT}/`;
  try {
    // 1) boş ilerleme
    await git(o, site);
    sonuc('boş ilerleme: ana ekranda mini kart düğmesi pasif', await d(o, `document.querySelector('[data-git="mini"]').disabled`));
    await git(o, site + '#mini');
    sonuc('boş ilerleme: #mini adresi "henüz kelime yok" diyor', /Henüz öğrendiğin kelime yok/.test(await d(o, `document.body.innerText`)));

    // 2) ilk 6 ünitenin kartları görülmüş
    await d(o, `(() => { const ac = ['u01','u02','u03','u04','u05','u06']; ac.forEach((id) => { Depo.veri.uniteler[id] = { adimlar: { not: true, kart: true }, tamamlandi: false, enIyiSkor: 0 }; ICERIK.bul(id).kelimeler.forEach((k) => Tekrar.tanis(k.id)); }); return true; })()`);
    await bekle(800);
    await git(o, site);
    const ogren = await d(o, `Object.keys(Depo.veri.kelimeler).map((id) => ICERIK.kelime(id)).filter((k) => k && k.yazma !== false).length`);
    await d(o, `(document.querySelector('[data-git="mini"]').click(), true)`); await bekle(300);
    const once = await d(o, `JSON.stringify(Depo.veri)`);

    // 60 kez geç: kelimeler öğrenilmiş mi, cümleler görülmüş ünitelerden mi, kelimeyi içeriyor mu
    const sonucJs = await d(o, `(async () => {
      const ac = new Set(['u01','u02','u03','u04','u05','u06']);
      const izinli = new Set([...ICERIK.uniteler.filter((u) => ac.has(u.id)).flatMap((u) => u.cumleler.map((c) => c.es)), ...Object.values(ICERIK.kelimeCumleleri || {}).map((x) => x[0])]);
      const gorulen = [], hatalar = []; let cumleli = 0;
      for (let n = 0; n < 60; n++) {
        const es = document.querySelector('.flip .yuz.on .es').textContent, c = (document.querySelector('.yuz.on .mini-cumle') || {}).textContent;
        const k = ICERIK.tumKelimeler().find((x) => x.es === es);
        if (!k || !ac.has(k.unite)) hatalar.push('öğrenilmemiş: ' + es);
        if (c) { cumleli++; const ct = c.replace(/\\s*🔊\\s*$/, '').trim(); if (!izinli.has(ct)) hatalar.push('izinsiz cümle: ' + ct); }
        gorulen.push(es);
        document.querySelector('.gec').click(); await new Promise((r) => setTimeout(r, 20));
      }
      return JSON.stringify({ hatalar: hatalar.slice(0, 5), farkli: new Set(gorulen).size, cumleli, artArda: gorulen.some((x, i) => i && x === gorulen[i - 1]) });
    })()`);
    const s = JSON.parse(sonucJs);
    sonuc('kelimeler yalnızca öğrenilmişlerden, cümleler yalnızca kartı görülmüş ünitelerden', s.hatalar.length === 0, s.hatalar.join(' | '));
    sonuc('rastgele ve çeşitli, aynı kelime art arda gelmiyor', s.farkli >= 40 && !s.artArda, `${s.farkli} farklı kelime / 60 · ${ogren} öğrenilmiş`);
    console.log(`BİLGİ  60 kartın ${s.cumleli} tanesinde örnek cümle vardı (kelime-cumleleri.js henüz yok; ünite cümlelerinden)`);

    // 3) önceki: aynı kelime ve aynı cümle
    const k1 = await d(o, kart); await d(o, `(document.querySelector('.gec').click(), true)`); await d(o, `(document.querySelector('.onceki').click(), true)`);
    const k2 = await d(o, kart);
    sonuc('← Önceki aynı kelimeyi aynı cümleyle geri getiriyor', k1 === k2, k1);
    await d(o, `(document.querySelector('.flip').click(), true)`);
    sonuc('karta dokununca Türkçesi açılıyor', /"cevrik":true/.test(await d(o, kart)));

    // 4) klavye
    const kk1 = await d(o, kart);
    await gonder('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }, o);
    await gonder('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }, o); await bekle(200);
    const kk2 = await d(o, kart);
    await gonder('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 }, o);
    await gonder('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 }, o); await bekle(200);
    const kk3 = await d(o, kart);
    sonuc('klavye: → sonraki, ← önceki', JSON.parse(kk1).es !== JSON.parse(kk2).es && JSON.parse(kk3).es === JSON.parse(kk1).es);

    // 5) ilerleme değişmedi
    const sonra = await d(o, `JSON.stringify(Depo.veri)`);
    sonuc('ilerleme ve tekrar listesi değişmedi', once === sonra);

    // 6) #mini=<id>: o kelimeyle açılıyor
    await git(o, site + '#mini=u02_hola');
    sonuc('#mini=u02_hola adresi o kelimeyle açılıyor', JSON.parse(await d(o, kart)).es === ICERIK_ES_HOLA(), await d(o, kart));
    await d(o, `(document.querySelector('.geri').click(), true)`); await bekle(300);
    sonuc('← ana ekrana dönüyor, adres temizleniyor', await d(o, `!!document.querySelector('.istatistik') && location.hash === ''`));

    // 7) telefon (390 px, dokunmatik): kaydırma + ekran görüntüleri
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 760, deviceScaleFactor: 1, mobile: true }, o);
    await gonder('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, o);
    await git(o, site + '#mini');
    const t1 = await d(o, kart);
    const r = JSON.parse(await d(o, `JSON.stringify((() => { const b = document.querySelector('.flip').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })())`));
    await gonder('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x + 100, y: r.y }] }, o);
    await gonder('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x - 20, y: r.y + 5 }] }, o);
    await gonder('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x - 100, y: r.y + 8 }] }, o);
    await gonder('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, o); await bekle(400);
    const t2 = await d(o, kart);
    sonuc('telefonda sola kaydırınca sonraki kelime geliyor, kart çevrilmiyor', JSON.parse(t1).es !== JSON.parse(t2).es && !JSON.parse(t2).cevrik, `${t1} → ${t2}`);
    await ekran(o, 'tel-on');
    await d(o, `(document.querySelector('.flip').click(), true)`);
    await ekran(o, 'tel-arka');
    sonuc('390 px yana taşma yok', !(await d(o, `document.documentElement.scrollWidth > innerWidth + 1`)));
    await git(o, site);
    await ekran(o, 'tel-ana');

    // 8) geniş ekran
    await gonder('Emulation.setTouchEmulationEnabled', { enabled: false }, o);
    await gonder('Emulation.setDeviceMetricsOverride', { width: 1100, height: 760, deviceScaleFactor: 1, mobile: false }, o);
    await git(o, site + '#mini');
    await ekran(o, 'pc-on');

    // 9) file:// ile açılış (#mini)
    konsol.length = 0;
    await git(o, 'file:///' + path.join(KOK, 'index.html').replace(/\\/g, '/') + '#mini');
    sonuc('file:// #mini açılıyor, hata yok', /Mini kart/.test(await d(o, `document.body.innerText`)) && konsol.length === 0, konsol.join(' | '));
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 4).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
function ICERIK_ES_HOLA() { return 'hola'; }
