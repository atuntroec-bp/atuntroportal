/* ════════════════════════════════════════════
   CUADRO DE SALIDA — scoped module
   Namespace: CSAL | Firebase: cuadro_salida_v1
   Presupuesto y aprobación de la salida por barco y viaje:
   trabajos por área, repuestos y materiales/servicios, con
   retenciones por proveedor e historial por usuario.
════════════════════════════════════════════ */
var CSAL = (function() {

const FB = 'cuadro_salida_v1';
const LS = 'atuntro_csal_v1_cache';
const AREAS_TRAB = ['SOLDADURA','TORNERÍA','HIDRÁULICO','MECÁNICO','LIMPIEZA Y PINTURA','CARPINTERÍA','GASFITERÍA','BUCEO','ELÉCTRICO','MOTORES FUERA DE BORDA','SISTEMA DE FRÍO','ELECTRÓNICO','RED DE PESCA'];
const BLOQUES = {trab:'Trabajos', rep:'Repuestos', mat:'Materiales y servicios'};
const ESTADOS = {registrado:'Registrado', aprobado:'Aprobado', rechazado:'Anulado'};
const BARCOS = {MF:'María Fátima', MG:'María de Gracia'};

/* ── permisos (la protección real está en las reglas de Firebase) ── */
const P = {
  registrar:  r => ['operaciones','operaciones_master','master'].includes(r),
  aprobar:    r => ['admin','master'].includes(r),
  catalogo:   r => ['admin','master'].includes(r),
  crearViaje: r => ['operaciones','operaciones_master','admin','master'].includes(r),
  estado:     r => r === 'master'
};

let user = null;            // {name, key, role}
let st = { barco:'MF', viaje:null, tab:'resumen', open:{}, filtroProv:'', ocultarVacias:false };
let DATA = { viajes:{MF:{},MG:{}}, proveedores:{}, habituales:{MF:[],MG:[]} };
let db = null, fbReady = false, inited = false, pendingRender = false;
let M = null, H = null;

/* ── helpers ── */
const role = () => user ? user.role : '';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = n => '$' + (Number(n)||0).toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct = n => ((Number(n)||0)*100).toLocaleString('es-EC',{maximumFractionDigits:2}) + '%';
const norm = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toUpperCase();
const nid = p => (p||'i') + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
function ahora(){ const d=new Date(), z=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+' '+z(d.getHours())+':'+z(d.getMinutes()); }
function firma(a){ return { a:a, u:user.name, k:user.key, f:ahora() }; }
function quien(x){ return x ? esc(x.u || x.name) + (x.k || x.id ? ' <span class="csal-user">(' + esc(x.k || x.id) + ')</span>' : '') : '—'; }
function quienTxt(x){ return x ? (x.u || x.name) + (x.k || x.id ? ' (' + (x.k || x.id) + ')' : '') : '—'; }

const provs = () => Object.keys(DATA.proveedores||{}).map(id => Object.assign({id:id}, DATA.proveedores[id]));
const prov = id => (DATA.proveedores && DATA.proveedores[id]) ? Object.assign({id:id}, DATA.proveedores[id]) : {id:'', nombre:'—', rf:0, ri:0};
const viajesDe = b => (DATA.viajes && DATA.viajes[b]) || {};
const cur = () => st.viaje ? viajesDe(st.barco)[st.viaje] : null;
const its = c => c && c.items ? Object.keys(c.items).map(k => c.items[k]).sort((a,b)=>(a.ts||0)-(b.ts||0)) : [];
const cerrado = () => { const c=cur(); return !!c && c.estado === 'cerrado'; };
const editable = () => !cerrado() || role()==='master';
const vpath = () => FB + '/viajes/' + st.barco + '/' + st.viaje;

function calc(it){
  const p = prov(it.prov);
  const sub = Number(it.sub)||0, iva = sub * (Number(it.iva)||0) / 100;
  const rf = sub * (Number(p.rf)||0), ri = iva * (Number(p.ri)||0);
  return { sub:sub, iva:iva, rf:rf, ri:ri, total:sub+iva, pagar:sub-rf+iva-ri };
}
function sum(list, k){ return list.reduce((s,i)=>s+calc(i)[k],0); }

/* ── Firebase ── */
function setSync(cls, label){
  const d=document.getElementById('csal-syncDot'); if(d) d.className='sync-dot '+cls;
  const l=document.getElementById('csal-syncLbl'); if(l) l.textContent=label;
}
function normalizar(v){
  v = v || {};
  return {
    viajes: { MF:(v.viajes&&v.viajes.MF)||{}, MG:(v.viajes&&v.viajes.MG)||{} },
    proveedores: v.proveedores || {},
    habituales: { MF:(v.habituales&&v.habituales.MF)||[], MG:(v.habituales&&v.habituales.MG)||[] }
  };
}
function initFirebase(){
  try {
    db = firebase.database(); fbReady = true;
    setSync('saving','Conectando…');
    db.ref(FB).on('value', function(snap){
      DATA = normalizar(snap.val());
      try { localStorage.setItem(LS, JSON.stringify(DATA)); } catch(e){}
      setSync('ok','Sincronizado');
      elegirViaje();
      if (modalAbierto() || hasFocusInside()) pendingRender = true; else render();
    }, function(){ setSync('local','Sin acceso'); });
  } catch(e){ fbReady = false; setSync('local','Sin conexión'); }
}
function fallo(e){
  const permiso = e && /permission/i.test(String(e.code||e.message||''));
  toast(permiso ? 'No se guardó: no tienes permiso para este cambio' : 'No se guardó: sin conexión', true);
  setSync('local', permiso ? 'Sin permiso' : 'Sin conexión');
  if (fbReady) db.ref(FB).once('value').then(s=>{ DATA=normalizar(s.val()); render(); }).catch(()=>{});
}
function escribir(promesa){
  setSync('saving','Guardando…');
  return promesa.then(()=>setSync('ok','Sincronizado')).catch(fallo);
}
function wItems(list){ // guarda una o varias líneas del viaje actual
  const c = cur(); if(!c) return;
  c.items = c.items || {};
  const upd = {};
  list.forEach(it => { c.items[it.id] = it; upd['items/'+it.id] = it; });
  render();
  if (fbReady) escribir(db.ref(vpath()).update(upd));
}
function wDelItem(id){
  const c = cur(); if(!c||!c.items) return;
  delete c.items[id]; render();
  if (fbReady) escribir(db.ref(vpath()+'/items/'+id).remove());
}
function wMeta(obj){
  const c = cur(); if(!c) return;
  Object.keys(obj).forEach(k => c[k] = obj[k]); render();
  if (fbReady) escribir(db.ref(vpath()).update(obj));
}

/* ── selección de viaje ── */
function viajesOrdenados(b){ return Object.keys(viajesDe(b)).sort((a,b2)=>Number(b2)-Number(a)); }
function elegirViaje(){
  const vs = viajesOrdenados(st.barco);
  if (!st.viaje || !viajesDe(st.barco)[st.viaje]) st.viaje = vs[0] || null;
}

/* ── render ── */
function render(){
  pendingRender = false;
  const root = document.getElementById('csal-root'); if(!root || !user) return;
  document.querySelectorAll('#screen-cuadro .csal-vtab').forEach(b=>b.classList.toggle('active', b.dataset.b===st.barco));
  const sel = document.getElementById('csal-viaje');
  const vs = viajesOrdenados(st.barco);
  sel.innerHTML = vs.length ? vs.map(v=>`<option value="${esc(v)}" ${v===st.viaje?'selected':''}>${esc(v)}</option>`).join('') : '<option value="">—</option>';
  document.getElementById('csal-newv').style.display = P.crearViaje(role()) ? '' : 'none';

  const c = cur();
  const bar = document.getElementById('csal-bar');
  const tabsEl = document.getElementById('csal-tabs');
  const body = document.getElementById('csal-body');
  if (!c) {
    bar.style.display = 'none';
    if (st.tab!=='prov') st.tab='resumen';
    tabsEl.innerHTML = [['resumen','Viajes'],['prov','Proveedores',provs().length]].map(t=>`<button class="csal-tab ${st.tab===t[0]?'active':''}" onclick="CSAL.tab('${t[0]}')">${t[1]}${t[2]!=null?`<span class="n">${t[2]}</span>`:''}</button>`).join('');
    if (st.tab==='prov') { body.innerHTML = vProv(); return; }
    body.innerHTML = `<div class="csal-card"><div class="csal-empty" style="padding:40px 20px">
      <div style="font-size:30px">🧾</div><b style="color:#1F4E79;font-size:15px">No hay cuadros de salida de ${BARCOS[st.barco]}</b>
      <p style="margin:8px 0 14px">Crea el cuadro del próximo viaje para empezar a registrar trabajos, repuestos y materiales.</p>
      ${P.crearViaje(role())?`<button class="csal-btn pri" onclick="CSAL.nuevoViaje()">+ Crear cuadro de salida</button>`:''}</div></div>`;
    return;
  }
  bar.style.display = '';
  bar.innerHTML = vBar(c);

  const L = its(c);
  const cnt = b => L.filter(i=>i.bloque===b).length;
  const pend = L.filter(i=>i.estado==='registrado').length;
  const tabs = [['resumen','Resumen'],['trab','Trabajos',cnt('trab')],['rep','Repuestos',cnt('rep')],['mat','Materiales y servicios',cnt('mat')],['aprob','Aprobación',pend],['prov','Proveedores',provs().length]];
  tabsEl.innerHTML = tabs.map(t=>`<button class="csal-tab ${st.tab===t[0]?'active':''}" onclick="CSAL.tab('${t[0]}')">${t[1]}${t[2]!=null?`<span class="n">${t[2]}</span>`:''}</button>`).join('');
  body.innerHTML = (cerrado()?`<div class="csal-lock">🔒 Cuadro cerrado${c.estadoPor?' por '+quien(c.estadoPor)+' · '+esc(c.estadoPor.f):''}. ${role()==='master'?'Como Master puedes seguir editando o reabrirlo.':'Solo el Master puede reabrirlo.'}</div>`:'') +
    ({resumen:vResumen, trab:()=>vBloque('trab'), rep:()=>vBloque('rep'), mat:()=>vBloque('mat'), aprob:vAprob, prov:vProv})[st.tab]();
}

function vBar(c){
  const L = its(c);
  const part = {};
  L.forEach(i => (i.hist||[]).forEach(h => { if (/^Registrado|^Editado/.test(h.a) && h.k) part[h.k] = h.u; }));
  const partHtml = Object.keys(part).map(k=>`<span class="csal-chip">${esc(part[k])} <span class="csal-user">(${esc(k)})</span></span>`).join('') || '<span class="csal-note">Aún nadie ha registrado líneas</span>';
  const canResp = editable() && (P.registrar(role()) || P.aprobar(role()));
  const us = (typeof AUTH !== 'undefined' && AUTH.users) ? AUTH.users : {};
  const respOpts = Object.keys(us).filter(k=>us[k].role!=='contabilidad').sort((a,b)=>String(us[a].name).localeCompare(us[b].name))
    .map(k=>`<option value="${esc(k)}" ${c.resp&&c.resp.id===k?'selected':''}>${esc(us[k].name)} (${esc(k)})</option>`).join('');
  return `
    <div class="csal-df"><label>Fecha de salida</label><input type="date" value="${esc(c.fecha||'')}" ${editable()&&(P.registrar(role())||P.aprobar(role()))?'':'disabled'} onchange="CSAL.setFecha(this.value)"></div>
    <div class="csal-df"><label>Estado del cuadro ${P.estado(role())?'':'<span style="text-transform:none;font-weight:400">· lo cambia solo el Master</span>'}</label>
      ${P.estado(role())?`<select onchange="CSAL.setEstado(this.value)"><option value="abierto" ${c.estado!=='cerrado'?'selected':''}>Abierto</option><option value="cerrado" ${c.estado==='cerrado'?'selected':''}>Cerrado</option></select>`
        :`<div class="csal-val"><span class="csal-st ${c.estado==='cerrado'?'st-rechazado':'st-aprobado'}">${c.estado==='cerrado'?'Cerrado':'Abierto'}</span></div>`}
      ${c.estadoPor?`<span class="csal-hist">${esc(c.estadoPor.a)} · ${quien(c.estadoPor)} · ${esc(c.estadoPor.f)}</span>`:''}</div>
    <div class="csal-df"><label>Responsable</label>
      ${canResp?`<select onchange="CSAL.setResp(this.value)">${c.resp&&!us[c.resp.id]?`<option selected>${esc(quienTxt(c.resp))}</option>`:''}${respOpts}</select>`:`<div class="csal-val">${quien(c.resp)}</div>`}
      <span class="csal-hist">Creado por ${quien(c.creado)}${c.creado?' · '+esc(c.creado.f):''}</span></div>
    <div class="csal-df" style="flex:2"><label>Llenado por</label><div class="csal-chips">${partHtml}</div></div>`;
}

function vResumen(){
  const c = cur(); const T0 = its(c);
  const L = T0.filter(i=>i.estado!=='rechazado');
  const apr = L.filter(i=>i.estado==='aprobado');
  const pen = L.filter(i=>i.estado==='registrado');
  const anul = T0.filter(i=>i.estado==='rechazado');
  const prevKey = String(Number(st.viaje)-1), prev = viajesDe(st.barco)[prevKey];
  const prevTot = prev ? sum(its(prev).filter(i=>i.estado!=='rechazado'),'total') : null;
  let h = `<div class="csal-kpis">
    <div class="csal-kpi"><div class="l">Presupuesto total</div><div class="v">${$(sum(L,'total'))}</div><div class="s">${L.length} líneas · con IVA${prevTot!=null?` · viaje ${esc(prevKey)}: ${$(prevTot)}`:''}</div></div>
    <div class="csal-kpi" style="border-color:#F0A500"><div class="l">Por aprobar</div><div class="v">${$(sum(pen,'total'))}</div><div class="s">${pen.length} líneas pendientes</div></div>
    <div class="csal-kpi" style="border-color:#2E7D32"><div class="l">Aprobado</div><div class="v">${$(sum(apr,'total'))}</div><div class="s">${apr.length} líneas · neto a pagar ${$(sum(apr,'pagar'))}</div></div>
    <div class="csal-kpi" style="border-color:#8B2E0A"><div class="l">Anulado</div><div class="v">${$(sum(anul,'total'))}</div><div class="s">${anul.length} línea${anul.length===1?'':'s'} (no suman al presupuesto)</div></div>
  </div>`;
  h += `<div class="csal-card"><div class="csal-card-h"><h3>Resumen por bloque</h3></div><div class="csal-scroll"><table class="csal-t"><tr><th>Bloque</th><th class="r">Subtotal</th><th class="r">IVA</th><th class="r csal-hide-m">Ret. fuente</th><th class="r csal-hide-m">Ret. IVA</th><th class="r">Neto a pagar</th><th class="r">Aprobado</th><th class="r">Por aprobar</th></tr>`;
  const T = {sub:0,iva:0,rf:0,ri:0,pagar:0,ab:0,pe:0};
  Object.keys(BLOQUES).forEach(k=>{ const b=L.filter(i=>i.bloque===k);
    const r={sub:sum(b,'sub'),iva:sum(b,'iva'),rf:sum(b,'rf'),ri:sum(b,'ri'),pagar:sum(b,'pagar'),ab:sum(b.filter(i=>i.estado==='aprobado'),'total'),pe:sum(b.filter(i=>i.estado==='registrado'),'total')};
    Object.keys(T).forEach(x=>T[x]+=r[x]);
    h+=`<tr><td><a href="#" onclick="CSAL.tab('${k}');return false" style="color:#1F4E79">${BLOQUES[k]}</a></td><td class="r">${$(r.sub)}</td><td class="r">${$(r.iva)}</td><td class="r csal-hide-m">−${$(r.rf)}</td><td class="r csal-hide-m">−${$(r.ri)}</td><td class="r">${$(r.pagar)}</td><td class="r">${$(r.ab)}</td><td class="r">${$(r.pe)}</td></tr>`; });
  h+=`<tr class="tot"><td>TOTAL</td><td class="r">${$(T.sub)}</td><td class="r">${$(T.iva)}</td><td class="r csal-hide-m">−${$(T.rf)}</td><td class="r csal-hide-m">−${$(T.ri)}</td><td class="r">${$(T.pagar)}</td><td class="r">${$(T.ab)}</td><td class="r">${$(T.pe)}</td></tr></table></div></div>`;
  const areas = {}; L.filter(i=>i.bloque!=='mat').forEach(i=>{ areas[i.area]=(areas[i.area]||0)+calc(i).total; });
  const mx = Math.max.apply(null, [1].concat(Object.keys(areas).map(a=>areas[a])));
  h += `<div class="csal-card"><div class="csal-card-h"><h3>Trabajos + repuestos por área</h3></div><div style="padding:12px 14px">` +
    (Object.keys(areas).length ? Object.keys(areas).sort((a,b)=>areas[b]-areas[a]).map(a=>`<div class="csal-barrow"><span class="nm">${esc(a)}</span><span class="tr"><i style="width:${areas[a]/mx*100}%"></i></span><b>${$(areas[a])}</b></div>`).join('') : '<div class="csal-empty">Sin trabajos registrados</div>') + `</div></div>`;
  return h;
}

function vBloque(b){
  const c = cur(); const L = its(c).filter(i=>i.bloque===b);
  const canAdd = P.registrar(role()) && editable();
  let h = `<div class="csal-tool"><span class="csal-note">${b==='mat'?'Rubros de avituallamiento, consumibles y servicios de la salida.':'Agrupado por área. Al elegir el proveedor se aplican sus retenciones.'}</span>
    <span class="csal-tool-r">${b==='mat'&&P.catalogo(role())?`<button class="csal-btn" onclick="CSAL.habituales()">⚙ Editar habituales</button>`:''}${b==='mat'&&canAdd?`<button class="csal-btn" onclick="CSAL.cargarRubros()">Cargar rubros habituales</button>`:''}${canAdd?`<button class="csal-btn pri" onclick="CSAL.multi({bloque:'${b}'})">+ Agregar líneas</button>`:''}</span></div>`;
  if (b==='mat') return h + tablaGrupo('Materiales, avituallamiento y servicios', L, b, 'mat');
  const grupos = {}; L.forEach(i=>{(grupos[i.area]=grupos[i.area]||[]).push(i);});
  const extra = Array.from(new Set((c.areasExtra||[]).concat(Object.keys(grupos).filter(a=>AREAS_TRAB.indexOf(a)<0))));
  let orden;
  if (b==='trab') {
    const todas = AREAS_TRAB.concat(extra);
    const vacias = todas.filter(a=>!grupos[a]).length;
    orden = st.ocultarVacias ? todas.filter(a=>grupos[a]) : todas;
    h += `<div class="csal-tool" style="margin-top:-4px"><label class="csal-note csal-chkl"><input type="checkbox" ${st.ocultarVacias?'checked':''} onchange="CSAL.ocultarVacias(this.checked)"> Ocultar áreas sin líneas (${vacias})</label>
      ${canAdd?`<button class="csal-btn" onclick="CSAL.areaAdicional()">+ Área adicional</button>`:''}</div>`;
  } else {
    orden = AREAS_TRAB.filter(a=>grupos[a]).concat(extra.filter(a=>grupos[a]));
  }
  if (!orden.length) h += `<div class="csal-card"><div class="csal-empty">Aún no hay líneas en ${BLOQUES[b]}.</div></div>`;
  orden.forEach((a,ix)=> h += tablaGrupo(a, grupos[a]||[], b, a, ix));
  return h;
}

function tablaGrupo(titulo, L, b, key, ix){
  const k = b+'|'+key; const open = st.open[k]!==false;
  const t = sum(L.filter(i=>i.estado!=='rechazado'),'total');
  const kEsc = esc(k).replace(/\\/g,'\\\\');
  const addG = P.registrar(role()) && editable() && b!=='mat' ? `<button class="csal-btn" onclick="event.stopPropagation();CSAL.multi({bloque:'${b}',areaIx:${ix}})">+ Agregar en ${esc(titulo)}</button>` : '';
  let h = `<div class="csal-card"><div class="csal-card-h" data-k="${esc(k)}" onclick="CSAL.toggle(this.dataset.k)"><h3>${open?'▾':'▸'} ${esc(titulo)}<span class="meta">${L.length} líneas</span></h3><span class="csal-tool-r">${addG}<span class="t">${$(t)}</span></span></div>`;
  if (!open) return h+'</div>';
  if (!L.length) return h+`<div class="csal-empty" style="padding:9px 14px;text-align:left">Sin ${b==='mat'?'rubros':'trabajos en esta área'}.</div></div>`;
  h += `<div class="csal-scroll"><table class="csal-t"><tr><th>Detalle</th><th>Proveedor</th><th class="r">Subtotal</th><th class="r">IVA</th><th class="r">Total</th><th class="r csal-hide-m">A pagar</th><th>Estado</th><th class="csal-hide-m">Observación</th><th></th></tr>`;
  L.forEach(i=>{ const r=calc(i); const p=prov(i.prov); const reg=(i.hist||[])[0];
    const canEdit = editable() && ((P.registrar(role()) && i.estado==='registrado') || role()==='master');
    const histTxt = (i.hist||[]).map(x=>x.a+' · '+quienTxt(x)+' · '+x.f).join('\n');
    h+=`<tr><td>${esc(i.detalle)}${reg?`<div class="csal-hist">por ${quien(reg)}</div>`:''}</td><td style="font-size:11px">${esc(p.nombre)}</td><td class="r">${$(r.sub)}</td><td class="r">${$(r.iva)} <span class="csal-note">${esc(i.iva)}%</span></td><td class="r"><b>${$(r.total)}</b></td><td class="r csal-hide-m">${$(r.pagar)}</td>
      <td><span class="csal-st st-${esc(i.estado)}" title="${esc(histTxt)}">${ESTADOS[i.estado]||esc(i.estado)}</span></td><td class="csal-hide-m" style="font-size:11px;color:#777">${esc(i.obs)}</td>
      <td><div class="csal-acts">${P.aprobar(role())&&i.estado==='registrado'&&editable()?`<button class="csal-btn ok" onclick="CSAL.aprobar('${i.id}')">Aprobar</button>`:''}${P.aprobar(role())&&(i.estado==='aprobado'||i.estado==='rechazado')&&editable()?`<button class="csal-btn" title="Volver a Registrado" onclick="CSAL.revertir(['${i.id}'])">↩ Revertir</button>`:''}${canEdit?`<button class="csal-btn" onclick="CSAL.editar('${i.id}')">Editar</button>`:''}${canEdit?`<button class="csal-btn warn" title="Eliminar línea" onclick="CSAL.borrar('${i.id}')">✕</button>`:''}</div></td></tr>`; });
  return h + `</table></div></div>`;
}

function vAprob(){
  const c = cur(); const L = its(c); const pen = L.filter(i=>i.estado==='registrado');
  if (!P.aprobar(role())) return `<div class="csal-card"><div class="csal-empty">Solo Administración o Master aprueban. Hay ${pen.length} líneas esperando aprobación.</div></div>`;
  let h = `<div class="csal-tool"><span class="csal-note">Marca las líneas y apruébalas o anúlalas en bloque. Queda registrado quién lo hizo y cuándo.</span>
    ${editable()?`<span class="csal-tool-r"><button class="csal-btn warn" onclick="CSAL.aprobarSel(false)">Anular marcadas</button><button class="csal-btn ok" onclick="CSAL.aprobarSel(true)">Aprobar marcadas</button></span>`:''}</div>`;
  h += `<div class="csal-card"><div class="csal-scroll"><table class="csal-t"><tr><th><input type="checkbox" onclick="document.querySelectorAll('.csal-chk').forEach(x=>x.checked=this.checked)"></th><th>Bloque</th><th>Área</th><th>Detalle</th><th>Proveedor</th><th class="r">Total</th><th>Registrado por</th></tr>`;
  pen.forEach(i=>{ const r0=(i.hist||[])[0]; h+=`<tr><td><input type="checkbox" class="csal-chk" value="${i.id}"></td><td>${BLOQUES[i.bloque]}</td><td>${esc(i.area||'—')}</td><td>${esc(i.detalle)}</td><td style="font-size:11px">${esc(prov(i.prov).nombre)}</td><td class="r"><b>${$(calc(i).total)}</b></td><td class="csal-hist">${quien(r0)}${r0?' · '+esc(r0.f):''}</td></tr>`; });
  if (!pen.length) h+=`<tr><td colspan="7" class="csal-empty">No hay nada pendiente de aprobación ✓</td></tr>`;
  h += `</table></div></div>`;
  const rev = L.filter(i=>i.estado==='aprobado'||i.estado==='rechazado');
  h += `<div class="csal-card"><div class="csal-card-h" style="cursor:default"><h3>Aprobadas y anuladas<span class="meta">se pueden revertir a Registrado</span></h3>
    ${editable()?`<button class="csal-btn" onclick="CSAL.revertir(Array.prototype.map.call(document.querySelectorAll('.csal-chk2:checked'),function(x){return x.value;}))">↩ Revertir marcadas</button>`:''}</div>
    <div class="csal-scroll"><table class="csal-t"><tr><th><input type="checkbox" onclick="document.querySelectorAll('.csal-chk2').forEach(x=>x.checked=this.checked)"></th><th>Estado</th><th>Bloque</th><th>Detalle</th><th>Proveedor</th><th class="r">Total</th><th>Última acción</th></tr>`;
  rev.forEach(i=>{ const l=(i.hist||[])[i.hist.length-1]; h+=`<tr><td><input type="checkbox" class="csal-chk2" value="${i.id}"></td><td><span class="csal-st st-${i.estado}">${ESTADOS[i.estado]}</span></td><td>${BLOQUES[i.bloque]}${i.area?' · '+esc(i.area):''}</td><td>${esc(i.detalle)}</td><td style="font-size:11px">${esc(prov(i.prov).nombre)}</td><td class="r">${$(calc(i).total)}</td><td class="csal-hist">${l?esc(l.a)+' · '+quien(l)+' · '+esc(l.f):''}</td></tr>`; });
  if (!rev.length) h+=`<tr><td colspan="7" class="csal-empty">No hay líneas aprobadas o anuladas</td></tr>`;
  return h+`</table></div></div>`;
}

function vProv(){
  const q = norm(st.filtroProv);
  const lista = provs().filter(p=>!q || norm(p.nombre+' '+(p.ruc||'')+' '+(p.area||'')).indexOf(q)>-1).sort((a,b)=>String(a.nombre).localeCompare(b.nombre));
  const can = P.catalogo(role());
  const canAdd = P.registrar(role()) && editable();
  let h = '';
  if (!provs().length) {
    return `<div class="csal-card"><div class="csal-empty" style="padding:34px 20px"><b style="color:#1F4E79">El catálogo de proveedores está vacío</b>
      <p style="margin:8px 0 14px">${can?'Importa el catálogo inicial (archivo <code>catalogo_cuadro_salida.json</code>) o crea los proveedores uno por uno.':'Pide a Administración o al Master que cargue el catálogo.'}</p>
      ${can?`<button class="csal-btn pri" onclick="document.getElementById('csal-imp').click()">⬆ Importar catálogo</button> <button class="csal-btn" onclick="CSAL.editProv(null)">+ Nuevo proveedor</button>`:''}</div></div>`;
  }
  h += `<div class="csal-tool"><input class="csal-search" placeholder="Buscar proveedor, RUC o área…" value="${esc(st.filtroProv)}" oninput="CSAL.filtrar(this.value)"><span class="csal-tool-r">${can?`<button class="csal-btn" onclick="document.getElementById('csal-imp').click()">⬆ Importar</button><button class="csal-btn pri" onclick="CSAL.editProv(null)">+ Nuevo proveedor</button>`:''}</span></div>`;
  h += `<div class="csal-card"><div class="csal-scroll"><table class="csal-t"><tr><th>Proveedor</th><th>RUC</th><th>Área</th><th class="csal-hide-m">Categoría</th><th class="r">Ret. fuente</th><th class="r">Ret. IVA</th><th></th></tr>`;
  lista.forEach(p=>{
    const bq = p.cat==='TRABAJO' ? 'trab' : (['MATERIALES','CONSUMIBLE','SERVICIO'].indexOf(p.cat)>-1 ? 'mat' : 'trab');
    h+=`<tr><td>${esc(p.nombre)}</td><td style="font-size:11px">${esc(p.ruc)||'<span class="csal-note">—</span>'}</td><td style="font-size:11px">${esc(p.area)||'—'}</td><td class="csal-hide-m" style="font-size:11px">${esc(p.cat)||'—'}</td><td class="r">${pct(p.rf)}</td><td class="r">${pct(p.ri)}</td><td><div class="csal-acts">${canAdd&&cur()?`<button class="csal-btn pri" onclick="CSAL.multi({prov:'${p.id}',bloque:'${bq}'})">+ Ítems</button>`:''}${can?`<button class="csal-btn" onclick="CSAL.editProv('${p.id}')">Editar</button>`:''}</div></td></tr>`; });
  return h+`</table></div></div>`;
}

/* ── modales ── */
function ovl(){ return document.getElementById('csal-ovl'); }
function modal(){ return document.getElementById('csal-modal'); }
function modalAbierto(){ const o=ovl(); return !!o && o.classList.contains('show'); }
function openM(html, wide){ const m=modal(); m.innerHTML = html; m.classList.toggle('wide', !!wide); ovl().classList.add('show'); }
function closeM(){ const o=ovl(); if(o) o.classList.remove('show'); M=null; H=null; if (pendingRender) render(); }
function hasFocusInside(){
  const a=document.activeElement; if(!a) return false;
  if (['INPUT','TEXTAREA','SELECT'].indexOf(a.tagName)<0) return false;
  const box=document.getElementById('screen-cuadro'); return !!(box && box.contains(a));
}
function provOptions(sel){ return provs().sort((a,b)=>String(a.nombre).localeCompare(b.nombre)).map(p=>`<option value="${esc(p.id)}" ${p.id===sel?'selected':''}>${esc(p.nombre)}</option>`).join(''); }
function areaLista(){ const c=cur(); return AREAS_TRAB.concat(((c&&c.areasExtra)||[]).filter(a=>AREAS_TRAB.indexOf(a)<0)); }
function areaOptions(sel){
  const l = areaLista(); if (sel && l.indexOf(sel)<0) l.push(sel);
  return l.map(a=>`<option value="${esc(a)}" ${a===sel?'selected':''}>${esc(a)}</option>`).join('');
}
function toast(msg, err){
  document.querySelectorAll('.csal-toast').forEach(x=>x.remove());
  const t=document.createElement('div'); t.className='csal-toast'+(err?' err':''); t.textContent=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(), err?4000:2200);
}
function pedirMotivo(titulo, nota, fn){
  openM(`<h4>${esc(titulo)}</h4><p class="csal-note" style="margin-bottom:12px">${esc(nota)}</p>
    <div class="csal-row"><label>Motivo (opcional)</label><textarea id="csm-mot" placeholder="Ej.: proveedor cambió la cotización"></textarea></div>
    <div class="csal-mact"><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" id="csm-ok">Confirmar</button></div>`);
  document.getElementById('csm-mot').focus();
  document.getElementById('csm-ok').onclick = function(){ const m=document.getElementById('csm-mot').value.trim(); closeM(); fn(m); toast('Listo · queda en el historial'); };
}
function parseNum(s){ // acepta 1.250,50 · 1,250.50 · 1250.5 · $ 1250
  s=String(s||'').replace(/[$\s]|USD/gi,''); if(!/\d/.test(s)||/[a-z]/i.test(s)) return NaN;
  const lc=s.lastIndexOf(','), ld=s.lastIndexOf('.');
  if(lc>-1&&ld>-1){ s = lc>ld ? s.replace(/\./g,'').replace(',','.') : s.replace(/,/g,''); }
  else if(lc>-1){ s = (s.split(',').length>2) ? s.replace(/,/g,'') : s.replace(',','.'); }
  else if(ld>-1 && s.split('.').length>2){ s=s.replace(/\./g,''); }
  return parseFloat(s);
}
function blankRow(){ return {detalle:'', area:(M&&M.area)||AREAS_TRAB[0], prov:(M&&M.prov)||'', sub:0, iva:15, obs:''}; }

function mRender(){
  const showArea = M.bloque!=='mat';
  const colArea = showArea && !M.fixArea, colProv = !M.fixProv;
  openM(`<h4>Agregar varias líneas</h4>
    <div class="csal-grid3">
      <div class="csal-row"><label>Bloque</label><select onchange="CSAL.mSet('bloque',this.value)">${Object.keys(BLOQUES).map(k=>`<option value="${k}" ${k===M.bloque?'selected':''}>${BLOQUES[k]}</option>`).join('')}</select></div>
      ${showArea?`<div class="csal-row"><label><input type="checkbox" ${M.fixArea?'checked':''} onchange="CSAL.mSet('fixArea',this.checked)"> Misma área para todas</label>
        ${M.fixArea?`<select onchange="CSAL.mSet('area',this.value)">${areaOptions(M.area)}</select>`:'<div class="csal-note" style="padding:8px 0">Elige el área en cada línea</div>'}</div>`:'<div></div>'}
      <div class="csal-row"><label><input type="checkbox" ${M.fixProv?'checked':''} onchange="CSAL.mSet('fixProv',this.checked)"> Mismo proveedor para todas</label>
        ${M.fixProv?`<select onchange="CSAL.mSet('prov',this.value)"><option value="">— Elegir —</option>${provOptions(M.prov)}</select>`:'<div class="csal-note" style="padding:8px 0">Elige el proveedor en cada línea</div>'}</div>
    </div>
    ${provs().length?'':'<div class="csal-lock">El catálogo de proveedores está vacío. Pide a Administración o al Master que lo cargue en la pestaña Proveedores.</div>'}
    <div class="csal-note" style="margin-bottom:6px">Consejo: puedes copiar filas desde Excel (detalle y valor) y pegarlas en la primera casilla de detalle.</div>
    <div class="csal-scroll"><table class="csal-t csal-mt"><tr><th>#</th><th>${M.bloque==='rep'?'Repuesto':'Detalle'}</th>${colArea?'<th>Área</th>':''}${colProv?'<th>Proveedor</th>':''}<th class="r">Subtotal</th><th>IVA</th><th class="r">A pagar</th><th></th></tr>
    ${M.rows.map((r,i)=>`<tr>
      <td class="csal-note">${i+1}</td>
      <td><input class="csm-det" value="${esc(r.detalle)}" oninput="CSAL.mRow(${i},'detalle',this.value)" onpaste="CSAL.mPaste(event,${i})" placeholder="Descripción"></td>
      ${colArea?`<td><select onchange="CSAL.mRow(${i},'area',this.value)">${areaOptions(r.area)}</select></td>`:''}
      ${colProv?`<td><select onchange="CSAL.mRow(${i},'prov',this.value)"><option value="">— Elegir —</option>${provOptions(r.prov)}</select></td>`:''}
      <td><input type="number" step="0.01" min="0" class="csm-sub" value="${r.sub||''}" oninput="CSAL.mRow(${i},'sub',this.value)" onkeydown="CSAL.mEnter(event,${i})"></td>
      <td><select onchange="CSAL.mRow(${i},'iva',this.value)"><option value="15" ${r.iva==15?'selected':''}>15%</option><option value="0" ${r.iva==0?'selected':''}>0%</option></select></td>
      <td class="r csm-pag" data-i="${i}">—</td>
      <td><div class="csal-acts"><button class="csal-btn" title="Duplicar fila" onclick="CSAL.mDup(${i})">⧉</button><button class="csal-btn warn" title="Quitar fila" onclick="CSAL.mDel(${i})">✕</button></div></td></tr>`).join('')}
    </table></div>
    <div style="display:flex;gap:6px;margin-top:8px"><button class="csal-btn" onclick="CSAL.mAdd()">+ Fila</button><button class="csal-btn" onclick="CSAL.mAdd(5)">+ 5 filas</button></div>
    <div class="csal-calc" id="csm-tot" style="margin-top:12px"></div>
    <div class="csal-mact"><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" onclick="CSAL.mGuardar()">Guardar líneas</button></div>`, true);
  mTotals();
}
function mTotals(){
  let n=0,tot=0,pag=0;
  M.rows.forEach((r,i)=>{
    const pv = M.fixProv?M.prov:r.prov;
    const cell = document.querySelector(`#csal-modal .csm-pag[data-i="${i}"]`);
    const k = calc({sub:r.sub||0, iva:r.iva, prov:pv});
    if(cell) cell.textContent = r.sub ? $(k.pagar) : '—';
    if(r.detalle.trim()){ n++; tot+=k.total; pag+=k.pagar; }
  });
  const el=document.getElementById('csm-tot');
  if(el) el.innerHTML=`<span>Líneas a guardar</span><b>${n}</b><span>Total con IVA</span><b>${$(tot)}</b><span>A pagar (neto de retenciones)</span><b>${$(pag)}</b>`;
}
function hRender(){
  openM(`<h4>Rubros habituales · ${BARCOS[st.barco]}</h4>
    <p class="csal-note" style="margin-bottom:10px">Es la lista que se carga con “Cargar rubros habituales” o al crear un viaje nuevo. Los cambios no modifican los viajes que ya existen.</p>
    <div class="csal-scroll" style="max-height:52vh;overflow-y:auto"><table class="csal-t csal-mt"><tr><th>#</th><th>Rubro</th><th>Proveedor habitual</th><th>IVA</th><th></th></tr>
    ${H.map((r,i)=>`<tr><td class="csal-note">${i+1}</td>
      <td><input class="csm-det csm-hdet" value="${esc(r.detalle)}" oninput="CSAL.hRow(${i},'detalle',this.value)"></td>
      <td><select onchange="CSAL.hRow(${i},'prov',this.value)"><option value="">— Elegir —</option>${provOptions(r.prov)}</select></td>
      <td><select onchange="CSAL.hRow(${i},'iva',this.value)"><option value="15" ${r.iva==15?'selected':''}>15%</option><option value="0" ${r.iva==0?'selected':''}>0%</option></select></td>
      <td><div class="csal-acts"><button class="csal-btn" title="Subir" onclick="CSAL.hMove(${i},-1)">↑</button><button class="csal-btn" title="Bajar" onclick="CSAL.hMove(${i},1)">↓</button><button class="csal-btn warn" title="Quitar" onclick="CSAL.hDel(${i})">✕</button></div></td></tr>`).join('')}
    </table></div>
    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="csal-btn" onclick="CSAL.hAdd()">+ Rubro</button><button class="csal-btn" onclick="CSAL.hCopiar()">Copiar lista del otro barco</button></div>
    <div class="csal-mact"><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" onclick="CSAL.hGuardar()">Guardar lista</button></div>`, true);
}
function nuevasDesdeHabituales(){
  const c = cur(); const ya = new Set(its(c).filter(i=>i.bloque==='mat').map(i=>norm(i.detalle)));
  const base = Date.now();
  return (DATA.habituales[st.barco]||[]).filter(r=>!ya.has(norm(r.detalle))).map((r,ix)=>({
    id:nid(), ts:base+ix, bloque:'mat', area:'', detalle:r.detalle, prov:r.prov||'', sub:0, iva:Number(r.iva)||0, obs:'', estado:'registrado', hist:[firma('Registrado (habitual)')]
  }));
}

/* ── API pública ── */
const api = {
  init: function(u){
    user = { name:u.name, key:u.key, role:u.role };
    if (!inited) {
      inited = true;
      try { const c=localStorage.getItem(LS); if(c) DATA=normalizar(JSON.parse(c)); } catch(e){}
      ovl().addEventListener('click', e=>{ if(e.target===ovl()) closeM(); });
      document.addEventListener('keydown', e=>{ if(e.key==='Escape' && modalAbierto()) closeM(); });
      initFirebase();
    }
    elegirViaje(); render();
  },
  setBarco(b){ st.barco=b; st.viaje=null; elegirViaje(); render(); },
  setViaje(v){ st.viaje=v||null; render(); },
  tab(t){ st.tab=t; render(); },
  toggle(k){ st.open[k] = st.open[k]===false; render(); },
  ocultarVacias(v){ st.ocultarVacias=v; render(); },
  filtrar(v){ st.filtroProv=v; render(); const i=document.querySelector('#screen-cuadro .csal-search'); if(i){ i.focus(); i.setSelectionRange(v.length,v.length); } },
  setFecha(v){ wMeta({fecha:v}); },
  setEstado(v){
    if (!P.estado(role())) { toast('Solo el Master puede cambiar el estado del cuadro', true); render(); return; }
    const c=cur(); if(!c || v===c.estado) return;
    if (!confirm(v==='cerrado' ? '¿Cerrar el cuadro? Nadie más podrá modificarlo hasta que lo reabras.' : '¿Reabrir el cuadro?')) { render(); return; }
    const f = firma(v==='cerrado'?'Cerrado':'Reabierto');
    const hist = (c.estadoHist||[]).concat([f]);
    wMeta({estado:v, estadoPor:f, estadoHist:hist});
  },
  setResp(id){
    const us = (typeof AUTH!=='undefined'&&AUTH.users)?AUTH.users:{}; if(!us[id]) return;
    const c=cur(); const f=firma('Responsable: '+us[id].name);
    wMeta({resp:{id:id, name:us[id].name}, respHist:(c.respHist||[]).concat([f])});
  },
  nuevoViaje(){
    const vs = viajesOrdenados(st.barco); const n = vs.length ? String(Number(vs[0])+1) : '';
    openM(`<h4>Nuevo cuadro de salida · ${BARCOS[st.barco]}</h4>
      <div class="csal-grid"><div class="csal-row"><label>N.º de viaje</label><input id="csm-v" type="number" min="1" value="${n}"></div><div class="csal-row"><label>Fecha de salida</label><input id="csm-f" type="date"></div></div>
      <div class="csal-row"><label>Responsable</label><div class="csal-val">${esc(user.name)} <span class="csal-user">(${esc(user.key)})</span></div></div>
      ${(DATA.habituales[st.barco]||[]).length?`<div class="csal-row"><label><input type="checkbox" id="csm-r" checked> Cargar los ${(DATA.habituales[st.barco]||[]).length} rubros habituales de materiales y servicios (valor en 0)</label></div>`:''}
      <div class="csal-mact"><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" onclick="CSAL.crearViaje()">Crear</button></div>`);
    document.getElementById('csm-v').focus();
  },
  crearViaje(){
    const v = document.getElementById('csm-v').value.trim();
    if (!/^\d+$/.test(v)) { alert('Escribe el número de viaje'); return; }
    if (viajesDe(st.barco)[v]) { alert('Ya existe el cuadro del viaje '+v); return; }
    const conRub = !!(document.getElementById('csm-r') && document.getElementById('csm-r').checked);
    const f = firma('Creado');
    const meta = { fecha:document.getElementById('csm-f').value||'', estado:'abierto', creado:f, resp:{id:user.key, name:user.name} };
    DATA.viajes[st.barco][v] = Object.assign({items:{}}, meta);
    st.viaje = v; st.tab = conRub ? 'mat' : 'trab';
    const upd = Object.assign({}, meta);
    if (conRub) nuevasDesdeHabituales().forEach(it=>{ DATA.viajes[st.barco][v].items[it.id]=it; upd['items/'+it.id]=it; });
    closeM(); render();
    if (fbReady) escribir(db.ref(vpath()).update(upd));
    toast('Cuadro del viaje '+v+' creado');
  },
  cargarRubros(){
    if (!(DATA.habituales[st.barco]||[]).length) { toast('No hay rubros habituales para '+BARCOS[st.barco], true); return; }
    const nuevas = nuevasDesdeHabituales();
    if (!nuevas.length) { toast('Todos los habituales ya están en el viaje'); return; }
    wItems(nuevas); toast(nuevas.length+' rubros agregados');
  },
  editar(id){
    const it = its(cur()).find(i=>i.id===id); if(!it) return;
    const b = it.bloque;
    openM(`<h4>Editar línea · ${BLOQUES[b]}</h4>
      ${b!=='mat'?`<div class="csal-row"><label>Área</label><select id="csm-area">${areaOptions(it.area)}</select></div>`:''}
      <div class="csal-row"><label>${b==='rep'?'Repuesto':'Detalle'}</label><input id="csm-det" value="${esc(it.detalle)}"></div>
      <div class="csal-row"><label>Proveedor</label><select id="csm-prov"><option value="">— Elegir —</option>${provOptions(it.prov)}</select></div>
      <div class="csal-grid"><div class="csal-row"><label>Subtotal (USD)</label><input id="csm-sub" type="number" step="0.01" min="0" value="${it.sub||''}"></div>
        <div class="csal-row"><label>IVA</label><select id="csm-iva"><option value="15" ${it.iva==15?'selected':''}>15%</option><option value="0" ${it.iva==0?'selected':''}>0%</option></select></div></div>
      <div class="csal-calc" id="csm-calc"></div>
      <div class="csal-row"><label>Observación</label><textarea id="csm-obs">${esc(it.obs)}</textarea></div>
      <div class="csal-hist" style="line-height:1.6">${(it.hist||[]).map(x=>esc(x.a)+' · '+quien(x)+' · '+esc(x.f)).join('<br>')}</div>
      <div class="csal-mact"><button class="csal-btn warn" onclick="CSAL.borrar('${id}')" style="margin-right:auto">Eliminar</button><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" onclick="CSAL.guardar('${id}')">Guardar</button></div>`);
    const upd=()=>{ const p=prov(document.getElementById('csm-prov').value); const r=calc({sub:+document.getElementById('csm-sub').value||0,iva:+document.getElementById('csm-iva').value,prov:p.id});
      document.getElementById('csm-calc').innerHTML=`<span>Total factura</span><b>${$(r.total)}</b><span>Ret. fuente ${pct(p.rf)}</span><span>−${$(r.rf)}</span><span>Ret. IVA ${pct(p.ri)}</span><span>−${$(r.ri)}</span><span>A pagar al proveedor</span><b>${$(r.pagar)}</b>`; };
    ['csm-prov','csm-sub','csm-iva'].forEach(x=>document.getElementById(x).addEventListener('input',upd)); upd();
  },
  guardar(id){
    const det=document.getElementById('csm-det').value.trim(), pv=document.getElementById('csm-prov').value;
    if(!det||!pv){ alert('Completa detalle y proveedor'); return; }
    const old = its(cur()).find(i=>i.id===id); if(!old) return;
    const it = Object.assign({}, old, {
      area: old.bloque==='mat' ? '' : document.getElementById('csm-area').value,
      detalle:det, prov:pv, sub:+document.getElementById('csm-sub').value||0, iva:+document.getElementById('csm-iva').value,
      obs:document.getElementById('csm-obs').value.trim()
    });
    it.hist = (old.hist||[]).concat([firma('Editado')]);
    closeM(); wItems([it]);
  },
  borrar(id){
    const it = its(cur()).find(i=>i.id===id); if(!it) return;
    if (!confirm('¿Eliminar "'+it.detalle+'"?')) return;
    closeM(); wDelItem(id); toast('Línea eliminada');
  },
  aprobar(id){
    const it = its(cur()).find(i=>i.id===id); if(!it) return;
    wItems([Object.assign({}, it, {estado:'aprobado', hist:(it.hist||[]).concat([firma('Aprobado')])})]);
  },
  aprobarSel(ok){
    const ids = Array.prototype.map.call(document.querySelectorAll('.csal-chk:checked'), x=>x.value);
    if(!ids.length){ toast('Marca al menos una línea', true); return; }
    const list = its(cur()).filter(i=>ids.indexOf(i.id)>-1).map(i=>Object.assign({}, i, {estado:ok?'aprobado':'rechazado', hist:(i.hist||[]).concat([firma(ok?'Aprobado':'Anulado')])}));
    wItems(list); toast(list.length+' línea'+(list.length>1?'s':'')+(ok?' aprobada':' anulada')+(list.length>1?'s':''));
  },
  revertir(ids){
    const list = its(cur()).filter(i=>ids.indexOf(i.id)>-1 && (i.estado==='aprobado'||i.estado==='rechazado'));
    if(!list.length){ toast('Marca al menos una línea aprobada o anulada', true); return; }
    pedirMotivo('Revertir '+list.length+' línea'+(list.length>1?'s':''), 'Las líneas vuelven a Registrado y deberán aprobarse de nuevo.', function(motivo){
      wItems(list.map(i=>Object.assign({}, i, {estado:'registrado', hist:(i.hist||[]).concat([firma('Revertido ('+ESTADOS[i.estado]+' → Registrado)'+(motivo?' · '+motivo:''))])})));
    });
  },
  areaAdicional(){
    openM(`<h4>Área adicional · viaje ${esc(st.viaje)}</h4><p class="csal-note" style="margin-bottom:12px">Para trabajos que no encajan en las áreas fijas (equivale a "Trabajos adicionales" del Excel). Solo aparece en este viaje.</p>
      <div class="csal-row"><label>Nombre del área</label><input id="csm-an" placeholder="Ej.: TRABAJOS EN BODEGA"></div>
      <div class="csal-mact"><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" onclick="CSAL.guardarArea()">Crear</button></div>`);
    document.getElementById('csm-an').focus();
  },
  guardarArea(){
    const n=document.getElementById('csm-an').value.trim().toUpperCase(); if(!n){ alert('Escribe el nombre'); return; }
    const c=cur(); const ex=c.areasExtra||[];
    if(AREAS_TRAB.concat(ex).some(a=>norm(a)===norm(n))){ alert('Esa área ya existe'); return; }
    closeM(); wMeta({areasExtra:ex.concat([n])}); toast('Área '+n+' creada');
  },
  habituales(){ H = (DATA.habituales[st.barco]||[]).map(r=>Object.assign({}, r)); hRender(); },
  hRow(i,k,v){ H[i][k] = k==='iva' ? +v : v; },
  hAdd(){ H.push({detalle:'',prov:'',iva:15}); hRender(); const ins=document.querySelectorAll('#csal-modal .csm-hdet'); if(ins.length) ins[ins.length-1].focus(); },
  hDel(i){ H.splice(i,1); hRender(); },
  hMove(i,d){ const j=i+d; if(j<0||j>=H.length) return; const t=H[i]; H[i]=H[j]; H[j]=t; hRender(); },
  hCopiar(){ const o=st.barco==='MF'?'MG':'MF'; if(!confirm('¿Reemplazar esta lista por la de '+BARCOS[o]+'?')) return; H=(DATA.habituales[o]||[]).map(r=>Object.assign({}, r)); hRender(); },
  hGuardar(){
    const lista=H.filter(r=>String(r.detalle).trim()).map(r=>({detalle:String(r.detalle).trim().toUpperCase(), prov:r.prov||'', iva:Number(r.iva)||0}));
    const sinProv=lista.findIndex(r=>!r.prov); if(sinProv>-1){ alert('Falta el proveedor en el rubro '+(sinProv+1)); return; }
    const dup=lista.find((r,i)=>lista.findIndex(x=>x.detalle===r.detalle&&x.prov===r.prov)!==i); if(dup){ alert('Rubro repetido: '+dup.detalle); return; }
    const b = st.barco; DATA.habituales[b]=lista; closeM(); render();
    if (fbReady) escribir(db.ref(FB+'/habituales/'+b).set(lista));
    toast('Lista de habituales guardada ('+lista.length+' rubros)');
  },
  editProv(id){
    const p = id ? prov(id) : {nombre:'',ruc:'',area:'',cat:'',rf:0,ri:0};
    const RF=[0,0.01,0.0175,0.02,0.0275,0.03,0.08,0.1], RI=[0,0.1,0.2,0.3,0.7,1];
    const opt=(arr,v)=>{ const l=arr.slice(); if(l.every(x=>Math.abs(x-(Number(v)||0))>1e-9)) l.push(Number(v)||0); return l.sort((a,b)=>a-b).map(x=>`<option value="${x}" ${Math.abs(x-(Number(v)||0))<1e-9?'selected':''}>${pct(x)}</option>`).join(''); };
    openM(`<h4>${id?'Editar':'Nuevo'} proveedor</h4>
      <div class="csal-row"><label>Razón social</label><input id="csm-n" value="${esc(p.nombre)}"></div>
      <div class="csal-grid"><div class="csal-row"><label>RUC</label><input id="csm-ruc" value="${esc(p.ruc)}" maxlength="13" inputmode="numeric"></div><div class="csal-row"><label>Área</label><input id="csm-a" value="${esc(p.area)}"></div></div>
      <div class="csal-grid"><div class="csal-row"><label>Categoría</label><select id="csm-c">${['','TRABAJO','MATERIALES','SERVICIO','CONSUMIBLE'].map(x=>`<option value="${x}" ${x===(p.cat||'')?'selected':''}>${x||'—'}</option>`).join('')}</select></div><div></div></div>
      <div class="csal-grid"><div class="csal-row"><label>% Ret. fuente</label><select id="csm-rf">${opt(RF,p.rf)}</select></div>
        <div class="csal-row"><label>% Ret. IVA</label><select id="csm-ri">${opt(RI,p.ri)}</select></div></div>
      <div class="csal-mact"><button class="csal-btn" onclick="CSAL.close()">Cancelar</button><button class="csal-btn pri" onclick="CSAL.guardarProv('${id||''}')">Guardar</button></div>`);
  },
  guardarProv(id){
    const d={nombre:document.getElementById('csm-n').value.trim().toUpperCase(),ruc:document.getElementById('csm-ruc').value.trim(),area:document.getElementById('csm-a').value.trim().toUpperCase(),cat:document.getElementById('csm-c').value,rf:+document.getElementById('csm-rf').value,ri:+document.getElementById('csm-ri').value};
    if(!d.nombre){ alert('Falta la razón social'); return; }
    if(d.ruc && !/^\d{10}(\d{3})?$/.test(d.ruc)){ alert('El RUC debe tener 13 dígitos (o 10 de cédula)'); return; }
    if(provs().some(p=>p.id!==id && norm(p.nombre)===norm(d.nombre))){ alert('Ya existe un proveedor con ese nombre'); return; }
    const pid = id || nid('p');
    d.mod = firma(id?'Editado':'Creado');
    DATA.proveedores[pid]=d; closeM(); render();
    if (fbReady) escribir(db.ref(FB+'/proveedores/'+pid).set(d));
  },
  importar(input){
    const f = input.files && input.files[0]; input.value='';
    if (!f) return;
    if (!P.catalogo(role())) { toast('Solo Administración o Master pueden importar el catálogo', true); return; }
    const rd = new FileReader();
    rd.onload = function(){
      let j; try { j = JSON.parse(rd.result); } catch(e){ toast('El archivo no es un JSON válido', true); return; }
      if (!j || j.tipo!=='cuadro_salida_catalogo' || !j.proveedores) { toast('El archivo no es un catálogo del Cuadro de Salida', true); return; }
      const nP = Object.keys(j.proveedores).length, nMF=(j.habituales&&j.habituales.MF||[]).length, nMG=(j.habituales&&j.habituales.MG||[]).length;
      const reemplaza = provs().length ? '\n\nATENCIÓN: reemplaza el catálogo actual ('+provs().length+' proveedores) y las listas de habituales.' : '';
      if (!confirm('Importar '+nP+' proveedores y '+nMF+' / '+nMG+' rubros habituales (MF / MG)?'+reemplaza)) return;
      const upd = { proveedores:j.proveedores, 'habituales/MF':(j.habituales&&j.habituales.MF)||[], 'habituales/MG':(j.habituales&&j.habituales.MG)||[] };
      DATA.proveedores = j.proveedores; DATA.habituales = {MF:upd['habituales/MF'], MG:upd['habituales/MG']}; render();
      if (fbReady) escribir(db.ref(FB).update(upd));
      toast('Catálogo importado: '+nP+' proveedores');
    };
    rd.readAsText(f);
  },
  /* ── carga de varias líneas ── */
  multi(o){
    const pv = o.prov ? prov(o.prov) : null;
    const areaProv = pv && AREAS_TRAB.find(a=>norm(a)===norm(pv.area));
    const areaCtx = (o.areaIx!=null) ? areaLista()[o.areaIx] : null;
    M = { bloque:o.bloque||'trab', area:areaCtx||areaProv||AREAS_TRAB[0], prov:o.prov||'', fixArea:true, fixProv: !!o.prov || areaCtx==null, rows:[] };
    for(let i=0;i<3;i++) M.rows.push(blankRow());
    mRender();
  },
  mSet(k,v){ M[k]=v; if(k==='bloque'||k==='fixArea'||k==='fixProv') mRender(); else mTotals(); },
  mRow(i,k,v){ M.rows[i][k] = (k==='sub'||k==='iva') ? (+v||0) : v; mTotals(); },
  mEnter(e,i){ if(e.key!=='Enter') return; e.preventDefault(); if(i===M.rows.length-1) api.mAdd(); else { const d=document.querySelectorAll('#csal-modal .csm-det'); if(d[i+1]) d[i+1].focus(); } },
  mAdd(n){ n=n||1; for(let i=0;i<n;i++) M.rows.push(blankRow()); mRender(); const ins=document.querySelectorAll('#csal-modal .csm-det'); if(ins[ins.length-n]) ins[ins.length-n].focus(); },
  mDel(i){ M.rows.splice(i,1); if(!M.rows.length) M.rows.push(blankRow()); mRender(); },
  mDup(i){ M.rows.splice(i+1,0,Object.assign({}, M.rows[i], {detalle:''})); mRender(); const d=document.querySelectorAll('#csal-modal .csm-det'); if(d[i+1]) d[i+1].focus(); },
  mPaste(e,i){
    const t=(e.clipboardData||window.clipboardData).getData('text');
    if(!/[\t\n]/.test(t.trim())) return;
    e.preventDefault();
    t.replace(/\r/g,'').split('\n').filter(l=>l.trim()).forEach((l,k)=>{
      const cols=l.split('\t').map(c=>c.trim()); const nums=cols.map(parseNum);
      let sub=0; for(let j=cols.length-1;j>0;j--){ if(!isNaN(nums[j])){ sub=nums[j]; break; } }
      if(!M.rows[i+k]) M.rows.push(blankRow());
      M.rows[i+k].detalle=cols[0]; if(sub) M.rows[i+k].sub=sub;
    });
    mRender();
  },
  mGuardar(){
    const valid = M.rows.filter(r=>r.detalle.trim());
    if(!valid.length){ alert('Escribe al menos un detalle'); return; }
    let err='';
    valid.forEach((r,k)=>{
      if(!(M.fixProv?M.prov:r.prov)) err=err||('Falta el proveedor en la línea '+(k+1));
      if(M.bloque!=='mat' && !(M.fixArea?M.area:r.area)) err=err||('Falta el área en la línea '+(k+1));
    });
    if(err){ alert(err); return; }
    const base = Date.now(), bloque = M.bloque;
    const list = valid.map((r,ix)=>({ id:nid(), ts:base+ix, bloque:bloque, area:bloque==='mat'?'':(M.fixArea?M.area:r.area), detalle:r.detalle.trim(), prov:M.fixProv?M.prov:r.prov,
      sub:r.sub||0, iva:r.iva, obs:'', estado:'registrado', hist:[firma('Registrado')] }));
    closeM(); st.tab=bloque; wItems(list);
    toast(list.length+' línea'+(list.length>1?'s':'')+' agregada'+(list.length>1?'s':''));
  },
  close: closeM
};
return api;
})();
