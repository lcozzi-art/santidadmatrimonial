#!/usr/bin/env python3
"""Extrae las reseñas de los PowerPoint "Santoral de Laicos Casados - <Mes>.pptx" y las
guarda en data/resenas.json, una por ficha (por id de data/matrimonios.json).

Uso:  python3 herramientas/extraer-resenas.py "Santoral de Laicos Casados - Abril.pptx" ...

Necesita python-pptx (pip install python-pptx). Se pueden pasar uno o varios meses: las
reseñas de otros meses que ya estén en data/resenas.json se conservan.

Cada diapositiva se empareja con una ficha por los nombres del título y la fecha. Si el
emparejamiento automático falla o se equivoca, se corrige en MANUAL ("Mes N" -> ids).
Al final lista las diapositivas que no se pudieron emparejar.
"""
import json
import pathlib
import re
import sys
import unicodedata

from pptx import Presentation

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MESES = "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split()

# Diapositiva ("Mes N", N contando desde 1) -> ids de fichas. Una lista vacía la descarta.
MANUAL = {
    "Abril 10": [58],         # Alicia de Montbard y Tescelino (dos fechas en la diapositiva)
    "Abril 13": [485],        # Estanislao Starowieyski
    "Abril 23": [390, 472],   # María y Cleofás, Salomé y Zebedeo en la misma diapositiva
    "Marzo 18": [],           # San José y Santa María: no tiene ficha
    "Julio 30": [],           # Santa Kinga y Boleslao V: no tiene ficha
    "Diciembre 29": [],       # La Sagrada Familia: no tiene ficha
    "Noviembre 9": [432],     # Pablo Xu Guangqi
    "Noviembre 12": [247],    # San Homobono
    "Septiembre 17": [304, 270],  # dos matrimonios mártires de Cajonos en la misma diapositiva
}

STOP = set("san santa santos stos sta sto beato beata beatos venerable venerables ven siervo sierva siervos sdd "
           "de dios del la el los las y e dr dra don dona da di von van le du st b bto bta cnel".split())
DATOS = re.compile(r"^(\d+\s*(años|meses) (de|entre)|\d+\+?\s*hij[oa]s?|\(siglo)", re.I)


def limpiar(s):
    return re.sub(r"\s+", " ", (s or "").replace("\v", " ")).strip()


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]", " ", s)


def palabras(s):
    return {w for w in norm(s).split() if w not in STOP and len(w) > 2}


def fecha(s):
    m = re.match(r"(\d+)\s*(?:y\s+\d+\s+)?de\s+(\w+)", norm(s))
    return (int(m.group(1)), m.group(2)) if m else None


def leer(ruta):
    mes = ruta.stem.split("-")[-1].strip()
    for n, slide in enumerate(Presentation(str(ruta)).slides, 1):
        d = {"clave": "%s %d" % (mes, n), "titulo": "", "cuerpo": [], "fecha": "", "cita": "", "fuente": ""}
        for sh in slide.shapes:
            if not sh.has_text_frame:
                continue
            parrafos = [limpiar(p.text) for p in sh.text_frame.paragraphs]
            parrafos = [p for p in parrafos if p]
            texto = " ".join(parrafos)
            if not texto:
                continue
            if sh.name.startswith("Título"):
                d["titulo"] = d["titulo"] or texto
            elif sh.name.startswith("Marcador de texto"):
                d["cuerpo"] = parrafos
            elif re.fullmatch(r"\d+°?\s+(y\s+\d+°?\s+)?de\s+(%s)" % "|".join(MESES), texto, re.I):
                d["fecha"] = texto
            elif texto.startswith("http"):
                d["fuente"] = d["fuente"] or parrafos[0]
            elif texto[:1] in "«“\"" and not d["cita"]:
                d["cita"] = texto
        if d["titulo"] and d["cuerpo"]:
            yield d


def letras(s):
    return re.sub(r"[^a-z0-9]", "", norm(s))


def resena(d, ficha):
    cuerpo = list(d["cuerpo"])
    cuerpo.pop(0)  # la frase de presentación, como la "descripción" de la ficha
    datos = ""
    if cuerpo and DATOS.match(cuerpo[0]) and len(cuerpo[0]) < 90:
        datos = re.sub(r"\s*\(siglos? [^)]*\)\s*$", "", cuerpo.pop(0)).strip(" ,")
    # Si el último párrafo anuncia una cita ("dijo a su verdugo:"), se le agrega la cita.
    if cuerpo and cuerpo[-1].endswith(":") and d["cita"]:
        cuerpo[-1] += " " + d["cita"]
    r = {"texto": cuerpo}
    if datos:
        r["datos"] = datos
    if d["fuente"]:
        r["fuente"] = d["fuente"]
    return r


def emparejar(d, fichas):
    if d["clave"] in MANUAL:
        return MANUAL[d["clave"]]
    pt, fd = palabras(d["titulo"]), fecha(d["fecha"])
    puntajes = []
    for m in fichas:
        comunes = len(pt & (palabras(m["titulo"]) | palabras(m["nombres"])))
        fm = fecha(m.get("fiesta") or "")
        p = comunes * 2 + (3 if fd and fd == fm else 1 if fd and fm and fd[1] == fm[1] else 0)
        enlaces = (m.get("masInfo") or "") + " " + (m.get("articulo") or "")
        if d["fuente"] and d["fuente"].split("#")[0].rstrip("/") in enlaces:
            p += 4
        puntajes.append((p, comunes, m["id"]))
    puntajes.sort(reverse=True)
    mejor, segundo = puntajes[0], puntajes[1]
    if mejor[1] >= 1 and mejor[0] >= 5 and mejor[0] > segundo[0]:
        return [mejor[2]]
    return None


def main():
    rutas = [pathlib.Path(a) for a in sys.argv[1:]]
    if not rutas:
        sys.exit(__doc__)
    fichas = json.loads((RAIZ / "data" / "matrimonios.json").read_text(encoding="utf-8"))["matrimonios"]
    por_id = {m["id"]: m for m in fichas}
    salida = RAIZ / "data" / "resenas.json"
    previas = json.loads(salida.read_text(encoding="utf-8")) if salida.exists() else {}
    meses = {r.stem.split("-")[-1].strip() for r in rutas}
    resenas = {k: v for k, v in previas.items() if v.get("origen", "").split(" ")[0] not in meses}
    sin = []
    for ruta in rutas:
        for d in leer(ruta):
            ids = emparejar(d, fichas)
            if not ids:
                if ids is None:
                    sin.append(d)
                continue
            for i in ids:
                r = resena(d, por_id[i])
                r["origen"] = d["clave"]
                resenas[str(i)] = r
    orden = {str(m["id"]): n for n, m in enumerate(fichas)}
    resenas = dict(sorted(resenas.items(), key=lambda kv: orden.get(kv[0], 1e9)))
    salida.write_text(json.dumps(resenas, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("%d reseñas en %s" % (len(resenas), salida.relative_to(RAIZ)))
    if sin:
        print("\nSin emparejar (%d), agregar en MANUAL:" % len(sin))
        for d in sin:
            print("  %-14s %s (%s)" % (d["clave"], d["titulo"], d["fecha"]))


if __name__ == "__main__":
    main()
