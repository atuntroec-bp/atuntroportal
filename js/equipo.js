// ════════════════════════════════════════════════════════════
//  EQ — Gestión de Equipo ATUNTRO S.A.
//  Pestañas: Tareas (Gestor GT existente) · Agenda · Reuniones
//  Firebase:
//    atuntro_agenda/eventos/{id}            eventos manuales (zarpes, arribos, otros)
//    atuntro_reuniones/items/{id}           reunión (solo la leen sus convocados)
//    atuntro_reuniones/porUsuario/{pid}/{id} índice de reuniones de cada persona
//  Lee además: atuntro_gestor/data (tareas) y atuntro_documentos/data (vencimientos)
// ════════════════════════════════════════════════════════════
const EQ = (() => {

  const P_EVENTOS  = 'atuntro_agenda/eventos';
  const P_REU      = 'atuntro_reuniones/items';
  const P_REU_IDX  = 'atuntro_reuniones/porUsuario';
  const P_TAREAS   = 'atuntro_gestor/data';
  const P_DOCS     = 'atuntro_documentos/data';
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
    tab = t;
    document.querySelectorAll('.eq-tab').forEach(b => b.classList.toggle('on', b.getAttribute('data-tab') === t));
    document.querySelectorAll('.eq-panel').forEach(p => p.classList.toggle('on', p.id === 'eq-p-' + t));
  }

  function renderAll() { renderAgenda(); renderReus(); }

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

  return { init, showTab, renderReus, limpiarReus,
           abrirEvento, cerrarEvento, cerrarEventoBg, guardarEvento, borrarEvento,
           abrirReunion, cerrarReunion, cerrarReunionBg, guardarReunion, cancelarReunion, contarSel };
})();
