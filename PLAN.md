# İspanyolca — Proje Planı ve Kararlar

Kişisel kullanım için İspanyolca öğrenme uygulaması. Bu dosya, hangi kararın neden alındığını kaydeder.

## Hedef
- Sıfırdan başlayıp **A1–A2** seviyesine çıkmak
- **Genel Güney Amerika** İspanyolcası (ustedes, s okunan c/z); ülkeye özgü kelimeler (Kolombiya, Arjantin, Peru, Şili) ipucu olarak
- Asıl hedef: Kolombiya ve Güney Amerika'da tatil, yeni insanlarla tanışmak, eğlenmek (Brezilya'da Portekizce konuşulur, şimdilik kapsam dışı)
- Amaç: **tatil + sosyal hayat**: restoran, bar, tanışma ve iltifat, gezme, ulaşım, konaklama, sağlık, güvenlik
- Kullanım: düzensiz (ne zaman vakit olursa)

## Altyapı kararları
| Karar | Neden |
|---|---|
| İnternetsiz, tek klasör, düz HTML/CSS/JS | Claude hesabına / internete / sunucuya bağımlı olmasın; kurulum gerektirmesin. `file://` ile açılış hâlâ çalışır |
| Ayrıca GitHub Pages'te yayın + PWA (Kasım 2026) | Telefonda (iPhone) ana ekrana eklenip çevrimdışı kullanılsın; ayrıntılar `TELEFON_PLANI.md` |
| Senkron: gizli GitHub Gist, birleştirerek (`js/senkron.js`) | Bilgisayar ve telefon aynı ilerlemeyi paylaşsın; anahtar yalnızca cihazda, isteğe bağlı |
| Cihaz ayarları ayrı (`Cihaz`: telefon modu, özet görünümü, senkron anahtarı) | Telefonun ayarı senkronla bilgisayara taşınmasın |
| İlerleme tarayıcıda tutulur; Ayarlar → "Harddiske kaydet" ile klasördeki `ilerleme.json`'a yazılır | Her açılışta izin sorulmasın (kullanıcı isteği); izin sadece kaydederken istenir. Format öncesi bir kez kaydetmek yeterli |
| `ilerleme.onceki.json` bir önceki kayıt | Dosya bozulursa geri dönülebilsin |
| Tarayıcı içi önbellek + Yedek indir/yükle | Klasöre yazılamazsa da veri kaybolmasın |
| Kayıt katmanı ayrı (`js/storage.js`, "sürücüler") | İleride bulut/telefon senkronu eklemek için sadece yeni sürücü yazılır |
| Yapay zekâ modülü ayrı ve kapalı (`js/ai.js`) | İleride Claude eklenirse altyapı değişmesin; internet yoksa gizlenir |
| Sesli okuma (`js/ses.js`) Windows'un İspanyolca sesiyle | İnternet gerekmez; ses yoksa ses özellikleri otomatik gizlenir |
| Veri formatı sürümlü (`surum` alanı) | Yeni özelliklerde eski ilerleme otomatik dönüştürülür |
| İçerik (`icerik/`) ile ilerleme ayrı | Ders eklemek/değiştirmek ilerlemeyi bozmaz |
| Klasör: `D:\1-Harddisk\Claude Apps\ispanyolca` | Başlangıç için; OneDrive/Drive'a taşımak kod değişikliği gerektirmez |
| Tarayıcı: Vivaldi (Chromium) | Klasöre otomatik kayıt Chromium tabanlı tarayıcılarda çalışır |

