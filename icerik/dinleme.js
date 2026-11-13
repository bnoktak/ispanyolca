/* =========================================================
   🎧 UZUN DİNLEME SAHNELERİ (büyük sınav; ileride alıştırmalar)
   {
     id: 'd1_01', blok: 'b01' (büyük sınav), uid: 'u02' (tüm İspanyolca metin bu üniteye kadar öğretilmiş kelimelerle),
     sahne: 'Tanışma' (yer / durum, Türkçe),
     satirlar: [['A', 'İspanyolca'], ['B', 'İspanyolca']]   // A ve B iki farklı sesle okunur
     tr: 'Türkçesi (sınav sonunda gösterilir)',
     anla:  { soru: 'Türkçe soru', siklar: ['DOĞRU', 'yanlış', 'yanlış', 'yanlış'] }        // Türkçe şıklar
     cevap: { soru: 'Türkçe soru', siklar: ['DOĞRU cevap', 'uymayan', 'uymayan', 'uymayan'] } // İspanyolca şıklar
   }
   Şıkların İLKİ doğrudur (gösterirken karıştırılır). "cevap" yanlış şıkları dilbilgisi olarak doğru ama duruma uymaz.
   `node denetim.js` İspanyolca metinleri ve cevap şıklarını uid'ye göre denetler.
   ========================================================= */
