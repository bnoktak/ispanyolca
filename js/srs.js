/* =========================================================
   AKILLI TEKRAR (kutu sistemi)
   Doğru bildikçe kelime üst kutuya çıkar ve daha seyrek sorulur.
   Yanlışta kutu 1'e döner. Düzensiz çalışmaya uygun:
   ne zaman açarsan aç, vakti gelen kelimeler sorulur.
   ========================================================= */
(function () {
  'use strict';
  const GUN = 24 * 60 * 60 * 1000;
  // kutu -> bir sonraki tekrar aralığı
  const ARALIK = [0, 10 * 60 * 1000, 1 * GUN, 3 * GUN, 7 * GUN, 16 * GUN, 35 * GUN];

  const Tekrar = {
    kayit(id) {
      const k = Depo.veri.kelimeler;
      if (!k[id]) k[id] = { kutu: 1, sonraki: Date.now() + ARALIK[1], dogru: 0, yanlis: 0, son: Date.now() };
      return k[id];
    },
    ogrenildiMi(id) { return !!Depo.veri.kelimeler[id]; },
    tanis(id) { this.kayit(id); Depo.kaydet(); },
    sonuc(id, dogruMu) {
      const r = this.kayit(id);
      const simdi = Date.now();
      if (dogruMu) { r.dogru++; r.kutu = Math.min(r.kutu + 1, ARALIK.length - 1); }
      else { r.yanlis++; r.kutu = 1; }
      r.son = simdi;
      r.sonraki = simdi + ARALIK[r.kutu];
      Depo.kaydet();
    },
    // Kullanıcının 1–3 zorluk puanı: 3 zor → bir kutu geri (daha erken), 1 kolay + doğru → bir kutu ileri
    puanEtkisi(id, p, dogruMu) {
      const r = Depo.veri.kelimeler[id]; if (!r) return;
      if (p === 3) r.kutu = Math.max(1, r.kutu - 1);
      else if (p === 1 && dogruMu) r.kutu = Math.min(r.kutu + 1, ARALIK.length - 1);
      else return;
      r.sonraki = Date.now() + ARALIK[r.kutu];
    },
    vakitGelenler() {
      const simdi = Date.now();
      return this._gecerli()
        .filter(([, r]) => r.sonraki <= simdi)
        .sort((a, b) => (a[1].kutu - b[1].kutu) || (a[1].sonraki - b[1].sonraki))
        .map(([id]) => id);
    },
    // içerikten çıkarılmış kelimeleri yok say (ilerleme dosyasında kalsalar da)
    _gecerli() { return Object.entries(Depo.veri.kelimeler).filter(([id]) => ICERIK.kelime(id)); },
    ogrenilenSayisi() { return this._gecerli().length; },
    // tekrar oturumu: önce vakti gelenler, yetmezse en zayıf kelimeler
    oturumKelimeleri(adet) {
      const vakit = this.vakitGelenler();
      if (vakit.length >= adet) return vakit.slice(0, adet);
      const geri = this._gecerli()
        .filter(([id]) => !vakit.includes(id))
        .sort((a, b) => (a[1].kutu - b[1].kutu) || ((b[1].yanlis - b[1].dogru) - (a[1].yanlis - a[1].dogru)))
        .map(([id]) => id);
      return vakit.concat(geri).slice(0, adet);
    }
  };
  window.Tekrar = Tekrar;
})();
