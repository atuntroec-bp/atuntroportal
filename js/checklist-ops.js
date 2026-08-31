/* ════════════════════════════════════════════
   CHECKLIST OPERACIONAL — scoped module
════════════════════════════════════════════ */
var CKOPS = (function() {

/* ══════════════════════════════════════════
   FIREBASE CONFIG
   ══════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey:"AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
  authDomain:"atuntro-portal.firebaseapp.com",
  databaseURL:"https://atuntro-portal-default-rtdb.firebaseio.com",
  projectId:"atuntro-portal",
  storageBucket:"atuntro-portal.firebasestorage.app",
  messagingSenderId:"390090673795",
  appId:"1:390090673795:web:e01a5d03e5543c8dc415b6"
};
const FB_PATH = 'checklist_ops_v3';

/* ══════════════════════════════════════════
   ÁREAS Y CONTENIDO
   ══════════════════════════════════════════ */
const AREAS = [
  {
    id:'a1', title:'Previo Arribo', sub:'Coordinación mientras el barco navega hacia puerto',
    color:'teal', dateKey:'arribo', dateLabel:'Arribo',
    sections:[
      {head:'Comunicación y coordinación', steps:[
        {id:'a1s01',text:'Comunicar el ETA del barco a todo el personal por el chat interno'},
        {id:'a1s02',text:'Verificar que los pagos a TPM estén cubiertos y sin mora'},
        {id:'a1s03',text:'Coordinar con la agencia marítima la atención del arribo'},
        {id:'a1s04',text:'Coordinar con TPM la disposición y ubicación del muelle a utilizar'},
        {id:'a1s05',text:'Solicitar al barco la lista de trabajos de cubierta, máquinas, puente y pedidos generales'},
      ]},
      {head:'Consultas al Capitán y Maquinista', steps:[
        {id:'a1s06',text:'Solicitar informe de remanentes de combustible diésel con los que arribará'},
        {id:'a1s07',text:'Consultar temperaturas de las cubas y confirmar si está en condiciones de descargar'},
        {id:'a1s08',text:'Consultar si existen dudas sobre la calidad del pescado por inconvenientes durante la marea'},
        {id:'a1s09',text:'Consultar si el barco tiene limitantes para realizar la descarga y cuáles son'},
        {id:'a1s10',text:'Consultar si hay enfermos a bordo, su estado y si requieren atención médica urgente'},
        {id:'a1s11',text:'Consultar cuántas boyas recuperadas trae'},
      ]},
      {head:'Reportes y novedades', steps:[
        {id:'a1s12',text:'Solicitar reporte de condición de los speed boats (hundimientos o rescates durante la marea)'},
        {id:'a1s13',text:'Verificar si hubo actos o intentos de indisciplina a bordo — reportar por escrito'},
        {id:'a1s14',text:'Ordenar al Jefe de Cubierta preparar el cuaderno de mantenimiento de pesca (pastecas y cables) actualizado para entregar al arribo'},
      ]},
    ]
  },
  {
    id:'a2', title:'Al Arribo', sub:'Inspección general del buque en puerto',
    color:'purple', dateKey:'arribo', dateLabel:'Arribo',
    sections:[
      {head:'Reunión inicial', steps:[
        {id:'a2s01',text:'Reunión de trabajo sobre lo ocurrido en la marea con Capitán, Jefe de Máquinas, Jefe de Cubierta, speedbotero y panguero'},
      ]},
      {head:'Con el Capitán', steps:[
        {id:'a2s02',text:'Confirmar que los informes de captura fueron enviados al SRP'},
        {id:'a2s03',text:'Recoger informe de consumibles y millas recorridas en la marea'},
        {id:'a2s04',text:'Registrar novedades: boyas recuperadas, enfermos, personal que desembarca, cursos pendientes y certificados médicos faltantes'},
      ]},
      {head:'Bitácoras y niveles', steps:[
        {id:'a2s05',text:'Verificar registros de la bitácora de máquinas: motor principal, generadores y equipos de frío'},
        {id:'a2s06',text:'Verificar existencia de diésel con recorrido de sondas; niveles de aceite y consumo de amoniaco'},
        {id:'a2s07',text:'Coordinar con el Maquinista la evacuación de aceites sucios'},
      ]},
      {head:'Puente', steps:[
        {id:'a2s08',text:'Verificar con el Navegante, antes de apagar: radios HF/VHF/2m, GPS, DMS, Navtex, radares, sistema de gobierno, piloto automático, AIS y megafonía'},
      ]},
      {head:'Sala de máquinas', steps:[
        {id:'a2s09',text:'Verificar pérdidas de aceite y agua en motor principal, generadores, prensaestopas y motor de equipos hidráulicos'},
        {id:'a2s10',text:'Confirmar que el sistema de frío no tenga fugas: compresores, cocina, cámaras de frío, hidráulico de gobierno y bombas de salmuera'},
      ]},
      {head:'Sistema hidráulico', steps:[
        {id:'a2s11',text:'Verificar pérdidas en tuberías, bombas, válvulas de control, manómetros, winches de maniobra y winche principal'},
        {id:'a2s12',text:'Verificar operatividad de todos los winches y del macaco'},
      ]},
      {head:'Sistema de refrigeración', steps:[
        {id:'a2s13',text:'Contrastar anotaciones de la bitácora de máquinas con los parámetros de temperatura de los termógrafos'},
        {id:'a2s14',text:'Verificar fugas de amoniaco en tuberías, uniones y válvulas; niveles en recibidores'},
        {id:'a2s15',text:'Verificar sellos de las bombas de salmuera, vibración de motores y ruidos extraños'},
      ]},
      {head:'Sondas y niveles', steps:[
        {id:'a2s16',text:'Tomar muestras de aceite en la bayoneta del cárter de motor principal, generadores e hidráulico'},
        {id:'a2s17',text:'Verificar condición del aceite en cajas reductoras, tomafuerzas y multiplicadoras'},
      ]},
      {head:'Panga de pesca', steps:[
        {id:'a2s18',text:'Probar arranque, marchas avante–atrás y sistema de gobierno; revisar aceite de cárter y caja reductora'},
        {id:'a2s19',text:'Verificar comunicación de radio VHF de la panga'},
      ]},
      {head:'Aparejos de pesca', steps:[
        {id:'a2s20',text:'Reunión con el Jefe de Cubierta: lances realizados, cables cambiados, estado y próximos cambios'},
        {id:'a2s21',text:'Revisar orejas fijas (cáncamos) y orejas de pastecas — sin desgaste'},
        {id:'a2s22',text:'Verificar bocines y pines de pastecas sin desgaste'},
        {id:'a2s23',text:'Verificar cables de maniobra sin alacranes ni cocas pronunciadas'},
      ]},
      {head:'Speed boats', steps:[
        {id:'a2s24',text:'Con los speedboteros: consultar limpieza de tanques de gasolina y recibir informe del estado general del motor'},
        {id:'a2s26',text:'Verificar radio VHF operativo'},
        {id:'a2s27',text:'Verificar cáncamos y estrobos de maniobra completos; grillete del macaco sin desgaste'},
      ]},
      {head:'Cofa', steps:[
        {id:'a2s28',text:'Verificar en cofa: binoculares en buen estado, radio 2m operativo y megafonía funcional'},
      ]},
    ]
  },
  {
    id:'a3', title:'Previa Descarga', sub:'Preparación del buque antes de descargar la pesca',
    color:'amber', dateKey:'descarga', dateLabel:'Descarga',
    sections:[
      {head:'Seguridad — amoniaco', steps:[
        {id:'a3s01',text:'Coordinar con el Maquinista la recogida del amoniaco de los serpentines — prevención de asfixia por rotura de tubo durante la descarga'},
        {id:'a3s02',text:'Constatar la parada de compresores, recogida de amoniaco en recibidores y cierre de válvulas'},
      ]},
      {head:'Documentación para autoridades', steps:[
        {id:'a3s03',text:'Tener listos para las autoridades de pesca: breakdown y bitácora de pesca'},
      ]},
      {head:'Verificación de la carga', steps:[
        {id:'a3s05',text:'Verificar temperatura de la carga en cada cuba — lecturas de -10 °C a -12 °C'},
        {id:'a3s06',text:'Confirmar con el Asistente de Operaciones que las temperaturas registradas habilitan el inicio de la descarga'},
        {id:'a3s07',text:'Hacer sacar los sacos de pescado de la tripulación'},
      ]},
      {head:'Cubierta superior', steps:[
        {id:'a3s08',text:'Limpieza (sin químicos) de la totalidad de la cubierta'},
        {id:'a3s09',text:'Forrar con plástico el winche principal, mangueras de la pluma principal y mangueras de la consola hidráulica'},
        {id:'a3s10',text:'Despejar o proteger con plástico los tanques con residuos de aceite de motores'},
        {id:'a3s11',text:'Tener lista arena y trapos (sin químicos) para mitigar contaminación del pescado ante rotura hidráulica'},
        {id:'a3s12',text:'Restringir la circulación de contratistas de máquinas por la cubierta de descarga'},
      ]},
      {head:'Cubierta de pesca', steps:[
        {id:'a3s13',text:'Limpieza (sin químicos) de piso, mamparos, techos y sentinas — preparación para inspección de biólogos'},
        {id:'a3s14',text:'Forrar con plástico el motor de equipos hidráulicos, mangueras, tomafuerza y multiplicadora'},
        {id:'a3s15',text:'Mantener llenos los dispensadores de jabón líquido en los lavamanos'},
        {id:'a3s16',text:'Cubrir con plástico todos los sacos de sal'},
      ]},
      {head:'Inicio de la descarga', steps:[
        {id:'a3s17',text:'Probar los winches de descarga de la maniobra de tanques N.° 1 babor y estribor'},
        {id:'a3s18',text:'Abrir tapas y escotillas de las cubas con el representante de control de calidad; tomar lecturas en presencia del Asistente de Operaciones'},
        {id:'a3s19',text:'Comunicar a Gerencia el inicio de la descarga con comentario del estado, calidad y novedades del pescado'},
      ]},
    ]
  },
  {
    id:'a4', title:'Antes del Zarpe', sub:'Pruebas y avituallamiento — 36 horas antes de zarpar',
    color:'coral', dateKey:'zarpe', dateLabel:'Zarpe',
    sections:[
      {head:'Avituallamiento y cierres', steps:[
        {id:'a4s01',text:'Verificar con el Maquinista que todos los pedidos de materiales de ferretería estén completos'},
        {id:'a4s02',text:'Verificar aceites lubricantes, combustible diésel, agua potable, sal y demás avituallamiento completos'},
        {id:'a4s03',text:'Recorrido de verificación: sistemas abiertos durante mantenimiento deben quedar cerrados'},
        {id:'a4s04',text:'Reunión con el Jefe de Máquinas: programar horarios de recepción de agua, sal, combustible y víveres'},
      ]},
      {head:'Equipos de refrigeración', steps:[
        {id:'a4s05',text:'Abrir válvulas del sistema y probar bombas de enfriamiento de cabezotes'},
        {id:'a4s06',text:'Probar compresores: presiones de aceite y estado de presostatos de alta, baja y aceite'},
        {id:'a4s07',text:'Presurizar el sistema y probar minuciosamente los serpentines de cada cuba'},
        {id:'a4s08',text:'Probar bombas del condensador; controlar pérdidas en condensador y chillers'},
        {id:'a4s09',text:'Revisar válvulas de paso e inyección manual, tuberías, presostatos y manómetros'},
        {id:'a4s10',text:'Verificar sellos mecánicos, presiones de aceite, golpes raros y presiones fuera de rango'},
        {id:'a4s11',text:'Verificar sensores de temperatura y ausencia de cortos en tableros y motores eléctricos'},
        {id:'a4s12',text:'Verificar nivel de amoniaco en recibidor y estado de los arrancadores suaves'},
      ]},
      {head:'Prueba de propulsión', steps:[
        {id:'a4s13',text:'Test del motor principal: presiones, temperaturas, ruidos extraños y fugas de aceite o agua'},
        {id:'a4s14',text:'Probar la bomba de agua de enfriamiento'},
        {id:'a4s15',text:'Verificar que las válvulas de control de aire de mando de marchas no tengan fugas'},
        {id:'a4s16',text:'Verificar compresores de aire operando en automático, llenando la botella de arranque'},
        {id:'a4s17',text:'Desde el puente: operar avante – stop – atrás por 3 segundos y dar por terminada la prueba'},
      ]},
      {head:'Caja reductora, ejes y descansos', steps:[
        {id:'a4s18',text:'Caja reductora: sin vibración, nivel de aceite, presión mínima 280 psi, sin ruidos, marchas avante y atrás'},
        {id:'a4s19',text:'Ejes de propulsión: controlar vibración durante la prueba y ajuste de pernos flojos'},
        {id:'a4s20',text:'Verificar que los descansos hayan mantenido temperatura aceptable durante el arribo'},
        {id:'a4s21',text:'Controlar que el aceite de los descansos no tenga pérdidas en las áreas de las felpas'},
        {id:'a4s22',text:'Verificar que los empaques de la prensa del eje de cola sellen bien — riesgo de inundación'},
      ]},
      {head:'Motores generadores', steps:[
        {id:'a4s23',text:'Arranques y paradas: controlar presiones y temperaturas; verificar voltaje, amperaje, kW y frecuencia'},
        {id:'a4s24',text:'Verificar operación de las bombas de enfriamiento de cada motor'},
        {id:'a4s25',text:'Verificar que los cargadores de batería suministren voltaje a sus respectivos bancos'},
      ]},
      {head:'Sistema de gobierno', steps:[
        {id:'a4s26',text:'Poner operativo el sistema a distancia e in situ'},
        {id:'a4s27',text:'Revisar pérdidas de aceite en sellos de cilindros hidráulicos y bombas; probar ambas bombas'},
        {id:'a4s28',text:'Operar desde el puente el recorrido del indicador de caña hacia babor y estribor; apagar las bombas'},
      ]},
      {head:'Equipos del puente', steps:[
        {id:'a4s29',text:'Probar todos los equipos del puente: radios VHF, HF y 2m (local y cofa), piloto automático, GPS, radares, luces de navegación, megafonía, comunicación radio-panga y radio-botes, fuentes de poder, ecosonda y equipo DMS'},
      ]},
      {head:'Sistema hidráulico', steps:[
        {id:'a4s31',text:'Probar el sistema hidráulico principal y el de emergencia'},
        {id:'a4s32',text:'Probar el winche principal: tambor de jareta, tow line, embragues y frenos'},
        {id:'a4s33',text:'Probar winches de maniobra de pesca, macaco, pescantes y equipo de fondeo'},
      ]},
      {head:'Tomas de fondo y seguridad', steps:[
        {id:'a4s34',text:'Verificar que los filtros de las tomas de fondo no estén obstruidos por plásticos o sacos'},
        {id:'a4s35',text:'Probar bombas contra incendio y bombas de achique'},
        {id:'a4s36',text:'Verificar operatividad del banco fijo de CO₂'},
        {id:'a4s37',text:'Verificar mangueras contra incendio con tomas y pitones listos para operar'},
        {id:'a4s38',text:'Verificar balsa salvavidas con candado asegurado y chicote del cabo de vida amarrado al barco'},
      ]},
      {head:'Embarcaciones auxiliares y cofa', steps:[
        {id:'a4s39',text:'Panga: junto al panguero, probar motor y propulsión, marchas avante–atrás y recorrido'},
        {id:'a4s40',text:'Speed boats: junto a los speedboteros y el mecánico de botes, realizar pruebas de operación y maniobra'},
        {id:'a4s41',text:'Cofa: verificar que los 2 binoculares estén en su sitio y cubiertos'},
      ]},
      {head:'Gambuzas de víveres', steps:[
        {id:'a4s42',text:'Limpieza interna de ambas cámaras de víveres'},
        {id:'a4s43',text:'Probar equipo de frío de carnes y verduras, bomba del condensador, condensador, evaporador y ventiladores'},
        {id:'a4s44',text:'Probar el timer de descongelación de la cámara de carne y las resistencias del evaporador'},
      ]},
      {head:'Trámite final', steps:[
        {id:'a4s45',text:'Comunicar a la agencia marítima para obtener el zarpe'},
      ]},
    ]
  },
];

/* ══════════════════════════════════════════
   PERSONAS Y MASTER
   ══════════════════════════════════════════ */
const MASTER_NAME = 'Ricardo Baida T';

// Umbrales por defecto (días): soon = aviso amarillo, urgent = aviso rojo
const DEFAULT_THRESHOLDS = { a1:{soon:7,urgent:2,leadDays:0}, a2:{soon:7,urgent:2,leadDays:0}, a3:{soon:5,urgent:1,leadDays:0}, a4:{soon:10,urgent:3,leadDays:2} };

let people = [];
let state  = {fatima:{}, gracia:{}};
let activeUser   = null;
let currentVessel= 'fatima';
let currentArea  = 'a1';
let isTyping=false, typingTimer=null, persistTimer=null;
let db = null, fbReady=false, applyingRemote=false;
let pinVisible=false;

const VESSEL_INFO={fatima:'María Fátima (180 TM · ~20 tripulantes)',gracia:'María de Gracia (215 TM · ~21 tripulantes)'};

const DEFAULT_PEOPLE=[
  {name:'Rubén Vera',      pin:'1111'},
  {name:'Ricardo Baida D', pin:'2222'},
  {name:'Ricardo Baida T', pin:'3333'},
  {name:'Rómulo Pérez',    pin:'4444'},
  {name:'David Pérez',     pin:'5555'},
  {name:'Fernando Farfán', pin:'6666'},
];

function lsKey(v){return 'atuntro_ops_v3_'+v;}
function lsPpl()  {return 'atuntro_ops_v3_personas';}
function lsThr()  {return 'atuntro_ops_v3_thresholds';}

function loadLocal(v){try{const r=localStorage.getItem(lsKey(v));return r?JSON.parse(r):{};}catch(e){return{};}}
function loadPpl() {try{const r=localStorage.getItem(lsPpl());return r?JSON.parse(r):DEFAULT_PEOPLE.slice();}catch(e){return DEFAULT_PEOPLE.slice();}}
function loadThr() {
  try{const r=localStorage.getItem(lsThr());return r?JSON.parse(r):JSON.parse(JSON.stringify(DEFAULT_THRESHOLDS));}
  catch(e){return JSON.parse(JSON.stringify(DEFAULT_THRESHOLDS));}
}

let thresholds = {};

function markTyping(){isTyping=true;clearTimeout(typingTimer);typingTimer=setTimeout(()=>{isTyping=false;},900);}
function persistDebounced(){clearTimeout(persistTimer);persistTimer=setTimeout(persistNow,600);}
function persistNow(){
  try{localStorage.setItem(lsKey(currentVessel),JSON.stringify(state[currentVessel]));}catch(e){}
  try{localStorage.setItem(lsPpl(),JSON.stringify(people));}catch(e){}
  try{localStorage.setItem(lsThr(),JSON.stringify(thresholds));}catch(e){}
  if(fbReady&&!applyingRemote){
    setSync('saving','Guardando…');
    Promise.all([
      db.ref(FB_PATH+'/'+currentVessel).set(state[currentVessel]),
      db.ref(FB_PATH+'/personas').set(people),
      db.ref(FB_PATH+'/thresholds').set(thresholds),
    ]).then(()=>setSync('ok','Sincronizado')).catch(()=>setSync('local','Solo local'));
  } else if(!fbReady){setSync('local','Solo local');}
}
function setSync(cls,label){
  document.getElementById('ckops-syncDot').className='sync-dot '+cls;
  document.getElementById('ckops-syncLbl').textContent=label;
}

/* Firebase */
function initFirebase(){
  // Firebase already initialized by portal
  try{
    db=firebase.database();fbReady=true;setSync('ok','Sincronizado');
    ['fatima','gracia'].forEach(v=>{
      db.ref(FB_PATH+'/'+v).on('value',snap=>{
        if(isTyping)return;
        const r=snap.val();
        if(r&&JSON.stringify(r)!==JSON.stringify(state[v])){
          applyingRemote=true;state[v]=r;
          try{localStorage.setItem(lsKey(v),JSON.stringify(r));}catch(e){}
          if(v===currentVessel)render();
          applyingRemote=false;
        }
      });
    });
    db.ref(FB_PATH+'/personas').on('value',snap=>{
      if(isTyping)return;const r=snap.val();
      if(r&&Array.isArray(r)){applyingRemote=true;people=r;try{localStorage.setItem(lsPpl(),JSON.stringify(r));}catch(e){}applyingRemote=false;}
    });
    db.ref(FB_PATH+'/thresholds').on('value',snap=>{
      if(isTyping)return;const r=snap.val();
      if(r){applyingRemote=true;thresholds=r;try{localStorage.setItem(lsThr(),JSON.stringify(r));}catch(e){}renderAreaTabs();applyingRemote=false;}
    });
  }catch(e){setSync('local','Solo local');}
}

/* ══════════════════════════════════════════
   LOGIN
   ══════════════════════════════════════════ */
let loginTarget=null;

function showLogin(){
  document.getElementById('ckops-loginOverlay').style.display='flex';
  goToStep1();
  renderLoginGrid();
}
function hideLogin(){document.getElementById('ckops-loginOverlay').style.display='none';}

function goToStep1(){
  document.getElementById('ckops-nameStep').style.display='block';
  document.getElementById('ckops-pinStep').style.display='none';
  document.getElementById('ckops-loginSub').textContent='¿Quién eres?';
  if(document.getElementById('ckops-loginErr')) document.getElementById('ckops-loginErr').textContent='';
  if(document.getElementById('ckops-pinInput')) document.getElementById('ckops-pinInput').value='';
  loginTarget=null;
}

function escJs(s){ return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

function renderLoginGrid(){
  document.getElementById('ckops-loginGrid').innerHTML=people.map(p=>
    `<button class="person-btn" onclick="selectPerson('${escJs(p.name)}')">${escH(p.name)}</button>`
  ).join('');
}

function selectPerson(name){
  loginTarget=people.find(p=>p.name===name);
  if(!loginTarget)return;
  document.getElementById('ckops-nameStep').style.display='none';
  document.getElementById('ckops-pinStep').style.display='block';
  document.getElementById('ckops-pinWho').textContent='👤 '+name;
  document.getElementById('ckops-loginSub').textContent='Ingresa tu PIN para continuar';
  document.getElementById('ckops-loginErr').textContent='';
  document.getElementById('ckops-pinInput').value='';
  setTimeout(()=>document.getElementById('ckops-pinInput').focus(), 80);
}

function onPinInput(){
  const inp=document.getElementById('ckops-pinInput');
  inp.value=inp.value.replace(/\D/g,'').slice(0,4);
  document.getElementById('ckops-loginErr').textContent='';
}

function togglePinVis(){
  pinVisible=!pinVisible;
  document.getElementById('ckops-pinInput').type=pinVisible?'text':'password';
  document.getElementById('ckops-pinToggle').textContent=pinVisible?'🙈':'👁';
}

function tryLogin(){
  if(!loginTarget){document.getElementById('ckops-loginErr').textContent='Selecciona tu nombre primero.';return;}
  const entered=document.getElementById('ckops-pinInput').value.trim();
  if(entered===loginTarget.pin){
    activeUser=loginTarget;
    updateUserChip();
    hideLogin();
    render();
  } else {
    document.getElementById('ckops-loginErr').textContent='PIN incorrecto. Intenta de nuevo.';
    document.getElementById('ckops-pinInput').value='';
    document.getElementById('ckops-pinInput').focus();
  }
}

function backToNames(){
  goToStep1();
}

function logout(){
  if(!confirm('¿Cerrar sesión?'))return;
  activeUser=null;
  updateUserChip();
  showLogin();
}

function updateUserChip(){
  const av=document.getElementById('ckops-uAvatar');
  const nm=document.getElementById('ckops-uName');
  const badge=document.getElementById('ckops-uBadge');
  const peopleBtn=document.getElementById('ckops-peopleBtn');
  if(activeUser){
    const init=activeUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    av.textContent=init; nm.textContent=activeUser.name;
    const isM=isMaster();
    badge.style.display=isM?'inline':'none';
    peopleBtn.style.display=isM?'inline':'none';
  } else {
    av.textContent='?'; nm.textContent='—';
    badge.style.display='none'; peopleBtn.style.display='none';
  }
}
function isMaster(){ return !!activeUser && !!activeUser.isAdmin; }

/* ══════════════════════════════════════════
   PERSONAS
   ══════════════════════════════════════════ */
function openPeople(){
  renderPeopleModal();
  document.getElementById('ckops-peopleModal').classList.add('show');
}
function renderPeopleModal(){
  document.getElementById('ckops-peopleList').innerHTML=people.map((p,i)=>
    `<div class="prow"><span>${escH(p.name)}</span><span class="prow-pin">${escH(p.pin)}</span>
     <button class="prow-del" onclick="removePerson(${i})">✕</button></div>`
  ).join('')||'<p style="font-size:12px;color:#aaa;padding:8px 0">Sin personas.</p>';
}
function addPerson(){
  const name=document.getElementById('ckops-newName').value.trim();
  const pin=document.getElementById('ckops-newPin').value.trim();
  if(!name){alert('Escribe un nombre.');return;}
  if(!/^\d{4}$/.test(pin)){alert('El PIN debe ser 4 dígitos numéricos.');return;}
  if(people.find(p=>p.name===name)){alert('Esa persona ya existe.');return;}
  people.push({name,pin});
  document.getElementById('ckops-newName').value='';
  document.getElementById('ckops-newPin').value='';
  renderPeopleModal();renderLoginGrid();persistDebounced();
}
function removePerson(i){
  if(!confirm('¿Eliminar a "'+people[i].name+'"?'))return;
  people.splice(i,1);renderPeopleModal();renderLoginGrid();persistDebounced();
}

/* ══════════════════════════════════════════
   URGENCIA Y FECHAS
   ══════════════════════════════════════════ */
function diffDays(dateStr){
  if(!dateStr)return null;
  const today=new Date();today.setHours(0,0,0,0);
  const t=new Date(dateStr+'T00:00:00');
  return Math.round((t-today)/(864e5));
}
function urgClass(aid,dateStr){
  const d=diffDays(dateStr);
  if(d===null)return 'urg-none';
  const thr=thresholds[aid]||DEFAULT_THRESHOLDS[aid]||{soon:7,urgent:2};
  if(d<0)return 'urg-past';
  if(d<=thr.urgent)return 'urg-urgent';
  if(d<=thr.soon)return 'urg-soon';
  return 'urg-ok';
}
function badgeClass(aid,dateStr){
  const uc=urgClass(aid,dateStr);
  return uc==='urg-ok'?'ds-ok':uc==='urg-soon'?'ds-soon':uc==='urg-urgent'?'ds-urgent':uc==='urg-past'?'ds-past':'';
}
function daysLabel(dateStr){
  const d=diffDays(dateStr);
  if(d===null)return'';
  if(d<0)return'Hace '+(Math.abs(d))+' día'+(Math.abs(d)>1?'s':'');
  if(d===0)return'¡HOY!';
  return'En '+d+' día'+(d>1?'s':'');
}
function refreshUrgency(){
  const trip=vesselState()._trip||{};
  const pairs=[
    {inputId:'ckops-dateArribo',   dsId:'ckops-dsA',  dateKey:'arribo'},
    {inputId:'ckops-dateDescarga', dsId:'ckops-dsD',  dateKey:'descarga'},
    {inputId:'ckops-dateZarpe',    dsId:'ckops-dsZ',  dateKey:'zarpe'},
  ];
  pairs.forEach(({inputId,dsId,dateKey})=>{
    const val=document.getElementById(inputId).value;
    // find area using this dateKey for badge class
    const area=AREAS.find(a=>a.dateKey===dateKey)||AREAS[0];
    const bc=badgeClass(area.id,val);
    const el=document.getElementById(dsId);
    el.className='ds-badge '+(bc||'');
    el.textContent=daysLabel(val)||'';
    el.style.display=val?'inline-block':'none';
  });
  renderAreaTabs();
  updateDeadlineBadge(currentArea);
}

/* ══════════════════════════════════════════
   ESTADO
   ══════════════════════════════════════════ */
function vesselState(){return state[currentVessel];}
function areaData(aid){
  const vs=vesselState();
  if(!vs.areas)vs.areas={};
  if(!vs.areas[aid])vs.areas[aid]={steps:{},extraSteps:[],notes:'',sectionOrder:{},customSteps:{},deletedSteps:{}};
  const ad=vs.areas[aid];
  if(!ad.extraSteps)ad.extraSteps=[];
  if(!ad.steps)ad.steps={};
  if(!ad.sectionOrder)ad.sectionOrder={};
  if(!ad.customSteps)ad.customSteps={};
  if(!ad.deletedSteps)ad.deletedSteps={};
  // Migración de versión anterior: extraSteps sueltos -> customSteps de la última sección
  if(ad.extraSteps.length){
    const area=AREAS.find(a=>a.id===aid);
    const lastSec=area?area.sections.length-1:0;
    ad.extraSteps.forEach(es=>{
      if(!ad.customSteps[es.id]) ad.customSteps[es.id]={text:es.text||'Nuevo sub-item', sec:lastSec};
    });
    ad.extraSteps=[];
  }
  return ad;
}
function stepState(aid,sid){
  const ad=areaData(aid);
  if(!ad.steps[sid])ad.steps[sid]={};
  return ad.steps[sid];
}
/* Devuelve la lista ordenada y reconciliada de sub-items de una sección */
function getSectionItems(area,secIdx){
  const ad=areaData(area.id);
  const sec=area.sections[secIdx];
  if(!sec) return [];
  const predefIds=sec.steps.filter(s=>!ad.deletedSteps[s.id]).map(s=>s.id);
  const customIds=Object.keys(ad.customSteps).filter(id=>ad.customSteps[id].sec===secIdx);
  const validIds=new Set([...predefIds,...customIds]);

  let order=ad.sectionOrder[secIdx];
  if(!order){ order=[...predefIds,...customIds]; }
  else{
    order=order.filter(id=>validIds.has(id));
    [...predefIds,...customIds].forEach(id=>{ if(!order.includes(id)) order.push(id); });
  }
  ad.sectionOrder[secIdx]=order;

  return order.map(id=>{
    if(ad.customSteps[id]){
      return {id, text:ad.customSteps[id].text, isCustom:true};
    }
    const base=sec.steps.find(s=>s.id===id);
    const ss=ad.steps[id];
    const text=(ss&&ss.text!==undefined)?ss.text:(base?base.text:'');
    return {id, text, isCustom:false};
  });
}
function allSteps(area){
  let all=[];
  area.sections.forEach((sec,idx)=>{ all=all.concat(getSectionItems(area,idx)); });
  return all;
}
function moveStep(aid,secIdx,id,dir){
  if(!isMaster())return;
  const area=AREAS.find(a=>a.id===aid);
  getSectionItems(area,secIdx); // asegura reconciliación del orden
  const ad=areaData(aid);
  const order=ad.sectionOrder[secIdx];
  const idx=order.indexOf(id);
  const swapIdx=idx+dir;
  if(idx<0||swapIdx<0||swapIdx>=order.length)return;
  [order[idx],order[swapIdx]]=[order[swapIdx],order[idx]];
  persistDebounced();
  render();
}
function deleteStepMaster(aid,secIdx,id){
  if(!isMaster())return;
  if(!confirm('¿Eliminar este sub-item?\n\nEsta acción no se puede deshacer.'))return;
  const ad=areaData(aid);
  if(ad.customSteps[id]) delete ad.customSteps[id];
  else ad.deletedSteps[id]=true;
  if(ad.sectionOrder[secIdx]) ad.sectionOrder[secIdx]=ad.sectionOrder[secIdx].filter(x=>x!==id);
  delete ad.steps[id];
  persistDebounced();
  render();
}
function addSectionStep(aid,secIdx){
  if(!isMaster())return;
  const area=AREAS.find(a=>a.id===aid);
  getSectionItems(area,secIdx); // asegura que sectionOrder[secIdx] exista
  const ad=areaData(aid);
  const id='extra_'+Date.now();
  ad.customSteps[id]={text:'Nuevo sub-item',sec:secIdx};
  ad.sectionOrder[secIdx].push(id);
  persistDebounced();
  render();
}
function sectionCheckAll(aid,secIdx){
  if(!activeUser){alert('Inicia sesión con tu nombre y PIN antes de marcar puntos.');return;}
  const area=AREAS.find(a=>a.id===aid);
  const items=getSectionItems(area,secIdx);
  if(!items.length)return;
  const ad=areaData(aid);
  const allDone=items.every(it=>ad.steps[it.id]&&ad.steps[it.id].done);
  if(allDone)return; // no-op: ya están todos marcados
  items.forEach(it=>{
    const ss=stepState(aid,it.id);
    // Solo marca si el usuario es responsable del item o es master
    if(!ss.done && (isMaster() || ss.resp===activeUser.name)){
      if(!ss.hist)ss.hist=[];
      ss.done=true;
      ss.hist.push({action:'marcado',by:activeUser.name,at:Date.now()});
    }
  });
  persistDebounced();
  render();
}

/* ══════════════════════════════════════════
   INTERACCIÓN DE PASOS
   ══════════════════════════════════════════ */
function toggleStep(aid,sid){
  if(!activeUser){alert('Inicia sesión con tu nombre y PIN antes de marcar un punto.');return;}
  const ss=stepState(aid,sid);
  // Permiso: solo el responsable asignado O el master pueden marcar/desmarcar
  if(!isMaster()){
    if(!ss.resp){
      alert('Este punto no tiene responsable asignado. Solo el administrador puede marcarlo.');
      return;
    }
    if(ss.resp!==activeUser.name){
      alert('Solo "'+ss.resp+'" o el administrador pueden marcar este punto.');
      return;
    }
  }
  if(!ss.hist)ss.hist=[];
  const action=ss.done?'reversado':'marcado';
  ss.done=!ss.done;
  ss.hist.push({action,by:activeUser.name,at:Date.now()});
  persistDebounced();
  const chk=document.getElementById('chk_'+sid);
  const txt=document.getElementById('txt_'+sid);
  const stEl=document.getElementById('st_'+sid);
  if(chk)chk.classList.toggle('done',ss.done);
  if(txt)txt.classList.toggle('done-txt',ss.done);
  if(stEl)stEl.innerHTML=stampsHtml(ss);
  updateProgress();renderAreaTabs();
}
function stampsHtml(ss){
  if(!ss.hist||!ss.hist.length)return'';
  const last=ss.hist[ss.hist.length-1];
  const isMk=last.action==='marcado';
  const histBtn=ss.hist.length>1
    ?`<button class="hist-btn" onclick="openHist(event,'${encodeURIComponent(JSON.stringify(ss.hist))}')">Historial (${ss.hist.length})</button>`:'';
  return `<span class="stamp ${isMk?'stamp-ok':'stamp-rev'}">${isMk?'✓':'↩'} ${escH(last.by)} · ${fmtDt(last.at)}</span>${histBtn}`;
}
function openHist(evt,encoded){
  evt.stopPropagation();
  const entries=JSON.parse(decodeURIComponent(encoded));
  document.getElementById('ckops-histBody').innerHTML=[...entries].reverse().map(h=>{
    const ok=h.action==='marcado';
    return`<div class="he ${ok?'he-ok':'he-rev'}"><div class="he-action">${ok?'✓ Marcado':'↩ Reversado'}</div><div class="he-meta">${escH(h.by)} — ${fmtDt(h.at)}</div></div>`;
  }).join('');
  document.getElementById('ckops-histModal').classList.add('show');
}
function updateStepText(aid,sid,val){
  if(!isMaster())return;
  markTyping();
  const ad=areaData(aid);
  if(ad.customSteps[sid]){ ad.customSteps[sid].text=val; }
  else { stepState(aid,sid).text=val; }
  persistDebounced();
}
function updateResp(aid,sid,val){
  if(!isMaster())return;
  stepState(aid,sid).resp=val;persistDebounced();
  const s=document.getElementById('resp_'+sid);if(s)s.classList.toggle('has-val',!!val);
}
function updateNote(aid,val){markTyping();areaData(aid).notes=val;persistDebounced();}
function updateObs(aid,sid,val){markTyping();stepState(aid,sid).obs=val;persistDebounced();}

/* ══════════════════════════════════════════
   UMBRALES (solo master)
   ══════════════════════════════════════════ */
function saveThr(aid,key,val){
  if(!thresholds[aid])thresholds[aid]={};
  thresholds[aid][key]=parseInt(val)||0;
  persistDebounced();renderAreaTabs();refreshUrgency();updateDeadlineBadge(aid);
}
function thrConfigHtml(aid){
  if(!isMaster())return'';
  const thr=thresholds[aid]||DEFAULT_THRESHOLDS[aid]||{soon:7,urgent:2,leadDays:0};
  return`<div class="urg-config visible">
    <h4>⚙ Configuración (solo administrador)</h4>
    <div class="urg-row">
      <label>🟡 Mostrar en amarillo si faltan ≤</label>
      <input type="number" min="1" max="60" value="${thr.soon}" oninput="saveThr('${aid}','soon',this.value)"> días
    </div>
    <div class="urg-row">
      <label>🔴 Mostrar en rojo si faltan ≤</label>
      <input type="number" min="0" max="30" value="${thr.urgent}" oninput="saveThr('${aid}','urgent',this.value)"> días
    </div>
    <div class="urg-row urg-row-sep">
      <label>📅 Fecha límite: días antes del ancla</label>
      <input type="number" min="0" max="60" value="${thr.leadDays||0}" oninput="saveThr('${aid}','leadDays',this.value)"> días
    </div>
  </div>`;
}
function deadlineFor(aid){
  const area=AREAS.find(a=>a.id===aid);
  const trip=vesselState()._trip||{};
  const dateMap={arribo:trip.arribo,descarga:trip.descarga,zarpe:trip.zarpe};
  const anchor=dateMap[area.dateKey];
  const lead=(thresholds[aid]&&thresholds[aid].leadDays)||0;
  if(!anchor||!lead)return'';
  const d=new Date(anchor+'T00:00:00');
  d.setDate(d.getDate()-lead);
  const p=n=>String(n).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear();
}
function updateDeadlineBadge(aid){
  const el=document.getElementById('deadlineBadge_'+aid);
  if(!el)return;
  const dl=deadlineFor(aid);
  el.style.display=dl?'inline-block':'none';
  el.textContent=dl?'📅 Fecha límite: '+dl:'';
}

/* ══════════════════════════════════════════
   PROGRESO Y TABS
   ══════════════════════════════════════════ */
function areaCounts(area){
  const ad=areaData(area.id),all=allSteps(area);
  return{done:all.filter(s=>ad.steps[s.id]&&ad.steps[s.id].done).length,total:all.length};
}
function updateProgress(){
  const area=AREAS.find(a=>a.id===currentArea);
  const c=areaCounts(area);
  const pct=c.total?Math.round(c.done/c.total*100):0;
  document.getElementById('ckops-progFill').style.width=pct+'%';
  document.getElementById('ckops-progPct').textContent=pct+'%';
  document.getElementById('ckops-progLabel').textContent='Progreso — '+area.title;
}
function renderAreaTabs(){
  const trip=vesselState()._trip||{};
  const dateMap={arribo:trip.arribo,descarga:trip.descarga,zarpe:trip.zarpe};
  document.getElementById('ckops-areaTabs').innerHTML=AREAS.map(a=>{
    const c=areaCounts(a);
    const dv=dateMap[a.dateKey]||'';
    const uc=urgClass(a.id,dv);
    const bc=badgeClass(a.id,dv);
    const dl=daysLabel(dv);
    const dateRow=dv
      ?`<div class="atab-daterow"><span class="atab-datelabel">${a.dateLabel}:</span><span class="atab-urgbadge ${bc}">${fmtShort(dv)}${dl?' · '+dl:''}</span></div>`
      :`<div class="atab-daterow"><span class="atab-datelabel" style="color:#ddd">Sin fecha</span></div>`;
    const deadline=deadlineFor(a.id);
    const deadlineRow=deadline?`<div class="atab-deadline">📅 Límite: ${deadline}</div>`:'';
    return`<button class="atab ${uc}${a.id===currentArea?' active':''}" onclick="switchArea('${a.id}')">
      <span class="atab-name">${a.title}</span>
      <span class="atab-count">${c.done}/${c.total} completados</span>
      ${dateRow}
      ${deadlineRow}
    </button>`;
  }).join('');
}

/* ══════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════ */
function respOpts(sel){
  return'<option value="">Sin asignar</option>'+people.map(p=>`<option value="${escA(p.name)}"${p.name===sel?' selected':''}>${escH(p.name)}</option>`).join('')+(sel&&!people.find(p=>p.name===sel)?`<option value="${escA(sel)}" selected>${escH(sel)}</option>`:'');
}
function stepHtml(aid,secIdx,item,numLabel){
  const ss=stepState(aid,item.id),done=!!ss.done;
  const master=isMaster();
  const roAttr=master?'':'readonly';
  const disAttr=master?'':'disabled';
  const ctrlBtns=master?`<span class="step-actions">
      <button class="mini-btn" title="Subir" onclick="moveStep('${aid}',${secIdx},'${item.id}',-1)">▲</button>
      <button class="mini-btn" title="Bajar" onclick="moveStep('${aid}',${secIdx},'${item.id}',1)">▼</button>
      <button class="mini-btn mini-del" title="Eliminar" onclick="deleteStepMaster('${aid}',${secIdx},'${item.id}')">✕</button>
    </span>`:'';
  return`<div class="step">
    <div class="step-num">${numLabel}</div>
    <div class="step-chk${done?' done':''}" id="chk_${item.id}" onclick="toggleStep('${aid}','${item.id}')"></div>
    <div class="step-body">
      <textarea class="step-txt${done?' done-txt':''}" id="txt_${item.id}" rows="1" ${roAttr}
        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px';updateStepText('${aid}','${item.id}',this.value)">${escH(item.text)}</textarea>
      <div class="step-meta">
        <select class="resp-sel${ss.resp?' has-val':''}" id="resp_${item.id}" ${disAttr} onchange="updateResp('${aid}','${item.id}',this.value)">${respOpts(ss.resp||'')}</select>
        ${ctrlBtns}
      </div>
      <input type="text" class="obs-input" id="obs_${item.id}" placeholder="Observaciones…" value="${escA(ss.obs||'')}" oninput="updateObs('${aid}','${item.id}',this.value)">
      <div class="stamps" id="st_${item.id}">${stampsHtml(ss)}</div>
    </div>
  </div>`;
}
const BL={teal:'bl-teal',purple:'bl-purple',amber:'bl-amber',coral:'bl-coral'};
function render(){
  loadTripInfo();refreshUrgency();renderAreaTabs();
  const area=AREAS.find(a=>a.id===currentArea);
  const master=isMaster();
  const deadline=deadlineFor(area.id);
  let h=`<div class="area-panel ${BL[area.color]}"><div class="area-sub">${escH(area.sub)}</div>`;
  if(currentVessel==='gracia'&&master){
    h+=`<div style="margin:10px 0 14px">
      <button onclick="copyRespFromFatima()" style="background:linear-gradient(135deg,#1a6fa8,#155b8f);color:#fff;border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 2px 6px rgba(0,0,0,.25)">
        ⬇ Copiar responsables de María Fátima
      </button>
      <span style="font-size:11px;color:#888;margin-left:10px">Solo copia ítems sin responsable asignado</span>
    </div>`;
  }
  h+=`<div class="deadline-badge" id="deadlineBadge_${area.id}" style="display:${deadline?'inline-block':'none'}">${deadline?'📅 Fecha límite: '+deadline:''}</div>`;
  area.sections.forEach((sec,secIdx)=>{
    const items=getSectionItems(area,secIdx);
    const ad=areaData(area.id);
    const allDone=items.length>0&&items.every(it=>ad.steps[it.id]&&ad.steps[it.id].done);
    h+=`<div class="sec-head-row">
      <div class="sec-head">${secIdx+1}. ${escH(sec.head)}</div>
      <button class="sec-checkall${allDone?' all-done':''}" title="Marcar todos los sub-items de esta sección" onclick="sectionCheckAll('${area.id}',${secIdx})">${allDone?'✓ Todos marcados':'☐ Marcar todos'}</button>
    </div>`;
    h+=items.map((it,i)=>stepHtml(area.id,secIdx,it,(secIdx+1)+'.'+(i+1))).join('');
    if(master){
      h+=`<button class="add-substep-btn" onclick="addSectionStep('${area.id}',${secIdx})">+ Agregar sub-item a esta sección</button>`;
    }
  });
  h+=thrConfigHtml(area.id);
  const ad2=areaData(area.id);
  h+=`<div class="notes-wrap"><div class="notes-lbl">Notas de esta área</div>
    <textarea class="notes-ta" placeholder="Observaciones, pendientes, contactos..."
      oninput="updateNote('${area.id}',this.value)">${escH(ad2.notes||'')}</textarea>
  </div></div>`;
  document.getElementById('ckops-areaPanel').innerHTML=h;
  document.querySelectorAll('#ckops-areaPanel textarea.step-txt').forEach(ta=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
  updateProgress();
}

/* ══════════════════════════════════════════
   VIAJE
   ══════════════════════════════════════════ */
function saveTripInfo(){
  vesselState()._trip={
    id:document.getElementById('ckops-tripId').value,
    arribo:document.getElementById('ckops-dateArribo').value,
    descarga:document.getElementById('ckops-dateDescarga').value,
    zarpe:document.getElementById('ckops-dateZarpe').value,
  };
  persistDebounced();
}
function loadTripInfo(){
  const t=vesselState()._trip||{};
  document.getElementById('ckops-tripId').value=t.id||'';
  document.getElementById('ckops-dateArribo').value=t.arribo||'';
  document.getElementById('ckops-dateDescarga').value=t.descarga||'';
  document.getElementById('ckops-dateZarpe').value=t.zarpe||'';
}

/* ══════════════════════════════════════════
   EMBARCACIÓN / ÁREA
   ══════════════════════════════════════════ */
function switchVessel(v,btn){
  currentVessel=v;
  document.querySelectorAll('.vtab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('ckops-vesselSub').textContent=VESSEL_INFO[v];
  render();
}
function switchArea(aid){currentArea=aid;render();}
function resetVessel(){
  const nm=currentVessel==='fatima'?'María Fátima':'María de Gracia';
  if(!confirm('¿Reiniciar el viaje de '+nm+'?\n\nSe borrarán checks, historial, notas y fechas.\nSe conservan textos editados, pasos agregados y responsables asignados.'))return;
  const vs=vesselState();
  if(vs.areas)Object.keys(vs.areas).forEach(aid=>{
    const ad=vs.areas[aid];
    ad.notes='';
    Object.keys(ad.steps||{}).forEach(sid=>{delete ad.steps[sid].done;delete ad.steps[sid].hist;});
  });
  vs._trip={};
  persistNow();render();
}

/* ══════════════════════════════════════════
   COPIAR RESPONSABLES MF → MG
   ══════════════════════════════════════════ */
function copyRespFromFatima(){
  if(!isMaster())return;
  if(!confirm('¿Copiar las asignaciones de responsables de María Fátima a María de Gracia?\n\nSolo se copian los ítems que aún no tienen responsable en María de Gracia. Los que ya tienen asignación no se tocan.'))return;
  const fAreas=(state.fatima&&state.fatima.areas)||{};
  if(!state.gracia.areas)state.gracia.areas={};
  let copied=0;
  AREAS.forEach(function(area){
    const fArea=fAreas[area.id];
    if(!fArea||!fArea.steps)return;
    if(!state.gracia.areas[area.id])
      state.gracia.areas[area.id]={steps:{},extraSteps:[],notes:'',sectionOrder:{},customSteps:{},deletedSteps:{}};
    const gArea=state.gracia.areas[area.id];
    if(!gArea.steps)gArea.steps={};
    Object.keys(fArea.steps).forEach(function(sid){
      const fStep=fArea.steps[sid];
      if(fStep&&fStep.resp){
        if(!gArea.steps[sid])gArea.steps[sid]={};
        if(!gArea.steps[sid].resp){
          gArea.steps[sid].resp=fStep.resp;
          copied++;
        }
      }
    });
  });
  if(!copied){
    alert('No hay responsables nuevos para copiar.\nTodos los ítems de María de Gracia ya tienen asignación.');
    return;
  }
  /* Persistir gracia en localStorage y Firebase */
  try{localStorage.setItem(lsKey('gracia'),JSON.stringify(state.gracia));}catch(e){}
  if(fbReady&&!applyingRemote){
    setSync('saving','Guardando…');
    Promise.all([
      db.ref(FB_PATH+'/gracia').set(state.gracia),
      db.ref(FB_PATH+'/personas').set(people),
      db.ref(FB_PATH+'/thresholds').set(thresholds),
    ]).then(function(){setSync('ok','Sincronizado');}).catch(function(){setSync('local','Solo local');});
  }
  render();
  alert('✅ Se copiaron '+copied+' asignaciones de responsables desde María Fátima.');
}

/* ══════════════════════════════════════════
   REPORTE PDF DE CUMPLIMIENTO
   Genera una vista imprimible y abre el diálogo
   "Guardar como PDF" del navegador.
   ══════════════════════════════════════════ */
function exportCumplimientoPDF(){
  const vname = currentVessel==='fatima' ? 'María Fátima' : 'María de Gracia';
  const trip  = vesselState()._trip || {};
  const hoy   = new Date();
  const p = n => String(n).padStart(2,'0');
  const fechaGen = p(hoy.getDate())+'/'+p(hoy.getMonth()+1)+'/'+hoy.getFullYear()+' '+p(hoy.getHours())+':'+p(hoy.getMinutes());
  const fmtD = s => { if(!s) return '—'; const d=new Date(s+'T00:00:00'); return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear(); };

  // ── Recolectar datos por área ──
  let totalAll=0, doneAll=0;
  const areasHtml = AREAS.map(area=>{
    const ad = areaData(area.id);
    let rows='';
    let aTotal=0, aDone=0;
    area.sections.forEach((sec,secIdx)=>{
      const items = getSectionItems(area, secIdx);
      if(!items.length) return;
      rows += `<tr class="sec-row"><td colspan="4">${escH(sec.head||'')}</td></tr>`;
      items.forEach(it=>{
        const ss = ad.steps[it.id] || {};
        const done = !!ss.done;
        aTotal++; totalAll++;
        if(done){ aDone++; doneAll++; }
        const lastMark = (ss.hist||[]).filter(h=>h.action==='marcado').slice(-1)[0];
        const quien = done ? (lastMark?escH(lastMark.by):(ss.resp?escH(ss.resp):'—')) : (ss.resp?escH(ss.resp):'—');
        const cuando = done && lastMark ? fmtDt(lastMark.at) : '—';
        rows += `<tr>
          <td class="c-chk">${done?'<span class="ok">✔</span>':'<span class="no">○</span>'}</td>
          <td class="c-txt">${escH(it.text||'')}</td>
          <td class="c-resp">${quien}</td>
          <td class="c-when">${cuando}</td>
        </tr>`;
      });
    });
    if(!aTotal) return '';
    const pct = aTotal?Math.round(aDone/aTotal*100):0;
    return `<div class="area-block">
      <div class="area-head">
        <span class="area-title">${escH(area.title)}</span>
        <span class="area-prog">${aDone}/${aTotal} · ${pct}%</span>
      </div>
      <table class="ctab">
        <thead><tr><th class="c-chk"></th><th>Ítem</th><th class="c-resp">Responsable</th><th class="c-when">Marcado</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join('');

  const pctAll = totalAll?Math.round(doneAll/totalAll*100):0;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Cumplimiento — ${escH(vname)}${trip.id?(' — Viaje '+escH(trip.id)):''}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;color:#1a1a18;padding:26px 30px;font-size:11px}
  .rpt-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1F4E79;padding-bottom:12px;margin-bottom:16px}
  .rpt-title{font-size:19px;font-weight:800;color:#1F4E79;letter-spacing:.5px}
  .rpt-sub{font-size:11px;color:#666;margin-top:3px}
  .rpt-meta{text-align:right;font-size:10px;color:#555;line-height:1.7}
  .rpt-meta b{color:#1a1a18}
  .summary{display:flex;gap:10px;margin-bottom:18px}
  .sum-card{flex:1;border:1px solid #d5dee8;border-radius:8px;padding:10px 12px;background:#f4f7fb}
  .sum-num{font-size:22px;font-weight:800;color:#1F4E79}
  .sum-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#888;margin-top:2px}
  .sum-bar{height:9px;background:#e2e8f0;border-radius:5px;overflow:hidden;margin-top:6px}
  .sum-fill{height:100%;background:linear-gradient(90deg,#1D9E75,#2E75B6)}
  .area-block{margin-bottom:15px;break-inside:avoid}
  .area-head{display:flex;justify-content:space-between;align-items:center;background:#1F4E79;color:#fff;padding:6px 11px;border-radius:6px 6px 0 0}
  .area-title{font-size:12px;font-weight:700}
  .area-prog{font-size:11px;font-weight:700;opacity:.92}
  table.ctab{width:100%;border-collapse:collapse;border:1px solid #d5dee8;border-top:none}
  .ctab th{background:#2E75B6;color:#fff;font-size:9px;text-transform:uppercase;letter-spacing:.4px;padding:5px 8px;text-align:left;font-weight:700}
  .ctab td{padding:5px 8px;border-bottom:1px solid #eef2f6;vertical-align:top}
  .ctab tr:nth-child(even) td{background:#fafcfe}
  .sec-row td{background:#eaf0f6!important;font-weight:700;color:#1F4E79;font-size:10px;padding:5px 8px}
  .c-chk{width:26px;text-align:center}
  .c-resp{width:130px;color:#444}
  .c-when{width:120px;color:#777;font-size:10px}
  .ok{color:#1D9E75;font-weight:800;font-size:13px}
  .no{color:#c9c9c9;font-size:13px}
  .rpt-foot{margin-top:18px;padding-top:10px;border-top:1px solid #ddd;font-size:9px;color:#999;text-align:center}
  @media print{body{padding:0}@page{margin:14mm}}
</style></head><body>
  <div class="rpt-head">
    <div>
      <div class="rpt-title">Reporte de Cumplimiento Operativo</div>
      <div class="rpt-sub">${escH(vname)} · Checklist de Operaciones</div>
    </div>
    <div class="rpt-meta">
      <div>N° Viaje: <b>${trip.id?escH(trip.id):'—'}</b></div>
      <div>Arribo: <b>${fmtD(trip.arribo)}</b> · Descarga: <b>${fmtD(trip.descarga)}</b> · Zarpe: <b>${fmtD(trip.zarpe)}</b></div>
      <div>Generado: <b>${fechaGen}</b></div>
    </div>
  </div>

  <div class="summary">
    <div class="sum-card"><div class="sum-num">${pctAll}%</div><div class="sum-lbl">Cumplimiento total</div>
      <div class="sum-bar"><div class="sum-fill" style="width:${pctAll}%"></div></div></div>
    <div class="sum-card"><div class="sum-num">${doneAll}</div><div class="sum-lbl">Ítems completados</div></div>
    <div class="sum-card"><div class="sum-num">${totalAll-doneAll}</div><div class="sum-lbl">Ítems pendientes</div></div>
    <div class="sum-card"><div class="sum-num">${totalAll}</div><div class="sum-lbl">Total de ítems</div></div>
  </div>

  ${areasHtml || '<p style="color:#888">No hay ítems para reportar.</p>'}

  <div class="rpt-foot">ATUNTRO S.A. — Documento generado automáticamente desde el Portal Operativo — ${fechaGen}</div>
  <script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>
</body></html>`;

  const w = window.open('', '_blank');
  if(!w){ alert('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para descargar el PDF.'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}


/* ══════════════════════════════════════════
   UTILS
   ══════════════════════════════════════════ */
function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function escA(s){return escH(s).replace(/"/g,'&quot;');}
function fmtDt(ts){
  if(!ts)return'';const d=new Date(ts),p=n=>String(n).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());
}
function fmtShort(str){
  if(!str)return'';const[y,m,d]=str.split('-');return d+'/'+m+'/'+y;
}

/* ══════════════════════════════════════════
   INIT — deferred to CKOPS.init() by portal
   ══════════════════════════════════════════ */
state.fatima=loadLocal('fatima');
state.gracia=loadLocal('gracia');
people=loadPpl();
thresholds=loadThr();
/* render() / showLogin() / initFirebase() are called by init() below */


  /* ── CKOPS.init: called by portal navigation ── */
  function init(portalUser) {
    /* portalUser = {name, key, role} from portal session */
    activeUser = {
      name: portalUser.name,
      pin:  '____',  /* bypass – already authenticated */
      isAdmin: portalUser.role === 'master' || portalUser.role === 'master_operaciones'
    };
    /* Set vessel subtitle */
    var vs = document.getElementById('ckops-vesselSub');
    if (vs) vs.textContent = VESSEL_INFO[currentVessel] || VESSEL_INFO.fatima;
    updateUserChip();
    /* Hide login overlay */
    var ov = document.getElementById('ckops-loginOverlay');
    if (ov) { ov.style.display = 'none'; ov.style.visibility = 'hidden'; }
    /* Connect to Firebase using portal's already-initialised app */
    if (!fbReady) initFirebase();
    render();
  }
  /* ── Expose unique functions globally for HTML onclick attributes ── */
  window.togglePinVis     = togglePinVis;
  window.tryLogin         = tryLogin;
  window.backToNames      = backToNames;
  window.addPerson        = addPerson;
  window.selectPerson     = selectPerson;
  window.removePerson     = removePerson;
  window.openHist         = openHist;
  window.switchArea       = switchArea;
  window.deleteStepMaster = deleteStepMaster;
  window.openPeople       = openPeople;
  /* ── Dynamic step HTML (render() injects these via innerHTML) ── */
  window.sectionCheckAll  = sectionCheckAll;
  window.addSectionStep   = addSectionStep;
  window.updateResp       = updateResp;
  window.updateObs        = updateObs;
  window.saveThr               = saveThr;
  window.copyRespFromFatima    = copyRespFromFatima;
  /* ── Static HTML (dates bar, PIN overlay) ── */
  window.markTyping       = markTyping;
  window.onPinInput       = onPinInput;
  window.refreshUrgency   = refreshUrgency;
  window.exportCumplimientoPDF = exportCumplimientoPDF;
  /* NOTE: toggleStep, updateNote, updateStepText, saveTripInfo are routed
     via Block 3 dispatchers — do NOT set window.X here or the dispatcher
     gets overridden. Expose via return object instead. */
  return { init: init, switchVessel: switchVessel, resetVessel: resetVessel, moveStep: moveStep,
           toggleStep: toggleStep, updateNote: updateNote,
           updateStepText: updateStepText, saveTripInfo: saveTripInfo };

})();

