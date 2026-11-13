// Telefon modu testi: Edge'i uzaktan yönetir, her ünitede soru üretip çizdirir, yeni türleri cevaplar, ekran görüntüsü alır.
// Kullanım: node testler/telefon.js
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8766, DPORT = 9334, CIKTI = path.dirname(PROFIL);
const TUR = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const sunucu = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const d = path.join(KOK, p);
  if (!d.startsWith(KOK) || !fs.existsSync(d) || p === '/sw.js') { r.writeHead(404); return r.end(); }   // sw kapalı: hep taze dosya
  r.writeHead(200, { 'Content-Type': TUR[path.extname(d)] || 'application/octet-stream' }); r.end(fs.readFileSync(d));
}).listen(PORT, '127.0.0.1');
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
let ws, sira = 0; const bekleyen = new Map(); const konsol = [];
const gonder = (method, params = {}, sessionId) => { const id = ++sira; ws.send(JSON.stringify({ id, method, params, sessionId })); return new Promise((c, r) => bekleyen.set(id, { c, r })); };
async function d(o, ifade) { const r = await gonder('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true }, o); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; }
const sonuc = (ad, ok, ek = '') => console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`);

// sayfa hazır olana kadar bekle (sabit süre yavaş makinede yetmeyebilir)
async function hazirBekle(o) { await bekle(800); for (let i = 0; i < 60; i++) { try { if (await d(o, `typeof Cihaz !== 'undefined' && typeof Alistirma !== 'undefined' && !!document.querySelector('.istatistik')`)) break; } catch (e) {} await bekle(250); } await bekle(400); }

// Sayfada çalışan üretim testi: tüm üniteler, karışık + sınav + genel tekrar
const URETIM = (mod) => `(async () => {
  Cihaz.koy('telefonModu', '${mod}'); document.body.classList.toggle('telefon', Cihaz.telefon());
  Alistirma.ustSira = 27;
  const alan = document.createElement('div'); document.body.appendChild(alan);
  const sayac = {}, hatalar = []; let toplam = 0;
  const ciz = (s, nerede) => { try { alan.innerHTML = ''; s.render(alan, () => {}); sayac[s.tur] = (sayac[s.tur] || 0) + 1; toplam++; } catch (e) { hatalar.push(nerede + ' ' + s.tur + ': ' + e.message); } };
  for (const u of ICERIK.uniteler) {
    for (let n = 0; n < 6; n++) { try { Alistirma.karisik(u).forEach((s) => ciz(s, u.id)); } catch (e) { hatalar.push(u.id + ' karisik: ' + e.message); } }
    for (let n = 0; n < 2; n++) { try { Alistirma.sinav(u).forEach((s) => ciz(s, u.id + ' sinav')); } catch (e) { hatalar.push(u.id + ' sinav: ' + e.message); } }
  }
  const ids = ICERIK.tumKelimeler().slice(0, 300).map((k) => k.id);
  for (let n = 0; n < 5; n++) Alistirma.genelTekrar(ICERIK.uniteler, ids, 15).forEach((s) => ciz(s, 'tekrar'));
  Ses.dur(); alan.remove();
  const yazma = ['yaz', 'dinle_yaz', 'cekim_yaz', 'cekim_cumle_yaz', 'ceviri', 'cogul'].reduce((a, t) => a + (sayac[t] || 0), 0);
  const yerine = ['harf_kur', 'ceviri_kur'].reduce((a, t) => a + (sayac[t] || 0), 0);
  return JSON.stringify({ toplam, hatalar: hatalar.slice(0, 8), hataSayisi: hatalar.length, yazma, harf: sayac.harf_kur || 0, ceviriKur: sayac.ceviri_kur || 0, sayac });
})()`;

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
    await gonder('Page.navigate', { url: site }, o); await hazirBekle(o);

    // 1) üretim: telefon kapalı / açık
    const k = JSON.parse(await d(o, URETIM('kapali')));
    sonuc('telefon KAPALI: tüm üniteler hatasız', k.hataSayisi === 0, `${k.toplam} soru, ${k.hatalar.join(' | ')}`);
    sonuc('telefon KAPALI: yeni türler hiç çıkmıyor', k.harf === 0 && k.ceviriKur === 0, `harf ${k.harf}, ceviri_kur ${k.ceviriKur}, yazma ${k.yazma}`);
    const a = JSON.parse(await d(o, URETIM('acik')));
    sonuc('telefon AÇIK: tüm üniteler hatasız', a.hataSayisi === 0, `${a.toplam} soru, ${a.hatalar.join(' | ')}`);
    sonuc('telefon AÇIK: yazma soruları ~%20\'ye indi', a.yazma < k.yazma * 0.35, `yazma ${k.yazma} → ${a.yazma} (%${Math.round(100 * a.yazma / k.yazma)}), harf_kur ${a.harf}, ceviri_kur ${a.ceviriKur}`);

    // 2) harflerden kur: doğru sırayla dokununca doğru, aksanlı/çeldirici + artikel
    const h = await d(o, `(async () => {
      const sonuclar = [];
      for (const id of [ICERIK.tumKelimeler().find((k) => k.unite === 'u06' && Alistirma.harfUygun(k)).id, 'u02_hola', 'u20_padre'].concat(ICERIK.tumKelimeler().filter((k) => Alistirma.harfUygun(k) && /[áéíóúñ]/.test(k.es)).slice(0, 1).map((k) => k.id))) {
        const k = ICERIK.kelime(id); if (!k || !Alistirma.harfUygun(k)) { sonuclar.push(id + ': uygun değil'); continue; }
        const alan = document.createElement('div'); document.body.appendChild(alan); let cevap = null;
        Alistirma.harfKur(k).render(alan, (s) => { cevap = s; });
        const hedef = k.es.split(' / ')[0].replace(/^(el|la|los|las|un|una) /, '').toLowerCase();
        for (const harf of Array.from(hedef)) { const b = [...alan.querySelectorAll('.taslar .tas')].find((x) => x.textContent === harf && !x.classList.contains('kullanildi')); b.click(); }
        const tas = alan.querySelectorAll('.taslar .tas').length;
        alan.querySelector('.kontrol').click(); alan.remove();
        sonuclar.push(k.es + ': ' + (cevap && cevap.dogru && !cevap.uyari ? 'doğru' : 'HATA ' + JSON.stringify(cevap)) + ' (' + tas + ' taş)');
      }
      return sonuclar.join(' · ');
    })()`);
    sonuc('harflerden kur: doğru cevap doğru sayılıyor', !/HATA|uygun değil/.test(h), h);
    const hy = await d(o, `(() => { const k = ICERIK.tumKelimeler().find((k) => k.unite === 'u06' && Alistirma.harfUygun(k) && k.es.length > 5); const alan = document.createElement('div'); document.body.appendChild(alan); let c;
      Alistirma.harfKur(k).render(alan, (s) => { c = s; }); alan.querySelector('.taslar .tas').click(); alan.querySelector('.kontrol').click(); alan.remove(); return c.dogru === false; })()`);
    sonuc('harflerden kur: yanlış cevap yanlış sayılıyor', hy);

    // 3) kelimelerden kur: 2–3 yanıltıcı kelime, doğru sıra doğru
    const c = await d(o, `(() => { const u = ICERIK.uniteler[5]; const havuz = Alistirma.cumleHavuzu(u); const cm = havuz.find((x) => !x.es.includes('—'));
      Cihaz.koy('telefonModu', 'acik'); let s, n = 0; do { s = Alistirma.ceviriVeya(cm, havuz); } while (s.tur !== 'ceviri_kur' && ++n < 50);
      const alan = document.createElement('div'); document.body.appendChild(alan); let cevap;
      s.render(alan, (x) => { cevap = x; });
      const taslar = alan.querySelectorAll('.taslar .tas').length, kelime = cm.es.split(' ').length;
      for (const w of cm.es.split(' ')) [...alan.querySelectorAll('.taslar .tas')].find((b) => b.textContent === w && !b.classList.contains('kullanildi')).click();
      alan.querySelector('.kontrol').click(); alan.remove();
      return JSON.stringify({ cumle: cm.es, fazla: taslar - kelime, dogru: cevap.dogru, yonerge: s.tur }); })()`);
    const cj = JSON.parse(c);
    sonuc('kelimelerden kur: 2–3 yanıltıcı, doğru sıra doğru', cj.dogru && cj.fazla >= 2 && cj.fazla <= 3, c);

    // 4) Ayarlar: telefon modu seçeneği, body sınıfı
    await d(o, `Cihaz.koy('telefonModu', 'oto'), true`);
    await gonder('Page.navigate', { url: site }, o); await hazirBekle(o);
    const ay = await d(o, `(async () => { document.querySelector('.ust .ikon, [title*="Ayar"], .ayarlar')?.click(); await new Promise((r) => setTimeout(r, 500));
      const sel = document.querySelector('#telefon-modu'); if (!sel) return 'seçenek yok';
      sel.value = 'acik'; sel.dispatchEvent(new Event('change')); const acik = document.body.classList.contains('telefon');
      sel.value = 'kapali'; sel.dispatchEvent(new Event('change')); const kapali = !document.body.classList.contains('telefon');
      sel.value = 'oto'; sel.dispatchEvent(new Event('change'));
      return JSON.stringify({ acik, kapali, depoda: JSON.stringify(Depo.veri.ayarlar).includes('telefon'), metin: sel.options[0].text }); })()`);
    sonuc('Ayarlar: telefon modu seçeneği çalışıyor, ilerlemeye yazılmıyor', /"acik":true,"kapali":true,"depoda":false/.test(ay), ay);

    // 5) 390 px ekran görüntüleri (telefon modu açık)
    await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 760, deviceScaleFactor: 1, mobile: true }, o);
    for (const [ad, ifade] of [
      ['harf', `Alistirma.harfKur(ICERIK.kelime('u20_padre') || ICERIK.tumKelimeler().find((k) => k.unite === 'u06' && Alistirma.harfUygun(k) && k.es.length > 5))`],
      ['ceviri-kur', `(() => { const u = ICERIK.uniteler[5]; const h = Alistirma.cumleHavuzu(u); return Alistirma.cumle(h.find((x) => !x.es.includes('—')), h, false, { tur: 'ceviri_kur', celdirici: 3 }); })()`]]) {
      await d(o, `(() => { const k = document.querySelector('#uygulama'); k.innerHTML = '<main class="alistirma"></main>'; ${ifade}.render(k.querySelector('main'), () => {}); return true; })()`);
      await bekle(300);
      const g = await gonder('Page.captureScreenshot', { format: 'png' }, o);
      fs.writeFileSync(path.join(CIKTI, `ekran-${ad}.png`), Buffer.from(g.data, 'base64'));
    }
    const tasma = await d(o, `document.documentElement.scrollWidth > innerWidth`);
    sonuc('390 px yana taşma yok', !tasma);
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 5).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();

