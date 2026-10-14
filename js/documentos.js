/* ════════════════════════════════════════════
   CONTROL DOCUMENTAL — módulo con namespace DOCS
   (sincronización Firebase compartida)
════════════════════════════════════════════ */
var DOCS = (function(){

const BASE = [{"num": "NO.0140463", "nom": "Matricula de Armador", "barco": "Atun Tropical Atuntro SA", "emi": "2025-07-11", "ven": "2026-03-31", "val": null}, {"num": "FALTA", "nom": "Certificado de Analisis", "barco": "Atun Tropical Atuntro SA", "emi": "2023-01-01", "ven": "2024-01-01", "val": null}, {"num": "FALTA", "nom": "Certificado de Analisis", "barco": "Atun Tropical Atuntro SA", "emi": "2023-01-01", "ven": "2024-01-01", "val": null}, {"num": "FALTA", "nom": "Certificado de Analisis", "barco": "Atun Tropical Atuntro SA", "emi": "2023-01-01", "ven": "2024-01-01", "val": null}, {"num": "MPCEIP-SCI-DCDS-HACCP-2022-0266", "nom": "PLAN HACCP", "barco": "Maria de Gracia", "emi": "2025-05-01", "ven": "2026-05-01", "val": null}, {"num": "Dirman-Ptra-75339-2023", "nom": "Permiso de trafico nacional", "barco": "Maria de Gracia", "emi": "2026-03-13", "ven": "2027-01-16", "val": null}, {"num": "NO. 50-2022", "nom": "Certificado programacion EPIRB", "barco": "Maria de Gracia", "emi": null, "ven": null, "val": null}, {"num": "DIRNEA-CILC-15159-2023", "nom": "Certificado internacional de lineas de carga", "barco": "Maria de Gracia", "emi": "2023-03-21", "ven": "2028-03-31", "val": null}, {"num": "CER NO. 00-2022-707", "nom": "Certificado Extintores Portatiles", "barco": "Maria de Gracia", "emi": null, "ven": null, "val": null}, {"num": "NO. GUY-22-1067", "nom": "Certificado Balsas salvavidas", "barco": "Maria de Gracia", "emi": null, "ven": null, "val": null}, {"num": "CER NO. 00-2022-708", "nom": "SISTEMA DE BANCOS DE CO2", "barco": "Maria de Gracia", "emi": null, "ven": null, "val": null}, {"num": "DPI-2026-AT-044", "nom": "permiso pesca", "barco": "Maria de Gracia", "emi": "2026-01-16", "ven": "2027-01-16", "val": null}, {"num": "CAPMAN-MANA-20067-2025", "nom": "Matricula de Nave", "barco": "Maria de Gracia", "emi": "2025-12-26", "ven": "2026-12-31", "val": null}, {"num": "Dirnea-Dota-058-2026", "nom": "Documento de Dotacion minima", "barco": "Maria de Gracia", "emi": "2026-03-03", "ven": "2031-03-03", "val": null}, {"num": "DIRNEA-CSPC-66387-2026", "nom": "Certificado de seguridad y prevencion de la contaminacion", "barco": "Maria de Gracia", "emi": "2026-03-10", "ven": "2027-03-31", "val": null}, {"num": "Dirnea-Csr-4967-2023", "nom": "Certificado de Seguridad Radioelectrica de Buque", "barco": "Maria de Gracia", "emi": "2023-05-15", "ven": "2028-05-15", "val": null}, {"num": "CERT NO. 2023-010018", "nom": "BATERIAS SART", "barco": "Maria de Gracia", "emi": "2023-05-04", "ven": "2028-02-01", "val": null}, {"num": "DIRNEA-CIAR-18476-2022", "nom": "Certificado internacional de arqueo", "barco": "Maria de Gracia", "emi": "2022-05-10", "ven": "2122-05-10", "val": null}, {"num": "MTOP-PTNT-0290-2019", "nom": "Patente de Navegacion", "barco": "Maria de Gracia", "emi": "2019-02-13", "ven": "2150-02-13", "val": null}, {"num": "registro de la propiedad", "nom": "Registro de la propiedad", "barco": "Maria de Gracia", "emi": "2026-01-12", "ven": "2027-01-12", "val": null}, {"num": "Dirman-Ptra-75338-2023", "nom": "Permiso de trafico nacional", "barco": "Maria Fatima", "emi": "2026-03-13", "ven": "2026-12-23", "val": null}, {"num": "NO. 003899B", "nom": "Certificado de Plagas", "barco": "Maria Fatima", "emi": "2022-10-06", "ven": "2023-01-06", "val": null}, {"num": "MPCEIP-SCI-DCDS-HACCP-2023-0028", "nom": "PLAN HACCP", "barco": "Maria Fatima", "emi": "2025-12-22", "ven": "2026-12-22", "val": null}, {"num": "DPI-2025-AT-0482", "nom": "permiso pesca", "barco": "Maria Fatima", "emi": "2025-12-23", "ven": "2026-12-23", "val": null}, {"num": "CAPUIL-MANA-20738-2025", "nom": "Matricula de Nave", "barco": "Maria Fatima", "emi": "2025-12-17", "ven": "2026-12-31", "val": null}, {"num": "Dirnea-Dota-27861-2023", "nom": "Documento de Dotacion minima", "barco": "Maria Fatima", "emi": "2023-03-31", "ven": "2028-03-31", "val": null}, {"num": "DIRNEA-CILC-19439-2025", "nom": "Certificado internacional de lineas de carga", "barco": "Maria Fatima", "emi": "2025-02-16", "ven": "2030-03-31", "val": null}, {"num": "Dirnea-Csr-4969-2023", "nom": "Certificado de Seguridad Radioelectrica de Buque", "barco": "Maria Fatima", "emi": "2023-05-15", "ven": "2028-05-15", "val": null}, {"num": "DIRNEA-ITNC-23894-2024", "nom": "Certificado internacional de arqueo", "barco": "Maria Fatima", "emi": "2024-09-05", "ven": "2124-02-13", "val": null}, {"num": "DIRNEA-PTNT-0044-20211", "nom": "Patente de Navegacion", "barco": "Maria Fatima", "emi": "2011-09-05", "ven": "2111-03-31", "val": null}, {"num": "LEST-2018-027", "nom": "Libreto de Estabilidad Aprobado por DIGMER", "barco": "Maria Fatima", "emi": "2018-03-28", "ven": "2099-12-31", "val": null}, {"num": "DIGMER-APDS-0053-2007", "nom": "Aprobacion de plano de seguridad", "barco": "Maria Fatima", "emi": "2007-10-26", "ven": "2099-12-31", "val": null}, {"num": "DIRNEA-LERN-4969-2023", "nom": "Licencia de estacion de Radio de la Nave", "barco": "Maria Fatima", "emi": "2023-05-15", "ven": "2028-03-31", "val": null}, {"num": "DIRNEA-CSPC-66388-2026", "nom": "Seguridad y Prevencion de la Contaminacion", "barco": "Maria Fatima", "emi": "2026-03-10", "ven": "2027-03-31", "val": null}, {"num": "CAPUIL-PROP-63014-2025", "nom": "Certificado de Registro de la propiedad", "barco": "Maria Fatima", "emi": "2025-12-15", "ven": "2026-12-15", "val": null}, {"num": "", "nom": "Certificado programacion EPIRB", "barco": "Maria Fatima", "emi": null, "ven": null, "val": null}, {"num": "", "nom": "BATERIAS SART", "barco": "Maria Fatima", "emi": null, "ven": null, "val": null}, {"num": "", "nom": "SISTEMA DE BANCOS DE CO2", "barco": "Maria Fatima", "emi": null, "ven": null, "val": null}, {"num": "", "nom": "Certificado Extintores Portatiles", "barco": "Maria Fatima", "emi": null, "ven": null, "val": null}, {"num": "", "nom": "Certificado Balsas salvavidas", "barco": "Maria Fatima", "emi": null, "ven": null, "val": null}, {"num": "MTOP-ACDZ-3922-2017", "nom": "Aprobacion cuadro de zafarrancho", "barco": "Maria de Gracia", "emi": "2017-04-21", "ven": "2100-03-31", "val": null}, {"num": "MTOP-APDS-4407-2017", "nom": "Aprobacion Plano de Seguridad", "barco": "Maria de Gracia", "emi": "2017-04-21", "ven": "2100-03-31", "val": null}, {"num": "LEST-056-2017-3", "nom": "Libreto de Estabilidad Aprobado por DIGMER", "barco": "Maria de Gracia", "emi": "2019-09-18", "ven": "2029-09-15", "val": null}, {"num": "DIRNEA-LERN-4967-2023", "nom": "Licencia de estacion de radio de la nave", "barco": "Maria de Gracia", "emi": "2026-03-15", "ven": "2028-03-31", "val": null}, {"num": "CAPMAN-PROP-63505-2026", "nom": "Certificado de Registro de la Propiedad", "barco": "Maria de Gracia", "emi": "2026-01-12", "ven": "2027-01-12", "val": null}];
const STORE = 'atuntro_docs_v2';
const BARCOS_FIJOS = ['Maria Fatima','Maria de Gracia','Atun Tropical Atuntro SA'];

let rows = [];
let sortKey='dias', sortDir=1;
let estadoFiltro = new Set();
let nuevosIds = new Set();

/* ── PDF adjuntos ──
   Los archivos viven en un nodo aparte (atuntro_documentos/pdfs/{id}) para que
   la lista de documentos siga liviana; en cada fila solo se guarda {name,size,at}. */
const PDF_PATH = 'atuntro_documentos/pdfs';
const PDF_MAX_MB = 8;
let pdfOcupado = new Set();
let zipEnCurso = false;

function _pdfCSS(){
  if(document.getElementById('docs-pdf-css')) return;
  const s=document.createElement('style'); s.id='docs-pdf-css';
  s.textContent=`
    .docs-pdf{display:flex;gap:4px;align-items:center;white-space:nowrap}
    .docs-pdf button{border:1px solid #d0d0cc;background:#fff;border-radius:6px;padding:3px 7px;font-size:12px;cursor:pointer;line-height:1.2}
    .docs-pdf button:hover{background:#f2f2ef}
    .docs-pdf .pdf-up{color:#185FA5;border-style:dashed}
    .docs-pdf .pdf-ok{color:#1D9E75;border-color:#1D9E75}
    .docs-pdf .pdf-x{color:#C0392B}
    .docs-pdf .pdf-busy{font-size:12px;color:#7B7B78}`;
  document.head.appendChild(s);
}
function _kb(n){ n=+n||0; return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'; }
function _limpio(s){ return String(s||'').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim(); }
function _nombrePdf(r){
  return _limpio([r.barco,r.nom,(r.num&&r.num!=='FALTA')?r.num:''].filter(Boolean).join(' - ')).slice(0,150)+'.pdf';
}

function celdaPdf(r){
  if(pdfOcupado.has(r.id)) return `<div class="docs-pdf"><span class="pdf-busy">Procesando…</span></div>`;
  if(!r.pdf) return `<div class="docs-pdf"><button class="pdf-up" title="Subir PDF" onclick="DOCS.subirPdf('${r.id}')">⬆ Subir</button></div>`;
  return `<div class="docs-pdf">
    <button class="pdf-ok" title="Ver ${att(r.pdf.name)} (${_kb(r.pdf.size)})" onclick="DOCS.verPdf('${r.id}')">👁</button>
    <button title="Descargar" onclick="DOCS.descargarPdf('${r.id}')">⬇</button>
    <button title="Reemplazar PDF" onclick="DOCS.subirPdf('${r.id}')">⟳</button>
    <button class="pdf-x" title="Quitar PDF" onclick="DOCS.quitarPdf('${r.id}')">✕</button></div>`;
}

function subirPdf(id){
  const r=rows.find(x=>x.id===id); if(!r) return;
  const db=_getDb();
  if(!db){ alert('Sin conexión a Firebase: no se puede subir el PDF en este momento.'); return; }
  const inp=document.createElement('input');
  inp.type='file'; inp.accept='application/pdf,.pdf';
  inp.onchange=()=>{
    const f=inp.files[0]; if(!f) return;
    if(f.type!=='application/pdf' && !/\.pdf$/i.test(f.name)){ alert('Solo se aceptan archivos PDF.'); return; }
    if(f.size>PDF_MAX_MB*1048576){
      alert('El PDF pesa '+_kb(f.size)+'. El máximo es '+PDF_MAX_MB+' MB.\nComprímalo (o escanee en menor resolución) y vuelva a intentarlo.'); return;
    }
    if(r.pdf && !confirm('Este documento ya tiene "'+r.pdf.name+'".\n¿Reemplazarlo por "'+f.name+'"?')) return;
    const rd=new FileReader();
    rd.onload=()=>{
      const b64=String(rd.result).split(',')[1]||'';
      const meta={name:f.name, size:f.size, at:Date.now()};
      pdfOcupado.add(id); render();
      db.ref(PDF_PATH+'/'+id).set(Object.assign({data:b64},meta))
        .then(()=>{ const rr=rows.find(x=>x.id===id); if(rr){ rr.pdf=meta; guardar(); } })
        .catch(e=>alert('No se pudo subir el PDF: '+((e&&e.message)||e)))
        .finally(()=>{ pdfOcupado.delete(id); render(); });
    };
    rd.onerror=()=>alert('No se pudo leer el archivo seleccionado.');
    rd.readAsDataURL(f);
  };
  inp.click();
}

function _traerPdf(id){
  const db=_getDb();
  if(!db) return Promise.reject(new Error('Sin conexión a Firebase'));
  return db.ref(PDF_PATH+'/'+id).once('value').then(s=>{
    const d=s.val();
    if(!d||!d.data) throw new Error('El archivo no se encontró en el servidor');
    const bin=atob(d.data), u=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
    return new Blob([u],{type:'application/pdf'});
  });
}
function _bajarBlob(blob,nombre){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),60000);
}

function descargarPdf(id){
  const r=rows.find(x=>x.id===id); if(!r||!r.pdf) return;
  pdfOcupado.add(id); render();
  _traerPdf(id).then(b=>_bajarBlob(b,_nombrePdf(r)))
    .catch(e=>alert('No se pudo descargar: '+((e&&e.message)||e)))
    .finally(()=>{ pdfOcupado.delete(id); render(); });
}

function verPdf(id){
  const r=rows.find(x=>x.id===id); if(!r||!r.pdf) return;
  const w=window.open('','_blank'); // se abre ya, para que no lo bloquee el navegador
  if(w){ try{ w.document.write('<p style="font-family:sans-serif;padding:20px">Cargando PDF…</p>'); }catch(e){} }
  pdfOcupado.add(id); render();
  _traerPdf(id).then(b=>{
      const url=URL.createObjectURL(b);
      if(w) w.location.href=url; else window.open(url,'_blank');
    })
    .catch(e=>{ if(w) w.close(); alert('No se pudo abrir: '+((e&&e.message)||e)); })
    .finally(()=>{ pdfOcupado.delete(id); render(); });
}

function quitarPdf(id){
  const r=rows.find(x=>x.id===id); if(!r||!r.pdf) return;
  if(!confirm('¿Quitar el PDF "'+r.pdf.name+'" de '+(r.nom||'este documento')+'?\nEl documento se mantiene; solo se elimina el archivo.')) return;
  const db=_getDb();
  if(!db){ alert('Sin conexión a Firebase: no se puede quitar el PDF ahora.'); return; }
  pdfOcupado.add(id); render();
  db.ref(PDF_PATH+'/'+id).remove()
    .then(()=>{ const rr=rows.find(x=>x.id===id); if(rr){ delete rr.pdf; guardar(); } })
    .catch(e=>alert('No se pudo quitar el PDF: '+((e&&e.message)||e)))
    .finally(()=>{ pdfOcupado.delete(id); render(); });
}

function _jszip(){
  if(window.JSZip) return Promise.resolve(window.JSZip);
  return new Promise((ok,ko)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    s.onload=()=>ok(window.JSZip);
    s.onerror=()=>ko(new Error('No se pudo cargar el compresor ZIP'));
    document.head.appendChild(s);
  });
}

