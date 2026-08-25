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
        roles: ['operaciones','master'],
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
        roles: ['operaciones','admin','contabilidad','master'],
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
        roles: ['operaciones','admin','contabilidad','master'],
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
        roles: ['admin','operaciones','contabilidad','master'],
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
        roles: ['operaciones','admin','contabilidad','master'],
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
        roles: ['operaciones','admin','master'],
        vessels: ['María Fátima'],
        onclick: 'openPlano()',
        linkLabel: 'Abrir plano de red',
      },
    ],
    gestor_modules: [
      {
        id: 'gestor-tareas',
        title: 'Gestor de Tareas',
        desc: 'Registro y seguimiento de tareas del equipo: pendientes, compromisos, fechas límite y estado de cumplimiento.',
        icon: '✅',
        iconColor: 'green',
        color: 'color-green',
        status: 'active',
        roles: ['operaciones','admin','contabilidad','master'],
        vessels: [],
        url: null,
        linkLabel: 'Abrir Gestor',
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
    document.getElementById('grid-fin').innerHTML = [...finModules, ...gestorModules].map(renderCard).join('');

    document.getElementById('section-ops').style.display = opsModules.length ? 'block' : 'none';
    const finTotal = finModules.length + gestorModules.length;
    document.getElementById('section-fin').style.display = finTotal ? 'block' : 'none';

    const finLabel = document.getElementById('section-fin-label');
    if (finLabel) {
      finLabel.textContent = role === 'contabilidad' ? 'Herramientas' : 'Finanzas y Rentabilidad';
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function hideAllScreens() {
    ['screen-login','screen-dashboard','screen-gestor','screen-checklist-ops','screen-checklist-adm','screen-equipos','screen-simulador','screen-documentos','screen-boyas','screen-proyectos','screen-plano'].forEach(function(id){
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
      loadPendingTasks();
    }, 100);
  }
  function logout() {
    sessionStorage.removeItem('atuntro_session');
    hideAllScreens();
    document.getElementById('screen-login').classList.add('active');
    document.getElementById('login-name-sel').value = '';
    loginResetPin();
    document.getElementById('login-error').textContent = '';
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
  function goBackFromDocumentos() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }
  function goBackFromSimulador() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); } else { logout(); }
  }

  // ══════════════════════════════════════════════════════════════════════
  //  AUTH — Sistema de autenticación
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
  var AUTH_PATH = 'atuntro_portal_auth_v1';
  var DEFAULT_USERS = {
    romulo_perez:      { name: 'Rómulo Pérez',      role: 'operaciones',  pin: '1810' },
    david_perez:       { name: 'David Pérez',        role: 'operaciones',  pin: '1091' },
    fernando_farfan:   { name: 'Fernando Farfán',    role: 'operaciones',  pin: '7780' },
    ricardo_baida_d:   { name: 'Ricardo Baida D.',   role: 'admin',        pin: '6864' },
    ruben_vera:        { name: 'Rubén Vera',          role: 'admin',        pin: '8473' },
    katherine_crespin: { name: 'Katherine Crespín',  role: 'contabilidad', pin: '2731' },
    stefanny_ormeno:   { name: 'Stefanny Ormeño',    role: 'contabilidad', pin: '2613' },
    ricardo_mendoza:   { name: 'Ricardo Mendoza',    role: 'contabilidad', pin: '1944' },
    ricardo_baida_t:   { name: 'Ricardo Baida T.',   role: 'master',       pin: '7599' },
  };
  var AUTH = { db: null, users: JSON.parse(JSON.stringify(DEFAULT_USERS)), ready: false };

  // Inicia sesión anónima con Firebase lo antes posible (antes de que cualquier
  // módulo intente leer/escribir en la base). Las reglas de la base exigen
  // "auth != null" — esto abre esa puerta de forma automática e invisible,
  // sin pedir nada a la persona que usa el portal.
  var _fbAuthReady = (function ensureFirebaseAuth() {
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      return firebase.auth().signInAnonymously()
        .then(function(){ return true; })
        .catch(function(e){ console.warn('Firebase anon auth falló:', e && e.message); return false; });
    } catch(e) {
      return Promise.resolve(false);
    }
  })();

  function authInit() {
    _fbAuthReady.then(function() {
      try {
        AUTH.db = firebase.database();
        AUTH.db.ref(AUTH_PATH + '/users').once('value').then(function(snap) {
          if (snap.exists()) { AUTH.users = snap.val(); }
          else { AUTH.db.ref(AUTH_PATH + '/users').set(DEFAULT_USERS); }
          AUTH.ready = true;
          authCheckSession();
        }).catch(function() { AUTH.ready = true; authCheckSession(); });
      } catch(e) { AUTH.ready = true; authCheckSession(); }
    });
  }

  function authCheckSession() {
    var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
    if (sess && AUTH.users[sess.id]) {
      authSetDashboard(sess.id, AUTH.users[sess.id]);
      enterDashboard(AUTH.users[sess.id].role);
    }
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

  // ── PIN login ────────────────────────────────────────────────────────────────
  var _loginPin = '';
  function loginResetPin() {
    _loginPin = '';
    loginUpdateDots();
    document.getElementById('login-error').textContent = '';
  }
  function loginPinKey(d) {
    if (_loginPin.length >= 4) return;
    _loginPin += d;
    loginUpdateDots();
    if (_loginPin.length === 4) setTimeout(loginSubmit, 120);
  }
  function loginPinDel() { _loginPin = _loginPin.slice(0,-1); loginUpdateDots(); }
  function loginUpdateDots() {
    for (var i=0;i<4;i++) document.getElementById('pd'+i).classList.toggle('filled', i < _loginPin.length);
  }
  function loginSubmit() {
    var userId = document.getElementById('login-name-sel').value;
    if (!userId) { showLoginError('Selecciona tu nombre primero.'); return; }
    if (_loginPin.length < 4) { showLoginError('Ingresa tu PIN de 4 dígitos.'); return; }
    var user = AUTH.users[userId];
    if (!user) { showLoginError('Usuario no encontrado.'); loginResetPin(); return; }
    if (_loginPin !== user.pin) { showLoginError('PIN incorrecto. Intenta de nuevo.'); shakePin(); loginResetPin(); return; }
    sessionStorage.setItem('atuntro_session', JSON.stringify({ id: userId }));
    authSetDashboard(userId, user);
    enterDashboard(user.role);
  }
  function showLoginError(msg) { document.getElementById('login-error').textContent = msg; }
  function shakePin() {
    var d = document.querySelector('.pin-display');
    d.classList.remove('login-shake'); void d.offsetWidth; d.classList.add('login-shake');
    setTimeout(function(){ d.classList.remove('login-shake'); }, 400);
  }

  // ── Admin panel ──────────────────────────────────────────────────────────────
  function openAdminPanel() { renderAdminUsers(); document.getElementById('admin-overlay').classList.add('show'); }
  function closeAdminPanel() { document.getElementById('admin-overlay').classList.remove('show'); }
  function renderAdminUsers() {
    var container = document.getElementById('admin-users-list');
    var roleOptions = ['operaciones','admin','contabilidad','master'];
    var html = '';
    Object.entries(AUTH.users).forEach(function(entry) {
      var uid = entry[0], u = entry[1];
      html += '<div class="user-row" id="urow-' + uid + '">' +
        '<span class="user-row-name">' + u.name + '</span>' +
        '<select class="user-role-sel" data-uid="' + uid + '" onchange="adminChangeRoleEl(this)">' +
          roleOptions.map(function(r){ return '<option value="' + r + '"' + (r===u.role?' selected':'') + '>' + (ROLE_LABELS[r]||r) + '</option>'; }).join('') +
        '</select>' +
        '<span class="user-pin-badge" id="pin-badge-' + uid + '">' + u.pin + '</span>' +
        '<button class="btn-reset-pin" data-uid="' + uid + '" onclick="adminResetPinEl(this)">&#x1F504; Reset</button>' +
        '</div>';
    });
    container.innerHTML = html;
  }
  function adminChangeRoleEl(sel) { adminChangeRole(sel.getAttribute('data-uid'), sel.value); }
  function adminResetPinEl(btn) { adminResetPin(btn.getAttribute('data-uid')); }
  function adminChangeRole(uid, newRole) {
    AUTH.users[uid].role = newRole;
    if (AUTH.db) AUTH.db.ref(AUTH_PATH+'/users/'+uid+'/role').set(newRole);
    showAdminMsg('✓ Rol actualizado', true);
  }
  function adminResetPin(uid) {
    var newPin = String(Math.floor(1000 + Math.random() * 9000));
    AUTH.users[uid].pin = newPin;
    if (AUTH.db) AUTH.db.ref(AUTH_PATH+'/users/'+uid+'/pin').set(newPin);
    var badge = document.getElementById('pin-badge-' + uid);
    if (badge) { badge.textContent = newPin; badge.style.color = '#4CAF50'; setTimeout(function(){ badge.style.color=''; }, 2000); }
    showAdminMsg('✓ PIN reseteado: ' + newPin, true);
  }
  function adminAddUser() {
    var nameEl = document.getElementById('admin-new-name');
    var roleEl = document.getElementById('admin-new-role');
    var name = nameEl.value.trim(), role = roleEl.value;
    if (!name) { showAdminMsg('⚠ Ingresa el nombre del usuario.', false); return; }
    var uid = name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_+$/,'');
    if (AUTH.users[uid]) { showAdminMsg('⚠ Ya existe un usuario con ese nombre.', false); return; }
    var pin = String(Math.floor(1000 + Math.random() * 9000));
    var newUser = { name:name, role:role, pin:pin };
    AUTH.users[uid] = newUser;
    if (AUTH.db) AUTH.db.ref(AUTH_PATH+'/users/'+uid).set(newUser);
    var sel = document.getElementById('login-name-sel');
    var opt = document.createElement('option'); opt.value = uid; opt.textContent = name; sel.appendChild(opt);
    nameEl.value = '';
    renderAdminUsers();
    showAdminMsg('✓ ' + name + ' agregado — PIN: ' + pin, true);
  }
  function showAdminMsg(msg, ok) {
    var el = document.getElementById('admin-msg'); if (!el) return;
    el.textContent = msg; el.className = 'admin-msg ' + (ok ? 'ok' : 'err');
    setTimeout(function(){ el.textContent=''; el.className='admin-msg'; }, 3500);
  }

  // ── Change PIN ────────────────────────────────────────────────────────────────
  var _chpinStep = 'first', _chpinFirst = '', _chpinCurrent = '';
  function openChangePinModal() {
    _chpinStep='first'; _chpinFirst=''; _chpinCurrent='';
    updateChpinDots();
    document.getElementById('chpin-sub').textContent = 'Ingresa tu nuevo PIN (4 dígitos)';
    document.getElementById('chpin-msg').textContent = '';
    document.getElementById('chpin-overlay').classList.add('show');
  }
  function closeChangePinModal() { document.getElementById('chpin-overlay').classList.remove('show'); }
  function chpinKey(d) {
    if (_chpinCurrent.length >= 4) return;
    _chpinCurrent += d; updateChpinDots();
    if (_chpinCurrent.length === 4) setTimeout(chpinNext, 120);
  }
  function chpinDel() { _chpinCurrent = _chpinCurrent.slice(0,-1); updateChpinDots(); }
  function updateChpinDots() {
    document.querySelectorAll('.chpin-dot').forEach(function(d,i){ d.classList.toggle('filled', i < _chpinCurrent.length); });
  }
  function chpinNext() {
    if (_chpinStep === 'first') {
      _chpinFirst = _chpinCurrent; _chpinCurrent = ''; _chpinStep = 'confirm';
      updateChpinDots();
      document.getElementById('chpin-sub').textContent = 'Confirma tu nuevo PIN';
    } else {
      if (_chpinCurrent !== _chpinFirst) {
        document.getElementById('chpin-msg').innerHTML = '<span class="chpin-err">⚠ Los PINs no coinciden. Intenta de nuevo.</span>';
        _chpinStep='first'; _chpinFirst=''; _chpinCurrent=''; updateChpinDots();
        document.getElementById('chpin-sub').textContent = 'Ingresa tu nuevo PIN (4 dígitos)';
        return;
      }
      var sess = JSON.parse(sessionStorage.getItem('atuntro_session')||'null');
      if (!sess) { closeChangePinModal(); return; }
      AUTH.users[sess.id].pin = _chpinFirst;
      if (AUTH.db) AUTH.db.ref(AUTH_PATH+'/users/'+sess.id+'/pin').set(_chpinFirst);
      document.getElementById('chpin-msg').innerHTML = '<span class="chpin-ok">✓ PIN cambiado exitosamente.</span>';
      setTimeout(closeChangePinModal, 1500);
    }
  }

  // ══ WIDGET TAREAS PENDIENTES ═══════════════════════════════════════════════
  var _pendingCollapsed = false;

  // Departamentos visibles según el rol logueado (misma lógica que el Gestor).
  var PENDING_ROLE_DEPTS = {
    operaciones:  ['Operativo'],
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
  function startPendingLiveSync() {
    try {
      if (typeof firebase === 'undefined' || !firebase.apps.length) { setTimeout(startPendingLiveSync, 1500); return; }
      firebase.database().ref('atuntro_gestor/data').on('value', function(){
        // solo re-render si el dashboard está visible
        var dash = document.getElementById('screen-dashboard');
        if (dash && dash.classList.contains('active')) loadPendingTasks();
      });
    } catch(e) { setTimeout(startPendingLiveSync, 1500); }
  }
  startPendingLiveSync();

  document.addEventListener('DOMContentLoaded', authInit);
