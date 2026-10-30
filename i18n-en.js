// English texts for en/index.html. app.js looks up each Spanish text here; anything missing stays in Spanish.
window.TRADUCCION = {
  base: "../",
  locale: "en",
  datos: "data/en.json",
  // "16 de diciembre" -> "December 16"
  fecha: function (s) {
    var m = String(s).match(/^(\d{1,2}) de (\w+)$/);
    var mes = m && window.TRADUCCION.meses[m[2].charAt(0).toUpperCase() + m[2].slice(1)];
    return mes ? mes + " " + m[1] : s;
  },
  ui: {
    "Santo": "Saint", "Santos": "Saints",
    "Beato": "Blessed", "Beatos": "Blessed",
    "Venerable": "Venerable", "Venerables": "Venerable",
    "Siervo de Dios": "Servant of God", "Siervos de Dios": "Servants of God",
    "Reproductor de YouTube": "YouTube player",
    "Siglo {s}": "Century {s}",
    "s. {s}": "Cent. {s}",
    "{n} matrimonios": "{n} couples",
    "{n} de {total} matrimonios": "{n} of {total} couples",
    "No hay fichas con esos filtros. Probá quitar alguno.": "No profiles match these filters. Try removing one.",
    "Mostrar más ({n} restantes)": "Show more ({n} left)",
    "País": "Country", "Siglo": "Century", "Fiesta o Memoria": "Feast or memorial", "Referencia": "Reference",
    "Matrimonio josefino": "Josephite marriage",
    "Causa": "Cause", "De ambos esposos": "Of both spouses", "De uno de los esposos": "Of one of the spouses",
    "Mártir": "Martyr", "Sí": "Yes",
    "Escuchar el podcast": "Listen to the podcast (Spanish)",
    "Leer artículo": "Read article",
    "Ver video": "Watch video",
    "Más información": "More information",
    "Buscar en la web": "Search the web",
    "Cerrar ficha": "Close profile",
    "En pocas palabras": "In a few words",
    "Para conocer más": "Learn more",
    "Bibliografía": "Bibliography",
    "{n} elegidos": "{n} selected",
    "{n} caso": "{n} case", "{n} casos": "{n} cases",
    "{p} del total": "{p} of the total",
    "casos del esposo/a o matrimonio": "cases of a spouse or couple",
    "con causa de ambos esposos": "with a cause for both spouses",
    "mártires": "martyrs",
    "países": "countries",
    "Los {n} con más casos.": "The {n} with the most cases.",
    "Ver menos": "Show fewer",
    "Ver todos los países": "Show all countries",
    "{n} fiestas o memorias": "{n} feasts or memorials",
    "Reino Unido": "United Kingdom",
    "Mapamundi de casos por país": "World map of cases by country",
    "Más de {n}": "More than {n}",
    "{a} a {b}": "{a} to {b}",
    "Episodio {n}": "Episode {n}",
    "Escuchar": "Listen",
    "No se pudo cargar el mapa.": "The map could not be loaded.",
    "Enviando…": "Sending…",
    "¡Gracias! Recibimos su mensaje y le responderemos a la brevedad.": "Thank you! We received your message and will reply soon.",
    "No se pudo enviar. Intente de nuevo en unos minutos.": "It could not be sent. Please try again in a few minutes.",
    "No se pudieron cargar los datos. Recargá la página.": "The data could not be loaded. Please reload the page."
  },
  beatitudes: {
    "santo": "Saint", "santa": "Saint", "santos": "Saints",
    "beato": "Blessed", "beata": "Blessed", "beatos": "Blessed",
    "venerable": "Venerable", "venerables": "Venerable",
    "siervo de dios": "Servant of God", "sierva de dios": "Servant of God", "siervos de dios": "Servants of God"
  },
  referencias: {
    "mártir": "martyr", "religioso/a": "religious", "monarcas": "monarchs", "funcionario/a": "public servant",
    "fundador/a": "founder", "educador/a": "educator", "nobles": "nobility", "benefactor/a": "benefactor",
    "padres de santo": "parents of a saint", "otros": "other", "médico": "physician", "profesional": "professional",
    "vidente": "visionary", "escritor/periodista": "writer/journalist", "esposas orantes": "praying wives",
    "activista social": "social activist", "labrador": "farmer", "pro vida": "pro-life", "artesano": "craftsman"
  },
  continentes: { "Europa": "Europe", "América": "Americas", "Asia": "Asia", "África": "Africa", "Oceanía": "Oceania" },
  meses: {
    "Enero": "January", "Febrero": "February", "Marzo": "March", "Abril": "April", "Mayo": "May", "Junio": "June",
    "Julio": "July", "Agosto": "August", "Septiembre": "September", "Octubre": "October", "Noviembre": "November", "Diciembre": "December",
    "Ene": "Jan", "Feb": "Feb", "Mar": "Mar", "Abr": "Apr", "May": "May", "Jun": "Jun",
    "Jul": "Jul", "Ago": "Aug", "Sep": "Sep", "Oct": "Oct", "Nov": "Nov", "Dic": "Dec"
  },
  paises: {
    "Italia": "Italy", "España": "Spain", "Francia": "France", "Inglaterra": "England", "Polonia": "Poland",
    "Alemania": "Germany", "México": "Mexico", "Turquía": "Turkey", "Bélgica": "Belgium", "Hungría": "Hungary",
    "Argentina": "Argentina", "EEUU": "USA", "Japón": "Japan", "China": "China", "Siria": "Syria", "Brasil": "Brazil",
    "Canadá": "Canada", "Suecia": "Sweden", "Portugal": "Portugal", "Ucrania": "Ukraine", "Austria": "Austria",
    "Irlanda": "Ireland", "Israel": "Israel", "Venezuela": "Venezuela", "Vietnam": "Vietnam", "Chequia": "Czechia",
    "Suiza": "Switzerland", "Islandia": "Iceland", "Madagascar": "Madagascar", "Argelia": "Algeria", "Chile": "Chile",
    "Rusia": "Russia", "Filipinas": "Philippines", "Grecia": "Greece", "Sudáfrica": "South Africa", "Dinamarca": "Denmark",
    "El Salvador": "El Salvador", "Guatemala": "Guatemala", "Tailandia": "Thailand", "Ecuador": "Ecuador", "Iran": "Iran",
    "Corea": "Korea", "India": "India", "Noruega": "Norway", "Túnez": "Tunisia", "Papua Nueva Guinea": "Papua New Guinea",
    "Haiti": "Haiti", "Trinidad": "Trinidad", "Colombia": "Colombia", "Ruanda": "Rwanda", "Burkina Faso": "Burkina Faso",
    "Arabia": "Arabia", "Arabia Saudita": "Saudi Arabia", "Egipto": "Egypt", "Etiopía": "Ethiopia", "Escocia": "Scotland",
    "Bielorrusia": "Belarus", "Malta": "Malta", "Chipre": "Cyprus", "Lesotho": "Lesotho", "Albania": "Albania",
    "Eslovaquia": "Slovakia", "Honduras": "Honduras", "Líbano": "Lebanon", "Georgia": "Georgia", "Tanzania": "Tanzania",
    "Costa de Marfil": "Ivory Coast", "Laos": "Laos", "Rumania": "Romania", "Uganda": "Uganda", "Croacia": "Croatia",
    "Perú": "Peru", "Jordania": "Jordan", "Gales": "Wales", "Uruguay": "Uruguay", "Mauritania": "Mauritania"
  }
};