// Descarga en un ZIP los PDFs de la vista actual (respeta filtros), en carpetas por embarcación
function descargarTodosPdf(){
  if(zipEnCurso) return;
  const list=filtrarTodo(enriquecer()).filter(r=>r.pdf);
  if(!list.length){ alert('No hay PDFs adjuntos en la vista actual.'); return; }
  const total=list.reduce((s,r)=>s+(+r.pdf.size||0),0);
  if(!confirm('Se descargarán '+list.length+' PDF(s) ('+_kb(total)+') de la vista actual en un archivo ZIP.\n¿Continuar?')) return;
  zipEnCurso=true; render();
  const fallos=[];
  _jszip().then(JSZip=>{
    const z=new JSZip(), usados={};
    return list.reduce((p,r)=>p.then(()=>_traerPdf(r.id).then(b=>{
        const carpeta=_limpio(r.barco)||'Sin embarcacion';
        let n=_nombrePdf(r), k=carpeta+'/'+n;
        if(usados[k]){ usados[k]++; n=n.replace(/\.pdf$/,' ('+usados[k]+').pdf'); } else usados[k]=1;
        z.folder(carpeta).file(n,b);
      }).catch(()=>fallos.push((r.nom||'sin nombre')+' — '+r.barco))
    ), Promise.resolve()).then(()=>z.generateAsync({type:'blob'}));
  }).then(zip=>{
    _bajarBlob(zip,'PDFs_documentos_atuntro_'+new Date().toISOString().slice(0,10)+'.zip');
    if(fallos.length) alert('No se pudieron incluir '+fallos.length+' archivo(s):\n\n'+fallos.join('\n'));
  }).catch(e=>alert('No se pudo generar el ZIP: '+((e&&e.message)||e)))
    .finally(()=>{ zipEnCurso=false; render(); });
}

