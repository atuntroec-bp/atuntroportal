/* ════════════════════════════════════════════
   DASHBOARD CONTABLE (Tucán) — scoped module
   Namespace: CONT | Firebase: atuntro_contable (solo lectura)
   Datos cargados bajo demanda con la Skill /actualizar-tucan
════════════════════════════════════════════ */
var CONT = (function() {

const FB_PATH = 'atuntro_contable';
const LS_KEY  = 'atuntro_contable_v1';

const BARCO_LABEL = { MF: 'María Fátima', MG: 'María de Gracia' };
const VESSEL_SUB  = {
  todos: 'Ambas embarcaciones',
  MF: 'María Fátima (180 TM)',
  MG: 'María de Gracia (215 TM)',
};
const TABS = [
  { id: 'fact', label: 'Facturación' },
  { id: 'cv',   label: 'Costos y rentabilidad' },
  { id: 'rol',  label: 'Roles' },
  { id: 'cxp',  label: 'Por pagar' },
  { id: 'cxc',  label: 'Por cobrar' },
  { id: 'imp',  label: 'Impuestos' },
];
const SUBFILTROS = {
  rol: [ { id: '', label: 'Todos' }, { id: 'tripulacion', label: 'Tripulación' }, { id: 'admin', label: 'Administrativo' } ],
  imp: [ { id: '', label: 'Todos' }, { id: 'SRI', label: 'SRI' }, { id: 'IESS', label: 'IESS' } ],
};
const ROL_LABEL = { tripulacion: 'Tripulación', admin: 'Administrativo' };

let data       = null;     /* { meta, facturacion, costos_viaje, roles, cxp, cxc, impuestos } */
let usandoMuestra = false;
let barco      = 'todos';  /* todos | MF | MG */
let tab        = 'fact';
let sub        = '';       /* subfiltro de Roles (tripulacion/admin) o Impuestos (SRI/IESS) */
let filtro     = '';
let soloVencido = false;
let activeUser = null;
let db = null, fbReady = false, listening = false;
let charts = {};
let searchTimer = null;

/* ── helpers ── */
function escH(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function num(n){ var v=parseFloat(n); return isFinite(v)?v:0; }
function fmtUSD(n){
  var v=num(n), neg=v<0; v=Math.abs(v);
  return (neg?'-':'')+'$'+v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
}
function fmtK(n){
  var v=num(n), a=Math.abs(v);
  if(a>=1000) return (v<0?'-':'')+'$'+(a/1000).toFixed(a>=100000?0:1)+'k';
  return '$'+v.toFixed(0);
}
function fmtPct(n){ return (isFinite(n)?(n*100).toFixed(1):'0.0')+'%'; }
var MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function fmtFecha(iso){
  if(!iso) return '—';
  var p=String(iso).slice(0,10).split('-');
  if(p.length!==3) return escH(iso);
  return p[2]+' '+MESES[parseInt(p[1],10)-1]+' '+p[0];
}
function fmtPeriodo(p){
  var m=String(p||'').match(/^(\d{4})-(\d{2})/);
  return m ? MESES[parseInt(m[2],10)-1]+' '+m[1] : escH(p||'—');
}
function fmtCorte(iso){
  if(!iso) return 'sin corte';
  var d=new Date(iso); if(isNaN(d)) return escH(iso);
  var loc=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
  return fmtFecha(loc)+' · '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
}
function fechaCorte(){
  var c=data&&data.meta&&data.meta.corte; var d=c?new Date(c):new Date();
  if(isNaN(d)) d=new Date();
  d.setHours(0,0,0,0); return d;
}
function anioActual(){ return fechaCorte().getFullYear(); }
function anioDe(r){
  var s=String(r.fecha||r.periodo||'');
  var m=s.match(/^(\d{4})/); return m?parseInt(m[1],10):null;
}
function delAnio(r){ var a=anioDe(r); return a===null || a===anioActual(); }
function diasVencido(vence){
  if(!vence) return 0;
  var v=new Date(String(vence).slice(0,10)+'T00:00:00'); if(isNaN(v)) return 0;
  return Math.round((fechaCorte()-v)/86400000);
}
function lista(k){
  var a=(data&&data[k])||[];
  if(!Array.isArray(a)) a=Object.keys(a).map(function(x){ return a[x]; });
  return a;
}
function porBarco(arr, b){
  b=b||barco;
  if(b==='todos') return arr;
  return arr.filter(function(r){ return r.barco===b; });
}
function suma(arr,campo){ return arr.reduce(function(t,r){ return t+num(r[campo||'valor']); },0); }
function viajeLbl(r){
  if(!r.viaje && r.viaje!==0) return r.centro?escH(r.centro):'—';
  return 'V'+r.viaje+(r.barco?' '+r.barco:'');
}
function estadoSaldo(r){
  var s=num(r.saldo);
  if(s<=0.005) return {cls:'ok',txt:'Pagado'};
  var d=diasVencido(r.vence);
  if(d>0) return {cls:'venc',txt:'Vencido '+d+'d'};
  if(d>-8) return {cls:'prox',txt:'Vence en '+(-d)+'d'};
  return {cls:'ok',txt:'Al día'};
}
function pill(e){ return '<span class="cont-pill '+e.cls+'">'+escH(e.txt)+'</span>'; }
function entidadDe(r){
  var e=String(r.entidad||'').toUpperCase();
  if(e==='SRI'||e==='IESS') return e;
  return /iess|aporte|fondo|reserva|préstamo|prestamo/i.test(String(r.tipo||''))?'IESS':'SRI';
}

/* ── sync ── */
function setSync(cls,label){
  var d=document.getElementById('cont-syncDot'); if(d) d.className='sync-dot '+cls;
  var l=document.getElementById('cont-syncLbl'); if(l) l.textContent=label;
}
function loadLocal(){
  try{ var r=localStorage.getItem(LS_KEY); return r?JSON.parse(r):null; }catch(e){ return null; }
}
function initFirebase(){
  if(listening) return;
  try{
    db=firebase.database(); fbReady=true; listening=true;
    setSync('saving','Cargando…');
    db.ref(FB_PATH).on('value',function(snap){
      var r=snap.val();
      if(r){
        data=r; usandoMuestra=false;
        try{ localStorage.setItem(LS_KEY,JSON.stringify(r)); }catch(e){}
        setSync('ok','Sincronizado');
      } else {
        setSync('ok','Sin datos');
      }
      render();
    },function(){
      setSync('local','Sin conexión');
      render();
    });
  }catch(e){
    fbReady=false; setSync('local','Sin conexión'); render();
  }
}

/* ── cálculos ── */
function totalesSaldo(){
  var t={cxp:0,cxpVenc:0,cxc:0,cxcVenc:0};
  porBarco(lista('cxp')).forEach(function(r){ var s=num(r.saldo); t.cxp+=s; if(s>0&&diasVencido(r.vence)>0) t.cxpVenc+=s; });
  porBarco(lista('cxc')).forEach(function(r){ var s=num(r.saldo); t.cxc+=s; if(s>0&&diasVencido(r.vence)>0) t.cxcVenc+=s; });
  return t;
}
function impuestosPend(ent){
  var t={valor:0,vence:null};
  lista('impuestos').forEach(function(r){
    if(entidadDe(r)!==ent) return;
    if(String(r.estado||'').toLowerCase()==='pagado') return;
    t.valor+=num(r.valor);
    if(r.vence&&(!t.vence||r.vence<t.vence)) t.vence=r.vence;
  });
  return t;
}
function rolesDe(tipo,b){
  if(tipo==='admin') return lista('roles').filter(function(r){ return r.tipo==='admin' && delAnio(r); });
  return porBarco(lista('roles'),b).filter(function(r){ return r.tipo===tipo && delAnio(r); });
}
function rolesPendientes(){ return lista('roles').length===0; }
/* Rentabilidad operativa = facturación de viajes − costo de viaje − rol de tripulación.
   Se mide por viaje cerrado facturado en el año: si el viaje empezó el año anterior,
   sus costos de ese año también se restan. Los viajes en curso quedan fuera. */
function rentabilidad(b){
  var r={fact:0,costo:0,rol:0,res:0,margen:0,enCurso:[],costoEnCurso:0};
  costosPorViaje(b).forEach(function(v){
    if(v.enCurso){ r.enCurso.push(v); r.costoEnCurso+=v.total; return; }
    if(!v.factAnio) return;
    r.fact+=v.fact; r.costo+=v.total; r.rol+=v.rol;
  });
  r.res=r.fact-r.costo-r.rol; r.margen=r.fact?r.res/r.fact:0;
  return r;
}
function otrosGastos(){
  return lista('otros_gastos').filter(delAnio).sort(function(a,b){ return num(b.valor)-num(a.valor); });
}
function costosPorViaje(b){
  var map={};
  function slot(r){
    var k=(r.barco||'—')+'|'+(r.viaje==null?'—':r.viaje);
    if(!map[k]) map[k]={barco:r.barco||'—',viaje:r.viaje,total:0,cat:{},fact:0,factAnio:0,rol:0,costoPrev:0};
    return map[k];
  }
  porBarco(lista('costos_viaje'),b).forEach(function(r){
    var s=slot(r), c=r.categoria||'Otros';
    s.total+=num(r.valor); s.cat[c]=(s.cat[c]||0)+num(r.valor);
    var a=anioDe(r); if(a!==null && a<anioActual()) s.costoPrev+=num(r.valor);
  });
  porBarco(lista('facturacion'),b).forEach(function(r){
    if(r.viaje==null) return;
    var s=slot(r); s.fact+=num(r.valor); if(delAnio(r)) s.factAnio+=num(r.valor);
  });
  porBarco(lista('roles'),b).forEach(function(r){ if(r.tipo==='tripulacion'&&r.viaje!=null) slot(r).rol+=num(r.valor); });
  var explicitos={};
  lista('viajes').forEach(function(x){ explicitos[(x.barco||'—')+'|'+x.viaje]=x.estado; });
  return Object.keys(map).map(function(k){
      var v=map[k];
      var est=explicitos[k];
      v.enCurso = est ? est==='en_curso' : (v.fact<=0 && v.total>0);
      v.res=v.fact-v.total-v.rol;
      return v; })
    .sort(function(a,b){ return (num(a.viaje)-num(b.viaje))||String(a.barco).localeCompare(b.barco); });
}
function viajesEnCurso(b){ return costosPorViaje(b).filter(function(v){ return v.enCurso; }); }
function ultimoViaje(b){
  var arr=costosPorViaje(b).filter(function(v){ return v.total>0 && !v.enCurso; });
  if(!arr.length) return null;
  return arr.sort(function(a,c){ return num(c.viaje)-num(a.viaje); })[0];
}
function antiguedad(k){
  var bk=[0,0,0,0]; /* por vencer, 1-30, 31-60, +60 */
  porBarco(lista(k)).forEach(function(r){
    var s=num(r.saldo); if(s<=0) return;
    var d=diasVencido(r.vence);
    if(d<=0) bk[0]+=s; else if(d<=30) bk[1]+=s; else if(d<=60) bk[2]+=s; else bk[3]+=s;
  });
  return bk;
}

/* ── render ── */
function render(){
  var el=document.getElementById('cont-content'); if(!el) return;
  var subEl=document.getElementById('cont-vessel-sub'); if(subEl) subEl.textContent=VESSEL_SUB[barco];
  var corteEl=document.getElementById('cont-corte');
  if(corteEl) corteEl.textContent=data?('Corte Tucán: '+fmtCorte(data.meta&&data.meta.corte)+(usandoMuestra?' · MUESTRA':'')):'Sin corte';

  if(!data){
    destroyCharts();
    el.innerHTML='<div class="cont-empty">'+
      '<div class="cont-empty-ico">📊</div>'+
      '<h3>Aún no hay datos de Tucán</h3>'+
      '<p>Inicia sesión en Tucán y pide a Claude <b>/actualizar-tucan</b>. Los datos aparecerán aquí para todos los usuarios Master/Admin.</p>'+
      '<button class="cont-btn" onclick="CONT.verMuestra()">Ver con datos de muestra</button>'+
      '</div>';
    return;
  }

  var html='';
  if(usandoMuestra){
    html+='<div class="cont-banner">Datos de muestra (ficticios). Se reemplazan solos al cargar el primer corte real de Tucán. '+
      '<button class="cont-link" onclick="CONT.salirMuestra()">Quitar muestra</button></div>';
  }
  html+='<div class="cont-kpis '+(barco==='todos'?'cols-4':'cols-3')+'">'+kpis()+'</div>';

  html+='<div class="cont-charts">'+
    '<div class="cont-card"><div class="cont-card-h">Costo por viaje</div><div class="cont-chart"><canvas id="cont-ch-viajes" role="img" aria-label="Costo total por viaje"></canvas></div></div>'+
    '<div class="cont-card"><div class="cont-card-h">Antigüedad de saldos</div><div class="cont-chart"><canvas id="cont-ch-aging" role="img" aria-label="Antigüedad de saldos por pagar y por cobrar"></canvas></div></div>'+
  '</div>';

  html+='<div class="cont-card cont-det">'+
    '<div class="cont-det-bar">'+
      '<div class="cont-tabs">'+TABS.map(function(x){
        return '<button class="cont-tab'+(x.id===tab?' active':'')+'" onclick="CONT.setTab(\''+x.id+'\')">'+x.label+'</button>';
      }).join('')+'</div>'+
      '<div class="cont-det-tools">'+
        (SUBFILTROS[tab]?'<div class="cont-chips">'+SUBFILTROS[tab].filter(function(x){ return !(tab==='rol'&&barco!=='todos'&&x.id==='admin'); }).map(function(x){
          return '<button class="cont-chip'+(x.id===sub?' active':'')+'" onclick="CONT.setSub(\''+x.id+'\')">'+x.label+'</button>';
        }).join('')+'</div>':'')+
        ((tab==='cxp'||tab==='cxc')?'<label class="cont-chk"><input type="checkbox" '+(soloVencido?'checked':'')+' onchange="CONT.setVencido(this.checked)"> Solo vencidos</label>':'')+
        '<input class="cont-search" id="cont-search" type="search" placeholder="Buscar proveedor, cliente o documento" value="'+escH(filtro).replace(/"/g,'&quot;')+'" oninput="CONT.setFiltro(this.value)">'+
      '</div>'+
    '</div>'+
    '<div class="cont-tbl-wrap" id="cont-tbl">'+tabla()+'</div>'+
  '</div>';

  el.innerHTML=html;
  drawCharts();
}

function kpi(lbl,val,sub,accion,clase){
  return '<div class="cont-kpi'+(clase?' '+clase:'')+(accion?'':' no-click')+'"'+(accion?' onclick="'+accion+'" title="Ver detalle"':'')+'><div class="cont-kpi-lbl">'+lbl+'</div>'+
    '<div class="cont-kpi-val">'+val+'</div><div class="cont-kpi-sub">'+sub+'</div></div>';
}
function kpiUltimo(b,lbl){
  var u=ultimoViaje(b), ec=viajesEnCurso(b);
  var sub=u?('Viaje '+escH(u.viaje)+(u.costoPrev>0?' · incluye costos '+(anioActual()-1):'')):'Sin viajes cerrados';
  if(ec.length) sub+='<br><span class="cont-curso-txt">En curso: '+ec.map(function(v){ return 'V'+escH(v.viaje)+' '+fmtK(v.total); }).join(', ')+'</span>';
  return kpi(lbl, u?fmtUSD(u.total):'—', sub, "CONT.irA('cv','')");
}
function kpiOtros(){
  var og=otrosGastos(), tot=suma(og);
  var det=og.length?og.map(function(x){ return escH(x.concepto)+' '+fmtK(x.valor); }).join(' + '):'Sin datos';
  return kpi('Otros gastos '+anioActual(), fmtUSD(tot), '<span class="cont-small">'+det+'</span>', '', 'k-wide k-otros');
}
function kpis(){
  var anio=anioActual();
  var t=totalesSaldo();
  var r=rentabilidad(barco);
  var sri=impuestosPend('SRI'), iess=impuestosPend('IESS');
  var vencTxt=function(v){ return v>0?('<span class="neg">'+fmtUSD(v)+' vencido</span>'):'<span class="pos">Sin vencidos</span>'; };
  var impTxt=function(x){ return x.vence?('<span class="warn">Próx. vence '+fmtFecha(x.vence)+'</span>'):'<span class="pos">Al día</span>'; };
  var out=[];
  var factAnio=porBarco(lista('facturacion')).filter(delAnio);
  out.push(kpi('Facturación '+anio, fmtUSD(suma(factAnio)),
    escH(factAnio.length+' registros'), "CONT.irA('fact','')", 'k-fact'));
  var pend=rolesPendientes();
  var rentSub='Margen '+fmtPct(r.margen)+' · viajes cerrados'+(pend?' · <b>sin roles (pendiente)</b>':' · fact. − costo − rol trip.')+
    (r.enCurso.length?'<br><span class="cont-curso-txt">Excluye en curso: '+r.enCurso.map(function(v){ return 'V'+escH(v.viaje)+' '+escH(v.barco); }).join(', ')+'</span>':'');
  out.push(kpi('Rentabilidad operativa '+anio, '<span class="'+(r.res<0?'neg':'')+'">'+fmtUSD(r.res)+'</span>', rentSub, "CONT.irA('cv','')", 'k-rent'));
  var rt=rolesDe('tripulacion');
  var rolVal=function(arr){ return pend?'<span class="cont-pend">Pendiente</span>':fmtUSD(suma(arr)); };
  var rolSub=function(t){ return pend?'Falta la fuente de roles':t; };
  if(barco==='todos'){
    out.push(kpiOtros());
    out.push(kpiUltimo('MF','Costo último viaje · María Fátima'));
    out.push(kpiUltimo('MG','Costo último viaje · María de Gracia'));
    out.push(kpi('Rol tripulación '+anio, rolVal(rt), rolSub('Ambos barcos · ver detalle →'), "CONT.irA('rol','tripulacion')", 'k-rol'));
    out.push(kpi('Rol administrativo '+anio, rolVal(rolesDe('admin')), rolSub('Empresa · ver detalle por mes →'), "CONT.irA('rol','admin')", 'k-rol'));
  } else {
    out.push(kpiUltimo(barco,'Costo último viaje'));
    out.push(kpi('Rol tripulación '+anio, rolVal(rt), rolSub('Ver detalle por viaje →'), "CONT.irA('rol','tripulacion')", 'k-rol'));
  }
  out.push(kpi('Cuentas por pagar', fmtUSD(t.cxp), vencTxt(t.cxpVenc), "CONT.irA('cxp','',true)"));
  out.push(kpi('Cuentas por cobrar', fmtUSD(t.cxc), vencTxt(t.cxcVenc), "CONT.irA('cxc','',true)"));
  if(barco==='todos'){
    out.push(kpi('Impuestos SRI pendientes', fmtUSD(sri.valor), impTxt(sri), "CONT.irA('imp','SRI')"));
    out.push(kpi('Obligaciones IESS pendientes', fmtUSD(iess.valor), impTxt(iess), "CONT.irA('imp','IESS')"));
  }
  return out.join('');
}

function coincide(r,campos){
  if(!filtro) return true;
  var f=filtro.toLowerCase();
  return campos.some(function(c){ return String(r[c]==null?'':r[c]).toLowerCase().indexOf(f)>=0; });
}
function tabla(){
  var rows, head, body='', foot='';
  if(tab==='cxp'||tab==='cxc'){
    var quien = tab==='cxp'?'proveedor':'cliente';
    rows=porBarco(lista(tab)).filter(function(r){
      return coincide(r,[quien,'documento','centro']) && (!soloVencido||(num(r.saldo)>0&&diasVencido(r.vence)>0));
    }).sort(function(a,b){ return diasVencido(b.vence)-diasVencido(a.vence); });
    head=['<th>'+(tab==='cxp'?'Proveedor':'Cliente')+'</th>','<th>Documento</th>','<th>Viaje</th>','<th>Emisión</th>','<th>Vence</th>','<th class="r">Valor</th>','<th class="r">Saldo</th>','<th>Estado</th>'];
    var sv=0, ss=0;
    rows.forEach(function(r){
      sv+=num(r.valor); ss+=num(r.saldo);
      body+='<tr><td class="strong">'+escH(r[quien])+'</td><td>'+escH(r.documento)+'</td><td>'+viajeLbl(r)+'</td>'+
        '<td>'+fmtFecha(r.fecha)+'</td><td>'+fmtFecha(r.vence)+'</td><td class="r">'+fmtUSD(r.valor)+'</td>'+
        '<td class="r strong">'+fmtUSD(r.saldo)+'</td><td>'+pill(estadoSaldo(r))+'</td></tr>';
    });
    foot='<tr><td colspan="5" class="cont-sub-lbl">Total ('+rows.length+' documentos)</td><td class="r cont-sub-val">'+fmtUSD(sv)+'</td><td class="r cont-sub-val">'+fmtUSD(ss)+'</td><td></td></tr>';

  } else if(tab==='fact'){
    rows=porBarco(lista('facturacion')).filter(function(r){ return delAnio(r) && coincide(r,['cliente','documento','centro']); })
      .sort(function(a,b){ return String(b.fecha||'').localeCompare(String(a.fecha||'')); });
    head=['<th>Fecha</th>','<th>Cliente</th>','<th>Documento</th>','<th>Viaje</th>','<th>Detalle</th>','<th class="r">Valor</th>'];
    var tf=0;
    rows.forEach(function(r){
      tf+=num(r.valor);
      body+='<tr><td>'+fmtFecha(r.fecha)+'</td><td class="strong">'+escH(r.cliente)+'</td><td>'+escH(r.documento)+'</td>'+
        '<td>'+viajeLbl(r)+'</td><td>'+escH(r.detalle||'')+'</td><td class="r strong">'+fmtUSD(r.valor)+'</td></tr>';
    });
    foot='<tr><td colspan="5" class="cont-sub-lbl">Total facturado '+anioActual()+' ('+rows.length+' facturas)</td><td class="r cont-sub-val">'+fmtUSD(tf)+'</td></tr>';

  } else if(tab==='cv'){
    var agg=costosPorViaje();
    var cats={};
    agg.forEach(function(v){ Object.keys(v.cat).forEach(function(c){ cats[c]=(cats[c]||0)+v.cat[c]; }); });
    var catList=Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; });
    rows=agg.filter(function(v){ return coincide({v:'V'+v.viaje+' '+v.barco,b:BARCO_LABEL[v.barco]||''},['v','b']); });
    head=['<th>Viaje</th>','<th>Embarcación</th>']
      .concat(catList.map(function(c){ return '<th class="r">'+escH(c)+'</th>'; }))
      .concat(['<th class="r">Costo viaje</th>','<th class="r">Rol trip.</th>','<th class="r">Facturación</th>','<th class="r">Resultado</th>','<th class="r">Margen</th>']);
    var tot={c:0,r:0,f:0,x:0,fc:0,xc:0}, tc={};
    rows.slice().reverse().forEach(function(v){
      tot.c+=v.total; tot.r+=v.rol; tot.f+=v.fact; tot.x+=v.res;
      var cerrado=!v.enCurso;
      if(cerrado){ tot.fc+=v.fact; tot.xc+=v.res; }
      body+='<tr'+(v.enCurso?' class="cont-row-curso"':'')+'><td class="strong">Viaje '+escH(v.viaje)+
        (v.costoPrev>0?'<div class="cont-small">incl. '+fmtK(v.costoPrev)+' de '+(anioActual()-1)+'</div>':'')+'</td><td>'+escH(BARCO_LABEL[v.barco]||v.barco)+'</td>'+
        catList.map(function(c){ tc[c]=(tc[c]||0)+(v.cat[c]||0); return '<td class="r">'+(v.cat[c]?fmtUSD(v.cat[c]):'—')+'</td>'; }).join('')+
        '<td class="r strong">'+fmtUSD(v.total)+'</td><td class="r">'+(v.rol?fmtUSD(v.rol):'—')+'</td>'+
        '<td class="r">'+(v.fact?fmtUSD(v.fact):'—')+'</td>'+
        (v.enCurso
          ? '<td class="r">'+pill({cls:'curso',txt:'En curso'})+'</td><td class="r">—</td></tr>'
          : '<td class="r strong'+(v.res<0?' neg':' pos')+'">'+fmtUSD(v.res)+'</td>'+
            '<td class="r">'+(v.fact?fmtPct(v.res/v.fact):'—')+'</td></tr>');
    });
    foot='<tr><td colspan="2" class="cont-sub-lbl">Total ('+rows.length+' viajes)</td>'+
      catList.map(function(c){ return '<td class="r cont-sub-val">'+fmtUSD(tc[c]||0)+'</td>'; }).join('')+
      '<td class="r cont-sub-val">'+fmtUSD(tot.c)+'</td><td class="r cont-sub-val">'+fmtUSD(tot.r)+'</td>'+
      '<td class="r cont-sub-val">'+fmtUSD(tot.f)+'</td><td class="r cont-sub-val" title="Solo viajes cerrados">'+fmtUSD(tot.xc)+'</td>'+
      '<td class="r cont-sub-val">'+(tot.fc?fmtPct(tot.xc/tot.fc):'—')+'</td></tr>';

  } else if(tab==='rol'){
    rows=lista('roles').filter(function(r){
      if(barco!=='todos' && (r.tipo==='admin' || r.barco!==barco)) return false;
      return delAnio(r) && (!sub||r.tipo===sub) && coincide(r,['concepto','periodo','tipo']);
    }).sort(function(a,b){ return String(b.periodo||'').localeCompare(String(a.periodo||''))||String(a.tipo).localeCompare(String(b.tipo)); });
    head=['<th>Período</th>','<th>Rol</th>','<th>Embarcación</th>','<th>Viaje</th>','<th>Concepto</th>','<th class="r">Personas</th>','<th class="r">Valor</th>'];
    var tr=0, porTipo={};
    rows.forEach(function(r){
      tr+=num(r.valor); porTipo[r.tipo]=(porTipo[r.tipo]||0)+num(r.valor);
      body+='<tr><td>'+fmtPeriodo(r.periodo)+'</td><td>'+pill({cls:r.tipo==='tripulacion'?'trip':'adm',txt:ROL_LABEL[r.tipo]||r.tipo})+'</td>'+
        '<td>'+escH(r.tipo==='admin'?'Empresa':(BARCO_LABEL[r.barco]||r.barco||'—'))+'</td><td>'+(r.viaje!=null?'V'+escH(r.viaje):'—')+'</td>'+
        '<td>'+escH(r.concepto||'')+'</td><td class="r">'+(r.personas!=null?escH(r.personas):'—')+'</td>'+
        '<td class="r strong">'+fmtUSD(r.valor)+'</td></tr>';
    });
    if(!sub){
      Object.keys(porTipo).forEach(function(k){
        foot+='<tr><td colspan="6" class="cont-sub-lbl">Subtotal '+(ROL_LABEL[k]||k)+'</td><td class="r cont-sub-val">'+fmtUSD(porTipo[k])+'</td></tr>';
      });
    }
    foot+='<tr><td colspan="6" class="cont-sub-lbl">Total '+(sub?ROL_LABEL[sub].toLowerCase()+' ':'')+anioActual()+'</td><td class="r cont-sub-val">'+fmtUSD(tr)+'</td></tr>';

  } else {
    rows=lista('impuestos').filter(function(r){
      return (!sub||entidadDe(r)===sub) && coincide(r,['periodo','tipo','estado']);
    }).sort(function(a,b){ return String(b.vence||'').localeCompare(String(a.vence||'')); });
    head=['<th>Entidad</th>','<th>Período</th>','<th>Obligación</th>','<th class="r">Base</th>','<th class="r">Valor</th>','<th>Vence</th>','<th>Estado</th>'];
    var pend={SRI:0,IESS:0};
    rows.forEach(function(r){
      var ent=entidadDe(r);
      var pagado=String(r.estado||'').toLowerCase()==='pagado';
      if(!pagado) pend[ent]+=num(r.valor);
      var d=diasVencido(r.vence);
      var e=pagado?{cls:'ok',txt:'Pagado'}:(d>0?{cls:'venc',txt:'Vencido'}:{cls:'prox',txt:'Pendiente'});
      body+='<tr><td>'+pill({cls:ent==='SRI'?'sri':'iess',txt:ent})+'</td><td>'+fmtPeriodo(r.periodo)+'</td><td class="strong">'+escH(r.tipo)+'</td>'+
        '<td class="r">'+(r.base!=null?fmtUSD(r.base):'—')+'</td><td class="r strong">'+fmtUSD(r.valor)+'</td>'+
        '<td>'+fmtFecha(r.vence)+'</td><td>'+pill(e)+'</td></tr>';
    });
    ['SRI','IESS'].forEach(function(k){
      if(!sub||sub===k) foot+='<tr><td colspan="4" class="cont-sub-lbl">Pendiente de pago '+k+'</td><td class="r cont-sub-val">'+fmtUSD(pend[k])+'</td><td colspan="2"></td></tr>';
    });
  }
  if(!rows.length && tab==='rol' && rolesPendientes()) return '<p class="cont-no-rows">Roles pendientes: la nómina en Tucán no tiene centro de costo. Se cargarán desde la carpeta de contabilidad.</p>';
  if(!rows.length) return '<p class="cont-no-rows">Sin registros'+(filtro||soloVencido||sub?' con este filtro':'')+'.</p>';
  return '<table class="cont-tbl"><thead><tr>'+head.join('')+'</tr></thead><tbody>'+body+'</tbody><tfoot>'+foot+'</tfoot></table>';
}

/* ── gráficos ── */
function destroyCharts(){
  Object.keys(charts).forEach(function(k){ try{ charts[k].destroy(); }catch(e){} });
  charts={};
}
function drawCharts(){
  destroyCharts();
  if(typeof Chart==='undefined') return;
  var cv=costosPorViaje();
  var opt=function(){ return {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ boxWidth:10, font:{size:11} } },
      tooltip:{ callbacks:{ label:function(c){ return c.dataset.label+': '+fmtUSD(c.raw); } } } },
    scales:{ y:{ ticks:{ callback:function(v){ return fmtK(v); }, font:{size:11} } }, x:{ ticks:{ font:{size:11} } } }
  }; };
  var c1=document.getElementById('cont-ch-viajes');
  if(c1){
    var ds=[], labels=[];
    if(barco==='todos'){
      var viajes=[], seen={};
      cv.forEach(function(v){ var k=String(v.viaje); if(!seen[k]){ seen[k]=1; viajes.push(v.viaje); } });
      viajes=viajes.slice(-8); labels=viajes.map(function(v){ return 'V'+v; });
      ['MF','MG'].forEach(function(b){
        var vals=viajes.map(function(vj){ var f=cv.filter(function(x){ return x.barco===b&&String(x.viaje)===String(vj); })[0]; return f?Math.round(f.total):null; });
        if(vals.some(function(x){ return x!=null; }))
          ds.push({ label:BARCO_LABEL[b], data:vals, backgroundColor:b==='MF'?'#2E75B6':'#1D9E75', borderRadius:4 });
      });
    } else {
      var last=cv.slice(-8); labels=last.map(function(v){ return 'V'+v.viaje; });
      ds.push({ label:'Costo viaje', data:last.map(function(v){ return Math.round(v.total); }), backgroundColor:'#2E75B6', borderRadius:4, stack:'c' });
      ds.push({ label:'Rol tripulación', data:last.map(function(v){ return Math.round(v.rol); }), backgroundColor:'#85B7EB', borderRadius:4, stack:'c' });
      ds.push({ label:'Facturación', data:last.map(function(v){ return Math.round(v.fact); }), backgroundColor:'#1D9E75', borderRadius:4, stack:'f' });
    }
    var o=opt(); if(barco!=='todos'){ o.scales.x.stacked=true; o.scales.y.stacked=true; }
    charts.v=new Chart(c1,{ type:'bar', data:{ labels:labels, datasets:ds }, options:o });
  }
  var c2=document.getElementById('cont-ch-aging');
  if(c2){
    charts.a=new Chart(c2,{ type:'bar', data:{ labels:['Por vencer','1-30 días','31-60 días','+60 días'], datasets:[
      { label:'Por pagar', data:antiguedad('cxp').map(Math.round), backgroundColor:'#D85A30', borderRadius:4 },
      { label:'Por cobrar', data:antiguedad('cxc').map(Math.round), backgroundColor:'#7F77DD', borderRadius:4 },
    ] }, options:opt() });
  }
}

