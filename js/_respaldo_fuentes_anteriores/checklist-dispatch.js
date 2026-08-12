/* ──────────────────────────────────────────────────────────────
   SHARED CHECKLIST DISPATCHERS
   Routes calls from HTML onclick to the currently-active module
────────────────────────────────────────────────────────────── */
function _ckopsActive() {
  var s = document.getElementById('screen-checklist-ops');
  return s && s.classList.contains('active');
}
function switchVessel(vessel, el) {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.switchVessel(vessel, el); }
  else                { if (typeof CKADM !== 'undefined') CKADM.switchVessel(vessel, el); }
}
function resetVessel() {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.resetVessel(); }
  else                { if (typeof CKADM !== 'undefined') CKADM.resetVessel(); }
}
function moveStep(a, b, c, d) {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.moveStep(a, b, c, d); }
  else                { if (typeof CKADM !== 'undefined') CKADM.moveStep(a, b, c, d); }
}
/* Conflicting names — both modules implement these differently */
function toggleStep(a, b) {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.toggleStep(a, b); }
  else                { if (typeof CKADM !== 'undefined') CKADM.toggleStep(a, b); }
}
function updateNote(a, b) {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.updateNote(a, b); }
  else                { if (typeof CKADM !== 'undefined') CKADM.updateNote(a, b); }
}
function updateStepText(a, b, c) {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.updateStepText(a, b, c); }
  else                { if (typeof CKADM !== 'undefined') CKADM.updateStepText(a, b, c); }
}
function saveTripInfo(a) {
  if (_ckopsActive()) { if (typeof CKOPS !== 'undefined') CKOPS.saveTripInfo(a); }
  else                { if (typeof CKADM !== 'undefined') CKADM.saveTripInfo(a); }
}

/* ──────────────────────────────────────────────────────────────
   CHECKLIST NAVIGATION
────────────────────────────────────────────────────────────── */
function openChecklistOps() {
  var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
  if (!sess) { logout(); return; }
  var u = AUTH.users[sess.id];
  if (!u) { logout(); return; }
  hideAllScreens();
  document.getElementById('screen-checklist-ops').classList.add('active');
  window.scrollTo(0, 0);
  setTimeout(function() {
    if (typeof CKOPS !== 'undefined') {
      CKOPS.init({ name: u.name, key: sess.id, role: u.role });
    }
  }, 80);
}

function openChecklistAdm() {
  var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
  if (!sess) { logout(); return; }
  var u = AUTH.users[sess.id];
  if (!u) { logout(); return; }
  hideAllScreens();
  document.getElementById('screen-checklist-adm').classList.add('active');
  window.scrollTo(0, 0);
  setTimeout(function() {
    if (typeof CKADM !== 'undefined') {
      CKADM.init({ name: u.name, key: sess.id, role: u.role });
    }
  }, 80);
}

function goBackFromChecklist() {
  var sess = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
  if (sess && AUTH.users[sess.id]) { enterDashboard(AUTH.users[sess.id].role); }
  else { logout(); }
}

