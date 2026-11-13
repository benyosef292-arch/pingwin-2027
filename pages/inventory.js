/* Warehouse inventory: stock list + team edits. */
/* ================= warehouse inventory (doc 'inv'): seed from the 2027 stock list + team edits ================= */
const INV_KEY = "penguin-inv";
const INV_SITES = ["לה דוז", "מונטגנברה", "פליין / אבוריאז", "לה פלאן", "לז ארק"];
const INV_CATS = [["מיתוג ודגלים", ""], ["מעטפות ומדבקות", ""], ["פתקים וברכות", "כל הפתקים ללא תאריך"], ["שילוט", ""], ["קייטנות וכנסים", ""], ["משרד ומחשוב", ""], ["שונות", ""]];
const INV_SEED = (() => {
  const L = [
    ["מיתוג ודגלים", [["באפים", 872, "72 + 160 + 40 + 600"], ["דגל פינגווין", 2, "1 + 1"], ["דגלים רגילים", 4, "2 + 2"], ["דגלי טיפה", 2, ""], ["דגלי טיפה", 2, "", "לה דוז"], ["דגלי טיפה", 1, "", "מונטגנברה"], ["פינגווינים", 2], ["פנטל", 1], ["וונזי פינגווין", 3], ["תיק פינגווין גב אפור (חדש עם טיקט)", 1], ["תיק פינגווין גלישה", 2], ["כיסוי גוגלס", 14]]],
    ["מעטפות ומדבקות", [["מעטפות", "2,429–2,479", "269 + 90 + 1000 + 850-900 + 220"], ["מעטפות גדולות", 4], ["מדבקות פינגווין קטנות (ריבוע)", 223, "55 + 168 (14×12)"], ["מדבקות פינגווין גדולות", 12], ["מדבקות פינגווין מלבן", 40], ["מדבקות פינגווין (גודל לא צוין)", 20, "מדבקות נפרדות, 5 דפים"], ["מדבקות פינגווינים צבעוניות", "4 דפים"], ["מדבקות חנוכה שמח", 100], ["מדבקות שמיות", "2 דפים"], ["מדבקות ריקות", "דף 1"]]],
    ["פתקים וברכות", [["פתקי / כרטיסיות פורים שמח", 200, "50 + 100 + 50"], ["פתקי / כרטיסיות יום הולדת שמח", 155, "45 + 50 + 60"], ["פתקי החלמה מהירה", 80, "30 + 50"], ["פתקי חנוכה", 30], ["פתקי 'הלכתי לאיבוד' קייטנה", 150], ["אגרות פורים/החלמה/יום הולדת (מעורב)", 79, "לא מחולק לפי סוג"]]],
    ["שילוט", [["שלטי ברוכים הבאים / WELCOME", 12, "1 + ענק 1 + קטן 5 + 3 + 2"], ["שילוט אוטובוסים פליין/אבוריאז", 18, "", "פליין / אבוריאז"], ["שלט MONGENEVRE", 2, "", "מונטגנברה"], ["שלט L2A מנויילן", 14, "", "לה דוז"], ["שלט PINGWIN מנויילן", 1], ["שלט מס' 7 מנויילן", 1], ["שלטים מס' 10–14 מנויילן", 5, "1 מכל מספר"], ["פלקט נציגים", 3]]],
    ["קייטנות וכנסים", [["מדליות קייטנות", 25], ["תעודות קייטנה", 25], ["תעודות כנס", 13]]],
    ["משרד ומחשוב", [["מדפסת", 2, "1 + 1"], ["טונר שחור", 3], ["טונר צבעוני", 3], ["טונר (צבע לא צוין)", 2, "1 + 1"], ["נייר למדפסת A4", "כמעט חבילה + חבילה"], ["כבלים למדפסת", ""], ["עכבר למחשב", 1], ["קופסת וויפיי", ""], ["שדכן / מהדק", 3, "1 + 1 + 1"], ["חבילות סיכות לשדכן", 5, "2 + 3"], ["קלסר", 1], ["פולדרים", 3, "לא במצב טוב"], ["מספריים", 3, "2 + 1"], ["טושים", ""], ["גומיות", "2 חבילות"], ["שמרדפים", "10 + חבילה"], ["שמרדף לה פלאן", 1, "", "לה פלאן"], ["שמרדף לז ארק", 1, "", "לז ארק"]]],
    ["שונות", [["חנוכייה + נרות חנוכה", "מעט", "כדאי להביא נרות מהבית"]]]
  ];
  const o = {}; let i = 0;
  L.forEach(([cat, rows]) => rows.forEach(([n, q, note, site]) => { i++; o['i' + String(i).padStart(2, '0')] = { cat, n, q: q === undefined ? '' : String(q), note: note || '', site: site || '', at: i }; }));
  /* required stock for Val Thorens + Les Menuires, from the company sheet "ציוד לפי אתר – עונת סקי 2027" (4.11.26) */
  const NEED = { "מעטפות": 616, "פתקי / כרטיסיות פורים שמח": 170, "פתקי / כרטיסיות יום הולדת שמח": 84, "פתקי החלמה מהירה": 173, "פתקי חנוכה": 123, "דגל פינגווין": 6, "דגלי טיפה": 1, "פולדרים": 4, "חנוכייה + נרות חנוכה": 3 };
  Object.values(o).forEach(x => { if (!x.site && NEED[x.n]) x.need = NEED[x.n]; });
  o.n01 = { cat: "מיתוג ודגלים", n: "דגל נציג", q: "0", note: "", site: "", need: 4, at: 12.5 };
  return o;
})();
let invFilter = 'all', invPending = false, invEditWas = null;
function invAll(){
  const st = tstore(INV_KEY), o = {};
  Object.keys(INV_SEED).forEach(id => { if (!(st[id] && st[id].gone)) o[id] = Object.assign({}, INV_SEED[id], st[id] || {}); });
  Object.keys(st).forEach(id => { if (!INV_SEED[id] && st[id] && st[id].n) o[id] = st[id]; });
  return o;
}
function invSave(id, patch){ const st = tstore(INV_KEY); st[id] = Object.assign({}, st[id], patch); tsave(INV_KEY, st); }
const invNum = q => /^\d+$/.test(String(q || '').trim());
const invHave = q => { const m = String(q || '').replace(/,/g, '').match(/\d+/); return m ? +m[0] : NaN; };
const invShort = x => x.need && !x.site ? (isNaN(invHave(x.q)) ? null : Math.max(0, x.need - invHave(x.q))) : 0;
const invSites = all => [...new Set(INV_SITES.concat(Object.values(all).map(x => x.site).filter(Boolean)))];
function invDate(t){ if (!t) return ''; const d = new Date(t); return d.getDate() + '.' + (d.getMonth() + 1); }
function renderInv(){
  const host = document.getElementById('invGrid'), hand = document.getElementById('invHand'); if (!host) return;
  const view = document.getElementById('view-inv');
  if (view.contains(document.activeElement) && document.activeElement.matches('input[type=text], select')) { invPending = true; return; }
  invPending = false; invEditWas = PG_EDIT;
  const all = invAll(), ids = Object.keys(all).sort((a, b) => (all[a].at || 0) - (all[b].at || 0));
  const dis = PG_EDIT ? '' : ' disabled', sites = invSites(all);
  const q = (document.getElementById('invQ').value || '').trim().toLowerCase();
  const hit = x => !q || (x.n + ' ' + x.note + ' ' + x.site + ' ' + (x.hoNote || '')).toLowerCase().includes(q);
  const others = ids.filter(id => all[id].site), left = others.filter(id => !all[id].ho).length;
  const pill = document.getElementById('tabInv'); if (pill) pill.textContent = left;
  document.getElementById('invHo').textContent = left;
  document.getElementById('invHoTot').textContent = 'להעביר לאתרים אחרים, מתוך ' + others.length;
  document.getElementById('invBar').style.width = (others.length ? (others.length - left) / others.length * 100 : 0) + '%';
  const f = document.getElementById('invF');
  f.innerHTML = [['all', 'הכל'], ['ours', 'שלנו'], ['others', 'אתרים אחרים']].map(([v, l]) => `<button type="button" data-f="${v}" aria-pressed="${invFilter === v}">${l}</button>`).join('');
  /* to complete: required stock (company sheet) minus what is in the warehouse */
  const sh = ids.filter(id => all[id].need && !all[id].site && invShort(all[id]) !== 0 && hit(all[id]));
  const shHtml = sh.length && invFilter !== 'others' ? `<section class="inv-need"><h3>להשלים</h3><div class="inv-nl">${sh.map(id => { const x = all[id], m = invShort(x); return `<div class="inv-ni"><b>${esc(x.n)}</b><span>${m === null ? 'צריך ' + x.need + ' · לספור' : 'חסר <em>' + m + '</em> · יש ' + invHave(x.q) + ' מתוך ' + x.need}</span></div>`; }).join('')}</div></section>` : '';
  /* handover: items of other sites, one card per site */
  const hs = invFilter === 'ours' ? [] : sites.map(s => [s, others.filter(id => all[id].site === s && hit(all[id]))]).filter(([, l]) => l.length);
  hand.innerHTML = shHtml + (hs.length ? `<section class="inv-hand"><h3>להעביר לאתרים אחרים</h3><div class="inv-hg">${hs.map(([s, l]) => `<div class="inv-hc"><div class="inv-hh"><b>${esc(s)}</b><i>${l.filter(id => all[id].ho).length}/${l.length}</i></div>${l.map(id => { const x = all[id]; return `
    <div class="inv-hr${x.ho ? ' done' : ''}" data-iid="${esc(id)}">
      <label class="qs-chk"><input type="checkbox" class="inv-ho" aria-label="הועבר"${x.ho ? ' checked' : ''}${dis}><span></span></label>
      <div class="inv-hm"><div class="inv-hn">${esc(x.n)} <em>${esc(x.q)}</em>${x.ho && x.hoAt ? `<small>הועבר ${invDate(x.hoAt)}</small>` : ''}</div><input type="text" class="inv-hnote" aria-label="למי ומתי" placeholder="למי / מתי…" value="${esc(x.hoNote || '')}"${dis}></div>
    </div>`; }).join('')}</div>`).join('')}</div></section>` : '');
  /* stock by category */
  const cats = [...INV_CATS.map(c => c[0]), ...new Set(ids.map(id => all[id].cat).filter(c => !INV_CATS.some(k => k[0] === c)))];
  host.innerHTML = cats.map(cat => {
    const l = ids.filter(id => all[id].cat === cat && hit(all[id]) && (invFilter === 'all' || (invFilter === 'ours' ? !all[id].site : !!all[id].site)));
    if (!l.length && (q || invFilter !== 'all')) return '';
    const cn = (INV_CATS.find(c => c[0] === cat) || [])[1];
    return `<section class="inv-cat" data-cat="${esc(cat)}"><div class="inv-ch"><b>${esc(cat)}</b>${cn ? `<span>${esc(cn)}</span>` : ''}<i>${l.length}</i></div>
      ${l.map(id => { const x = all[id]; return `<div class="inv-r${x.site ? ' other' : ''}${x.ho ? ' gone' : ''}" data-iid="${esc(id)}">
        <div class="inv-n">${esc(x.n)}${x.need && !x.site ? (s => s ? `<span class="inv-need-c">חסר ${s}</span>` : s === null ? `<span class="inv-need-c ok">צריך ${x.need}</span>` : `<span class="inv-need-c ok">צריך ${x.need} ✓</span>`)(invShort(x)) : ''}${x.site ? `<span class="inv-site">${esc(x.site)}${x.ho ? ' · הועבר' : ''}</span>` : ''}</div>
        <div class="inv-qty">${invNum(x.q) && PG_EDIT ? '<button type="button" class="inv-st" data-d="-1" aria-label="פחות">−</button>' : ''}<input type="text" class="inv-q1" aria-label="כמות" value="${esc(x.q)}" placeholder="—"${dis}>${invNum(x.q) && PG_EDIT ? '<button type="button" class="inv-st" data-d="1" aria-label="יותר">+</button>' : ''}</div>
        <input type="text" class="inv-note" aria-label="הערה" placeholder="הערה" value="${esc(x.note || '')}"${dis}>
        ${PG_EDIT ? '<button type="button" class="inv-del" aria-label="מחיקת פריט" title="מחיקה">×</button>' : ''}
      </div>`; }).join('')}
      ${PG_EDIT ? `<div class="inv-add"><input type="text" class="inv-an" placeholder="פריט חדש"><input type="text" class="inv-aq" placeholder="כמות"><button type="button" class="inv-ab">הוספה</button></div>` : ''}
    </section>`;
  }).join('') || '<p class="inv-none">לא נמצא</p>';
}
document.addEventListener('change', async e => {
  const t = e.target; if (!t.closest || !t.closest('#view-inv') || !PG_EDIT) return;
  const row = t.closest('[data-iid]'); if (!row) return;
  const id = row.dataset.iid;
  if (t.classList.contains('inv-ho')) { invSave(id, { ho: t.checked, hoAt: t.checked ? Date.now() : 0 }); renderInv(); return; }
  if (t.classList.contains('inv-hnote')) invSave(id, { hoNote: t.value.trim() });
  if (t.classList.contains('inv-q1')) invSave(id, { q: t.value.trim() });
  if (t.classList.contains('inv-note')) invSave(id, { note: t.value.trim() });
});
document.addEventListener('focusout', e => { if (invPending && e.target.closest && e.target.closest('#view-inv')) setTimeout(() => { if (invPending) renderInv(); }, 50); });
document.addEventListener('input', e => { if (e.target.id === 'invQ') renderInv(); });
document.addEventListener('click', async e => {
  const t = e.target; if (!t.closest || !t.closest('#view-inv')) return;
  const fb = t.closest('#invF button'); if (fb) { invFilter = fb.dataset.f; renderInv(); return; }
  if (!PG_EDIT) return;
  const st = t.closest('.inv-st');
  if (st) { const row = st.closest('[data-iid]'), x = invAll()[row.dataset.iid]; if (!x || !invNum(x.q)) return; invSave(row.dataset.iid, { q: String(Math.max(0, +x.q + +st.dataset.d)) }); renderInv(); return; }
  const del = t.closest('.inv-del');
  if (del) { const id = del.closest('[data-iid]').dataset.iid, x = invAll()[id]; if (!(await askConfirm('למחוק את "' + (x ? x.n : '') + '"?'))) return; const s = tstore(INV_KEY); if (INV_SEED[id]) s[id] = { gone: 1 }; else delete s[id]; tsave(INV_KEY, s); renderInv(); return; }
  const ab = t.closest('.inv-ab');
  if (ab) {
    const box = ab.closest('.inv-add'), n = box.querySelector('.inv-an').value.trim().replace(/\s+/g, ' '), qq = box.querySelector('.inv-aq').value.trim();
    if (!n) { box.querySelector('.inv-an').focus(); return; }
    const s = tstore(INV_KEY); s['u' + Date.now()] = { cat: ab.closest('.inv-cat').dataset.cat, n, q: qq, note: '', site: '', at: Date.now() }; tsave(INV_KEY, s);
    if (document.activeElement) document.activeElement.blur(); invPending = false; renderInv(); toast('הפריט נוסף');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest && e.target.closest('.inv-add')) { e.preventDefault(); e.target.closest('.inv-add').querySelector('.inv-ab').click(); } });
new MutationObserver(() => { if (invEditWas !== PG_EDIT) renderInv(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
renderInv();
