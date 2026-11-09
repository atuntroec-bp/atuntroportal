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
var VERSION = '1e9f015e5476';
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

/* ── Notificaciones push (las envía notificaciones/enviar.mjs vía Firebase Cloud Messaging) ──
 * Llegan como mensajes de datos: { title, body, url, tag }. Siempre se muestra una notificación
 * (iPhone exige mostrar algo por cada push, o deja de entregarlos). */
self.addEventListener('push', function (event) {
  var d = {};
  try {
    var j = event.data ? event.data.json() : {};
    d = j.data || j.notification || j;          // formato FCM o directo
  } catch (e) {
    d = { body: event.data ? event.data.text() : '' };
  }
  var title = d.title || 'Atuntro';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icons/icon-192.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    lang: 'es',
    data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var destino = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ventanas) {
      for (var i = 0; i < ventanas.length; i++) {
        if (ventanas[i].url.indexOf(self.registration.scope) === 0 && 'focus' in ventanas[i]) {
          return ventanas[i].focus();
        }
      }
      return self.clients.openWindow(destino);
    })
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
