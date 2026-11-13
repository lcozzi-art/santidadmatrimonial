// Textos em português para pt/index.html. app.js procura aqui cada texto em espanhol; o que faltar fica em espanhol.
window.TRADUCCION = {
  base: "../",
  locale: "pt",
  // Films tab hidden until there are versions in this language; set to true to show it.
  peliculas: false,
  datos: "data/pt.json",
  resenas: "data/resenas-pt.json",
  // "16 de diciembre" -> "16 de dezembro", "1 de enero" -> "1º de janeiro"
  fecha: function (s) {
    var m = String(s).match(/^(\d{1,2}) de (\w+)$/);
    var mes = m && window.TRADUCCION.meses[m[2].charAt(0).toUpperCase() + m[2].slice(1)];
    return mes ? (m[1] === "1" ? "1º" : m[1]) + " de " + mes.toLowerCase() : s;
  },
  // "4 hijos y 25 años de matrimonio" -> "4 filhos e 25 anos de casamento"
  familia: function (s) {
    return s.replace(/años de matrimonio/g, "anos de casamento").replace(/años de casado/g, "anos de casamento")
      .replace(/años entre ambos matrimonios/g, "anos entre os dois casamentos").replace(/meses de matrimonio/g, "meses de casamento")
      .replace(/hijo biológico y (\d+) adoptados/g, "filho biológico e $1 adotivos").replace(/hijos sacerdotes/g, "filhos sacerdotes")
      .replace(/\(aprox\)/g, "(aprox.)").replace(/\bhijas\b/g, "filhas").replace(/\bhija\b/g, "filha")
      .replace(/\bhijos\b/g, "filhos").replace(/\bhijo\b/g, "filho").replace(/\by\b/g, "e");
  },
  ui: {
    "Santo": "Santo", "Santos": "Santos",
    "Beato": "Beato", "Beatos": "Beatos",
    "Venerable": "Venerável", "Venerables": "Veneráveis",
    "Siervo de Dios": "Servo de Deus", "Siervos de Dios": "Servos de Deus",
    "Reproductor de YouTube": "Player do YouTube",
    "Siglo {s}": "Século {s}",
    "s. {s}": "séc. {s}",
    "{n} matrimonios": "{n} casais",
    "{n} de {total} matrimonios": "{n} de {total} casais",
    "No hay fichas con esos filtros. Probá quitar alguno.": "Não há fichas com esses filtros. Tente remover algum.",
    "Mostrar más ({n} restantes)": "Mostrar mais ({n} restantes)",
    "País": "País", "Siglo": "Século", "Fiesta o Memoria": "Festa ou memória", "Referencia": "Referência",
    "Matrimonio josefino": "Matrimônio josefino",
    "Causa": "Causa", "De ambos esposos": "De ambos os esposos", "De uno de los esposos": "De um dos esposos",
    "Mártir": "Mártir", "Sí": "Sim",
    "Escuchar el podcast": "Ouvir o podcast (em espanhol)",
    "Leer artículo": "Ler o artigo",
    "Ver video": "Ver o vídeo",
    "Más información": "Mais informações",
    "Buscar en la web": "Buscar na web",
    "Cerrar ficha": "Fechar a ficha",
    "En pocas palabras": "Em poucas palavras",
    "Para conocer más": "Para saber mais",
    "Bibliografía": "Bibliografia",
    "Su historia": "Sua história", "Familia": "Família", "Fuente": "Fonte", "(en español)": "(em espanhol)",
    "{n} elegidos": "{n} selecionados",
    "{n} caso": "{n} caso", "{n} casos": "{n} casos",
    "{p} del total": "{p} do total",
    "casos del esposo/a o matrimonio": "casos de um esposo/a ou de um casal",
    "con causa de ambos esposos": "com causa de ambos os esposos",
    "mártires": "mártires",
    "países": "países",
    "Los {n} con más casos.": "Os {n} com mais casos.",
    "Ver menos": "Ver menos",
    "Ver todos los países": "Ver todos os países",
    "{n} fiestas o memorias": "{n} festas ou memórias",
    "Reino Unido": "Reino Unido",
    "Mapamundi de casos por país": "Mapa-múndi de casos por país",
    "Más de {n}": "Mais de {n}",
    "{a} a {b}": "{a} a {b}",
    "Episodio {n}": "Episódio {n}",
    "Escuchar": "Ouvir",
    "Ver película": "Ver o filme",
    "Ver ficha": "Ver a ficha",
    "Ver {t}": "Ver {t}",
    "No se pudo cargar el mapa.": "Não foi possível carregar o mapa.",
    "Enviando…": "Enviando…",
    "¡Gracias! Recibimos su mensaje y le responderemos a la brevedad.": "Obrigado! Recebemos sua mensagem e responderemos em breve.",
    "No se pudo enviar. Intente de nuevo en unos minutos.": "Não foi possível enviar. Tente novamente em alguns minutos.",
    "No se pudieron cargar los datos. Recargá la página.": "Não foi possível carregar os dados. Recarregue a página."
  },
  beatitudes: {
    "santo": "Santo", "santa": "Santa", "santos": "Santos",
    "beato": "Beato", "beata": "Beata", "beatos": "Beatos",
    "venerable": "Venerável", "venerables": "Veneráveis",
    "siervo de dios": "Servo de Deus", "sierva de dios": "Serva de Deus", "siervos de dios": "Servos de Deus"
  },
  referencias: {
    "mártir": "mártir", "religioso/a": "religioso/a", "monarcas": "monarcas", "funcionario/a": "funcionário/a",
    "fundador/a": "fundador/a", "educador/a": "educador/a", "nobles": "nobres", "benefactor/a": "benfeitor/a",
    "padres de santo": "pais de santos", "otros": "outros", "médico": "médico", "profesional": "profissional",
    "mística o vidente": "mística ou vidente", "escritor/periodista": "escritor/jornalista", "esposas orantes": "esposas orantes",
    "activista social": "ativista social", "labrador": "lavrador", "pro vida": "pró-vida", "artesano": "artesão"
  },
  continentes: { "Europa": "Europa", "América": "América", "Asia": "Ásia", "África": "África", "Oceanía": "Oceania" },
  meses: {
    "Enero": "Janeiro", "Febrero": "Fevereiro", "Marzo": "Março", "Abril": "Abril", "Mayo": "Maio", "Junio": "Junho",
    "Julio": "Julho", "Agosto": "Agosto", "Septiembre": "Setembro", "Octubre": "Outubro", "Noviembre": "Novembro", "Diciembre": "Dezembro",
    "Ene": "Jan", "Feb": "Fev", "Mar": "Mar", "Abr": "Abr", "May": "Mai", "Jun": "Jun",
    "Jul": "Jul", "Ago": "Ago", "Sep": "Set", "Oct": "Out", "Nov": "Nov", "Dic": "Dez"
  },
  paises: {
    "Italia": "Itália", "España": "Espanha", "Francia": "França", "Inglaterra": "Inglaterra", "Polonia": "Polônia",
    "Alemania": "Alemanha", "México": "México", "Turquía": "Turquia", "Bélgica": "Bélgica", "Hungría": "Hungria",
    "Argentina": "Argentina", "EEUU": "Estados Unidos", "Japón": "Japão", "China": "China", "Siria": "Síria", "Brasil": "Brasil",
    "Canadá": "Canadá", "Suecia": "Suécia", "Portugal": "Portugal", "Ucrania": "Ucrânia", "Austria": "Áustria",
    "Irlanda": "Irlanda", "Israel": "Israel", "Venezuela": "Venezuela", "Vietnam": "Vietnã", "Chequia": "Tchéquia",
    "Suiza": "Suíça", "Islandia": "Islândia", "Madagascar": "Madagascar", "Argelia": "Argélia", "Chile": "Chile",
    "Rusia": "Rússia", "Filipinas": "Filipinas", "Grecia": "Grécia", "Sudáfrica": "África do Sul", "Dinamarca": "Dinamarca",
    "El Salvador": "El Salvador", "Guatemala": "Guatemala", "Tailandia": "Tailândia", "Ecuador": "Equador", "Iran": "Irã",
    "Corea": "Coreia", "India": "Índia", "Noruega": "Noruega", "Túnez": "Tunísia", "Papua Nueva Guinea": "Papua-Nova Guiné", "Australia": "Austrália",
    "Haiti": "Haiti", "Trinidad": "Trinidad", "Colombia": "Colômbia", "Ruanda": "Ruanda", "Burkina Faso": "Burkina Faso",
    "Arabia": "Arábia", "Arabia Saudita": "Arábia Saudita", "Egipto": "Egito", "Etiopía": "Etiópia", "Escocia": "Escócia",
    "Bielorrusia": "Bielorrússia", "Malta": "Malta", "Chipre": "Chipre", "Lesotho": "Lesoto", "Albania": "Albânia",
    "Eslovaquia": "Eslováquia", "Honduras": "Honduras", "Líbano": "Líbano", "Georgia": "Geórgia", "Tanzania": "Tanzânia",
    "Costa de Marfil": "Costa do Marfim", "Laos": "Laos", "Rumania": "Romênia", "Uganda": "Uganda", "Croacia": "Croácia",
    "Perú": "Peru", "Jordania": "Jordânia", "Gales": "País de Gales", "Uruguay": "Uruguai", "Mauritania": "Mauritânia"
  }
};