## Öğrenme yapısı
- Konu konu **üniteler**, **kilitli** (biri bitince sonraki açılır)
- Her ünite: 📝 Kısa not (+ gruplu kelime listesi) → 🃏 Kelime kartları → 🎯 Alıştırmalar (10) → ✅ Mini sınav (her kelime en az 1 kez)
- Sınav geçme oranı: **%85**
- Mini sınav (zor): ünitedeki her kelime en az bir kez (türler kelimeler arasında dağıtılır) + cümle soruları (≈ kelime sayısı + 6 soru), ağırlıkla üretim (TR→ES yazma, cümle kurma, boşluk/diyalog, dinle-yaz); eşleştirme ve ES→TR tanıma yok; soru sırasında doğru/yanlış, ipucu ve İngilizce gösterilmez; tüm cevaplar ve doğrular sınav sonunda listelenir
- 🔁 **Tekrar**: kutu sistemi (doğru → daha seyrek, yanlış → başa döner); vakti gelen kelimeleri sorar
- Alıştırma türleri: çoktan seçmeli (iki yönlü), eşleştirme, süreli eşleştirme (40 sn), yazma, cümle kurma, boşluk doldurma, 💬 diyalog tamamlama (kelime bankası, tüm boşluklar), 🎧 dinle-seç, 🎧 dinle-yaz, 🎧 cümle dinle → anlamını seç / cümleyi kur
- Ünite alıştırması: kelime sayısına göre 12–25 soru, her türden en az biri; aynı kelime farklı türlerde gelebilir ama aynı soru tekrar gelmez
- 🗣️ Okunuş soruları (Ünite 1): anlamı + okunuşu verilen kelimenin doğru yazılışı; "hangi kelimede … sesi var?"
- 🔁 Genel tekrar: önce vakti gelen kelimeler, kalanı kartlarını gördüğün tüm ünitelerden rastgele her türden alıştırma
- **Kural:** bir ünitede henüz öğretilmemiş kelime sorulmaz; şıklar sadece öğrenilmiş ünitelerden gelir (kontrol scripti ile denetlendi)
- Ses: kartlarda 🔊 + otomatik okuma, cevaptan sonra İspanyolcası okunur, sınavda 2 dinleme sorusu (ses varsa)
- Artikelli kelimeler (el padre) artikelsiz yazılırsa doğru sayılır ama hatırlatılır
- Yazmada aksan/ñ hatası **doğru sayılır ama uyarılır**; ekranda á é í ó ú ñ ü ¿ ¡ butonları
- Oyunlaştırma yok (puan/seri/rozet yok); sadece basit istatistik: tamamlanan ünite, öğrenilen kelime, tekrar bekleyen
- Görünüm: sade ama renkli, **koyu tema**, telefona uyumlu
- Kelime kartlarında "Tekrar göster" yok, sadece "Sonraki" (tekrar işini Tekrar bölümü yapıyor)
- Harddiske kaydet → `ilerleme.json` + `yedekler\` içine tarih-saat adıyla kopya; "Harddisten geri yükle" ile format sonrası geri alınır
- Ana ekranda izin bandı yok, sadece altta küçük "son harddisk kaydı" yazısı

## Ünite listesi (A1, 27 ünite) — v3 (Kasım 2026): fiiller ünitelere dağıtıldı
1 Alfabe ve telaffuz · 2 Selamlaşma ve tanışma (+ hablar, también, porque) · 3 Sayılar 0–20 (+ tener, otro, más) ·
4 Ser: kim, nereli (+ trabajar, vivir; artikel, sahiplik) · 5 Estar: nerede, nasıl (+ hoy, ahora) · 6 Restoranda (+ querer, comer, beber, este/esta) ·
7 Bar ve gece hayatı (+ tomar, bailar, siempre/nunca) · 8 Yeni insanlar (+ salir, poder, ver, cuando, entonces) · 9 Sayılar 21+, para (+ pagar, necesitar) ·
10 Saat (+ ir, llegar, todavía) · 11 Yön ve ulaşım (+ buscar, saber) · 12 Otel (+ esperar, quedarse, problema) · 13 Ev ve adres (+ abrir, cerrar, llamar) ·
14 Gezme (+ conocer, visitar, hacer) · 15 Renkler ve sıfatlar (+ karşılaştırma: más … que, mejor, mismo) · 16 Alışveriş (+ comprar, probar) ·
17 Sağlık (+ sentirse, ayudar) · 18 Güvenlik (+ perder, encontrar, olvidar) · 19 Tarih (+ volver) · 20 Aile · 21 Eşyalar (artikel, çoğul) ·
22 Market (+ dar, poner) · 23 Fiil kuralları: -ar/-er/-ir özeti (+ estudiar, aprender, escribir, leer, escuchar) ·
24 4 sihirli kalıp (quiero / puedo / tengo que / voy a + mastar) + decir, venir, traer · 25 Gustar ve boş zaman (+ pensar, creer) · 26 Günlük rutin · 27 Hava durumu
- v3 kararı: çekimi öğretilen fiil 22. üniteye kadar 3'ten ~35'e çıktı; sohbetin yapıştırıcı kelimeleri (porque, también, otro, hoy, siempre…) öne alındı;
  tatil için az kullanılan kelimeler silindi (avukat, satıcı, encima/debajo de…, salon, ayna, deneme kabini, büyükelçilik…)

**A2 (sonra):** geçmiş zaman (pretérito), şimdiki sürekli (estoy hablando), karşılaştırma, emir kipi, iş ve resmî işler

## v2.0 eklemeleri (Kasım 2026)
- A1 kelime sayısı ~200'den ~750'ye çıkarıldı (v2.1: genel Güney Amerika kelimeleri, tatil konuları öne, bar / iltifat / gezme / güvenlik üniteleri, binlerle fiyat); Ünite 1 kelimeleri konuya göre yeniden seçildi, erkek/kadın çiftleri tamamlandı
- Yeni soru türleri: 🔧 fiil çekimi (yazma / seçme), artikel seçme (el/la/los/las, 5. üniteden), çoğul yapma (21. üniteden),
  💬 soru–cevap (doğru cevabı seç, sesli de olabilir; eşleştirme), 🎧 dinle → rakamla yaz (sayı, saat, fiyat, telefon)
- Ünite verisine yeni alanlar: `soruCevap`, `cekimler`, `rakam`, kelimede `cogul` (düzensiz çoğul / çoğulu sorulmasın)
- **Zorluk puanı:** alıştırma ve tekrarda her cevaptan sonra 1 kolay · 2 orta · 3 zor (klavye 1/2/3). Tüm cevaplar
  `puanlar` günlüğüne yazılır (ilerleme.json'a da gider). 3 zor → kelime daha erken tekrar; 1 kolay + doğru → daha seyrek.
  Zor bulunan kelime ve türler alıştırmada öne alınır. Ayarlar → 📊 Zorluk raporu. Analiz için ilerleme.json Claude'a gönderilir.

## v2.2 eklemeleri (Kasım 2026)
- **Birikimli fiil çekimi:** ünite alıştırmasında yarı yarıya o ünitenin, kalanı açılmış tüm ünitelerin fiilleri; fiili olmayan ünitelerde de önceki fiiller (daha seyrek) sorulur
- **Yeni soru türleri** (js/uretici.js): 🔧 cümle içinde çekim (cümledeki fiil boş, fiil · kişi ipucu; yazma/seçme) · ⚖️ ser mi estar mı? ·
  ✍️ Türkçe cümle → İspanyolca yaz (💡 kelimeleri göster; özne zamiri eklense de atılsa da doğru) · 🔍 cümle doğru mu yanlış mı
  (bozma: ser↔estar, özne belliyken yanlış kişi, el↔la) · 🎧 soruyu dinle → cevabı seç artık ayrı tür (sc_dinle)
- **Şablon cümleler** (icerik/sablonlar.js): "Quiero un/una X, por favor · ¿Dónde está el/la X? · ¿Hay un/una X cerca? · ¿Cuánto cuesta…? ·
  ¿Tienen X? · Me gusta mucho… · Necesito…" kalıplarına ünitenin isimleri yerleştirilir; cümle kurma, çeviri, dinleme ve doğru/yanlışta
  ünitenin kendi cümleleriyle karışık (%40) kullanılır. Kalıp ve isim, öğretildiği ünite açılınca devreye girer
- **Ek üniteler** (ek: true, sira 100+): kilitsiz, ünite sırasını etkilemez, ana sayfada Özet tabloların altında. Genel tekrara kartları
  görülünce girer. 🧠 İspanyolca trickleri (x01) · 🇨🇴 Sokak dili: Kolombiya (x02)

## Yol haritası
1. ✅ v1: altyapı + ilk 3 ünite
2. ✅ v1.1: Ünite 4–7 + sesli okuma ve dinleme alıştırmaları
3. ✅ v1.4: Ünite 8–14 (A1 tamamlandı) · tüm kelimelerde İngilizce karşılık
4. ✅ v1.5: içerik denetimi, boşluk doldurma + diyaloglar, cümle dinleme, genel tekrar
5. ✅ v2.0–2.1: A1 genişletildi (27 ünite, Güney Amerika odaklı), yeni soru türleri, zorluk puanı ve raporu
6. ✅ v2.2: soru çeşitliliği (birikimli çekim, cümle içinde çekim, ser/estar, çeviri, doğru/yanlış, şablon cümleler) + ek üniteler
7. ✅ v2.3 (Kasım 2026): telefon — GitHub Pages + PWA, 📱 telefon modu (harf/kelime taşları), gizli Gist senkronu (veri sürümü 2), 🃏 mini kart, Scriptable ana ekran widget'ı, 806/809 kelimeye örnek cümle (`icerik/kelime-cumleleri.js`). Ayrıntılar `TELEFON_PLANI.md`
8. (Yapılacak) A2 üniteleri
9. (İsteğe bağlı) Yapay zekâ: cümle düzeltme, sohbet pratiği

## Dosya yapısı
```
index.html            uygulama (çift tıkla)
css/style.css         görünüm
js/storage.js         kayıt katmanı (sürücüler, yedek)
js/srs.js             akıllı tekrar
js/puan.js            cevap günlüğü, 1–3 zorluk puanı, zorluk raporu verisi
js/alistirmalar.js    alıştırma türleri ve oturum üreticileri
js/uretici.js         şablon cümleler, birikimli çekim, yeni türler (cümlede çekim, ser/estar, çeviri, doğru/yanlış)
js/app.js             ekranlar
js/ses.js             sesli okuma
js/ai.js              yapay zekâ (kapalı)
js/widget.js          öğrenilen kelimeler + örnek cümle (mini kart, widget), widget.json
js/senkron.js         ☁️ Gist senkronu + birleştirme
js/pwa.js · sw.js     telefona kurulum, çevrimdışı önbellek, "yeni sürüm" şeridi
widget/               iPhone widget'ı (Scriptable, siteden indirilir)
icerik/icerik.js      içerik kaydı + ünite biçimi açıklaması
icerik/uXX-*.js       üniteler
icerik/xXX-*.js       ek üniteler (kilitsiz)
icerik/sablonlar.js   cümle şablonları
icerik/kelime-cumleleri.js  kelime örnek cümleleri
denetim.js · cumle-hazirlik.js  içerik denetimi · cümle hazırlık listesi
ilerleme.json         senin ilerlemen (ilk kayıtta oluşur; depoya girmez)
```
Ayrıntılı ve güncel dosya listesi: `CLAUDE.md`.
