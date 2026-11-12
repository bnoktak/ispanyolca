/* =========================================================
   ¡Hola! İspanyolca · iPhone widget'ı (Scriptable)
   Bu dosya sitede durur; Scriptable'daki küçük yükleyici (Ayarlar → 📲 Widget kurulumu)
   onu indirip çalıştırır. Değişiklikler kendiliğinden telefona gelir.
   - Veri: Gist'teki widget.json (öğrenilen kelimeler + örnek cümleler, js/widget.js üretir)
   - Widget: kilit ekranı (dikdörtgen, satır içi, yuvarlak) ve ana ekran (küçük, orta, büyük)
   - Parametre "tr": Türkçe karşılık da görünür (widget ayarındaki Parameter kutusu)
   - Dokununca: Scriptable içinde kelime kartı (dokun → Türkçesi, ← Önceki / Geç →)
   ========================================================= */
module.exports = async function ispanyolcaWidget({ veriAdresi }) {
  const fm = FileManager.local();
  const ONBELLEK = fm.joinPath(fm.documentsDirectory(), 'ispanyolca-widget-veri.json');
  const YENILE_DK = 5;                       // iOS'tan istenen aralık (iOS genelde daha seyrek yeniler)
  const RENK = { zemin: new Color('#16161d'), zemin2: new Color('#2a2030'), ana: new Color('#ef6a45'), yazi: new Color('#ecebf2'), soluk: new Color('#9a97a8') };

  /* ---------- veri: önce internetten, olmazsa son indirilen ---------- */
  async function veriAl() {
    let veri = null;
    try {
      const r = new Request(veriAdresi + '?t=' + Math.floor(Date.now() / 60000));
      r.timeoutInterval = config.runsInWidget ? 6 : 10;
      const j = await r.loadJSON();
      if (j && Array.isArray(j.k)) { veri = j; fm.writeString(ONBELLEK, JSON.stringify(j)); }
    } catch (e) { /* çevrimdışı */ }
    if (!veri && fm.fileExists(ONBELLEK)) { try { veri = JSON.parse(fm.readString(ONBELLEK)); } catch (e) { /* bozuk */ } }
    return veri;
  }
  const rastgele = (a) => a[Math.floor(Math.random() * a.length)];
  const karistir = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ilkBicim = (es) => String(es).split(' / ')[0];
  const turkceGoster = /(^|\W)tr(\W|$)/i.test(String(args.widgetParameter || ''));

  const veri = await veriAl();
  const kelimeler = (veri && veri.k) || [];

  /* ---------- widget ---------- */
  if (config.runsInWidget) {
    const aile = config.widgetFamily || 'small';
    const w = new ListWidget();
    w.refreshAfterDate = new Date(Date.now() + YENILE_DK * 60000);
    const kilit = aile.startsWith('accessory');
    if (!kilit) {
      const g = new LinearGradient(); g.colors = [RENK.zemin, RENK.zemin2]; g.locations = [0, 1];
      w.backgroundGradient = g;
      w.setPadding(14, 14, 14, 14);
    }
    const metin = (kap, t, font, renk, satir) => { const x = kap.addText(t); x.font = font; if (renk && !kilit) x.textColor = renk; if (satir) x.lineLimit = satir; x.minimumScaleFactor = 0.6; return x; };

    if (!kelimeler.length) {
      if (aile === 'accessoryInline') metin(w, '🌮 İspanyolca: henüz kelime yok', Font.systemFont(12));
      else {
        metin(w, kilit ? 'İspanyolca' : '🌮 ¡Hola!', Font.boldSystemFont(kilit ? 13 : 18), RENK.ana);
        metin(w, veri ? 'İlk ünitenin kartlarını bitirince kelimeler burada görünür.' : 'Kelimeler indirilemedi: internet gerekiyor.', Font.systemFont(kilit ? 11 : 13), RENK.soluk, 3);
      }
      Script.setWidget(w); Script.complete(); return;
    }

    // orta: 2 kelime, büyük: 4 kelime, diğerleri 1
    const adet = aile === 'medium' ? 2 : aile === 'large' || aile === 'extraLarge' ? 4 : 1;
    const secilen = karistir(kelimeler).slice(0, adet);
    const k = secilen[0];
    const cumle = (x) => (x.c && x.c.length ? rastgele(x.c) : null);
    w.url = URLScheme.forRunningScript() + '?kelime=' + encodeURIComponent(k.id);

    if (aile === 'accessoryInline') {
      metin(w, turkceGoster ? `${ilkBicim(k.es)} = ${k.tr}` : `🇪🇸 ${ilkBicim(k.es)}`, Font.systemFont(12));
    } else if (aile === 'accessoryCircular') {
      w.addSpacer();
      const t = metin(w, ilkBicim(k.es), Font.boldSystemFont(13), null, 2); t.centerAlignText();
      w.addSpacer();
    } else if (aile === 'accessoryRectangular') {
      const c = cumle(k);
      metin(w, ilkBicim(k.es) + (turkceGoster ? ` · ${k.tr}` : ''), Font.boldSystemFont(15), null, 1);
      if (c) metin(w, c[0], Font.systemFont(12), null, turkceGoster ? 1 : 2);
      if (c && turkceGoster) metin(w, c[1], Font.italicSystemFont(11), null, 1);
      if (!c && !turkceGoster) metin(w, 'Anlamı için dokun', Font.systemFont(11), null, 1);
    } else {
      // ana ekran: renkli kart(lar)
      const ust = w.addStack(); ust.centerAlignContent();
      metin(ust, '🌮 İspanyolca', Font.semiboldSystemFont(11), RENK.soluk);
      w.addSpacer(adet > 1 ? 6 : 8);
      const satirlar = aile === 'medium' ? w.addStack() : w;
      secilen.forEach((x, i) => {
        if (aile === 'medium' && i > 0) satirlar.addSpacer(14);     // orta: iki kelime yan yana
        const kutu = aile === 'medium' ? satirlar.addStack() : w.addStack();
        kutu.layoutVertically();
        const c = cumle(x);
        metin(kutu, ilkBicim(x.es), Font.boldSystemFont(adet > 2 ? 18 : 22), RENK.ana, 1);
        if (turkceGoster) metin(kutu, x.tr, Font.mediumSystemFont(12), RENK.yazi, 1);
        if (c) { kutu.addSpacer(3); metin(kutu, c[0], Font.systemFont(adet > 2 ? 12 : 13), RENK.yazi, adet > 2 ? 1 : 3); }
        if (c && turkceGoster) metin(kutu, c[1], Font.italicSystemFont(11), RENK.soluk, adet > 2 ? 1 : 2);
        if (aile !== 'medium' && i < secilen.length - 1) w.addSpacer(8);
      });
      w.addSpacer();
    }
    Script.setWidget(w); Script.complete(); return;
  }

  /* ---------- uygulamada (widget'a dokununca ya da ▶︎ ile): kelime kartı ---------- */
  if (!kelimeler.length) {
    const a = new Alert(); a.title = '¡Hola! İspanyolca';
    a.message = veri ? 'Henüz öğrendiğin kelime yok. İlk ünitenin kartlarını bitirince burada görünür.' : 'Kelimeler indirilemedi. İnternet bağlantısını kontrol edip tekrar dene.';
    a.addAction('Tamam'); await a.present(); Script.complete(); return;
  }
  const ilkId = args.queryParameters && args.queryParameters.kelime;
  const ilk = kelimeler.find((x) => x.id === ilkId);
  const sira = ilk ? [ilk, ...karistir(kelimeler.filter((x) => x !== ilk))] : karistir(kelimeler);
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; height: 100%; background: #16161d; color: #ecebf2; font-family: -apple-system, system-ui, sans-serif; }
  body { display: flex; flex-direction: column; padding: calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom)); }
  .ust { text-align: center; color: #9a97a8; font-size: 14px; font-weight: 600; margin-bottom: 14px; }
  .kart { flex: 1; perspective: 1000px; min-height: 0; }
  .ic { position: relative; height: 100%; transition: transform .4s; transform-style: preserve-3d; }
  .kart.cevrik .ic { transform: rotateY(180deg); }
  .yuz { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 22px; padding: 24px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; text-align: center; }
  .on { background: #22222c; }
  .arka { background: #3a2620; border: 2px solid #b4441f; color: #ffd9cc; transform: rotateY(180deg); }
  .es { font-size: 38px; font-weight: 800; color: #ef6a45; }
  .tr { font-size: 30px; font-weight: 700; }
  .cumle { font-size: 20px; font-weight: 600; line-height: 1.4; }
  .arka .cumle { font-weight: 500; }
  .en { font-size: 17px; opacity: .8; }
  .ipucu { font-size: 14px; color: #9a97a8; }
  .ses { font-size: 26px; background: none; border: 2px solid #35353f; border-radius: 50%; width: 52px; height: 52px; color: inherit; }
  .alt { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
  button.d { font: inherit; font-size: 18px; font-weight: 700; border: none; border-radius: 14px; min-height: 56px; color: #fff; }
  .onceki { background: #22222c; border: 2px solid #35353f !important; }
  .onceki:disabled { opacity: .4; }
  .gec { background: #ef6a45; box-shadow: 0 4px 0 #b4441f; }
</style></head><body>
<div class="ust">🌮 ¡Hola! İspanyolca · <span id="no"></span></div>
<div class="kart" id="kart"><div class="ic">
  <div class="yuz on"><div class="es" id="es"></div><button class="ses" id="ses">🔊</button><div class="cumle" id="cumle"></div><div class="ipucu">Türkçesi için dokun</div></div>
  <div class="yuz arka"><div class="tr" id="tr"></div><div class="en" id="en"></div><div class="cumle" id="cumleTr"></div></div>
</div></div>
<div class="alt"><button class="d onceki" id="onceki">← Önceki</button><button class="d gec" id="gec">Geç →</button></div>
<script>
  const liste = ${JSON.stringify(sira).replace(/</g, '\\u003c')};
  let sira = liste.slice(), i = 0; const secim = {};
  const kar = (a) => { a = a.slice(); for (let j = a.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [a[j], a[r]] = [a[r], a[j]]; } return a; };
  const $ = (id) => document.getElementById(id);
  function sesli(t) { try { const u = new SpeechSynthesisUtterance(String(t).split(' / ')[0]); u.lang = 'es-MX'; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
  function ciz() {
    const k = sira[i]; if (!(k.id in secim)) secim[k.id] = k.c && k.c.length ? k.c[Math.floor(Math.random() * k.c.length)] : null;
    const c = secim[k.id];
    $('kart').classList.remove('cevrik');
    $('es').textContent = k.es; $('tr').textContent = k.tr; $('en').textContent = k.en ? '🇬🇧 ' + k.en : '';
    $('cumle').textContent = c ? c[0] : ''; $('cumleTr').textContent = c ? c[1] : '';
    $('onceki').disabled = i === 0; $('no').textContent = liste.length + ' kelime';
  }
  function sonraki() { i++; if (i >= sira.length) { let y = kar(liste); if (y.length > 1 && y[0] === sira[sira.length - 1]) y.push(y.shift()); sira = sira.concat(y); } ciz(); }
  function onceki() { if (i > 0) { i--; ciz(); } }
  $('kart').addEventListener('click', () => $('kart').classList.toggle('cevrik'));
  $('ses').addEventListener('click', (e) => { e.stopPropagation(); const k = sira[i]; sesli(secim[k.id] ? k.es + '. ' + secim[k.id][0] : k.es); });
  $('gec').addEventListener('click', sonraki); $('onceki').addEventListener('click', onceki);
  let x0 = null, y0 = null;
  $('kart').addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  $('kart').addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { e.preventDefault(); dx < 0 ? sonraki() : onceki(); } }, { passive: false });
  ciz();
</script></body></html>`;
  const wv = new WebView();
  await wv.loadHTML(html);
  await wv.present(true);
  Script.complete();
};