ICERIK.dinlemeler = [
  // ---------- Blok 1 · Ünite 1–5 ----------
  { id: 'd1_01', blok: 'b01', uid: 'u02', sahne: 'Tanışma',
    satirlar: [['A', 'Hola, buenos días. Me llamo Ana. ¿Cómo te llamas?']],
    tr: 'Merhaba, günaydın. Benim adım Ana. Senin adın ne?',
    anla: { soru: 'Kadının adı ne?', siklar: ['Ana', 'Laura', 'Sofía', 'María'] },
    cevap: { soru: 'Ne cevap verirsin?', siklar: ['Me llamo Batuhan. Mucho gusto.', 'Soy de Turquía, ¿y tú?', 'Muy bien, gracias.', 'De nada, señora.'] } },

  { id: 'd1_02', blok: 'b01', uid: 'u02', sahne: 'Sokakta biri sana soruyor',
    satirlar: [['A', 'Perdón, ¿hablas inglés? Yo no hablo español muy bien.']],
    tr: 'Pardon, İngilizce konuşuyor musun? Ben çok iyi İspanyolca konuşmuyorum.',
    anla: { soru: 'Adam ne soruyor?', siklar: ['İngilizce konuşup konuşmadığını', 'Nereli olduğunu', 'Adını', 'Nasıl olduğunu'] },
    cevap: { soru: 'Biraz İngilizce biliyorsun. Ne dersin?', siklar: ['Sí, un poco.', 'Me llamo Ana.', 'Hasta mañana.', 'Con permiso.'] } },

  { id: 'd1_03', blok: 'b01', uid: 'u05', sahne: 'Bir kafede sohbet',
    satirlar: [['A', 'Yo soy de Colombia, pero vivo en Ankara. ¿Y tú, de dónde eres?']],
    tr: 'Ben Kolombiyalıyım ama Ankara\'da yaşıyorum. Ya sen, nerelisin?',
    anla: { soru: 'Kadın nerede yaşıyor?', siklar: ['Ankara\'da', 'Kolombiya\'da', 'Peru\'da', 'Arjantin\'de'] },
    cevap: { soru: 'Ne cevap verirsin?', siklar: ['Soy de Turquía.', 'Vivo en un hotel.', 'Soy ingeniero.', 'Tengo veinte años.'] } },

  { id: 'd1_04', blok: 'b01', uid: 'u03', sahne: 'Tanışma',
    satirlar: [['A', '¿Cuántos años tienes? Yo tengo diecinueve.']],
    tr: 'Kaç yaşındasın? Ben on dokuz yaşındayım.',
    anla: { soru: 'Kız kaç yaşında?', siklar: ['19', '9', '17', '20'] },
    cevap: { soru: 'Ne cevap verirsin?', siklar: ['Tengo veinte años.', 'Tengo dos gatos.', 'Soy de Colombia.', 'Hay diez casas.'] } },

  { id: 'd1_05', blok: 'b01', uid: 'u04', sahne: 'Bir partide iki kişi',
    satirlar: [['A', '¿A qué te dedicas?'], ['B', 'Soy médica. Trabajo en Ankara. ¿Y tú?']],
    tr: '— Ne iş yapıyorsun? — Doktorum. Ankara\'da çalışıyorum. Ya sen?',
    anla: { soru: 'Kadın ne iş yapıyor?', siklar: ['Doktor', 'Öğretmen', 'Garson', 'Polis'] },
    cevap: { soru: 'Sıra sende. Ne dersin?', siklar: ['Soy ingeniero.', 'Vivo en Ankara.', 'Muy bien, gracias.', 'Sí, claro.'] } },

  { id: 'd1_06', blok: 'b01', uid: 'u05', sahne: 'Bir arkadaşın',
    satirlar: [['A', 'Hola, ¿cómo estás? Yo estoy muy cansada hoy.']],
    tr: 'Merhaba, nasılsın? Ben bugün çok yorgunum.',
    anla: { soru: 'Kadın bugün nasıl?', siklar: ['Çok yorgun', 'Çok mutlu', 'Hasta', 'Meşgul'] },
    cevap: { soru: 'Ne cevap verirsin?', siklar: ['Lo siento. Yo estoy bien.', 'Soy de Turquía.', 'Me llamo Ana.', 'Hasta mañana.'] } },

  { id: 'd1_07', blok: 'b01', uid: 'u05', sahne: 'Otelde bir turist',
    satirlar: [['A', 'Perdón, señor. ¿Dónde está el baño?']],
    tr: 'Pardon beyefendi. Tuvalet nerede?',
    anla: { soru: 'Kadın ne arıyor?', siklar: ['Tuvaleti', 'Oteli', 'Sinemayı', 'Plajı'] },
    cevap: { soru: 'Tuvalet orada. Ne dersin?', siklar: ['Está allí.', 'Estoy bien.', 'Soy de aquí.', 'Tengo un baño.'] } },

  { id: 'd1_08', blok: 'b01', uid: 'u05', sahne: 'Telefonda',
    satirlar: [['A', 'Hola, ¿dónde estás? Yo estoy en el hotel con Ana. Estamos muy contentos.']],
    tr: 'Merhaba, neredesin? Ben Ana\'yla oteldeyim. Çok mutluyuz.',
    anla: { soru: 'Konuşan kişi şu an nerede?', siklar: ['Otelde', 'Plajda', 'Evde', 'Sinemada'] },
    cevap: { soru: 'Sen plajdasın. Ne dersin?', siklar: ['Estoy en la playa.', 'Soy de la playa.', 'Tengo una playa.', 'Hay una playa.'] } },

  { id: 'd1_09', blok: 'b01', uid: 'u04', sahne: 'Bir arkadaşını tanıştırıyor',
    satirlar: [['A', 'Él es mi amigo. Es peruano y es profesor. Es muy simpático.']],
    tr: 'O benim arkadaşım. Perulu ve öğretmen. Çok sempatik.',
    anla: { soru: 'Arkadaşı nereli?', siklar: ['Perulu', 'Kolombiyalı', 'Arjantinli', 'Brezilyalı'] },
    cevap: { soru: 'Arkadaşıyla tanışıyorsun. Ne dersin?', siklar: ['Mucho gusto.', 'De nada.', 'Lo siento.', 'Hasta luego.'] } },

  { id: 'd1_10', blok: 'b01', uid: 'u05', sahne: 'Plajda küçük bir büfe',
    satirlar: [['A', 'Hola. Tenemos agua, cerveza y helado de chocolate. ¿Otra cerveza?']],
    tr: 'Merhaba. Su, bira ve çikolatalı dondurmamız var. Bir bira daha?',
    anla: { soru: 'Büfede neler var?', siklar: ['Su, bira ve dondurma', 'Kahve ve çay', 'Şarap ve peynir', 'Meyve suyu ve ekmek'] },
    cevap: { soru: 'Bir bira daha istiyorsun. Ne dersin?', siklar: ['Sí, por favor.', 'Soy de Colombia.', 'Estoy en casa.', 'Me llamo Ana.'] } },

  { id: 'd1_11', blok: 'b01', uid: 'u03', sahne: 'Adını söyledin ama anlamadı',
    satirlar: [['A', 'Perdón, no entiendo. ¿Otra vez, por favor? Hablo un poco de español.']],
    tr: 'Pardon, anlamıyorum. Bir daha, lütfen? Biraz İspanyolca konuşuyorum.',
    anla: { soru: 'Adam ne istiyor?', siklar: ['Tekrar söylemeni', 'Su', 'Adını yazmanı', 'Yardım'] },
    cevap: { soru: 'Ne dersin?', siklar: ['Claro. Me llamo Batuhan.', 'No, gracias.', 'Hasta mañana.', 'Tengo dos perros.'] } },

  { id: 'd1_12', blok: 'b01', uid: 'u05', sahne: 'Bir arkadaşını arıyorsun',
    satirlar: [['A', 'Lo siento, ahora estoy ocupado. Estoy en el hotel. ¿Hasta luego?']],
    tr: 'Kusura bakma, şu an meşgulüm. Oteldeyim. Sonra görüşelim mi?',
    anla: { soru: 'Arkadaşın neden konuşamıyor?', siklar: ['Meşgul', 'Hasta', 'Yorgun', 'Üzgün'] },
    cevap: { soru: 'Ne cevap verirsin?', siklar: ['Claro, hasta luego.', 'Mucho gusto.', 'Soy estudiante.', 'Hay un hotel.'] } },

  // ---------- Blok 2 · Ünite 6–10 ----------
  { id: 'd2_01', blok: 'b02', uid: 'u06', sahne: 'Restoranda garson',
    satirlar: [['A', 'Buenas noches. Hoy tenemos pescado, pollo con arroz y sopa. El pescado está muy rico.']],
    tr: "İyi akşamlar. Bugün balık, pilavlı tavuk ve çorbamız var. Balık çok lezzetli.",
    anla: { soru: "Garson hangi yemeği öneriyor?", siklar: ["Balık", "Tavuk", "Çorba", "Et"] },
    cevap: { soru: "Balık istiyorsun. Ne dersin?", siklar: ['Quisiera el pescado, por favor.', 'El pescado está aquí.', 'No como pescado.', 'Soy de pescado.'] } },

  { id: 'd2_02', blok: 'b02', uid: 'u10', sahne: 'Hesabı ödüyorsun',
    satirlar: [['A', 'Son cuarenta y cinco mil pesos. ¿Algo más?']],
    tr: "Kırk beş bin peso. Başka bir şey?",
    anla: { soru: "Hesap ne kadar?", siklar: ["45.000 peso", "55.000 peso", "4.500 peso", "35.000 peso"] },
    cevap: { soru: "Başka bir şey istemiyorsun. Ne dersin?", siklar: ['No, gracias.', 'Sí, soy de aquí.', 'Tengo cuarenta años.', 'Son las cinco.'] } },

  { id: 'd2_03', blok: 'b02', uid: 'u07', sahne: 'Barda biri yanına geliyor',
    satirlar: [['A', '¡Hola! ¿Qué quieres tomar? Te invito. Hay cerveza, ron y cócteles.']],
    tr: "Merhaba! Ne içersin? Benden. Bira, rom ve kokteyl var.",
    anla: { soru: "Adam ne yapıyor?", siklar: ["Sana içki ısmarlıyor", "Hesabı istiyor", "Dans etmek istiyor", "Seni yemeğe çağırıyor"] },
    cevap: { soru: "Bira istiyorsun. Ne dersin?", siklar: ['Una cerveza bien fría, gracias.', 'No me gusta bailar.', 'Te invito a un café.', 'Tengo una cerveza en casa.'] } },

  { id: 'd2_04', blok: 'b02', uid: 'u10', sahne: 'Gece kulübünde',
    satirlar: [['A', 'Me encanta esta música. ¿Bailamos? Yo bailo salsa muy mal, pero me gusta mucho.']],
    tr: "Bu müziğe bayılıyorum. Dans edelim mi? Ben çok kötü salsa yaparım ama çok severim.",
    anla: { soru: "Kadın salsa için ne diyor?", siklar: ["Kötü dans ettiğini ama çok sevdiğini", "Çok iyi dans ettiğini", "Hiç dans etmediğini", "Salsayı sevmediğini"] },
    cevap: { soru: "Kabul ediyorsun. Ne dersin?", siklar: ['¡Claro, vamos!', 'No, nunca como salsa.', 'Soy de Colombia.', 'Son las diez.'] } },

  { id: 'd2_05', blok: 'b02', uid: 'u10', sahne: 'Partide tanıştığın biri',
    satirlar: [['A', 'Me caes muy bien. ¿Tienes WhatsApp? ¿Me das tu número?']],
    tr: "Seni çok sevdim. WhatsApp'ın var mı? Numaranı verir misin?",
    anla: { soru: "Kız ne istiyor?", siklar: ["Telefon numaranı", "Adını", "Hesabı", "Bir içki"] },
    cevap: { soru: "Numaranı vermek istiyorsun. Ne dersin?", siklar: ['Sí, claro. Tengo WhatsApp.', 'No, gracias. Tengo novia.', 'Me gusta la salsa.', 'Son las ocho.'] } },

  { id: 'd2_06', blok: 'b02', uid: 'u10', sahne: 'Sokakta saati soruyorsun',
    satirlar: [['A', 'Perdón, ¿qué hora es?'], ['B', 'Son las once y media de la noche. Es tarde.']],
    tr: "— Pardon, saat kaç? — Gece on bir buçuk. Geç oldu.",
    anla: { soru: "Saat kaç?", siklar: ["23:30", "11:15", "22:30", "00:30"] },
    cevap: { soru: "Ne dersin?", siklar: ['Sí, es muy tarde. Gracias.', 'Sí, tengo once años.', 'Hay once mesas.', 'Es la una.'] } },

  { id: 'd2_07', blok: 'b02', uid: 'u09', sahne: 'Sokak büfesi',
    satirlar: [['A', 'La empanada cuesta tres mil pesos y el jugo cinco mil.']],
    tr: "Empanada üç bin peso, meyve suyu beş bin.",
    anla: { soru: "Meyve suyu kaç peso?", siklar: ["5.000", "3.000", "8.000", "15.000"] },
    cevap: { soru: "İkisini de istiyorsun. Ne dersin?", siklar: ['Una empanada y un jugo, por favor.', 'No tengo empanadas.', 'Me gusta el vino.', 'Tengo tres pesos.'] } },

  { id: 'd2_08', blok: 'b02', uid: 'u10', sahne: 'Yeni bir arkadaş plan yapıyor',
    satirlar: [['A', '¿Nos vemos mañana a las ocho en el bar? La fiesta empieza a las nueve.']],
    tr: "Yarın saat sekizde barda görüşelim mi? Parti dokuzda başlıyor.",
    anla: { soru: "Barda saat kaçta buluşacaksınız?", siklar: ["8'de", "9'da", "10'da", "7'de"] },
    cevap: { soru: "Uygun. Ne dersin?", siklar: ['¡Claro! Hasta mañana.', 'No, soy de la fiesta.', 'Son las nueve y media.', 'Tengo ocho años.'] } },

  { id: 'd2_09', blok: 'b02', uid: 'u10', sahne: 'Garsonsun, bir müşteri seslendi',
    satirlar: [['A', '¡Disculpe! ¿Me trae la cuenta, por favor? Y otro tenedor.']],
    tr: "Pardon! Hesabı getirir misiniz, lütfen? Bir de çatal.",
    anla: { soru: "Kadın neler istiyor?", siklar: ["Hesap ve bir çatal", "Menü ve su", "Kaşık ve peçete", "Hesap ve bıçak"] },
    cevap: { soru: "Garson olarak ne dersin?", siklar: ['Enseguida, señora.', 'Son las seis.', 'No me gusta.', 'Mucho gusto.'] } },

  { id: 'd2_10', blok: 'b02', uid: 'u06', sahne: 'Restoranda acı mı diye soruyorsun',
    satirlar: [['A', '¿Pica la sopa?'], ['B', 'Sí, pica un poco. Tiene ají. ¿Quiere una sopa sin ají?']],
    tr: "— Çorba acı mı? — Evet, biraz acı. İçinde acı biber var. Acısız bir çorba ister misiniz?",
    anla: { soru: "Çorba nasıl?", siklar: ["Biraz acı", "Çok acı", "Soğuk", "Acısız"] },
    cevap: { soru: "Acısız istiyorsun. Ne dersin?", siklar: ['Sí, sin ají, por favor.', 'Sí, soy picante.', 'No, tengo una sopa.', 'Sí, en la mesa.'] } },

  { id: 'd2_11', blok: 'b02', uid: 'u09', sahne: 'Barda tanışma',
    satirlar: [['A', 'Hola, me llamo Ana. Tengo treinta y dos años y trabajo en un restaurante.']],
    tr: "Merhaba, adım Ana. Otuz iki yaşındayım ve bir restoranda çalışıyorum.",
    anla: { soru: "Ana kaç yaşında?", siklar: ["32", "22", "30", "42"] },
    cevap: { soru: "Sen otuz yaşındasın. Ne dersin?", siklar: ['Yo tengo treinta años.', 'Yo soy un restaurante.', 'Son treinta pesos.', 'Es la una.'] } },

  { id: 'd2_12', blok: 'b02', uid: 'u10', sahne: 'Gece kulübünün kapısında',
    satirlar: [['A', 'La discoteca abre a las diez y cierra a las tres de la mañana. La entrada cuesta veinte mil pesos.']],
    tr: "Gece kulübü saat onda açılıyor, sabah üçte kapanıyor. Giriş yirmi bin peso.",
    anla: { soru: "Gece kulübü saat kaçta kapanıyor?", siklar: ["Sabah 3'te", "Gece 10'da", "Gece 12'de", "Sabah 5'te"] },
    cevap: { soru: "Gitmek istiyorsun. Arkadaşına ne dersin?", siklar: ['¡Chévere! ¿Vamos a las diez?', 'Sí, soy de la discoteca.', 'Son las tres y cuarto.', 'Tengo veinte pesos.'] } },

  // ---------- Blok 3 · Ünite 11–15 ----------
  { id: 'd3_01', blok: 'b03', uid: 'u11', sahne: 'Yol soruyorsun',
    satirlar: [['A', 'Disculpe, ¿cómo llego al museo?'], ['B', 'Siga todo recto dos cuadras y doble a la izquierda. El museo está enfrente del banco.']],
    tr: "— Affedersiniz, müzeye nasıl giderim? — İki blok dümdüz gidin ve sola dönün. Müze bankanın karşısında.",
    anla: { soru: "Müze nerede?", siklar: ["Bankanın karşısında", "Bankanın yanında", "Eczanenin karşısında", "İstasyonun yanında"] },
    cevap: { soru: "Teşekkür ediyorsun. Ne dersin?", siklar: ['Muchas gracias, señor.', 'Sí, soy del museo.', 'Doble a la derecha.', 'Tengo un banco.'] } },

  { id: 'd3_02', blok: 'b03', uid: 'u11', sahne: 'Taksiye biniyorsun',
    satirlar: [['A', '¿Al aeropuerto? Son cuarenta mil pesos. Está lejos, a una hora.']],
    tr: "Havalimanına mı? Kırk bin peso. Uzak, bir saat.",
    anla: { soru: "Havalimanı ne kadar uzakta?", siklar: ["Bir saat", "On dakika", "İki saat", "Yarım saat"] },
    cevap: { soru: "Kabul ediyorsun. Ne dersin?", siklar: ['Está bien. Vamos.', 'No, soy de aquí.', 'Doble a la izquierda.', 'Tengo cuarenta años.'] } },

  { id: 'd3_03', blok: 'b03', uid: 'u12', sahne: 'Otel resepsiyonu',
    satirlar: [['A', 'Buenas tardes, bienvenido. ¿Tiene una reserva? Su pasaporte, por favor.']],
    tr: "İyi günler, hoş geldiniz. Rezervasyonunuz var mı? Pasaportunuz, lütfen.",
    anla: { soru: "Resepsiyonist ne istiyor?", siklar: ["Pasaportunu", "Anahtarı", "Valizini", "Parayı"] },
    cevap: { soru: "Rezervasyonun var. Ne dersin?", siklar: ['Sí, tengo una reserva a nombre de Yılmaz.', 'Sí, soy de la recepción.', 'Mi maleta es grande.', 'Una habitación, por favor, mañana.'] } },

  { id: 'd3_04', blok: 'b03', uid: 'u13', sahne: 'Otelde odanı veriyorlar',
    satirlar: [['A', 'Su habitación está en el tercer piso. El desayuno está incluido y la salida es a las doce.']],
    tr: "Odanız üçüncü katta. Kahvaltı dahil, çıkış saat on ikide.",
    anla: { soru: "Çıkış saat kaçta?", siklar: ["Saat 12'de", "Saat 10'da", "Saat 3'te", "Saat 8'de"] },
    cevap: { soru: "Asansörü soruyorsun. Ne dersin?", siklar: ['¿Dónde está el ascensor?', '¿Cuánto cuesta el piso?', 'Tengo tres pisos.', 'Son las doce.'] } },

  { id: 'd3_05', blok: 'b03', uid: 'u13', sahne: 'Resepsiyondasın, bir misafir geldi',
    satirlar: [['A', 'Perdón, el aire acondicionado no funciona y no hay toallas en el baño.']],
    tr: "Pardon, klima çalışmıyor ve banyoda havlu yok.",
    anla: { soru: "Sorun ne?", siklar: ["Klima çalışmıyor ve havlu yok", "Duş çalışmıyor", "Anahtar kayıp", "Oda kirli"] },
    cevap: { soru: "Resepsiyonist olarak ne dersin?", siklar: ['Lo siento. Enseguida.', 'Sí, me gusta el baño.', 'No, gracias.', 'Tengo una toalla.'] } },

  { id: 'd3_06', blok: 'b03', uid: 'u13', sahne: 'Arkadaşın evini anlatıyor',
    satirlar: [['A', 'Mi apartamento es pequeño pero cómodo. Tiene un dormitorio, una cocina y un baño.']],
    tr: "Dairem küçük ama rahat. Bir yatak odası, bir mutfak ve bir banyosu var.",
    anla: { soru: "Dairede kaç yatak odası var?", siklar: ["Bir", "İki", "Üç", "Hiç"] },
    cevap: { soru: "Ne dersin?", siklar: ['¡Qué bien! Me gusta.', 'Sí, la cocina no funciona.', 'Vivo en una cama.', 'Son las tres.'] } },

  { id: 'd3_07', blok: 'b03', uid: 'u14', sahne: 'Meydanda bir turist',
    satirlar: [['A', 'Perdón, ¿me toma una foto con la iglesia, por favor?']],
    tr: "Pardon, kiliseyle bir fotoğrafımı çeker misiniz, lütfen?",
    anla: { soru: "Kadın ne istiyor?", siklar: ["Kiliseyle fotoğrafını çekmeni", "Kilisenin yerini", "Bir harita", "Giriş ücretini"] },
    cevap: { soru: "Seve seve çekersin. Ne dersin?", siklar: ['Claro, con mucho gusto.', 'No, la iglesia está cerrada.', 'Sí, soy turista.', 'La foto cuesta mil pesos.'] } },

  { id: 'd3_08', blok: 'b03', uid: 'u14', sahne: 'Tur şirketinde',
    satirlar: [['A', 'El tour a la isla empieza a las ocho. Incluye la comida, pero el protector solar no.']],
    tr: "Ada turu saat sekizde başlıyor. Yemek dahil ama güneş kremi değil.",
    anla: { soru: "Tura ne dahil değil?", siklar: ["Güneş kremi", "Yemek", "Ada gezisi", "Hiçbir şey"] },
    cevap: { soru: "Fiyatı soruyorsun. Ne dersin?", siklar: ['¿Cuánto cuesta el tour?', 'Me encanta la comida.', 'Son las ocho en punto.', 'La isla está cerca.'] } },

  { id: 'd3_09', blok: 'b03', uid: 'u14', sahne: 'Plajda bir görevli',
    satirlar: [['A', 'Aquí no se puede nadar, pero en la otra playa sí. Está a diez minutos a pie.']],
    tr: "Burada yüzülmez ama öbür plajda olur. Yürüyerek on dakika.",
    anla: { soru: "Nerede yüzebilirsin?", siklar: ["Öbür plajda", "Burada", "Nehirde", "Otelin havuzunda"] },
    cevap: { soru: "Ne dersin?", siklar: ['Gracias, vamos a la otra playa.', 'No, soy de la playa.', 'Tengo diez minutos.', 'Me gusta el museo.'] } },

  { id: 'd3_10', blok: 'b03', uid: 'u15', sahne: 'Ev arıyorsunuz',
    satirlar: [['A', 'Esta casa es muy bonita, pero es cara. La casa blanca es más barata y más grande.']],
    tr: "Bu ev çok güzel ama pahalı. Beyaz ev daha ucuz ve daha büyük.",
    anla: { soru: "Hangi ev daha ucuz?", siklar: ["Beyaz ev", "Kırmızı ev", "Bu ev", "Küçük ev"] },
    cevap: { soru: "Ne dersin?", siklar: ['Entonces, la casa blanca es mejor.', 'Sí, la casa es muy fea.', 'No, el blanco es un color.', 'Son las dos.'] } },

  { id: 'd3_11', blok: 'b03', uid: 'u15', sahne: 'Arkadaşın şehri anlatıyor',
    satirlar: [['A', '¿Qué tal la ciudad?'], ['B', 'Es muy interesante, pero el centro es feo y el museo es aburrido.']],
    tr: "— Şehir nasıl? — Çok ilginç ama merkez çirkin ve müze sıkıcı.",
    anla: { soru: "Müze nasılmış?", siklar: ["Sıkıcı", "İlginç", "Güzel", "Pahalı"] },
    cevap: { soru: "Plajı sormak istiyorsun. Ne dersin?", siklar: ['¿Y la playa? ¿Es bonita?', 'Sí, el museo está cerca.', 'Tengo un museo.', 'Son las once.'] } },

  { id: 'd3_12', blok: 'b03', uid: 'u15', sahne: 'Otelde ulaşım soruyorsun',
    satirlar: [['A', 'Para el aeropuerto, tome el bus en la esquina. Es más barato que el taxi.']],
    tr: "Havalimanı için köşeden otobüse binin. Taksiden daha ucuz.",
    anla: { soru: "Havalimanına nasıl gitmeli?", siklar: ["Köşeden otobüse binerek", "Taksiyle", "Metroyla", "Yürüyerek"] },
    cevap: { soru: "Durağı soruyorsun. Ne dersin?", siklar: ['Gracias. ¿Dónde está la parada?', 'Sí, el bus es mi amigo.', 'No, el aeropuerto es azul.', 'Tengo una esquina.'] } },

  // ---------- Blok 4 · Ünite 16–20 ----------
  { id: 'd4_01', blok: 'b04', uid: 'u16', sahne: 'Giyim mağazası',
    satirlar: [['A', 'Esta camisa cuesta ochenta mil pesos, pero hoy hay descuento. Son sesenta mil.']],
    tr: "Bu gömlek seksen bin peso ama bugün indirim var. Altmış bin.",
    anla: { soru: "Gömlek bugün kaç para?", siklar: ["60.000 peso", "80.000 peso", "16.000 peso", "70.000 peso"] },
    cevap: { soru: "Denemek istiyorsun. Ne dersin?", siklar: ['¿Me la puedo probar?', 'Sí, solo estoy mirando la cuenta.', 'No, la camisa es mi amiga.', 'Son las seis.'] } },

  { id: 'd4_02', blok: 'b04', uid: 'u18', sahne: 'Küçük bir dükkânda ödüyorsun',
    satirlar: [['A', 'Lo siento, aquí no aceptan tarjeta, solo efectivo. Hay un cajero en la esquina.']],
    tr: "Kusura bakmayın, burada kart geçmiyor, sadece nakit. Köşede bir ATM var.",
    anla: { soru: "Nasıl ödeyebilirsin?", siklar: ["Sadece nakit", "Kartla", "Dolarla", "Telefonla"] },
    cevap: { soru: "Ne dersin?", siklar: ['Está bien. Voy al cajero.', 'Sí, me lo llevo en la esquina.', 'No tengo esquina.', 'Me duele la cabeza.'] } },

  { id: 'd4_03', blok: 'b04', uid: 'u19', sahne: 'Doktordasın',
    satirlar: [['A', 'Buenos días. ¿Qué le pasa?'], ['B', 'Me duele la garganta y tengo fiebre desde el lunes.'], ['A', '¿Es alérgico a la penicilina?']],
    tr: "— Günaydın. Neyiniz var? — Boğazım ağrıyor ve pazartesiden beri ateşim var. — Penisiline alerjiniz var mı?",
    anla: { soru: "Hasta ne zamandan beri ateşli?", siklar: ["Pazartesiden beri", "Dünden beri", "Bir haftadır", "Bugünden beri"] },
    cevap: { soru: "Alerjin yok. Ne dersin?", siklar: ['No, no soy alérgico.', 'Sí, me duele la penicilina.', 'El lunes, gracias.', 'Tengo una receta de pescado.'] } },

  { id: 'd4_04', blok: 'b04', uid: 'u17', sahne: 'Eczanede',
    satirlar: [['A', 'Tome una pastilla con agua después de la comida. No necesita receta.']],
    tr: "Yemekten sonra suyla bir hap alın. Reçete gerekmiyor.",
    anla: { soru: "Hapı ne zaman almalısın?", siklar: ["Yemekten sonra", "Yemekten önce", "Sabah aç karnına", "Yatarken"] },
    cevap: { soru: "Fiyatı soruyorsun. Ne dersin?", siklar: ['Muchas gracias. ¿Cuánto cuesta?', 'Sí, me duele el agua.', 'No, la pastilla es de mi amigo.', 'Tengo una receta de arroz.'] } },

  { id: 'd4_05', blok: 'b04', uid: 'u18', sahne: 'Sokakta biri yardım istiyor',
    satirlar: [['A', 'Perdón, estoy perdido y me robaron el celular. ¿Me puede ayudar?']],
    tr: "Pardon, kayboldum ve telefonumu çaldılar. Bana yardım edebilir misiniz?",
    anla: { soru: "Adamın başına ne gelmiş?", siklar: ["Kaybolmuş ve telefonu çalınmış", "Pasaportunu kaybetmiş", "Hasta olmuş", "Otobüsü kaçırmış"] },
    cevap: { soru: "Polis yakında. Ne dersin?", siklar: ['Tranquilo. La policía está cerca.', 'Sí, mi celular es nuevo.', 'No, el celular es azul.', 'Me caes bien.'] } },

  { id: 'd4_06', blok: 'b04', uid: 'u19', sahne: 'Otel çalışanı uyarıyor',
    satirlar: [['A', 'Este barrio es tranquilo de día, pero de noche es peligroso. Toma un taxi y no dar papaya.']],
    tr: "Bu mahalle gündüz sakin ama gece tehlikeli. Taksiye bin ve kendini hedef yapma.",
    anla: { soru: "Mahalle ne zaman tehlikeli?", siklar: ["Gece", "Gündüz", "Hafta sonu", "Hiçbir zaman"] },
    cevap: { soru: "Ne dersin?", siklar: ['Gracias, voy en taxi.', 'Sí, soy peligroso.', 'No, el taxi es tranquilo.', 'Me duele el pie.'] } },

  { id: 'd4_07', blok: 'b04', uid: 'u18', sahne: 'Döviz bozdurmak',
    satirlar: [['A', 'En la casa de cambio pagan cuatro mil pesos por un dólar. En el banco, solo tres mil.']],
    tr: "Döviz bürosunda bir dolara dört bin peso veriyorlar. Bankada sadece üç bin.",
    anla: { soru: "Doları nerede daha iyi bozdurursun?", siklar: ["Döviz bürosunda", "Bankada", "Otelde", "Havalimanında"] },
    cevap: { soru: "Ne dersin?", siklar: ['Entonces, voy a la casa de cambio.', 'Sí, el dólar es verde.', 'No tengo cambio de ropa.', 'Me robaron el banco.'] } },

  { id: 'd4_08', blok: 'b04', uid: 'u19', sahne: 'Arkadaşın seni çağırıyor',
    satirlar: [['A', 'El sábado es mi cumpleaños. Hay una fiesta en mi casa a las ocho. ¿Quieres ir?']],
    tr: "Cumartesi doğum günüm. Saat sekizde evimde parti var. Gelmek ister misin?",
    anla: { soru: "Parti ne zaman?", siklar: ["Cumartesi saat 8'de", "Pazar saat 8'de", "Cuma saat 9'da", "Cumartesi öğlen"] },
    cevap: { soru: "Gitmek istiyorsun. Ne dersin?", siklar: ['¡Claro! ¡Feliz cumpleaños!', 'Sí, mi cumpleaños es en mayo.', 'No, el sábado es martes.', 'Hoy es mi cumpleaños.'] } },

  { id: 'd4_09', blok: 'b04', uid: 'u19', sahne: 'Bir turist planını anlatıyor',
    satirlar: [['A', 'Llego el viernes y vuelvo a Turquía el próximo martes.']],
    tr: "Cuma geliyorum ve gelecek salı Türkiye'ye dönüyorum.",
    anla: { soru: "Ne zaman Türkiye'ye dönüyor?", siklar: ["Gelecek salı", "Cuma", "Gelecek cuma", "Pazartesi"] },
    cevap: { soru: "Nerede kalacağını soruyorsun. Ne dersin?", siklar: ['¡Qué bien! ¿Y dónde te quedas?', 'Sí, hoy es viernes.', 'No tengo martes.', 'Me gusta el mes de mayo.'] } },

  { id: 'd4_10', blok: 'b04', uid: 'u20', sahne: 'Ailesini anlatıyor',
    satirlar: [['A', 'Tengo dos hermanos y una hermana. Mi hermana es médica y vive en Ankara con su esposo.']],
    tr: "İki erkek kardeşim ve bir kız kardeşim var. Kız kardeşim doktor ve kocasıyla Ankara'da yaşıyor.",
    anla: { soru: "Kız kardeşi ne iş yapıyor?", siklar: ["Doktor", "Öğretmen", "Mühendis", "Polis"] },
    cevap: { soru: "Ne dersin?", siklar: ['¡Qué bien! Yo tengo un hermano.', 'Sí, tengo fiebre.', 'No, vivo en un hotel.', 'Son las dos.'] } },

  { id: 'd4_11', blok: 'b04', uid: 'u20', sahne: 'Parkta bir anne',
    satirlar: [['A', 'Este es mi hijo. Tiene cinco años. Mi hija tiene dos años y está con su abuela.']],
    tr: "Bu benim oğlum. Beş yaşında. Kızım iki yaşında ve büyükannesiyle.",
    anla: { soru: "Kızı kiminle?", siklar: ["Büyükannesiyle", "Babasıyla", "Teyzesiyle", "Annesiyle"] },
    cevap: { soru: "Ne dersin?", siklar: ['¡Qué lindo niño!', 'Sí, mañana es lunes.', 'No, gracias, estoy mirando.', 'Me robaron la cartera.'] } },

  { id: 'd4_12', blok: 'b04', uid: 'u16', sahne: 'Mağazada satıcı',
    satirlar: [['A', '¿Qué talla necesita? Los pantalones azules son muy bonitos y están en descuento.']],
    tr: "Hangi bedene ihtiyacınız var? Mavi pantolonlar çok güzel ve indirimde.",
    anla: { soru: "Hangi pantolon indirimde?", siklar: ["Mavi pantolon", "Siyah pantolon", "Beyaz pantolon", "Hepsi"] },
    cevap: { soru: "Denemek istiyorsun. Ne dersin?", siklar: ['¿Me los puedo probar?', 'Sí, mi talla es azul.', 'No, los pantalones están en casa.', 'Son las doce.'] } },

  // ---------- Blok 5 · Ünite 21–27 ----------
  { id: 'd5_01', blok: 'b05', uid: 'u21', sahne: 'Kafede yanındaki kişi',
    satirlar: [['A', 'Perdón, mi celular no tiene batería. ¿Tienes un cargador? ¿Dónde hay un enchufe?']],
    tr: "Pardon, telefonumun şarjı bitti. Şarj aletin var mı? Nerede priz var?",
    anla: { soru: "Adamın sorunu ne?", siklar: ["Telefonunun şarjı bitmiş", "Telefonu kaybolmuş", "Bilgisayarı bozuk", "Kalemi yok"] },
    cevap: { soru: "Prizi gösteriyorsun. Ne dersin?", siklar: ['Sí, aquí hay un enchufe.', 'Sí, mi reloj es nuevo.', 'No, la ventana está cerrada.', 'Me gusta el libro.'] } },

  { id: 'd5_02', blok: 'b05', uid: 'u22', sahne: 'Pazarda satıcı',
    satirlar: [['A', 'Buenos días. Hoy los aguacates están muy frescos. Un kilo cuesta seis mil pesos.']],
    tr: "Günaydın. Bugün avokadolar çok taze. Bir kilosu altı bin peso.",
    anla: { soru: "Bir kilo avokado kaç para?", siklar: ["6.000 peso", "16.000 peso", "60.000 peso", "600 peso"] },
    cevap: { soru: "Yarım kilo istiyorsun. Ne dersin?", siklar: ['Medio kilo, por favor.', 'Sí, la leche está fría.', 'No, tengo una reserva.', 'Son las seis.'] } },

  { id: 'd5_03', blok: 'b05', uid: 'u22', sahne: 'Market kasası',
    satirlar: [['A', 'Son dos litros de leche, seis huevos y pan. ¿Algo más?']],
    tr: "İki litre süt, altı yumurta ve ekmek. Başka bir şey?",
    anla: { soru: "Ne almışsın?", siklar: ["Süt, yumurta ve ekmek", "Su, elma ve peynir", "Süt, şeker ve yağ", "Ekmek ve domates"] },
    cevap: { soru: "Başka bir şey yok. Ne dersin?", siklar: ['No, gracias, es todo.', 'Sí, son las seis.', 'Sí, tengo seis hermanos.', 'Me gusta el huevo.'] } },

  { id: 'd5_04', blok: 'b05', uid: 'u23', sahne: 'Dil öğrenen bir arkadaş',
    satirlar: [['A', 'Estudio español todos los días. Leo un libro y escucho música en español, pero escribir es difícil.']],
    tr: "Her gün İspanyolca çalışıyorum. Kitap okuyorum ve İspanyolca müzik dinliyorum ama yazmak zor.",
    anla: { soru: "Onun için ne zor?", siklar: ["Yazmak", "Okumak", "Dinlemek", "Konuşmak"] },
    cevap: { soru: "Ne dersin?", siklar: ['Yo también estudio todos los días.', 'Sí, el libro escucha música.', 'No, escribo en la ventana.', 'Me gusta la leche.'] } },

  { id: 'd5_05', blok: 'b05', uid: 'u24', sahne: 'Hafta sonu planları',
    satirlar: [['A', '¿Qué vas a hacer el fin de semana?'], ['B', 'Voy a viajar a Cartagena con mi hermana. Tengo que comprar un sombrero.']],
    tr: "— Hafta sonu ne yapacaksın? — Kız kardeşimle Cartagena'ya gideceğim. Bir şapka almam lazım.",
    anla: { soru: "Kadının ne alması gerekiyor?", siklar: ["Şapka", "Güneş kremi", "Valiz", "Bilet"] },
    cevap: { soru: "Ne zaman döneceğini soruyorsun. Ne dersin?", siklar: ['¡Qué chévere! ¿Cuándo vuelves?', 'Sí, el sombrero es mi hermana.', 'No, voy a la farmacia.', 'Son las tres.'] } },

  { id: 'd5_06', blok: 'b05', uid: 'u24', sahne: 'Arkadaşın seni davet ediyor',
    satirlar: [['A', 'Mañana hay una fiesta en mi casa. ¿Vienes? Puedes traer a tus amigos.']],
    tr: "Yarın evimde parti var. Geliyor musun? Arkadaşlarını getirebilirsin.",
    anla: { soru: "Arkadaşların için ne diyor?", siklar: ["Getirebilirsin", "Gelemezler", "Para ödemeliler", "Erken gelmeliler"] },
    cevap: { soru: "Gitmek istiyorsun. Ne dersin?", siklar: ['¡Claro! ¿A qué hora?', 'Sí, mis amigos son de Perú.', 'No, la fiesta es un libro.', 'Tengo un cuaderno.'] } },

  { id: 'd5_07', blok: 'b05', uid: 'u25', sahne: 'Tanıştığın biriyle sohbet',
    satirlar: [['A', 'En mi tiempo libre me gusta jugar al fútbol y cocinar. ¿Y a ti?']],
    tr: "Boş zamanımda futbol oynamayı ve yemek yapmayı severim. Ya sen?",
    anla: { soru: "Boş zamanında ne yapmayı seviyor?", siklar: ["Futbol oynamayı ve yemek yapmayı", "Şarkı söylemeyi", "Koşmayı ve okumayı", "Film izlemeyi"] },
    cevap: { soru: "Sen müzik dinlemeyi seversin. Ne dersin?", siklar: ['A mí me gusta escuchar música.', 'Sí, son las diez.', 'No, el partido está cerrado.', 'Tengo dos hermanos.'] } },

  { id: 'd5_08', blok: 'b05', uid: 'u25', sahne: 'Sinemadan çıkarken',
    satirlar: [['A', 'Pienso que la película es muy larga y un poco aburrida. Prefiero el partido de fútbol.']],
    tr: "Bence film çok uzun ve biraz sıkıcı. Futbol maçını tercih ederim.",
    anla: { soru: "Film hakkında ne düşünüyor?", siklar: ["Uzun ve biraz sıkıcı", "Kısa ve komik", "Çok güzel", "Çok ilginç"] },
    cevap: { soru: "Sen de öyle düşünüyorsun. Ne dersin?", siklar: ['Sí, yo también pienso que es aburrida.', 'Sí, juego al fútbol los lunes.', 'No, prefiero el café con leche.', 'Son las cinco y media.'] } },

  { id: 'd5_09', blok: 'b05', uid: 'u26', sahne: 'Bir arkadaş gününü anlatıyor',
    satirlar: [['A', 'Normalmente me levanto a las seis, me baño y desayuno. Voy al trabajo a las siete y media.']],
    tr: "Genelde altıda kalkarım, duş alırım ve kahvaltı ederim. Yedi buçukta işe giderim.",
    anla: { soru: "Saat kaçta işe gidiyor?", siklar: ["7:30", "6:00", "8:00", "6:30"] },
    cevap: { soru: "Sen dokuzda kalkıyorsun. Ne dersin?", siklar: ['¡Qué temprano! Yo me levanto a las nueve.', 'Sí, me baño en el trabajo.', 'No, desayuno a medianoche.', 'Me gusta el reloj.'] } },

  { id: 'd5_10', blok: 'b05', uid: 'u26', sahne: 'Yorgun bir arkadaş',
    satirlar: [['A', 'Estoy muy cansado. Me acuesto a la una y me despierto a las seis. Duermo muy poco.']],
    tr: "Çok yorgunum. Saat birde yatıyorum ve altıda uyanıyorum. Çok az uyuyorum.",
    anla: { soru: "Neden yorgun?", siklar: ["Çok az uyuyor", "Çok çalışıyor", "Hasta", "Çok koşuyor"] },
    cevap: { soru: "Tavsiye veriyorsun. Ne dersin?", siklar: ['Tienes que dormir más.', 'Sí, a la una es temprano.', 'No, el sofá es cómodo.', 'Me gusta el desayuno.'] } },

  { id: 'd5_11', blok: 'b05', uid: 'u27', sahne: 'Hava durumu',
    satirlar: [['A', 'Hoy hace mucho calor, estamos a treinta y cinco grados. Mañana llueve.']],
    tr: "Bugün hava çok sıcak, otuz beş derece. Yarın yağmur yağacak.",
    anla: { soru: "Yarın hava nasıl olacak?", siklar: ["Yağmurlu", "Çok sıcak", "Karlı", "Güneşli"] },
    cevap: { soru: "Ne dersin?", siklar: ['Entonces, necesito un paraguas.', 'Sí, tengo frío.', 'No, el sol es mi amigo.', 'Me levanto a las siete.'] } },

  { id: 'd5_12', blok: 'b05', uid: 'u27', sahne: 'Kolombiyalı bir arkadaş soruyor',
    satirlar: [['A', '¿Qué tiempo hace en Turquía en invierno?'], ['B', 'Hace frío y a veces nieva. En verano hace mucho sol.']],
    tr: "— Türkiye'de kışın hava nasıl? — Soğuk ve bazen kar yağıyor. Yazın çok güneş var.",
    anla: { soru: "Türkiye'de kışın hava nasılmış?", siklar: ["Soğuk, bazen kar yağıyor", "Sıcak ve güneşli", "Yağmurlu ve rüzgârlı", "Ilık"] },
    cevap: { soru: "Kolombiyalı arkadaşın ne der?", siklar: ['Aquí nunca nieva. Siempre hace calor.', 'Sí, el invierno es mi hermano.', 'No, tengo paraguas en verano.', 'Me gusta la televisión.'] } }
];
