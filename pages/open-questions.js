/* Open questions for suppliers / the office. */
/* ================= open questions (suppliers / Smadar) ================= */
const QS_KEY = "penguin-qs";
/* questions from the meeting with Smadar (2.11.26); saved answers/done/deletions override them */
function qsAll(){ const q = Object.assign({}, tstore(QS_KEY)); Object.keys(QS_SEED).forEach(id => { q[id] = q[id] ? Object.assign({}, QS_SEED[id], q[id]) : Object.assign({}, QS_SEED[id]); }); Object.keys(q).forEach(id => { if (q[id] && q[id].gone) delete q[id]; }); return q; }
const QS_AUD = [["sup", "שאלות לספקים", "סקיפס, מסעדות, חנויות וכל ספק אחר"], ["gen", "שאלות לסמדר · כללי", "מחסנים, אנשי קשר, הסדרים מול חנויות"]];
let qsPending = false;
function renderQs(){
  const host = document.getElementById('qsGrid'); if (!host) return;
  if (host.contains(document.activeElement) && document.activeElement.matches('.qs-a, .qs-nt, .qs-nq')) { qsPending = true; return; }
  qsPending = false;
  const q = qsAll(), list = Object.entries(q).filter(([, x]) => x && x.q).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
  const open = list.filter(([, x]) => !x.done).length;
  const pill = document.getElementById('tabQs'); if (pill) pill.textContent = open;
  const o = document.getElementById('qsOpen'); if (o) o.textContent = open;
  const t = document.getElementById('qsTot'); if (t) t.textContent = 'פתוחות מתוך ' + list.length;
  const bar = document.getElementById('qsBar'); if (bar) bar.style.width = (list.length ? (list.length - open) / list.length * 100 : 0) + '%';
  host.innerHTML = QS_AUD.map(([aud, title, sub]) => {
    const mine = list.filter(([, x]) => x.aud === aud);
    const topics = [...new Set(mine.map(([, x]) => x.topic || 'כללי'))];
    const body = topics.map(tp => `<div class="qs-topic"><h4>${esc(tp)}</h4>${mine.filter(([, x]) => (x.topic || 'כללי') === tp).map(([id, x]) => `
      <div class="qs-row ${x.done ? 'done' : ''}" data-qid="${esc(id)}">
        <label class="qs-chk"><input type="checkbox" class="qs-done" aria-label="השאלה נסגרה"${x.done ? ' checked' : ''}><span></span></label>
        <div class="qs-main"><div class="qs-q">${esc(x.q)}</div><input class="qs-a" type="text" aria-label="תשובה" placeholder="תשובה…" value="${esc(x.a || '')}"></div>
        <button type="button" class="qs-del" aria-label="מחיקת השאלה" title="מחיקה">×</button>
      </div>`).join('')}</div>`).join('') || '<div class="qs-empty">אין עדיין שאלות</div>';
    const dl = `qs-dl-${aud}`;
    return `<section class="qs-card" data-aud="${aud}"><div class="qs-head"><b>${esc(title)}</b><span>${esc(sub)}</span><i>${mine.filter(([, x]) => !x.done).length} פתוחות</i></div>
      <div class="qs-body">${body}</div>
      <div class="qs-add"><input class="qs-nt" list="${dl}" placeholder="נושא (למשל סקיפס)"><datalist id="${dl}">${topics.map(tp => `<option value="${esc(tp)}">`).join('')}</datalist><input class="qs-nq" placeholder="שאלה חדשה"><button type="button" class="qs-addb">הוספה</button></div></section>`;
  }).join('');
}
function qsSave(fn){ const q = tstore(QS_KEY), all = qsAll(); Object.keys(QS_SEED).forEach(id => { if (!q[id] && all[id]) q[id] = Object.assign({}, all[id]); }); fn(q); tsave(QS_KEY, q); }
document.addEventListener('change', e => {
  const t = e.target; if (!t.closest || !t.closest('#view-qs')) return;
  const row = t.closest('.qs-row'); if (!row) return;
  const id = row.dataset.qid;
  if (t.classList.contains('qs-done')) { qsSave(q => { if (q[id]) q[id].done = t.checked; }); row.classList.toggle('done', t.checked); renderQs(); }
  if (t.classList.contains('qs-a')) { qsSave(q => { if (q[id]) q[id].a = t.value.trim(); }); }
});
document.addEventListener('focusout', e => { if (qsPending && e.target.closest && e.target.closest('#view-qs')) setTimeout(() => { if (qsPending) renderQs(); }, 50); });
document.addEventListener('click', async e => {
  const t = e.target; if (!t.closest || !t.closest('#view-qs')) return;
  if (t.closest('.qs-addb')) {
    const card = t.closest('.qs-card'), tp = card.querySelector('.qs-nt').value.trim() || 'כללי', qq = card.querySelector('.qs-nq').value.trim();
    if (!qq) { card.querySelector('.qs-nq').focus(); return; }
    qsSave(q => { q['q' + Date.now()] = { aud: card.dataset.aud, topic: tp, q: qq, a: '', done: false, at: Date.now() }; });
    if (document.activeElement) document.activeElement.blur(); qsPending = false; renderQs(); toast('השאלה נוספה'); return;
  }
  const del = t.closest('.qs-del');
  if (del) { const id = del.closest('.qs-row').dataset.qid; if (!(await askConfirm('למחוק את השאלה?'))) return; qsSave(q => { if (QS_SEED[id]) q[id] = { gone: 1 }; else delete q[id]; }); renderQs(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest && e.target.closest('.qs-add')) { e.preventDefault(); e.target.closest('.qs-add').querySelector('.qs-addb').click(); } });
renderQs();