function uid(){ return 'd'+Date.now()+Math.floor(Math.random()*1000); }

// ── Firebase ──
const FB_PATH = 'atuntro_documentos/data';
let _db=null, _fbHandler=null, _saveDebounce=null, _lastRemoteJSON=null, _isTyping=false, _typingTO=null;
function _getDb(){
  try{
    if(typeof firebase==='undefined') return null;
    if(!firebase.apps.length) firebase.initializeApp({
      apiKey:"AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
      authDomain:"atuntro-portal.firebaseapp.com",
      databaseURL:"https://atuntro-portal-default-rtdb.firebaseio.com",
      projectId:"atuntro-portal",
      storageBucket:"atuntro-portal.firebasestorage.app",
      messagingSenderId:"390090673795",
      appId:"1:390090673795:web:e01a5d03e5543c8dc415b6"
    });
    return firebase.database();
  }catch(e){ return null; }
}
function _markTyping(){ _isTyping=true; clearTimeout(_typingTO); _typingTO=setTimeout(()=>{_isTyping=false;},700); }
function _seed(){
  return BASE.map(d=>({id:uid(), nom:d.nom, barco:d.barco, num:d.num||'', emi:d.emi||'', ven:d.ven||'', val:d.val||''}));
}
function cargar(){
  // fallback local mientras Firebase responde
  try{
    const raw=localStorage.getItem(STORE);
    if(raw){ rows=JSON.parse(raw); }
    else { rows=_seed(); }
  }catch(e){ rows=_seed(); }

  _db=_getDb();
  if(!_db) return;
  const ref=_db.ref(FB_PATH);
  if(_fbHandler) ref.off('value',_fbHandler);
  _fbHandler=snap=>{
    const data=snap.val();
    if(!data || !Array.isArray(data.rows)){
      // primera vez: sube la base local a Firebase
      if(rows && rows.length){ ref.set({rows, updatedAt:Date.now()}).catch(()=>{}); }
      return;
    }
    const json=JSON.stringify(data.rows);
    if(json===_lastRemoteJSON) return;
    if(_isTyping) return; // no pisar lo que el usuario edita ahora
    _lastRemoteJSON=json;
    rows=data.rows;
    try{ localStorage.setItem(STORE, JSON.stringify(rows)); }catch(e){}
    render(); flash();
  };
  ref.on('value',_fbHandler);
}
function guardar(){
  try{ localStorage.setItem(STORE, JSON.stringify(rows)); }catch(e){}
  flash();
  const json=JSON.stringify(rows);
  if(json===_lastRemoteJSON) return;
  clearTimeout(_saveDebounce);
  _saveDebounce=setTimeout(()=>{
    _lastRemoteJSON=json;
    const db=_getDb();
    if(db){ db.ref(FB_PATH).set({rows, updatedAt:Date.now()}).catch(()=>{}); }
  }, 600);
}

