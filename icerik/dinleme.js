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
    cevap: { soru: 'Ne cevap verirsin?', siklar: ['Claro, hasta luego.', 'Mucho gusto.', 'Soy estudiante.', 'Hay un hotel.'] } }
];
