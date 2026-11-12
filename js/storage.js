/* =========================================================
   KAYIT KATMANI
   Uygulama sadece Depo.kaydet() çağırır; veri her zaman tarayıcıda tutulur.
   Harddiske yazma: Ayarlar → "Harddiske kaydet" (izin sadece o an istenir).
   Tarayıcı kalıcı izin verdiyse ("her ziyarette izin ver") sessizce otomatik yazar.
   Verinin nereye yazıldığını "sürücüler" belirler:
     - TarayiciSurucusu : tarayıcı içi önbellek (her zaman açık, güvenlik ağı)
     - DosyaSurucusu    : seçilen klasördeki ilerleme.json (asıl kayıt)
     - BulutSurucusu    : gizli GitHub Gist (js/senkron.js), birleştirerek eşitler
   Yedek indir/yükle de buradan yapılır.
   ========================================================= */
(function () {
  'use strict';

  const SURUM = 2;                 // ilerleme.json format sürümü (2: sifirlama alanı, senkron için)
  const DOSYA_ADI = 'ilerleme.json';
  const ONCEKI_DOSYA = 'ilerleme.onceki.json';
  const LS_ANAHTAR = 'ispanyolca_ilerleme';

  function bosIlerleme() {
    const simdi = Date.now();
    return {
      surum: SURUM,
      olusturulma: simdi,
      guncelleme: simdi,
      sifirlama: 0,      // son "Sıfırla" zamanı: senkronda bundan eski kayıtlar geri gelmez (js/senkron.js)
      uniteler: {},      // { u01: { adimlar:{not,kart,alistirma}, tamamlandi, enIyiSkor } }
      kelimeler: {},     // { kelimeId: { kutu, sonraki, dogru, yanlis, son } }
      puanlar: [],       // cevap günlüğü + 1–3 zorluk puanları (js/puan.js)
      ayarlar: {}
    };
  }

  /* ---- Format dönüştürücüler: eski sürüm dosyalar otomatik yükseltilir ---- */
  const DONUSTURUCULER = {
    // 1 → 2: senkron için sıfırlama işareti (hiç sıfırlanmamış sayılır)
    1: (v) => { v.sifirlama = 0; v.surum = 2; return v; }
  };

  function yukselt(veri) {
    if (!veri || typeof veri !== 'object') return bosIlerleme();
    if (!veri.surum) veri.surum = 1;
    while (veri.surum < SURUM && DONUSTURUCULER[veri.surum]) {
      veri = DONUSTURUCULER[veri.surum](veri);
    }
    const bos = bosIlerleme();
    for (const k of Object.keys(bos)) if (veri[k] === undefined) veri[k] = bos[k];
    return veri;
  }

  /* ---------------- Tarayıcı sürücüsü ---------------- */
  const TarayiciSurucusu = {
    ad: 'tarayici',
    async oku() {
      try { const r = localStorage.getItem(LS_ANAHTAR); return r ? JSON.parse(r) : null; }
      catch (e) { return null; }
    },
    async yaz(veri) {
      try { localStorage.setItem(LS_ANAHTAR, JSON.stringify(veri)); } catch (e) { /* yer yoksa geç */ }
    }
  };

  /* ---------------- Klasör tutamacını hatırlamak için küçük IndexedDB ---------------- */
  const IDB = {
    ac() {
      return new Promise((coz, red) => {
        const r = indexedDB.open('ispanyolca_db', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => coz(r.result);
        r.onerror = () => red(r.error);
      });
    },
    async al(k) {
      try {
        const db = await this.ac();
        return await new Promise((coz) => {
          const t = db.transaction('kv').objectStore('kv').get(k);
          t.onsuccess = () => coz(t.result); t.onerror = () => coz(undefined);
        });
      } catch (e) { return undefined; }
    },
    async koy(k, v) {
      try {
        const db = await this.ac();
        await new Promise((coz) => {
          const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k);
          t.oncomplete = coz; t.onerror = coz;
        });
      } catch (e) { /* yoksay */ }
    }
  };

  /* ---------------- Dosya sürücüsü (File System Access API) ---------------- */
  const DosyaSurucusu = {
    ad: 'dosya',
    klasor: null,
    destekleniyor: typeof window.showDirectoryPicker === 'function',

    // 'yok' | 'izin-gerekli' | 'bagli' | 'desteklenmiyor'
    async durum() {
      if (!this.destekleniyor) return 'desteklenmiyor';
      if (!this.klasor) this.klasor = await IDB.al('klasor');
      if (!this.klasor) return 'yok';
      try {
        const izin = await this.klasor.queryPermission({ mode: 'readwrite' });
        return izin === 'granted' ? 'bagli' : 'izin-gerekli';
      } catch (e) { return 'yok'; }
    },
    async klasorSec() {
      this.klasor = await window.showDirectoryPicker({ id: 'ispanyolca', mode: 'readwrite' });
      await IDB.koy('klasor', this.klasor);
    },
    async izinIste() {
      if (!this.klasor) return false;
      const izin = await this.klasor.requestPermission({ mode: 'readwrite' });
      return izin === 'granted';
    },
    klasorAdi() { return this.klasor ? this.klasor.name : ''; },
    async oku() {
      try {
        const fh = await this.klasor.getFileHandle(DOSYA_ADI);
        const f = await fh.getFile();
        return JSON.parse(await f.text());
      } catch (e) { return null; }
    },
    async yaz(veri) {
      const metin = JSON.stringify(veri, null, 2);
      // önceki kaydı bir kopya olarak sakla (bozulmaya karşı)
      try {
        const eski = await this.klasor.getFileHandle(DOSYA_ADI);
        const eskiMetin = await (await eski.getFile()).text();
        if (eskiMetin) {
          const ofh = await this.klasor.getFileHandle(ONCEKI_DOSYA, { create: true });
          const ow = await ofh.createWritable(); await ow.write(eskiMetin); await ow.close();
        }
      } catch (e) { /* ilk kayıt */ }
      const fh = await this.klasor.getFileHandle(DOSYA_ADI, { create: true });
      const w = await fh.createWritable(); await w.write(metin); await w.close();
    }
  };

  /* ---------------- Depo: uygulamanın konuştuğu tek nesne ---------------- */
  const Depo = {
    veri: null,
    dosyaAktif: false,
    sonHata: null,
    _zamanlayici: null,
    dinleyiciler: [],

    async baslat() {
      const yerel = await TarayiciSurucusu.oku();
      this.veri = yukselt(yerel || bosIlerleme());
      if ((await DosyaSurucusu.durum()) === 'bagli') await this._dosyayaBaglan();
      return this.veri;
    },

    _bosMu(v) { return !v || (!Object.keys(v.kelimeler || {}).length && !Object.keys(v.uniteler || {}).length); },

    // Dosya ile tarayıcıdaki veriyi birleştir: dosya daha yeniyse (ya da tarayıcı boşsa) dosyayı al
    async _dosyayaBaglan() {
      const dosyadaki = await DosyaSurucusu.oku();
      if (dosyadaki && (this._bosMu(this.veri) || (dosyadaki.guncelleme || 0) >= (this.veri.guncelleme || 0))) {
        this.veri = yukselt(dosyadaki);
        await TarayiciSurucusu.yaz(this.veri);
      }
      this.dosyaAktif = true;
      await this._yazHepsi();
      this._bildir();
    },

    // Kullanıcı tıklamasıyla çağrılır: gerekirse klasör seçtirir / izin ister
    async _erisimSagla() {
      const d = await DosyaSurucusu.durum();
      if (d === 'desteklenmiyor') throw new Error('Bu tarayıcı klasöre yazmayı desteklemiyor');
      if (d === 'yok') await DosyaSurucusu.klasorSec();
      else if (d === 'izin-gerekli' && !(await DosyaSurucusu.izinIste())) throw new Error('İzin verilmedi');
    },

    // 💾 Harddiske kaydet: ilerleme.json + yedekler\tarihli kopya
    async harddiskeKaydet() {
      await this._erisimSagla();
      if (this._bosMu(this.veri)) {
        // tarayıcı boşsa (ör. format sonrası) dosyadakini ezme, onu yükle
        const dosyadaki = await DosyaSurucusu.oku();
        if (dosyadaki && !this._bosMu(dosyadaki)) { await this._dosyayaBaglan(); return { yuklendi: true }; }
      }
      this.veri.ayarlar.sonYedek = Date.now();
      this.dosyaAktif = true;      // bu oturumun geri kalanında değişiklikler de dosyaya yazılır
      this.sonHata = null;
      await this._yazHepsi();
      const r = await this.yedekIndir();
      return { ad: r.ad };
    },

    // 📂 Harddisten geri yükle: klasördeki ilerleme.json'u al
    async harddistenYukle() {
      await this._erisimSagla();
      const dosyadaki = await DosyaSurucusu.oku();
      if (!dosyadaki) throw new Error('Seçilen klasörde ilerleme.json bulunamadı');
      this.veri = yukselt(dosyadaki);
      this.dosyaAktif = true;
      await this._yazHepsi();
    },

    async klasorDegistir() { await DosyaSurucusu.klasorSec(); this.dosyaAktif = false; },
    async durum() { return DosyaSurucusu.durum(); },
    klasorAdi() { return DosyaSurucusu.klasorAdi(); },

    kaydet() {
      this.veri.guncelleme = Date.now();
      clearTimeout(this._zamanlayici);
      this._zamanlayici = setTimeout(() => this._yazHepsi(), 400);
    },
    async _yazHepsi() {
      await TarayiciSurucusu.yaz(this.veri);
      if (this.dosyaAktif) {
        try { await DosyaSurucusu.yaz(this.veri); this.sonHata = null; }
        catch (e) { this.sonHata = e; this.dosyaAktif = false; this._bildir(); }
      }
    },

    // Klasör bağlıysa <klasör>\yedekler\ içine yazar, değilse tarayıcı indirmesi yapar
    async yedekIndir() {
      const metin = JSON.stringify(this.veri, null, 2);
      const d = new Date(), iki = (n) => String(n).padStart(2, '0');
      const ad = `ispanyolca-yedek-${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}_${iki(d.getHours())}-${iki(d.getMinutes())}.json`;
      if (this.dosyaAktif) {
        try {
          const klasor = await DosyaSurucusu.klasor.getDirectoryHandle('yedekler', { create: true });
          const fh = await klasor.getFileHandle(ad, { create: true });
          const w = await fh.createWritable(); await w.write(metin); await w.close();
          return { yer: 'klasor', ad: `${DosyaSurucusu.klasorAdi()}\\yedekler\\${ad}` };
        } catch (e) { /* olmazsa indirmeye düş */ }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([metin], { type: 'application/json' }));
      a.download = ad;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      return { yer: 'indirme', ad };
    },
    async yedekYukle(dosya) {
      const v = JSON.parse(await dosya.text());
      if (!v || typeof v !== 'object' || !('uniteler' in v)) throw new Error('Bu dosya bir ilerleme yedeği değil.');
      this.veri = yukselt(v);
      this.veri.guncelleme = Date.now();
      await this._yazHepsi();
    },
    async sifirla() {
      this.veri = bosIlerleme();
      this.veri.sifirlama = Date.now();   // öbür cihazlardaki eski ilerleme senkronla geri gelmesin
      await this._yazHepsi();
    },
    SURUM, yukselt,

    dinle(fn) { this.dinleyiciler.push(fn); },
    _bildir() { this.dinleyiciler.forEach((f) => { try { f(); } catch (e) {} }); }
  };

  window.Depo = Depo;

  /* ---------------- Cihaz ayarları ----------------
     Yalnızca bu cihazda saklanır, ilerleme dosyasına (ve ileride buluta) GİTMEZ:
     telefonun ayarı bilgisayara taşınmasın. { telefonModu: 'oto'|'acik'|'kapali', ozetGorunum: 'tablo'|'kartlar' } */
  const CIHAZ_ANAHTAR = 'ispanyolca_cihaz';
  const Cihaz = {
    _veri: null,
    _oku() {
      if (!this._veri) { try { this._veri = JSON.parse(localStorage.getItem(CIHAZ_ANAHTAR)) || {}; } catch (e) { this._veri = {}; } }
      return this._veri;
    },
    al(k) { return this._oku()[k]; },
    koy(k, v) { this._oku()[k] = v; try { localStorage.setItem(CIHAZ_ANAHTAR, JSON.stringify(this._veri)); } catch (e) { /* yer yoksa geç */ } },
    // Otomatik: dokunmatik (parmakla kullanılan) ve telefon boyutunda ekran
    otoTelefon() {
      try { return matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 600; } catch (e) { return false; }
    },
    telefon() {
      const m = this.al('telefonModu') || 'oto';
      return m === 'acik' || (m === 'oto' && this.otoTelefon());
    }
  };
  window.Cihaz = Cihaz;
})();
