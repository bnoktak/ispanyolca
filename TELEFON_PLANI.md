# Telefon (iPhone) planı: kararlar ve adımlar

Kasım 2026'da claude.ai sohbetinde kararlaştırıldı. Her adıma başlamadan önce kullanıcıdan onay alınır.

## Hedef
Uygulama iPhone'da da çalışacak, bilgisayar ile telefon otomatik eşitlenecek, öğrenilen kelimeler ana ekran ve kilit ekranı widget'larında görünecek.

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
- **claude.ai sohbetinde yazılacak**, `icerik/kelime-cumleleri.js` dosyası olarak gelecek:
  `ICERIK.kelimeCumleleri = { 'u06_cerveza': ['Una cerveza, por favor.', 'Bir bira, lütfen.'], … }`
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
1. Kelime örnek cümleleri → claude.ai'da (bu planın dışında hazırlanır)
2. Git + GitHub deposu + GitHub Pages yayını
3. iPhone uyumu + PWA + güncelleme şeridi + 📱 telefon modu
4. Otomatik senkron (Gist sürücüsü + birleştirme)
5. Mini kart
6. Scriptable widget'ları (ana ekran + kilit ekranı)

## Kullanıcının yapacakları (zamanı gelince adım adım anlatılacak)
- GitHub hesabı açmak (yoksa)
- Yalnızca gist yetkili bir token oluşturmak
- iPhone'a Scriptable kurmak, widget'ı ana ekrana ve kilit ekranına eklemek
- Uygulamayı Safari'den ana ekrana eklemek
