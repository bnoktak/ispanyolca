// Özet sekmeleri testi: node testler/ozet.js
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8777, DPORT = 9342, CIKTI = path.dirname(PROFIL);
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
async function ekran(o, ad) { await bekle(500); const g = await gonder('Page.captureScreenshot', { format: 'png' }, o); fs.writeFileSync(path.join(CIKTI, `ozet-${ad}.png`), Buffer.from(g.data, 'base64')); }
async function git(o, url) { await gonder('Page.navigate', { url }, o); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(o, `!!document.querySelector('.istatistik')`)) break; } catch (e) {} } await bekle(300); }
const seed = (n) => `(() => { for (const k of Object.keys(Depo.veri.uniteler)) delete Depo.veri.uniteler[k]; Depo.veri.kelimeler = {};
  ICERIK.uniteler.filter((u) => u.sira <= ${n}).forEach((u) => { Depo.veri.uniteler[u.id] = { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 1 }; u.kelimeler.forEach((k) => Tekrar.tanis(k.id)); });
  Alistirma.BUYUK_SINAVLAR.filter((b) => b.son <= ${n}).forEach((b) => { Depo.veri.uniteler[b.id] = { adimlar: { sinav: true }, tamamlandi: true, enIyiSkor: 1 }; });
  Depo.kaydet(); return true; })()`;
