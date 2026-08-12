/* ════════════════════════════════════════════
   SIMULADOR DE VIAJE — scoped module
   (persistencia local; sin sincronizacion Firebase)
════════════════════════════════════════════ */
var SIMULADOR = (function() {

// ── Barco activo: María Fátima (180 TM) o María de Gracia (215 TM) ──
const VESSEL_META = {
  fatima: { nombre:'María Fátima',    cap:180 },
  gracia: { nombre:'María de Gracia', cap:215 },
};
let currentVessel = 'fatima';
function SK_FOR(v){ return (v==='gracia') ? 'atuntro_sim_gracia_v4' : 'atuntro_mf_v4'; }
function FB_PATH_FOR(v){ return 'atuntro_simulador/' + (v==='gracia'?'mariadegracia':'mariafatima'); }
let SK = SK_FOR('fatima');            // se recalcula al cambiar de barco
let chartSens=null, chartComp=null;

// ── AVITUALLAMIENTO Y TRABAJOS DE SALIDA (antes "Otros proveedores") ──
function defaultProvs(){ return [
  {name:'Combustible',max:200000,value:0},
  {name:'Víveres',max:20000,value:0},
  {name:'Carnada',max:10000,value:0},
  {name:'Sal',max:8000,value:0},
  {name:'Repuestos',max:15000,value:0},
  {name:'Muellaje',max:5000,value:0},
  {name:'Trabajos de salida',max:10000,value:0},
]; }
let provs=defaultProvs();

function defaultRProvs(){ return defaultProvs(); }
let rprovs = defaultRProvs();

function renderRProvs(){
  const c=document.getElementById('r_prov_container');
  if(!c) return;
  c.innerHTML=rprovs.map((p,i)=>`
    <div class="prov-row">
      <input class="prov-name" type="text" value="${eh(p.name)}" placeholder="Categoría"
        oninput="SIMULADOR.rprovs[${i}].name=this.value;SIMULADOR.sv()">
      <input type="number" id="rpmanual${i}" class="prov-manual" style="flex:1" value="${p.value}" min="0" step="100" placeholder="0"
        oninput="SIMULADOR.rprovs[${i}].value=+this.value||0;SIMULADOR.updRProvPill();SIMULADOR.sv();SIMULADOR.cr()">
      <button onclick="SIMULADOR.rprovs.splice(${i},1);SIMULADOR.renderRProvs();SIMULADOR.sv();SIMULADOR.cr()" style="font-size:15px;color:#ccc;background:none;border:none;cursor:pointer;padding:0 0 0 2px" title="Eliminar">×</button>
    </div>`).join('');
  updRProvPill();
}
function addRProv(){ rprovs.push({name:'Nueva categoría',max:50000,value:0}); renderRProvs(); sv(); cr(); }
function updRProvPill(){
  const t=rprovs.reduce((s,p)=>s+p.value,0);
  const p=document.getElementById('r_prov_pill');
  if(p) p.textContent=fmt(t);
}
function getTotalRProv(){ return rprovs.reduce((s,p)=>s+p.value,0); }

function renderProvs(){
  const c=document.getElementById('prov_container');
  if(!c) return;
  c.innerHTML=provs.map((p,i)=>`
    <div class="prov-row">
      <input class="prov-name" type="text" value="${eh(p.name)}" placeholder="Categoría"
        oninput="SIMULADOR.provs[${i}].name=this.value;SIMULADOR.sv()">
      <input type="range" id="pslider${i}" min="0" max="${p.max}" value="${p.value}" step="100"
        oninput="SIMULADOR.provs[${i}].value=+this.value;document.getElementById('pmanual${i}').value=this.value;SIMULADOR.updProvPill();SIMULADOR.sv();SIMULADOR.cp()">
      <input type="number" id="pmanual${i}" class="prov-manual" value="${p.value}" min="0" step="100" placeholder="0"
        oninput="const v=+this.value||0;SIMULADOR.provs[${i}].value=v;const sl=document.getElementById('pslider${i}');if(v>SIMULADOR.provs[${i}].max){SIMULADOR.provs[${i}].max=Math.ceil(v/1000)*1000;sl.max=SIMULADOR.provs[${i}].max;}sl.value=v;SIMULADOR.updProvPill();SIMULADOR.sv();SIMULADOR.cp()">
      <button onclick="SIMULADOR.provs.splice(${i},1);SIMULADOR.renderProvs();SIMULADOR.sv();SIMULADOR.cp()" style="font-size:15px;color:#ccc;background:none;border:none;cursor:pointer;padding:0 0 0 2px" title="Eliminar">×</button>
    </div>`).join('');
  SIMULADOR.updProvPill();
}

function updProvLabel(i){
  SIMULADOR.updProvPill();
}

function updProvPill(){
  const t=provs.reduce((s,p)=>s+p.value,0);
  const p=document.getElementById('prov_pill');
  if(p) p.textContent=fmt(t);
}

function addProv(){
  provs.push({name:'Nueva',max:15000,value:0});
  SIMULADOR.renderProvs();SIMULADOR.sv();SIMULADOR.cp();
}

function getTotalProv(){return provs.reduce((s,p)=>s+p.value,0);}

// ── TALLAS ──
const TALLA_KEYS={yf:['g','m','b','ch','xs'],skj:['g','b','ch','xs']};
const TALLA_ANCLA={yf:'b',skj:'b'};

function tallaTM(sp,k,sc){sc=sc||'';return Math.max(0,parseFloat((document.getElementById(sc+'tmt_'+sp+'_'+k)||{}).value)||0);}
function tallaObjetivo(sp,sc){
  const id = sc==='r' ? 'rr_'+sp+'_tm' : 'tm_'+sp;
  return Math.max(0,parseFloat((document.getElementById(id)||{}).value)||0);
}

function pintarCuadre(sp,sc){
  sc=sc||'';
  const keys=TALLA_KEYS[sp];
  const sum=keys.reduce((a,k)=>a+tallaTM(sp,k,sc),0);
  const objetivo=tallaObjetivo(sp,sc);
  const dif=+(sum-objetivo).toFixed(2);
  const desc=Math.abs(dif)>=0.05;
  const sEl=document.getElementById(sc+sp+'_talla_sum');
  if(sEl){sEl.textContent=sum.toFixed(1)+' / '+objetivo.toFixed(1)+' TM';sEl.style.color=desc?'#D85A30':'#1a1a18';}
  const hint=document.getElementById(sc+sp+'_talla_hint');
  if(hint){
    if(!desc){hint.textContent='';}
    else if(dif>0){hint.textContent='\u26a0 Hay '+dif.toFixed(1)+' TM de m\u00e1s respecto a la descarga '+sp.toUpperCase()+'.';hint.style.color='#D85A30';}
    else{hint.textContent='\u26a0 Faltan '+Math.abs(dif).toFixed(1)+' TM por asignar a tallas.';hint.style.color='#BA7517';}
  }
  keys.forEach(k=>{const el=document.getElementById(sc+'tmt_'+sp+'_'+k);if(el)el.classList.toggle('tm-over',desc);});
}

// Fuente de verdad = TM por talla. El % queda como campo derivado oculto.
function syncTallaScope(sp,sc){
  sc=sc||'';
  const keys=TALLA_KEYS[sp];
  const tms=keys.map(k=>tallaTM(sp,k,sc));
  const sum=tms.reduce((a,b)=>a+b,0);
  keys.forEach((k,i)=>{
    const pct=sum>0?(tms[i]/sum*100):0;
    const hid=document.getElementById(sc+'tl_'+sp+'_'+k); if(hid) hid.value=pct.toFixed(2);
    const v=document.getElementById(sc+'tv_'+sp+'_'+k); if(v) v.textContent=(sum>0?pct.toFixed(1):'0')+'%';
  });
  pintarCuadre(sp,sc);
}
function syncTalla(sp){ syncTallaScope(sp,''); }
function syncTallaReal(sp){ syncTallaScope(sp,'r'); }

function ajustarTallasScope(sp,sc){
  sc=sc||'';
  const keys=TALLA_KEYS[sp];
  const objetivo=tallaObjetivo(sp,sc);
  const tms=keys.map(k=>tallaTM(sp,k,sc));
  const sum=tms.reduce((a,b)=>a+b,0);
  let out = sum>0 ? tms.map(v=>v/sum*objetivo) : keys.map(k=>k===TALLA_ANCLA[sp]?objetivo:0);
  out=out.map(v=>Math.round(v*10)/10);
  const idxA=keys.indexOf(TALLA_ANCLA[sp]);
  const resto=Math.round((objetivo-out.reduce((a,b)=>a+b,0))*10)/10;
  out[idxA]=Math.max(0,Math.round((out[idxA]+resto)*10)/10);
  keys.forEach((k,i)=>{const el=document.getElementById(sc+'tmt_'+sp+'_'+k);if(el)el.value=out[i];});
  syncTallaScope(sp,sc); sv(); if(sc==='r'){cr();}else{cp();}
}
function ajustarTallas(sp){ ajustarTallasScope(sp,''); }
function ajustarTallasReal(sp){ ajustarTallasScope(sp,'r'); }

function tallaDiff(sp,sc){
  sc=sc||'';
  let num=0,den=0;
  TALLA_KEYS[sp].forEach(k=>{
    const tm=tallaTM(sp,k,sc);
    const d=+((document.getElementById(sc+'d_'+sp+'_'+k)||{}).value)||0;
    num+=tm*d; den+=tm;
  });
  return den>0?num/den:0;
}
function yfDiff(){ return tallaDiff('yf',''); }
function skjDiff(){ return tallaDiff('skj',''); }

// ── BARRA DE CARGA ──
const SEG_COLORS={yf:'#2E75B6',skj:'#1D9E75',rec:'#BA7517',ps:'#534AB7',bt:'#D85A30',do:'#0F6E56',extra:'#888780'};
const SEG_LABELS={yf:'YF',skj:'SKJ',rec:'Rechazo',ps:'Pata seca',bt:'Botella',do:'Dorado',extra:'Otro'};

function updCargaBar(especies,cap,pfx){
  pfx=pfx||'';
  const total=especies.reduce((s,e)=>s+e.tm,0);
  const track=document.getElementById(pfx+'carga_track');
  const legend=document.getElementById(pfx+'carga_legend');
  const warn=document.getElementById(pfx+'carga_warning');
  const usado=document.getElementById(pfx+'carga_usada');
  const capEl=document.getElementById(pfx+'carga_cap');
  const pill=document.getElementById(pfx+'tm_total_pill');

  if(usado) usado.textContent=total.toFixed(1);
  if(capEl) capEl.textContent=cap;
  if(pill) pill.textContent=total.toFixed(1)+' TM';
  if(warn) warn.style.display=total>cap?'block':'none';
  if(usado) usado.style.color=total>cap?'#D85A30':'#1F4E79';

  if(!track) return;
  const libre=Math.max(0,cap-total);
  const base=Math.max(cap,total);

  let html='';
  especies.forEach(e=>{
    if(e.tm<=0) return;
    const w=(e.tm/base*100).toFixed(2);
    html+=`<div class="carga-seg" style="width:${w}%;background:${e.color}" title="${e.label}: ${e.tm} TM"></div>`;
  });
  if(libre>0){
    const w=(libre/base*100).toFixed(2);
    html+=`<div class="carga-seg seg-libre" style="width:${w}%"></div>`;
  }
  track.innerHTML=html||'<div class="carga-seg seg-libre" style="width:100%"></div>';

  // leyenda
  let leg='';
  especies.forEach(e=>{
    if(e.tm<=0) return;
    leg+=`<span class="carga-leg-item"><span class="carga-leg-dot" style="background:${e.color}"></span>${e.label}: ${e.tm.toFixed(1)} TM (${base>0?(e.tm/base*100).toFixed(0):'0'}%)</span>`;
  });
  if(libre>0) leg+=`<span class="carga-leg-item"><span class="carga-leg-dot" style="background:#e0ddd8"></span>Libre: ${libre.toFixed(1)} TM</span>`;
  if(legend) legend.innerHTML=leg;
}

// ── CALC PROYECCIÓN ──
let SPROY=null;

function cp(){
  const dias =+document.getElementById('p_dias').value||0;
  const cap  =+document.getElementById('p_cap').value||180;
  const ancla=+document.getElementById('p_ancla').value||0;
  const rolTM=+document.getElementById('p_rol_tm').value||0;
  const sal  =+document.getElementById('p_sal').value||0;
  const ant  =+document.getElementById('p_anticipo').value||0;

  // TM absolutas por especie
  const tm_yf  =+document.getElementById('tm_yf').value||0;
  const tm_skj =+document.getElementById('tm_skj').value||0;
  const tm_rec =+document.getElementById('tm_rec').value||0;
  const tm_ps  =+document.getElementById('tm_ps').value||0;
  const tm_bt  =+document.getElementById('tm_bt').value||0;
  const tm_do  =+document.getElementById('tm_do').value||0;
  const tm_extra=+document.getElementById('tm_extra').value||0;
  const px_rec =+document.getElementById('px_rec').value||0;
  const px_ps  =+document.getElementById('px_ps').value||0;
  const px_bt  =+document.getElementById('px_bt').value||0;
  const px_do  =+document.getElementById('px_do').value||0;
  const px_extra=+document.getElementById('px_extra').value||0;
  const tm_total=tm_yf+tm_skj+tm_rec+tm_ps+tm_bt+tm_do+tm_extra;

  // Precios efectivos — ambos parten del mismo precio ancla
  const diff_yf =yfDiff();
  const diff_skj=skjDiff();
  const px_yf   =ancla+diff_yf;
  const px_skj  =ancla+diff_skj;

  // Display precios efectivos
  setText('px_yf_disp', ancla>0?'$'+Math.round(px_yf):'—');
  setText('px_skj_disp', ancla>0?'$'+Math.round(px_skj):'—');
  setText('px_yf_ef', ancla>0?'$'+Math.round(px_yf)+'/TM':'—');
  setText('px_skj_ef', ancla>0?'$'+Math.round(px_skj)+'/TM':'—');

  // Ingresos por especie
  const ing_yf  =tm_yf*px_yf;
  const ing_skj =tm_skj*px_skj;
  const ing_rec =tm_rec*px_rec;
  const ing_ps  =tm_ps*px_ps;
  const ing_bt  =tm_bt*px_bt;
  const ing_do  =tm_do*px_do;
  const ing_extra=tm_extra*px_extra;
  const ing_total=ing_yf+ing_skj+ing_rec+ing_ps+ing_bt+ing_do+ing_extra;

  // Subtotales en tabla
  const espRows=[
    ['tot_yf',ing_yf,tm_yf,tm_total,'pct_yf'],
    ['tot_skj',ing_skj,tm_skj,tm_total,'pct_skj'],
    ['tot_rec',ing_rec,tm_rec,tm_total,'pct_rec'],
    ['tot_ps',ing_ps,tm_ps,tm_total,'pct_ps'],
    ['tot_bt',ing_bt,tm_bt,tm_total,'pct_bt'],
    ['tot_do',ing_do,tm_do,tm_total,'pct_do'],
    ['tot_extra',ing_extra,tm_extra,tm_total,'pct_extra'],
  ];
  espRows.forEach(([tid,ing,tm,tot,pid])=>{
    const te=document.getElementById(tid);
    const pe=document.getElementById(pid);
    if(te) te.textContent=ing>0?fmt(ing):'—';
    if(pe) pe.textContent=tot>0?(tm/tot*100).toFixed(0)+'%':'—';
  });
  setText('ing_total_disp',ing_total>0?fmt(ing_total):'—');

  // Barra de carga
  updCargaBar([
    {tm:tm_yf,color:'#2E75B6',label:'YF'},
    {tm:tm_skj,color:'#1D9E75',label:'SKJ'},
    {tm:tm_rec,color:'#BA7517',label:'Rechazo'},
    {tm:tm_ps,color:'#534AB7',label:'Pata seca'},
    {tm:tm_bt,color:'#D85A30',label:'Botella'},
    {tm:tm_do,color:'#0F6E56',label:'Dorado'},
    {tm:tm_extra,color:'#888780',label:'Otro'},
  ], cap);

  // Costos — combustible incluido en avituallamiento (provs)
  // SAL es castigo al ingreso, no costo adicional
  const prov =getTotalProv();
  const rol  =tm_total*rolTM;
  const costo=prov+rol;           // sin sal
  const ing_neta=ing_total-sal;   // sal descuenta el ingreso
  SIMULADOR.updProvPill();

  // Resultados
  const margen=ing_neta-costo;
  const mpct  =ing_neta>0?margen/ing_neta*100:0;
  const ctm   =tm_total>0?costo/tm_total:0;
  const itm   =tm_total>0?ing_neta/tm_total:0;
  const be_tm =itm>0?costo/itm:0;
  const be_pct=tm_total>0?be_tm/tm_total*100:0;

  // Breakeven box
  setText('p_costo_total',fmt(costo));
  setText('p_tm_be',be_tm>0?be_tm.toFixed(1)+' TM':'—');
  setText('p_tm_be_sub',tm_total>0?be_pct.toFixed(1)+'% de '+tm_total.toFixed(1)+' TM estimadas':'de TM estimadas');
  const mEl=document.getElementById('p_margen');
  if(mEl){mEl.textContent=ing_neta>0||ing_total>0?fmt(margen):'—';mEl.style.color=margen>=0?'#4AE3A8':'#FFAAAA';}
  setText('p_margen_pct',ing_neta>0?mpct.toFixed(1)+'% sobre ingresos netos':'');

  // KPIs
  const pxProm = tm_total>0 ? ing_neta/tm_total : 0;
  const cDia   = dias>0 ? costo/dias : 0;
  setText('p_ing_kpi',ing_neta>0?fmt(ing_neta):'—');
  setText('p_ing_tm_kpi',(sal>0?'Bruto '+fmt(ing_total)+' − castigo '+fmt(sal):(itm>0?fmt(Math.round(itm))+'/TM':'')));
  setText('p_pxprom_kpi', pxProm>0?'$'+Math.round(pxProm)+'/TM':'—');
  const cEl=document.getElementById('p_ctm_kpi');
  if(cEl){cEl.textContent=ctm>0?'$'+Math.round(ctm):'—';}
  const cdEl=document.getElementById('p_cdia_kpi');
  if(cdEl){cdEl.textContent=cDia>0?'$'+Math.round(cDia):'—';}
  setText('p_cdia_sub', dias>0?'sobre '+dias+' días estimados':'Ingresa días del viaje');
  setText('p_caja_kpi',fmt(prov+ant));
  setText('p_be_tm_kpi',be_tm>0?be_tm.toFixed(1)+' TM':'—');
  setText('p_be_tm_sub',be_pct>0?be_pct.toFixed(1)+'% de la carga estimada':'');

  // Caja dividida: propia vs crédito
  const credito=+document.getElementById('p_credito_prov').value||0;
  const cajaTot=prov+ant;
  const cajaPropia=Math.max(0, cajaTot-credito);
  setText('caja_total_disp', fmt(cajaTot));
  setText('caja_propia_disp', fmt(cajaPropia));
  setText('caja_credito_disp', fmt(credito));
  setText('caja_propia_sub', credito>0?'('+fmt(cajaTot)+' − crédito '+fmt(credito)+')':'Sin crédito registrado');

  // Cuadre de TM por talla vs captura declarada
  pintarCuadre('yf','');
  pintarCuadre('skj','');

  // Flujo de caja
  const cfz=-(prov+ant);
  setText('cf_zarpe',fmt(cfz));
  setText('cf_zarpe_det',['Avituallamiento '+fmt(prov),'Anticipo '+fmt(ant)].join('\n'));
  setText('cf_llegada',ing_neta>0?fmt(ing_neta):'—');
  const llegDet=[
    tm_yf>0?'YF '+fmt(ing_yf):'',
    tm_skj>0?'SKJ '+fmt(ing_skj):'',
    tm_rec>0?'Rechazo '+fmt(ing_rec):'',
    tm_ps>0?'Pata seca '+fmt(ing_ps):'',
    tm_bt>0?'Botella '+fmt(ing_bt):'',
    tm_do>0?'Dorado '+fmt(ing_do):'',
    tm_extra>0?'Otro '+fmt(ing_extra):'',
    sal>0?'− Castigo sal ('+fmt(sal)+')':'',
  ].filter(Boolean).join('\n');
  setText('cf_llegada_det',llegDet);

  // Guardar para comparativo y simulación
  SPROY={tm:tm_total,dias,ing:ing_neta,ingBruto:ing_total,sal,costo,margen,mpct,ctm,itm};

  buildSensChart(costo,itm,tm_total,cap);
}

function buildSensChart(costoFijo,ingTM,tmEst,cap){
  if(!window.Chart) return;
  const max=Math.ceil(Math.max(tmEst,cap)*1.2/5)*5;
  const labels=[],data=[],colors=[];
  for(let t=0;t<=max;t+=5){
    labels.push(t);
    const v=Math.round(t*ingTM-costoFijo);
    data.push(v);
    colors.push(v>=0?'#1D9E75':'#D85A30');
  }
  if(chartSens) chartSens.destroy();
  const ctx=document.getElementById('chartSens');
  if(!ctx) return;
  chartSens=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[{label:'Margen',data,backgroundColor:colors,borderRadius:3}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'$'+c.parsed.y.toLocaleString()}}},
      scales:{
        x:{title:{display:true,text:'TM capturadas',font:{size:11}},ticks:{color:'#888',font:{size:11}},grid:{color:'rgba(0,0,0,0.04)'}},
        y:{ticks:{color:'#888',font:{size:11},callback:v=>'$'+v.toLocaleString()},grid:{color:'rgba(0,0,0,0.04)'}}
      }
    }
  });
}

