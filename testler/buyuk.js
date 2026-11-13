// Büyük sınav testi: node testler/buyuk.js
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8774, DPORT = 9339, CIKTI = path.dirname(PROFIL);
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
async function ekran(o, ad) { await bekle(500); const g = await gonder('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, o); fs.writeFileSync(path.join(CIKTI, `buyuk-${ad}.png`), Buffer.from(g.data, 'base64')); }
async function git(o, url) { await gonder('Page.navigate', { url }, o); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(o, `!!document.querySelector('.istatistik')`)) break; } catch (e) {} } await bekle(300); }
const seed = (n, ekstra = '') => `(() => { for (const k of Object.keys(Depo.veri.uniteler)) delete Depo.veri.uniteler[k]; Depo.veri.kelimeler = {};
  ICERIK.uniteler.filter((u) => u.sira <= ${n}).forEach((u) => { Depo.veri.uniteler[u.id] = { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 1 }; u.kelimeler.forEach((k) => Tekrar.tanis(k.id)); });
  ${ekstra}; Depo.kaydet(); return true; })()`;

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
    // 1) üretim: her büyük sınav, telefon modu kapalı/açık, 4'er kez
    const u = await d(o, `(() => {
      Alistirma.ustSira = 27; const alan = document.createElement('div'); document.body.appendChild(alan);
      const sonuc = [];
      for (const mod of ['kapali', 'acik']) { Cihaz.koy('telefonModu', mod);
        for (const b of Alistirma.BUYUK_SINAVLAR) for (let n = 0; n < 4; n++) {
          let hata = null, liste = [];
          try { liste = Alistirma.buyukSinav(b); liste.forEach((s) => { alan.innerHTML = ''; s.render(alan, () => {}); }); } catch (e) { hata = e.message; }
          const blok = liste.filter((s) => { const x = ICERIK.bul(s.unite); return x && x.sira >= b.bas && x.sira <= b.son; }).length;
          const disari = liste.filter((s) => { const x = ICERIK.bul(s.unite); return !x || x.sira > b.son; }).length;
          sonuc.push({ b: b.id, mod, adet: liste.length, blok, onceki: liste.length - blok - disari, disari, hata, turler: new Set(liste.map((s) => s.tur)).size, dinle: liste.filter((s) => /^dinle_(anla|cevap)$/.test(s.tur)).length, esl: liste.filter((s) => /eslestir|sureli/.test(s.tur)).length });
        } }
      Ses.dur(); alan.remove(); Cihaz.koy('telefonModu', 'oto'); return JSON.stringify(sonuc); })()`);
    const ur = JSON.parse(u);
    sonuc('5 büyük sınav × 2 mod × 4: hatasız üretim', ur.every((x) => !x.hata), ur.filter((x) => x.hata).map((x) => x.b + ' ' + x.hata).join(' | '));
    sonuc('her sınav 24 soru: 18 uzun dinleme + 6 üretim', ur.every((x) => x.adet === 24 && x.dinle === 18), [...new Set(ur.map((x) => `${x.adet}/${x.dinle}`))].join(','));
    sonuc('b01: tamamı Ünite 1–5\'ten', ur.filter((x) => x.b === 'b01').every((x) => x.blok === x.adet));
    sonuc('b02–b05: çoğu bloktan, önceki bloklardan en çok 2 sahne, sonraki ünitelerden hiç yok', ur.filter((x) => x.b !== 'b01').every((x) => x.disari === 0 && x.blok >= 18 && x.onceki <= 6),
      ur.filter((x) => x.b !== 'b01').slice(0, 4).map((x) => `${x.b}: ${x.blok}+${x.onceki}`).join(', '));
    sonuc('sınavda eşleştirme (tanıma) türü yok', ur.every((x) => !x.esl), ur.filter((x) => x.esl).length + ' sınavda var');
    sonuc('dinleme dışında da soru türü var (≥3 tür)', ur.every((x) => x.turler >= 3), `en az ${Math.min(...ur.map((x) => x.turler))}`);

    // zor kelimeler öne alınıyor mu?
    const z = await d(o, `(() => { Alistirma.ustSira = 5; const zor = ['u03_tienen', 'u04_ustedes', 'u05_entre'];
      zor.forEach((id) => { for (let i = 0; i < 3; i++) Puan.liste().push({ t: Date.now() + i, k: id, tur: 'yaz', u: id.slice(0, 3), d: 0, p: 3 }); }); Puan._kirli = true;
      let say = 0; for (let n = 0; n < 10; n++) { const ids = new Set(Alistirma.buyukSinav(Alistirma.BUYUK_SINAVLAR[0]).map((s) => s.anahtar)); say += zor.filter((x) => ids.has(x)).length; }
      return say; })()`);
    sonuc('zor bulunan kelimeler hemen her sınavda soruluyor', z >= 27, `${z}/30`);

    // 2) kilit
    await d(o, seed(5)); await bekle(600); await git(o, site);
    const k1 = await d(o, `JSON.stringify({ u06: document.querySelector('[data-unite="u06"]').disabled, b01: document.querySelector('[data-buyuk="b01"]').disabled, b02: document.querySelector('[data-buyuk="b02"]').disabled })`);
    sonuc('Ünite 5 bitti: büyük sınav 1 açık, Ünite 6 kilitli, büyük sınav 2 kilitli', k1 === '{"u06":true,"b01":false,"b02":true}', k1);
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, o);
    await d(o, `(document.querySelector('[data-buyuk="b01"]').scrollIntoView({ block: 'center' }), true)`); await ekran(o, 'ana-kilitli');
    await d(o, seed(5, `Depo.veri.uniteler.u06 = { adimlar: { not: true }, tamamlandi: false, enIyiSkor: 0 }`)); await bekle(600); await git(o, site);
    sonuc('eski ilerleme: zaten başlanmış Ünite 6 kilitlenmiyor', !(await d(o, `document.querySelector('[data-unite="u06"]').disabled`)));
    await d(o, seed(5, `Depo.veri.uniteler.b01 = { adimlar: { sinav: true }, tamamlandi: true, enIyiSkor: 0.85 }`)); await bekle(600); await git(o, site);
    const k3 = await d(o, `JSON.stringify({ u06: document.querySelector('[data-unite="u06"]').disabled, metin: document.querySelector('[data-buyuk="b01"]').innerText.replace(/\\n/g, ' ') })`);
    sonuc('büyük sınav geçilince Ünite 6 açılıyor, kartta skor', /"u06":false/.test(k3) && /%85/.test(k3), k3);
    const say = await d(o, `document.querySelector('.istatistik b').textContent`);
    sonuc('ana ekran ünite sayacı büyük sınavı ünite saymıyor', say === '5/27', say);

    // 3) sınavı baştan sona çöz (rastgele cevaplarla) → sonuç ekranı
    await d(o, seed(5)); await bekle(600); await git(o, site);
    await d(o, `(document.querySelector('[data-buyuk="b01"]').click(), true)`); await bekle(300);
    const giris = await d(o, `document.querySelector('.sinav-kural').innerText`);
    sonuc('giriş ekranı kuralları gösteriyor', /%80/.test(giris) && /Ünite 6 açılır/.test(giris), giris.split('\n')[1]);
    await ekran(o, 'giris');
    await d(o, `(document.querySelector('.basla').click(), true)`); await bekle(300);
    const cevapla = `(async () => {
      for (let n = 0; n < 80; n++) {
        if (document.querySelector('.sonuc')) return 'bitti ' + n;
        const a = document.querySelector('.alistirma'); if (!a) { await new Promise((r) => setTimeout(r, 200)); continue; }
        const sik = a.querySelector('.sik:not(:disabled)');
        const inp = a.querySelector('.yazma input:not(:disabled)');
        const kontrol = a.querySelector('.kontrol');
        if (sik) sik.click();
        else if (inp) { inp.value = Math.random() < 0.5 ? 'hola' : '12'; a.querySelector('form').requestSubmit(); }
        else if (kontrol) { let i = 0; while (kontrol.disabled && i++ < 20) { const t = a.querySelector('.taslar .tas:not(.kullanildi)'); if (!t) break; t.click(); } kontrol.click(); }
        else { const k = a.querySelectorAll('.kart-k:not(.tamam)'); if (k.length) { k[0].click(); k[k.length - 1].click(); } }
        await new Promise((r) => setTimeout(r, 220));
      }
      return 'takıldı: ' + (document.querySelector('.alistirma') || {}).innerText;
    })()`;
    const cv = await d(o, cevapla);
    sonuc('sınav baştan sona çözüldü, sonuç ekranı geldi', /^bitti/.test(cv), cv.slice(0, 120));
    const s = await d(o, `JSON.stringify({ skor: document.querySelector('.skor b').textContent, us: document.querySelectorAll('.us-satir').length, yanlis: !!document.querySelector('.sinav-detay'), kayit: Depo.veri.uniteler.b01 })`);
    sonuc('sonuçta ünite ünite tablo (5 ünite), yanlış listesi, skor kaydedildi', /"us":5/.test(s) && /"yanlis":true/.test(s) && /enIyiSkor/.test(s), s);
    await ekran(o, 'sonuc');

    // 4) senkron birleştirme büyük sınavı da birleştiriyor
    const sk = await d(o, `JSON.stringify(Senkron.birlestir({ surum: 2, sifirlama: 0, guncelleme: 1, kelimeler: {}, puanlar: [], ayarlar: {}, uniteler: { b01: { adimlar: { sinav: true }, tamamlandi: true, enIyiSkor: 0.9 } } },
      { surum: 2, sifirlama: 0, guncelleme: 2, kelimeler: {}, puanlar: [], ayarlar: {}, uniteler: { b01: { adimlar: {}, tamamlandi: false, enIyiSkor: 0.6 } } }).uniteler.b01)`);
    sonuc('senkron: bir cihazda geçilen büyük sınav öbüründe de geçilmiş sayılıyor', /"tamamlandi":true,"enIyiSkor":0.9/.test(sk), sk);
    sonuc('390 px yana taşma yok', !(await d(o, `document.documentElement.scrollWidth > innerWidth + 1`)));
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
