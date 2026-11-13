/* Supplier emails before the prep week. */
/* ================= suppliers: emails before the prep week ================= */
const SUP_KEY = "penguin-sup";
const SUP_ST = [["", "טרם נשלח"], ["sent", "נשלח"], ["ans", "ענו"], ["meet", "נקבעה פגישה"], ["done", "סגור"]];
const SUP_EN = { "בן": "Ben", "יותם": "Yotam", "דורון": "Doron", "קרן": "Keren" };
/* contact details come from the private contacts list at runtime, matched by role or name */
const SUPS = [
  ["ציוד", [
    { id: "eskiador", area: 8, n: "Sport 2000 · Eskiador", t: "shop", hi: "Yoann", m: c => /ESKIADOR/i.test(c.r) },
    { id: "intersport", area: 8, n: "Intersport", t: "shop", late: 1, hi: "", m: c => /INTERSPORT/i.test(c.r + ' ' + c.n) },
    { id: "sp-kashmir", area: 8, n: "Sport 2000 · Kashmir", t: "shop", hi: "Dominique", m: c => /חנות קשמיר/.test(c.r) },
    { id: "sp-oxalys", area: 8, n: "Sport 2000 · Oxalys", t: "shop", hi: "Dominique", m: c => /חנות אוקסליס/.test(c.r) },
    { id: "skiset", area: 8, n: "Skiset", t: "shop", late: 1, hi: "Christophe", m: c => /SKISET/i.test(c.r) }]],
  ["מלונות", [
    { id: "h-kashmir", area: 5, n: "Kashmir", t: "hotel", hi: "", m: c => /^Kashmir/i.test(c.n) },
    { id: "h-oxalys", area: 6, n: "Oxalys", t: "hotel", hi: "", m: c => /Oxalys Residence/i.test(c.n) },
    { id: "h-pleinsud", area: 2, n: "Plein Sud", t: "hotel", hi: "Mallory", m: c => /Plein Sud/i.test(c.n) },
    { id: "h-montana", area: 4, n: "Montana", t: "hotel", hi: "Lucie", m: c => /Residence Montana/i.test(c.n) },
    { id: "h-cheval", area: 3, n: "Cheval Blanc", t: "hotel", hi: "", m: c => /Cheval Blanc/i.test(c.n) }]],
  ["סקיפסים", [{ id: "lifts", area: 1, n: "סקיפסים · סימין / פרנסואה", t: "lift", hi: "", m: c => /סימין|פרנסואה|Simin|Fran[cç]ois/i.test(c.n + ' ' + c.r) }]],
  ["הדרכות", [{ id: "skicool", area: 7, n: "Skicool", t: "school", hi: "Chloe", m: c => /SKICOOL/i.test(c.r) }]],
  ["ארוחות", [{ id: "meals", area: 23, n: "פטריק · המסעדות", t: "meals", hi: "Patrick", m: c => /מנהל המסעדות/.test(c.r) }]],
  ["מאפייה", [{ id: "bakery", area: 22, n: "המאפייה", t: "bakery", wa: 1, hi: "Stéphane", m: c => /המאפייה/.test(c.r) }]],
  ["מרכז ספורט וספא", [{ id: "spa", n: "מרכז הספורט והספא", t: "spa", hi: "Laetitia", m: c => /מרכז הספורט/.test(c.r) }]],
  ["לה מנואיר", [
    { id: "lm-esf", area: 12, n: "ESF לה מנואיר · מרטין", t: "lmschool", late: 1, hi: "Martine", m: c => /מרטין|Martine/i.test(c.n + ' ' + c.r) },
    { id: "lm-shop", area: 12, n: "ציוד לה מנואיר", t: "lmshop", late: 1, hi: "", m: c => /ציוד לה מנואיר/.test(c.r) }]]
];
const SUP_TOPIC = {
  shop: "We would like to arrange ski and snowboard rental for our guests this season. Before the first group arrives, we would like to go over rental prices and packages, how to book, fitting for groups on arrival day, pick-up and return times, and a contact person for the season.",
  hotel: "Before our first group arrives, we would like to go over check-in times and key collection, the rooming list (its format and when you need it), a spot for our welcome desk on arrival day, and a contact person for the season.",
  school: "We would like to plan ski and snowboard lessons for our guests. We would like to go over lesson types, group sizes and levels, schedules and meeting points, booking and payment, and lessons for our Hanukkah week.",
  meals: "We would like to plan meals for our groups this season: menus, meal times, reservations and prices, starting with our Hanukkah week.",
  spa: "We would like to set up a short call about access for our guests to the sports centre and spa: prices, opening hours and how to book.",
  lift: "We would like to go over ski passes for our guests this season: free pass age brackets, family passes, deadlines for loading and cancelling passes, and how to cancel on the website.",
  lmschool: "We also have guests at Club du Soleil in Les Menuires (Sunday to Sunday, from 3 January). We would like to go over ESF lesson times, meeting points, levels, arrangements for children and whether vouchers are needed.",
  lmshop: "We also have guests at Club du Soleil in Les Menuires (Sunday to Sunday, from 3 January), with ski rental included. We would like to ask about ski equipment upgrades and their prices, and any snowboard exceptions."
};
const SUP_SUBJ = { shop: "equipment rental for the season", hotel: "preparing for our guests' arrival", school: "ski lessons for the season", meals: "group meals for the season", spa: "a call about the sports centre and spa", lift: "ski passes for the season", lmschool: "ESF lessons in Les Menuires", lmshop: "equipment rental in Les Menuires" };
function supMe(){ let m = ''; try { m = localStorage.getItem('penguin-me') || ''; } catch(e){} return SUP_EN[m] || 'Ben'; }
function supContact(s){ const all = window.TEAM_CONTACTS || []; return all.find(c => { try { return s.m(c); } catch(e){ return false; } }) || null; }
function supDraft(s){
  const me = supMe(), hi = s.hi ? 'Hello ' + s.hi + ',' : 'Hello,';
  if (s.wa) return { subj: '', body: `${hi} this is ${me} from the Penguin team in Val Thorens. We arrive on 26 November and our first guests come on 5 December. Could we meet during our prep week (27 November to 4 December) to set up our bread and pastry orders for the season? Thank you!` };
  const meet = s.late
    ? "Could we meet after our Hanukkah week, between 13 and 19 December? Please let me know a day and time that suits you."
    : (s.t === 'spa' ? "Could we have the call during our prep week, between 27 November and 4 December? Please let me know a day and time that suits you."
      : "Could we meet during our prep week, between 27 November and 4 December? Please let me know a day and time that suits you.");
  const body = `${hi}

My name is ${me}, and I am part of the Penguin team in Val Thorens for the 2026/27 winter season. Our team arrives in Val Thorens on 26 November, and we will spend 27 November to 4 December preparing before our first guests arrive.

Our season dates:
- Hanukkah week: 5 to 12 December 2026
- 2 January to 6 February 2027
- 6 March to 3 April 2027

${SUP_TOPIC[s.t]}

${meet}

Best regards,
${me}
Penguin team, Val Thorens 2026/27`;
  return { subj: 'Penguin Val Thorens 2026/27: ' + SUP_SUBJ[s.t], body };
}
/* mail: who owns each supplier (from the roles board) and what the inbox says */
function supOwner(s){ if (!s.area) return ''; let r = {}; try { r = tstore(TKEY.resp) || {}; } catch(e){} return r['rw-' + s.area] || ''; }
function supMail(s){ return (window.MAIL && window.MAIL.sup && window.MAIL.sup[s.id]) || null; }
function supEff(s, x){
  const m = supMail(s), o = Object.assign({}, x);
  if (!o.who) o.who = supOwner(s);
  if (m && m.out && !o.st) o.st = 'sent';
  if (m && m.turn === 'us' && (!o.st || o.st === 'sent')) o.st = 'ans';
  if (m && m.meet && (!o.st || o.st === 'sent' || o.st === 'ans')) { o.st = 'meet'; if (!o.when) o.when = m.meet; }
  return o;
}
const dm = d => { const p = String(d || '').split('-'); return p.length === 3 ? (+p[2]) + '.' + (+p[1]) : ''; };
function supMailLine(s){
  const m = supMail(s); if (!m) return '';
  if (m.meet) return `<small class="sup-ml">📅 נקבעה פגישה · ${esc(m.meet)} · ביומן</small>`;
  if (m.turn === 'us') return `<small class="sup-ml us">✉ ענו ${dm(m.in)} · תורנו לענות</small>`;
  if (m.out) return `<small class="sup-ml">✉ נשלח ${dm(m.out)} · מחכים לתשובה</small>`;
  return '';
}
let supPending = false;
function renderSup(){
  const host = document.getElementById('supGrid'); if (!host) return;
  if (host.contains(document.activeElement) && document.activeElement.matches('input, select')) { supPending = true; return; }
  supPending = false;
  const st0 = tstore(SUP_KEY), all = SUPS.flatMap(g => g[1]), st = {}; all.forEach(s => { st[s.id] = supEff(s, st0[s.id] || {}); });
  const left = all.filter(s => !(st[s.id] && st[s.id].st)).length, closed = all.filter(s => st[s.id] && /meet|done/.test(st[s.id].st)).length;
  const pill = document.getElementById('tabSup'); if (pill) pill.textContent = left;
  const o = document.getElementById('supLeft'); if (o) o.textContent = left;
  const t = document.getElementById('supTot'); if (t) t.textContent = 'עוד לא נשלחו, מתוך ' + all.length;
  const bar = document.getElementById('supBar'); if (bar) bar.style.width = (closed / all.length * 100) + '%';
  const people = ['בן', 'יותם', 'דורון', 'קרן'], loaded = !!(window.TEAM_CONTACTS && window.TEAM_CONTACTS.length);
  host.innerHTML = SUPS.map(([grp, list]) => `<section class="sup-grp"><h3>${esc(grp)}</h3>${list.map(s => {
    const x = supEff(s, st[s.id] || {}), c = supContact(s), d = supDraft(s), ml = supMailLine(s);
    const ph = c && (c.p || []).find(p => p.w) || (c && (c.p || [])[0]);
    let act, who;
    if (s.wa) {
      who = c ? esc(c.n) + (ph ? ' · ' + esc(ph.v) : '') : '';
      act = ph ? `<a class="sup-b pri" target="_blank" rel="noopener" href="https://wa.me/${esc(ph.t.replace(/\D/g, ''))}?text=${encodeURIComponent(d.body)}">פתיחה בוואטצאפ</a>` : '';
    } else {
      who = c ? esc(s.t === 'hotel' ? c.r : c.n) + (c.m ? '</small><small class="sup-m" dir="ltr">' + esc(c.m) : '') : '';
      act = c && c.m ? `<a class="sup-b pri" href="mailto:${esc(c.m)}?subject=${encodeURIComponent(d.subj)}&body=${encodeURIComponent(d.body)}">פתיחת מייל</a>` : '';
    }
    if (!act) act = loaded ? '<span class="sup-miss">אין מייל ברשימה, צריך להשיג</span>' : '';
    if (!who) who = loaded ? 'אין איש קשר ברשימה' : (window.TEAM_CONTACTS_ERR ? 'פרטי הקשר פתוחים רק בקישור הצוות' : 'טוען פרטי קשר…');
    return `<article class="sup-row st-${x.st || 'new'}" data-sid="${s.id}">
      <div class="sup-id"><b>${esc(s.n)}</b>${s.late ? '<em>אחרי חנוכה</em>' : ''}<small>${who}</small>${ml}</div>
      <div class="sup-f">
        <label><span>סטטוס</span><select class="sup-st">${SUP_ST.map(([v, l]) => `<option value="${v}"${(x.st || '') === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <label><span>מי מטפל</span><select class="sup-who"><option value="">—</option>${people.map(p => `<option${x.who === p ? ' selected' : ''}>${p}</option>`).join('')}</select></label>
        <label><span>פגישה</span><input class="sup-when" type="text" placeholder="יום ושעה" value="${esc(x.when || '')}"></label>
        <label class="w"><span>הערה</span><input class="sup-note" type="text" placeholder="מה ענו, מה חסר…" value="${esc(x.note || '')}"></label>
      </div>
      <div class="sup-a">${act}<button type="button" class="sup-b sup-copy">העתקת הטקסט</button></div>
      <details class="sup-d"><summary>הטקסט${d.subj ? ' · ' + esc(d.subj) : ''}</summary><pre dir="ltr">${esc(d.body)}</pre></details>
    </article>`;
  }).join('')}</section>`).join('');
}
function supSave(id, k, v){ const st = tstore(SUP_KEY); st[id] = Object.assign({}, st[id], { [k]: v }); tsave(SUP_KEY, st); }
document.addEventListener('change', e => {
  const t = e.target; if (!t.closest || !t.closest('#view-sup')) return;
  const row = t.closest('.sup-row'); if (!row) return;
  const k = t.classList.contains('sup-st') ? 'st' : t.classList.contains('sup-who') ? 'who' : t.classList.contains('sup-when') ? 'when' : t.classList.contains('sup-note') ? 'note' : '';
  if (!k) return;
  supSave(row.dataset.sid, k, t.value.trim());
  if (k === 'st') { t.blur(); supPending = false; renderSup(); }
});
document.addEventListener('focusout', e => { if (supPending && e.target.closest && e.target.closest('#view-sup')) setTimeout(() => { if (supPending) renderSup(); }, 50); });
document.addEventListener('click', e => {
  const t = e.target; if (!t.closest || !t.closest('#view-sup')) return;
  const row = t.closest('.sup-row'); if (!row) return;
  const s = SUPS.flatMap(g => g[1]).find(x => x.id === row.dataset.sid); if (!s) return;
  if (t.closest('.sup-copy')) {
    const d = supDraft(s), txt = (d.subj ? 'Subject: ' + d.subj + '\n\n' : '') + d.body;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('הטקסט הועתק'), () => toast('לא הצלחתי להעתיק, פתחו את "הטקסט" והעתיקו ידנית'));
    return;
  }
  if (t.closest('a.sup-b.pri')) {
    const st = tstore(SUP_KEY);
    if (!(st[s.id] && st[s.id].st)) setTimeout(() => { supSave(s.id, 'st', 'sent'); if (!(st[s.id] && st[s.id].who)) { let m = ''; try { m = localStorage.getItem('penguin-me') || ''; } catch(e){} if (m) supSave(s.id, 'who', m); } renderSup(); toast('סומן כנשלח. אם לא שלחתם, מחזירים בסטטוס'); }, 400);
  }
});
document.addEventListener('contacts-ready', renderSup);
renderSup();
