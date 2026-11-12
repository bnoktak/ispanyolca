/* =========================================================
   SESLİ OKUMA
   Bilgisayarın kendi İspanyolca sesini kullanır (internet gerekmez).
   İspanyolca ses yoksa tüm ses özellikleri otomatik gizlenir.
   Ayarlar: Depo.veri.ayarlar.ses (açık/kapalı), sesAdi, sesHiz, otoOku
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
        if (yukle()) return coz();
        speechSynthesis.addEventListener('voiceschanged', () => { yukle(); coz(); });
        setTimeout(coz, 1500);
      });
    },

    sesVar() { return this.sesler.length > 0; },
    ayar() { return Depo.veri.ayarlar || (Depo.veri.ayarlar = {}); },
    aktif() { return this.sesVar() && this.ayar().ses !== false; },
    otoOku() { return this.aktif() && this.ayar().otoOku !== false; },

    // Seçili ses → yoksa Latin Amerika sesi → yoksa herhangi bir İspanyolca ses
    secili() {
      const ad = this.ayar().sesAdi;
      return this.sesler.find((v) => v.name === ad) ||
        this.sesler.find((v) => LATAM.test(v.lang) && v.localService) ||
        this.sesler.find((v) => LATAM.test(v.lang)) ||
        this.sesler[0] || null;
    },

    // "encantado / encantada" → "encantado"
    temizle(metin) { return String(metin).split(' / ')[0].trim(); },

    oku(metin, yavas) {
      if (!this.aktif() || !metin) return;
      const u = new SpeechSynthesisUtterance(this.temizle(metin));
      const v = this.secili();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-MX';
      const hiz = this.ayar().sesHiz || 0.9;
      u.rate = yavas ? Math.max(0.5, hiz - 0.35) : hiz;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    },
    dur() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },

    // Harf kartları (h, ll, ñ…) sesli okumaya uygun değil
    okunurMu(kelime) { return kelime && kelime.yazma !== false; }
  };
  window.Ses = Ses;
})();
