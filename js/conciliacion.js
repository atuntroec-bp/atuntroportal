/* ════════════════════════════════════════════
   CONCILIACIÓN — scoped module
   Namespace: CONC | Firebase: conciliacion_v1
   Conciliación bancaria / flujo de caja de ATUNTRO:
   disponible en bancos, pagos y cobros con saldos encadenados,
   préstamos, precio de combustible y cortes guardados.
   Acceso: solo Administración y Master (ver reglas de Firebase).
   No guarda caché en el navegador (información financiera).
════════════════════════════════════════════ */
var CONC = (function() {

const FB = 'conciliacion_v1';
const IVA = 0.15;

/* ── permisos (la protección real está en las reglas de Firebase) ── */
const P = {
  ver:         r => ['admin','master'].includes(r),
  editar:      r => ['admin','master'].includes(r),
  borrarCorte: r => r === 'master'
};

/* Secciones en el orden del Excel. pago:true → columnas Fecha y Pagado. */
const SECS = [
  { k:'bancos',     c:'#2E75B6', t:'Efectivo y bancos',                 hint:'Saldo disponible en libros por cuenta' },
  { k:'cheques',    c:'#8E44AD', t:'Cheques girados y no cobrados',     hint:'Ingresa en negativo', pago:true },
  { k:'recibir',    c:'#1D9E75', t:'Valores por recibir',               hint:'Ingresa en positivo', pago:true },
  { k:'inmediato',  c:'#E8A33D', t:'Pagos a realizar inmediato',        hint:'Ingresa en negativo', pago:true },
  { k:'cxc',        c:'#2E8B57', t:'Cuentas por cobrar',                hint:'Ingresa en positivo', pago:true },
  { k:'mensual',    c:'#3F51B5', t:'Pagos a realizar mensual',          hint:'Pagos en negativo · ingresos esperados en positivo', pago:true },
  { k:'descargas',  c:'#00838F', t:'Por recibir de descargas',          hint:'Ingresa en positivo', pago:true, periodo:true },
  { k:'salida',     c:'#A0522D', t:'Pagos para salida',                 hint:'Ingresa en negativo', pago:true },
  { k:'proyeccion', c:'#546E7A', t:'Proyección: entrada MG y pagos sin compensación', hint:'Ajustes de la proyección (+ / −)', pago:true }
];
/* Saldos encadenados: aparecen debajo de la sección indicada. */
const SALDOS = [
  { after:'bancos',     k:'disp', t:'Total disponible',                                 f:T => T.bancos, oculto:true },
  { after:'cheques',    k:'s1',   t:'Saldo después de cheques girados y no cobrados',   f:T => T.disp + T.cheques },
  { after:'inmediato',  k:'s2',   t:'Saldo después de pagos',                           f:T => T.s1 + T.recibir + T.inmediato },
  { after:'cxc',        k:'s3',   t:'Saldo después de cuentas por cobrar y pagos',      f:T => T.s2 + T.cxc },
  { after:'mensual',    k:'s4',   t:'Luego de pagos mensuales',                         f:T => T.s3 + T.mensual },
  { after:'salida',     k:'s5',   t:'Saldo aproximado luego de pagos y salida del barco', f:T => T.s4 + T.descargas + T.salida, fuerte:true },
  { after:'proyeccion', k:'s6',   t:'Proyección final',                                 f:T => T.s5 + T.proyeccion, fuerte:true }
];

let user = null;
let st = { tab:'conc', corte:null, open:{} };
let DATA = vacio();
let db = null, fbReady = false, inited = false, pendingRender = false, cargado = false;
const timers = {};

/* ── helpers ── */
const role = () => user ? user.role : '';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => (Number(n) < 0 ? '−$' : '$') + Math.abs(Number(n)||0).toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2});
const num = n => (Number(n)||0).toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:4});
const nid = p => (p||'r') + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const r2 = n => Math.round((Number(n)||0)*100)/100;
function hoyISO(){ const d=new Date(), z=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }
function ahora(){ const d=new Date(), z=n=>String(n).padStart(2,'0'); return hoyISO()+' '+z(d.getHours())+':'+z(d.getMinutes()); }
function fFecha(iso){ if(!iso) return '—'; const p=String(iso).slice(0,10).split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : iso; }
function firma(){ return { u:user.name, k:user.key, f:ahora() }; }
function dias(iso){ if(!iso) return null; const a=new Date(hoyISO()+'T00:00:00'), b=new Date(String(iso).slice(0,10)+'T00:00:00'); return Math.round((b-a)/864e5); }
function vacio(){ return { actual:{ secs:{}, upd:null }, prestamos:{}, combustible:{}, cortes:{} }; }
function normalizar(v){
  v = v || {};
  const a = v.actual || {};
  return { actual:{ secs:a.secs||{}, upd:a.upd||null }, prestamos:v.prestamos||{}, combustible:v.combustible||{}, cortes:v.cortes||{} };
}
function lista(obj){ return Object.keys(obj||{}).map(id => Object.assign({id:id}, obj[id])).sort((a,b)=>(a.ord||0)-(b.ord||0)); }
function filas(D, k){ return lista(((D.actual.secs||{})[k]||{}).rows); }
function editable(){ return !st.corte && P.editar(role()); }
function vista(){ return st.corte && DATA.cortes[st.corte] ? normalizar(DATA.cortes[st.corte].data) : DATA; }

