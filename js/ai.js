/* =========================================================
   YAPAY ZEKÂ MODÜLÜ (ilk sürümde kapalı)
   İleride Claude/başka bir servis eklenirse sadece bu dosya
   doldurulur. Uygulama Yapay.aktif() false ise bu özellikleri
   hiç göstermez; internet yoksa da sorunsuz çalışır.
   ========================================================= */
(function () {
  'use strict';
  window.Yapay = {
    aktif() { return false; },
    async cumleDuzelt(/* metin */) { throw new Error('Yapay zekâ modülü kapalı'); },
    async sohbet(/* mesajlar */) { throw new Error('Yapay zekâ modülü kapalı'); }
  };
})();
