"""Código común de generar-en.py y generar-fr.py: arma <idioma>/index.html desde index.html."""
import html.parser
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# Archivos del sitio que <idioma>/index.html toma de la carpeta de arriba.
RUTAS = re.compile(r'(href|src)="(?!https?:|#|\.\./|mailto:)((?:img|data)/[^"]*|[\w-]+\.(?:svg|png|css|js)(?:\?[^"]*)?)"')


class Textos(html.parser.HTMLParser):
    """Junta los textos visibles y los atributos que se leen en pantalla."""
    ATTRS = ("alt", "aria-label", "title", "placeholder", "data-todos")

    def __init__(self):
        super().__init__()
        self.lista, self._script = [], False

    def handle_starttag(self, tag, attrs):
        self._script = tag in ("script", "style")
        a = dict(attrs)
        leidos = [a.get(k) for k in self.ATTRS]
        if tag == "meta" and (a.get("name") == "description" or a.get("property") in ("og:title", "og:description")):
            leidos.append(a.get("content"))
        if tag == "input" and a.get("name") == "_subject":
            leidos.append(a.get("value"))
        self.lista += [v.strip() for v in leidos if v and v.strip()]

    def handle_endtag(self, tag):
        self._script = False

    def handle_data(self, d):
        if not self._script and d.strip():
            self.lista.append(" ".join(d.split()))


def textos(h):
    p = Textos(); p.feed(h); return p.lista


def generar(idioma, TEXTOS, IGUALES):
    """Escribe <idioma>/index.html y lista lo que quedó sin traducir (sale con 1 si falta algo)."""
    es = (RAIZ / "index.html").read_text(encoding="utf-8")
    tr = es
    faltan = []
    for a, b in TEXTOS:
        if a not in tr:
            faltan.append(a)
        tr = tr.replace(a, b)
    tr = RUTAS.sub(lambda m: '%s="../%s"' % (m.group(1), m.group(2)), tr)
    # i18n-<idioma>.js va antes que app.js.
    tr = re.sub(r'(<script src="\.\./app\.js(\?[^"]*)?"></script>)', r'<script src="../i18n-%s.js\2"></script>\n\1' % idioma, tr)
    destino = RAIZ / idioma / "index.html"
    destino.parent.mkdir(exist_ok=True)
    destino.write_text(tr, encoding="utf-8")
    print("Escrito", destino.relative_to(RAIZ))

    originales = set(textos(es))
    sin_traducir = [t for t in textos(tr) if t in originales and t not in IGUALES and not re.fullmatch(r"[\d\s·×.,:()-]+", t)]
    if faltan:
        print("\nTextos de la tabla que ya no están en index.html (revisar si cambiaron):")
        for a in faltan: print("  -", a[:110])
    if sin_traducir:
        print("\nTextos que quedaron en español en %s/index.html:" % idioma)
        for t in dict.fromkeys(sin_traducir): print("  -", t[:110])
    if faltan or sin_traducir:
        sys.exit(1)
    print("Todo traducido.")
