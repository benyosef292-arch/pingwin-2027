/* Sync between localStorage and the shared Google Sheet store. */
/* ================= shared storage (claude db) ================= */
(function(){
  const chip = document.getElementById('syncChip'), txt = document.getElementById('syncTxt');
  const setChip = (st, label) => { chip.dataset.s = st; txt.textContent = label; };
  const DOCS = { checks: KEY, voices: TKEY.voices, hw: TKEY.hw, sums: TKEY.sums, wform: TKEY.wform, order: ORDER_KEY, resp: TKEY.resp, owners: OWN_KEY, dl: DL_KEY, custom: CUSTOM_KEY, qs: QS_KEY, sup: SUP_KEY, weekly: "penguin-weekly", inv: INV_KEY, pw: "penguin-pw" };
  const readLocal = k => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch(e){ return {}; } };
  const writeLocal = (k, o) => { try { localStorage.setItem(k, JSON.stringify(o)); } catch(e){} };
  let db = null, readOnly = false;
  const last = {}, timers = {}, busy = {}, again = {};

  function applyRemote(name, items){
    const k = DOCS[name];
    writeLocal(k, items);
    if (name === 'checks'){
      state = Object.assign({}, items);
      document.querySelectorAll('input[data-id]').forEach(cb => { cb.checked = !!state[cb.dataset.id]; });
      refreshAll(); splitRender();
    } else if (name === 'order'){
      applyOrderAll(items); splitRender();
    } else if (name === 'owners'){
      splitRender();
    } else if (name === 'dl'){
      rerenderDl();
    } else if (name === 'custom'){
      rebuildBoard();
    } else if (name === 'qs'){
      renderQs();
    } else if (name === 'sup'){
      renderSup();
    } else if (name === 'inv'){
      renderInv();
    } else if (name === 'weekly'){
      if (window.renderWk) window.renderWk();
    } else if (name === 'pw'){
      if (window.pwRender) window.pwRender();
    } else {
      Object.keys(items).forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== document.activeElement && el.value !== items[id]) el.value = items[id];
      });
      if (name === 'resp') document.querySelectorAll('#view-deck .resp-f').forEach(el => { if (el !== document.activeElement && !(el.id in items) && el.value) el.value = ''; });
      if (name === 'resp' && window.updateResp) window.updateResp();
      if ((name === 'wform' || name === 'sums') && window.wfRefresh) window.wfRefresh();
    }
  }

  async function push(name){
    if (!db || readOnly) return;
    if (busy[name]) { again[name] = true; return; }
    const items = name === 'checks' ? state : readLocal(DOCS[name]);
    const json = JSON.stringify(items);
    if (json === last[name]) return;
    busy[name] = true; setChip('saving', 'שומר…');
    try {
      await db.doc('state/' + name).set({ items: JSON.parse(json), updatedAt: new Date().toISOString() });
      last[name] = json; setChip('ok', 'נשמר לכל הצוות');
    } catch(e){
      if (e && e.code === 'invalid_argument'){ readOnly = true; setChip('local', 'צפייה בלבד'); }
      else setChip('local', 'לא נשמר · ננסה שוב');
    }
    busy[name] = false;
    if (again[name]) { again[name] = false; push(name); }
  }
  const schedule = (name, ms) => { clearTimeout(timers[name]); timers[name] = setTimeout(() => push(name), ms); };

  /* hook the existing save paths */
  const _save = save;
  save = function(){ _save(); schedule('checks', 300); };
  const _tsave = tsave;
  tsave = function(k, o){ _tsave(k, o); const n = Object.keys(DOCS).find(x => DOCS[x] === k); if (n) schedule(n, 900); };

  window.PenguinSync = { pushAll: () => Promise.all(Object.keys(DOCS).map(push)) };

  (window.claude && claude.use ? claude.use('db') : Promise.resolve(null)).then(d => {
    if (!d) { setChip('local', 'שמור במכשיר הזה'); return; }
    db = d; setChip('saving', 'מתחבר…');
    Object.keys(DOCS).forEach(name => {
      const first = { v: true };
      db.doc('state/' + name).onSnapshot(snap => {
        if (snap.exists){
          const items = (snap.data() || {}).items || {};
          const json = JSON.stringify(items);
          if (!snap.metadata.hasPendingWrites && json !== last[name]) { last[name] = json; applyRemote(name, items); }
          if (!snap.metadata.fromCache) setChip('ok', 'נשמר לכל הצוות');
        } else if (first.v && !snap.metadata.fromCache){
          /* nothing shared yet: upload what this device already has */
          const local = name === 'checks' ? state : readLocal(DOCS[name]);
          if (Object.keys(local).length) push(name); else setChip('ok', 'נשמר לכל הצוות');
        }
        if (!snap.metadata.fromCache) first.v = false;
      }, () => setChip('local', 'שמור במכשיר הזה'));
    });
  });
})();

/* external map: show a clear placeholder if it cannot load */
document.querySelectorAll('.mapcard .mp').forEach(el => {
  const m = /url\(['"]?([^'")]+)/.exec(el.style.backgroundImage || '');
  if (!m || m[1].startsWith('data:')) return;
  const im = new Image(); im.onerror = () => el.classList.add('missing'); im.src = m[1];
});

