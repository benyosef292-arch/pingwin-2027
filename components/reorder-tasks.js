/* Reorder tasks by dragging the grip or with arrow keys. */
/* ================= reorder tasks (drag the grip, or arrow keys on it) ================= */
function catKey(section){
  const host = section.closest('.view'); return host.id.replace('view-', '') + '|' + section.dataset.cat;
}
function saveOrder(...bodies){
  const o = readOrder();
  bodies.forEach(body => { o[catKey(body.closest('.cat'))] = [...body.querySelectorAll('.task')].map(r => r.dataset.tid); });
  tsave(ORDER_KEY, o);
}
function applyOrderAll(items){
  if (document.querySelector('.task.dragging')) return;
  document.querySelectorAll('.view').forEach(view => {
    const rows = new Map([...view.querySelectorAll('.task[data-tid]')].map(r => [r.dataset.tid, r]));
    if (!rows.size) return;
    const pid = view.id.replace('view-', '');
    view.querySelectorAll('.cat').forEach(section => {
      const list = items[catKey(section)]; if (!Array.isArray(list)) return;
      const body = section.querySelector('.cat-body');
      list.forEach(x => { const id = String(x).startsWith(pid + '|') ? x : pid + '|' + section.dataset.cat + '|' + x; const r = rows.get(id); if (r) body.appendChild(r); });
    });
  });
  refreshAll();
}
document.addEventListener('pointerdown', e => {
  const grip = e.target.closest('.grip'); if (!grip || e.button > 0 || !PG_EDIT) return;
  e.preventDefault();
  const row = grip.closest('.task'), body0 = row.parentElement, before0 = row.nextElementSibling;
  const view = row.closest('.view'); let body = body0;
  row.classList.add('dragging'); document.body.classList.add('reordering');
  let raf = 0, lastY = e.clientY;
  let lastX = e.clientX;
  const place = () => {
    raf = 0;
    const under = document.elementFromPoint(lastX, lastY);
    const tb = under && under.closest('.cat-body') || (under && under.closest('.cat') && under.closest('.cat').querySelector('.cat-body'));
    if (tb && tb !== body && view.contains(tb)) {
      body.closest('.cat').classList.remove('drop-to'); body = tb;
      if (body !== body0) body.closest('.cat').classList.add('drop-to');
    }
    const sibs = [...body.querySelectorAll('.task:not(.dragging):not(.hide)')];
    const next = sibs.find(s => { const r = s.getBoundingClientRect(); return lastY < r.top + r.height / 2; });
    if (next) { if (next !== row.nextElementSibling) body.insertBefore(row, next); }
    else if (body.lastElementChild !== row) body.appendChild(row);
    if (lastY < 130) window.scrollBy(0, -14); else if (lastY > innerHeight - 60) window.scrollBy(0, 14);
  };
  const move = ev => { lastY = ev.clientY; lastX = ev.clientX; if (!raf) raf = requestAnimationFrame(place); };
  const up = () => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    row.classList.remove('dragging'); document.body.classList.remove('reordering');
    view.querySelectorAll('.cat.drop-to').forEach(c => c.classList.remove('drop-to'));
    if (row.parentElement !== body0) {
      saveOrder(body0, row.parentElement); refreshAll();
      toast('המשימה הועברה ל' + catLabel(row.closest('.cat').dataset.cat));
    } else if (row.nextElementSibling !== before0) { saveOrder(body0); toast('הסדר נשמר'); }
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
});
document.addEventListener('keydown', e => {
  const grip = e.target.closest && e.target.closest('.grip'); if (!grip || !PG_EDIT) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  const row = grip.closest('.task'), body = row.parentElement;
  const step = el => { let x = e.key === 'ArrowUp' ? el.previousElementSibling : el.nextElementSibling; while (x && x.classList.contains('hide')) x = e.key === 'ArrowUp' ? x.previousElementSibling : x.nextElementSibling; return x; };
  const t = step(row);
  if (t) {
    if (e.key === 'ArrowUp') body.insertBefore(row, t); else body.insertBefore(row, t.nextElementSibling);
    grip.focus(); saveOrder(body); return;
  }
  const cats = [...row.closest('.view').querySelectorAll('.cat')], ci = cats.indexOf(row.closest('.cat'));
  const nc = cats[ci + (e.key === 'ArrowUp' ? -1 : 1)]; if (!nc) return;
  const nb = nc.querySelector('.cat-body');
  if (e.key === 'ArrowUp') nb.appendChild(row); else nb.insertBefore(row, nb.firstElementChild);
  grip.focus(); saveOrder(body, nb); refreshAll(); toast('המשימה הועברה ל' + catLabel(nc.dataset.cat));
});

