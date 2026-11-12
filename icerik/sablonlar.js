/* =========================================================
   CÜMLE ŞABLONLARI
   Kalıba ünitelerin isimleri yerleştirilip yeni cümleler üretilir
   (cümle kurma, çeviri, dinleme, doğru/yanlış sorularında kullanılır).
     es / tr : {X} = isim, {el} = el/la, {un} = un/una
     uid     : kalıbın tüm kelimelerinin öğretildiği ünite (o ünite açılmadan kullanılmaz)
     isimler : kalıba uyan isimler (kelimenin es yazılışı, artikeliyle). İsim kendi ünitesi açılınca kullanılır.
   Türkçede ek gerektirmeyen kalıplar seçildi (Bir X istiyorum · X nerede? · Bir X lazım …).
   ========================================================= */
ICERIK.sablonlar = [
  { es: 'Quiero {un} {X}, por favor.', tr: 'Bir {X} istiyorum, lütfen.', uid: 'u06', isimler: [
    'el agua', 'la cerveza', 'el helado', 'el chocolate', 'el café', 'el té', 'el jugo', 'el vino', 'el refresco', 'la sopa', 'la ensalada',
    'la empanada', 'la arepa', 'el postre', 'la cuchara', 'el tenedor', 'el cuchillo', 'la servilleta', 'la mesa', 'el trago', 'el cóctel',
    'la botella', 'el vaso', 'el taxi', 'el boleto', 'la habitación', 'el mapa', 'la toalla', 'la camiseta', 'el sombrero'] },
  { es: '¿Dónde está {el} {X}?', tr: '{X} nerede?', uid: 'u05', isimler: [
    'el baño', 'el hotel', 'el restaurante', 'el bar', 'la discoteca', 'la estación', 'el aeropuerto', 'el banco', 'la farmacia', 'el museo',
    'el metro', 'el centro', 'la playa', 'el cine', 'la recepción', 'el ascensor', 'el pasaporte', 'la maleta', 'la llave', 'el cargador',
    'el celular', 'la cartera', 'el mercado', 'el supermercado', 'el hospital', 'el cajero', 'la plaza', 'la iglesia',
    'el parque', 'la tienda', 'la cocina', 'la ducha'] },
  { es: '¿Hay {un} {X} cerca?', tr: 'Yakında bir {X} var mı?', uid: 'u11', isimler: [
    'el banco', 'la farmacia', 'el cajero', 'el supermercado', 'el restaurante', 'el bar', 'el hotel', 'el hospital', 'el parque',
    'el mercado', 'la tienda', 'la discoteca', 'la estación', 'el museo', 'la playa'] },
  { es: '¿Cuánto cuesta {el} {X}?', tr: '{X} ne kadar?', uid: 'u09', isimler: [
    'el taxi', 'el boleto', 'la habitación', 'la entrada', 'la camiseta', 'el sombrero', 'el vestido', 'la chaqueta', 'el mapa',
    'el tour', 'la excursión', 'la cerveza', 'el café', 'el helado', 'el cóctel', 'la arepa', 'la empanada'] },
  { es: '¿Tienen {X}?', tr: '{X} var mı?', uid: 'u06', isimler: [
    'el agua', 'la cerveza', 'el vino', 'el jugo', 'el café', 'el té', 'el pan', 'el pollo', 'el pescado', 'el arroz', 'la sopa', 'el ron'] },
  { es: 'Me gusta mucho {el} {X}.', tr: '{X} çok hoşuma gidiyor.', uid: 'u07', isimler: [
    'el café', 'el té', 'el vino', 'el ron', 'el chocolate', 'el helado', 'la música', 'la salsa', 'el fútbol', 'la playa', 'la ciudad',
    'el mar', 'la montaña', 'la naturaleza', 'la arepa', 'la cerveza'] },
  { es: 'Necesito {un} {X}.', tr: 'Bir {X} lazım.', uid: 'u09', isimler: [
    'el taxi', 'el mapa', 'el cargador', 'la toalla', 'la pastilla', 'el boleto', 'la habitación', 'la mesa', 'el cajero', 'la farmacia',
    'el hospital', 'la medicina', 'la receta'] }
];
