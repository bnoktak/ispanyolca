ICERIK.unite({
  id: 'u19', sira: 19, seviye: 'A1', emoji: "📅",
  baslik: "Günler, aylar, tarih",
  ozet: "Haftanın günleri, aylar, bugün-yarın-dün ve tarih söylemek",
  not: `
    <p>Gün ve ay adları <b>küçük harfle</b> yazılır: <i>lunes, enero</i>.</p>
    <p><b>Günler:</b> lunes (Pzt), martes, miércoles, jueves, viernes, sábado, domingo (Paz).</p>
    <p>"Pazartesi günü" demek için artikel yeter: <i>El lunes vuelvo a casa.</i> — Pazartesi eve dönüyorum.
    <i>Los lunes</i> = her pazartesi.</p>
    <p><b>Tarih:</b> el + gün + <b>de</b> + ay: <i>el cinco de mayo</i> (5 Mayıs).<br>
    <i>¿Qué día es hoy?</i> — Bugün günlerden ne? → <i>Hoy es martes.</i></p>
    <p><b>mañana</b> iki anlamlı: "yarın" ve "sabah" (<i>la mañana</i>).</p>
  <p><b>¿Cuándo?</b> — Ne zaman? → <i>¿Cuándo es tu cumpleaños?</i> · <b>la próxima semana</b> (gelecek hafta), <b>el mes pasado</b> (geçen ay).</p>
    <p><b>🔧 Bu ünitenin fiilleri:</b> <b>volver</b> (dönmek, o → ue): <i>vuelvo, vuelves, vuelve, volvemos, vuelven</i> → <i>¿Cuándo vuelves?</i></p>`,
  detayBaslik: "Rezervasyon, açık günler, tatil günleri",
  detay: `<h4>🗣️ Söyleyebileceklerin</h4><table class="tablo ifade"><tr><td><b>Tengo una reserva.</b></td><td>Rezervasyonum var.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Tengo una reserva.">🔊</button></td></tr><tr><td><b>Llego el lunes y me voy el viernes.</b></td><td>Pazartesi geliyorum, cuma gidiyorum.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Llego el lunes y me voy el viernes.">🔊</button></td></tr><tr><td><b>¿Está abierto el domingo?</b></td><td>Pazar günü açık mı?</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¿Está abierto el domingo?">🔊</button></td></tr><tr><td><b>¿Qué día es hoy?</b></td><td>Bugün günlerden ne?</td><td class="ses-hucre"><button type="button" class="ses" data-ses="¿Qué día es hoy?">🔊</button></td></tr><tr><td><b>Para este fin de semana.</b></td><td>Bu hafta sonu için.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Para este fin de semana.">🔊</button></td></tr></table><h4>👂 Duyabileceklerin</h4><table class="tablo ifade"><tr><td><b>Cerrado los lunes.</b></td><td>Pazartesileri kapalı.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Cerrado los lunes.">🔊</button></td></tr><tr><td><b>De lunes a viernes.</b></td><td>Pazartesiden cumaya.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="De lunes a viernes.">🔊</button></td></tr><tr><td><b>Su reserva es del diez al quince de mayo.</b></td><td>Rezervasyonunuz 10–15 Mayıs arası.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Su reserva es del diez al quince de mayo.">🔊</button></td></tr><tr><td><b>Mañana es día festivo.</b></td><td>Yarın resmi tatil.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Mañana es día festivo.">🔊</button></td></tr><tr><td><b>Abrimos fines de semana y días festivos.</b></td><td>Hafta sonları ve tatil günleri açığız.</td><td class="ses-hucre"><button type="button" class="ses" data-ses="Abrimos fines de semana y días festivos.">🔊</button></td></tr></table><h4>🎬 Örnek sahne: Otel rezervasyonu</h4><div class="sahne"><p class="sahne-satir"><span class="kisi">Sen:</span> <b>Buenos días, tengo una reserva.</b> <button type="button" class="ses" data-ses="Buenos días, tengo una reserva.">🔊</button><br><small>Günaydın, rezervasyonum var.</small></p><p class="sahne-satir"><span class="kisi">Resepsiyon:</span> <b>¿A qué nombre?</b> <button type="button" class="ses" data-ses="¿A qué nombre?">🔊</button><br><small>Kimin adına?</small></p><p class="sahne-satir"><span class="kisi">Sen:</span> <b>Batuhan. Del cinco al nueve de mayo.</b> <button type="button" class="ses" data-ses="Batuhan. Del cinco al nueve de mayo.">🔊</button><br><small>Batuhan. 5–9 Mayıs arası.</small></p><p class="sahne-satir"><span class="kisi">Resepsiyon:</span> <b>Perfecto, cuatro noches.</b> <button type="button" class="ses" data-ses="Perfecto, cuatro noches.">🔊</button><br><small>Mükemmel, dört gece.</small></p></div><h4>💡 İpuçları</h4><ul><li>Müzeler Latin Amerika'da sıkça <b>pazartesi</b> kapalıdır; gitmeden <i>¿Está abierto hoy?</i> diye sor.</li><li>Tarih yazarken gün önce gelir: 5/10 = 5 Ekim.</li></ul>`,
  gruplar: [["Haftanın günleri", ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]], ["Aylar", ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]], ["Bugün, yarın, dün", ["manana", "ayer"]], ["Zaman birimleri", ["dia", "semana", "finde", "mes", "ano"]], ["Ne zaman?", ["que", "cuando", "fecha", "proximo", "pasado", "cumple"]], ["Fiiller", ["volver"]]],
  kelimeler: [
    {"id": "u19_lunes", "en": "Monday", "es": "lunes", "tr": "pazartesi"},
    {"id": "u19_martes", "en": "Tuesday", "es": "martes", "tr": "salı"},
    {"id": "u19_miercoles", "en": "Wednesday", "es": "miércoles", "tr": "çarşamba"},
    {"id": "u19_jueves", "en": "Thursday", "es": "jueves", "tr": "perşembe", "ipucu": "okunuşu: \"huebes\""},
    {"id": "u19_viernes", "en": "Friday", "es": "viernes", "tr": "cuma"},
    {"id": "u19_sabado", "en": "Saturday", "es": "sábado", "tr": "cumartesi"},
    {"id": "u19_domingo", "en": "Sunday", "es": "domingo", "tr": "pazar"},
    {"id": "u19_enero", "en": "January", "es": "enero", "tr": "ocak"},
    {"id": "u19_febrero", "en": "February", "es": "febrero", "tr": "şubat"},
    {"id": "u19_marzo", "en": "March", "es": "marzo", "tr": "mart"},
    {"id": "u19_abril", "en": "April", "es": "abril", "tr": "nisan"},
    {"id": "u19_mayo", "en": "May", "es": "mayo", "tr": "mayıs"},
    {"id": "u19_junio", "en": "June", "es": "junio", "tr": "haziran", "ipucu": "okunuşu: \"hunio\""},
    {"id": "u19_julio", "en": "July", "es": "julio", "tr": "temmuz", "ipucu": "okunuşu: \"hulio\""},
    {"id": "u19_agosto", "en": "August", "es": "agosto", "tr": "ağustos"},
    {"id": "u19_septiembre", "en": "September", "es": "septiembre", "tr": "eylül"},
    {"id": "u19_octubre", "en": "October", "es": "octubre", "tr": "ekim"},
    {"id": "u19_noviembre", "en": "November", "es": "noviembre", "tr": "kasım"},
    {"id": "u19_diciembre", "en": "December", "es": "diciembre", "tr": "aralık"},
    {"id": "u19_manana", "en": "tomorrow / morning", "es": "mañana", "tr": "yarın / sabah"},
    {"id": "u19_ayer", "en": "yesterday", "es": "ayer", "tr": "dün"},
    {"id": "u19_dia", "en": "day", "es": "el día", "tr": "gün", "ipucu": "-a ile bitse de erkek: el día"},
    {"id": "u19_semana", "en": "week", "es": "la semana", "tr": "hafta"},
    {"id": "u19_finde", "en": "weekend", "es": "el fin de semana", "tr": "hafta sonu"},
    {"id": "u19_mes", "en": "month", "es": "el mes", "tr": "ay"},
    {"id": "u19_ano", "en": "year", "es": "el año", "tr": "yıl", "ipucu": "año (yıl) ≠ ano! ñ önemli"},
    {"id": "u19_que", "en": "what?", "es": "¿qué?", "tr": "ne?"},
    {"id": "u19_cuando", "en": "when?", "es": "¿cuándo?", "tr": "ne zaman?"},
    {"id": "u19_fecha", "en": "date", "es": "la fecha", "tr": "tarih"},
    {"id": "u19_proximo", "en": "next", "es": "próximo / próxima", "tr": "gelecek, bir sonraki"},
    {"id": "u19_pasado", "en": "last, past", "es": "pasado / pasada", "tr": "geçen, geçmiş"},
    {"id": "u19_cumple", "en": "birthday", "es": "el cumpleaños", "tr": "doğum günü"},
    {"es": "volver", "tr": "dönmek", "en": "to return", "ipucu": "o → ue · ¿Cuándo vuelves? = Ne zaman dönüyorsun?", "id": "u19_volver"}
  ],
  cumleler: [
    {"es": "Hoy es martes.", "tr": "Bugün salı."},
    {"es": "¿Qué día es hoy?", "tr": "Bugün günlerden ne?"},
    {"es": "Mañana es sábado.", "tr": "Yarın cumartesi."},
    {"es": "Mi cumpleaños es el diez de abril.", "tr": "Doğum günüm on nisanda."},
    {"es": "El lunes vuelvo a Turquía.", "tr": "Pazartesi Türkiye'ye dönüyorum."},
    {"es": "Hoy es lunes y mañana es martes.", "tr": "Bugün pazartesi, yarın salı."},
    {"es": "Hoy es el cinco de mayo.", "tr": "Bugün beş mayıs."},
    {"es": "Una semana tiene siete días.", "tr": "Bir haftada yedi gün var."},
    {"es": "¿Cuándo es tu cumpleaños?", "tr": "Doğum günün ne zaman?"},
    {"es": "La próxima semana es mi cumpleaños.", "tr": "Gelecek hafta benim doğum günüm."},
    {"es": "Volvemos el domingo.", "tr": "Pazar günü dönüyoruz."}
  ],
  bosluklar: [
    {"satirlar": ["Hoy es [martes]."], "tr": "Bugün salı.", "secenek": ["marzo", "mañana"]},
    {"satirlar": ["Mi cumpleaños es el diez de [abril]."], "tr": "Doğum günüm on nisanda.", "secenek": ["lunes", "año"]},
    {"satirlar": ["[Mañana] es sábado."], "tr": "Yarın cumartesi.", "secenek": ["Ayer", "Semana"]},
    {"satirlar": ["— ¿Qué [día] es hoy?", "— Hoy es [viernes].", "— ¡Mañana es el fin de semana!"], "tr": "— Bugün günlerden ne? — Bugün cuma. — Yarın hafta sonu!", "secenek": ["mes", "enero"]},
    {"satirlar": ["— El lunes [vuelvo] a casa.", "— Yo vuelvo el [jueves]."], "tr": "— Pazartesi eve dönüyorum. — Ben perşembe dönüyorum.", "secenek": ["semana", "julio"]}
  ],
  soruCevap: [
    ["¿Qué día es hoy?", "Hoy es jueves."],
    ["¿Cuándo es tu cumpleaños?", "Es el diez de abril."],
    ["¿Qué fecha es hoy?", "Es el cinco de mayo."],
    ["¿Trabajas mañana?", "No, mañana es domingo."],
    ["¿Cuándo vuelves?", "El lunes."]
  ],
  cekimler: [
    {"fiil": "volver", "tr": "dönmek", "yo": "vuelvo", "tu": "vuelves", "el": "vuelve", "nos": "volvemos", "ellos": "vuelven"}
  ]
});
