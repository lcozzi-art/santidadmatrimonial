#!/usr/bin/env python3
"""Envía por mail las fichas cuya memoria (fiesta) cae hoy en Buenos Aires.

Variables de entorno:
  GMAIL_USER          cuenta de Gmail que envía (p.ej. alguien@gmail.com)
  GMAIL_APP_PASSWORD  contraseña de aplicación de esa cuenta
  MAIL_TO             destinatario(s), separados por coma
  FECHA               opcional, AAAA-MM-DD para probar otro día
  SOLO_MOSTRAR        opcional, "1" imprime el mail sin enviarlo
Si hoy no hay fichas, no envía nada.
"""
import datetime
import html
import json
import os
import smtplib
import sys
from email.message import EmailMessage
from pathlib import Path

SITIO = "https://santidadmatrimonial.org"
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

raiz = Path(__file__).resolve().parent.parent
datos = json.loads((raiz / "data" / "matrimonios.json").read_text(encoding="utf-8"))

if os.environ.get("FECHA"):
    hoy = datetime.date.fromisoformat(os.environ["FECHA"])
else:
    hoy = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).date()  # Buenos Aires, UTC-3 sin horario de verano
orden = hoy.month * 100 + hoy.day
# Orden: Santos, Beatos, Venerables, Siervos de Dios
RANGO = {"S": 0, "B": 1, "V": 2, "SdD": 3}
fichas = sorted((m for m in datos["matrimonios"] if m.get("fiestaOrden") == orden),
                key=lambda m: (RANGO.get(m.get("proceso"), 9), m["titulo"]))

fecha_txt = f"{hoy.day} de {MESES[hoy.month - 1]}"
if not fichas:
    print(f"No hay fichas con memoria el {fecha_txt}. No se envía mail.")
    sys.exit(0)


def frase(t):
    t = (t or "").strip()
    return t[:1].upper() + t[1:] if t else ""


def origen(m):
    partes = [p for p in (m.get("pais"), f"siglo {m['siglo']}" if m.get("siglo") else None) if p]
    return f" ({', '.join(partes)})" if partes else ""


texto = [fecha_txt.capitalize(), ""]
cuerpo = [f'<p style="font-size:16px"><b>{fecha_txt.capitalize()}</b></p>']
for m in fichas:
    ficha = f"{SITIO}/m/{m['id']}/"
    links = [("Ficha", ficha)]
    if m.get("podcast"):
        links.append(("Podcast", m["podcast"]))
    if m.get("video"):
        links.append(("Video", m["video"]))

    texto.append(m["titulo"] + origen(m))
    if m.get("descripcion"):
        texto.append(frase(m["descripcion"]))
    texto += [f"{k}: {u}" for k, u in links]
    texto.append("")

    foto = f'<td style="padding-right:14px;vertical-align:top"><a href="{ficha}"><img src="{SITIO}/{m["foto"]}" width="90" alt="" style="border-radius:6px;display:block"></a></td>' if m.get("foto") else ""
    enlaces = " · ".join(f'<a href="{html.escape(u)}">{k}</a>' for k, u in links)
    cuerpo.append(
        '<table style="margin:0 0 18px 0;font-family:Georgia,serif"><tr>' + foto +
        '<td style="vertical-align:top">'
        f'<div style="font-size:17px"><a href="{ficha}" style="color:#7a1f2b;text-decoration:none"><b>{html.escape(m["titulo"])}</b></a>{html.escape(origen(m))}</div>'
        f'<div style="margin:4px 0 8px;color:#444">{html.escape(frase(m.get("descripcion")))}</div>'
        f'<div>{enlaces}</div></td></tr></table>')

texto.append(SITIO)
cuerpo.append(f'<p style="color:#888;font-size:13px"><a href="{SITIO}">santidadmatrimonial.org</a></p>')

msg = EmailMessage()
msg["Subject"] = f"Santidad Matrimonial · {fecha_txt}"
msg["From"] = f"Santidad Matrimonial <{os.environ.get('GMAIL_USER', 'sin-remitente@example.com')}>"
msg["To"] = os.environ.get("MAIL_TO", "")
msg.set_content("\n".join(texto))
msg.add_alternative("<html><body>" + "".join(cuerpo) + "</body></html>", subtype="html")

if os.environ.get("SOLO_MOSTRAR") == "1":
    print(msg["Subject"])
    print("\n".join(texto))
    sys.exit(0)

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
    s.login(os.environ["GMAIL_USER"], os.environ["GMAIL_APP_PASSWORD"])
    s.send_message(msg)
print(f"Enviado: {len(fichas)} ficha(s) del {fecha_txt}.")
