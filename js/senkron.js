/* =========================================================
   ☁️ SENKRON: bilgisayar ↔ telefon (gizli GitHub Gist)
   - İlerleme, kullanıcının GitHub hesabındaki gizli bir Gist'te "ilerleme.json" olarak durur.
   - Anahtar (yalnızca Gist yetkili token) ve Gist kimliği yalnızca bu cihazda (Cihaz) saklanır,
     ilerleme dosyasına ve depoya girmez.
   - Her eşitlemede: Gist'teki veri okunur → cihazdakiyle BİRLEŞTİRİLİR → sonuç cihaza ve Gist'e yazılır.
     Hiçbir taraf körü körüne ezilmez.
   - Ne zaman: açılışta, kayıttan 20 sn sonra boşta kalınca, uygulama arka plana geçince, bağlantı gelince.
   Birleştirme kuralları (birlestir):
     kelimeler : her kelimede en son cevaplanan (son) kalır
     uniteler  : adımlar / tamamlandı birleşir (VEYA), en iyi skor büyük olan
     puanlar   : iki günlük birleşir, aynı cevap bir kez; puanı olan kayıt tercih edilir
     ayarlar   : en son güncellenen verininki; cihaza özel ayarlar (ses, son yedek) her cihazda kendi kalır
     sifirlama : büyük olan; ondan eski kelime/puan kayıtları ve sıfırlanmış verinin üniteleri alınmaz
   ========================================================= */
