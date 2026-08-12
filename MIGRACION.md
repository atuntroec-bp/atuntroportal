# Migración de fuentes — ATUNTRO Portal

Fecha: 2026-08-11

## Qué pasaba

Durante meses los cambios se hicieron directamente sobre `dist/index.html`.
Los módulos en `js/` quedaron congelados en julio. Correr `build.py` habría
borrado, entre otras cosas:

- El módulo **Documentos** completo (namespace `DOCS`)
- El módulo **Control de Boyas** completo (namespace `BOY`)
- El **simulador de María de Gracia** (`atuntro_sim_gracia_v4`)
- El fix `normalizeState()` de Control de Equipos
- Los guards `isTyping` / debounce añadidos después de julio
- La etiqueta "EN PROGRESO" del Gestor de Tareas

## Qué se hizo

En vez de migrar cambio por cambio (2.100+ líneas, alto riesgo de error),
se regeneraron los módulos fuente **a partir del `dist/index.html` publicado**,
que es la única versión fiel de lo que está en producción.

- Se extrajeron los 9 bloques `<script>` inline del dist a `js/*.js`
- Se regeneró `index.html` (versión de desarrollo) con los `<script src="js/…">`
- Se verificó que `python3 build.py` reproduce el dist publicado **byte a byte**

Las fuentes anteriores (julio) quedaron archivadas en
`js/_respaldo_fuentes_anteriores/` por si hiciera falta consultarlas.

## Módulos actuales (orden de carga)

1. `js/portal.js`
2. `js/gestor-tareas.js`
3. `js/checklist-dispatch.js`
4. `js/checklist-ops.js`
5. `js/checklist-adm.js`
6. `js/control-equipos.js`
7. `js/simulador.js`
8. `js/documentos.js`   ← nuevo, antes solo vivía en el dist
9. `js/boyas.js`        ← nuevo, antes solo vivía en el dist

## Regla de trabajo de ahora en adelante

**Nunca editar `dist/index.html` a mano.**

1. Editar el módulo en `js/`
2. Correr `python3 build.py`
3. Subir el `dist/index.html` generado a GitHub Pages

## Verificación de seguridad

Antes de publicar cualquier build, conviene confirmar que no se perdió nada:

    python3 build.py
    cmp dist/index.html <copia del dist actualmente publicado>

Si el único cambio esperado es el que acabas de hacer, el diff debe mostrar
solo eso.
