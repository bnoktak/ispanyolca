// Kullanım (geliştirici): bu klasörde `node cumle-hazirlik.js`
// claude.ai'da kelime örnek cümlelerini yazdırmak için hazırlık dosyaları üretir → hazirlik/cumle-grup-N.md
// Her dosya: kurallar + cümle yazılacak kelimeler (id, İspanyolca, Türkçe, varsa ünite cümlesinden örnek)
//            + o gruba kadar izin verilen kelimeler (ünite ünite, birikimli) + çıktı biçimi.
// Gelen cümleler icerik/kelime-cumleleri.js'e eklenir ve `node denetim.js` ile denetlenir.
global.window = global;
const fs = require('fs'), path = require('path');
require(process.cwd() + '/icerik/icerik.js');
for (const f of fs.readdirSync('icerik').filter((f) => /^(u\d|x\d)/.test(f)).sort()) eval(fs.readFileSync('icerik/' + f, 'utf8'));
let mevcut = {};
if (fs.existsSync('icerik/kelime-cumleleri.js')) { eval(fs.readFileSync('icerik/kelime-cumleleri.js', 'utf8')); mevcut = ICERIK.kelimeCumleleri || {}; }

const GRUPLAR = [['u01', 'u05'], ['u06', 'u10'], ['u11', 'u15'], ['u16', 'u20'], ['u21', 'u27'], ['x01', 'x02']];
const ANA = ICERIK.uniteler, EK = ICERIK.ekler, TUM = [...ANA, ...EK];
const norm = (s) => ' ' + String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:"“”…—()]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

// ünite cümlelerinden kelimeyi içeren en kısa cümle (claude.ai'a örnek olarak)
function ornek(k) {
  const u = ICERIK.bul(k.unite);
  const kaynak = u.ek ? [...ANA, u] : ANA.filter((x) => x.sira <= u.sira);
  const bicimler = k.es.split(' / ').map((x) => norm(x.replace(/^(el|la|los|las|un|una) /i, ''))).filter((b) => b.trim().length > 1);
  const c = kaynak.flatMap((x) => x.cumleler || []).filter((c) => !c.es.includes('—') && bicimler.some((b) => norm(c.es).includes(b)))
    .sort((a, b) => a.es.length - b.es.length)[0];
  return c ? `${c.es} = ${c.tr}` : '';
}
// bir ünitenin öğrettiği kelimeler (çekimler dahil), izin listesi için
function uniteKelimeleri(u) {
  const k = u.kelimeler.filter((x) => x.yazma !== false).map((x) => x.es);
  const c = (u.cekimler || []).map((x) => `${x.fiil} (${['yo', 'tu', 'el', 'nos', 'ellos'].map((y) => x[y]).filter(Boolean).join(', ')})`);
  return k.join(', ') + (c.length ? `\n  çekimler: ${c.join(' · ')}` : '');
}

