# İspanyolca uygulaması: Claude Code talimatları

Batuhan'ın kişisel İspanyolca (A1) öğrenme uygulaması. Amaç: Kolombiya ve Güney Amerika tatilinde tanışmak, sohbet etmek, eğlenmek.
Ayrıntılı kararlar `PLAN.md` içinde, telefona taşıma planı `TELEFON_PLANI.md` içinde. Oturum başında ikisini de oku.

## Çalışma kuralları (önemli)
- **Türkçe konuş.** Arayüz metinleri, kod yorumları ve değişken adları da Türkçe (mevcut stile uy: `Depo`, `Tekrar`, `uniteler`, `kelimeler`).
- **Onay almadan ilerleme.** Bir işe başlamadan önce ne yapacağını kısaca söyle ve onay bekle. Belirsiz bir şey varsa sor.
- Küçük değişiklikleri sohbette **diff olarak** göster; büyük işlerde önce planı göster.
- Bir adım bitince: ne değişti (1–3 satır) + nasıl test edildi. Uzun özet yazma.
- Commit mesajları Türkçe ve kısa. Commit ve yayın (push) yalnızca kullanıcı isteyince yapılır.

## Mimari
- Derleme adımı yok: düz HTML/CSS/JS, **klasik `<script>` etiketleri** (modül değil). Bilgisayarda `index.html` çift tıklanıp `file://` ile de çalışmalı; bu özellik bozulmamalı.
- Global nesneler: `ICERIK` (içerik), `Depo` (kayıt), `Tekrar` (aralıklı tekrar), `Ses` (sesli okuma), `Alistirma` (soru türleri), `Puan` (1-2-3 zorluk günlüğü), `Cihaz` (yalnızca bu cihazın ayarları: telefon modu vb.; ilerlemeye/senkrona girmez).
- 📱 Telefon modu (`Cihaz.telefon()`, `<body class="telefon">`): yazma soruları `Alistirma.yazVeya` / `ceviriVeya` / `yazModu` ile çoğunlukla şıklara, 🔤 harflerden kur (`harf_kur`) ve 🧱 kelimelerden kur (`ceviri_kur`) türlerine döner; ~%20'si yazma kalır. Yeni bir yazma sorusu eklenirse bu dönüşüme de bağlanmalı.
- Yeni bir dosya eklenirse `index.html` içindeki script sırasına **ve `sw.js` içindeki `DOSYALAR` listesine** eklenmeli (`node denetim.js` eksikleri bildirir).

```
index.html            uygulama ve script listesi
css/style.css         görünüm (koyu tema)
js/storage.js         kayıt katmanı: sürücüler (tarayıcı, dosya; bulut buraya eklenecek), sürüm dönüştürücüleri
js/srs.js             aralıklı tekrar (kutular: 0, 10 dk, 1, 3, 7, 16, 35 gün)
js/puan.js            cevap günlüğü, 1-2-3 zorluk, zorluk raporu, TUR_ADI (soru türü adları)
js/alistirmalar.js    soru türleri, ünite alıştırması / sınav / tekrar oturumu üreticileri
js/uretici.js         şablon cümleler, birikimli çekim, cümlede çekim, ser/estar, çeviri, doğru/yanlış
js/app.js             ekranlar (ana ekran, ünite, kartlar, alıştırma, sınav, özet tablolar, ayarlar)
js/ses.js             Web Speech API ile İspanyolca okuma
js/ai.js              yapay zekâ modülü (kapalı)
js/senkron.js         ☁️ senkron: gizli GitHub Gist sürücüsü + birleştirme (kelime: en son cevaplanan, ünite: VEYA, puan: birleşim, sifirlama işareti); anahtar yalnızca Cihaz'da
js/pwa.js             service worker kaydı, "🔄 Yeni sürüm hazır" şeridi (yalnızca https'te)
sw.js                 service worker: çevrimdışı önbellek, SURUM etiketi (kanca her commit'te günceller)
manifest.webmanifest  ana ekrana ekleme bilgileri · ikon/ 🌮 ikonları (180/192/512)
.githooks/pre-commit  sw.js SURUM etiketini tarih-saate çevirir
icerik/icerik.js      içerik kaydı + ünite biçiminin açıklaması
icerik/uXX-*.js       27 ana ünite (sırayla açılır)
icerik/xXX-*.js       ek üniteler (ek: true, kilitsiz, sira 100+)
icerik/ozet.js        özet tablolar verisi (kişi tablosu, küçük tablolar, örnek cümleler)
icerik/sablonlar.js   cümle şablonları (Quiero un/una X …)
denetim.js            içerik denetimi: öğretilmemiş kelime var mı?
```

