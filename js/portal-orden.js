/* ════════════════════════════════════════════
   ORDEN DEL PORTAL — scoped module
   Namespace: PORD | Firebase: atuntro_portal_orden/<rol>
   Permite a Administración y Master ordenar las secciones y
   tarjetas del portal principal, por separado para cada rol.
   Estructura: { secciones:['ops','equipo','fin'], tarjetas:{ ops:[ids], equipo:[ids], fin:[ids] } }
════════════════════════════════════════════ */
var PORD = (function(){

const FB = 'atuntro_portal_orden';
const SECS = ['ops','equipo','fin'];
const SEC_MOD = { ops:'ops', equipo:'gestor_modules', fin:'fin' };
const ROLES = [
  ['admin','Administración'],
  ['operaciones','Operaciones'],
  ['operaciones_master','Jefe de Operaciones'],
  ['contabilidad','Contabilidad'],
  ['master','Gerencia / Master']
];
let ORDEN = {}, iniciado = false, rolActual = '', draft = null, rolEdit = 'admin';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function secNombre(k, rol){ return k === 'ops' ? 'Operaciones' : k === 'equipo' ? 'Gestión de Equipo' : (rol === 'contabilidad' ? 'Herramientas' : 'Finanzas y Rentabilidad'); }
function deRol(rol){ return ORDEN[rol] || (rol === 'operaciones_master' ? ORDEN.operaciones : null) || {}; }
function ordenar(list, ids){
  if (!ids || !ids.length) return list.slice();
  const pos = {}; ids.forEach((id,i)=>{ pos[id] = i; });
  return list.map((m,i)=>({m:m,i:i})).sort((a,b)=>{
    const pa = pos[a.m.id], pb = pos[b.m.id];
    if (pa == null && pb == null) return a.i - b.i;
    if (pa == null) return 1; if (pb == null) return -1;
    return pa - pb;
  }).map(x=>x.m);
}
function seccionesDe(rol){
  const s = (deRol(rol).secciones || []).filter(k => SECS.indexOf(k) > -1);
  SECS.forEach(k => { if (s.indexOf(k) < 0) s.push(k); });
  return s;
}
function modulos(sec, rol){
  const list = (MODULES[SEC_MOD[sec]] || []).filter(m => m.roles.indexOf(rol) > -1);
  return ordenar(list, (deRol(rol).tarjetas || {})[sec]);
}

/* Firebase: escucha el orden y vuelve a dibujar el portal si cambia. */
function init(){
  if (iniciado) return;
  iniciado = true;
  try {
    firebase.database().ref(FB).on('value', function(snap){
      ORDEN = snap.val() || {};
      const d = document.getElementById('screen-dashboard');
      if (d && d.classList.contains('active') && rolActual && typeof renderDashboard === 'function') renderDashboard(rolActual);
    }, function(){ iniciado = false; });
  } catch(e){ iniciado = false; }
}

/* Usado por renderDashboard en portal.js */
function aplicarSecciones(rol){
  rolActual = rol;
  init();
  const footer = document.querySelector('#screen-dashboard .dash-footer');
  if (!footer) return;
  let primero = true;
  seccionesDe(rol).forEach(k => {
    const el = document.getElementById('section-' + (k === 'equipo' ? 'equipo' : k));
    if (!el) return;
    footer.parentNode.insertBefore(el, footer);
    const lbl = el.querySelector('.section-label');
    if (lbl && el.style.display !== 'none') { lbl.style.marginTop = primero ? '0' : '32px'; primero = false; }
  });
}

/* ── Ventana para ordenar ── */
function ovl(){
  let o = document.getElementById('pord-ovl');
  if (!o) {
    o = document.createElement('div');
    o.id = 'pord-ovl'; o.className = 'admin-overlay';
    o.innerHTML = '<div class="admin-panel"><div class="admin-panel-head"><h3>↕ Ordenar portal</h3><button class="admin-close" onclick="PORD.cerrar()">×</button></div><div class="admin-panel-body" id="pord-body"></div></div>';
    o.addEventListener('click', e => { if (e.target === o) cerrar(); });
    document.body.appendChild(o);
  }
  return o;
}
function armarDraft(rol){
  const t = {};
  SECS.forEach(k => { t[k] = modulos(k, rol).map(m => m.id); });
  draft = { secciones: seccionesDe(rol), tarjetas: t };
}
function pintar(){
  const rol = rolEdit;
  let h = '<div class="pord-top"><label>Así lo ve:</label><select id="pord-rol" onchange="PORD.rol(this.value)">' +
    ROLES.map(r => '<option value="'+r[0]+'"'+(r[0]===rol?' selected':'')+'>'+r[1]+'</option>').join('') + '</select></div>' +
    '<p class="pord-ayuda">Mueve las secciones y las tarjetas con las flechas. Cada rol solo ve sus propias tarjetas.' +
    (rol === 'operaciones_master' && !ORDEN.operaciones_master ? ' Este rol usa el orden de Operaciones hasta que lo guardes.' : '') + '</p>';
  const visibles = draft.secciones.filter(k => draft.tarjetas[k].length);
  visibles.forEach((k, i) => {
    h += '<div class="pord-sec"><div class="pord-sec-h"><span>' + esc(secNombre(k, rol)) + '</span><span class="pord-btns">' +
      '<button ' + (i===0?'disabled':'') + ' onclick="PORD.moverSec(\''+k+'\',-1)" title="Subir sección">↑</button>' +
      '<button ' + (i===visibles.length-1?'disabled':'') + ' onclick="PORD.moverSec(\''+k+'\',1)" title="Bajar sección">↓</button></span></div>';
    const ids = draft.tarjetas[k];
    ids.forEach((id, j) => {
      const m = (MODULES[SEC_MOD[k]] || []).find(x => x.id === id) || { title:id, icon:'' };
      h += '<div class="pord-card"><span>' + (m.icon||'') + ' ' + esc(m.title) + (m.status !== 'active' ? ' <em>(próximamente)</em>' : '') + '</span><span class="pord-btns">' +
        '<button ' + (j===0?'disabled':'') + ' onclick="PORD.moverCard(\''+k+'\','+j+',-1)" title="Subir">↑</button>' +
        '<button ' + (j===ids.length-1?'disabled':'') + ' onclick="PORD.moverCard(\''+k+'\','+j+',1)" title="Bajar">↓</button></span></div>';
    });
    h += '</div>';
  });
  if (!visibles.length) h += '<p class="pord-ayuda">Este rol no tiene tarjetas.</p>';
  h += '<div class="pord-foot"><button class="pord-b sec" onclick="PORD.restablecer()">Restablecer original</button><span style="flex:1"></span>' +
    '<button class="pord-b sec" onclick="PORD.cerrar()">Cancelar</button><button class="pord-b" onclick="PORD.guardar()">Guardar</button></div>';
  document.getElementById('pord-body').innerHTML = h;
}
function abrir(){
  init();
  rolEdit = rolActual && ROLES.some(r=>r[0]===rolActual) ? rolActual : 'admin';
  armarDraft(rolEdit);
  ovl().classList.add('show');
  pintar();
}
function cerrar(){ const o = document.getElementById('pord-ovl'); if (o) o.classList.remove('show'); }
function aviso(msg, err){
  const t = document.createElement('div'); t.className = 'pord-toast' + (err ? ' err' : ''); t.textContent = msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), err ? 4000 : 2200);
}