/* Montos: acepta número o una operación simple (ej. 28960.49-25000-2848). */
function parseMonto(txt, dec){
  const rd = n => { const m = Math.pow(10, dec||2); return Math.round((Number(n)||0)*m)/m; };
  let s = String(txt == null ? '' : txt).trim().replace(/^=/,'').replace(/\$/g,'').replace(/\s/g,'');
  if (s === '') return { monto:0, expr:'' };
  if (/^[-+]?[\d.,]+$/.test(s)) {
    if (s.indexOf(',')>-1 && s.indexOf('.')>-1) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g,'').replace(',', '.') : s.replace(/,/g,'');
    else if (s.indexOf(',')>-1) s = /,\d{1,2}$/.test(s) && (s.match(/,/g)||[]).length===1 ? s.replace(',', '.') : s.replace(/,/g,'');
    const n = Number(s); return isFinite(n) ? { monto:rd(n), expr:'' } : null;
  }
  s = s.replace(/,/g,'');
  if (!/^[-+*/().\d]+$/.test(s)) return null;
  try { const n = Function('"use strict";return (' + s + ')')(); return isFinite(n) ? { monto:rd(n), expr:s } : null; } catch(e){ return null; }
}

/* ── cálculos ── */
function totales(D){
  const T = {};
  SECS.forEach(s => { T[s.k] = r2(filas(D, s.k).filter(r => !(s.pago && r.pagado)).reduce((a,r)=>a+(Number(r.monto)||0),0)); });
  SALDOS.forEach(x => { T[x.k] = r2(x.f(T)); });
  const pv = lista(D.prestamos).filter(p => p.estado !== 'pagada');
  T.prestVig = r2(pv.reduce((a,p)=>a+(Number(p.monto)||0),0));
  T.prestN = pv.length;
  return T;
}
function precioIva(c){ return (c.precioIva !== '' && c.precioIva != null && Number(c.precioIva)) ? Number(c.precioIva) : (Number(c.precio)||0)*(1+IVA); }
function ultimoComb(D){ const L = lista(D.combustible).filter(c=>c.fecha).sort((a,b)=>a.fecha<b.fecha?1:-1); return L[0] || null; }
function vencimientos(D){
  const out = [];
  SECS.filter(s=>s.pago).forEach(s => filas(D, s.k).forEach(r => {
    if (r.pagado || !r.fecha) return;
    out.push({ d:dias(r.fecha), fecha:r.fecha, txt:r.concepto||'(sin concepto)', monto:r.monto, sec:s.t });
  }));
  lista(D.prestamos).forEach(p => {
    if (p.estado === 'pagada' || !p.pago) return;
    out.push({ d:dias(p.pago), fecha:p.pago, txt:'Préstamo ' + (p.entidad||''), monto:p.monto, sec:'Préstamos' });
  });
  return out.sort((a,b)=>a.d-b.d);
}
function badge(iso, cerrado){
  if (!iso || cerrado) return '';
  const d = dias(iso);
  if (d < 0) return '<span class="conc-bdg rojo">Vencido hace ' + (-d) + ' d</span>';
  if (d === 0) return '<span class="conc-bdg rojo">Vence hoy</span>';
  if (d <= 3) return '<span class="conc-bdg ambar">En ' + d + ' d</span>';
  if (d <= 7) return '<span class="conc-bdg azul">En ' + d + ' d</span>';
  return '';
}

/* ── datos iniciales (Excel CONCILIACION.xlsx) ── */
function semilla(){
  let o = 1;
  const R = (concepto, monto, extra) => { const id = nid('r'); return [id, Object.assign({ concepto:concepto, monto:r2(monto), ord:o++ }, extra||{})]; };
  const sec = list => { const rows = {}; list.forEach(x => { rows[x[0]] = x[1]; }); return { rows:rows }; };
  const p1 = nid('p'), p2 = nid('p'), c1 = nid('c'), c2 = nid('c');
  return {
    actual: {
      secs: {
        bancos: sec([
          R('Efectivo', 0),
          R('Banco Pichincha', 1112.49, { expr:'28960.49-25000-2848' }),
          R('Banco del Austro', 0),
          R('Banco BanEcuador', 0, { nota:'En el Excel figuraba $102,000.00 fuera de la columna de saldos' }),
          R('Banco Bolivariano', 463731.86)
        ]),
        inmediato: sec([
          R('Pagos para salida Fátima', -15000),
          R('Pagos para salida Gracia', -70000),
          R('Pago del seguro', -35381, { fecha:'2026-11-17' }),
          R('IESS por pagar', -8543.47, { fecha:'2026-11-16' }),
          R('Pagos para extensión de veda observador', -11000, { fecha:'2026-11-06' })
        ]),
        cxc: sec([
          R('Comercio por cobrar', 122131),
          R('Comercio por cobrar sucesión indivisa', 11563.2)
        ]),
        mensual: sec([
          R('María de Gracia CIAT', -7251.53, { fecha:'2027-04-18' }),
          R('María Fátima CIAT', -4753.29),
          R('Pago de cambio de clases María de Gracia', -14500, { expr:'-15000+500' }),
          R('María de Gracia aprox', 150000, { nota:'7/' }),
          R('María de Gracia aprox comercio', 90000)
        ]),
        descargas: { periodo:'Octubre', rows:{} }
      },
      upd: firma()
    },
    prestamos: {
      [p1]: { entidad:'', desembolso:'2026-06-15', pago:'2026-09-04', monto:205308.33, estado:'pagada', ord:1 },
      [p2]: { entidad:'', desembolso:'2026-09-02', pago:'2026-12-02', monto:204802.78, estado:'vigente', ord:2 }
    },
    combustible: {
      [c1]: { fecha:'2026-03-03', precio:2.0746, precioIva:'', ord:1 },
      [c2]: { fecha:'2026-07-13', precio:'', precioIva:3.88, ord:2 }
    }
  };
}

