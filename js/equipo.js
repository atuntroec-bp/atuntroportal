// ════════════════════════════════════════════════════════════
//  EQ — Gestión de Equipo ATUNTRO S.A.
//  Pestañas: Tareas (Gestor GT existente) · Agenda · Reuniones · Roles (solo master)
//  Firebase:
//    atuntro_agenda/eventos/{id}            eventos manuales (zarpes, arribos, otros)
//    atuntro_reuniones/items/{id}           reunión (solo la leen sus convocados)
//    atuntro_reuniones/porUsuario/{pid}/{id} índice de reuniones de cada persona
//    atuntro_roles/personas/{pid}           rol permanente de cada persona (solo master por ahora)
//  Lee además: atuntro_gestor/data (tareas) y atuntro_documentos/data (vencimientos)
// ════════════════════════════════════════════════════════════
const EQ = (() => {

  const P_EVENTOS  = 'atuntro_agenda/eventos';
  const P_REU      = 'atuntro_reuniones/items';
  const P_REU_IDX  = 'atuntro_reuniones/porUsuario';
  const P_TAREAS   = 'atuntro_gestor/data';
  const P_DOCS     = 'atuntro_documentos/data';
  const P_ROLES    = 'atuntro_roles/personas';
  const HORIZONTE  = 90;   // días que mira la Agenda hacia adelante
  const PROXIMOS   = 7;    // días de "Próximos"

  const TIPOS = {
    tarea: { lab: 'Tarea',     cls: 'eq-t-tarea' },
    op:    { lab: 'Operación', cls: 'eq-t-op' },
    doc:   { lab: 'Documento', cls: 'eq-t-doc' },
    reu:   { lab: 'Reunión',   cls: 'eq-t-reu' },
    otro:  { lab: 'Otro',      cls: 'eq-t-otro' },
  };
  // Mismo criterio que el Gestor de Tareas: qué departamentos ve cada rol.
  const ROLE_DEPTS = {
    operaciones:        ['Operativo'],
    operaciones_master: ['Operativo'],
    contabilidad:       ['Contabilidad'],
    admin:              ['Administrativo','Operativo','Contabilidad'],
    master:             ['Administrativo','Operativo','Contabilidad'],
  };
  const GRUPOS = [
    { lab: 'Gerencia',          roles: ['master'] },
    { lab: 'Administración',    roles: ['admin'] },
    { lab: 'Operaciones',       roles: ['operaciones_master','operaciones'] },
    { lab: 'Contabilidad',      roles: ['contabilidad'] },
  ];
  // Frecuencia de cada responsabilidad del rol (value fijo, texto visible aparte)
  const FRECS = [
    { v: 'diaria',     lab: 'Diaria',        cls: 'eq-f-diaria' },
    { v: 'semanal',    lab: 'Semanal',       cls: 'eq-f-semanal' },
    { v: 'mensual',    lab: 'Mensual',       cls: 'eq-f-mensual' },
    { v: 'viaje',      lab: 'Por viaje',     cls: 'eq-f-viaje' },
    { v: 'evento',     lab: 'Cuando ocurra', cls: 'eq-f-evento' },
    { v: 'permanente', lab: 'Permanente',    cls: 'eq-f-permanente' },
  ];
  function frec(v) { return FRECS.filter(f => f.v === v)[0] || FRECS[FRECS.length - 1]; }
  const DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  let started = false;
  let tab = 'tareas';
  let eventos = {};          // id → evento
  let tareas = [];           // del Gestor
  let docs = [];             // filas de Control Documental
  let reus = {};             // id → reunión (solo las mías)
  let reuRefs = {};          // id → handler activo
  let reuError = '';
  let roles = {};            // pid → { cargo, mision, items[], actualizado, por }
  let rolesOn = false;       // listener de roles activo
  let rolEdit = null;        // pid que se está editando
  let rolVista = 'org';      // 'org' (organigrama) | 'tarjetas'

  /* ── Utilidades ─────────────────────────────────────── */
  function db() { try { return firebase.database(); } catch (e) { return null; } }
  function esc(x) {
    return String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function sess() { try { return JSON.parse(sessionStorage.getItem('atuntro_session') || 'null'); } catch (e) { return null; } }
  function users() { return (typeof AUTH !== 'undefined' && AUTH.users) ? AUTH.users : {}; }
  function myId() { const s = sess(); return s && s.id ? s.id : null; }
  function myRole() { const u = users()[myId()]; return (u && u.role) || 'admin'; }
  function viendoComo() { return typeof AUTH !== 'undefined' && AUTH.realId && myId() && AUTH.realId !== myId(); }
  function nombre(pid) { const u = users()[pid]; return u ? u.name : pid; }
  function iniciales(n) { return String(n).split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function hoyIso() { return iso(new Date()); }
  function sumarDias(isoStr, n) { const d = new Date(isoStr + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); }
  function diasHasta(isoStr) { return Math.round((new Date(isoStr + 'T12:00:00') - new Date(hoyIso() + 'T12:00:00')) / 86400000); }
  function dmy(isoStr) { const p = String(isoStr).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : isoStr; }
  function $(id) { return document.getElementById(id); }

  /* ── Arranque ───────────────────────────────────────── */
  function init() {
    aplicarVisibilidadRoles();
    showTab('tareas');   // al entrar siempre se abre en Tareas
    if (started) { renderAll(); return; }
    const d = db();
    if (!d) { renderAll(); return; }
    started = true;

    d.ref(P_EVENTOS).on('value', s => { eventos = s.val() || {}; renderAgenda(); },
      () => { eventos = {}; renderAgenda(); });

    d.ref(P_TAREAS).on('value', s => {
      const v = s.val();
      tareas = (v && Array.isArray(v.tasks)) ? v.tasks.filter(Boolean) : [];
      renderAgenda();
    }, () => {});

    d.ref(P_DOCS).on('value', s => {
      const v = s.val();
      docs = (v && Array.isArray(v.rows)) ? v.rows.filter(Boolean) : [];
      renderAgenda();
    }, () => {});

    escucharMisReuniones();
    escucharRoles();
  }

  // Lee el índice de reuniones de la persona y se suscribe a cada una.
  function escucharMisReuniones() {
    const d = db(), pid = myId();
    if (!d || !pid) return;
    if (viendoComo()) { reuError = 'Las reuniones son privadas de cada convocado y no se muestran en modo "Ver como".'; renderReus(); return; }
    d.ref(P_REU_IDX + '/' + pid).on('value', s => {
      const ids = Object.keys(s.val() || {});
      // dejar de escuchar las que ya no están
      Object.keys(reuRefs).forEach(id => {
        if (ids.indexOf(id) < 0) { d.ref(P_REU + '/' + id).off('value', reuRefs[id]); delete reuRefs[id]; delete reus[id]; }
      });
      ids.forEach(id => {
        if (reuRefs[id]) return;
        reuRefs[id] = d.ref(P_REU + '/' + id).on('value', rs => {
          const v = rs.val();
          if (v) reus[id] = Object.assign({ id: id }, v); else delete reus[id];
          renderReus(); renderAgenda();
        }, () => { delete reus[id]; renderReus(); });
      });
      reuError = '';
      renderReus(); renderAgenda();
    }, () => { reuError = 'No se pudieron leer las reuniones (falta publicar las reglas de Firebase de Reuniones).'; renderReus(); });
  }

  /* ── Pestañas ───────────────────────────────────────── */
  function showTab(t) {
    if (t === 'roles' && !esMaster()) t = 'tareas';
    tab = t;
    document.querySelectorAll('.eq-tab').forEach(b => b.classList.toggle('on', b.getAttribute('data-tab') === t));
    document.querySelectorAll('.eq-panel').forEach(p => p.classList.toggle('on', p.id === 'eq-p-' + t));
    if (t === 'roles') centrarOrg();
  }

  function renderAll() { renderAgenda(); renderReus(); renderRoles(); }

  /* ══════════ AGENDA ══════════ */
  function itemsAgenda() {
    const hoy = hoyIso(), fin = sumarDias(hoy, HORIZONTE), out = [];
    const dentro = f => f && f >= hoy && f <= fin;

    Object.keys(eventos).forEach(id => {
      const e = eventos[id];
      if (e && dentro(e.fecha)) out.push({ fecha: e.fecha, txt: e.txt + (e.area ? ' — ' + e.area : ''), tipo: TIPOS[e.tipo] ? e.tipo : 'otro', id: id, borrable: puedeBorrar(e) });
    });

    const depts = ROLE_DEPTS[myRole()] || ROLE_DEPTS.admin;
    tareas.forEach(t => {
      if (t.estado === 'COMPLETO' || depts.indexOf(t.dept) < 0 || !dentro(t.fecha)) return;
      out.push({ fecha: t.fecha, txt: t.tarea, sub: t.resp ? 'Responsable: ' + t.resp : '', tipo: 'tarea' });
    });

    // Control Documental: solo próximos vencimientos (no vencidos, no permanentes)
    const grp = {};
    docs.forEach(r => {
      if (!r.ven || +String(r.ven).slice(0, 4) >= 2090 || !dentro(r.ven)) return;
      const k = String(r.nom || '').toLowerCase() + '|' + r.barco + '|' + r.ven;
      if (grp[k]) grp[k].n++; else grp[k] = { nom: r.nom || 'Documento', barco: r.barco || '', ven: r.ven, n: 1 };
    });
    Object.keys(grp).forEach(k => {
      const g = grp[k], dd = diasHasta(g.ven);
      const nom = g.nom.charAt(0).toUpperCase() + g.nom.slice(1) + (g.n > 1 ? ' (x' + g.n + ')' : '');
      out.push({ fecha: g.ven, txt: 'Vence: ' + nom + (g.barco ? ' — ' + g.barco : ''), sub: (dd <= 30 ? 'Por vencer' : 'Atención') + ' · ' + (dd === 0 ? 'hoy' : dd + ' días'), tipo: 'doc' });
    });

    Object.keys(reus).forEach(id => {
      const r = reus[id];
      if (r && dentro(r.fecha)) out.push({ fecha: r.fecha, txt: r.tema, sub: '📍 ' + (r.lugar || 'Lugar por definir') + ' · ' + (r.hora || ''), tipo: 'reu' });
    });

    return out.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.tipo.localeCompare(b.tipo));
  }

  function filaAgenda(i) {
    const d = new Date(i.fecha + 'T12:00:00');
    return '<div class="eq-ev">' +
      '<div class="eq-ev-fecha"><div class="eq-ev-dow">' + DOW[d.getDay()] + '</div><div class="eq-ev-dia">' + d.getDate() + '</div><div class="eq-ev-mes">' + MES[d.getMonth()] + '</div></div>' +
      '<div class="eq-ev-txt">' + esc(i.txt) + (i.sub ? '<div class="eq-ev-sub">' + esc(i.sub) + '</div>' : '') + '</div>' +
      '<span class="gt-badge ' + TIPOS[i.tipo].cls + '">' + TIPOS[i.tipo].lab + '</span>' +
      (i.borrable ? '<button type="button" class="eq-del" title="Eliminar evento" onclick="EQ.borrarEvento(\'' + esc(i.id) + '\')">✕</button>' : '') +
      '</div>';
  }

  function renderAgenda() {
    const prox = $('eq-ag-prox'), mas = $('eq-ag-mas');
    if (!prox || !mas) return;
    const lim = sumarDias(hoyIso(), PROXIMOS);
    const items = itemsAgenda();
    const a = items.filter(i => i.fecha <= lim), b = items.filter(i => i.fecha > lim);
    prox.innerHTML = a.length ? a.map(filaAgenda).join('') : '<div class="gt-empty">Nada en los próximos 7 días.</div>';
    mas.innerHTML = b.length ? b.map(filaAgenda).join('') : '<div class="gt-empty">Sin eventos más adelante.</div>';
    const c = $('eq-cnt-agenda'); if (c) c.textContent = a.length;
  }

  function puedeBorrar(e) { return e && (e.creadoPor === myId() || myRole() === 'master'); }

  function abrirEvento() {
    $('eq-ev-txt').value = '';
    $('eq-ev-fecha').value = hoyIso();
    $('eq-ev-err').textContent = '';
    $('eq-ev-modal').classList.add('gt-show');
    setTimeout(() => $('eq-ev-txt').focus(), 50);
  }
  function cerrarEvento() { $('eq-ev-modal').classList.remove('gt-show'); }
  function cerrarEventoBg(ev) { if (ev.target === $('eq-ev-modal')) cerrarEvento(); }
  function guardarEvento() {
    const txt = $('eq-ev-txt').value.trim(), fecha = $('eq-ev-fecha').value, err = $('eq-ev-err');
    if (!txt) { err.textContent = 'Escribe la descripción del evento.'; return; }
    if (!fecha) { err.textContent = 'Indica la fecha.'; return; }
    const d = db(); if (!d) { err.textContent = 'Sin conexión con la base de datos.'; return; }
    const ev = { txt: txt, fecha: fecha, tipo: $('eq-ev-tipo').value, area: $('eq-ev-area').value, creadoPor: myId() || '', ts: Date.now() };
    d.ref(P_EVENTOS).push(ev).then(cerrarEvento).catch(() => { err.textContent = 'No se pudo guardar (revisa permisos de Firebase para la Agenda).'; });
  }
  function borrarEvento(id) {
    const e = eventos[id];
    if (!puedeBorrar(e)) return;
    if (!confirm('¿Eliminar el evento "' + (e.txt || '') + '"?')) return;
    const d = db(); if (d) d.ref(P_EVENTOS + '/' + id).remove().catch(() => alert('No se pudo eliminar.'));
  }

  /* ══════════ REUNIONES ══════════ */
  function renderReus() {
    const list = $('eq-reu-list');
    if (!list) return;
    const q = ($('eq-reu-search') || {}).value ? $('eq-reu-search').value.toLowerCase() : '';
    const fe = ($('eq-reu-est') || {}).value || '';
    const hoy = hoyIso();
    const todas = Object.keys(reus).map(id => reus[id]).filter(Boolean).map(r => Object.assign({}, r, { estado: (r.fecha && r.fecha < hoy) ? 'REALIZADA' : 'PROGRAMADA' }));
    const c = $('eq-cnt-reu'); if (c) c.textContent = todas.filter(r => r.estado === 'PROGRAMADA').length;

    if (reuError) { list.innerHTML = '<div class="gt-empty">' + esc(reuError) + '</div>'; return; }
    const vis = todas.filter(r => {
      if (fe && r.estado !== fe) return false;
      if (q && ((r.tema || '') + ' ' + (r.lugar || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'PROGRAMADA' ? -1 : 1;
      return a.estado === 'PROGRAMADA' ? (a.fecha || '').localeCompare(b.fecha || '') : (b.fecha || '').localeCompare(a.fecha || '');
    });
    if (!vis.length) { list.innerHTML = '<div class="gt-empty">' + (todas.length ? 'Sin reuniones que coincidan con los filtros.' : 'No tienes reuniones convocadas.') + '</div>'; return; }

    list.innerHTML = vis.map(r => {
      const done = r.estado === 'REALIZADA';
      const conv = Object.keys(r.conv || {});
      const nombres = conv.map(nombre);
      const avs = nombres.slice(0, 4).map(n => '<span class="eq-av" title="' + esc(n) + '">' + esc(iniciales(n)) + '</span>').join('') +
        (nombres.length > 4 ? '<span class="eq-av mas" title="' + esc(nombres.slice(4).join(', ')) + '">+' + (nombres.length - 4) + '</span>' : '');
      const mia = r.convoca === myId() || myRole() === 'master';
      return '<div class="gt-task-row' + (done ? ' gt-done-row' : '') + '">' +
        '<div class="gt-chk ' + (done ? 'gt-chk-done' : '') + '" title="' + (done ? 'Realizada' : 'Programada') + '"></div>' +
        '<div class="gt-task-num">' + esc(r.hora || '') + '</div>' +
        '<div><div class="gt-task-text">' + esc(r.tema) + '</div>' +
          '<div class="gt-task-obs">📍 ' + esc(r.lugar || 'Lugar por definir') + '</div>' +
          '<div class="gt-task-fecha eq-conv-line" title="' + esc(nombres.join(', ')) + '">Convoca: ' + esc(nombre(r.convoca)) + ' · 🔒 ' + conv.length + ' convocados' +
            (mia && !done ? ' <span class="eq-cancel" onclick="EQ.cancelarReunion(\'' + esc(r.id) + '\')">Cancelar reunión</span>' : '') +
          '</div></div>' +
        '<div class="gt-col-dept gt-resp-cell">' + dmy(r.fecha) + '</div>' +
        '<div class="gt-col-resp"><div class="eq-avs">' + avs + '</div></div>' +
        '<div class="gt-status-cell"><span class="gt-badge eq-st-' + r.estado + '">' + r.estado + '</span></div>' +
        '</div>';
    }).join('');
  }

  function limpiarReus() { $('eq-reu-search').value = ''; $('eq-reu-est').value = ''; renderReus(); }

  function contarSel() {
    const n = document.querySelectorAll('#eq-rm-conv input:checked').length;
    $('eq-rm-cnt').textContent = n + (n === 1 ? ' seleccionado' : ' seleccionados');
  }
  function abrirReunion() {
    if (viendoComo()) { alert('En modo "Ver como" no se pueden convocar reuniones.'); return; }
    const yo = myId(), us = users();
    $('eq-rm-tema').value = ''; $('eq-rm-lugar').value = '';
    $('eq-rm-fecha').value = hoyIso(); $('eq-rm-hora').value = '09:00';
    $('eq-rm-err').textContent = '';
    $('eq-rm-conv').innerHTML = GRUPOS.map(g => {
      const ids = Object.keys(us).filter(id => us[id] && g.roles.indexOf(us[id].role) >= 0)
        .sort((a, b) => String(us[a].name).localeCompare(String(us[b].name)));
      if (!ids.length) return '';
      return '<div class="eq-grp">' + g.lab + '</div>' + ids.map(id => {
        const soy = id === yo;
        return '<label class="eq-pers"><input type="checkbox" value="' + esc(id) + '"' + (soy ? ' checked disabled' : '') + ' onchange="EQ.contarSel()"> ' +
          esc(us[id].name) + (soy ? ' <span class="eq-yo">(tú)</span>' : '') + '</label>';
      }).join('');
    }).join('');
    contarSel();
    $('eq-rm-modal').classList.add('gt-show');
    setTimeout(() => $('eq-rm-tema').focus(), 50);
  }
  function cerrarReunion() { $('eq-rm-modal').classList.remove('gt-show'); }
  function cerrarReunionBg(ev) { if (ev.target === $('eq-rm-modal')) cerrarReunion(); }
  function guardarReunion() {
    const err = $('eq-rm-err');
    const tema = $('eq-rm-tema').value.trim(), lugar = $('eq-rm-lugar').value.trim();
    const fecha = $('eq-rm-fecha').value, hora = $('eq-rm-hora').value;
    const yo = myId();
    const conv = Array.prototype.map.call(document.querySelectorAll('#eq-rm-conv input:checked'), c => c.value);
    if (!tema) { err.textContent = 'Escribe el tema de la reunión.'; return; }
    if (!fecha) { err.textContent = 'Indica la fecha.'; return; }
    if (!lugar) { err.textContent = 'Indica el lugar de la reunión.'; return; }
    if (conv.length < 2) { err.textContent = 'Marca al menos a una persona más.'; return; }
    const d = db(); if (!d || !yo) { err.textContent = 'Sin conexión con la base de datos.'; return; }
    const id = d.ref(P_REU).push().key;
    const convObj = {}; conv.forEach(p => { convObj[p] = true; });
    const upd = {};
    upd[P_REU + '/' + id] = { tema: tema, fecha: fecha, hora: hora || '', lugar: lugar, convoca: yo, conv: convObj, ts: Date.now() };
    conv.forEach(p => { upd[P_REU_IDX + '/' + p + '/' + id] = true; });
    d.ref().update(upd).then(cerrarReunion).catch(() => { err.textContent = 'No se pudo guardar (falta publicar las reglas de Firebase de Reuniones).'; });
  }
  function cancelarReunion(id) {
    const r = reus[id];
    if (!r || !(r.convoca === myId() || myRole() === 'master')) return;
    if (!confirm('¿Cancelar la reunión "' + (r.tema || '') + '"? Desaparecerá para todos los convocados.')) return;
    const d = db(); if (!d) return;
    const upd = {};
    Object.keys(r.conv || {}).forEach(p => { upd[P_REU_IDX + '/' + p + '/' + id] = null; });
    upd[P_REU + '/' + id] = null;
    d.ref().update(upd).catch(() => alert('No se pudo cancelar.'));
  }


  /* ══════════ ROLES (solo master, por ahora) ══════════ */
  // Cuenta real del dueño (no la persona simulada en "Ver como").
  function esMaster() {
    if (typeof AUTH === 'undefined' || !AUTH.realId || viendoComo()) return false;
    const u = users()[AUTH.realId];
    return !!(u && u.role === 'master');
  }
  function aplicarVisibilidadRoles() {
    const b = document.querySelector('.eq-tab[data-tab="roles"]');
    if (b) b.style.display = esMaster() ? '' : 'none';
    if (!esMaster() && tab === 'roles') showTab('tareas');
    escucharRoles();
  }
  function escucharRoles() {
    const d = db();
    if (!d || rolesOn || !esMaster()) return;
    rolesOn = true;
    d.ref(P_ROLES).on('value', s => { roles = s.val() || {}; renderRoles(); },
      () => { rolesOn = false; roles = {}; renderRoles('No se pudieron leer los roles (falta publicar la regla de Firebase de atuntro_roles).'); });
  }
  // Solo para la vista de Roles: área en la que aparece cada persona y quién va
  // primero dentro de su área. NO cambia permisos ni el rol de acceso al portal.
  const AREA_ROL = { ricardo_baida_d: 'Gerencia', ricardo_baida_t: 'Administración' };
  const PRIMERO_ROL = ['romulo_perez', 'ricardo_mendoza'];
  function grupoDe(pid) {
    if (AREA_ROL[pid]) return AREA_ROL[pid];
    const r = (users()[pid] || {}).role;
    const g = GRUPOS.filter(x => x.roles.indexOf(r) >= 0)[0];
    return g ? g.lab : 'Otros';
  }
  function personasOrdenadas() {
    const us = users(), orden = GRUPOS.map(g => g.lab).concat(['Otros']);
    const prio = id => { const i = PRIMERO_ROL.indexOf(id); return i < 0 ? 99 : i; };
    return Object.keys(us).filter(id => us[id]).sort((a, b) =>
      (orden.indexOf(grupoDe(a)) - orden.indexOf(grupoDe(b))) || (prio(a) - prio(b)) ||
      String(us[a].name).localeCompare(String(us[b].name)));
  }
  function itemsDe(pid) { const r = roles[pid]; return (r && Array.isArray(r.items)) ? r.items.filter(i => i && i.txt) : []; }

  // ── Línea de reporte (quién reporta a quién) ──
  function jefeDe(pid) { const j = (roles[pid] || {}).reportaA; return (j && j !== pid && users()[j]) ? j : ''; }
  function subordinados(pid) { return personasOrdenadas().filter(id => jefeDe(id) === pid); }
  function debajoDe(pid) {   // todos los que están por debajo (para evitar ciclos)
    const out = {}, cola = [pid];
    while (cola.length) subordinados(cola.shift()).forEach(id => { if (!out[id]) { out[id] = 1; cola.push(id); } });
    return out;
  }
  // En celular el organigrama es más ancho que la pantalla: abrirlo centrado en la cabeza.
  function centrarOrg() {
    requestAnimationFrame(() => {
      const sc = document.querySelector('#eq-rol-list .eq-org-scroll');
      if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
    });
  }
  function vistaRoles(v) {
    rolVista = v === 'tarjetas' ? 'tarjetas' : 'org';
    document.querySelectorAll('.eq-rol-vbtn').forEach(b => b.classList.toggle('on', b.getAttribute('data-v') === rolVista));
    renderRoles();
  }
  function nodoOrg(pid, visto) {
    visto[pid] = 1;
    const r = roles[pid] || {}, hijos = subordinados(pid).filter(id => !visto[id]);
    return '<li><div class="eq-org-node" onclick="EQ.abrirRol(\'' + esc(pid) + '\')" title="Editar rol">' +
      '<span class="eq-av eq-rol-av">' + esc(iniciales(nombre(pid))) + '</span>' +
      '<div class="eq-org-name">' + esc(nombre(pid)) + '</div>' +
      '<div class="eq-rol-cargo">' + esc(r.cargo || 'Cargo por definir') + '</div>' +
      '<div class="eq-org-meta">' + esc(grupoDe(pid)) + ' · ' + itemsDe(pid).length + ' resp.</div></div>' +
      (hijos.length ? '<ul>' + hijos.map(h => nodoOrg(h, visto)).join('') + '</ul>' : '') + '</li>';
  }
  function renderOrg() {
    const pers = personasOrdenadas(), visto = {};
    const raices = pers.filter(id => !jefeDe(id) && subordinados(id).length);
    const sueltos = pers.filter(id => !jefeDe(id) && !subordinados(id).length);
    let html = '<div class="gt-card eq-org-card">';
    if (raices.length) {
      html += '<div class="eq-org-scroll"><div class="eq-org"><ul>' + raices.map(id => nodoOrg(id, visto)).join('') + '</ul></div></div>';
    } else {
      html += '<div class="gt-empty">Todavía no hay líneas de reporte. Abre a cada persona (✎) y elige a quién reporta.</div>';
    }
    html += '</div>';
    if (sueltos.length) {
      html += '<div class="gt-card eq-org-card"><div class="gt-card-title">Sin línea de reporte definida</div><div class="eq-org-sueltos">' +
        sueltos.map(id => '<button type="button" class="eq-org-chip" onclick="EQ.abrirRol(\'' + esc(id) + '\')">' +
          '<span class="eq-av">' + esc(iniciales(nombre(id))) + '</span>' + esc(nombre(id)) + '</button>').join('') + '</div></div>';
    }
    return html;
  }

  function renderRoles(msgError) {
    const cont = $('eq-rol-list');
    if (!cont) return;
    const c = $('eq-cnt-roles');
    const pers = personasOrdenadas();
    const conRol = pers.filter(p => itemsDe(p).length);
    let total = 0, sinResp = 0;
    pers.forEach(p => itemsDe(p).forEach(i => { total++; if (!i.resp) sinResp++; }));
    if (c) c.textContent = conRol.length + '/' + pers.length;
    const k = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    k('eq-rk-pers', pers.length); k('eq-rk-def', conRol.length);
    k('eq-rk-def-sub', pers.length ? Math.round(conRol.length * 100 / pers.length) + '% del equipo' : '—');
    k('eq-rk-tot', total); k('eq-rk-sin', sinResp);
    if (msgError) { cont.innerHTML = '<div class="gt-empty">' + esc(msgError) + '</div>'; return; }
    const filtros = $('eq-rol-filtros');
    if (filtros) filtros.style.display = rolVista === 'org' ? 'none' : '';
    cont.classList.toggle('eq-rol-grid', rolVista !== 'org');
    if (rolVista === 'org') {
      cont.innerHTML = renderOrg();
      centrarOrg();
      return;
    }

    const q = (($('eq-rol-search') || {}).value || '').toLowerCase().trim();
    const fa = ($('eq-rol-area') || {}).value || '';
    const ff = ($('eq-rol-frec') || {}).value || '';
    let html = '', ultimoGrupo = '', visibles = 0;
    const porGrupo = {};
    pers.forEach(id => { const g = grupoDe(id); porGrupo[g] = (porGrupo[g] || 0) + 1; });
    pers.forEach(pid => {
      const u = users()[pid], r = roles[pid] || {}, g = grupoDe(pid);
      if (fa && g !== fa) return;
      let items = itemsDe(pid);
      if (ff) items = items.filter(i => i.frec === ff);
      const textoPersona = (u.name + ' ' + (r.cargo || '') + ' ' + (r.mision || '')).toLowerCase();
      if (q && textoPersona.indexOf(q) < 0) items = items.filter(i => (i.txt + ' ' + nombre(i.resp || '')).toLowerCase().indexOf(q) >= 0);
      if ((ff || q) && !items.length && !(q && !ff && textoPersona.indexOf(q) >= 0)) return;
      visibles++;
      if (g !== ultimoGrupo) { html += '<div class="eq-rol-grp">' + esc(g) + '</div>'; ultimoGrupo = g; }
      const lista = items.length ? '<ol class="eq-rol-items">' + items.map(i =>
          '<li><div class="eq-rol-it-txt">' + esc(i.txt) +
          (i.resp ? '<div class="eq-ev-sub">Respaldo: ' + esc(nombre(i.resp)) + '</div>' : '<div class="eq-ev-sub eq-rol-sinresp">Sin respaldo</div>') +
          '</div><span class="gt-badge ' + frec(i.frec).cls + '">' + frec(i.frec).lab + '</span></li>').join('') + '</ol>'
        : '<div class="gt-empty eq-rol-vacio">Sin responsabilidades definidas todavía.</div>';
      html += '<div class="gt-card eq-rol-card' + ((PRIMERO_ROL.indexOf(pid) >= 0 || porGrupo[g] === 1) ? ' eq-rol-lider' : '') + '">' +
        '<div class="eq-rol-head"><span class="eq-av eq-rol-av">' + esc(iniciales(u.name)) + '</span>' +
          '<div class="eq-rol-who"><div class="eq-rol-name">' + esc(u.name) + '</div>' +
          '<div class="eq-rol-cargo">' + esc(r.cargo || 'Cargo por definir') + '</div></div>' +
          '<button type="button" class="eq-rol-edit" onclick="EQ.abrirRol(\'' + esc(pid) + '\')">✎ Editar</button></div>' +
        '<div class="eq-ev-sub eq-rol-rep">⬆ Reporta a: <b>' + esc(jefeDe(pid) ? nombre(jefeDe(pid)) : '—') + '</b>' +
          (subordinados(pid).length ? ' · ⬇ A cargo: ' + esc(subordinados(pid).map(nombre).join(', ')) : '') + '</div>' +
        (r.mision ? '<div class="eq-rol-mision">' + esc(r.mision) + '</div>' : '') +
        lista +
        (r.actualizado ? '<div class="eq-nota">Actualizado ' + dmy(iso(new Date(r.actualizado))) + (r.por ? ' por ' + esc(nombre(r.por)) : '') + '</div>' : '') +
        '</div>';
    });
    cont.innerHTML = visibles ? html : '<div class="gt-empty">Sin personas que coincidan con los filtros.</div>';
  }
  function limpiarRoles() { $('eq-rol-search').value = ''; $('eq-rol-area').value = ''; $('eq-rol-frec').value = ''; renderRoles(); }

  // ── Modal de edición del rol de una persona ──
  function opcionesFrec(sel) { return FRECS.map(f => '<option value="' + f.v + '"' + (f.v === sel ? ' selected' : '') + '>' + f.lab + '</option>').join(''); }
  function opcionesResp(pid, sel) {
    return '<option value="">— Sin respaldo —</option>' + personasOrdenadas().filter(id => id !== pid)
      .map(id => '<option value="' + esc(id) + '"' + (id === sel ? ' selected' : '') + '>' + esc(nombre(id)) + '</option>').join('');
  }
  function filaItem(i) {
    return '<div class="eq-rol-row">' +
      '<input type="text" class="eq-ri-txt" placeholder="Ej.: Revisar y aprobar pedidos de zarpe" value="' + esc(i.txt || '') + '">' +
      '<select class="eq-ri-frec">' + opcionesFrec(i.frec || 'permanente') + '</select>' +
      '<select class="eq-ri-resp">' + opcionesResp(rolEdit, i.resp || '') + '</select>' +
      '<div class="eq-rol-row-btns"><button type="button" title="Subir" onclick="EQ.moverItem(this,-1)">▲</button>' +
      '<button type="button" title="Bajar" onclick="EQ.moverItem(this,1)">▼</button>' +
      '<button type="button" class="eq-del" title="Quitar" onclick="EQ.quitarItem(this)">✕</button></div>' +
      '</div>';
  }
  function abrirRol(pid) {
    if (!esMaster() || !users()[pid]) return;
    rolEdit = pid;
    const r = roles[pid] || {};
    $('eq-ro-title').textContent = '🧭 Rol de ' + nombre(pid);
    $('eq-ro-cargo').value = r.cargo || '';
    $('eq-ro-mision').value = r.mision || '';
    const bloqueados = debajoDe(pid), jefe = jefeDe(pid);
    $('eq-ro-jefe').innerHTML = '<option value="">— Nadie (cabeza del organigrama) —</option>' +
      personasOrdenadas().filter(id => id !== pid && !bloqueados[id])
        .map(id => '<option value="' + esc(id) + '"' + (id === jefe ? ' selected' : '') + '>' + esc(nombre(id)) + ' · ' + esc(grupoDe(id)) + '</option>').join('');
    const its = itemsDe(pid);
    $('eq-ro-items').innerHTML = (its.length ? its : [{}]).map(filaItem).join('');
    $('eq-ro-err').textContent = '';
    $('eq-ro-modal').classList.add('gt-show');
    setTimeout(() => $('eq-ro-cargo').focus(), 50);
  }
  function agregarItem() {
    const box = $('eq-ro-items');
    box.insertAdjacentHTML('beforeend', filaItem({}));
    const ins = box.querySelectorAll('.eq-ri-txt'); ins[ins.length - 1].focus();
  }
  function quitarItem(btn) { const f = btn.closest('.eq-rol-row'); if (f) f.remove(); }
  function moverItem(btn, dir) {
    const f = btn.closest('.eq-rol-row'); if (!f) return;
    const o = dir < 0 ? f.previousElementSibling : f.nextElementSibling;
    if (!o) return;
    if (dir < 0) f.parentNode.insertBefore(f, o); else f.parentNode.insertBefore(o, f);
  }
  function cerrarRol() { $('eq-ro-modal').classList.remove('gt-show'); rolEdit = null; }
  function cerrarRolBg(ev) { if (ev.target === $('eq-ro-modal')) cerrarRol(); }
  function guardarRol() {
    const err = $('eq-ro-err'), pid = rolEdit;
    if (!pid || !esMaster()) return;
    const items = Array.prototype.map.call(document.querySelectorAll('#eq-ro-items .eq-rol-row'), f => ({
      txt: f.querySelector('.eq-ri-txt').value.trim(),
      frec: f.querySelector('.eq-ri-frec').value,
      resp: f.querySelector('.eq-ri-resp').value,
    })).filter(i => i.txt);
    const cargo = $('eq-ro-cargo').value.trim(), mision = $('eq-ro-mision').value.trim();
    const reportaA = $('eq-ro-jefe').value;
    if (reportaA && debajoDe(pid)[reportaA]) { err.textContent = 'Esa persona ya reporta (directa o indirectamente) a ' + nombre(pid) + '.'; return; }
    const d = db(); if (!d) { err.textContent = 'Sin conexión con la base de datos.'; return; }
    const ref = d.ref(P_ROLES + '/' + pid);
    const op = (!cargo && !mision && !items.length && !reportaA) ? ref.remove()
      : ref.set({ cargo: cargo, mision: mision, reportaA: reportaA, items: items, actualizado: Date.now(), por: myId() || '' });
    op.then(cerrarRol).catch(() => { err.textContent = 'No se pudo guardar (falta publicar la regla de Firebase de atuntro_roles).'; });
  }

  return { init, showTab, renderReus, limpiarReus,
           renderRoles, limpiarRoles, vistaRoles, abrirRol, agregarItem, quitarItem, moverItem, cerrarRol, cerrarRolBg, guardarRol,
           abrirEvento, cerrarEvento, cerrarEventoBg, guardarEvento, borrarEvento,
           abrirReunion, cerrarReunion, cerrarReunionBg, guardarReunion, cancelarReunion, contarSel };
})();