/* ── muestra ── */
function muestra(){
  var hoy=new Date(), Y=hoy.getFullYear();
  var iso=function(dd){ var d=new Date(hoy); d.setDate(d.getDate()+dd); return d.toISOString().slice(0,10); };
  var mes=function(m){ return Y+'-'+('0'+m).slice(-2); };
  var viajes=[
    /* viaje, barco, mes zarpe, [combustible, víveres, otros] miles, facturación miles, rol trip miles, tripulantes */
    [75,'MF',1,[118,24,56],372,74,20],[76,'MF',4,[121,25,59],398,80,20],[77,'MF',6,[106,22,62],341,68,20],[78,'MF',9,[118,24,70],415,83,20],
    [38,'MG',2,[129,26,71],455,91,21],[39,'MG',5,[133,27,71],402,80,21],[40,'MG',8,[131,27,82],468,94,21],
  ];
  var cv=[], fact=[], roles=[];
  viajes.forEach(function(x){
    var fecha=mes(x[2])+'-15', centro='Viaje '+x[0]+' '+BARCO_LABEL[x[1]];
    ['Combustible','Víveres','Otros'].forEach(function(c,i){
      cv.push({viaje:x[0],barco:x[1],centro:centro,fecha:fecha,categoria:c,valor:x[3][i]*1000});
    });
    fact.push({cliente:'ASISERVY S.A.',documento:'001-001-000'+(1000+x[0]),fecha:mes(Math.min(x[2]+1,12))+'-05',viaje:x[0],barco:x[1],centro:centro,detalle:'Atún SKJ/YF',valor:Math.round(x[4]*0.93)*1000});
    fact.push({cliente:'SIMBAI S.A.',documento:'001-001-000'+(2000+x[0]),fecha:mes(Math.min(x[2]+1,12))+'-08',viaje:x[0],barco:x[1],centro:centro,detalle:'Pesca de rechazo',valor:Math.round(x[4]*0.07)*1000});
    roles.push({tipo:'tripulacion',barco:x[1],viaje:x[0],periodo:mes(Math.min(x[2]+1,12)),concepto:'Participación de pesca',personas:x[6],valor:Math.round(x[5]*0.88)*1000});
    roles.push({tipo:'tripulacion',barco:x[1],viaje:x[0],periodo:mes(Math.min(x[2]+1,12)),concepto:'Beneficios sociales',personas:x[6],valor:Math.round(x[5]*0.12)*1000});
  });
  for(var m=1;m<=9;m++){
    roles.push({tipo:'admin',periodo:mes(m),concepto:'Sueldos administrativos',personas:8,valor:17500});
  }
  return {
    meta:{ corte:new Date().toISOString(), fuente:'Muestra' },
    facturacion:fact,
    costos_viaje:cv,
    roles:roles,
    cxp:[
      {proveedor:'Combustibles del Pacífico',documento:'001-001-0002451',fecha:iso(-43),vence:iso(-13),valor:22400,saldo:22400,viaje:78,barco:'MF'},
      {proveedor:'Redes y Aparejos S.A.',documento:'001-003-0001180',fecha:iso(-25),vence:iso(5),valor:9860,saldo:9860,viaje:78,barco:'MF'},
      {proveedor:'Víveres Manta',documento:'001-002-0009071',fecha:iso(-10),vence:iso(21),valor:6215,saldo:6215,viaje:40,barco:'MG'},
      {proveedor:'Talleres Navales del Sur',documento:'001-001-0000733',fecha:iso(-80),vence:iso(-50),valor:19400,saldo:12600,viaje:40,barco:'MG'},
    ],
    cxc:[
      {cliente:'ASISERVY S.A.',documento:'001-001-0001078',fecha:iso(-5),vence:iso(10),valor:386000,saldo:386000,viaje:78,barco:'MF'},
      {cliente:'ASISERVY S.A.',documento:'001-001-0001040',fecha:iso(-35),vence:iso(-5),valor:129600,saldo:129600,viaje:40,barco:'MG'},
      {cliente:'SIMBAI S.A.',documento:'001-001-0002078',fecha:iso(-6),vence:iso(15),valor:29000,saldo:29000,viaje:78,barco:'MF'},
    ],
    impuestos:[
      {entidad:'SRI',periodo:mes(9),tipo:'IVA',base:98500,valor:14775,vence:iso(13),estado:'Pendiente'},
      {entidad:'SRI',periodo:mes(9),tipo:'Retención en la fuente',base:197750,valor:3955,vence:iso(13),estado:'Pendiente'},
      {entidad:'SRI',periodo:mes(8),tipo:'IVA',base:91200,valor:13680,vence:iso(-17),estado:'Pagado'},
      {entidad:'IESS',periodo:mes(9),tipo:'Aportes patronal y personal',base:61000,valor:12658,vence:iso(0),estado:'Pendiente'},
      {entidad:'IESS',periodo:mes(9),tipo:'Fondos de reserva',base:61000,valor:5081,vence:iso(0),estado:'Pendiente'},
      {entidad:'IESS',periodo:mes(8),tipo:'Aportes patronal y personal',base:59500,valor:12346,vence:iso(-30),estado:'Pagado'},
    ],
  };
}

