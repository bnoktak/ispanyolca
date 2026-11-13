// Telefon modu 2. parça: tek elle düzen, eşleştirme sayıları, toplu yazma gizleme, özet kartları. Ekran görüntüleri alır.
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8767, DPORT = 9335, CIKTI = path.dirname(PROFIL);
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

// sayfa hazır olana kadar bekle (sabit süre yavaş makinede yetmeyebilir)
async function hazirBekle(o) { await bekle(800); for (let i = 0; i < 60; i++) { try { if (await d(o, `typeof Cihaz !== 'undefined' && typeof Alistirma !== 'undefined' && !!document.querySelector('.istatistik')`)) break; } catch (e) {} await bekle(250); } await bekle(400); }
async function ekran(o, ad) { await bekle(400); const g = await gonder('Page.captureScreenshot', { format: 'png' }, o); fs.writeFileSync(path.join(CIKTI, `ekran2-${ad}.png`), Buffer.from(g.data, 'base64')); }
const tikla = (sec) => `(() => { const b = document.querySelector(${JSON.stringify(sec)}); if (!b) return false; b.click(); return true; })()`;

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
  const ac = async () => { await gonder('Page.navigate', { url: site }, o); await hazirBekle(o); };
  try {
    // ilerleme: ilk 6 ünite bitmiş, 7. ünitenin kartları görülmüş (yalnızca bu test profilinde)
    await ac();
    await d(o, `(() => { ['u01','u02','u03','u04','u05','u06'].forEach((id) => { Depo.veri.uniteler[id] = { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 1 }; });
      Depo.veri.uniteler.u07 = { adimlar: { not: true, kart: true }, tamamlandi: false, enIyiSkor: 0 }; Depo.kaydet(); return true; })()`);
    await bekle(800);

    for (const mod of ['acik', 'kapali']) {
      const tel = mod === 'acik';
      await d(o, `Cihaz.koy('telefonModu', '${mod}'), Cihaz.koy('ozetGorunum', undefined), true`);
      await gonder('Emulation.setDeviceMetricsOverride', tel ? { width: 390, height: 780, deviceScaleFactor: 1, mobile: true } : { width: 1100, height: 800, deviceScaleFactor: 1, mobile: false }, o);
      await ac();
      const etiket = tel ? 'TELEFON' : 'BİLGİSAYAR';

      // alıştırma menüsü: toplu yazma
      await d(o, tikla('[data-unite="u07"]')); await bekle(300); await d(o, tikla('[data-adim="alistirma"]')); await bekle(300);
      const toplu = await d(o, `!!document.querySelector('[data-mod="es"]')`);
      sonuc(`${etiket}: toplu yazma ${tel ? 'gizli' : 'görünüyor'}`, tel ? !toplu : toplu);

      // karışık alıştırma: şıklı soru bulana kadar
      let sik = false;
      for (let i = 0; i < 25 && !sik; i++) {
        await d(o, tikla('[data-mod="karisik"]')); await bekle(400);
        sik = await d(o, `!!document.querySelector('.alistirma > .siklar .sik')`);
        if (!sik) { await d(o, tikla('.geri')); await bekle(300); }
      }
      if (sik) {
        const yer = await d(o, `(() => { const s = document.querySelector('.alistirma > .siklar').getBoundingClientRect(); return JSON.stringify({ alt: Math.round(innerHeight - s.bottom), ust: Math.round(s.top), no: getComputedStyle(document.querySelector('.sik .no')).display, h: Math.round(document.querySelector('.sik').getBoundingClientRect().height) }); })()`);
        const y = JSON.parse(yer);
        if (tel) sonuc('TELEFON: şıklar ekranın altında, numarasız, ≥56 px', y.alt < 60 && y.no === 'none' && y.h >= 56, yer);
        else sonuc('BİLGİSAYAR: şıklar eskisi gibi (numaralı, üstte)', y.no !== 'none' && y.ust < 400, yer);
        await ekran(o, `${tel ? 'tel' : 'pc'}-sik`);
        await d(o, tikla('.alistirma .sik')); await bekle(600);
        const gb = await d(o, `(() => { const g = document.querySelector('.geribildirim').getBoundingClientRect(), s = document.querySelector('.alistirma > .siklar').getBoundingClientRect(); return JSON.stringify({ ortusme: Math.round(s.bottom - g.top), puanH: Math.round((document.querySelector('.puanla button') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height) }); })()`);
        const g = JSON.parse(gb);
        if (tel) sonuc('TELEFON: geri bildirim şıkları örtmüyor, 1-2-3 büyük', g.ortusme <= 2 && g.puanH >= 44, gb);
        await ekran(o, `${tel ? 'tel' : 'pc'}-geribildirim`);
      } else sonuc(`${etiket}: şıklı soru bulunamadı`, false);

      // eşleştirme çift sayısı
      const es = await d(o, `(() => { const u = ICERIK.bul('u07'); const a = document.createElement('div'); document.body.appendChild(a);
        Alistirma._sifirla && Alistirma._sifirla(); const s1 = Alistirma.uniteden(u, 'eslestir'); s1.render(a, () => {}); const n1 = a.querySelectorAll('.kart-k').length / 2;
        a.innerHTML = ''; const s2 = Alistirma.uniteden(u, 'sureli'); s2.render(a, () => {}); const n2 = a.querySelectorAll('.kart-k').length / 2; a._temizle && a._temizle(); a.remove(); return n1 + '/' + n2; })()`);
      sonuc(`${etiket}: eşleştirme ${tel ? '4/5' : '5/6'} çift`, es === (tel ? '4/5' : '5/6'), es);

      // özet: varsayılan görünüm ve kişi kartları
      await ac(); await d(o, tikla('[data-git="ozet"]')); await bekle(500);
      const oz = await d(o, `JSON.stringify({ secili: (document.querySelector('.gorunum-sec .secili') || {}).textContent, kart: !!document.querySelector('#kisi-kart'), tablo: !!document.querySelector('.kisi-tablo') })`);
      sonuc(`${etiket}: özet varsayılanı ${tel ? 'kartlar' : 'tablo'}`, tel ? /Kartlar/.test(oz) && /"kart":true/.test(oz) : /Tablo/.test(oz) && /"tablo":true/.test(oz), oz);
      if (tel) {
        await d(o, tikla('[data-kisi="nos"]')); await bekle(300);
        const k = await d(o, `JSON.stringify({ secili: document.querySelector('.kisi-dugmeler .secili').textContent, zamir: document.querySelector('.kisi-kart .zamir').innerText.replace(/\\n/g, ' '), fiil: document.querySelectorAll('#kisi-kart .ozet-tablo tr').length, kayit: Cihaz.al('ozetKisi') })`);
        sonuc('TELEFON: kişi düğmesi kartı değiştiriyor ve hatırlanıyor', /nosotros/.test(k) && /"kayit":"nos"/.test(k), k);
        await ekran(o, 'tel-ozet-kart');
        await d(o, tikla('[data-gorunum="tablo"]')); await bekle(400);
        const t = await d(o, `JSON.stringify({ tablo: !!document.querySelector('.kisi-tablo'), kayit: Cihaz.al('ozetGorunum') })`);
        sonuc('TELEFON: Tablo geçişi çalışıyor ve hatırlanıyor', /"tablo":true,"kayit":"tablo"/.test(t), t);
      }
      const tasma = await d(o, `document.documentElement.scrollWidth > innerWidth + 1`);
      if (tel) sonuc('TELEFON: yana taşma yok (özet dahil)', !tasma);
    }
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 5).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
