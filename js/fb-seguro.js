/* ════════════════════════════════════════════
   GUARDADO SEGURO EN FIREBASE — módulo compartido
   Namespace: FBSEG
   Evita que un dispositivo con datos viejos (copia local, sin conexión, o que aún
   no recibió lo último) pise lo que otra persona guardó, y que reaparezcan
   registros borrados.

   Uso en un módulo que guarda un nodo completo:
   1. En su listener .on('value'): FBSEG.vio(ruta, snap.val()) cada vez que
      ACEPTA lo que viene de la base (si lo ignora porque el usuario está
      escribiendo, no llamar vio: el próximo guardado se rechazará).
   2. En vez de ref(ruta).set(valor): FBSEG.guardar(ruta, valor).then(r => …)
      r = {ok:true} | {ok:false, motivo:'sin-lectura'|'cambio'|'error'|'descartado'}
   3. Si r.ok es false: FBSEG.avisar(r) y volver a leer la base (once('value')).

   Cada guardado es una transacción: solo se escribe si la base sigue igual a lo
   último que este dispositivo vio. Los guardados de una misma ruta van en cola;
   si uno se rechaza, los que estaban en cola detrás se descartan.
════════════════════════════════════════════ */
var FBSEG = (function(){

const base = {}, listo = {}, cola = {}, gen = {}, pend = {};
let ultimoAviso = 0;

const MSG = {
  'sin-lectura': 'Todavía se está conectando con la base. Espere unos segundos e intente de nuevo.',
  'cambio': 'Otra persona guardó cambios aquí al mismo tiempo. La pantalla se actualizó con lo último: revise y repita su cambio si todavía hace falta.',
  'error': 'No se pudo guardar (sin permiso o sin conexión).'
};

// JSON con claves ordenadas: compara estados sin importar el orden de las claves.
function huella(v){
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return '[' + v.map(huella).join(',') + ']';
  if (typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + huella(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
function copia(v){ return v === undefined ? null : JSON.parse(JSON.stringify(v)); }

// Firebase guarda listas como objetos y elimina las vacías: devuelve siempre un arreglo.
function lista(v){
  if (Array.isArray(v)) return v.filter(x => x !== null && x !== undefined);
  if (v && typeof v === 'object') return Object.keys(v).map(k => v[k]).filter(x => x !== null && x !== undefined);
  return [];
}

function vio(ruta, valor){ base[ruta] = huella(valor); listo[ruta] = true; }
function estaListo(ruta){ return !!listo[ruta]; }
function invalidar(ruta){ gen[ruta] = (gen[ruta] || 0) + 1; }

function guardar(ruta, valor){
  const g = gen[ruta] || 0;
  const nuevo = copia(valor);
  pend[ruta] = (pend[ruta] || 0) + 1;
  const p = (cola[ruta] || Promise.resolve()).then(() => new Promise(res => {
    if ((gen[ruta] || 0) !== g) return res({ ok:false, motivo:'descartado' });
    if (!listo[ruta]) { invalidar(ruta); return res({ ok:false, motivo:'sin-lectura' }); }
    const b = base[ruta];
    let db;
    try { db = firebase.database(); } catch(e) { invalidar(ruta); return res({ ok:false, motivo:'error' }); }
    db.ref(ruta).transaction(cur => (huella(cur) === b ? nuevo : undefined), (err, committed, snap) => {
      if (err) { invalidar(ruta); return res({ ok:false, motivo:'error', err:err }); }
      if (!committed) { invalidar(ruta); return res({ ok:false, motivo:'cambio' }); }
      base[ruta] = huella(snap ? snap.val() : nuevo);
      res({ ok:true });
    });
  })).finally(() => { pend[ruta]--; });
  cola[ruta] = p.catch(() => {});
  return p;
}

// Igual que guardar, pero no escribe si el valor ya es idéntico a lo que hay en la base.
function guardarSiCambio(ruta, valor){
  if (listo[ruta] && huella(copia(valor)) === base[ruta] && !pend[ruta]) return Promise.resolve({ ok:true, sinCambios:true });
  return guardar(ruta, valor);
}

function avisar(r){
  if (!r || r.ok || r.motivo === 'descartado') return;
  const ahora = Date.now();
  if (ahora - ultimoAviso < 4000) return;   // un solo aviso aunque fallen varias rutas a la vez
  ultimoAviso = ahora;
  try { alert(MSG[r.motivo] || MSG.error); } catch(e) {}
}

return { huella, lista, vio, listo: estaListo, guardar, guardarSiCambio, avisar };
})();