/* ── Firebase ── */
function setSync(cls, label){
  const d=document.getElementById('conc-syncDot'); if(d) d.className='sync-dot '+cls;
  const l=document.getElementById('conc-syncLbl'); if(l) l.textContent=label;
}
function initFirebase(){
  try {
    db = firebase.database(); fbReady = true;
    setSync('saving','Conectando…');
    db.ref(FB).on('value', function(snap){
      const v = snap.val();
      if (v === null && P.editar(role())) { sembrar(); return; }
      DATA = normalizar(v); cargado = true;
      if (st.corte && !DATA.cortes[st.corte]) st.corte = null;
      setSync('ok','Sincronizado');
      if (modalAbierto() || hasFocusInside()) pendingRender = true; else render();
    }, function(){ cargado = true; setSync('local','Sin acceso'); render(); });
  } catch(e){ fbReady = false; setSync('local','Sin conexión'); }
}
function sembrar(){
  db.ref(FB).transaction(cur => cur === null ? semilla() : undefined).catch(fallo);
}
function fallo(e){
  const permiso = e && /permission|solo lectura/i.test(String(e.code||e.message||''));
  toast(permiso ? 'No se guardó: no tienes permiso para este cambio' : 'No se guardó: sin conexión', true);
  setSync('local', permiso ? 'Sin permiso' : 'Sin conexión');
  if (fbReady) db.ref(FB).once('value').then(s=>{ DATA=normalizar(s.val()); render(); }).catch(()=>{});
}
function escribir(upd){
  if (!fbReady) { toast('Sin conexión con la base', true); return Promise.resolve(); }
  setSync('saving','Guardando…');
  return db.ref(FB).update(upd).then(()=>setSync('ok','Sincronizado')).catch(fallo);
}
function rowPath(tipo, sec, id){
  return tipo === 'sec' ? 'actual/secs/'+sec+'/rows/'+id : tipo+'/'+id;
}
function getRow(tipo, sec, id){
  if (tipo === 'sec') { const s = DATA.actual.secs[sec]; return s && s.rows ? s.rows[id] : null; }
  return (DATA[tipo]||{})[id] || null;
}
function guardarFila(tipo, sec, id){
  const row = getRow(tipo, sec, id); if (!row) return;
  const upd = {}; upd[rowPath(tipo, sec, id)] = row;
  if (tipo === 'sec') upd['actual/upd'] = firma(); else upd['actual/upd'] = DATA.actual.upd || firma();
  if (tipo === 'sec') DATA.actual.upd = upd['actual/upd'];
  return escribir(upd);
}
function guardarDiferido(tipo, sec, id){
  const key = tipo+'|'+sec+'|'+id;
  clearTimeout(timers[key]);
  timers[key] = setTimeout(()=>{ delete timers[key]; guardarFila(tipo, sec, id); }, 600);
}
function vaciarPendientes(){
  Object.keys(timers).forEach(key => { clearTimeout(timers[key]); delete timers[key]; const p=key.split('|'); guardarFila(p[0], p[1], p[2]); });
}

/* ── UI util ── */
function ovl(){ return document.getElementById('conc-ovl'); }
function modalAbierto(){ const o=ovl(); return !!o && o.classList.contains('show'); }
function hasFocusInside(){
  const a=document.activeElement; if(!a) return false;
  if (['INPUT','TEXTAREA','SELECT'].indexOf(a.tagName)<0) return false;
  const box=document.getElementById('screen-conciliacion'); return !!(box && box.contains(a));
}
function toast(msg, err){
  document.querySelectorAll('.conc-toast').forEach(x=>x.remove());
  const t=document.createElement('div'); t.className='conc-toast'+(err?' err':''); t.textContent=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), err?4000:2200);
}
function openM(html){ const o=ovl(); document.getElementById('conc-modal').innerHTML=html; o.classList.add('show'); const f=o.querySelector('input,textarea'); if(f) f.focus(); }
function closeM(){ const o=ovl(); if(o) o.classList.remove('show'); if(pendingRender){ pendingRender=false; render(); } }

