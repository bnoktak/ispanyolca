/* =========================================================
   ÖZET TABLOLAR (ana ekran → 📚 Özet tablolar)
   Her satırın sonundaki ünite id'si, o bilginin öğretildiği ünite.
   Sadece açık ünitelere kadar olan satırlar gösterilir.
   ornek: 'soru' → ICERIK.ornekler.soru'dan (ilk sütuna göre) soru–cevap sütunları eklenir.
   es: İspanyolca olan sütunların sırası (yoksa: ilk sütun 'İspanyolca' ise 0, değilse 1 ve sonrası).
   Kişi tablosu (zamir, sahiplik, gustar, dönüşlü + tüm fiil çekimleri) kisiTablosu'ndan ve ünitelerin "cekimler" alanından otomatik kurulur.
   ========================================================= */
ICERIK.kisiTablosu = {
  // Satırlar İspanyolcanın 5 fiil biçimine göre (o / siz-kibar aynı biçimi alır, onlar / siz-çoğul aynı biçimi alır)
  kisiler: [
    { k: 'yo', tr: 'ben', es: 'yo', uid: 'u02' },
    { k: 'tu', tr: 'sen', es: 'tú', uid: 'u02' },
    { k: 'el', tr: 'o\nsiz (kibar)', es: 'él / ella\nusted', uid: 'u04' },
    { k: 'nos', tr: 'biz', es: 'nosotros\nnosotras', uid: 'u04' },
    { k: 'ellos', tr: 'onlar\nsiz (çoğul)', es: 'ellos / ellas\nustedes', uid: 'u04' }
  ],
  // Kişiye göre değişen sütun grupları; her hücre: [metin, öğretildiği ünite] · \n = hücre içinde alt satır
  gruplar: [
    { baslik: '👜 Sahiplik', sutunlar: [
      { ad: 'Türkçe', tr: true, yo: ['benim', 'u04'], tu: ['senin', 'u04'], el: ['onun\nsizin', 'u04'], nos: ['bizim', 'u04'], ellos: ['onların\nsizin', 'u04'] },
      { ad: 'tekil isim', yo: ['mi', 'u04'], tu: ['tu', 'u04'], el: ['su', 'u04'], nos: ['nuestro\nnuestra', 'u04'], ellos: ['su', 'u04'] },
      { ad: 'çoğul isim', yo: ['mis', 'u04'], tu: ['tus', 'u04'], el: ['sus', 'u04'], nos: ['nuestros\nnuestras', 'u04'], ellos: ['sus', 'u04'] }
    ] },
    { baslik: '❤️ gustar', sutunlar: [
      { ad: 'hoşuna gidiyor', yo: ['me gusta', 'u07'], tu: ['te gusta', 'u07'], el: ['le gusta', 'u25'], nos: ['nos gusta', 'u25'], ellos: ['les gusta', 'u25'] }
    ] },
    { baslik: '🔁 Dönüşlü', sutunlar: [
      { ad: 'zamir', yo: ['me', 'u26'], tu: ['te', 'u26'], el: ['se', 'u26'], nos: ['nos', 'u26'], ellos: ['se', 'u26'] }
    ] }
  ]
};

ICERIK.ozet = [
  { baslik: '🔤 Artikeller', sutunlar: ['', 'eril', 'dişil'], satirlar: [
    ['belirli tekil (the)', 'el', 'la', 'u04'], ['belirli çoğul', 'los', 'las', 'u04'],
    ['belirsiz tekil (bir)', 'un', 'una', 'u04'], ['belirsiz çoğul (birkaç)', 'unos', 'unas', 'u21']
  ] },
  { baslik: '👉 Bu / şu', sutunlar: ['', 'eril', 'dişil', 'çoğul'], satirlar: [
    ['bu', 'este', 'esta', 'estos\nestas', 'u06'], ['şu', 'ese', 'esa', 'esos\nesas', 'u21']
  ] },
  { baslik: '❓ Soru kelimeleri', sutunlar: ['İspanyolca', 'Türkçe'], ornek: 'soru', satirlar: [
    ['¿qué?', 'ne?', 'u02'], ['¿cómo?', 'nasıl?', 'u02'], ['¿dónde?', 'nerede?', 'u02'], ['¿de dónde?', 'nereden?', 'u02'], ['¿quién?', 'kim?', 'u02'],
    ['¿cuántos?\n¿cuántas?', 'kaç?', 'u03'], ['¿cuánto?', 'ne kadar?', 'u09'], ['¿cuál?', 'hangisi? (ne?)', 'u09'], ['¿a qué hora?', 'saat kaçta?', 'u10'],
    ['¿cuándo?', 'ne zaman?', 'u19'], ['¿por qué?', 'neden?', 'u02']
  ] },
  { baslik: '⚖️ ser mi estar mı?', sutunlar: ['', 'ne zaman?', 'örnek'], es: [0, 2], satirlar: [
    ['ser', 'kim / ne olduğun, meslek, memleket, kalıcı özellik', 'Soy ingeniero. Soy de Turquía.', 'u04'],
    ['estar', 'nerede olduğun, şu anki durum', 'Estoy en casa. Estoy cansado.', 'u05']
  ] }
];

