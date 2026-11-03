// Testi in italiano per it/index.html. app.js cerca qui ogni testo in spagnolo; ciò che manca resta in spagnolo.
window.TRADUCCION = {
  base: "../",
  locale: "it",
  // Films tab hidden until there are versions in this language; set to true to show it.
  peliculas: false,
  datos: "data/it.json",
  resenas: "data/resenas-it.json",
  // "16 de diciembre" -> "16 dicembre", "1 de enero" -> "1º gennaio"
  fecha: function (s) {
    var m = String(s).match(/^(\d{1,2}) de (\w+)$/);
    var mes = m && window.TRADUCCION.meses[m[2].charAt(0).toUpperCase() + m[2].slice(1)];
    return mes ? (m[1] === "1" ? "1º" : m[1]) + " " + mes.toLowerCase() : s;
  },
  // "4 hijos y 25 años de matrimonio" -> "4 figli e 25 anni di matrimonio"
  familia: function (s) {
    return s.replace(/años de matrimonio/g, "anni di matrimonio").replace(/años de casado/g, "anni di matrimonio")
      .replace(/años entre ambos matrimonios/g, "anni tra i due matrimoni").replace(/meses de matrimonio/g, "mesi di matrimonio")
      .replace(/hijo biológico y (\d+) adoptados/g, "figlio biologico e $1 adottati").replace(/hijos sacerdotes/g, "figli sacerdoti")
      .replace(/\(aprox\)/g, "(circa)").replace(/\bhijas\b/g, "figlie").replace(/\bhija\b/g, "figlia")
      .replace(/\bhijos\b/g, "figli").replace(/\bhijo\b/g, "figlio").replace(/\by\b/g, "e");
  },
  ui: {
    "Santo": "Santo", "Santos": "Santi",
    "Beato": "Beato", "Beatos": "Beati",
    "Venerable": "Venerabile", "Venerables": "Venerabili",
    "Siervo de Dios": "Servo di Dio", "Siervos de Dios": "Servi di Dio",
    "Reproductor de YouTube": "Lettore YouTube",
    "Siglo {s}": "Secolo {s}",
    "s. {s}": "sec. {s}",
    "{n} matrimonios": "{n} coppie",
    "{n} de {total} matrimonios": "{n} di {total} coppie",
    "No hay fichas con esos filtros. Probá quitar alguno.": "Nessuna scheda con questi filtri. Provate a toglierne qualcuno.",
    "Mostrar más ({n} restantes)": "Mostra altri ({n} rimanenti)",
    "País": "Paese", "Siglo": "Secolo", "Fiesta o Memoria": "Festa o memoria", "Referencia": "Riferimento",
    "Matrimonio josefino": "Matrimonio giuseppino",
    "Causa": "Causa", "De ambos esposos": "Di entrambi gli sposi", "De uno de los esposos": "Di uno degli sposi",
    "Mártir": "Martire", "Sí": "Sì",
    "Escuchar el podcast": "Ascolta il podcast (in spagnolo)",
    "Leer artículo": "Leggi l’articolo",
    "Ver video": "Guarda il video",
    "Más información": "Più informazioni",
    "Buscar en la web": "Cerca sul web",
    "Cerrar ficha": "Chiudi la scheda",
    "En pocas palabras": "In poche parole",
    "Para conocer más": "Per saperne di più",
    "Bibliografía": "Bibliografia",
    "Su historia": "La loro storia", "Familia": "Famiglia", "Fuente": "Fonte", "(en español)": "(in spagnolo)",
    "{n} elegidos": "{n} selezionati",
    "{n} caso": "{n} caso", "{n} casos": "{n} casi",
    "{p} del total": "{p} del totale",
    "casos del esposo/a o matrimonio": "casi di uno sposo o di una coppia",
    "con causa de ambos esposos": "con causa per entrambi gli sposi",
    "mártires": "martiri",
    "países": "paesi",
    "Los {n} con más casos.": "I {n} con più casi.",
    "Ver menos": "Vedi meno",
    "Ver todos los países": "Vedi tutti i paesi",
    "{n} fiestas o memorias": "{n} feste o memorie",
    "Reino Unido": "Regno Unito",
    "Mapamundi de casos por país": "Mappa del mondo dei casi per paese",
    "Más de {n}": "Più di {n}",
    "{a} a {b}": "da {a} a {b}",
    "Episodio {n}": "Episodio {n}",
    "Escuchar": "Ascolta",
    "Ver película": "Guarda il film",
    "Ver ficha": "Vedi la scheda",
    "Ver {t}": "Vedi {t}",
    "No se pudo cargar el mapa.": "Non è stato possibile caricare la mappa.",
    "Enviando…": "Invio in corso…",
    "¡Gracias! Recibimos su mensaje y le responderemos a la brevedad.": "Grazie! Abbiamo ricevuto il vostro messaggio e vi risponderemo al più presto.",
    "No se pudo enviar. Intente de nuevo en unos minutos.": "Invio non riuscito. Riprovate tra qualche minuto.",
    "No se pudieron cargar los datos. Recargá la página.": "Non è stato possibile caricare i dati. Ricaricate la pagina."
  },
  beatitudes: {
    "santo": "Santo", "santa": "Santa", "santos": "Santi",
    "beato": "Beato", "beata": "Beata", "beatos": "Beati",
    "venerable": "Venerabile", "venerables": "Venerabili",
    "siervo de dios": "Servo di Dio", "sierva de dios": "Serva di Dio", "siervos de dios": "Servi di Dio"
  },
  referencias: {
    "mártir": "martire", "religioso/a": "religioso/a", "monarcas": "sovrani", "funcionario/a": "funzionario/a",
    "fundador/a": "fondatore/trice", "educador/a": "educatore/trice", "nobles": "nobili", "benefactor/a": "benefattore/trice",
    "padres de santo": "genitori di santi", "otros": "altri", "médico": "medico", "profesional": "professionista",
    "mística o vidente": "mistica o veggente", "escritor/periodista": "scrittore/giornalista", "esposas orantes": "spose oranti",
    "activista social": "attivista sociale", "labrador": "contadino", "pro vida": "pro vita", "artesano": "artigiano"
  },
  continentes: { "Europa": "Europa", "América": "America", "Asia": "Asia", "África": "Africa", "Oceanía": "Oceania" },
  meses: {
    "Enero": "Gennaio", "Febrero": "Febbraio", "Marzo": "Marzo", "Abril": "Aprile", "Mayo": "Maggio", "Junio": "Giugno",
    "Julio": "Luglio", "Agosto": "Agosto", "Septiembre": "Settembre", "Octubre": "Ottobre", "Noviembre": "Novembre", "Diciembre": "Dicembre",
    "Ene": "Gen", "Feb": "Feb", "Mar": "Mar", "Abr": "Apr", "May": "Mag", "Jun": "Giu",
    "Jul": "Lug", "Ago": "Ago", "Sep": "Set", "Oct": "Ott", "Nov": "Nov", "Dic": "Dic"
  },
  paises: {
    "Italia": "Italia", "España": "Spagna", "Francia": "Francia", "Inglaterra": "Inghilterra", "Polonia": "Polonia",
    "Alemania": "Germania", "México": "Messico", "Turquía": "Turchia", "Bélgica": "Belgio", "Hungría": "Ungheria",
    "Argentina": "Argentina", "EEUU": "Stati Uniti", "Japón": "Giappone", "China": "Cina", "Siria": "Siria", "Brasil": "Brasile",
    "Canadá": "Canada", "Suecia": "Svezia", "Portugal": "Portogallo", "Ucrania": "Ucraina", "Austria": "Austria",
    "Irlanda": "Irlanda", "Israel": "Israele", "Venezuela": "Venezuela", "Vietnam": "Vietnam", "Chequia": "Cechia",
    "Suiza": "Svizzera", "Islandia": "Islanda", "Madagascar": "Madagascar", "Argelia": "Algeria", "Chile": "Cile",
    "Rusia": "Russia", "Filipinas": "Filippine", "Grecia": "Grecia", "Sudáfrica": "Sudafrica", "Dinamarca": "Danimarca",
    "El Salvador": "El Salvador", "Guatemala": "Guatemala", "Tailandia": "Thailandia", "Ecuador": "Ecuador", "Iran": "Iran",
    "Corea": "Corea", "India": "India", "Noruega": "Norvegia", "Túnez": "Tunisia", "Papua Nueva Guinea": "Papua Nuova Guinea",
    "Haiti": "Haiti", "Trinidad": "Trinidad", "Colombia": "Colombia", "Ruanda": "Ruanda", "Burkina Faso": "Burkina Faso",
    "Arabia": "Arabia", "Arabia Saudita": "Arabia Saudita", "Egipto": "Egitto", "Etiopía": "Etiopia", "Escocia": "Scozia",
    "Bielorrusia": "Bielorussia", "Malta": "Malta", "Chipre": "Cipro", "Lesotho": "Lesotho", "Albania": "Albania",
    "Eslovaquia": "Slovacchia", "Honduras": "Honduras", "Líbano": "Libano", "Georgia": "Georgia", "Tanzania": "Tanzania",
    "Costa de Marfil": "Costa d’Avorio", "Laos": "Laos", "Rumania": "Romania", "Uganda": "Uganda", "Croacia": "Croazia",
    "Perú": "Perù", "Jordania": "Giordania", "Gales": "Galles", "Uruguay": "Uruguay", "Mauritania": "Mauritania"
  }
};