/* ── API pública ── */
function init(user){
  activeUser=user||null;
  if(!data){ var l=loadLocal(); if(l){ data=l; } }
  render();
  initFirebase();
}
function switchVessel(b,btn){
  barco=b;
  document.querySelectorAll('#cont-vessel-tabs .vtab').forEach(function(x){ x.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  render();
}
function setTab(t){ tab=t; sub=''; if(t!=='cxp'&&t!=='cxc') soloVencido=false; render(); }
function setSub(s){ sub=s||''; render(); }
function setVencido(v){ soloVencido=!!v; refreshTabla(); }
function setFiltro(v){
  filtro=v||'';
  clearTimeout(searchTimer);
  searchTimer=setTimeout(refreshTabla,200);
}
function refreshTabla(){ var w=document.getElementById('cont-tbl'); if(w) w.innerHTML=tabla(); }
function irA(t,s,venc){
  tab=t; sub=s||''; soloVencido=!!venc&&(t==='cxp'||t==='cxc'); render();
  var d=document.querySelector('.cont-det'); if(d) d.scrollIntoView({behavior:'smooth',block:'start'});
}
function verMuestra(){ data=muestra(); usandoMuestra=true; render(); }
function salirMuestra(){ data=loadLocal(); usandoMuestra=false; render(); }

return {
  init: init,
  switchVessel: switchVessel,
  setTab: setTab,
  setSub: setSub,
  setVencido: setVencido,
  setFiltro: setFiltro,
  irA: irA,
  verMuestra: verMuestra,
  salirMuestra: salirMuestra,
};
})();
