// ════════════════════════════════════════════════════════════
//  Enviador de notificaciones del Portal ATUNTRO
//  Lo ejecuta GitHub Actions cada 15 minutos (.github/workflows/notificaciones.yml).
//
//  Avisa a cada persona en sus dispositivos (atuntro_push/tokens/<usuario>):
//   · Tarea asignada / tarea vencida   → responsable (vínculo nombre ↔ usuario)
//   · Convocatoria a reunión           → convocados (menos quien convoca)
//   · Reunión en 30 minutos            → todos los convocados (también de noche)
//   · Evento de la agenda (mañana/hoy) → todos los usuarios
//   · Documento por vencer (7 y 1 día) → usuarios master
//   · Checklist operativo vencido      → responsable del punto + usuarios master
//  Horario: 7:00 a 20:00 (Ecuador). Fuera de horario se guardan y salen a las 7:00,
//  salvo el recordatorio de reunión en 30 minutos.
//  Cada aviso se envía una sola vez (atuntro_push/enviados).
//  La primera ejecución solo registra lo existente, sin enviar (evita una avalancha).
//
//  Uso local de prueba:
//    node enviar.mjs --snapshot datos.json --dry [--ahora 2026-11-09T08:00:00-05:00]
// ════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const PORTAL_URL = process.env.PORTAL_URL || 'https://atuntroec-bp.github.io/atuntroportal/';
const DATABASE_URL = process.env.DATABASE_URL || 'https://atuntro-portal-default-rtdb.firebaseio.com';
const TZ_OFFSET_H = -5;            // Ecuador continental, sin horario de verano
const HORA_INICIO = 7, HORA_FIN = 20;
const MAX_POR_PERSONA = 4;         // más avisos que esto en una vuelta → un resumen
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
const EN_HORARIO = local.getUTCHours() >= HORA_INICIO && local.getUTCHours() < HORA_FIN;
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
function generar(d) {
  const users = d.users || {};
  const ids = Object.keys(users).filter((k) => users[k]);
  const masters = ids.filter((k) => users[k].role === 'master');
  const nombre = (u) => (users[u] && users[u].name) || '';
  const autoUsuario = (n) => { const h = ids.filter((k) => namesMatch(users[k].name, n)); return h.length === 1 ? h[0] : ''; };
  const usuarioDeResp = (resp) => {
    if (!resp) return '';
    const v = d.vinculos[claveVinculo(resp)];
    return (v && v.usuario && users[v.usuario]) ? v.usuario : autoUsuario(resp);
  };
  const avisos = [];   // { usuario, claves:[...], titulo, cuerpo, url, tag, siempre }
  const add = (a) => avisos.push(Object.assign({ url: PORTAL_URL, siempre: false }, a));

  // 1) Tareas del Gestor
  (d.gestor.tasks || []).forEach((t) => {
    if (!t || t.estado === 'COMPLETO') return;
    const u = usuarioDeResp(t.resp);
    if (!u) return;
    const kAsig = `tarea-asig:${t.id}:${u}`;
    const vencida = t.fecha && t.fecha < HOY;
    const kVenc = vencida ? `tarea-venc:${t.id}:${t.fecha}:${u}` : null;
    if (!d.enviados[claveFb(kAsig)]) {
      add({ usuario: u, claves: kVenc ? [kAsig, kVenc] : [kAsig], tag: `tarea-${t.id}`,
        titulo: kVenc ? '📋 Tarea asignada (ya vencida)' : '📋 Nueva tarea asignada',
        cuerpo: corto(t.tarea) + (t.fecha ? (kVenc ? ` · venció ${ddmm(t.fecha)}` : ` · fecha ${ddmm(t.fecha)}`) : '') });
    } else if (kVenc) {
      add({ usuario: u, claves: [kVenc], tag: `tarea-${t.id}`, titulo: '⏰ Tarea vencida',
        cuerpo: corto(t.tarea) + ` · venció ${ddmm(t.fecha)}` });
    }
  });

  // 2) Reuniones
  const items = d.reuniones.items || {}, idx = d.reuniones.porUsuario || {};
  Object.keys(idx).forEach((pid) => {
    if (!users[pid]) return;
    Object.keys(idx[pid] || {}).forEach((rid) => {
      const r = items[rid];
      if (!r || !r.fecha || r.fecha < HOY) return;
      const lugar = r.lugar ? ` · 📍 ${r.lugar}` : '';
      const inicio = epochLocal(r.fecha, r.hora);
      const min = (inicio - AHORA.getTime()) / 60000;
      const kConv = `reu-conv:${rid}:${pid}`;
      const kPronto = `reu-30:${rid}:${r.fecha}T${r.hora || ''}:${pid}`;
      if (r.hora && min > 0 && min <= 45 && !d.enviados[claveFb(kPronto)]) {
        add({ usuario: pid, claves: [kPronto, kConv], tag: `reu-${rid}`, siempre: true,
          titulo: `🤝 Reunión a las ${r.hora}`, cuerpo: corto(r.tema || 'Reunión') + lugar });
      } else if (r.convoca !== pid && !d.enviados[claveFb(kConv)]) {
        const conv = nombre(r.convoca);
        add({ usuario: pid, claves: [kConv], tag: `reu-${rid}`, titulo: '🤝 Te convocaron a una reunión',
          cuerpo: `${corto(r.tema || 'Reunión', 70)} — ${cuando(r.fecha)}${r.hora ? ' ' + r.hora : ''}${lugar}${conv ? ' · Convoca: ' + conv : ''}` });
      }
    });
  });

  // 3) Eventos de la agenda: el día anterior (o el mismo día si no salió antes)
  Object.keys(d.eventos || {}).forEach((id) => {
    const e = d.eventos[id];
    if (!e || (e.fecha !== HOY && e.fecha !== MANANA)) return;
    ids.forEach((u) => add({ usuario: u, claves: [`evento:${id}:${e.fecha}:${u}`], tag: `ev-${id}`,
      titulo: `📅 ${e.fecha === HOY ? 'Hoy' : 'Mañana'}: ${corto(e.txt || 'Evento', 60)}`,
      cuerpo: e.area ? corto(e.area) : 'Agenda de Atún Tropical' }));
  });

  // 4) Documentos por vencer (7 días y 1 día antes) → master
  const grp = {};
  (d.docs || []).filter(Boolean).forEach((r) => {
    if (!r.ven || +String(r.ven).slice(0, 4) >= 2090) return;
    const dias = difDias(HOY, r.ven);
    if (dias < 0 || dias > 7) return;
    const k = normName(r.nom) + '|' + (r.barco || '') + '|' + r.ven;
    if (grp[k]) grp[k].n++; else grp[k] = { nom: r.nom || 'Documento', barco: r.barco || '', ven: r.ven, n: 1, dias };
  });
  Object.keys(grp).forEach((k) => {
    const g = grp[k], hito = g.dias <= 1 ? 1 : 7;
    const nom = g.nom.charAt(0).toUpperCase() + g.nom.slice(1) + (g.n > 1 ? ` (x${g.n})` : '');
    masters.forEach((u) => add({ usuario: u, claves: [`doc${hito}:${claveFb(k)}:${u}`], tag: `doc-${claveFb(k)}`,
      titulo: g.dias === 0 ? '📄 Vence hoy' : g.dias === 1 ? '📄 Vence mañana' : `📄 Vence en ${g.dias} días`,
      cuerpo: nom + (g.barco ? ` · ${g.barco}` : '') + ` · ${ddmm(g.ven)}` }));
  });

  // 5) Checklist operativo vencido → responsable + master (agrupado por buque y área)
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
      const porUsuario = {};                             // u → { claves, propios, sinResp }
      const anotar = (u, clave, propio, sinResp) => {
        const o = porUsuario[u] || (porUsuario[u] = { claves: [], propios: 0, total: 0, sinResp: 0 });
        o.claves.push(clave); o.total++; if (propio) o.propios++; if (sinResp) o.sinResp++;
      };
      pasos.forEach((sid) => {
        const ss = (ad.steps && ad.steps[sid]) || {};
        if (ss.done) return;
        const resp = (ss.respKey && users[ss.respKey]) ? ss.respKey : autoUsuario(ss.resp);
        if (resp) anotar(resp, `ck:${v}:${a.id}:${ancla}:${sid}:${resp}`, true, false);
        masters.forEach((m) => { if (m !== resp) anotar(m, `ck:${v}:${a.id}:${ancla}:${sid}:${m}`, false, !resp); });
      });
      Object.keys(porUsuario).forEach((u) => {
        const o = porUsuario[u];
        const pendientes = o.claves.filter((k) => !d.enviados[claveFb(k)]);
        if (!pendientes.length) return;
        const n = pendientes.length;
        const cuerpo = o.propios === o.total
          ? `Tienes ${n} punto${n > 1 ? 's' : ''} pendiente${n > 1 ? 's' : ''} en "${a.title}" (límite ${ddmm(limite)})`
          : `${n} punto${n > 1 ? 's' : ''} sin completar en "${a.title}" (límite ${ddmm(limite)})` + (o.sinResp ? ` · ${o.sinResp} sin responsable` : '');
        add({ usuario: u, claves: pendientes, tag: `ck-${v}-${a.id}`, titulo: `⚠️ Checklist vencido — ${BUQUES[v]}`, cuerpo });
      });
    });
  });

  // quitar lo ya enviado (si todas sus claves ya salieron)
  return avisos.filter((a) => a.claves.some((k) => !d.enviados[claveFb(k)]));
}

