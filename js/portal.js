  document.getElementById('year').textContent = new Date().getFullYear();

  // ── Module definitions ──────────────────────────────────────────────────────
  const MODULES = {
    ops: [
      {
        id: 'checklist',
        title: 'Checklist Operacional',
        desc: 'Control de las 4 fases operacionales por buque: pre-llegada, llegada, pre-descarga y pre-zarpe. Auditoría completa con historial.',
        icon: '✅',
        iconColor: 'blue',
        color: 'color-blue',
        status: 'active',
        roles: ['operaciones','operaciones_master','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openChecklistOps()',
        linkLabel: 'Abrir checklist',
      },
      {
        id: 'checklist-admin',
        title: 'Checklist Administrativo',
        desc: 'Control del ciclo operativo administrativo: documentación, proveedores, trámites y seguimiento de compromisos por buque.',
        icon: '📋',
        iconColor: 'orange',
        color: 'color-orange',
        status: 'active',
        roles: ['admin','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openChecklistAdm()',
        linkLabel: 'Abrir checklist',
      },
      {
        id: 'proyectos',
        title: 'Proyectos e Inversiones',
        desc: 'Registro de proyectos y trabajos por embarcación: ítems por área (mecánica, hidráulica, frío, etc.), proveedor, valor y estado. Sumatorias por área e inversión total.',
        icon: '🔧',
        iconColor: 'green',
        color: 'color-green',
        status: 'active',
        roles: ['operaciones','operaciones_master','admin','contabilidad','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openProyectos()',
        linkLabel: 'Abrir proyectos',
      },
      {
        id: 'documentos',
        title: 'Control Documental',
        desc: 'Vigencias de documentos y certificados por embarcación: vencimientos, alertas por estado y línea de tiempo. Base compartida en tiempo real.',
        icon: '📄',
        iconColor: 'teal',
        color: 'color-teal',
        status: 'active',
        roles: ['operaciones','operaciones_master','admin','contabilidad','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openDocumentos()',
        linkLabel: 'Abrir control documental',
      },
      {
        id: 'equipos',
        title: 'Control de Equipos',
        desc: 'Horómetros de motores y equipos, uso de winches y estado de cables por buque, con respaldo a Excel.',
        icon: '⚙️',
        iconColor: 'blue',
        color: 'color-blue',
        status: 'active',
        roles: ['admin','operaciones','operaciones_master','contabilidad','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openEquipos()',
        linkLabel: 'Abrir control',
      },
      {
        id: 'boyas',
        title: 'Control de Boyas',
        desc: 'Inventario de boyas satelitales por buque: altas y bajas, boyas a bordo, estado en el agua, historial de recuperaciones y origen.',
        icon: '\u{1F6DF}',
        iconColor: 'teal',
        color: 'color-teal',
        status: 'active',
        roles: ['operaciones','operaciones_master','admin','contabilidad','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openBoyas()',
        linkLabel: 'Abrir control de boyas',
      },
      {
        id: 'plano-red',
        title: 'Plano de Red',
        desc: 'Plano interactivo de la red de cerco: estado de cada paño por sección, medidas editables y fecha de último cambio por tramo. Base compartida en tiempo real.',
        icon: '\u{1F578}\uFE0F',
        iconColor: 'purple',
        color: 'color-purple',
        status: 'active',
        roles: ['operaciones','operaciones_master','admin','master'],
        vessels: ['María Fátima'],
        onclick: 'openPlano()',
        linkLabel: 'Abrir plano de red',
      },
    ],
    gestor_modules: [
      {
        id: 'gestor-tareas',
        title: 'Gestión de Equipo',
        desc: 'Tareas del equipo, agenda de fechas clave (zarpes, vencimientos de documentos) y reuniones con sus convocados.',
        icon: '👥',
        iconColor: 'green',
        color: 'color-green',
        status: 'active',
        roles: ['operaciones','operaciones_master','admin','contabilidad','master'],
        vessels: [],
        url: null,
        linkLabel: 'Abrir Gestión de Equipo',
        onclick: "openGestor()",
      },
    ],
    fin: [
      {
        id: 'simulador',
        title: 'Simulador de Viaje',
        desc: 'Proyección de rentabilidad pre-zarpe, cierre real post-viaje, comparativo proyectado vs real y auditoría de viaje.',
        icon: '📈',
        iconColor: 'green',
        color: 'color-green',
        status: 'active',
        roles: ['admin','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openSimulador()',
        linkLabel: 'Abrir simulador',
      },
      {
        id: 'contable',
        title: 'Dashboard Contable',
        desc: 'Información de Tucán: costos por viaje, cuentas por pagar, cuentas por cobrar e impuestos. Indicadores, antigüedad de saldos y detalle filtrable.',
        icon: '📊',
        iconColor: 'blue',
        color: 'color-blue',
        status: 'active',
        roles: ['admin','master'],
        vessels: ['María Fátima','María de Gracia'],
        onclick: 'openContable()',
        linkLabel: 'Abrir dashboard',
      },
      {
        id: 'rentabilidad',
        title: 'Modelo de Rentabilidad',
        desc: 'Base de datos anual de viajes: descargas por talla, costos por proveedor, breakdowns de capitanes y análisis de rentabilidad.',
        icon: '🗂️',
        iconColor: 'purple',
        color: 'color-purple',
        status: 'dev',
        roles: ['admin','contabilidad','master'],
        vessels: ['María Fátima','María de Gracia'],
        url: null,
        linkLabel: 'Próximamente',
      },
    ],
  };

  const ROLE_LABELS = {
    admin: 'Administración',
    operaciones: 'Operaciones',
    operaciones_master: 'Jefe de Operaciones',
    contabilidad: 'Contabilidad',
    master: 'Gerencia / Master',
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  function renderCard(mod) {
    var active   = mod.status === 'active';
    var disabled = !active;
    var vessels  = (mod.vessels || []).map(function(v){ return '<span class="vessel-chip">' + v + '</span>'; }).join('');
    var cardClick = '';
    var footerBtn = '';

    if (mod.onclick) {
      cardClick = ' onclick="' + mod.onclick + '"';
      footerBtn = '<button class="mod-link-btn"' + (disabled ? ' disabled' : '') + '>' +
                  (active ? mod.linkLabel : '⏳ Próximamente') + '</button>';
    } else if (active && mod.url) {
      var safeUrl = mod.url.replace(/ /g, '%20');
      if (safeUrl.indexOf('http') === 0) {
        cardClick = ' onclick="window.open(' + "'" + safeUrl + "',\'_blank\')" + '"';
      } else {
        cardClick = ' onclick="window.location.href=' + "'" + safeUrl + "'" + '"';
      }
      footerBtn = '<span class="mod-link">' + mod.linkLabel + ' →</span>';
    } else {
      footerBtn = '<span class="mod-link-disabled">⏳ Próximamente</span>';
    }

    return '<div class="mod-card' + (disabled ? ' mod-disabled' : '') + '"' + cardClick + '>' +
      '<div class="mod-icon ' + mod.color + '">' + mod.icon + '</div>' +
      '<div class="mod-body">' +
        '<h3 class="mod-title">' + mod.title + '</h3>' +
        '<p class="mod-desc">' + mod.desc + '</p>' +
        (vessels ? '<div class="vessel-chips">' + vessels + '</div>' : '') +
      '</div>' +
      '<div class="mod-footer">' + footerBtn + '</div>' +
      '</div>';
  }

  function renderDashboard(role) {
    const opsModules    = MODULES.ops.filter(function(m){ return m.roles.includes(role); });
    const finModules    = MODULES.fin.filter(function(m){ return m.roles.includes(role); });
    const gestorModules = MODULES.gestor_modules.filter(function(m){ return m.roles.includes(role); });

    document.getElementById('role-badge-text').textContent = ROLE_LABELS[role] || role;
    document.getElementById('grid-ops').innerHTML = opsModules.map(renderCard).join('');
    document.getElementById('grid-fin').innerHTML = finModules.map(renderCard).join('');
    document.getElementById('grid-equipo').innerHTML = gestorModules.map(renderCard).join('');

    document.getElementById('section-ops').style.display = opsModules.length ? 'block' : 'none';
    document.getElementById('section-equipo').style.display = gestorModules.length ? 'block' : 'none';
    document.getElementById('section-fin').style.display = finModules.length ? 'block' : 'none';

    const finLabel = document.getElementById('section-fin-label');
    if (finLabel) {
      finLabel.textContent = role === 'contabilidad' ? 'Herramientas' : 'Finanzas y Rentabilidad';
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function hideAllScreens() {
    ['screen-login','screen-dashboard','screen-gestor','screen-checklist-ops','screen-checklist-adm','screen-equipos','screen-simulador','screen-documentos','screen-boyas','screen-proyectos','screen-plano','screen-contable'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
  }
  function enterDashboard(role) {
    hideAllScreens();
    renderDashboard(role);
    document.getElementById('screen-dashboard').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(loadPendingTasks, 250);
  }
  function openGestor() {
    hideAllScreens();
    document.getElementById('screen-gestor').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof GT !== 'undefined') { try { GT.init(); } catch(e){} }
      if (typeof EQ !== 'undefined') { try { EQ.init(); } catch(e){} }
      loadPendingTasks();
    }, 100);
  }
  function logout() {
    if (sessionStorage.getItem('atuntro_view_as')) { viewAsExit(); return; }
    sessionStorage.removeItem('atuntro_session');
    hideAllScreens();
    document.getElementById('screen-login').classList.add('active');
    var lp = document.getElementById('login-pass'); if (lp) lp.value = '';
    document.getElementById('login-error').textContent = '';
    try { if (firebase.auth().currentUser) firebase.auth().signOut(); } catch(e) {}
    window.scrollTo(0,0);
  }
  function goBack() { logout(); }
  function goBackFromGestor() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function openEquipos() {
    hideAllScreens();
    document.getElementById('screen-equipos').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof EQUIPOS !== 'undefined') { try { EQUIPOS.init(); } catch(e){} }
    }, 100);
  }
  function goBackFromEquipos() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function openSimulador() {
    hideAllScreens();
    document.getElementById('screen-simulador').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof SIMULADOR !== 'undefined') { try { SIMULADOR.init(); } catch(e){} }
    }, 100);
  }
  function openDocumentos() {
    hideAllScreens();
    document.getElementById('screen-documentos').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof DOCS !== 'undefined') { try { DOCS.init(); } catch(e){} }
    }, 100);
  }
  function openBoyas() {
    hideAllScreens();
    document.getElementById('screen-boyas').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof BOY !== 'undefined') { try { BOY.mostrar(); } catch(e){} }
    }, 100);
  }
  function goBackFromBoyas() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function openPlano() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (!sess) { logout(); return; }
    var u = AUTH.users[sess.id];
    if (!u) { logout(); return; }
    hideAllScreens();
    document.getElementById('screen-plano').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof PR !== 'undefined') { try { PR.init({ name: u.name, key: sess.id, role: u.role }); } catch(e){} }
    }, 100);
  }
  function goBackFromPlano() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function openProyectos() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (!sess) { logout(); return; }
    var u = AUTH.users[sess.id];
    if (!u) { logout(); return; }
    hideAllScreens();
    document.getElementById('screen-proyectos').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof PROY !== 'undefined') { try { PROY.init({ name: u.name, key: sess.id, role: u.role }); } catch(e){} }
    }, 100);
  }
  function goBackFromProyectos() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function openContable() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (!sess) { logout(); return; }
    var u = AUTH.users[sess.id];
    if (!u || (u.role !== 'admin' && u.role !== 'master')) { enterDashboard(u ? u.role : ''); return; }
    hideAllScreens();
    document.getElementById('screen-contable').classList.add('active');
    window.scrollTo(0,0);
    setTimeout(function(){
      if (typeof CONT !== 'undefined') { try { CONT.init({ name: u.name, key: sess.id, role: u.role }); } catch(e){} }
    }, 100);
  }
  function goBackFromContable() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function goBackFromDocumentos() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function goBackFromSimulador() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }

  // ══════════════════════════════════════════════════════════════════════
  //  AUTH — Sistema de autenticación (correo y contraseña, Firebase Auth)
  // ══════════════════════════════════════════════════════════════════════
  //  Cada persona entra con su correo y contraseña. El rol NO vive en el
  //  código: se guarda en Firebase y lo protegen las reglas de la base.
  //
  //  Estructura en la base:
  //    atuntro_portal_auth_v2/users/<id>   = { name, role, email }
  //    atuntro_portal_auth_v2/emails/<key> = <id>   (key = correo en minúsculas, '.' → ',')
  //    atuntro_portal_auth_v2/uids/<uid>   = <id>   (enlace cuenta Firebase → usuario)
  //
  //  <id> es la misma clave de siempre (ej. ricardo_baida_t), así que los
  //  módulos y las asignaciones existentes siguen funcionando igual.
  // ══════════════════════════════════════════════════════════════════════
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
    authDomain: "atuntro-portal.firebaseapp.com",
    databaseURL: "https://atuntro-portal-default-rtdb.firebaseio.com",
    projectId: "atuntro-portal",
    storageBucket: "atuntro-portal.firebasestorage.app",
    messagingSenderId: "390090673795",
    appId: "1:390090673795:web:e01a5d03e5543c8dc415b6"
  };
  var AUTH_PATH = 'atuntro_portal_auth_v2';
  // Solo nombres y roles iniciales (sin claves). Se usan una sola vez, cuando
  // el dueño del portal entra por primera vez y la lista aún no existe.
  var SEED_USERS = {
    romulo_perez:      { name: 'Rómulo Pérez',      role: 'operaciones_master' },
    david_perez:       { name: 'David Pérez',        role: 'operaciones' },
    fernando_farfan:   { name: 'Fernando Farfán',    role: 'operaciones' },
    ricardo_baida_d:   { name: 'Ricardo Baida D.',   role: 'admin' },
    ruben_vera:        { name: 'Rubén Vera',          role: 'admin' },
    katherine_crespin: { name: 'Katherine Crespín',  role: 'contabilidad' },
    stefanny_ormeno:   { name: 'Stefanny Ormeño',    role: 'contabilidad' },
    ricardo_mendoza:   { name: 'Ricardo Mendoza',    role: 'contabilidad' },
    ricardo_baida_t:   { name: 'Ricardo Baida T.',   role: 'master' },
  };
  var AUTH = { db: null, users: {}, ready: false, uid: null };

  function emailKey(email) { return String(email || '').trim().toLowerCase().replace(/\./g, ','); }

  var _fbAuthReady = (function initFirebase() {
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      // La sesión dura lo que dure la pestaña (igual que el login anterior).
      return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function(){ return true; })
        .catch(function(){ return true; });
    } catch(e) {
      return Promise.resolve(false);
    }
  })();

  function authInit() {
    _fbAuthReady.then(function() {
      try {
        AUTH.db = firebase.database();
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) { authResolveUser(user); }
          else { AUTH.ready = true; AUTH.uid = null; authShowLogin(); }
        });
      } catch(e) { AUTH.ready = true; authShowLogin(); }
    });
  }

  // Compatibilidad: algunos módulos llaman esto para reingresar al dashboard.
  function authCheckSession() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) {
      authSetDashboard(sess.id, AUTH.users[sess.id]);
      enterDashboard(AUTH.users[sess.id].role);
    }
  }

  function authShowLogin() {
    sessionStorage.removeItem('atuntro_session');
    hideAllScreens();
    document.getElementById('screen-login').classList.add('active');
    loginSetBusy(false);
  }

  // Busca a qué usuario del portal corresponde la cuenta que acaba de entrar.
  function authResolveUser(user) {
    loginSetBusy(true);
    if (!user.emailVerified) {
      user.sendEmailVerification().catch(function(){});
      firebase.auth().signOut();
      showLoginError('Te enviamos un correo para verificar tu cuenta. Ábrelo y vuelve a entrar.');
      return;
    }
    var db = AUTH.db;
    db.ref(AUTH_PATH + '/uids/' + user.uid).once('value').then(function(snap) {
      if (snap.exists()) return snap.val();
      // Primer ingreso: enlazar por correo.
      return db.ref(AUTH_PATH + '/emails/' + emailKey(user.email)).once('value').then(function(es) {
        if (es.exists()) {
          var id = es.val();
          return db.ref(AUTH_PATH + '/uids/' + user.uid).set(id).then(function(){ return id; });
        }
        return authTrySeed(user);
      });
    }).then(function(id) {
      if (!id) throw { code: 'no-autorizado' };
      AUTH.uid = user.uid;
      return db.ref(AUTH_PATH + '/users').once('value').then(function(us) {
        AUTH.users = us.val() || {};
        if (!AUTH.users[id]) throw { code: 'no-autorizado' };
        return id;
      });
    }).then(function(id) {
      AUTH.ready = true;
      AUTH.realId = id;
      // Modo "Ver como": solo un master puede ver el portal con el rol de otra persona.
      var viewAs = sessionStorage.getItem('atuntro_view_as');
      if (viewAs && viewAs !== id && AUTH.users[id].role === 'master' && AUTH.users[viewAs]) {
        id = viewAs;
        viewAsActivate(AUTH.users[viewAs]);
      } else if (viewAs) {
        viewAsClearStorage();
      }
      sessionStorage.setItem('atuntro_session', JSON.stringify({ id: id }));
      var u = AUTH.users[id];
      authSetDashboard(id, u);
      enterDashboard(u.role);
      startPendingLiveSync();
      db.ref(AUTH_PATH + '/users').on('value', function(s){ if (s.val()) AUTH.users = s.val(); });
    }).catch(function(e) {
      firebase.auth().signOut();
      if (e && e.code === 'no-autorizado') showLoginError('Este correo no tiene acceso al portal. Pide al administrador que te agregue.');
      else showLoginError('No se pudo verificar tu acceso. Revisa tu conexión e intenta de nuevo.');
    });
  }

  // Solo el dueño del portal (definido en las reglas de Firebase) puede crear la
  // lista inicial de usuarios. Para cualquier otra cuenta esto falla y se rechaza.
  function authTrySeed(user) {
    var db = AUTH.db;
    return db.ref(AUTH_PATH + '/users').once('value').then(function(us) {
      if (us.exists()) return null;
      var masterId = Object.keys(SEED_USERS).filter(function(k){ return SEED_USERS[k].role === 'master'; })[0];
      var seed = JSON.parse(JSON.stringify(SEED_USERS));
      seed[masterId].email = String(user.email).toLowerCase();
      var upd = {};
      upd['users'] = seed;
      upd['emails/' + emailKey(user.email)] = masterId;
      upd['uids/' + user.uid] = masterId;
      return db.ref(AUTH_PATH).update(upd).then(function(){ return masterId; });
    }).catch(function(){ return null; });
  }

  function authSetDashboard(userId, user) {
    var initials = user.name.split(' ').slice(0,2).map(function(w){ return w[0]; }).join('').toUpperCase();
    var pill = document.getElementById('user-pill');
    var avatar = document.getElementById('user-avatar');
    var pillName = document.getElementById('user-pill-name');
    var adminBtn = document.getElementById('btn-admin-users');
    if (pill) pill.style.display = 'flex';
    if (avatar) avatar.textContent = initials;
    if (pillName) pillName.textContent = user.name;
    if (adminBtn) adminBtn.style.display = user.role === 'master' ? 'inline-flex' : 'none';
  }

  // ── Login con correo y contraseña ───────────────────────────────────────────
  function loginSetBusy(b) {
    var btn = document.getElementById('login-btn');
    if (btn) { btn.disabled = b; btn.textContent = b ? 'Entrando…' : 'Entrar'; }
  }
  function loginSubmit() {
    var email = (document.getElementById('login-email').value || '').trim();
    var pass = document.getElementById('login-pass').value || '';
    if (!email) { showLoginError('Ingresa tu correo.'); return; }
    if (!pass) { showLoginError('Ingresa tu contraseña.'); return; }
    showLoginError('');
    loginSetBusy(true);
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(e) {
      loginSetBusy(false);
      var c = e && e.code;
      if (c === 'auth/invalid-email') showLoginError('El correo no es válido.');
      else if (c === 'auth/too-many-requests') showLoginError('Demasiados intentos. Espera unos minutos o restablece tu contraseña.');
      else if (c === 'auth/network-request-failed') showLoginError('Sin conexión. Revisa tu internet.');
      else showLoginError('Correo o contraseña incorrectos.');
      shakePin();
    });
  }
  function loginForgot() {
    var email = (document.getElementById('login-email').value || '').trim();
    if (!email) { showLoginError('Escribe tu correo y vuelve a tocar "¿Olvidaste tu contraseña?".'); return; }
    firebase.auth().sendPasswordResetEmail(email).then(function() {
      showLoginError('');
      var el = document.getElementById('login-error');
      el.innerHTML = '<span style="color:#4CAF50">Si el correo tiene cuenta, te llegará un enlace para crear una contraseña nueva.</span>';
    }).catch(function(e) {
      if (e && e.code === 'auth/invalid-email') showLoginError('El correo no es válido.');
      else showLoginError('Si el correo tiene cuenta, te llegará un enlace para crear una contraseña nueva.');
    });
  }
  function loginKey(ev) { if (ev && ev.key === 'Enter') loginSubmit(); }
  function showLoginError(msg) { document.getElementById('login-error').textContent = msg; }
  function shakePin() {
    var d = document.querySelector('.login-form');
    if (!d) return;
    d.classList.remove('login-shake'); void d.offsetWidth; d.classList.add('login-shake');
    setTimeout(function(){ d.classList.remove('login-shake'); }, 400);
  }

  // ── Admin panel (solo master) ──────────────────────────────────────────────
  function openAdminPanel() { renderAdminUsers(); document.getElementById('admin-overlay').classList.add('show'); }
  function closeAdminPanel() { document.getElementById('admin-overlay').classList.remove('show'); }
  function escAttr(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function renderAdminUsers() {
    var container = document.getElementById('admin-users-list');
    var roleOptions = ['operaciones','operaciones_master','admin','contabilidad','master'];
    var html = '';
    Object.entries(AUTH.users).forEach(function(entry) {
      var uid = entry[0], u = entry[1];
      html += '<div class="user-row" id="urow-' + uid + '">' +
        '<span class="user-row-name">' + escAttr(u.name) + '</span>' +
        '<select class="user-role-sel" data-uid="' + uid + '" onchange="adminChangeRoleEl(this)">' +
          roleOptions.map(function(r){ return '<option value="' + r + '"' + (r===u.role?' selected':'') + '>' + (ROLE_LABELS[r]||r) + '</option>'; }).join('') +
        '</select>' +
        '<input class="admin-input user-email-in" type="email" placeholder="correo@empresa.com" data-uid="' + uid + '" value="' + escAttr(u.email) + '" onchange="adminSetEmailEl(this)">' +
        '<button class="btn-reset-pin" data-uid="' + uid + '" onclick="adminInviteEl(this)" title="Crea la cuenta si no existe y envía el enlace para poner contraseña">&#x2709; Enviar acceso</button>' +
        (uid !== AUTH.realId ? '<button class="btn-reset-pin" data-uid="' + uid + '" onclick="viewAsStart(this.getAttribute(\'data-uid\'))" title="Ver el portal como esta persona (solo lectura)">&#x1F441; Ver como</button>' : '') +
        '</div>';
    });
    container.innerHTML = html;
  }
  function adminChangeRoleEl(sel) { adminChangeRole(sel.getAttribute('data-uid'), sel.value); }
  function adminSetEmailEl(inp) { adminSetEmail(inp.getAttribute('data-uid'), inp.value); }
  function adminInviteEl(btn) { adminInvite(btn.getAttribute('data-uid')); }
  function adminChangeRole(uid, newRole) {
    AUTH.users[uid].role = newRole;
    if (AUTH.db) AUTH.db.ref(AUTH_PATH+'/users/'+uid+'/role').set(newRole)
      .then(function(){ showAdminMsg('✓ Rol actualizado', true); })
      .catch(function(){ showAdminMsg('⚠ No se pudo guardar el rol.', false); });
  }
  // Cambiar o borrar el correo también corta el acceso de la cuenta anterior.
  function adminSetEmail(uid, email) {
    email = String(email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAdminMsg('⚠ Correo no válido.', false); return Promise.resolve(false); }
    var db = AUTH.db, oldEmail = (AUTH.users[uid] && AUTH.users[uid].email) || '';
    if (email === oldEmail) return Promise.resolve(true);
    if (email) {
      var owner = Object.keys(AUTH.users).filter(function(k){ return k !== uid && AUTH.users[k].email === email; })[0];
      if (owner) { showAdminMsg('⚠ Ese correo ya lo usa ' + AUTH.users[owner].name + '.', false); return Promise.resolve(false); }
    }
    return db.ref(AUTH_PATH + '/uids').once('value').then(function(snap) {
      var upd = {};
      upd['users/' + uid + '/email'] = email || null;
      if (oldEmail) upd['emails/' + emailKey(oldEmail)] = null;
      if (email) upd['emails/' + emailKey(email)] = uid;
      var me = AUTH.uid;
      snap.forEach(function(c){ if (c.val() === uid && c.key !== me) upd['uids/' + c.key] = null; });
      return db.ref(AUTH_PATH).update(upd);
    }).then(function() {
      AUTH.users[uid].email = email || undefined;
      showAdminMsg(email ? '✓ Correo guardado. Toca "Enviar acceso" para invitarlo.' : '✓ Correo quitado: ya no podrá entrar.', true);
      return true;
    }).catch(function() { showAdminMsg('⚠ No se pudo guardar el correo.', false); return false; });
  }
  // Crea la cuenta (con una clave aleatoria que nadie ve) y envía el enlace
  // para que la persona defina su propia contraseña.
  function adminInvite(uid) {
    var u = AUTH.users[uid];
    if (!u || !u.email) { showAdminMsg('⚠ Primero escribe el correo de ' + (u ? u.name : 'este usuario') + '.', false); return; }
    var email = u.email;
    var tmp = Array.from(crypto.getRandomValues(new Uint32Array(4))).map(function(n){ return n.toString(36); }).join('') + 'Aa1!';
    var sec;
    try { sec = firebase.app('atuntro-invite'); } catch(e) { sec = firebase.initializeApp(FIREBASE_CONFIG, 'atuntro-invite'); }
    sec.auth().createUserWithEmailAndPassword(email, tmp).then(function(){
      return sec.auth().signOut();
    }).catch(function(e){
      if (!(e && e.code === 'auth/email-already-in-use')) throw e;
    }).then(function(){
      return firebase.auth().sendPasswordResetEmail(email);
    }).then(function(){
      showAdminMsg('✓ Enlace enviado a ' + email, true);
    }).catch(function(e){
      showAdminMsg('⚠ No se pudo enviar: ' + ((e && e.code) || 'error'), false);
    });
  }
  function adminAddUser() {
    var nameEl = document.getElementById('admin-new-name');
    var roleEl = document.getElementById('admin-new-role');
    var emailEl = document.getElementById('admin-new-email');
    var name = nameEl.value.trim(), role = roleEl.value, email = emailEl ? emailEl.value.trim().toLowerCase() : '';
    if (!name) { showAdminMsg('⚠ Ingresa el nombre del usuario.', false); return; }
    if (!email) { showAdminMsg('⚠ Ingresa el correo del usuario.', false); return; }
    var uid = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    if (AUTH.users[uid]) { showAdminMsg('⚠ Ya existe un usuario con ese nombre.', false); return; }
    var newUser = { name:name, role:role };
    AUTH.users[uid] = newUser;
    AUTH.db.ref(AUTH_PATH+'/users/'+uid).set(newUser).then(function(){
      return adminSetEmail(uid, email);
    }).then(function(ok){
      nameEl.value = ''; if (emailEl) emailEl.value = '';
      renderAdminUsers();
      if (ok) adminInvite(uid);
    }).catch(function(){ showAdminMsg('⚠ No se pudo agregar.', false); });
  }
  function showAdminMsg(msg, ok) {
    var el = document.getElementById('admin-msg'); if (!el) return;
    el.textContent = msg; el.className = 'admin-msg ' + (ok ? 'ok' : 'err');
    setTimeout(function(){ el.textContent=''; el.className='admin-msg'; }, 4500);
  }

  // ── Ver como (solo master) ─────────────────────────────────────────────────
  //  Recarga el portal mostrando lo que ve otra persona según su rol.
  //  Es de SOLO LECTURA: se bloquea toda escritura a Firebase y, al salir, se
  //  restaura el caché local del navegador tal como estaba.
  var VIEW_KEY = 'atuntro_view_as', VIEW_LS_BACKUP = 'atuntro_view_ls_backup';
  function viewAsStart(uid) {
    if (!AUTH.users[uid]) return;
    if (!AUTH.realId || AUTH.users[AUTH.realId].role !== 'master') return;
    try {
      var bk = {};
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); bk[k] = localStorage.getItem(k); }
      sessionStorage.setItem(VIEW_LS_BACKUP, JSON.stringify(bk));
    } catch(e) {}
    sessionStorage.setItem(VIEW_KEY, uid);
    location.reload();
  }
  function viewAsClearStorage() {
    sessionStorage.removeItem(VIEW_KEY);
    try {
      var bk = JSON.parse(sessionStorage.getItem(VIEW_LS_BACKUP) || 'null');
      if (bk) {
        localStorage.clear();
        Object.keys(bk).forEach(function(k){ localStorage.setItem(k, bk[k]); });
      }
    } catch(e) {}
    sessionStorage.removeItem(VIEW_LS_BACKUP);
  }
  function viewAsExit() {
    viewAsClearStorage();
    location.reload();
  }
  var _viewToastAt = 0;
  function viewAsToast() {
    if (Date.now() - _viewToastAt < 4000) return;
    _viewToastAt = Date.now();
    var t = document.createElement('div');
    t.textContent = '👁 Modo vista: los cambios no se guardan.';
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#E8A33D;color:#1a1a1a;padding:10px 16px;border-radius:10px;font-weight:700;font-size:13px;z-index:100000;box-shadow:0 4px 14px rgba(0,0,0,.3)';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
  }
  function viewAsActivate(target) {
    // Bloquear escrituras a la base mientras se está en modo vista.
    try {
      var R = firebase.database.Reference.prototype;
      ['set','update','remove','push','transaction','setWithPriority','setPriority'].forEach(function(m) {
        if (typeof R[m] !== 'function') return;
        R[m] = function() { viewAsToast(); return Promise.reject(new Error('Modo vista: solo lectura')); };
      });
    } catch(e) {}
    var bar = document.createElement('div');
    bar.id = 'view-as-bar';
    bar.innerHTML = '👁 Viendo como <b>' + escAttr(target.name) + '</b> (' + escAttr(ROLE_LABELS[target.role] || target.role) +
      ') · solo lectura <button onclick="viewAsExit()" style="margin-left:12px;background:#1a1a1a;color:#fff;border:0;border-radius:6px;padding:5px 12px;font-weight:700;cursor:pointer">Salir</button>';
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#E8A33D;color:#1a1a1a;text-align:center;padding:8px 12px;font-size:13px;z-index:99999;box-shadow:0 2px 10px rgba(0,0,0,.25)';
    document.body.appendChild(bar);
    document.body.style.paddingTop = '40px';
  }

  // ── Cambiar contraseña (envía enlace al correo del usuario) ─────────────────
  function openChangePinModal() {
    var u = firebase.auth().currentUser;
    if (!u || !u.email) return;
    if (!confirm('Te enviaremos a ' + u.email + ' un enlace para cambiar tu contraseña. ¿Continuar?')) return;
    firebase.auth().sendPasswordResetEmail(u.email)
      .then(function(){ alert('Listo. Revisa tu correo.'); })
      .catch(function(){ alert('No se pudo enviar el correo. Intenta de nuevo.'); });
  }

  // ══ WIDGET TAREAS PENDIENTES ═══════════════════════════════════════════════
  var _pendingCollapsed = false;

  // Departamentos visibles según el rol logueado (misma lógica que el Gestor).
  var PENDING_ROLE_DEPTS = {
    operaciones:  ['Operativo'],
    operaciones_master: ['Operativo'],
    contabilidad: ['Contabilidad'],
    admin:        ['Administrativo','Operativo','Contabilidad'],
    master:       ['Administrativo','Operativo','Contabilidad'],
  };
  function pendingCurrentRole() {
    try {
      var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
      if (sess && sess.id && AUTH.users && AUTH.users[sess.id]) return AUTH.users[sess.id].role || 'admin';
    } catch(e) {}
    return 'admin';
  }
  function pendingAllowedDepts() { return PENDING_ROLE_DEPTS[pendingCurrentRole()] || PENDING_ROLE_DEPTS.admin; }

  // Lee tareas: primero intenta Firebase; si aún no responde, usa localStorage.
  function _readTasks(cb) {
    var fallback = function() {
      try {
        var raw = localStorage.getItem('atuntro_gestor_v1');
        var data = raw ? JSON.parse(raw) : null;
        return data ? (data.tasks || []) : [];
      } catch(e) { return []; }
    };
    try {
      if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.database().ref('atuntro_gestor/data').once('value')
          .then(function(snap){
            var d = snap.val();
            cb(d && d.tasks ? d.tasks : fallback());
          })
          .catch(function(){ cb(fallback()); });
        return;
      }
    } catch(e) {}
    cb(fallback());
  }

  function loadPendingTasks() {
    _readTasks(function(tasks){
      var ok = pendingAllowedDepts();
      var mine = tasks.filter(function(t){ return ok.indexOf(t.dept) !== -1; });
      var pending = mine.filter(function(t){ return t.estado !== 'COMPLETO'; });
      renderPendingWidget('pending-tasks-list', 'pending-count-badge', pending);
      updateAlertBell(mine);
    });
  }
  function renderPendingWidget(listId, badgeId, pending) {
    var list = document.getElementById(listId), badge = document.getElementById(badgeId);
    if (!list) return;
    if (badge) { badge.textContent = pending.length; badge.className = 'pending-count-badge' + (pending.length===0?' zero':''); }
    if (pending.length === 0) {
      list.innerHTML = '<div class="pending-empty"><div class="pending-empty-icon">✅</div>¡Sin tareas pendientes! Todo al día.</div>';
      return;
    }
    var order = {INCOMPLETO:0, PENDIENTE:1};
    var sorted = pending.slice().sort(function(a,b){
      var oa = order[a.estado]!==undefined?order[a.estado]:2, ob = order[b.estado]!==undefined?order[b.estado]:2;
      return oa!==ob ? oa-ob : (a.fecha||'').localeCompare(b.fecha||'');
    });
    var estadoLabel = {INCOMPLETO:'En Progreso', PENDIENTE:'Pendiente', COMPLETO:'Completo'};
    list.innerHTML =
      '<div class="pending-col-headers">' +
        '<span>Tarea</span><span>Responsable</span><span>Área</span><span>Estado</span>' +
      '</div>' +
      sorted.map(function(t){
        var label = estadoLabel[t.estado] || t.estado;
        return '<div class="task-pending-row">' +
          '<span class="task-pending-name" title="' + escHtml(t.tarea||'') + '">' + escHtml(t.tarea||'') + '</span>' +
          '<span class="task-pending-resp">' + escHtml(t.resp||'—') + '</span>' +
          '<span class="task-pending-dept">' + escHtml(t.dept||'—') + '</span>' +
          '<span class="task-estado-badge ' + escHtml(t.estado||'') + '">' + escHtml(label) + '</span>' +
        '</div>';
      }).join('');
  }
  // ══ CAMPANA DE ALERTAS (esquina del dashboard) ═══════════════════════════
  // Cuenta tareas pendientes/incompletas del área del rol y muestra el número.
  function updateAlertBell(mineTasks) {
    var bell  = document.getElementById('alert-bell');
    var badge = document.getElementById('alert-bell-count');
    var panel = document.getElementById('alert-bell-panel');
    if (!bell || !badge) return;
    var pend = mineTasks.filter(function(t){ return t.estado !== 'COMPLETO'; });
    var n = pend.length;
    badge.textContent = n;
    badge.style.display = n > 0 ? 'flex' : 'none';
    bell.classList.toggle('has-alerts', n > 0);

    if (panel) {
      if (!n) {
        panel.innerHTML = '<div class="bell-empty">✅ Sin tareas pendientes en tu área.</div>';
      } else {
        var order = {INCOMPLETO:0, PENDIENTE:1};
        var sorted = pend.slice().sort(function(a,b){
          var oa = order[a.estado]!==undefined?order[a.estado]:2, ob = order[b.estado]!==undefined?order[b.estado]:2;
          return oa!==ob ? oa-ob : (a.fecha||'').localeCompare(b.fecha||'');
        });
        var lbl = {INCOMPLETO:'En Progreso', PENDIENTE:'Pendiente'};
        panel.innerHTML =
          '<div class="bell-panel-title">🔔 ' + n + ' tarea' + (n>1?'s':'') + ' por atender</div>' +
          sorted.slice(0,8).map(function(t){
            return '<div class="bell-item" onclick="openGestor()">' +
              '<span class="bell-item-dot ' + escHtml(t.estado) + '"></span>' +
              '<span class="bell-item-txt" title="' + escHtml(t.tarea||'') + '">' + escHtml(t.tarea||'') + '</span>' +
              '<span class="bell-item-est ' + escHtml(t.estado) + '">' + (lbl[t.estado]||t.estado) + '</span>' +
            '</div>';
          }).join('') +
          (n>8 ? '<div class="bell-more" onclick="openGestor()">+ '+(n-8)+' más — ver todas</div>' : '') +
          '<div class="bell-cta" onclick="openGestor()">Abrir Gestor de Tareas →</div>';
      }
    }
  }
  function toggleAlertBell() {
    var panel = document.getElementById('alert-bell-panel');
    if (panel) panel.classList.toggle('open');
  }
  // Cerrar el panel al hacer clic fuera
  document.addEventListener('click', function(e){
    var wrap = document.getElementById('alert-bell-wrap');
    var panel = document.getElementById('alert-bell-panel');
    if (wrap && panel && !wrap.contains(e.target)) panel.classList.remove('open');
  });

  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function togglePendingTasks() {
    _pendingCollapsed = !_pendingCollapsed;
    var b=document.getElementById('pending-tasks-body'), ic=document.getElementById('pending-toggle-icon');
    if(b) b.className='pending-tasks-body '+(_pendingCollapsed?'collapsed':'expanded');
    if(ic) ic.textContent=_pendingCollapsed?'▼':'▲';
  }

  // Refresco en vivo de la campana y el widget cuando cambian las tareas en Firebase,
  // aunque no se haya abierto el Gestor.
  var _pendingSyncOn = false;
  function startPendingLiveSync() {
    if (_pendingSyncOn) return;
    try {
      if (typeof firebase === 'undefined' || !firebase.apps.length) { setTimeout(startPendingLiveSync, 1500); return; }
      _pendingSyncOn = true;
      firebase.database().ref('atuntro_gestor/data').on('value', function(){
        // solo re-render si el dashboard está visible
        var dash = document.getElementById('screen-dashboard');
        if (dash && dash.classList.contains('active')) loadPendingTasks();
      });
    } catch(e) { setTimeout(startPendingLiveSync, 1500); }
  }
  // startPendingLiveSync() se inicia al completar el login (authResolveUser).

  document.addEventListener('DOMContentLoaded', authInit);
