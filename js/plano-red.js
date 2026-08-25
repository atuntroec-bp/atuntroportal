/* ════════════════════════════════════════
   PLANO DE RED — scoped module
   Namespace: PR | Firebase: plano_red_v1
   Buque: María Fátima
════════════════════════════════════════ */
var PR = (function() {

const FB_PATH = 'plano_red_v1';
const VESSEL  = 'fatima';
const LS_KEY  = 'atuntro_plano_red_v1_fatima';
const NUM_PANOS = 15;

const ESTADOS = [
  { id:'nuevo',          label:'Nuevo',          color:'#16a34a' },
  { id:'bueno',          label:'Bueno',          color:'#1c6dc4' },
  { id:'regular',        label:'Regular',        color:'#b87300' },
  { id:'malo',           label:'Malo / Da\u00f1ado',  color:'#c41e1e' },
  { id:'cambio_urgente', label:'Cambio Urgente', color:'#c84800' },
  { id:'sin_asignar',    label:'Sin Asignar',    color:'#8fa3b8', dark:true },
];

const STATUS_CLASSES = {
  nuevo:'pr-s-nuevo', bueno:'pr-s-bueno', regular:'pr-s-regular',
  malo:'pr-s-malo', cambio_urgente:'pr-s-urgente', sin_asignar:'pr-s-sin'
};
const ALL_S_CLASSES = Object.values(STATUS_CLASSES);

let SECTIONS = [
  {
    id:'spa', name:'PARADO', estiradas:15, armadas:12,
    cuerdaFlot:'', cuerdaPlom:'CADENA',
    tirantes:'—',
    cols:4, vertical:true,
    panels:[
      {t:'300 × 5"×10 × 100', s:'sin_asignar'},
      {t:'300 × 5"×10 × 200', s:'sin_asignar'},
      {t:'72 × 4.1/4 × 100 × 550', s:'nuevo'},
      {t:'72 × 4.1/4 × 100 × 750', s:'nuevo'},
    ]
  },
  {
    id:'s5', name:'5 SECCIÓN', estiradas:80, armadas:66,
    cuerdaFlot:'132 × 5 × 10  H.EA', cuerdaPlom:'120 × 5 × 10',
    tirantes:'19 TIRANTES — CADENA 3/8"',
    cols:2,
    panos:[
      [{t:'—',s:'sin_asignar',span:2}],
      [{t:'72 × 4.1/8" × 100',s:'cambio_urgente'}, {t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 8" × 66',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'84 × 8" × 120',s:'bueno',span:2}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'42 × 6"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'38 × 6"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'38 × 6"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'38 × 8"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'36 × 4.1/4"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'42 × 4.1/4"',s:'nuevo'}],
      [{t:'120 × 5 × 10',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'s4', name:'4 SECCIÓN', estiradas:131, armadas:105,
    cuerdaFlot:'132 × 5 × 10  H.EA', cuerdaPlom:'120 × 5 × 10',
    tirantes:'24 TIRANTES — CADENA 3/8"',
    cols:1,
    panos:[
      [{t:'—',s:'sin_asignar'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 6" × 66',s:'nuevo'}],
      [{t:'42 × 6" × 66',s:'nuevo'}],
      [{t:'42 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'—',s:'sin_asignar'}],
    ]
  },
  {
    id:'s3', name:'3 SECCIÓN', estiradas:124, armadas:100,
    cuerdaFlot:'132 × 5 × 10', cuerdaPlom:'120 × 5 × 10',
    tirantes:'13 TIRANTES — CADENA 3/8"',
    cols:6,
    panos:[
      [{t:'—',s:'sin_asignar',span:6}],
      [{t:'42 × 41/4 × 100',s:'regular',span:6}],
      [{t:'42 × 414 × 100',s:'regular',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2},{t:'36 × 4.1/4" × 100',s:'nuevo',span:2},{t:'—',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2},{t:'36 × 4.1/4" × 100',s:'nuevo',span:2},{t:'—',s:'sin_asignar',span:2}],
      [{t:'36 × 8" × 66',s:'nuevo',span:3},{t:'36 × 8" × 66',s:'nuevo',span:3}],
      [{t:'36 × 6" × 56',s:'nuevo',span:6}],
      [{t:'36 × 6" × 56',s:'nuevo',span:6}],
      [{t:'36 × 6" × 66',s:'nuevo',span:6}],
      [{t:'36 × 6" × 66',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'—',s:'sin_asignar',span:6}],
    ]
  },
  {
    id:'s2', name:'2 SECCIÓN', estiradas:112, armadas:90,
    cuerdaFlot:'132 × 5 × 10', cuerdaPlom:'120 × 5 × 10',
    tirantes:'—',
    cols:6,
    panos:[
      [{t:'—',s:'sin_asignar',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:2},{t:'—',s:'sin_asignar',span:2},{t:'—',s:'sin_asignar',span:2}],
      [{t:'42 × 414 × 100',s:'regular',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:6}],
      [{t:'48 × 3.1/2" × 122',s:'nuevo',span:6}],
      [{t:'—',s:'sin_asignar',span:6}],
    ]
  },
  {
    id:'s1', name:'1 SECCIÓN', estiradas:62, armadas:51,
    cuerdaFlot:'132AS × 10', cuerdaPlom:'120 × 5 × 10',
    tirantes:'7 TIRANTES — CADENA 3/8"',
    cols:12,
    panos:[
      [{t:'—',s:'sin_asignar',span:6},{t:'—',s:'sin_asignar',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:6},{t:'42 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:6},{t:'36 × 4.1/4"',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:3},{t:'36 × 4.1/4"',s:'nuevo',span:3},{t:'—',s:'sin_asignar',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'48 × 3.1/2" × 122',s:'regular',span:4},{t:'—',s:'sin_asignar',span:4},{t:'—',s:'sin_asignar',span:4}],
      [{t:'—',s:'sin_asignar',span:12}],
    ]
  },
  {
    id:'sac', name:'ANTECABECERO', estiradas:33, armadas:28,
    cuerdaFlot:'300 × 5 × 10', cuerdaPlom:'300 × 5 × 10',
    tirantes:'7 TIRANTES — CADENA 3/8"',
    cols:2,
    panos:[
      [{t:'—',s:'sin_asignar',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'48 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'48 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'42 × 3.1/2"',s:'regular'}, {t:'42 × 3.1/2"',s:'regular'}],
      [{t:'42 × 3.1/2"',s:'regular'}, {t:'42 × 3.1/2"',s:'regular'}],
      [{t:'48 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'48 × 3.1/2"',s:'nuevo'}, {t:'—',s:'bueno'}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'42 × 3.1/2" × 122',s:'regular',span:2}],
      [{t:'—',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'scb', name:'CABECERO', estiradas:26, armadas:22,
    cuerdaFlot:'300 × 5 × 10', cuerdaPlom:'300 × 5 × 10',
    tirantes:'—',
    cols:2,
    panos:[
      [{t:'—',s:'sin_asignar',span:2}],
      [{t:'120 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'120 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'96 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'96 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'84 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'84 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'72 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'42×3.1/2" / 60×5.1/2"',s:'regular'},{t:'—',s:'sin_asignar'}],
      [{t:'—',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'sab', name:'ABANICO', estiradas:'—', armadas:'—',
    cuerdaFlot:'—', cuerdaPlom:'—', tirantes:'—',
    cols:2, vertical:true,
    panels:[
      {t:'—', s:'sin_asignar'},
      {t:'—', s:'sin_asignar'},
    ]
  },
];

/* Separadores delgados entre cada par de secciones */
SECTIONS = SECTIONS.reduce(function(acc, sec, i) {
  if (i > 0) acc.push({
    id:'div'+i, divider:true, vertical:true, cols:1,
    name:'', estiradas:'', armadas:'',
    cuerdaFlot:'', cuerdaPlom:'', tirantes:'',
    panels:[{t:'', s:'sin_asignar'}]
  });
  acc.push(sec);
  return acc;
}, []);

/* ── estado del módulo ── */
let estados = {}, textos = {}, fechas = {};
let activeUser = null;
let db = null, fbReady = false, applyingRemote = false;
let isTyping = false, typingTimer = null, persistTimer = null;
let activeCell = null, editingText = false, origText = '';

/* ── helpers ── */
function canReset() { return !!activeUser && (activeUser.role === 'master' || activeUser.role === 'admin'); }
function cellId(secId, pIdx, colOff) { return secId + '_p' + (pIdx + 1) + '_c' + colOff; }
function statusClass(s) { return STATUS_CLASSES[s] || 'pr-s-sin'; }
function getEstado(id) {
  for (var i = 0; i < ESTADOS.length; i++) if (ESTADOS[i].id === id) return ESTADOS[i];
  return ESTADOS[ESTADOS.length - 1];
}
function getStatus(id, def) { return estados[id] !== undefined ? estados[id] : def; }
function getCustomText(id, def) { return textos[id] !== undefined ? textos[id] : def; }
function getCellDate(id) { return fechas[id] || ''; }

function formatCellDate(raw) {
  if (!raw) return '';
  try {
    var p = raw.split('-');
    var meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return parseInt(p[2], 10) + ' ' + meses[parseInt(p[1], 10) - 1] + '. ' + p[0];
  } catch (e) { return raw; }
}

/* Estado por defecto de una celda, leído de SECTIONS */
function getDefaultStatus(id) {
  if (/_rp$|_tir$/.test(id)) return 'sin_asignar';
  if (id.indexOf('_vert_') !== -1) {
    var parts = id.split('_vert_');
    for (var i = 0; i < SECTIONS.length; i++) {
      var s = SECTIONS[i];
      if (s.id === parts[0] && s.panels && s.panels[+parts[1]]) return s.panels[+parts[1]].s;
    }
    return 'sin_asignar';
  }
  for (var k = 0; k < SECTIONS.length; k++) {
    var sec = SECTIONS[k];
    if (!sec.panos) continue;
    for (var pi = 0; pi < sec.panos.length; pi++) {
      var off = 0, row = sec.panos[pi];
      for (var c = 0; c < row.length; c++) {
        if (cellId(sec.id, pi, off) === id) return row[c].s;
        off += (row[c].span || 1);
      }
    }
  }
  return 'sin_asignar';
}

/* ── sync ── */
function markTyping() {
  isTyping = true;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () { isTyping = false; }, 900);
}
function setSync(cls, label) {
  var d = document.getElementById('pr-syncDot'); if (d) d.className = 'sync-dot ' + cls;
  var l = document.getElementById('pr-syncLbl'); if (l) l.textContent = label;
}
function snapshot() { return { estados: estados, textos: textos, fechas: fechas }; }

function persistDebounced() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 600);
}
function persistNow() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot())); } catch (e) {}
  if (fbReady && !applyingRemote) {
    setSync('saving', 'Guardando…');
    db.ref(FB_PATH + '/' + VESSEL).set(snapshot())
      .then(function () { setSync('ok', 'Sincronizado'); renderLastMod(); })
      .catch(function () { setSync('local', 'Solo local'); renderLastMod(); });
  } else {
    setSync('local', 'Solo local'); renderLastMod();
  }
}

function loadLocal() {
  try {
    var r = localStorage.getItem(LS_KEY);
    if (!r) return null;
    return JSON.parse(r);
  } catch (e) { return null; }
}
function applyData(d) {
  estados = (d && d.estados) || {};
  textos  = (d && d.textos)  || {};
  fechas  = (d && d.fechas)  || {};
}

/* El modal está abierto o el usuario escribe → no redibujar la tabla */
function isBusy() {
  var ov = document.getElementById('pr-overlay');
  if (ov && !ov.classList.contains('pr-hidden')) return true;
  return isTyping;
}

function initFirebase() {
  try {
    db = firebase.database(); fbReady = true; setSync('ok', 'Sincronizado');
    db.ref(FB_PATH + '/' + VESSEL).on('value', function (snap) {
      if (isTyping) return;
      var r = snap.val();
      if (!r) return;
      if (JSON.stringify(r) === JSON.stringify(snapshot())) return;
      applyingRemote = true;
      applyData(r);
      try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot())); } catch (e) {}
      if (!isBusy()) renderTable();
      renderLastMod();
      applyingRemote = false;
    });
  } catch (e) { setSync('local', 'Solo local'); }
}

/* ── DOM helpers ── */
function th(row, text, opts) {
  opts = opts || {};
  var el = document.createElement('th');
  el.textContent = text;
  if (opts.cls) el.className = opts.cls;
  if (opts.colspan > 1) el.colSpan = opts.colspan;
  if (opts.rowspan > 1) el.rowSpan = opts.rowspan;
  if (opts.style) el.style.cssText = opts.style;
  row.appendChild(el);
  return el;
}
function td(row, text, opts) {
  opts = opts || {};
  var el = document.createElement('td');
  el.textContent = text;
  if (opts.cls) el.className = opts.cls;
  if (opts.colspan > 1) el.colSpan = opts.colspan;
  if (opts.style) el.style.cssText = opts.style;
  row.appendChild(el);
  return el;
}

function mkCell(tr, text, status, id, colspan, rawText, secName, panoNum, isFirst, rowspan) {
  rowspan = rowspan || 1;
  var el = document.createElement('td');
  el.className = 'pr-cell ' + statusClass(status) + (isFirst ? ' pr-sec-first' : '');
  el.colSpan = colspan;
  if (rowspan > 1) el.rowSpan = rowspan;
  el.tabIndex = 0;
  el.title = getEstado(status).label;
  el.dataset.id = id;
  el.dataset.rawText = rawText || '—';
  el.dataset.secName = secName;
  el.dataset.panoNum = panoNum;
  el.textContent = getCustomText(id, text || '—');
  var dt = getCellDate(id);
  if (dt) {
    var ds = document.createElement('span');
    ds.className = 'pr-cell-date';
    ds.textContent = formatCellDate(dt);
    el.appendChild(ds);
  }
  el.addEventListener('click', function () { openModal(el); });
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el); }
  });
  tr.appendChild(el);
  return el;
}

function refreshCellDate(el, raw) {
  if (!el) return;
  var ds = el.querySelector('.pr-cell-date');
  if (raw) {
    if (!ds) { ds = document.createElement('span'); ds.className = 'pr-cell-date'; el.appendChild(ds); }
    ds.textContent = formatCellDate(raw);
  } else if (ds) { ds.remove(); }
}

/* ── render tabla ── */
function renderTable() {
  var tbl = document.getElementById('pr-netPlan');
  if (!tbl) return;
  tbl.innerHTML = '';
  var thead = document.createElement('thead');
  var tbody = document.createElement('tbody');

  var hr1 = document.createElement('tr');
  th(hr1, 'PAÑO', { cls: 'pr-th-label pr-th-section', rowspan: 2, style: 'vertical-align:middle' });
  SECTIONS.forEach(function (sec, si) {
    if (sec.divider) { th(hr1, '', { cls: 'pr-th-divider-hdr', colspan: 1, rowspan: 2 }); return; }
    th(hr1, sec.name, { cls: 'pr-th-section' + (si === 0 ? ' pr-th-section-first' : ''), colspan: sec.cols });
  });
  thead.appendChild(hr1);

  var hr2 = document.createElement('tr');
  SECTIONS.forEach(function (sec) {
    if (sec.divider) return;
    var cell = th(hr2, '', { cls: 'pr-th-stats', colspan: sec.cols });
    if (sec.estiradas !== '') {
      cell.innerHTML = '<span class="pr-est">' + sec.estiradas + ' est.</span>' +
                       '<span class="pr-arm">' + sec.armadas + ' arm.</span>';
    }
  });
  thead.appendChild(hr2);
  tbl.appendChild(thead);

  var covered = {};
  for (var pIdx = 0; pIdx < NUM_PANOS; pIdx++) {
    (function (pIdx) {
      var tr = document.createElement('tr');
      if (pIdx % 2 === 1) tr.classList.add('pr-row-even');
      td(tr, pIdx + 1, { cls: 'pr-td-label' });

      SECTIONS.forEach(function (sec, si) {
        if (sec.vertical) {
          if (pIdx === 0) {
            sec.panels.forEach(function (p, pi) {
              var id = sec.id + '_vert_' + pi;
              var status = getStatus(id, p.s);
              var el = document.createElement('td');
              el.className = 'pr-cell pr-cell-vert ' + (sec.divider ? 'pr-cell-div ' : ' ') +
                             statusClass(status) + (si === 0 && pi === 0 ? ' pr-sec-first' : '');
              el.rowSpan = NUM_PANOS;
              el.tabIndex = 0;
              el.title = getEstado(status).label;
              el.dataset.id = id;
              el.dataset.rawText = p.t;
              el.dataset.secName = sec.name;
              el.dataset.panoNum = 'Panel ' + (pi + 1);
              var vSpan = document.createElement('span');
              vSpan.className = 'pr-cell-vert-text';
              vSpan.textContent = getCustomText(id, p.t);
              el.appendChild(vSpan);
              var vDt = getCellDate(id);
              if (vDt) {
                var vDs = document.createElement('span');
                vDs.className = 'pr-cell-date';
                vDs.textContent = formatCellDate(vDt);
                el.appendChild(vDs);
              }
              el.addEventListener('click', function () { openModal(el); });
              el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el); }
              });
              tr.appendChild(el);
            });
          }
          return;
        }

        var isCovered = false;
        for (var s = 0; s < sec.cols; s++) {
          if (covered[sec.id + '_' + pIdx + '_' + s]) { isCovered = true; break; }
        }
        if (isCovered) return;

        var cells = sec.panos[pIdx] || [];
        if (!cells.length) {
          mkCell(tr, '—', 'sin_asignar', cellId(sec.id, pIdx, 0), sec.cols, '—', sec.name, pIdx + 1, si === 0);
          return;
        }
        var off = 0;
        cells.forEach(function (c) {
          var span = c.span || 1, rspan = c.rowspan || 1;
          var id = cellId(sec.id, pIdx, off);
          mkCell(tr, c.t, getStatus(id, c.s), id, span, c.t, sec.name, pIdx + 1, si === 0 && off === 0, rspan);
          if (rspan > 1) {
            for (var r = 1; r < rspan; r++) {
              for (var q = 0; q < span; q++) covered[sec.id + '_' + (pIdx + r) + '_' + (off + q)] = true;
            }
          }
          off += span;
        });
      });
      tbody.appendChild(tr);
    })(pIdx);
  }

  /* fila CADENA */
  var trR = document.createElement('tr');
  trR.className = 'pr-row-relinga';
  td(trR, 'CADENA', { cls: 'pr-td-label', style: 'font-size:8px;letter-spacing:.04em' });
  SECTIONS.forEach(function (sec, si) {
    if (sec.vertical) {
      td(trR, sec.divider ? '' : sec.cuerdaPlom, {
        colspan: sec.cols,
        style: sec.divider ? 'width:18px;max-width:22px;padding:0;background:#0d3258;border:1px solid #07213a;'
                           : 'text-align:center;font-size:9px;'
      });
      return;
    }
    var rpId = sec.id + '_rp';
    mkCell(trR, sec.cuerdaPlom, getStatus(rpId, 'sin_asignar'), rpId, sec.cols, sec.cuerdaPlom, sec.name, 'Cadena', si === 0);
  });
  tbody.appendChild(trR);

  /* fila TIRANTES */
  var trT = document.createElement('tr');
  trT.className = 'pr-row-tirantes';
  td(trT, 'TIRANTES', { cls: 'pr-td-label', style: 'font-size:8px;letter-spacing:.04em' });
  SECTIONS.forEach(function (sec, si) {
    if (sec.vertical) {
      td(trT, sec.divider ? '' : sec.tirantes, {
        colspan: sec.cols,
        style: sec.divider ? 'width:18px;max-width:22px;padding:0;background:#0d3258;border:1px solid #07213a;'
                           : 'text-align:center;font-size:9px;'
      });
      return;
    }
    var tirId = sec.id + '_tir';
    mkCell(trT, sec.tirantes, getStatus(tirId, 'sin_asignar'), tirId, sec.cols, sec.tirantes, sec.name, 'Tirantes', si === 0);
  });
  tbody.appendChild(trT);

  tbl.appendChild(tbody);
  updateStats();
}

/* ── totales ── */
function updateStats() {
  var counts = {};
  ESTADOS.forEach(function (e) { counts[e.id] = 0; });
  document.querySelectorAll('#pr-netPlan .pr-cell').forEach(function (el) {
    var s = getStatus(el.dataset.id, getDefaultStatus(el.dataset.id));
    if (counts[s] !== undefined) counts[s]++;
  });
  var bar = document.getElementById('pr-statsBar');
  if (!bar) return;
  bar.innerHTML = '<span class="pr-stats-label">Totales</span>';
  ESTADOS.forEach(function (e) {
    if (!counts[e.id]) return;
    var chip = document.createElement('span');
    chip.className = 'pr-stat-chip';
    var badge = document.createElement('span');
    badge.className = 'pr-stat-badge';
    badge.style.background = e.color;
    if (e.dark) badge.style.color = '#0b1f38';
    badge.textContent = counts[e.id];
    chip.appendChild(badge);
    chip.appendChild(document.createTextNode(' ' + e.label));
    bar.appendChild(chip);
  });
}

function renderLastMod() {
  var el = document.getElementById('pr-lastMod');
  if (!el) return;
  var last = '';
  Object.keys(fechas).forEach(function (k) { if (fechas[k] > last) last = fechas[k]; });
  el.textContent = last ? 'Último cambio registrado: ' + formatCellDate(last) : '';
}

/* ── modal ── */
function openModal(el) {
  activeCell = el;
  var id = el.dataset.id;
  var cur = getStatus(id, getDefaultStatus(id));
  var pn = el.dataset.panoNum;
  var panoLabel = (pn === 'Cadena' || pn === 'Tirantes') ? pn
    : (String(pn).indexOf('Panel') === 0) ? pn : 'Paño ' + pn;

  document.getElementById('pr-mSub').textContent = el.dataset.secName + '  —  ' + panoLabel;
  document.getElementById('pr-mMeas').textContent = getCustomText(id, el.dataset.rawText || '—');
  resetEditBtn();

  var grid = document.getElementById('pr-mGrid');
  grid.innerHTML = '';
  ESTADOS.forEach(function (e) {
    var btn = document.createElement('button');
    btn.className = 'pr-s-btn' + (e.dark ? ' pr-s-btn-sin' : '') + (e.id === cur ? ' active' : '');
    btn.style.background = e.color;
    if (e.dark) btn.style.color = '#0b1f38';
    btn.innerHTML = '<span>' + e.label + '</span><span class="pr-chk">✓</span>';
    btn.addEventListener('click', function () { applyStatus(e.id); });
    grid.appendChild(btn);
  });

  var dateInp = document.getElementById('pr-mDateInput');
  if (dateInp) {
    dateInp.value = getCellDate(id);
    dateInp.onchange = function () {
      if (!activeCell) return;
      var v = dateInp.value;
      if (v) fechas[activeCell.dataset.id] = v; else delete fechas[activeCell.dataset.id];
      markTyping();
      persistDebounced();
      refreshCellDate(activeCell, v);
      renderLastMod();
    };
  }

  document.getElementById('pr-overlay').classList.remove('pr-hidden');
  setTimeout(function () { var b = grid.querySelector('button'); if (b) b.focus(); }, 40);
}

function applyStatus(statusId) {
  if (!activeCell) return;
  estados[activeCell.dataset.id] = statusId;
  markTyping();
  persistDebounced();
  activeCell.classList.remove.apply(activeCell.classList, ALL_S_CLASSES);
  activeCell.classList.add(statusClass(statusId));
  activeCell.title = getEstado(statusId).label;
  updateStats();
  closeModal();
}

function clearCellDate() {
  if (!activeCell) return;
  var dateInp = document.getElementById('pr-mDateInput');
  if (dateInp) dateInp.value = '';
  delete fechas[activeCell.dataset.id];
  markTyping();
  persistDebounced();
  refreshCellDate(activeCell, '');
  renderLastMod();
}

function closeModal() {
  resetEditBtn();
  document.getElementById('pr-overlay').classList.add('pr-hidden');
  if (activeCell) activeCell.focus();
  activeCell = null;
}

/* ── edición de texto ── */
function enableTextEdit() {
  if (editingText) return;
  editingText = true;
  var meas = document.getElementById('pr-mMeas');
  origText = meas.textContent;
  meas.innerHTML = '';
  var inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'pr-text-edit-input';
  inp.value = origText === '—' ? '' : origText;
  inp.placeholder = 'Ej: 42 × 4.1/4" × 100';
  inp.addEventListener('input', markTyping);
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); saveTextEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelTextEdit(); }
  });
  meas.appendChild(inp);
  inp.focus(); inp.select();
  var btn = document.getElementById('pr-btnEditTxt');
  btn.textContent = '✓'; btn.title = 'Guardar texto';
  btn.classList.add('saving');
  btn.onclick = saveTextEdit;
}

