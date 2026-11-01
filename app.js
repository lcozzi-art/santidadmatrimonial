// Santidad Matrimonial: renders the cards, filters and fichas from data/matrimonios.json.
(function () {
  // Link to the podcast's channel or playlist; leave empty to hide the button.
  var CANAL_PODCAST = "https://open.spotify.com/show/1JpMc7SNgKkQx8vrc84TUn";

  // Translation: en/index.html loads i18n-en.js first, which sets window.TRADUCCION.
  // Texts are written in Spanish and looked up in it; anything missing stays in Spanish.
  var TR = window.TRADUCCION || {};
  var BASE = TR.base || "";
  function t(s, v) {
    var r = (TR.ui && TR.ui[s]) || s;
    return v ? r.replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }) : r;
  }
  // Data values (countries, references, months...) stay in Spanish for filtering; only the label changes.
  function tv(grupo, s) { return (TR[grupo] && TR[grupo][s]) || s; }
  function paisTxt(p) { return p ? p.split("/").map(function (x) { return tv("paises", x.trim()); }).join(" / ") : p; }
  function refTxt(r) { return tv("referencias", r); }
  function beatitudTxt(b) { return b ? b.split("/").map(function (x) { return tv("beatitudes", x.trim().toLowerCase()); }).join("/") : b; }
  var LOCALE = TR.locale || "es";

  var ETAPAS = [
    { cod: "S", nombre: t("Santo"), plural: t("Santos"), c: "var(--st-s)" },
    { cod: "B", nombre: t("Beato"), plural: t("Beatos"), c: "var(--st-b)" },
    { cod: "V", nombre: t("Venerable"), plural: t("Venerables"), c: "var(--st-v)" },
    { cod: "SdD", nombre: t("Siervo de Dios"), plural: t("Siervos de Dios"), c: "var(--st-sdd)" }
  ];
  var ROMANOS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
  var LOTE = 48;
  var datos = [], episodios = [], peliculas = [], filtrados = [], mostrados = 0;
  var etapasActivas = {};
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  // Compares texts ignoring case, accents, spaces and punctuation.
  function soloLetras(s) { return norm(s).replace(/[^a-z0-9]/g, ""); }
  function etapa(m) { return ETAPAS.find(function (e) { return e.cod === m.proceso; }) || ETAPAS[ETAPAS.length - 1]; }
  function sigloNum(s) { var i = ROMANOS.indexOf(String(s || "").trim()); return i < 0 ? 99 : i; }
  function ytThumb(url) {
    var m = String(url || "").match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    return m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : null;
  }
  // YouTube links play inside the page: the button swaps the photo for the player.
  function ytAttr(id) { return id ? ' data-yt="' + esc(id) + '"' : ''; }
  function reproductor(id) {
    return '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0" title="' + esc(t("Reproductor de YouTube")) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
  }
  function reproducir(a, ev) {
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button) return;
    var caja = a.closest(".ficha, .ep"); if (!caja) return;
    ev.preventDefault();
    var lugar = caja.querySelector(".foto, .video");
    lugar.outerHTML = reproductor(a.dataset.yt);
    if (caja.id === "ficha") caja.scrollTop = 0;
  }
  var ANILLOS = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="15" cy="20" r="10"/><circle cx="25" cy="20" r="10"/></svg>';

  function fotoHTML(m, sizes) {
    var src = m.foto ? BASE + m.foto : ytThumb(m.fotoYT);
    var em = '<div class="emblema">' + ANILLOS + '<span>' + esc(m.siglo ? t("Siglo {s}", { s: m.siglo }) : "") + '</span></div>';
    if (!src) return '<div class="foto">' + em + '</div>';
    return '<div class="foto">' + em + '<img src="' + esc(src) + '" alt="' + esc(m.nombres) + '" loading="lazy" onerror="this.remove()"></div>';
  }

  function tarjeta(m) {
    var e = etapa(m);
    return '<a class="card" href="#m' + m.id + '" style="--c:' + e.c + '">' + fotoHTML(m) +
      '<div class="card-body"><span class="estado">' + esc(beatitudTxt(m.beatitud) || e.nombre) + '</span>' +
      '<h3>' + esc(m.nombres) + '</h3>' +
      (m.descripcion ? '<p>' + esc(m.descripcion) + '</p>' : '') +
      '<div class="meta">' + (m.pais ? '<span>' + esc(paisTxt(m.pais)) + '</span>' : '') + (m.siglo ? '<span>' + esc(t("s. {s}", { s: m.siglo })) + '</span>' : '') +
      (m.fiesta ? '<span>' + esc(m.fiesta) + '</span>' : '') + '</div></div></a>';
  }

  function aplicarFiltros() {
    var q = norm($("q").value).trim();
    var pais = elegidos("f-pais"), siglo = elegidos("f-siglo"), ref = elegidos("f-ref"), mes = elegidos("f-mes");
    var ambos = $("f-ambos").checked, religiosos = $("f-religiosos").checked || ref.indexOf("religioso/a") >= 0, pod = $("f-podcast").checked;
    var algunaEtapa = Object.keys(etapasActivas).some(function (k) { return etapasActivas[k]; });
    filtrados = datos.filter(function (m) {
      if (algunaEtapa && !etapasActivas[m.proceso]) return false;
      if (pais.length && !m._paises.some(function (p) { return pais.indexOf(p) >= 0; })) return false;
      if (siglo.length && siglo.indexOf(m.siglo) < 0) return false;
      if (ref.length && ref.indexOf(m.referencia) < 0) return false;
      if (mes.length && mes.indexOf(m._mes) < 0) return false;
      if (ambos && !m.ambos) return false;
      if (!religiosos && m.referencia === "religioso/a") return false;
      if (pod && !m.podcast) return false;
      if (q && m._txt.indexOf(q) < 0) return false;
      return true;
    });
    var orden = $("f-orden").value;
    filtrados.sort(function (a, b) {
      if (orden === "siglo") return sigloNum(a.siglo) - sigloNum(b.siglo) || a._orden.localeCompare(b._orden);
      if (orden === "siglo-desc") return sigloNum(b.siglo) - sigloNum(a.siglo) || a._orden.localeCompare(b._orden);
      if (orden === "fiesta") return (a.fiestaOrden || 9999) - (b.fiestaOrden || 9999) || a._orden.localeCompare(b._orden, LOCALE);
      if (orden === "destacados") return b._peso - a._peso || a._orden.localeCompare(b._orden, LOCALE);
      return a._orden.localeCompare(b._orden, LOCALE);
    });
    mostrados = 0;
    $("grid").innerHTML = "";
    pintarLote();
    var n = filtrados.length;
    $("conteo").textContent = n === datos.length ? t("{n} matrimonios", { n: n }) : t("{n} de {total} matrimonios", { n: n, total: datos.length });
    if (!n) $("grid").innerHTML = '<p class="conteo">' + esc(t("No hay fichas con esos filtros. Probá quitar alguno.")) + '</p>';
  }
  function pintarLote() {
    var trozo = filtrados.slice(mostrados, mostrados + LOTE);
    $("grid").insertAdjacentHTML("beforeend", trozo.map(tarjeta).join(""));
    mostrados += trozo.length;
    $("btn-mas").hidden = mostrados >= filtrados.length;
    $("btn-mas").textContent = t("Mostrar más ({n} restantes)", { n: filtrados.length - mostrados });
  }

  // Quotes always use « » instead of “ ” or straight double quotes.
  function angulares(s) {
    return s.replace(/(^|[\s(\[:;—–-])["“”](?=[\p{L}\d¿¡.…])/gu, "$1«").replace(/["“”]/g, "»");
  }

  function fichaHTML(m) {
    var e = etapa(m);
    var filas = [
      [t("País"), paisTxt(m.pais)], [t("Siglo"), m.siglo], [t("Fiesta o Memoria"), m.fiesta], [t("Referencia"), refTxt(m.referencia)], ["", m.josefino ? t("Matrimonio josefino") : null],
      [t("Causa"), m.ambos ? t("De ambos esposos") : t("De uno de los esposos")],
      [t("Mártir"), m.martir ? t("Sí") : null]
    ].filter(function (f) { return f[1]; }).map(function (f) { return "<dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("");
    var links = [];
    if (m.podcast) links.push('<a class="btn" href="' + esc(m.podcast) + '"' + ytAttr(m.podcastId) + ' target="_blank" rel="noopener">' + t("Escuchar el podcast") + '</a>');
    if (m.articulo) links.push('<a class="btn' + (m.podcast ? ' sec' : '') + '" href="' + esc(m.articulo) + '" target="_blank" rel="noopener">' + t("Leer artículo") + '</a>');
    if (m.video) links.push('<a class="btn sec" href="' + esc(m.video) + '"' + ytAttr(m.videoId) + ' target="_blank" rel="noopener">' + t("Ver video") + '</a>');
    if (m.masInfo && m.masInfo !== m.articulo) links.push('<a class="btn sec" href="' + esc(m.masInfo) + '" target="_blank" rel="noopener">' + t("Más información") + '</a>');
    links.push('<a class="btn sec" href="https://www.google.com/search?q=' + encodeURIComponent(m._tituloES || m.titulo) + '" target="_blank" rel="noopener">' + t("Buscar en la web") + '</a>');
    return '<button class="cerrar" type="button" aria-label="' + esc(t("Cerrar ficha")) + '" data-cerrar>×</button>' + fotoHTML(m) +
      '<div class="ficha-in" style="--c:' + e.c + '">' +
      '<div><span class="estado">' + esc(beatitudTxt(m.beatitud) || e.nombre) + '</span><h2 id="ficha-titulo">' + esc(m.titulo) + '</h2>' +
      (m.descripcion ? '<p class="sub">' + esc(m.descripcion) + '</p>' : '') + '</div>' +
      (m.resumen && soloLetras(m.resumen) !== soloLetras(m.descripcion) ? '<div><h4>' + t("En pocas palabras") + '</h4><p class="texto">' + esc(m.resumen) + '</p></div>' : '') +
      (filas ? '<dl class="datos">' + filas + '</dl>' : '') +
      (m.cita ? '<blockquote class="cita">' + esc(LOCALE === "es" ? angulares(m.cita) : m.cita) + '</blockquote>' : '') +
      '<div><h4>' + t("Para conocer más") + '</h4><div class="enlaces">' + links.join("") + '</div></div>' +
      (m.bibliografia ? '<div><h4>' + t("Bibliografía") + '</h4><p class="biblio">' + esc(m.bibliografia) + '</p></div>' : '') +
      '</div>';
  }

  var ultimaVista = "inicio";
  var TITULO = document.title;
  function mostrarVista(v) {
    ["inicio", "podcast", "peliculas", "libro", "estadisticas", "acerca"].forEach(function (n) { $("vista-" + n).hidden = n !== v; });
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.dataset.nav === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    ultimaVista = v;
  }
  function abrirFicha(m) {
    $("ficha").innerHTML = fichaHTML(m);
    $("ficha").hidden = false; $("ficha-fondo").hidden = false;
    $("ficha").scrollTop = 0;
    document.title = m.nombres + " · " + TITULO;
    $("ficha").querySelector("[data-cerrar]").focus();
  }
  function cerrarFicha() {
    $("ficha").innerHTML = "";
    $("ficha").hidden = true; $("ficha-fondo").hidden = true;
    document.title = TITULO;
  }
  function ruta() {
    var h = (location.hash || "").replace("#", "");
    var mm = h.match(/^m(\d+)$/);
    if (mm) {
      var m = datos.find(function (x) { return x.id === +mm[1]; });
      if (m) { abrirFicha(m); return; }
    }
    cerrarFicha();
    var v = ["podcast", "peliculas", "libro", "estadisticas", "acerca"].indexOf(h) >= 0 ? h : "inicio";
    if (v !== ultimaVista) window.scrollTo(0, 0);
    mostrarVista(v);
  }
  // The ES/EN link keeps the open tab or ficha.
  function idioma() {
    document.querySelectorAll("a.idioma").forEach(function (a) { a.href = a.getAttribute("href").split("#")[0] + location.hash; });
  }
  function cerrarYVolver() {
    if (/^#m\d+$/.test(location.hash)) {
      try { history.pushState(null, "", "#" + ultimaVista); } catch (e) {}
    }
    cerrarFicha();
  }

  // Multi-select dropdowns: a <details> with one checkbox per value.
  function opciones(sel, valores) {
    $(sel).querySelector(".opts").insertAdjacentHTML("beforeend", valores.map(function (v) {
      return '<label><input type="checkbox" value="' + esc(v) + '"> ' + esc(etiquetas[sel](v)) + '</label>';
    }).join(""));
  }
  var etiquetas = {
    "f-pais": function (v) { return tv("paises", v); }, "f-siglo": function (v) { return v; },
    "f-ref": refTxt, "f-mes": function (v) { return tv("meses", v); }
  };
  function elegidos(sel) {
    return Array.prototype.map.call($(sel).querySelectorAll("input:checked"), function (i) { return i.value; });
  }
  function rotular(sel) {
    var v = elegidos(sel), d = $(sel);
    $(sel + "-txt").textContent = !v.length ? d.dataset.todos : v.length === 1 ? etiquetas[sel](v[0]) : t("{n} elegidos", { n: v.length });
    d.classList.toggle("activo", v.length > 0);
  }

  // Statistics tab: plain HTML bars; each bar links to the cards with that filter.
  var MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  var MESES_LARGOS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var CONTINENTES = {
    "Europa": ["Italia","España","Francia","Inglaterra","Polonia","Alemania","Bélgica","Hungría","Irlanda","Suecia","Portugal","Ucrania","Austria","Chequia","Suiza","Grecia","Islandia","Rusia","Dinamarca","Noruega","Escocia","Bielorrusia","Malta","Chipre","Albania","Eslovaquia","Rumania","Croacia","Gales"],
    "América": ["México","Argentina","EEUU","Brasil","Canadá","Venezuela","Chile","El Salvador","Guatemala","Ecuador","Haiti","Trinidad","Colombia","Honduras","Perú","Uruguay"],
    "Asia": ["Turquía","Japón","China","Siria","Israel","Vietnam","Filipinas","Tailandia","Iran","Corea","India","Arabia","Arabia Saudita","Líbano","Georgia","Laos","Jordania"],
    "África": ["Madagascar","Argelia","Sudáfrica","Egipto","Túnez","Ruanda","Burkina Faso","Etiopía","Lesotho","Tanzania","Costa de Marfil","Uganda","Mauritania"],
    "Oceanía": ["Papua Nueva Guinea"]
  };
  var PAISES_VISIBLES = 12;
  // Spreadsheet country -> name in data/mundo.json (Natural Earth). England, Scotland and Wales share the United Kingdom.
  var MAPA = {
    "Italia": "Italy", "España": "Spain", "Francia": "France", "Inglaterra": "United Kingdom", "Escocia": "United Kingdom", "Gales": "United Kingdom",
    "Polonia": "Poland", "Alemania": "Germany", "Turquía": "Turkey", "México": "Mexico", "Argentina": "Argentina", "Bélgica": "Belgium",
    "Hungría": "Hungary", "EEUU": "United States of America", "Japón": "Japan", "China": "China", "Siria": "Syria", "Brasil": "Brazil",
    "Canadá": "Canada", "Irlanda": "Ireland", "Suecia": "Sweden", "Portugal": "Portugal", "Ucrania": "Ukraine", "Austria": "Austria",
    "Israel": "Israel", "Venezuela": "Venezuela", "Vietnam": "Vietnam", "Chequia": "Czechia", "Suiza": "Switzerland", "Grecia": "Greece",
    "Islandia": "Iceland", "Madagascar": "Madagascar", "Argelia": "Algeria", "Chile": "Chile", "Rusia": "Russia", "Filipinas": "Philippines",
    "Sudáfrica": "South Africa", "Egipto": "Egypt", "Dinamarca": "Denmark", "El Salvador": "El Salvador", "Guatemala": "Guatemala",
    "Tailandia": "Thailand", "Ecuador": "Ecuador", "Iran": "Iran", "Corea": "South Korea", "India": "India", "Noruega": "Norway",
    "Túnez": "Tunisia", "Papua Nueva Guinea": "Papua New Guinea", "Haiti": "Haiti", "Trinidad": "Trinidad and Tobago", "Colombia": "Colombia",
    "Ruanda": "Rwanda", "Burkina Faso": "Burkina Faso", "Arabia": "Saudi Arabia", "Arabia Saudita": "Saudi Arabia", "Etiopía": "Ethiopia", "Bielorrusia": "Belarus",
    "Malta": "Malta", "Chipre": "Cyprus", "Lesotho": "Lesotho", "Albania": "Albania", "Eslovaquia": "Slovakia", "Honduras": "Honduras",
    "Líbano": "Lebanon", "Georgia": "Georgia", "Tanzania": "Tanzania", "Costa de Marfil": "Côte d'Ivoire", "Laos": "Laos", "Rumania": "Romania",
    "Uganda": "Uganda", "Croacia": "Croatia", "Perú": "Peru", "Jordania": "Jordan", "Uruguay": "Uruguay", "Mauritania": "Mauritania"
  };
  // Upper bound of each color step; counts above the last one take the darkest.
  var ESCALONES = [4, 9, 24, 69];

  function contar(lista, clave) {
    var c = {};
    datos.forEach(function (m) { [].concat(clave(m)).forEach(function (k) { if (k) c[k] = (c[k] || 0) + 1; }); });
    return (lista || Object.keys(c)).map(function (k) { return { k: k, n: c[k] || 0 }; });
  }
  function porMayor(a, b) { return b.n - a.n || a.k.localeCompare(b.k, "es"); }
  function pct(n) { return Math.round(n * 100 / datos.length) + "%"; }
  function barras(id, filas, opc) {
    opc = opc || {};
    var max = Math.max.apply(null, filas.map(function (f) { return f.n; })) || 1;
    $(id).innerHTML = filas.map(function (f, i) {
      var tip = t(f.n === 1 ? "{n} caso" : "{n} casos", { n: f.n }) + " · " + t("{p} del total", { p: pct(f.n) });
      var dentro = '<span class="b-lbl">' + esc(f.lbl || f.k) + '</span>' +
        '<span class="b-pista"><span class="b-barra" style="width:' + (f.n * 100 / max) + '%;' + (f.c ? '--c:' + f.c : '') + '"></span></span>' +
        '<span class="b-num">' + f.n + '</span>';
      var oculto = opc.visibles && i >= opc.visibles ? " hidden" : "";
      return f.filtro ? '<a class="b-fila" href="#inicio" data-filtro="' + esc(f.filtro) + '" data-tip="' + esc(tip) + '"' + oculto + '>' + dentro + '</a>'
        : '<div class="b-fila" data-tip="' + esc(tip) + '"' + oculto + '>' + dentro + '</div>';
    }).join("");
  }
  function pintarEstadisticas() {
    var nPaises = contar(null, function (m) { return m._paises; }).length;
    var cifras = [
      [datos.length, t("casos del esposo/a o matrimonio")],
      [datos.filter(function (m) { return m.ambos; }).length, t("con causa de ambos esposos"), "ambos"],
      [datos.filter(function (m) { return m.martir; }).length, t("mártires")],
      [nPaises, t("países")]
    ];
    $("est-cifras").innerHTML = cifras.map(function (c) {
      var dentro = '<b>' + c[0] + '</b><span>' + c[1] + '</span>';
      return '<li>' + (c[2] ? '<a class="cifra" href="#inicio" data-filtro="' + c[2] + '">' + dentro + '</a>' : '<div class="cifra">' + dentro + '</div>') + '</li>';
    }).join("");

    barras("est-etapa", ETAPAS.map(function (e) {
      return { k: e.plural, n: datos.filter(function (m) { return m.proceso === e.cod; }).length, c: e.c, filtro: "etapa|" + e.cod };
    }));

    barras("est-continente", contar(Object.keys(CONTINENTES), function (m) {
      var cs = m._paises.map(function (p) { return Object.keys(CONTINENTES).find(function (c) { return CONTINENTES[c].indexOf(p) >= 0; }); });
      return cs.filter(function (c, i) { return c && cs.indexOf(c) === i; });
    }).sort(porMayor).map(function (f) { f.lbl = tv("continentes", f.k); return f; }));

    var paises = contar(null, function (m) { return m._paises; }).sort(porMayor);
    paises.forEach(function (f) { f.filtro = "pais|" + f.k; f.lbl = tv("paises", f.k); });
    barras("est-pais", paises, { visibles: PAISES_VISIBLES });
    $("est-pais-nota").textContent = t("Los {n} con más casos.", { n: PAISES_VISIBLES });
    var todosAbiertos = false;
    $("est-pais-todos").onclick = function () {
      todosAbiertos = !todosAbiertos;
      $("est-pais").querySelectorAll(".b-fila").forEach(function (b, i) { b.hidden = !todosAbiertos && i >= PAISES_VISIBLES; });
      this.textContent = todosAbiertos ? t("Ver menos") : t("Ver todos los países");
    };

    var refs = contar(null, function (m) { return m.referencia; }).sort(porMayor);
    refs.forEach(function (f) { var r = refTxt(f.k); f.filtro = "ref|" + f.k; f.lbl = r.charAt(0).toUpperCase() + r.slice(1); });
    barras("est-ref", refs);

    // Centuries: one stacked column per century, split by stage.
    var usados = ROMANOS.filter(function (r) { return datos.some(function (m) { return m.siglo === r; }); });
    var tot = usados.map(function (r) { return datos.filter(function (m) { return m.siglo === r; }).length; });
    var max = Math.max.apply(null, tot);
    $("est-leyenda").innerHTML = ETAPAS.map(function (e) { return '<li style="--c:' + e.c + '"><i></i>' + e.plural + '</li>'; }).join("");
    $("est-siglo").innerHTML = usados.map(function (r, i) {
      var segs = ETAPAS.map(function (e) {
        var n = datos.filter(function (m) { return m.siglo === r && m.proceso === e.cod; }).length;
        return n ? '<span class="c-seg" style="height:' + (n * 88 / max) + '%;--c:' + e.c + '" data-tip="' + esc(t("Siglo {s}", { s: r })) + ': ' + n + ' ' + (n === 1 ? e.nombre : e.plural).toLowerCase() + '"></span>' : "";
      }).reverse().join("");
      return '<a class="c-col" href="#inicio" data-filtro="siglo|' + r + '" aria-label="' + esc(t("Siglo {s}", { s: r }) + ': ' + t("{n} casos", { n: tot[i] })) + '">' +
        '<span class="c-pila"><span class="c-num">' + tot[i] + '</span>' + segs + '</span><span class="c-lbl">' + r + '</span></a>';
    }).join("");

    var meses = MESES.map(function (mes, i) {
      return { k: tv("meses", mes), largo: MESES_LARGOS[i], n: datos.filter(function (m) { return m._mes === MESES_LARGOS[i]; }).length };
    });
    var maxMes = Math.max.apply(null, meses.map(function (f) { return f.n; }));
    $("est-mes").innerHTML = meses.map(function (f) {
      return '<a class="c-col" href="#inicio" data-filtro="mes|' + f.largo + '" data-tip="' + esc(tv("meses", f.largo) + ': ' + t("{n} fiestas o memorias", { n: f.n })) + '">' +
        '<span class="c-pila"><span class="c-num">' + f.n + '</span><span class="c-seg" style="height:' + (f.n * 88 / maxMes) + '%"></span></span><span class="c-lbl">' + f.k + '</span></a>';
    }).join("");
  }
  // World map: each country shaded by its number of cases, in steps of one hue.
  function pintarMapa(mundo) {
    var grupos = {};
    datos.forEach(function (m) {
      var vistos = {};
      m._paises.forEach(function (p) {
        var en = MAPA[p]; if (!en || vistos[en]) return;
        vistos[en] = 1;
        var g = grupos[en] || (grupos[en] = { n: 0, es: [] });
        g.n++; if (g.es.indexOf(p) < 0) g.es.push(p);
      });
    });
    function paso(n) { var i = 0; while (i < ESCALONES.length && n > ESCALONES[i]) i++; return i + 1; }
    function etiqueta(g) { var ns = g.es.map(function (p) { return tv("paises", p); }); return ns.length > 1 ? t("Reino Unido") + " (" + ns.join(", ") + ")" : ns[0]; }
    var formas = mundo.paises.map(function (p) {
      var g = grupos[p.n];
      if (!g) return '<path class="m-pais" d="' + p.d + '"/>';
      var tip = etiqueta(g) + ": " + t(g.n === 1 ? "{n} caso" : "{n} casos", { n: g.n });
      var marca = p.c ? '<circle class="m-punto" cx="' + p.c[0] + '" cy="' + p.c[1] + '" r="4"/>' : "";
      return '<a href="#inicio" data-filtro="pais|' + esc(g.es.join(",")) + '" data-tip="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
        '<path class="m-pais m' + paso(g.n) + '" d="' + p.d + '"/>' + marca + '</a>';
    }).join("");
    $("est-mapa").innerHTML = '<svg viewBox="0 0 ' + mundo.w + ' ' + mundo.h + '" role="group" aria-label="' + esc(t("Mapamundi de casos por país")) + '">' + formas + '</svg>';
    var desde = 1;
    $("est-mapa-ley").innerHTML = ESCALONES.concat([null]).map(function (hasta, i) {
      var txt = hasta == null ? t("Más de {n}", { n: desde - 1 }) : hasta === desde ? String(hasta) : t("{a} a {b}", { a: desde, b: hasta });
      desde = (hasta || 0) + 1;
      return '<li><i class="m' + (i + 1) + '"></i>' + txt + '</li>';
    }).join("");
  }
  // Clear every filter, then apply the one the bar stands for.
  function filtrarDesde(filtro) {
    var p = filtro.split("|"), tipo = p[0], valor = p[1];
    $("q").value = "";
    ["f-ambos", "f-podcast"].forEach(function (id) { $(id).checked = false; });
    $("f-religiosos").checked = true; // the bars count every case
    ["f-pais", "f-siglo", "f-ref", "f-mes"].forEach(function (id) {
      $(id).querySelectorAll("input").forEach(function (i) { i.checked = false; });
    });
    etapasActivas = {};
    $("chips-etapa").querySelectorAll("[data-etapa]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    if (tipo === "etapa") { etapasActivas[valor] = true; $("chips-etapa").querySelector('[data-etapa="' + valor + '"]').setAttribute("aria-pressed", "true"); }
    else if (tipo === "ambos" || tipo === "podcast") $("f-" + tipo).checked = true;
    else {
      var sel = { pais: "f-pais", siglo: "f-siglo", ref: "f-ref", mes: "f-mes" }[tipo];
      var valores = valor.split(",");
      $(sel).querySelectorAll("input").forEach(function (i) { if (valores.indexOf(i.value) >= 0) i.checked = true; });
    }
    ["f-pais", "f-siglo", "f-ref", "f-mes"].forEach(rotular);
    // Within one month, list the cases in calendar order.
    if (tipo === "mes") $("f-orden").value = "fiesta";
    aplicarFiltros();
  }
  function tooltip() {
    var t = document.createElement("div");
    t.className = "tip"; t.hidden = true; document.body.appendChild(t);
    function mostrar(ev) {
      var el = ev.target.closest && ev.target.closest("[data-tip]");
      if (!el || !$("vista-estadisticas").contains(el)) { t.hidden = true; return; }
      t.textContent = el.dataset.tip; t.hidden = false;
      var r = el.getBoundingClientRect(), x = ev.clientX != null && ev.type !== "focusin" ? ev.clientX : r.left + r.width / 2;
      var y = ev.type === "focusin" ? r.top : Math.min(ev.clientY, r.bottom);
      t.style.left = Math.max(8, Math.min(window.innerWidth - t.offsetWidth - 8, x - t.offsetWidth / 2)) + "px";
      t.style.top = Math.max(8, y - t.offsetHeight - 12) + "px";
    }
    document.addEventListener("mousemove", mostrar);
    document.addEventListener("focusin", mostrar);
    document.addEventListener("scroll", function () { t.hidden = true; }, { passive: true });
  }

  // Translated fields for each ficha and episode (data/en.json), keyed by id and by video id.
  function traducir(json, tr) {
    var tm = tr.matrimonios || {}, te = tr.episodios || {};
    json.matrimonios.forEach(function (m) {
      var x = tm[m.id];
      m._es = [m.titulo, m.nombres, m.descripcion, m.resumen].join(" ");
      m._tituloES = m.titulo;
      if (x) ["titulo", "nombres", "descripcion", "resumen", "cita"].forEach(function (k) { if (x[k] != null && m[k]) m[k] = x[k]; });
      if (m.fiesta && TR.fecha) m.fiesta = TR.fecha(m.fiesta);
    });
    json.episodios.forEach(function (ep) {
      var x = te[ep.podcastId];
      if (x) ["nombre", "descripcion"].forEach(function (k) { if (x[k] != null && ep[k]) ep[k] = x[k]; });
    });
    return json;
  }

  function iniciar(json) {
    datos = json.matrimonios; episodios = json.episodios; peliculas = json.peliculas || [];
    datos.forEach(function (m) {
      m._orden = norm(m.nombres);
      // "Italia/Francia" counts for each country.
      m._paises = m.pais ? m.pais.split("/").map(function (p) { return p.trim(); }).filter(Boolean) : [];
      m._peso = (m.foto ? 2 : 0) + (m.podcast ? 2 : 0) + (m.fotoYT ? 1 : 0);
      m._mes = m.fiestaOrden ? MESES_LARGOS[Math.floor(m.fiestaOrden / 100) - 1] : null;
      m._txt = norm([m.titulo, m.fiesta, m.nombres, m.descripcion, m.resumen, m.pais, m.referencia, m.beatitud,
        m._es, paisTxt(m.pais), refTxt(m.referencia), beatitudTxt(m.beatitud)].join(" "));
    });
    $("resumen").innerHTML = ETAPAS.map(function (e) {
      var n = datos.filter(function (m) { return m.proceso === e.cod; }).length;
      return '<li style="--c:' + e.c + '"><b>' + n + '</b><span>' + e.plural + '</span></li>';
    }).join("");
    $("chips-etapa").innerHTML = ETAPAS.map(function (e) {
      return '<button type="button" class="chip" aria-pressed="false" data-etapa="' + e.cod + '" style="--c:' + e.c + '"><i></i>' + e.plural + '</button>';
    }).join("");
    var cuenta = function (k) {
      var c = {}; datos.forEach(function (m) { if (m[k]) c[m[k]] = (c[m[k]] || 0) + 1; });
      return Object.keys(c);
    };
    var paises = {}; datos.forEach(function (m) { m._paises.forEach(function (p) { paises[p] = 1; }); });
    var porEtiqueta = function (sel) { return function (a, b) { return etiquetas[sel](a).localeCompare(etiquetas[sel](b), LOCALE); }; };
    opciones("f-pais", Object.keys(paises).sort(porEtiqueta("f-pais")));
    opciones("f-siglo", cuenta("siglo").sort(function (a, b) { return sigloNum(a) - sigloNum(b); }));
    opciones("f-ref", cuenta("referencia").sort(porEtiqueta("f-ref")));
    opciones("f-mes", MESES_LARGOS);

    $("episodios").innerHTML = episodios.map(function (ep) {
      var mini = ytThumb(ep.podcast);
      return '<li class="ep"><div class="foto"><div class="emblema">' + ANILLOS + '</div>' +
        (mini ? '<img src="' + mini + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</div>' +
        '<div class="ep-body">' + (ep.numero ? '<span class="ep-num">' + t("Episodio {n}", { n: ep.numero }) + '</span>' : '') + '<h3>' + esc(ep.nombre) + '</h3>' + (ep.descripcion ? '<p>' + esc(ep.descripcion) + '</p>' : '') +
        '<div class="ep-links">' + (ep.podcast ? '<a href="' + esc(ep.podcast) + '"' + ytAttr(ep.podcastId) + ' target="_blank" rel="noopener">' + t("Escuchar") + '</a>' : '') +
        (ep.articulo ? '<a href="' + esc(ep.articulo) + '" target="_blank" rel="noopener">' + t("Leer artículo") + '</a>' : '') + '</div></div></li>';
    }).join("");
    // Films: the thumbnail plays the video in place; the couple's name opens its ficha.
    $("lista-peliculas").innerHTML = peliculas.map(function (p) {
      var m = datos.find(function (x) { return x.id === p.ficha; });
      return '<li class="ep"><a class="foto" href="' + esc(p.video) + '"' + ytAttr(p.videoId) + ' target="_blank" rel="noopener" aria-label="' + esc(t("Ver {t}", { t: p.titulo })) + '">' +
        '<div class="emblema">' + ANILLOS + '</div>' + (ytThumb(p.video) ? '<img src="' + ytThumb(p.video) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '<span class="play" aria-hidden="true"></span></a>' +
        '<div class="ep-body">' + (m ? '<a class="ep-num" href="#m' + m.id + '">' + esc(m.nombres) + '</a>' : '') + '<h3>' + esc(p.titulo) + '</h3>' + (p.descripcion ? '<p>' + esc(p.descripcion) + '</p>' : '') +
        '<div class="ep-links"><a href="' + esc(p.video) + '"' + ytAttr(p.videoId) + ' target="_blank" rel="noopener">' + t("Ver película") + '</a>' +
        (m ? '<a href="#m' + m.id + '">' + t("Ver ficha") + '</a>' : '') + '</div></div></li>';
    }).join("");
    pintarEstadisticas();
    fetch(BASE + "data/mundo.json?v=2026-10-27b").then(function (r) { return r.json(); }).then(pintarMapa).catch(function () {
      $("est-mapa").textContent = t("No se pudo cargar el mapa.");
    });
    tooltip();
    if (CANAL_PODCAST) { $("canal").href = CANAL_PODCAST; $("canal-wrap").hidden = false; }

    ["q", "f-orden", "f-ambos", "f-religiosos", "f-podcast"].forEach(function (id) {
      $(id).addEventListener(id === "q" ? "input" : "change", aplicarFiltros);
    });
    var multis = ["f-pais", "f-siglo", "f-ref", "f-mes"];
    multis.forEach(function (id) {
      var d = $(id);
      d.addEventListener("change", function () {
        // Picking a month lists its cases in calendar order.
        if (id === "f-mes" && elegidos(id).length) $("f-orden").value = "fiesta";
        rotular(id); aplicarFiltros();
      });
      d.addEventListener("click", function (ev) {
        if (!ev.target.closest("[data-limpiar]")) return;
        d.querySelectorAll("input:checked").forEach(function (i) { i.checked = false; });
        rotular(id); aplicarFiltros(); d.open = false;
      });
      // Only one dropdown open at a time.
      d.addEventListener("toggle", function () {
        if (d.open) multis.forEach(function (o) { if (o !== id) $(o).open = false; });
      });
    });
    document.addEventListener("click", function (ev) {
      multis.forEach(function (id) { if (!$(id).contains(ev.target)) $(id).open = false; });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") multis.forEach(function (id) { $(id).open = false; });
    });
    $("chips-etapa").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-etapa]"); if (!b) return;
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on); etapasActivas[b.dataset.etapa] = on; aplicarFiltros();
    });
    $("btn-mas").addEventListener("click", pintarLote);
    // Contact form: send through FormSubmit without leaving the page.
    $("contacto").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = ev.target, estado = $("contacto-estado"), boton = f.querySelector("button");
      boton.disabled = true; estado.hidden = false; estado.textContent = t("Enviando…");
      fetch(f.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), { method: "POST", headers: { Accept: "application/json" }, body: new FormData(f) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (String(r.success) !== "true") throw new Error(r.message);
          f.reset(); estado.textContent = t("¡Gracias! Recibimos su mensaje y le responderemos a la brevedad.");
          boton.disabled = false;
        })
        .catch(function () {
          // AJAX refused (form not yet activated, blocker, network): send it the classic way so the message is not lost.
          estado.textContent = t("Enviando…");
          HTMLFormElement.prototype.submit.call(f);
        });
    });
    if (/[?&]enviado=1/.test(location.search)) {
      var est = $("contacto-estado"); est.hidden = false;
      est.textContent = t("¡Gracias! Recibimos su mensaje y le responderemos a la brevedad.");
    }
    $("ficha-fondo").addEventListener("click", cerrarYVolver);
    $("ficha").addEventListener("click", function (ev) { if (ev.target.closest("[data-cerrar]")) cerrarYVolver(); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !$("ficha").hidden) cerrarYVolver(); });
    // Cards and nav use plain #anchors; handle clicks directly so it also works where hashchange is unavailable.
    document.addEventListener("click", function (ev) {
      var yt = ev.target.closest("a[data-yt]"); if (yt) { reproducir(yt, ev); return; }
      var a = ev.target.closest('a[href^="#"]'); if (!a) return;
      ev.preventDefault();
      if (a.dataset.filtro) filtrarDesde(a.dataset.filtro);
      try { history.pushState(null, "", a.getAttribute("href")); } catch (e) {}
      ruta(); idioma();
    });
    window.addEventListener("popstate", function () { ruta(); idioma(); });
    window.addEventListener("hashchange", function () { ruta(); idioma(); });
    aplicarFiltros();
    ruta(); idioma();
  }

  // Change DATOS_V whenever data/*.json changes, so browsers don't keep the cached copy.
  var DATOS_V = "2026-11-01-w515";
  function leer(url) { return fetch(BASE + url + "?v=" + DATOS_V).then(function (r) { return r.json(); }); }
  Promise.all([leer("data/matrimonios.json"), TR.datos ? leer(TR.datos).catch(function () { return {}; }) : null])
    .then(function (r) { iniciar(r[1] ? traducir(r[0], r[1]) : r[0]); })
    .catch(function () {
      $("conteo").textContent = t("No se pudieron cargar los datos. Recargá la página.");
    });
})();
