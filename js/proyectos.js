/* ════════════════════════════════════════════
   PROYECTOS POR EMBARCACIÓN — scoped module
   Namespace: PROY | Firebase: proyectos_v1
════════════════════════════════════════════ */
var PROY = (function() {

const FB_PATH = 'proyectos_v1';

const VESSEL_LABELS = {
  fatima: 'María Fátima (180 TM · ~20 tripulantes)',
  gracia: 'María de Gracia (215 TM · ~21 tripulantes)',
};

const DEFAULT_AREAS = [
  'Mecánica',
  'Hidráulica',
  'Sistema de Frío',
  'Cubierta / Pesca',
  'Electrónica / Puente',
  'Seguridad',
  'Otras',
];

const PRIORIDAD_LABELS = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' };
const ESTADO_LABELS    = { pendiente: 'Pendiente', en_gestion: 'En gestión', ejecutado: '✅ Ejecutado' };

let state         = { fatima: { areas:[] }, gracia: { areas:[] } };
let currentVessel = 'fatima';
let activeUser    = null;
let db = null, fbReady = false, applyingRemote = false;
let isTyping = false, typingTimer = null, persistTimer = null;

/* ── helpers ── */
function isMaster() { return !!activeUser && (activeUser.role==='master'||activeUser.role==='admin'); }
function vesselState() { return state[currentVessel]; }
function lsKey(v) { return 'atuntro_proy_v1_'+v; }
function uid() { return 'p'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function escH(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escA(s) { return escH(s).replace(/"/g,'&quot;'); }
function fmtUSD(n) {
  var num=parseFloat(n)||0;
  return '$'+num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
}
function loadLocal(v) {
  try { var r=localStorage.getItem(lsKey(v)); return r?JSON.parse(r):{areas:[]}; }
  catch(e) { return {areas:[]}; }
}
function ensureDefaultAreas(v) {
  if (!state[v].areas||state[v].areas.length===0) {
    state[v].areas=DEFAULT_AREAS.map(function(name){ return {id:uid(),name:name,items:[]}; });
  }
}

/* ── sync ── */
function markTyping(){ isTyping=true;clearTimeout(typingTimer);typingTimer=setTimeout(function(){isTyping=false;},900); }
/* silent=true → NO redibuja la tabla (se conserva el foco mientras se escribe).
   Solo se refrescan los totales. El redibujado completo queda para cambios
   estructurales: agregar/eliminar área o ítem. */
function persistDebounced(silent){
  clearTimeout(persistTimer);
  persistTimer=setTimeout(function(){ persistNow(silent); },600);
}
function persistNow(silent) {
  var refresh = silent ? refreshTotals : render;
  try { localStorage.setItem(lsKey(currentVessel),JSON.stringify(state[currentVessel])); } catch(e){}
  if (fbReady&&!applyingRemote) {
    setSync('saving','Guardando…');
    db.ref(FB_PATH+'/'+currentVessel).set(state[currentVessel])
      .then(function(){ setSync('ok','Sincronizado'); refresh(); })
      .catch(function(){ setSync('local','Solo local'); refresh(); });
  } else {
    setSync('local','Solo local'); refresh();
  }
}
function setSync(cls,label){
  var d=document.getElementById('proy-syncDot'); if(d) d.className='sync-dot '+cls;
  var l=document.getElementById('proy-syncLbl'); if(l) l.textContent=label;
}
function initFirebase(){
  try {
    db=firebase.database(); fbReady=true; setSync('ok','Sincronizado');
    ['fatima','gracia'].forEach(function(v){
      db.ref(FB_PATH+'/'+v).on('value',function(snap){
        if(isTyping)return;
        var r=snap.val();
        if(r&&JSON.stringify(r)!==JSON.stringify(state[v])){
          applyingRemote=true; state[v]=r;
          try{localStorage.setItem(lsKey(v),JSON.stringify(r));}catch(e){}
          if(v===currentVessel){
            /* si el usuario tiene el cursor dentro de un campo, no se
               redibuja la tabla: solo se refrescan los totales */
            if(hasFocusInside()) refreshTotals(); else render();
          }
          applyingRemote=false;
        }
      });
    });
  } catch(e){ setSync('local','Solo local'); }
}

/* ¿el cursor está dentro de un campo editable del módulo? */
function hasFocusInside(){
  var a=document.activeElement;
  if(!a) return false;
  var tag=a.tagName;
  if(tag!=='INPUT'&&tag!=='TEXTAREA'&&tag!=='SELECT') return false;
  var box=document.getElementById('proy-content');
  return !!(box&&box.contains(a));
}

/* Refresco liviano: actualiza SOLO los números y badges.
   No toca los inputs, por lo que no se pierde el foco ni el cursor. */
function refreshTotals(){
  var areas=vesselState().areas||[];
  var gt=grandTotal();
  var execTotal=areas.reduce(function(s,a){
    return s+(a.items||[]).filter(function(it){return it.estado==='ejecutado';})
      .reduce(function(ss,it){return ss+(parseFloat(it.valor)||0);},0);
  },0);

  var gv=document.getElementById('proy-gt-val');   if(gv) gv.textContent=fmtUSD(gt);
  var gs=document.getElementById('proy-gt-sub');
  if(gs) gs.textContent=fmtUSD(execTotal)+' ejecutado · '+fmtUSD(gt-execTotal)+' pendiente';

  areas.forEach(function(area){
    var items=area.items||[];
    var total=areaTotal(area);
    var at=document.getElementById('proy-atot-'+area.id);  if(at) at.textContent=fmtUSD(total);
    var st=document.getElementById('proy-stot-'+area.id);  if(st) st.textContent=fmtUSD(total);

    var mb=document.getElementById('proy-ameta-'+area.id);
    if(mb){
      var cp=items.filter(function(it){return it.estado!=='ejecutado';}).length;
      var ce=items.filter(function(it){return it.estado==='ejecutado';}).length;
      var m='';
      if(cp>0) m+='<span class="proy-badge pend">'+cp+' pendiente'+(cp>1?'s':'')+'</span>';
      if(ce>0) m+='<span class="proy-badge exec">'+ce+' ejecutado'+(ce>1?'s':'')+'</span>';
      mb.innerHTML=m;
    }
  });
}

/* ── state helpers ── */
function findArea(aid){ return (vesselState().areas||[]).find(function(a){return a.id===aid;}); }
function areaTotal(area){ return (area.items||[]).reduce(function(s,it){return s+(parseFloat(it.valor)||0);},0); }
function grandTotal(){ return (vesselState().areas||[]).reduce(function(s,a){return s+areaTotal(a);},0); }

/* ══════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════ */
function render(){
  var el=document.getElementById('proy-content'); if(!el) return;
  var master=isMaster();
  var areas=vesselState().areas||[];
  var gt=grandTotal();
  var h='';

  /* ── grand total banner ── */
  h+='<div class="proy-grand-total">';
  h+='<div class="proy-gt-left"><span class="proy-gt-lbl">Total inversión estimada</span>';
  var execTotal=(areas.reduce(function(s,a){return s+(a.items||[]).filter(function(it){return it.estado==='ejecutado';}).reduce(function(ss,it){return ss+(parseFloat(it.valor)||0);},0);},0));
  var pendTotal=gt-execTotal;
  h+='<span class="proy-gt-sub" id="proy-gt-sub">'+fmtUSD(execTotal)+' ejecutado · '+fmtUSD(pendTotal)+' pendiente</span></div>';
  h+='<div class="proy-gt-val" id="proy-gt-val">'+fmtUSD(gt)+'</div></div>';

  /* ── areas ── */
  if(areas.length===0){
    h+='<div class="proy-empty"><p>No hay áreas registradas.</p>'+(master?'<p>Usa el botón de abajo para crear la primera.</p>':'')+'</div>';
  }

  areas.forEach(function(area){
    var items=area.items||[];
    var total=areaTotal(area);
    var countPend=items.filter(function(it){return it.estado!=='ejecutado';}).length;
    var countExec=items.filter(function(it){return it.estado==='ejecutado';}).length;
    var cols=master?7:6;

    h+='<div class="proy-area">';

    /* area header */
    h+='<div class="proy-area-head">';
    h+='<div class="proy-area-name">'+escH(area.name)+'</div>';
    h+='<div class="proy-area-meta" id="proy-ameta-'+escA(area.id)+'">';
    if(countPend>0) h+='<span class="proy-badge pend">'+countPend+' pendiente'+(countPend>1?'s':'')+'</span>';
    if(countExec>0) h+='<span class="proy-badge exec">'+countExec+' ejecutado'+(countExec>1?'s':'')+'</span>';
    h+='</div>';
    h+='<div class="proy-area-total" id="proy-atot-'+escA(area.id)+'">'+fmtUSD(total)+'</div>';
    if(master){
      h+='<div class="proy-area-acts">';
      h+='<button class="proy-icon-btn" title="Renombrar" onclick="PROY.renameArea(\''+escA(area.id)+'\')">✏️</button>';
      h+='<button class="proy-icon-btn proy-del" title="Eliminar área" onclick="PROY.deleteArea(\''+escA(area.id)+'\')">🗑</button>';
      h+='</div>';
    }
    h+='</div>';

    /* items table */
    if(items.length>0){
      h+='<div class="proy-tbl-wrap"><table class="proy-tbl">';
      h+='<thead><tr>';
      h+='<th class="col-desc">Descripción</th>';
      h+='<th class="col-prov">Proveedor</th>';
      h+='<th class="col-val">Valor (USD)</th>';
      h+='<th class="col-pri">Prioridad</th>';
      h+='<th class="col-est">Estado</th>';
      h+='<th class="col-not">Notas</th>';
      if(master) h+='<th class="col-act"></th>';
      h+='</tr></thead><tbody>';

      items.forEach(function(it){
        var priCls=it.prioridad==='alta'?'pri-alta':it.prioridad==='media'?'pri-media':'pri-baja';
        var estCls=it.estado==='ejecutado'?'est-exec':it.estado==='en_gestion'?'est-gest':'est-pend';
        var rowCls=it.estado==='ejecutado'?' row-done':'';
        h+='<tr class="proy-row'+rowCls+'">';
        if(master){
          h+='<td><textarea class="proy-inp proy-desc-ta" rows="1" placeholder="Descripción del trabajo" '
            +'oninput="this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\';markTyping();PROY.updateField(\''+escA(area.id)+'\',\''+escA(it.id)+'\',\'desc\',this.value)">'+escH(it.desc||'')+'</textarea></td>';
          h+='<td><input type="text" class="proy-inp" value="'+escA(it.proveedor||'')+'" placeholder="Nombre del proveedor" '
            +'oninput="markTyping();PROY.updateField(\''+escA(area.id)+'\',\''+escA(it.id)+'\',\'proveedor\',this.value)"></td>';
          h+='<td><input type="number" class="proy-inp num" value="'+escA(String(it.valor||''))+'" placeholder="0.00" min="0" step="0.01" '
            +'oninput="markTyping();PROY.updateField(\''+escA(area.id)+'\',\''+escA(it.id)+'\',\'valor\',this.value)"></td>';
          h+='<td><select class="proy-sel '+priCls+'" onchange="PROY.updateField(\''+escA(area.id)+'\',\''+escA(it.id)+'\',\'prioridad\',this.value)">';
          h+='<option value="alta"'+(it.prioridad==='alta'?' selected':'')+'>🔴 Alta</option>';
          h+='<option value="media"'+(it.prioridad==='media'?' selected':'')+'>🟡 Media</option>';
          h+='<option value="baja"'+(it.prioridad==='baja'?' selected':'')+'>🟢 Baja</option>';
          h+='</select></td>';
          h+='<td><select class="proy-sel '+estCls+'" onchange="PROY.updateField(\''+escA(area.id)+'\',\''+escA(it.id)+'\',\'estado\',this.value)">';
          h+='<option value="pendiente"'+(it.estado==='pendiente'?' selected':'')+'>Pendiente</option>';
          h+='<option value="en_gestion"'+(it.estado==='en_gestion'?' selected':'')+'>En gestión</option>';
          h+='<option value="ejecutado"'+(it.estado==='ejecutado'?' selected':'')+'>✅ Ejecutado</option>';
          h+='</select></td>';
          h+='<td><input type="text" class="proy-inp" value="'+escA(it.notas||'')+'" placeholder="Observaciones…" '
            +'oninput="markTyping();PROY.updateField(\''+escA(area.id)+'\',\''+escA(it.id)+'\',\'notas\',this.value)"></td>';
          h+='<td><button class="proy-icon-btn proy-del" title="Eliminar ítem" onclick="PROY.deleteItem(\''+escA(area.id)+'\',\''+escA(it.id)+'\')">✕</button></td>';
        } else {
          h+='<td class="proy-cell">'+escH(it.desc||'—')+'</td>';
          h+='<td class="proy-cell">'+escH(it.proveedor||'—')+'</td>';
          h+='<td class="proy-cell num">'+fmtUSD(it.valor)+'</td>';
          h+='<td class="proy-cell"><span class="proy-pri '+priCls+'">'+escH(PRIORIDAD_LABELS[it.prioridad]||it.prioridad||'')+'</span></td>';
          h+='<td class="proy-cell"><span class="proy-est '+estCls+'">'+escH(ESTADO_LABELS[it.estado]||it.estado||'')+'</span></td>';
          h+='<td class="proy-cell obs">'+escH(it.notas||'')+'</td>';
        }
        h+='</tr>';
      });

      h+='</tbody><tfoot><tr>';
      h+='<td colspan="2" class="proy-sub-lbl">Subtotal — '+escH(area.name)+'</td>';
      h+='<td class="proy-sub-val" id="proy-stot-'+escA(area.id)+'">'+fmtUSD(total)+'</td>';
      h+='<td colspan="'+(master?4:3)+'"></td>';
      h+='</tr></tfoot>';
      h+='</table></div>';
    } else {
      h+='<p class="proy-no-items">Sin ítems aún.'+(master?' Usa el botón para agregar el primero.':'')+'</p>';
    }

    if(master){
      h+='<button class="proy-add-item" onclick="PROY.addItem(\''+escA(area.id)+'\')">＋ Agregar ítem a '+escH(area.name)+'</button>';
    }
    h+='</div>'; /* /proy-area */
  });

  if(master){
    h+='<div class="proy-add-area-wrap"><button class="proy-add-area" onclick="PROY.addArea()">＋ Agregar nueva área</button></div>';
  }

  el.innerHTML=h;
  /* Auto-size any pre-filled description textareas after render */
  document.querySelectorAll('#proy-content textarea.proy-desc-ta').forEach(function(ta){
    ta.style.height='auto';
    ta.style.height=ta.scrollHeight+'px';
  });
}

/* ══════════════════════════════════════════
   ACCIONES
   ══════════════════════════════════════════ */
function addArea(){
  if(!isMaster())return;
  var name=prompt('Nombre de la nueva área (ej: Mecánica, Hidráulica…):');
  if(!name||!name.trim())return;
  if(!vesselState().areas) vesselState().areas=[];
  vesselState().areas.push({id:uid(),name:name.trim(),items:[]});
  persistDebounced();
}
function renameArea(aid){
  if(!isMaster())return;
  var area=findArea(aid); if(!area)return;
  var name=prompt('Nuevo nombre para "'+area.name+'":', area.name);
  if(!name||!name.trim())return;
  area.name=name.trim();
  persistDebounced();
}
function deleteArea(aid){
  if(!isMaster())return;
  var area=findArea(aid); if(!area)return;
  var n=area.items?area.items.length:0;
  if(!confirm('¿Eliminar el área "'+area.name+'"'+(n>0?' y sus '+n+' ítem'+(n>1?'s':''):'')+' ?\n\nEsta acción no se puede deshacer.'))return;
  vesselState().areas=(vesselState().areas||[]).filter(function(a){return a.id!==aid;});
  persistDebounced();
}
function addItem(aid){
  if(!isMaster())return;
  var area=findArea(aid); if(!area)return;
  if(!area.items) area.items=[];
  area.items.push({id:uid(),desc:'',proveedor:'',valor:0,prioridad:'media',estado:'pendiente',notas:''});
  persistDebounced();
}
function deleteItem(aid,iid){
  if(!isMaster())return;
  var area=findArea(aid); if(!area)return;
  if(!confirm('¿Eliminar este ítem?'))return;
  area.items=(area.items||[]).filter(function(it){return it.id!==iid;});
  persistDebounced();
}
function updateField(aid,iid,field,val){
  var area=findArea(aid); if(!area)return;
  var item=(area.items||[]).find(function(it){return it.id===iid;}); if(!item)return;
  item[field]=(field==='valor')?(parseFloat(val)||0):val;
  /* Prioridad y Estado cambian colores y el estilo de la fila → redibujado
     completo (son listas desplegables, no hay texto en curso).
     El resto son campos de escritura → guardado silencioso. */
  var esLista=(field==='prioridad'||field==='estado');
  persistDebounced(!esLista);
}
function switchVessel(v,btn){
  currentVessel=v;
  document.querySelectorAll('#proy-vessel-tabs .vtab').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  var vs=document.getElementById('proy-vessel-sub');
  if(vs) vs.textContent=VESSEL_LABELS[v]||'';
  render();
}

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
function init(portalUser){
  activeUser=portalUser;
  state.fatima=loadLocal('fatima'); state.gracia=loadLocal('gracia');
  ensureDefaultAreas('fatima'); ensureDefaultAreas('gracia');
  currentVessel='fatima';
  var tabs=document.querySelectorAll('#proy-vessel-tabs .vtab');
  tabs.forEach(function(b){b.classList.remove('active');});
  var ft=document.getElementById('proy-tab-fatima'); if(ft) ft.classList.add('active');
  var vs=document.getElementById('proy-vessel-sub'); if(vs) vs.textContent=VESSEL_LABELS['fatima'];
  if(!fbReady) initFirebase();
  render();
}

/* expose globals needed by inline onclick */
window.markTyping=markTyping;

return {
  init: init,
  switchVessel: switchVessel,
  addArea: addArea,
  renameArea: renameArea,
  deleteArea: deleteArea,
  addItem: addItem,
  deleteItem: deleteItem,
  updateField: updateField,
};

})();
