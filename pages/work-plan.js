/* Work plan: stages x people. */
/* ================= work plan: stages x people ================= */
function renderPlan(){
  const host = document.getElementById('planGrid'); if (!host) return;
  const ov = dlOv(), own = tstore(OWN_KEY), PC = window.PERSON_COLORS || {};
  const PREP = ["ימים 1–3 בהכנה", "ימים 4–6 בהכנה", "יום לפני הגעת הלקוחות"];
  const rows = [];
  const add = (key, ph) => (DATA[key] || []).forEach(g => g.tasks.forEach(t => { const id = `${ph}|${g.cat}|${t.t}`; rows.push({ id, t: t.label || t.t, dl: ov[id] || g.dl, who: own[id] || SPLIT_DEFAULT[id] || (ph === 'p2' ? 'כולם' : 'פתוח'), done: isDone(id), tag: t.tag || '' }); }));
  add('israel', 'p1'); add('onsite', 'p2');
  const cols1 = ["21.10.26", "בבית", "ישיבת צוות 3", "פגישה 2", "ישיבת צוות במרכז", "11.11.26"];
  rows.forEach(r => { if (!PREP.includes(r.dl) && !cols1.includes(r.dl)) cols1.push(r.dl); });
  const cols2 = PREP.slice();
  rows.forEach(r => { if (!cols1.includes(r.dl) && !cols2.includes(r.dl)) cols2.push(r.dl); });
  const done = rows.filter(r => r.done).length;
  const a = document.getElementById('planDone'); if (a) a.textContent = done;
  const b = document.getElementById('planTot'); if (b) b.textContent = 'מתוך ' + rows.length + ' הושלמו';
  const c = document.getElementById('planBar'); if (c) c.style.width = (rows.length ? done / rows.length * 100 : 0) + '%';
  const pname = p => p === 'כולם' ? 'כולם ביחד' : (p === 'פתוח' ? 'לא משובץ' : p);
  const chip = (r, p) => `<span class="pl-chip ${r.done ? 'done' : ''}" ${PC[p] ? `style="--pc:${PC[p]}"` : ""} data-who="${esc(p)}" title="${esc(r.t)}">${r.done ? '✓ ' : ''}${esc(r.t)}${r.tag ? `<em>${esc(r.tag)}</em>` : ''}</span>`;
  const ms = (k, i, list) => { const d = list.filter(r => r.done).length, full = list.length && d === list.length;
    return `<div class="pl-ms ${full ? 'full' : ''}" style="--f:${list.length ? d / list.length : 0}"><span class="pl-dot">${full ? '✓' : i}</span><b>${esc(dlLabel(k))}</b><em>${d}/${list.length}</em><i class="pl-mb"><i></i></i></div>`; };
  function block(cols, n0, groups){
    const rs = rows.filter(r => cols.includes(r.dl));
    const ppl = ['בן', 'יותם', 'דורון', 'קרן', 'כולם', 'פתוח'].filter(p => ['בן', 'יותם', 'דורון', 'קרן'].includes(p) || rs.some(r => r.who === p));
    const head = cols.map((k, i) => ms(k, n0 + i, rs.filter(r => r.dl === k))).join('');
    const body = ppl.map(p => `<div class="pl-who" ${PC[p] ? `style="--pc:${PC[p]}"` : ""} data-who="${esc(p)}"><b>${esc(pname(p))}</b><span>${rs.filter(r => r.who === p && !r.done).length} פתוחות</span></div>` + cols.map(k => `<div class="pl-cell">${rs.filter(r => r.who === p && r.dl === k).map(r => chip(r, p)).join('')}</div>`).join('')).join('');
    const list = cols.map((k, i) => { const l = rs.filter(r => r.dl === k);
      const grps = ppl.map(p => { const x = l.filter(r => r.who === p); return x.length ? `<div class="pl-grp" ${PC[p] ? `style="--pc:${PC[p]}"` : ''}><b>${esc(pname(p))}</b><div>${x.map(r => chip(r, p)).join('')}</div></div>` : ''; }).join('');
      return `<div class="pl-stage">${ms(k, n0 + i, l)}${grps || '<p class="pl-empty">אין משימות בשלב הזה</p>'}</div>`; }).join('');
    return `<div class="pl-grid" style="--n:${cols.length}"><div class="pl-corner pl-g0"></div>${groups.map(g => `<div class="pl-grp-h" style="grid-column:span ${g[1]}"><b>${g[0]}</b><span>${g[2]}</span></div>`).join('')}<div class="pl-corner"></div>${head}${body}</div>`;
  }
  host.innerHTML = `<p class="pl-hint">גוללים שמאלה כדי לראות את כל השלבים, עד שבוע ההכנה באתר.</p><div class="pl-scroll" tabindex="0" aria-label="תוכנית העבודה, גלילה לצדדים">` + block(cols1.concat(cols2), 1, [['לפני היציאה', cols1.length, 'בארץ, עד הטיסה ב־26.11'], ['שבוע ההכנה באתר', cols2.length, '26.11–04.12, הלקוחות מגיעים ב־05.12']]) + `</div>`;
}
{ const _s3 = splitRender; splitRender = function(){ _s3.apply(this, arguments); try { renderPlan(); } catch(e){} }; }
renderPlan();