/* ── Enviar ───────────────────────────────────────────────── */
async function enviarA(tokens, a) {
  const lista = Object.entries(tokens || {}).filter(([, t]) => t && t.token);
  if (!lista.length) return { ok: true, invalidos: [], enviados: 0 };
  if (DRY) return { ok: true, invalidos: [], enviados: lista.length };
  const mensajes = lista.map(([, t]) => ({
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
    if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/invalid-argument'].includes(code)) invalidos.push(lista[i][0]);
    else console.warn('  error de envío:', code);
  });
  // Se da por atendido si llegó a algún dispositivo o si todos eran tokens vencidos
  return { ok: bien > 0 || invalidos.length === lista.length, invalidos, enviados: bien };
}

async function main() {
  const d = await cargar();
  d.enviados = d.enviados || {}; d.vinculos = d.vinculos || {}; d.tokens = d.tokens || {};
  const avisos = generar(d);
  const ts = AHORA.getTime();
  const upd = {};
  const marcar = (claves) => claves.forEach((k) => { upd[`atuntro_push/enviados/${claveFb(k)}`] = ts; });
  console.log(`[${HOY} ${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}] ` +
    `${avisos.length} aviso(s) pendiente(s) · ${EN_HORARIO ? 'en horario' : 'fuera de horario'}`);

  let enviadosTotal = 0, errores = 0;
  if (!d.inicio) {
    // Primera ejecución: registrar todo lo existente sin enviar
    avisos.forEach((a) => marcar(a.claves));
    upd['atuntro_push/inicio'] = ts;
    console.log(`Primera ejecución: ${avisos.length} aviso(s) existentes registrados sin enviar.`);
  } else {
    const aEnviar = avisos.filter((a) => a.siempre || EN_HORARIO);
    const porUsuario = {};
    aEnviar.forEach((a) => (porUsuario[a.usuario] = porUsuario[a.usuario] || []).push(a));
    for (const u of Object.keys(porUsuario)) {
      let lista = porUsuario[u];
      if (lista.length > MAX_POR_PERSONA) {
        const urgentes = lista.filter((a) => a.siempre);
        const resto = lista.filter((a) => !a.siempre);
        lista = urgentes.concat(resto.length ? [{
          usuario: u, claves: resto.flatMap((a) => a.claves), url: PORTAL_URL, tag: 'resumen', siempre: false,
          titulo: `🔔 Tienes ${resto.length} avisos nuevos`,
          cuerpo: resto.slice(0, 3).map((a) => a.titulo.replace(/^\S+\s/, '')).join(' · ') + (resto.length > 3 ? ' · …' : ''),
        }] : []);
      }
      for (const a of lista) {
        try {
          const r = await enviarA(d.tokens[u], a);
          r.invalidos.forEach((id) => { upd[`atuntro_push/tokens/${u}/${id}`] = null; });
          if (r.ok) { marcar(a.claves); enviadosTotal += r.enviados; }
          if (DRY || r.enviados) console.log(`  → ${(d.users[u] && d.users[u].name) || u} (${r.enviados} disp.): ${a.titulo} | ${a.cuerpo}`);
        } catch (e) { errores++; console.warn('  fallo al enviar a', u, e.message); }
      }
    }
    const diferidos = avisos.length - aEnviar.length;
    if (diferidos) console.log(`  ${diferidos} aviso(s) esperan al horario (7:00).`);
  }

  // limpieza de registros viejos
  const corte = ts - RETENER_DIAS * 864e5;
  Object.entries(d.enviados).forEach(([k, v]) => { if (typeof v === 'number' && v < corte) upd[`atuntro_push/enviados/${k}`] = null; });
  upd['atuntro_push/ultimaEjecucion'] = { ts, avisos: avisos.length, enviados: enviadosTotal, errores };

  if (DRY || SNAPSHOT) {
    if (opt('--salida')) (await import('node:fs')).writeFileSync(opt('--salida'), JSON.stringify({ avisos, upd }, null, 1));
    console.log(`(prueba) ${Object.keys(upd).length} cambio(s) que se guardarían.`);
    return;
  }
  await db.ref().update(upd);
  console.log(`Listo: ${enviadosTotal} notificación(es) entregada(s), ${errores} error(es).`);
  await admin.app().delete();
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
