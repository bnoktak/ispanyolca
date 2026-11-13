// Kullanım (geliştirici): bu klasörde `node denetim.js` — cümle/boşluk/diyaloglarda öğretilmemiş kelime var mı kontrol eder
// Her ünitenin cümle/boşluk/diyalog metinlerinde henüz öğretilmemiş kelime var mı?
global.window = global; require(process.cwd() + '/icerik/icerik.js'); const fs = require('fs');
for (const f of fs.readdirSync('icerik').filter(f => /^(u|x)\d/.test(f)).sort()) eval(fs.readFileSync('icerik/' + f, 'utf8'));
// kelime örnek cümleleri (claude.ai'da yazılır, cumle-hazirlik.js ile hazırlanır): ICERIK.kelimeCumleleri = { kelimeId: [es, tr] }
if (fs.existsSync('icerik/kelime-cumleleri.js')) eval(fs.readFileSync('icerik/kelime-cumleleri.js', 'utf8'));
const KC = ICERIK.kelimeCumleleri || {};
// 🎧 uzun dinleme sahneleri (büyük sınav): ICERIK.dinlemeler = [{ id, blok, uid, sahne, satirlar, tr, anla, cevap }]
if (fs.existsSync('icerik/dinleme.js')) eval(fs.readFileSync('icerik/dinleme.js', 'utf8'));
const DL = ICERIK.dinlemeler || [];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:…"—\[\]]/g, ' ');
// notlarda açıkça öğretilen küçük kelimeler + özel isimler
const NOT_EK = { u02: ['ana', 'turquia', 'colombia', 'batuhan'], u04: ['un', 'una', 'mis', 'tus', 'sus', 'ankara'], u05: ['del'], u09: ['veintiun'], u11: ['al'], u12: ['yılmaz', 'mehmet'], u13: ['juarez', 'reforma', 'tercer'], u16: ['ciento', 'doscientos'], u17: ['penicilina'], u21: ['kalem', 'kapı', 'lapices'], u24: ['cartagena', 'peru'] };
const izinli = new Set(); const fiiller = [];
const bilinir = (w) => {
  if (izinli.has(w)) return true;
  if (/s$/.test(w) && (izinli.has(w.slice(0, -1)) || izinli.has(w.slice(0, -2)))) return true;          // çoğul
  if (/a$/.test(w) && izinli.has(w.slice(0, -1) + 'o')) return true;                                   // dişil
  if (/as$/.test(w) && izinli.has(w.slice(0, -2) + 'o')) return true;
  for (const v of fiiller) { const kok = v.slice(0, -2), t = v.slice(-2);                               // Ünite 17'den sonra düzenli çekimler
    const ekler = t === 'ar' ? ['o', 'as', 'a', 'amos', 'an'] : t === 'er' ? ['o', 'es', 'e', 'emos', 'en'] : ['o', 'es', 'e', 'imos', 'en'];
    if (ekler.some((e) => kok + e === w)) return true; }
  return false;
};
let sorun = 0, uyari = 0; const gorulen = new Map();
// cümlede kelimenin kendisi (ya da çekimli / çoğul / dişil hâli) geçiyor mu?
const tumCekimler = [...ICERIK.uniteler, ...ICERIK.ekler].flatMap(u => u.cekimler || []);
function kelimeGeciyor(k, cumle) {
  const c = ' ' + norm(cumle).split(/\s+/).filter(Boolean).join(' ') + ' ';
  return k.es.split(' / ').some((alt) => {
    // boşluklu kalıp ("¿cómo se dice… en español?"): parçaların her biri sırayla geçmeli
    if (alt.includes('…') && alt.split('…').filter((p) => norm(p).trim()).length > 1) {
      let i = 0;
      return alt.split('…').map((p) => norm(p).trim().split(/\s+/).join(' ')).filter(Boolean).every((p) => { const j = c.indexOf(' ' + p + ' ', i); if (j < 0) return false; i = j + p.length; return true; });
    }
    const w = norm(alt).replace(/^\s*(el|la|los|las|un|una)\s+/, '').trim().split(/\s+/).join(' ');
    if (!w) return false;
    // "al lado de" ↔ "al lado del": del = de + el, al = a + el (zorunlu kısaltmalar)
    const ac = (s) => s.replace(/ del /g, ' de el ').replace(/ al /g, ' a el ');
    if (w.includes(' ')) return c.includes(' ' + w + ' ') || ac(c).includes(ac(' ' + w + ' '));
    const bicim = new Set([w, w + 's', w + 'es', w.replace(/o$/, 'a'), w.replace(/o$/, 'as'), w.replace(/z$/, 'ces')]);
    const fiil = /(ar|er|ir)(se)?$/.test(w) ? w.replace(/se$/, '') : null;
    if (fiil) {
      tumCekimler.filter(x => [fiil, w].includes(norm(x.fiil).trim())).forEach(x => ['yo', 'tu', 'el', 'nos', 'ellos'].forEach(y => x[y] && norm(x[y]).trim().split(/\s+/).forEach(f => bicim.add(f))));
      const kok = fiil.slice(0, -2), t = fiil.slice(-2);
      (t === 'ar' ? ['o', 'as', 'a', 'amos', 'an'] : t === 'er' ? ['o', 'es', 'e', 'emos', 'en'] : ['o', 'es', 'e', 'imos', 'en']).forEach(e => bicim.add(kok + e));
    }
    return c.split(' ').some(t => bicim.has(t));
  });
}
function cumleDenetle(u) {
  u.kelimeler.filter(k => KC[k.id]).forEach(k => {
    const x = KC[k.id];
    if (!Array.isArray(x) || x.length !== 2 || !x[0] || !x[1]) { sorun++; console.log('CÜMLE BİÇİM', k.id, JSON.stringify(x)); return; }
    const bil = norm(x[0]).split(/\s+/).filter(Boolean).filter(w => !bilinir(w));
    if (bil.length) { sorun++; console.log('CÜMLE', k.id, '|', x[0], '→ öğretilmemiş:', bil.join(', ')); }
    if (x[0].split(/\s+/).length > 7) { sorun++; console.log('CÜMLE UZUN', k.id, '|', x[0]); }
    if (!kelimeGeciyor(k, x[0])) { uyari++; console.log('UYARI', k.id, `(${k.es})`, '|', x[0], '→ kelime cümlede bulunamadı (düzensiz çekimse yok sayılabilir)'); }
  });
}
Object.keys(KC).filter(id => !ICERIK.kelime(id)).forEach(id => { sorun++; console.log('CÜMLE: böyle bir kelime yok', id); });
// sahneler: biçim (bir kez) + İspanyolca metin ve cevap şıkları sahnenin uid'sine göre (ünite döngüsünde)
const BLOKLAR = { b01: [1, 5], b02: [6, 10], b03: [11, 15], b04: [16, 20], b05: [21, 27] };
const dlGorulen = new Set();
DL.forEach(s => {
  const yaz = (m) => { sorun++; console.log('SAHNE', s.id || '?', '|', m); };
  if (!s.id || dlGorulen.has(s.id)) yaz('kimlik yok ya da tekrar'); dlGorulen.add(s.id);
  const u = ICERIK.uniteler.find(x => x.id === s.uid);
  if (!u) yaz('uid ana ünite değil: ' + s.uid);
  if (!BLOKLAR[s.blok]) yaz('blok geçersiz: ' + s.blok);
  else if (u && u.sira > BLOKLAR[s.blok][1]) yaz(`uid (${s.uid}) bloğun (${s.blok}) son ünitesinden sonra`);
  if (!s.sahne || !s.tr || !Array.isArray(s.satirlar) || !s.satirlar.length || s.satirlar.some(x => !['A', 'B'].includes(x[0]) || !x[1])) yaz('sahne / tr / satirlar biçimi');
  if (!s.anla && !s.cevap) yaz('anla ya da cevap sorusu yok');
  ['anla', 'cevap'].filter(t => s[t]).forEach(t => {
    const q = s[t];
    if (!q.soru || !Array.isArray(q.siklar) || q.siklar.length < 3 || q.siklar.length > 4) yaz(`${t}: soru / 3–4 şık`);
    else if (new Set(q.siklar.map(x => String(x).trim().toLowerCase())).size !== q.siklar.length) yaz(`${t}: aynı şık iki kez`);
  });
});
function sahneDenetle(u) {
  DL.filter(s => s.uid === u.id).forEach(s => {
    [...s.satirlar.map(x => x[1]), ...((s.cevap && s.cevap.siklar) || [])].forEach(m => {
      const bil = norm(m).split(/\s+/).filter(Boolean).filter(w => !bilinir(w));
      if (bil.length) { sorun++; console.log('SAHNE', s.id, '|', m, '→ öğretilmemiş:', bil.join(', ')); }
    });
  });
}
for (const u of ICERIK.uniteler) {
  u.kelimeler.forEach(k => norm(k.es).split(/[\s/]+/).filter(Boolean).forEach(w => izinli.add(w)));
  (NOT_EK[u.id] || []).forEach(w => izinli.add(w));
  if (u.sira >= 17) u.kelimeler.filter(k => /^[a-z]+(ar|er|ir)$/.test(norm(k.es).trim())).forEach(k => fiiller.push(norm(k.es).trim()));
  (u.cekimler || []).forEach(c => ['fiil', 'yo', 'tu', 'el', 'nos', 'ellos'].forEach(x => norm(c[x]).split(/\s+/).filter(Boolean).forEach(w => izinli.add(w))));
  u.kelimeler.forEach(k => { const n = k.es.trim().toLowerCase(); if (gorulen.has(n)) { sorun++; console.log('TEKRAR', u.id, k.es, '←', gorulen.get(n)); } else gorulen.set(n, u.id); });
  const metinler = [...u.cumleler.map(c => c.es), ...(u.bosluklar || []).flatMap(b => [...b.satirlar, ...(b.secenek || [])]), ...(u.soruCevap || []).flat()];
  for (const m of metinler) {
    const bil = norm(m).split(/\s+/).filter(Boolean).filter(w => !bilinir(w));
    if (bil.length) { sorun++; console.log(u.id, '|', m, '→', bil.join(', ')); }
  }
  cumleDenetle(u);
  sahneDenetle(u);
}
// ek üniteler (kilitsiz): tüm ana ünitelerin kelimeleri + kendi kelimeleri
for (const u of ICERIK.ekler) { u.kelimeler.forEach(k => norm(k.es).split(/[\s/]+/).filter(Boolean).forEach(w => izinli.add(w))); cumleDenetle(u); }
if (DL.length) console.log(`Dinleme sahneleri: ${DL.length} (${Object.keys(BLOKLAR).map(b => `${b}: ${DL.filter(s => s.blok === b).length}`).join(', ')})`);
if (Object.keys(KC).length) console.log(`Kelime cümleleri: ${Object.keys(KC).length} / ${[...ICERIK.uniteler, ...ICERIK.ekler].flatMap(u => u.kelimeler).filter(k => k.yazma !== false).length} kelimenin cümlesi var${uyari ? `, ${uyari} uyarı` : ''}`);
// Yayın listesi: index.html'deki her dosya sw.js'de (çevrimdışı önbellek) var mı, listedeki dosyalar gerçekten var mı?
const html = fs.readFileSync('index.html', 'utf8'), sw = fs.readFileSync('sw.js', 'utf8');
const swListe = (sw.match(/const DOSYALAR = \[([\s\S]*?)\]/) || [, ''])[1].match(/'[^']+'/g).map((s) => s.slice(1, -1));
[...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]).filter((y) => !swListe.includes(y))
  .forEach((y) => { sorun++; console.log('sw.js listesinde yok:', y); });
swListe.filter((y) => y !== './' && !fs.existsSync(y)).forEach((y) => { sorun++; console.log('sw.js listesindeki dosya yok:', y); });
console.log(sorun ? `${sorun} sorun` : 'Temiz: öğretilmemiş kelime yok');
