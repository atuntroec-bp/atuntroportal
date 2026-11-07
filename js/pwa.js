/* PWA — registra el service worker y recarga la app sola cuando hay versión nueva.
 * Si alguien está escribiendo en un campo, espera a que termine para no cortarlo.
 */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  var habiaControlador = !!navigator.serviceWorker.controller;
  var recargando = false;

  function escribiendo() {
    var a = document.activeElement;
    if (!a) return false;
    return a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  }

  function recargarCuandoSePueda() {
    if (recargando) return;
    recargando = true;
    if (!escribiendo()) { location.reload(); return; }
    var libre = 0;
    var espera = setInterval(function () {
      // recarga tras ~4 s seguidos sin escribir (deja terminar el guardado de 600 ms)
      libre = escribiendo() ? 0 : libre + 1;
      if (libre >= 2) { clearInterval(espera); location.reload(); }
    }, 2000);
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    // la primera instalación también dispara este evento: no hay nada que recargar
    if (!habiaControlador) { habiaControlador = true; return; }
    recargarCuandoSePueda();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      function revisar() { reg.update().catch(function () {}); }
      // revisa versiones nuevas al volver a la app y cada 15 minutos
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') revisar();
      });
      setInterval(revisar, 15 * 60 * 1000);
    }).catch(function (e) { console.warn('PWA: no se pudo registrar el service worker', e); });
  });
})();
