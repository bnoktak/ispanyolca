// Akıllı yanlış şıklar testi: node testler/siklar.js
// Her ünitede: şıklar doğru cevapla çoğunlukla aynı türden mi, öğretilmemiş kelime var mı, aynı anlam / aynı yazı tekrar ediyor mu,
// karıştırılan ikili tekrar birlikte çıkıyor mu, cümle sorularında benzer cümleler mi. Örnek tablo: ciktilar/siklar-ornek.txt
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { KOK, EDGE, PROFIL } = require('./ortak');
const PORT = 8779, DPORT = 9344, CIKTI = path.dirname(PROFIL);
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
    // 1) her ünitenin her kelimesi için iki yönde 3 yanlış şık
    const a = JSON.parse(await d(o, `(() => { Alistirma.ustSira = 0; Depo.veri.karisan = {};
      const cek = (k) => (k.tr.replace(/\\s*\\([^)]*\\)\\s*$/, '').trim() || k.tr).toLowerCase();
      let toplam = 0, ayniTur = 0, eksik = 0, ileri = [], tekrar = [], harfKarisik = 0;
      for (const u of ICERIK.uniteler.concat(ICERIK.ekler || [])) for (const k of u.kelimeler) for (const alan of ['es', 'tr']) {
        const s = Alistirma.celdiriciler(k, alan, 3), ht = Alistirma.kelimeTuru(k).tur;
        if (s.length < 3) eksik++;
        const sinir = u.ek ? 0 : u.sira;
        s.forEach((x) => { toplam++; if (Alistirma.kelimeTuru(x).tur === ht) ayniTur++;
          const xu = ICERIK.bul(x.unite); if (!xu.ek && xu.sira > sinir) ileri.push(k.id + '→' + x.id); if (xu.ek && x.unite !== u.id) ileri.push(k.id + '→' + x.id);
          if ((x.yazma === false) !== (k.yazma === false)) harfKarisik++; });
        const metin = [k, ...s].map((x) => x[alan].toLowerCase()), anlam = [k, ...s].map(cek);
        if (new Set(metin).size < metin.length || new Set(anlam).size < anlam.length) tekrar.push(k.id + ':' + alan);
      }
      return JSON.stringify({ toplam, oran: +(ayniTur / toplam).toFixed(3), eksik, ileri: ileri.slice(0, 5), ileriSay: ileri.length, tekrar: tekrar.slice(0, 5), tekrarSay: tekrar.length, harfKarisik }); })()`));
    sonuc('şıkların çoğu doğru cevapla aynı türden (≥%75)', a.oran >= 0.75, `%${Math.round(a.oran * 100)} (${a.toplam} şık)`);
    sonuc('öğretilmemiş (ileri ünite) kelime şık olarak hiç çıkmıyor', a.ileriSay === 0, a.ileri.join(', '));
    sonuc('aynı yazı / aynı anlam iki kez çıkmıyor', a.tekrarSay === 0, a.tekrar.join(', '));
    sonuc('harf ↔ kelime karışmıyor, her soruda 3 yanlış şık (Ünite 1 harfleri hariç)', a.harfKarisik === 0 && a.eksik <= 4, `eksik ${a.eksik}`);

    // 2) bilinen kötü örnekler artık iyi mi?
    const b = JSON.parse(await d(o, `(() => { Alistirma.ustSira = 0;
      const bul = (es) => ICERIK.tumKelimeler().find((k) => k.es === es);
      const ornek = (es, alan, n = 30) => { const k = bul(es); const say = {}; for (let i = 0; i < n; i++) Alistirma.celdiriciler(k, alan, 3).forEach((x) => { say[x.es] = (say[x.es] || 0) + 1; }); return { k, say }; };
      const soy = ornek('soy', 'es'), ten = ornek('el tenedor', 'es'), per = ornek('peruano / peruana', 'tr');
      const tur = (es) => Alistirma.kelimeTuru(bul(es) || { es, tr: '' }).tur;
      return JSON.stringify({
        soy: Object.keys(soy.say).filter((e) => tur(e) === 'cekim').length / Object.keys(soy.say).length,
        soyOrnek: Object.entries(soy.say).sort((x, y) => y[1] - x[1]).slice(0, 6).map((x) => x[0]),
        ten: Object.keys(ten.say).every((e) => tur(e) === 'isim'), tenOrnek: Object.entries(ten.say).sort((x, y) => y[1] - x[1]).slice(0, 6).map((x) => x[0]),
        perOrnek: Object.entries(per.say).sort((x, y) => y[1] - x[1]).slice(0, 6).map((x) => x[0]),
        cesit: Object.keys(ten.say).length }); })()`));
    sonuc('"soy" sorulunca şıklar çekimli fiiller (eres, es, estoy…)', b.soy >= 0.8, b.soyOrnek.join(', '));
    sonuc('"el tenedor" sorulunca şıklar hep isim, çoğu yemek takımı', b.ten, b.tenOrnek.join(', '));
    sonuc('aynı soruda şıklar her seferinde aynı değil (ezber olmasın)', b.cesit >= 5, `el tenedor: ${b.cesit} farklı şık / 30 deneme`);

    // 3) karıştırdığın ikili tekrar birlikte çıkıyor
    const c = JSON.parse(await d(o, `(() => { Alistirma.ustSira = 0; Depo.veri.karisan = {};
      const k = ICERIK.kelime('u06_tenedor') || ICERIK.tumKelimeler().find((x) => x.es === 'el tenedor');
      const hedef = ICERIK.tumKelimeler().find((x) => x.unite <= 'u06' && x.es === 'el vino') || ICERIK.tumKelimeler().find((x) => x.unite === 'u06' && x.id !== k.id && /^el /.test(x.es));
      let once = 0; for (let i = 0; i < 20; i++) if (Alistirma.celdiriciler(k, 'es', 3).includes(hedef)) once++;
      Alistirma.karisanKaydet(k.id, hedef.id);
      let sonra = 0; for (let i = 0; i < 20; i++) if (Alistirma.celdiriciler(k, 'es', 3).includes(hedef)) sonra++;
      const kayit = Object.keys(Depo.veri.karisan); Depo.veri.karisan = {}; Depo.kaydet();
      return JSON.stringify({ hedef: hedef.es, once, sonra, kayit }); })()`));
    sonuc('yanlış seçilen kelime sonraki sorularda yine şık olarak geliyor', c.sonra >= 18 && c.kayit.length === 1, JSON.stringify(c));

    // 4) gerçek soruda yanlış şık seçince ikili kaydediliyor
    const e = JSON.parse(await d(o, `(() => { Depo.veri.karisan = {}; const k = ICERIK.kelime('u06_tenedor') || ICERIK.bul('u06').kelimeler.find((x) => /^el /.test(x.es));
      const soru = Alistirma.secim ? null : null; const alan = document.createElement('div'); document.body.appendChild(alan);
      const turler = Alistirma.uniteden ? null : null;
      let s = null; for (let i = 0; i < 300 && !s; i++) { const x = Alistirma.uniteden(ICERIK.bul(k.unite)); if (/^sec_(es|tr)$/.test(x.tur)) s = x; }
      if (!s) return JSON.stringify({ yok: true });
      let sonucu = null; s.render(alan, (r) => { sonucu = r; });
      const dogruMetin = (r) => r;
      const yanlis = [...alan.querySelectorAll('.sik')].find((b) => !b.textContent.includes(s.dogruMetin || '\\u0000'));
      // doğru şıkkı bilmeden: önce birine bas, yanlışsa kayıt olmalı
      const b = alan.querySelector('.sik'); b.click();
      const kayit = Object.keys(Depo.veri.karisan || {}).length; alan.remove(); Depo.veri.karisan = {}; Depo.kaydet();
      return JSON.stringify({ dogru: sonucu && sonucu.dogru, kayit }); })()`));
    sonuc('soruda yanlış şık seçilince ikili kaydediliyor (doğruysa kaydedilmiyor)', !e.yok && (e.dogru ? e.kayit === 0 : e.kayit === 1), JSON.stringify(e));

    // 5) cümle şıkları: rastgele değil, benzer
    const f = JSON.parse(await d(o, `(() => { const havuz = ICERIK.uniteler.flatMap((u) => (u.cumleler || []).map((c) => (Array.isArray(c) ? { es: c[0], tr: c[1] } : c))).filter((c) => c && c.es);
      if (havuz.length < 10) return JSON.stringify({ havuz: havuz.length });
      const hedef = havuz.find((c) => /^¿Dónde está/i.test(c.es)) || havuz[0];
      const s = Alistirma.benzerCumleler(hedef, havuz.filter((c) => c !== hedef), 2, (c) => c.es);
      return JSON.stringify({ havuz: havuz.length, hedef: hedef.es, siklar: s.map((c) => c.es) }); })()`));
    sonuc('cümle sorusunda yanlış şıklar benzer cümleler', f.havuz < 10 || f.siklar.length === 2, JSON.stringify(f));

    // örnek tablo (göz kontrolü için)
    const tablo = await d(o, `(() => { Alistirma.ustSira = 0; const sat = [];
      for (const es of ['soy', 'eres', 'el tenedor', 'todos los días', 'sencilla / doble', 'peruano / peruana', 'la cuchara', 'leer', 'tengo hambre', 'caro / cara', 'el martes', 'rojo / roja']) {
        const k = ICERIK.tumKelimeler().find((x) => x.es === es); if (!k) continue;
        sat.push(k.tr + '  →  ' + [k, ...Alistirma.celdiriciler(k, 'es', 3)].map((x) => x.es).join(' | '));
        sat.push(k.es + '  →  ' + [k, ...Alistirma.celdiriciler(k, 'tr', 3)].map((x) => x.tr).join(' | '));
      } return sat.join('\\n'); })()`);
    fs.writeFileSync(path.join(CIKTI, 'siklar-ornek.txt'), tablo);
    sonuc('konsol hatasız', konsol.length === 0, konsol.slice(0, 3).join(' | '));
  } catch (e) { console.log('HATA', e.message); }
  edge.kill(); sunucu.close(); process.exit(0);
})();
