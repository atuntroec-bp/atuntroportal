/* Textos y ajustes de fábrica de las notificaciones.
 * Los usa la ventana "Editar notificaciones" (js/notificaciones.js) y el enviador
 * (notificaciones/enviar.mjs lee este archivo). Lo que Ricky edite se guarda en
 * Firebase (atuntro_push/config) y reemplaza estos valores.
 * El objeto debe ser JSON válido (el enviador lo lee con JSON.parse).
 * En los textos, {campo} se reemplaza; si un campo queda vacío, se quita el tramo
 * entre " · " que lo contenía. */
var NOTIF_PLANTILLAS = {
  "horario": { "inicio": 7, "fin": 20 },
  "resumen": {
    "max": 4,
    "titulo": "🔔 Tienes {n} avisos nuevos",
    "cuerpo": "{lista}"
  },
  "tipos": {
    "tareaAsignada": {
      "nombre": "Tarea asignada",
      "activo": true,
      "titulo": "📋 Nueva tarea asignada",
      "cuerpo": "{tarea} · {vence}",
      "copiaRoles": []
    },
    "tareaPorVencer": {
      "nombre": "Recordatorio de vencimiento",
      "activo": true,
      "titulo": "⏳ Tarea por vencer",
      "cuerpo": "{tarea} · vence {cuando} ({vencimiento})",
      "dias": [1],
      "copiaRoles": []
    },
    "tareaVencida": {
      "nombre": "Tarea vencida",
      "activo": true,
      "titulo": "⏰ Tarea vencida",
      "cuerpo": "{tarea} · venció el {vencimiento}",
      "copiaRoles": []
    },
    "reunionConvocada": {
      "nombre": "Convocatoria a reunión",
      "activo": true,
      "titulo": "🤝 Te convocaron a una reunión",
      "cuerpo": "{tema} — {cuando} {hora} · 📍 {lugar} · Convoca: {convoca}"
    },
    "reunionProxima": {
      "nombre": "Recordatorio de reunión",
      "activo": true,
      "titulo": "🤝 Reunión a las {hora}",
      "cuerpo": "{tema} · 📍 {lugar}",
      "minutos": 30,
      "ignoraHorario": true
    },
    "evento": {
      "nombre": "Evento de la agenda",
      "activo": true,
      "titulo": "📅 {cuando}: {evento}",
      "cuerpo": "{area}",
      "roles": ["todos"]
    },
    "documento": {
      "nombre": "Documento por vencer",
      "activo": true,
      "titulo": "📄 Vence {plazo}",
      "cuerpo": "{documento} · {buque} · {fecha}",
      "dias": [7, 1],
      "roles": ["master"]
    },
    "checklist": {
      "nombre": "Checklist vencido",
      "activo": true,
      "titulo": "⚠️ Checklist vencido — {buque}",
      "cuerpo": "Tienes {puntos} en \"{area}\" (límite {limite})",
      "cuerpoSupervisor": "{puntos} en \"{area}\" (límite {limite}) · {sin_responsable} sin responsable",
      "roles": ["master"]
    }
  },
  "campos": {
    "tareaAsignada": { "tarea": "Renovar póliza del María Fátima", "vence": "vence 20/11", "vencimiento": "20/11", "registro": "09/11", "responsable": "Ricardo Baida T", "area": "Administrativo" },
    "tareaPorVencer": { "tarea": "Renovar póliza del María Fátima", "cuando": "mañana", "vencimiento": "20/11", "registro": "09/11", "responsable": "Ricardo Baida T", "area": "Administrativo" },
    "tareaVencida": { "tarea": "Pagar TPM", "vencimiento": "05/11", "registro": "01/11", "responsable": "Rómulo Pérez", "area": "Operativo" },
    "reunionConvocada": { "tema": "Planificación de zarpe", "cuando": "Mañana", "hora": "10:00", "lugar": "Oficina Manta", "convoca": "Ricardo Baida Torres" },
    "reunionProxima": { "tema": "Planificación de zarpe", "hora": "10:00", "lugar": "Oficina Manta" },
    "evento": { "evento": "Arribo María de Gracia", "cuando": "Mañana", "area": "Operaciones", "fecha": "10/11" },
    "documento": { "documento": "Permiso de pesca", "buque": "María Fátima", "fecha": "16/11", "plazo": "en 7 días" },
    "checklist": { "buque": "María Fátima", "area": "Antes del Zarpe", "puntos": "3 puntos pendientes", "limite": "08/11", "sin_responsable": "2" },
    "resumen": { "n": "6", "lista": "Nueva tarea asignada · Mañana: Arribo María de Gracia · Vence en 7 días · …" }
  }
};
