/* =========================================================
   TELEFONA KURULUM (PWA) VE GÜNCELLEME ŞERİDİ
   Yalnızca https'te (GitHub Pages) çalışır; file:// ile açılışta hiçbir şey yapmaz.
   - sw.js'yi kaydeder (çevrimdışı çalışma)
   - yeni sürüm inince altta değil üstte "🔄 Yeni sürüm hazır · Yenile" şeridi gösterir;
     sayfa kendiliğinden yenilenmez (alıştırma yarıda kalmasın)
   - tarayıcıdan kalıcı depolama ister (iOS ilerlemeyi silmesin)
   ========================================================= */
(function () {
  'use strict';

  const PWA = { surum: null, aktif: false };
  window.PWA = PWA;

  const uygun = 'serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  if (!uygun) return;
  PWA.aktif = true;

  function seritGoster(bekleyen) {
    if (document.querySelector('.surum-serit')) return;
    const s = document.createElement('div');
    s.className = 'surum-serit';
    s.innerHTML = '<span>🔄 Yeni sürüm hazır</span><button type="button">Yenile</button>';
    s.querySelector('button').addEventListener('click', () => {
      s.querySelector('button').disabled = true;
      yenilemeIstendi = true;
      bekleyen.postMessage('atla');
    });
    document.body.appendChild(s);
  }

  // "Yenile"ye basıldıysa, yeni sürüm devreye girince bir kez yenile.
  // (İlk kurulumda da controllerchange gelir; o zaman sayfa yenilenmemeli.)
  let yenilemeIstendi = false, yenilendi = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!yenilemeIstendi || yenilendi) return; yenilendi = true; location.reload();
  });

  function surumuSor() {
    const c = navigator.serviceWorker.controller;
    if (!c) return;
    const kanal = new MessageChannel();
    kanal.port1.onmessage = (e) => { PWA.surum = e.data; };
    c.postMessage('surum', [kanal.port2]);
  }

  window.addEventListener('load', async () => {
    try {
      const kayit = await navigator.serviceWorker.register('sw.js');
      surumuSor();
      // ilk kurulumda (controller yokken) şerit gösterme; yalnızca güncellemede
      if (kayit.waiting && navigator.serviceWorker.controller) seritGoster(kayit.waiting);
      kayit.addEventListener('updatefound', () => {
        const yeni = kayit.installing;
        if (!yeni) return;
        yeni.addEventListener('statechange', () => {
          if (yeni.state === 'installed' && navigator.serviceWorker.controller) seritGoster(yeni);
        });
      });
      // Ana ekrandaki uygulama arka plandan dönünce sayfa yenilenmez; güncellemeyi o an da kontrol et
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') kayit.update().catch(() => {});
      });
    } catch (e) { /* service worker kurulamadıysa uygulama yine çalışır */ }

    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* yoksay */ }
  });
})();
