// Kullanım (geliştirici): bu klasörde `node denetim.js` — cümle/boşluk/diyaloglarda öğretilmemiş kelime var mı kontrol eder
// Her ünitenin cümle/boşluk/diyalog metinlerinde henüz öğretilmemiş kelime var mı?
global.window = global; require(process.cwd() + '/icerik/icerik.js'); const fs = require('fs');
for (const f of fs.readdirSync('icerik').filter(f => /^u\d/.test(f)).sort()) eval(fs.readFileSync('icerik/' + f, 'utf8'));
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
let sorun = 0; const gorulen = new Map();
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
}
console.log(sorun ? `${sorun} sorun` : 'Temiz: öğretilmemiş kelime yok');
