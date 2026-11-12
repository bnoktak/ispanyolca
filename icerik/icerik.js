/* =========================================================
   İÇERİK KAYDI
   Her ünite kendi dosyasında ICERIK.unite({...}) ile eklenir.
   Yeni ünite eklemek için: icerik klasörüne dosya koy,
   index.html'de <script> satırını ekle. İlerleme etkilenmez.

   Ünite biçimi:
   {
     id: 'u04', sira: 4, seviye: 'A1', baslik: '...', emoji: '...',
     ozet: 'tek satır açıklama',
     not: '<p>HTML kısa not</p>',
     detayBaslik: '...', detay: '<p>İsteğe bağlı: kısa notun altında açılır "📖 Detaylı" bölümü</p>',
     kelimeler: [ { id: 'u04_ser', es: 'ser', tr: 'olmak', en: 'to be', ipucu: '...', yazma: true } ],
     cumleler:  [ { es: 'Yo soy Ana.', tr: 'Ben Ana\'yım.' } ],
     gruplar:   [ ['Ser fiili', ['ser', 'soy']] ]   // kelime id'lerinin "u04_" sonrası
     bosluklar: [ { satirlar: ['Yo [soy] Ana.'], tr: '...', secenek: ['eres'] } ]
   }
   - kelime id'leri hiç değişmemeli (ilerleme bu id'lere bağlı)
   - es içinde " / " ile alternatif cevaplar yazılabilir: 'encantado / encantada'
   - yazma: false → yazma alıştırmasında sorulmaz
   - ek: true → ek ünite (kilitsiz, ünite sırasına girmez; sira 100+ verilir)
   ========================================================= */
window.ICERIK = {
  uniteler: [],
  ekler: [],       // ek üniteler (ek: true): kilitsiz, sıraya girmez, ana sayfada Özet tabloların altında
  _kelime: {},
  unite(u) {
    u.kelimeler.forEach((k) => { k.unite = u.id; this._kelime[k.id] = k; });
    u.cumleler = u.cumleler || [];
    const liste = u.ek ? this.ekler : this.uniteler;
    liste.push(u);
    liste.sort((a, b) => a.sira - b.sira);
  },
  kelime(id) { return this._kelime[id] || null; },
  bul(id) { return this.uniteler.find((u) => u.id === id) || this.ekler.find((u) => u.id === id) || null; },
  tumKelimeler() { return Object.values(this._kelime); },
  // Ünitenin kelimelerini gruplarıyla döndürür: [{ baslik, kelimeler }]. Gruba girmeyenler "Diğer" altına düşer.
  gruplu(u) {
    const kullanildi = new Set();
    const sonuc = (u.gruplar || []).map(([baslik, ekler]) => ({
      baslik,
      kelimeler: ekler.map((e) => this._kelime[u.id + '_' + e]).filter((k) => k && !kullanildi.has(k.id) && kullanildi.add(k.id))
    })).filter((g) => g.kelimeler.length);
    const kalan = u.kelimeler.filter((k) => !kullanildi.has(k.id));
    if (kalan.length) sonuc.push({ baslik: 'Diğer', kelimeler: kalan });
    return sonuc;
  }
};
