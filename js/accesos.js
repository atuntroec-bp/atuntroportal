/* ════════════════════════════════════════════
   HISTORIAL DE ACCESOS — scoped module
   Namespace: ACC | Firebase: atuntro_accesos/<YYYY-MM-DD>/<push>
   Registra cada entrada al portal y cada módulo abierto, con hora del servidor.
   Solo el Master ve el historial (botón 🕒 Accesos). Se guarda 90 días.
   Registro: { u:userId, n:nombre, r:rol, a:'entrada'|'modulo', m?:módulo, ts:hora del servidor }
   Las reglas solo dejan crear registros propios con ts = hora del servidor, y nadie
   salvo el Master puede borrar o modificar.
════════════════════════════════════════════ */
var ACC = (function(){

const FB = 'atuntro_accesos';
const DIAS_GUARDA = 90;
const PAUSA_NUEVA_ENTRADA = 30 * 60 * 1000;   // volver a la app tras 30 min cuenta como nueva entrada
const REPITE_MODULO = 2 * 60 * 1000;          // el mismo módulo dentro de 2 min no se repite
const PANTALLAS = {
  'screen-gestor':'Gestión de Equipo', 'screen-checklist-ops':'Checklist Operacional', 'screen-checklist-adm':'Checklist Administrativo',
  'screen-equipos':'Control de Equipos', 'screen-simulador':'Simulador de Viaje', 'screen-documentos':'Control Documental',
  'screen-boyas':'Control de Boyas', 'screen-proyectos':'Proyectos e Inversiones', 'screen-plano':'Plano de Red',
  'screen-contable':'Dashboard Contable', 'screen-cuadro':'Cuadro de Salida', 'screen-conciliacion':'Conciliación Bancaria'
};
const ROL_TXT = { master:'Gerencia / Master', admin:'Administración', operaciones:'Operaciones', operaciones_master:'Jefe de Operaciones', contabilidad:'Contabilidad' };

let me = null, activo = false, ultimoMod = {}, ocultoDesde = 0, obs = null;
let fecha = hoyISO(), datos = {}, abierto = {};

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function z(n){ return String(n).padStart(2,'0'); }
function isoDe(d){ return d.getFullYear() + '-' + z(d.getMonth()+1) + '-' + z(d.getDate()); }
function hoyISO(){ return isoDe(new Date()); }
function hora(ts){ const d = new Date(ts); return z(d.getHours()) + ':' + z(d.getMinutes()); }
function fLarga(iso){
  const d = new Date(iso + 'T12:00:00');
  const t = d.toLocaleDateString('es-EC', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function db(){ return firebase.database(); }

/* ── Registrar ── */
function registrar(a, m){
  if (!activo || !me) return;
  const reg = { u:me.id, n:me.name, r:me.role, a:a, ts:firebase.database.ServerValue.TIMESTAMP };
  if (m) reg.m = m;
  try { db().ref(FB + '/' + hoyISO()).push(reg).catch(function(){}); } catch(e){}
}
function vigilarPantallas(){
  if (obs) return;
  obs = new MutationObserver(function(muts){
    muts.forEach(function(mu){
      const el = mu.target, nombre = PANTALLAS[el.id];
      if (!nombre || !el.classList.contains('active')) return;
      const ahora = Date.now();
      if (ultimoMod[nombre] && ahora - ultimoMod[nombre] < REPITE_MODULO) return;
      ultimoMod[nombre] = ahora;
      registrar('modulo', nombre);
    });
  });
  Object.keys(PANTALLAS).forEach(function(id){
    const el = document.getElementById(id);
    if (el) obs.observe(el, { attributes:true, attributeFilter:['class'] });
  });
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'hidden') { ocultoDesde = Date.now(); return; }
    if (ocultoDesde && Date.now() - ocultoDesde > PAUSA_NUEVA_ENTRADA) { ultimoMod = {}; registrar('entrada'); }
    ocultoDesde = 0;
  });
}

/* Llamado desde portal.js cuando termina el inicio de sesión. */
function iniciar(realId){
  const u = AUTH.users[realId]; if (!u) return;
  const verComo = !!sessionStorage.getItem('atuntro_view_as');
  const prevId = me ? me.id : null;
  me = { id:realId, name:u.name, role:u.role };
  const btn = document.getElementById('btn-accesos');
  if (btn) btn.style.display = (u.role === 'master' && !verComo) ? 'inline-flex' : 'none';
  if (verComo) { activo = false; return; }   // "Ver como" no deja rastro a nombre de otra persona
  const yaEntro = activo && prevId === realId;
  activo = true;
  vigilarPantallas();
  if (!yaEntro) registrar('entrada');
}

/* ── Panel (solo Master) ── */
function ovl(){
  let o = document.getElementById('acc-ovl');
  if (!o) {
    o = document.createElement('div');
    o.id = 'acc-ovl'; o.className = 'admin-overlay';
    o.innerHTML = '<div class="admin-panel acc-panel"><div class="admin-panel-head"><h3>🕒 Historial de accesos</h3><button class="admin-close" onclick="ACC.cerrar()">×</button></div><div class="admin-panel-body" id="acc-body"></div></div>';
    o.addEventListener('click', e => { if (e.target === o) cerrar(); });
    document.body.appendChild(o);
  }
  return o;
}
function cargar(){
  const body = document.getElementById('acc-body');
  if (body) body.innerHTML = cabecera() + '<p class="acc-vacio">Cargando…</p>';
  db().ref(FB + '/' + fecha).once('value').then(function(s){
    datos = s.val() || {}; pintar();
  }).catch(function(){
    if (body) body.innerHTML = cabecera() + '<p class="acc-vacio">No se pudo leer el historial (sin permiso o sin conexión).</p>';
  });
}
function limpiarViejos(){
  const d = new Date(); d.setDate(d.getDate() - DIAS_GUARDA);
  const corte = isoDe(d);
  db().ref(FB).orderByKey().endAt(corte).once('value').then(function(s){
    const upd = {}; s.forEach(function(c){ if (c.key < corte) upd[c.key] = null; });
    if (Object.keys(upd).length) db().ref(FB).update(upd).catch(function(){});
  }).catch(function(){});
}
function cabecera(){
  const esHoy = fecha === hoyISO();
  return '<div class="acc-nav"><button class="acc-nb" onclick="ACC.dia(-1)" title="Día anterior">‹</button>' +
    '<input type="date" id="acc-fecha" value="' + fecha + '" max="' + hoyISO() + '" onchange="ACC.irA(this.value)">' +
    '<button class="acc-nb" onclick="ACC.dia(1)" ' + (esHoy ? 'disabled' : '') + ' title="Día siguiente">›</button>' +
    (esHoy ? '' : '<button class="acc-hoy" onclick="ACC.irA(\'' + hoyISO() + '\')">Hoy</button>') +
    '<button class="acc-hoy" onclick="ACC.recargar()" title="Actualizar">↻</button></div>' +
    '<div class="acc-fecha-l">' + esc(fLarga(fecha)) + '</div>';
}
function pintar(){
  const body = document.getElementById('acc-body'); if (!body) return;
  const regs = Object.keys(datos).map(k => datos[k]).filter(r => r && r.u && r.ts).sort((a,b) => a.ts - b.ts);
  const por = {};
  regs.forEach(r => { (por[r.u] = por[r.u] || []).push(r); });
  const usuarios = AUTH.users || {};
  const ids = Object.keys(por).sort((a,b) => por[a][0].ts - por[b][0].ts);
  const faltan = Object.keys(usuarios).filter(id => !por[id] && usuarios[id].role !== 'master')
    .sort((a,b) => String(usuarios[a].name).localeCompare(String(usuarios[b].name)));
  let h = cabecera();
  h += '<div class="acc-res"><div><b>' + ids.length + '</b> entraron</div><div class="' + (faltan.length ? 'rojo' : '') + '"><b>' + faltan.length + '</b> no entraron</div><div><b>' + regs.filter(r=>r.a==='entrada').length + '</b> entradas</div></div>';
  if (!ids.length) h += '<p class="acc-vacio">Nadie entró al portal este día.</p>';
  ids.forEach(id => {
    const L = por[id], u = usuarios[id] || {}, ent = L.filter(r => r.a === 'entrada');
    const mods = []; L.forEach(r => { if (r.m && mods.indexOf(r.m) < 0) mods.push(r.m); });
    const ab = !!abierto[id];
    h += '<div class="acc-u"><div class="acc-u-h" onclick="ACC.ver(\'' + esc(id) + '\')">' +
      '<div><div class="acc-n">' + (ab ? '▾ ' : '▸ ') + esc(u.name || L[0].n) + '</div><div class="acc-r">' + esc(ROL_TXT[u.role || L[0].r] || '') + '</div></div>' +
      '<div class="acc-hs"><span>Primera <b>' + hora(L[0].ts) + '</b></span><span>Última <b>' + hora(L[L.length-1].ts) + '</b></span><span><b>' + ent.length + '</b> entrada' + (ent.length===1?'':'s') + '</span></div></div>' +
      '<div class="acc-mods">' + (mods.length ? mods.map(m => '<span class="acc-tag">' + esc(m) + '</span>').join('') : '<span class="acc-sin">Entró pero no abrió ningún módulo</span>') + '</div>';
    if (ab) h += '<ul class="acc-lista">' + L.map(r => '<li><b>' + hora(r.ts) + '</b> ' + (r.a === 'entrada' ? '🔑 Entró al portal' : '📂 Abrió ' + esc(r.m)) + '</li>').join('') + '</ul>';
    h += '</div>';
  });
  if (faltan.length) h += '<div class="acc-falta"><div class="acc-falta-t">No entraron este día</div>' +
    faltan.map(id => '<span class="acc-tag gris">' + esc(usuarios[id].name) + ' · ' + esc(ROL_TXT[usuarios[id].role] || '') + '</span>').join('') + '</div>';
  h += '<p class="acc-nota">Se guardan los últimos ' + DIAS_GUARDA + ' días. La hora es la del servidor, no la del teléfono de cada persona. El modo "Ver como" no queda registrado.</p>';
  body.innerHTML = h;
}
function cerrar(){ const o = document.getElementById('acc-ovl'); if (o) o.classList.remove('show'); }

return {
  iniciar: iniciar,
  abrir(){
    if (!me || me.role !== 'master') return;
    fecha = hoyISO(); abierto = {};
    ovl().classList.add('show');
    cargar(); limpiarViejos();
  },
  cerrar: cerrar,
  recargar: cargar,
  dia(n){ const d = new Date(fecha + 'T12:00:00'); d.setDate(d.getDate() + n); const f = isoDe(d); if (f > hoyISO()) return; fecha = f; abierto = {}; cargar(); },
  irA(f){ if (!f || f > hoyISO()) return; fecha = f; abierto = {}; cargar(); },
  ver(id){ abierto[id] = !abierto[id]; pintar(); }
};
})();
