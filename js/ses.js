/* =========================================================
   SESLİ OKUMA
   Bilgisayarın kendi İspanyolca sesini kullanır (internet gerekmez).
   İspanyolca ses yoksa tüm ses özellikleri otomatik gizlenir.
   Ayarlar: Depo.veri.ayarlar.ses (açık/kapalı), sesHiz, otoOku · ses seçimi: Cihaz 'sesSecim' (bu cihaza özel)
   ========================================================= */
(function () {
  'use strict';
  const LATAM = /^es[-_](MX|US|419|CO|AR|CL|PE|VE|EC|GT|CU|BO|DO|HN|PY|SV|NI|CR|PA|UY|PR)/i;

  const Ses = {
    sesler: [],

    // Tarayıcı sesleri geç yükleyebilir; en fazla ~1.5 sn bekle
    baslat() {
      return new Promise((coz) => {
        if (!('speechSynthesis' in window)) return coz();
        const yukle = () => {
          this.sesler = speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang));
          return this.sesler.length > 0;
        };
        // iOS: ses ancak bir dokunuştan sonra çalar. İlk dokunuşta sessiz bir okuma yapıp sesi "açar",
        // böylece dinleme sorularındaki otomatik okuma da çalışır. (Masaüstünde dokunma olayı yok, etkilenmez.)
        document.addEventListener('touchend', () => {
          try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { /* yoksay */ }
        }, { once: true, passive: true });
        if (yukle()) return coz();
        speechSynthesis.addEventListener('voiceschanged', () => { yukle(); coz(); });
        setTimeout(coz, 1500);
      });
    },

    sesVar() { return this.sesler.length > 0; },
    ayar() { return Depo.veri.ayarlar || (Depo.veri.ayarlar = {}); },
    aktif() { return this.sesVar() && this.ayar().ses !== false; },
    otoOku() { return this.aktif() && this.ayar().otoOku !== false; },

    // 🗣️ SES SEÇİMİ
    // iPhone her dile "oyuncak" robot sesler de koyar (Eddy, Flo, Grandma…): anlaşılmazlar, hiç kullanılmaz.
    // Aynı kişinin normal ve "Gelişmiş" sürümü varsa gelişmiş olan kalır.
    // 🎲 Karışık (varsayılan): her metin havuzdaki seslerden biriyle okunur; aynı metin hep aynı sesle
    // (metnin özetinden seçilir, tekrar dinleyince ses değişmez). Havuz: Paulina (Meksika) + Carlos (Kolombiya)
    // varsa onlar; yoksa diğer Latin Amerika sesleri; o da yoksa hepsi.
    // Seçim yalnızca bu cihazda geçerli (Cihaz 'sesSecim': 'karisik' ya da ses adı); senkrona girmez.
    ROBOT: /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Kathy|Ralph)\b/i,
    TERCIH: ['Paulina', 'Carlos'],
    kisiAdi(v) { return v.name.replace(/\s*[(\-–].*$/, '').trim(); },
    gelismisMi(v) { return /enhanced|premium|gelişmiş|geliştirilmiş|mejorad|natural|neural/i.test(v.name + ' ' + (v.voiceURI || '')); },
    iyiSesler() {
      const kisiler = new Map();
      this.sesler.filter((v) => !this.ROBOT.test(v.name)).forEach((v) => {
        const k = this.kisiAdi(v) + '|' + v.lang, eski = kisiler.get(k);
        if (!eski || (this.gelismisMi(v) && !this.gelismisMi(eski))) kisiler.set(k, v);
      });
      const puan = (v) => (/^es[-_]MX/i.test(v.lang) ? 0 : LATAM.test(v.lang) ? 1 : /^es[-_]ES/i.test(v.lang) ? 3 : 2) * 4 + (this.gelismisMi(v) ? 0 : 2) + (v.localService ? 0 : 1);
      const liste = [...kisiler.values()].sort((a, b) => puan(a) - puan(b));
      return liste.length ? liste : this.sesler.slice();   // hepsi robotsa (olmamalı) yine de ses olsun
    },
    havuz() {
      const iyi = this.iyiSesler();
      const tercih = this.TERCIH.map((ad) => iyi.find((v) => this.kisiAdi(v).toLowerCase() === ad.toLowerCase())).filter(Boolean);
      if (tercih.length) return tercih;
      const latin = iyi.filter((v) => LATAM.test(v.lang));
      return latin.length ? latin : iyi;
    },
    secim() { return (window.Cihaz && Cihaz.al('sesSecim')) || 'karisik'; },
    sabitSes() { const s = this.secim(); return s === 'karisik' ? null : this.iyiSesler().find((v) => v.name === s) || null; },
    ozet(metin) { let h = 0; for (const c of String(metin)) h = (h * 31 + c.codePointAt(0)) >>> 0; return h; },
    sesFor(metin) {
      const sabit = this.sabitSes(); if (sabit) return sabit;
      const h = this.havuz(); return h.length ? h[this.ozet(this.temizle(metin)) % h.length] : null;
    },
    secili() { return this.sabitSes() || this.havuz()[0] || null; },
    // Ayarlar'da karışık seçilince havuzdaki her ses kendini tanıtır
    tanit() {
      if (!this.aktif()) return;
      speechSynthesis.cancel();
      this.havuz().forEach((v) => {
        const u = new SpeechSynthesisUtterance(`Hola, me llamo ${this.kisiAdi(v)}.`);
        u.voice = v; u.lang = v.lang; u.rate = this.ayar().sesHiz || 0.9;
        speechSynthesis.speak(u);
      });
    },

    // "encantado / encantada" → "encantado"
    temizle(metin) { return String(metin).split(' / ')[0].trim(); },

    oku(metin, yavas) {
      if (!this.aktif() || !metin) return;
      const u = new SpeechSynthesisUtterance(this.temizle(metin));
      const v = this.sesFor(metin);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-MX';
      const hiz = this.ayar().sesHiz || 0.9;
      u.rate = yavas ? Math.max(0.5, hiz - 0.35) : hiz;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    },
    dur() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },

    // 🎧 Sahne (uzun dinleme): satirlar = [['A', 'metin'], ['B', 'metin']…]. A ve B iki farklı sesle okunur
    // (karışıkta sahneye göre değişir: bazen A Paulina B Carlos, bazen tersi); ikinci ses yoksa aynı ses daha ince tonla.
    ikinciSes(birinci) {
      const adaylar = [...this.havuz(), ...this.iyiSesler()].filter((v) => v !== birinci);
      return adaylar.find((v) => LATAM.test(v.lang)) || adaylar[0] || null;
    },
    sahneOku(satirlar, yavas) {
      if (!this.aktif() || !satirlar || !satirlar.length) return;
      const v1 = this.sesFor(satirlar.map((s) => s[1]).join(' ')), v2 = this.ikinciSes(v1);
      const hiz = this.ayar().sesHiz || 0.9;
      speechSynthesis.cancel();
      satirlar.forEach(([kim, metin]) => {
        const u = new SpeechSynthesisUtterance(this.temizle(metin));
        const v = kim === 'B' ? v2 || v1 : v1;
        if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-MX';
        if (kim === 'B' && !v2) u.pitch = 1.35;
        u.rate = yavas ? Math.max(0.5, hiz - 0.3) : hiz;
        speechSynthesis.speak(u);
      });
    },

    // Harf kartları (h, ll, ñ…) sesli okumaya uygun değil
    okunurMu(kelime) { return kelime && kelime.yazma !== false; }
  };
  window.Ses = Ses;
})();
