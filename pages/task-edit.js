/* Add / delete tasks (owner). */
/* ================= add / delete tasks (owner) ================= */
function rebuildBoard(){
  mergeCustom(); fillAllTasks();
  PHASES.forEach(p => {
    const host = document.getElementById("view-" + p.id); if (!host) return;
    const q = host.querySelector("[data-search-input]")?.value || "", oo = host.querySelector("[data-only-open]")?.checked;
    host.innerHTML = renderPhase(p.id);
    const qi = host.querySelector("[data-search-input]"); if (qi) qi.value = q;
    const o2 = host.querySelector("[data-only-open]"); if (o2) o2.checked = !!oo;
    applyFilter(host);
  });
  refreshAll();
  if (typeof paintOwners === 'function') paintOwners();
  if (typeof pgLock === 'function') pgLock();
}
function phaseKeyOf(el){ const v = el.closest('.view'); const p = v && PHASES.find(p => 'view-' + p.id === v.id); return p ? p.key : null; }
document.addEventListener('click', async e => {
  const t = e.target;
  const add = t.closest && t.closest('.add-btn');
  if (add) {
    if (!PG_EDIT) return;
    const box = add.parentElement;
    box.innerHTML = `<div class="add-form"><input class="af-t" type="text" placeholder="שם המשימה" maxlength="140"><input class="af-d" type="text" placeholder="פירוט (לא חובה)" maxlength="300"><div class="af-b"><button type="button" class="af-save">הוספה</button><button type="button" class="af-cancel">ביטול</button></div></div>`;
    box.querySelector('.af-t').focus(); return;
  }
  if (t.closest && t.closest('.af-cancel')) { const box = t.closest('.cat-add'); box.innerHTML = '<button type="button" class="add-btn">+ הוספת משימה</button>'; return; }
  if (t.closest && t.closest('.af-save')) {
    if (!PG_EDIT) return;
    const box = t.closest('.cat-add'), ph = phaseKeyOf(box);
    let cat = t.closest('.cat').dataset.cat, meet = null;
    if (cat.startsWith('m:')) { meet = cat.slice(2); cat = 'הכנה לעונה'; }
    const name = box.querySelector('.af-t').value.trim().replace(/\s+/g, ' '), det = box.querySelector('.af-d').value.trim();
    if (!name) { box.querySelector('.af-t').focus(); return; }
    const g = (DATA[ph] || []).find(g => g.cat === cat);
    if (g && g.tasks.some(x => x.t === name)) { toast('כבר יש משימה בשם הזה בנושא'); return; }
    const c = tstore(CUSTOM_KEY); c['c' + Date.now()] = { ph, cat, t: name, d: det, at: Date.now() };
    tsave(CUSTOM_KEY, c);
    if (meet) { const g0 = (DATA[ph] || []).find(g => g.cat === cat); const o = tstore(DL_KEY), id = 'p1|' + cat + '|' + name; if (g0 && g0.dl === meet) delete o[id]; else o[id] = meet; tsave(DL_KEY, o); }
    rebuildBoard(); toast('המשימה נוספה'); return;
  }
  const del = t.closest && t.closest('.task-del');
  if (del) {
    if (!PG_EDIT) return;
    e.preventDefault();
    const row = del.closest('.task'), cat = row.closest('.cat').dataset.cat, ph = phaseKeyOf(row), name = row.dataset.t;
    if (!(await askConfirm('למחוק את המשימה "' + name + '"?'))) return;
    const c = tstore(CUSTOM_KEY);
    Object.keys(c).forEach(k => { if (c[k] && c[k].ph === ph && (cat.startsWith('m:') || c[k].cat === cat) && c[k].t === name) delete c[k]; });
    tsave(CUSTOM_KEY, c); rebuildBoard(); toast('המשימה נמחקה');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.closest && e.target.closest('.add-form')) { e.preventDefault(); e.target.closest('.add-form').querySelector('.af-save').click(); }
  if (e.key === 'Escape' && e.target.closest && e.target.closest('.add-form')) e.target.closest('.add-form').querySelector('.af-cancel').click();
});
