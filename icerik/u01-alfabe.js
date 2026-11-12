ICERIK.unite({
  id: 'u01', sira: 1, seviye: 'A1', emoji: "🔤",
  baslik: "Alfabe ve telaffuz",
  ozet: "Harflerin okunuşu ve her biri bir kuralı gösteren temel kelimeler",
  not: `
    <p><b>Güzel haber:</b> İspanyolca da Türkçe gibi büyük ölçüde <b>yazıldığı gibi okunur</b>.
    Ünlüler (<b>a e i o u</b>) her zaman aynı okunur, Türkçedeki gibi.</p>
    <p>Türkçeden farklı okunan harfler:</p>
    <table class="tablo">
      <tr><td><b>h</b></td><td>Okunmaz: <i>helado</i> → "elado"</td></tr>
      <tr><td><b>j</b></td><td>Gırtlaktan, sert bir "h": <i>jamón</i> → "hamon"</td></tr>
      <tr><td><b>ge / gi</b></td><td>"he / hi" (j gibi): <i>gente</i> → "hente"</td></tr>
      <tr><td><b>ce / ci</b></td><td>"se / si": <i>ciudad</i> → "siudad". Diğer durumlarda c = k</td></tr>
      <tr><td><b>z</b></td><td>"s" (Latin Amerika): <i>cerveza</i> → "servesa"</td></tr>
      <tr><td><b>qu</b></td><td>"k" (u okunmaz): <i>queso</i> → "keso"</td></tr>
      <tr><td><b>ll / y</b></td><td>"y": <i>tortilla</i> → "tortiya", <i>playa</i> → "playa"</td></tr>
      <tr><td><b>ñ</b></td><td>"ny": <i>piña</i> → "pinya"</td></tr>
      <tr><td><b>ch</b></td><td>"ç": <i>chocolate</i> → "çokolate"</td></tr>
      <tr><td><b>v</b></td><td>"b"ye yakın okunur: <i>viaje</i> → "byahe"</td></tr>
      <tr><td><b>rr</b></td><td>Titreşimli, uzun "r": <i>perro</i></td></tr>
    </table>
    <p>Bu ünitenin kelimeleri günlük hayatta, özellikle tatilde çok işine yarayacak ve her biri bir okunuş kuralını gösteriyor.
    Önlerindeki <b>el / la</b> "the" demek (artikel); 4. ünitede ayrıntısıyla göreceğiz.</p>
    <p><b>Vurgu işareti</b> (á é í ó ú) vurgunun nerede olduğunu gösterir: <i>jamón</i>.
    Soru ve ünlem cümleleri başta ters işaretle açılır: <b>¿</b>Cómo estás? <b>¡</b>Hola!</p>
  `,
  detayBaslik: "Alfabenin tamamı ve harf adları",
  detay: `
    <p>İspanyol alfabesinde <b>27 harf</b> var: Türkçedekilere ek olarak <b>ñ, k, q, w, x</b>; Türkçedeki <i>ç, ğ, ı, ö, ş, ü</i> yok.
    Harf adları en çok <b>ad ya da e-posta kodlarken</b> lazım olur (otel, havalimanı, telefon).</p>
    <table class="tablo alfabe">
      <tr><th>Harf</th><th>Adı</th><th>Okunuşu</th><th></th></tr>
      <tr><td><b>a</b></td><td>a</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="a">🔊</button></td></tr>
      <tr><td><b>b</b></td><td>be</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="be">🔊</button></td></tr>
      <tr><td><b>c</b></td><td>ce</td><td class="soluk">"se"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="ce">🔊</button></td></tr>
      <tr><td><b>d</b></td><td>de</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="de">🔊</button></td></tr>
      <tr><td><b>e</b></td><td>e</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="e">🔊</button></td></tr>
      <tr><td><b>f</b></td><td>efe</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="efe">🔊</button></td></tr>
      <tr><td><b>g</b></td><td>ge</td><td class="soluk">"he"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="ge">🔊</button></td></tr>
      <tr><td><b>h</b></td><td>hache</td><td class="soluk">"açe"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="hache">🔊</button></td></tr>
      <tr><td><b>i</b></td><td>i</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="i">🔊</button></td></tr>
      <tr><td><b>j</b></td><td>jota</td><td class="soluk">"hota"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="jota">🔊</button></td></tr>
      <tr><td><b>k</b></td><td>ka</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="ka">🔊</button></td></tr>
      <tr><td><b>l</b></td><td>ele</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="ele">🔊</button></td></tr>
      <tr><td><b>m</b></td><td>eme</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="eme">🔊</button></td></tr>
      <tr><td><b>n</b></td><td>ene</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="ene">🔊</button></td></tr>
      <tr><td><b>ñ</b></td><td>eñe</td><td class="soluk">"enye"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="eñe">🔊</button></td></tr>
      <tr><td><b>o</b></td><td>o</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="o">🔊</button></td></tr>
      <tr><td><b>p</b></td><td>pe</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="pe">🔊</button></td></tr>
      <tr><td><b>q</b></td><td>cu</td><td class="soluk">"ku"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="cu">🔊</button></td></tr>
      <tr><td><b>r</b></td><td>erre</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="erre">🔊</button></td></tr>
      <tr><td><b>s</b></td><td>ese</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="ese">🔊</button></td></tr>
      <tr><td><b>t</b></td><td>te</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="te">🔊</button></td></tr>
      <tr><td><b>u</b></td><td>u</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="u">🔊</button></td></tr>
      <tr><td><b>v</b></td><td>ve</td><td class="soluk">"be"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="ve">🔊</button></td></tr>
      <tr><td><b>w</b></td><td>doble ve</td><td class="soluk">"doble be"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="doble ve">🔊</button></td></tr>
      <tr><td><b>x</b></td><td>equis</td><td class="soluk">"ekis"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="equis">🔊</button></td></tr>
      <tr><td><b>y</b></td><td>ye</td><td class="soluk"></td><td class="ses-hucre"><button type="button" class="ses" data-ses="ye">🔊</button></td></tr>
      <tr><td><b>z</b></td><td>zeta</td><td class="soluk">"seta"</td><td class="ses-hucre"><button type="button" class="ses" data-ses="zeta">🔊</button></td></tr>
    </table>
    <ul>
      <li><b>b / v</b> aynı okunur. Kodlarken karışmasın diye Latin Amerika'da <i>be larga</i> (b) ve <i>ve corta</i> (v) denir.</li>
      <li><b>x</b> çoğunlukla "ks" okunur (<i>taxi</i>).</li>
      <li><b>k</b> ve <b>w</b> sadece yabancı kökenli kelimelerde geçer: <i>kilo, web</i>.</li>
      <li><b>y</b>'nin eski adı <i>i griega</i>'dır, hâlâ duyabilirsin.</li>
      <li><b>ch</b> ve <b>ll</b> eskiden ayrı harf sayılıyordu; artık iki harf olarak kodlanır: <i>ce hache</i>, <i>doble ele</i>.</li>
    </ul>
    <p><b>Örnek:</b> "Batuhan" kodlamak → <i>be, a, te, u, hache, a, ene</i>
    <button type="button" class="ses" data-ses="be, a, te, u, hache, a, ene">🔊</button></p>
    <p>Kullanışlı kalıp: <i>¿Cómo se escribe?</i> — Nasıl yazılıyor?
    <button type="button" class="ses" data-ses="¿Cómo se escribe?">🔊</button></p>
  `,
  gruplar: [["Okunuşu farklı harfler", ["h", "j", "ll", "n", "ch", "qu", "z", "ce"]], ["Evet / hayır", ["si", "no"]], ["Yiyecek-içecek", ["agua", "queso", "jamon", "tortilla", "chocolate", "helado", "pina", "cerveza"]], ["İnsanlar ve hayvanlar", ["gente", "perro", "gato"]], ["Yerler", ["casa", "ciudad", "playa", "cine", "viaje"]]],
  kelimeler: [
    {"id": "u01_h", "en": "silent letter", "es": "h", "tr": "okunmayan harf", "ipucu": "helado → \"elado\"", "yazma": false},
    {"id": "u01_j", "en": "harsh \"h\" sound", "es": "j", "tr": "gırtlaktan \"h\" sesi", "ipucu": "jamón → \"hamon\"", "yazma": false},
    {"id": "u01_ll", "en": "\"y\" sound", "es": "ll", "tr": "\"y\" sesi", "ipucu": "tortilla → \"tortiya\"", "yazma": false},
    {"id": "u01_n", "en": "\"ny\" sound (canyon)", "es": "ñ", "tr": "\"ny\" sesi", "ipucu": "piña → \"pinya\"", "yazma": false},
    {"id": "u01_ch", "en": "\"ch\" sound (church)", "es": "ch", "tr": "\"ç\" sesi", "ipucu": "chocolate → \"çokolate\"", "yazma": false},
    {"id": "u01_qu", "en": "\"k\" sound", "es": "qu", "tr": "\"k\" sesi (u okunmaz)", "ipucu": "queso → \"keso\"", "yazma": false},
    {"id": "u01_z", "en": "\"s\" sound", "es": "z", "tr": "\"s\" sesi", "ipucu": "cerveza → \"servesa\"", "yazma": false},
    {"id": "u01_ce", "en": "\"se / si\" sound", "es": "ce / ci", "tr": "\"se / si\" sesi", "ipucu": "ciudad → \"siudad\"", "yazma": false},
    {"id": "u01_si", "en": "yes", "es": "sí", "tr": "evet", "ipucu": "si (aksansız) \"eğer\" demek"},
    {"id": "u01_no", "en": "no", "es": "no", "tr": "hayır"},
    {"id": "u01_agua", "en": "water", "es": "el agua", "tr": "su", "ipucu": "Dişil ama \"el agua\" denir (a ile başlayan vurgulu kelime)", "okunus": "agua", "cogul": false},
    {"id": "u01_queso", "en": "cheese", "es": "el queso", "tr": "peynir", "ipucu": "qu = \"k\": \"keso\"", "okunus": "keso"},
    {"id": "u01_jamon", "en": "ham", "es": "el jamón", "tr": "jambon", "ipucu": "j = gırtlaktan \"h\": \"hamon\"", "okunus": "hamon"},
    {"id": "u01_tortilla", "en": "tortilla", "es": "la tortilla", "tr": "tortilla (mısır ekmeği)", "ipucu": "ll = \"y\": \"tortiya\"", "okunus": "tortiya"},
    {"id": "u01_chocolate", "en": "chocolate", "es": "el chocolate", "tr": "çikolata", "ipucu": "ch = \"ç\": \"çokolate\"", "okunus": "çokolate"},
    {"id": "u01_helado", "en": "ice cream", "es": "el helado", "tr": "dondurma", "ipucu": "h okunmaz: \"elado\"", "okunus": "elado"},
    {"id": "u01_pina", "en": "pineapple", "es": "la piña", "tr": "ananas", "ipucu": "ñ = \"ny\": \"pinya\"", "okunus": "pinya"},
    {"id": "u01_cerveza", "en": "beer", "es": "la cerveza", "tr": "bira", "ipucu": "z = \"s\": \"servesa\"", "okunus": "servesa"},
    {"id": "u01_gente", "en": "people", "es": "la gente", "tr": "insanlar", "ipucu": "ge = \"he\": \"hente\". Tekil kullanılır: la gente es…", "okunus": "hente", "cogul": false},
    {"id": "u01_perro", "en": "dog", "es": "el perro", "tr": "köpek", "ipucu": "rr titreşimli okunur", "okunus": "perro"},
    {"id": "u01_gato", "en": "cat", "es": "el gato", "tr": "kedi", "ipucu": "ga = \"ga\" (sert g)", "okunus": "gato"},
    {"id": "u01_casa", "en": "house, home", "es": "la casa", "tr": "ev", "okunus": "kasa"},
    {"id": "u01_ciudad", "en": "city", "es": "la ciudad", "tr": "şehir", "ipucu": "ci = \"si\": \"siudad\"", "okunus": "siudad"},
    {"id": "u01_playa", "en": "beach", "es": "la playa", "tr": "plaj, sahil", "ipucu": "y = \"y\"", "okunus": "playa"},
    {"id": "u01_cine", "en": "cinema", "es": "el cine", "tr": "sinema", "ipucu": "ci = \"si\": \"sine\"", "okunus": "sine"},
    {"id": "u01_viaje", "en": "trip", "es": "el viaje", "tr": "yolculuk, seyahat", "ipucu": "v ≈ \"b\", j = \"h\": \"byahe\"", "okunus": "byahe"}
  ],
  cumleler: []
});