/* Gezide en çok işine yarayacak örnek cümleler ve soru–cevaplar.
   soru: [soru, cevap, Türkçe soru, Türkçe cevap, ünite] · ünite = cümlenin tüm kelimelerinin öğretilmiş olduğu ilk ünite
   (o ünite açılmadan gösterilmez). fiil: kişi tablosunun altında · soru: soru kelimeleri tablosunda. */
ICERIK.ornekler = {
  // fiil: [cümle, Türkçe, ünite] · birden fazla cümle olabilir, her biri kendi ünitesinde açılır
  fiil: {
    tener: [
      ['Tengo una casa en Turquía.', 'Türkiye\'de bir evim var.', 'u04'],
      ['Tengo treinta años.', 'Otuz yaşındayım. (yaş tener ile söylenir)', 'u09']
    ],
    ser: ['Soy de Turquía.', 'Türkiyeliyim.', 'u02'],
    estar: ['Estoy en Colombia.', 'Kolombiya\'dayım.', 'u05'],
    hablar: ['Hablo un poco de español.', 'Biraz İspanyolca konuşuyorum.', 'u02'],
    trabajar: ['Trabajo en Ankara.', 'Ankara\'da çalışıyorum.', 'u04'],
    comer: ['Comemos en un restaurante.', 'Bir restoranda yemek yiyoruz.', 'u06'],
    aprender: ['Aprendo español.', 'İspanyolca öğreniyorum.', 'u23'],
    vivir: ['Vivo en Turquía.', 'Türkiye\'de yaşıyorum.', 'u04'],
    escribir: ['Escribo mi número aquí.', 'Numaramı buraya yazıyorum.', 'u23'],
    necesitar: ['Necesito un taxi.', 'Bir taksiye ihtiyacım var.', 'u11'],
    ir: ['Voy a la playa.', 'Plaja gidiyorum.', 'u10'],
    querer: ['Quiero una cerveza.', 'Bir bira istiyorum.', 'u06'],
    poder: ['Puedo pagar con tarjeta.', 'Kartla ödeyebilirim.', 'u16'],
    hacer: [
      ['¿Qué haces?', 'Ne yapıyorsun?', 'u14'],
      ['Hace calor.', 'Hava sıcak. (hava durumu hacer ile söylenir)', 'u27']
    ],
    venir: ['Vengo de Turquía.', 'Türkiye\'den geliyorum.', 'u24'],
    salir: ['Salimos esta noche.', 'Bu akşam dışarı çıkıyoruz.', 'u10'],
    ver: ['Nos vemos mañana.', 'Yarın görüşürüz.', 'u08'],
    saber: ['No sé.', 'Bilmiyorum.', 'u07'],
    conocer: ['No conozco la ciudad.', 'Şehri tanımıyorum.', 'u14'],
    jugar: ['Juego al fútbol.', 'Futbol oynarım.', 'u25'],
    preferir: ['Prefiero la playa.', 'Plajı tercih ederim.', 'u25'],
    levantarse: ['Me levanto a las ocho.', 'Sekizde kalkarım.', 'u26'],
    acostarse: ['Me acuesto tarde.', 'Geç yatarım.', 'u26'],
    dormir: ['Duermo bien.', 'İyi uyurum.', 'u26'],
    beber: ['Bebo mucha agua.', 'Çok su içerim.', 'u06'],
    tomar: ['Tomamos un taxi.', 'Taksiye biniyoruz.', 'u11'],
    bailar: ['Bailo un poco.', 'Biraz dans ederim.', 'u07'],
    pagar: ['Yo pago la cuenta.', 'Hesabı ben ödüyorum.', 'u09'],
    llegar: ['Llego a las diez.', 'Saat onda varıyorum.', 'u10'],
    buscar: ['Busco una farmacia.', 'Bir eczane arıyorum.', 'u11'],
    esperar: ['Te espero aquí.', 'Seni burada bekliyorum.', 'u12'],
    quedarse: ['Me quedo tres noches.', 'Üç gece kalıyorum.', 'u12'],
    abrir: ['¿A qué hora abre?', 'Saat kaçta açılıyor?', 'u10'],
    cerrar: ['El banco cierra a las cinco.', 'Banka beşte kapanıyor.', 'u11'],
    llamar: ['Te llamo mañana.', 'Yarın seni ararım.', 'u02'],
    visitar: ['Quiero visitar el museo.', 'Müzeyi gezmek istiyorum.', 'u14'],
    comprar: ['Quiero comprar una camiseta.', 'Bir tişört almak istiyorum.', 'u16'],
    probar: ['Quiero probar la arepa.', 'Arepayı denemek istiyorum.', 'u16'],
    sentirse: ['Me siento mal.', 'Kendimi kötü hissediyorum.', 'u02'],
    ayudar: ['¿Me puede ayudar?', 'Bana yardım edebilir misiniz?', 'u17'],
    perder: ['Perdí mi celular.', 'Telefonumu kaybettim.', 'u18'],
    encontrar: ['No encuentro mi pasaporte.', 'Pasaportumu bulamıyorum.', 'u18'],
    volver: ['Vuelvo el domingo.', 'Pazar günü dönüyorum.', 'u19'],
    dar: ['¿Me da un agua?', 'Bir su verir misiniz?', 'u22'],
    poner: ['¿Dónde pongo la maleta?', 'Valizi nereye koyayım?', 'u22'],
    estudiar: ['Estudio español.', 'İspanyolca çalışıyorum.', 'u23'],
    leer: ['Leo un libro.', 'Bir kitap okuyorum.', 'u23'],
    escuchar: ['Escucho música.', 'Müzik dinliyorum.', 'u23'],
    decir: ['¿Qué dices?', 'Ne diyorsun?', 'u21'],
    traer: ['¿Me trae la cuenta?', 'Hesabı getirir misiniz?', 'u06'],
    pensar: ['Pienso que es muy lindo.', 'Bence çok güzel.', 'u25'],
    creer: ['Creo que sí.', 'Sanırım evet.', 'u25']
  },
  // sahiplik: [biçim, cümle, Türkçe, ünite] · kişi tablosunun altında
  sahip: [
    ['mi', 'Mi amigo es de Turquía.', 'Arkadaşım Türkiyeli.', 'u04'],
    ['tu', '¿Cómo está tu amiga?', 'Arkadaşın nasıl?', 'u04'],
    ['su', 'Su casa está aquí.', 'Onun (sizin) evi burada.', 'u05'],
    ['nuestro', 'Nuestro amigo es de Colombia.', 'Arkadaşımız Kolombiyalı.', 'u04'],
    ['nuestra', 'Nuestra casa está aquí.', 'Evimiz burada.', 'u05'],
    ['mis', 'Mis amigos están aquí.', 'Arkadaşlarım burada.', 'u05'],
    ['tus', '¿Tus amigos son de aquí?', 'Arkadaşların buralı mı?', 'u05'],
    ['sus', 'Sus amigos son muy simpáticos.', 'Onun (sizin) arkadaşları çok cana yakın.', 'u04'],
    ['nuestros', 'Nuestros amigos son de Colombia.', 'Arkadaşlarımız Kolombiyalı.', 'u04']
  ],
  soru: {
    '¿qué?': ['¿Qué quieres tomar?', 'Una cerveza, por favor.', 'Ne içmek istersin?', 'Bir bira, lütfen.', 'u07'],
    '¿cómo?': ['¿Cómo te llamas?', 'Me llamo Batuhan. ¿Y tú?', 'Adın ne?', 'Adım Batuhan. Ya senin?', 'u02'],
    '¿dónde?': ['¿Dónde está el baño?', 'Allí, a la izquierda.', 'Tuvalet nerede?', 'Orada, solda.', 'u11'],
    '¿de dónde?': ['¿De dónde eres?', 'Soy de Turquía.', 'Nerelisin?', 'Türkiye\'denim.', 'u02'],
    '¿quién?': ['¿Quién es ella?', 'Es mi amiga Ana.', 'O kim?', 'Arkadaşım Ana.', 'u04'],
    '¿cuántos?\n¿cuántas?': ['¿Cuántos son?', 'Somos tres.', 'Kaç kişisiniz?', 'Üç kişiyiz.', 'u04'],
    '¿cuánto?': ['¿Cuánto cuesta?', 'Veinte mil pesos.', 'Ne kadar?', 'Yirmi bin peso.', 'u09'],
    '¿cuál?': ['¿Cuál es tu número?', 'Es este.', 'Numaran ne?', 'Bu.', 'u09'],
    '¿a qué hora?': ['¿A qué hora abre?', 'A las nueve de la mañana.', 'Saat kaçta açılıyor?', 'Sabah dokuzda.', 'u10'],
    '¿cuándo?': ['¿Cuándo vas a Cartagena?', 'El sábado.', 'Cartagena\'ya ne zaman gidiyorsun?', 'Cumartesi.', 'u24'],
    '¿por qué?': ['¿Por qué estás en Colombia?', 'Estoy de vacaciones.', 'Neden Kolombiya\'dasın?', 'Tatildeyim.', 'u12']
  }
};

