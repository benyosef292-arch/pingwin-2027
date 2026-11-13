/* Split the Israel-phase tasks between the team; task owners. */
/* ================= split tasks between the team ================= */
const SPLIT_ORDER = ["21.10.26", "בבית", "ישיבת צוות 3", "פגישה 2", "ישיבת צוות במרכז", "11.11.26", "24.11.26", "ימים 1–3 בהכנה", "ימים 4–6 בהכנה", "יום לפני הגעת הלקוחות"];
const SPLIT_PEOPLE = [["בן","ראש צוות · אוטובוסים צרפת"],["יותם","אחראי לה מנואיר"],["דורון",""],["קרן",""]];
const OWN_KEY = "penguin-owners";
const SPLIT_OPTS = ["כולם", "פתוח", "בן", "יותם", "דורון", "קרן"];
let spOnly = "";
function splitRender(){
  if (!SPLIT_READY) return;
  const host = document.getElementById('spBody'); if (!host) return;
  const ov = (()=>{ try { return JSON.parse(localStorage.getItem(OWN_KEY) || "{}") || {}; } catch(e){ return {}; } })();
  const rows = [];
  PHASES.forEach(p => {
    const groups = DATA[p.key];
    placeTasks(p.id, groups).forEach((items, gi) => {
      const g = groups[gi];
      const ovd = dlOv(); items.forEach(({ t, id }) => rows.push({ id, t, b: ovd[id] || g.dl, gdl: g.dl, moved: !!ovd[id] && ovd[id] !== g.dl, note: DL_NOTE[ovd[id] || g.dl] || g.dlnote || "", cat: g.cat, ph: p.title, who: ov[id] || SPLIT_DEFAULT[id] || "פתוח", w: SPLIT_EFF[id] || 1 }));
    });
  });
  const tot = {}, cnt = {}, done = {};
  rows.forEach(r => { tot[r.who] = (tot[r.who] || 0) + r.w; cnt[r.who] = (cnt[r.who] || 0) + 1; if (isDone(r.id)) done[r.who] = (done[r.who] || 0) + 1; });
  const shared = cnt['כולם'] || 0;
  const max = Math.max(1, ...SPLIT_PEOPLE.map(([n]) => tot[n] || 0));
  document.getElementById('spPeople').innerHTML = SPLIT_PEOPLE.map(([n, role]) => `<div class="sp-p"><div class="sp-ph"><b>${n}</b>${role ? `<span>${role}</span>` : ""}</div>
    <div class="sp-pn"><b>${cnt[n] || 0}</b> משימות · <b>${(tot[n] || 0).toFixed(1).replace('.0','')}</b> נק׳ זמן · ${done[n] || 0} בוצעו</div><div class="sp-pn">ועוד ${shared} משימות של כולם ביחד${cnt['פתוח'] ? ` · ${cnt['פתוח']} עוד לא משובצות` : ""}</div>
    <div class="bar"><i style="width:${(tot[n] || 0) / max * 100}%"></i></div></div>`).join("");
  document.getElementById('spFilter').innerHTML = [["", "כולם"]].concat(SPLIT_PEOPLE.map(([n]) => [n, n])).map(([v, l]) => `<button type="button" class="sp-chip" aria-pressed="${spOnly === v}" data-only="${esc(v)}">${l}</button>`).join("");
  const buckets = SPLIT_ORDER.map(b => [b, rows.filter(r => r.b === b)]).filter(([, l]) => l.length);
  const effTxt = w => w <= 0.5 ? ['e05','קצר'] : (w >= 2 ? ['e2','ארוך'] : ['e1','בינוני']);
  host.innerHTML = buckets.map(([b, list]) => {
    const note = list[0].note, phase = list[0].ph;
    const cols = SPLIT_PEOPLE.filter(([n]) => !spOnly || n === spOnly).map(([n]) => {
      const mine = list.filter(r => r.who === n);
      return `<div class="sp-col"><div class="sp-ch">${n}<span>${mine.length}</span></div>${mine.map(r => { const [ec, et] = effTxt(r.w); return `<div class="sp-t ${isDone(r.id) ? 'done' : ''}">
        <div class="sp-tt">${esc(r.t.label || r.t.t)}</div>
        <div class="sp-tm"><label class="sp-done"><input type="checkbox" class="sp-chk" data-id="${esc(r.id)}"${isDone(r.id) ? " checked" : ""}><span>בוצע</span></label><span class="sp-eff ${ec}">${et}</span><span class="sp-cat">${esc(catLabel(r.cat))}</span>
        <select class="sp-dl" data-id="${esc(r.id)}" data-gdl="${esc(r.gdl)}" aria-label="יעד">${DL_OPTS.map(([v, l]) => `<option value="${esc(v)}"${v === r.b ? ' selected' : ''}>${esc(l)}</option>`).join("")}</select><select class="sp-sel" data-id="${esc(r.id)}" aria-label="אחראי">${SPLIT_OPTS.map(m => `<option${m === n ? ' selected' : ''}>${m}</option>`).join("")}</select></div></div>`; }).join("") || '<div class="sp-empty">אין משימות כאן</div>'}</div>`;
    }).join("");
    const grp = (who, title, cls) => { const sh = list.filter(r => r.who === who); return sh.length ? `<div class="sp-all ${cls}"><div class="sp-ah">${title} <span>${sh.length}</span></div><div class="sp-ag">${sh.map(r => { const [ec, et] = effTxt(r.w); return `<div class="sp-t ${isDone(r.id) ? 'done' : ''}"><div class="sp-tt">${esc(r.t.label || r.t.t)}</div><div class="sp-tm"><label class="sp-done"><input type="checkbox" class="sp-chk" data-id="${esc(r.id)}"${isDone(r.id) ? " checked" : ""}><span>בוצע</span></label><span class="sp-eff ${ec}">${et}</span><span class="sp-cat">${esc(catLabel(r.cat))}</span><select class="sp-dl" data-id="${esc(r.id)}" data-gdl="${esc(r.gdl)}" aria-label="יעד">${DL_OPTS.map(([v, l]) => `<option value="${esc(v)}"${v === r.b ? ' selected' : ''}>${esc(l)}</option>`).join("")}</select><select class="sp-sel" data-id="${esc(r.id)}" aria-label="אחראי">${SPLIT_OPTS.map(m => `<option${m === who ? ' selected' : ''}>${m}</option>`).join("")}</select></div></div>`; }).join("")}</div></div>` : ""; };
    const shHtml = (spOnly ? "" : grp('פתוח', 'עוד לא משובץ', 'open')) + grp('כולם', 'כולם ביחד', '');
    return `<section class="sp-b"><div class="sp-bh"><b>${esc(dlLabel(b))}</b><span>${esc(note)}</span><i>${esc(phase)} · ${list.length} משימות</i></div>${shHtml}<div class="sp-cols ${spOnly ? 'one' : ''}">${cols}</div></section>`;
  }).join("");
}
document.addEventListener('change', e => {
  const ck = e.target.closest && e.target.closest('.sp-chk');
  if (ck) {
    const id = ck.dataset.id;
    if (ck.checked) state[id] = 1; else delete state[id];
    save();
    document.querySelectorAll('input[data-id]').forEach(b => { if (b.dataset.id === id && b !== ck) b.checked = ck.checked; });
    refreshAll(); toast(ck.checked ? 'סומן כבוצע' : 'הסימון בוטל');
    return;
  }
  const ds = e.target.closest && e.target.closest('.sp-dl, .dl-sel');
  if (ds && !PG_OWNER) { splitRender(); rerenderDl(); return; }
  if (ds) {
    const o = tstore(DL_KEY), id = ds.dataset.id, v = ds.value;
    if (!v || v === ds.dataset.gdl) delete o[id]; else o[id] = v;
    tsave(DL_KEY, o); rerenderDl(); toast(v ? 'היעד עודכן ל' + dlLabel(v) : 'היעד חזר לזה של הנושא');
    return;
  }
  const osel = e.target.closest && e.target.closest('select.own');
  if (osel) { if (!PG_EDIT) return; const o = tstore(OWN_KEY); o[osel.dataset.id] = osel.value; tsave(OWN_KEY, o); splitRender(); toast('האחראי עודכן'); return; }
  const sel = e.target.closest && e.target.closest('.sp-sel'); if (!sel) return;
  if (!PG_EDIT) { splitRender(); return; }
  const o = tstore(OWN_KEY); o[sel.dataset.id] = sel.value; tsave(OWN_KEY, o); splitRender(); toast('המשימה עברה ל' + sel.value);
});
document.addEventListener('click', e => {
  const c = e.target.closest && e.target.closest('.sp-chip'); if (c) { spOnly = c.dataset.only; splitRender(); return; }
  if (e.target.closest && e.target.closest('#spReset') && PG_OWNER) {
    askConfirm('להחזיר את החלוקה להצעה המקורית? שינויי האחראי שנעשו יימחקו.').then(y => { if (!y) return; tsave(OWN_KEY, {}); splitRender(); toast('החלוקה חזרה להצעה המקורית'); });
  }
});
function rerenderDl(){
  if (typeof rebuildBoard === 'function') { rebuildBoard(); }
  splitRender();
  const o = dlOv();
  document.querySelectorAll('select.dl-sel').forEach(sl => { const v = o[sl.dataset.id] || sl.dataset.gdl || ''; if (sl !== document.activeElement) sl.value = v; sl.closest('.dlpick').classList.toggle('set', !!o[sl.dataset.id] && o[sl.dataset.id] !== sl.dataset.gdl); });
}
var SPLIT_READY = true;
splitRender();
/* owner chip on every task in the general board lists */
function paintOwners(){
  const ov = tstore(OWN_KEY), PC = window.PERSON_COLORS || {};
  document.querySelectorAll('.view .task[data-tid]').forEach(row => {
    const id = row.dataset.tid, who = ov[id] || SPLIT_DEFAULT[id] || 'פתוח';
    const tx = row.querySelector('.tx'); if (!tx) return;
    let c = tx.querySelector('.own');
    const want = PG_EDIT ? 'SELECT' : 'SPAN';
    if (c && c.tagName !== want) { c.remove(); c = null; }
    if (!c) {
      c = document.createElement(want.toLowerCase()); c.className = 'own'; c.dataset.id = id;
      if (PG_EDIT) { c.setAttribute('aria-label', 'אחראי'); c.innerHTML = SPLIT_OPTS.map(m => `<option value="${esc(m)}">${m === 'כולם' ? 'כולם ביחד' : (m === 'פתוח' ? 'עוד לא משובץ' : esc(m))}</option>`).join(''); }
      const lab = tx.querySelector('label'); lab ? lab.after(c) : tx.appendChild(c);
    }
    const txt = who === 'כולם' ? 'כולם ביחד' : (who === 'פתוח' ? 'עוד לא משובץ' : who);
    if (PG_EDIT) { if (c.value !== who && c !== document.activeElement) c.value = who; }
    else if (c.textContent !== txt) c.textContent = txt;
    c.dataset.who = who;
    if (PC[who]) c.style.setProperty('--pc', PC[who]); else c.style.removeProperty('--pc');
    if (row.dataset.search0 == null) row.dataset.search0 = row.dataset.search || '';
    row.dataset.search = row.dataset.search0 + ' ' + who + ' ' + txt;
  });
}
{ const _spr = splitRender; splitRender = function(){ _spr.apply(this, arguments); paintOwners(); }; }
paintOwners();
