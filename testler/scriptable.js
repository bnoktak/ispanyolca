// Sahte Scriptable ortamında widget testi: node testler/scriptable.js
// Yükleyiciyi js/widget.js'ten üretir, kodu ve veriyi yerel sunucudan indirtir, her widget türünü çizdirir.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { KOK, CIKTI } = require('./ortak');
const PORT = 8771;
let sunucuAcik = true, veriJson = null;
const sunucu = http.createServer((q, r) => {
  if (!sunucuAcik) { r.socket.destroy(); return; }
  const p = new URL(q.url, 'http://x').pathname;
  if (p === '/widget.json') { r.writeHead(200, { 'Content-Type': 'application/json' }); return r.end(JSON.stringify(veriJson)); }
  if (p === '/widget/ispanyolca-widget.js') { r.writeHead(200, { 'Content-Type': 'text/javascript' }); return r.end(fs.readFileSync(path.join(KOK, 'widget/ispanyolca-widget.js'))); }
  r.writeHead(404); r.end();
}).listen(PORT);

// ---- örnek widget.json: gerçek içerikten, js/widget.js ile (ilk 3 ünitenin kartları görülmüş) ----
global.window = global; global.location = { protocol: 'file:', hostname: '', href: 'file:///x/index.html' };
require(path.join(KOK, 'icerik/icerik.js'));
for (const f of fs.readdirSync(path.join(KOK, 'icerik')).filter((f) => /^(u\d|x\d)/.test(f)).sort()) eval(fs.readFileSync(path.join(KOK, 'icerik', f), 'utf8'));
eval(fs.readFileSync(path.join(KOK, 'icerik', 'kelime-cumleleri.js'), 'utf8'));
const ac = ['u01', 'u02', 'u03'];
global.Depo = { veri: { kelimeler: {}, uniteler: {} } };
ac.forEach((id) => { Depo.veri.uniteler[id] = { adimlar: { kart: true } }; ICERIK.bul(id).kelimeler.forEach((k) => { Depo.veri.kelimeler[k.id] = { kutu: 1 }; }); });
global.Cihaz = { al: (k) => ({ gistSahip: 'ornek', gistId: 'abc123' })[k] };
eval(fs.readFileSync(path.join(KOK, 'js/widget.js'), 'utf8'));
veriJson = Widget.veri();
const yukleyiciGercek = Widget.yukleyici();