/* =========================================================
   🗂️ KELİME GRUPLARI (Özet tablolar → "Kelime grupları" sekmesi)
   Ünitelerdeki gruplardan kurulur; her kelime kendi ünitesi açılınca görünür, hiç açık kelimesi olmayan
   tablo kilitli kart olarak durur. Yeni kelime eklenmez.
   bolumler: [{ ad, grup: [ünite, 'grup adı'] | kelimeler: [kelimeId…], haric: [kelimeId…] }]
   bicim:
     liste : İspanyolca · Türkçe (simge: { kelimeId: '➡️' } isteğe bağlı)
     cift  : Türkçe · eril · dişil ("médico / médica" ya da ciftler: [[erilId, dişilId]], tekler: [kelimeId])
     zit   : ciftler: [[id, id]] → yan yana zıt anlamlılar
     renk  : renk karesi (renkler: { kelimeId: '#rrggbb' }) · İspanyolca · Türkçe
     sayi  : ızgara (rakam + yazı)
     saat  : liste + ornekler: [['3:15', 'Son las tres y cuarto.', 'u10'], …]
   ========================================================= */
ICERIK.temalar = [
  { id: 'sayilar', baslik: '🔢 Sayılar', bicim: 'sayi', bolumler: [
    { ad: '0–10', grup: ['u03', 'Sayılar 0–10'] },
    { ad: '11–20', grup: ['u03', 'Sayılar 11–20'] },
    { ad: '21–29: veinti + sayı', grup: ['u09', '21–29'] },
    { ad: 'Onlar', grup: ['u09', 'Onluklar'] },
    { ad: '31 ve sonrası: onlar + y + sayı', grup: ['u09', 'Bileşik sayılar'] },
    { ad: 'Binler', kelimeler: ['u09_mil', 'u09_dosmil', 'u09_cincomil', 'u09_diezmil', 'u09_cienmil', 'u09_millon'] }
  ], rakamlar: { u09_mil: '1.000', u09_dosmil: '2.000', u09_cincomil: '5.000', u09_diezmil: '10.000', u09_cienmil: '100.000', u09_millon: '1.000.000' } },
  { id: 'milliyet', baslik: '🌎 Milliyetler', bicim: 'cift', bolumler: [{ grup: ['u04', 'Milliyet'], haric: ['u04_pais'] }] },
  { id: 'meslek', baslik: '👩‍⚕️ Meslekler', bicim: 'cift', bolumler: [{ grup: ['u04', 'Meslekler'], haric: ['u04_dedicas'] }] },
  { id: 'renk', baslik: '🎨 Renkler', bicim: 'renk', bolumler: [{ grup: ['u15', 'Renkler'], haric: ['u15_color'] }],
    renkler: { u15_rojo: '#e53935', u15_azul: '#1e88e5', u15_verde: '#43a047', u15_amarillo: '#fdd835', u15_negro: '#111111',
      u15_blanco: '#fafafa', u15_naranja: '#fb8c00', u15_rosa: '#f48fb1', u15_cafe: '#795548' } },
  { id: 'zit', baslik: '⚖️ Zıt anlamlılar', bicim: 'zit', ciftler: [
    ['u02_bien', 'u02_mal'], ['u04_grande', 'u04_pequeno'], ['u05_abierto', 'u05_cerrado'], ['u05_limpio', 'u05_sucio'],
    ['u07_siempre', 'u07_nunca'], ['u10_temprano', 'u10_tardeadv'], ['u11_cerca', 'u11_lejos'],
    ['u15_nuevo', 'u15_viejo'], ['u15_bonito', 'u15_feo'], ['u15_alto', 'u15_bajo'], ['u15_caro', 'u15_barato'],
    ['u15_bueno', 'u15_malo'], ['u15_facil', 'u15_dificil'], ['u15_largo', 'u15_corto'], ['u15_mejor', 'u15_peor']
  ] },
  { id: 'zaman', baslik: '🗓️ Zaman', bicim: 'liste', bolumler: [
    { ad: 'Şimdi, bugün, yarın', kelimeler: ['u05_ahora', 'u05_hoy', 'u19_manana', 'u19_ayer', 'u10_despues', 'u10_mastarde', 'u10_todavia', 'u10_enseguida'] },
    { ad: 'Ne sıklıkla?', kelimeler: ['u07_siempre', 'u26_normalmente', 'u26_aveces', 'u07_nunca'] },
    { ad: 'Günün bölümleri', kelimeler: ['u26_pormanana', 'u26_portarde', 'u26_pornoche', 'u10_mediodia', 'u10_medianoche'] },
    { ad: 'Haftanın günleri', grup: ['u19', 'Haftanın günleri'] },
    { ad: 'Aylar', grup: ['u19', 'Aylar'] },
    { ad: 'Mevsimler', grup: ['u27', 'Mevsimler'] },
    { ad: 'Zaman birimleri', grup: ['u19', 'Zaman birimleri'] }
  ] },
  { id: 'saat', baslik: '🕐 Saat', bicim: 'saat', bolumler: [
    { ad: 'Sormak', grup: ['u10', 'Saati sormak'] },
    { ad: 'Söylemek', grup: ['u10', 'Saati söylemek'] }
  ], ornekler: [
    ['1:00', 'Es la una.', 'u10'], ['2:00', 'Son las dos en punto.', 'u10'], ['3:15', 'Son las tres y cuarto.', 'u10'],
    ['3:30', 'Son las tres y media.', 'u10'], ['3:45', 'Son las cuatro menos cuarto.', 'u10'], ['10:20', 'Son las diez y veinte.', 'u10']
  ] },
  { id: 'yon', baslik: '🧭 Yön ve konum', bicim: 'liste', bolumler: [
    { ad: 'Yönler', grup: ['u11', 'Yönler'] },
    { ad: 'Konum', grup: ['u11', 'Konum'] }
  ], simge: { u11_derecha: '➡️', u11_izquierda: '⬅️', u11_derecho: '⬆️', u11_doble: '↪️', u11_siga: '⏩', u11_cerca: '📍',
    u11_lejos: '🔭', u11_lado: '↔️', u11_enfrente: '🔁', u11_esquina: '📐', u11_calle: '🛣️' } },
  { id: 'aile', baslik: '👨‍👩‍👧 Aile', bicim: 'cift', ciftler: [
    ['u20_padre', 'u20_madre'], ['u20_hermano', 'u20_hermana'], ['u20_hijo', 'u20_hija'], ['u20_abuelo', 'u20_abuela'],
    ['u20_esposo', 'u20_esposa'], ['u20_tio', 'u20_tia'], ['u20_nino', 'u20_nina']
  ], tekler: ['u20_familia', 'u20_padres', 'u20_bebe'] },
  { id: 'yemek', baslik: '🍽️ Yiyecek ve içecek', bicim: 'liste', bolumler: [
    { ad: 'İlk kelimeler', grup: ['u01', 'Yiyecek-içecek'] },
    { ad: 'İçecekler', grup: ['u06', 'İçecekler'] },
    { ad: 'Yemekler', grup: ['u06', 'Yemekler'] },
    { ad: 'Meyveler', grup: ['u22', 'Meyveler'] },
    { ad: 'Sebzeler', grup: ['u22', 'Sebzeler'] },
    { ad: 'Temel gıdalar', grup: ['u22', 'Temel gıdalar'] }
  ] },
  { id: 'vucut', baslik: '🩺 Vücut ve sağlık', bicim: 'liste', bolumler: [
    { ad: 'Vücut', grup: ['u17', 'Vücut'] },
    { ad: 'Ağrılar ve hastalık', grup: ['u17', 'Ağrılar ve hastalık'] }
  ] },
  { id: 'hava', baslik: '☀️ Hava ve mevsimler', bicim: 'liste', bolumler: [
    { ad: 'Hava nasıl?', grup: ['u27', 'Hava nasıl?'] },
    { ad: 'Kelimeler', grup: ['u27', 'Hava ile ilgili kelimeler'] },
    { ad: 'Mevsimler', grup: ['u27', 'Mevsimler'] }
  ] }
];
