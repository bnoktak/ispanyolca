/* =========================================================
   UYGULAMA: ekranlar ve akış
   ========================================================= */
(function () {
  'use strict';

  const ADIMLAR = [
    { id: 'not', ad: 'Kısa not', emoji: '📝' },
    { id: 'kart', ad: 'Kelime kartları', emoji: '🃏' },
    { id: 'alistirma', ad: 'Alıştırmalar', emoji: '🎯' },
    { id: 'sinav', ad: 'Mini sınav', emoji: '✅' }
  ];
  const GECME_ORANI = 0.85;
  const ingilizce = () => Depo.veri.ayarlar.ingilizce !== false;
  const TEKRAR_ADET = 15;
  const puanlamaAcik = () => Depo.veri.ayarlar.puanlama !== false;

  const kok = document.getElementById('uygulama');
  const esc = Alistirma.esc;
  let tusDinleyici = null;
  const tusAyarla = (fn) => { tusDinleyici = fn; };
  document.addEventListener('keydown', (e) => { if (tusDinleyici) tusDinleyici(e); });

  /* ---------- ilerleme yardımcıları ---------- */
  function uniteIlerleme(id) {
    const u = Depo.veri.uniteler;
    if (!u[id]) u[id] = { adimlar: {}, tamamlandi: false, enIyiSkor: 0 };
    return u[id];
  }
  function uniteAcikMi(i) {
    if (i === 0) return true;
    const onceki = ICERIK.uniteler[i - 1];
    return !!(Depo.veri.uniteler[onceki.id] && Depo.veri.uniteler[onceki.id].tamamlandi);
  }
  function adimAcikMi(uid, adimIndex) {
    if (adimIndex === 0) return true;
    const ilr = uniteIlerleme(uid);
    return !!ilr.adimlar[ADIMLAR[adimIndex - 1].id];
  }

  /* ---------- kayıt durumu (ana ekranda sadece küçük bir alt yazı, izin istemez) ---------- */
  function gunFarki(t) {
    if (!t) return null;
    const g = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / 864e5);
    return g <= 0 ? 'bugün' : g === 1 ? 'dün' : `${g} gün önce`;
  }
  function kayitDurumYazisi() {
    if (Depo.dosyaAktif) return '✓ Harddiske otomatik kaydediliyor';
    const s = gunFarki(Depo.veri.ayarlar.sonYedek);
    return s ? `Son harddisk kaydı: ${s}` : 'Henüz harddiske kaydedilmedi · ⚙️ Ayarlar → Harddiske kaydet';
  }

  function uniteButon(u, acik) {
    const ilr = Depo.veri.uniteler[u.id] || { adimlar: {} };
    const biten = ADIMLAR.filter((a) => ilr.adimlar[a.id]).length;
    return `
          <button class="unite ${acik ? '' : 'kilitli'} ${ilr.tamamlandi ? 'bitti' : ''} ${u.ek ? 'ek' : ''}" data-unite="${u.id}" ${acik ? '' : 'disabled'}>
            <div class="unite-emoji">${acik ? u.emoji : '🔒'}</div>
            <div class="unite-bilgi">
              <small>${u.ek ? 'Ek ünite' : `${u.seviye} · Ünite ${u.sira}`}</small>
              <b>${esc(u.baslik)}</b>
              <span>${esc(u.ozet)}</span>
              <div class="noktalar">${ADIMLAR.map((a) => `<i class="${ilr.adimlar[a.id] ? 'dolu' : ''}"></i>`).join('')}</div>
            </div>
            <div class="unite-sag">${ilr.tamamlandi ? '⭐' : acik ? `${biten}/4` : ''}</div>
          </button>`;
  }

  /* =========================================================
     ANA EKRAN
     ========================================================= */
  async function anaEkran() {
    tusAyarla(null);
    const tamam = ICERIK.uniteler.filter((u) => Depo.veri.uniteler[u.id] && Depo.veri.uniteler[u.id].tamamlandi).length;
    const bekleyen = Tekrar.vakitGelenler().length, ogrenilen = Tekrar.ogrenilenSayisi();

    kok.innerHTML = `
      <header class="ust">
        <div class="logo">¡Hola! <span>İspanyolca</span></div>
        <button class="ikon" data-git="ayarlar" title="Ayarlar">⚙️</button>
      </header>
      <section class="istatistik">
        <div><b>${tamam}/${ICERIK.uniteler.length}</b><span>ünite</span></div>
        <div><b>${ogrenilen}</b><span>öğrenilen kelime</span></div>
        <div><b>${bekleyen}</b><span>tekrar bekliyor</span></div>
      </section>
      <button class="tekrar-buton ${ogrenilen ? '' : 'pasif'}" data-git="tekrar" ${ogrenilen ? '' : 'disabled'}>
        <span>🔁</span><div><b>Tekrar</b><small>${ogrenilen ? (bekleyen ? `${bekleyen} kelimenin tekrar zamanı geldi · çalıştığın tüm ünitelerden karışık` : 'Çalıştığın tüm ünitelerden karışık alıştırma') : 'İlk ünitenin kartlarını bitirince açılır'}</small></div>
      </button>
      <button class="tekrar-buton ozet-buton" data-git="ozet">
        <span>📚</span><div><b>Özet tablolar</b><small>Zamirler, artikeller, fiil çekimleri ve açtığın ünitelere kadar tüm kelimeler</small></div>
      </button>
      ${ICERIK.ekler.length ? `<h2 class="baslik2">Ek üniteler <small>kilitsiz · istediğin zaman</small></h2>
      <div class="yol ek-yol">${ICERIK.ekler.map((u) => uniteButon(u, true)).join('')}</div>` : ''}
      <h2 class="baslik2">Üniteler</h2>
      <div class="yol">
        ${ICERIK.uniteler.map((u, i) => uniteButon(u, uniteAcikMi(i))).join('')}
      </div>
      <footer class="alt">${kayitDurumYazisi()}</footer>`;

    kok.querySelectorAll('[data-git="ayarlar"]').forEach((b) => b.addEventListener('click', ayarlarEkrani));
    kok.querySelectorAll('[data-git="tekrar"]').forEach((b) => b.addEventListener('click', tekrarBaslat));
    kok.querySelectorAll('[data-git="ozet"]').forEach((b) => b.addEventListener('click', () => ozetEkrani()));
    kok.querySelectorAll('[data-unite]').forEach((b) => b.addEventListener('click', () => uniteEkrani(b.dataset.unite)));
  }

  /* =========================================================
     ÜNİTE EKRANI
     ========================================================= */
  function uniteEkrani(uid) {
    tusAyarla(null);
    const u = ICERIK.bul(uid), ilr = uniteIlerleme(uid);
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">${u.emoji} ${esc(u.baslik)}</div><span></span></header>
      <div class="adimlar">
        ${ADIMLAR.map((a, i) => {
          const acik = adimAcikMi(uid, i), bitti = !!ilr.adimlar[a.id];
          const ek = a.id === 'sinav' && ilr.enIyiSkor ? ` · en iyi %${Math.round(ilr.enIyiSkor * 100)}` : '';
          const detayAdimi = a.id === 'kart' && u.detay ? `<button class="adim adim-detay ${ilr.detayOkundu ? 'bitti' : ''}" data-adim="detay">
            <span class="adim-emoji">📖</span>
            <span class="adim-ad">Detaylı not<small>${esc(u.detayBaslik || '')} · isteğe bağlı</small></span>
            <span>${ilr.detayOkundu ? '✓' : '›'}</span></button>` : '';
          return detayAdimi + `<button class="adim ${bitti ? 'bitti' : ''} ${acik ? '' : 'kilitli'}" data-adim="${a.id}" ${acik ? '' : 'disabled'}>
            <span class="adim-emoji">${acik ? a.emoji : '🔒'}</span>
            <span class="adim-ad">${a.ad}<small>${bitti ? 'Tamamlandı' + ek : acik ? 'Başla' : 'Önceki adımı bitir'}</small></span>
            <span>${bitti ? '✓' : '›'}</span></button>`;
        }).join('')}
      </div>
      ${ilr.tamamlandi ? `<div class="bant basari">⭐ Bu üniteyi tamamladın! Adımları istediğin zaman tekrar yapabilirsin.</div>` : u.ek ? `<p class="aciklama">Ek ünite: istediğin zaman çalışabilirsin, diğer ünitelerin kilidini etkilemez. Kelimeleri tekrar listene girer.</p>` : `<p class="aciklama">Mini sınavda <b>%${GECME_ORANI * 100}</b> başarıyla sonraki ünite açılır.</p>`}`;
    kok.querySelector('.geri').addEventListener('click', anaEkran);
    kok.querySelectorAll('[data-adim]').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.adim;
      ustSiraGuncelle();
      if (a === 'not') notEkrani(uid);
      else if (a === 'detay') detayEkrani(uid);
      else if (a === 'kart') kartEkrani(uid);
      else if (a === 'alistirma') alistirmaMenu(uid);
      else if (a === 'sinav') sinavGiris(uid);
    }));
  }
  /* =========================================================
     ALIŞTIRMALAR MENÜSÜ: karışık alıştırma + 3 toplu çalışma
     ========================================================= */
  function alistirmaMenu(uid) {
    tusAyarla(null); ustSiraGuncelle();
    const u = ICERIK.bul(uid), ilr = uniteIlerleme(uid);
    const yazilir = u.kelimeler.filter((k) => k.yazma !== false).length;
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">🎯 Alıştırmalar</div><span></span></header>
      <div class="adimlar">
        <button class="adim ${ilr.adimlar.alistirma ? 'bitti' : ''}" data-mod="karisik"><span class="adim-emoji">🎯</span>
          <span class="adim-ad">Karışık alıştırma<small>${Alistirma.alistirmaSayisi(u)} soru, her türden · ${ilr.adimlar.alistirma ? 'tamamlandı' : 'bitirince sınav açılır'}</small></span><span>›</span></button>
        <button class="adim" data-mod="eslestir"><span class="adim-emoji">🧩</span>
          <span class="adim-ad">Toplu eşleştirme<small>${u.kelimeler.length} kelimenin hepsi, grup grup</small></span><span>›</span></button>
        <button class="adim" data-mod="es"><span class="adim-emoji">✍️</span>
          <span class="adim-ad">Türkçe → İspanyolca yaz<small>${yazilir} kelime, grup grup</small></span><span>›</span></button>
      </div>
      <p class="aciklama">Mini sınavı açmak için karışık alıştırmayı bir kez bitirmen yeterli. Toplu çalışmalar istediğin kadar tekrar edilebilir ve tekrar listeni de günceller.</p>`;
    kok.querySelector('.geri').addEventListener('click', () => uniteEkrani(uid));
    kok.querySelectorAll('[data-mod]').forEach((b) => b.addEventListener('click', () => {
      const m = b.dataset.mod;
      if (m === 'karisik') oturum({ baslik: 'Alıştırmalar', liste: Alistirma.karisik(u), geri: () => alistirmaMenu(uid), bitince: (d, t) => { adimBitir(uid, 'alistirma'); sonucEkrani({ dogru: d, toplam: t, baslik: 'Alıştırmalar bitti', geri: () => alistirmaMenu(uid), ileri: { ad: '✅ Mini sınava geç →', fn: () => sinavGiris(uid) } }); } });
      else if (m === 'eslestir') topluEslestir(uid);
      else topluYaz(uid, m);
    }));
  }

  // "(ben) …'ım" gibi kalıp anlamlar Türkçe yazmaya uygun değil
  const trYazilabilir = (k) => !/…/.test(k.tr);

  // Küçük grupları (1–2 kelime) bir sonrakiyle birleştir
  function topluGruplar(u, filtre) {
    const sonuc = [];
    ICERIK.gruplu(u).forEach((g) => {
      const kel = g.kelimeler.filter(filtre || (() => true));
      if (!kel.length) return;
      const son = sonuc.at(-1);
      if (son && (son.kelimeler.length < 3 || kel.length < 3)) { son.baslik += ' · ' + g.baslik; son.kelimeler.push(...kel); }
      else sonuc.push({ baslik: g.baslik, kelimeler: kel.slice() });
    });
    return sonuc;
  }

  /* ---------- 1) Toplu eşleştirme ---------- */
  function topluEslestir(uid) {
    tusAyarla(null);
    const u = ICERIK.bul(uid), gruplar = topluGruplar(u);
    const toplam = gruplar.reduce((a, g) => a + g.kelimeler.length, 0);
    let eslesen = 0, hata = 0;
    const hatali = new Set();
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">×</button>
        <div class="ilerleme"><div style="width:0%"></div></div><span class="sayac">0/${toplam}</span></header>
      <p class="yonerge">🧩 Her grupta İspanyolcayı Türkçesiyle eşleştir</p>
      ${gruplar.map((g, gi) => `
        <section class="toplu-grup" data-g="${gi}">
          <h5>${esc(g.baslik)}</h5>
          <div class="eslestir">
            <div class="sutun">${Alistirma.karistir(g.kelimeler).map((k) => `<button class="kart-k es" data-id="${k.id}" data-y="sol" data-g="${gi}">${esc(k.es)}</button>`).join('')}</div>
            <div class="sutun">${Alistirma.karistir(g.kelimeler).map((k) => `<button class="kart-k" data-id="${k.id}" data-y="sag" data-g="${gi}">${esc(k.tr)}</button>`).join('')}</div>
          </div>
        </section>`).join('')}
      <div class="toplu-alt"><span class="toplu-hata">Hata: 0</span></div>`;
    kok.querySelector('.geri').addEventListener('click', () => alistirmaMenu(uid));
    let secili = null;
    kok.querySelectorAll('.kart-k').forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('tamam')) return;
      if (!secili || secili.dataset.y === b.dataset.y || secili.dataset.g !== b.dataset.g) {
        if (secili) secili.classList.remove('secili');
        secili = b; b.classList.add('secili'); return;
      }
      const a = secili; secili = null; a.classList.remove('secili');
      if (a.dataset.id === b.dataset.id) {
        a.classList.add('tamam'); b.classList.add('tamam'); eslesen++;
        if (Ses.okunurMu(ICERIK.kelime(a.dataset.id)) && Ses.otoOku()) Ses.oku(ICERIK.kelime(a.dataset.id).es);
        kok.querySelector('.ilerleme div').style.width = (eslesen / toplam) * 100 + '%';
        kok.querySelector('.sayac').textContent = `${eslesen}/${toplam}`;
        if (eslesen === toplam) {
          gruplar.forEach((g) => g.kelimeler.forEach((k) => Tekrar.sonuc(k.id, !hatali.has(k.id))));
          setTimeout(() => sonucEkrani({
            dogru: toplam - hatali.size, toplam, baslik: 'Toplu eşleştirme bitti',
            mesaj: hata ? `${hata} yanlış eşleştirme. Karıştırdıkların: ${[...hatali].map((id) => ICERIK.kelime(id).es).join(', ')}` : 'Hiç hata yapmadın!',
            geri: () => alistirmaMenu(uid), ileri: { ad: '🔁 Tekrar', fn: () => topluEslestir(uid) }
          }), 500);
        }
      } else {
        hata++;
        const sol = a.dataset.y === 'sol' ? a : b; hatali.add(sol.dataset.id);
        kok.querySelector('.toplu-hata').textContent = `Hata: ${hata}`;
        [a, b].forEach((x) => { x.classList.add('titre'); setTimeout(() => x.classList.remove('titre'), 400); });
      }
    }));
  }

  /* ---------- 2) ve 3) Toplu yazma: yon 'es' (Türkçe → İspanyolca) | 'tr' (İspanyolca → Türkçe) ---------- */
  function topluYaz(uid, yon, sadece) {
    tusAyarla(null);
    const u = ICERIK.bul(uid);
    const filtre = yon === 'es' ? (k) => k.yazma !== false : trYazilabilir;
    let gruplar = topluGruplar(u, filtre);
    if (sadece) gruplar = gruplar.map((g) => ({ ...g, kelimeler: g.kelimeler.filter((k) => sadece.includes(k.id)) })).filter((g) => g.kelimeler.length);
    const kelimeler = gruplar.flatMap((g) => g.kelimeler);
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">×</button><div class="ust-baslik">${yon === 'es' ? '✍️ Türkçe → İspanyolca' : '📝 İspanyolca → Türkçe'}</div><span class="sayac">${kelimeler.length}</span></header>
      ${sadece ? '<p class="aciklama">Sadece yanlış yaptıkların</p>' : ''}
      <div class="toplu-ozet" hidden></div>
      ${gruplar.map((g) => `
        <section class="toplu-grup">
          <h5>${esc(g.baslik)}</h5>
          ${g.kelimeler.map((k) => `
            <div class="toplu-satir" data-id="${k.id}">
              <label for="in-${k.id}" class="${yon === 'tr' ? 'es' : ''}">${esc(yon === 'es' ? k.tr : k.es)}${yon === 'tr' && Ses.aktif() && Ses.okunurMu(k) ? ` <button type="button" class="ses" data-ses="${esc(k.es)}">🔊</button>` : ''}</label>
              <input id="in-${k.id}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${yon === 'es' ? 'İspanyolcası…' : 'Türkçesi…'}">
              <div class="toplu-cevap"></div>
            </div>`).join('')}
        </section>`).join('')}
      <div class="toplu-alt">
        ${yon === 'es' ? Alistirma.aksanKlavyesi() : ''}
        <button class="ana-buton tam kontrol">Kontrol et</button>
      </div>`;
    kok.querySelector('.geri').addEventListener('click', () => alistirmaMenu(uid));
    kok.querySelectorAll('.ses').forEach((b) => b.addEventListener('click', () => Ses.oku(b.dataset.ses)));
    const girisler = [...kok.querySelectorAll('.toplu-satir input')];
    let sonOdak = girisler[0];
    girisler.forEach((inp, i) => {
      inp.addEventListener('focus', () => { sonOdak = inp; });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); (girisler.at(i + 1) || kok.querySelector('.kontrol')).focus(); } });
    });
    // aksan butonları son odaklanılan kutuya yazar
    kok.querySelectorAll('.aksan').forEach((b) => b.addEventListener('mousedown', (e) => e.preventDefault()));
    kok.querySelectorAll('.aksan').forEach((b) => b.addEventListener('click', () => {
      const inp = sonOdak; if (!inp || inp.disabled) return;
      const h = b.dataset.h, s0 = inp.selectionStart ?? inp.value.length, e0 = inp.selectionEnd ?? s0;
      inp.value = inp.value.slice(0, s0) + h + inp.value.slice(e0); inp.focus(); inp.setSelectionRange(s0 + h.length, s0 + h.length);
    }));
    setTimeout(() => girisler[0] && girisler[0].focus(), 50);

    const kontrolB = kok.querySelector('.kontrol');
    kontrolB.addEventListener('click', () => {
      if (kontrolB.dataset.bitti) return;
      kontrolB.dataset.bitti = '1';
      const yanlislar = [];
      let dogru = 0;
      kok.querySelectorAll('.toplu-satir').forEach((satir) => {
        const k = ICERIK.kelime(satir.dataset.id), inp = satir.querySelector('input'), cevap = satir.querySelector('.toplu-cevap');
        inp.disabled = true;
        const sonuc = yon === 'es' ? Alistirma.kontrol(inp.value, k.es) : Alistirma.kontrolTr(inp.value, k.tr);
        Tekrar.sonuc(k.id, sonuc.dogru);
        if (sonuc.dogru) dogru++; else yanlislar.push(k.id);
        satir.classList.add(sonuc.dogru ? (sonuc.uyari ? 'uyari' : 'dogru') : 'yanlis');
        const dogrusu = yon === 'es' ? k.es : k.tr;
        if (!sonuc.dogru || sonuc.uyari) cevap.innerHTML = `${sonuc.dogru ? '≈' : '✓'} <b>${esc(dogrusu)}</b>${!sonuc.dogru && yon === 'tr' && inp.value.trim() ? ' <button type="button" class="kucuk-link dogru-say">Benim cevabım da doğru</button>' : ''}`;
      });
      const ozet = kok.querySelector('.toplu-ozet');
      const ciz = () => {
        const n = kok.querySelectorAll('.toplu-satir').length;
        ozet.hidden = false;
        ozet.innerHTML = `<b>${dogru}/${n} doğru</b> (%${Math.round((dogru / n) * 100)})${yanlislar.length ? ` · ${yanlislar.length} yanlış, aşağıda kırmızı` : ' · hepsi doğru! 🎉'}`;
      };
      ciz();
      // İspanyolca → Türkçe: eş anlamlı yazdıysan kendin doğru sayabilirsin
      kok.querySelectorAll('.dogru-say').forEach((b) => b.addEventListener('click', () => {
        const satir = b.closest('.toplu-satir'), id = satir.dataset.id;
        Tekrar.sonuc(id, true); dogru++; yanlislar.splice(yanlislar.indexOf(id), 1);
        satir.classList.remove('yanlis'); satir.classList.add('dogru'); b.remove(); ciz();
        altGuncelle();
      }));
      const alt = kok.querySelector('.toplu-alt');
      const altGuncelle = () => {
        alt.innerHTML = `${yanlislar.length ? '<button class="ana-buton yanlislar">🔁 Sadece yanlışları tekrar yaz</button>' : ''}
          <button class="ikinci-buton yeniden">Baştan yaz</button><button class="ikinci-buton bitir">Bitir</button>`;
        const yb = alt.querySelector('.yanlislar'); if (yb) yb.addEventListener('click', () => topluYaz(uid, yon, yanlislar.slice()));
        alt.querySelector('.yeniden').addEventListener('click', () => topluYaz(uid, yon));
        alt.querySelector('.bitir').addEventListener('click', () => alistirmaMenu(uid));
      };
      altGuncelle();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function adimBitir(uid, adim) { uniteIlerleme(uid).adimlar[adim] = true; Depo.kaydet(); }

  /* ---------- Kısa not ---------- */
  function notEkrani(uid) {
    tusAyarla(null);
    const u = ICERIK.bul(uid);
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">📝 Kısa not</div><span></span></header>
      <article class="not">${u.not}
        <h4 class="not-baslik">📚 Bu ünitede karşılaşacağın kelimeler (${u.kelimeler.length})</h4>
        ${ICERIK.gruplu(u).map((g) => `
          <div class="kelime-grup">
            <h5>${esc(g.baslik)}</h5>
            <table class="kelime-tablo">${g.kelimeler.map((k) => `<tr><td>${esc(k.es)}</td><td>${esc(k.tr)}</td><td class="ses-hucre">${Ses.aktif() && Ses.okunurMu(k) ? `<button type="button" class="ses" data-ses="${esc(k.es)}" title="Dinle">🔊</button>` : ''}</td></tr>`).join('')}</table>
          </div>`).join('')}
      </article>
      <button class="ana-buton tam anladim">Anladım →</button>`;
    kok.querySelector('.geri').addEventListener('click', () => uniteEkrani(uid));
    kok.querySelector('.anladim').addEventListener('click', () => { adimBitir(uid, 'not'); kartEkrani(uid); });
    kok.querySelectorAll('.not .ses').forEach((b) => b.addEventListener('click', () => Ses.oku(b.dataset.ses)));
  }

  /* ---------- Detaylı not (isteğe bağlı, kısa not ile kartlar arasında) ---------- */
  function detayEkrani(uid) {
    tusAyarla(null);
    const u = ICERIK.bul(uid), ilr = uniteIlerleme(uid);
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">📖 Detaylı not</div><span></span></header>
      <article class="not"><h3 class="detay-baslik">${esc(u.detayBaslik || '')}</h3>${u.detay}</article>
      <button class="ana-buton tam ileri">Kelime kartlarına geç →</button>`;
    if (!Ses.aktif()) kok.querySelectorAll('.not .ses').forEach((b) => b.remove());
    kok.querySelectorAll('.not .ses').forEach((b) => b.addEventListener('click', () => Ses.oku(b.dataset.ses)));
    if (!ilr.detayOkundu) { ilr.detayOkundu = true; Depo.kaydet(); }
    kok.querySelector('.geri').addEventListener('click', () => uniteEkrani(uid));
    const ileri = kok.querySelector('.ileri');
    if (!adimAcikMi(uid, 1)) ileri.textContent = 'Ünite ekranına dön';
    ileri.addEventListener('click', () => (adimAcikMi(uid, 1) ? kartEkrani(uid) : uniteEkrani(uid)));
  }

  /* ---------- Kelime kartları ---------- */
  function kartEkrani(uid) {
    const u = ICERIK.bul(uid);
    const sira = ICERIK.gruplu(u).flatMap((g) => g.kelimeler), toplam = sira.length; let bilinen = 0, cevrik = false;
    function ciz() {
      if (!sira.length) {
        u.kelimeler.forEach((k) => { if (!Tekrar.ogrenildiMi(k.id)) Tekrar.tanis(k.id); });
        adimBitir(uid, 'kart');
        return sonucEkrani({ baslik: 'Kartlar bitti', mesaj: `${toplam} kelimeyle tanıştın. Artık tekrar listende.`, geri: () => uniteEkrani(uid), ileri: { ad: 'Alıştırmalara geç →', fn: () => uniteEkrani(uid) } });
      }
      const k = sira[0]; cevrik = false;
      kok.innerHTML = `
        <header class="ust"><button class="ikon geri">×</button>
          <div class="ilerleme"><div style="width:${(bilinen / toplam) * 100}%"></div></div><span class="sayac">${bilinen}/${toplam}</span></header>
        <div class="flip" tabindex="0"><div class="flip-ic">
          <div class="yuz on"><span class="es">${esc(k.es)}</span>${Ses.aktif() && Ses.okunurMu(k) ? '<button type="button" class="ses kart-ses" title="Dinle (S)">🔊</button>' : ''}<small>Çevirmek için dokun (boşluk)</small></div>
          <div class="yuz arka"><span>${esc(k.tr)}</span>${k.en && ingilizce() ? `<span class="en">🇬🇧 ${esc(k.en)}</span>` : ''}${k.ipucu ? `<small>💡 ${esc(k.ipucu)}</small>` : ''}</div>
        </div></div>
        <button class="ana-buton tam biliyorum">Sonraki →</button>`;
      const flip = kok.querySelector('.flip');
      const cevir = () => { cevrik = !cevrik; flip.classList.toggle('cevrik', cevrik); };
      const dinle = () => { if (Ses.okunurMu(k)) Ses.oku(k.es); };
      const sesB = kok.querySelector('.kart-ses');
      if (sesB) sesB.addEventListener('click', (e) => { e.stopPropagation(); dinle(); });
      if (Ses.otoOku()) setTimeout(dinle, 250);
      flip.addEventListener('click', cevir);
      const bil = () => { sira.shift(); bilinen++; ciz(); };
      kok.querySelector('.biliyorum').addEventListener('click', bil);
      kok.querySelector('.geri').addEventListener('click', () => { Ses.dur(); uniteEkrani(uid); });
      tusAyarla((e) => {
        if (e.key === ' ') { e.preventDefault(); cevir(); }
        else if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); bil(); }
        else if (e.key === 's' || e.key === 'S') { e.preventDefault(); dinle(); }
      });
    }
    ciz();
  }

  /* =========================================================
     OTURUM (alıştırma / sınav / tekrar)
     ========================================================= */
  function oturum({ baslik, liste, geri, bitince, sinav }) {
    let i = 0, dogru = 0, alan = null;
    const kayitlar = [];   // sınavda: her sorunun cevabı (sonda topluca gösterilir)
    function goster() {
      if (alan && alan._temizle) alan._temizle();
      if (i >= liste.length) { kok.classList.remove('sinav-modu'); return bitince(dogru, liste.length, kayitlar); }
      kok.classList.toggle('sinav-modu', !!sinav);
      kok.innerHTML = `
        <header class="ust"><button class="ikon geri" title="Çık">×</button>
          <div class="ilerleme"><div style="width:${(i / liste.length) * 100}%"></div></div><span class="sayac">${i + 1}/${liste.length}</span></header>
        <div class="oturum-baslik">${esc(baslik)}</div>
        <main class="alistirma"></main>
        <div class="geribildirim"></div>`;
      kok.querySelector('.geri').addEventListener('click', () => {
        if (sinav && !confirm('Sınavdan çıkılsın mı? Bu deneme sayılmaz.')) return;
        if (alan && alan._temizle) alan._temizle(); Ses.dur(); kok.classList.remove('sinav-modu'); geri();
      });
      alan = kok.querySelector('.alistirma');
      tusAyarla((e) => { if (alan._tus && !e.target.matches('input')) alan._tus(e); });
      const soru = liste[i];
      soru.render(alan, (s) => {
        if (s.dogru) dogru++;
        s.kayit = Puan.kaydet({ anahtar: soru.anahtar, tur: soru.tur, unite: soru.unite, dogru: s.dogru, sinav });
        if (sinav) {   // sınavda doğru/yanlış gösterilmez, sıradaki soruya geçilir
          kayitlar.push({ no: i + 1, ...s });
          tusAyarla(null); Ses.dur();
          setTimeout(() => { i++; goster(); }, 150);
          return;
        }
        geribildirim(s);
      });
      kok.querySelectorAll('.ses').forEach((b) => b.addEventListener('click', () => Ses.oku(b.dataset.ses)));
    }
    function geribildirim(s) {
      const g = kok.querySelector('.geribildirim');
      g.className = 'geribildirim acik ' + (s.dogru ? (s.uyari ? 'uyari' : 'dogru') : 'yanlis');
      let ic = `<b>${s.dogru ? (s.uyari ? 'Neredeyse!' : 'Doğru! 🎉') : 'Yanlış'}</b>`;
      if (s.mesaj) ic += `<p>${esc(s.mesaj)}</p>`;
      if (s.uyari) ic += `<p>${esc(s.uyari)} <b>${esc(s.dogrusu)}</b></p>`;
      else if (!s.dogru && s.dogrusu) ic += `<p>Doğrusu: <b>${esc(s.dogrusu)}</b></p>`;
      if (s.en && ingilizce()) ic += `<p class="en">🇬🇧 ${esc(s.en)}</p>`;
      if (s.ipucu && !s.dogru) ic += `<p class="ipucu">💡 ${esc(s.ipucu)}</p>`;
      if (s.oku && Ses.otoOku()) {
        Ses.oku(s.oku);
        ic += ` <button type="button" class="ses tekrar-dinle" title="Tekrar dinle">🔊</button>`;
      }
      const puanHtml = puanlamaAcik() && s.kayit ? `<div class="puanla" title="Klavyeden 1 / 2 / 3"><span>Bu soru:</span>
          <button type="button" data-p="1">1 kolay</button><button type="button" data-p="2">2 orta</button><button type="button" data-p="3">3 zor</button></div>` : '';
      g.innerHTML = `<div>${ic}${puanHtml}</div><button class="ana-buton devam">Devam →</button>`;
      const puanVer = (p) => {
        Puan.puanla(s.kayit, p);
        g.querySelectorAll('.puanla button').forEach((b) => b.classList.toggle('secili', +b.dataset.p === p));
      };
      g.querySelectorAll('.puanla button').forEach((b) => b.addEventListener('click', () => { puanVer(+b.dataset.p); devam.focus(); }));
      const td = g.querySelector('.tekrar-dinle'); if (td) td.addEventListener('click', () => Ses.oku(s.oku));
      const devam = g.querySelector('.devam');
      setTimeout(() => devam.focus(), 30);
      const git = () => { tusAyarla(null); Ses.dur(); i++; goster(); };
      devam.addEventListener('click', git);
      tusAyarla((e) => {
        if (e.key === 'Enter' && document.activeElement !== devam) { e.preventDefault(); git(); }
        else if (s.kayit && puanlamaAcik() && ['1', '2', '3'].includes(e.key)) { e.preventDefault(); puanVer(+e.key); }
      });
    }
    goster();
  }

  function sinavGiris(uid) {
    tusAyarla(null);
    const u = ICERIK.bul(uid), ilr = uniteIlerleme(uid);
    ustSiraGuncelle();
    const liste = Alistirma.sinav(u), SINAV_ADET = liste.length;
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">✅ Mini sınav</div><span></span></header>
      <section class="kutu sinav-kural">
        <h3>${u.emoji} ${esc(u.baslik)}</h3>
        <ul>
          <li><b>${SINAV_ADET} soru</b>: ünitedeki <b>her kelime en az bir kez</b> sorulur, üstüne cümle soruları</li>
          <li>Sorular <b>Türkçeden İspanyolcaya</b>: tanımak değil, üretmek gerekiyor</li>
          <li>Soru sırasında <b>doğru/yanlış gösterilmez</b>, ipucu ve İngilizce yok</li>
          <li>Tüm cevapların ve doğruları <b>sınav sonunda</b> gösterilir</li>
          <li>Geçmek için <b>%${Math.round(GECME_ORANI * 100)}</b> (${Math.ceil(GECME_ORANI * SINAV_ADET)}/${SINAV_ADET}) gerekiyor</li>
        </ul>
        ${ilr.enIyiSkor ? `<p class="aciklama">En iyi sonucun: %${Math.round(ilr.enIyiSkor * 100)}</p>` : ''}
      </section>
      <button class="ana-buton tam basla">Sınava başla →</button>`;
    kok.querySelector('.geri').addEventListener('click', () => uniteEkrani(uid));
    kok.querySelector('.basla').addEventListener('click', () => {
      oturum({ baslik: 'Mini sınav', sinav: true, liste, geri: () => uniteEkrani(uid), bitince: (d, t, k) => sinavBitti(uid, d, t, k) });
    });
  }

  function sinavBitti(uid, d, t, kayitlar) {
    const ilr = uniteIlerleme(uid), oran = d / t, gecti = oran >= GECME_ORANI - 1e-9;
    ilr.enIyiSkor = Math.max(ilr.enIyiSkor || 0, oran);
    const yeniAcildi = gecti && !ilr.tamamlandi;
    if (gecti) { ilr.adimlar.sinav = true; ilr.tamamlandi = true; }
    Depo.kaydet();
    const idx = ICERIK.uniteler.findIndex((u) => u.id === uid), sonraki = idx < 0 ? null : ICERIK.uniteler[idx + 1];   // ek ünitede sonraki yok
    sonucEkrani({
      dogru: d, toplam: t,
      baslik: gecti ? 'Sınavı geçtin! ⭐' : 'Henüz olmadı',
      mesaj: gecti ? (yeniAcildi && sonraki ? `Yeni ünite açıldı: ${sonraki.emoji} ${sonraki.baslik}` : 'Harika iş.') : `Geçmek için %${Math.round(GECME_ORANI * 100)} gerekiyor. Aşağıdaki yanlışlarına bak, kartlara ve alıştırmalara dönüp tekrar dene.`,
      geri: gecti ? anaEkran : () => uniteEkrani(uid),
      ileri: gecti && sonraki ? { ad: `${sonraki.emoji} Sonraki üniteye geç →`, fn: () => uniteEkrani(sonraki.id) } : null,
      detay: kayitlar
    });
  }

  // Kartlarını gördüğün (ya da bitirdiğin) üniteler: genel tekrar bunlardan gelir
  // ekler: true → kartlarına başladığın ek üniteler de (genel tekrar için)
  function calisilanUniteler(ekler) {
    const calisildi = (u) => { const i = Depo.veri.uniteler[u.id]; return i && (i.tamamlandi || i.adimlar.kart); };
    return ICERIK.uniteler.filter(calisildi).concat(ekler ? ICERIK.ekler.filter(calisildi) : []);
  }
  // Şıklarda/tekrarda en fazla buraya kadarki üniteler kullanılır (öğrenmediğin şey sorulmasın) · ek üniteler sayılmaz
  function ustSiraGuncelle() {
    Alistirma.ustSira = calisilanUniteler().reduce((m, u) => Math.max(m, u.sira), 0);
  }

  function tekrarBaslat() {
    ustSiraGuncelle();
    const uniteler = calisilanUniteler(true);
    if (!uniteler.length) return anaEkran();
    const liste = Alistirma.genelTekrar(uniteler, Tekrar.vakitGelenler(), TEKRAR_ADET);
    oturum({ baslik: `🔁 Genel tekrar · Ünite 1–${Alistirma.ustSira}`, liste, geri: anaEkran,
      bitince: (d, t) => sonucEkrani({ dogru: d, toplam: t, baslik: 'Tekrar bitti', geri: anaEkran,
        mesaj: Tekrar.vakitGelenler().length ? `Hâlâ ${Tekrar.vakitGelenler().length} kelimenin tekrar zamanı geldi.` : 'Vakti gelen kelime kalmadı. İstediğin kadar genel tekrar yapabilirsin.',
        ileri: { ad: '🔁 Bir tur daha', fn: tekrarBaslat } }) });
  }

  /* ---------- Sonuç ekranı ---------- */
  function sonucEkrani({ dogru, toplam, baslik, mesaj, geri, ileri, detay }) {
    const oran = toplam ? Math.round((dogru / toplam) * 100) : null;
    kok.innerHTML = `
      <div class="sonuc">
        ${oran !== null ? `<div class="skor ${oran >= GECME_ORANI * 100 ? 'iyi' : ''}"><b>%${oran}</b><span>${dogru}/${toplam} doğru</span></div>` : '<div class="skor iyi"><b>✓</b></div>'}
        <h2>${esc(baslik)}</h2>
        ${mesaj ? `<p>${esc(mesaj)}</p>` : ''}
        <div class="sonuc-butonlar">
          ${ileri ? `<button class="ana-buton ileri">${esc(ileri.ad)}</button>` : ''}
          <button class="${ileri ? 'ikinci-buton' : 'ana-buton'} geri">${ileri ? 'Geri dön' : 'Devam →'}</button>
        </div>
        ${detay && detay.length ? sinavDetay(detay) : ''}
      </div>`;
    kok.querySelector('.geri').addEventListener('click', geri);
    if (ileri) kok.querySelector('.ileri').addEventListener('click', ileri.fn);
    const ilk = kok.querySelector('.ileri') || kok.querySelector('.geri');
    setTimeout(() => ilk.focus(), 30);
    tusAyarla(null);
  }

  function sinavDetay(kayitlar) {
    const yanlis = kayitlar.filter((k) => !k.dogru), dogru = kayitlar.filter((k) => k.dogru);
    const satir = (k) => `
      <div class="detay-satir ${k.dogru ? 'iyi' : 'kotu'}">
        <div class="detay-soru"><span>${k.no}.</span> ${esc(k.soru || '')}</div>
        ${k.dogru
          ? `<div>✓ <b>${esc(k.verilen || '')}</b>${k.uyari ? ` <small>(doğrusu: ${esc(k.dogrusu)})</small>` : ''}</div>`
          : `<div class="senin">✗ Senin cevabın: <s>${esc(k.verilen || '—')}</s></div><div class="dogrusu">✓ Doğrusu: <b>${esc(k.dogrusu || '')}</b></div>`}
      </div>`;
    return `
      <section class="sinav-detay">
        ${yanlis.length ? `<h3>❌ Yanlışların (${yanlis.length})</h3>${yanlis.map(satir).join('')}` : '<h3>Hiç yanlışın yok 🎉</h3>'}
        ${dogru.length ? `<details><summary>✓ Doğruların (${dogru.length})</summary>${dogru.map(satir).join('')}</details>` : ''}
      </section>`;
  }

  /* =========================================================
     AYARLAR
     ========================================================= */
  async function ayarlarEkrani() {
    tusAyarla(null);
    const d = await Depo.durum();
    const son = gunFarki(Depo.veri.ayarlar.sonYedek);
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">⚙️ Ayarlar</div><span></span></header>
      <section class="kutu">
        <h3>💾 Harddiske kaydet</h3>
        <p>${son ? `Son kayıt: <b>${son}</b>` : 'Henüz harddiske kaydedilmedi'}${Depo.klasorAdi() ? ` · klasör: <b>${esc(Depo.klasorAdi())}</b>` : ''}</p>
        <p class="aciklama">İlerlemen tarayıcıda tutulur. <b>Harddiske kaydet</b> dediğinde klasöre <b>ilerleme.json</b> yazılır, ayrıca <b>yedekler</b> klasörüne tarihli bir kopya konur. İzin sadece bu sırada istenir.<br>
        ⚠️ <b>Format atmadan önce mutlaka bir kez kaydet.</b> Format sonrası "Harddisten geri yükle" ile kaldığın yerden devam edersin.</p>
        ${d === 'desteklenmiyor'
          ? `<p class="aciklama">Bu tarayıcı klasöre yazamıyor; kayıt İndirilenler'e iner.</p><button class="ana-buton" id="kaydet">💾 Yedeği indir</button>`
          : `<button class="ana-buton" id="kaydet">💾 Harddiske kaydet</button>
             <button class="ikinci-buton" id="geri-yukle">📂 Harddisten geri yükle</button>
             ${Depo.klasorAdi() ? '<button class="ikinci-buton" id="klasor-degistir">Farklı klasör seç</button>' : ''}`}
        <label class="ikinci-buton dosya-sec">⬆️ Yedek dosyası yükle<input type="file" accept=".json,application/json" id="yukle" hidden></label>
        <p class="aciklama" id="yedek-not">${Depo.sonHata ? '⚠️ Son yazma başarısız: ' + esc(Depo.sonHata.message || '') : ''}</p>
      </section>
      <section class="kutu">
        <h3>📊 Zorluk puanları</h3>
        <label class="satir"><input type="checkbox" id="puanlama" ${puanlamaAcik() ? 'checked' : ''}> Alıştırmalarda her cevaptan sonra <b>1 kolay · 2 orta · 3 zor</b> düğmelerini göster</label>
        <p class="aciklama">${Puan.liste().length} cevap kayıtlı, ${Puan.liste().filter((r) => r.p).length} tanesi puanlı. Bu veriler ilerleme.json'a da yazılır.</p>
        <button class="ikinci-buton" id="rapor">📊 Zorluk raporunu aç</button>
      </section>
      <section class="kutu">
        <h3>🇬🇧 İngilizce karşılıklar</h3>
        <label class="satir"><input type="checkbox" id="ingilizce" ${ingilizce() ? 'checked' : ''}> Kartlarda ve cevaptan sonra İngilizcesini de göster</label>
      </section>
      <section class="kutu">
        <h3>🔊 Sesli okuma</h3>
        ${Ses.sesVar() ? `
          <label class="satir"><input type="checkbox" id="ses-acik" ${Ses.ayar().ses !== false ? 'checked' : ''}> Sesli okuma ve dinleme alıştırmaları açık</label>
          <label class="satir"><input type="checkbox" id="oto-oku" ${Ses.ayar().otoOku !== false ? 'checked' : ''}> Kartlarda ve cevaptan sonra otomatik oku</label>
          <label class="satir">Ses: <select id="ses-sec">${Ses.sesler.map((v) => `<option value="${esc(v.name)}" ${Ses.secili() && Ses.secili().name === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>
          <label class="satir">Hız: <select id="ses-hiz">
            ${[[0.7, 'Yavaş'], [0.9, 'Normal'], [1.05, 'Hızlı']].map(([h, a]) => `<option value="${h}" ${(Ses.ayar().sesHiz || 0.9) === h ? 'selected' : ''}>${a}</option>`).join('')}
          </select></label>
          <button class="ikinci-buton" id="ses-dene">▶️ Dene</button>`
        : `<p>Bilgisayarında İspanyolca ses bulunamadı, ses özellikleri gizli.</p>
           <p class="aciklama">Kurmak için: Windows <b>Ayarlar → Saat ve dil → Konuşma → Sesleri yönet → Ses ekle → Español (México)</b>. Kurduktan sonra tarayıcıyı tamamen kapatıp aç.</p>`}
      </section>
      <section class="kutu tehlike">
        <h3>🗑️ İlerlemeyi sıfırla</h3>
        <p class="aciklama">Tüm ilerleme silinir. Önce yedek indirmen önerilir.</p>
        <button class="tehlike-buton" id="sifirla">Sıfırla</button>
      </section>
      <p class="surum">İspanyolca v2.1 (A1, 27 ünite) · veri formatı ${Depo.veri.surum}</p>`;
    kok.querySelector('.geri').addEventListener('click', anaEkran);
    kok.querySelector('#puanlama').addEventListener('change', (e) => { Depo.veri.ayarlar.puanlama = e.target.checked; Depo.kaydet(); });
    kok.querySelector('#rapor').addEventListener('click', raporEkrani);
    kok.querySelector('#ingilizce').addEventListener('change', (e) => { Depo.veri.ayarlar.ingilizce = e.target.checked; Depo.kaydet(); });
    if (Ses.sesVar()) {
      const kaydetAyar = (k, v) => { Ses.ayar()[k] = v; Depo.kaydet(); };
      kok.querySelector('#ses-acik').addEventListener('change', (e) => kaydetAyar('ses', e.target.checked));
      kok.querySelector('#oto-oku').addEventListener('change', (e) => kaydetAyar('otoOku', e.target.checked));
      kok.querySelector('#ses-sec').addEventListener('change', (e) => { kaydetAyar('sesAdi', e.target.value); Ses.oku('Hola, ¿cómo estás?'); });
      kok.querySelector('#ses-hiz').addEventListener('change', (e) => { kaydetAyar('sesHiz', +e.target.value); Ses.oku('Hola, ¿cómo estás?'); });
      kok.querySelector('#ses-dene').addEventListener('click', () => Ses.oku('Hola, me llamo Ana. ¿Cómo te llamas?'));
    }
    const not = kok.querySelector('#yedek-not');
    const hataYaz = (e) => { if (e && e.name === 'AbortError') return; not.textContent = '⚠️ ' + (e.message || e); };
    kok.querySelector('#kaydet').addEventListener('click', async () => {
      try {
        if (d === 'desteklenmiyor') { const r = await Depo.yedekIndir(); Depo.veri.ayarlar.sonYedek = Date.now(); Depo.kaydet(); not.innerHTML = `✓ İndirildi: <b>${esc(r.ad)}</b>`; return; }
        const r = await Depo.harddiskeKaydet();
        if (r.yuklendi) { alert('Tarayıcıda ilerleme yoktu; harddiskteki ilerlemen yüklendi.'); return anaEkran(); }
        await ayarlarEkrani();
        kok.querySelector('#yedek-not').innerHTML = `✓ Kaydedildi: <b>ilerleme.json</b> + <b>${esc(r.ad)}</b>`;
      } catch (e) { hataYaz(e); }
    });
    const gy = kok.querySelector('#geri-yukle');
    if (gy) gy.addEventListener('click', async () => {
      if (!confirm('Tarayıcıdaki ilerlemenin yerine harddiskteki ilerleme.json yüklensin mi?')) return;
      try { await Depo.harddistenYukle(); alert('Harddiskteki ilerleme yüklendi.'); anaEkran(); } catch (e) { hataYaz(e); }
    });
    const kd = kok.querySelector('#klasor-degistir');
    if (kd) kd.addEventListener('click', async () => { try { await Depo.klasorDegistir(); ayarlarEkrani(); } catch (e) { hataYaz(e); } });
    kok.querySelector('#yukle').addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (!confirm('Mevcut ilerlemenin yerine bu yedek yüklensin mi?')) return;
      try { await Depo.yedekYukle(f); alert('Yedek yüklendi.'); anaEkran(); }
      catch (err) { alert('Yüklenemedi: ' + err.message); }
    });
    kok.querySelector('#sifirla').addEventListener('click', async () => {
      if (!confirm('Tüm ilerleme silinsin mi? Bu geri alınamaz.')) return;
      await Depo.sifirla(); anaEkran();
    });
  }

  /* =========================================================
     ÖZET TABLOLAR: açık ünitelere kadar zamirler, artikeller, çekimler, tüm kelimeler
     ========================================================= */
  function ozetEkrani() {
    tusAyarla(null);
    const acikSira = ICERIK.uniteler.reduce((m, u, i) => (uniteAcikMi(i) ? Math.max(m, u.sira) : m), 1);
    const sira = (uid) => (ICERIK.bul(uid) || { sira: 99 }).sira;
    const acikMi = (uid) => sira(uid) <= acikSira;
    // İspanyolca metne tıklayınca okunur (ayrı ses düğmesi yok)
    const satirli = (m) => esc(m).replace(/\n/g, '<br>');
    const sesli = (m) => String(m).split('\n').map((t) => (Ses.aktif() ? `<span class="oku" data-ses="${esc(t.replace(/ \/ /g, ', '))}" title="Dinlemek için tıkla">${esc(t)}</span>` : esc(t))).join('<br>');
    const uniteEtiket = (uid) => `<small class="unite-etiket">Ü${sira(uid)}</small>`;
    // örnek soru–cevap (ICERIK.ornekler): [soru, cevap, tr soru, tr cevap, ünite] → iki hücre (İspanyolca, Türkçe)
    const ORN = ICERIK.ornekler || { fiil: {}, soru: {} };
    const ornek = (o) => (o && acikMi(o[4]) ? o : null);
    const scHucre = (o) => o
      ? `<td class="es sc">${sesli(o[0])}<br><span class="cevap">↳ ${sesli(o[1])}</span></td><td class="tr sc">${esc(o[2])}<br><span class="cevap">↳ ${esc(o[3])}</span></td>`
      : '<td class="bos">–</td><td class="bos"></td>';
    // 1) sabit tablolar (icerik/ozet.js)
    const tablolar = (ICERIK.ozet || []).map((t) => {
      const satirlar = t.satirlar.filter((s) => acikMi(s.at(-1)));
      if (!satirlar.length) return '';
      const esMi = (i) => (t.es ? t.es.includes(i) : t.sutunlar[0] === 'İspanyolca' ? i === 0 : i > 0);
      const orn = t.ornek ? ORN[t.ornek] || {} : null;   // tablo örnek soru–cevap sütunları alıyor mu?
      return `<section class="kutu ozet-kutu"><h3>${t.baslik}</h3><table class="ozet-tablo">
        <tr>${t.sutunlar.map((c) => `<th>${esc(c)}</th>`).join('')}${orn ? '<th>💬 sık duyacağın soru ↳ cevap</th><th>Türkçe</th>' : ''}<th></th></tr>
        ${satirlar.map((s) => `<tr>${s.slice(0, -1).map((c, i) => `<td class="${esMi(i) ? 'es' : ''}">${esMi(i) ? sesli(c) : satirli(c)}</td>`).join('')}${orn ? scHucre(ornek(orn[s[0]])) : ''}<td>${uniteEtiket(s.at(-1))}</td></tr>`).join('')}
      </table></section>`;
    }).join('');
    // 2) KİŞİ TABLOSU: her satır bir kişi; zamir + sahiplik + gustar + dönüşlü + tüm fiil çekimleri yan yana
    const KT = ICERIK.kisiTablosu;
    const kisiler = KT.kisiler.filter((x) => acikMi(x.uid));
    const gruplar = KT.gruplar.map((g) => ({ ...g, sutunlar: g.sutunlar.filter((c) => kisiler.some((x) => c[x.k] && acikMi(c[x.k][1]))) })).filter((g) => g.sutunlar.length);
    const fiiller = ICERIK.uniteler.filter((u) => u.sira <= acikSira).flatMap((u) => (u.cekimler || []).map((c) => ({ ...c, uid: u.id })));
    const hucre = (c, x) => { const v = c[x.k]; if (!v || !acikMi(v[1])) return '<td class="bos">–</td>'; return c.tr ? `<td class="tr">${satirli(v[0])}</td>` : `<td class="es">${sesli(v[0])}</td>`; };
    const kisiHtml = kisiler.length ? `<section class="kutu ozet-kutu"><h3>🧑 Kişilere göre: zamir, sahiplik, fiiller</h3>
      <p class="aciklama">Her satır bir kişi. Sağa kaydırınca öğrendiğin tüm fiillerin çekimi gelir; ilk iki sütun yerinde kalır.</p>
      <div class="tablo-kaydir"><table class="kisi-tablo">
        <tr class="grup-satir"><th class="sabit s1" colspan="2">Kişi</th>
          ${gruplar.map((g) => `<th colspan="${g.sutunlar.length}" class="grup-bas">${g.baslik}</th>`).join('')}
          ${fiiller.length ? `<th colspan="${fiiller.length}" class="grup-bas">🔧 Fiiller (şimdiki zaman)</th>` : ''}</tr>
        <tr><th class="sabit s1">Türkçe</th><th class="sabit s2">İspanyolca</th>
          ${gruplar.map((g) => g.sutunlar.map((c, i) => `<th class="${i === 0 ? 'grup-ilk' : ''}">${esc(c.ad)}</th>`).join('')).join('')}
          ${fiiller.map((f, i) => `<th class="fiil-bas ${i === 0 ? 'grup-ilk' : ''}">${esc(f.fiil)}<small>${esc(f.tr)} · Ü${sira(f.uid)}</small></th>`).join('')}</tr>
        ${kisiler.map((x) => `<tr><td class="sabit s1 tr">${satirli(x.tr)}</td><td class="sabit s2 es">${sesli(x.es)}</td>
          ${gruplar.map((g) => g.sutunlar.map((c, i) => hucre(c, x).replace('<td class="', `<td class="${i === 0 ? 'grup-ilk ' : ''}`)).join('')).join('')}
          ${fiiller.map((f, i) => `<td class="es ${i === 0 ? 'grup-ilk' : ''}">${sesli(f[x.k])}</td>`).join('')}</tr>`).join('')}
      </table></div></section>` : '';
    // 2b) her fiille bir soru–cevap (kişi tablosunun hemen altında)
    // bir fiilin tek örneği [..] ya da birden fazla örneği [[..], [..]] olabilir
    const fiilOrn = fiiller.flatMap((f) => { const v = ORN.fiil[f.fiil]; if (!v) return []; return (Array.isArray(v[0]) ? v : [v]).filter((o) => acikMi(o[2])).map((o) => ({ f, o })); });
    // sahiplikle basit cümleler
    const sahip = (ORN.sahip || []).filter((x) => acikMi(x[3]));
    const sahipHtml = sahip.length ? `<section class="kutu ozet-kutu"><h3>👜 Sahiplikle basit cümleler</h3>
      <table class="ozet-tablo sc-tablo"><tr><th>Sahiplik</th><th>Cümle</th><th>Türkçe</th><th></th></tr>
        ${sahip.map((x) => `<tr><td class="es">${sesli(x[0])}</td><td class="es sc">${sesli(x[1])}</td><td class="tr">${esc(x[2])}</td><td>${uniteEtiket(x[3])}</td></tr>`).join('')}
      </table></section>` : '';
    const fiilOrnHtml = fiilOrn.length ? `<section class="kutu ozet-kutu"><h3>💬 Her fiille bir cümle</h3>
      <p class="aciklama">Basit, gezerken işine yarayacak cümleler. Tıklayınca okunur.</p>
      <div class="tablo-kaydir"><table class="ozet-tablo sc-tablo">
        <tr><th>Fiil</th><th>Cümle</th><th>Türkçe</th><th></th></tr>
        ${fiilOrn.map(({ f, o }, i) => `<tr>${i && fiilOrn[i - 1].f === f ? '<td></td>' : `<td class="es">${sesli(f.fiil)}<br><small class="fiil-tr">${esc(f.tr)}</small></td>`}<td class="es sc">${sesli(o[0])}</td><td class="tr">${esc(o[1])}</td><td>${uniteEtiket(o[2])}</td></tr>`).join('')}
      </table></div></section>` : '';
    // 3) tüm kelimeler, ünite ünite, aranabilir
    const uniteler = ICERIK.uniteler.filter((u) => u.sira <= acikSira);
    const kelimeHtml = `<section class="kutu ozet-kutu"><h3>📖 Tüm kelimeler (${uniteler.reduce((a, u) => a + u.kelimeler.filter((k) => k.yazma !== false).length, 0)})</h3>
      <input type="search" class="ozet-ara" placeholder="Ara: İspanyolca ya da Türkçe…" autocomplete="off">
      ${uniteler.map((u) => `<details class="ozet-unite" ${u.sira === acikSira ? 'open' : ''}><summary>${u.emoji} ${u.sira}. ${esc(u.baslik)}</summary>
        <table class="kelime-tablo">${u.kelimeler.filter((k) => k.yazma !== false).map((k) => `<tr data-ara="${esc((k.es + ' ' + k.tr + ' ' + (k.en || '')).toLocaleLowerCase('tr'))}"><td>${Ses.okunurMu(k) ? sesli(k.es) : esc(k.es)}</td><td>${esc(k.tr)}</td></tr>`).join('')}</table>
      </details>`).join('')}</section>`;
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">📚 Özet tablolar</div><span></span></header>
      <p class="aciklama">Ünite ${acikSira}’e kadar öğrendiklerin. Yeni ünite açtıkça tablolar büyür. <b>Ü</b> = öğretildiği ünite.</p>
      ${kisiHtml}${sahipHtml}${fiilOrnHtml}${tablolar}${kelimeHtml}`;
    kok.classList.add('genis');
    kok.querySelector('.geri').addEventListener('click', () => { kok.classList.remove('genis'); anaEkran(); });
    kok.querySelectorAll('.oku').forEach((b) => b.addEventListener('click', () => {
      Ses.oku(b.dataset.ses); b.classList.add('caliyor'); setTimeout(() => b.classList.remove('caliyor'), 700);
    }));
    const ara = kok.querySelector('.ozet-ara');
    ara.addEventListener('input', () => {
      const q = ara.value.trim().toLocaleLowerCase('tr');
      kok.querySelectorAll('.ozet-unite').forEach((d) => {
        let n = 0;
        d.querySelectorAll('tr').forEach((tr) => { const g = !q || tr.dataset.ara.includes(q); tr.hidden = !g; if (g) n++; });
        d.hidden = q && !n; if (q && n) d.open = true;
      });
    });
  }

  /* =========================================================
     ZORLUK RAPORU (Ayarlar → Zorluk raporu)
     ========================================================= */
  function raporEkrani() {
    tusAyarla(null);
    const r = Puan.rapor();
    const yuzde = (x) => `%${Math.round(x * 100)}`;
    const ort = (x) => (x.ort ? x.ort.toFixed(1) : '–');
    const dagilim = (x) => (x.puanN ? `<span class="dagilim"><i class="p1" style="flex:${x.p[1]}"></i><i class="p2" style="flex:${x.p[2]}"></i><i class="p3" style="flex:${x.p[3]}"></i></span>` : '');
    const tablo = (satirlar, ad) => `<table class="rapor-tablo"><tr><th>${ad}</th><th>cevap</th><th>doğru</th><th>puan</th><th></th></tr>${satirlar.join('')}</table>`;
    kok.innerHTML = `
      <header class="ust"><button class="ikon geri">←</button><div class="ust-baslik">📊 Zorluk raporu</div><span></span></header>
      ${!r.toplam ? '<p class="aciklama">Henüz kayıtlı cevap yok. Alıştırma yaptıkça burası dolacak.</p>' : `
      <section class="istatistik">
        <div><b>${r.toplam}</b><span>cevap</span></div>
        <div><b>${r.puanli}</b><span>puanlı</span></div>
        <div><b>${r.ort ? r.ort.toFixed(1) : '–'}</b><span>ortalama puan</span></div>
      </section>
      <section class="kutu"><h3>🔥 En zor sorular</h3>
        <p class="aciklama">Verdiğin puana ve yanlış oranına göre sıralı. Bunlar tekrarda daha sık gelir.</p>
        ${tablo(r.sorular.slice(0, 25).map((x) => `<tr><td>${esc(Puan.etiket(x.a))}</td><td>${x.n}</td><td>${yuzde(x.oran)}</td><td>${ort(x)}</td><td>${dagilim(x)}</td></tr>`), 'Soru')}
      </section>
      <section class="kutu"><h3>🧩 Soru türlerine göre</h3>
        ${tablo(r.turler.map((x) => `<tr><td>${esc(Puan.TUR_ADI[x.a] || x.a)}</td><td>${x.n}</td><td>${yuzde(x.oran)}</td><td>${ort(x)}</td><td>${dagilim(x)}</td></tr>`), 'Tür')}
      </section>
      <section class="kutu"><h3>📚 Ünitelere göre</h3>
        ${tablo(r.uniteler.map((x) => { const u = ICERIK.bul(x.a); return `<tr><td>${u ? `${u.sira}. ${esc(u.baslik)}` : esc(x.a)}</td><td>${x.n}</td><td>${yuzde(x.oran)}</td><td>${ort(x)}</td><td>${dagilim(x)}</td></tr>`; }), 'Ünite')}
      </section>
      <p class="aciklama">Renkler: <span class="p1-renk">■ kolay</span> <span class="p2-renk">■ orta</span> <span class="p3-renk">■ zor</span>.
      İçeriği bu verilere göre güncellemek için Ayarlar → <b>Harddiske kaydet</b> de ve <b>ilerleme.json</b> dosyasını Claude'a gönder.</p>`}`;
    kok.querySelector('.geri').addEventListener('click', ayarlarEkrani);
  }

  /* ---------- başlat ---------- */
  Depo.dinle(() => { /* kayıt durumu değişince ana ekrandaysak yenilenebilir */ });
  Promise.all([Depo.baslat(), Ses.baslat()]).then(anaEkran);
  window.addEventListener('beforeunload', () => { Depo._yazHepsi(); });
})();
