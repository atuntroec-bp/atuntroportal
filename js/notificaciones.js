/* ════════════════════════════════════════════════════════════
   NOTIF — Notificaciones push del Portal ATUNTRO
   · Pide permiso con un aviso en el dashboard (botón "Activar").
   · Guarda el token del dispositivo en atuntro_push/tokens/<usuario>/<id>.
   · Los avisos los envía notificaciones/enviar.mjs (GitHub Actions, cada 15 min)
     y los muestra el service worker (pwa/sw.template.js).
   · Panel Usuarios (master): vincular los nombres de "Responsable" del Gestor
     de Tareas con los usuarios del portal (atuntro_push/vinculos).
   En iPhone solo funcionan con la app instalada (iOS 16.4 o superior).
   ════════════════════════════════════════════════════════════ */
var NOTIF = (function () {
  // Clave pública "Web Push" de Firebase (Consola → Configuración → Cloud Messaging).
  // Es pública por diseño; sin ella el aviso para activar no aparece.
  var VAPID_KEY = 'BDitBXLtSx2Nr0CubulDc-aUyvYx75Vq0U7IXpUx3u3dHG1v4_ElxFG7tSnva8z19MTs2i2sHmO3Qkwp9tVr4f4';

  var P_TOKENS = 'atuntro_push/tokens';
  var P_VINC   = 'atuntro_push/vinculos';
  var LS_TOKEN = 'atuntro_push_token';
  var LS_LATER = 'atuntro_push_despues';
  var LS_IOS   = 'atuntro_push_ios_aviso';
  var DIAS_REPREGUNTA = 7;

  var estado = { userId: null, iniciado: false };

  function ua() { return navigator.userAgent || ''; }
  function esIOS() { return /iP(hone|od|ad)/.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function instalada() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }
  function soportado() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window &&
      (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  }
  function plataforma() {
    if (esIOS()) return 'iPhone';
    if (/Android/i.test(ua())) return 'Android';
    return 'Computadora';
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function db() { return firebase.database(); }

  // Usuario real (no el de "Ver como")
  function usuarioActual() {
    try {
      var s = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
      if (!s || !s.id) return null;
      if (typeof AUTH !== 'undefined' && AUTH.realId && AUTH.realId !== s.id) return null;
      return s.id;
    } catch (e) { return null; }
  }

  function tokenId(token) {
    // id corto y válido como clave de Firebase
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-1', new TextEncoder().encode(token)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').slice(0, 24);
      });
    }
    var h = 0; for (var i = 0; i < token.length; i++) { h = (h * 31 + token.charCodeAt(i)) | 0; }
    return Promise.resolve('t' + (h >>> 0).toString(16) + token.length);
  }

  /* ── Token ─────────────────────────────────────────────── */
  function obtenerToken() {
    if (!VAPID_KEY) return Promise.reject(new Error('sin-vapid'));
    if (!firebase.messaging) return Promise.reject(new Error('sin-sdk'));
    return navigator.serviceWorker.ready.then(function (reg) {
      return firebase.messaging().getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    });
  }

  function guardarToken(token) {
    var uid = estado.userId;
    if (!uid || !token) return Promise.resolve();
    var anterior = lsGet(LS_TOKEN);
    return tokenId(token).then(function (id) {
      var upd = {};
      upd[P_TOKENS + '/' + uid + '/' + id] = {
        token: token,
        plataforma: plataforma(),
        app: instalada() ? 'instalada' : 'navegador',
        actualizado: firebase.database.ServerValue.TIMESTAMP
      };
      var quitar = Promise.resolve();
      if (anterior && anterior !== token) {
        quitar = tokenId(anterior).then(function (idViejo) { if (idViejo !== id) upd[P_TOKENS + '/' + uid + '/' + idViejo] = null; });
      }
      return quitar.then(function () { return db().ref().update(upd); }).then(function () { lsSet(LS_TOKEN, token); });
    });
  }

  function refrescar() {
    return obtenerToken().then(guardarToken).catch(function (e) { console.warn('Notificaciones:', e && e.message || e); });
  }

  /* ── Aviso en el dashboard ─────────────────────────────── */
  function quitarAviso() { var a = document.getElementById('notif-aviso'); if (a) a.remove(); }
  function mostrarAviso(html) {
    quitarAviso();
    var dash = document.getElementById('screen-dashboard');
    var div = dash && dash.querySelector('.divider');
    if (!div) return;
    var el = document.createElement('div');
    el.id = 'notif-aviso';
    el.className = 'notif-aviso';
    el.innerHTML = html;
    div.parentNode.insertBefore(el, div);
  }

  function avisoActivar() {
    mostrarAviso(
      '<span class="notif-aviso-ico">📲</span>' +
      '<span class="notif-aviso-txt"><b>Activa las notificaciones</b>Entérate de tareas asignadas o vencidas, reuniones, eventos y checklists vencidos.</span>' +
      '<span class="notif-aviso-btns">' +
        '<button class="notif-btn-si" onclick="NOTIF.activar()">Activar</button>' +
        '<button class="notif-btn-no" onclick="NOTIF.despues()">Ahora no</button>' +
      '</span>');
  }

  function avisoInstalar() {
    mostrarAviso(
      '<span class="notif-aviso-ico">📲</span>' +
      '<span class="notif-aviso-txt"><b>¿Quieres notificaciones en el iPhone?</b>Instala la app: en Safari toca Compartir → <i>Añadir a pantalla de inicio</i> y ábrela desde el ícono.</span>' +
      '<span class="notif-aviso-btns"><button class="notif-btn-no" onclick="NOTIF.ocultarIOS()">Entendido</button></span>');
  }

  function activar() {
    var btn = document.querySelector('#notif-aviso .notif-btn-si');
    if (btn) { btn.disabled = true; btn.textContent = 'Activando…'; }
    // requestPermission debe llamarse directo desde el toque del usuario (iPhone)
    var p = Notification.requestPermission();
    (p && p.then ? p : Promise.resolve(Notification.permission)).then(function (perm) {
      if (perm !== 'granted') {
        lsSet(LS_LATER, String(Date.now()));
        mostrarAviso('<span class="notif-aviso-ico">🔕</span><span class="notif-aviso-txt"><b>Notificaciones bloqueadas</b>Puedes activarlas luego desde los ajustes del teléfono o del navegador.</span>' +
          '<span class="notif-aviso-btns"><button class="notif-btn-no" onclick="NOTIF.cerrar()">Cerrar</button></span>');
        return;
      }
      return obtenerToken().then(guardarToken).then(function () {
        mostrarAviso('<span class="notif-aviso-ico">✅</span><span class="notif-aviso-txt"><b>Notificaciones activadas</b>Te avisaremos en este dispositivo.</span>' +
          '<span class="notif-aviso-btns"><button class="notif-btn-no" onclick="NOTIF.cerrar()">Cerrar</button></span>');
        setTimeout(quitarAviso, 6000);
      });
    }).catch(function (e) {
      console.warn('Notificaciones:', e);
      mostrarAviso('<span class="notif-aviso-ico">⚠️</span><span class="notif-aviso-txt"><b>No se pudieron activar</b>Revisa la conexión e inténtalo de nuevo.</span>' +
        '<span class="notif-aviso-btns"><button class="notif-btn-si" onclick="NOTIF.activar()">Reintentar</button><button class="notif-btn-no" onclick="NOTIF.cerrar()">Cerrar</button></span>');
    });
  }

  function despues() { lsSet(LS_LATER, String(Date.now())); quitarAviso(); }
  function ocultarIOS() { lsSet(LS_IOS, '1'); quitarAviso(); }

  /* ── Inicio (se llama al entrar al dashboard) ──────────── */
  function iniciar() {
    if (typeof firebase === 'undefined' || !firebase.apps.length) return;
    var uid = usuarioActual();
    if (!uid) { quitarAviso(); return; }
    estado.userId = uid;
    if (!VAPID_KEY) return;
    if (!soportado()) {
      if (esIOS() && !instalada() && !lsGet(LS_IOS)) avisoInstalar();
      return;
    }
    if (esIOS() && !instalada()) {               // Safari sin instalar: no hay push
      if (!lsGet(LS_IOS)) avisoInstalar();
      return;
    }
    var perm = Notification.permission;
    if (perm === 'granted') { refrescar(); return; }
    if (perm === 'denied') return;
    var later = +lsGet(LS_LATER) || 0;
    if (Date.now() - later > DIAS_REPREGUNTA * 864e5) avisoActivar();
  }

  // Al cerrar sesión: este dispositivo deja de recibir avisos de esta persona.
  function alSalir() {
    var uid = estado.userId, token = lsGet(LS_TOKEN);
    estado.userId = null; quitarAviso();
    if (!uid || !token) return Promise.resolve();
    var limite = new Promise(function (r) { setTimeout(r, 2500); });
    var borrar = tokenId(token).then(function (id) { return db().ref(P_TOKENS + '/' + uid + '/' + id).remove(); })
      .then(function () { lsSet(LS_TOKEN, null); }).catch(function () {});
    return Promise.race([borrar, limite]);
  }

  /* ── Vínculos responsable ↔ usuario (panel Usuarios, solo master) ── */
  function normName(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function namesMatch(a, b) {
    var na = normName(a), nb = normName(b);
    if (!na || !nb) return false;
    if (na === nb) return true;
    var ta = na.split(' '), tb = nb.split(' ');
    var sh = ta.length <= tb.length ? ta : tb, lg = ta.length <= tb.length ? tb : ta;
    return sh.length >= 2 && sh.every(function (w) { return lg.indexOf(w) !== -1; });
  }
  function claveVinculo(nombre) { return normName(nombre).replace(/ /g, '_') || '_'; }
  function autoUsuario(nombre, users) {
    var hits = Object.keys(users).filter(function (k) { return users[k] && namesMatch(users[k].name, nombre); });
    return hits.length === 1 ? hits[0] : '';
  }

  function renderVinculos() {
    var cont = document.getElementById('notif-vinculos');
    if (!cont) {
      var body = document.querySelector('#admin-overlay .admin-panel-body');
      if (!body) return;
      cont = document.createElement('div');
      cont.id = 'notif-vinculos';
      cont.className = 'notif-vinc';
      body.appendChild(cont);
    }
    var esMaster = typeof AUTH !== 'undefined' && AUTH.realId && AUTH.users[AUTH.realId] && AUTH.users[AUTH.realId].role === 'master';
    if (!esMaster) { cont.innerHTML = ''; return; }
    cont.innerHTML = '<div class="admin-section-title">📲 Notificaciones — responsables del Gestor de Tareas</div><div class="notif-vinc-load">Cargando…</div>';
    Promise.all([
      db().ref('atuntro_gestor/data').once('value'),
      db().ref(P_VINC).once('value'),
      db().ref(P_TOKENS).once('value').catch(function () { return { val: function () { return {}; } }; })
    ]).then(function (r) {
      var g = r[0].val() || {}, vinc = r[1].val() || {}, toks = r[2].val() || {};
      var users = AUTH.users || {};
      var nombres = {};
      (g.responsables || []).forEach(function (n) { if (n) nombres[n] = 1; });
      (g.tasks || []).forEach(function (t) { if (t && t.resp) nombres[t.resp] = 1; });
      var lista = Object.keys(nombres).sort(function (a, b) { return a.localeCompare(b, 'es'); });
      var opciones = Object.keys(users).filter(function (k) { return users[k] && users[k].name; })
        .sort(function (a, b) { return users[a].name.localeCompare(users[b].name, 'es'); });
      var filas = lista.map(function (n) {
        var k = claveVinculo(n), manual = vinc[k] && vinc[k].usuario, auto = autoUsuario(n, users);
        var sel = manual || '';
        var ops = '<option value="">' + (auto ? 'Automático: ' + esc(users[auto].name) : '— Sin vincular —') + '</option>' +
          opciones.map(function (u) { return '<option value="' + esc(u) + '"' + (u === sel ? ' selected' : '') + '>' + esc(users[u].name) + '</option>'; }).join('');
        var efectivo = manual || auto;
        var dispositivos = efectivo && toks[efectivo] ? Object.keys(toks[efectivo]).length : 0;
        var estadoTxt = !efectivo ? '<span class="notif-vinc-st no">Sin vincular — no recibe avisos de tareas</span>'
          : dispositivos ? '<span class="notif-vinc-st ok">✓ ' + dispositivos + ' dispositivo' + (dispositivos > 1 ? 's' : '') + '</span>'
          : '<span class="notif-vinc-st pend">Aún no activa notificaciones</span>';
        return '<div class="notif-vinc-row"><span class="notif-vinc-name">' + esc(n) + '</span>' +
          '<select class="admin-role-sel" data-nombre="' + esc(n) + '" onchange="NOTIF.guardarVinculo(this)">' + ops + '</select>' + estadoTxt + '</div>';
      }).join('');
      cont.innerHTML = '<div class="admin-section-title">📲 Notificaciones — responsables del Gestor de Tareas</div>' +
        '<div class="notif-vinc-help">Cada tarea se avisa a la persona vinculada con su "Responsable". Si el nombre coincide con un usuario, se vincula solo; si no, elígelo aquí.</div>' +
        (filas || '<div class="notif-vinc-load">No hay responsables en el Gestor.</div>');
    }).catch(function () {
      cont.innerHTML = '<div class="admin-section-title">📲 Notificaciones</div><div class="notif-vinc-load">No se pudo cargar (revisa las reglas de atuntro_push en Firebase).</div>';
    });
  }

  function guardarVinculo(sel) {
    var nombre = sel.getAttribute('data-nombre'), u = sel.value;
    var ref = db().ref(P_VINC + '/' + claveVinculo(nombre));
    (u ? ref.set({ nombre: nombre, usuario: u }) : ref.remove())
      .then(renderVinculos)
      .catch(function () { alert('No se pudo guardar el vínculo.'); });
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cerrar() { quitarAviso(); }

  return {
    iniciar: iniciar, activar: activar, despues: despues, ocultarIOS: ocultarIOS, cerrar: cerrar,
    alSalir: alSalir, renderVinculos: renderVinculos, guardarVinculo: guardarVinculo,
    _claveVinculo: claveVinculo
  };
})();
