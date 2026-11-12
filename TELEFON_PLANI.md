# Telefon (iPhone) planı: kararlar ve adımlar

Kasım 2026'da claude.ai sohbetinde kararlaştırıldı. Her adıma başlamadan önce kullanıcıdan onay alınır.

> **Durum (13 Kasım 2026): tüm adımlar tamamlandı ve yayında.** Plandan sapmalar ve uygulamadaki ayrıntılar en alttaki **"Yapılanlar"** bölümünde.

## Hedef
Uygulama iPhone'da da çalışacak, bilgisayar ile telefon otomatik eşitlenecek, öğrenilen kelimeler ana ekran widget'ında görünecek (kilit ekranından vazgeçildi, aşağıya bkz.).

## Kararlar
| Konu | Karar |
|---|---|
| Yayın | **GitHub Pages** (ücretsiz, kalıcı). Depo herkese açık olur; ilerleme ve anahtar depoya asla girmez |
| Telefona kurulum | PWA: Safari → Paylaş → Ana Ekrana Ekle. Manifest + ikon + service worker; çevrimdışı çalışır |
| Güncelleme | GitHub'a push → telefonda açılışta yeni sürüm arka planda iner → **"🔄 Yeni sürüm hazır, yenile"** şeridi. Önbellek sürümü her yayında değişmeli |
| Bilgisayarda | `file://` ile çift tıklayarak açma çalışmaya devam etmeli (service worker yalnızca https'te devreye girer) |
| Senkron | **Otomatik, gizli GitHub Gist** (`ilerleme.json`). `storage.js`'e yeni sürücü (BulutSurucusu). Anahtar (yalnızca gist yetkili token) her cihazda bir kez Ayarlar'dan girilir, yalnızca cihazda saklanır. Uygulama açılışta ve her oturum sonunda eşitler; internet yoksa sonra dener. Çakışmada **kelime kelime birleştirme** (her kelimede daha yeni olan kalır; ünite adımları birleşim; puan günlüğü birleşim) |
| iPhone ayrıntıları | Yazı kutuları ≥ 16px (yakınlaşma olmasın) · `autocorrect="off" autocapitalize="off" spellcheck="false"` · çentik payları (`env(safe-area-inset-*)`) · en iyi İspanyolca sesi otomatik seç (es-MX / es-US / es-ES sırası; "Gelişmiş" ses varsa onu) · ses yalnızca dokunuşla başlar · sessiz modda ses gelmeyebilir: telefonda dene |

## 📱 Telefon modu
- **Otomatik açılır** (dokunmatik + dar ekran); Ayarlar'da elle aç/kapat seçeneği olur.
- Aksan düğmeleri gizlenir (iPhone klavyesinde harfe basılı tutarak yazılıyor). Aksansız yazılan cevap yine doğru sayılır ama uyarı verir.
- **Az yazma:** yazma soruları çoğunlukla şuralara dönüşür:
  - TR → ES kelime yazma → 4 şık ya da harf taşlarından kur
  - Fiil çekimi / cümlede çekim yazma → şıklar
  - Dinle → yaz → dinle → seç
  - TR → ES cümle yazma → kelime taşlarından kur, **2–3 yanıltıcı kelime karışık** (cümlede olmayan kelimeler de çıkmalı ki soru anlam taşısın)
  - Arada bir yazma sorusu gelmeye devam eder
- Mini sınav da aynı mantıkla.
- **Dinleme kalır:** dinle-seç, cümle dinle, soruyu dinle → cevabı seç, rakam (rakam klavyesi: `inputmode="numeric"`), kelimeye dokununca okuma.
- **Tek elle kullanım:** şıklar ve "Kontrol et / Devam" düğmeleri ekranın altında ve büyük; 1-2-3 puanı büyük düğmeler; eşleştirmede 4 çift, süreli eşleştirmede 5 çift.
- **Özet tablolar:** **[📊 Tablo | 👤 Kartlar]** geçişi.
  - Kartlar görünümü: üstte kişi düğmeleri, seçilen kişinin zamiri, sahipliği ve tüm fiil çekimleri alt alta.
  - Son seçim hatırlanır; bilgisayarda varsayılan tablo.
- **Olmayacaklar:** kısa "5 dakika" oturumu, kaydırarak kart cevaplama, "dinleyemiyorum" düğmesi.

## Kelime örnek cümleleri
- Her kelimeye kısa (≤ 5–6 kelime), ünite kilidine uyan bir örnek cümle ve Türkçesi.
- Plan claude.ai'da yazmaktı; kullanıcının isteğiyle **Claude Code'da yazıldı**, her grup `node denetim.js` ile denetlendi. Dosya: `icerik/kelime-cumleleri.js`
  `ICERIK.kelimeCumleleri = { "u02_hola": ["Hola, me llamo Ana.", "Merhaba, benim adım Ana."], … }`
- Mini kart ve widget bu dosyayı kullanır; ileride alıştırmalarda da kullanılabilir.

## Mini kart
- Ayrı bir hafif ekran (ör. `index.html#mini` ya da `?mini=<kelimeId>`).
- İspanyolca kelime + örnek cümle görünür; karta dokununca Türkçeleri açılır; **Geç** ile sıradaki kelime.
- Yalnızca öğrenilen kelimelerden (kartı görülmüş üniteler), **rastgele**.
- **İlerlemeyi etkilemez**, sadece göz atmak için.

## Widget'lar (Scriptable uygulaması, Mac gerekmez)
- Uygulama her senkronda Gist'e küçük bir `widget.json` da yazar: öğrenilen kelimeler + örnek cümleler.
- **Ana ekran widget'ı:** İspanyolca kelime + cümle, Türkçesi gizli. iOS kendi zamanlamasıyla yeniler, her yenilemede rastgele yeni kelime. Dokununca mini kart o kelimeyle açılır.
- **Kilit ekranı:** dikdörtgen (kelime + kısa cümle, tek renk); isteğe bağlı satır içi (yalnızca kelime).
- Widget betiği kendi güncel sürümünü siteden indirir (kullanıcı Scriptable'da elle güncellemesin).
- iOS widget'ları dokunmaya tepki veremez; Türkçeyi açma ve "geç" mini kartta.

## Adımlar (sırayla, her biri onayla)
1. ✅ Kelime örnek cümleleri (806/809 kelime; Claude Code'da yazıldı)
2. ✅ Git + GitHub deposu + GitHub Pages yayını
3. ✅ iPhone uyumu + PWA + güncelleme şeridi + 📱 telefon modu
4. ✅ Otomatik senkron (Gist sürücüsü + birleştirme)
5. ✅ Mini kart
6. ✅ Scriptable widget'ı (ana ekran; kilit ekranından vazgeçildi)

## Kullanıcının yapacakları
- ✅ GitHub hesabı (`bnoktak`), her cihaz için ayrı, yalnızca Gist yetkili (Read and write) token; ikisi de bağlı
- ✅ Uygulama Safari'den ana ekrana eklendi
- ✅ Scriptable kuruldu, widget ana ekranda

## Yapılanlar (Kasım 2026)
- **Yayın:** https://bnoktak.github.io/ispanyolca/ · depo https://github.com/bnoktak/ispanyolca. `.gitignore` ilerleme ve yedekleri dışarıda tutar.
- **PWA:** `manifest.webmanifest`, 🌮 ikonları (`ikon/`), `sw.js` (tüm dosyalar önbellekte, çevrimdışı açılır), `js/pwa.js` (yalnızca https'te; "🔄 Yeni sürüm hazır" şeridi, sayfa kendiliğinden yenilenmez). `sw.js` içindeki SURUM etiketini `.githooks/pre-commit` kancası her commit'te tarih-saatle değiştirir.
- **Telefon modu:** `Cihaz.telefon()` (dokunmatik + ≤600 px; Ayarlar'da Otomatik/Açık/Kapalı). Yazma sorularının ~%80'i şıklara, 🔤 harflerden kur (`harf_kur`, 2 yanıltıcı harf) ve 🧱 kelimelerden kur (`ceviri_kur`, 2–3 yanıltıcı kelime) türlerine döner; sınavda kelime yazma harf taşlarına döner. Tek elle düzen, eşleştirme 4/5 çift, toplu yazma gizli, özette Tablo/Kartlar geçişi.
- **Cihaz ayarları** (`Cihaz`, localStorage): telefon modu, özet görünümü, senkron anahtarı ve Gist bilgisi. İlerlemeye ve senkrona girmez.
- **Senkron** (`js/senkron.js`): gizli Gist'te `ilerleme.json` + `widget.json`. Açılışta, kayıttan 20 sn sonra, arka plana geçerken, geri dönünce ve bağlantı gelince eşitler. Birleştirme: kelime en son cevaplanan; ünite VEYA / en iyi skor; puan günlüğü birleşim; ayarlar daha yeni olanınki (boş veri "daha yeni" sayılmaz); ses ve son yedek cihazda kalır. Veri sürümü 2: `sifirlama` işareti (bir cihazda sıfırlama öbürlerini de sıfırlar, eski ilerleme geri gelmez). Daha yeni sürümün verisini eski uygulama ezmez. `file://` açılışında da çalışır.
- **Mini kart:** ana ekrandaki 🃏 düğmesi ya da `#mini` / `#mini=<kelimeId>`. Öğrenilen kelimelerden rastgele; ← Önceki / Geç →, kaydırma, klavye; ilerlemeyi etkilemez.
- **Widget** (`widget/ispanyolca-widget.js`, Scriptable): yükleyici (Ayarlar → 📲 iPhone widget'ı → Kodu kopyala) asıl kodu siteden indirir, güncellemeler kendiliğinden gelir. Veri Gist'teki `widget.json` (anahtar gerekmez). Küçük/orta/büyük boylar, `tr` parametresiyle Türkçe; dokununca Scriptable içinde kelime kartı (önceki/geç).
- **Kilit ekranından vazgeçildi:** iOS kilit ekranı widget'ları çok küçük yuvalarda duruyor (dikdörtgen 2 yuva, ~3 kısa satır); kullanıcı beklediği gibi bulmadı. Kod kilit ekranı boylarını hâlâ destekliyor ama önerilmiyor.
- **Widget sınırları (iOS / Scriptable):** üstünde düğme olamaz, yenileme zamanını iOS belirler (5 dk istenir, genelde 15–30 dk). Elle geçmek için widget'a dokunup kartı kullanmak gerekir.
- **Kelime cümleleri:** 806/809 kelime (Ünite 1'deki gente, ciudad, viaje için doğal cümle kurulamadı; onlarda ünite cümleleri kullanılır). `denetim.js` kimlik, kilit, uzunluk ve kelimenin cümlede geçip geçmediğini kontrol eder. Yeni ünite eklenince `node cumle-hazirlik.js` ile hazırlık listesi üretilip cümleler aynı kurallarla yazılabilir.
