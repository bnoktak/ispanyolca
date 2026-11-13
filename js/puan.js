/* =========================================================
   CEVAP GÜNLÜĞÜ ve ZORLUK PUANI (1 kolay · 2 orta · 3 zor)
   Her cevap Depo.veri.puanlar'a yazılır (ilerleme.json'a da gider):
     { t: zaman, k: soru anahtarı (kelime id'si, cümle, 'cekim:hablar:nos'…),
       tur: soru türü, u: ünite, d: 1 doğru / 0 yanlış, p: 1–3 ya da null, s: 1 sınavda }
   Puanın etkisi (sadece kelime sorularında):
     3 zor  → kelime bir kutu geri iner, daha erken tekrar gelir
     1 kolay + doğru → bir kutu daha ileri gider, daha seyrek gelir
   Zor bulunan kelimeler ve türler alıştırmalarda öne alınır.
   ========================================================= */
(function () {
  'use strict';
  const SINIR = 4000;                 // en fazla bu kadar kayıt tutulur (eskiler silinir)
  const once = new WeakMap();         // puan değiştirilirse tekrar kutusunu eski haline döndürmek için

  const TUR_ADI = {
    sec_es: 'İspanyolca → anlamını seç', sec_tr: 'Türkçe → İspanyolcasını seç', yaz: 'Türkçe → İspanyolca yaz',
    eslestir: 'Eşleştirme', sureli: 'Süreli eşleştirme', cumle: 'Cümle kurma', bosluk: 'Boşluk doldurma', diyalog: 'Diyalog tamamlama',
    dinle_sec: 'Dinle → anlamını seç', dinle_yaz: 'Dinle → yaz', dinle_anlam: 'Cümle dinle → anlamı', dinle_kur: 'Cümle dinle → kur',
    okunus_yazilis: 'Okunuş → doğru yazılış', okunus_ses: 'Hangi kelimede bu ses var?', cekim_yaz: 'Fiil çekimi (yazma)', cekim_sec: 'Fiil çekimi (seçme)',
    artikel: 'Artikel seçme (el / la)', cogul: 'Çoğul yapma', sc_sec: 'Soruya doğru cevap', sc_eslestir: 'Soru–cevap eşleştirme', rakam: 'Dinle → rakamla yaz',
    sc_dinle: 'Soruyu dinle → cevabı seç', cekim_cumle_yaz: 'Cümlede fiil çekimi (yazma)', cekim_cumle_sec: 'Cümlede fiil çekimi (seçme)',
    ser_estar: 'ser mi estar mı?', ceviri: 'Türkçe cümle → İspanyolca yaz', dogru_yanlis: 'Cümle doğru mu yanlış mı?',
    harf_kur: 'Türkçe → harflerden İspanyolca kur', ceviri_kur: 'Türkçe cümle → kelimelerden kur',
    dinle_anla: 'Uzun dinleme → anla', dinle_cevap: 'Uzun dinleme → cevap ver'
  };

  const Puan = {
    TUR_ADI, SINIR,
    liste() { return Depo.veri.puanlar || (Depo.veri.puanlar = []); },

    // Her cevaptan sonra çağrılır; dönen kayıt puanla() ile puanlanabilir
    kaydet({ anahtar, tur, unite, dogru, sinav }) {
      const kayit = { t: Date.now(), k: anahtar || tur, tur, u: unite || (ICERIK.kelime(anahtar) || {}).unite || null, d: dogru ? 1 : 0, p: null };
      if (sinav) kayit.s = 1;
      const l = this.liste(); l.push(kayit);
      if (l.length > SINIR) l.splice(0, l.length - SINIR);
      Depo.kaydet();
      return kayit;
    },

    puanla(kayit, p) {
      const kel = ICERIK.kelime(kayit.k) && Depo.veri.kelimeler[kayit.k];
      if (kel) {
        if (once.has(kayit)) Object.assign(kel, once.get(kayit));          // önceki puanın etkisini geri al
        else once.set(kayit, { kutu: kel.kutu, sonraki: kel.sonraki });
        Tekrar.puanEtkisi(kayit.k, p, !!kayit.d);
      }
      kayit.p = p; this._kirli = true;
      Depo.kaydet();
    },

    // Bir anahtarın puan özeti
    _ozet: null, _ozetUzunluk: -1,
    ozetler() {
      const l = this.liste();
      if (this._ozet && this._ozetUzunluk === l.length && !this._kirli) return this._ozet;
      const o = {};
      l.forEach((r) => {
        const x = o[r.k] || (o[r.k] = { n: 0, yanlis: 0, puanN: 0, puanTop: 0, turler: {} });
        x.n++; if (!r.d) x.yanlis++;
        if (r.p) { x.puanN++; x.puanTop += r.p; const t = x.turler[r.tur] || (x.turler[r.tur] = { n: 0, top: 0 }); t.n++; t.top += r.p; }
      });
      this._ozet = o; this._ozetUzunluk = l.length; this._kirli = false;
      return o;
    },
    zorMu(anahtar) { const x = this.ozetler()[anahtar]; return !!x && ((x.puanN && x.puanTop / x.puanN >= 2.5) || (x.n >= 3 && x.yanlis / x.n >= 0.5)); },
    zorTurler(anahtar) {
      const x = this.ozetler()[anahtar]; if (!x) return [];
      return Object.entries(x.turler).filter(([, t]) => t.top / t.n >= 2.5).map(([tur]) => tur);
    },

    // Zorluk raporu için toplu veriler
    rapor() {
      const l = this.liste(), puanli = l.filter((r) => r.p);
      const grupla = (anahtarFn) => {
        const g = {};
        l.forEach((r) => {
          const a = anahtarFn(r); if (!a) return;
          const x = g[a] || (g[a] = { n: 0, dogru: 0, puanN: 0, puanTop: 0, p: [0, 0, 0, 0] });
          x.n++; x.dogru += r.d; if (r.p) { x.puanN++; x.puanTop += r.p; x.p[r.p]++; }
        });
        return Object.entries(g).map(([a, x]) => ({ a, ...x, ort: x.puanN ? x.puanTop / x.puanN : null, oran: x.dogru / x.n }));
      };
      const zorluk = (x) => (x.ort || 2) + (1 - x.oran) * 2;                // puan + yanlış oranı
      return {
        toplam: l.length, puanli: puanli.length,
        ort: puanli.length ? puanli.reduce((a, r) => a + r.p, 0) / puanli.length : null,
        turler: grupla((r) => r.tur).sort((a, b) => zorluk(b) - zorluk(a)),
        uniteler: grupla((r) => r.u).sort((a, b) => (ICERIK.bul(a.a) || {}).sira - (ICERIK.bul(b.a) || {}).sira),
        sorular: grupla((r) => r.k).filter((x) => x.puanN || x.n - x.dogru > 0).sort((a, b) => zorluk(b) - zorluk(a) || b.n - a.n)
      };
    },
    // Anahtarı okunur hale getir
    etiket(a) {
      const k = ICERIK.kelime(a); if (k) return `${k.es} = ${k.tr}`;
      if (a.startsWith('cekim:')) { const [, f, kisi] = a.split(':'); return `${f} → ${({ yo: 'yo', tu: 'tú', el: 'él/ella', nos: 'nosotros', ellos: 'ellos' })[kisi] || kisi}`; }
      if (a.startsWith('sc:')) return a.slice(3);
      if (a.startsWith('rakam:')) return a.split(':').slice(2).join(':');
      return TUR_ADI[a] || a;
    }
  };
  window.Puan = Puan;
})();
