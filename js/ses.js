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

    // Seçili ses → yoksa en uygun ses: es-MX, es-US, diğer Latin Amerika, es-ES sırası;
    // aynı dilde "Gelişmiş/Enhanced/Premium" sesler (iPhone) ve cihazın kendi sesleri öne alınır
    secili() {
      const ad = this.ayar().sesAdi;
      const kayitli = this.sesler.find((v) => v.name === ad);
      if (kayitli) return kayitli;
      const puan = (v) => {
        const dil = /^es[-_]MX/i.test(v.lang) ? 0 : /^es[-_]US/i.test(v.lang) ? 1 : LATAM.test(v.lang) ? 2 : /^es[-_]ES/i.test(v.lang) ? 3 : 4;
        const kalite = /enhanced|premium|gelişmiş|mejorad/i.test(v.name + ' ' + (v.voiceURI || '')) ? 0 : 1;
        return dil * 4 + kalite * 2 + (v.localService ? 0 : 1);
      };
      return this.sesler.slice().sort((a, b) => puan(a) - puan(b))[0] || null;
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

    // 🎧 Sahne (uzun dinleme): satirlar = [['A', 'metin'], ['B', 'metin']…]. A seçili sesle, B ikinci bir
    // İspanyolca sesle okunur; ikinci ses yoksa aynı ses daha ince tonla. Satırlar sırayla kuyruğa girer.
    ikinciSes(birinci) {
      const adaylar = this.sesler.filter((v) => v !== birinci);
      return adaylar.find((v) => LATAM.test(v.lang)) || adaylar[0] || null;
    },
    sahneOku(satirlar, yavas) {
      if (!this.aktif() || !satirlar || !satirlar.length) return;
      const v1 = this.secili(), v2 = this.ikinciSes(v1);
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
