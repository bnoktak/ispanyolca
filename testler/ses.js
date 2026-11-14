// Ses seçimi testi (sahte iPhone ses listesiyle): node testler/ses.js
// Robot sesler (Eddy, Flo, Grandma…) hiç kullanılmıyor mu, Paulina + Carlos "Gelişmiş" sürümleri karışık okunuyor mu,
// aynı metin hep aynı sesle mi, sahnede A ve B farklı mı, Ayarlar'daki seçim yalnızca bu cihaza mı yazılıyor?
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8778, DPORT = 9343, CIKTI = path.dirname(PROFIL);
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
async function git(o, url) { await gonder('Page.navigate', { url }, o); await bekle(800); for (let i = 0; i < 60; i++) { try { if (await d(o, `!!document.querySelector('.istatistik')`)) break; } catch (e) {} await bekle(250); } await bekle(400); }

// Sayfa açılmadan önce tarayıcının ses motoru sahtesiyle değiştirilir; okunanlar window.__okunan'a yazılır
const SAHTE = `(() => {
  const L = {
    iphone: [['Carlos', 'es-CO', 'com.apple.voice.compact.es-CO.Carlos'], ['Carlos (Gelişmiş)', 'es-CO', 'com.apple.voice.enhanced.es-CO.Carlos'],
      ['Eddy (İspanyolca (Meksika))', 'es-MX', 'com.apple.eloquence.es-MX.Eddy'], ['Flo (İspanyolca (Meksika))', 'es-MX', 'com.apple.eloquence.es-MX.Flo'],
      ['Grandma (İspanyolca (Meksika))', 'es-MX', 'com.apple.eloquence.es-MX.Grandma'], ['Jorge', 'es-ES', 'com.apple.voice.compact.es-ES.Jorge'],
      ['Juan', 'es-MX', 'com.apple.voice.compact.es-MX.Juan'], ['Mónica', 'es-ES', 'com.apple.voice.compact.es-ES.Monica'],
      ['Paulina', 'es-MX', 'com.apple.voice.compact.es-MX.Paulina'], ['Paulina (Gelişmiş)', 'es-MX', 'com.apple.voice.enhanced.es-MX.Paulina'],
      ['Rocko (İspanyolca (Meksika))', 'es-MX', 'com.apple.eloquence.es-MX.Rocko'], ['Shelley (İspanyolca (İspanya))', 'es-ES', 'com.apple.eloquence.es-ES.Shelley'],
      ['Samantha', 'en-US', 'com.apple.voice.compact.en-US.Samantha']],
    tercihsiz: [['Eddy (İspanyolca (Meksika))', 'es-MX', 'x.Eddy'], ['Mónica', 'es-ES', 'x.Monica'], ['Juan', 'es-MX', 'x.Juan']],
  };
  const liste = (L[localStorage.getItem('__sahteSesler') || 'iphone']).map(([name, lang, voiceURI]) => ({ name, lang, voiceURI, localService: true, default: false }));
  window.__okunan = [];
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.voice = null; this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; } };
  const motor = { getVoices: () => liste, speak: (u) => { if (u.text.trim()) window.__okunan.push({ t: u.text, v: u.voice && u.voice.name, p: u.pitch }); },
    cancel: () => {}, addEventListener: () => {}, speaking: false, pending: false };
  Object.defineProperty(window, 'speechSynthesis', { value: motor, configurable: true });
})();`;

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
  await gonder('Page.addScriptToEvaluateOnNewDocument', { source: SAHTE }, o);
  await gonder('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, o);
  const site = `http://127.0.0.1:${PORT}/`;
  try {
    await git(o, site);
    const a = JSON.parse(await d(o, `JSON.stringify({ iyi: Ses.iyiSesler().map((v) => v.name), havuz: Ses.havuz().map((v) => v.name), secim: Ses.secim() })`));
    sonuc('robot sesler (Eddy, Flo, Grandma, Rocko, Shelley) listede yok', !a.iyi.some((n) => /Eddy|Flo|Grandma|Rocko|Shelley/.test(n)), a.iyi.join(', '));
    sonuc('aynı kişinin "Gelişmiş" sürümü seçiliyor, normali elenmiş', a.iyi.includes('Paulina (Gelişmiş)') && a.iyi.includes('Carlos (Gelişmiş)') && !a.iyi.includes('Paulina') && !a.iyi.includes('Carlos'));
    sonuc('varsayılan: 🎲 karışık, havuz Paulina + Carlos', a.secim === 'karisik' && a.havuz.join('|') === 'Paulina (Gelişmiş)|Carlos (Gelişmiş)', a.havuz.join(' + '));

    // kelimeler karışık okunuyor, aynı metin aynı sesle
    const b = JSON.parse(await d(o, `(() => { window.__okunan = []; const ks = ICERIK.uniteler.slice(0, 3).flatMap((u) => u.kelimeler).filter((k) => Ses.okunurMu(k)).slice(0, 40);
      ks.forEach((k) => Ses.oku(k.es)); ks.forEach((k) => Ses.oku(k.es));
      const n = ks.length, ilk = __okunan.slice(0, n), ikinci = __okunan.slice(n);
      return JSON.stringify({ n, sesler: [...new Set(__okunan.map((x) => x.v))], ayni: ilk.every((x, i) => x.v === ikinci[i].v) }); })()`));
    sonuc('40 kelimede iki ses de kullanılıyor, robot ses yok', b.sesler.length === 2 && b.sesler.every((x) => x === 'Paulina (Gelişmiş)' || x === 'Carlos (Gelişmiş)'), b.sesler.join(', '));
    sonuc('aynı kelime tekrar okununca ses değişmiyor', b.ayni);

    // sahnede A ve B farklı sesler; sahneler arasında roller değişebiliyor
    const c = JSON.parse(await d(o, `(() => { const s = (ICERIK.dinlemeler || []).slice(0, 20); const r = s.map((x) => { window.__okunan = []; Ses.sahneOku(x.satirlar);
        const A = new Set(), B = new Set(); x.satirlar.forEach(([k], i) => (k === 'A' ? A : B).add(__okunan[i].v)); return { A: [...A], B: [...B] }; });
      return JSON.stringify({ adet: r.length, farkli: r.every((x) => x.A.length === 1 && x.B.length <= 1 && x.A[0] !== x.B[0]), aSesleri: [...new Set(r.map((x) => x.A[0]))] }); })()`));
    sonuc('sahnelerde A ve B hep farklı sesle okunuyor', c.adet >= 10 && c.farkli, JSON.stringify(c));
    sonuc('sahneden sahneye A rolü iki ses arasında değişiyor', c.aSesleri.length === 2, c.aSesleri.join(', '));

    // Ayarlar: karışık seçeneği + yalnızca iyi sesler; seçim Cihaz'a yazılıyor, ilerlemeye değil
    await d(o, `(document.querySelector('[data-git="ayarlar"], .ayar-buton, button[title*="Ayar"]') || [...document.querySelectorAll('button')].find((b) => b.textContent.includes('⚙️'))).click(), true`); await bekle(600);
    const e = JSON.parse(await d(o, `JSON.stringify({ secenek: [...document.querySelectorAll('#ses-sec option')].map((x) => x.textContent.trim()), secili: document.querySelector('#ses-sec').value })`));
    sonuc('Ayarlar: ilk seçenek 🎲 Karışık (Paulina + Carlos), robot ses yok', e.secenek[0].includes('Karışık (Paulina + Carlos)') && e.secili === 'karisik' && !e.secenek.some((x) => /Eddy|Flo|Grandma|Rocko|Shelley/.test(x)), e.secenek.join(' | '));
    await d(o, `(document.querySelector('#ses-sec').closest('section').scrollIntoView(), true)`); await bekle(300);
    await gonder('Page.captureScreenshot', { format: 'png' }, o).then((g) => fs.writeFileSync(path.join(CIKTI, 'ses-ayarlar.png'), Buffer.from(g.data, 'base64')));
    const f = JSON.parse(await d(o, `(() => { window.__okunan = []; const s = document.querySelector('#ses-sec'); s.value = 'Paulina (Gelişmiş)'; s.dispatchEvent(new Event('change'));
      const tanitma = __okunan.slice(); window.__okunan = []; ['hola', 'gracias', 'la cerveza', 'el agua', 'buenos días'].forEach((t) => Ses.oku(t));
      const sonra = [...new Set(__okunan.map((x) => x.v))];
      s.value = 'karisik'; window.__okunan = []; s.dispatchEvent(new Event('change'));
      return JSON.stringify({ cihaz: Cihaz.al('sesSecim'), depoda: JSON.stringify(Depo.veri).includes('Paulina'), sonra, tanit: __okunan.map((x) => x.v + ': ' + x.t) }); })()`));
    sonuc('sabit Paulina seçilince hep Paulina; seçim cihazda, ilerlemede (senkron) yok', f.sonra.join() === 'Paulina (Gelişmiş)' && !f.depoda, JSON.stringify(f));
    sonuc('karışığa dönünce iki ses kendini tanıtıyor', f.cihaz === 'karisik' && f.tanit.length === 2 && /Paulina.*Paulina/.test(f.tanit[0]) && /Carlos.*Carlos/.test(f.tanit[1]), f.tanit.join(' | '));

    // Paulina / Carlos yoksa: robotlar yine elenir, Latin Amerika sesi seçilir
    await d(o, `(localStorage.setItem('__sahteSesler', 'tercihsiz'), Cihaz.koy('sesSecim', undefined), true)`);
    await git(o, site);
    const g = JSON.parse(await d(o, `(() => { window.__okunan = []; Ses.oku('hola'); return JSON.stringify({ havuz: Ses.havuz().map((v) => v.name), okuyan: __okunan[0] && __okunan[0].v }); })()`));
    sonuc('tercih edilen sesler yoksa: Latin Amerika sesi (Juan), robot değil', g.havuz.join() === 'Juan' && g.okuyan === 'Juan', JSON.stringify(g));
    await d(o, `(localStorage.removeItem('__sahteSesler'), true)`);
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
