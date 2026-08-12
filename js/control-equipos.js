/* ════════════════════════════════════════════
   CONTROL DE EQUIPOS — scoped module
════════════════════════════════════════════ */
var EQUIPOS = (function() {

/* ============ ESTADOS ============ */
const ESTADOS = {
  OK:{key:'OK',label:'✔ OK',cls:'badge-teal'},
  ATENCION:{key:'ATENCION',label:'⚠ Atención',cls:'badge-amber'},
  MANTENIMIENTO:{key:'MANTENIMIENTO',label:'⛔ Mantenimiento',cls:'badge-coral'},
  BAJA:{key:'BAJA',label:'Dado de baja',cls:'badge-purple'},
  SIN_DATOS:{key:'SIN_DATOS',label:'Sin datos',cls:'badge-gray'},
  N_A:{key:'N_A',label:'N/A',cls:'badge-gray'}
};
const ESTADO_OPTIONS = ['auto','OK','ATENCION','MANTENIMIENTO','BAJA','SIN_DATOS'];

function sumVals(obj){
  return Object.values(obj||{}).reduce((s,v)=>{const n=parseFloat(v);return s+(isNaN(n)?0:n);},0);
}
function calcEstadoEquipo(eq){
  if(eq.estadoManual && eq.estadoManual!=='auto') return ESTADOS[eq.estadoManual];
  const h26 = parseFloat(eq.h26);
  const umb = parseFloat(eq.umbral);
  if(isNaN(h26) || h26===0) return ESTADOS.SIN_DATOS;
  if(isNaN(umb) || umb<=0) return ESTADOS.N_A;
  const pct = h26/umb*100;
  if(pct<80) return ESTADOS.OK;
  if(pct<95) return ESTADOS.ATENCION;
  return ESTADOS.MANTENIMIENTO;
}
function calcEstadoWinche(w){
  if(w.estadoManual && w.estadoManual!=='auto') return ESTADOS[w.estadoManual];
  const totH=sumVals(w.horas), totL=sumVals(w.lances);
  if(totH===0 && totL===0) return ESTADOS.SIN_DATOS;
  return ESTADOS.OK;
}
function calcEstadoCable(c){
  if(c.estadoManual && c.estadoManual!=='auto') return ESTADOS[c.estadoManual];
  const totL = sumVals(c.lances);
  const vu = parseFloat(c.vidaUtilRef);
  if(totL===0) return ESTADOS.SIN_DATOS;
  if(isNaN(vu) || vu<=0) return ESTADOS.N_A;
  const pct = totL/vu*100;
  if(pct<80) return ESTADOS.OK;
  if(pct<95) return ESTADOS.ATENCION;
  return ESTADOS.MANTENIMIENTO;
}
function diasUso(dateStr){
  if(!dateStr) return null;
  const d = new Date(dateStr+'T00:00:00');
  if(isNaN(d.getTime())) return null;
  return Math.floor((Date.now()-d.getTime())/86400000);
}

/* ============ SEED DATA ============ */
function uid(p){ return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

function emptySkeleton(){
  return {
    viajes: [],
    categorias: [
      {id:uid('cat'), nombre:'MOTORES Y GENERADORES', equipos:[]},
      {id:uid('cat'), nombre:'EQUIPOS DE FRÍO', equipos:[]}
    ],
    winches: [],
    cables: []
  };
}

function eq(nombre,hist,h26,umbral,horas,nota){
  return {id:uid('eq'), nombre, hist:hist, h26:h26, umbral:umbral, horas:horas||{}, nota:nota||'', estadoManual:'auto'};
}
function wc(nombre,horas,lances){
  return {id:uid('wc'), nombre, horas:horas||{}, lances:lances||{}, estadoManual:'auto'};
}
function cb(funcion,esp,ultimoCambio,lances,vidaUtilRef){
  return {id:uid('cb'), funcion, esp, ultimoCambio:ultimoCambio||'', lances:lances||{}, vidaUtilRef:vidaUtilRef, estadoManual:'auto'};
}

function fatimaSeed(){
  const s = emptySkeleton();
  s.viajes = [
    {id:'V71', inicio:'21/12/25', fin:'30/12/25'},
    {id:'V72', inicio:'09/01/26', fin:'23/01/26'},
    {id:'V73', inicio:'29/01/26', fin:'25/02/26'},
    {id:'V73B', inicio:'12/03/26', fin:'19/03/26'},
    {id:'V74', inicio:'28/03/26', fin:'09/05/26'},
    {id:'V75', inicio:'', fin:''},
    {id:'V76', inicio:'', fin:''},
    {id:'V77', inicio:'', fin:''},
    {id:'V78', inicio:'', fin:''}
  ];
  s.categorias[0].equipos = [
    eq('Motor Principal CAT 398',7290,4389,10000,{V72:286,V73:268,V73B:162,V74:776}),
    (()=>{const e=eq('Motor Generador CAT 3406 Babor (*)',26769,'',  'N/A',{V72:338,V73:105,V73B:165},'Motor CAT 3406 Babor — DADO DE BAJA: descabezó pistón y dañó el block. Reemplazado por motor eléctrico generador de babor.');e.estadoManual='BAJA';return e;})(),
    eq('Motor Eléctrico Generador Babor',529,529,10000,{V74:529}),
    eq('Motor Generador CAT 3406 Estribor',31778,1552,10000,{V72:200,V73:354,V74:998}),
    eq('Motor Eléctrico Generador Estribor',0,0,10000,{}),
    eq('Motor Hidráulico CAT 3406',8702,334,10000,{V72:54,V73:72,V73B:32,V74:87}),
    eq('Motor Panga CAT 3406',355,355,10000,{V72:54,V73:72,V73B:32,V74:57}),
    eq('Speedboat 1 Yamaha 115',0,0,2000,{}),
    eq('Speedboat 2 Yamaha 115',0,0,2000,{})
  ];
  s.categorias[1].equipos = [
    eq('Compresor de Frío N1 Vilter VMC440 - 4CYL (Babor)',15768,0,10000,{}),
    eq('Compresor de Frío N2 Vilter VMC440 - 4CYL (Estribor)',5892,0,10000,{}),
    eq('Compresor de Frío N3',0,0,10000,{}),
    eq('Condensador Alfa Laval M10 - 36 Placas (Babor)',0,0,10000,{}),
    eq('Evaporador Chillers 2x100 Tons c/u (Babor)',0,0,10000,{}),
    eq('Condensador Alfa Laval M10 - 36 Placas (Estribor)',0,0,10000,{}),
    eq('Evaporador Chillers 2x100 Tons c/u (Estribor)',0,0,10000,{}),
    eq('Válvulas de Expansión (2) - 3/4"',0,0,10000,{})
  ];
  s.winches = [
    wc('Winche Pullmaster M8 — Tangón de Babor'),
    wc('Winche Pullmaster H8 — Americana'),
    wc('Winche Pullmaster H18 — Choker'),
    wc('Winche Pullmaster H12 — Pluma Principal'),
    wc('Winche Pullmaster M12 — Mástil'),
    wc('Winche Pullmaster M6 — Osta de Babor P. Principal'),
    wc('Winche Pullmaster M6 — Tangón Estribor Mástil'),
    wc('Winche Gearmatic GH7 — Osta Estribor P. Principal'),
    wc('Winche Pullmaster M5 — Tangón Estribor')
  ];
  s.cables = [
    cb('JARETA','5/8" 80 Bz — Cable rígido acero galv. 6x26WS/FC','',{V71:20},800),
    cb('JARETA','3/4" 180 Bz — Cable rígido acero galv. 6x26WS/FC','',{V71:20},800),
    cb('JARETA','3/4" 300 Bz — Cable rígido acero galv. 6x26WS/FC','',{V71:20},800),
    cb('JARETA','7/8" 190 Bz — Cable rígido acero galv. 6x26WS/FC','',{V71:20},600),
    cb('JARETA','3/4" 200 Bz — Cable rígido acero galv. 6x26WS/FC','',{V71:20},800),
    cb('TOPLINE','7/8" 300 Bz — Cable rígido acero galvanizado','',{V71:20},600),
    cb('DOBLE','5/8" 45 Bz — Cable rígido acero galvanizado','2024-08-16',{V71:20},500),
    cb('BONCHE','5/8" 27 Bz — Cable rígido','2026-03-14',{V71:20},400),
    cb('SINGLE','5/8" 18 Bz — Cable rígido','2025-01-25',{V71:20},400),
    cb('SINGLE TANGÓN ESTRIBOR','5/8" 34 Bz — Cable rígido','2025-01-25',{V71:20},400),
    cb('PLUMA PRINCIPAL','3/4" 50 Bz — Cable rígido','2025-01-23',{V71:20},600),
    cb('FIJO DEL TANGÓN','3/4" 6 Bz — Cable rígido','',{V71:20},300),
    cb('MANIOBRA SPEEDBOAT PROA','5/8" 3 Bz — Cable rígido','2026-03-13',{V71:20},200),
    cb('MANIOBRA SPEEDBOAT POPA','5/8" 3 Bz — Cable rígido','2026-03-13',{V71:20},200),
    cb('HORIZONTAL TANGÓN VIENTOS','5/8" 3.5 Bz — Cable rígido','',{V71:20},300),
    cb('TRINCADOR DEL MACACO','5/8" 10 Bz — Cable rígido','',{V71:20},300),
    cb('RÍGIDO MORIDERO','7/8" 200 Bz — Cable rígido','2026-01-31',{V71:20},600),
    cb('BIGOTE DE PANGA','3/4" 4.5 Bz','',{V71:20},300),
    cb('BIGOTE DE PANGA','13/8" 6 Grilletes','',{V71:20},300),
    cb('MOLA','1" 9 Bz — Cable rígido','2025-06-25',{V71:20},500),
    cb('OSTA DE BABOR','5/8" 40 Bz — Cable rígido','2026-03-13',{V71:20},400),
    cb('OSTA DE ESTRIBOR','5/8" 40 Bz — Cable rígido','2026-03-13',{V71:20},400),
    cb('TANGÓN DE BABOR','5/8" 33 Bz — Cable rígido','',{V71:20},400),
    cb('AMERICANA','5/8" 16 Bz — Cable rígido','2025-01-25',{V71:20},300),
    cb('CABO SAMSON','2" 25 Bz — Samson','2026-03-14',{V71:20},200)
  ];
  return s;
}

function graciaSeed(){
  const s = emptySkeleton();
  s.viajes = [
    {id:'V71', inicio:'21/12/25', fin:'30/12/25'},
    {id:'V50', inicio:'24/01/26', fin:'25/02/26'},
    {id:'V51', inicio:'', fin:''},
    {id:'V52', inicio:'', fin:''},
    {id:'V53', inicio:'', fin:''},
    {id:'V54', inicio:'', fin:''},
    {id:'V55', inicio:'', fin:''}
  ];
  s.categorias[0].equipos = [
    eq('Motor Principal CAT # 3512 Serie 66Z 00713 Arreglo 2W 8868','','',10000,{V50:268,V51:570}),
    eq('Reductora M. Principal CAT 7251 Serie 6L-B00204','','',10000,{V50:105,V51:570}),
    eq('Motor Generador CAT # 3406 Estribor Serie 40601610 Arreglo 2385347','','',10000,{V51:756}),
    eq('Motor Generador CAT # 3406 Babor Serie 40601611 Arreglo 2385347','','',10000,{V50:354,V51:816}),
    eq('Motor Hidráulico CAT # 3408 (sin serie)','','',10000,{V51:100}),
    eq('Motor Panga CAT # 3306 Serie 84Z 01831 Arreglo 7W-1395','','',10000,{V51:70}),
    eq('Speedboat 1 Yamaha 115','','',2000,{V71:72}),
    eq('Speedboat 2 Yamaha 115','','',2000,{V71:72})
  ];
  s.categorias[1].equipos = [
    eq('Compresor de Frío N1 Vilter VMC440 - 4CYL','','',10000,{}),
    eq('Compresor de Frío N2 Vilter VMC440 - 4CYL','','',10000,{}),
    eq('Compresor de Frío N3 Vilter VCM450 - 6CYL','','',10000,{}),
    eq('Condensador SIRSA Titanium de 250 TNL','','',10000,{}),
    eq('Válvulas de Expansión (2) Válvula Aguja - 3/4"','','',10000,{})
  ];
  s.winches = [
    wc('Winche Pullmaster M8 — Tangón de Babor'),
    wc('Winche Pullmaster H8 — Americana'),
    wc('Winche Pullmaster H12 — Proa'),
    wc('Winche Pullmaster — Marco G 300'),
    wc('Winche Pullmaster M12 — Pluma Principal'),
    wc('Winche Pullmaster M12 — Mástil'),
    wc('Winche Pullmaster M6 — Osta de Babor P. Principal'),
    wc('Winche Pullmaster M6 — Tangón Estribor Mástil'),
    wc('Winche Pullmaster PL8 — Osta Estribor P. Principal'),
    wc('Winche Pullmaster PL8 — Tangón Estribor'),
    wc('Winche Trincador PL4')
  ];
  s.cables = [
    cb('JARETA','5/8" 400 Bz — Cable rígido acero galv. 6x26WS/FC — 400 brazas (popa)','',{V50:25},''),
    cb('JARETA','3/4" 200 Bz — Cable rígido acero galv. 6x26WS/FC — 200 brazas (popa)','',{V50:25},''),
    cb('JARETA','3/4" 300 Bz — Cable rígido acero galv. 6x26WS/FC — 250 brazas (proa)','2026-03-10',{V50:25},''),
    cb('JARETA','7/8" 150 Bz — Cable rígido acero galv. 6x26WS/FC — 150 brazas (central)','2026-01-28',{V50:25},''),
    cb('JARETA','3/4" 250 Bz — Cable rígido acero galv. 6x26WS/FC — 250 brazas (proa)','',{V50:25},''),
    cb('TOPLINE','3/4" 300 Bz — Cable rígido acero galvanizado','',{V50:25},''),
    cb('DOBLE','5/8" 60 Bz — Cable rígido acero galvanizado','',{V50:25},''),
    cb('BONCHE','3/4" 25 Bz — Cable rígido','',{V50:25},''),
    cb('SINGLE','3/4" 17 Bz — Cable rígido','',{V50:25},''),
    cb('SINGLE TANGÓN ESTRIBOR','5/8" 17 Bz — Cable rígido','',{V50:25},''),
    cb('PLUMA PRINCIPAL','3/4" 55 Bz — Cable rígido','',{V50:25},''),
    cb('FIJO DEL TANGÓN','3/4" 6 Bz — Cable rígido','',{V50:25},''),
    cb('MANIOBRA SPEEDBOAT PROA','5/8" 7 Bz — Cable rígido','',{V50:25},''),
    cb('MANIOBRA SPEEDBOAT POPA','5/8" 8 Bz — Cabo Samson','',{V50:25},''),
    cb('HORIZONTAL TANGÓN VIENTOS','5/8" 40 Bz — Cabo nylon','',{V50:25},''),
    cb('TRINCADOR DEL MACACO','5/8" 10 Bz — Cable rígido','',{V50:25},''),
    cb('RÍGIDO MORIDERO','7/8" 200 Bz — Cable rígido','',{V50:25},''),
    cb('BIGOTE DE PANGA','7/8" 15 Bz','',{V50:25},''),
    cb('BIGOTE DE PANGA','7/8" 6 Grilletes','',{V50:25},''),
    cb('MOLA','1" 9 Bz — Cable rígido','',{V50:25},''),
    cb('OSTA DE BABOR','3/4" 40 Bz — Cable rígido','',{V50:25},''),
    cb('OSTA DE ESTRIBOR','5/8" 40 Bz — Cable rígido','',{V50:25},''),
    cb('TANGÓN DE BABOR','5/8" 33 Bz — Cable rígido','',{V50:25},''),
    cb('AMERICANA','3/4" 16 Bz — Cable rígido','',{V50:25},''),
    cb('CABO SAMSON','2" 25 Bz — Samson','',{V50:25},''),
    cb('CABO DE CHOCKERT','15 brazas — Cabo Samson de 2"','',{V50:25},'')
  ];
  return s;
}

/* ============ FIREBASE (sincronizacion entre dispositivos) ============ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
  authDomain: "atuntro-portal.firebaseapp.com",
  databaseURL: "https://atuntro-portal-default-rtdb.firebaseio.com",
  projectId: "atuntro-portal",
  storageBucket: "atuntro-portal.firebasestorage.app",
  messagingSenderId: "390090673795",
  appId: "1:390090673795:web:e01a5d03e5543c8dc415b6"
};
const FB_PATH = 'atuntro_equipos/data';
let _fbHandler = null;

function _getDb(){
  try{
    if(typeof firebase === 'undefined') return null;
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    return firebase.database();
  }catch(e){ return null; }
}

function startRealtimeSync(){
  const db = _getDb();
  if(!db) return;
  const ref = db.ref(FB_PATH);
  if(_fbHandler) ref.off('value', _fbHandler);
  _fbHandler = snap => {
    const data = snap.val();
    if(!data) return; // nada remoto aun -- lo local se sube en el proximo persist()
    const json = JSON.stringify(data);
    if(json === _lastRemoteJSON) return;   // es el eco de nuestro propio guardado
    if(_isTyping) return;                    // no reconstruir la tabla mientras se escribe
    _lastRemoteJSON = json;
    state = normalizeState(data);
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
    document.getElementById('eq-vesselSub').textContent = VESSEL_INFO[currentVessel];
    render();
    flashSave();
  };
  ref.on('value', _fbHandler);
}

/* ============ STATE / STORAGE ============ */
const STORAGE_KEY = 'atuntro_equipos_v1';

// Garantiza que cada barco tenga todas las propiedades esperadas.
// Sin esto, un estado guardado (viejo o remoto) al que le falte
// 'categorias', 'winches', 'cables' o 'viajes' rompe el render de
// Motores/Winches (forEach sobre undefined) y la pestaña "no abre".
function normalizeVessel(v, seedFn){
  if(!v || typeof v !== 'object') return seedFn();
  if(!Array.isArray(v.viajes))      v.viajes = [];
  if(!Array.isArray(v.categorias))  v.categorias = [];
  if(!Array.isArray(v.winches))     v.winches = [];
  if(!Array.isArray(v.cables))      v.cables = [];
  // Firebase puede convertir arrays vacíos/dispersos en objetos: re-normalizar
  ['viajes','categorias','winches','cables'].forEach(k=>{
    if(v[k] && !Array.isArray(v[k])) v[k] = Object.values(v[k]);
  });
  v.categorias.forEach(cat=>{
    if(!Array.isArray(cat.equipos)) cat.equipos = cat.equipos ? Object.values(cat.equipos) : [];
    cat.equipos.forEach(e=>{ if(!e.horas || typeof e.horas!=='object') e.horas = {}; });
  });
  v.winches.forEach(w=>{
    if(!w.horas  || typeof w.horas!=='object')  w.horas  = {};
    if(!w.lances || typeof w.lances!=='object') w.lances = {};
  });
  v.cables.forEach(c=>{
    if(!c.lances || typeof c.lances!=='object') c.lances = {};
  });
  return v;
}
function normalizeState(st){
  if(!st || typeof st !== 'object') return { fatima: fatimaSeed(), gracia: graciaSeed() };
  st.fatima = normalizeVessel(st.fatima, fatimaSeed);
  st.gracia = normalizeVessel(st.gracia, graciaSeed);
  return st;
}

let state = null;
let currentVessel = 'fatima';
let currentTab = 'resumen';

// Control de escritura: evita que el sync remoto reconstruya la tabla
// mientras el usuario está escribiendo (causaba perder el foco tras cada dígito).
let _isTyping = false, _typingTO = null, _saveDebounce = null, _lastRemoteJSON = null;
function _markTyping(){ _isTyping = true; clearTimeout(_typingTO); _typingTO = setTimeout(()=>{ _isTyping = false; }, 900); }

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return normalizeState(JSON.parse(raw));
  }catch(e){}
  return { fatima: fatimaSeed(), gracia: graciaSeed() };
}
function persist(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    flashSave();
  }catch(e){}
  const json = JSON.stringify(state);
  if(json === _lastRemoteJSON) return;   // nada cambió respecto a lo remoto
  clearTimeout(_saveDebounce);
  _saveDebounce = setTimeout(()=>{
    _lastRemoteJSON = json;
    const db = _getDb();
    if(db){ db.ref(FB_PATH).set(state).catch(()=>{}); }
  }, 600);
}
function flashSave(){
  const d=document.getElementById('eq-saveDot');
  d.classList.add('show');
  setTimeout(()=>d.classList.remove('show'),1400);
}