const EST = {
  venc:{lab:'Vencido',    cls:'p-venc', k:'k-venc', color:'#C0392B'},
  pv:  {lab:'Por vencer', cls:'p-pv',   k:'k-pv',   color:'#D85A30'},
  at:  {lab:'Atención',   cls:'p-at',   k:'k-at',   color:'#BA7517'},
  vig: {lab:'Vigente',    cls:'p-vig',  k:'k-vig',  color:'#1D9E75'},
  perm:{lab:'Permanente', cls:'p-perm', k:'k-perm', color:'#534AB7'},
  sf:  {lab:'Sin fecha',  cls:'p-sf',   k:'k-sf',   color:'#7B7B78'}
};

function hoy(){ const t=new Date(); return new Date(t.getFullYear(),t.getMonth(),t.getDate()); }
function parse(s){ if(!s) return null; const p=String(s).split('-'); if(p.length!==3) return null; return new Date(+p[0],+p[1]-1,+p[2]); }
function dias(s){ const d=parse(s); if(!d||isNaN(d)) return null; return Math.round((d-hoy())/86400000); }
function estado(dv,fecha){
  if(dv===null) return 'sf';
  if(parse(fecha).getFullYear()>=2090) return 'perm';
  if(dv<0) return 'venc';
  if(dv<=30) return 'pv';
  if(dv<=90) return 'at';
  return 'vig';
}
function enriquecer(){
  return rows.map(r=>{ const dv=dias(r.ven); return {...r, dias:dv, st:estado(dv,r.ven)}; });
}

