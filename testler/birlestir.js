// Senkron birleştirme senaryoları (saf fonksiyon): node testler/birlestir.js
const path = require('path'), fs = require('fs');
const { KOK } = require('./ortak');
global.window = global; global.document = { addEventListener() {} }; global.addEventListener = () => {};
eval(fs.readFileSync(path.join(KOK, 'js/senkron.js'), 'utf8'));
const { birlestir, ayniMi } = Senkron;
let gecti = 0, kaldi = 0;
const test = (ad, kosul, ek) => { if (kosul) gecti++; else kaldi++; console.log(`${kosul ? 'GEÇTİ ' : 'KALDI '} ${ad}${!kosul && ek ? ' · ' + JSON.stringify(ek) : ''}`); };
const bos = (ek = {}) => ({ surum: 2, olusturulma: 1000, guncelleme: 1000, sifirlama: 0, uniteler: {}, kelimeler: {}, puanlar: [], ayarlar: {}, ...ek });
const kel = (son, kutu, dogru = 1, yanlis = 0) => ({ kutu, sonraki: son + 1, dogru, yanlis, son });

// 1) iki cihaz farklı kelimeler
{
  const pc = bos({ kelimeler: { a: kel(100, 3) }, guncelleme: 200 }), tel = bos({ kelimeler: { b: kel(150, 2) }, guncelleme: 150 });
  const s = birlestir(pc, tel);
  test('farklı kelimeler birleşiyor', s.kelimeler.a && s.kelimeler.b);
}
// 2) aynı kelime iki cihazda: en son cevaplanan kalır
{
  const pc = bos({ kelimeler: { a: kel(100, 5, 9, 0) } }), tel = bos({ kelimeler: { a: kel(300, 1, 3, 2) } });
  test('aynı kelimede en son cevaplanan kalıyor', birlestir(pc, tel).kelimeler.a.son === 300 && birlestir(tel, pc).kelimeler.a.kutu === 1);
}
// 3) üniteler: adımlar birleşir, tamamlandı VEYA, skor büyük
{
  const pc = bos({ uniteler: { u01: { adimlar: { not: true, kart: true }, tamamlandi: false, enIyiSkor: 0.5 } } });
  const tel = bos({ uniteler: { u01: { adimlar: { not: true, kart: true, alistirma: true, sinav: true }, tamamlandi: true, enIyiSkor: 0.9 }, u02: { adimlar: { not: true }, tamamlandi: false, enIyiSkor: 0 } } });
  const u = birlestir(pc, tel).uniteler;
  test('ünite adımları ve tamamlandı birleşiyor, skor büyük olan', u.u01.tamamlandi && u.u01.adimlar.sinav && u.u01.enIyiSkor === 0.9 && u.u02, u);
}
// 4) puan günlüğü: birleşim, tekrar yok, sonradan verilen puan korunur
{
  const r1 = { t: 10, k: 'a', tur: 'yaz', u: 'u01', d: 1, p: null }, r2 = { t: 20, k: 'b', tur: 'sec_es', u: 'u01', d: 0, p: null };
  const pc = bos({ puanlar: [r1, r2] }), tel = bos({ puanlar: [{ ...r1 }, { ...r2, p: 3 }, { t: 30, k: 'c', tur: 'yaz', d: 1, p: 1 }] });
  const p = birlestir(pc, tel).puanlar;
  test('puan günlüğü: 3 kayıt, tekrar yok, sıralı, sonradan verilen puan korunuyor', p.length === 3 && p.map((x) => x.t).join() === '10,20,30' && p[1].p === 3, p);
  const cok = bos({ puanlar: Array.from({ length: 30 }, (_, i) => ({ t: i, k: 'x' + i, tur: 'yaz', d: 1, p: null })) });
  const s = birlestir(cok, bos({ puanlar: [{ t: 99, k: 'y', tur: 'yaz', d: 1, p: null }] }), 10);
  test('puan sınırı: en yeni kayıtlar kalıyor', s.puanlar.length === 10 && s.puanlar.at(-1).t === 99);
}
// 5) sıfırlama: öbür cihazdaki eski ilerleme geri gelmiyor, sıfırlamadan sonraki çalışma kalıyor
{
  const eski = bos({ guncelleme: 500, kelimeler: { a: kel(100, 5), b: kel(900, 2) }, uniteler: { u01: { adimlar: { not: true }, tamamlandi: true } }, puanlar: [{ t: 100, k: 'a', tur: 'yaz', d: 1, p: null }, { t: 900, k: 'b', tur: 'yaz', d: 1, p: null }] });
  const sifirlanan = bos({ guncelleme: 800, sifirlama: 800, kelimeler: { c: kel(850, 1) } });
  const s = birlestir(eski, sifirlanan), s2 = birlestir(sifirlanan, eski);
  test('sıfırlama: eski kelime/ünite/puan geri gelmiyor', !s.kelimeler.a && !s.uniteler.u01 && !s.puanlar.some((r) => r.t === 100) && s.sifirlama === 800 && duzEsit(s, s2), s);
  test('sıfırlama: sıfırlamadan sonraki çalışma (iki cihazda) kalıyor', s.kelimeler.b && s.kelimeler.c && s.puanlar.some((r) => r.t === 900));
}
// 6) ayarlar: yeni olanınki, cihaza özel ayarlar yerelde kalır
{
  const pc = bos({ guncelleme: 100, ayarlar: { ingilizce: true, sesAdi: 'Microsoft Sabina', sesHiz: 0.9, sonYedek: 50 } });
  const tel = bos({ guncelleme: 200, ayarlar: { ingilizce: false, sesAdi: 'Paulina', puanlama: false } });
  const s = birlestir(pc, tel);
  test('ayarlar: yeni olanınki, ses ve son yedek bu cihazınki', s.ayarlar.ingilizce === false && s.ayarlar.puanlama === false && s.ayarlar.sesAdi === 'Microsoft Sabina' && s.ayarlar.sonYedek === 50, s.ayarlar);
  const yeniTel = bos({ guncelleme: 9999, ayarlar: {} }), pcDolu = bos({ guncelleme: 100, kelimeler: { a: kel(100, 2) }, ayarlar: { ingilizce: false, puanlama: false } });
  const s3 = birlestir(yeniTel, pcDolu);
  test('yeni (boş) telefon bilgisayarın ayarlarını ezmiyor', s3.ayarlar.ingilizce === false && s3.ayarlar.puanlama === false, s3.ayarlar);
  const s2 = birlestir(bos({ guncelleme: 300, ayarlar: {} }), tel);
  test('ayarlar: öbür cihazın sesi bu cihaza taşınmıyor', s2.ayarlar.sesAdi === undefined, s2.ayarlar);
  test('ayniMi: yalnızca cihaz ayarı farklıysa aynı sayılıyor (gereksiz yazma yok)', ayniMi(bos({ ayarlar: { sesAdi: 'A' } }), bos({ ayarlar: { sesAdi: 'B' } })) && !ayniMi(bos({ ayarlar: { ingilizce: true } }), bos()));
}
// 7) değişmezlik, boş taraf, sıra bağımsızlığı, aynı veri
{
  const pc = bos({ kelimeler: { a: kel(100, 3) } }), tel = bos({ kelimeler: { a: kel(50, 2) } });
  const kopyaPc = JSON.stringify(pc); birlestir(pc, tel);
  test('girdiler değişmiyor', JSON.stringify(pc) === kopyaPc);
  test('bulut boşsa cihazdaki aynen kalıyor', ayniMi(birlestir(pc, null), pc));
  test('cihaz boşsa (yeni telefon) buluttaki geliyor', birlestir(bos({ guncelleme: 1 }), pc).kelimeler.a.son === 100);
  test('aynı veri birleşince aynı kalıyor (yazma tetiklemez)', ayniMi(birlestir(pc, JSON.parse(kopyaPc)), pc));
  test('birleştirme sırası sonucu değiştirmiyor (ayarlar hariç)', ayniMi(birlestir(pc, tel), birlestir(tel, pc)));
}
// 8) gerçek ilerleme dosyası: kendisiyle birleşince değişmiyor
{
  const f = path.join(KOK, 'ilerleme.json');
  if (fs.existsSync(f)) {
    const v = JSON.parse(fs.readFileSync(f, 'utf8')); v.surum = 2; v.sifirlama = 0;
    test(`gerçek ilerleme (${Object.keys(v.kelimeler).length} kelime, ${v.puanlar.length} cevap) kendisiyle birleşince aynı`, ayniMi(birlestir(v, JSON.parse(JSON.stringify(v))), v));
  }
}
function duzEsit(a, b) { return ayniMi(a, b); }
console.log(`\n${gecti} geçti, ${kaldi} kaldı`);