const VESSEL_INFO = {
  fatima:'María Fátima (180 TM · ~20 tripulantes)',
  gracia:'María de Gracia (215 TM · ~21 tripulantes)'
};

function switchVessel(v, btn){
  currentVessel = v;
  document.querySelectorAll('.vtab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('eq-vesselSub').textContent = VESSEL_INFO[v];
  render();
}
function switchTab(t){
  currentTab = t;
  document.querySelectorAll('.stab').forEach(b=>b.classList.remove('active'));
  document.getElementById('eq-stab_'+t).classList.add('active');
  render();
}
function V(){ return state[currentVessel]; }

/* ============ VIAJES ============ */
function addViaje(){
  const idEl = document.getElementById('eq-newViajeId');
  const iEl = document.getElementById('eq-newViajeInicio');
  const fEl = document.getElementById('eq-newViajeFin');
  const id = idEl.value.trim();
  if(!id){ idEl.focus(); return; }
  if(V().viajes.some(v=>v.id===id)){ alert('Ya existe un viaje con ese ID.'); return; }
  V().viajes.push({id, inicio:iEl.value, fin:fEl.value});
  persist();
  render();
}
function deleteViaje(id){
  if(!confirm('¿Eliminar el viaje '+id+'? Se borrarán todas las horas/lances registrados en esa columna para este buque.')) return;
  const v = V();
  v.viajes = v.viajes.filter(x=>x.id!==id);
  v.categorias.forEach(c=>c.equipos.forEach(e=>{ delete e.horas[id]; }));
  v.winches.forEach(w=>{ delete w.horas[id]; delete w.lances[id]; });
  v.cables.forEach(c=>{ delete c.lances[id]; });
  persist();
  render();
}
function updateViajeFecha(id,field,val){
  const vj = V().viajes.find(v=>v.id===id); if(!vj) return;
  vj[field] = val;
  persist();
  const dates = (vj.inicio||vj.fin) ? (vj.inicio||'?')+' → '+(vj.fin||'?') : 'sin fecha';
  document.querySelectorAll('.th-date-sm[data-viaje="'+id+'"]').forEach(el=>{ el.textContent = dates; });
}
function viajeHeaderHtml(vj){
  const dates = (vj.inicio||vj.fin) ? (vj.inicio||'?')+' → '+(vj.fin||'?') : 'sin fecha';
  return `<div class="th-id">${escHtml(vj.id)}</div><div class="th-date-sm" data-viaje="${vj.id}">${escHtml(dates)}</div>`;
}
function renderViajesBar(){
  const v = V();
  const rows = v.viajes.map(vj=>`<tr>
      <td><b>${escHtml(vj.id)}</b></td>
      <td><input type="text" value="${escHtml(vj.inicio||'')}" placeholder="dd/mm/aa" oninput="EQUIPOS.updateViajeFecha('${vj.id}','inicio',this.value)"></td>
      <td><input type="text" value="${escHtml(vj.fin||'')}" placeholder="dd/mm/aa" oninput="EQUIPOS.updateViajeFecha('${vj.id}','fin',this.value)"></td>
      <td><button class="del-btn" onclick="EQUIPOS.deleteViaje('${vj.id}')">✕</button></td>
    </tr>`).join('');
  return `<div class="panel">
    <div class="panel-title">Viajes (${v.viajes.length}) — columnas compartidas por Motores, Winches y Cables</div>
    <table class="vjt"><thead><tr><th>Viaje</th><th>Fecha de zarpe</th><th>Fecha de salida</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="4" style="color:#aaa">Aún no hay viajes registrados.</td></tr>'}</tbody></table>
    <div class="add-viaje-form">
      <input type="text" id="newViajeId" placeholder="ID ej. V79">
      <input type="text" id="newViajeInicio" placeholder="Zarpe dd/mm/aa">
      <input type="text" id="newViajeFin" placeholder="Salida dd/mm/aa">
      <button class="mini-btn" onclick="EQUIPOS.addViaje()">+ Agregar viaje</button>
    </div>
  </div>`;
}

/* ============ MOTORES / EQUIPOS ============ */
function addCategoria(){
  V().categorias.push({id:uid('cat'), nombre:'NUEVA CATEGORÍA', equipos:[]});
  persist(); render();
}
function deleteCategoria(catId){
  if(!confirm('¿Eliminar toda esta categoría y sus equipos?')) return;
  V().categorias = V().categorias.filter(c=>c.id!==catId);
  persist(); render();
}
function updateCategoriaNombre(catId,val){
  const c = V().categorias.find(c=>c.id===catId); if(c) c.nombre = val;
  persist();
}
function addEquipo(catId){
  const c = V().categorias.find(c=>c.id===catId);
  c.equipos.push(eq('Nuevo equipo',0,0,10000,{}));
  persist(); render();
}
function deleteEquipo(catId,eqId){
  if(!confirm('¿Eliminar este equipo?')) return;
  const c = V().categorias.find(c=>c.id===catId);
  c.equipos = c.equipos.filter(e=>e.id!==eqId);
  persist(); render();
}
function findEquipo(catId,eqId){
  const c = V().categorias.find(c=>c.id===catId);
  return c ? c.equipos.find(e=>e.id===eqId) : null;
}
function updateEquipoField(catId,eqId,field,val){
  _markTyping();
  const e = findEquipo(catId,eqId); if(!e) return;
  e[field] = val;
  persist();
  refreshEquipoRow(catId,eqId);
}
function updateEquipoHoras(catId,eqId,viajeId,val){
  _markTyping();
  const e = findEquipo(catId,eqId); if(!e) return;
  if(val==='') delete e.horas[viajeId]; else e.horas[viajeId]=val;
  persist();
  refreshEquipoRow(catId,eqId);
}
function setEquipoEstadoManual(catId,eqId,val){
  const e = findEquipo(catId,eqId); if(!e) return;
  e.estadoManual = val;
  persist();
  refreshEquipoRow(catId,eqId);
}
function refreshEquipoRow(catId,eqId){
  const e = findEquipo(catId,eqId); if(!e) return;
  const est = calcEstadoEquipo(e);
  const badge = document.getElementById('badge_'+eqId);
  if(badge){ badge.textContent = est.label; badge.className = 'badge '+est.cls; }
}

function renderMotoresTab(){
  const v = V();
  if(!v.categorias) v.categorias = [];
  let html = '';
  v.categorias.forEach(cat=>{
    html += `<div class="panel">
      <div class="cat-head">
        <input class="cat-name" value="${escHtml(cat.nombre)}" oninput="EQUIPOS.updateCategoriaNombre('${cat.id}',this.value)">
        <button class="del-btn" title="Eliminar categoría" onclick="EQUIPOS.deleteCategoria('${cat.id}')">✕</button>
      </div>
      <div class="table-scroll"><table class="eqt"><thead><tr>
        <th style="min-width:200px">Equipo</th>
        <th>Histórico</th>
        <th>Horóm. 2026</th>
        <th>Umbral mant.</th>
        ${v.viajes.map(vj=>`<th>${viajeHeaderHtml(vj)}</th>`).join('')}
        <th>Total viajes</th>
        <th>Estado</th>
        <th>Nota</th>
        <th></th>
      </tr></thead><tbody>`;
      cat.equipos.forEach(e=>{
        const est = calcEstadoEquipo(e);
        const total = sumVals(e.horas);
        html += `<tr>
          <td class="td-equipo">
            <input type="text" class="name-input" value="${escHtml(e.nombre)}" oninput="EQUIPOS.updateEquipoField('${cat.id}','${e.id}','nombre',this.value)">
          </td>
          <td><input type="text" class="num-input" value="${escHtml(e.hist)}" oninput="EQUIPOS.updateEquipoField('${cat.id}','${e.id}','hist',this.value)"></td>
          <td><input type="text" class="num-input" value="${escHtml(e.h26)}" oninput="EQUIPOS.updateEquipoField('${cat.id}','${e.id}','h26',this.value)"></td>
          <td><input type="text" class="num-input" value="${escHtml(e.umbral)}" oninput="EQUIPOS.updateEquipoField('${cat.id}','${e.id}','umbral',this.value)"></td>
          ${v.viajes.map(vj=>`<td><input type="text" class="num-input" value="${escHtml(e.horas[vj.id]!==undefined?e.horas[vj.id]:'')}" oninput="EQUIPOS.updateEquipoHoras('${cat.id}','${e.id}','${vj.id}',this.value)"></td>`).join('')}
          <td><input type="text" class="readonly-total" value="${total}" readonly></td>
          <td>
            <select class="estado-select" onchange="EQUIPOS.setEquipoEstadoManual('${cat.id}','${e.id}',this.value)">
              ${ESTADO_OPTIONS.map(o=>`<option value="${o}" ${((e.estadoManual||'auto')===o)?'selected':''}>${o==='auto'?'Automático':ESTADOS[o].label}</option>`).join('')}
            </select><br>
            <span class="badge ${est.cls}" id="badge_${e.id}">${est.label}</span>
          </td>
          <td><textarea class="nota-input" placeholder="Nota / historial..." oninput="EQUIPOS.updateEquipoField('${cat.id}','${e.id}','nota',this.value)">${escHtml(e.nota||'')}</textarea></td>
          <td><button class="del-btn" onclick="EQUIPOS.deleteEquipo('${cat.id}','${e.id}')">✕</button></td>
        </tr>`;
      });
      html += `</tbody></table></div>
      <button class="mini-btn outline" style="margin-top:10px" onclick="EQUIPOS.addEquipo('${cat.id}')">+ Agregar equipo</button>
    </div>`;
  });
  html += `<button class="mini-btn outline" onclick="EQUIPOS.addCategoria()">+ Agregar categoría</button>`;
  return html;
}

/* ============ WINCHES ============ */
function addWinche(){ V().winches.push(wc('Nuevo winche')); persist(); render(); }
function deleteWinche(id){
  if(!confirm('¿Eliminar este winche?')) return;
  V().winches = V().winches.filter(w=>w.id!==id); persist(); render();
}
function findWinche(id){ return V().winches.find(w=>w.id===id); }
function updateWincheNombre(id,val){ const w=findWinche(id); if(w){w.nombre=val; persist();} }
function updateWincheVal(id,tipo,viajeId,val){
  _markTyping();
  const w=findWinche(id); if(!w) return;
  const obj = tipo==='horas'?w.horas:w.lances;
  if(val==='') delete obj[viajeId]; else obj[viajeId]=val;
  persist();
  refreshWincheRow(id);
}
function setWincheEstadoManual(id,val){ const w=findWinche(id); if(w){w.estadoManual=val; persist(); refreshWincheRow(id);} }

// Aplica un mismo número de lances a TODA la columna de un viaje.
// tipo: 'winches' o 'cables'. Cada celda queda editable después por si
// hubo algún cambio durante el viaje.
function fillLancesColumna(tipo, viajeId){
  const v = V();
  const lista = tipo==='winches' ? v.winches : v.cables;
  if(!lista || !lista.length){ alert('No hay '+(tipo==='winches'?'winches':'cables')+' registrados todavía.'); return; }
  const viaje = v.viajes.find(vj=>vj.id===viajeId);
  const etiqueta = viaje ? viaje.id : viajeId;
  const actual = prompt('Número de lances para el viaje '+etiqueta+'\n\nSe aplicará a los '+lista.length+' '+(tipo==='winches'?'winches':'cables')+' de esta columna.\nLuego puedes ajustar cualquiera manualmente.', '');
  if(actual===null) return;            // canceló
  const val = actual.trim();
  lista.forEach(item=>{
    if(val==='') delete item.lances[viajeId];
    else item.lances[viajeId] = val;
  });
  persist();
  render();
}
function refreshWincheRow(id){
  const w=findWinche(id); if(!w) return;
  const est = calcEstadoWinche(w);
  const badge=document.getElementById('wbadge_'+id);
  if(badge){badge.textContent=est.label; badge.className='badge '+est.cls;}
  const totH=document.getElementById('wtoth_'+id), totL=document.getElementById('wtotl_'+id);
  if(totH) totH.value = sumVals(w.horas);
  if(totL) totL.value = sumVals(w.lances);
}
function renderWinchesTab(){
  const v = V();
  if(!v.winches) v.winches = [];
  if(!v.viajes) v.viajes = [];
  let html = `<div class="panel"><div class="panel-title">Winches</div>
  <div class="table-scroll"><table class="eqt"><thead>
  <tr><th rowspan="2" style="min-width:220px">Winche</th>
    ${v.viajes.map(vj=>`<th colspan="2">${viajeHeaderHtml(vj)}</th>`).join('')}
    <th rowspan="2">Total horas</th><th rowspan="2">Total lances</th><th rowspan="2">Estado</th><th rowspan="2"></th>
  </tr>
  <tr>${v.viajes.map(vj=>`<th class="sub">Horas</th><th class="sub">Lances <button class="col-fill-btn" title="Aplicar un mismo número de lances a todos los winches de este viaje" onclick="EQUIPOS.fillLancesColumna('winches','${vj.id}')">⤓</button></th>`).join('')}</tr>
  </thead><tbody>`;
  v.winches.forEach(w=>{
    const est = calcEstadoWinche(w);
    html += `<tr>
      <td><input type="text" class="name-input" value="${escHtml(w.nombre)}" oninput="EQUIPOS.updateWincheNombre('${w.id}',this.value)"></td>
      ${v.viajes.map(vj=>`<td><input type="text" class="num-input" value="${escHtml(w.horas[vj.id]!==undefined?w.horas[vj.id]:'')}" oninput="EQUIPOS.updateWincheVal('${w.id}','horas','${vj.id}',this.value)"></td><td><input type="text" class="num-input" value="${escHtml(w.lances[vj.id]!==undefined?w.lances[vj.id]:'')}" oninput="EQUIPOS.updateWincheVal('${w.id}','lances','${vj.id}',this.value)"></td>`).join('')}
      <td><input type="text" class="readonly-total" id="wtoth_${w.id}" value="${sumVals(w.horas)}" readonly></td>
      <td><input type="text" class="readonly-total" id="wtotl_${w.id}" value="${sumVals(w.lances)}" readonly></td>
      <td>
        <select class="estado-select" onchange="EQUIPOS.setWincheEstadoManual('${w.id}',this.value)">
          ${ESTADO_OPTIONS.map(o=>`<option value="${o}" ${((w.estadoManual||'auto')===o)?'selected':''}>${o==='auto'?'Automático':ESTADOS[o].label}</option>`).join('')}
        </select><br>
        <span class="badge ${est.cls}" id="wbadge_${w.id}">${est.label}</span>
      </td>
      <td><button class="del-btn" onclick="EQUIPOS.deleteWinche('${w.id}')">✕</button></td>
    </tr>`;
  });
  html += `</tbody></table></div>
  <button class="mini-btn outline" style="margin-top:10px" onclick="EQUIPOS.addWinche()">+ Agregar winche</button>
  </div>`;
  return html;
}

/* ============ CABLES ============ */
function addCable(){ V().cables.push(cb('Nueva función','Especificación...','',{},300)); persist(); render(); }
function deleteCable(id){
  if(!confirm('¿Eliminar este cable/aparejo?')) return;
  V().cables = V().cables.filter(c=>c.id!==id); persist(); render();
}
function findCable(id){ return V().cables.find(c=>c.id===id); }
function updateCableField(id,field,val){ _markTyping(); const c=findCable(id); if(!c) return; c[field]=val; persist(); refreshCableRow(id); }
function updateCableLances(id,viajeId,val){
  _markTyping();
  const c=findCable(id); if(!c) return;
  if(val==='') delete c.lances[viajeId]; else c.lances[viajeId]=val;
  persist(); refreshCableRow(id);
}
function setCableEstadoManual(id,val){ const c=findCable(id); if(c){c.estadoManual=val; persist(); refreshCableRow(id);} }
function refreshCableRow(id){
  const c=findCable(id); if(!c) return;
  const est=calcEstadoCable(c);
  const badge=document.getElementById('cbadge_'+id);
  if(badge){badge.textContent=est.label; badge.className='badge '+est.cls;}
  const tot=document.getElementById('ctot_'+id);
  if(tot) tot.value = sumVals(c.lances);
  const dias=document.getElementById('cdias_'+id);
  if(dias){ const d=diasUso(c.ultimoCambio); dias.textContent = d===null?'N/A':d+' d'; }
}
function renderCablesTab(){
  const v = V();
  let html = `<div class="panel"><div class="panel-title">Cables de aparejos</div>
  <div class="table-scroll"><table class="eqt"><thead><tr>
    <th style="min-width:150px">Función</th>
    <th style="min-width:220px">Especificación</th>
    <th>Último cambio</th>
    <th>Días uso</th>
    ${v.viajes.map(vj=>`<th>${viajeHeaderHtml(vj)}<button class="col-fill-btn" title="Aplicar un mismo número de lances a todos los cables de este viaje" onclick="EQUIPOS.fillLancesColumna('cables','${vj.id}')">⤓</button></th>`).join('')}
    <th>Total lances</th>
    <th>Vida útil ref.</th>
    <th>Estado</th>
    <th></th>
  </tr></thead><tbody>`;
  v.cables.forEach(c=>{
    const est = calcEstadoCable(c);
    const dias = diasUso(c.ultimoCambio);
    html += `<tr>
      <td><input type="text" class="name-input" style="min-width:130px" value="${escHtml(c.funcion)}" oninput="EQUIPOS.updateCableField('${c.id}','funcion',this.value)"></td>
      <td><input type="text" style="min-width:210px" value="${escHtml(c.esp)}" oninput="EQUIPOS.updateCableField('${c.id}','esp',this.value)"></td>
      <td><input type="date" value="${escHtml(c.ultimoCambio||'')}" oninput="EQUIPOS.updateCableField('${c.id}','ultimoCambio',this.value)"></td>
      <td id="cdias_${c.id}">${dias===null?'N/A':dias+' d'}</td>
      ${v.viajes.map(vj=>`<td><input type="text" class="num-input" value="${escHtml(c.lances[vj.id]!==undefined?c.lances[vj.id]:'')}" oninput="EQUIPOS.updateCableLances('${c.id}','${vj.id}',this.value)"></td>`).join('')}
      <td><input type="text" class="readonly-total" id="ctot_${c.id}" value="${sumVals(c.lances)}" readonly></td>
      <td><input type="text" class="num-input" value="${escHtml(c.vidaUtilRef)}" oninput="EQUIPOS.updateCableField('${c.id}','vidaUtilRef',this.value)"></td>
      <td>
        <select class="estado-select" onchange="EQUIPOS.setCableEstadoManual('${c.id}',this.value)">
          ${ESTADO_OPTIONS.map(o=>`<option value="${o}" ${((c.estadoManual||'auto')===o)?'selected':''}>${o==='auto'?'Automático':ESTADOS[o].label}</option>`).join('')}
        </select><br>
        <span class="badge ${est.cls}" id="cbadge_${c.id}">${est.label}</span>
      </td>
      <td><button class="del-btn" onclick="EQUIPOS.deleteCable('${c.id}')">✕</button></td>
    </tr>`;
  });
  html += `</tbody></table></div>
  <button class="mini-btn outline" style="margin-top:10px" onclick="EQUIPOS.addCable()">+ Agregar cable / aparejo</button>
  </div>`;
  return html;
}

/* ============ RESUMEN ============ */
function collectAllEstados(){
  const v = V();
  const items = [];
  v.categorias.forEach(cat=>cat.equipos.forEach(e=>{
    items.push({tipo:cat.nombre, nombre:e.nombre, est:calcEstadoEquipo(e), detalle: (parseFloat(e.h26)||0)+' / '+(e.umbral||'—')});
  }));
  v.winches.forEach(w=>{
    items.push({tipo:'Winches', nombre:w.nombre, est:calcEstadoWinche(w), detalle: sumVals(w.horas)+'h · '+sumVals(w.lances)+' lances'});
  });
  v.cables.forEach(c=>{
    items.push({tipo:'Cables — '+c.funcion, nombre:c.esp, est:calcEstadoCable(c), detalle: sumVals(c.lances)+' / '+(c.vidaUtilRef||'—')+' lances'});
  });
  return items;
}
function renderResumenTab(){
  const items = collectAllEstados();
  const counts = {OK:0,ATENCION:0,MANTENIMIENTO:0,BAJA:0,SIN_DATOS:0,N_A:0};
  items.forEach(it=>counts[it.est.key]++);
  const attn = items.filter(it=>it.est.key==='ATENCION'||it.est.key==='MANTENIMIENTO');

  let html = `<div class="kpi-row">
    <div class="kpi-card kpi-ok"><div class="n">${counts.OK}</div><div class="l">OK</div></div>
    <div class="kpi-card kpi-atencion"><div class="n">${counts.ATENCION}</div><div class="l">Atención</div></div>
    <div class="kpi-card kpi-mant"><div class="n">${counts.MANTENIMIENTO}</div><div class="l">Mantenimiento</div></div>
    <div class="kpi-card kpi-baja"><div class="n">${counts.BAJA}</div><div class="l">Dado de baja</div></div>
    <div class="kpi-card kpi-sin"><div class="n">${counts.SIN_DATOS + counts.N_A}</div><div class="l">Sin datos / N-A</div></div>
  </div>`;

  const total = items.length || 1;
  const segs = [
    {k:'OK', color:'#1D9E75'}, {k:'ATENCION', color:'#BA7517'}, {k:'MANTENIMIENTO', color:'#D85A30'},
    {k:'BAJA', color:'#534AB7'}, {k:'SIN_DATOS', color:'#bbb'}, {k:'N_A', color:'#ddd'}
  ];
  let barSegs = '';
  segs.forEach(s=>{
    const pct = counts[s.k]/total*100;
    if(pct>0) barSegs += `<div style="width:${pct}%;background:${s.color}" title="${s.k}: ${counts[s.k]}"></div>`;
  });

  html += `<div class="resumen-grid">
    <div class="panel">
      <div class="panel-title">Requieren atención (${attn.length})</div>
      ${attn.length ? attn.map(it=>`<div class="attn-row">
          <div><div class="attn-name">${escHtml(it.nombre)}</div><div class="attn-sub">${escHtml(it.tipo)} · ${escHtml(it.detalle)}</div></div>
          <span class="badge ${it.est.cls}">${it.est.label}</span>
        </div>`).join('') : '<div class="empty-note">Nada requiere atención por ahora.</div>'}
    </div>
    <div class="panel">
      <div class="panel-title">Distribución de estados (${items.length} elementos)</div>
      <div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin-bottom:12px">${barSegs || '<div style="width:100%;background:#eee"></div>'}</div>
      ${segs.map(s=>counts[s.k]>0?`<div class="attn-row"><span style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${s.color};display:inline-block"></span>${ESTADOS[s.k].label}</span><b>${counts[s.k]}</b></div>`:'').join('')}
      <div style="margin-top:12px;font-size:11px;color:#999">Total registrado: ${V().categorias.reduce((a,c)=>a+c.equipos.length,0)} equipos · ${V().winches.length} winches · ${V().cables.length} cables/aparejos · ${V().viajes.length} viajes.</div>
    </div>
  </div>`;
  html += renderViajesBar();
  return html;
}

/* ============ RENDER ROOT ============ */
function render(){
  const content = document.getElementById('eq-content');
  if(currentTab==='resumen') content.innerHTML = renderResumenTab();
  else if(currentTab==='motores') content.innerHTML = renderMotoresTab();
  else if(currentTab==='winches') content.innerHTML = renderWinchesTab();
  else if(currentTab==='cables') content.innerHTML = renderCablesTab();
}

function escHtml(s){ if(s===undefined||s===null) s=''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ============ RESET / BACKUP ============ */
function resetVessel(){
  if(!confirm('¿Vaciar todos los datos de '+(currentVessel==='fatima'?'María Fátima':'María de Gracia')+'? Esta acción no se puede deshacer.')) return;
  state[currentVessel] = emptySkeleton();
  persist();
  render();
}
function exportBackup(){
  const wb = XLSX.utils.book_new();
  buildVesselSheets(wb, 'fatima', 'Fatima');
  buildVesselSheets(wb, 'gracia', 'Gracia');
  XLSX.writeFile(wb, 'atuntro_control_equipos_'+new Date().toISOString().slice(0,10)+'.xlsx');
}
function buildVesselSheets(wb, vesselKey, label){
  const v = state[vesselKey];

  const viajesRows = v.viajes.map(vj=>({ID:vj.id, 'Fecha de zarpe':vj.inicio||'', 'Fecha de salida':vj.fin||''}));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(viajesRows.length?viajesRows:[{ID:'', 'Fecha de zarpe':'','Fecha de salida':''}]), label+' Viajes');

  const motRows = [];
  v.categorias.forEach(cat=>cat.equipos.forEach(e=>{
    const row = {Categoria:cat.nombre, Equipo:e.nombre, 'Historico':e.hist, 'Horometro 2026':e.h26, 'Umbral Mant.':e.umbral};
    v.viajes.forEach(vj=>{ row[vj.id] = e.horas[vj.id]!==undefined?e.horas[vj.id]:''; });
    row['Total viajes'] = sumVals(e.horas);
    row['Estado manual'] = e.estadoManual||'auto';
    row['Nota'] = e.nota||'';
    motRows.push(row);
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(motRows.length?motRows:[{Categoria:'',Equipo:''}]), label+' Motores');

  const winRows = v.winches.map(w=>{
    const row = {Winche:w.nombre};
    v.viajes.forEach(vj=>{
      row[vj.id+' Horas'] = w.horas[vj.id]!==undefined?w.horas[vj.id]:'';
      row[vj.id+' Lances'] = w.lances[vj.id]!==undefined?w.lances[vj.id]:'';
    });
    row['Total horas'] = sumVals(w.horas);
    row['Total lances'] = sumVals(w.lances);
    row['Estado manual'] = w.estadoManual||'auto';
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(winRows.length?winRows:[{Winche:''}]), label+' Winches');

  const cabRows = v.cables.map(c=>{
    const row = {Funcion:c.funcion, Especificacion:c.esp, 'Ultimo cambio':c.ultimoCambio||'', 'Vida util ref (lances)':c.vidaUtilRef};
    v.viajes.forEach(vj=>{ row[vj.id] = c.lances[vj.id]!==undefined?c.lances[vj.id]:''; });
    row['Total lances'] = sumVals(c.lances);
    row['Estado manual'] = c.estadoManual||'auto';
    return row;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cabRows.length?cabRows:[{Funcion:''}]), label+' Cables');
}

function sheetRows(wb,name){
  const ws = wb.Sheets[name];
  return ws ? XLSX.utils.sheet_to_json(ws,{defval:''}) : [];
}
function parseVesselFromWorkbook(wb,label){
  const viajesRows = sheetRows(wb,label+' Viajes');
  const viajes = viajesRows.filter(r=>r['ID']!=='').map(r=>({id:String(r['ID']), inicio:String(r['Fecha de zarpe']||''), fin:String(r['Fecha de salida']||'')}));
  const viajeIds = viajes.map(v=>v.id);

  const motRows = sheetRows(wb,label+' Motores');
  const catsMap = new Map();
  motRows.forEach(r=>{
    if(!r['Equipo']) return;
    const catName = r['Categoria']||'SIN CATEGORÍA';
    if(!catsMap.has(catName)) catsMap.set(catName,{id:uid('cat'),nombre:String(catName),equipos:[]});
    const horas = {};
    viajeIds.forEach(vid=>{ if(r[vid]!==undefined && r[vid]!=='') horas[vid]=r[vid]; });
    catsMap.get(catName).equipos.push({
      id:uid('eq'), nombre:String(r['Equipo']),
      hist:r['Historico']!==undefined?r['Historico']:'', h26:r['Horometro 2026']!==undefined?r['Horometro 2026']:'',
      umbral:r['Umbral Mant.']!==undefined?r['Umbral Mant.']:'', horas,
      nota:r['Nota']||'', estadoManual:r['Estado manual']||'auto'
    });
  });
  const categorias = Array.from(catsMap.values());
  if(categorias.length===0){ categorias.push({id:uid('cat'),nombre:'MOTORES Y GENERADORES',equipos:[]},{id:uid('cat'),nombre:'EQUIPOS DE FRÍO',equipos:[]}); }

  const winRows = sheetRows(wb,label+' Winches');
  const winches = winRows.filter(r=>r['Winche']).map(r=>{
    const horas={}, lances={};
    viajeIds.forEach(vid=>{
      if(r[vid+' Horas']!==undefined && r[vid+' Horas']!=='') horas[vid]=r[vid+' Horas'];
      if(r[vid+' Lances']!==undefined && r[vid+' Lances']!=='') lances[vid]=r[vid+' Lances'];
    });
    return {id:uid('wc'), nombre:String(r['Winche']), horas, lances, estadoManual:r['Estado manual']||'auto'};
  });

  const cabRows = sheetRows(wb,label+' Cables');
  const cables = cabRows.filter(r=>r['Funcion']).map(r=>{
    const lances = {};
    viajeIds.forEach(vid=>{ if(r[vid]!==undefined && r[vid]!=='') lances[vid]=r[vid]; });
    return {id:uid('cb'), funcion:String(r['Funcion']), esp:String(r['Especificacion']||''), ultimoCambio:String(r['Ultimo cambio']||''), lances, vidaUtilRef:r['Vida util ref (lances)']!==undefined?r['Vida util ref (lances)']:'', estadoManual:r['Estado manual']||'auto'};
  });

  return { viajes, categorias, winches, cables };
}
function importBackup(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data,{type:'array'});
      const newState = { fatima: parseVesselFromWorkbook(wb,'Fatima'), gracia: parseVesselFromWorkbook(wb,'Gracia') };
      if(!confirm('¿Reemplazar todos los datos actuales (ambos buques) con el respaldo importado?')) return;
      state = newState;
      persist();
      render();
    }catch(err){
      alert('No se pudo leer el archivo de respaldo: '+err.message);
    }
  };
  reader.readAsArrayBuffer(file);
  input.value = '';
}

function init(){
  state = loadState();
  document.getElementById('eq-vesselSub').textContent = VESSEL_INFO.fatima;
  render();
  startRealtimeSync();
}

  return {
    init,
    addCable,
    addCategoria,
    addEquipo,
    addViaje,
    addWinche,
    deleteCable,
    deleteCategoria,
    deleteEquipo,
    deleteViaje,
    deleteWinche,
    exportBackup,
    resetVessel,
    switchTab,
    switchVessel,
    importBackup,
    setCableEstadoManual,
    setEquipoEstadoManual,
    setWincheEstadoManual,
    updateCableField,
    updateCableLances,
    updateCategoriaNombre,
    updateEquipoField,
    updateEquipoHoras,
    updateViajeFecha,
    updateWincheNombre,
    updateWincheVal,
    fillLancesColumna
  };
})();
