// ════════════════════════════════════════════════════════════
//  GT — Gestor de Tareas ATUNTRO S.A.  v2.0
//  Encapsulado en objeto GT — sin variables globales
//  Firebase-ready: reemplazar load() / save()
//  Contraseña por defecto: ATUNTRO
// ════════════════════════════════════════════════════════════
const GT = (() => {

  /* ── Constantes ─────────────────────────────────────── */
  const STORAGE_KEY  = 'atuntro_gestor_v1';
  const DEFAULT_PASS = 'ATUNTRO';          // contraseña por defecto
  const ESTADO_ORDER = ['PENDIENTE','INCOMPLETO','COMPLETO'];
  const COLORS = {
    COMPLETO:  { fill:'#1D9E75', bg:'#E1F5EE', tx:'#085041' },
    INCOMPLETO:{ fill:'#BA7517', bg:'#FAEEDA', tx:'#412402' },
    PENDIENTE: { fill:'#D85A30', bg:'#FAECE7', tx:'#4A1B0C' },
  };
  const DEPT_CLS = { Administrativo:'gt-dept-admin', Operativo:'gt-dept-oper', Contabilidad:'gt-dept-cont' };

  /* ── Control de acceso por área ─────────────────────── */
  // Qué departamentos puede VER cada rol del portal.
  // operaciones → solo Operativo · contabilidad → solo Contabilidad
  // admin y master → todo (control total)
  const ROLE_DEPTS = {
    operaciones:  ['Operativo'],
    contabilidad: ['Contabilidad'],
    admin:        ['Administrativo','Operativo','Contabilidad'],
    master:       ['Administrativo','Operativo','Contabilidad'],
  };
  let currentRole = 'admin';  // se sobrescribe en init() con el rol real de la sesión

  // Lee el rol del usuario logueado en el portal desde la sesión.
  function detectRole() {
    try {
      const sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
      if (sess && sess.id && typeof AUTH !== 'undefined' && AUTH.users && AUTH.users[sess.id]) {
        return AUTH.users[sess.id].role || 'admin';
      }
    } catch(e) {}
    return 'admin';
  }

  // Departamentos visibles para el rol actual.
  function allowedDepts() { return ROLE_DEPTS[currentRole] || ROLE_DEPTS.admin; }
  // ¿El rol actual ve todo? (admin / master)
  function seesAll() { return allowedDepts().length >= 3; }
  // Filtra un arreglo de tareas dejando solo las visibles para el rol actual.
  function visibleForRole(arr) {
    if (seesAll()) return arr;
    const ok = allowedDepts();
    return arr.filter(t => ok.includes(t.dept));
  }

  /* ── Responsables iniciales (desde Excel LISTAS) ────── */
  const SEED_RESP = [
    'Rubén Vera','Ricardo Baida D','Ricardo Baida T',
    'Romulo Pérez','David Pérez','Fernando Farfán',
    'Katherine Crespín','Stefanny Ormeño','Ricardo Mendoza'
  ];

  /* ── Tareas iniciales (desde Excel TAREAS) ──────────── */
  const SEED_TASKS = [
    {id:6,  fecha:'2026-06-09', tarea:'Formulario de don Jimmy para seguro El Cóndor (purga de mora)',          dept:'Administrativo', resp:'Rubén Vera',        estado:'INCOMPLETO', obs:'Entregar documentos al seguro'},
    {id:7,  fecha:'2026-06-09', tarea:'Respaldo patrimonial (copia de matrícula, predios de casa)',             dept:'Administrativo', resp:'Rubén Vera',        estado:'COMPLETO',   obs:''},
    {id:8,  fecha:'2026-06-09', tarea:'Planilla de servicios básicos',                                          dept:'Administrativo', resp:'Rubén Vera',        estado:'COMPLETO',   obs:''},
    {id:9,  fecha:'2026-06-09', tarea:'Convenio IESS — meses de febrero y marzo',                               dept:'Contabilidad',   resp:'Katherine Crespín',estado:'COMPLETO',   obs:''},
    {id:10, fecha:'2026-06-09', tarea:'Solucionar lo del SRI 2022 (Ricardo M. ya le envió al auditor — Rubén en espera de respuesta)', dept:'Contabilidad', resp:'Katherine Crespín', estado:'COMPLETO', obs:''},
    {id:11, fecha:'2026-06-09', tarea:'Hipotecas de los barcos de Atún Tropical en el Banco del Austro',        dept:'Administrativo', resp:'Rubén Vera',        estado:'PENDIENTE',  obs:''},
    {id:12, fecha:'2026-06-09', tarea:'Actualizar cuadro de pago del saldo de tripulación del Fátima',          dept:'Contabilidad',   resp:'Katherine Crespín',estado:'COMPLETO',   obs:''},
    {id:13, fecha:'2026-06-09', tarea:'Creación de usuarios personal operaciones para liquidar cajas',          dept:'Contabilidad',   resp:'Ricardo Mendoza',  estado:'COMPLETO',   obs:''},
    {id:14, fecha:'2026-06-09', tarea:'Charla con personal para no usar documentos físicos',                    dept:'Contabilidad',   resp:'Ricardo Mendoza',  estado:'COMPLETO',   obs:''},
    {id:16, fecha:'2026-06-09', tarea:'Pago CIAT',                                                              dept:'Administrativo', resp:'Ricardo Baida T',  estado:'PENDIENTE',  obs:'Se esperará para hacer el pago en última instancia'},
    {id:17, fecha:'2026-06-09', tarea:'Estado crédito Banco Bolivariano',                                       dept:'Administrativo', resp:'Rubén Vera',        estado:'COMPLETO',   obs:''},
    {id:18, fecha:'2026-06-09', tarea:'Acercarse a BanEcuador para averiguar proceso',                          dept:'Administrativo', resp:'Rubén Vera',        estado:'COMPLETO',   obs:''},
    {id:19, fecha:'2026-06-09', tarea:'Dar de baja a tripulantes que ya no están en nómina',                    dept:'Contabilidad',   resp:'Katherine Crespín',estado:'COMPLETO',   obs:''},
    {id:20, fecha:'2026-06-09', tarea:'Diagrama de red del María Fátima',                                       dept:'Operativo',      resp:'Fernando Farfán',  estado:'PENDIENTE',  obs:''},
    {id:21, fecha:'2026-06-09', tarea:'Diagrama de red del María de Gracia',                                    dept:'Operativo',      resp:'Fernando Farfán',  estado:'PENDIENTE',  obs:''},
    {id:22, fecha:'2026-06-09', tarea:'Actualización de correos para ATUNTRO',                                  dept:'Administrativo', resp:'Ricardo Baida T',  estado:'PENDIENTE',  obs:'Compartir correos y claves'},
    {id:23, fecha:'2026-06-09', tarea:'Agrupar documentos para compensación de combustible',                    dept:'Administrativo', resp:'Rubén Vera',        estado:'PENDIENTE',  obs:''},
    {id:24, fecha:'2026-06-09', tarea:'Documentos para compensación',                                           dept:'Operativo',      resp:'Romulo Pérez',     estado:'PENDIENTE',  obs:''},
    {id:25, fecha:'2026-06-09', tarea:'Claves de cuentas Banco del Austro y Banco Pichincha',                   dept:'Administrativo', resp:'Rubén Vera',        estado:'PENDIENTE',  obs:''},
    {id:26, fecha:'2026-07-09', tarea:'Seguimiento de BanEcuador',                                              dept:'Administrativo', resp:'Rubén Vera',        estado:'COMPLETO',   obs:''},
  ];

  /* ── State ──────────────────────────────────────────── */
  let tasks       = [];
  let responsables= [];
  let adminPass   = DEFAULT_PASS;
  let nextId      = 200;
  let editingId   = null;
  let adminUnlocked = false;   // true tras validar la contraseña admin del Gestor

  /* ── Firebase (sincronización entre dispositivos) ───── */
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
    authDomain: "atuntro-portal.firebaseapp.com",
    databaseURL: "https://atuntro-portal-default-rtdb.firebaseio.com",
    projectId: "atuntro-portal",
    storageBucket: "atuntro-portal.firebasestorage.app",
    messagingSenderId: "390090673795",
    appId: "1:390090673795:web:e01a5d03e5543c8dc415b6"
  };
  const FB_PATH = 'atuntro_gestor/data';
  let _fbHandler = null;

  function _getDb() {
    try {
      if (typeof firebase === 'undefined') return null;
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      return firebase.database();
    } catch(e) { return null; }
  }

  function flashSaveDot() {
    const d = document.getElementById('gt-saveDot');
    if (!d) return;
    d.style.opacity = '1';
    setTimeout(() => { d.style.opacity = '0'; }, 1300);
  }

  function startRealtimeSync() {
    const db = _getDb();
    if (!db) return;
    const ref = db.ref(FB_PATH);
    if (_fbHandler) ref.off('value', _fbHandler);
    _fbHandler = snap => {
      const data = snap.val();
      if (!data) return; // nada remoto aún — lo que hay en local se sube en el próximo save()
      tasks        = data.tasks        || tasks;
      responsables = data.responsables || responsables;
      adminPass    = data.adminPass    || adminPass;
      nextId       = data.nextId       || nextId;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, responsables, adminPass, nextId })); } catch(e) {}
      renderAll();
      flashSaveDot();
    };
    ref.on('value', _fbHandler);
  }

  /* ── Storage ────────────────────────────────────────── */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p    = JSON.parse(raw);
        tasks       = p.tasks        || [];
        responsables= p.responsables || [...SEED_RESP];
        adminPass   = p.adminPass    || DEFAULT_PASS;
        nextId      = p.nextId       || 200;
      } else {
        tasks        = JSON.parse(JSON.stringify(SEED_TASKS));
        responsables = [...SEED_RESP];
        adminPass    = DEFAULT_PASS;
        nextId       = 200;
      }
    } catch(e) {
      tasks        = JSON.parse(JSON.stringify(SEED_TASKS));
      responsables = [...SEED_RESP];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, responsables, adminPass, nextId }));
    } catch(e) {}
    const db = _getDb();
    if (db) { db.ref(FB_PATH).set({ tasks, responsables, adminPass, nextId }).then(flashSaveDot).catch(()=>{}); }
  }

  /* ── Stats ──────────────────────────────────────────── */
  function stats() {
    const vis = visibleForRole(tasks);
    const c = vis.filter(t => t.estado === 'COMPLETO').length;
    const i = vis.filter(t => t.estado === 'INCOMPLETO').length;
    const p = vis.filter(t => t.estado === 'PENDIENTE').length;
    const n = vis.length;
    return { c, i, p, n, pct: n ? Math.round(c / n * 100) : 0 };
  }

  /* ── KPIs ───────────────────────────────────────────── */
  function renderKPIs() {
    const s = stats();
    document.getElementById('gt-kpi-tot').textContent   = s.n;
    document.getElementById('gt-kpi-comp').textContent  = s.c;
    document.getElementById('gt-kpi-inc').textContent   = s.i;
    document.getElementById('gt-kpi-pend').textContent  = s.p;
    document.getElementById('gt-kpi-pct-sub').textContent = s.pct + '% completado';
    document.getElementById('gt-prog-fill').style.width  = s.pct + '%';
    document.getElementById('gt-prog-pct').textContent   = s.pct + '%';
  }

  /* ── Donut ──────────────────────────────────────────── */
  function renderDonut() {
    const s = stats();
    const slices = [
      { label:'Completo',   val:s.c, key:'COMPLETO'   },
      { label:'En Progreso', val:s.i, key:'INCOMPLETO' },
      { label:'Pendiente',  val:s.p, key:'PENDIENTE'  },
    ];
    const tot = s.n || 1;
    const cx=60, cy=60, R=46, ri=32;
    let angle = -Math.PI / 2;
    let paths = '';
    slices.forEach(sl => {
      const sw = (sl.val / tot) * 2 * Math.PI;
      if (sw < 0.001) { angle += sw; return; }
      const x1=cx+R*Math.cos(angle),   y1=cy+R*Math.sin(angle);
      const x2=cx+R*Math.cos(angle+sw),y2=cy+R*Math.sin(angle+sw);
      const ix1=cx+ri*Math.cos(angle),  iy1=cy+ri*Math.sin(angle);
      const ix2=cx+ri*Math.cos(angle+sw),iy2=cy+ri*Math.sin(angle+sw);
      const lg = sw > Math.PI ? 1 : 0;
      paths += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${lg},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${ri},${ri} 0 ${lg},0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z" fill="${COLORS[sl.key].fill}"/>`;
      angle += sw;
    });
    document.getElementById('gt-donut-svg').innerHTML = paths +
      `<text x="60" y="55" text-anchor="middle" font-size="20" font-weight="700" font-family="Segoe UI,Arial,sans-serif" fill="#1a1a18">${s.pct}%</text>
       <text x="60" y="69" text-anchor="middle" font-size="9"  font-family="Segoe UI,Arial,sans-serif" fill="#aaa">completado</text>`;
    document.getElementById('gt-donut-legend').innerHTML = slices.map(sl =>
      `<div class="gt-leg-row">
        <div class="gt-leg-left"><div class="gt-leg-dot" style="background:${COLORS[sl.key].fill}"></div>${sl.label}</div>
        <span class="gt-leg-n">${sl.val}</span>
      </div>`
    ).join('');
  }

  /* ── Bars by responsable ────────────────────────────── */
  function renderBars() {
    const map = {};
    visibleForRole(tasks).forEach(t => {
      if (!map[t.resp]) map[t.resp] = {c:0,i:0,p:0};
      map[t.resp][t.estado==='COMPLETO'?'c':t.estado==='INCOMPLETO'?'i':'p']++;
    });
    const entries = Object.entries(map)
      .map(([n,v]) => ({ n, tot:v.c+v.i+v.p, ...v }))
      .filter(e => e.tot > 0)
      .sort((a,b) => b.tot - a.tot);
    const maxT = Math.max(...entries.map(e => e.tot), 1);
    document.getElementById('gt-bars').innerHTML = (entries.length ? entries.map(e => {
      const wc=(e.c/maxT*100).toFixed(1), wi=(e.i/maxT*100).toFixed(1), wp=(e.p/maxT*100).toFixed(1);
      const parts = e.n.trim().split(' ');
      const short = parts[0] + (parts[1] ? ' ' + parts[1].charAt(0) + '.' : '');
      return `<div class="gt-bar-row">
        <div class="gt-bar-name" title="${esc(e.n)}">${esc(short)}</div>
        <div class="gt-bar-track">
          <div class="gt-bar-seg" style="width:${wc}%;background:#1D9E75"></div>
          <div class="gt-bar-seg" style="width:${wi}%;background:#BA7517"></div>
          <div class="gt-bar-seg" style="width:${wp}%;background:#D85A30"></div>
        </div>
        <div class="gt-bar-nums">${e.c}/${e.tot}</div>
      </div>`;
    }).join('') : '<div style="font-size:12px;color:#ccc;padding:8px 0">Sin datos</div>') +
    `<div style="display:flex;gap:14px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,.06)">
      ${['Completo','En Progreso','Pendiente'].map((l,i) => {
        const c=['#1D9E75','#BA7517','#D85A30'][i];
        return `<div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#888"><div style="width:8px;height:8px;border-radius:2px;background:${c};flex-shrink:0"></div>${l}</div>`;
      }).join('')}
    </div>`;
  }

  /* ── Badges ─────────────────────────────────────────── */
  function deptBadge(d) {
    return `<span class="gt-badge ${DEPT_CLS[d]||'gt-dept-admin'}">${esc(d)}</span>`;
  }
  const ESTADO_LABEL = { PENDIENTE:'PENDIENTE', INCOMPLETO:'EN PROGRESO', COMPLETO:'COMPLETO' };
  function statusBadge(e) {
    return `<span class="gt-badge gt-st-${e}">${esc(ESTADO_LABEL[e] || e)}</span>`;
  }

  /* ── Filter selects ─────────────────────────────────── */
  function buildRespFilter() {
    const sel = document.getElementById('gt-f-resp');
    const cur = sel.value;
    const active = [...new Set(visibleForRole(tasks).map(t => t.resp))].sort();
    sel.innerHTML = '<option value="">Todos los responsables</option>' +
      active.map(r => `<option${r===cur?' selected':''}>${esc(r)}</option>`).join('');
  }

  function buildModalRespSel(current) {
    document.getElementById('gm-resp').innerHTML =
      responsables.map(r => `<option${r===current?' selected':''}>${esc(r)}</option>`).join('');
  }

  /* ── Filters ────────────────────────────────────────── */
  function applyFilters() {
    const q  = document.getElementById('gt-search').value.toLowerCase();
    const fE = document.getElementById('gt-f-est').value;
    const fD = document.getElementById('gt-f-dept').value;
    const fR = document.getElementById('gt-f-resp').value;
    const base = visibleForRole(tasks);  // primero limita por área del rol
    const visible = base.filter(t => {
      const mQ = !q || t.tarea.toLowerCase().includes(q)||(t.obs||'').toLowerCase().includes(q)||t.resp.toLowerCase().includes(q);
      return mQ && (!fE||t.estado===fE) && (!fD||t.dept===fD) && (!fR||t.resp===fR);
    });
    const info = document.getElementById('gt-results-info');
    const filtered = q||fE||fD||fR;
    info.style.display = filtered ? 'block' : 'none';
    if (filtered) info.textContent = `Mostrando ${visible.length} de ${base.length} tareas`;
    const list = document.getElementById('gt-task-list');
    // Activa/desactiva la columna de eliminar según el estado admin
    const wrap = list.closest('.gt-table-wrap');
    if (wrap) wrap.classList.toggle('gt-admin-mode', adminUnlocked);
    // Agrega/quita el encabezado de la columna eliminar
    const head = wrap ? wrap.querySelector('.gt-table-head') : null;
    if (head) {
      let delTh = head.querySelector('.gt-th-del');
      if (adminUnlocked && !delTh) {
        delTh = document.createElement('div');
        delTh.className = 'gt-th gt-th-del';
        delTh.style.textAlign = 'center';
        delTh.textContent = '🗑';
        head.appendChild(delTh);
      } else if (!adminUnlocked && delTh) {
        delTh.remove();
      }
    }
    if (!visible.length) {
      list.innerHTML = '<div class="gt-empty">Sin tareas que coincidan con los filtros.</div>';
      return;
    }
    list.innerHTML = visible.map(t => {
      const done = t.estado==='COMPLETO', inc = t.estado==='INCOMPLETO';
      const chkCls = done?'gt-chk-done':inc?'gt-chk-inc':'';
      return `<div class="gt-task-row${done?' gt-done-row':''}">
        <div class="gt-chk ${chkCls}" onclick="GT.cycleStatus(${t.id})" title="Cambiar estado"></div>
        <div class="gt-task-num">#${t.id}</div>
        <div>
          <div class="gt-task-text${done?' gt-struck':''}">${esc(t.tarea)}</div>
          ${t.obs?`<div class="gt-task-obs">📌 ${esc(t.obs)}</div>`:''}
          <div class="gt-task-fecha">${t.fecha}
            <span class="gt-edit-icon" onclick="GT.openModal(${t.id})" title="Editar">✎</span>
          </div>
        </div>
        <div class="gt-col-dept">${deptBadge(t.dept)}</div>
        <div class="gt-col-resp gt-resp-cell">${esc(t.resp)}</div>
        <div class="gt-status-cell" onclick="GT.cycleStatus(${t.id})" title="Click para cambiar estado">${statusBadge(t.estado)}</div>
        ${adminUnlocked ? `<div class="gt-del-cell"><button class="gt-row-del" onclick="GT.deleteTask(${t.id})" title="Eliminar esta tarea">🗑</button></div>` : ''}
      </div>`;
    }).join('');
  }

  function clearFilters() {
    document.getElementById('gt-search').value = '';
    document.getElementById('gt-f-est').value  = '';
    document.getElementById('gt-f-dept').value = '';
    document.getElementById('gt-f-resp').value = '';
    applyFilters();
  }

  /* ── Cycle status ───────────────────────────────────── */
  function cycleStatus(id) {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    t.estado = ESTADO_ORDER[(ESTADO_ORDER.indexOf(t.estado)+1)%3];
    t.upd = today();
    save(); renderAll();
  }

  /* ── Task modal ─────────────────────────────────────── */
  function openModal(id) {
    editingId = id || null;
    document.getElementById('gt-modal-title').textContent = id ? 'Editar tarea' : 'Nueva tarea';
    if (id) {
      const t = tasks.find(t => t.id === id);
      buildModalRespSel(t.resp);
      document.getElementById('gm-tarea').value  = t.tarea;
      document.getElementById('gm-dept').value   = t.dept;
      document.getElementById('gm-estado').value = t.estado;
      document.getElementById('gm-fecha').value  = t.fecha;
      document.getElementById('gm-obs').value    = t.obs || '';
    } else {
      buildModalRespSel('');
      document.getElementById('gm-tarea').value  = '';
      document.getElementById('gm-dept').value   = seesAll() ? 'Administrativo' : allowedDepts()[0];
      document.getElementById('gm-estado').value = 'PENDIENTE';
      document.getElementById('gm-fecha').value  = today();
      document.getElementById('gm-obs').value    = '';
    }
    // Un rol de área solo puede crear/editar tareas de su propio departamento.
    document.getElementById('gm-dept').disabled = !seesAll();
    show('gt-modal-bg');
  }

  function closeModal()       { hide('gt-modal-bg'); }
  function closeModalBg(e)    { if (e.target.id === 'gt-modal-bg') closeModal(); }

  function saveTask() {
    const tarea = document.getElementById('gm-tarea').value.trim();
    if (!tarea) { alert('Ingrese la descripción de la tarea.'); return; }
    const obj = {
      id:     editingId || nextId++,
      fecha:  document.getElementById('gm-fecha').value  || today(),
      tarea,
      dept:   document.getElementById('gm-dept').value,
      resp:   document.getElementById('gm-resp').value,
      estado: document.getElementById('gm-estado').value,
      obs:    document.getElementById('gm-obs').value.trim(),
      upd:    today(),
    };
    if (editingId) {
      const idx = tasks.findIndex(t => t.id === editingId);
      if (idx > -1) tasks[idx] = obj;
    } else {
      tasks.push(obj);
    }
    save(); closeModal(); renderAll();
  }

  /* ── PIN modal ──────────────────────────────────────── */
  function openPin() {
    document.getElementById('gt-pin-input').value = '';
    document.getElementById('gt-pin-error').textContent = '';
    show('gt-pin-bg');
    setTimeout(() => document.getElementById('gt-pin-input').focus(), 80);
  }

  function closePin()      { hide('gt-pin-bg'); }
  function closePinBg(e)   { if (e.target.id === 'gt-pin-bg') closePin(); }

  function checkPin() {
    const val   = document.getElementById('gt-pin-input').value;
    const errEl = document.getElementById('gt-pin-error');
    if (val === adminPass) {
      adminUnlocked = true;   // habilita eliminar tareas una por una
      closePin();
      openAdmin();
      applyFilters();          // re-render para mostrar los botones 🗑
    } else {
      errEl.textContent = 'Contraseña incorrecta. Intente de nuevo.';
      const inp = document.getElementById('gt-pin-input');
      inp.classList.remove('gt-shake');
      void inp.offsetWidth; // reflow para reiniciar animación
      inp.classList.add('gt-shake');
      inp.value = '';
      inp.focus();
    }
  }

  /* ── Admin panel ────────────────────────────────────── */
  function openAdmin() {
    renderRespList();
    document.getElementById('gt-pass-new').value  = '';
    document.getElementById('gt-pass-conf').value = '';
    document.getElementById('gt-pass-msg').textContent = '';
    document.getElementById('gt-resp-new').value  = '';
    document.getElementById('gt-resp-add-error').textContent = '';
    show('gt-admin-bg');
  }

  function closeAdmin()     { hide('gt-admin-bg'); }
  function closeAdminBg(e)  { if (e.target.id === 'gt-admin-bg') closeAdmin(); }

  /* ── Responsables ───────────────────────────────────── */
  function renderRespList() {
    const countMap = {};
    tasks.forEach(t => { countMap[t.resp] = (countMap[t.resp]||0)+1; });
    document.getElementById('gt-resp-list').innerHTML =
      responsables.map(r => {
        const n     = countMap[r] || 0;
        const canDel= n === 0;
        return `<div class="gt-resp-item">
          <div>
            <div class="gt-resp-item-name">${esc(r)}</div>
            <div class="gt-resp-item-info">${n > 0 ? `${n} tarea${n>1?'s':''} asignada${n>1?'s':''}` : 'Sin tareas asignadas'}</div>
          </div>
          <button class="gt-resp-del" onclick="GT.removeResponsable('${esc(r)}')"
            ${!canDel?'disabled title="Reasigne las tareas antes de eliminar"':'title="Eliminar responsable"'}>✕</button>
        </div>`;
      }).join('') || '<div style="font-size:12px;color:#ccc;padding:8px 0">Sin responsables registrados.</div>';
  }

  function addResponsable() {
    const inp   = document.getElementById('gt-resp-new');
    const errEl = document.getElementById('gt-resp-add-error');
    const name  = inp.value.trim();
    errEl.textContent = '';
    if (!name) { errEl.textContent = 'Ingrese un nombre.'; return; }
    if (responsables.some(r => r.toLowerCase() === name.toLowerCase())) {
      errEl.textContent = 'Ya existe un responsable con ese nombre.'; return;
    }
    responsables.push(name);
    responsables.sort();
    save();
    inp.value = '';
    renderRespList();
  }

  function removeResponsable(name) {
    const n = tasks.filter(t => t.resp === name).length;
    if (n > 0) return; // botón deshabilitado, no debería llegar aquí
    if (!confirm(`¿Eliminar a "${name}" de la lista de responsables?`)) return;
    responsables = responsables.filter(r => r !== name);
    save();
    renderRespList();
  }

  /* ── Eliminar tarea individual (solo admin) ─────────── */
  function deleteTask(id) {
    if (!adminUnlocked) {
      alert('Para eliminar tareas, primero ingrese al panel de administración (🔒 Admin).');
      return;
    }
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    const resumen = `#${t.id} — ${t.tarea}`;
    if (!confirm('¿Eliminar esta tarea?\n\n' + resumen + '\n\nEsta acción no se puede deshacer.')) return;
    tasks = tasks.filter(t => t.id !== id);
    save(); renderAll();
  }

  /* ── Reset / Clear ──────────────────────────────────── */
  function resetTasks() {
    if (!confirm('¿Limpiar todas las tareas?\n\nEl cuadro quedará vacío para ingresar registros nuevos.\nEsta acción no se puede deshacer.')) return;
    if (!confirm('Segunda confirmación: ¿seguro que desea borrar todo el listado?')) return;
    tasks  = [];
    nextId = 200;
    save(); closeAdmin(); renderAll();
  }

  /* ── Cambiar contraseña ─────────────────────────────── */
  function changePass() {
    const n1  = document.getElementById('gt-pass-new').value;
    const n2  = document.getElementById('gt-pass-conf').value;
    const msg = document.getElementById('gt-pass-msg');
    msg.className = 'gt-chpass-msg';
    if (!n1) { msg.textContent = 'Ingrese la nueva contraseña.'; msg.classList.add('gt-chpass-err'); return; }
    if (n1.length < 4) { msg.textContent = 'Mínimo 4 caracteres.'; msg.classList.add('gt-chpass-err'); return; }
    if (n1 !== n2) { msg.textContent = 'Las contraseñas no coinciden.'; msg.classList.add('gt-chpass-err'); return; }
    adminPass = n1;
    save();
    document.getElementById('gt-pass-new').value  = '';
    document.getElementById('gt-pass-conf').value = '';
    msg.textContent = '✓ Contraseña actualizada correctamente.';
    msg.classList.add('gt-chpass-ok');
    setTimeout(() => { msg.textContent = ''; }, 3000);
  }

  /* ── Helpers ────────────────────────────────────────── */
  function show(id) { document.getElementById(id).classList.add('gt-show'); }
  function hide(id) { document.getElementById(id).classList.remove('gt-show'); }
  function esc(s)   { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function today()  { return new Date().toISOString().slice(0,10); }

  /* ── Render all ─────────────────────────────────────── */
  function renderAll() {
    renderKPIs(); renderDonut(); renderBars(); buildRespFilter(); applyFilters();
  }

  // Ajusta el dropdown de filtro "departamento" según el rol:
  // las áreas no-admin solo ven su propio departamento (sin opción de elegir otro).
  function applyRoleToDeptFilter() {
    const sel = document.getElementById('gt-f-dept');
    if (!sel) return;
    if (seesAll()) {
      sel.innerHTML = '<option value="">Todas las áreas</option>' +
        ['Administrativo','Operativo','Contabilidad'].map(d => `<option value="${d}">${d}</option>`).join('');
      sel.disabled = false;
    } else {
      const d = allowedDepts()[0];
      sel.innerHTML = `<option value="${d}">${d}</option>`;
      sel.value = d;
      sel.disabled = true;   // el área no puede cambiar de departamento
    }
  }

  /* ── Init ───────────────────────────────────────────── */
  function init() {
    currentRole  = detectRole();
    adminUnlocked = false;     // cada vez que se entra al Gestor se re-bloquea eliminar
    load();
    applyRoleToDeptFilter();
    renderAll();
    startRealtimeSync();
  }

  return {
    init, applyFilters, clearFilters, cycleStatus,
    openModal, closeModal, closeModalBg, saveTask,
    openPin, closePin, closePinBg, checkPin,
    openAdmin, closeAdmin, closeAdminBg,
    addResponsable, removeResponsable,
    resetTasks, changePass, deleteTask
  };
})();