function listaBarcos(){
  return [...new Set(BARCOS_FIJOS.concat(rows.map(r=>r.barco).filter(Boolean)))];
}

function filtrarBarco(rs){
  const b=document.getElementById('fBarco').value;
  return b==='__all__'?rs:rs.filter(r=>r.barco===b);
}
function filtrarTodo(rs){
  const q=document.getElementById('fTexto').value.trim().toLowerCase();
  let out=filtrarBarco(rs);
  if(q) out=out.filter(r=>((r.nom||'')+' '+(r.num||'')).toLowerCase().includes(q));
  if(estadoFiltro.size) out=out.filter(r=>estadoFiltro.has(r.st));
  return out;
}

function renderKPIs(rs){
  const base=filtrarBarco(rs), cnt={};
  Object.keys(EST).forEach(k=>cnt[k]=0);
  base.forEach(r=>cnt[r.st]++);
  const order=['venc','pv','at','vig','perm','sf'];
  document.getElementById('kpis').innerHTML=order.map(k=>
    `<div class="kpi ${EST[k].k}${estadoFiltro.has(k)?' sel':''}" onclick="DOCS.toggleEstado('${k}')">
       <div class="kpi-num">${cnt[k]}</div><div class="kpi-lab">${EST[k].lab}</div></div>`).join('');
  document.getElementById('chipRow').innerHTML=order.map(k=>
    `<button class="chip${estadoFiltro.has(k)?' on':''}" onclick="DOCS.toggleEstado('${k}')">${EST[k].lab}</button>`).join('')+
    `<button class="chip" onclick="DOCS.limpiarEstado()">Todos</button>`+
    `<button class="chip" onclick="DOCS.descargarTodosPdf()" title="Descarga en ZIP los PDF de la vista actual">${zipEnCurso?'Preparando ZIP…':'⬇ PDFs (ZIP)'}</button>`;
  const sinPdf=base.filter(r=>!r.pdf).length;
  document.getElementById('subHeader').textContent =
    base.length+' documentos · '+cnt.venc+' vencidos · '+cnt.pv+' por vencer en 30 días · '+sinPdf+' sin PDF';
}
function toggleEstado(k){ estadoFiltro.has(k)?estadoFiltro.delete(k):estadoFiltro.add(k); render(); }
function limpiarEstado(){ estadoFiltro.clear(); render(); }

