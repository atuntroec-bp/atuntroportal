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
          '<select class="user-role-sel" data-nombre="' + esc(n) + '" onchange="NOTIF.guardarVinculo(this)">' + ops + '</select>' + estadoTxt + '</div>';
      }).join('');
      cont.innerHTML = '<div class="admin-section-title">📲 Notificaciones</div>' +
        '<button class="notif-editar-btn" onclick="NOTIF.abrirEditor()">⚙️ Editar notificaciones <span>textos, encendido, horarios y destinatarios</span></button>' +
        '<div class="notif-vinc-sub">Responsables del Gestor de Tareas</div>' +
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

  /* ── Ventana "Editar notificaciones" (solo master) ─────────
     Guarda en atuntro_push/config; el enviador mezcla eso con NOTIF_PLANTILLAS. */
  var P_CONFIG = 'atuntro_push/config';
  var P_PRUEBAS = 'atuntro_push/pruebas';
  var ED = { cfg: null, foco: null, cambios: false };
  var ORDEN = ['tareaAsignada', 'tareaPorVencer', 'tareaVencida', 'reunionConvocada', 'reunionProxima', 'evento', 'documento', 'checklist'];
  var DEST_FIJO = {
    tareaAsignada: 'Siempre al responsable de la tarea.',
    tareaPorVencer: 'Siempre al responsable de la tarea.',
    tareaVencida: 'Siempre al responsable de la tarea.',
    reunionConvocada: 'A los convocados (menos quien convoca).',
    reunionProxima: 'A todos los convocados.',
    checklist: 'Siempre al responsable de cada punto.'
  };
  var AYUDA = {
    tareaAsignada: 'Al asignar o reasignar una tarea. {vence} dice "vence 20/11", "vence mañana" o "venció 05/11" (vacío si no tiene vencimiento).',
    tareaPorVencer: 'Recordatorio antes de la fecha de vencimiento de la tarea (solo tareas con vencimiento).',
    tareaVencida: 'Una vez, cuando pasa la fecha de vencimiento sin completarse (solo tareas con vencimiento).',
    reunionConvocada: 'Al crear una reunión.',
    reunionProxima: 'Antes de que empiece la reunión.',
    evento: 'El día anterior al evento (o el mismo día si se creó tarde).',
    documento: 'Cuando faltan los días indicados para que venza.',
    checklist: 'Una vez por viaje, cuando pasa el límite del área. Agrupa los puntos pendientes.'
  };

  function fabrica() { return JSON.parse(JSON.stringify(NOTIF_PLANTILLAS)); }
  function mezclar(base, extra) {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return extra === undefined ? base : extra;
    var out = {}; Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(extra || {}).forEach(function (k) { out[k] = (k in base) ? mezclar(base[k], extra[k]) : extra[k]; });
    return out;
  }
  function aLista(v) { return Array.isArray(v) ? v : (v && typeof v === 'object') ? Object.keys(v).map(function (k) { return v[k]; }) : (v == null ? [] : [v]); }
  function rellenar(plantilla, campos) {
    return String(plantilla || '').split(' · ').map(function (t) {
      var vacio = false;
      var r = t.replace(/\{(\w+)\}/g, function (_, k) {
        var v = campos[k];
        if (v === undefined || v === null || String(v).trim() === '') { vacio = true; return ''; }
        return String(v);
      });
      return vacio ? null : r.replace(/\s{2,}/g, ' ').trim();
    }).filter(function (t) { return t; }).join(' · ');
  }
  function roles() {
    var L = (typeof ROLE_LABELS !== 'undefined') ? ROLE_LABELS : { master: 'Gerencia / Master' };
    return Object.keys(L).map(function (k) { return { id: k, nombre: L[k] }; });
  }

  function abrirEditor() {
    var ov = document.getElementById('notif-editor');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'notif-editor';
      ov.className = 'admin-overlay notif-ed-overlay';
      ov.innerHTML = '<div class="admin-panel notif-ed-panel">' +
        '<div class="admin-panel-head"><h3>⚙️ Editar notificaciones</h3><button class="admin-close" onclick="NOTIF.cerrarEditor()">✕</button></div>' +
        '<div class="admin-panel-body" id="notif-ed-body"><div class="notif-vinc-load">Cargando…</div></div>' +
        '<div class="notif-ed-foot"><span id="notif-ed-estado"></span>' +
        '<button class="notif-btn-no" onclick="NOTIF.cerrarEditor()">Cerrar</button>' +
        '<button class="notif-btn-si" id="notif-ed-guardar" onclick="NOTIF.guardarEditor()">Guardar cambios</button></div></div>';
      document.body.appendChild(ov);
      ov.addEventListener('input', edCambio);
      ov.addEventListener('change', edCambio);
      ov.addEventListener('focusin', function (e) { if (e.target.matches('.notif-ed-tpl')) ED.foco = e.target; });
    }
    ov.classList.add('show');
    ED.cambios = false; estadoEd('');
    db().ref(P_CONFIG).once('value').then(function (s) {
      ED.cfg = mezclar(fabrica(), s.val() || {});
      pintarEditor();
    }).catch(function () {
      document.getElementById('notif-ed-body').innerHTML = '<div class="notif-vinc-load">No se pudo cargar la configuración (revisa las reglas de atuntro_push/config).</div>';
    });
  }

  function cerrarEditor() {
    if (ED.cambios && !confirm('Hay cambios sin guardar. ¿Cerrar de todas formas?')) return;
    var ov = document.getElementById('notif-editor'); if (ov) ov.classList.remove('show');
  }

  function chkRoles(tipo, campo, valores, conTodos) {
    var v = aLista(valores);
    var ops = (conTodos ? [{ id: 'todos', nombre: 'Todos los usuarios' }] : []).concat(roles());
    return '<div class="notif-ed-roles" data-tipo="' + tipo + '" data-campo="' + campo + '">' + ops.map(function (r) {
      return '<label class="notif-ed-chk"><input type="checkbox" value="' + esc(r.id) + '"' + (v.indexOf(r.id) !== -1 ? ' checked' : '') + '> ' + esc(r.nombre) + '</label>';
    }).join('') + '</div>';
  }

  function campoTexto(tipo, campo, etiqueta, valor, area) {
    return '<label class="notif-ed-lbl">' + etiqueta + '</label>' +
      (area ? '<textarea class="notif-ed-tpl" rows="2" data-tipo="' + tipo + '" data-campo="' + campo + '">' + esc(valor) + '</textarea>'
            : '<input class="notif-ed-tpl" type="text" data-tipo="' + tipo + '" data-campo="' + campo + '" value="' + esc(valor) + '">');
  }

  function tarjetaTipo(tipo) {
    var t = ED.cfg.tipos[tipo], campos = Object.keys((ED.cfg.campos || {})[tipo] || {});
    var extra = '';
    if (tipo === 'tareaPorVencer') extra = '<div class="notif-ed-fila"><label class="notif-ed-lbl">Avisar cuando falten (días, separados por coma; 0 = el mismo día)</label>' +
      '<input class="notif-ed-dias" type="text" data-tipo="' + tipo + '" data-campo="dias" value="' + esc(aLista(t.dias).join(', ')) + '"></div>' +
      '<label class="notif-ed-lbl">También avisar a (copia)</label>' + chkRoles(tipo, 'copiaRoles', t.copiaRoles, false);
    if (tipo === 'tareaAsignada' || tipo === 'tareaVencida') extra = '<label class="notif-ed-lbl">También avisar a (copia)</label>' + chkRoles(tipo, 'copiaRoles', t.copiaRoles, false);
    if (tipo === 'reunionProxima') extra = '<div class="notif-ed-fila"><label class="notif-ed-lbl">Minutos antes</label>' +
      '<input class="notif-ed-num" type="number" min="5" max="240" step="5" data-tipo="' + tipo + '" data-campo="minutos" value="' + esc(t.minutos) + '"></div>' +
      '<label class="notif-ed-chk"><input type="checkbox" data-tipo="' + tipo + '" data-campo="ignoraHorario"' + (t.ignoraHorario ? ' checked' : '') + '> Enviar aunque sea fuera del horario</label>';
    if (tipo === 'evento') extra = '<label class="notif-ed-lbl">¿Quién lo recibe?</label>' + chkRoles(tipo, 'roles', t.roles, true);
    if (tipo === 'documento') extra = '<div class="notif-ed-fila"><label class="notif-ed-lbl">Avisar cuando falten (días, separados por coma)</label>' +
      '<input class="notif-ed-dias" type="text" data-tipo="' + tipo + '" data-campo="dias" value="' + esc(aLista(t.dias).join(', ')) + '"></div>' +
      '<label class="notif-ed-lbl">¿Quién lo recibe?</label>' + chkRoles(tipo, 'roles', t.roles, true);
    if (tipo === 'checklist') extra = '<label class="notif-ed-lbl">Supervisores (reciben todos los puntos vencidos)</label>' + chkRoles(tipo, 'roles', t.roles, true);
    return '<div class="notif-ed-card' + (t.activo ? '' : ' off') + '" data-card="' + tipo + '">' +
      '<div class="notif-ed-card-head"><label class="notif-ed-switch"><input type="checkbox" data-tipo="' + tipo + '" data-campo="activo"' + (t.activo ? ' checked' : '') + '><span></span></label>' +
      '<div><b>' + esc(t.nombre) + '</b><small>' + esc(AYUDA[tipo] || '') + '</small></div></div>' +
      '<div class="notif-ed-card-body">' +
        '<div class="notif-ed-cols"><div class="notif-ed-col">' +
          campoTexto(tipo, 'titulo', 'Título', t.titulo, false) +
          campoTexto(tipo, 'cuerpo', tipo === 'checklist' ? 'Mensaje para el responsable' : 'Mensaje', t.cuerpo, true) +
          (tipo === 'checklist' ? campoTexto(tipo, 'cuerpoSupervisor', 'Mensaje para supervisores', t.cuerpoSupervisor, true) : '') +
          '<div class="notif-ed-chips">Insertar: ' + campos.map(function (c) { return '<button type="button" class="notif-ed-chip" onclick="NOTIF.insertarCampo(\'' + tipo + '\',\'' + c + '\')">{' + c + '}</button>'; }).join('') + '</div>' +
          (DEST_FIJO[tipo] ? '<div class="notif-ed-nota">👤 ' + DEST_FIJO[tipo] + '</div>' : '') + extra +
        '</div><div class="notif-ed-col notif-ed-prev-col"><label class="notif-ed-lbl">Vista previa</label><div class="notif-ed-prev" data-prev="' + tipo + '"></div>' +
          (tipo === 'checklist' ? '<div class="notif-ed-prev" data-prev="' + tipo + ':sup"></div>' : '') +
          '<div class="notif-ed-acc"><button type="button" class="notif-ed-mini" onclick="NOTIF.enviarPrueba(\'' + tipo + '\')">📲 Enviar prueba</button>' +
          '<button type="button" class="notif-ed-mini" onclick="NOTIF.restaurarTipo(\'' + tipo + '\')">↺ Texto original</button></div>' +
        '</div></div>' +
      '</div></div>';
  }

  function pintarEditor() {
    var c = ED.cfg, h = c.horario, horas = '';
    for (var i = 0; i <= 23; i++) horas += '<option value="' + i + '">' + i + ':00</option>';
    var body = document.getElementById('notif-ed-body');
    body.innerHTML =
      '<div class="notif-ed-intro">Los cambios se aplican en la siguiente revisión del enviador (cada 15 minutos). En los textos, <b>{campo}</b> se reemplaza por el dato real; si un dato viene vacío, se quita ese tramo (entre " · ").</div>' +
      '<div class="admin-section-title">General</div>' +
      '<div class="notif-ed-card"><div class="notif-ed-card-body">' +
        '<div class="notif-ed-fila"><label class="notif-ed-lbl">Horario de envío</label>' +
          '<select class="user-role-sel" data-g="inicio">' + horas + '</select> a <select class="user-role-sel" data-g="fin">' + horas + '</select>' +
          '<span class="notif-ed-nota">Fuera de horario se guardan y salen al inicio del siguiente.</span></div>' +
        '<div class="notif-ed-fila"><label class="notif-ed-lbl">Si una persona tiene más de</label>' +
          '<input class="notif-ed-num" type="number" min="1" max="20" data-g="max" value="' + esc(c.resumen.max) + '"> avisos a la vez, se envía un solo resumen:</div>' +
        '<div class="notif-ed-cols"><div class="notif-ed-col">' + campoTexto('resumen', 'titulo', 'Título del resumen', c.resumen.titulo, false) +
          campoTexto('resumen', 'cuerpo', 'Mensaje del resumen', c.resumen.cuerpo, true) +
          '<div class="notif-ed-chips">Insertar: <button type="button" class="notif-ed-chip" onclick="NOTIF.insertarCampo(\'resumen\',\'n\')">{n}</button><button type="button" class="notif-ed-chip" onclick="NOTIF.insertarCampo(\'resumen\',\'lista\')">{lista}</button></div></div>' +
          '<div class="notif-ed-col notif-ed-prev-col"><label class="notif-ed-lbl">Vista previa</label><div class="notif-ed-prev" data-prev="resumen"></div>' +
          '<div class="notif-ed-acc"><button type="button" class="notif-ed-mini" onclick="NOTIF.enviarPrueba(\'resumen\')">📲 Enviar prueba</button></div></div></div>' +
      '</div></div>' +
      '<div class="admin-section-title">Avisos</div>' + ORDEN.map(tarjetaTipo).join('');
    body.querySelector('[data-g="inicio"]').value = String(h.inicio);
    body.querySelector('[data-g="fin"]').value = String(h.fin);
    previas();
  }

  function leerFormulario() {
    var c = ED.cfg, body = document.getElementById('notif-ed-body');
    c.horario.inicio = +body.querySelector('[data-g="inicio"]').value;
    c.horario.fin = +body.querySelector('[data-g="fin"]').value;
    c.resumen.max = Math.max(1, Math.min(20, +body.querySelector('[data-g="max"]').value || 4));
    body.querySelectorAll('[data-tipo][data-campo]').forEach(function (el) {
      var tipo = el.getAttribute('data-tipo'), campo = el.getAttribute('data-campo');
      var obj = tipo === 'resumen' ? c.resumen : c.tipos[tipo];
      if (!obj) return;
      if (el.classList.contains('notif-ed-roles')) {
        obj[campo] = Array.prototype.map.call(el.querySelectorAll('input:checked'), function (i) { return i.value; });
      } else if (el.type === 'checkbox') obj[campo] = el.checked;
      else if (el.classList.contains('notif-ed-num')) obj[campo] = +el.value || obj[campo];
      else if (el.classList.contains('notif-ed-dias')) obj[campo] = el.value.split(/[,\s;]+/).filter(function (x) { return x !== ''; }).map(Number).filter(function (n) { return n >= 0 && n <= 365 && !isNaN(n); });
      else obj[campo] = el.value;
    });
  }

  function previas() {
    var c = ED.cfg;
    document.querySelectorAll('#notif-ed-body .notif-ed-prev').forEach(function (p) {
      var k = p.getAttribute('data-prev').split(':'), tipo = k[0], sup = k[1] === 'sup';
      var t = tipo === 'resumen' ? c.resumen : c.tipos[tipo], campos = (c.campos || {})[tipo] || {};
      var titulo = rellenar(t.titulo, campos) || 'Atuntro';
      var cuerpo = rellenar(sup ? t.cuerpoSupervisor : t.cuerpo, campos);
      p.innerHTML = '<div class="notif-ed-ios"><img src="icons/icon-192.png" alt=""><div><div class="notif-ed-ios-top"><span>ATUNTRO</span><span>ahora</span></div>' +
        '<b>' + esc(titulo) + '</b><p>' + esc(cuerpo) + '</p></div></div>' + (sup ? '<small class="notif-ed-nota">Así le llega a un supervisor</small>' : '');
    });
    document.querySelectorAll('#notif-ed-body .notif-ed-card[data-card]').forEach(function (card) {
      var t = c.tipos[card.getAttribute('data-card')]; card.classList.toggle('off', !t.activo);
    });
  }

  function edCambio() { if (!ED.cfg) return; leerFormulario(); previas(); ED.cambios = true; estadoEd('Cambios sin guardar'); }
  function estadoEd(txt) { var e = document.getElementById('notif-ed-estado'); if (e) e.textContent = txt; }

  function insertarCampo(tipo, campo) {
    var el = ED.foco;
    if (!el || el.getAttribute('data-tipo') !== tipo) el = document.querySelector('#notif-ed-body .notif-ed-tpl[data-tipo="' + tipo + '"][data-campo="cuerpo"]');
    if (!el) return;
    var ini = el.selectionStart != null ? el.selectionStart : el.value.length, fin = el.selectionEnd != null ? el.selectionEnd : ini;
    el.value = el.value.slice(0, ini) + '{' + campo + '}' + el.value.slice(fin);
    el.focus(); el.selectionStart = el.selectionEnd = ini + campo.length + 2;
    edCambio();
  }

  function restaurarTipo(tipo) {
    var f = fabrica().tipos[tipo]; if (!f) return;
    var t = ED.cfg.tipos[tipo];
    ['titulo', 'cuerpo', 'cuerpoSupervisor'].forEach(function (k) { if (k in f) t[k] = f[k]; });
    pintarEditor(); ED.cambios = true; estadoEd('Cambios sin guardar');
  }

  function datosGuardar() {
    var c = ED.cfg, out = { horario: c.horario, resumen: c.resumen, tipos: {} };
    ORDEN.forEach(function (k) { var t = JSON.parse(JSON.stringify(c.tipos[k])); delete t.nombre; out.tipos[k] = t; });
    return out;
  }

  function guardarEditor() {
    if (!ED.cfg) return Promise.resolve();
    leerFormulario();
    var btn = document.getElementById('notif-ed-guardar'); btn.disabled = true; estadoEd('Guardando…');
    return db().ref(P_CONFIG).set(datosGuardar()).then(function () {
      ED.cambios = false; estadoEd('✓ Guardado — se aplica en la próxima revisión');
    }).catch(function () { estadoEd('No se pudo guardar'); }).then(function () { btn.disabled = false; });
  }

  function enviarPrueba(tipo) {
    var uid = estado.userId || (typeof AUTH !== 'undefined' && AUTH.realId);
    if (!uid) return;
    Promise.resolve(ED.cambios ? guardarEditor() : null).then(function () {
      var pend = [{ usuario: uid, tipo: tipo, ts: firebase.database.ServerValue.TIMESTAMP }];
      if (tipo === 'checklist') pend.push({ usuario: uid, tipo: tipo, supervisor: true, ts: firebase.database.ServerValue.TIMESTAMP });
      return Promise.all(pend.map(function (x) { return db().ref(P_PRUEBAS).push(x); }));
    }).then(function () {
      estadoEd('📲 Prueba en cola: llega a tus dispositivos en la próxima revisión (máx. ~15 min)');
    }).catch(function () { estadoEd('No se pudo pedir la prueba'); });
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cerrar() { quitarAviso(); }

  return {
    iniciar: iniciar, activar: activar, despues: despues, ocultarIOS: ocultarIOS, cerrar: cerrar,
    alSalir: alSalir, renderVinculos: renderVinculos, guardarVinculo: guardarVinculo,
    abrirEditor: abrirEditor, cerrarEditor: cerrarEditor, guardarEditor: guardarEditor,
    insertarCampo: insertarCampo, restaurarTipo: restaurarTipo, enviarPrueba: enviarPrueba,
    _claveVinculo: claveVinculo, _rellenar: rellenar
  };
})();
