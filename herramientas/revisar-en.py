#!/usr/bin/env python3
"""Lista las fichas y episodios que necesitan traducción al inglés en data/en.json.

Uso:  python3 herramientas/revisar-en.py

Una ficha aparece si no tiene traducción, o si su texto en español cambió desde que se
tradujo (la huella "_es" ya no coincide). Después de corregir la traducción en data/en.json,
correr con --actualizar para guardar las huellas nuevas.
Las fichas sin traducción se muestran en español en el sitio en inglés.
"""
import hashlib
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CAMPOS = ("titulo", "nombres", "descripcion", "resumen", "cita")


def huella(m):
    return hashlib.sha1(json.dumps([m.get(k) for k in CAMPOS], ensure_ascii=False).encode()).hexdigest()[:10]


def main():
    es = json.loads((RAIZ / "data" / "matrimonios.json").read_text(encoding="utf-8"))
    ruta_en = RAIZ / "data" / "en.json"
    en = json.loads(ruta_en.read_text(encoding="utf-8"))
    actualizar = "--actualizar" in sys.argv
    faltan, cambiaron = [], []
    for m in es["matrimonios"]:
        t = en["matrimonios"].get(str(m["id"]))
        if not t:
            faltan.append(m)
        elif t.get("_es") != huella(m):
            if actualizar:
                t["_es"] = huella(m)
            else:
                cambiaron.append(m)
    eps = [e for e in es["episodios"] if e.get("podcastId") not in en["episodios"]]
    if actualizar:
        ruta_en.write_text(json.dumps(en, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print("Huellas actualizadas.")
    for titulo, lista in (("Fichas sin traducir", faltan), ("Fichas que cambiaron en español", cambiaron)):
        if lista:
            print("\n%s (%d):" % (titulo, len(lista)))
            for m in lista:
                print("  %s  %s" % (m["id"], m["titulo"]))
    if eps:
        print("\nEpisodios sin traducir (%d):" % len(eps))
        for e in eps:
            print("  %s  %s" % (e.get("podcastId"), e["nombre"]))
    if not (faltan or cambiaron or eps):
        print("Todo traducido.")


if __name__ == "__main__":
    main()
