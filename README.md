# Santidad Matrimonial

Sitio estático con las fichas de esposos y matrimonios santos, beatos, venerables y siervos de Dios, a partir de la planilla "Santos Casados base de datos" del podcast Caminos de Santidad Matrimonial.

- `index.html`, `styles.css`, `app.js`: el sitio (sin dependencias ni paso de compilación).
- `data/matrimonios.json`: las 523 fichas y los 39 episodios, generados desde la planilla.
- `img/`: fotos principales copiadas de Drive y reducidas a 720 px.

Las fichas sin foto propia usan la miniatura de YouTube del podcast o video, y si no hay ninguno, un emblema.

## Publicar en GitHub Pages

1. Subir esta carpeta a la raíz de un repositorio público.
2. En el repositorio: Settings → Pages → Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. El sitio queda en `https://<usuario>.github.io/<repositorio>/`.

## Actualizar los datos

Volver a exportar la planilla y regenerar `data/matrimonios.json` (y las fotos nuevas en `img/`).

## Caché de los navegadores

`index.html` carga `styles.css?v=…` y `app.js?v=…`. Al cambiar esos archivos, actualizar el valor de `v` para que los celulares no sigan usando la versión guardada.

## Versión en inglés

El sitio en inglés está en `/en/` y comparte las fotos, los datos y `app.js` con el español.

- `en/index.html` se genera desde `index.html`: después de cambiar textos en `index.html`, correr `python3 herramientas/generar-en.py`. Si un texto nuevo o cambiado no tiene traducción, el script lo lista; se agrega en la tabla `TEXTOS` del script.
- Los textos que arma `app.js` (botones, filtros, números) se traducen en `i18n-en.js`. Un texto nuevo en `app.js` se escribe como `t("texto en español")` y se agrega su traducción ahí.
- Las fichas y los episodios se traducen en `data/en.json`, por id. Si una ficha no tiene traducción, se muestra en español. `python3 herramientas/revisar-en.py` lista las fichas nuevas o cuyo texto en español cambió desde que se tradujeron.