function renderTimeline(rs){
  const lim=+document.getElementById('fDias').value;
  const list=filtrarTodo(rs).filter(r=>r.dias!==null&&r.st!=='perm'&&r.dias<=lim).sort((a,b)=>a.dias-b.dias).slice(0,25);
  document.getElementById('tlSub').textContent=list.length+' documento(s)';
  if(!list.length){ document.getElementById('timeline').innerHTML='<div class="empty">Sin vencimientos en el horizonte seleccionado.</div>'; return; }
  const max=Math.max(lim===9999?365:lim,1);
  document.getElementById('timeline').innerHTML=list.map(r=>{
    const pct=r.dias<0?100:Math.max(3,Math.min(100,r.dias/max*100));
    return `<div class="tl-row">
      <div class="tl-name">${esc(r.nom)}<br><em>${esc(r.barco)}</em></div>
      <div class="tl-track"><div class="tl-bar" style="width:${pct}%;background:${EST[r.st].color}"></div></div>
      <div class="tl-days" style="color:${EST[r.st].color}">${r.dias<0?('−'+Math.abs(r.dias)+'d'):(r.dias+'d')}</div>
    </div>`;}).join('');
}

function renderMonths(rs){
  const base=filtrarTodo(rs).filter(r=>r.dias!==null&&r.st!=='perm');
  const h=hoy(), buckets=[];
  for(let i=0;i<12;i++){ const d=new Date(h.getFullYear(),h.getMonth()+i,1); buckets.push({y:d.getFullYear(),m:d.getMonth(),n:0}); }
  base.forEach(r=>{ const d=parse(r.ven); if(!d) return;
    const b=buckets.find(x=>x.y===d.getFullYear()&&x.m===d.getMonth()); if(b) b.n++; });
  const max=Math.max(1,...buckets.map(b=>b.n));
  const MN=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  document.getElementById('months').innerHTML=buckets.map((b,i)=>
    `<div class="mcol"><div class="mval">${b.n||''}</div>
     <div class="mbar${b.n>=3?' warn':''}" style="height:${b.n/max*100}%" title="${b.n} vencimiento(s)"></div>
     <div class="mlab">${MN[b.m]}${b.m===0||i===0?"'"+String(b.y).slice(2):''}</div></div>`).join('');
}