const ozetAc = async (o, sekme) => { await d(o, `(Cihaz.koy('ozetSekme', '${sekme}'), true)`); await git(o, `http://127.0.0.1:${PORT}/`); await d(o, `(document.querySelector('[data-git="ozet"]').click(), true)`); await bekle(500); };
const durum = `JSON.stringify({ sekme: (document.querySelector('.ozet-sekmeler .secili') || {}).textContent, bolum: document.querySelectorAll('.ozet-kutu').length, kilitli: document.querySelectorAll('.kilitli-tablo').length,
  etiket: document.querySelectorAll('.ozet-etiketler button').length, kalan: document.querySelectorAll('.kalan-not').length, tasma: document.documentElement.scrollWidth > innerWidth + 1, en: /🇬🇧/.test(document.body.innerHTML) })`;

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
    await git(o, `http://127.0.0.1:${PORT}/`);
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, o);
    for (const [n, ad] of [[0, 'hiç açık değil'], [5, 'Ünite 1–5'], [27, 'hepsi açık']]) {
      await d(o, seed(n)); await bekle(600);
      for (const s of ['dilbilgisi', 'gruplar', 'kelimeler']) {
        await ozetAc(o, s);
        const x = JSON.parse(await d(o, durum));
        sonuc(`${ad} · ${s}: hatasız, taşma yok, İngilizce yok`, x.sekme && !x.tasma && !x.en && konsol.length === 0, JSON.stringify(x));
        if (s === 'gruplar') {
          if (n === 0) sonuc('hiç açık değilken: Ünite 1 dışındaki 11 tema kilitli kart', x.kilitli === 11, `${x.kilitli} kilitli`);
          if (n === 5) sonuc('Ünite 1–5: sayılar, milliyetler, meslekler açık; renkler kilitli; yarı açıklarda "+N kelime" notu', x.kilitli >= 6 && x.kilitli < 12 && x.kalan > 0, `${x.kilitli} kilitli, ${x.kalan} not`);
          if (n === 27) sonuc('hepsi açık: kilitli tablo ve kalan notu yok', x.kilitli === 0 && x.kalan === 0, `${x.kilitli}/${x.kalan}`);
          await ekran(o, `gruplar-${n}`);
        }
        if (s === 'dilbilgisi' && n === 5) await ekran(o, 'dilbilgisi-5');
      }
    }

    await d(o, seed(27)); await bekle(600); await ozetAc(o, 'dilbilgisi');
    const g = JSON.parse(await d(o, `JSON.stringify({
      ekler: !!document.querySelector('#oz-ekler .ek-tablo'), kalip: !!document.querySelector('#oz-kalip .kalip-tablo'),
      ekHucre: document.querySelectorAll('#oz-ekler td.fiil .bc-ek').length,
      sahipRenk: document.querySelectorAll('#oz-sahip td.sc [class^="k-"]').length, sahipSatir: document.querySelectorAll('#oz-sahip tr').length - 1,
      fiilRenk: document.querySelectorAll('#oz-fiil td.sc .bc, #oz-fiil td.sc .bc-duzensiz').length, fiilSatir: document.querySelectorAll('#oz-fiil td.sc').length,
      boyanmayan: [...document.querySelectorAll('#oz-fiil td.sc')].filter((t) => !t.querySelector('.bc, .bc-duzensiz')).map((t) => t.textContent).slice(0, 12),
      gustar: !!document.querySelector('#oz-gustar, [id*="gustar"]'), etiket: [...document.querySelectorAll('.ozet-etiketler button')].map((b) => b.textContent),
      oku: document.querySelector('#oz-fiil td.sc .oku') ? document.querySelector('#oz-fiil td.sc .oku').dataset.ses : null })`));
    sonuc('Dilbilgisi: ek ve kalıp tabloları, cümleler renkli', g.ekler && g.kalip && g.ekHucre >= 15 && g.sahipRenk === g.sahipSatir, JSON.stringify(g));
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, o);
    for (const b of ['oz-ekler', 'oz-kalip', 'oz-sahip', 'oz-fiil']) { await d(o, `(document.querySelector('[data-bolum="${b}"]').click(), true)`); await bekle(800); await ekran(o, 'db-' + b); }
    await gonder('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, o);
    await d(o, `(document.querySelector('[data-bolum="oz-kalip"]').click(), true)`); await bekle(800); await ekran(o, 'db-genis-kalip');
    await d(o, seed(21)); await bekle(400); await ozetAc(o, 'dilbilgisi');
    sonuc('Ü21 bitti: ek ve kalıp tabloları kilitli kart', await d(o, `!!document.querySelector('#oz-ekler.kilitli-tablo') && !!document.querySelector('#oz-kalip.kilitli-tablo')`));

    await d(o, seed(27)); await bekle(600); await ozetAc(o, 'gruplar');
    const c = JSON.parse(await d(o, `JSON.stringify({ cins: document.querySelectorAll('.tema-cins').length,
      yanlis: [...document.querySelectorAll('.tema-cins tr')].flatMap((r) => { const t = r.querySelectorAll('td .oku, td'); const td = r.querySelectorAll('td'); return td.length ? [[(td[0].querySelector('.oku') || td[0]).textContent, 'e'], [(td[1].querySelector('.oku') || td[1]).textContent, 'd']] : []; })
        .map(([s, g]) => [s.replace(/^[^a-záéíóúñ¿¡]+/i, ''), g]).filter(([s, g]) => s && (g === 'e' ? !/^(el|los) /i.test(s) : !/^(la|las) /i.test(s))).slice(0, 5),
      etiket: document.querySelectorAll('#tm-yemek td:nth-child(3)').length })`));
    sonuc('liste temaları eril/dişil sütunlu, yanlış sütun yok, ünite etiketi yok', c.cins >= 5 && c.yanlis.length === 0 && c.etiket === 0, JSON.stringify(c));
    await d(o, `(document.querySelector('[data-bolum="tm-yemek"]').click(), true)`); await bekle(900); await ekran(o, 'cins-yemek-390');
    await gonder('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, o);
    await d(o, `(document.querySelector('[data-bolum="tm-vucut"]').click(), true)`); await bekle(900); await ekran(o, 'cins-vucut-genis');
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, o);
    await git(o, 'http://127.0.0.1:' + PORT + '/');
    await d(o, `(document.querySelector('[data-unite="u01"]').click(), true)`); await bekle(400);
    await d(o, `(document.querySelector('[data-adim="kart"]').click(), true)`); await bekle(400);
    const st = () => d(o, `JSON.stringify({ es: document.querySelector('.yuz.on .es') && document.querySelector('.yuz.on .es').textContent, say: (document.querySelector('.sayac') || {}).textContent, oncekiKapali: (document.querySelector('.onceki') || {}).disabled })`).then(JSON.parse);
    const a = await st(); await ekran(o, 'kart-ilk');
    await d(o, `(document.querySelector('.biliyorum').click(), true)`); const b = await st(); await ekran(o, 'kart-ikinci');
    await d(o, `(document.querySelector('.onceki').click(), true)`); const c2 = await st();
    await d(o, `(document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })), document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })), true)`); const d2 = await st();
    sonuc('kart: ilkte Önceki kapalı, ileri-geri aynı karta dönüyor, tuşlar çalışıyor', a.oncekiKapali && !b.oncekiKapali && b.es !== a.es && c2.es === a.es && c2.say === a.say && d2.es === a.es, JSON.stringify([a, b, c2, d2]));
    const son = await d(o, `(() => { for (let i = 0; i < 300 && document.querySelector('.biliyorum'); i++) document.querySelector('.biliyorum').click(); return document.body.textContent.includes('Kartlar bitti'); })()`);
    sonuc('kartlar sonunda "Kartlar bitti"', son);
    // etiket → bölüme kaydırma, sekme hatırlanıyor
    await ozetAc(o, 'gruplar');
    await d(o, `(document.querySelector('[data-bolum="tm-renk"]').click(), true)`); await bekle(900);
    const y = await d(o, `Math.round(document.getElementById('tm-renk').getBoundingClientRect().top)`);
    sonuc('etikete dokununca o tabloya gidiyor (sekmelerin altında)', y > 30 && y < 140, `üst: ${y}px`);
    await ekran(o, 'renkler');
    await d(o, `(document.querySelector('[data-bolum="tm-zit"]').click(), true)`); await bekle(900); await ekran(o, 'zit');
    await d(o, `(document.querySelector('[data-bolum="tm-aile"]').click(), true)`); await bekle(900); await ekran(o, 'aile');
    await d(o, `(document.querySelector('[data-sekme="kelimeler"]').click(), true)`); await bekle(300);
    sonuc('sekme seçimi cihazda hatırlanıyor', (await d(o, `Cihaz.al('ozetSekme')`)) === 'kelimeler');
    const ara = await d(o, `(() => { const a = document.querySelector('.ozet-ara'); a.value = 'cerveza'; a.dispatchEvent(new Event('input')); return [...document.querySelectorAll('.ozet-unite tr')].filter((t) => !t.hidden).length; })()`);
    sonuc('Tüm kelimeler: arama çalışıyor', ara >= 1, `${ara} sonuç`);
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
