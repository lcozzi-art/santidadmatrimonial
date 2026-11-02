// Textes en français pour fr/index.html. app.js cherche ici chaque texte en espagnol ; ce qui manque reste en espagnol.
window.TRADUCCION = {
  base: "../",
  locale: "fr",
  // Films tab hidden until there are versions in this language; set to true to show it.
  peliculas: false,
  datos: "data/fr.json",
  resenas: "data/resenas-fr.json",
  // "16 de diciembre" -> "16 décembre", "1 de enero" -> "1er janvier"
  fecha: function (s) {
    var m = String(s).match(/^(\d{1,2}) de (\w+)$/);
    var mes = m && window.TRADUCCION.meses[m[2].charAt(0).toUpperCase() + m[2].slice(1)];
    return mes ? (m[1] === "1" ? "1er" : m[1]) + " " + mes.toLowerCase() : s;
  },
  // "4 hijos y 25 años de matrimonio" -> "4 enfants et 25 ans de mariage"
  familia: function (s) {
    return s.replace(/(\d+) años de matrimonio/g, "$1 ans de mariage").replace(/años de casado/g, "ans de mariage")
      .replace(/años entre ambos matrimonios/g, "ans entre les deux mariages").replace(/meses de matrimonio/g, "mois de mariage")
      .replace(/hijo biológico y (\d+) adoptados/g, "enfant biologique et $1 adoptés").replace(/hijos sacerdotes/g, "fils prêtres")
      .replace(/\(aprox\)/g, "(env.)").replace(/\bhijas\b/g, "filles").replace(/\bhija\b/g, "fille")
      .replace(/\bhijos\b/g, "enfants").replace(/\bhijo\b/g, "fils").replace(/\by\b/g, "et");
  },
  ui: {
    "Santo": "Saint", "Santos": "Saints",
    "Beato": "Bienheureux", "Beatos": "Bienheureux",
    "Venerable": "Vénérable", "Venerables": "Vénérables",
    "Siervo de Dios": "Serviteur de Dieu", "Siervos de Dios": "Serviteurs de Dieu",
    "Reproductor de YouTube": "Lecteur YouTube",
    "Siglo {s}": "{s}e siècle",
    "s. {s}": "{s}e s.",
    "{n} matrimonios": "{n} couples",
    "{n} de {total} matrimonios": "{n} sur {total} couples",
    "No hay fichas con esos filtros. Probá quitar alguno.": "Aucune fiche ne correspond à ces filtres. Essayez d’en retirer un.",
    "Mostrar más ({n} restantes)": "Afficher plus ({n} restants)",
    "País": "Pays", "Siglo": "Siècle", "Fiesta o Memoria": "Fête ou mémoire", "Referencia": "Référence",
    "Matrimonio josefino": "Mariage joséphite",
    "Causa": "Cause", "De ambos esposos": "Des deux époux", "De uno de los esposos": "De l’un des époux",
    "Mártir": "Martyr", "Sí": "Oui",
    "Escuchar el podcast": "Écouter le podcast (en espagnol)",
    "Leer artículo": "Lire l’article",
    "Ver video": "Voir la vidéo",
    "Más información": "Plus d’informations",
    "Buscar en la web": "Rechercher sur le web",
    "Cerrar ficha": "Fermer la fiche",
    "En pocas palabras": "En quelques mots",
    "Para conocer más": "Pour en savoir plus",
    "Bibliografía": "Bibliographie",
    "Su historia": "Leur histoire", "Familia": "Famille", "Fuente": "Source", "(en español)": "(en espagnol)",
    "{n} elegidos": "{n} choisis",
    "{n} caso": "{n} cas", "{n} casos": "{n} cas",
    "{p} del total": "{p} du total",
    "casos del esposo/a o matrimonio": "cas d’un époux ou d’un couple",
    "con causa de ambos esposos": "avec une cause pour les deux époux",
    "mártires": "martyrs",
    "países": "pays",
    "Los {n} con más casos.": "Les {n} qui comptent le plus de cas.",
    "Ver menos": "Voir moins",
    "Ver todos los países": "Voir tous les pays",
    "{n} fiestas o memorias": "{n} fêtes ou mémoires",
    "Reino Unido": "Royaume-Uni",
    "Mapamundi de casos por país": "Carte du monde des cas par pays",
    "Más de {n}": "Plus de {n}",
    "{a} a {b}": "{a} à {b}",
    "Episodio {n}": "Épisode {n}",
    "Escuchar": "Écouter",
    "Ver película": "Voir le film",
    "Ver ficha": "Voir la fiche",
    "Ver {t}": "Voir {t}",
    "No se pudo cargar el mapa.": "La carte n’a pas pu être chargée.",
    "Enviando…": "Envoi…",
    "¡Gracias! Recibimos su mensaje y le responderemos a la brevedad.": "Merci ! Nous avons bien reçu votre message et vous répondrons rapidement.",
    "No se pudo enviar. Intente de nuevo en unos minutos.": "L’envoi a échoué. Réessayez dans quelques minutes.",
    "No se pudieron cargar los datos. Recargá la página.": "Les données n’ont pas pu être chargées. Rechargez la page."
  },
  beatitudes: {
    "santo": "Saint", "santa": "Sainte", "santos": "Saints",
    "beato": "Bienheureux", "beata": "Bienheureuse", "beatos": "Bienheureux",
    "venerable": "Vénérable", "venerables": "Vénérables",
    "siervo de dios": "Serviteur de Dieu", "sierva de dios": "Servante de Dieu", "siervos de dios": "Serviteurs de Dieu"
  },
  referencias: {
    "mártir": "martyr", "religioso/a": "religieux/se", "monarcas": "monarques", "funcionario/a": "fonctionnaire",
    "fundador/a": "fondateur/trice", "educador/a": "éducateur/trice", "nobles": "noblesse", "benefactor/a": "bienfaiteur/trice",
    "padres de santo": "parents d’un saint", "otros": "autres", "médico": "médecin", "profesional": "profession libérale",
    "mística o vidente": "mystique ou voyante", "escritor/periodista": "écrivain/journaliste", "esposas orantes": "épouses en prière",
    "activista social": "militant social", "labrador": "laboureur", "pro vida": "pro-vie", "artesano": "artisan"
  },
  continentes: { "Europa": "Europe", "América": "Amérique", "Asia": "Asie", "África": "Afrique", "Oceanía": "Océanie" },
  meses: {
    "Enero": "Janvier", "Febrero": "Février", "Marzo": "Mars", "Abril": "Avril", "Mayo": "Mai", "Junio": "Juin",
    "Julio": "Juillet", "Agosto": "Août", "Septiembre": "Septembre", "Octubre": "Octobre", "Noviembre": "Novembre", "Diciembre": "Décembre",
    "Ene": "Janv.", "Feb": "Févr.", "Mar": "Mars", "Abr": "Avr.", "May": "Mai", "Jun": "Juin",
    "Jul": "Juil.", "Ago": "Août", "Sep": "Sept.", "Oct": "Oct.", "Nov": "Nov.", "Dic": "Déc."
  },
  paises: {
    "Italia": "Italie", "España": "Espagne", "Francia": "France", "Inglaterra": "Angleterre", "Polonia": "Pologne",
    "Alemania": "Allemagne", "México": "Mexique", "Turquía": "Turquie", "Bélgica": "Belgique", "Hungría": "Hongrie",
    "Argentina": "Argentine", "EEUU": "États-Unis", "Japón": "Japon", "China": "Chine", "Siria": "Syrie", "Brasil": "Brésil",
    "Canadá": "Canada", "Suecia": "Suède", "Portugal": "Portugal", "Ucrania": "Ukraine", "Austria": "Autriche",
    "Irlanda": "Irlande", "Israel": "Israël", "Venezuela": "Venezuela", "Vietnam": "Viêt Nam", "Chequia": "Tchéquie",
    "Suiza": "Suisse", "Islandia": "Islande", "Madagascar": "Madagascar", "Argelia": "Algérie", "Chile": "Chili",
    "Rusia": "Russie", "Filipinas": "Philippines", "Grecia": "Grèce", "Sudáfrica": "Afrique du Sud", "Dinamarca": "Danemark",
    "El Salvador": "Salvador", "Guatemala": "Guatemala", "Tailandia": "Thaïlande", "Ecuador": "Équateur", "Iran": "Iran",
    "Corea": "Corée", "India": "Inde", "Noruega": "Norvège", "Túnez": "Tunisie", "Papua Nueva Guinea": "Papouasie-Nouvelle-Guinée",
    "Haiti": "Haïti", "Trinidad": "Trinité", "Colombia": "Colombie", "Ruanda": "Rwanda", "Burkina Faso": "Burkina Faso",
    "Arabia": "Arabie", "Arabia Saudita": "Arabie saoudite", "Egipto": "Égypte", "Etiopía": "Éthiopie", "Escocia": "Écosse",
    "Bielorrusia": "Biélorussie", "Malta": "Malte", "Chipre": "Chypre", "Lesotho": "Lesotho", "Albania": "Albanie",
    "Eslovaquia": "Slovaquie", "Honduras": "Honduras", "Líbano": "Liban", "Georgia": "Géorgie", "Tanzania": "Tanzanie",
    "Costa de Marfil": "Côte d’Ivoire", "Laos": "Laos", "Rumania": "Roumanie", "Uganda": "Ouganda", "Croacia": "Croatie",
    "Perú": "Pérou", "Jordania": "Jordanie", "Gales": "Pays de Galles", "Uruguay": "Uruguay", "Mauritania": "Mauritanie"
  }
};