// ── CALC CIERRE REAL ──
let SREAL=null;

function cr(){
  const dias =+document.getElementById('r_dias').value||0;
  const cap  =+document.getElementById('r_cap').value||180;
  const ancla=+document.getElementById('r_ancla').value||0;
  const rol  =+document.getElementById('r_rol').value||0;
  const sal  =+document.getElementById('r_sal').value||0;
  const ant  =+document.getElementById('r_anticipo').value||0;
  const credito=+document.getElementById('r_credito_prov').value||0;

  const tm_yf =+document.getElementById('rr_yf_tm').value||0;
  const tm_skj=+document.getElementById('rr_skj_tm').value||0;
  const tm_rec=+document.getElementById('rr_rec_tm').value||0;
  const tm_ps =+document.getElementById('rr_ps_tm').value||0;
  const tm_bt =+document.getElementById('rr_bt_tm').value||0;
  const tm_do =+document.getElementById('rr_do_tm').value||0;
  const tm_ex =+document.getElementById('rr_extra_tm').value||0;
  const px_rec=+document.getElementById('rr_rec_px').value||0;
  const px_ps =+document.getElementById('rr_ps_px').value||0;
  const px_bt =+document.getElementById('rr_bt_px').value||0;
  const px_do =+document.getElementById('rr_do_px').value||0;
  const px_ex =+document.getElementById('rr_extra_px').value||0;
  const tm=tm_yf+tm_skj+tm_rec+tm_ps+tm_bt+tm_do+tm_ex;

  // Precios efectivos reales desde ancla + diferencial por talla
  const px_yf =ancla+tallaDiff('yf','r');
  const px_skj=ancla+tallaDiff('skj','r');
  setText('rpx_yf_disp', ancla>0?'$'+Math.round(px_yf):'—');
  setText('rpx_skj_disp',ancla>0?'$'+Math.round(px_skj):'—');
  setText('rpx_yf_ef',  ancla>0?'$'+Math.round(px_yf)+'/TM':'—');
  setText('rpx_skj_ef', ancla>0?'$'+Math.round(px_skj)+'/TM':'—');
  pintarCuadre('yf','r');
  pintarCuadre('skj','r');

  const ing_yf=tm_yf*px_yf, ing_skj=tm_skj*px_skj, ing_rec=tm_rec*px_rec;
  const ing_ps=tm_ps*px_ps, ing_bt=tm_bt*px_bt, ing_do=tm_do*px_do, ing_ex=tm_ex*px_ex;
  const ing_total=ing_yf+ing_skj+ing_rec+ing_ps+ing_bt+ing_do+ing_ex;

  const nomEx=document.getElementById('rr_nom_extra')?.value||'Otro';
  const filas=[
    ['rr_yf_tot','rpct_yf',ing_yf,tm_yf,'YF'],
    ['rr_skj_tot','rpct_skj',ing_skj,tm_skj,'SKJ'],
    ['rr_rec_tot','rpct_rec',ing_rec,tm_rec,'Rechazo'],
    ['rr_ps_tot','rpct_ps',ing_ps,tm_ps,'Pata seca'],
    ['rr_bt_tot','rpct_bt',ing_bt,tm_bt,'Botella'],
    ['rr_do_tot','rpct_do',ing_do,tm_do,'Dorado'],
    ['rr_extra_tot','rpct_extra',ing_ex,tm_ex,nomEx],
  ];
  const detalle=[];
  filas.forEach(([tid,pid,ing,t,lbl])=>{
    const el=document.getElementById(tid); if(el) el.textContent=ing>0?fmt(ing):'—';
    const pe=document.getElementById(pid); if(pe) pe.textContent=(t>0&&tm>0)?(t/tm*100).toFixed(0)+'%':'—';
    if(ing>0) detalle.push([lbl,ing,t>0?ing/t:0]);
  });
  setText('rr_ing_disp',ing_total>0?fmt(ing_total):'—');

  updCargaBar([
    {tm:tm_yf,color:SEG_COLORS.yf,label:'YF'},
    {tm:tm_skj,color:SEG_COLORS.skj,label:'SKJ'},
    {tm:tm_rec,color:SEG_COLORS.rec,label:'Rechazo'},
    {tm:tm_ps,color:SEG_COLORS.ps,label:'Pata seca'},
    {tm:tm_bt,color:SEG_COLORS.bt,label:'Botella'},
    {tm:tm_do,color:SEG_COLORS.do,label:'Dorado'},
    {tm:tm_ex,color:SEG_COLORS.extra,label:nomEx},
  ],cap,'r_');

  const prov=getTotalRProv();
  const ing_neta=ing_total-sal;
  const costo=prov+rol;
  const margen=ing_neta-costo;
  const mpct=ing_neta>0?margen/ing_neta*100:0;
  const ctm=tm>0?costo/tm:0, itm=tm>0?ing_neta/tm:0, cdia=dias>0?costo/dias:0;

  setText('r_ing',fmt(ing_neta));
  setText('r_costo',fmt(costo));
  const mEl=document.getElementById('r_margen');
  if(mEl){mEl.textContent=fmt(margen);mEl.style.color=margen>=0?'#1D9E75':'#D85A30';}
  const mpEl=document.getElementById('r_mpct');
  if(mpEl){mpEl.textContent=mpct.toFixed(1)+'%';mpEl.style.color=margen>=0?'#1D9E75':'#D85A30';}
  const bar=document.getElementById('r_bar');
  if(bar){bar.style.width=Math.min(100,Math.max(0,mpct)).toFixed(0)+'%';bar.style.background=margen>=0?'#1D9E75':'#D85A30';}

  // Caja real
  const cajaTot=prov+ant;
  const cajaPropia=Math.max(0,cajaTot-credito);
  setText('r_cf_zarpe',cajaTot>0?fmt(-cajaTot):'—');
  setText('r_cf_llegada',ing_neta>0?fmt(ing_neta):'—');
  setText('r_caja_total_disp',fmt(cajaPropia));
  setText('r_caja_credito_disp',fmt(credito));
  setText('r_caja_propia_sub',credito>0?'('+fmt(cajaTot)+' − crédito '+fmt(credito)+')':'Sin crédito registrado');

  const tbody=document.getElementById('r_tbody');
  if(tbody&&(ing_total>0||costo>0)){
    const rows=[
      ...detalle.map(([l,v,ptm])=>[l,v,ptm,true,false]),
      sal>0?['− Castigo salinidad',-sal,0,false,false]:null,
      ['= INGRESO NETO',ing_neta,itm,true,true],
      ...rprovs.filter(p=>p.value>0).map(p=>[p.name,-p.value,tm>0?-p.value/tm:0,false,false]),
      ['Rol tripulación',-rol,tm>0?-rol/tm:0,false,false],
      ['= TOTAL COSTOS',-costo,-ctm,false,true],
      ['MARGEN NETO',margen,tm>0?margen/tm:0,margen>=0,true],
    ].filter(Boolean);
    tbody.innerHTML=rows.map(([lbl,monto,ptm,pos,tot])=>`
      <tr class="${tot?'total-row':''}">
        <td>${eh(String(lbl))}</td>
        <td class="r" style="color:${pos?'#1D9E75':'#D85A30'};font-weight:${tot?700:400}">${monto!==0?fmt(monto):'—'}</td>
        <td class="r" style="color:#888">${ptm!==0?'$'+Math.round(ptm):'—'}</td>
        <td class="r" style="color:#aaa">${(tot&&ing_neta>0)?Math.abs(monto/ing_neta*100).toFixed(0)+'%':''}</td>
      </tr>`).join('');
  }

  setText('r_cdia',dias>0?'$'+Math.round(cdia):'—');
  setText('r_itm',tm>0?'$'+Math.round(itm):'—');
  setText('r_ctm',tm>0?'$'+Math.round(ctm):'—');

  const rb=document.getElementById('r_badge');
  if(rb){
    rb.textContent = (ing_total<=0&&costo<=0) ? '—' : (margen>=0?'GANANCIA':'PÉRDIDA');
    rb.style.color = margen>=0?'#1D9E75':'#D85A30';
  }
  setText('r_badge_sub', tm>0?tm.toFixed(1)+' TM · '+dias+' días':'');
}

