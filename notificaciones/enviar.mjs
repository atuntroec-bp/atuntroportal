// ════════════════════════════════════════════════════════════
//  Enviador de notificaciones del Portal ATUNTRO
//  Lo ejecuta GitHub Actions cada 15 minutos (.github/workflows/notificaciones.yml).
//
//  Avisa a cada persona en sus dispositivos (atuntro_push/tokens/<usuario>):
//   · Tarea asignada / por vencer / vencida → responsable (vínculo nombre ↔ usuario) + roles en copia
//     (por vencer y vencida solo si la tarea tiene "Fecha de vencimiento")
//   · Convocatoria a reunión           → convocados (menos quien convoca)
//   · Recordatorio de reunión          → todos los convocados (puede ignorar el horario)
//   · Evento de la agenda (mañana/hoy) → roles elegidos
//   · Documento por vencer             → roles elegidos, los días configurados
//   · Checklist operativo vencido      → responsable del punto + roles supervisores
//  Textos, encendido, tiempos y destinatarios: js/notif-plantillas.js (fábrica)
//  + atuntro_push/config (lo editado en la ventana del portal).
//  Cada aviso se envía una sola vez (atuntro_push/enviados).
//  La primera ejecución solo registra lo existente, sin enviar (evita una avalancha).
//  Pruebas pedidas desde la ventana: atuntro_push/pruebas.
//
//  Uso local de prueba:
//    node enviar.mjs --snapshot datos.json --dry [--ahora 2026-11-09T08:00:00-05:00]
// ════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const PORTAL_URL = process.env.PORTAL_URL || 'https://atuntroec-bp.github.io/atuntroportal/';
const DATABASE_URL = process.env.DATABASE_URL || 'https://atuntro-portal-default-rtdb.firebaseio.com';
const TZ_OFFSET_H = -5;            // Ecuador continental, sin horario de verano
const RETENER_DIAS = 120;          // limpieza de atuntro_push/enviados
const BUQUES = { fatima: 'María Fátima', gracia: 'María de Gracia' };
const DRY = flag('--dry');
const SNAPSHOT = opt('--snapshot');

