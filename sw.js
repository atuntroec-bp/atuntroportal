/* Service worker del Portal ATUNTRO.
 * Lo genera build.py a partir de pwa/sw.template.js — no editar sw.js a mano.
 *
 * Comportamiento:
 *  - El portal SIEMPRE se carga de internet (nunca una versión vieja en caché).
 *  - Si no hay conexión al abrirlo, muestra offline.html.
 *  - Firebase y todo lo demás pasa directo, sin tocar.
 *  - Cada build cambia VERSION (hash de index.html); eso hace que los teléfonos
 *    detecten la versión nueva y la app se recargue sola (ver js/pwa.js).
 */
var VERSION = '25bbd69b512f';
var CACHE = 'atuntro-shell-' + VERSION;
var PRECACHE = [
  'offline.html',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(PRECACHE.map(function (u) { return new Request(u, { cache: 'reload' }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('atuntro-shell-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // íconos de la pantalla sin conexión: desde la caché
  if (req.mode !== 'navigate') {
    var url = new URL(req.url);
    if (url.origin === self.location.origin && url.pathname.indexOf('/icons/') !== -1) {
      event.respondWith(caches.match(req, { cacheName: CACHE }).then(function (r) { return r || fetch(req); }));
    }
    return; // lo demás (Firebase, etc.) pasa directo
  }

  event.respondWith(
    // cache:'no-cache' revalida con GitHub Pages: siempre la última versión publicada
    fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }))
      .then(function (res) {
        if (!res.redirected) return res;
        // una navegación no acepta respuestas redirigidas: se reconstruye
        return res.blob().then(function (b) {
          return new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers });
        });
      })
      .catch(function () {
        return caches.match('offline.html', { cacheName: CACHE });
      })
  );
});