// Copia la proyección al cierre real como punto de partida.
function precargarDesdeProyeccion(){
  if(!confirm('Se reemplazarán los datos del cierre real con los de la proyección. ¿Continuar?')) return;
  const cp_=(a,b)=>{const s=document.getElementById(a),d=document.getElementById(b);if(s&&d)d.value=s.value;};
  cp_('p_entrada','r_entrada'); cp_('p_dias','r_dias'); cp_('p_cap','r_cap');
  cp_('p_ancla','r_ancla'); cp_('p_sal','r_sal'); cp_('p_anticipo','r_anticipo');
  cp_('p_credito_prov','r_credito_prov');
  ['yf','skj','rec','ps','bt','do','extra'].forEach(k=>cp_('tm_'+k,'rr_'+k+'_tm'));
  ['rec','ps','bt','do','extra'].forEach(k=>cp_('px_'+k,'rr_'+k+'_px'));
  cp_('nom_extra','rr_nom_extra');
  Object.keys(TALLA_KEYS).forEach(sp=>TALLA_KEYS[sp].forEach(k=>{
    cp_('tmt_'+sp+'_'+k,'rtmt_'+sp+'_'+k);
    cp_('d_'+sp+'_'+k,'rd_'+sp+'_'+k);
  }));
  // Rol proyectado ($/TM) x TM totales
  const rolTM=+document.getElementById('p_rol_tm').value||0;
  const tmTot=['yf','skj','rec','ps','bt','do','extra'].reduce((s,k)=>s+(+document.getElementById('tm_'+k).value||0),0);
  const rEl=document.getElementById('r_rol'); if(rEl) rEl.value=Math.round(rolTM*tmTot);
  rprovs = provs.map(p=>({name:p.name,max:p.max,value:p.value}));
  renderRProvs();
  if(+document.getElementById('tm_extra').value>0){
    const row=document.getElementById('rr_extra_row'); if(row) row.style.display='table-row';
  }
  syncTallaReal('yf'); syncTallaReal('skj');
  sv(); cr();
}

