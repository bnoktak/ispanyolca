/* =========================================================
   CÜMLE ÜRETİCİ ve YENİ SORU TÜRLERİ
   - Birikimli fiil havuzu: açılmış ünitelerin tüm fiil çekimleri
   - Şablon cümleler (ICERIK.sablonlar): kalıp + ünite isimleri → yeni cümle
   - cekimCumle : cümlede çekimli fiil boş bırakılır, (fiil · kişi) ipucuyla çekilir
   - serEstar   : cümledeki ser / estar biçimi boş, hangisi?
   - ceviri     : Türkçe cümle → İspanyolcasını yaz
   - dogruYanlis: cümle doğru mu yanlış mı (yanlışsa bir kelimesi bozulmuştur)
   ========================================================= */
(function () {
  'use strict';
  const A = window.Alistirma;
  const { esc, karistir, kontrol, normal, aksanKlavyesi, aksanBagla } = A;
  const rastgele = (a) => a[Math.floor(Math.random() * a.length)];

  const KISI = { yo: 'yo', tu: 'tú', el: 'él / ella / usted', nos: 'nosotros', ellos: 'ellos / ustedes' };
  const KISI_KISA = { yo: 'yo', tu: 'tú', el: 'él / ella', nos: 'nosotros', ellos: 'ellos' };
  const ZAMIR = /^(yo|tú|tu|él|ella|usted|nosotros|nosotras|ellos|ellas|ustedes)\s+/i;
  // bu kelimelerden sonra gelen biçim fiil değil isimdir: "el trabajo", "mi juego"
  const ISIM_ONU = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'nuestro', 'nuestra', 'del', 'al', 'este', 'esta', 'ese', 'esa', 'buen', 'mucho', 'poco']);
  const ATLA = new Set(['como']);
  // özne zamiri → hangi fiil kişisi(leri)
  const ZAMIR_KISI = { yo: ['yo'], 'tú': ['tu'], 'él': ['el'], ella: ['el'], usted: ['el'], nosotros: ['nos'], nosotras: ['nos'], ellos: ['ellos'], ellas: ['ellos'], ustedes: ['ellos'] };       // "como" çoğunlukla "gibi / nasıl" anlamında, comer'in yo biçimi sayılmasın

  // ünite sınırı: ek ünitelerde (kilitsiz) sadece çalışılmış ana üniteler
  const sinirSira = (u) => (u && u.ek ? A.ustSira || 0 : Math.max(u ? u.sira : 0, A.ustSira || 0));
  const acikUniteler = (u) => { const s = sinirSira(u); return ICERIK.uniteler.filter((x) => x.sira <= s); };
  const uniteAcik = (uid, u) => { const x = ICERIK.bul(uid); return !!x && !x.ek && x.sira <= sinirSira(u); };

  // ---- yazı parçalama: "¿Dónde está el baño?" → [{on:'¿', w:'Dónde', son:''}, ...]
  function parcala(es) {
    return es.split(' ').map((t) => { const m = /^([¿¡"—(]*)(.*?)([?!.,;:"…)]*)$/.exec(t); return { on: m[1], w: m[2], son: m[3] }; });
  }
  const bosMetin = (p, i) => p.map((x, j) => x.on + (j === i ? '___' : x.w) + x.son).join(' ');
  const birlestir = (p) => p.map((x) => x.on + x.w + x.son).join(' ');
  const buyukHarf = (orn, w) => (orn && orn[0] !== orn[0].toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w);

  /* ---------- fiil havuzu ---------- */
  const _onbellek = new Map();
  function bellek(anahtar, fn) { if (!_onbellek.has(anahtar)) _onbellek.set(anahtar, fn()); return _onbellek.get(anahtar); }

  function cekimHavuzu(u) {
    return bellek('cekim:' + sinirSira(u), () => acikUniteler(u).flatMap((x) => (x.cekimler || []).map((c) => ({ c, uid: x.id }))));
  }
  // biçim → [{ c, kisi }] (tek kelimelik biçimler; "me levanto" gibi iki kelimelileri atla)
  function bicimDizini(u) {
    return bellek('dizin:' + sinirSira(u), () => {
      const m = new Map();
      cekimHavuzu(u).forEach(({ c }) => Object.keys(KISI).forEach((k) => {
        const f = c[k]; if (!f || f.includes(' ') || ATLA.has(f)) return;
        if (!m.has(f)) m.set(f, []); m.get(f).push({ c, kisi: k });
      }));
      return m;
    });
  }
  // cümledeki çekimli fiiller: [{ i: parça sırası, c, kisi }]
  function fiilBul(es, dizin) {
    const p = parcala(es), sonuc = [];
    p.forEach((x, i) => {
      const w = x.w.toLowerCase(), onceki = i ? p[i - 1].w.toLowerCase() : '';
      const h = dizin.get(w); if (!h || h.length !== 1 || ISIM_ONU.has(onceki)) return;
      sonuc.push({ i, c: h[0].c, kisi: h[0].kisi });
    });
    return sonuc;
  }

  /* ---------- şablon cümleler ---------- */
  const trBuyuk = (s) => (s[0] === 'i' ? 'İ' : s[0].toLocaleUpperCase('tr')) + s.slice(1);
  const trCekirdek = (tr) => tr.replace(/\s*\([^)]*\)/g, '').split(/[,;/]/)[0].trim();
  let _esIndeks = null;
  function kelimeEs(es) {
    if (!_esIndeks) { _esIndeks = new Map(); ICERIK.uniteler.forEach((u) => u.kelimeler.forEach((k) => { if (!_esIndeks.has(k.es)) _esIndeks.set(k.es, k); })); }
    return _esIndeks.get(es) || null;
  }
  // isimler: sadece bu ünitenin isimleri (ünite alıştırması) · tumu: açılmış tüm isimler
  function sablonCumleleri(u, tumu) {
    return bellek('sablon:' + u.id + ':' + sinirSira(u) + ':' + !!tumu, () => {
      const sonuc = [];
      (ICERIK.sablonlar || []).forEach((s) => {
        if (!uniteAcik(s.uid, u)) return;
        s.isimler.forEach((es) => {
          const k = kelimeEs(es); if (!k) return;
          if (tumu ? !uniteAcik(k.unite, u) : k.unite !== u.id) return;
          const [art, ad] = es.split(' '), dis = art === 'la';
          const esC = s.es.replace('{el}', art).replace('{un}', dis ? 'una' : 'un').replace('{X}', ad);
          const t = s.tr.replace('{X}', trCekirdek(k.tr));
          sonuc.push({ es: esC, tr: trBuyuk(t), sablon: true });
        });
      });
      return sonuc;
    });
  }
  // ünite alıştırmasının cümle havuzu: ünitenin kendi cümleleri + (varsa) şablon cümleleri
  function cumleHavuzu(u) {
    const kendi = u.cumleler || [];
    return u.ek ? kendi : kendi.concat(sablonCumleleri(u, false));
  }
  // seçim: üretilen cümle varsa %40 ihtimalle ondan
  function cumleSec(u, tur, filtre) {
    filtre = filtre || (() => true);
    const kendi = (u.cumleler || []).filter(filtre), uretilen = u.ek ? [] : sablonCumleleri(u, false).filter(filtre);
    const liste = uretilen.length && (!kendi.length || Math.random() < 0.4) ? uretilen : kendi;
    return liste.length ? A._tek(liste, tur) : null;
  }

  /* ---------- cümle içinde çekim adayları ---------- */
  // açılmış ünitelerin cümleleri (+ şablon cümleleri) içinden çekimli fiil geçenler
  function cekimAdaylari(u) {
    return bellek('ccand:' + u.id + ':' + sinirSira(u), () => {
      const dizin = bicimDizini(u);
      const cumleler = acikUniteler(u).flatMap((x) => x.cumleler || []).concat(u.ek ? u.cumleler || [] : [], u.ek ? [] : sablonCumleleri(u, true));
      const sonuc = [];
      cumleler.forEach((cm) => fiilBul(cm.es, dizin).forEach((f) => sonuc.push({ cm, ...f, id: `cc:${cm.es}:${f.i}` })));
      return sonuc;
    });
  }
  function serEstarAdaylari(u) {
    const ser = cekimHavuzu(u).find((x) => x.c.fiil === 'ser'), estar = cekimHavuzu(u).find((x) => x.c.fiil === 'estar');
    if (!ser || !estar) return [];
    return cekimAdaylari(u).filter((x) => x.c === ser.c || x.c === estar.c).map((x) => ({ ...x, ser: ser.c, estar: estar.c, id: 'se:' + x.id }));
  }

  /* ---------- doğru / yanlış için bozma ---------- */
  let _isimCins = null;
  function isimCinsi(ad) {
    if (!_isimCins) {
      _isimCins = new Map();
      ICERIK.tumKelimeler().forEach((k) => { const m = /^(el|la) ([^ /]+)$/.exec(k.es); if (!m) return; const a = m[2].toLowerCase(); _isimCins.set(a, _isimCins.has(a) && _isimCins.get(a) !== m[1] ? 'iki' : m[1]); });
    }
    return _isimCins.get(ad.toLowerCase());
  }
  // cümleyi bir yerinden boz: { es: bozuk, yanlis, dogru } ya da null
  function boz(es, u) {
    const p = parcala(es), secenek = [];
    fiilBul(es, bicimDizini(u)).forEach((f) => {
      const ser = cekimHavuzu(u).find((x) => x.c.fiil === 'ser'), estar = cekimHavuzu(u).find((x) => x.c.fiil === 'estar');
      if (ser && estar && (f.c === ser.c || f.c === estar.c)) {
        const diger = f.c === ser.c ? estar.c : ser.c;
        if (diger[f.kisi] && !diger[f.kisi].includes(' ')) secenek.push({ i: f.i, w: diger[f.kisi], agirlik: 3 });
      }
      // kişi değiştirme sadece özne belliyse: hemen önünde zamir ("yo soy"), ya da 3. tekil fiilin öznesi bir isim ("la llave está", "¿dónde está la llave?")
      const zamir = ZAMIR_KISI[(p[f.i - 1] || {}).w ? p[f.i - 1].w.toLowerCase() : ''];
      const isimOzne = f.kisi === 'el' && (['el', 'la'].includes((p[f.i + 1] || {}).w) || (p[f.i - 1] && p[f.i - 2] && isimCinsi(p[f.i - 1].w) && ['el', 'la', 'mi', 'tu', 'su'].includes(p[f.i - 2].w.toLowerCase())));
      if ((zamir && zamir.includes(f.kisi)) || isimOzne) {
        const baska = Object.keys(KISI).filter((k) => k !== f.kisi).map((k) => f.c[k]).filter((x) => x && x !== f.c[f.kisi] && !x.includes(' '));
        if (baska.length) secenek.push({ i: f.i, w: rastgele(baska), agirlik: 2 });
      }
    });
    p.forEach((x, i) => {
      const a = x.w.toLowerCase(), sonraki = p[i + 1];
      if (!sonraki || !['el', 'la', 'un', 'una'].includes(a) || x.son) return;
      const cins = isimCinsi(sonraki.w); if (cins !== 'el' && cins !== 'la') return;
      if ((cins === 'el') !== (a === 'el' || a === 'un')) return;   // zaten tutarsız → dokunma
      secenek.push({ i, w: { el: 'la', la: 'el', un: 'una', una: 'un' }[a], agirlik: 1 });
    });
    if (!secenek.length) return null;
    const havuz = secenek.flatMap((s) => Array(s.agirlik).fill(s)), s = rastgele(havuz);
    const yanlis = buyukHarf(p[s.i].w, s.w), dogru = p[s.i].w;
    const q = p.map((x, j) => (j === s.i ? { ...x, w: yanlis } : x));
    return { es: birlestir(q), yanlis, dogru };
  }

  // ortak: iki ya da daha çok şık
  function siklariBagla(alan, siklar, dogruI, bitir) {
    let bitmis = false;
    const sec = (i) => {
      if (bitmis) return; bitmis = true;
      alan.querySelectorAll('.sik').forEach((b, j) => { b.disabled = true; if (j === dogruI) b.classList.add('dogru'); else if (j === i) b.classList.add('yanlis'); });
      bitir(i);
    };
    alan.querySelectorAll('.sik').forEach((b) => b.addEventListener('click', () => sec(+b.dataset.i)));
    alan._tus = (e) => { const n = +e.key; if (n >= 1 && n <= siklar) sec(n - 1); };
  }

  Object.assign(A, {
    cekimHavuzu, cekimAdaylari, serEstarAdaylari, sablonCumleleri, cumleHavuzu, cumleSec, boz, sinirSira,

    /* Cümle içinde çekim. mod 'yaz' | 'sec' */
    cekimCumle(x, mod) {
      const p = parcala(x.cm.es), dogru = p[x.i].w;
      const goster = p.map((y, j) => (j === x.i ? `${esc(y.on)}<span class="cekim-bos">___</span>${esc(y.son)}` : esc(y.on + y.w + y.son))).join(' ');
      return {
        tur: 'cekim_cumle_' + mod, anahtar: x.id,
        render(alan, bitti) {
          const ust = `<p class="yonerge">🔧 Fiili cümleye uygun çek</p>
            <div class="soru es cumle-bos">${goster}</div>
            <p class="ceviri">${esc(x.cm.tr)}</p>
            <p class="fiil-ipucu"><span class="es">${esc(x.c.fiil)}</span> <small>· ${esc(x.c.tr)}</small> → <b>${esc(KISI[x.kisi])}</b></p>`;
          const sonuc = (verilen, s) => bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: x.cm.es, oku: x.cm.es, soru: `${bosMetin(p, x.i)} (${x.c.fiil} · ${KISI_KISA[x.kisi]})`, verilen, ipucu: `${KISI_KISA[x.kisi]} → ${x.c[x.kisi]}` });
          if (mod === 'sec') {
            const siklar = karistir([dogru.toLowerCase(), ...karistir([...new Set(Object.keys(KISI).map((k) => x.c[k]).filter((f) => f && f !== x.c[x.kisi]))]).slice(0, 3)]);
            alan.innerHTML = ust + `<div class="siklar">${siklar.map((f, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(f)}</button>`).join('')}</div>`;
            siklariBagla(alan, siklar.length, siklar.indexOf(dogru.toLowerCase()), (i) => sonuc(siklar[i], { dogru: siklar[i] === dogru.toLowerCase() }));
          } else {
            alan.innerHTML = ust + `<form class="yazma"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Çekimi yaz…">${aksanKlavyesi()}<button type="submit" class="ana-buton">Kontrol et</button></form>`;
            const input = alan.querySelector('input'); aksanBagla(alan, input); setTimeout(() => input.focus(), 50);
            alan.querySelector('form').addEventListener('submit', (e) => {
              e.preventDefault(); if (!input.value.trim() || input.disabled) return; input.disabled = true;
              const s = kontrol(input.value.trim().replace(ZAMIR, ''), dogru, false);
              input.classList.add(s.dogru ? 'dogru' : 'yanlis'); sonuc(input.value.trim(), s);
            });
          }
        }
      };
    },

    /* ser mi estar mı? */
    serEstar(x) {
      const p = parcala(x.cm.es), dogru = p[x.i].w.toLowerCase();
      const siklar = [x.ser[x.kisi], x.estar[x.kisi]], dogruI = siklar.indexOf(dogru);
      const goster = p.map((y, j) => (j === x.i ? `${esc(y.on)}<span class="cekim-bos">___</span>${esc(y.son)}` : esc(y.on + y.w + y.son))).join(' ');
      return {
        tur: 'ser_estar', anahtar: x.id,
        render(alan, bitti) {
          alan.innerHTML = `<p class="yonerge">⚖️ ser mi, estar mı?</p>
            <div class="soru es cumle-bos">${goster}</div>
            <p class="ceviri">${esc(x.cm.tr)}</p>
            <div class="siklar iki">${siklar.map((f, i) => `<button class="sik" data-i="${i}"><span class="no">${i + 1}</span>${esc(f)} <small class="okunus">${i ? 'estar' : 'ser'}</small></button>`).join('')}</div>`;
          siklariBagla(alan, 2, dogruI, (i) => bitti({ dogru: i === dogruI, dogrusu: x.cm.es, oku: x.cm.es, soru: `${bosMetin(p, x.i)} (ser / estar)`, verilen: siklar[i],
            ipucu: 'ser: kim / ne / nereli, meslek, kalıcı özellik · estar: nerede, şu anki durum, nasıl' }));
        }
      };
    },

    /* Türkçe cümle → İspanyolca yaz */
    ceviri(cm) {
      return {
        tur: 'ceviri', anahtar: cm.es,
        render(alan, bitti) {
          alan.innerHTML = `<p class="yonerge">✍️ Cümleyi İspanyolca yaz</p>
            <div class="soru">${esc(cm.tr)}</div>
            <form class="yazma"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="İspanyolcası…">${aksanKlavyesi()}
            <button type="submit" class="ana-buton">Kontrol et</button></form>`;
          const input = alan.querySelector('input'); aksanBagla(alan, input); setTimeout(() => input.focus(), 50);
          alan.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault(); if (!input.value.trim() || input.disabled) return; input.disabled = true;
            let s = kontrol(input.value, cm.es, true);
            // özne zamiri eklense de atılsa da doğru (Soy de Turquía = Yo soy de Turquía)
            if (!s.dogru) {
              const v = normal(input.value).replace(ZAMIR, ''), d = normal(cm.es).replace(ZAMIR, '');
              if (v === d) s = { dogru: true };
              else { const s2 = kontrol(input.value.replace(ZAMIR, ''), cm.es.replace(ZAMIR, ''), true); if (s2.dogru) s = s2; }
            }
            input.classList.add(s.dogru ? 'dogru' : 'yanlis');
            bitti({ dogru: s.dogru, uyari: s.uyari, dogrusu: cm.es, oku: cm.es, soru: cm.tr, verilen: input.value.trim() });
          });
        }
      };
    },

    /* Doğru mu yanlış mı? bozuk = boz() sonucu ya da null (cümle doğru) */
    dogruYanlis(cm, bozuk) {
      const gosterilen = bozuk ? bozuk.es : cm.es;
      return {
        tur: 'dogru_yanlis', anahtar: 'dy:' + cm.es,
        render(alan, bitti) {
          alan.innerHTML = `<p class="yonerge">🔍 Bu cümle doğru mu?</p>
            <div class="soru es">${esc(gosterilen)}</div>
            <p class="ceviri">${esc(cm.tr)}</p>
            <div class="siklar iki"><button class="sik" data-i="0"><span class="no">1</span>✓ Doğru</button><button class="sik" data-i="1"><span class="no">2</span>✗ Yanlış</button></div>`;
          const dogruI = bozuk ? 1 : 0;
          siklariBagla(alan, 2, dogruI, (i) => bitti({
            dogru: i === dogruI, dogrusu: cm.es, oku: cm.es, soru: gosterilen, verilen: i ? 'Yanlış' : 'Doğru',
            mesaj: bozuk ? `Hatalı kelime: "${bozuk.yanlis}" → doğrusu "${bozuk.dogru}"` : 'Cümle doğruydu.'
          }));
        }
      };
    }
  });
})();