return {
  aplicarSecciones: aplicarSecciones,
  modulos: modulos,
  abrir: abrir,
  cerrar: cerrar,
  rol(r){ rolEdit = r; armarDraft(r); pintar(); },
  moverSec(k, dir){
    const vis = draft.secciones.filter(x => draft.tarjetas[x].length);
    const i = vis.indexOf(k), j = i + dir; if (j < 0 || j >= vis.length) return;
    const a = draft.secciones.indexOf(vis[i]), b = draft.secciones.indexOf(vis[j]);
    const tmp = draft.secciones[a]; draft.secciones[a] = draft.secciones[b]; draft.secciones[b] = tmp;
    pintar();
  },
  moverCard(k, i, dir){
    const L = draft.tarjetas[k], j = i + dir; if (j < 0 || j >= L.length) return;
    const tmp = L[i]; L[i] = L[j]; L[j] = tmp; pintar();
  },
  guardar(){
    const rol = rolEdit;
    firebase.database().ref(FB + '/' + rol).set(draft)
      .then(()=>{ aviso('Orden guardado para ' + ROLES.find(r=>r[0]===rol)[1]); cerrar(); })
      .catch(()=>aviso('No se pudo guardar: sin permiso o sin conexión', true));
  },
  restablecer(){
    const rol = rolEdit;
    firebase.database().ref(FB + '/' + rol).remove()
      .then(()=>{ delete ORDEN[rol]; armarDraft(rol); pintar(); aviso('Orden original restablecido'); })
      .catch(()=>aviso('No se pudo restablecer: sin permiso o sin conexión', true));
  }
};
})();
