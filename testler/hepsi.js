// Bütün testler tek komutla: node testler/hepsi.js   (yalnızca bazıları: node testler/hepsi.js ozet renk)
// Önce içerik denetimi, sonra tarayıcı testleri sırayla. En sonda özet; bir şey kalırsa çıkış kodu 1.
// Gerekenler: Node.js ve Edge / Chrome / Vivaldi (ayrıntı: ortak.js). Ekran görüntüleri: testler/ciktilar/
const { spawnSync } = require('child_process'), path = require('path'), fs = require('fs');
const KOK = path.resolve(__dirname, '..'), CIKTI = path.join(__dirname, 'ciktilar');

// sıra önemli: widget, scriptable'ın ürettiği widget-kart.html'i kullanır
const TESTLER = ['birlestir', 'pwa', 'senkron', 'telefon', 'telefon2', 'mini', 'scriptable', 'widget', 'buyuk', 'dinleme', 'renk', 'ozet'];
// zamanlamaya duyarlı testler bir kez daha denenir
const TEKRAR_DENE = ['telefon', 'telefon2'];
const secili = process.argv.slice(2).length ? process.argv.slice(2) : TESTLER;

// önceki çalıştırmalardan arkada kalmış test tarayıcılarını kapat, eski profilleri temizle
fs.mkdirSync(CIKTI, { recursive: true });
require('./ortak').tarayicilariKapat(path.join(CIKTI, 'profil-'));
for (const d of fs.readdirSync(CIKTI).filter((d) => d.startsWith('profil-'))) { try { fs.rmSync(path.join(CIKTI, d), { recursive: true, force: true }); } catch (e) {} }

const ozet = [];
const calistir = (ad, komut, argumanlar) => {
  const r = spawnSync(process.execPath, argumanlar, { cwd: KOK, encoding: 'utf8', timeout: 6 * 60 * 1000 });
  const cikti = (r.stdout || '') + (r.stderr || '');
  const satirlar = cikti.split('\n');
  const gecti = satirlar.filter((s) => s.startsWith('GEÇTİ')).length;
  const kaldi = satirlar.filter((s) => /^(KALDI|HATA)/.test(s) || /^\s*(KELİME YOK|GRUP YOK)/.test(s));
  return { ad, cikti, gecti, kaldi, kod: r.status, zamanAsimi: r.error && r.error.code === 'ETIMEDOUT' };
};

console.log('== içerik denetimi');
const den = calistir('denetim', 'node', ['denetim.js']);
const temiz = /Temiz: öğretilmemiş kelime yok/.test(den.cikti);
console.log(den.cikti.trim().split('\n').slice(-3).join('\n'));
ozet.push({ ad: 'denetim', ok: temiz, not: temiz ? 'Temiz' : 'sorun var (yukarıya bak)' });

for (const ad of secili) {
  if (!TESTLER.includes(ad)) { console.log(`?? bilinmeyen test: ${ad} (seçenekler: ${TESTLER.join(', ')})`); continue; }
  process.stdout.write(`== ${ad} … `);
  let s = calistir(ad, 'node', [path.join(__dirname, ad + '.js')]);
  let ok = s.kaldi.length === 0 && s.gecti > 0 && !s.zamanAsimi;
  if (!ok && TEKRAR_DENE.includes(ad)) { process.stdout.write('bir kez daha … '); s = calistir(ad, 'node', [path.join(__dirname, ad + '.js')]); ok = s.kaldi.length === 0 && s.gecti > 0 && !s.zamanAsimi; }
  console.log(ok ? `${s.gecti} geçti` : 'SORUN');
  if (!ok) console.log(s.cikti.split('\n').filter((x) => !x.startsWith('GEÇTİ')).join('\n').trim() || (s.zamanAsimi ? 'zaman aşımı' : 'hiç sonuç yok'));
  ozet.push({ ad, ok, not: ok ? `${s.gecti} geçti` : `${s.kaldi.length} kaldı${s.zamanAsimi ? ', zaman aşımı' : ''}` });
}

console.log('\n==== ÖZET ====');
ozet.forEach((x) => console.log(`${x.ok ? '✅' : '❌'} ${x.ad.padEnd(11)} ${x.not}`));
const kotu = ozet.filter((x) => !x.ok).length;
console.log(kotu ? `\n${kotu} test sorunlu.` : '\nHepsi geçti.');
console.log(`Ekran görüntüleri: ${CIKTI}`);
process.exit(kotu ? 1 : 0);
