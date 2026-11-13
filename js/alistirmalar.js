/* =========================================================
   ALIŞTIRMA TÜRLERİ
   Her alıştırma: { tur, render(alan, bitti) }
   bitti({ dogru, dogrusu?, uyari?, mesaj? }) tam bir kez çağrılır.
   Yeni tür eklemek: buraya bir fonksiyon + Alistirma.karisik()'a ağırlık.
   ========================================================= */
(function () {
  'use strict';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const karistir = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rastgele = (a) => a[Math.floor(Math.random() * a.length)];

  /* ---- cevap karşılaştırma: aksan hatası doğru sayılır ama uyarılır ---- */
  function normal(s, aksanKoru) {
    s = String(s).toLowerCase().replace(/[¿?¡!.,;:"“”'’…]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!aksanKoru) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return s;
  }
  function alternatifler(es) { return es.split(' / ').map((x) => x.trim()); }
  const ARTIKEL = /^(el|la|los|las|un|una) /;
  // İki yazı arasındaki harf farkı sayısı (yer değiştirmiş iki harf de 1 sayılır)
  function harfFarki(a, b) {
    if (Math.abs(a.length - b.length) > 3) return 99;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[a.length][b.length];
  }
  // İçerikteki tüm İspanyolca kelime/kalıplar: yazım hatası sanılıp başka bir gerçek kelime kabul edilmesin (hablo ≠ habla)
  let bilinenler = null;
  function bilinenMi(metin) {
    if (!bilinenler) {
      bilinenler = new Set();
      ICERIK.tumKelimeler().forEach((k) => alternatifler(k.es).forEach((x) => { const n = normal(x, false); bilinenler.add(n); bilinenler.add(n.replace(ARTIKEL, '')); }));
    }
    return bilinenler.has(metin);
  }

  // tolerans: false → kelime taşı / kelime bankası soruları: yazım toleransı yok (eksik ya da yanlış kelime = yanlış)
  function kontrol(cevap, dogrusu, tolerans = true) {
    const secenekler = alternatifler(dogrusu);
    // "señor / señora" gibi tamamı yazıldıysa da kabul et (eğik çizgi boşluklarına bakmadan)
    const tamami = normal(dogrusu.replace(/\s*\/\s*/g, ' '), false);
    const yazilan = normal(cevap.replace(/\s*\/\s*/g, ' '), false);
    if (secenekler.some((d) => normal(cevap, true) === normal(d, true)) || normal(cevap.replace(/\s*\/\s*/g, ' '), true) === normal(dogrusu.replace(/\s*\/\s*/g, ' '), true)) return { dogru: true };
    if (secenekler.some((d) => yazilan === normal(d, false)) || yazilan === tamami) return { dogru: true, uyari: 'Aksanlara dikkat! Doğru yazılışı:' };
    // artikelsiz yazıldıysa (padre ↔ el padre) doğru say ama artikeli hatırlat
    if (secenekler.some((d) => ARTIKEL.test(normal(d, false)) && yazilan === normal(d, false).replace(ARTIKEL, ''))) {
      return { dogru: true, uyari: 'Artikeliyle birlikte öğren:' };
    }
    if (!tolerans) return { dogru: false };
    // Küçük yazım hatası → doğru say ama uyar. Kelime kelime bakılır:
    //  - kelime sayısı aynı olmalı (unutulan / fazla kelime = yanlış)
    //  - her kelimenin kendi payı: 1–3 harf 0, 4–9 harf 1, 10–14 harf 2, 15+ harf 3
    //  - toplam hata, cevaptaki en uzun kelimenin payını geçemez (5+5+5 harf → toplam 1, tek 15 harflik kelime → 3)
    //  - hatalı yazılan kelime başka bir gerçek kelimeyse (hablo yerine habla) yanlış
    const hedefler = [...secenekler.map((d) => normal(d, false)), tamami];
    hedefler.slice().forEach((h) => { if (ARTIKEL.test(h)) hedefler.push(h.replace(ARTIKEL, '')); });   // artikelsiz + küçük hata
    const pay = (w) => (w.length < 4 ? 0 : w.length < 10 ? 1 : w.length < 15 ? 2 : 3);
    const yk = yazilan.split(' ');
    const uyar = hedefler.some((h) => {
      const hk = h.split(' ');
      if (hk.length !== yk.length) return false;
      let toplam = 0;
      for (let i = 0; i < hk.length; i++) {
        const f = harfFarki(yk[i], hk.at(i));
        if (f > pay(hk.at(i))) return false;
        if (f > 0 && bilinenMi(yk[i])) return false;
        toplam += f;
      }
      return toplam > 0 && toplam <= Math.max(...hk.map(pay));
    });
    if (uyar) return { dogru: true, uyari: 'Küçük bir yazım hatası var. Doğru yazılışı:' };
    return { dogru: false };
  }


  /* anlamın çekirdeği: "memnun oldum (erkek / kadın)" → "memnun oldum" */
  const cekirdek = (k) => (k.tr.replace(/\s*\([^)]*\)\s*$/, '').trim() || k.tr).toLowerCase();
  // aynı anlama gelen kelimeler aynı eşleştirmeye/şıklara girmesin
  function benzersiz(liste) {
    const goruldu = new Set();
    return liste.filter((k) => { const c = cekirdek(k); if (goruldu.has(c)) return false; goruldu.add(c); return true; });
  }

  /* ---- yanıltıcı şık seçimi: önce aynı üniteden ---- */
  function celdiriciler(kelime, alan, adet) {
    const unite = ICERIK.bul(kelime.unite);
    const ayni = unite.kelimeler;
    // ileride öğreneceğin kelimeler şık olarak çıkmasın
    const sinir = Alistirma.sinirSira(unite);
    const tum = ICERIK.uniteler.filter((u) => u.sira <= sinir).flatMap((u) => u.kelimeler);
    const kullanildi = new Set([kelime[alan]]);
    const anlamlar = new Set([cekirdek(kelime)]);
    const sonuc = [];
    for (const havuz of [karistir(ayni), karistir(tum)]) {
      for (const k of havuz) {
        if (sonuc.length >= adet) break;
        if (kullanildi.has(k[alan]) || anlamlar.has(cekirdek(k))) continue;
        if ((k.yazma === false) !== (kelime.yazma === false)) continue; // harf ↔ harf, kelime ↔ kelime
        kullanildi.add(k[alan]); anlamlar.add(cekirdek(k)); sonuc.push(k);
      }
    }
    return sonuc;
  }

  // Okunuş kurallarına göre akla yatkın yanlış yazılışlar üret: llave → yave, lave …
  const YAZIM_DEGISIM = [
    [/ll/, ['y', 'l']], [/y/, ['ll']], [/ñ/, ['n', 'ny']], [/qu/, ['k', 'cu']], [/c(?=[aouáóú])/, ['k', 'q']],
    [/c(?=[eéií])/, ['s', 'z']], [/z/, ['s', 'c']], [/s/, ['z']], [/j/, ['h', 'g']], [/g(?=[eéií])/, ['j', 'h']],
    [/^h/, ['']], [/^(?=[aeiouáéíóú])/, ['h']], [/ch/, ['ç', 'c']], [/v/, ['b']], [/b/, ['v']], [/rr/, ['r']]
  ];
  function tekDegisim(w) {
    const sonuc = new Set();
    for (const [re, yerine] of YAZIM_DEGISIM) {
      if (!re.test(w)) continue;
      yerine.forEach((y) => { const x = w.replace(re, y); if (x && x !== w) sonuc.add(x); });
    }
    return [...sonuc];
  }
  function yanlisYazilislar(dogru) {
    const birinci = tekDegisim(dogru);
    const sonuc = new Set(birinci);
    if (sonuc.size < 3) birinci.forEach((w) => tekDegisim(w).forEach((x) => { if (x !== dogru) sonuc.add(x); }));
    if (sonuc.size < 3) [dogru, ...sonuc].forEach((w) => { const x = w.replace(/i/, 'y'); if (x !== w && x !== dogru) sonuc.add(x); });
    return [...sonuc];
  }
  // Harf kartı → hangi kelimelerde bu ses var (dogru) / hangi kelimeler yanlış şık olamaz (ses)
  const SES_KURALI = {
    u01_h: { dogru: /(^|[^c])h/, ses: /h/, soru: "okunmayan bir h" },
    u01_j: { dogru: /j/, ses: /j|g[eéií]/, soru: "gırtlaktan \"h\" sesi veren j" },
    u01_ll: { dogru: /ll/, ses: /ll|y/, soru: "\"y\" sesi veren ll" },
    u01_n: { dogru: /ñ/, ses: /ñ/, soru: "\"ny\" sesi veren ñ" },
    u01_ch: { dogru: /ch/, ses: /ch/, soru: "\"ç\" sesi veren ch" },
    u01_qu: { dogru: /qu/, ses: /qu|c[aouáóú]|k/, soru: "\"k\" sesi veren qu" },
    u01_z: { dogru: /z/, ses: /z|s|c[eéií]/, soru: "\"s\" sesi veren z" },
    u01_ce: { dogru: /c[eéií]/, ses: /z|s|c[eéií]/, soru: "\"s\" sesi veren c (ce / ci)" }
  };


  /* ---------- Fiil çekimi: kişiler ---------- */
  const KISILER = [['yo', 'yo'], ['tu', 'tú'], ['el', 'él / ella / usted'], ['nos', 'nosotros'], ['ellos', 'ellos / ustedes']];

  /* ---------- İsim: artikel + çoğul ---------- */
  // 'el libro' → ['el', 'libro']; artikelsiz ya da alternatifli ('el primo / la prima') kelimeler uygun değil
  function isimParcala(es) { const m = /^(el|la) ([^/]+)$/.exec(es); return m ? [m[1], m[2].trim()] : [null, null]; }
  const AKSANSIZ = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
  function cogulYap(k) {
    if (k.cogul === false) return null;
    if (typeof k.cogul === 'string') return k.cogul;
    const [art, ad] = isimParcala(k.es); if (!art || ad.includes(' ')) return null;
    const yeniArt = art === 'el' ? 'los' : 'las';
    let c;
    if (/[aeiouáéó]$/.test(ad)) c = ad + 's';                                  // casa → casas, café → cafés
    else if (/z$/.test(ad)) c = ad.slice(0, -1) + 'ces';                        // lápiz → lápices
    else if (/[áéíóú][ns]$/.test(ad)) c = ad.replace(/([áéíóú])([ns])$/, (m, v, n) => AKSANSIZ[v] + n) + 'es';   // estación → estaciones, autobús → autobuses
    else if (/[íú]$/.test(ad)) c = ad + 's';                                    // menú → menús
    else if (/s$/.test(ad) && (ad.match(/[aeiou]+/g) || []).length === 1) c = ad + 'es';   // tek heceli: mes → meses
    else if (/s$|x$/.test(ad)) return null;                                     // lunes, tórax: çoğulu aynı, sorma
    else c = ad + 'es';                                                         // hotel → hoteles, mes → meses
    return `${yeniArt} ${c}`;
  }
  function cogulKurali(k) {
    const ad = isimParcala(k.es)[1] || '';
    if (/[aeiouáéó]$/.test(ad)) return 'Ünlüyle biten isim: + s · el → los, la → las';
    if (/z$/.test(ad)) return '-z ile biten isim: z → ces';
    if (/[áéíóú][ns]$/.test(ad)) return 'Ünsüzle biten isim: + es (vurgu işareti düşer: estación → estaciones)';
    return 'Ünsüzle biten isim: + es · el → los, la → las';
  }
  const artikelUygun = (k) => k.yazma !== false && !!isimParcala(k.es)[0] && !isimParcala(k.es)[1].includes(' ');
  const cogulUygun = (k) => k.yazma !== false && !!cogulYap(k);
  // artikel soruları 5. üniteden (artikel notu 4. ünitede), çoğul soruları 20. üniteden (Eşyalar: çoğul notu) itibaren
  const ARTIKEL_SIRA = 5, COGUL_SIRA = 20;
  // çeviri sorusuna uygun cümle: diyalog değil, en fazla 7 kelime
  const KISA_CUMLE = (c) => !c.es.includes('—') && c.es.split(' ').length <= 7;

  /* ---------- 🎨 Fiil biçimini renkli gösterme ----------
     Çekimli biçim mastarla karşılaştırılır:
       düzenli      : kök · ek            habl·o
       kök değişimi : değişen harfler     qu[ie]r·o, ten[g]·o, cono[z]c·o
       düzensiz     : bütün kelime ⚡      soy, voy, sé
     Ek, kişinin rengini alır (css: .k-yo, .k-tu, .k-el, .k-nos, .k-ellos). Dönüşlü zamir (me / te / se / nos) de. */
  const BICIM_EK = { ar: ['o', 'as', 'a', 'amos', 'an'], er: ['o', 'es', 'e', 'emos', 'en'], ir: ['o', 'es', 'e', 'imos', 'en'] };
  const KISI_SIRA = ['yo', 'tu', 'el', 'nos', 'ellos'];
  const sesliHarf = (h) => /[aeiouáéíóú]/i.test(h);
  const aksansiz = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  function bicimParcala(fiil, bicim, kisi) {
    let zamir = '', kelime = String(bicim).trim();
    const z = /^(me|te|se|nos)\s+(.+)$/i.exec(kelime);
    if (z && /se$/i.test(fiil)) { zamir = z[1]; kelime = z[2]; }
    const mastar = aksansiz(String(fiil).toLowerCase()).replace(/se$/, '');
    const tur = mastar.slice(-2), kok0 = mastar.slice(0, -2), sira = KISI_SIRA.indexOf(kisi);
    if (!BICIM_EK[tur] || sira < 0 || /\s/.test(kelime)) return { zamir, duz: kelime };
    const ek = BICIM_EK[tur][sira], n = aksansiz(kelime.toLowerCase());
    if (!n.endsWith(ek) || n.length <= ek.length) return { zamir, duzensiz: kelime };
    const kok = kelime.slice(0, kelime.length - ek.length), kokN = n.slice(0, n.length - ek.length);
    const ekMetin = kelime.slice(kelime.length - ek.length);
    if (kokN === kok0) return { zamir, kok, ek: ekMetin };
    let p = 0; while (p < kokN.length && p < kok0.length && kokN[p] === kok0[p]) p++;
    if (p === 0) return { zamir, duzensiz: kelime };                     // eres, es…: kökü tanınmıyor
    let s = 0; while (s < kokN.length - p && s < kok0.length - p && kokN[kokN.length - 1 - s] === kok0[kok0.length - 1 - s]) s++;
    let a = p, b = kokN.length - s;
    if (a >= b) return { zamir, kok, ek: ekMetin };
    // yalnızca ünlü değiştiyse bitişik ünlüleri de kat: j[ue]go, c[ie]rro
    if (sesliHarf(kok.slice(a, b)) && [...kok.slice(a, b)].every(sesliHarf)) {
      // "qu" / "gu" içindeki u ünlü sayılmaz: qu[ie]ro (q[uie]ro değil)
      while (a > 0 && sesliHarf(kok[a - 1]) && !(/u/i.test(kok[a - 1]) && a > 1 && /[qg]/i.test(kok[a - 2]))) a--;
      while (b < kok.length && sesliHarf(kok[b])) b++;
    }
    return { zamir, kokOn: kok.slice(0, a), degisen: kok.slice(a, b), kokSon: kok.slice(b), ek: ekMetin };
  }
  function bicimHtml(fiil, bicim, kisi) {
    const x = bicimParcala(fiil, bicim, kisi), k = 'k-' + kisi;
    const z = x.zamir ? `<span class="bc-zamir ${k}">${esc(x.zamir)}</span> ` : '';
    if (x.duz !== undefined) return z + esc(x.duz);
    if (x.duzensiz) return z + `<span class="bc-duzensiz ${k}" title="düzensiz">${esc(x.duzensiz)}</span>`;
    const kok = x.degisen !== undefined ? `${esc(x.kokOn)}<mark class="bc-degisen">${esc(x.degisen)}</mark>${esc(x.kokSon)}` : esc(x.kok);
    return z + `<span class="bc">${kok}<span class="bc-ek ${k}">${esc(x.ek)}</span></span>`;
  }
  // "el padre" → artikel renkli (el / los mavi, la / las kırmızı)
  function artikelHtml(es) {
    const m = /^(el|la|los|las)\s+(.+)$/i.exec(String(es));
    if (!m) return esc(es);
    return `<span class="art-${/^(el|los)$/i.test(m[1]) ? 'e' : 'd'}">${esc(m[1])}</span> ${esc(m[2])}`;
  }

  /* ---------- 📱 Telefon modu ----------
     Telefonda yazma soruları çoğunlukla dokunarak cevaplanan türlere dönüşür; yaklaşık %20'si yazma kalır. */
  const YAZMA_ORANI = 0.2;
  const telefon = () => !!(window.Cihaz && Cihaz.telefon());
  const yazmaKalsin = () => !telefon() || Math.random() < YAZMA_ORANI;
  // Asıl olasılığı p olan yazma modu (çekim gibi): telefonda ayrıca %20 süzgecinden geçer
  const yazModu = (p) => Math.random() < p && yazmaKalsin();

  /* ---------- 🔤 Harflerden kur ----------
     'el padre' → artikel hazır verilir, 'padre' harflerden kurulur. Tek kelime, 2–12 harf. */
  function harfHedef(k) {
    if (k.yazma === false) return null;
    const ilk = alternatifler(k.es)[0];
    const m = /^(el|la|los|las|un|una) (.+)$/.exec(ilk);
    const onEk = m ? m[1] : '', hedef = (m ? m[2] : ilk).trim();
    if (/[\s.,;:¿?¡!]/.test(hedef) || hedef.length < 2 || hedef.length > 12) return null;
    return { onEk, hedef };
  }
  // İspanyolcada karıştırılan harfler: yanıltıcı taş olarak kullanılır
  const HARF_KARISAN = { b: ['v'], v: ['b'], c: ['s', 'z'], s: ['c', 'z'], z: ['s', 'c'], y: ['l', 'i'], l: ['y'], i: ['y', 'í'], g: ['j'], j: ['g', 'h'],
    h: ['j'], n: ['ñ'], 'ñ': ['n'], q: ['k'], k: ['q', 'c'], a: ['á'], e: ['é'], o: ['ó'], u: ['ú'], 'á': ['a'], 'é': ['e'], 'í': ['i'], 'ó': ['o'], 'ú': ['u'] };
  function harfCeldiriciler(hedef, adet) {
    const harfler = Array.from(hedef.toLowerCase());
    let aday = karistir([...new Set(harfler.flatMap((h) => HARF_KARISAN[h] || []))]);
    if (aday.length < adet) aday = aday.concat(karistir(['a', 'e', 'o', 's', 'r', 'n', 'l', 'd']).filter((h) => !aday.includes(h)));
    return aday.slice(0, adet);
  }

  /* ---------- Sayılar ve rakam soruları ---------- */
  const BIRLER = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
    'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const ONLAR = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const YUZLER = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  function sayiYazi(n) {
    if (n < 30) return BIRLER[n];
    if (n < 100) return ONLAR[Math.floor(n / 10)] + (n % 10 ? ' y ' + BIRLER[n % 10] : '');
    if (n === 100) return 'cien';
    if (n < 1000) return YUZLER[Math.floor(n / 100)] + (n % 100 ? ' ' + sayiYazi(n % 100) : '');
    if (n < 1000000) { const b = Math.floor(n / 1000), k = n % 1000; return (b === 1 ? 'mil' : erilSayi(b) + ' mil') + (k ? ' ' + sayiYazi(k) : ''); }
    return String(n);
  }
  // eril isimden önce: uno → un, veintiuno → veintiún (un peso, veintiún pesos)
  function erilSayi(n) { return sayiYazi(n).replace(/veintiuno$/, 'veintiún').replace(/(^| )uno$/, '$1un'); }
  const rakamNormal = (s) => String(s).replace(/\s|-/g, '').replace(',', '.').replace(/^0+(?=\d)/, '').replace(/\.$/, '');
  const ara = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function rakamUret(t) {
    if (t.tip === 'saat') {
      const h = ara(1, 12), dk = rastgele([0, 0, 15, 30, 45, 10, 20, 5, 30]);
      const saatAdi = (x) => (x === 1 ? 'la una' : 'las ' + sayiYazi(x));
      let metin, gh = h, gm = dk;
      if (dk === 0) metin = `${h === 1 ? 'Es' : 'Son'} ${saatAdi(h)} en punto`;
      else if (dk === 45) { const s = h % 12 + 1; metin = `${s === 1 ? 'Es' : 'Son'} ${saatAdi(s)} menos cuarto`; }
      else metin = `${h === 1 ? 'Es' : 'Son'} ${saatAdi(h)} y ${dk === 15 ? 'cuarto' : dk === 30 ? 'media' : sayiYazi(dk)}`;
      const kabul = [`${gh}:${String(gm).padStart(2, '0')}`, `${gh + 12}:${String(gm).padStart(2, '0')}`].flatMap((x) => [x, x.replace(':', '.')]);
      if (gh === 12) kabul.push(`0:${String(gm).padStart(2, '0')}`, `00:${String(gm).padStart(2, '0')}`.replace(/^0+(?=\d)/, ''));
      return { metin, cevap: kabul[0], kabul: kabul.map(rakamNormal), ornek: 'ör. 3:15' };
    }
    if (t.tip === 'fiyat' && t.binler) {
      // Kolombiya / Şili pesosu gibi binlerle söylenen fiyatlar: 2.500, 18.000, 150.000
      const p = rastgele([ara(1, 9) * 1000 + rastgele([0, 500]), ara(10, 99) * 1000, ara(10, 99) * 1000, ara(1, 3) * 100000 + rastgele([0, 50000])]);
      const metin = `Son ${erilSayi(p)} pesos`;
      const noktali = String(p).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return { metin, cevap: noktali, kabul: [String(p), noktali].map(rakamNormal), ornek: 'ör. 25.000' };
    }
    if (t.tip === 'fiyat') {
      const p = ara(t.min || 2, t.max || 100), kurus = rastgele([0, 0, 0, 50, 50, 25, 90]);
      const metin = `Son ${erilSayi(p)} ${p === 1 ? 'peso' : 'pesos'}${kurus ? ' con ' + sayiYazi(kurus) : ''}`.replace(/^Son (un peso)$/, 'Es $1');
      const cevap = kurus ? `${p},${kurus}` : String(p);
      const kabul = kurus ? [`${p}.${kurus}`] : [String(p), `${p}.00`, `${p}.0`];
      return { metin, cevap, kabul: kabul.map(rakamNormal), ornek: 'ör. 12,50' };
    }
    if (t.tip === 'telefon') {
      const parcalar = [ara(10, 99), ara(10, 99), ara(10, 99), ara(10, 99)];
      return { metin: parcalar.map(sayiYazi).join(', '), cevap: parcalar.join(' '), kabul: [parcalar.join('')], ornek: 'ör. 55 23 48 19' };
    }
    const n = ara(t.min || 0, t.max || 20);
    return { metin: sayiYazi(n), cevap: String(n), kabul: [String(n)], ornek: 'ör. 17' };
  }

  /* ---- Türkçe cevap kontrolü (İspanyolca → Türkçe yazma) ----
     "anne-baba, ebeveynler" → ikisi de olur · "tünaydın / iyi günler" → ikisi de olur
     "0 (sıfır)" → 0 ya da sıfır · "o (erkek)" → o · Türkçe karakter eksikliği (s/ş, i/ı…) sorun değil */
  const trNormal = (s) => String(s).toLocaleLowerCase('tr').replace(/[.,!?;:"“”'’…()¿¡]/g, ' ').replace(/\s+/g, ' ').trim();
  const trSade = (s) => trNormal(s).replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/â/g, 'a');
  function trSecenekler(tr) {
    const parantez = (tr.match(/\(([^)]*)\)/g) || []).map((p) => p.slice(1, -1));
    const cekirdek = tr.replace(/\([^)]*\)/g, ' ');
    const sonuc = new Set([tr, cekirdek, ...cekirdek.split(/\s*[\/,]\s*/)]);
    if (/^\s*\d+\s*$/.test(cekirdek)) parantez.forEach((p) => sonuc.add(p));    // 0 (sıfır) → sıfır da olur
    return [...sonuc].map(trSade).filter(Boolean);
  }
  const yazimPayi = (w) => (w.length < 4 ? 0 : w.length < 10 ? 1 : w.length < 15 ? 2 : 3);
  function kontrolTr(cevap, tr) {
    const y = trSade(cevap); if (!y) return { dogru: false };
    const hedefler = trSecenekler(tr);
    if (hedefler.includes(y)) return { dogru: true };
    const yk = y.split(' ');
    const yakin = hedefler.some((h) => {
      const hk = h.split(' '); if (hk.length !== yk.length) return false;
      let toplam = 0;
      for (let i = 0; i < hk.length; i++) { const f = harfFarki(yk[i], hk.at(i)); if (f > yazimPayi(hk.at(i))) return false; toplam += f; }
      return toplam > 0 && toplam <= Math.max(...hk.map(yazimPayi));
    });
    return yakin ? { dogru: true, uyari: 'Küçük bir yazım hatası var.' } : { dogru: false };
  }

  function aksanKlavyesi() {
    return `<div class="aksanlar">${['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map((h) => `<button type="button" class="aksan" data-h="${h}">${h}</button>`).join('')}</div>`;
  }
  function aksanBagla(alan, input) {
    alan.querySelectorAll('.aksan').forEach((b) => b.addEventListener('click', () => {
      const h = b.dataset.h, s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
      input.value = input.value.slice(0, s) + h + input.value.slice(e);
      input.focus(); input.setSelectionRange(s + h.length, s + h.length);
    }));
  }
  const sesButonu = (metin) => (Ses.aktif() ? ` <button type="button" class="ses" data-ses="${esc(metin)}" title="Dinle">🔊</button>` : '');

  const Alistirma = {
    esc, karistir, kontrol, normal, kontrolTr, aksanKlavyesi, aksanBagla, sayiYazi, cogulYap, rakamUret, rakamNormal,
    bicimParcala, bicimHtml, artikelHtml, KISI_SIRA,

    /* Çoktan seçmeli. yon: 'es' (İspanyolca göster, Türkçe seç) | 'tr' */
    sec(kelime, yon) {
      const soruAlan = yon === 'es' ? 'es' : 'tr', cevapAlan = yon === 'es' ? 'tr' : 'es';
      return {
        tur: yon === 'es' ? 'sec_es' : 'sec_tr', anahtar: kelime.id,
        render(alan, bitti) {
          const siklar = karistir([kelime, ...celdiriciler(kelime, cevapAlan, 3)]);
          alan.innerHTML = `
            <p class="yonerge">${yon === 'es' ? 'Anlamı ne?' : 'İspanyolcası hangisi?'}</p>
            <div class="soru ${yon === 'es' ? 'es' : ''}">${esc(kelime[soruAlan])}${yon === 'es' && Ses.okunurMu(kelime) ? sesButonu(kelime.es) : ''}</div>
            <div class="siklar">${siklar.map((k, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(k[cevapAlan])}</button>`).join('')}</div>`;
          let bitmis = false;
          const sec = (i) => {
            if (bitmis) return; bitmis = true;
            const dogru = siklar[i].id === kelime.id;
            alan.querySelectorAll('.sik').forEach((b, j) => {
              b.disabled = true;
              if (siklar[j].id === kelime.id) b.classList.add('dogru');
              else if (j === i) b.classList.add('yanlis');
            });
            Tekrar.sonuc(kelime.id, dogru);
            bitti({ dogru, dogrusu: `${kelime.es} = ${kelime.tr}`, ipucu: kelime.ipucu, oku: Ses.okunurMu(kelime) ? kelime.es : null, soru: kelime[soruAlan], verilen: siklar[i][cevapAlan] });
          };
          alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
          alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); };
        }
      };
    },

    /* Yazma: Türkçesi verilir, İspanyolcası yazılır */
    yaz(kelime) {
      return {
        tur: 'yaz', anahtar: kelime.id,
        render(alan, bitti) {
          alan.innerHTML = `
            <p class="yonerge">İspanyolca yaz</p>
            <div class="soru">${esc(kelime.tr)}</div>
            <form class="yazma"><input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Cevabın…">
            ${aksanKlavyesi()}
            <button type="submit" class="ana-buton">Kontrol et</button></form>`;
          const input = alan.querySelector('input'); aksanBagla(alan, input);
          setTimeout(() => input.focus(), 50);
          alan.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!input.value.trim() || input.disabled) return;
            input.disabled = true;
            const s = kontrol(input.value, kelime.es);
            input.classList.add(s.dogru ? 'dogru' : 'yanlis');
            Tekrar.sonuc(kelime.id, s.dogru);
            bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: kelime.es, ipucu: kelime.ipucu, oku: kelime.es, soru: kelime.tr, verilen: input.value.trim() });
          });
        }
      };
    },

    /* 🔤 Harflerden kur (telefon modu): Türkçesi verilir, İspanyolcası karışık harf taşlarından kurulur.
       Taşlarda 2 yanıltıcı harf olur (b/v, c/s/z, aksanlı/aksansız…). Artikel hazır verilir. */
    harfUygun(kelime) { return !!harfHedef(kelime); },
    harfKur(kelime) {
      const { onEk, hedef } = harfHedef(kelime);
      return {
        tur: 'harf_kur', anahtar: kelime.id,
        render(alan, bitti) {
          const taslar = karistir([...Array.from(hedef.toLowerCase()), ...harfCeldiriciler(hedef, 2)]).map((m, i) => ({ m, i }));
          alan.innerHTML = `
            <p class="yonerge">🔤 Harflerden kur</p>
            <div class="soru">${esc(kelime.tr)}</div>
            <div class="harf-satir">${onEk ? `<span class="on-ek es">${esc(onEk)}</span>` : ''}<div class="cevap-satiri harfli"></div></div>
            <div class="taslar harfler">${taslar.map((t) => `<button type="button" class="tas" data-i="${t.i}">${esc(t.m)}</button>`).join('')}</div>
            <button type="button" class="ana-buton kontrol" disabled>Kontrol et</button>`;
          const satir = alan.querySelector('.cevap-satiri'), kontrolB = alan.querySelector('.kontrol');
          const secilen = [];
          const ciz = () => {
            satir.innerHTML = secilen.map((t) => `<button type="button" class="tas yerlesik" data-i="${t.i}">${esc(t.m)}</button>`).join('');
            alan.querySelectorAll('.taslar .tas').forEach((b) => b.classList.toggle('kullanildi', secilen.some((t) => t.i === +b.dataset.i)));
            kontrolB.disabled = secilen.length === 0;
            satir.querySelectorAll('.tas').forEach((b) => b.addEventListener('click', () => {
              if (kontrolB.dataset.bitti) return;
              secilen.splice(secilen.findIndex((t) => t.i === +b.dataset.i), 1); ciz();
            }));
          };
          const ekle = (t) => { if (kontrolB.dataset.bitti || !t || secilen.includes(t)) return; secilen.push(t); ciz(); };
          alan.querySelectorAll('.taslar .tas').forEach((b) => b.addEventListener('click', () => ekle(taslar.find((t) => t.i === +b.dataset.i))));
          const bitir = () => {
            if (kontrolB.dataset.bitti || !secilen.length) return; kontrolB.dataset.bitti = '1'; kontrolB.disabled = true;
            const verilen = (onEk ? onEk + ' ' : '') + secilen.map((t) => t.m).join('');
            const s = kontrol(verilen, kelime.es, false);
            satir.classList.add(s.dogru ? 'dogru' : 'yanlis');
            Tekrar.sonuc(kelime.id, s.dogru);
            bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: kelime.es, ipucu: kelime.ipucu, oku: kelime.es, soru: kelime.tr, verilen });
          };
          kontrolB.addEventListener('click', bitir);
          // klavyeyle de çalışsın: harfe basınca o taş, ⌫ son taşı geri alır, Enter kontrol eder
          alan._tus = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); bitir(); }
            else if (e.key === 'Backspace') { if (!kontrolB.dataset.bitti && secilen.length) { secilen.pop(); ciz(); } }
            else if (e.key.length === 1) ekle(taslar.find((t) => t.m === e.key.toLowerCase() && !secilen.includes(t)));
          };
        }
      };
    },
    // Telefonda kelime yazma sorusunun yerine geçen soru (sinav: üretim olsun diye önce harf taşları)
    yazVeya(kelime, sinav) {
      if (yazmaKalsin()) return this.yaz(kelime);
      if (harfHedef(kelime) && (sinav || Math.random() < 0.5)) return this.harfKur(kelime);
      return this.sec(kelime, 'tr');
    },

    /* Dinleme: mod 'sec' (duyduğunun anlamını seç) | 'yaz' (duyduğunu yaz) */
    dinle(kelime, mod) {
      return {
        tur: 'dinle_' + mod, anahtar: kelime.id,
        render(alan, bitti) {
          const siklar = mod === 'sec' ? karistir([kelime, ...celdiriciler(kelime, 'tr', 3)]) : [];
          alan.innerHTML = `
            <p class="yonerge">${mod === 'sec' ? '🎧 Dinle ve anlamını seç' : '🎧 Dinle ve yaz'}</p>
            <div class="dinle-alan">
              <button type="button" class="dinle-buton" title="Tekrar dinle">🔊</button>
              <button type="button" class="yavas-buton" title="Yavaş dinle">🐢 yavaş</button>
            </div>
            ${mod === 'sec'
              ? `<div class="siklar">${siklar.map((k, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(k.tr)}</button>`).join('')}</div>`
              : `<form class="yazma"><input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Duyduğunu yaz…">${aksanKlavyesi()}<button type="submit" class="ana-buton">Kontrol et</button></form>`}`;
          const cal = (yavas) => Ses.oku(kelime.es, yavas);
          alan.querySelector('.dinle-buton').addEventListener('click', () => cal(false));
          alan.querySelector('.yavas-buton').addEventListener('click', () => cal(true));
          setTimeout(() => cal(false), 300);
          const sonuc = (dogru, ek) => {
            Tekrar.sonuc(kelime.id, dogru);
            bitti(Object.assign({ dogru, dogrusu: `${kelime.es} = ${kelime.tr}`, ipucu: kelime.ipucu, oku: kelime.es, soru: mod === 'sec' ? '🎧 Duyduğun kelimenin anlamı' : '🎧 Duyduğun kelimeyi yaz' }, ek || {}));
          };
          if (mod === 'sec') {
            let bitmis = false;
            const sec = (i) => {
              if (bitmis) return; bitmis = true;
              alan.querySelectorAll('.sik').forEach((b, j) => {
                b.disabled = true;
                if (siklar[j].id === kelime.id) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis');
              });
              sonuc(siklar[i].id === kelime.id, { verilen: siklar[i].tr });
            };
            alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
            alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); else if (e.key === ' ') { e.preventDefault(); cal(false); } };
          } else {
            const input = alan.querySelector('input'); aksanBagla(alan, input);
            setTimeout(() => input.focus(), 50);
            alan.querySelector('form').addEventListener('submit', (e) => {
              e.preventDefault();
              if (!input.value.trim() || input.disabled) return;
              input.disabled = true;
              const s = kontrol(input.value, kelime.es);
              input.classList.add(s.dogru ? 'dogru' : 'yanlis');
              sonuc(s.dogru, { uyari: s.uyari, dogrusu: s.uyari ? kelime.es : `${kelime.es} = ${kelime.tr}`, verilen: input.value.trim() });
            });
          }
        }
      };
    },

    /* Boşluk doldurma (tek cümle ya da diyalog)
       b = { satirlar: ['— Hola, ¿cómo [estás]?', ...], tr: '...', secenek: ['soy', ...] }
       Kelime bankasından tüm boşluklar doldurulur, sonra kontrol edilir. */
    bosluk(b) {
      return {
        tur: b.satirlar.length > 1 ? 'diyalog' : 'bosluk', anahtar: b.satirlar[0],
        render(alan, bitti) {
          const bosluklar = [];
          const satirHtml = b.satirlar.map((satir) => satir.split(/\[([^\]]+)\]/).map((parca, j) => {
            if (j % 2 === 0) return esc(parca);
            bosluklar.push(parca);
            return `<button type="button" class="bosluk-yer" data-b="${bosluklar.length - 1}">&nbsp;</button>`;
          }).join(''));
          const banka = karistir([...bosluklar, ...(b.secenek || [])]).map((m, i) => ({ m, i }));
          alan.innerHTML = `
            <p class="yonerge">${b.satirlar.length > 1 ? '💬 Diyaloğu tamamla' : 'Boşluğu doldur'}</p>
            <div class="diyalog">${satirHtml.map((h) => `<p>${h}</p>`).join('')}</div>
            <p class="ceviri">${esc(b.tr)}</p>
            <div class="taslar">${banka.map((t) => `<button class="tas" data-i="${t.i}">${esc(t.m)}</button>`).join('')}</div>
            <button class="ana-buton kontrol" disabled>Kontrol et</button>`;
          const yerler = [...alan.querySelectorAll('.bosluk-yer')], kontrolB = alan.querySelector('.kontrol');
          const dolu = new Array(bosluklar.length).fill(null);   // her boşlukta hangi taş var
          let bitmis = false;
          const ciz = () => {
            yerler.forEach((y, k) => { y.textContent = dolu[k] ? dolu[k].m : '\u00a0'; y.classList.toggle('dolu', !!dolu[k]); });
            alan.querySelectorAll('.taslar .tas').forEach((t) => t.classList.toggle('kullanildi', dolu.some((d) => d && d.i === +t.dataset.i)));
            kontrolB.disabled = dolu.some((d) => !d);
          };
          alan.querySelectorAll('.taslar .tas').forEach((t) => t.addEventListener('click', () => {
            if (bitmis || t.classList.contains('kullanildi')) return;
            const k = dolu.indexOf(null); if (k < 0) return;
            dolu[k] = banka.find((x) => x.i === +t.dataset.i); ciz();
          }));
          yerler.forEach((y, k) => y.addEventListener('click', () => { if (!bitmis && dolu[k]) { dolu[k] = null; ciz(); } }));
          kontrolB.addEventListener('click', () => {
            if (bitmis) return; bitmis = true; kontrolB.disabled = true;
            let hepsi = true, uyari = null;
            yerler.forEach((y, k) => {
              const s = kontrol(dolu[k].m, bosluklar[k], false);
              if (s.uyari) uyari = s.uyari;
              y.classList.add(s.dogru ? 'dogru' : 'yanlis');
              if (!s.dogru) { hepsi = false; y.innerHTML = `<s>${esc(dolu[k].m)}</s> ${esc(bosluklar[k])}`; }
            });
            const tamMetin = b.satirlar.map((x) => x.replace(/[\[\]]/g, '')).join(' ');
            let n = 0; const verilen = b.satirlar.map((x) => x.replace(/\[[^\]]+\]/g, () => dolu[n++].m)).join(' ');
            bitti({ dogru: hepsi, uyari: hepsi ? uyari : null, dogrusu: b.satirlar.map((x) => x.replace(/[\[\]]/g, '')).join(' '), oku: tamMetin.replace(/—/g, ''), soru: b.tr, verilen });
          });
        }
      };
    },

    /* Cümle dinleme. mod: 'anlam' (duyduğun cümlenin anlamını seç) | 'kur' (duyduğun cümleyi taşlardan kur) */
    dinleCumle(cumle, tumCumleler, mod) {
      if (mod === 'kur') {
        const ic = this.cumle(cumle, tumCumleler, true);
        return { tur: 'dinle_kur', anahtar: cumle.es, render: ic.render };
      }
      return {
        tur: 'dinle_anlam', anahtar: cumle.es,
        render(alan, bitti) {
          const diger = karistir(tumCumleler.filter((c) => c !== cumle && c.tr !== cumle.tr)).slice(0, 2);
          const siklar = karistir([cumle, ...diger]);
          alan.innerHTML = `
            <p class="yonerge">🎧 Dinle: ne dedi?</p>
            <div class="dinle-alan">
              <button type="button" class="dinle-buton" title="Tekrar dinle">🔊</button>
              <button type="button" class="yavas-buton" title="Yavaş dinle">🐢 yavaş</button>
            </div>
            <div class="siklar">${siklar.map((c, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(c.tr)}</button>`).join('')}</div>`;
          const cal = (yavas) => Ses.oku(cumle.es, yavas);
          alan.querySelector('.dinle-buton').addEventListener('click', () => cal(false));
          alan.querySelector('.yavas-buton').addEventListener('click', () => cal(true));
          setTimeout(() => cal(false), 300);
          let bitmis = false;
          const sec = (i) => {
            if (bitmis) return; bitmis = true;
            alan.querySelectorAll('.sik').forEach((b, j) => {
              b.disabled = true;
              if (siklar[j] === cumle) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis');
            });
            bitti({ dogru: siklar[i] === cumle, dogrusu: `${cumle.es} = ${cumle.tr}`, oku: cumle.es, soru: '🎧 Duyduğun cümlenin anlamı', verilen: siklar[i].tr });
          };
          alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
          alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); else if (e.key === ' ') { e.preventDefault(); cal(false); } };
        }
      };
    },

    /* Okunuş (telaffuz) soruları
       mod 'yazilis': "‘yave’ diye okunan kelime hangisi?" → llave / yave / lave …  (kelime.okunus gerekir)
       mod 'ses'    : harf kartı için "Hangi kelimede "ç" sesi var?" → chocolate / casa … */
    okunus(kelime, mod) {
      return {
        tur: 'okunus_' + mod, anahtar: kelime.id,
        render(alan, bitti) {
          let soru, siklar, dogruIndex;
          if (mod === 'yazilis') {
            const yanlis = karistir(yanlisYazilislar(kelime.es)).slice(0, 3);
            siklar = karistir([kelime.es, ...yanlis]);
            soru = `<p class="yonerge">🗣️ Doğru yazılışı hangisi?</p><div class="soru">${esc(kelime.tr)}<small class="okunus">okunuşu: “${esc(kelime.okunus)}”</small></div>`;
            dogruIndex = siklar.indexOf(kelime.es);
          } else {
            const kural = SES_KURALI[kelime.id];
            const havuz = ICERIK.bul(kelime.unite).kelimeler.filter((k) => k.yazma !== false);
            const dogrular = havuz.filter((k) => kural.dogru.test(k.es));
            const yanlislar = havuz.filter((k) => !kural.ses.test(k.es));
            const d = rastgele(dogrular);
            siklar = karistir([d.es, ...karistir(yanlislar).slice(0, 3).map((k) => k.es)]);
            dogruIndex = siklar.indexOf(d.es);
            soru = `<p class="yonerge">🗣️ Hangi kelimede <b>${esc(kural.soru)}</b> var?</p>`;
          }
          alan.innerHTML = `${soru}
            <div class="siklar">${siklar.map((x, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(x)}</button>`).join('')}</div>`;
          let bitmis = false;
          const sec = (i) => {
            if (bitmis) return; bitmis = true;
            alan.querySelectorAll('.sik').forEach((b, j) => { b.disabled = true; if (j === dogruIndex) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
            Tekrar.sonuc(kelime.id, i === dogruIndex);
            bitti({
              dogru: i === dogruIndex, dogrusu: siklar[dogruIndex], ipucu: kelime.ipucu, oku: mod === 'yazilis' ? kelime.es : siklar[dogruIndex],
              soru: mod === 'yazilis' ? `${kelime.tr} (okunuşu “${kelime.okunus}”): doğru yazılış` : `Hangi kelimede ${SES_KURALI[kelime.id].soru} var?`, verilen: siklar[i]
            });
          };
          alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
          alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); };
        }
      };
    },

    /* Eşleştirme (süreli olabilir) */
    eslestir(kelimeler, sure) {
      return {
        tur: sure ? 'sureli' : 'eslestir',
        render(alan, bitti) {
          const sol = karistir(kelimeler), sag = karistir(kelimeler);
          alan.innerHTML = `
            <p class="yonerge">${sure ? `⏱️ Süre bitmeden eşleştir` : 'Eşleştir'}</p>
            ${sure ? `<div class="sure"><div class="sure-dolgu"></div></div>` : ''}
            <div class="eslestir">
              <div class="sutun">${sol.map((k) => `<button class="kart-k es" data-id="${k.id}" data-y="sol">${esc(k.es)}</button>`).join('')}</div>
              <div class="sutun">${sag.map((k) => `<button class="kart-k" data-id="${k.id}" data-y="sag">${esc(k.tr)}</button>`).join('')}</div>
            </div>`;
          let secili = null, eslesen = 0, hata = 0, bitmis = false, zaman = null;
          const hataliKelime = new Set();
          const bitir = (sonuc) => {
            if (bitmis) return; bitmis = true; clearInterval(zaman);
            alan.querySelectorAll('.kart-k').forEach((b) => (b.disabled = true));
            kelimeler.forEach((k) => { if (sonuc.tamam) Tekrar.sonuc(k.id, !hataliKelime.has(k.id)); });
            bitti(sonuc);
          };
          alan.querySelectorAll('.kart-k').forEach((b) => b.addEventListener('click', () => {
            if (bitmis || b.classList.contains('tamam')) return;
            if (!secili || secili.dataset.y === b.dataset.y) {
              if (secili) secili.classList.remove('secili');
              secili = b; b.classList.add('secili'); return;
            }
            const a = secili; secili = null; a.classList.remove('secili');
            if (a.dataset.id === b.dataset.id) {
              a.classList.add('tamam'); b.classList.add('tamam'); eslesen++;
              if (eslesen === kelimeler.length) {
                bitir({ dogru: hata <= 1, tamam: true, mesaj: hata === 0 ? 'Hatasız!' : `${hata} hata yaptın` });
              }
            } else {
              hata++;
              const solB = a.dataset.y === 'sol' ? a : b; hataliKelime.add(solB.dataset.id);
              [a, b].forEach((x) => { x.classList.add('titre'); setTimeout(() => x.classList.remove('titre'), 400); });
            }
          }));
          if (sure) {
            const dolgu = alan.querySelector('.sure-dolgu'), bas = Date.now();
            zaman = setInterval(() => {
              const kalan = 1 - (Date.now() - bas) / (sure * 1000);
              dolgu.style.width = Math.max(0, kalan * 100) + '%';
              if (kalan < 0.25) dolgu.classList.add('az');
              if (kalan <= 0) bitir({ dogru: false, tamam: false, mesaj: 'Süre doldu!' });
            }, 100);
          }
          alan._temizle = () => clearInterval(zaman);
        }
      };
    },

    /* Cümle kurma: karışık kelimeleri doğru sıraya diz.
       secenek.tur: 'ceviri_kur' (telefonda "Türkçe cümle → yaz" yerine), secenek.celdirici: yanıltıcı kelime sayısı */
    cumle(cumle, tumCumleler, dinleme, secenek = {}) {
      return {
        tur: secenek.tur || 'cumle', anahtar: cumle.es,
        render(alan, bitti) {
          const parcalar = cumle.es.split(' ');
          const digerKelimeler = karistir(tumCumleler.filter((c) => c !== cumle).flatMap((c) => c.es.split(' ')))
            .filter((w) => !parcalar.some((p) => normal(p) === normal(w)));
          // yanıltıcılar aynı biçimde iki kez gelmesin ("Hola" ve "hola,")
          let celdirici = [...new Map(digerKelimeler.map((w) => [normal(w), w])).values()].slice(0, secenek.celdirici || 2);
          // kelimelerden kur: yanıltıcılar başka cümlelerden geldiği için noktalaması ve baş harfi ele vermesin ("¿Tienen" → "tienen")
          if (secenek.tur === 'ceviri_kur') celdirici = celdirici.map((w) => w.replace(/[¿¡?!.,;:"…]/g, '')).filter(Boolean)
            .map((w) => (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]/.test(w) && bilinenMi(normal(w)) ? w[0].toLowerCase() + w.slice(1) : w));   // özel isimler (Ana, Colombia) büyük kalır
          const taslar = karistir([...parcalar, ...celdirici]).map((m, i) => ({ m, i }));
          alan.innerHTML = `
            <p class="yonerge">${dinleme ? '🎧 Dinle ve cümleyi kur' : secenek.tur === 'ceviri_kur' ? '🧱 Cümleyi kelimelerden kur' : 'Cümleyi kur'}</p>
            ${dinleme
              ? `<div class="dinle-alan"><button type="button" class="dinle-buton" title="Tekrar dinle">🔊</button><button type="button" class="yavas-buton">🐢 yavaş</button></div>`
              : `<div class="soru">${esc(cumle.tr)}</div>`}
            <div class="cevap-satiri"></div>
            <div class="taslar">${taslar.map((t) => `<button class="tas" data-i="${t.i}">${esc(t.m)}</button>`).join('')}</div>
            <button class="ana-buton kontrol" disabled>Kontrol et</button>`;
          const satir = alan.querySelector('.cevap-satiri'), kontrolB = alan.querySelector('.kontrol');
          if (dinleme) {
            const cal = (yavas) => Ses.oku(cumle.es, yavas);
            alan.querySelector('.dinle-buton').addEventListener('click', () => cal(false));
            alan.querySelector('.yavas-buton').addEventListener('click', () => cal(true));
            setTimeout(() => cal(false), 300);
          }
          const secilen = [];
          const ciz = () => {
            satir.innerHTML = secilen.map((t) => `<button class="tas yerlesik" data-i="${t.i}">${esc(t.m)}</button>`).join('');
            alan.querySelectorAll('.taslar .tas').forEach((b) => b.classList.toggle('kullanildi', secilen.some((t) => t.i === +b.dataset.i)));
            kontrolB.disabled = secilen.length === 0;
            satir.querySelectorAll('.tas').forEach((b) => b.addEventListener('click', () => {
              if (kontrolB.dataset.bitti) return;
              const k = secilen.findIndex((t) => t.i === +b.dataset.i); secilen.splice(k, 1); ciz();
            }));
          };
          alan.querySelectorAll('.taslar .tas').forEach((b) => b.addEventListener('click', () => {
            if (kontrolB.dataset.bitti || b.classList.contains('kullanildi')) return;
            secilen.push(taslar.find((t) => t.i === +b.dataset.i)); ciz();
          }));
          kontrolB.addEventListener('click', () => {
            if (kontrolB.dataset.bitti) return; kontrolB.dataset.bitti = '1'; kontrolB.disabled = true;
            const s = kontrol(secilen.map((t) => t.m).join(' '), cumle.es, false);
            satir.classList.add(s.dogru ? 'dogru' : 'yanlis');
            bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: dinleme ? `${cumle.es} = ${cumle.tr}` : cumle.es, oku: cumle.es, soru: dinleme ? '🎧 Duyduğun cümleyi kur' : cumle.tr, verilen: secilen.map((t) => t.m).join(' ') });
          });
        }
      };
    },


    /* ---------- Fiil çekimi ----------
       unite.cekimler = [{ fiil:'hablar', tr:'konuşmak', yo:'hablo', tu:'hablas', el:'habla', nos:'hablamos', ellos:'hablan' }]
       mod 'yaz': kişi verilir, çekimi yazılır · mod 'sec': aynı fiilin çekimleri arasından doğrusu seçilir */
    cekim(c, mod, kisi) {
      kisi = kisi || rastgele(KISILER.filter((x) => c[x[0]]))[0];
      const etiket = KISILER.find((x) => x[0] === kisi)[1], dogru = c[kisi];
      return {
        tur: 'cekim_' + mod, anahtar: `cekim:${c.fiil}:${kisi}`,
        render(alan, bitti) {
          const soruHtml = `<p class="yonerge">🔧 Fiili çek</p>
            <div class="soru"><span class="es">${esc(c.fiil)}</span> <small class="okunus">${esc(c.tr)}</small></div>
            <div class="cekim-satir"><span class="es">${esc(etiket)}</span> <span class="cekim-bos">___</span></div>`;
          const sonuc = (verilen, s) => bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: `${etiket.split(' / ')[0]} ${dogru} (${c.fiil})`, oku: `${etiket.split(' / ')[0]} ${dogru}`, soru: `${c.fiil} (${c.tr}) → ${etiket}`, verilen, bicim: { fiil: c.fiil, bicim: dogru, kisi } });
          if (mod === 'sec') {
            const siklar = karistir([dogru, ...karistir([...new Set(KISILER.map((x) => c[x[0]]).filter((f) => f && f !== dogru))]).slice(0, 3)]);
            alan.innerHTML = soruHtml + `<div class="siklar">${siklar.map((f, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(f)}</button>`).join('')}</div>`;
            let bitmis = false;
            const sec = (i) => {
              if (bitmis) return; bitmis = true;
              alan.querySelectorAll('.sik').forEach((b, j) => { b.disabled = true; if (siklar[j] === dogru) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
              sonuc(siklar[i], { dogru: siklar[i] === dogru });
            };
            alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
            alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); };
          } else {
            alan.innerHTML = soruHtml + `<form class="yazma"><input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Çekimi yaz…">${aksanKlavyesi()}<button type="submit" class="ana-buton">Kontrol et</button></form>`;
            const input = alan.querySelector('input'); aksanBagla(alan, input); setTimeout(() => input.focus(), 50);
            alan.querySelector('form').addEventListener('submit', (e) => {
              e.preventDefault(); if (!input.value.trim() || input.disabled) return; input.disabled = true;
              // "nosotros hablamos" diye zamirle yazdıysa da kabul
              const v = input.value.trim().replace(new RegExp('^(' + etiket.split(' / ').join('|') + ')\\s+', 'i'), '');
              const s = kontrol(v, dogru, false);
              input.classList.add(s.dogru ? 'dogru' : 'yanlis'); sonuc(input.value.trim(), s);
            });
          }
        }
      };
    },

    /* ---------- Artikel (el / la / los / las) ve çoğul ---------- */
    artikel(k, mod) {
      const [art, ad] = isimParcala(k.es), cog = cogulYap(k);
      const cogulMu = mod === 'artikel' && cog && Math.random() < 0.35;
      const gosterilen = cogulMu ? cog.split(' ').slice(1).join(' ') : ad, dogruArt = cogulMu ? cog.split(' ')[0] : art;
      return {
        tur: mod, anahtar: k.id,
        render(alan, bitti) {
          if (mod === 'artikel') {
            const siklar = cogulMu ? ['los', 'las'] : ['el', 'la'];
            alan.innerHTML = `<p class="yonerge">Artikeli seç</p>
              <div class="soru"><span class="cekim-bos">___</span> <span class="es">${esc(gosterilen)}</span><small class="okunus">${esc(k.tr)}${cogulMu ? ' (çoğul)' : ''}</small></div>
              <div class="siklar iki">${siklar.map((f, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${f}</button>`).join('')}</div>`;
            let bitmis = false;
            const sec = (i) => {
              if (bitmis) return; bitmis = true;
              alan.querySelectorAll('.sik').forEach((b, j) => { b.disabled = true; if (siklar[j] === dogruArt) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
              const d = siklar[i] === dogruArt; Tekrar.sonuc(k.id, d);
              bitti({ dogru: d, dogrusu: `${dogruArt} ${gosterilen}`, oku: `${dogruArt} ${gosterilen}`, ipucu: k.ipucu, soru: `___ ${gosterilen} (${k.tr})`, verilen: `${siklar[i]} ${gosterilen}` });
            };
            alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
            alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= 2) sec(n - 1); };
          } else {
            alan.innerHTML = `<p class="yonerge">Çoğulunu yaz (artikeliyle)</p>
              <div class="soru"><span class="es">${esc(k.es)}</span><small class="okunus">${esc(k.tr)} → çoğul</small></div>
              <form class="yazma"><input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="los / las …">${aksanKlavyesi()}<button type="submit" class="ana-buton">Kontrol et</button></form>`;
            const input = alan.querySelector('input'); aksanBagla(alan, input); setTimeout(() => input.focus(), 50);
            alan.querySelector('form').addEventListener('submit', (e) => {
              e.preventDefault(); if (!input.value.trim() || input.disabled) return; input.disabled = true;
              const s = kontrol(input.value, cog, false);
              input.classList.add(s.dogru ? 'dogru' : 'yanlis'); Tekrar.sonuc(k.id, s.dogru);
              bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: cog, oku: cog, ipucu: cogulKurali(k), soru: `${k.es} → çoğul`, verilen: input.value.trim() });
            });
          }
        }
      };
    },

    /* ---------- Soru – cevap ----------
       unite.soruCevap = [['¿De dónde eres?', 'Soy de Turquía.'], ...]
       mod 'sec': soru (yazılı ya da sesli) → doğru cevabı seç · mod 'eslestir': 4 soru ↔ 4 cevap */
    soruCevap(cift, havuz, mod) {
      // Evet/hayır sorusuna "Sí…/No…" ile başlayan başka bir cevap da uyabilir → onlar yanlış şık olmasın
      const ehSorusu = (q) => /\?/.test(q) && !/^¿?\s*(a |de |desde |por )?(qu[eé]|c[oó]mo|d[oó]nde|cu[aá]nd|cu[aá]nt|qui[eé]n|cu[aá]l)/i.test(q);
      const ehCevap = (a) => /^(s[ií]|no)\b/i.test(a);
      const uygun = (x) => x !== cift && x[1] !== cift[1] && !(ehSorusu(cift[0]) && ehCevap(x[1]));
      if (mod === 'eslestir') {
        // eşleştirmede en fazla bir evet/hayır sorusu olsun (cevaplar birbirine karışmasın)
        const ciftler = [cift];
        for (const x of karistir(havuz.filter(uygun))) {
          if (ciftler.length >= 4) break;
          if (ehSorusu(x[0]) && ciftler.some((c) => ehSorusu(c[0]) || ehCevap(c[1]))) continue;
          if (ehCevap(x[1]) && ciftler.some((c) => ehSorusu(c[0]))) continue;
          if (ciftler.some((c) => c[1] === x[1])) continue;
          ciftler.push(x);
        }
        return {
          tur: 'sc_eslestir', anahtar: 'sc:' + cift[0],
          render(alan, bitti) {
            const sol = karistir(ciftler.map((c, i) => ({ i, m: c[0] }))), sag = karistir(ciftler.map((c, i) => ({ i, m: c[1] })));
            alan.innerHTML = `<p class="yonerge">💬 Her soruyu cevabıyla eşleştir</p>
              <div class="eslestir sc"><div class="sutun">${sol.map((x) => `<button class="kart-k es" data-id="${x.i}" data-y="sol">${esc(x.m)}</button>`).join('')}</div>
              <div class="sutun">${sag.map((x) => `<button class="kart-k es" data-id="${x.i}" data-y="sag">${esc(x.m)}</button>`).join('')}</div></div>`;
            let secili = null, eslesen = 0, hata = 0, bitmis = false;
            alan.querySelectorAll('.kart-k').forEach((b) => b.addEventListener('click', () => {
              if (bitmis || b.classList.contains('tamam')) return;
              if (b.dataset.y === 'sol' && Ses.aktif()) Ses.oku(b.textContent);
              if (!secili || secili.dataset.y === b.dataset.y) { if (secili) secili.classList.remove('secili'); secili = b; b.classList.add('secili'); return; }
              const a = secili; secili = null; a.classList.remove('secili');
              if (a.dataset.id === b.dataset.id) {
                a.classList.add('tamam'); b.classList.add('tamam');
                if (++eslesen === ciftler.length) { bitmis = true; bitti({ dogru: hata <= 1, tamam: true, mesaj: hata ? `${hata} hata yaptın` : 'Hatasız!', soru: 'Soru–cevap eşleştirme', verilen: hata ? `${hata} hata` : 'hatasız', dogrusu: ciftler.map((c) => `${c[0]} → ${c[1]}`).join(' · ') }); }
              } else { hata++; [a, b].forEach((x) => { x.classList.add('titre'); setTimeout(() => x.classList.remove('titre'), 400); }); }
            }));
          }
        };
      }
      const sesli = Ses.aktif() && Math.random() < 0.5;
      return {
        tur: sesli ? 'sc_dinle' : 'sc_sec', anahtar: 'sc:' + cift[0],
        render(alan, bitti) {
          const diger = karistir(havuz.filter(uygun)).slice(0, 2).map((x) => x[1]);
          const siklar = karistir([cift[1], ...diger]);
          alan.innerHTML = `<p class="yonerge">${sesli ? '🎧 Sana soruldu. Doğru cevap hangisi?' : '💬 Doğru cevap hangisi?'}</p>
            ${sesli ? `<div class="dinle-alan"><button type="button" class="dinle-buton" title="Tekrar dinle">🔊</button><button type="button" class="yavas-buton">🐢 yavaş</button></div>`
                    : `<div class="soru es">${esc(cift[0])}${sesButonu(cift[0])}</div>`}
            <div class="siklar">${siklar.map((m, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(m)}</button>`).join('')}</div>`;
          if (sesli) {
            const cal = (y) => Ses.oku(cift[0], y);
            alan.querySelector('.dinle-buton').addEventListener('click', () => cal(false));
            alan.querySelector('.yavas-buton').addEventListener('click', () => cal(true));
            setTimeout(() => cal(false), 300);
          }
          let bitmis = false;
          const sec = (i) => {
            if (bitmis) return; bitmis = true;
            alan.querySelectorAll('.sik').forEach((b, j) => { b.disabled = true; if (siklar[j] === cift[1]) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
            bitti({ dogru: siklar[i] === cift[1], dogrusu: `${cift[0]} → ${cift[1]}`, oku: `${cift[0]} ${cift[1]}`, soru: sesli ? `🎧 ${cift[0]}` : cift[0], verilen: siklar[i] });
          };
          alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
          alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); else if (sesli && e.key === ' ') { e.preventDefault(); Ses.oku(cift[0]); } };
        }
      };
    },

    /* ---------- Dinle → rakamla yaz ----------
       unite.rakam = [{ tip:'sayi', min:0, max:20 }, { tip:'saat' }, { tip:'fiyat', max:100 }, { tip:'telefon' }]
       Ses yoksa yazıyla gösterilir (okuma alıştırması olur). */
    rakam(tanim) {
      const s = rakamUret(tanim), sesli = Ses.aktif();
      return {
        tur: 'rakam', anahtar: `rakam:${tanim.tip}:${s.metin}`,
        render(alan, bitti) {
          alan.innerHTML = `<p class="yonerge">${sesli ? '🎧 Dinle ve rakamla yaz' : '🔢 Rakamla yaz'} <small>(${s.ornek})</small></p>
            ${sesli ? `<div class="dinle-alan"><button type="button" class="dinle-buton" title="Tekrar dinle">🔊</button><button type="button" class="yavas-buton">🐢 yavaş</button></div>`
                    : `<div class="soru es">${esc(s.metin)}</div>`}
            <form class="yazma"><input type="text" inputmode="decimal" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${s.ornek}"><button type="submit" class="ana-buton">Kontrol et</button></form>`;
          if (sesli) {
            const cal = (y) => Ses.oku(s.metin, y);
            alan.querySelector('.dinle-buton').addEventListener('click', () => cal(false));
            alan.querySelector('.yavas-buton').addEventListener('click', () => cal(true));
            setTimeout(() => cal(false), 300);
            alan._tus = (e) => { if (e.key === ' ' && !e.target.matches('input')) { e.preventDefault(); cal(false); } };
          }
          const input = alan.querySelector('input'); setTimeout(() => input.focus(), 50);
          alan.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault(); if (!input.value.trim() || input.disabled) return; input.disabled = true;
            const v = rakamNormal(input.value), d = s.kabul.includes(v);
            input.classList.add(d ? 'dogru' : 'yanlis');
            bitti({ dogru: d, dogrusu: `${s.cevap} = ${s.metin}`, oku: s.metin, soru: sesli ? '🎧 Duyduğunu rakamla yaz' : s.metin, verilen: input.value.trim() });
          });
        }
      };
    },

    /* ---------- Oturum üreticileri ---------- */

    // Oturum içinde az kullanılmış öğeleri öne al: aynı kelimeler tekrar tekrar gelmesin
    // Aynı kelime farklı soru türlerinde gelebilir, ama aynı türde (aynı soru) tekrar gelmez;
    // eşitlikte o oturumda en az görülen kelime seçilir.
    _kullanilan: new Set(), _sayac: new Map(),
    _sifirla(onceden) { this._kullanilan = new Set(); this._sayac = new Map(); (onceden || []).forEach((k) => this._sayac.set(k, 1)); },
    _taze(liste, n, tur) {
      const anahtar = (x) => x.id || x.es || (x.satirlar && x.satirlar[0]);
      const zor = (x) => (window.Puan && Puan.zorMu(anahtar(x)) ? 0.5 : 0);
      const puan = (x) => (this._kullanilan.has(tur + ':' + anahtar(x)) ? 100 : 0) + (this._sayac.get(anahtar(x)) || 0) - zor(x);
      const sirali = karistir(liste).sort((a, b) => puan(a) - puan(b));
      const secilen = (liste[0] && liste[0].tr && liste[0].id ? benzersiz(sirali) : sirali).slice(0, n);
      secilen.forEach((x) => { this._kullanilan.add(tur + ':' + anahtar(x)); this._sayac.set(anahtar(x), (this._sayac.get(anahtar(x)) || 0) + 1); });
      return secilen;
    },
    _tek(liste, tur) { return this._taze(liste, 1, tur)[0]; },
    // aynı fiilin aynı kişisi oturumda tekrar sorulmasın
    _tekKisi(c) {
      const adaylar = KISILER.map((x) => x[0]).filter((x) => c[x] && !this._kullanilan.has(`cekim:${c.fiil}:${x}`));
      const x = rastgele(adaylar.length ? adaylar : KISILER.map((y) => y[0]).filter((y) => c[y]));
      this._kullanilan.add(`cekim:${c.fiil}:${x}`); return x;
    },
    // yanlış cevap şıkları: bu ünite + daha önce öğrenilen ünitelerin soru-cevapları
    _scHavuz(unite) {
      const sinir = this.sinirSira(unite);
      return ICERIK.uniteler.filter((u) => u.sira <= sinir).flatMap((u) => u.soruCevap || []).concat(unite.ek ? unite.soruCevap || [] : []);
    },

    // Telefonda "Türkçe cümle → İspanyolca yaz" yerine kelime taşlarından kurma (2–3 yanıltıcı kelime)
    ceviriVeya(cm, havuz) {
      if (yazmaKalsin()) return this.ceviri(cm);
      return this.cumle(cm, havuz, false, { tur: 'ceviri_kur', celdirici: Math.random() < 0.5 ? 2 : 3 });
    },
    telefon,

    // Bir üniteden tek bir alıştırma üret (tür verilmezse rastgele); cevap günlüğü için ünite bilgisi eklenir
    uniteden(unite, tur) { const a = this._uniteden(unite, tur); a.unite = unite.id; return a; },
    _uniteden(unite, tur) {
      const kel = unite.kelimeler, yazilir = kel.filter((k) => k.yazma !== false);
      const cum = unite.cumleler, bos = unite.bosluklar || [];
      const ses = Ses.aktif();
      const turler = this.uniteTurleri(unite);
      const t = tur && turler.includes(tur) ? tur : rastgele(turler);
      if (t === 'sec_es') return this.sec(this._tek(kel, t), 'es');
      if (t === 'sec_tr') return this.sec(this._tek(kel, t), 'tr');
      if (t === 'yaz') return this.yazVeya(this._tek(yazilir, t));
      // telefonda ekrana sığsın diye bir çift az: 4 / süreli 5
      if (t === 'eslestir') return this.eslestir(this._taze(kel, telefon() ? 4 : 5, t));
      if (t === 'sureli') return this.eslestir(this._taze(kel, telefon() ? 5 : 6, t), 40);
      if (t === 'cumle') return this.cumle(this.cumleSec(unite, t), this.cumleHavuzu(unite));
      if (t === 'bosluk') return this.bosluk(this._tek(bos, t));
      if (t === 'dinle_sec') return this.dinle(this._tek(yazilir, t), 'sec');
      if (t === 'dinle_yaz') return this.dinle(this._tek(yazilir, t), yazmaKalsin() ? 'yaz' : 'sec');
      if (t === 'dinle_cumle') { const havuz = this.cumleHavuzu(unite); return this.dinleCumle(this.cumleSec(unite, t), havuz, havuz.length >= 3 && Math.random() < 0.5 ? 'anlam' : 'kur'); }
      if (t === 'cekim') {
        // birikimli: yarı yarıya bu ünitenin fiilleri, kalanı açılmış tüm ünitelerin fiilleri
        const kendi = unite.cekimler || [], havuz = this.cekimHavuzu(unite).map((x) => x.c);
        const c = kendi.length && (Math.random() < 0.5 || havuz.length <= kendi.length) ? rastgele(kendi) : rastgele(havuz);
        return this.cekim(c, yazModu(0.55) ? 'yaz' : 'sec', this._tekKisi(c));
      }
      if (t === 'cekim_cumle') {
        const ad = this.cekimAdaylari(unite), kendi = ad.filter((x) => (unite.cekimler || []).includes(x.c));
        return this.cekimCumle(this._tek(kendi.length && Math.random() < 0.5 ? kendi : ad, t), yazModu(0.5) ? 'yaz' : 'sec');
      }
      if (t === 'ser_estar') return this.serEstar(this._tek(this.serEstarAdaylari(unite), t));
      if (t === 'ceviri') return this.ceviriVeya(this.cumleSec(unite, t, KISA_CUMLE), this.cumleHavuzu(unite));
      if (t === 'dogru_yanlis') {
        const cm = this.cumleSec(unite, t, (c) => !c.es.includes('—'));
        return this.dogruYanlis(cm, Math.random() < 0.55 ? this.boz(cm.es, unite) : null);
      }
      if (t === 'artikel') {
        // çoğul yapma bir yazma sorusu: telefonda çoğunlukla artikel seçmeye döner
        const coglar = unite.sira >= COGUL_SIRA ? kel.filter(cogulUygun) : [], mod = coglar.length && yazModu(0.4) ? 'cogul' : 'artikel';
        return this.artikel(this._tek(mod === 'cogul' ? coglar : kel.filter(artikelUygun), mod), mod);
      }
      if (t === 'soru_cevap') {
        const havuz = this._scHavuz(unite), cift = this._tek(unite.soruCevap.map((x) => Object.assign(x, { id: 'sc:' + x[0] })), 'sc');
        return this.soruCevap(cift, havuz, unite.soruCevap.length >= 4 && Math.random() < 0.35 ? 'eslestir' : 'sec');
      }
      if (t === 'rakam') return this.rakam(rastgele(unite.rakam));
      if (t === 'okunus') {
        const okunanlar = kel.filter((k) => k.okunus), harfler = kel.filter((k) => SES_KURALI[k.id]);
        const mod = !harfler.length || (okunanlar.length && Math.random() < 0.6) ? 'yazilis' : 'ses';
        return this.okunus(this._tek(mod === 'yazilis' ? okunanlar : harfler, 'okunus_' + mod), mod);
      }
      return this.sec(rastgele(kel), 'es');
    },
    // Ünitenin içeriğine göre mümkün olan türler (ağırlıklı)
    uniteTurleri(unite) {
      const kel = unite.kelimeler, yazilir = kel.filter((k) => k.yazma !== false);
      const t = ['sec_es', 'sec_es', 'sec_tr', 'sec_tr'];
      if (kel.length >= 4) t.push('eslestir');
      if (kel.length >= 5 && (kel.length > 20 || Math.random() < 0.5)) t.push('sureli');
      if (yazilir.length) t.push('yaz', 'yaz');
      const havuz = this.cumleHavuzu(unite);
      if (havuz.length) t.push('cumle', 'cumle');
      if (havuz.some(KISA_CUMLE)) t.push('ceviri', 'ceviri');
      if (havuz.filter((c) => !c.es.includes('—')).length >= 3) t.push('dogru_yanlis');
      if ((unite.bosluklar || []).length) t.push('bosluk', 'bosluk', 'bosluk');
      if (Ses.aktif() && yazilir.length) t.push('dinle_sec', 'dinle_yaz');
      if (Ses.aktif() && havuz.length) t.push('dinle_cumle');
      if (kel.some((k) => k.okunus || SES_KURALI[k.id])) t.push('okunus', 'okunus', 'okunus');
      // fiiller birikimli: bu ünitede fiil yoksa da önceki ünitelerin fiilleri sorulur (daha seyrek)
      const kendiFiil = (unite.cekimler || []).length;
      if (kendiFiil) t.push('cekim', 'cekim', 'cekim'); else if (this.cekimHavuzu(unite).length) t.push('cekim');
      const cc = this.cekimAdaylari(unite).length;
      if (cc >= 3) { t.push('cekim_cumle'); if (kendiFiil) t.push('cekim_cumle'); }
      if ((unite.ek || unite.sira >= 5) && this.serEstarAdaylari(unite).length >= 3) t.push('ser_estar');
      if (unite.sira >= ARTIKEL_SIRA && kel.filter(artikelUygun).length >= 4) t.push('artikel', 'artikel');
      if ((unite.soruCevap || []).length >= 3) t.push('soru_cevap', 'soru_cevap');
      if ((unite.rakam || []).length) t.push('rakam', 'rakam');
      return t;
    },

    // Ünite alıştırması: her seferinde rastgele 10 soru, her türden en az biri, aynı kelime iki kez gelmesin
    // Alıştırma soru sayısı ünitenin büyüklüğüne göre: 12–25
    alistirmaSayisi(unite) { return Math.min(25, Math.max(12, Math.round(unite.kelimeler.length * 0.75))); },
    karisik(unite, adet) {
      adet = adet || this.alistirmaSayisi(unite);
      this._sifirla();
      const turler = this.uniteTurleri(unite);
      const plan = karistir([...new Set(turler)]).concat(Array.from({ length: adet }, () => rastgele(turler))).slice(0, adet);
      return this._tekrarsiz(karistir(plan).map((t) => () => this.uniteden(unite, t)));
    },
    // Aynı kelime/cümle art arda gelmesin diye birkaç deneme yapar
    _tekrarsiz(ureticiler) {
      const goruldu = new Set();
      return ureticiler.map((uret) => {
        let a = uret();
        for (let i = 0; i < 5; i++) {
          const anahtar = a.anahtar;
          if (!anahtar || !goruldu.has(anahtar)) break;
          a = uret();
        }
        if (a.anahtar) goruldu.add(a.anahtar);
        return a;
      });
    },

    // Mini sınav: ünitenin HER kelimesi en az bir kez sorulur (türler kelimeler arasında dağıtılır),
    // üstüne cümle düzeyinde sorular eklenir. Ağırlık üretimde: Türkçe → İspanyolca, yazma, dinleme.
    sinav(unite) {
      this._sifirla();
      const ses = Ses.aktif();
      const liste = [];
      // 1) kelime başına bir soru, türler sırayla dağıtılır
      const kelimeTurleri = ses ? ['yaz', 'sec_tr', 'dinle_yaz', 'yaz', 'dinle_sec', 'sec_tr'] : ['yaz', 'sec_tr', 'yaz'];
      let sira = 0;
      // ek ünitelerde (çok kelimeli olabilir) sınav en fazla 30 kelimeden
      karistir(unite.kelimeler).slice(0, unite.ek ? 30 : undefined).forEach((k) => {
        if (SES_KURALI[k.id]) { liste.push(this.okunus(k, 'ses')); return; }        // harf kartı
        if (k.yazma === false) { liste.push(this.sec(k, 'tr')); return; }
        if (k.okunus && sira % 3 === 0) { sira++; liste.push(this.okunus(k, 'yazilis')); return; }
        const t = kelimeTurleri[sira++ % kelimeTurleri.length];
        liste.push(t === 'yaz' ? this.yazVeya(k, true) : t === 'sec_tr' ? this.sec(k, 'tr') : this.dinle(k, t === 'dinle_yaz' && yazmaKalsin() ? 'yaz' : 'sec'));
      });
      // 2) cümle düzeyi: 2 cümle kurma, (ses varsa) 1 dinleyip kurma, 3 boşluk/diyalog
      const cum = unite.cumleler, bos = unite.bosluklar || [];
      if (cum.length) {
        this._taze(cum, Math.min(2, cum.length), 'cumle').forEach((c) => liste.push(this.cumle(c, cum)));
        if (ses) liste.push(this.dinleCumle(this._tek(cum, 'dinle_kur'), cum, 'kur'));
      }
      if (bos.length) {
        const diyaloglar = bos.filter((b) => b.satirlar.length > 1);
        const secilen = diyaloglar.length ? [this._tek(diyaloglar, 'bosluk')] : [];
        this._taze(bos.filter((b) => !secilen.includes(b)), Math.min(bos.length, 3) - secilen.length, 'bosluk').forEach((b) => secilen.push(b));
        secilen.forEach((b) => liste.push(this.bosluk(b)));
      }
      // 3) yeni türler: fiil çekimi (2), artikel/çoğul (1–2), soru-cevap (1), rakam (2)
      (unite.cekimler || []).length && karistir(unite.cekimler.flatMap((c) => KISILER.filter((x) => c[x[0]]).map((x) => [c, x[0]]))).slice(0, 2)
        .forEach(([c, x], i) => liste.push(this.cekim(c, i || !yazmaKalsin() ? 'sec' : 'yaz', x)));
      const isimler = unite.kelimeler.filter(artikelUygun);
      if (unite.sira >= ARTIKEL_SIRA && isimler.length >= 4) {
        liste.push(this.artikel(rastgele(isimler), 'artikel'));
        const cog = unite.sira >= COGUL_SIRA ? unite.kelimeler.filter(cogulUygun) : []; if (cog.length && yazmaKalsin()) liste.push(this.artikel(rastgele(cog), 'cogul'));
      }
      if ((unite.soruCevap || []).length >= 3) liste.push(this.soruCevap(rastgele(unite.soruCevap), this._scHavuz(unite), 'sec'));
      // 4) cümle düzeyinde yeni türler: 1 çeviri, (fiil varsa) 1 cümle içinde çekim
      const kisa = this.cumleHavuzu(unite).filter(KISA_CUMLE);
      if (kisa.length) liste.push(this.ceviriVeya(this._tek(kisa, 'ceviri'), this.cumleHavuzu(unite)));
      const cc = this.cekimAdaylari(unite).filter((x) => (unite.cekimler || []).includes(x.c));
      if (cc.length) liste.push(this.cekimCumle(this._tek(cc, 'cekim_cumle'), 'sec'));
      (unite.rakam || []).length && [0, 1].forEach(() => liste.push(this.rakam(rastgele(unite.rakam))));
      liste.forEach((a) => { a.unite = unite.id; });
      return karistir(liste);
    },

    /* ---------- 🏆 BÜYÜK SINAV: her 5 ünitede bir (21–27 tek grup) ----------
       Ünite ilerlemesinin yanında 'b01'…'b05' kimliğiyle saklanır (Depo.veri.uniteler): veri biçimi değişmez,
       senkron ünite kuralıyla birleştirir. Geçilmeden sonraki blok açılmaz (app.js → uniteAcikMi). */
    BUYUK_SINAVLAR: [['b01', 1, 5], ['b02', 6, 10], ['b03', 11, 15], ['b04', 16, 20], ['b05', 21, 27]]
      .map(([id, bas, son], i) => ({ id, no: i + 1, bas, son })),
    BUYUK_GECME: 0.8,
    // grubun son ünitesi bu ünite mi? (Ünite 5 → b01)
    buyukSinavSonu(uid) { const u = ICERIK.bul(uid); return u && !u.ek ? this.BUYUK_SINAVLAR.find((b) => b.son === u.sira) || null : null; },

    /* Büyük sınav: 24 soru = 18 🎧 uzun dinleme (sahneler: icerik/dinleme.js; her sahne "anla" + "cevap ver")
       + 6 kısa üretim (kelime, çekim, cümle; zor kelimeler önce). B02+ sınavlarda dinlemenin bir kısmı önceki
       blokların sahnelerinden. Bloğun sahnesi yetmezse eksik dinleme yerine klasik sorular gelir. */
    BUYUK_DINLEME: 18, BUYUK_URETIM: 6,
    buyukSinav(b) {
      this._sifirla();
      const tum = ICERIK.dinlemeler || [];
      const oncekiBloklar = this.BUYUK_SINAVLAR.filter((x) => x.son < b.bas).map((x) => x.id);
      const ses = Ses.aktif();
      const gruplar = [];        // her grup: art arda gelecek soru üreticileri (aynı sahnenin iki sorusu yan yana)
      let dinleme = 0;
      const sahneEkle = (s) => {
        const g = ['anla', 'cevap'].filter((t) => s[t]).map((t) => () => { const a = this.dinleSahne(s, t, !ses); a.unite = s.uid; return a; });
        if (dinleme + g.length > this.BUYUK_DINLEME) return;
        gruplar.push(g); dinleme += g.length;
      };
      // önce önceki blokların 2 sahnesi (en fazla 4 soru), sonra bu bloğun sahneleri
      if (oncekiBloklar.length) karistir(tum.filter((s) => oncekiBloklar.includes(s.blok))).slice(0, 2).forEach(sahneEkle);
      karistir(tum.filter((s) => s.blok === b.id)).forEach(sahneEkle);
      // kısa üretim + (sahne yetmediyse) eksik dinlemenin yerine klasik sorular
      const klasikAdet = this.BUYUK_URETIM + (this.BUYUK_DINLEME - dinleme);
      this._buyukKlasik(b, klasikAdet, oncekiBloklar.length ? Math.round(klasikAdet * 0.3) : 0).forEach((f) => gruplar.push([f]));
      return this._tekrarsiz(karistir(gruplar).flat());
    },

    // Klasik büyük sınav soruları (eski düzen): ~%70 blok (önce zor / tekrar kutusu düşük kelimeler), gerisi önceki üniteler
    _buyukKlasik(b, TOPLAM, ONCEKI) {
      const ses = Ses.aktif();
      const blok = ICERIK.uniteler.filter((u) => u.sira >= b.bas && u.sira <= b.son);
      const onceki = ICERIK.uniteler.filter((u) => u.sira < b.bas);
      if (!onceki.length) ONCEKI = 0;
      const BLOK = TOPLAM - ONCEKI;
      const uretici = [];

      // 1) kelime soruları (blok): zor bulunan ve tekrar kutusu düşük kelimeler önce
      const zorluk = (k) => {
        const r = Depo.veri.kelimeler[k.id];
        return (window.Puan && Puan.zorMu(k.id) ? 4 : 0) + (r ? Math.max(0, 5 - (r.kutu || 1)) : 3) + Math.random() * 2;
      };
      const kelimeler = blok.flatMap((u) => u.kelimeler).filter((k) => k.yazma !== false).sort((a, c) => zorluk(c) - zorluk(a));
      const KELIME = Math.round(BLOK * 0.45);
      const turSirasi = ses ? ['yaz', 'sec_tr', 'dinle_yaz', 'yaz', 'dinle_sec'] : ['yaz', 'sec_tr', 'yaz'];
      benzersiz(kelimeler).slice(0, KELIME).forEach((k, i) => {
        const t = turSirasi[i % turSirasi.length];
        uretici.push(() => {
          const a = t === 'yaz' ? this.yazVeya(k, true) : t === 'sec_tr' ? this.sec(k, 'tr') : this.dinle(k, t === 'dinle_yaz' && yazmaKalsin() ? 'yaz' : 'sec');
          a.unite = k.unite; return a;
        });
      });

      // 2) cümle düzeyi (blok): üniteler sırayla, üretim ağırlıklı türler
      const CUMLE_TURLERI = ['cumle', 'bosluk', 'ceviri', 'cekim', 'cekim_cumle', 'ser_estar', 'dinle_cumle', 'artikel', 'soru_cevap', 'rakam', 'bosluk', 'cumle'];
      const kalan = BLOK - uretici.length;
      for (let i = 0; i < kalan; i++) {
        const u = blok[i % blok.length], var_ = this.uniteTurleri(u);
        const adaylar = CUMLE_TURLERI.filter((t) => var_.includes(t));
        const t = adaylar.length ? adaylar[(Math.floor(i / blok.length) + i) % adaylar.length] : null;
        // soru–cevap sınavda hep "doğru cevabı seç" (eşleştirme tanıma türü, sınavda yok)
        if (t === 'soru_cevap') uretici.push(() => { const a = this.soruCevap(rastgele(u.soruCevap), this._scHavuz(u), 'sec'); a.unite = u.id; return a; });
        else uretici.push(() => this.uniteden(u, t || undefined));
      }

      // 3) önceki ünitelerden karışık (unutulmuş mu?)
      const ESKI_TURLERI = ['yaz', 'cumle', 'bosluk', 'ceviri', 'cekim', 'sec_tr', 'dinle_yaz'];
      for (let i = 0; i < ONCEKI; i++) {
        const u = rastgele(onceki), var_ = this.uniteTurleri(u);
        const adaylar = ESKI_TURLERI.filter((t) => var_.includes(t));
        uretici.push(() => this.uniteden(u, adaylar.length ? rastgele(adaylar) : undefined));
      }
      return uretici;
    },

    /* 🎧 Uzun dinleme sorusu. s = sahne (icerik/dinleme.js), tip 'anla' (Türkçe soru + Türkçe şıklar)
       ya da 'cevap' (duruma uygun İspanyolca cevabı seç). Şıkların ilki doğrudur; gösterirken karıştırılır.
       yazili: cihazda İspanyolca ses yoksa sahne yazılı gösterilir (okuma sorusu olur). */
    dinleSahne(s, tip, yazili) {
      const q = s[tip];
      // sonuç ekranı için metin: iki kişilik konuşmada satırlar "—" ile ayrılır
      const metin = s.satirlar.length > 1 ? s.satirlar.map(([, m]) => '— ' + m).join(' ') : s.satirlar[0][1];
      return {
        tur: tip === 'anla' ? 'dinle_anla' : 'dinle_cevap', anahtar: s.id + ':' + tip,
        render(alan, bitti) {
          const siklar = karistir(q.siklar.map((m, i) => ({ m, dogru: i === 0 })));
          const dogruI = siklar.findIndex((x) => x.dogru);
          const satirHtml = s.satirlar.map(([kim, m]) => `<p><span class="konusan ${kim === 'B' ? 'b' : 'a'}">${kim === 'B' ? '🅱' : '🅰'}</span> ${esc(m)}</p>`).join('');
          alan.innerHTML = `
            <p class="yonerge">${tip === 'anla' ? '🎧 Dinle ve anla' : '💬 Dinle ve cevap ver'}</p>
            <p class="sahne-adi">📍 ${esc(s.sahne)}</p>
            ${yazili ? `<div class="diyalog sahne-metin">${satirHtml}</div>`
              : `<div class="dinle-alan"><button type="button" class="dinle-buton" title="Tekrar dinle (boşluk)">🔊</button><button type="button" class="yavas-buton">🐢 yavaş</button></div>`}
            <div class="soru sahne-soru">${esc(q.soru)}</div>
            <div class="siklar">${siklar.map((x, i) => `<button class="sik ${tip === 'cevap' ? 'es-sik' : ''}" data-i="${i}"><span class="no">${i + 1}</span>${esc(x.m)}</button>`).join('')}</div>`;
          const cal = (yavas) => Ses.sahneOku(s.satirlar, yavas);
          let zaman = null;
          if (!yazili) {
            const buton = alan.querySelector('.dinle-buton');
            buton.addEventListener('click', () => cal(false));
            alan.querySelector('.yavas-buton').addEventListener('click', () => cal(true));
            // açılınca bir kez okunur; soru o arada değiştiyse (buton artık sayfada değilse) okunmaz
            zaman = setTimeout(() => { if (alan.contains(buton)) cal(false); }, 350);
          }
          let bitmis = false;
          const sec = (i) => {
            if (bitmis) return; bitmis = true;
            alan.querySelectorAll('.sik').forEach((b, j) => { b.disabled = true; if (j === dogruI) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
            bitti({ dogru: i === dogruI, dogrusu: siklar[dogruI].m, soru: `${s.sahne}: ${q.soru}`, verilen: siklar[i].m, metin, metinTr: s.tr });
          };
          alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
          alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar.length) sec(n - 1); else if (e.key === ' ' && !yazili) { e.preventDefault(); cal(false); } };
          alan._temizle = () => { clearTimeout(zaman); Ses.dur(); };
        }
      };
    },

    // Genel tekrar: önce vakti gelen kelimeler, kalanı açılmış ünitelerden rastgele her türden alıştırma
    genelTekrar(uniteler, vakitGelenIdler, adet) {
      this._sifirla(vakitGelenIdler.slice(0, Math.ceil(adet / 2)));
      const liste = [];
      vakitGelenIdler.slice(0, Math.ceil(adet / 2)).map((id) => ICERIK.kelime(id)).filter(Boolean).forEach((k) => {
        const secenek = ['sec_es', 'sec_tr']; if (k.yazma !== false) secenek.push('yaz', 'yaz');
        if (k.yazma !== false && Ses.aktif()) secenek.push('dinle_sec', 'dinle_yaz');
        (window.Puan ? Puan.zorTurler(k.id) : []).forEach((zt) => { if (secenek.includes(zt)) secenek.push(zt, zt); });
        const t = rastgele(secenek);
        liste.push(t === 'dinle_sec' ? this.dinle(k, 'sec') : t === 'dinle_yaz' ? this.dinle(k, yazmaKalsin() ? 'yaz' : 'sec') : t === 'yaz' ? this.yazVeya(k) : this.sec(k, t === 'sec_es' ? 'es' : 'tr'));
      });
      while (liste.length < adet && uniteler.length) liste.push(this.uniteden(rastgele(uniteler)));
      return karistir(liste);
    }
  };

  window.Alistirma = Alistirma;
})();
