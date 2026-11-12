ICERIK.unite({
  id: 'u20', sira: 20, seviye: 'A1', emoji: "👨‍👩‍👧",
  baslik: "İnsanlar ve aile",
  ozet: "Adam, kadın, çocuk… aile üyeleri, benim/senin, tener",
  not: `
    <p>Aile üyeleri artikelleriyle: <i>el padre, la madre, los padres</i> (anne-baba). Karışık grup erkek çoğuluyla söylenir:
    <i>los hermanos</i> = erkek kardeşler <b>ya da</b> kardeşler, <i>los hijos</i> = çocuklar.</p>
    <p>Sahiplik (4. ünite): <i>mi madre, tu hermano, su esposa</i>; çoğulda <i>mis padres</i>.</p>
    <p>Erkek/kadın çiftleri: <i>el niño / la niña</i> (erkek / kız çocuk), <i>el abuelo / la abuela</i>, <i>el tío / la tía</i>.</p>`,
  detayBaslik: "Ailen hakkında sohbet",
  detay: `<h4>🗣️ Söyleyebileceklerin</h4><table class="tablo ifade"><tr><td><b>Viajo solo. / Viajo sola.</b></td><td>Yalnız seyahat ediyorum.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Viajo solo. / Viajo sola.">🔊</button></td></tr><tr><td><b>Estoy con mi familia.</b></td><td>Ailemle birlikteyim.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Estoy con mi familia.">🔊</button></td></tr><tr><td><b>Estoy con mi esposa.</b></td><td>Eşimle birlikteyim.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Estoy con mi esposa.">🔊</button></td></tr><tr><td><b>Tengo dos hermanos.</b></td><td>İki kardeşim var.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Tengo dos hermanos.">🔊</button></td></tr><tr><td><b>No tengo hijos.</b></td><td>Çocuğum yok.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="No tengo hijos.">🔊</button></td></tr><tr><td><b>Este es mi amigo.</b></td><td>Bu benim arkadaşım.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Este es mi amigo.">🔊</button></td></tr></table><h4>👂 Duyabileceklerin</h4><table class="tablo ifade"><tr><td><b>¿Viaja solo?</b></td><td>Yalnız mı seyahat ediyorsunuz?</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¿Viaja solo?">🔊</button></td></tr><tr><td><b>¿Está casado? / ¿Está casada?</b></td><td>Evli misiniz?</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¿Está casado? / ¿Está casada?">🔊</button></td></tr><tr><td><b>¿Tiene hijos?</b></td><td>Çocuğunuz var mı?</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¿Tiene hijos?">🔊</button></td></tr><tr><td><b>¿Viene con su familia?</b></td><td>Ailenizle mi geldiniz?</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¿Viene con su familia?">🔊</button></td></tr><tr><td><b>¡Qué bonita familia!</b></td><td>Ne güzel bir aile!</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¡Qué bonita familia!">🔊</button></td></tr></table><h4>🎬 Örnek sahne: Taksi sohbeti</h4><div class="sahne"><p class="sahne-satir"><span class="kisi">Şoför:</span> <b>¿Viene con su familia?</b> <button type="button" class="ses" data-ses="¿Viene con su familia?">🔊</button><br><small>Ailenizle mi geldiniz?</small></p><p class="sahne-satir"><span class="kisi">Sen:</span> <b>No, viajo solo.</b> <button type="button" class="ses" data-ses="No, viajo solo.">🔊</button><br><small>Hayır, yalnız seyahat ediyorum.</small></p><p class="sahne-satir"><span class="kisi">Şoför:</span> <b>¿Y su familia está en Turquía?</b> <button type="button" class="ses" data-ses="¿Y su familia está en Turquía?">🔊</button><br><small>Aileniz Türkiye'de mi?</small></p><p class="sahne-satir"><span class="kisi">Sen:</span> <b>Sí, mis padres y mi hermana.</b> <button type="button" class="ses" data-ses="Sí, mis padres y mi hermana.">🔊</button><br><small>Evet, annemle babam ve kız kardeşim.</small></p></div><h4>💡 İpuçları</h4><ul><li>Latin Amerika'da taksi şoförleri ve satıcılar aile hakkında samimi sorular sorabilir; kaba değil, sohbet etmek istiyorlar.</li><li><i>casado / casada</i> = evli, <i>soltero / soltera</i> = bekâr.</li></ul>`,
  gruplar: [["İnsanlar", ["nino", "nina", "bebe"]], ["Çekirdek aile", ["familia", "padre", "madre", "padres", "hermano", "hermana", "hijo", "hija"]], ["Geniş aile ve eş", ["abuelo", "abuela", "esposo", "esposa", "tio", "tia"]]],
  kelimeler: [
    {"id": "u20_nino", "en": "boy, child", "es": "el niño", "tr": "erkek çocuk", "ipucu": "ñ = \"ny\": \"ninyo\""},
    {"id": "u20_nina", "en": "girl", "es": "la niña", "tr": "kız çocuk"},
    {"id": "u20_bebe", "en": "baby", "es": "el bebé", "tr": "bebek"},
    {"id": "u20_familia", "en": "family", "es": "la familia", "tr": "aile"},
    {"id": "u20_padre", "en": "father", "es": "el padre", "tr": "baba"},
    {"id": "u20_madre", "en": "mother", "es": "la madre", "tr": "anne"},
    {"id": "u20_padres", "en": "parents", "es": "los padres", "tr": "anne-baba, ebeveynler"},
    {"id": "u20_hermano", "en": "brother", "es": "el hermano", "tr": "erkek kardeş"},
    {"id": "u20_hermana", "en": "sister", "es": "la hermana", "tr": "kız kardeş"},
    {"id": "u20_hijo", "en": "son", "es": "el hijo", "tr": "oğul", "ipucu": "h okunmaz, j = \"h\": \"iho\""},
    {"id": "u20_hija", "en": "daughter", "es": "la hija", "tr": "kız (evlat)"},
    {"id": "u20_abuelo", "en": "grandfather", "es": "el abuelo", "tr": "dede"},
    {"id": "u20_abuela", "en": "grandmother", "es": "la abuela", "tr": "babaanne / anneanne"},
    {"id": "u20_esposo", "en": "husband", "es": "el esposo", "tr": "koca, eş (erkek)"},
    {"id": "u20_esposa", "en": "wife", "es": "la esposa", "tr": "karı, eş (kadın)"},
    {"id": "u20_tio", "en": "uncle", "es": "el tío", "tr": "amca / dayı"},
    {"id": "u20_tia", "en": "aunt", "es": "la tía", "tr": "hala / teyze"}
  ],
  cumleler: [
    {"es": "Mi madre es profesora.", "tr": "Annem öğretmen."},
    {"es": "Tengo dos hermanos.", "tr": "İki kardeşim var."},
    {"es": "¿Tienes hermanos?", "tr": "Kardeşin var mı?"},
    {"es": "Mis padres son de Ankara.", "tr": "Annemle babam Ankaralı."},
    {"es": "Mi hermana es estudiante.", "tr": "Kız kardeşim öğrenci."},
    {"es": "Él es mi abuelo.", "tr": "O benim dedem."},
    {"es": "Su esposa es médica.", "tr": "Onun eşi doktor."},
    {"es": "No tengo hijos.", "tr": "Çocuğum yok."},
    {"es": "La niña tiene cinco años.", "tr": "Kız çocuk beş yaşında."},
    {"es": "El hombre es mi tío.", "tr": "Adam benim amcam."},
    {"es": "Nuestra familia es de Ankara.", "tr": "Bizim ailemiz Ankaralı."},
    {"es": "Mi abuela tiene dos perros.", "tr": "Büyükannemin iki köpeği var."}
  ],
  bosluklar: [
    {"satirlar": ["[La] madre de Ana es profesora."], "tr": "Ana'nın annesi öğretmen.", "secenek": ["El", "Los"]},
    {"satirlar": ["Tengo dos [hermanos]."], "tr": "İki erkek kardeşim var.", "secenek": ["hermano", "padre"]},
    {"satirlar": ["[Mis] padres son de Ankara."], "tr": "Annemle babam Ankaralı.", "secenek": ["Mi", "Su"]},
    {"satirlar": ["— ¿Tienes [hermanos]?", "— Sí, tengo [una] hermana. Es estudiante."], "tr": "— Kardeşin var mı? — Evet, bir kız kardeşim var. Öğrenci.", "secenek": ["un", "hijo"]},
    {"satirlar": ["— ¿Él es [tu] padre?", "— No, es mi [abuelo]."], "tr": "— O senin baban mı? — Hayır, dedem.", "secenek": ["mis", "tía"]},
    {"satirlar": ["La [niña] tiene seis años."], "tr": "Kız çocuk altı yaşında.", "secenek": ["niño", "hombre"]},
    {"satirlar": ["— ¿[Tienen] hijos?", "— Sí, [tenemos] un niño y una niña."], "tr": "— Çocuklarınız var mı? — Evet, bir oğlumuz ve bir kızımız var.", "secenek": ["Tiene", "tienes"]}
  ],
  soruCevap: [
    ["¿Tienes hermanos?", "Sí, tengo una hermana."],
    ["¿Quién es ella?", "Es mi madre."],
    ["¿Tu padre es médico?", "No, es ingeniero."],
    ["¿Tienes hijos?", "No, no tengo hijos."],
    ["¿Es tu novia?", "No, es mi hermana."]
  ]
});