// ── COMPARACIÓN ──
function calcComp(){
  const p=SPROY,r=SREAL;
  const alertEl=document.getElementById('comp_alert');
  const cont=document.getElementById('comp_content');
  if(!p||!r||!p.tm||!r.tm){
    if(alertEl) alertEl.style.display='block';
    if(cont) cont.style.display='none';
    return;
  }
  if(alertEl) alertEl.style.display='none';
  if(cont) cont.style.display='block';

  setDiff('c_tm','c_tm_s',p.tm,r.tm,'TM',true);
  setDiff('c_ing','c_ing_s',p.ing,r.ing,'$',true);
  setDiff('c_costo','c_costo_s',p.costo,r.costo,'$',false);
  setDiff('c_margen','c_margen_s',p.margen,r.margen,'$',true);

  const tbody=document.getElementById('comp_tbody');
  const rows=[
    ['TM capturadas',p.tm.toFixed(1),r.tm.toFixed(1),r.tm-p.tm,'TM',true],
    ['Ingreso total',fmt(p.ing),fmt(r.ing),r.ing-p.ing,'$',true],
    ['Ingreso / TM','$'+Math.round(p.itm),'$'+Math.round(r.itm),r.itm-p.itm,'$/TM',true],
    ['Costo total',fmt(p.costo),fmt(r.costo),p.costo-r.costo,'$',false],
    ['Costo / TM','$'+Math.round(p.ctm),'$'+Math.round(r.ctm),p.ctm-r.ctm,'$/TM',false],
    ['Margen $',fmt(p.margen),fmt(r.margen),r.margen-p.margen,'$',true],
    ['Margen %',p.mpct.toFixed(1)+'%',r.mpct.toFixed(1)+'%',r.mpct-p.mpct,'pp',true],
  ];
  tbody.innerHTML=rows.map(([lbl,pv,rv,diff,unit,posGood])=>{
    const good=posGood?diff>=0:diff<=0;
    const cls=diff!==0?(good?'diff-pos':'diff-neg'):'';
    const sign=diff>0?'+':'';
    const disp=unit==='$'?sign+fmt(diff):sign+(typeof diff==='number'?diff.toFixed(1):diff)+' '+unit;
    return `<tr><td>${lbl}</td><td style="text-align:right;color:#2E75B6;font-weight:600">${pv}</td><td style="text-align:right;font-weight:600">${rv}</td><td class="r ${cls}">${disp}</td></tr>`;
  }).join('');

  buildCompChart(p,r);

  // Varianzas
  const el=document.getElementById('var_txt');
  if(el){
    const tmD=r.tm-p.tm,ingD=r.ing-p.ing,costoD=r.costo-p.costo,mD=r.margen-p.margen;
    el.innerHTML=[
      `<strong>TM:</strong> ${r.tm.toFixed(1)} TM reales vs. ${p.tm.toFixed(1)} estimadas (${tmD>=0?'+':''}${tmD.toFixed(1)} TM). ${tmD>=0?'La pesca superó la proyección.':'Captura por debajo de lo estimado.'}`,
      `<strong>Ingresos:</strong> ${fmt(r.ing)} vs. ${fmt(p.ing)} estimado (${ingD>=0?'+':''} ${fmt(ingD)}). ${Math.abs(ingD)<1000?'Variación menor al margen normal.':ingD>0?'Precios o mix superiores al estimado.':'Precios o mix inferiores al estimado.'}`,
      `<strong>Costos:</strong> ${fmt(r.costo)} vs. ${fmt(p.costo)} estimado (${costoD>=0?'+':''} ${fmt(costoD)}). ${costoD>5000?'Los costos superaron la proyección.':costoD<-5000?'Los costos fueron menores a lo proyectado.':'Costos dentro de lo estimado.'}`,
      `<strong>Margen:</strong> ${fmt(r.margen)} (${r.mpct.toFixed(1)}%) vs. estimado ${fmt(p.margen)} (${p.mpct.toFixed(1)}%). Variación: ${mD>=0?'+':''}${fmt(mD)}.`,
    ].map(l=>`<p style="margin-bottom:8px">${l}</p>`).join('');
  }
}

function setDiff(vId,sId,pv,rv,unit,posGood){
  const diff=rv-pv;
  const pct=pv!==0?diff/Math.abs(pv)*100:0;
  const good=posGood?diff>=0:diff<=0;
  const el=document.getElementById(vId);
  const sub=document.getElementById(sId);
  if(el){el.textContent=unit==='$'?fmt(rv):rv.toFixed(1);el.style.color=good?'#1D9E75':'#D85A30';}
  if(sub){const s=diff>0?'+':'';sub.textContent=(unit==='$'?s+fmt(diff):s+diff.toFixed(1))+' vs proy. ('+pct.toFixed(1)+'%)';}
}

function buildCompChart(p,r){
  if(!window.Chart) return;
  if(chartComp) chartComp.destroy();
  const ctx=document.getElementById('chartComp');
  if(!ctx) return;
  chartComp=new Chart(ctx,{
    type:'bar',
    data:{
      labels:['Ingreso total','Costo total','Margen'],
      datasets:[
        {label:'Proyectado',data:[p.ing,p.costo,p.margen],backgroundColor:'#85B7EB',borderRadius:4},
        {label:'Real',data:[r.ing,r.costo,r.margen],
         backgroundColor:[r.ing>=p.ing?'#1D9E75':'#D85A30',r.costo<=p.costo?'#1D9E75':'#D85A30',r.margen>=p.margen?'#1D9E75':'#D85A30'],
         borderRadius:4}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'$'+Math.round(c.parsed.y).toLocaleString()}}},
      scales:{
        x:{ticks:{color:'#888',font:{size:11}},grid:{color:'rgba(0,0,0,0.04)'}},
        y:{ticks:{color:'#888',font:{size:11},callback:v=>'$'+(v/1000).toFixed(0)+'K'},grid:{color:'rgba(0,0,0,0.04)'}}
      }
    }
  });
  const leg=document.createElement('div');
  leg.style.cssText='display:flex;gap:16px;font-size:12px;color:#888;margin-top:8px;justify-content:center';
  leg.innerHTML=`<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:#85B7EB;display:inline-block"></span>Proyectado</span><span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:#1D9E75;display:inline-block"></span>Favorable</span><span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:#D85A30;display:inline-block"></span>Desfavorable</span>`;
  leg.className='comp-legend';
  const card=ctx.parentElement.parentElement;
  const ex=card.querySelector('.comp-legend');
  if(ex) ex.remove();
  card.appendChild(leg);
}

// ── NAV ──
function showScreen(name,btn){
  document.querySelectorAll('.simulador-wrap .sim-screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.simulador-wrap .ntab').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  btn.classList.add('active');
  if(name==='comp') calcComp();
  if(name==='auditoria') calcAuditoria();
  if(name==='sim'){ SIMULADOR.calcSim(); SIMULADOR.renderInv(); SIMULADOR.renderRepo(); }
}

// ── INVENTARIO ──
// Cada ítem: {name, unidad, salida, xdia, costo_unit}
function defaultInvItems(){ return [
  {name:'Víveres',unidad:'rac',salida:0,xdia:0,costo_unit:0},
  {name:'Agua potable',unidad:'lt',salida:0,xdia:0,costo_unit:0},
  {name:'Carnada',unidad:'kg',salida:0,xdia:0,costo_unit:0},
  {name:'Sal',unidad:'sac',salida:0,xdia:0,costo_unit:0},
  {name:'Aceite motor',unidad:'lt',salida:0,xdia:0,costo_unit:0},
  {name:'Hielo',unidad:'TM',salida:0,xdia:0,costo_unit:0},
]; }
let invItems=defaultInvItems();

function renderInv(){
  const dias=+document.getElementById('sim_dias').value||0;
  const c=document.getElementById('inv_container');
  if(!c) return;

  // Full render only when item count changed or first load
  const existing=c.querySelectorAll('.inv-row').length;
  if(existing!==invItems.length){
    SIMULADOR.renderInvFull(dias, c);
  } else {
    SIMULADOR.updateInvCalc(dias, c);
  }

  const pill=document.getElementById('inv_pill');
  if(pill) pill.textContent=invItems.filter(it=>it.salida>0).length+' ítems';
}