(function () {
  'use strict';

  const GIST_ACIKLAMA = 'ispanyolca-ilerleme · ¡Hola! İspanyolca uygulamasının senkron dosyası';
  const DOSYA = 'ilerleme.json';
  const WIDGET_DOSYA = 'widget.json';     // iPhone widget'ının okuduğu öğrenilen kelimeler (js/widget.js)
  const BOSTA_BEKLE = 20000;
  // her cihazda kendi değeri kalan ayarlar (Windows ile iPhone'un sesleri farklı)
  const YEREL_AYARLAR = ['sonYedek', 'ses', 'sesAdi', 'sesHiz', 'otoOku'];

  /* ---------------- Birleştirme (saf fonksiyon: girdileri değiştirmez) ---------------- */
  const kopya = (x) => JSON.parse(JSON.stringify(x));

  // ünite kaydı: true'lar birleşir, sayılar büyüğü, iç içe nesneler aynı kuralla
  function uniteBirlestir(a, b) {
    if (!a) return kopya(b); if (!b) return kopya(a);
    const s = {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
      const x = a[k], y = b[k];
      if (x === undefined) s[k] = kopya(y);
      else if (y === undefined) s[k] = kopya(x);
      else if (typeof x === 'boolean' || typeof y === 'boolean') s[k] = !!x || !!y;
      else if (typeof x === 'number' && typeof y === 'number') s[k] = Math.max(x, y);
      else if (x && typeof x === 'object' && y && typeof y === 'object') s[k] = uniteBirlestir(x, y);
      else s[k] = kopya(x);
    });
    return s;
  }

  function birlestir(yerel, uzak, sinir) {
    if (!uzak) return kopya(yerel);
    if (!yerel) return kopya(uzak);
    sinir = sinir || 4000;
    const sif = Math.max(yerel.sifirlama || 0, uzak.sifirlama || 0);
    const guncelMi = (v) => (v.sifirlama || 0) >= sif;            // bu veri en son sıfırlamadan sonra mı?

    // kelimeler: en son cevaplanan kalır; sıfırlamadan önceki kayıtlar alınmaz
    const kelimeler = {};
    [yerel, uzak].forEach((v) => Object.entries(v.kelimeler || {}).forEach(([id, r]) => {
      if (!r || (r.son || 0) < sif) return;
      if (!kelimeler[id] || (r.son || 0) > (kelimeler[id].son || 0)) kelimeler[id] = kopya(r);
    }));

    // üniteler: zaman bilgisi yok → sıfırlamadan önceki verinin ünitelerini hiç alma
    const uniteler = {};
    [yerel, uzak].filter(guncelMi).forEach((v) => Object.entries(v.uniteler || {}).forEach(([id, u]) => {
      uniteler[id] = uniteBirlestir(uniteler[id], u);
    }));

    // puan günlüğü: zaman + soru + tür aynıysa aynı cevaptır
    const puanMap = new Map();
    [yerel, uzak].forEach((v) => (v.puanlar || []).forEach((r) => {
      if (!r || (r.t || 0) < sif) return;
      const a = `${r.t}|${r.k}|${r.tur}`, var_ = puanMap.get(a);
      if (!var_ || (var_.p == null && r.p != null)) puanMap.set(a, kopya(r));
    }));
    let puanlar = [...puanMap.values()].sort((x, y) => x.t - y.t);
    if (puanlar.length > sinir) puanlar = puanlar.slice(puanlar.length - sinir);

    // ayarlar: daha yeni verininki, cihaza özel olanlar yereldeki gibi.
    // Hiç çalışılmamış (boş) veri "daha yeni" sayılmaz: yeni telefon bilgisayardaki ayarları ezmesin
    const bosMu = (v) => !Object.keys(v.kelimeler || {}).length && !Object.keys(v.uniteler || {}).length;
    const yeni = bosMu(yerel) !== bosMu(uzak) ? (bosMu(yerel) ? uzak : yerel)
      : (yerel.guncelleme || 0) >= (uzak.guncelleme || 0) ? yerel : uzak;
    const ayarlar = kopya(yeni.ayarlar || {});
    YEREL_AYARLAR.forEach((k) => { if ((yerel.ayarlar || {})[k] === undefined) delete ayarlar[k]; else ayarlar[k] = kopya(yerel.ayarlar[k]); });

    return {
      ...kopya(yeni),                                   // bilinmeyen alanlar (ileride eklenecekler) kaybolmasın
      surum: Math.max(yerel.surum || 1, uzak.surum || 1),
      olusturulma: Math.min(yerel.olusturulma || Date.now(), uzak.olusturulma || Date.now()),
      guncelleme: Math.max(yerel.guncelleme || 0, uzak.guncelleme || 0),
      sifirlama: sif, uniteler, kelimeler, puanlar, ayarlar
    };
  }

  // anahtar sırasından bağımsız karşılaştırma (gereksiz yazmaları önlemek için)
  function duz(x) {
    if (Array.isArray(x)) return '[' + x.map(duz).join(',') + ']';
    if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map((k) => JSON.stringify(k) + ':' + duz(x[k])).join(',') + '}';
    return JSON.stringify(x);
  }
  // cihaza özel ayarlar dışında aynı mı?
  function ayniMi(a, b) {
    const temiz = (v) => { const c = kopya(v); YEREL_AYARLAR.forEach((k) => { if (c.ayarlar) delete c.ayarlar[k]; }); return duz(c); };
    return temiz(a) === temiz(b);
  }

  /* ---------------- Gist sürücüsü ---------------- */
  class SenkronHatasi extends Error { constructor(kod, mesaj) { super(mesaj || kod); this.kod = kod; } }

  const BulutSurucusu = {
    ad: 'bulut',
    API: 'https://api.github.com',
    anahtar() { return window.Cihaz && Cihaz.al('gistAnahtar'); },
    gistId() { return window.Cihaz && Cihaz.al('gistId'); },

    async istek(yol, secenek = {}) {
      let r;
      try {
        r = await fetch(yol.startsWith('http') ? yol : this.API + yol, {
          ...secenek, cache: 'no-store',
          headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + this.anahtar(), ...(secenek.body ? { 'Content-Type': 'application/json' } : {}) }
        });
      } catch (e) { throw new SenkronHatasi('ag', 'İnternete ulaşılamadı'); }
      if (r.status === 401) throw new SenkronHatasi('anahtar', 'Anahtar geçersiz ya da süresi dolmuş');
      if (r.status === 403 || r.status === 404) {
        const kalan = r.headers.get('x-ratelimit-remaining');
        if (kalan === '0') throw new SenkronHatasi('sinir', 'GitHub istek sınırı doldu, biraz sonra denenecek');
        throw new SenkronHatasi(r.status === 404 && yol.startsWith('/gists/') ? 'gist-yok' : 'yetki', r.status === 404 ? 'Gist bulunamadı' : 'Anahtarın Gist izni yok');
      }
      if (!r.ok) throw new SenkronHatasi('sunucu', 'GitHub hatası: ' + r.status);
      return r.status === 204 ? null : r.json();
    },

    // Kullanıcının gistleri arasında bu uygulamanınkini bul (ikinci cihazda yalnızca anahtar yeter)
    async bul() {
      for (let sayfa = 1; sayfa <= 10; sayfa++) {
        const liste = await this.istek(`/gists?per_page=100&page=${sayfa}`);
        const g = liste.find((x) => x.description === GIST_ACIKLAMA && x.files && x.files[DOSYA]);
        if (g) return g.id;
        if (liste.length < 100) return null;
      }
      return null;
    },
    async olustur(veri) {
      const g = await this.istek('/gists', { method: 'POST', body: JSON.stringify({ description: GIST_ACIKLAMA, public: false, files: { [DOSYA]: { content: JSON.stringify(veri) } } }) });
      if (g.owner && g.owner.login) Cihaz.koy('gistSahip', g.owner.login);
      return g.id;
    },
    uzakWidgetImza: null,     // Gist'teki widget.json'un imzası (değişmediyse yeniden yazılmaz)
    async oku() {
      const g = await this.istek('/gists/' + this.gistId());
      // widget'ın okuyacağı adres için Gist sahibinin kullanıcı adı
      if (g.owner && g.owner.login && Cihaz.al('gistSahip') !== g.owner.login) Cihaz.koy('gistSahip', g.owner.login);
      const w = g.files && g.files[WIDGET_DOSYA];
      try { this.uzakWidgetImza = w && w.content ? JSON.parse(w.content).imza || null : null; } catch (e) { this.uzakWidgetImza = null; }
      const f = g.files && g.files[DOSYA];
      if (!f) return null;
      let metin = f.content;
      if (f.truncated) {   // 1 MB'tan büyükse içerik ayrı adresten okunur
        try { metin = await (await fetch(f.raw_url, { cache: 'no-store' })).text(); } catch (e) { throw new SenkronHatasi('ag', 'İnternete ulaşılamadı'); }
      }
      try { return JSON.parse(metin); } catch (e) { throw new SenkronHatasi('bozuk', 'Buluttaki dosya okunamadı'); }
    },
    // veri: ilerleme (yazılmayacaksa null) · widget: widget.json (yazılmayacaksa null)
    async yaz(veri, widget) {
      const files = {};
      if (veri) files[DOSYA] = { content: JSON.stringify(veri) };
      if (widget) files[WIDGET_DOSYA] = { content: JSON.stringify(widget) };
      if (!Object.keys(files).length) return;
      await this.istek('/gists/' + this.gistId(), { method: 'PATCH', body: JSON.stringify({ files }) });
      if (widget) this.uzakWidgetImza = widget.imza;
    }
  };

  /* ---------------- Senkron yöneticisi ---------------- */
  const HATA_YAZISI = {
    ag: 'Çevrimdışı, bağlantı gelince denenecek',
    anahtar: 'Anahtar geçersiz ya da süresi dolmuş: Ayarlar → Senkron\'dan yeni anahtar gir',
    yetki: 'Anahtarın Gist izni yok: anahtarı "Gists: Read and write" izniyle oluştur',
    'gist-yok': 'Buluttaki dosya bulunamadı: Ayarlar → Senkron\'dan yeniden bağlan',
    surum: 'Bulutta daha yeni bir sürümün verisi var: uygulamayı yenile',
    sinir: 'GitHub istek sınırı doldu, biraz sonra denenecek',
    bozuk: 'Buluttaki dosya okunamadı',
    sunucu: 'GitHub şu an yanıt vermiyor, sonra denenecek'
  };

  const Senkron = {
    birlestir, ayniMi, BulutSurucusu, GIST_ACIKLAMA,
    calisiyor: false, hata: null, _zaman: null, _tekrar: false, dinleyiciler: [],

    bagliMi() { return !!(BulutSurucusu.anahtar() && BulutSurucusu.gistId()); },
    son() { return Cihaz.al('senkronSon') || null; },

    // Ayarlar → Bağla: anahtarı dene, Gist'i bul ya da oluştur, ilk eşitlemeyi yap
    async bagla(anahtar) {
      anahtar = String(anahtar || '').trim();
      if (!anahtar) throw new SenkronHatasi('anahtar', 'Anahtar boş');
      const eski = BulutSurucusu.anahtar();
      Cihaz.koy('gistAnahtar', anahtar);
      try {
        let id = await BulutSurucusu.bul();
        if (!id) id = await BulutSurucusu.olustur(Depo.veri);
        Cihaz.koy('gistId', id);
      } catch (e) {
        Cihaz.koy('gistAnahtar', eski || undefined);
        throw e;
      }
      this.hata = null;
      await this.esitle('bagla');
      if (this.hata) throw new SenkronHatasi(this.hata.kod, this.hata.message);
    },
    kes() { ['gistAnahtar', 'gistId', 'gistSahip', 'senkronSon'].forEach((k) => Cihaz.koy(k, undefined)); this.hata = null; this._bildir(); },

    async esitle(neden) {
      if (!this.bagliMi()) return false;
      if (this.calisiyor) { this._tekrar = true; return false; }
      this.calisiyor = true; this._bildir();
      let degisti = false;
      try {
        const ham = await BulutSurucusu.oku();
        if (ham && (ham.surum || 1) > Depo.SURUM) throw new SenkronHatasi('surum');
        const uzak = ham ? Depo.yukselt(ham) : null;
        // birleştirme ile atama arasında bekleme yok: bu arada verilen cevaplar kaybolmaz
        const birlesik = birlestir(Depo.veri, uzak, window.Puan ? Puan.SINIR : 4000);
        if (!ayniMi(birlesik, Depo.veri)) { Depo.veri = birlesik; degisti = true; }
        if (degisti) await Depo._yazHepsi();
        // 📲 widget.json: öğrenilen kelimeler değiştiyse ilerlemeyle aynı yazmada gider
        const widget = window.Widget ? Widget.veri() : null;
        const ilerlemeYaz = !uzak || !ayniMi(Depo.veri, uzak), widgetYaz = !!widget && widget.imza !== BulutSurucusu.uzakWidgetImza;
        if (ilerlemeYaz || widgetYaz) await BulutSurucusu.yaz(ilerlemeYaz ? Depo.veri : null, widgetYaz ? widget : null);
        Cihaz.koy('senkronSon', Date.now());
        this.hata = null;
      } catch (e) {
        this.hata = { kod: e.kod || 'sunucu', message: HATA_YAZISI[e.kod] || e.message };
        if (e.kod === 'gist-yok') Cihaz.koy('gistId', undefined);
      } finally {
        this.calisiyor = false;
        this._bildir(degisti);
      }
      if (this._tekrar) { this._tekrar = false; this.zamanla(2000); }
      return degisti;
    },

    // kayıttan sonra boşta kalınca eşitle
    zamanla(ms) {
      if (!this.bagliMi()) return;
      clearTimeout(this._zaman);
      this._zaman = setTimeout(() => this.esitle('bosta'), ms == null ? BOSTA_BEKLE : ms);
    },

    // "2 dk önce" gibi
    zamanYazisi(t) {
      if (!t) return '';
      const s = Math.round((Date.now() - t) / 1000);
      if (s < 60) return 'az önce';
      if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
      if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
      return `${Math.floor(s / 86400)} gün önce`;
    },
    durumYazisi() {
      if (!this.bagliMi()) return '';
      if (this.calisiyor) return '☁️ Eşitleniyor…';
      if (this.hata) return '⚠️ ' + this.hata.message;
      return this.son() ? `☁️ Eşitlendi · ${this.zamanYazisi(this.son())}` : '☁️ Bağlı';
    },

    dinle(fn) { this.dinleyiciler.push(fn); },
    _bildir(degisti) { this.dinleyiciler.forEach((f) => { try { f(!!degisti); } catch (e) { /* yoksay */ } }); },

    baslat() {
      // Depo.kaydet her çağrıldığında boşta-eşitleme zamanlayıcısı kurulur
      const kaydet = Depo.kaydet;
      Depo.kaydet = function () { kaydet.apply(this, arguments); Senkron.zamanla(); };
      document.addEventListener('visibilitychange', () => {
        // arka plana geçerken bekleyen değişiklikleri gönder
        if (document.visibilityState === 'hidden' && this._zaman) { clearTimeout(this._zaman); this._zaman = null; this.esitle('arka'); }
        // geri dönünce (öbür cihazda çalışmış olabilirsin) en az 1 dk geçtiyse eşitle
        if (document.visibilityState === 'visible' && Date.now() - (this.son() || 0) > 60000) this.esitle('donus');
      });
      window.addEventListener('online', () => this.esitle('cevrimici'));
      return this.esitle('acilis');
    }
  };

  window.Senkron = Senkron;
})();