const COLS=[
  {k:'nom',t:'Documento'},{k:'barco',t:'Embarcación'},{k:'num',t:'N° / Código'},
  {k:'emi',t:'Emisión'},{k:'ven',t:'Vencimiento'},{k:'dias',t:'Días'},
  {k:'st',t:'Estado'},{k:'val',t:'Valor'},{k:'pdf',t:'PDF',nosort:true},{k:'__',t:'',nosort:true}
];

function renderTabla(rs){
  const list=filtrarTodo(rs).slice().sort((a,b)=>{
    let A=a[sortKey],B=b[sortKey];
    if(sortKey==='dias'){ A=(A===null?999999:A); B=(B===null?999999:B); }
    A=(A===null||A===undefined)?'':A; B=(B===null||B===undefined)?'':B;
    return (A>B?1:A<B?-1:0)*sortDir;
  });
  document.getElementById('thRow').innerHTML=COLS.map(c=>
    `<th class="${c.nosort?'nosort':''}" ${c.nosort?'':`onclick="DOCS.setSort('${c.k}')"`}>${c.t}${sortKey===c.k?(sortDir>0?' ▲':' ▼'):''}</th>`).join('');
  document.getElementById('tblSub').textContent=list.length+' fila(s)';
  if(!list.length){ document.getElementById('tbody').innerHTML='<tr><td colspan="10" class="empty">Sin resultados con los filtros actuales.</td></tr>'; return; }
  const opts=listaBarcos();
  document.getElementById('tbody').innerHTML=list.map(r=>`<tr class="${nuevosIds.has(r.id)?'nueva':''}">
    <td class="accent" style="border-left-color:${EST[r.st].color}"><input class="cell-in${r.nom?'':' vacio'}" value="${att(r.nom)}" placeholder="Nombre del documento" onchange="DOCS.setCampo('${r.id}','nom',this.value)"></td>
    <td><select class="cell-in" onchange="DOCS.setCampo('${r.id}','barco',this.value)">
        ${opts.map(b=>`<option value="${att(b)}"${b===r.barco?' selected':''}>${esc(b)}</option>`).join('')}
      </select></td>
    <td><input class="cell-in${r.num&&r.num!=='FALTA'?'':' vacio'}" value="${att(r.num)}" placeholder="FALTA N°" onchange="DOCS.setCampo('${r.id}','num',this.value)"></td>
    <td><input type="date" class="cell-in" value="${att(r.emi)}" onchange="DOCS.setCampo('${r.id}','emi',this.value)"></td>
    <td><input type="date" class="cell-in${r.ven?'':' vacio'}" value="${att(r.ven)}" onchange="DOCS.setCampo('${r.id}','ven',this.value)"></td>
    <td class="dias-cell" style="color:${EST[r.st].color}">${r.dias===null?'—':r.dias}</td>
    <td><span class="pill ${EST[r.st].cls}">${EST[r.st].lab}</span></td>
    <td><input class="cell-in" value="${att(r.val)}" placeholder="—" style="min-width:70px" onchange="DOCS.setCampo('${r.id}','val',this.value)"></td>
    <td>${celdaPdf(r)}</td>
    <td><button class="del-btn" title="Eliminar documento" onclick="DOCS.eliminar('${r.id}')">✕</button></td>
  </tr>`).join('');
}

function setSort(k){ if(sortKey===k) sortDir*=-1; else {sortKey=k;sortDir=1;} render(); }

function setCampo(id,campo,val){ _markTyping();
  const r=rows.find(x=>x.id===id); if(!r) return;
  r[campo]=val;
  guardar();
  render();
}

function eliminar(id){
  const r=rows.find(x=>x.id===id); if(!r) return;
  if(!confirm('¿Eliminar el documento "'+(r.nom||'sin nombre')+'" de '+r.barco+'?')) return;
  if(!confirm('Esta acción no se puede deshacer. ¿Confirmar eliminación?')) return;
  if(r.pdf){ const db=_getDb(); if(db) db.ref(PDF_PATH+'/'+id).remove().catch(()=>{}); }
  rows=rows.filter(x=>x.id!==id);
  nuevosIds.delete(id);
  guardar(); render();
}

