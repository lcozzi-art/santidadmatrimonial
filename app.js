// Santidad Matrimonial: renders the cards, filters and fichas from data/matrimonios.json.
(function () {
  // Link to the podcast's channel or playlist; leave empty to hide the button.
  var CANAL_PODCAST = "https://open.spotify.com/show/1JpMc7SNgKkQx8vrc84TUn";

  var ETAPAS = [
    { cod: "S", nombre: "Santo", plural: "Santos", c: "var(--st-s)" },
    { cod: "B", nombre: "Beato", plural: "Beatos", c: "var(--st-b)" },
    { cod: "V", nombre: "Venerable", plural: "Venerables", c: "var(--st-v)" },
    { cod: "SdD", nombre: "Siervo de Dios", plural: "Siervos de Dios", c: "var(--st-sdd)" }
  ];
  var ROMANOS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
  var LOTE = 48;
  var datos = [], episodios = [], filtrados = [], mostrados = 0;
  var etapasActivas = {};
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function etapa(m) { return ETAPAS.find(function (e) { return e.cod === m.proceso; }) || ETAPAS[ETAPAS.length - 1]; }
  function sigloNum(s) { var i = ROMANOS.indexOf(String(s || "").trim()); return i < 0 ? 99 : i; }
  function ytThumb(url) {
    var m = String(url || "").match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    return m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : null;
  }
  var ANILLOS = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="15" cy="20" r="10"/><circle cx="25" cy="20" r="10"/></svg>';

  function fotoHTML(m, sizes) {
    var src = m.foto || ytThumb(m.fotoYT);
    var em = '<div class="emblema">' + ANILLOS + '<span>' + esc(m.siglo ? "Siglo " + m.siglo : "") + '</span></div>';
    if (!src) return '<div class="foto">' + em + '</div>';
    return '<div class="foto">' + em + '<img src="' + esc(src) + '" alt="' + esc(m.nombres) + '" loading="lazy" onerror="this.remove()"></div>';
  }

  function tarjeta(m) {
    var e = etapa(m);
    return '<a class="card" href="#m' + m.id + '" style="--c:' + e.c + '">' + fotoHTML(m) +
      '<div class="card-body"><span class="estado">' + esc(m.beatitud || e.nombre) + '</span>' +
      '<h3>' + esc(m.nombres) + '</h3>' +
      (m.descripcion ? '<p>' + esc(m.descripcion) + '</p>' : '') +
      '<div class="meta">' + (m.pais ? '<span>' + esc(m.pais) + '</span>' : '') + (m.siglo ? '<span>s. ' + esc(m.siglo) + '</span>' : '') +
      (m.fiesta ? '<span>' + esc(m.fiesta) + '</span>' : '') + '</div></div></a>';
  }

  function aplicarFiltros() {
    var q = norm($("q").value).trim();
    var pais = elegidos("f-pais"), siglo = elegidos("f-siglo"), ref = elegidos("f-ref");
    var ambos = $("f-ambos").checked, martir = $("f-martir").checked, pod = $("f-podcast").checked;
    var algunaEtapa = Object.keys(etapasActivas).some(function (k) { return etapasActivas[k]; });
    filtrados = datos.filter(function (m) {
      if (algunaEtapa && !etapasActivas[m.proceso]) return false;
      if (pais.length && !m._paises.some(function (p) { return pais.indexOf(p) >= 0; })) return false;
      if (siglo.length && siglo.indexOf(m.siglo) < 0) return false;
      if (ref.length && ref.indexOf(m.referencia) < 0) return false;
      if (ambos && !m.ambos) return false;
      if (martir && !m.martir) return false;
      if (pod && !m.podcast) return false;
      if (q && m._txt.indexOf(q) < 0) return false;
      return true;
    });
    var orden = $("f-orden").value;
    filtrados.sort(function (a, b) {
      if (orden === "siglo") return sigloNum(a.siglo) - sigloNum(b.siglo) || a._orden.localeCompare(b._orden);
      if (orden === "siglo-desc") return sigloNum(b.siglo) - sigloNum(a.siglo) || a._orden.localeCompare(b._orden);
      if (orden === "fiesta") return (a.fiestaOrden || 9999) - (b.fiestaOrden || 9999) || a._orden.localeCompare(b._orden, "es");
      if (orden === "destacados") return b._peso - a._peso || a._orden.localeCompare(b._orden, "es");
      return a._orden.localeCompare(b._orden, "es");
    });
    mostrados = 0;
    $("grid").innerHTML = "";
    pintarLote();
    var n = filtrados.length;
    $("conteo").textContent = n === datos.length ? n + " fichas" : n + " de " + datos.length + " fichas";
    if (!n) $("grid").innerHTML = '<p class="conteo">No hay fichas con esos filtros. Probá quitar alguno.</p>';
  }
  function pintarLote() {
    var trozo = filtrados.slice(mostrados, mostrados + LOTE);
    $("grid").insertAdjacentHTML("beforeend", trozo.map(tarjeta).join(""));
    mostrados += trozo.length;
    $("btn-mas").hidden = mostrados >= filtrados.length;
    $("btn-mas").textContent = "Mostrar más (" + (filtrados.length - mostrados) + " restantes)";
  }

  function fichaHTML(m) {
    var e = etapa(m);
    var filas = [
      ["País", m.pais], ["Siglo", m.siglo], ["Fiesta o Memoria", m.fiesta], ["Referencia", m.referencia], ["", m.josefino ? "Matrimonio josefino" : null],
      ["Causa", m.ambos ? "De ambos esposos" : "De uno de los esposos"],
      ["Mártir", m.martir ? "Sí" : null]
    ].filter(function (f) { return f[1]; }).map(function (f) { return "<dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("");
    var links = [];
    if (m.podcast) links.push('<a class="btn" href="' + esc(m.podcast) + '" target="_blank" rel="noopener">Escuchar el podcast</a>');
    if (m.articulo) links.push('<a class="btn' + (m.podcast ? ' sec' : '') + '" href="' + esc(m.articulo) + '" target="_blank" rel="noopener">Leer artículo</a>');
    if (m.video) links.push('<a class="btn sec" href="' + esc(m.video) + '" target="_blank" rel="noopener">Ver video</a>');
    if (m.masInfo && m.masInfo !== m.articulo) links.push('<a class="btn sec" href="' + esc(m.masInfo) + '" target="_blank" rel="noopener">Más información</a>');
    links.push('<a class="btn sec" href="https://www.google.com/search?q=' + encodeURIComponent(m.titulo) + '" target="_blank" rel="noopener">Buscar en la web</a>');
    return '<button class="cerrar" type="button" aria-label="Cerrar ficha" data-cerrar>×</button>' + fotoHTML(m) +
      '<div class="ficha-in" style="--c:' + e.c + '">' +
      '<div><span class="estado">' + esc(m.beatitud || e.nombre) + '</span><h2 id="ficha-titulo">' + esc(m.titulo) + '</h2>' +
      (m.descripcion ? '<p class="sub">' + esc(m.descripcion) + '</p>' : '') + '</div>' +
      (m.resumen ? '<div><h4>En pocas palabras</h4><p class="texto">' + esc(m.resumen) + '</p></div>' : '') +
      (filas ? '<dl class="datos">' + filas + '</dl>' : '') +
      (m.cita ? '<blockquote class="cita">' + esc(m.cita) + '</blockquote>' : '') +
      '<div><h4>Para conocer más</h4><div class="enlaces">' + links.join("") + '</div></div>' +
      (m.bibliografia ? '<div><h4>Bibliografía</h4><p class="biblio">' + esc(m.bibliografia) + '</p></div>' : '') +
      '</div>';
  }

  var ultimaVista = "inicio";
  function mostrarVista(v) {
    ["inicio", "podcast", "acerca"].forEach(function (n) { $("vista-" + n).hidden = n !== v; });
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.dataset.nav === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    ultimaVista = v;
  }
  function abrirFicha(m) {
    $("ficha").innerHTML = fichaHTML(m);
    $("ficha").hidden = false; $("ficha-fondo").hidden = false;
    $("ficha").scrollTop = 0;
    document.title = m.nombres + " · Santidad Matrimonial";
    $("ficha").querySelector("[data-cerrar]").focus();
  }
  function cerrarFicha() {
    $("ficha").hidden = true; $("ficha-fondo").hidden = true;
    document.title = "Santidad Matrimonial";
  }
  function ruta() {
    var h = (location.hash || "").replace("#", "");
    var mm = h.match(/^m(\d+)$/);
    if (mm) {
      var m = datos.find(function (x) { return x.id === +mm[1]; });
      if (m) { abrirFicha(m); return; }
    }
    cerrarFicha();
    var v = ["podcast", "acerca"].indexOf(h) >= 0 ? h : "inicio";
    if (v !== ultimaVista) window.scrollTo(0, 0);
    mostrarVista(v);
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
      return '<label><input type="checkbox" value="' + esc(v) + '"> ' + esc(v) + '</label>';
    }).join(""));
  }
  function elegidos(sel) {
    return Array.prototype.map.call($(sel).querySelectorAll("input:checked"), function (i) { return i.value; });
  }
  function rotular(sel) {
    var v = elegidos(sel), d = $(sel);
    $(sel + "-txt").textContent = !v.length ? d.dataset.todos : v.length === 1 ? v[0] : v.length + " elegidos";
    d.classList.toggle("activo", v.length > 0);
  }

  function iniciar(json) {
    datos = json.matrimonios; episodios = json.episodios;
    datos.forEach(function (m) {
      m._orden = norm(m.nombres);
      // "Italia/Francia" counts for each country.
      m._paises = m.pais ? m.pais.split("/").map(function (p) { return p.trim(); }).filter(Boolean) : [];
      m._peso = (m.foto ? 2 : 0) + (m.podcast ? 2 : 0) + (m.fotoYT ? 1 : 0);
      m._txt = norm([m.titulo, m.fiesta, m.nombres, m.descripcion, m.resumen, m.pais, m.referencia, m.beatitud].join(" "));
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
    opciones("f-pais", Object.keys(paises).sort(function (a, b) { return a.localeCompare(b, "es"); }));
    opciones("f-siglo", cuenta("siglo").sort(function (a, b) { return sigloNum(a) - sigloNum(b); }));
    opciones("f-ref", cuenta("referencia").sort(function (a, b) { return a.localeCompare(b, "es"); }));

    $("episodios").innerHTML = episodios.map(function (ep) {
      var t = ytThumb(ep.podcast);
      return '<li class="ep"><div class="foto"><div class="emblema">' + ANILLOS + '</div>' +
        (t ? '<img src="' + t + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</div>' +
        '<div class="ep-body"><h3>' + esc(ep.nombre) + '</h3>' + (ep.descripcion ? '<p>' + esc(ep.descripcion) + '</p>' : '') +
        '<div class="ep-links">' + (ep.podcast ? '<a href="' + esc(ep.podcast) + '" target="_blank" rel="noopener">Escuchar en YouTube</a>' : '') +
        (ep.articulo ? '<a href="' + esc(ep.articulo) + '" target="_blank" rel="noopener">Leer artículo</a>' : '') + '</div></div></li>';
    }).join("");
    if (CANAL_PODCAST) { $("canal").href = CANAL_PODCAST; $("canal-wrap").hidden = false; }

    ["q", "f-orden", "f-ambos", "f-martir", "f-podcast"].forEach(function (id) {
      $(id).addEventListener(id === "q" ? "input" : "change", aplicarFiltros);
    });
    var multis = ["f-pais", "f-siglo", "f-ref"];
    multis.forEach(function (id) {
      var d = $(id);
      d.addEventListener("change", function () { rotular(id); aplicarFiltros(); });
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
    $("ficha-fondo").addEventListener("click", cerrarYVolver);
    $("ficha").addEventListener("click", function (ev) { if (ev.target.closest("[data-cerrar]")) cerrarYVolver(); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !$("ficha").hidden) cerrarYVolver(); });
    // Cards and nav use plain #anchors; handle clicks directly so it also works where hashchange is unavailable.
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest('a[href^="#"]'); if (!a) return;
      ev.preventDefault();
      try { history.pushState(null, "", a.getAttribute("href")); } catch (e) {}
      ruta();
    });
    window.addEventListener("popstate", ruta);
    window.addEventListener("hashchange", ruta);
    aplicarFiltros();
    ruta();
  }

  fetch("data/matrimonios.json").then(function (r) { return r.json(); }).then(iniciar).catch(function () {
    $("conteo").textContent = "No se pudieron cargar los datos. Recargá la página.";
  });
})();