/* ── render ── */
function render(){
  const body = document.getElementById('conc-body'); if (!body) return;
  if (!P.ver(role())) { body.innerHTML = '<div class="conc-empty">No tienes acceso a la conciliación.</div>'; return; }
  const D = vista();
  const T = totales(D);
  renderHead(D);
  renderTabs();
  let h = '';
  if (st.corte) {
    const c = DATA.cortes[st.corte];
    h += '<div class="conc-cortebar">📸 Viendo el corte del <b>' + esc(fFecha(c.f)) + '</b>' + (c.nota ? ' · ' + esc(c.nota) : '') +
         ' · guardado por ' + esc(c.u||'—') + ' · solo lectura <button class="conc-btn sec" onclick="CONC.verCorte(null)">← Volver a la actual</button></div>';
  }
  if (st.tab === 'conc') h += vConc(D, T);
  else if (st.tab === 'prest') h += vPrest(D, T);
  else if (st.tab === 'comb') h += vComb(D);
  else if (st.tab === 'cortes') h += vCortes();
  body.innerHTML = h;
}
function renderHead(D){
  const u = D.actual.upd;
  const el = document.getElementById('conc-upd');
  if (el) el.textContent = u ? 'Actualizado ' + fFecha(String(u.f).slice(0,10)) + ' ' + String(u.f).slice(11) + ' · ' + (u.u||'') : (cargado ? 'Sin datos' : 'Cargando…');
  const ex = document.getElementById('conc-exp'); if (ex) ex.hidden = !cargado;
  const cb = document.getElementById('conc-corteBtn'); if (cb) cb.hidden = !editable();
}
function renderTabs(){
  const n = Object.keys(DATA.cortes||{}).length;
  const tabs = [['conc','Conciliación'],['prest','Préstamos'],['comb','Combustible'],['cortes','Cortes guardados' + (n ? ' <span class="n">'+n+'</span>' : '')]];
  const el = document.getElementById('conc-tabs');
  if (el) el.innerHTML = tabs.filter(t => !(st.corte && t[0]==='cortes')).map(t => '<button class="conc-tab'+(st.tab===t[0]?' active':'')+'" onclick="CONC.tab(\''+t[0]+'\')">'+t[1]+'</button>').join('');
}
function kpi(l, v, s, cls, id){ return '<div class="conc-kpi '+(cls||'')+'"><div class="l">'+l+'</div><div class="v'+(Number(v)<0?' neg':'')+'"'+(id?' id="'+id+'"':'')+'>'+money(v)+'</div><div class="s">'+(s||'')+'</div></div>'; }
function vConc(D, T){
  let h = '';
  const V = vencimientos(D);
  const venc = V.filter(x=>x.d<0), prox = V.filter(x=>x.d>=0 && x.d<=7);
  h += '<div class="conc-kpis">' +
    kpi('Total disponible', T.disp, 'Efectivo y bancos', '', 'conc-k-disp') +
    kpi('Saldo después de pagos', T.s2, 'Incluye pagos inmediatos', 'k2', 'conc-k-s2') +
    kpi('Saldo aproximado', T.s5, 'Luego de pagos y salida del barco', 'k3', 'conc-k-s5') +
    kpi('Proyección final', T.s6, 'Con ajustes de proyección', 'k4', 'conc-k-s6') +
    '</div>';
  if (venc.length || prox.length) {
    const li = x => '<li><span>' + esc(x.txt) + ' <em>· ' + esc(x.sec) + '</em></span><span>' + fFecha(x.fecha) + ' · <b class="'+(Number(x.monto)<0?'neg':'')+'">' + money(x.monto) + '</b></span></li>';
    h += '<div class="conc-alert">' +
      (venc.length ? '<div class="conc-alert-b rojo"><h4>⚠ Vencidos sin marcar como pagados (' + venc.length + ')</h4><ul>' + venc.map(li).join('') + '</ul></div>' : '') +
      (prox.length ? '<div class="conc-alert-b ambar"><h4>⏳ Vencen en los próximos 7 días (' + prox.length + ')</h4><ul>' + prox.map(li).join('') + '</ul></div>' : '') +
      '</div>';
  }
  SECS.forEach(s => {
    h += secCard(D, s, T);
    SALDOS.filter(x=>x.after===s.k && !x.oculto).forEach(x => {
      h += '<div class="conc-saldo'+(x.fuerte?' fuerte':'')+'"><span>'+esc(x.t)+'</span><b id="conc-t-'+x.k+'" class="'+(T[x.k]<0?'neg':'')+'">'+money(T[x.k])+'</b></div>';
    });
  });
  return h;
}
function secCard(D, s, T){
  const L = filas(D, s.k);
  const ed = editable();
  const abierto = st.open[s.k] !== false;
  const sd = (D.actual.secs||{})[s.k] || {};
  let h = '<div class="conc-card conc-sec" style="--c:'+s.c+'"><div class="conc-card-h" onclick="CONC.toggle(\''+s.k+'\')">' +
    '<h3>' + (abierto?'▾ ':'▸ ') + esc(s.t) +
    (s.periodo ? ' <span class="conc-per">' + (ed ? '<input class="conc-in per" value="'+esc(sd.periodo||'')+'" placeholder="Periodo" onclick="event.stopPropagation()" onchange="CONC.periodo(\''+s.k+'\',this.value)">' : esc(sd.periodo||'')) + '</span>' : '') +
    ' <span class="meta">' + L.length + ' línea' + (L.length===1?'':'s') + '</span></h3>' +
    '<span class="t'+(T[s.k]<0?' neg':'')+'" id="conc-t-'+s.k+'">' + money(T[s.k]) + '</span></div>';
  if (!abierto) return h + '</div>';
  h += '<div class="conc-scroll"><table class="conc-t"><thead><tr><th>Concepto</th>' + (s.pago ? '<th>Fecha</th>' : '') + '<th class="r">Monto</th><th>Nota</th>' + (s.pago ? '<th class="c">Pagado</th>' : '') + (ed ? '<th></th>' : '') + '</tr></thead><tbody>';
  if (!L.length) h += '<tr><td colspan="6" class="conc-vac">Sin líneas</td></tr>';
  L.forEach(r => {
    const a = 'data-t="sec" data-s="'+s.k+'" data-id="'+r.id+'"';
    const neg = Number(r.monto) < 0 ? ' neg' : '';
    h += '<tr class="'+(s.pago && r.pagado ? 'pagado' : '')+'">';
    if (ed) {
      h += '<td><input class="conc-in" '+a+' data-f="concepto" value="'+esc(r.concepto||'')+'" placeholder="Concepto"></td>';
      if (s.pago) h += '<td class="nw"><input type="date" class="conc-in fecha" '+a+' data-f="fecha" value="'+esc(r.fecha||'')+'"> ' + badge(r.fecha, r.pagado) + '</td>';
      h += '<td class="r"><input class="conc-in monto'+neg+'" inputmode="decimal" '+a+' data-f="monto" value="'+esc(money(r.monto))+'" title="'+(r.expr?'Operación: '+esc(r.expr):'Número u operación, ej. 28960.49-25000')+'">' + (r.expr ? '<span class="conc-fx" title="'+esc(r.expr)+'">ƒx</span>' : '') + '</td>';
      h += '<td><input class="conc-in nota" '+a+' data-f="nota" value="'+esc(r.nota||'')+'" placeholder="—"></td>';
      if (s.pago) h += '<td class="c"><input type="checkbox" '+a+' data-f="pagado"'+(r.pagado?' checked':'')+'></td>';
      h += '<td class="c"><button class="conc-x" title="Eliminar línea" onclick="CONC.delFila(\'sec\',\''+s.k+'\',\''+r.id+'\')">✕</button></td>';
    } else {
      h += '<td>' + esc(r.concepto||'') + '</td>';
      if (s.pago) h += '<td class="nw">' + fFecha(r.fecha) + ' ' + badge(r.fecha, r.pagado) + '</td>';
      h += '<td class="r'+neg+'">' + money(r.monto) + (r.expr ? ' <span class="conc-fx" title="'+esc(r.expr)+'">ƒx</span>' : '') + '</td>';
      h += '<td class="conc-nota">' + esc(r.nota||'') + '</td>';
      if (s.pago) h += '<td class="c">' + (r.pagado ? '✔' : '') + '</td>';
    }
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  h += '<div class="conc-card-f"><span class="conc-hint">' + esc(s.hint) + (s.pago ? ' · las líneas marcadas como pagadas no suman' : '') + '</span>' +
       (ed ? '<button class="conc-btn sm" onclick="CONC.addFila(\'sec\',\''+s.k+'\')">+ Agregar línea</button>' : '') + '</div>';
  return h + '</div>';
}
function vPrest(D, T){
  const L = lista(D.prestamos);
  const ed = editable();
  let h = '<div class="conc-kpis">' + kpi('Préstamos vigentes', T.prestVig, T.prestN + ' por pagar', 'k3') + '</div>';
  h += '<div class="conc-card"><div class="conc-card-h nohand"><h3>Préstamos / obligaciones</h3><span class="t">' + money(T.prestVig) + '</span></div>';
  h += '<div class="conc-scroll"><table class="conc-t"><thead><tr><th>Entidad / concepto</th><th>Fecha de desembolso</th><th>Fecha de pago</th><th class="r">Monto</th><th>Estado</th><th>Nota</th>' + (ed?'<th></th>':'') + '</tr></thead><tbody>';
  if (!L.length) h += '<tr><td colspan="7" class="conc-vac">Sin préstamos</td></tr>';
  L.forEach(p => {
    const a = 'data-t="prestamos" data-s="" data-id="'+p.id+'"';
    const pag = p.estado === 'pagada';
    h += '<tr class="'+(pag?'pagado':'')+'">';
    if (ed) {
      h += '<td><input class="conc-in" '+a+' data-f="entidad" value="'+esc(p.entidad||'')+'" placeholder="Banco / concepto"></td>' +
           '<td><input type="date" class="conc-in fecha" '+a+' data-f="desembolso" value="'+esc(p.desembolso||'')+'"></td>' +
           '<td class="nw"><input type="date" class="conc-in fecha" '+a+' data-f="pago" value="'+esc(p.pago||'')+'"> ' + badge(p.pago, pag) + '</td>' +
           '<td class="r"><input class="conc-in monto" inputmode="decimal" '+a+' data-f="monto" value="'+esc(money(p.monto))+'"></td>' +
           '<td><select class="conc-in sel" '+a+' data-f="estado"><option value="vigente"'+(!pag?' selected':'')+'>Vigente</option><option value="pagada"'+(pag?' selected':'')+'>Pagada</option></select></td>' +
           '<td><input class="conc-in nota" '+a+' data-f="nota" value="'+esc(p.nota||'')+'" placeholder="—"></td>' +
           '<td class="c"><button class="conc-x" title="Eliminar" onclick="CONC.delFila(\'prestamos\',\'\',\''+p.id+'\')">✕</button></td>';
    } else {
      h += '<td>' + esc(p.entidad||'—') + '</td><td>' + fFecha(p.desembolso) + '</td><td class="nw">' + fFecha(p.pago) + ' ' + badge(p.pago, pag) + '</td>' +
           '<td class="r">' + money(p.monto) + '</td><td>' + (pag ? 'Pagada' : 'Vigente') + '</td><td class="conc-nota">' + esc(p.nota||'') + '</td>';
    }
    h += '</tr>';
  });
  h += '</tbody></table></div><div class="conc-card-f"><span class="conc-hint">Los préstamos vigentes con fecha de pago aparecen en las alertas de vencimiento.</span>' +
       (ed ? '<button class="conc-btn sm" onclick="CONC.addFila(\'prestamos\',\'\')">+ Agregar préstamo</button>' : '') + '</div></div>';
  return h;
}
function vComb(D){
  const L = lista(D.combustible).sort((a,b)=>(a.fecha||'')<(b.fecha||'')?1:-1);
  const ed = editable();
  const u = ultimoComb(D);
  let h = '<div class="conc-kpis"><div class="conc-kpi"><div class="l">Último precio por galón</div><div class="v">' + (u ? '$' + num(precioIva(u)) : '—') + '</div><div class="s">' + (u ? 'Con IVA · ' + fFecha(u.fecha) : 'Sin registros') + '</div></div></div>';
  h += '<div class="conc-card"><div class="conc-card-h nohand"><h3>Precio de combustible por galón</h3><span class="meta">IVA ' + (IVA*100) + '%</span></div>';
  h += '<div class="conc-scroll"><table class="conc-t"><thead><tr><th>Fecha</th><th class="r">Precio sin IVA</th><th class="r">Precio con IVA</th><th>Nota</th>' + (ed?'<th></th>':'') + '</tr></thead><tbody>';
  if (!L.length) h += '<tr><td colspan="5" class="conc-vac">Sin registros</td></tr>';
  L.forEach(c => {
    const a = 'data-t="combustible" data-s="" data-id="'+c.id+'"';
    const calc = !(c.precioIva !== '' && c.precioIva != null && Number(c.precioIva));
    if (ed) {
      h += '<tr><td><input type="date" class="conc-in fecha" '+a+' data-f="fecha" value="'+esc(c.fecha||'')+'"></td>' +
           '<td class="r"><input class="conc-in monto" inputmode="decimal" '+a+' data-f="precio" data-dec="4" value="'+esc(c.precio===''||c.precio==null?'':num(c.precio))+'" placeholder="—"></td>' +
           '<td class="r"><input class="conc-in monto'+(calc?' calc':'')+'" inputmode="decimal" '+a+' data-f="precioIva" data-dec="4" value="'+esc(num(precioIva(c)))+'" title="'+(calc?'Calculado: precio × '+(1+IVA)+'. Escribe un valor para fijarlo.':'Valor ingresado')+'"></td>' +
           '<td><input class="conc-in nota" '+a+' data-f="nota" value="'+esc(c.nota||'')+'" placeholder="—"></td>' +
           '<td class="c"><button class="conc-x" title="Eliminar" onclick="CONC.delFila(\'combustible\',\'\',\''+c.id+'\')">✕</button></td></tr>';
    } else {
      h += '<tr><td>' + fFecha(c.fecha) + '</td><td class="r">' + (c.precio===''||c.precio==null ? '—' : '$'+num(c.precio)) + '</td><td class="r">$' + num(precioIva(c)) + '</td><td class="conc-nota">' + esc(c.nota||'') + '</td></tr>';
    }
  });
  h += '</tbody></table></div><div class="conc-card-f"><span class="conc-hint">Si dejas vacío el precio con IVA, se calcula solo. Borra el valor para volver al cálculo.</span>' +
       (ed ? '<button class="conc-btn sm" onclick="CONC.addFila(\'combustible\',\'\')">+ Agregar precio</button>' : '') + '</div></div>';
  return h;
}
function vCortes(){
  const L = Object.keys(DATA.cortes||{}).map(id => Object.assign({id:id}, DATA.cortes[id])).sort((a,b)=>(b.ts||0)-(a.ts||0));
  let h = '<div class="conc-card"><div class="conc-card-h nohand"><h3>Cortes guardados</h3>' +
    (editable() ? '<button class="conc-btn sm" onclick="CONC.nuevoCorte()">📸 Guardar corte</button>' : '') + '</div>';
  if (!L.length) return h + '<div class="conc-empty">Aún no hay cortes. Usa “📸 Guardar corte” para congelar la conciliación de hoy y consultarla después.</div></div>';
  h += '<div class="conc-scroll"><table class="conc-t"><thead><tr><th>Fecha</th><th>Nota</th><th>Guardado por</th><th class="r">Disponible</th><th class="r">Saldo después de pagos</th><th class="r">Saldo aproximado</th><th class="r">Proyección</th><th></th></tr></thead><tbody>';
  L.forEach(c => {
    const T = c.tot || {};
    h += '<tr><td class="nw">' + fFecha(c.f) + ' <span class="conc-sub">' + esc(String(c.f||'').slice(11)) + '</span></td><td>' + esc(c.nota||'') + '</td><td>' + esc(c.u||'—') + '</td>' +
      ['disp','s2','s5','s6'].map(k => '<td class="r'+(Number(T[k])<0?' neg':'')+'">' + money(T[k]) + '</td>').join('') +
      '<td class="nw"><button class="conc-btn sm sec" onclick="CONC.verCorte(\''+c.id+'\')">Ver</button>' +
      (P.borrarCorte(role()) ? ' <button class="conc-x" title="Eliminar corte" onclick="CONC.delCorte(\''+c.id+'\')">✕</button>' : '') + '</td></tr>';
  });
  return h + '</tbody></table></div></div>';
}

/* Actualiza solo los totales (sin redibujar) mientras se escribe. */
function refrescarTotales(){
  const T = totales(vista());
  const set = (id, v) => { const el=document.getElementById(id); if(el){ el.textContent=money(v); el.classList.toggle('neg', v<0); } };
  SECS.forEach(s => set('conc-t-'+s.k, T[s.k]));
  SALDOS.forEach(x => set('conc-t-'+x.k, T[x.k]));
  set('conc-k-disp', T.disp); set('conc-k-s2', T.s2); set('conc-k-s5', T.s5); set('conc-k-s6', T.s6);
}

/* ── eventos de las tablas (delegados) ── */
function attr(el){ return { t:el.getAttribute('data-t'), s:el.getAttribute('data-s'), id:el.getAttribute('data-id'), f:el.getAttribute('data-f') }; }
function esMonto(el){ return el.classList.contains('monto'); }
function onFocusIn(e){
  const el = e.target; if (!el.getAttribute || !el.getAttribute('data-f') || !esMonto(el)) return;
  const a = attr(el); const row = getRow(a.t, a.s, a.id); if (!row) return;
  if (a.f === 'monto') el.value = row.expr ? row.expr : (Number(row.monto)||0) === 0 ? '' : String(row.monto);
  else el.value = (row[a.f] === '' || row[a.f] == null) ? '' : String(row[a.f]);
  try { el.select(); } catch(x){}
}
function onInput(e){
  const el = e.target; if (!el.getAttribute || !el.getAttribute('data-f')) return;
  const a = attr(el); const row = getRow(a.t, a.s, a.id); if (!row || !editable()) return;
  if (esMonto(el)) {
    if (a.f !== 'monto') return;  // precios: se guardan al salir del campo
    const p = parseMonto(el.value); el.classList.toggle('bad', !p);
    if (p) { row.monto = p.monto; row.expr = p.expr; el.classList.toggle('neg', p.monto < 0); refrescarTotales(); }
    return;
  }
  if (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'date') return;
  row[a.f] = el.value;
  guardarDiferido(a.t, a.s, a.id);
}
function onChange(e){
  const el = e.target; if (!el.getAttribute || !el.getAttribute('data-f')) return;
  const a = attr(el); const row = getRow(a.t, a.s, a.id); if (!row || !editable()) return;
  if (esMonto(el)) return; // lo maneja focusout
  if (el.type === 'checkbox') row[a.f] = el.checked;
  else row[a.f] = el.value;
  if (el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'date') { guardarFila(a.t, a.s, a.id); render(); }
}
function onFocusOut(e){
  const el = e.target;
  if (el.getAttribute && el.getAttribute('data-f') && esMonto(el) && editable()) {
    const a = attr(el); const row = getRow(a.t, a.s, a.id);
    if (row) {
      const dec = Number(el.getAttribute('data-dec')) || 2;
      const p = parseMonto(el.value, dec);
      if (!p) { toast('Monto no válido: usa números y + − × ÷', true); }
      else if (a.f === 'monto') { row.monto = p.monto; row.expr = p.expr; guardarFila(a.t, a.s, a.id); }
      else { row[a.f] = el.value.trim() === '' ? '' : p.monto; guardarFila(a.t, a.s, a.id); }
      el.classList.remove('bad');
      if (p) el.value = a.f === 'monto' ? money(row.monto) : (row[a.f] === '' ? '' : num(row[a.f]));
      if (a.f === 'monto') el.classList.toggle('neg', Number(row.monto) < 0);
      refrescarTotales();
    }
    setTimeout(()=>{ if (!hasFocusInside() && !modalAbierto()) { pendingRender=false; render(); } }, 0);
    return;
  }
  setTimeout(()=>{ if (pendingRender && !hasFocusInside() && !modalAbierto()) { pendingRender=false; render(); } }, 0);
}

/* ── exportar a Excel ── */
function exportar(){
  if (typeof XLSX === 'undefined') { toast('No se pudo cargar la librería de Excel', true); return; }
  const D = vista(), T = totales(D);
  const titulo = st.corte ? 'Corte del ' + fFecha(DATA.cortes[st.corte].f) : 'Al ' + fFecha(hoyISO());
  const A = [['CONCILIACIÓN BANCARIA'],['ATÚN TROPICAL ATUNTRO S.A.'],[titulo],[]];
  SECS.forEach(s => {
    const sd = (D.actual.secs||{})[s.k] || {};
    A.push([s.t.toUpperCase() + (s.periodo && sd.periodo ? ' — ' + sd.periodo : '')]);
    A.push(['Concepto','Fecha','Monto','Nota','Pagado']);
    filas(D, s.k).forEach(r => A.push([r.concepto||'', r.fecha ? fFecha(r.fecha) : '', Number(r.monto)||0, r.nota||'', s.pago ? (r.pagado ? 'Sí' : 'No') : '']));
    A.push(['Total ' + s.t.toLowerCase(), '', T[s.k]]);
    SALDOS.filter(x=>x.after===s.k).forEach(x => A.push([x.t.toUpperCase(), '', T[x.k]]));
    A.push([]);
  });
  const ws1 = XLSX.utils.aoa_to_sheet(A); ws1['!cols'] = [{wch:52},{wch:12},{wch:16},{wch:40},{wch:8}];
  const B = [['Entidad / concepto','Fecha de desembolso','Fecha de pago','Monto','Estado','Nota']].concat(lista(D.prestamos).map(p => [p.entidad||'', fFecha(p.desembolso), fFecha(p.pago), Number(p.monto)||0, p.estado==='pagada'?'Pagada':'Vigente', p.nota||'']));
  const ws2 = XLSX.utils.aoa_to_sheet(B); ws2['!cols'] = [{wch:30},{wch:18},{wch:14},{wch:16},{wch:10},{wch:30}];
  const C = [['Fecha','Precio sin IVA','Precio con IVA','Nota']].concat(lista(D.combustible).map(c => [fFecha(c.fecha), c.precio===''||c.precio==null?'':Number(c.precio), r2(precioIva(c)*100)/100, c.nota||'']));
  const ws3 = XLSX.utils.aoa_to_sheet(C); ws3['!cols'] = [{wch:12},{wch:14},{wch:14},{wch:30}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Conciliación');
  XLSX.utils.book_append_sheet(wb, ws2, 'Préstamos');
  XLSX.utils.book_append_sheet(wb, ws3, 'Combustible');
  XLSX.writeFile(wb, 'Conciliacion_ATUNTRO_' + (st.corte ? String(DATA.cortes[st.corte].f).slice(0,10) : hoyISO()) + '.xlsx');
}

/* ── API pública ── */
const api = {
  init: function(u){
    user = { name:u.name, key:u.key, role:u.role };
    if (!inited) {
      inited = true;
      const root = document.getElementById('screen-conciliacion');
      root.addEventListener('focusin', onFocusIn);
      root.addEventListener('input', onInput);
      root.addEventListener('change', onChange);
      root.addEventListener('focusout', onFocusOut);
      root.addEventListener('keydown', e => { if (e.key==='Enter' && e.target.classList && e.target.classList.contains('conc-in')) e.target.blur(); });
      ovl().addEventListener('click', e=>{ if(e.target===ovl()) closeM(); });
      document.addEventListener('keydown', e=>{ if(e.key==='Escape' && modalAbierto()) closeM(); });
      if (P.ver(role())) initFirebase();
    }
    render();
  },
  salir(){ vaciarPendientes(); },
  tab(t){ st.tab = t; render(); window.scrollTo(0,0); },
  toggle(k){ st.open[k] = st.open[k] === false; render(); },
  periodo(k, v){
    if (!editable()) return;
    DATA.actual.secs[k] = DATA.actual.secs[k] || {};
    DATA.actual.secs[k].periodo = v;
    const upd = {}; upd['actual/secs/'+k+'/periodo'] = v; upd['actual/upd'] = DATA.actual.upd = firma();
    escribir(upd);
  },
  addFila(tipo, sec){
    if (!editable()) return;
    const id = nid(tipo === 'sec' ? 'r' : tipo.charAt(0));
    let row;
    if (tipo === 'sec') {
      DATA.actual.secs[sec] = DATA.actual.secs[sec] || {};
      DATA.actual.secs[sec].rows = DATA.actual.secs[sec].rows || {};
      const max = filas(DATA, sec).reduce((m,r)=>Math.max(m, r.ord||0), 0);
      row = { concepto:'', monto:0, ord:max+1 };
      DATA.actual.secs[sec].rows[id] = row;
      st.open[sec] = true;
    } else if (tipo === 'prestamos') {
      row = { entidad:'', desembolso:'', pago:'', monto:0, estado:'vigente', ord:Date.now() };
      DATA.prestamos[id] = row;
    } else {
      row = { fecha:hoyISO(), precio:'', precioIva:'', ord:Date.now() };
      DATA.combustible[id] = row;
    }
    guardarFila(tipo, sec, id);
    render();
    const f = document.querySelector('#screen-conciliacion [data-id="'+id+'"]'); if (f) f.focus();
  },
  delFila(tipo, sec, id){
    if (!editable()) return;
    const row = getRow(tipo, sec, id); if (!row) return;
    const nombre = row.concepto || row.entidad || (row.fecha ? fFecha(row.fecha) : '') || 'esta línea';
    if (!confirm('¿Eliminar "' + nombre + '"?')) return;
    clearTimeout(timers[tipo+'|'+sec+'|'+id]); delete timers[tipo+'|'+sec+'|'+id];
    if (tipo === 'sec') delete DATA.actual.secs[sec].rows[id]; else delete DATA[tipo][id];
    const upd = {}; upd[rowPath(tipo, sec, id)] = null;
    if (tipo === 'sec') upd['actual/upd'] = DATA.actual.upd = firma();
    escribir(upd); render();
  },
  nuevoCorte(){
    if (!editable()) return;
    vaciarPendientes();
    openM('<h3>📸 Guardar corte</h3><p class="conc-mp">Se guarda una copia de la conciliación, préstamos y combustible tal como están ahora. Los cortes no se pueden editar.</p>' +
      '<label class="conc-ml">Nota (opcional)</label><input id="conc-cnota" class="conc-mi" placeholder="Ej. Cierre de octubre" maxlength="120">' +
      '<div class="conc-mb"><button class="conc-btn sec" onclick="CONC.close()">Cancelar</button><button class="conc-btn" onclick="CONC.guardarCorte()">Guardar corte</button></div>');
  },
  guardarCorte(){
    if (!editable() || !fbReady) return;
    const nota = (document.getElementById('conc-cnota').value || '').trim();
    const T = totales(DATA);
    const f = firma();
    const corte = { f:f.f, u:f.u, k:f.k, ts:Date.now(), nota:nota,
      tot:{ disp:T.disp, s2:T.s2, s5:T.s5, s6:T.s6 },
      data: JSON.parse(JSON.stringify({ actual:DATA.actual, prestamos:DATA.prestamos, combustible:DATA.combustible })) };
    closeM();
    setSync('saving','Guardando…');
    db.ref(FB+'/cortes').push(corte).then(()=>{ setSync('ok','Sincronizado'); toast('Corte guardado'); }).catch(fallo);
  },
  verCorte(id){ st.corte = id; st.tab = 'conc'; render(); window.scrollTo(0,0); },
  delCorte(id){
    if (!P.borrarCorte(role())) { toast('Solo el Master puede eliminar cortes', true); return; }
    const c = DATA.cortes[id]; if (!c) return;
    if (!confirm('¿Eliminar el corte del ' + fFecha(c.f) + '? No se puede deshacer.')) return;
    const upd = {}; upd['cortes/'+id] = null; escribir(upd);
  },
  exportar: exportar,
  close: closeM
};
return api;
})();