/* Modal */
function abrirModal(){
  document.getElementById('mBarco').innerHTML=listaBarcos().map(b=>`<option value="${att(b)}">${esc(b)}</option>`).join('');
  const sel=document.getElementById('fBarco').value;
  if(sel!=='__all__') document.getElementById('mBarco').value=sel;
  ['mNom','mNum','mEmi','mVen','mVal'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('ovl').classList.add('on');
  setTimeout(()=>document.getElementById('mNom').focus(),50);
}
function cerrarModal(){ document.getElementById('ovl').classList.remove('on'); }

function guardarNuevo(){
  const nom=document.getElementById('mNom').value.trim();
  if(!nom){ alert('Escriba el nombre del documento.'); document.getElementById('mNom').focus(); return; }
  const id=uid();
  rows.push({
    id, nom,
    barco: document.getElementById('mBarco').value,
    num:   document.getElementById('mNum').value.trim(),
    emi:   document.getElementById('mEmi').value,
    ven:   document.getElementById('mVen').value,
    val:   document.getElementById('mVal').value.trim()
  });
  nuevosIds.add(id);
  guardar(); cerrarModal(); render();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') cerrarModal();
  if(e.key==='Enter' && document.getElementById('ovl').classList.contains('on')) guardarNuevo();
});

/* Datos */
function restaurarBase(){
  if(!confirm('¿Restaurar la lista original del Excel?\n\nSe perderán los documentos agregados, las ediciones hechas aquí y TODOS los PDF adjuntos.')) return;
  if(!confirm('Esta acción no se puede deshacer. ¿Confirmar?')) return;
  const db=_getDb(); if(db) db.ref(PDF_PATH).remove().catch(()=>{});
  nuevosIds.clear();
  rows=_seed();
  guardar(); render();
}

function respaldar(){
  const blob=new Blob([JSON.stringify(rows,null,1)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='respaldo_documentos_atuntro_'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
}

function cargarRespaldo(input){
  const f=input.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const data=JSON.parse(rd.result);
      if(!Array.isArray(data)) throw 0;
      if(!confirm('Se reemplazará la lista actual por '+data.length+' documentos del respaldo. ¿Continuar?')) return;
      rows=data.map(d=>({id:d.id||uid(),nom:d.nom||'',barco:d.barco||BARCOS_FIJOS[0],num:d.num||'',emi:d.emi||'',ven:d.ven||'',val:d.val||'',...(d.pdf?{pdf:d.pdf}:{})}));
      guardar(); render();
    }catch(e){ alert('El archivo no tiene el formato de respaldo esperado.'); }
    input.value='';
  };
  rd.readAsText(f);
}

function exportCSV(){
  const list=filtrarTodo(enriquecer());
  const head=['Documento','Embarcacion','Numero','Emision','Vencimiento','Dias restantes','Estado','Valor','PDF adjunto'];
  const lines=[head.join(';')].concat(list.map(r=>[
    r.nom,r.barco,r.num,r.emi,r.ven,r.dias===null?'':r.dias,EST[r.st].lab,r.val,r.pdf?r.pdf.name:'NO'
  ].map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(';')));
  const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='documentos_atuntro_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
}

function flash(){ const d=document.getElementById('docs-saveDot'); d.classList.add('show'); setTimeout(()=>d.classList.remove('show'),1500); }
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function att(s){ return esc(s).replace(/"/g,'&quot;'); }

function render(){
  const rs=enriquecer();
  const sel=document.getElementById('fBarco').value;
  document.getElementById('fBarco').innerHTML='<option value="__all__">Todas</option>'+
    listaBarcos().map(b=>`<option value="${att(b)}">${esc(b)}</option>`).join('');
  if(sel) document.getElementById('fBarco').value=sel;
  renderKPIs(rs); renderTimeline(rs); renderMonths(rs); renderTabla(rs);
}



function init(){ _pdfCSS(); cargar(); render(); }

return { subirPdf, verPdf, descargarPdf, quitarPdf, descargarTodosPdf, abrirModal, cerrarModal, guardarNuevo, exportCSV, respaldar, cargarRespaldo, restaurarBase, render, toggleEstado, limpiarEstado, setSort, setCampo, eliminar, init };
})();

