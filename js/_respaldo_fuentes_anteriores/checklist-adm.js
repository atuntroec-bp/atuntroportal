/* ════════════════════════════════════════════
   CHECKLIST ADMINISTRATIVO — scoped module
════════════════════════════════════════════ */
var CKADM = (function() {

/* ════════════════════════════════
   USUARIOS
════════════════════════════════ */
const USERS_DEF = [
  {key:'ricky',     name:'Ricky',          pin:'1234', isAdmin:true},
  {key:'capitan1',  name:'Capitán Fátima', pin:'2001', isAdmin:false},
  {key:'capitan2',  name:'Capitán Gracia', pin:'2002', isAdmin:false},
  {key:'operador1', name:'Operador 1',     pin:'3001', isAdmin:false},
  {key:'operador2', name:'Operador 2',     pin:'3002', isAdmin:false},
  {key:'conta',     name:'Contabilidad',   pin:'4001', isAdmin:false},
  {key:'gerencia',  name:'Gerencia',       pin:'5001', isAdmin:false},
  {key:'proveedor', name:'Proveedor',      pin:'6001', isAdmin:false},
  {key:'tripulac',  name:'Tripulación',    pin:'7001', isAdmin:false},
];
function loadUsers(){ try{const r=localStorage.getItem('atuntro_users_v8');return r?JSON.parse(r):JSON.parse(JSON.stringify(USERS_DEF));}catch(e){return JSON.parse(JSON.stringify(USERS_DEF));} }
function persistUsers(u){ localStorage.setItem('atuntro_users_v8',JSON.stringify(u)); }
let USERS = loadUsers();
let currentUser = null, selUserKey = null;

/* ════════════════════════════════
   RESPONSABLES (actor list)
════════════════════════════════ */
const ACTORS_DEF = [
  {key:'capitan',      label:'Capitán',       css:'ac-capitan'},
  {key:'admin',        label:'Administración', css:'ac-admin'},
  {key:'tripulacion',  label:'Tripulación',    css:'ac-tripulacion'},
  {key:'contabilidad', label:'Contabilidad',   css:'ac-contabilidad'},
  {key:'proveedor',    label:'Proveedor',      css:'ac-proveedor'},
  {key:'gerencia',     label:'Gerencia',       css:'ac-gerencia'},
];
const CSS_POOL = ['ac-capitan','ac-admin','ac-tripulacion','ac-contabilidad','ac-proveedor','ac-gerencia','ac-custom'];

function actorsKey(v){ return 'atuntro_actors_v8_'+(v||currentVessel); }
function loadActors(v){ try{const r=localStorage.getItem(actorsKey(v));return r?JSON.parse(r):JSON.parse(JSON.stringify(ACTORS_DEF));}catch(e){return JSON.parse(JSON.stringify(ACTORS_DEF));} }
function persistActors(a){ localStorage.setItem(actorsKey(),JSON.stringify(a)); }
let ACTORS = loadActors('fatima');

function actorByKey(k){ return ACTORS.find(a=>a.key===k)||{key:k,label:k,css:'ac-custom'}; }
function rebuildLegend(){
  const bar=document.getElementById('ckadm-legendBar');
  if(!bar) return;
  bar.innerHTML='<span class="leg-title">Responsables:</span>'
    +ACTORS.map(a=>`<span class="leg-pill ${a.css}">${esc(a.label)}</span>`).join('')
    +'<span style="font-size:10px;color:#bbb;margin-left:6px">🔴 Rojo = tarea vencida</span>';
}

/* ════════════════════════════════
   LOGIN
════════════════════════════════ */
function buildGrid(){
  const g=document.getElementById('ckadm-userGrid'); if(!g) return; g.innerHTML='';
  USERS.forEach(u=>{
    const b=document.createElement('button');
    b.className='user-btn'+(u.isAdmin?' is-admin':'');
    b.textContent=u.name+(u.isAdmin?' ⚙️':'');
    b.onclick=()=>{ selUserKey=u.key; g.querySelectorAll('.user-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); document.getElementById('ckadm-pinInput').focus(); };
    g.appendChild(b);
  });
}
buildGrid();

function doLogin(){
  const err=document.getElementById('ckadm-loginError');
  if(!selUserKey){err.textContent='Selecciona tu nombre.';return;}
  const pin=document.getElementById('ckadm-pinInput').value.trim();
  const u=USERS.find(x=>x.key===selUserKey);
  if(!u||u.pin!==pin){err.textContent='PIN incorrecto.';document.getElementById('ckadm-pinInput').value='';return;}
  currentUser=u;
  document.getElementById('ckadm-loginScreen').style.display='none';
  document.getElementById('ckadm-mainApp').style.display='block';
  document.getElementById('ckadm-sessionPill').textContent='👤 '+u.name;
  document.getElementById('ckadm-adminPanel').classList.toggle('on',u.isAdmin);
  setTripEditable(u.isAdmin);
  ACTORS=loadActors(currentVessel);
  rebuildLegend();
  render();
}
function doLogout(){
  currentUser=null;selUserKey=null;
  document.getElementById('ckadm-pinInput').value='';
  document.getElementById('ckadm-loginError').textContent='';
  document.getElementById('ckadm-mainApp').style.display='none';
  document.getElementById('ckadm-loginScreen').style.display='flex';
  document.querySelectorAll('#ckadm-userGrid .user-btn').forEach(b=>b.classList.remove('selected'));
}
function setTripEditable(y){ ['ckadm-tripVessel','ckadm-tripId','ckadm-tripEta','ckadm-tripZarpe','ckadm-tripTm','ckadm-tripObs'].forEach(id=>{ const e=document.getElementById(id); if(e) e.disabled=!y; }); }

/* ════════════════════════════════
   MODALS
════════════════════════════════ */
function openMo(id){
  if(id==='moUsers') buildUsersModal();
  if(id==='moActors') buildActorsModal();
  var el=document.getElementById('ckadm-'+id)||document.getElementById(id);
  if(el) el.classList.add('open');
}
function closeMo(id){
  var el=document.getElementById('ckadm-'+id)||document.getElementById(id);
  if(el) el.classList.remove('open');
}

/* usuarios modal */
function buildUsersModal(){
  document.getElementById('ckadm-moUsersBody').innerHTML=USERS.map((u,i)=>`
    <div class="u-row">
      <div style="flex:1"><div class="u-lbl">Nombre</div><input class="u-inp" id="um_n_${i}" value="${esc(u.name)}"></div>
      <div style="width:100px"><div class="u-lbl">PIN</div><input class="u-inp" id="um_p_${i}" value="${esc(u.pin)}" maxlength="6" type="password" onfocus="this.type='text'" onblur="this.type='password'"></div>
      ${u.isAdmin?'<span class="u-admin-tag">Admin</span>':'<span style="width:46px"></span>'}
    </div>`).join('');
}
function saveUsers(){
  USERS.forEach((u,i)=>{
    const n=document.getElementById('um_n_'+i); const p=document.getElementById('um_p_'+i);
    if(n&&n.value.trim()) u.name=n.value.trim();
    if(p&&p.value.trim()) u.pin=p.value.trim();
  });
  persistUsers(USERS);
  if(currentUser){ const upd=USERS.find(u=>u.key===currentUser.key); if(upd){currentUser=upd;document.getElementById('ckadm-sessionPill').textContent='👤 '+upd.name;} }
  buildGrid(); closeMo('moUsers'); flash();
}

/* actores modal */
function buildActorsModal(){
  const vname=currentVessel==='fatima'?'María Fátima':'María de Gracia';
  const desc=document.getElementById('ckadm-moActorsDesc');
  if(desc) desc.textContent='Responsables de '+vname+'. Cada barco tiene su lista independiente.';
  document.getElementById('ckadm-moActorsBody').innerHTML=ACTORS.map((a,i)=>`
    <div class="actor-list-row" id="arow_${i}">
      <span class="actor-key-tag">${esc(a.key)}</span>
      <input class="u-inp" id="al_lbl_${i}" value="${esc(a.label)}" placeholder="Nombre visible" style="flex:1">
      <select class="u-inp" id="al_css_${i}" style="width:130px">
        ${CSS_POOL.map(c=>`<option value="${c}"${a.css===c?' selected':''}>${c.replace('ac-','')}</option>`).join('')}
      </select>
      <button class="al-del" onclick="removeActorRow(${i})" title="Eliminar">✕</button>
    </div>`).join('');
}
function removeActorRow(i){ document.getElementById('arow_'+i).remove(); }
let _actorTmp=0;
function addActorRow(){
  const key='custom_'+(++_actorTmp);
  const div=document.createElement('div'); div.className='actor-list-row'; div.id='arow_new_'+_actorTmp;
  div.innerHTML=`<span class="actor-key-tag">${key}</span>
    <input class="u-inp" id="al_lbl_new_${_actorTmp}" placeholder="Nombre visible" style="flex:1">
    <select class="u-inp" id="al_css_new_${_actorTmp}" style="width:130px">
      ${CSS_POOL.map(c=>`<option value="${c}">${c.replace('ac-','')}</option>`).join('')}
    </select>
    <button class="al-del" onclick="this.closest('.actor-list-row').remove()" title="Eliminar">✕</button>`;
  document.getElementById('ckadm-moActorsBody').appendChild(div);
}
function saveActors(){
  const rows=[...document.querySelectorAll('#ckadm-moActorsBody .actor-list-row')];
  const newList=[];
  rows.forEach(row=>{
    const id=row.id; // arow_i or arow_new_i
    const isNew=id.includes('new');
    const idx=id.split('_').pop();
    const lbl=document.getElementById(isNew?'al_lbl_new_'+idx:'al_lbl_'+idx);
    const css=document.getElementById(isNew?'al_css_new_'+idx:'al_css_'+idx);
    if(!lbl||!lbl.value.trim()) return;
    const key=isNew?('custom_'+idx):(ACTORS[parseInt(idx)]||{key:'custom_'+idx}).key;
    newList.push({key,label:lbl.value.trim(),css:css?css.value:'ac-custom'});
  });
  ACTORS=newList;
  persistActors(ACTORS);
  rebuildLegend();
  closeMo('moActors');
  reRenderAll();
  flash();
}

/* ════════════════════════════════
   DATOS BASE
════════════════════════════════ */
const PHASES_DEFAULT = [
  {id:'p1',title:'Pre-llegada',sub:'Barco avisa desde el mar',color:'amber',anchor:'pre',steps:[
    {id:'s1a',text:'Capitán notifica ETA por radio o llamada telefónica',actor:'capitan',doc:'',maxDays:-2},
    {id:'s1b',text:'Operador envía reporte de pesca al administrador',actor:'capitan',doc:'CUADRO_DE_SALIDA_v2.xlsx',maxDays:-1},
    {id:'s1c',text:'Administración recibe reporte y activa el proceso de llegada',actor:'admin',doc:'',maxDays:-1},
  ]},
  {id:'p2',title:'Llegada a puerto',sub:'Atraque, descarga y registro de entrada',color:'teal',anchor:'eta',steps:[
    {id:'s2a',text:'Atraque del buque — inspección de capitanía de puerto',actor:'capitan',doc:'',maxDays:1},
    {id:'s2b',text:'Descarga y pesaje de pesca en planta (ASISERVY / SIMBAI SA)',actor:'capitan',doc:'',maxDays:2},
    {id:'s2c',text:'Asignar ENTRADA_ID al viaje (ej. 74A, 74B, 50)',actor:'admin',doc:'atuntro_data_2025_v3_formulas.xlsx',maxDays:1},
    {id:'s2d',text:'Registrar TM descargadas por especie: SKJ, YF, rechazo',actor:'admin',doc:'atuntro_data_2025_v3_formulas.xlsx',maxDays:1},
  ]},
  {id:'p3',title:'Liquidación financiera',sub:'Tripulación y proveedores — simultánea a la llegada',color:'amber',anchor:'eta',steps:[
    {id:'s3a',text:'Pagar saldo de tripulación del viaje anterior',actor:'admin',doc:'',maxDays:2},
    {id:'s3b',text:'Pagar anticipo de tripulación para el nuevo viaje',actor:'admin',doc:'',maxDays:2},
    {id:'s3c',text:'Abonar o saldar facturas de proveedores pendientes',actor:'admin',doc:'CUADRO_DE_SALIDA_v2.xlsx',maxDays:3},
    {id:'s3d',text:'Contabilidad registra costos: combustible + proveedores + rol',actor:'contabilidad',doc:'atuntro_data_2025_v3_formulas.xlsx',maxDays:2},
  ]},
  {id:'p4',title:'Estadía en puerto',sub:'Mantenimiento, trámites y decisión de zarpe',color:'purple',anchor:'eta',steps:[
    {id:'s4a',text:'Mantenimiento mecánico, eléctrico y de casco del buque',actor:'capitan',doc:'',maxDays:5},
    {id:'s4b',text:'Gestionar trámites en capitanía de puerto y permisos de pesca',actor:'capitan',doc:'',maxDays:3},
    {id:'s4c',text:'Gerencia define destino de pesca, área y fecha tentativa de zarpe',actor:'gerencia',doc:'',maxDays:2},
  ]},
  {id:'p5',title:'Proceso de pedidos',sub:'Administración genera solicitudes a proveedores',color:'purple',anchor:'eta',steps:[
    {id:'s5a',text:'Operador llena formulario de pedido (solo celdas de cantidad)',actor:'capitan',doc:'PEDIDO_OPERADOR_MARIA_FATIMA.xlsx',maxDays:1},
    {id:'s5b',text:'Admin genera cuerpos de correo por proveedor (TEXTJOIN automático)',actor:'admin',doc:'PEDIDOS_ADMIN_MARIAFATIMA_v7.xlsx → DRAFTS_GMAIL',maxDays:1},
    {id:'s5c',text:'Enviar correos a proveedores (3 pasos por proveedor)',actor:'admin',doc:'Gmail',maxDays:1},
    {id:'s5d',text:'Registrar fecha de envío en columna FECHA ENVIADO',actor:'admin',doc:'PEDIDOS_ADMIN_MARIAFATIMA_v7.xlsx → col. H',maxDays:1},
  ]},
  {id:'p6',title:'Aprobación y precios',sub:'Revisión de proformas y actualización de base de datos',color:'purple',anchor:'eta',steps:[
    {id:'s6a',text:'Recibir proformas / cotizaciones de proveedores (PDF o correo)',actor:'proveedor',doc:'',maxDays:2},
    {id:'s6b',text:'Comparar precios recibidos vs. base de datos de proveedores',actor:'admin',doc:'proveedores_precios.xlsx',maxDays:1},
    {id:'s6c',text:'Cargar precios actualizados a la base maestra (habilidad cargar-proformas)',actor:'admin',doc:'proveedores_precios.xlsx',maxDays:1},
    {id:'s6d',text:'Gerencia aprueba proveedores seleccionados y montos',actor:'gerencia',doc:'',maxDays:1},
  ]},
  {id:'p6b',title:'Nuevo punto (editar título)',sub:'Agregar descripción aquí',color:'purple',anchor:'eta',steps:[
    {id:'s6b1',text:'Agregar paso aquí',actor:'admin',doc:'',maxDays:1},
  ]},
  {id:'p7',title:'Aprovisionamiento',sub:'Entrega y carga de insumos al buque',color:'teal',anchor:'eta',steps:[
    {id:'s7a',text:'Proveedores entregan: insumos, víveres, repuestos y combustible',actor:'proveedor',doc:'',maxDays:2},
    {id:'s7b',text:'Capitán verifica carga recibida vs. pedido y firma de recibido',actor:'capitan',doc:'',maxDays:1},
    {id:'s7c',text:'Admin registra facturas en cuadro de salida — Estado: PENDIENTE',actor:'admin',doc:'CUADRO_DE_SALIDA_v2.xlsx',maxDays:1},
  ]},
  {id:'p8',title:'Zarpe',sub:'Anticipo, trámites finales y salida del buque',color:'teal',anchor:'eta',steps:[
    {id:'s8a',text:'Pagar anticipo de tripulación al momento del zarpe',actor:'admin',doc:'',maxDays:1},
    {id:'s8b',text:'Gestionar rol de tripulación y permisos oficiales de zarpe',actor:'capitan',doc:'',maxDays:1},
    {id:'s8c',text:'Buque zarpa — registrar ENTRADA_ID del nuevo viaje',actor:'admin',doc:'atuntro_data_2025_v3_formulas.xlsx',maxDays:1},
  ]},
  {id:'p9',title:'Cierre administrativo',sub:'Cierre del viaje y análisis de rentabilidad',color:'coral',anchor:'zarpe',steps:[
    {id:'s9a',text:'Actualizar estados de pago (PAGADO / ABONADO) en cuadro de salida',actor:'admin',doc:'CUADRO_DE_SALIDA_v2.xlsx',maxDays:2},
    {id:'s9b',text:'Cargar todos los datos del viaje al modelo anual',actor:'admin',doc:'atuntro_data_2025_v3_formulas.xlsx',maxDays:2},
    {id:'s9c',text:'Verificar rentabilidad: ingresos vs. combustible + proveedores + rol',actor:'contabilidad',doc:'atuntro_data_2025_v3_formulas.xlsx → RENTABILIDAD',maxDays:3},
    {id:'s9d',text:'Preparar informe gerencial: comparativo vs. viaje anterior',actor:'gerencia',doc:'',maxDays:2},
  ]},
];

/* ════════════════════════════════
   ESTADO
════════════════════════════════ */
let currentVessel='fatima', state={fatima:{},gracia:{}};
const VESSEL_INFO={fatima:'María Fátima (180 TM · ~20 tripulantes)',gracia:'María de Gracia (215 TM · ~21 tripulantes)'};

function sKey(v){return 'atuntro_v8_'+(v||currentVessel);}
function loadSt(v){try{const r=localStorage.getItem(sKey(v));return r?JSON.parse(r):{}}catch(e){return{}}}
function persist(){try{localStorage.setItem(sKey(),JSON.stringify(state[currentVessel]));flash()}catch(e){}}
function flash(){const d=document.getElementById('ckadm-saveDot');if(!d)return;d.classList.add('show');setTimeout(()=>d.classList.remove('show'),1600);}

function switchVessel(v,btn){
  currentVessel=v;
  document.querySelectorAll('.vtab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  state[v]=loadSt(v);
  ACTORS=loadActors(v);
  document.getElementById('ckadm-vesselSub').textContent=VESSEL_INFO[v];
  rebuildLegend();
  render();
}

function resetVessel(){
  document.getElementById('ckadm-moResetTxt').textContent='Reiniciar viaje de '+(currentVessel==='fatima'?'María Fátima':'María de Gracia')+'? Se borrará todo el progreso y el historial.';
  openMo('moReset');
}
function confirmReset(){
  closeMo('moReset');
  const v = state[currentVessel];
  // Limpiar progreso y datos del viaje, pero conservar textos/actores/docs de cada paso
  PHASES_DEFAULT.forEach(ph=>{
    const pd = v[ph.id];
    if(!pd) return;
    // Limpiar done, log y notas de cada paso; conservar text, actor, doc, maxDays
    if(pd.stepList) pd.stepList.forEach(s=>{ s.done=false; s.log=[]; });
    pd.notes='';
    pd.open=false;
  });
  // Borrar datos del viaje (fechas, TM, obs) pero no los pasos
  delete v._trip;
  persist();
  render();
}

/* ════════════════════════════════
   PHASE DATA
════════════════════════════════ */
function phaseData(pid){
  const v=state[currentVessel];
  if(!v[pid]) v[pid]={};
  const pd=v[pid];
  if(pd.open===undefined) pd.open=false;
  if(!pd.notes) pd.notes='';
  if(!pd.stepList){
    const def=PHASES_DEFAULT.find(p=>p.id===pid);
    if(!pd.title) pd.title=def.title;
    if(!pd.sub) pd.sub=def.sub;
    pd.stepList=def.steps.map(s=>({id:s.id,text:s.text,actor:s.actor,doc:s.doc,done:false,maxDays:s.maxDays||1,log:[]}));
  }
  if(!pd.title){ const def=PHASES_DEFAULT.find(p=>p.id===pid); pd.title=def.title; pd.sub=def.sub; }
  return pd;
}

/* ════════════════════════════════
   FECHAS
   anchor='pre'  → fecha límite = ETA + maxDays  (maxDays negativo)
   anchor='eta'  → fecha límite = ETA + maxDays  (cada ítem independiente, NO acumulativo)
   anchor='zarpe'→ fecha límite = Zarpe + offset acumulado dentro de p9
════════════════════════════════ */
function getTripDates(){ const t=state[currentVessel]._trip||{}; return{eta:t.eta||'',zarpe:t.zarpe||''}; }

function calcDue(phaseIdx,stepIdx){
  const{eta,zarpe}=getTripDates();
  const ph=PHASES_DEFAULT[phaseIdx];
  const pd=phaseData(ph.id);
  const step=pd.stepList[stepIdx];

  if(ph.anchor==='pre'){
    if(!eta) return null;
    const d=new Date(eta+'T08:00:00');
    d.setDate(d.getDate()+(step.maxDays||0)); // negativo = antes del ETA
    return d;
  }
  if(ph.anchor==='eta'){
    if(!eta) return null;
    // Cada ítem: ETA + su propio maxDays (INDEPENDIENTE, no acumulativo)
    const d=new Date(eta+'T08:00:00');
    d.setDate(d.getDate()+(step.maxDays||1));
    return d;
  }
  if(ph.anchor==='zarpe'){
    if(!zarpe) return null;
    // Acumulativo solo dentro de p9
    let offset=0;
    for(let si=0;si<stepIdx;si++) offset+=(pd.stepList[si].maxDays||1);
    const d=new Date(zarpe+'T08:00:00');
    d.setDate(d.getDate()+offset+(step.maxDays||1));
    return d;
  }
  return null;
}

function isOverdue(pi,si){
  const pd=phaseData(PHASES_DEFAULT[pi].id);
  if(pd.stepList[si].done) return false;
  const due=calcDue(pi,si); if(!due) return false;
  return new Date()>due;
}
function fmtS(d){if(!d)return'';return d.toLocaleDateString('es-EC',{day:'2-digit',month:'short'});}
function fmtL(d){if(!d)return'';return d.toLocaleString('es-EC',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}

/* ════════════════════════════════
   TOGGLE CHECK
════════════════════════════════ */
// Mapea el rol del portal al actor key de CKADM
function _myActorKey(){
  if(!currentUser) return null;
  const map={operaciones:'capitan',admin:'admin',contabilidad:'contabilidad'};
  return map[currentUser.role]||null;
}
function toggleStep(pid,idx){
  if(!currentUser) return;
  const pd=phaseData(pid); const step=pd.stepList[idx];
  // Permiso: solo master puede marcar cualquier paso;
  // el resto solo puede marcar si su rol corresponde al actor asignado
  if(!currentUser.isMaster){
    if(!step.actor){
      alert('Este paso no tiene responsable asignado. Solo el administrador puede marcarlo.');
      return;
    }
    if(_myActorKey()!==step.actor){
      const actorLabel=actorByKey(step.actor).label;
      alert('Solo "'+actorLabel+'" o el administrador pueden marcar este paso.');
      return;
    }
  }
  // Solo admin puede desmarcar un paso ya marcado
  if(step.done&&!currentUser.isAdmin) return;
  step.done=!step.done;
  if(!step.log) step.log=[];
  step.log.push({action:step.done?'marked':'unmarked',user:currentUser.name,userKey:currentUser.key,ts:new Date().toISOString()});
  persist(); updateProgress(); renderBody(pid); updateAlerts();
}

/* ════════════════════════════════
   ADMIN OPS
════════════════════════════════ */
function isAdmin(){ return currentUser&&currentUser.isAdmin; }
function updateMaxDays(pid,idx,val){ if(!isAdmin()) return; phaseData(pid).stepList[idx].maxDays=parseInt(val)||1; persist(); reRenderAll(); }

let _persistTimer=null;
function persistDebounced(){ clearTimeout(_persistTimer); _persistTimer=setTimeout(persist,600); }

function updateStepText(pid,idx,val){ phaseData(pid).stepList[idx].text=val; persistDebounced(); }
function updateStepDoc(pid,idx,val){ phaseData(pid).stepList[idx].doc=val; persistDebounced(); }
function updateStepActor(pid,idx,val){ phaseData(pid).stepList[idx].actor=val; persist(); }
function updateNote(pid,val){ if(!isAdmin()) return; phaseData(pid).notes=val; persistDebounced(); }
function updatePhaseField(pid,f,v){ if(!isAdmin()) return; phaseData(pid)[f]=v; persistDebounced(); }
function moveStep(pid,idx,dir){
  if(!isAdmin()) return;
  const list=phaseData(pid).stepList; const t=idx+dir;
  if(t<0||t>=list.length) return;
  [list[idx],list[t]]=[list[t],list[idx]];
  persist(); updateProgress(); renderBody(pid);
}
function deleteStep(pid,idx){
  if(!isAdmin()) return;
  if(!confirm('¿Eliminar este paso?')) return;
  phaseData(pid).stepList.splice(idx,1);
  persist(); updateProgress(); renderBody(pid);
}
function addStep(pid){
  if(!isAdmin()) return;
  phaseData(pid).stepList.push({id:'x_'+Date.now(),text:'Nuevo paso',actor:ACTORS[0]?ACTORS[0].key:'admin',doc:'',done:false,maxDays:1,log:[]});
  persist(); renderBody(pid);
  setTimeout(()=>{ const n=phaseData(pid).stepList.length-1; const ta=document.getElementById('stxt_'+pid+'_'+n); if(ta){ta.focus();ta.select();} },60);
}

/* ════════════════════════════════
   RENDER BODY
════════════════════════════════ */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function buildActorOptions(selKey){
  return ACTORS.map(a=>`<option value="${esc(a.key)}"${a.key===selKey?' selected':''}>${esc(a.label)}</option>`).join('');
}

function renderBody(pid){
  const pi=PHASES_DEFAULT.findIndex(p=>p.id===pid);
  const ph=PHASES_DEFAULT[pi];
  const pd=phaseData(pid);
  const body=document.getElementById('body_'+pid);
  if(!body) return;
  const admin=isAdmin();
  const{eta,zarpe}=getTripDates();
  const hasDate=ph.anchor==='zarpe'?!!zarpe:!!eta;
  const list=pd.stepList; const n=list.length;

  body.innerHTML=list.map((s,i)=>{
    const actor=actorByKey(s.actor);
    const overdue=isOverdue(pi,i);
    const due=calcDue(pi,i);
    const isPre=ph.anchor==='pre';

    // date badge
    let dateBadge='';
    if(hasDate&&due){
      const cls=overdue?'ov':(isPre?'pre':'');
      const pfx=isPre?'⏮ Límite':'Límite';
      dateBadge=`<span class="meta-date ${cls}">${pfx}: ${fmtS(due)}</span>`;
    }

    // duration
    const durHtml=admin
      ?`<span class="meta-dur">Máx: <input class="dur-in" type="number" min="-90" max="90" value="${s.maxDays||1}"
          onchange="updateMaxDays('${pid}',${i},this.value)"> días</span>`
      :`<span class="meta-dur">${s.maxDays}d</span>`;

    // actor selector — siempre editable si admin
    const actorHtml=admin
      ?`<select class="actor-sel ${actor.css}" onchange="updateStepActor('${pid}',${i},this.value);this.className='actor-sel '+actorByKey(this.value).css">
          ${buildActorOptions(s.actor)}
        </select>`
      :`<span class="actor-pill ${actor.css}">${esc(actor.label)}</span>`;

    // doc
    const docHtml=admin
      ?`<input class="doc-in" type="text" value="${esc(s.doc)}" placeholder="📎 archivo..."
          oninput="updateStepDoc('${pid}',${i},this.value)">`
      :(s.doc?`<span class="doc-static" title="${esc(s.doc)}">📎 ${esc(s.doc)}</span>`:'');

    // text
    const txtHtml=admin
      ?`<textarea id="stxt_${pid}_${i}" class="step-txt-in${s.done?' done':''}" rows="1"
          oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px';updateStepText('${pid}',${i},this.value)"
          >${esc(s.text)}</textarea>`
      :`<span class="step-txt${s.done?' done':''}">${esc(s.text)}</span>`;

    // stamp + log
    const lastMark=s.log&&s.log.filter(l=>l.action==='marked').slice(-1)[0];
    const stamp=lastMark&&s.done?`<div class="stamp">✅ Marcado por <strong>${esc(lastMark.user)}</strong> — ${fmtL(new Date(lastMark.ts))}</div>`:'';
    const logHtml=s.log&&s.log.length
      ?'<div class="step-log">'+s.log.slice(-4).reverse().map(e=>
        `<div class="log-e"><span class="${e.action==='marked'?'log-marked':'log-unmarked'}">${e.action==='marked'?'Marcó':'Desmarcó'}</span><span>${esc(e.user)}</span><span style="color:#bbb">${fmtL(new Date(e.ts))}</span></div>`
      ).join('')+'</div>':'' ;

    const adminCtrl=admin?`<div class="admin-ctrl">
      <button class="c-btn" onclick="moveStep('${pid}',${i},-1)" ${i===0?'disabled':''}>▲</button>
      <button class="c-btn" onclick="moveStep('${pid}',${i},1)" ${i===n-1?'disabled':''}>▼</button>
      <button class="c-btn del" onclick="deleteStep('${pid}',${i})">✕</button>
    </div>`:'';

    return `<div class="step${overdue?' overdue':''}${s.done?' done-step':''}" id="step_${pid}_${i}">
      ${adminCtrl}
      <div class="step-chk${s.done?' done':''}${s.done&&!admin?' locked':''}" onclick="toggleStep('${pid}',${i})"
        title="${s.done&&!admin?'Solo el administrador puede desmarcar':''}"></div>
      <div class="step-content">
        <div class="step-txt-row">
          ${txtHtml}
          ${overdue?'<span class="ov-tag on">🚨 VENCIDO</span>':''}
        </div>
        <div class="step-meta">
          ${actorHtml}
          ${dateBadge}
          ${durHtml}
          ${docHtml}
        </div>
        ${stamp}${logHtml}
      </div>
    </div>`;
  }).join('');

  if(admin){
    body.querySelectorAll('textarea.step-txt-in').forEach(ta=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
    body.innerHTML+=`<button class="add-step-btn" onclick="addStep('${pid}')">+ Agregar paso</button>`;
  }
  body.innerHTML+=`<div class="notes-wrap"><div class="notes-lbl">Notas</div>
    <textarea class="notes-in" placeholder="Observaciones..." ${admin?'':'disabled'}
      oninput="updateNote('${pid}',this.value)">${esc(pd.notes||'')}</textarea></div>`;

  refreshCount(pid);
}

/* ════════════════════════════════
   TOGGLE FASE
════════════════════════════════ */
function togglePhase(pid){
  const pd=phaseData(pid); pd.open=!pd.open; persist();
  const el=document.getElementById('phase_'+pid);
  if(el) el.classList.toggle('open',pd.open);
  if(pd.open) renderBody(pid);
}

/* ════════════════════════════════
   ALERTS
════════════════════════════════ */
function updateAlerts(){
  let count=0;
  PHASES_DEFAULT.forEach((ph,pi)=>{
    const pd=phaseData(ph.id); let c=0;
    pd.stepList.forEach((_,si)=>{if(isOverdue(pi,si)){count++;c++;}});
    const tag=document.getElementById('atag_'+ph.id);
    if(tag){tag.textContent=c?c+' vencido'+(c>1?'s':''):'';tag.classList.toggle('on',c>0);}
  });
  const b=document.getElementById('ckadm-alertsBanner'); const t=document.getElementById('ckadm-alertsText');
  if(count>0){b.classList.add('on');t.textContent=`Hay ${count} tarea${count>1?'s':''} vencida${count>1?'s':''} — revisa los ítems en rojo`;}
  else b.classList.remove('on');
}
function reRenderAll(){PHASES_DEFAULT.forEach(ph=>{if(phaseData(ph.id).open) renderBody(ph.id);});updateAlerts();}

/* ════════════════════════════════
   TRIP INFO
════════════════════════════════ */
function saveTripInfo(debounce){
  if(!isAdmin()) return;
  state[currentVessel]._trip={
    vessel:document.getElementById('ckadm-tripVessel').value,
    id:document.getElementById('ckadm-tripId').value,
    eta:document.getElementById('ckadm-tripEta').value,
    zarpe:document.getElementById('ckadm-tripZarpe').value,
    tm:document.getElementById('ckadm-tripTm').value,
    obs:document.getElementById('ckadm-tripObs').value,
  };
  debounce ? persistDebounced() : persist();
}
function onDateChange(){ saveTripInfo(false); reRenderAll(); }
function loadTripInfo(){
  const t=state[currentVessel]._trip||{};
  document.getElementById('ckadm-tripVessel').value=t.vessel||'';
  document.getElementById('ckadm-tripId').value=t.id||'';
  document.getElementById('ckadm-tripEta').value=t.eta||'';
  document.getElementById('ckadm-tripZarpe').value=t.zarpe||'';
  document.getElementById('ckadm-tripTm').value=t.tm||'';
  document.getElementById('ckadm-tripObs').value=t.obs||'';
}

/* ════════════════════════════════
   PROGRESS + RENDER
════════════════════════════════ */
function updateProgress(){
  let total=0,done=0;
  PHASES_DEFAULT.forEach(ph=>{const pd=phaseData(ph.id);total+=pd.stepList.length;pd.stepList.forEach(s=>{if(s.done)done++;});});
  const pct=total?Math.round(done/total*100):0;
  document.getElementById('ckadm-progFill').style.width=pct+'%';
  document.getElementById('ckadm-progPct').textContent=pct+'%';
}
function refreshCount(pid){
  const pd=phaseData(pid); const done=pd.stepList.filter(s=>s.done).length;
  const el=document.getElementById('cnt_'+pid); if(el) el.textContent=done+'/'+pd.stepList.length;
}

function exportLog(){
  const{eta,zarpe}=getTripDates();
  const vname=currentVessel==='fatima'?'María Fátima':'María de Gracia';

  // Hoja 1: Historial de clics
  const logRows=[['Barco','Fase','Paso','Responsable','Acción','Usuario','Fecha y Hora']];
  PHASES_DEFAULT.forEach(ph=>{ const pd=phaseData(ph.id);
    pd.stepList.forEach(s=>{ (s.log||[]).forEach(e=>{
      logRows.push([vname,(pd.title||ph.title),s.text,actorByKey(s.actor).label,
        e.action==='marked'?'Marcó':'Desmarcó',e.user,new Date(e.ts).toLocaleString('es-EC')]);
    });});
  });

  // Hoja 2: Estado actual de tareas
  const stateRows=[['Barco','Fase','Ítem','Responsable','Estado','Fecha límite','Marcado por','Cuándo']];
  PHASES_DEFAULT.forEach((ph,pi)=>{ const pd=phaseData(ph.id);
    pd.stepList.forEach((s,si)=>{
      const due=calcDue(pi,si);
      const lastMark=s.log&&s.log.filter(l=>l.action==='marked').slice(-1)[0];
      stateRows.push([
        vname,(pd.title||ph.title),s.text,actorByKey(s.actor).label,
        s.done?'Completado':(isOverdue(pi,si)?'VENCIDO':'Pendiente'),
        due?due.toLocaleDateString('es-EC'):'—',
        lastMark?lastMark.user:'—',
        lastMark?new Date(lastMark.ts).toLocaleString('es-EC'):'—'
      ]);
    });
  });

  // Crear workbook Excel
  const wb=XLSX.utils.book_new();
  const ws1=XLSX.utils.aoa_to_sheet(logRows);
  const ws2=XLSX.utils.aoa_to_sheet(stateRows);
  ws1['!cols']=[{wch:14},{wch:22},{wch:40},{wch:16},{wch:10},{wch:16},{wch:20}];
  ws2['!cols']=[{wch:14},{wch:22},{wch:40},{wch:16},{wch:12},{wch:14},{wch:16},{wch:20}];
  XLSX.utils.book_append_sheet(wb,ws1,'Historial clics');
  XLSX.utils.book_append_sheet(wb,ws2,'Estado tareas');

  const fname='ATUNTRO_'+vname.replace(/ /g,'_')+'_'+new Date().toISOString().slice(0,10)+'.xlsx';
  XLSX.writeFile(wb,fname);
}

const BM={teal:'bt',purple:'bp',amber:'ba',coral:'bc'};
const BGM={teal:'bgt',purple:'bgp',amber:'bga',coral:'bgc'};

function render(){
  loadTripInfo();
  setTripEditable(isAdmin());
  const admin=isAdmin();
  const container=document.getElementById('ckadm-phasesContainer');
  container.innerHTML=PHASES_DEFAULT.map((ph,i)=>{
    const pd=phaseData(ph.id);
    const done=pd.stepList.filter(s=>s.done).length;
    const titleDisplay=pd.title||ph.title;
    const subDisplay=pd.sub||ph.sub;
    const titleHtml=admin
      ?`<input class="phase-title-in" value="${esc(titleDisplay)}" onclick="event.stopPropagation()" oninput="updatePhaseField('${ph.id}','title',this.value)">`
      :`<div class="phase-title-txt">${esc(titleDisplay)}</div>`;
    const subHtml=admin
      ?`<input class="phase-sub-in" value="${esc(subDisplay)}" onclick="event.stopPropagation()" oninput="updatePhaseField('${ph.id}','sub',this.value)">`
      :`<div class="phase-sub-txt">${esc(subDisplay)}</div>`;
    return `<div class="phase ${BM[ph.color]}${pd.open?' open':''}" id="phase_${ph.id}">
      <div class="phase-hdr">
        <div class="phase-hdr-click" onclick="togglePhase('${ph.id}')">
          <div class="phase-badge ${BGM[ph.color]}">${i+1}</div>
          <div class="phase-tw">${titleHtml}${subHtml}</div>
        </div>
        <div class="phase-meta">
          <span class="phase-atag" id="atag_${ph.id}"></span>
          <span class="phase-cnt" id="cnt_${ph.id}">${done}/${pd.stepList.length}</span>
          <span class="chevron" onclick="togglePhase('${ph.id}')">&#9660;</span>
        </div>
      </div>
      <div class="phase-body" id="body_${ph.id}"></div>
    </div>`;
  }).join('');
  PHASES_DEFAULT.forEach(ph=>{if(phaseData(ph.id).open) renderBody(ph.id);});
  updateProgress(); updateAlerts();
}

setInterval(()=>{if(currentUser){reRenderAll();updateProgress();}},60000);

/* ════════════════════════════════
   FIREBASE
════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
  authDomain: "atuntro-portal.firebaseapp.com",
  databaseURL: "https://atuntro-portal-default-rtdb.firebaseio.com",
  projectId: "atuntro-portal",
  storageBucket: "atuntro-portal.firebasestorage.app",
  messagingSenderId: "390090673795",
  appId: "1:390090673795:web:e01a5d03e5543c8dc415b6"
};
let db = null; /* lazily set in CKADM.init() — portal must init Firebase first */
function _getDb() { if (!db) db = firebase.database(); return db; }

let _fbListeners = {};   // para cancelar listeners al cambiar barco

/* ── helpers Firebase ── */
function fbPath(suffix){ return 'atuntro/'+currentVessel+(suffix?'/'+suffix:''); }

function fbSave(path, data){
  _getDb().ref(path).set(data).catch(e=>console.warn('FB write error',e));
}

function fbOn(path, cb){
  // cancelar listener anterior si existe
  if(_fbListeners[path]) _getDb().ref(path).off('value', _fbListeners[path]);
  const handler = snap => cb(snap.val());
  _getDb().ref(path).on('value', handler);
  _fbListeners[path] = handler;
}

function fbOff(path){
  if(_fbListeners[path]){ _getDb().ref(path).off('value',_fbListeners[path]); delete _fbListeners[path]; }
}

/* ── Reemplazar persist/loadSt con Firebase ── */
// persist: guarda state del barco actual en Firebase Y en localStorage (fallback offline)
const _origPersist = persist;
function persist(){
  try{ localStorage.setItem(sKey(), JSON.stringify(state[currentVessel])); flash(); }catch(e){}
  fbSave(fbPath('state'), state[currentVessel]);
}

// persistUsers con Firebase
const _origPersistUsers = persistUsers;
function persistUsers(u){
  localStorage.setItem('atuntro_users_v8', JSON.stringify(u));
  fbSave('atuntro/users', u);
}

// persistActors con Firebase (por barco)
const _origPersistActors = persistActors;
function persistActors(a){
  localStorage.setItem(actorsKey(), JSON.stringify(a));
  fbSave(fbPath('actors'), a);
}

/* ── Listener en tiempo real por barco ── */
function startRealtimeSync(){
  // cancelar listeners anteriores
  Object.keys(_fbListeners).forEach(p=>fbOff(p));

  // 1. Estado del viaje (steps, progreso, notas)
  fbOn(fbPath('state'), data=>{
    if(!data) return;
    // No re-renderizar si el usuario está escribiendo activamente
    const active = document.activeElement;
    const isTyping = active && (active.tagName==='TEXTAREA'||active.tagName==='INPUT') && active.closest('#ckadm-phasesContainer,.trip-bar');
    state[currentVessel] = data;
    if(currentUser && !isTyping){ render(); }
  });

  // 2. Usuarios globales
  fbOn('atuntro/users', data=>{
    if(!data||!Array.isArray(data)) return;
    USERS = data;
    buildGrid();
    // actualizar sesión si el nombre cambió
    if(currentUser){
      const upd=USERS.find(u=>u.key===currentUser.key);
      if(upd){ currentUser=upd; document.getElementById('ckadm-sessionPill').textContent='👤 '+upd.name; }
    }
  });

  // 3. Responsables del barco
  fbOn(fbPath('actors'), data=>{
    if(!data||!Array.isArray(data)) return;
    ACTORS = data;
    localStorage.setItem(actorsKey(), JSON.stringify(data));
    rebuildLegend();
    if(currentUser) reRenderAll();
  });
}

/* ── Override switchVessel para reiniciar listeners ── */
const _origSwitch = switchVessel;
function switchVessel(v,btn){
  currentVessel=v;
  document.querySelectorAll('.vtab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  // Cargar desde Firebase primero, fallback a localStorage
  state[v]=loadSt(v);
  ACTORS=loadActors(v);
  document.getElementById('ckadm-vesselSub').textContent=VESSEL_INFO[v];
  rebuildLegend();
  render();
  startRealtimeSync();  // reinicia listeners para el nuevo barco
}

/* ── Indicador de conexión — called from init() ── */
function startConnectionDot(){
  _getDb().ref('.info/connected').on('value', snap=>{
    const dot = document.getElementById('ckadm-saveDot');
    if(dot){
      dot.style.background = snap.val() ? '#4AE3A8' : '#EF4444';
      dot.classList.add('show');
    }
  });
}

/* ── INIT — deferred to CKADM.init() by portal ── */
// Cargar desde localStorage mientras conecta
state.fatima=loadSt('fatima');
state.gracia=loadSt('gracia');
/* db / startRealtimeSync() called lazily inside init() below */


  /* ── CKADM.init: called by portal navigation ── */
  function init(portalUser) {
    /* portalUser = {name, key, role} */
    currentUser = {
      name:     portalUser.name,
      key:      portalUser.key,
      role:     portalUser.role,
      isAdmin:  portalUser.role === 'master' || portalUser.role === 'admin',
      isMaster: portalUser.role === 'master'
    };
    selUserKey = portalUser.key;
    var ls = document.getElementById('ckadm-loginScreen');
    if (ls) ls.style.display = 'none';
    var ma = document.getElementById('ckadm-mainApp');
    if (ma) ma.style.display = 'block';
    var sp = document.getElementById('ckadm-sessionPill');
    if (sp) sp.textContent = '\u{1F464} ' + currentUser.name;
    var ap = document.getElementById('ckadm-adminPanel');
    if (ap) ap.classList.toggle('on', currentUser.isAdmin);
    setTripEditable(currentUser.isAdmin);
    ACTORS = loadActors(currentVessel);
    rebuildLegend();
    /* One-time Firebase seed (safe to call multiple times) */
    try {
      _getDb().ref('atuntro/users').once('value').then(function(snap){
        if(!snap.val()) fbSave('atuntro/users', USERS);
      });
      _getDb().ref(fbPath('actors')).once('value').then(function(snap){
        if(!snap.val()) fbSave(fbPath('actors'), ACTORS);
      });
      startConnectionDot();
    } catch(e) { console.warn('CKADM Firebase setup error:', e); }
    render();
    startRealtimeSync();
  }
  /* ── Expose unique functions globally for HTML onclick attributes ── */
  window.doLogin       = doLogin;
  window.openMo        = openMo;
  window.exportLog     = exportLog;
  window.closeMo       = closeMo;
  window.saveUsers     = saveUsers;
  window.addActorRow   = addActorRow;
  window.saveActors    = saveActors;
  window.confirmReset  = confirmReset;
  window.removeActorRow = removeActorRow;
  window.deleteStep      = deleteStep;
  window.addStep         = addStep;
  window.togglePhase     = togglePhase;
  /* ── Dynamic step HTML (renderBody injects these via innerHTML) ── */
  window.updateMaxDays    = updateMaxDays;
  window.updatePhaseField = updatePhaseField;
  window.updateStepActor  = updateStepActor;
  window.updateStepDoc    = updateStepDoc;
  /* ── Static HTML (trip bar date inputs) ── */
  window.onDateChange     = onDateChange;
  /* NOTE: toggleStep, updateNote, updateStepText, saveTripInfo are routed
     via Block 3 dispatchers — do NOT set window.X here or the dispatcher
     gets overridden. Expose via return object instead. */
  return { init: init, switchVessel: switchVessel, resetVessel: resetVessel, moveStep: moveStep,
           toggleStep: toggleStep, updateNote: updateNote,
           updateStepText: updateStepText, saveTripInfo: saveTripInfo };

})();

