// Büyük sınav (uzun dinleme) testi: node testler/dinleme.js
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8775, DPORT = 9340, CIKTI = path.dirname(PROFIL);
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
async function ekran(o, ad) { await bekle(500); const g = await gonder('Page.captureScreenshot', { format: 'png' }, o); fs.writeFileSync(path.join(CIKTI, `dinleme-${ad}.png`), Buffer.from(g.data, 'base64')); }
async function git(o, url) { await gonder('Page.navigate', { url }, o); for (let i = 0; i < 40; i++) { await bekle(250); try { if (await d(o, `!!document.querySelector('.istatistik')`)) break; } catch (e) {} } await bekle(300); }
const seed = (n) => `(() => { for (const k of Object.keys(Depo.veri.uniteler)) delete Depo.veri.uniteler[k]; Depo.veri.kelimeler = {};
  ICERIK.uniteler.filter((u) => u.sira <= ${n}).forEach((u) => { Depo.veri.uniteler[u.id] = { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 1 }; u.kelimeler.forEach((k) => Tekrar.tanis(k.id)); });
  Depo.kaydet(); return true; })()`;

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
    // 1) üretim: 24 soru; b01: 18 dinleme + 6 üretim; aynı sahnenin iki sorusu yan yana; b02 (sahnesi yok): önceki bloktan ≤4 dinleme + klasik
    const g = await d(o, `(() => { Alistirma.ustSira = 27; const alan = document.createElement('div'); document.body.appendChild(alan); const r = [];
      for (const mod of ['kapali', 'acik']) { Cihaz.koy('telefonModu', mod);
        for (const b of Alistirma.BUYUK_SINAVLAR) for (let n = 0; n < 4; n++) {
          let hata = null, l = [];
          try { l = Alistirma.buyukSinav(b); l.forEach((s) => { alan.innerHTML = ''; s.render(alan, () => {}); alan._temizle && alan._temizle(); }); } catch (e) { hata = e.message; }
          const dl = l.filter((s) => /^dinle_(anla|cevap)$/.test(s.tur));
          let yanyana = true; l.forEach((s, i) => { if (s.tur === 'dinle_anla') { const sid = s.anahtar.split(':')[0]; const sonra = l[i + 1]; if (!sonra || sonra.anahtar !== sid + ':cevap') yanyana = false; } });
          const esl = l.filter((s) => /eslestir|sureli/.test(s.tur)).length;
          const no = b.id.slice(2);   // b03 → '3' → sahneler 'd3_'
          r.push({ b: b.id, mod, adet: l.length, dl: dl.length, eskiBlok: dl.filter((s) => !s.anahtar.startsWith('d' + no + '_')).length, yanyana, esl, hata });
        } }
      Cihaz.koy('telefonModu', 'oto'); Ses.dur(); alan.remove(); return JSON.stringify(r); })()`);
    const r = JSON.parse(g);
    sonuc('5 sınav × 2 mod × 4: hatasız', r.every((x) => !x.hata), r.filter((x) => x.hata).map((x) => x.hata).join(' | '));
    sonuc('her sınav 24 soru', r.every((x) => x.adet === 24), [...new Set(r.map((x) => x.adet))].join(','));
    sonuc('her sınav: 18 uzun dinleme + 6 üretim', r.every((x) => x.dl === 18), [...new Set(r.map((x) => x.dl))].join(','));
    sonuc('aynı sahnenin "anla" ve "cevap" soruları yan yana', r.every((x) => x.yanyana));
    sonuc('b01: tümü kendi sahneleri; b02–b05: en çok 4 dinleme önceki bloklardan', r.filter((x) => x.b === 'b01').every((x) => x.eskiBlok === 0) && r.filter((x) => x.b !== 'b01').every((x) => x.eskiBlok > 0 && x.eskiBlok <= 4), r.map((x) => x.b + ':' + x.eskiBlok).slice(0, 12).join(' '));
    sonuc('sınavda eşleştirme yok', r.every((x) => !x.esl));

    // 2) sesli mod: sahne iki sesle okunuyor (Ses taklit), yazı gizli; yazılı mod (ses yok): metin görünüyor
    const sm = await d(o, `(async () => {
      Ses.dur(); await new Promise((r) => setTimeout(r, 600)); const s = ICERIK.dinlemeler.find((x) => x.id === 'd1_05'); const alan = document.createElement('div'); document.body.appendChild(alan);
      const okunan = []; const eskiSahne = Ses.sahneOku; Ses.sahneOku = (sat, y) => okunan.push(sat.map((x) => x[0]).join('') + (y ? '-yavas' : ''));
      Alistirma.dinleSahne(s, 'anla', false).render(alan, () => {}); await new Promise((r) => setTimeout(r, 500));
      const otomatik = okunan.length; alan.querySelector('.yavas-buton').click();
      const gizli = !alan.querySelector('.sahne-metin') && !alan.innerText.includes('Soy médica');
      alan.innerHTML = ''; Alistirma.dinleSahne(s, 'cevap', true).render(alan, () => {});
      const yazili = alan.innerText.includes('Soy médica') && !alan.querySelector('.dinle-buton');
      Ses.sahneOku = eskiSahne; alan.remove();
      return JSON.stringify({ otomatik, okunan, gizli, yazili }); })()`);
    sonuc('sesli: açılınca okunuyor (A+B), yavaş düğmesi, metin gizli; ses yoksa metin yazılı', /"otomatik":1,"okunan":\["AB","AB-yavas"\],"gizli":true,"yazili":true/.test(sm), sm);
    const iki = await d(o, `(() => { const v1 = { name: 'Paulina', lang: 'es-MX' }, v2 = { name: 'Juan', lang: 'es-MX' }, v3 = { name: 'Monica', lang: 'es-ES' };
      Ses.sesler = [v3, v1, v2]; return JSON.stringify({ ikinci: (Ses.ikinciSes(v1) || {}).name, tek: Ses.ikinciSes(v1) && (Ses.sesler = [v1], Ses.ikinciSes(v1)) }); })()`);
    sonuc('ikinci ses: farklı bir Latin Amerika sesi seçiliyor; tek ses varsa yok (ton değişir)', /"ikinci":"Juan","tek":null/.test(iki), iki);

    // 3) cevap doğruluğu: ilk şık (doğru) seçilince doğru, diğeri yanlış; sonuçta metin + Türkçe
    const dc = await d(o, `(() => { const s = ICERIK.dinlemeler[0], alan = document.createElement('div'); document.body.appendChild(alan); const sonuc = [];
      for (const hedef of [s.cevap.siklar[0], s.cevap.siklar[2]]) { let c; alan.innerHTML = ''; Alistirma.dinleSahne(s, 'cevap', true).render(alan, (x) => { c = x; });
        [...alan.querySelectorAll('.sik')].find((b) => b.textContent.includes(hedef)).click(); sonuc.push(c.dogru, !!c.metin && !!c.metinTr); }
      alan.remove(); return JSON.stringify(sonuc); })()`);
    sonuc('doğru şık doğru, yanlış şık yanlış sayılıyor; cevapta sahne metni ve Türkçesi var', dc === '[true,true,false,true]', dc);

    // 4) arayüz: sınavı çöz, soru ekranı ve sonuç (390 px)
    await d(o, seed(5)); await bekle(600);
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 800, deviceScaleFactor: 1, mobile: true }, o);
    await git(o, site);
    await d(o, `(document.querySelector('[data-buyuk="b01"]').click(), true)`); await bekle(300);
    const giris = await d(o, `document.querySelector('.sinav-kural').innerText`);
    sonuc('giriş ekranı: 24 soru ve dinleme anlatılıyor', /24 soru/.test(giris) && /dinle/i.test(giris), giris.split('\n').slice(1, 3).join(' / '));
    await d(o, `(document.querySelector('.basla').click(), true)`); await bekle(400);
    for (let i = 0; i < 6 && !(await d(o, `!!document.querySelector('.sahne-adi')`)); i++) { await d(o, `(document.querySelector('.alistirma .sik, .alistirma .tas') ? (document.querySelector('.alistirma .sik') || {click(){}}).click() : (document.querySelector('.yazma input') && (document.querySelector('.yazma input').value = 'x', document.querySelector('.alistirma form').requestSubmit())), true)`); await bekle(300); }
    await ekran(o, 'soru');
    const cevapla = `(async () => { for (let n = 0; n < 60; n++) {
        if (document.querySelector('.sonuc')) return 'bitti';
        const a = document.querySelector('.alistirma'); if (!a) { await new Promise((r) => setTimeout(r, 200)); continue; }
        const sik = a.querySelector('.sik:not(:disabled)'), inp = a.querySelector('.yazma input:not(:disabled)'), k = a.querySelector('.kontrol');
        if (sik) sik.click(); else if (inp) { inp.value = 'hola'; a.querySelector('form').requestSubmit(); }
        else if (k) { let i = 0; while (k.disabled && i++ < 20) { const t = a.querySelector('.taslar .tas:not(.kullanildi)'); if (!t) break; t.click(); } k.click(); }
        await new Promise((r) => setTimeout(r, 200)); } return 'takıldı'; })()`;
    sonuc('sınav baştan sona çözüldü', (await d(o, cevapla)) === 'bitti');
    const sn = await d(o, `JSON.stringify({ metin: document.querySelectorAll('.sinav-detay .detay-metin').length, us: document.querySelectorAll('.us-satir').length })`);
    sonuc('sonuçta dinleme sorularının metni ve Türkçesi görünüyor', JSON.parse(sn).metin >= 10, sn);
    await d(o, `(document.querySelector('.sinav-detay .detay-metin').scrollIntoView({ block: 'center' }), true)`); await ekran(o, 'sonuc');
    sonuc('390 px yana taşma yok', !(await d(o, `document.documentElement.scrollWidth > innerWidth + 1`)));
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