function saveTextEdit() {
  if (!activeCell || !editingText) return;
  var inp = document.querySelector('.pr-text-edit-input');
  var newText = inp ? inp.value.trim() : '';
  var id = activeCell.dataset.id;
  if (newText) textos[id] = newText; else delete textos[id];
  markTyping();
  persistDebounced();

  var final = newText || activeCell.dataset.rawText || '—';
  if (activeCell.classList.contains('pr-cell-vert')) {
    var vs = activeCell.querySelector('.pr-cell-vert-text');
    if (vs) vs.textContent = final;
  } else {
    var keep = activeCell.querySelector('.pr-cell-date');
    activeCell.textContent = final;
    if (keep) activeCell.appendChild(keep);
  }
  document.getElementById('pr-mMeas').textContent = final;
  resetEditBtn();
}

function cancelTextEdit() {
  document.getElementById('pr-mMeas').textContent = origText;
  resetEditBtn();
}

function resetEditBtn() {
  editingText = false; origText = '';
  var btn = document.getElementById('pr-btnEditTxt');
  if (!btn) return;
  btn.textContent = '✎'; btn.title = 'Editar texto de la celda';
  btn.classList.remove('saving');
  btn.onclick = enableTextEdit;
}

/* ── reset (solo master/admin) ── */
function resetAll() {
  if (!canReset()) {
    alert('Solo un usuario master o administrador puede resetear el plano.');
    return;
  }
  if (!confirm('¿Resetear TODOS los paños a gris?\n\nSe conservan los textos y las fechas de último cambio.')) return;

  estados = {};
  SECTIONS.forEach(function (sec) {
    if (sec.vertical && sec.panels) {
      sec.panels.forEach(function (p, pi) { estados[sec.id + '_vert_' + pi] = 'sin_asignar'; });
      if (sec.divider) return;
    }
    if (sec.panos) {
      sec.panos.forEach(function (row, pIdx) {
        if (!row || !row.length) return;
        var off = 0;
        row.forEach(function (c) {
          estados[cellId(sec.id, pIdx, off)] = 'sin_asignar';
          off += (c.span || 1);
        });
      });
    }
    if (!sec.divider) {
      estados[sec.id + '_rp'] = 'sin_asignar';
      estados[sec.id + '_tir'] = 'sin_asignar';
    }
  });
  persistNow();
  renderTable();
}

function imprimir() { window.print(); }

/* ── init ── */
function init(user) {
  activeUser = user || null;
  var local = loadLocal();
  if (local) applyData(local);
  if (!fbReady) initFirebase();
  var rb = document.getElementById('pr-resetBtn');
  if (rb) rb.style.display = canReset() ? '' : 'none';
  renderTable();
  renderLastMod();
}

/* listeners globales del modal */
document.addEventListener('DOMContentLoaded', function () {
  var ov = document.getElementById('pr-overlay');
  if (ov) ov.addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var o = document.getElementById('pr-overlay');
    if (o && !o.classList.contains('pr-hidden')) closeModal();
  });
});

return {
  init: init,
  closeModal: closeModal,
  clearCellDate: clearCellDate,
  enableTextEdit: enableTextEdit,
  resetAll: resetAll,
  imprimir: imprimir,
};

})();