/* ── Fechas (hora de Ecuador) ─────────────────────────────── */
const AHORA = opt('--ahora') ? new Date(opt('--ahora')) : new Date();
const local = new Date(AHORA.getTime() + TZ_OFFSET_H * 3600e3);       // usar getUTC*
const iso = (d) => d.toISOString().slice(0, 10);
const HOY = iso(local);
const sumarDias = (f, n) => { const d = new Date(f + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const MANANA = sumarDias(HOY, 1);
const difDias = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5);
const ddmm = (f) => f ? f.slice(8, 10) + '/' + f.slice(5, 7) : '';
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const cuando = (f) => f === HOY ? 'Hoy' : f === MANANA ? 'Mañana' : DOW[new Date(f + 'T12:00:00Z').getUTCDay()] + ' ' + ddmm(f);
const epochLocal = (fecha, hora) => {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = String(hora || '00:00').split(':').map((x) => parseInt(x, 10) || 0);
  return Date.UTC(y, m - 1, d, hh - TZ_OFFSET_H, mm);
};

/* ── Nombres (mismo criterio que el portal) ───────────────── */
const normName = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const namesMatch = (a, b) => {
  const na = normName(a), nb = normName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ta = na.split(' '), tb = nb.split(' ');
  const [sh, lg] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  return sh.length >= 2 && sh.every((w) => lg.includes(w));
};
const claveVinculo = (n) => normName(n).replace(/ /g, '_') || '_';
const claveFb = (k) => String(k).replace(/[.#$/[\]]/g, '_');
const corto = (s, n = 90) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

/* ── Plantillas y configuración ───────────────────────────── */
function plantillasFabrica() {
  const src = readFileSync(path.join(DIR, '..', 'js', 'notif-plantillas.js'), 'utf8');
  return JSON.parse(src.slice(src.indexOf('{', src.indexOf('NOTIF_PLANTILLAS')), src.lastIndexOf('}') + 1));
}
function mezclar(base, extra) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return extra === undefined ? base : extra;
  const out = Object.assign({}, base);
  Object.keys(extra || {}).forEach((k) => { out[k] = (k in base) ? mezclar(base[k], extra[k]) : extra[k]; });
  return out;
}
const lista = (v) => Array.isArray(v) ? v : (v && typeof v === 'object') ? Object.values(v) : (v == null ? [] : [v]);
// Reemplaza {campo}; si un campo queda vacío, quita el tramo " · " que lo contenía.
function rellenar(plantilla, campos) {
  const tramos = String(plantilla || '').split(' · ').map((t) => {
    let vacio = false;
    const r = t.replace(/\{(\w+)\}/g, (_, k) => {
      const v = campos[k];
      if (v === undefined || v === null || String(v).trim() === '') { vacio = true; return ''; }
      return String(v);
    });
    return vacio ? null : r.replace(/\s{2,}/g, ' ').trim();
  }).filter((t) => t);
  return tramos.join(' · ');
}

/* ── Datos ────────────────────────────────────────────────── */
let admin = null, db = null;
async function cargar() {
  if (SNAPSHOT) return JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  admin = (await import('firebase-admin')).default;
  const cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  if (!cred.client_email) throw new Error('Falta el secreto FIREBASE_SERVICE_ACCOUNT');
  admin.initializeApp({ credential: admin.credential.cert(cred), databaseURL: DATABASE_URL });
  db = admin.database();
  const leer = async (p) => (await db.ref(p).once('value')).val();
  const [users, push, gestor, reuItems, reuIdx, eventos, docs, ckF, ckG, ckThr] = await Promise.all([
    leer('atuntro_portal_auth_v2/users'), leer('atuntro_push'), leer('atuntro_gestor/data'),
    leer('atuntro_reuniones/items'), leer('atuntro_reuniones/porUsuario'), leer('atuntro_agenda/eventos'),
    leer('atuntro_documentos/data'), leer('checklist_ops_v3/fatima'), leer('checklist_ops_v3/gracia'),
    leer('checklist_ops_v3/thresholds'),
  ]);
  return {
    users: users || {}, tokens: (push && push.tokens) || {}, vinculos: (push && push.vinculos) || {},
    enviados: (push && push.enviados) || {}, inicio: push && push.inicio,
    config: (push && push.config) || {}, pruebas: (push && push.pruebas) || {},
    gestor: gestor || {}, reuniones: { items: reuItems || {}, porUsuario: reuIdx || {} },
    eventos: eventos || {}, docs: (docs && docs.rows) || [],
    checklist: { fatima: ckF || {}, gracia: ckG || {} }, thresholds: ckThr || {},
  };
}

/* Áreas y puntos del checklist, leídos del propio módulo del portal */
function areasChecklist() {
  const src = readFileSync(path.join(DIR, '..', 'js', 'checklist-ops.js'), 'utf8');
  const bloque = src.slice(src.indexOf('const AREAS'), src.indexOf('const DEFAULT_THRESHOLDS'));
  const areas = {};
  const re = /id:'(a\d+)',\s*title:'([^']*)'[\s\S]*?dateKey:'(\w+)'/g;
  let m;
  while ((m = re.exec(bloque))) areas[m[1]] = { id: m[1], title: m[2], dateKey: m[3], steps: [] };
  const reS = /\{id:'((a\d+)s\d+)'/g;
  while ((m = reS.exec(bloque))) if (areas[m[2]]) areas[m[2]].steps.push(m[1]);
  const dm = src.match(/const DEFAULT_THRESHOLDS\s*=\s*(\{[^;]*\});/);
  let def = {};
  if (dm) { try { def = Function('return ' + dm[1])(); } catch (e) { def = {}; } }
  return { areas, defaults: def };
}

/* ── Generar avisos ───────────────────────────────────────── */
function generar(d, cfg) {
  const T = cfg.tipos;
  const users = d.users || {};
  const ids = Object.keys(users).filter((k) => users[k]);
  const conRoles = (roles) => {
    const r = lista(roles);
    if (r.includes('todos')) return ids.slice();
    return ids.filter((k) => r.includes(users[k].role));
  };
  const nombre = (u) => (users[u] && users[u].name) || '';
  const autoUsuario = (n) => { const h = ids.filter((k) => namesMatch(users[k].name, n)); return h.length === 1 ? h[0] : ''; };
  const usuarioDeResp = (resp) => {
    if (!resp) return '';
    const v = d.vinculos[claveVinculo(resp)];
    return (v && v.usuario && users[v.usuario]) ? v.usuario : autoUsuario(resp);
  };
  const avisos = [];   // { usuario, claves:[...], titulo, cuerpo, url, tag, siempre }
  const add = (tipo, a, campos, cuerpoKey = 'cuerpo') => {
    const t = T[tipo];
    avisos.push(Object.assign({ url: PORTAL_URL, siempre: false, tipo }, a, {
      titulo: rellenar(t.titulo, campos) || t.nombre,
      cuerpo: rellenar(t[cuerpoKey] || t.cuerpo, campos),
    }));
  };

  // 1) Tareas del Gestor — los avisos de vencimiento usan la "Fecha de vencimiento" (t.vence)
  (d.gestor.tasks || []).forEach((t) => {
    if (!t || t.estado === 'COMPLETO') return;
    const resp = usuarioDeResp(t.resp);
    const v = t.vence || '';
    const dias = v ? difDias(HOY, v) : null;
    const campos = { tarea: corto(t.tarea), registro: ddmm(t.fecha), vencimiento: ddmm(v), responsable: t.resp || '', area: t.dept || '',
      vence: v ? (dias < 0 ? `venció ${ddmm(v)}` : dias === 0 ? 'vence hoy' : dias === 1 ? 'vence mañana' : `vence ${ddmm(v)}`) : '',
      cuando: v ? (dias === 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${dias} días`) : '' };
    const asig = T.tareaAsignada, venc = T.tareaVencida, pronto = T.tareaPorVencer;
    const dest = (cfgT) => new Set([resp, ...conRoles(cfgT.copiaRoles)].filter(Boolean));
    const dA = dest(asig), dV = dest(venc), dP = dest(pronto);
    const hitos = lista(pronto.dias).map(Number).filter((n) => n >= 0).sort((a, b) => a - b);
    const hito = (v && dias >= 0) ? hitos.find((h) => dias <= h) : undefined;   // el más cercano alcanzado
    new Set([...dA, ...dV, ...dP]).forEach((u) => {
      const kAsig = `tarea-asig:${t.id}:${u}`;
      const kVenc = (v && dias < 0) ? `tarea-venc:${t.id}:${v}:${u}` : null;
      const kPronto = (hito !== undefined) ? `tarea-pronto:${t.id}:${v}:${hito}:${u}` : null;
      if (asig.activo && dA.has(u) && !d.enviados[claveFb(kAsig)]) {
        // al asignar ya incluye el vencimiento: no repetir recordatorio/vencida en la misma vuelta
        add('tareaAsignada', { usuario: u, claves: [kAsig, kVenc, kPronto].filter(Boolean), tag: `tarea-${t.id}` }, campos);
      } else if (kVenc && venc.activo && dV.has(u)) {
        add('tareaVencida', { usuario: u, claves: [kVenc], tag: `tarea-${t.id}` }, campos);
      } else if (kPronto && pronto.activo && dP.has(u)) {
        add('tareaPorVencer', { usuario: u, claves: [kPronto], tag: `tarea-${t.id}` }, campos);
      }
    });
  });

  // 2) Reuniones
  const items = d.reuniones.items || {}, idx = d.reuniones.porUsuario || {};
  const minAntes = Math.max(5, +T.reunionProxima.minutos || 30);
  Object.keys(idx).forEach((pid) => {
    if (!users[pid]) return;
    Object.keys(idx[pid] || {}).forEach((rid) => {
      const r = items[rid];
      if (!r || !r.fecha || r.fecha < HOY) return;
      const campos = { tema: corto(r.tema || 'Reunión', 70), cuando: cuando(r.fecha), hora: r.hora || '', lugar: r.lugar || '',
        convoca: nombre(r.convoca), fecha: ddmm(r.fecha) };
      const min = (epochLocal(r.fecha, r.hora) - AHORA.getTime()) / 60000;
      const kConv = `reu-conv:${rid}:${pid}`;
      const kPronto = `reu-30:${rid}:${r.fecha}T${r.hora || ''}:${pid}`;
      if (T.reunionProxima.activo && r.hora && min > 0 && min <= minAntes + 15 && !d.enviados[claveFb(kPronto)]) {
        add('reunionProxima', { usuario: pid, claves: [kPronto, kConv], tag: `reu-${rid}`, siempre: !!T.reunionProxima.ignoraHorario }, campos);
      } else if (T.reunionConvocada.activo && r.convoca !== pid && !d.enviados[claveFb(kConv)]) {
        add('reunionConvocada', { usuario: pid, claves: [kConv], tag: `reu-${rid}` }, campos);
      }
    });
  });

  // 3) Eventos de la agenda: el día anterior (o el mismo día si no salió antes)
  if (T.evento.activo) {
    const dest = conRoles(T.evento.roles);
    Object.keys(d.eventos || {}).forEach((id) => {
      const e = d.eventos[id];
      if (!e || (e.fecha !== HOY && e.fecha !== MANANA)) return;
      const campos = { evento: corto(e.txt || 'Evento', 60), cuando: e.fecha === HOY ? 'Hoy' : 'Mañana', area: e.area || '', fecha: ddmm(e.fecha) };
      dest.forEach((u) => add('evento', { usuario: u, claves: [`evento:${id}:${e.fecha}:${u}`], tag: `ev-${id}` }, campos));
    });
  }

  // 4) Documentos por vencer (en los días configurados)
  if (T.documento.activo) {
    const hitos = lista(T.documento.dias).map(Number).filter((n) => n >= 0).sort((a, b) => b - a);
    const maxDias = hitos.length ? hitos[0] : -1;
    const dest = conRoles(T.documento.roles);
    const grp = {};
    (d.docs || []).filter(Boolean).forEach((r) => {
      if (!r.ven || +String(r.ven).slice(0, 4) >= 2090) return;
      const dias = difDias(HOY, r.ven);
      if (dias < 0 || dias > maxDias) return;
      const k = normName(r.nom) + '|' + (r.barco || '') + '|' + r.ven;
      if (grp[k]) grp[k].n++; else grp[k] = { nom: r.nom || 'Documento', barco: r.barco || '', ven: r.ven, n: 1, dias };
    });
    Object.keys(grp).forEach((k) => {
      const g = grp[k];
      const hito = hitos.filter((h) => g.dias <= h).pop();          // el hito más cercano ya alcanzado
      if (hito === undefined) return;
      const campos = { documento: g.nom.charAt(0).toUpperCase() + g.nom.slice(1) + (g.n > 1 ? ` (x${g.n})` : ''),
        buque: g.barco, fecha: ddmm(g.ven), plazo: g.dias === 0 ? 'hoy' : g.dias === 1 ? 'mañana' : `en ${g.dias} días` };
      dest.forEach((u) => add('documento', { usuario: u, claves: [`doc${hito}:${claveFb(k)}:${u}`], tag: `doc-${claveFb(k)}` }, campos));
    });
  }

  // 5) Checklist operativo vencido → responsable + supervisores (agrupado por buque y área)
  if (T.checklist.activo) {
    const supervisores = conRoles(T.checklist.roles);
    const { areas, defaults } = areasChecklist();
    Object.keys(BUQUES).forEach((v) => {
      const st = d.checklist[v] || {}, trip = st._trip || {};
      Object.values(areas).forEach((a) => {
        const ancla = trip[a.dateKey];
        if (!ancla) return;
        const lead = ((d.thresholds[a.id] && d.thresholds[a.id].leadDays) ?? (defaults[a.id] && defaults[a.id].leadDays)) || 0;
        const limite = sumarDias(ancla, -lead);
        if (HOY <= limite) return;                         // aún no vence
        const ad = (st.areas && st.areas[a.id]) || {};
        const borrados = ad.deletedSteps || {};
        const extra = Object.keys(ad.customSteps || {})
          .concat((ad.extraSteps || []).filter(Boolean).map((x) => x.id).filter(Boolean));   // puntos agregados a mano
        const pasos = a.steps.concat(extra).filter((s) => !borrados[s]);
        const porUsuario = {};
        const anotar = (u, clave, propio, sinResp) => {
          const o = porUsuario[u] || (porUsuario[u] = { claves: [], propios: 0, total: 0, sinResp: 0 });
          o.claves.push({ k: clave, sinResp }); o.total++; if (propio) o.propios++;
        };
        pasos.forEach((sid) => {
          const ss = (ad.steps && ad.steps[sid]) || {};
          if (ss.done) return;
          const resp = (ss.respKey && users[ss.respKey]) ? ss.respKey : autoUsuario(ss.resp);
          if (resp) anotar(resp, `ck:${v}:${a.id}:${ancla}:${sid}:${resp}`, true, false);
          supervisores.forEach((m) => { if (m !== resp) anotar(m, `ck:${v}:${a.id}:${ancla}:${sid}:${m}`, false, !resp); });
        });
        Object.keys(porUsuario).forEach((u) => {
          const o = porUsuario[u];
          const pend = o.claves.filter((c) => !d.enviados[claveFb(c.k)]);
          if (!pend.length) return;
          const n = pend.length, sinResp = pend.filter((c) => c.sinResp).length;
          const campos = { buque: BUQUES[v], area: a.title, limite: ddmm(limite),
            puntos: `${n} punto${n > 1 ? 's' : ''} pendiente${n > 1 ? 's' : ''}`, sin_responsable: sinResp ? String(sinResp) : '' };
          add('checklist', { usuario: u, claves: pend.map((c) => c.k), tag: `ck-${v}-${a.id}` }, campos,
            o.propios === o.total ? 'cuerpo' : 'cuerpoSupervisor');
        });
      });
    });
  }

  return avisos.filter((a) => a.claves.some((k) => !d.enviados[claveFb(k)]));
}

/* Avisos de prueba pedidos desde la ventana de edición */
function pruebas(d, cfg) {
  return Object.entries(d.pruebas || {}).map(([id, p]) => {
    if (!p || !p.usuario) return { id, aviso: null };
    const tipo = p.tipo === 'resumen' ? 'resumen' : (cfg.tipos[p.tipo] ? p.tipo : 'tareaAsignada');
    const campos = (cfg.campos && cfg.campos[tipo]) || {};
    const t = tipo === 'resumen' ? cfg.resumen : cfg.tipos[tipo];
    const cuerpo = p.supervisor && t.cuerpoSupervisor ? t.cuerpoSupervisor : t.cuerpo;
    return { id, aviso: { usuario: p.usuario, claves: [], url: PORTAL_URL, tag: 'prueba-' + tipo, siempre: true, tipo,
      titulo: '[Prueba] ' + (rellenar(t.titulo, campos) || 'Atuntro'), cuerpo: rellenar(cuerpo, campos) } };
  });
}

/* ── Enviar ───────────────────────────────────────────────── */
async function enviarA(tokens, a) {
  const lst = Object.entries(tokens || {}).filter(([, t]) => t && t.token);
  if (!lst.length) return { ok: true, invalidos: [], enviados: 0 };
  if (DRY) return { ok: true, invalidos: [], enviados: lst.length };
  const mensajes = lst.map(([, t]) => ({
    token: t.token,
    data: { title: a.titulo, body: a.cuerpo, url: a.url, tag: a.tag || '' },
    webpush: { headers: { Urgency: 'high', TTL: String(a.siempre ? 3600 : 12 * 3600) }, fcmOptions: { link: a.url } },
  }));
  const r = await admin.messaging().sendEach(mensajes);
  const invalidos = [];
  let bien = 0;
  r.responses.forEach((resp, i) => {
    if (resp.success) { bien++; return; }
    const code = resp.error && resp.error.code;
    if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/invalid-argument'].includes(code)) invalidos.push(lst[i][0]);
    else console.warn('  error de envío:', code);
  });
  return { ok: bien > 0 || invalidos.length === lst.length, invalidos, enviados: bien };
}

async function main() {
  const d = await cargar();
  d.enviados = d.enviados || {}; d.vinculos = d.vinculos || {}; d.tokens = d.tokens || {};
  const cfg = mezclar(plantillasFabrica(), d.config || {});
  const hIni = +cfg.horario.inicio, hFin = +cfg.horario.fin;
  const h = local.getUTCHours();
  const EN_HORARIO = hIni <= hFin ? (h >= hIni && h < hFin) : (h >= hIni || h < hFin);
  const MAX = Math.max(1, +cfg.resumen.max || 4);
  const avisos = generar(d, cfg);
  const ts = AHORA.getTime();
  const upd = {};
  const marcar = (claves) => claves.forEach((k) => { upd[`atuntro_push/enviados/${claveFb(k)}`] = ts; });
  console.log(`[${HOY} ${String(h).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}] ` +
    `${avisos.length} aviso(s) pendiente(s) · ${EN_HORARIO ? 'en horario' : 'fuera de horario'} (${hIni}:00–${hFin}:00)`);

  let enviadosTotal = 0, errores = 0;
  const enviarLista = async (u, lst) => {
    for (const a of lst) {
      try {
        const r = await enviarA(d.tokens[u], a);
        r.invalidos.forEach((id) => { upd[`atuntro_push/tokens/${u}/${id}`] = null; });
        if (r.ok) { marcar(a.claves); enviadosTotal += r.enviados; }
        if (DRY || r.enviados) console.log(`  → ${(d.users[u] && d.users[u].name) || u} (${r.enviados} disp.): ${a.titulo} | ${a.cuerpo}`);
      } catch (e) { errores++; console.warn('  fallo al enviar a', u, e.message); }
    }
  };

  // Pruebas (siempre, a cualquier hora)
  for (const p of pruebas(d, cfg)) {
    upd[`atuntro_push/pruebas/${p.id}`] = null;
    if (p.aviso) await enviarLista(p.aviso.usuario, [p.aviso]);
  }

  if (!d.inicio) {
    avisos.forEach((a) => marcar(a.claves));
    upd['atuntro_push/inicio'] = ts;
    console.log(`Primera ejecución: ${avisos.length} aviso(s) existentes registrados sin enviar.`);
  } else {
    const aEnviar = avisos.filter((a) => a.siempre || EN_HORARIO);
    const porUsuario = {};
    aEnviar.forEach((a) => (porUsuario[a.usuario] = porUsuario[a.usuario] || []).push(a));
    for (const u of Object.keys(porUsuario)) {
      let lst = porUsuario[u];
      if (lst.length > MAX) {
        const urgentes = lst.filter((a) => a.siempre);
        const resto = lst.filter((a) => !a.siempre);
        lst = urgentes.concat(resto.length ? [{
          usuario: u, claves: resto.flatMap((a) => a.claves), url: PORTAL_URL, tag: 'resumen', siempre: false, tipo: 'resumen',
          titulo: rellenar(cfg.resumen.titulo, { n: String(resto.length) }) || `Tienes ${resto.length} avisos nuevos`,
          cuerpo: rellenar(cfg.resumen.cuerpo, { n: String(resto.length),
            lista: resto.slice(0, 3).map((a) => a.titulo.replace(/^\S+\s/, '')).join(' · ') + (resto.length > 3 ? ' · …' : '') }),
        }] : []);
      }
      await enviarLista(u, lst);
    }
    const diferidos = avisos.length - aEnviar.length;
    if (diferidos) console.log(`  ${diferidos} aviso(s) esperan al horario (${hIni}:00).`);
  }

  const corte = ts - RETENER_DIAS * 864e5;
  Object.entries(d.enviados).forEach(([k, v]) => { if (typeof v === 'number' && v < corte) upd[`atuntro_push/enviados/${k}`] = null; });
  upd['atuntro_push/ultimaEjecucion'] = { ts, avisos: avisos.length, enviados: enviadosTotal, errores };

  if (DRY || SNAPSHOT) {
    if (opt('--salida')) writeFileSync(opt('--salida'), JSON.stringify({ avisos, upd }, null, 1));
    console.log(`(prueba) ${Object.keys(upd).length} cambio(s) que se guardarían.`);
    return;
  }
  await db.ref().update(upd);
  console.log(`Listo: ${enviadosTotal} notificación(es) entregada(s), ${errores} error(es).`);
  await admin.app().delete();
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