let gecti = 0, kaldi = 0;
const sonuc = (ad, ok, ek = '') => { ok ? gecti++ : kaldi++; console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${ad}${ek ? ' · ' + ek : ''}`); };

// ---- sahte Scriptable API'si ----
const BELGE = fs.mkdtempSync(path.join(os.tmpdir(), 'scriptable-'));
const kayit = { widget: null, html: null, alert: null };
class Metin { constructor(t) { this.t = t; } centerAlignText() {} }
class Yigin { constructor() { this.cocuk = []; } addText(t) { const x = new Metin(t); this.cocuk.push(x); return x; } addStack() { const s = new Yigin(); this.cocuk.push(s); return s; }
  addSpacer() {} layoutVertically() {} layoutHorizontally() {} centerAlignContent() {} setPadding() {} metinler() { return this.cocuk.flatMap((c) => (c instanceof Metin ? [c.t] : c.metinler())); } }
const ortam = {
  FileManager: { local: () => ({ documentsDirectory: () => BELGE, joinPath: (a, b) => path.join(a, b), fileExists: (p) => fs.existsSync(p),
    writeString: (p, s) => fs.writeFileSync(p, s), readString: (p) => fs.readFileSync(p, 'utf8'), modificationDate: (p) => fs.statSync(p).mtime }) },
  Request: class { constructor(u) { this.url = u; this.response = {}; }
    async loadString() { const r = await fetch(this.url); this.response = { statusCode: r.status }; return r.text(); }
    async loadJSON() { return JSON.parse(await this.loadString()); } },
  ListWidget: class extends Yigin { constructor() { super(); kayit.widget = this; } },
  Color: class { constructor(h) { this.h = h; } }, LinearGradient: class {}, Size: class {},
  Font: new Proxy({}, { get: () => (n) => ({ n }) }),
  Script: { setWidget: (w) => { kayit.widget = w; }, complete: () => {} },
  URLScheme: { forRunningScript: () => 'scriptable:///run/%C4%B0spanyolca' },
  WebView: class { async loadHTML(h) { kayit.html = h; } async present() {} },
  Alert: class { addAction() {} async present() { kayit.alert = this.message; } },
  config: {}, args: {}
};
Object.assign(global, ortam);
global.importModule = (p) => { delete require.cache[require.resolve(p)]; return require(p); };

// Yükleyiciyi çalıştır (adresler yerel sunucuya çevrilir)
const yukleyici = yukleyiciGercek
  .replace(/const VERI = '[^']+'/, `const VERI = 'http://127.0.0.1:${PORT}/widget.json'`)
  .replace(/const KOD = '[^']+'/, `const KOD = 'http://127.0.0.1:${PORT}/widget/ispanyolca-widget.js'`);
async function calistir(cfg, arg) {
  kayit.widget = null; kayit.html = null; kayit.alert = null;
  global.config = cfg; global.args = arg || {};
  await (new Function('return (async () => {' + yukleyici + '})()'))();
}

(async () => {
  try {
    sonuc('yükleyici kodu Gist adresini ve site adresini içeriyor', yukleyiciGercek.includes('https://gist.githubusercontent.com/ornek/abc123/raw/widget.json') && yukleyiciGercek.includes('https://bnoktak.github.io/ispanyolca/widget/ispanyolca-widget.js'));
    sonuc('widget.json: öğrenilen kelimeler, imza, cümleler', veriJson.k.length > 50 && veriJson.imza && veriJson.k.some((x) => x.c), `${veriJson.k.length} kelime, ${veriJson.k.filter((x) => x.c).length} cümleli, ${JSON.stringify(veriJson).length} bayt`);
    const izinli = new Set([...ICERIK.uniteler.filter((u) => ac.includes(u.id)).flatMap((u) => u.cumleler.map((c) => c.es)), ...Object.values(ICERIK.kelimeCumleleri || {}).map((x) => x[0])]);
    sonuc('widget.json cümleleri yalnızca kartı görülmüş ünitelerden', veriJson.k.every((x) => !x.c || x.c.every((c) => izinli.has(c[0]))));
    const imza2 = Widget.veri().imza;
    sonuc('aynı ilerlemede imza aynı (gereksiz yazma yok)', imza2 === veriJson.imza);

    const esler = new Set(veriJson.k.map((x) => x.es.split(' / ')[0]));
    const trler = new Set(veriJson.k.map((x) => x.tr));
    // kilit ekranı dikdörtgen
    await calistir({ runsInWidget: true, widgetFamily: 'accessoryRectangular' }, { widgetParameter: null });
    let m = kayit.widget.metinler();
    sonuc('kilit ekranı (dikdörtgen): kelime var, Türkçe yok, dokununca kart adresi', esler.has(m[0]) && !m.some((t) => trler.has(t)) && /kelime=/.test(kayit.widget.url), JSON.stringify(m));
    await calistir({ runsInWidget: true, widgetFamily: 'accessoryRectangular' }, { widgetParameter: 'tr' });
    m = kayit.widget.metinler();
    sonuc('kilit ekranı + "tr" parametresi: Türkçe de görünüyor', / · /.test(m[0]), JSON.stringify(m));
    await calistir({ runsInWidget: true, widgetFamily: 'accessoryInline' });
    sonuc('kilit ekranı (satır içi): tek satır kelime', kayit.widget.metinler().length === 1 && /^🇪🇸 /.test(kayit.widget.metinler()[0]), kayit.widget.metinler()[0]);
    await calistir({ runsInWidget: true, widgetFamily: 'accessoryCircular' });
    sonuc('kilit ekranı (yuvarlak): kelime', kayit.widget.metinler().length === 1);
    await calistir({ runsInWidget: true, widgetFamily: 'small' });
    m = kayit.widget.metinler();
    sonuc('ana ekran (küçük): başlık + kelime', m[0] === '🌮 İspanyolca' && esler.has(m[1]), JSON.stringify(m));
    await calistir({ runsInWidget: true, widgetFamily: 'medium' }, { widgetParameter: 'tr' });
    m = kayit.widget.metinler();
    sonuc('ana ekran (orta): 2 kelime, Türkçeleriyle', m.filter((t) => esler.has(t)).length >= 2 && m.filter((t) => trler.has(t)).length >= 2, JSON.stringify(m).slice(0, 160));
    await calistir({ runsInWidget: true, widgetFamily: 'large' });
    sonuc('ana ekran (büyük): 4 kelime', kayit.widget.metinler().filter((t) => esler.has(t)).length >= 4);
    sonuc('yenileme isteği ~5 dk sonra', Math.abs(kayit.widget.refreshAfterDate - Date.now() - 300000) < 5000);

    // dokununca: uygulamada kart (WebView), istenen kelimeyle başlar
    const hedef = veriJson.k.find((x) => x.c);
    await calistir({ runsInWidget: false }, { queryParameters: { kelime: hedef.id } });
    const liste = JSON.parse(/const liste = (\[.*?\]);\n/s.exec(kayit.html)[1]);
    sonuc('dokununca kelime kartı açılıyor, dokunulan kelimeyle başlıyor', liste[0].id === hedef.id && liste.length === veriJson.k.length);
    fs.writeFileSync(path.join(CIKTI, 'widget-kart.html'), kayit.html);

    // çevrimdışı: son indirilen kod ve veriyle çalışır
    sunucuAcik = false;
    await calistir({ runsInWidget: true, widgetFamily: 'accessoryRectangular' });
    sonuc('çevrimdışı: son indirilen kod ve kelimelerle çalışıyor', kayit.widget && esler.has(kayit.widget.metinler()[0]));
    sunucuAcik = true;

    // hiç kelime yok
    veriJson = { surum: 1, k: [], imza: 'x' };
    await calistir({ runsInWidget: true, widgetFamily: 'accessoryRectangular' });
    sonuc('henüz kelime yoksa açıklama gösteriyor', /kartlarını bitirince/.test(kayit.widget.metinler().join(' ')), kayit.widget.metinler().join(' | '));
    await calistir({ runsInWidget: false }, {});
    sonuc('henüz kelime yoksa uygulamada uyarı', /Henüz öğrendiğin kelime yok/.test(kayit.alert || ''));

    // ilk kurulum internet yokken: anlaşılır hata
    fs.rmSync(BELGE, { recursive: true, force: true }); fs.mkdirSync(BELGE); sunucuAcik = false;
    let hata = null; try { await calistir({ runsInWidget: true, widgetFamily: 'small' }); } catch (e) { hata = e.message; }
    sonuc('ilk kurulumda internet yoksa anlaşılır hata', /indirilemedi/.test(hata || ''), hata);
  } catch (e) { console.log('HATA', e.stack); }
  console.log(`\n${gecti} geçti, ${kaldi} kaldı`);
  sunucu.close(); fs.rmSync(BELGE, { recursive: true, force: true }); process.exit(0);
})();