## İçerik kuralları (bozulmamalı)
- **Öğretilmemiş kelime yok:** Bir ünitedeki cümle, boşluk, şık ve soru–cevaplarda yalnızca o üniteye kadar öğretilmiş kelimeler kullanılır. Her içerik değişikliğinden sonra `node denetim.js` çalıştır, sonuç "Temiz" olmalı. İzin verilen özel kelimeler `denetim.js` içindeki `NOT_EK` listesinde.
- Özet tablolarda ve şablonlarda her öğenin bir `uid` alanı var: o ünite açılmadan gösterilmez.
- **Kelime id'leri asla değişmez** (`u06_cerveza` gibi); ilerleme bu id'lere bağlı.
- `es` içinde " / " alternatif cevaptır (`encantado / encantada`).
- Kelime alanları: `yazma: false` (yazma sorusu yok), `cogul: false` (çoğulu sorulmaz).
- Varyant: genel Güney Amerika İspanyolcası (ustedes, s okunan c/z, carro, celular, jugo…).
- İlerleme verisi `storage.js`'de `surum` alanıyla sürümlü. Biçim değişirse sürümü artır ve bir dönüştürücü yaz; eski ilerleme kaybolmamalı.

## Test
- `node --check <dosya>` ile söz dizimi kontrolü.
- `node denetim.js` → "Temiz: öğretilmemiş kelime yok".
- Tarayıcıda dene. Uygulamanın her ünitede her soru türünü hatasız üretmesi gerekir: konsolda `Alistirma.uniteden(u)` ile çok sayıda soru üretip `render` edilebilir.
- Arayüz değişikliklerinden sonra hem geniş ekranda hem telefon genişliğinde (390 px) kontrol et.

## Yayın (GitHub Pages)
- Depo: https://github.com/bnoktak/ispanyolca (herkese açık) · Site: https://bnoktak.github.io/ispanyolca/ (`main` dalı, kök klasör)
- `.gitignore` ilerleme dosyalarını (`ilerleme*.json`, `yedekler/`) dışarıda tutar; commit öncesi `git status` ile kontrol et.
- Akış: claude.ai'dan gelen içerik dosyasını `icerik/` içine kopyala → `node denetim.js` "Temiz" → commit (Türkçe, kısa) → `git push`. Site 1–2 dakikada güncellenir.
- Commit kimliği: `bk` / `bnoktak@users.noreply.github.com`. Push, Claude Code'un kendi kabuğunda giriş isteyemez; giriş gerekirse Terminal panelinde çalıştır.
- `.nojekyll`: GitHub'ın Jekyll işlemesini kapatır, silinmemeli.
- Sürüm kancası: her commit'te `sw.js` SURUM etiketi değişir, telefon yeni sürümü indirip şerit gösterir. Format sonrası depoyu indirince bir kez `git config core.hooksPath .githooks` çalıştır.

## Kullanıcı hakkında
- Windows kullanıyor, iPhone'u var, Mac'i yok.
- Uygulamayı Vivaldi (Chromium) ile açıyor.
- Şu an 5. ünite civarında; ilerlemesini sıfırlayıp baştan başladı.