function renderInvFull(dias, c){
  c.innerHTML=invItems.map((it,i)=>`
    <div class="inv-row" data-idx="${i}">
      <input type="text" value="${eh(it.name)}" placeholder="Nombre del ítem"
        oninput="SIMULADOR.invItems[${i}].name=this.value;SIMULADOR.sv()">
      <input type="text" value="${eh(it.unidad)}" placeholder="u"
        oninput="SIMULADOR.invItems[${i}].unidad=this.value;SIMULADOR.sv()" style="text-align:center">
      <input type="number" value="${it.salida||''}" placeholder="0" min="0" step="1"
        oninput="SIMULADOR.invItems[${i}].salida=+this.value;SIMULADOR.sv();SIMULADOR.updateInvCalc(+document.getElementById('sim_dias').value||0,document.getElementById('inv_container'));SIMULADOR.calcSim()">
      <input type="number" value="${it.xdia||''}" placeholder="0" min="0" step="0.1"
        oninput="SIMULADOR.invItems[${i}].xdia=+this.value;SIMULADOR.sv();SIMULADOR.updateInvCalc(+document.getElementById('sim_dias').value||0,document.getElementById('inv_container'));SIMULADOR.calcSim()">
      <input type="number" value="${it.costo_unit||''}" placeholder="0" min="0" step="0.01"
        oninput="SIMULADOR.invItems[${i}].costo_unit=+this.value;SIMULADOR.sv();SIMULADOR.updateInvCalc(+document.getElementById('sim_dias').value||0,document.getElementById('inv_container'));SIMULADOR.calcSim()">
      <div class="inv-cons" id="inv_cons_${i}">—</div>
      <div class="inv-rem ok" id="inv_rem_${i}" style="display:flex;flex-direction:column;align-items:flex-end">—</div>
      <button onclick="SIMULADOR.invItems.splice(${i},1);SIMULADOR.renderInvFull(+document.getElementById('sim_dias').value||0,document.getElementById('inv_container'));SIMULADOR.renderInv();SIMULADOR.sv()" style="font-size:15px;color:#ccc;background:none;border:none;cursor:pointer;padding:0">×</button>
    </div>`).join('');
  SIMULADOR.updateInvCalc(dias, c);
}

function updateInvCalc(dias, c){
  let totSalidaVal=0, totConsVal=0, totRemVal=0;

  invItems.forEach((it,i)=>{
    const cons    = Math.min(it.salida, it.xdia*dias);
    const rem     = Math.max(0, it.salida - cons);
    const agotado = it.salida>0 && it.xdia*dias > it.salida;
    const pctCons = it.salida>0 ? cons/it.salida*100 : 0;
    const pctRem  = it.salida>0 ? rem/it.salida*100  : 0;
    const valCons = cons * it.costo_unit;
    const valRem  = rem  * it.costo_unit;
    totSalidaVal += it.salida * it.costo_unit;
    totConsVal   += valCons;
    totRemVal    += valRem;

    const remClass = agotado ? 'crit' : pctRem<20&&it.salida>0 ? 'warn' : 'ok';
    const consDisp = it.salida>0 ? `${cons.toFixed(1)} (${pctCons.toFixed(0)}%)` : '—';
    const consValDisp = valCons>0 ? fmt(valCons) : '';
    const remDisp = it.salida>0 ? (agotado ? 'AGOT.' : `${rem.toFixed(1)} (${pctRem.toFixed(0)}%)`) : '—';
    const remValDisp = valRem>0 ? fmt(valRem) : '';

    const consEl=document.getElementById('inv_cons_'+i);
    if(consEl) consEl.innerHTML=`<div>${consDisp}</div><div style="font-size:10px;color:#BA7517;margin-top:1px">${consValDisp}</div>`;

    const remEl=document.getElementById('inv_rem_'+i);
    if(remEl){
      remEl.className=`inv-rem ${remClass}`;
      remEl.style.cssText='display:flex;flex-direction:column;align-items:flex-end';
      remEl.innerHTML=`<div>${remDisp}</div><div style="font-size:10px;opacity:.75;margin-top:1px">${remValDisp}</div>`;
    }
  });

  renderInvResumen(dias, totSalidaVal, totConsVal, totRemVal);
  renderInvStatus(dias);
}

