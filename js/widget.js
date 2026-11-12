/* =========================================================
   📲 ÖĞRENİLEN KELİMELER, ÖRNEK CÜMLELER ve WIDGET VERİSİ
   - Mini kart (js/app.js) ve iPhone widget'ı (widget/ispanyolca-widget.js) aynı mantığı kullanır.
   - Öğrenilen kelime: kartı görülmüş (tekrar listesinde) kelime; harf kartları (yazma: false) hariç.
   - Örnek cümle: önce claude.ai'da hazırlanan ICERIK.kelimeCumleleri; yoksa kartı görülmüş ünitelerin
     cümlelerinden kelimeyi içeren kısa bir cümle (öğretilmemiş kelime çıkmaz).
   - widget.json: senkronda Gist'e yazılır (js/senkron.js), Scriptable widget'ı oradan okur.
   ========================================================= */
(function () {
  'use strict';
  const VERI_SURUMU = 1;           // widget.json biçimi
  const CUMLE_SAYISI = 3;          // widget.json'da kelime başına en fazla cümle

  const normal = (s) => ' ' + String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,;:"“”…—()]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

  // kısa bir metin özeti (değişti mi diye bakmak için)
  function ozet(metin) {
    let h = 5381;
    for (let i = 0; i < metin.length; i++) h = ((h << 5) + h + metin.charCodeAt(i)) >>> 0;
    return h.toString(36) + '-' + metin.length.toString(36);
  }

  const Widget = {
    VERI_SURUMU,

    ogrenilenler() {
      return Object.keys(Depo.veri.kelimeler).map((id) => ICERIK.kelime(id)).filter((k) => k && k.yazma !== false);
    },

    // Kelimeye uygun tüm örnek cümleler [{es, tr}], kısadan uzuna
    cumleler(k) {
      const hazir = ICERIK.kelimeCumleleri && ICERIK.kelimeCumleleri[k.id];
      if (hazir) return [{ es: hazir[0], tr: hazir[1] }];
      const gorulen = (u) => u.id === k.unite || (!u.ek && ((Depo.veri.uniteler[u.id] || {}).adimlar || {}).kart);
      const bicimler = k.es.split(' / ').map((x) => normal(x.replace(/^(el|la|los|las|un|una) /i, ''))).filter((b) => b.trim().length > 1);
      const goruldu = new Set();
      return [...ICERIK.uniteler, ...ICERIK.ekler].filter(gorulen).flatMap((u) => u.cumleler || [])
        .filter((c) => !c.es.includes('—') && c.es.split(' ').length <= 9 && bicimler.some((b) => normal(c.es).includes(b)))
        .filter((c) => !goruldu.has(c.es) && goruldu.add(c.es))
        .sort((a, b) => a.es.length - b.es.length || (a.es < b.es ? -1 : 1));
    },
    // rastgele bir örnek cümle ya da null
    cumle(k) { const a = this.cumleler(k); return a.length ? a[Math.floor(Math.random() * a.length)] : null; },

    // widget.json: öğrenilen kelimeler + en kısa birkaç cümle. imza: içerik değişti mi?
    veri() {
      const k = this.ogrenilenler().sort((a, b) => (a.id < b.id ? -1 : 1)).map((x) => {
        const o = { id: x.id, es: x.es, tr: x.tr };
        if (x.en) o.en = x.en;
        const c = this.cumleler(x).slice(0, CUMLE_SAYISI).map((y) => [y.es, y.tr]);
        if (c.length) o.c = c;
        return o;
      });
      const govde = { surum: VERI_SURUMU, k };
      return { ...govde, imza: ozet(JSON.stringify(govde)), guncelleme: Date.now() };
    },

    // Scriptable'a yapıştırılacak yükleyici kod (Ayarlar → Widget kurulumu)
    kodAdresi() {
      const kok = /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname) ? location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '') : 'https://bnoktak.github.io/ispanyolca/';
      return kok + 'widget/ispanyolca-widget.js';
    },
    veriAdresi() {
      const sahip = window.Cihaz && Cihaz.al('gistSahip'), id = window.Cihaz && Cihaz.al('gistId');
      return sahip && id ? `https://gist.githubusercontent.com/${sahip}/${id}/raw/widget.json` : null;
    },
    yukleyici() {
      const veri = this.veriAdresi(); if (!veri) return null;
      return `// ¡Hola! İspanyolca widget'ı · yükleyici
// Bu kodu değiştirme: asıl widget kodu siteden iner ve kendiliğinden güncellenir.
const VERI = '${veri}';
const KOD = '${this.kodAdresi()}';
const fm = FileManager.local();
const yol = fm.joinPath(fm.documentsDirectory(), 'ispanyolca-widget-kod.js');
const eski = fm.fileExists(yol) ? (Date.now() - fm.modificationDate(yol).getTime()) / 60000 : 1e9;
if (eski > 60 || !config.runsInWidget) {
  try {
    const r = new Request(KOD + '?t=' + Date.now()); r.timeoutInterval = 8;
    const kod = await r.loadString();
    if (r.response.statusCode === 200 && kod.includes('module.exports')) fm.writeString(yol, kod);
  } catch (e) { /* internet yoksa son indirilen kodla devam */ }
}
if (!fm.fileExists(yol)) throw new Error('Widget kodu indirilemedi: internet bağlantısını kontrol edip tekrar çalıştır.');
await importModule(yol)({ veriAdresi: VERI });
`;
    }
  };

  window.Widget = Widget;
})();
