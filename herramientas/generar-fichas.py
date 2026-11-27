#!/usr/bin/env python3
"""Genera una página chica por ficha (m/<id>/index.html, y en/m/<id>/, fr/m/<id>/, it/m/<id>/, pt/m/<id>/)
con las etiquetas Open Graph de esa ficha: foto, nombre y descripción.

WhatsApp, Facebook, Telegram, X, etc. no leen lo que va después de "#", así que el link
santidadmatrimonial.org/#m192 siempre muestra la vista previa general del sitio. El link
santidadmatrimonial.org/m/192/ muestra la foto y el nombre de la ficha y, al abrirlo,
lleva enseguida a la ficha (/#m192). Es el link que da el botón "Compartir" de cada ficha.

Correr después de cambiar data/matrimonios.json, data/<idioma>.json o las fotos de img/:
    python3 herramientas/generar-fichas.py
"""
import html
import json
import re
import shutil
import unicodedata
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
SITIO = "https://santidadmatrimonial.org/"
IDIOMAS = ["es", "en", "fr", "it", "pt"]
NOMBRE = "Santidad Matrimonial"
# Texto del enlace visible (solo se ve un instante, o si el navegador no tiene JavaScript).
VER = {"es": "Ver la ficha", "en": "See the couple", "fr": "Voir la fiche", "it": "Vedi la scheda", "pt": "Ver a ficha"}
LARGO_DESC = 200


def solo_letras(s):
    s = unicodedata.normalize("NFD", s or "").lower()
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if not unicodedata.combining(c)))


def recortar(s, n):
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) <= n:
        return s
    return s[: n - 1].rsplit(" ", 1)[0].rstrip(",;:.") + "…"


def mayuscula(s):
    return s[:1].upper() + s[1:] if s else s


def descripcion(m):
    d, r = (m.get("descripcion") or "").strip(), (m.get("resumen") or "").strip()
    partes = [mayuscula(d)] if d else []
    if r and solo_letras(r) != solo_letras(d):
        partes.append(mayuscula(r))
    texto = ". ".join(p.rstrip(".") for p in partes)
    return recortar(texto, LARGO_DESC) if texto else ""


def locale(idioma):
    index = RAIZ / ("index.html" if idioma == "es" else idioma + "/index.html")
    return re.search(r'og:locale" content="([^"]+)"', index.read_text(encoding="utf-8")).group(1)


def descripcion_sitio(idioma):
    index = RAIZ / ("index.html" if idioma == "es" else idioma + "/index.html")
    return html.unescape(re.search(r'name="description" content="([^"]+)"', index.read_text(encoding="utf-8")).group(1))


_medidas = {}


def medidas(ruta):
    if ruta not in _medidas:
        with Image.open(RAIZ / ruta) as im:
            _medidas[ruta] = im.size
    return _medidas[ruta]


def pagina(m, idioma, loc, desc_sitio):
    e = html.escape
    pre = "" if idioma == "es" else idioma + "/"
    url = SITIO + pre + "m/%d/" % m["id"]
    destino = "../../#m%d" % m["id"]
    if m.get("foto") and (RAIZ / m["foto"]).exists():
        img, (w, h) = SITIO + m["foto"], medidas(m["foto"])
    else:
        img, (w, h) = SITIO + "og-image.png", medidas("og-image.png")
    titulo = m.get("titulo") or m.get("nombres")
    desc = descripcion(m) or desc_sitio
    return f"""<!doctype html>
<html lang="{idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titulo)} · {NOMBRE}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="{NOMBRE}">
<meta property="og:locale" content="{loc}">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="{w}">
<meta property="og:image:height" content="{h}">
<meta property="og:image:alt" content="{e(m.get('nombres') or titulo)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../{'../' if pre else ''}favicon.svg" type="image/svg+xml">
<script>location.replace("{destino}");</script>
<style>body{{font-family:system-ui,sans-serif;max-width:520px;margin:40px auto;padding:0 16px;text-align:center;color:#2b2b2b}}img{{max-width:100%;border-radius:12px}}a{{color:#26467a;font-weight:700}}</style>
</head>
<body>
<img src="{img}" alt="{e(m.get('nombres') or titulo)}" width="{w}" height="{h}">
<h1>{e(titulo)}</h1>
<p>{e(desc)}</p>
<p><a href="{destino}">{VER[idioma]}</a></p>
</body>
</html>
"""


def main():
    base = json.loads((RAIZ / "data/matrimonios.json").read_text(encoding="utf-8"))["matrimonios"]
    total = 0
    for idioma in IDIOMAS:
        carpeta = RAIZ / ("m" if idioma == "es" else idioma + "/m")
        tr = {}
        if idioma != "es":
            tr = json.loads((RAIZ / f"data/{idioma}.json").read_text(encoding="utf-8")).get("matrimonios", {})
        loc, desc_sitio = locale(idioma), descripcion_sitio(idioma)
        if carpeta.exists():
            shutil.rmtree(carpeta)  # así no quedan páginas de fichas borradas
        for m0 in base:
            m = dict(m0)
            x = tr.get(str(m["id"]))
            if x:
                for k in ("titulo", "nombres", "descripcion", "resumen"):
                    if x.get(k) is not None and m.get(k):
                        m[k] = x[k]
            destino = carpeta / str(m["id"]) / "index.html"
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(pagina(m, idioma, loc, desc_sitio), encoding="utf-8")
            total += 1
    print(f"{total} páginas generadas ({len(base)} fichas × {len(IDIOMAS)} idiomas)")


if __name__ == "__main__":
    main()
