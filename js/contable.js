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
  { id: 'cxp', label: 'Por pagar' },
  { id: 'cxc', label: 'Por cobrar' },
  { id: 'cv',  label: 'Costos por viaje' },
  { id: 'imp', label: 'Impuestos' },
];

let data       = null;     /* { meta, costos_viaje, cxp, cxc, impuestos } */
let usandoMuestra = false;
let barco      = 'todos';  /* todos | MF | MG */
let tab        = 'cxp';
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
  var v=num(n);
  if(Math.abs(v)>=1000) return '$'+(v/1000).toFixed(Math.abs(v)>=100000?0:1)+'k';
  return '$'+v.toFixed(0);
}
var MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function fmtFecha(iso){
  if(!iso) return '—';
  var p=String(iso).slice(0,10).split('-');
  if(p.length!==3) return escH(iso);
  return p[2]+' '+MESES[parseInt(p[1],10)-1]+' '+p[0];
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
function porBarco(arr){
  if(barco==='todos') return arr;
  return arr.filter(function(r){ return r.barco===barco; });
}
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
function totales(){
  var cxp=porBarco(lista('cxp')), cxc=porBarco(lista('cxc'));
  var t={cxp:0,cxpVenc:0,cxc:0,cxcVenc:0,imp:0,impVence:null};
  cxp.forEach(function(r){ var s=num(r.saldo); t.cxp+=s; if(s>0&&diasVencido(r.vence)>0) t.cxpVenc+=s; });
  cxc.forEach(function(r){ var s=num(r.saldo); t.cxc+=s; if(s>0&&diasVencido(r.vence)>0) t.cxcVenc+=s; });
  lista('impuestos').forEach(function(r){
    if(String(r.estado||'').toLowerCase()!=='pagado'){
      t.imp+=num(r.valor);
      if(r.vence&&(!t.impVence||r.vence<t.impVence)) t.impVence=r.vence;
    }
  });
  return t;
}
function costosPorViaje(){
  var map={};
  porBarco(lista('costos_viaje')).forEach(function(r){
    var k=(r.barco||'—')+'|'+(r.viaje==null?'—':r.viaje);
    if(!map[k]) map[k]={barco:r.barco||'—',viaje:r.viaje,total:0,cat:{}};
    var c=r.categoria||'Otros';
    map[k].total+=num(r.valor);
    map[k].cat[c]=(map[k].cat[c]||0)+num(r.valor);
  });
  return Object.keys(map).map(function(k){ return map[k]; })
    .sort(function(a,b){ return (num(a.viaje)-num(b.viaje))||String(a.barco).localeCompare(b.barco); });
}
function ultimoViaje(arr){
  if(!arr.length) return null;
  var ult=arr.slice().sort(function(a,b){ return num(b.viaje)-num(a.viaje); });
  return ult[0];
}
function antiguedad(k){
  var b=[0,0,0,0]; /* por vencer, 1-30, 31-60, +60 */
  porBarco(lista(k)).forEach(function(r){
    var s=num(r.saldo); if(s<=0) return;
    var d=diasVencido(r.vence);
    if(d<=0) b[0]+=s; else if(d<=30) b[1]+=s; else if(d<=60) b[2]+=s; else b[3]+=s;
  });
  return b;
}

/* ── render ── */
function render(){
  var el=document.getElementById('cont-content'); if(!el) return;
  var sub=document.getElementById('cont-vessel-sub'); if(sub) sub.textContent=VESSEL_SUB[barco];
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

  var t=totales();
  var cv=costosPorViaje();
  var ult=ultimoViaje(cv);
  var ultMF=ultimoViaje(cv.filter(function(x){return x.barco==='MF';}));
  var ultMG=ultimoViaje(cv.filter(function(x){return x.barco==='MG';}));
  var ultTxt=barco==='todos'
    ? [ultMF?('MF V'+ultMF.viaje+': '+fmtK(ultMF.total)):null, ultMG?('MG V'+ultMG.viaje+': '+fmtK(ultMG.total)):null].filter(Boolean).join(' · ')
    : (ult?('Viaje '+ult.viaje):'—');

  var html='';
  if(usandoMuestra){
    html+='<div class="cont-banner">Datos de muestra (ficticios). Se reemplazan solos al cargar el primer corte real de Tucán. '+
      '<button class="cont-link" onclick="CONT.salirMuestra()">Quitar muestra</button></div>';
  }
  html+='<div class="cont-kpis">'+
    kpi('Cuentas por pagar',fmtUSD(t.cxp), t.cxpVenc>0?('<span class="neg">'+fmtUSD(t.cxpVenc)+' vencido</span>'):'<span class="pos">Sin vencidos</span>','cxp',true)+
    kpi('Cuentas por cobrar',fmtUSD(t.cxc), t.cxcVenc>0?('<span class="neg">'+fmtUSD(t.cxcVenc)+' vencido</span>'):'<span class="pos">Sin vencidos</span>','cxc',true)+
    kpi(barco==='todos'?'Costo último viaje':'Costo último viaje · '+barco, ult&&barco!=='todos'?fmtUSD(ult.total):(barco==='todos'?(cv.length?fmtUSD((ultMF?ultMF.total:0)+(ultMG?ultMG.total:0)):'—'):'—'), escH(ultTxt||'Sin viajes'),'cv',false)+
    kpi('Impuestos pendientes',fmtUSD(t.imp), t.impVence?('<span class="warn">Próx. vence '+fmtFecha(t.impVence)+'</span>'):'<span class="pos">Al día</span>','imp',false)+
  '</div>';

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
        ((tab==='cxp'||tab==='cxc')?'<label class="cont-chk"><input type="checkbox" '+(soloVencido?'checked':'')+' onchange="CONT.setVencido(this.checked)"> Solo vencidos</label>':'')+
        '<input class="cont-search" id="cont-search" type="search" placeholder="Buscar proveedor, cliente o documento" value="'+escH(filtro).replace(/"/g,'&quot;')+'" oninput="CONT.setFiltro(this.value)">'+
      '</div>'+
    '</div>'+
    '<div class="cont-tbl-wrap" id="cont-tbl">'+tabla()+'</div>'+
  '</div>';

  el.innerHTML=html;
  drawCharts(cv);
}
function kpi(lbl,val,sub,go,venc){
  var click=' onclick="CONT.irA(\''+go+'\','+(venc?'true':'false')+')"';
  return '<div class="cont-kpi"'+click+' title="Ver detalle"><div class="cont-kpi-lbl">'+lbl+'</div>'+
    '<div class="cont-kpi-val">'+val+'</div><div class="cont-kpi-sub">'+sub+'</div></div>';
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
  } else if(tab==='cv'){
    var agg=costosPorViaje();
    var cats={};
    agg.forEach(function(v){ Object.keys(v.cat).forEach(function(c){ cats[c]=(cats[c]||0)+v.cat[c]; }); });
    var catList=Object.keys(cats).sort(function(a,b){ return cats[b]-cats[a]; });
    rows=agg.filter(function(v){ return coincide({v:'V'+v.viaje+' '+v.barco,b:BARCO_LABEL[v.barco]||''},['v','b']); });
    head=['<th>Viaje</th>','<th>Embarcación</th>'].concat(catList.map(function(c){ return '<th class="r">'+escH(c)+'</th>'; })).concat(['<th class="r">Total</th>']);
    var tot=0, tc={};
    rows.slice().reverse().forEach(function(v){
      tot+=v.total;
      body+='<tr><td class="strong">Viaje '+escH(v.viaje)+'</td><td>'+escH(BARCO_LABEL[v.barco]||v.barco)+'</td>'+
        catList.map(function(c){ tc[c]=(tc[c]||0)+(v.cat[c]||0); return '<td class="r">'+(v.cat[c]?fmtUSD(v.cat[c]):'—')+'</td>'; }).join('')+
        '<td class="r strong">'+fmtUSD(v.total)+'</td></tr>';
    });
    foot='<tr><td colspan="2" class="cont-sub-lbl">Total ('+rows.length+' viajes)</td>'+
      catList.map(function(c){ return '<td class="r cont-sub-val">'+fmtUSD(tc[c]||0)+'</td>'; }).join('')+
      '<td class="r cont-sub-val">'+fmtUSD(tot)+'</td></tr>';
  } else {
    rows=lista('impuestos').filter(function(r){ return coincide(r,['periodo','tipo','estado']); })
      .sort(function(a,b){ return String(b.vence||'').localeCompare(String(a.vence||'')); });
    head=['<th>Período</th>','<th>Tipo</th>','<th class="r">Base</th>','<th class="r">Valor</th>','<th>Vence</th>','<th>Estado</th>'];
    var tv=0;
    rows.forEach(function(r){
      var pagado=String(r.estado||'').toLowerCase()==='pagado';
      if(!pagado) tv+=num(r.valor);
      var d=diasVencido(r.vence);
      var e=pagado?{cls:'ok',txt:'Pagado'}:(d>0?{cls:'venc',txt:'Vencido'}:{cls:'prox',txt:'Pendiente'});
      body+='<tr><td class="strong">'+escH(r.periodo)+'</td><td>'+escH(r.tipo)+'</td><td class="r">'+fmtUSD(r.base)+'</td>'+
        '<td class="r strong">'+fmtUSD(r.valor)+'</td><td>'+fmtFecha(r.vence)+'</td><td>'+pill(e)+'</td></tr>';
    });
    foot='<tr><td colspan="3" class="cont-sub-lbl">Pendiente de pago</td><td class="r cont-sub-val">'+fmtUSD(tv)+'</td><td colspan="2"></td></tr>';
  }
  if(!rows.length) return '<p class="cont-no-rows">Sin registros'+(filtro||soloVencido?' con este filtro':'')+'.</p>';
  return '<table class="cont-tbl"><thead><tr>'+head.join('')+'</tr></thead><tbody>'+body+'</tbody><tfoot>'+foot+'</tfoot></table>';
}

/* ── gráficos ── */
function destroyCharts(){
  Object.keys(charts).forEach(function(k){ try{ charts[k].destroy(); }catch(e){} });
  charts={};
}
function drawCharts(cv){
  destroyCharts();
  if(typeof Chart==='undefined') return;
  var opt=function(){ return {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ boxWidth:10, font:{size:11} } },
      tooltip:{ callbacks:{ label:function(c){ return c.dataset.label+': '+fmtUSD(c.raw); } } } },
    scales:{ y:{ ticks:{ callback:function(v){ return fmtK(v); }, font:{size:11} } }, x:{ ticks:{ font:{size:11} } } }
  }; };
  var c1=document.getElementById('cont-ch-viajes');
  if(c1){
    var viajes=[], seen={};
    cv.forEach(function(v){ var k=String(v.viaje); if(!seen[k]){ seen[k]=1; viajes.push(v.viaje); } });
    viajes=viajes.slice(-8);
    var ds=[];
    ['MF','MG'].forEach(function(b){
      if(barco!=='todos'&&barco!==b) return;
      var vals=viajes.map(function(vj){ var f=cv.filter(function(x){ return x.barco===b&&String(x.viaje)===String(vj); })[0]; return f?Math.round(f.total):null; });
      if(vals.some(function(x){ return x!=null; }))
        ds.push({ label:BARCO_LABEL[b], data:vals, backgroundColor:b==='MF'?'#2E75B6':'#1D9E75', borderRadius:4 });
    });
    charts.v=new Chart(c1,{ type:'bar', data:{ labels:viajes.map(function(v){ return 'V'+v; }), datasets:ds }, options:opt() });
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
  var hoy=new Date(), iso=function(dd){ var d=new Date(hoy); d.setDate(d.getDate()+dd); return d.toISOString().slice(0,10); };
  var cv=[];
  [[75,'MF',[118,24,56]],[76,'MF',[121,25,59]],[77,'MF',[106,22,62]],[78,'MF',[118,24,70]],
   [38,'MG',[129,26,71]],[39,'MG',[133,27,71]],[40,'MG',[131,27,82]]].forEach(function(x){
    ['Combustible','Víveres','Otros'].forEach(function(c,i){
      cv.push({viaje:x[0],barco:x[1],centro:'Viaje '+x[0]+' '+BARCO_LABEL[x[1]],categoria:c,valor:x[2][i]*1000});
    });
  });
  return {
    meta:{ corte:new Date().toISOString(), fuente:'Muestra' },
    costos_viaje:cv,
    cxp:[
      {proveedor:'Combustibles del Pacífico',documento:'001-001-0002451',fecha:iso(-43),vence:iso(-13),valor:22400,saldo:22400,viaje:78,barco:'MF'},
      {proveedor:'Redes y Aparejos S.A.',documento:'001-003-0001180',fecha:iso(-25),vence:iso(5),valor:9860,saldo:9860,viaje:78,barco:'MF'},
      {proveedor:'Víveres Manta',documento:'001-002-0009071',fecha:iso(-10),vence:iso(21),valor:6215,saldo:6215,viaje:40,barco:'MG'},
      {proveedor:'Talleres Navales del Sur',documento:'001-001-0000733',fecha:iso(-80),vence:iso(-50),valor:19400,saldo:12600,viaje:40,barco:'MG'},
    ],
    cxc:[
      {cliente:'ASISERVY S.A.',documento:'001-001-0001022',fecha:iso(-5),vence:iso(10),valor:198300,saldo:198300,viaje:78,barco:'MF'},
      {cliente:'ASISERVY S.A.',documento:'001-001-0001019',fecha:iso(-35),vence:iso(-5),valor:129600,saldo:129600,viaje:40,barco:'MG'},
      {cliente:'SIMBAI S.A.',documento:'001-001-0001020',fecha:iso(-6),vence:iso(15),valor:29000,saldo:29000,viaje:78,barco:'MF'},
    ],
    impuestos:[
      {periodo:'Mes anterior',tipo:'IVA',base:98500,valor:14775,vence:iso(13),estado:'Pendiente'},
      {periodo:'Mes anterior',tipo:'Retención en la fuente',base:197750,valor:3955,vence:iso(13),estado:'Pendiente'},
      {periodo:'Hace 2 meses',tipo:'IVA',base:91200,valor:13680,vence:iso(-17),estado:'Pagado'},
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
function setTab(t){ tab=t; if(t!=='cxp'&&t!=='cxc') soloVencido=false; render(); }
function setVencido(v){ soloVencido=!!v; refreshTabla(); }
function setFiltro(v){
  filtro=v||'';
  clearTimeout(searchTimer);
  searchTimer=setTimeout(refreshTabla,200);
}
function refreshTabla(){ var w=document.getElementById('cont-tbl'); if(w) w.innerHTML=tabla(); }
function irA(t,venc){
  tab=t; soloVencido=!!venc&&(t==='cxp'||t==='cxc'); render();
  var d=document.querySelector('.cont-det'); if(d) d.scrollIntoView({behavior:'smooth',block:'start'});
}
function verMuestra(){ data=muestra(); usandoMuestra=true; render(); }
function salirMuestra(){ data=loadLocal(); usandoMuestra=false; render(); }

return {
  init: init,
  switchVessel: switchVessel,
  setTab: setTab,
  setVencido: setVencido,
  setFiltro: setFiltro,
  irA: irA,
  verMuestra: verMuestra,
  salirMuestra: salirMuestra,
};
})();