fs.mkdirSync('hazirlik', { recursive: true });
GRUPLAR.forEach(([bas, son], gi) => {
  const ek = bas.startsWith('x');
  const uniteler = ek ? EK : ANA.filter((u) => u.id >= bas && u.id <= son);
  const sonSira = ek ? 999 : ICERIK.bul(son).sira;
  const izinli = ek ? [...ANA, ...EK] : ANA.filter((u) => u.sira <= sonSira);
  const kelimeler = uniteler.flatMap((u) => u.kelimeler.filter((k) => k.yazma !== false).map((k) => ({ u, k })));
  const yazilmis = kelimeler.filter(({ k }) => mevcut[k.id]).length;
  const baslik = ek ? 'Ek üniteler' : `Ünite ${ICERIK.bul(bas).sira}–${sonSira}`;
  let md = `# Kelime örnek cümleleri · Grup ${gi + 1} (${baslik}) · ${kelimeler.length} kelime${yazilmis ? ` (${yazilmis} tanesi zaten yazılmış)` : ''}

Bu dosyanın tamamını claude.ai'a yapıştır ve aşağıdaki her kelime için bir örnek cümle yazmasını iste.

## Kurallar
1. Her kelime için TEK cümle: İspanyolca + doğal Türkçe çevirisi.
2. Cümle o kelimeyi içermeli. Fiillerde çekimli hâli (hablo, quieres…), isimlerde/sıfatlarda çoğul ya da dişil hâli olabilir.
3. En fazla 6 kelime. Kısa ve doğal; gezide, tanışmada, barda, restoranda gerçekten kullanılacak cümleler. Ders kitabı cümlesi değil.
4. YALNIZCA öğretilmiş kelimeler: ${ek ? 'ek ünitelerde tüm ana ünitelerin kelimeleri ve o ek ünitenin kendi kelimeleri kullanılabilir.' : '**kelimenin kendi ünitesine kadar** (o ünite dahil) öğretilmiş kelimeler. Örneğin Ünite 3 kelimesinin cümlesinde Ünite 4 ve sonrasının kelimeleri YASAK.'} İzin verilen kelimeler aşağıda ünite ünite. Listedeki kelimelerin çoğul/dişil hâlleri ve listedeki çekimler serbest. Özel isimler serbest (Ana, Colombia, Turquía, Bogotá…).
5. Genel Güney Amerika İspanyolcası: ustedes (vosotros yok), carro, celular, jugo, plata değil dinero…
6. Kelimenin anlamını iyi gösteren bir cümle seç. "Mevcut örnek" uygunsa ve 6 kelimeyi geçmiyorsa onu da kullanabilirsin.
7. Kurallara uyan doğal bir cümle kurulamıyorsa (özellikle Ünite 1'de kelime çok az) o kelimeyi ATLA, satır yazma; 2–3 kelimelik kısa ifadeler de olur (\"¡Sí, cerveza!\"). Uydurma ya da yasak kelimeli cümle yazma.
8. Çıktı YALNIZCA aşağıdaki biçimde satırlar olsun, başka açıklama yazma. Kimlikleri aynen koru:
   'u02_hola': ['Hola, ¿cómo estás?', 'Merhaba, nasılsın?'],
   Metin içinde tek tırnak gerekirse \\' yaz (Türkiye\\'de).

## Cümle yazılacak kelimeler
`;
  uniteler.forEach((u) => {
    md += `\n### ${u.ek ? 'Ek ünite' : `Ünite ${u.sira}`} · ${u.baslik}${u.ek ? '' : u.sira === 1 ? ' (yalnızca Ünite 1 kelimeleri)' : ` (yalnızca Ünite 1–${u.sira} kelimeleri)`}\n`;
    u.kelimeler.filter((k) => k.yazma !== false).forEach((k) => {
      const o = ornek(k);
      md += `- ${k.id} | ${k.es} | ${k.tr}${o ? ` | mevcut örnek: ${o}` : ''}${mevcut[k.id] ? ` | ZATEN YAZILDI: ${mevcut[k.id][0]}` : ''}\n`;
    });
  });
  md += `\n## İzin verilen kelimeler (birikimli)\n`;
  izinli.forEach((u) => { md += `\n${u.ek ? 'Ek ünite' : `Ünite ${u.sira}`} (${u.baslik}): ${uniteKelimeleri(u)}\n`; });
  md += `\n## Çıktı örneği\n'u02_hola': ['Hola, ¿cómo estás?', 'Merhaba, nasılsın?'],\n'u02_gracias': ['Muchas gracias, señor.', 'Çok teşekkürler, beyefendi.'],\n`;
  fs.writeFileSync(path.join('hazirlik', `cumle-grup-${gi + 1}.md`), md);
  console.log(`hazirlik/cumle-grup-${gi + 1}.md  ${baslik}: ${kelimeler.length} kelime, ${Math.round(md.length / 1024)} KB`);
});
