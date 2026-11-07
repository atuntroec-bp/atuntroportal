# Portal Operativo — Atún Tropical (ATUNTRO S.A.)

Sitio publicado: https://atuntroec-bp.github.io/atuntroportal/

Single-page app publicada como **un solo archivo** (`index.html`) en GitHub Pages.
Los datos y el inicio de sesión viven en Firebase (proyecto `atuntro-portal`).

## Estructura

| Archivo | Qué es |
|---|---|
| `index-dev.html` | Versión de desarrollo: HTML + CSS, con `<script src="js/…">` |
| `js/*.js` | Un archivo por módulo (ver tabla abajo) |
| `build.py` | Mete todos los `js/` dentro de `index-dev.html` |
| `index.html` | **Generado.** Es lo que publica GitHub Pages |
| `dist/index.html` | **Generado.** Copia idéntica de `index.html` |

Nunca editar `index.html` ni `dist/index.html` a mano: se sobrescriben en cada build.

## Módulos (en orden de carga)

| Archivo | Módulo |
|---|---|
| `portal.js` | Login, panel principal, tarjetas, usuarios y roles |
| `gestor-tareas.js` | Gestor de Tareas |
| `equipo.js` | Gestión de Equipo (tareas, agenda, reuniones, roles) |
| `checklist-dispatch.js` | Decide si abrir el Checklist Operativo o el Administrativo |
| `checklist-ops.js` | Checklist Operativo |
| `checklist-adm.js` | Checklist Administrativo |
| `control-equipos.js` | Control de Equipos (horómetros, winches, cables) |
| `simulador.js` | Simulador de Viaje (María Fátima y María de Gracia) |
| `documentos.js` | Control Documental, con PDFs adjuntos |
| `proyectos.js` | Proyectos |
| `contable.js` | Dashboard Contable |
| `boyas.js` | Control de Boyas |
| `plano-red.js` | Plano de Red |
| `pwa.js` | App instalable: registra el service worker y recarga sola con cada versión nueva |

## Cómo hacer un cambio

1. Editar el módulo en `js/` (o `index-dev.html` para HTML/CSS).
2. Compilar: `python3 build.py` (genera `index.html` y `dist/index.html`).
3. Revisar que el cambio funcione abriendo `index.html` en el navegador.
4. Subir a `main` los archivos cambiados **y** los dos generados. GitHub Pages publica en ~1 minuto.

Para un módulo nuevo: crear `js/<nombre>.js`, agregar su `<script src="js/<nombre>.js"></script>`
en `index-dev.html`, y si guarda datos en Firebase, agregar la regla de su nodo (ver abajo).

## App instalable (PWA)

El portal se puede instalar en el teléfono como app **Atuntro**:
Android → Chrome → menú → *Instalar app*; iPhone → Safari → Compartir → *Añadir a pantalla de inicio*.

| Archivo | Qué es |
|---|---|
| `pwa/manifest.webmanifest` | Nombre, colores e íconos de la app |
| `pwa/sw.template.js` | Plantilla del service worker (`build.py` genera `sw.js`) |
| `pwa/offline.html` | Pantalla "Sin conexión" |
| `pwa/icons/` | Íconos. Para cambiarlos: `python3 pwa/generar_iconos.py logo.png` |
| `js/pwa.js` | Registro del service worker y recarga automática |

- `build.py` copia todo esto junto a `index.html` y `dist/index.html`, y pone en `sw.js` una versión
  que es el hash del portal: solo cambia cuando el portal cambia.
- Con internet el portal siempre se carga del servidor (nunca una copia vieja). Sin internet al
  abrir, muestra la pantalla "Sin conexión".
- Al publicar una versión nueva, la app abierta se recarga sola; si alguien está escribiendo en un
  campo, espera a que termine.
- Al publicar, subir también `sw.js`, `manifest.webmanifest`, `offline.html` e `icons/` de la raíz.


- **Inicio de sesión:** correo y contraseña (Firebase Authentication). El acceso anónimo está desactivado.
- **Usuarios y roles:** `atuntro_portal_auth_v2` (`users`, `emails`, `uids`). Solo un master los cambia.
- **Reglas:** todo está cerrado por defecto. Cada nodo de datos tiene su regla, y la mayoría exige
  una cuenta vinculada a un usuario del portal. Un nodo nuevo sin regla queda bloqueado.
- La sesión guardada en el navegador solo decide qué pantallas se ven. Lo que protege los datos
  son las reglas de Firebase.

## Seguridad

Este repositorio es **público**. No guardar aquí contraseñas, PINs, claves ni datos de personas.
La configuración web de Firebase (`apiKey`, etc.) sí puede estar: es pública por diseño y la
protección la dan las reglas.

## Historial

`MIGRACION.md` explica cómo se recuperaron en agosto de 2026 las fuentes `js/` a partir del
archivo publicado.