function renderInvResumen(dias, totSalida, totCons, totRem){
  const c=document.getElementById('inv_resumen_container');
  if(!c) return;
  const items=invItems.filter(it=>it.salida>0 && it.costo_unit>0);
  if(!items.length||!dias){
    c.innerHTML='<p style="color:#bbb;font-size:12px">Ingresa el inventario con costos unitarios y los días del escenario</p>';
    return;
  }
  const pctCons = totSalida>0 ? totCons/totSalida*100 : 0;
  const pctRem  = totSalida>0 ? totRem/totSalida*100  : 0;

  // Progress bar
  const barCons = totSalida>0 ? (totCons/totSalida*100).toFixed(1) : 0;
  const barRem  = totSalida>0 ? (totRem/totSalida*100).toFixed(1)  : 0;

  c.innerHTML=`
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#666;margin-bottom:4px">
        <span>Valor de salida total</span><strong>${fmt(totSalida)}</strong>
      </div>
      <div style="height:14px;background:#f0ece6;border-radius:7px;overflow:hidden;display:flex">
        <div style="width:${barCons}%;background:#D85A30;border-radius:7px 0 0 7px"></div>
        <div style="width:${barRem}%;background:#1D9E75"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:3px">
        <span style="color:#D85A30">■ Consumido ${pctCons.toFixed(0)}%</span>
        <span style="color:#1D9E75">■ Remanente ${pctRem.toFixed(0)}%</span>
      </div>
    </div>
    <table class="data-table" style="font-size:12px">
      <thead><tr>
        <th>Ítem</th>
        <th class="r" style="color:#D85A30">Consumido</th>
        <th class="r" style="color:#D85A30">% salida</th>
        <th class="r" style="color:#1D9E75">Remanente $</th>
        <th class="r" style="color:#1D9E75">% salida</th>
      </tr></thead>
      <tbody>
        ${items.map(it=>{
          const cons=Math.min(it.salida,it.xdia*dias);
          const rem=Math.max(0,it.salida-cons);
          const vCons=cons*it.costo_unit;
          const vRem=rem*it.costo_unit;
          const pC=it.salida>0?cons/it.salida*100:0;
          const pR=it.salida>0?rem/it.salida*100:0;
          return `<tr>
            <td>${eh(it.name)}</td>
            <td class="r" style="color:#D85A30">${fmt(vCons)}</td>
            <td class="r" style="color:#D85A30">${pC.toFixed(0)}%</td>
            <td class="r" style="color:#1D9E75">${fmt(vRem)}</td>
            <td class="r" style="color:#1D9E75">${pR.toFixed(0)}%</td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td>TOTAL</td>
          <td class="r" style="color:#D85A30">${fmt(totCons)}</td>
          <td class="r" style="color:#D85A30">${pctCons.toFixed(0)}%</td>
          <td class="r" style="color:#1D9E75">${fmt(totRem)}</td>
          <td class="r" style="color:#1D9E75">${pctRem.toFixed(0)}%</td>
        </tr>
      </tfoot>
    </table>
    <div style="font-size:11px;color:#666;margin-top:8px;padding:8px 10px;background:#f8f6f2;border-radius:6px">
      El remanente <strong style="color:#1D9E75">${fmt(totRem)}</strong> no es pérdida — es capital que regresa con el barco para la próxima salida. 
      El costo real del viaje solo incluye lo consumido: <strong style="color:#D85A30">${fmt(totCons)}</strong>.
    </div>`;
}

function getInvRemanenteValor(){
  const dias=+document.getElementById('sim_dias').value||0;
  return invItems.reduce((s,it)=>{
    const rem=Math.max(0,it.salida-(it.xdia*dias));
    return s+rem*it.costo_unit;
  },0);
}

function getInvSalidaValor(){
  return invItems.reduce((s,it)=>s+it.salida*it.costo_unit,0);
}

function renderInvStatus(dias){
  const c=document.getElementById('inv_status_container');
  if(!c) return;
  const items=invItems.filter(it=>it.salida>0);
  if(!items.length||!dias){c.innerHTML='<p style="color:#bbb;font-size:12px">Ingresa el inventario y los días del escenario para ver el estado</p>';return;}
  c.innerHTML=items.map(it=>{
    const cons=Math.min(it.salida,it.xdia*dias);
    const rem=Math.max(0,it.salida-cons);
    const pct=it.salida>0?rem/it.salida:1;
    const agotado=it.xdia*dias>it.salida;
    const cls=agotado?'crit':pct<0.2?'warn':'ok';
    const label=agotado?'Sin stock — se agota antes de llegar':pct<0.2?'Crítico — menos del 20% restante':'OK — stock suficiente';
    const remVal=rem*it.costo_unit;
    return `<div class="sem-item ${cls}">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="sem-dot ${cls}"></span>
        <div>
          <div style="font-weight:600">${eh(it.name)}</div>
          <div style="font-size:10px;color:#888">${rem.toFixed(1)} ${it.unidad} remanentes (${(pct*100).toFixed(0)}%)</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;font-weight:700;color:${cls==='ok'?'#1D9E75':cls==='warn'?'#BA7517':'#D85A30'}">${remVal>0?fmt(remVal):'—'}</div>
        <div style="font-size:10px;color:#888">${label}</div>
      </div>
    </div>`;
  }).join('');
}

function addInvItem(){
  invItems.push({name:'Nuevo ítem',unidad:'u',salida:0,xdia:0,costo_unit:0});
  const c=document.getElementById('inv_container');
  if(c) SIMULADOR.renderInvFull(+document.getElementById('sim_dias').value||0, c);
  SIMULADOR.renderInv();
  SIMULADOR.sv();
}

// ── REPOSICIÓN PRÓXIMA SALIDA ──
function defaultRepoItems(){ return [ {name:'',monto:0} ]; }
let repoItems=defaultRepoItems();

function renderRepo(){
  const c=document.getElementById('repo_container');
  if(!c) return;
  c.innerHTML=repoItems.map((it,i)=>`
    <div style="display:grid;grid-template-columns:1fr 110px 20px;gap:6px;align-items:center;margin-bottom:6px">
      <input type="text" value="${eh(it.name)}" placeholder="Ítem a reponer (ej. Víveres)"
        style="border:1.5px solid #e0ddd8;border-radius:5px;padding:6px 8px;font-size:12px;font-family:inherit;outline:none;background:#fafaf8;transition:.2s;width:100%"
        oninput="SIMULADOR.repoItems[${i}].name=this.value;SIMULADOR.sv()">
      <input type="number" value="${it.monto||''}" placeholder="$0" min="0" step="100"
        style="border:1.5px solid #e0ddd8;border-radius:5px;padding:6px 8px;font-size:12px;font-family:inherit;outline:none;background:#fafaf8;transition:.2s;text-align:right;width:100%"
        oninput="SIMULADOR.repoItems[${i}].monto=+this.value;SIMULADOR.sv();SIMULADOR.calcRepo()">
      <button onclick="SIMULADOR.repoItems.splice(${i},1);SIMULADOR.renderRepo();SIMULADOR.calcRepo();SIMULADOR.sv()" style="font-size:15px;color:#ccc;background:none;border:none;cursor:pointer;padding:0">×</button>
    </div>`).join('');
}

function addRepoItem(){
  repoItems.push({name:'',monto:0});
  SIMULADOR.renderRepo();SIMULADOR.sv();
}

function calcRepo(){
  const repoTotal  = repoItems.reduce((s,it)=>s+it.monto,0);
  const avitAnterior = getTotalProv();   // costo avituallamiento salida anterior (referencia)
  const invRem     = getInvRemanenteValor(); // regresa con el barco = ya está pagado
  // Próxima salida: el remanente cubre parte del avituallamiento, reposición cubre el resto comprado
  const costoProx  = avitAnterior - invRem + repoTotal; // ref − ahorro + compra nueva
  const ahorro     = avitAnterior - costoProx;           // diferencia real vs salida anterior

  // Avituallamiento base = remanente (capital que no hay que desembolsar)
  const remEl = document.getElementById('sim_repo_avit');
  if(remEl){ remEl.textContent = invRem>0 ? fmt(invRem) : '$0'; remEl.style.color = invRem>0?'#1D9E75':'#aaa'; }

  setText('sim_repo_total', repoTotal>0 ? fmt(repoTotal) : '$0');

  const aEl = document.getElementById('sim_repo_ahorro');
  if(aEl){
    aEl.textContent = fmt(Math.abs(ahorro));
    aEl.style.color = ahorro>=0 ? '#1D9E75' : '#D85A30';
  }

  const cpEl = document.getElementById('sim_repo_costo_prox');
  if(cpEl){
    cpEl.textContent = fmt(Math.max(0, costoProx));
    cpEl.style.color = costoProx < avitAnterior ? '#1D9E75' : '#D85A30';
  }

  // Actualizar subtítulos
  const refEl = document.getElementById('sim_repo_ref');
  if(refEl) refEl.textContent = 'ref. salida anterior: '+fmt(avitAnterior);
}

// ── SIMULACIÓN DE ESCENARIO ──
function calcSim(){
  const dias   =+document.getElementById('sim_dias').value||0;
  const tm_yf  =+document.getElementById('sim_tm_yf').value||0;
  const tm_skj =+document.getElementById('sim_tm_skj').value||0;
  const tm_rec =+document.getElementById('sim_tm_rec').value||0;
  const tm_com =+document.getElementById('sim_tm_com').value||0;
  const px_com =+document.getElementById('sim_px_com').value||0;
  const tm_total=tm_yf+tm_skj+tm_rec+tm_com;
  setText('sim_tm_total_disp', tm_total.toFixed(1)+' TM');

  // Precios del escenario — anclados a proyección
  const ancla  =+document.getElementById('p_ancla').value||0;
  const px_yf  =ancla+yfDiff();
  const px_skj =ancla+skjDiff();
  const px_rec =+document.getElementById('px_rec').value||0;

  // Precio promedio ponderado YF+SKJ
  const tm_yfskj=tm_yf+tm_skj;
  const px_prom_yfskj=tm_yfskj>0?(tm_yf*px_yf+tm_skj*px_skj)/tm_yfskj:0;

  // Mostrar precios en panel de escenario
  setText('sim_ancla_disp', ancla>0?'$'+Math.round(ancla)+'/TM':'No ingresado');
  setText('sim_px_yf_disp', px_yf>0?'$'+Math.round(px_yf)+'/TM':'—');
  setText('sim_px_skj_disp', px_skj>0?'$'+Math.round(px_skj)+'/TM':'—');
  setText('sim_px_prom_disp', px_prom_yfskj>0?'$'+Math.round(px_prom_yfskj)+'/TM':'—');

  const ing_yf   =tm_yf*px_yf;
  const ing_skj  =tm_skj*px_skj;
  const ing_rec  =tm_rec*px_rec;
  const ing_com  =tm_com*px_com;
  const ing_bruto=ing_yf+ing_skj+ing_rec+ing_com;

  // SAL castigo al ingreso — tomado de proyección
  const sal=+document.getElementById('p_sal').value||0;
  const ing_total=ing_bruto-sal;

  // COSTO ANCLADO A PROYECCIÓN PRE-ZARPE
  const rolTM=+document.getElementById('p_rol_tm').value||0;
  const prov =getTotalProv();   // igual que proyección
  const rol  =tm_total*rolTM;
  const costo=prov+rol;

  // Inventario a bordo
  const invSalida   =getInvSalidaValor();
  const invRem      =getInvRemanenteValor();
  const invConsumido=invSalida-invRem;
  const costoEfectivo  =costo-invRem;
  const margen         =ing_total-costo;
  const margenEfectivo =ing_total-costoEfectivo;
  const mpct           =ing_total>0?margen/ing_total*100:0;

  // Resultado card — 4 KPIs
  const mEl=document.getElementById('sim_margen');
  if(mEl){mEl.textContent=ing_total>0||ing_bruto>0?fmt(margenEfectivo):'—';mEl.style.color=margenEfectivo>=0?'#1D9E75':'#D85A30';}
  setText('sim_ing', ing_total>0||ing_bruto>0?fmt(ing_total):'—');
  setText('sim_ing_sub', sal>0?'Bruto '+fmt(ing_bruto)+' − sal '+fmt(sal)
    :(tm_total>0?'$'+Math.round(ing_total/tm_total)+'/TM promedio':''));
  setText('sim_costo', fmt(costoEfectivo));   // costo real = avit + rol - remanente
  setText('sim_margen_sub', ing_total>0?margenEfectivo>=0
    ?mpct.toFixed(1)+'% sobre ingresos netos'
    :'Viaje con pérdida':'');

  // KPI Remanente inventario
  const remEl=document.getElementById('sim_inv_rem_kpi');
  if(remEl){remEl.textContent=invRem>0?fmt(invRem):'$0';remEl.style.color=invRem>0?'#185FA5':'#aaa';}

  // Calcular reposición
  SIMULADOR.calcRepo();

  // Detalle inventario (pequeño, debajo de los KPIs)
  const simInvBox=document.getElementById('sim_inv_detalle');
  if(simInvBox){
    simInvBox.innerHTML=invSalida>0
      ?`<div style="margin-top:12px;padding-top:12px;border-top:1px dashed #e0ddd8;font-size:11px;color:#666;display:flex;justify-content:space-between;align-items:center;gap:12px">
          <span>Inventario de salida: <strong>${fmt(invSalida)}</strong></span>
          <span>Consumido: <strong style="color:#D85A30">${fmt(invConsumido)}</strong></span>
          <span>Remanente: <strong style="color:#1D9E75">${fmt(invRem)}</strong></span>
        </div>`
      :'';
  }

  // Comparativo vs proyección
  const p=SPROY;
  const tbody=document.getElementById('sim_comp_tbody');
  if(tbody&&p&&p.tm>0&&tm_total>0){
    const rows=[
      ['Días en el mar', p.dias>0?p.dias+' días':'—', dias+' días', dias-p.dias,'días',false],
      ['TM capturadas', p.tm.toFixed(1), tm_total.toFixed(1), tm_total-p.tm,'TM',true],
      ['Ingreso total', fmt(p.ing), fmt(ing_total), ing_total-p.ing,'$',true],
      ['Precio prom. YF', '—', px_yf>0?'$'+Math.round(px_yf):' —', 0,'',false],
      ['Precio prom. SKJ', '—', px_skj>0?'$'+Math.round(px_skj):'—', 0,'',false],
      ['Precio prom. YF+SKJ', '—', px_prom_yfskj>0?'$'+Math.round(px_prom_yfskj):'—', 0,'',false],
      ['Costo avituallamiento', fmt(p.costo), fmt(prov), prov-p.costo,'$',false],
      ['Rol tripulación', '—', fmt(rol), 0,'',false],
      ['Margen $', fmt(p.margen), fmt(margen), margen-p.margen,'$',true],
      ['Margen %', p.mpct.toFixed(1)+'%', mpct.toFixed(1)+'%', mpct-p.mpct,'pp',true],
    ];
    tbody.innerHTML=rows.map(([lbl,pv,sv,diff,unit,posGood])=>{
      const skip=unit==='';
      const good=posGood?diff>=0:diff<=0;
      const cls=(!skip&&diff!==0)?(good?'diff-pos':'diff-neg'):'';
      const sign=diff>0?'+':'';
      const disp=skip?'':unit==='$'?sign+fmt(diff):sign+(typeof diff==='number'?diff.toFixed(1):diff)+' '+unit;
      return `<tr><td>${lbl}</td><td style="text-align:right;color:#2E75B6;font-weight:600">${pv}</td><td style="text-align:right;font-weight:600">${sv}</td><td class="r ${cls}">${disp}</td></tr>`;
    }).join('');
  } else if(tbody&&(!p||!p.tm)){
    tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:#bbb;padding:12px">Ingresa primero la Proyección pre-zarpe</td></tr>';
  }

  // Actualizar inventario sin destruir inputs
  const c2=document.getElementById('inv_container');
  if(c2) SIMULADOR.updateInvCalc(dias,c2);
}
// ── AUDITORÍA ──
function calcAuditoria(){
  const ancla =+document.getElementById('p_ancla').value||0;
  const tm_yf =+document.getElementById('tm_yf').value||0;
  const tm_skj=+document.getElementById('tm_skj').value||0;
  const tm_rec=+document.getElementById('tm_rec').value||0;
  const tm_ps =+document.getElementById('tm_ps').value||0;
  const tm_bt =+document.getElementById('tm_bt').value||0;
  const tm_do =+document.getElementById('tm_do').value||0;
  const tm_extra=+document.getElementById('tm_extra').value||0;
  const px_rec=+document.getElementById('px_rec').value||0;
  const px_ps =+document.getElementById('px_ps').value||0;
  const px_bt =+document.getElementById('px_bt').value||0;
  const px_do =+document.getElementById('px_do').value||0;
  const px_extra=+document.getElementById('px_extra').value||0;
  const nom_extra=document.getElementById('nom_extra')?.value||'Otro';
  const tm_total=tm_yf+tm_skj+tm_rec+tm_ps+tm_bt+tm_do+tm_extra;

  const rolTM =+document.getElementById('p_rol_tm').value||0;
  const sal   =+document.getElementById('p_sal').value||0;
  const ant   =+document.getElementById('p_anticipo').value||0;

  setText('aud_ancla', ancla>0?'$'+ancla+'/TM':'no ingresado');

  // YF tallas — leer diferenciales editables
  const yfTallas=[
    {label:'> 20 kg',   diff:+document.getElementById('d_yf_g').value||200,  pct:+document.getElementById('tl_yf_g').value/100},
    {label:'7.5–20 kg', diff:+document.getElementById('d_yf_m').value||150,  pct:+document.getElementById('tl_yf_m').value/100},
    {label:'4–7.5 kg',  diff:+document.getElementById('d_yf_b').value||0,    pct:+document.getElementById('tl_yf_b').value/100},
    {label:'3–4 kg',    diff:+document.getElementById('d_yf_ch').value||-200, pct:+document.getElementById('tl_yf_ch').value/100},
    {label:'< 3 kg',    diff:+document.getElementById('d_yf_xs').value||-400, pct:+document.getElementById('tl_yf_xs').value/100},
  ];
  const yfSum=yfTallas.reduce((s,t)=>s+t.pct,0);
  let ing_yf_total=0;
  const yfTbody=document.getElementById('aud_yf_tbody');
  if(yfTbody){
    let rows='';
    yfTallas.forEach(t=>{
      const pxEf=ancla+t.diff;
      const tmTalla=tm_yf*(yfSum>0?t.pct/yfSum:0);
      const ing=tmTalla*pxEf;
      ing_yf_total+=ing;
      const diffStr=t.diff>0?'+$'+t.diff:t.diff<0?'−$'+Math.abs(t.diff):'$0 (ancla)';
      const diffColor=t.diff>0?'#1D9E75':t.diff<0?'#D85A30':'#888';
      rows+=`<tr>
        <td>${t.label}</td>
        <td class="r" style="color:${diffColor};font-weight:600">${diffStr}</td>
        <td class="r"><strong>$${Math.round(pxEf)}</strong><span style="color:#aaa;font-size:10px"> = $${ancla}${t.diff>=0?'+':''}${t.diff}</span></td>
        <td class="r">${yfSum>0?(t.pct/yfSum*100).toFixed(0):'0'}%</td>
        <td class="r">${tmTalla.toFixed(2)} TM</td>
        <td class="r" style="color:#1D9E75;font-weight:600">${ing>0?fmt(ing):'—'}</td>
      </tr>`;
    });
    rows+=`<tr class="total-row"><td colspan="4">Total YF (${tm_yf} TM)</td><td class="r">${tm_yf} TM</td><td class="r" style="color:#1D9E75">${fmt(ing_yf_total)}</td></tr>`;
    yfTbody.innerHTML=rows;
  }

  // SKJ tallas — leer diferenciales editables
  const skjTallas=[
    {label:'> 7.5 kg',  diff:+document.getElementById('d_skj_g').value||50,   pct:+document.getElementById('tl_skj_g').value/100},
    {label:'4–7.5 kg',  diff:+document.getElementById('d_skj_b').value||0,    pct:+document.getElementById('tl_skj_b').value/100},
    {label:'3–4 kg',    diff:+document.getElementById('d_skj_ch').value||-200, pct:+document.getElementById('tl_skj_ch').value/100},
    {label:'< 3 kg',    diff:+document.getElementById('d_skj_xs').value||-400, pct:+document.getElementById('tl_skj_xs').value/100},
  ];
  const skjSum=skjTallas.reduce((s,t)=>s+t.pct,0);
  let ing_skj_total=0;
  const skjTbody=document.getElementById('aud_skj_tbody');
  if(skjTbody){
    let rows='';
    skjTallas.forEach(t=>{
      const pxEf=ancla+t.diff;
      const tmTalla=tm_skj*(skjSum>0?t.pct/skjSum:0);
      const ing=tmTalla*pxEf;
      ing_skj_total+=ing;
      const diffStr=t.diff>0?'+$'+t.diff:t.diff<0?'−$'+Math.abs(t.diff):'$0 (ancla)';
      const diffColor=t.diff>0?'#1D9E75':t.diff<0?'#D85A30':'#888';
      rows+=`<tr>
        <td>${t.label}</td>
        <td class="r" style="color:${diffColor};font-weight:600">${diffStr}</td>
        <td class="r"><strong>$${Math.round(pxEf)}</strong><span style="color:#aaa;font-size:10px"> = $${ancla}${t.diff>=0?'+':''}${t.diff}</span></td>
        <td class="r">${skjSum>0?(t.pct/skjSum*100).toFixed(0):'0'}%</td>
        <td class="r">${tmTalla.toFixed(2)} TM</td>
        <td class="r" style="color:#1D9E75;font-weight:600">${ing>0?fmt(ing):'—'}</td>
      </tr>`;
    });
    rows+=`<tr class="total-row"><td colspan="4">Total SKJ (${tm_skj} TM)</td><td class="r">${tm_skj} TM</td><td class="r" style="color:#1D9E75">${fmt(ing_skj_total)}</td></tr>`;
    skjTbody.innerHTML=rows;
  }

  // Comercio
  const comSpec=[
    {label:'Rechazo',tm:tm_rec,px:px_rec},
    {label:'Pata seca',tm:tm_ps,px:px_ps},
    {label:'Botella',tm:tm_bt,px:px_bt},
    {label:'Dorado',tm:tm_do,px:px_do},
    {label:nom_extra,tm:tm_extra,px:px_extra},
  ].filter(c=>c.tm>0);
  const ing_com=comSpec.reduce((s,c)=>s+c.tm*c.px,0);
  const comTbody=document.getElementById('aud_com_tbody');
  if(comTbody){
    comTbody.innerHTML=comSpec.length>0
      ? comSpec.map(c=>`<tr><td>${c.label}</td><td class="r">${c.tm} TM</td><td class="r">$${c.px}/TM</td><td class="r" style="color:#1D9E75;font-weight:600">${fmt(c.tm*c.px)}</td></tr>`).join('')+
        `<tr class="total-row"><td colspan="3">Total comercio</td><td class="r" style="color:#1D9E75">${fmt(ing_com)}</td></tr>`
      : '<tr><td colspan="4" style="color:#bbb;text-align:center;padding:10px">Sin pesca de comercio ingresada</td></tr>';
  }

  const ing_total=ing_yf_total+ing_skj_total+ing_com;
  setText('aud_ing_total', fmt(ing_total));

  // Costos
  const prov=getTotalProv();
  const rol =tm_total*rolTM;
  const costo=prov+rol+sal;
  const ctm=tm_total>0?costo/tm_total:0;

  const costoTbody=document.getElementById('aud_costo_tbody');
  if(costoTbody){
    const rows=[
      ...provs.filter(p=>p.value>0).map(p=>[p.name,'Avituallamiento / trabajos',p.value,tm_total>0?p.value/tm_total:0]),
      ['Rol tripulación',`${tm_total.toFixed(1)} TM × $${rolTM}/TM`,rol,tm_total>0?rol/tm_total:0],
      ['Castigos salinidad','Estimado',sal,0],
    ].filter(r=>r[2]>0);
    costoTbody.innerHTML=rows.map(([lbl,det,monto,ptm])=>`
      <tr>
        <td>${lbl}</td>
        <td class="r" style="color:#aaa;font-size:11px">${det}</td>
        <td class="r" style="color:#D85A30;font-weight:600">${fmt(monto)}</td>
        <td class="r" style="color:#888">${ptm>0?'$'+Math.round(ptm)+'/TM':'—'}</td>
      </tr>`).join('');
  }
  setText('aud_costo_total', fmt(costo));

  // Rol tripulación detalle
  const rolTbody=document.getElementById('aud_rol_tbody');
  if(rolTbody){
    rolTbody.innerHTML=[
      ['TM totales capturadas (estimadas)', tm_total.toFixed(1)+' TM'],
      ['Tarifa rol por TM', '$'+rolTM+'/TM'],
      ['TM YF', tm_yf.toFixed(1)+' TM  →  '+fmt(tm_yf*rolTM)],
      ['TM SKJ', tm_skj.toFixed(1)+' TM  →  '+fmt(tm_skj*rolTM)],
      ['TM Rechazo', tm_rec.toFixed(1)+' TM  →  '+fmt(tm_rec*rolTM)],
      ['TM Comercio (ps+bt+do+otro)', (tm_ps+tm_bt+tm_do+tm_extra).toFixed(1)+' TM  →  '+fmt((tm_ps+tm_bt+tm_do+tm_extra)*rolTM)],
      ['Rol total', fmt(rol)],
      ['Rol / TM capturada', tm_total>0?'$'+Math.round(rol/tm_total)+'/TM':'—'],
      ['Anticipos zarpe + saldo anterior', fmt(ant)+' (flujo de caja — no es costo P&L)'],
    ].map(([k,v])=>`<tr><td style="color:#555">${k}</td><td class="r" style="font-weight:600">${v}</td></tr>`).join('');
  }
  setText('aud_rol_total', fmt(rol));

  // Verificación
  const margen=ing_total-costo;
  const verTbody=document.getElementById('aud_verify_tbody');
  if(verTbody){
    verTbody.innerHTML=[
      ['Ingreso YF (por tallas)', fmt(ing_yf_total),'#2E75B6'],
      ['Ingreso SKJ (por tallas)', fmt(ing_skj_total),'#1D9E75'],
      ['Ingreso comercio y otros', fmt(ing_com),'#534AB7'],
      ['= TOTAL INGRESOS', fmt(ing_total),'#1D9E75'],
      ['Avituallamiento y trabajos', '('+fmt(prov)+')','#D85A30'],
      ['Rol tripulación', '('+fmt(rol)+')','#D85A30'],
      ['Castigos salinidad', sal>0?'('+fmt(sal)+')':'—','#D85A30'],
      ['= TOTAL COSTOS', '('+fmt(costo)+')','#D85A30'],
      ['MARGEN NETO', fmt(margen), margen>=0?'#1D9E75':'#D85A30'],
      ['Margen %', ing_total>0?(margen/ing_total*100).toFixed(2)+'%':'—', margen>=0?'#1D9E75':'#D85A30'],
    ].map(([k,v,color])=>`<tr><td style="color:#555${k.startsWith('=')||k==='MARGEN NETO'?';font-weight:700':''}">${k}</td><td class="r" style="color:${color};font-weight:${k.startsWith('=')||k==='MARGEN NETO'?700:400}">${v}</td></tr>`).join('');
  }
}

// ── PERSIST ──
const INPUT_IDS=[
  'p_entrada','p_dias','p_cap','p_ancla','p_rol_tm','p_sal','p_anticipo','p_credito_prov',
  'tm_yf','tm_skj','tm_rec','px_rec','tm_ps','px_ps','tm_bt','px_bt','tm_do','px_do',
  'tm_extra','px_extra','nom_extra',
  'tmt_yf_g','tmt_yf_m','tmt_yf_b','tmt_yf_ch','tmt_yf_xs',
  'tl_yf_g','tl_yf_m','tl_yf_b','tl_yf_ch','tl_yf_xs',
  'd_yf_g','d_yf_m','d_yf_b','d_yf_ch','d_yf_xs',
  'tmt_skj_g','tmt_skj_b','tmt_skj_ch','tmt_skj_xs',
  'tl_skj_g','tl_skj_b','tl_skj_ch','tl_skj_xs',
  'd_skj_g','d_skj_b','d_skj_ch','d_skj_xs',
  'r_entrada','r_dias','r_cap','r_ancla','r_rol','r_sal','r_anticipo','r_credito_prov',
  'rtmt_yf_g','rtmt_yf_m','rtmt_yf_b','rtmt_yf_ch','rtmt_yf_xs',
  'rd_yf_g','rd_yf_m','rd_yf_b','rd_yf_ch','rd_yf_xs',
  'rtmt_skj_g','rtmt_skj_b','rtmt_skj_ch','rtmt_skj_xs',
  'rd_skj_g','rd_skj_b','rd_skj_ch','rd_skj_xs',
  'rr_yf_tm','rr_yf_px','rr_skj_tm','rr_skj_px',
  'rr_rec_tm','rr_rec_px','rr_ps_tm','rr_ps_px','rr_bt_tm','rr_bt_px',
  'rr_do_tm','rr_do_px','rr_extra_tm','rr_extra_px','rr_nom_extra',
  'sim_dias','sim_tm_yf','sim_tm_skj','sim_tm_rec','sim_tm_com','sim_px_com',
];

// ── FIREBASE SYNC ──
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
  authDomain: "atuntro-portal.firebaseapp.com",
  databaseURL: "https://atuntro-portal-default-rtdb.firebaseio.com",
  projectId: "atuntro-portal",
  storageBucket: "atuntro-portal.firebasestorage.app",
  messagingSenderId: "390090673795",
  appId: "1:390090673795:web:e01a5d03e5543c8dc415b6"
};
let FB_PATH = FB_PATH_FOR('fatima');   // se recalcula al cambiar de barco

function _getDb(){
  try{
    if(typeof firebase === 'undefined') return null;
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    return firebase.database();
  }catch(e){ return null; }
}

let isTyping = false;
let typingTimeout = null;
let saveDebounce = null;
let lastRemoteJSON = null;
let _fbHandler = null;

function markTyping(){
  isTyping = true;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(()=>{ isTyping = false; }, 600);
}

function sv(){
  markTyping();
  const vals={};
  INPUT_IDS.forEach(id=>{const el=document.getElementById(id);if(el) vals[id]=el.value;});
  const payload = {vals, provs, rprovs, invItems, repoItems, updatedAt: Date.now()};
  const json = JSON.stringify(payload);
  try{ localStorage.setItem(SK, json); }catch(e){}
  if(json === lastRemoteJSON) return; // nada cambio, evita loop con el listener remoto
  flashSave();
  clearTimeout(saveDebounce);
  saveDebounce = setTimeout(()=>{
    lastRemoteJSON = json;
    const db = _getDb();
    if(db){ db.ref(FB_PATH).set(payload).catch(()=>{}); }
  }, 600);
}

function applyRemoteData(data){
  if(!data) return;
  const {vals, provs:ps, rprovs:rps, invItems:iv, repoItems:ri} = data;
  if(vals) Object.entries(vals).forEach(([id,v])=>{
    const el=document.getElementById(id);
    if(el && document.activeElement!==el) el.value=v;
  });
  if(ps && ps.length) provs = ps;
  if(rps && rps.length) rprovs = rps;
  if(iv && iv.length) invItems = iv;
  if(ri && ri.length) repoItems = ri;
}

function load(){
  // fallback local mientras carga Firebase
  try{
    const raw=localStorage.getItem(SK);
    if(raw){
      const data = JSON.parse(raw);
      applyRemoteData(data);
    }
  }catch(e){}

  const db = _getDb();
  if(!db) return;
  const ref = db.ref(FB_PATH);
  if(_fbHandler) ref.off('value', _fbHandler);
  _fbHandler = snap => {
    const data = snap.val();
    if(!data) return;

    const json = JSON.stringify(data);
    if(json === lastRemoteJSON) return;

    if(isTyping){
      return; // no pisar lo que el usuario esta escribiendo ahora mismo
    }

    lastRemoteJSON = json;
    applyRemoteData(data);
    try{ localStorage.setItem(SK, json); }catch(e){}

    // re-render todo lo que depende de arrays
    SIMULADOR.renderProvs();
    const c=document.getElementById('inv_container');
    if(c) SIMULADOR.renderInvFull(+document.getElementById('sim_dias').value||0, c);
    SIMULADOR.renderRepo();
    SIMULADOR.syncTalla('yf');
    SIMULADOR.syncTalla('skj');
    SIMULADOR.syncTallaReal('yf');
    SIMULADOR.syncTallaReal('skj');
    SIMULADOR.renderRProvs();
    SIMULADOR.cp();
    SIMULADOR.cr();
    if(document.getElementById('screen-comp')?.classList.contains('active')) calcComp();
    if(document.getElementById('screen-sim')?.classList.contains('active')) SIMULADOR.calcSim();
    if(document.getElementById('screen-auditoria')?.classList.contains('active')) calcAuditoria();

    flashSave();
  };
  ref.on('value', _fbHandler);
}

function flashSave(){
  const d=document.getElementById('saveDot');
  d.classList.add('show');
  setTimeout(()=>d.classList.remove('show'),1300);
}

// ── UTILS ──
function fmt(n){
  if(n===null||n===undefined||isNaN(n)||n===0) return n===0?'$0':'—';
  const abs=Math.abs(Math.round(n));
  const s='$'+abs.toLocaleString('es');
  return n<0?'('+s+')':s;
}
function setText(id,val){const el=document.getElementById(id);if(el) el.textContent=val;}
function eh(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

let _inputDefaults = null;
function captureDefaults(){
  if(_inputDefaults) return;
  _inputDefaults = {};
  INPUT_IDS.forEach(id=>{ const el=document.getElementById(id); if(el) _inputDefaults[id]=el.value; });
}

function init(){
  currentVessel = 'fatima';
  SK = SK_FOR(currentVessel);
  FB_PATH = FB_PATH_FOR(currentVessel);
  captureDefaults();   // guarda los valores iniciales del HTML (tallas 100%, etc.)
  updateVesselUI();
  load();
  SIMULADOR.renderProvs();
  SIMULADOR.renderInv();
  SIMULADOR.renderRepo();
  SIMULADOR.syncTalla('yf');
  SIMULADOR.syncTalla('skj');
  SIMULADOR.syncTallaReal('yf');
  SIMULADOR.syncTallaReal('skj');
  SIMULADOR.renderRProvs();
  SIMULADOR.cp();
  SIMULADOR.cr();
}

// Refleja el barco activo en el encabezado (nombre + capacidad) y pestañas.
function updateVesselUI(){
  const meta = VESSEL_META[currentVessel];
  const tag = document.getElementById('sim_vesselTag');
  if(tag) tag.textContent = meta.nombre + ' · ' + meta.cap + ' TM';
  document.querySelectorAll('.simulador-wrap .vtab-sim').forEach(b=>b.classList.remove('active'));
  const btn = document.getElementById('sim_tab_'+currentVessel);
  if(btn) btn.classList.add('active');
}

// Cambia de barco: persiste el actual, desconecta Firebase, y carga el otro.
function switchVessel(v){
  if(v===currentVessel) return;
  // desconectar el listener remoto del barco anterior
  const db=_getDb();
  if(db && _fbHandler){ try{ db.ref(FB_PATH).off('value', _fbHandler); }catch(e){} _fbHandler=null; }
  lastRemoteJSON = null;

  currentVessel = v;
  SK = SK_FOR(v);
  FB_PATH = FB_PATH_FOR(v);
  updateVesselUI();

  // Resetear arrays a sus defaults antes de cargar los del nuevo barco,
  // para no arrastrar datos del barco anterior si el nuevo aún no tiene nada.
  provs = defaultProvs();
  rprovs = defaultRProvs();
  invItems = defaultInvItems();
  repoItems = defaultRepoItems();
  // limpiar inputs a los valores iniciales del HTML; la capacidad al del barco
  INPUT_IDS.forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    if(id==='p_cap'||id==='r_cap'){ el.value = VESSEL_META[v].cap; }
    else if(_inputDefaults && _inputDefaults[id]!==undefined){ el.value=_inputDefaults[id]; }
  });
  const capEl=document.getElementById('carga_cap'); if(capEl) capEl.textContent=VESSEL_META[v].cap;
  const rCapEl=document.getElementById('r_carga_cap'); if(rCapEl) rCapEl.textContent=VESSEL_META[v].cap;

  load();  // carga datos del nuevo barco (local + Firebase)
  SIMULADOR.renderProvs();
  SIMULADOR.renderInv();
  SIMULADOR.renderRepo();
  SIMULADOR.syncTalla('yf');
  SIMULADOR.syncTalla('skj');
  SIMULADOR.syncTallaReal('yf');
  SIMULADOR.syncTallaReal('skj');
  SIMULADOR.renderRProvs();
  SIMULADOR.cp();
  SIMULADOR.cr();
}

  return {
    init,
    switchVessel,
    addInvItem,
    addProv,
    addRepoItem,
    calcRepo,
    calcSim,
    cp,
    cr,
    renderInv,
    renderInvFull,
    renderProvs,
    renderRepo,
    showScreen,
    sv,
    syncTalla,
    syncTallaReal,
    ajustarTallas,
    ajustarTallasReal,
    precargarDesdeProyeccion,
    renderRProvs,
    addRProv,
    updRProvPill,
    get rprovs(){ return rprovs; },
    set rprovs(v){ rprovs = v; },
    updProvPill,
    updateInvCalc,
    get provs(){ return provs; },
    get invItems(){ return invItems; },
    get repoItems(){ return repoItems; }
  };
})();
