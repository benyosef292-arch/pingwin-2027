/* Task boards (3 phases): render, check off, filter, tabs and toolbar. */
const KEY = "penguin-prep-v1";
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch(e) { state = {}; }

const PHASES = [
  { id:"p1", key:"israel", num:"שלב 1",  title:"לפני היציאה — בארץ", desc:"הכנת צוות, תשתית משרדית, תיאום שבוע ההכנה מול ספקים והכנה לעונה.", note:"מתבצע לפני הטיסה" },
  { id:"p2", key:"onsite", num:"שלב 2",  title:"שבוע ההכנה באתר", desc:"90 משימות שטח: התמקמות, ספקים, סבב עיירה, ריקו, תיקוף וסגירה.", note:"בשבוע ההכנה כולם עושים הכל" },
  { id:"p3", key:"equip",  num:"רשימה",  title:"ציוד מהארץ", desc:"רשימת הציוד לפי קטגוריות, עם כמויות והערות — לפני האריזה.", note:"כמויות “תלוי” + אקסטרה" }
];

const ORDER_KEY = "penguin-order";
const DL_KEY = "penguin-dl";
const DL_OPTS = [["21.10.26","ישיבת צוות 1 · 21.10"],["בבית","משימות בבית · עד 01.11"],["ישיבת צוות 3","ישיבה עם כרמל · 28.10 · שאלות לקראת סמדר"],["פגישה 2","ישיבה עם סמדר · 01.11"],["ישיבת צוות במרכז","ישיבת צוות במרכז"],["11.11.26","סגירת לו״ז מול אורן וחן · 11.11"],["24.11.26","פגישת נציגים והנהלה · 24.11"],["ימים 1–3 בהכנה","הכנה · 26.11–28.11"],["ימים 4–6 בהכנה","הכנה · 29.11–03.12"],["יום לפני הגעת הלקוחות","יום לפני הלקוחות · 04.12"]];
const DL_NOTE = {"21.10.26":"השבוע","בבית":"כל אחד לפי השיבוץ שלו","פגישה 2":"01.11.26","ישיבת צוות 3":"28.10.26","ישיבת צוות במרכז":"לפני הפגישה במשרד","11.11.26":"פגישה פיזית במשרד · סגירת הלו״ז ואישורו","24.11.26":"פגישה 4 · פגישת נציגים אחרונה","ימים 1–3 בהכנה":"26.11 – 28.11 · עם הנחיתה","ימים 4–6 בהכנה":"29.11 – 03.12 · המשך ההכנה באתר","יום לפני הגעת הלקוחות":"04.12 · צ׳ק־ליסט סגור"};
const dlOv = () => { try { return JSON.parse(localStorage.getItem(DL_KEY) || "{}") || {}; } catch(e){ return {}; } };
const dlLabel = v => (DL_OPTS.find(o => o[0] === v) || [v, v])[1];
/* only the artifact owner assigns owners, deadlines and moves tasks */
var PG_OWNER = false, PG_EDIT = false;   /* PG_EDIT: team link or owner - owners, order, add/delete tasks */
function pgLock(root){
  (root || document).querySelectorAll('select.sp-sel').forEach(el => { el.disabled = !PG_EDIT; el.title = PG_EDIT ? '' : 'פתחו מקישור הצוות כדי לשנות'; });
  (root || document).querySelectorAll('select.sp-dl, select.dl-sel').forEach(el => { el.disabled = !PG_OWNER; el.title = PG_OWNER ? '' : 'רק בן יכול לשנות'; });
}
(window.claude && claude.use ? claude.use('user') : Promise.resolve(null)).then(async u => {
  PG_OWNER = u ? await u.isOwner().catch(() => false) : false;
  PG_EDIT = PG_OWNER || (u && u.canEdit ? await u.canEdit().catch(() => false) : false);
  document.body.classList.toggle('pg-owner', PG_OWNER);
  document.body.classList.toggle('pg-edit', PG_EDIT);
  pgLock();
  if (typeof paintOwners === 'function') try { paintOwners(); } catch(e){}
}).catch(() => {});
new MutationObserver(() => pgLock()).observe(document.documentElement, { childList: true, subtree: true });
/* display names (internal category keys stay the same so saved checks keep working) */
const CAT_LABEL = { "שבוע הכנה (מרחוק)": "תיאום שבוע ההכנה" };
const catLabel = c => CAT_LABEL[c] || c;
function readOrder(){ try { return JSON.parse(localStorage.getItem(ORDER_KEY) || "{}") || {}; } catch(e){ return {}; } }
function sortByOrder(list, key){
  const o = readOrder()[key]; if (!Array.isArray(o)) return list;
  const pos = new Map(o.map((t, i) => [t, i]));
  const rank = t => pos.has(t.t) ? pos.get(t.t) : 1e6 + list.indexOf(t);
  return list.slice().sort((a, b) => rank(a) - rank(b));
}
function placeTasks(pid, groups){
  const all = new Map(), o = readOrder(), used = new Set();
  groups.forEach(g => g.tasks.forEach(t => { const id = `${pid}|${g.cat}|${t.t}`; all.set(id, { t, id, oc: g.cat }); }));
  const out = groups.map(g => {
    const list = o[`${pid}|${g.cat}`], arr = [];
    if (Array.isArray(list)) list.forEach(x => {
      const id = String(x).startsWith(pid + '|') ? x : `${pid}|${g.cat}|${x}`;
      const it = all.get(id); if (it && !used.has(id)) { used.add(id); arr.push(it); }
    });
    return arr;
  });
  groups.forEach((g, gi) => g.tasks.forEach(t => { const id = `${pid}|${g.cat}|${t.t}`; if (!used.has(id)) { used.add(id); out[gi].push(all.get(id)); } }));
  return out;
}
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* tasks added from the page (owner only), merged into DATA */
const CUSTOM_KEY = "penguin-custom";
const DATA0 = JSON.parse(JSON.stringify(DATA));
function mergeCustom(){
  let c = {}; try { c = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}") || {}; } catch(e){}
  Object.keys(DATA0).forEach(k => { DATA[k] = JSON.parse(JSON.stringify(DATA0[k])); });
  Object.values(c).filter(x => x && x.t).sort((a, b) => (a.at || 0) - (b.at || 0)).forEach(x => {
    const g = (DATA[x.ph] || []).find(g => g.cat === x.cat);
    if (g && !g.tasks.some(t => t.t === x.t)) g.tasks.push({ t: x.t, d: x.d || "", custom: 1 });
  });
}
mergeCustom();
const allTasks = [];
function fillAllTasks(){ allTasks.length = 0; PHASES.forEach(p => DATA[p.key].forEach(g => g.tasks.forEach(t => allTasks.push({ id:`${p.id}|${g.cat}|${t.t}`, phase:p.id })))); }
fillAllTasks();

let save = function(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} };
function isDone(id){ return !!state[id]; }

function phaseStats(pid){
  const list = allTasks.filter(t => t.phase === pid);
  return { done: list.filter(t => isDone(t.id)).length, total: list.length };
}
function globalStats(){
  const done = allTasks.filter(t => isDone(t.id)).length;
  return { done, total: allTasks.length };
}

function renderPhase(pid){
  const phase = PHASES.find(p => p.id === pid);
  const groups = DATA[phase.key];
  const st = phaseStats(pid);
  const pct = st.total ? Math.round(st.done / st.total * 100) : 0;
  let placed = placeTasks(pid, groups), G = groups;
  if (pid === 'p1') {   /* before departure: grouped by team meeting, not by topic */
    const ov = dlOv(), flat = [];
    groups.forEach((g, gi) => placed[gi].forEach(it => flat.push(Object.assign({}, it, { eff: ov[it.id] || g.dl, gdl: g.dl }))));
    const keys = ["21.10.26", "בבית", "ישיבת צוות 3", "פגישה 2", "ישיבת צוות במרכז", "11.11.26"];
    flat.forEach(x => { if (!keys.includes(x.eff)) keys.push(x.eff); });
    G = keys.map(k => ({ cat: 'm:' + k, meet: k }));
    placed = keys.map(k => flat.filter(x => x.eff === k).map(x => Object.assign(x, { oc: 'm:' + k })));
  }
  const cats = G.map((g, gi) => {
    const items = placed[gi];
    const gDone = items.filter(x => isDone(x.id)).length;
    const tasks = items.map(({ t, id, oc, gdl }) => {
      const checked = isDone(id) ? "checked" : "";
      const q = t.q ? `<span class="tq">${esc(t.q)}</span>` : "";
      const detail = t.d ? `<div class="td">${esc(t.d)}</div>` : "";
      const ttag = t.tag ? `<div class="ttag">${esc(t.tag)}</div>` : "";
      return `<div class="task" data-t="${esc(t.t)}" data-tid="${esc(id)}" data-search="${esc((t.t + " " + (t.d||"") + " " + catLabel(g.cat) + " " + catLabel(oc)).toLowerCase())}">${oc !== g.cat ? `<span class="moved" title="הועברה מ־${esc(catLabel(oc))}"></span>` : ""}
        <input type="checkbox" id="c-${esc(id)}" data-id="${esc(id)}" ${checked}>
        <label class="box" for="c-${esc(id)}" aria-label="${esc(t.t)}"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></label>
        <div class="tx"><label for="c-${esc(id)}"><div class="tt">${q}${esc(t.label || t.t)}</div>${detail}${ttag}</label>${(() => { const ov = dlOv()[id], gd = gdl || g.dl, cur = ov || gd; return `<label class="dlpick ${ov && ov !== gd ? 'set' : ''}"><span>יעד</span><select class="dl-sel" data-id="${esc(id)}" data-gdl="${esc(gd || '')}" aria-label="יעד למשימה">${DL_OPTS.map(([v, l]) => `<option value="${esc(v)}"${cur === v ? ' selected' : ''}>${esc(l)}</option>`).join("")}</select></label>`; })()}</div>
        ${t.custom ? `<button type="button" class="task-del" title="מחיקת המשימה" aria-label="מחיקת המשימה">×</button>` : ""}<button type="button" class="grip" aria-label="שינוי מיקום: ${esc(t.t)}" title="גוררים כדי להזיז, גם לנושא או לשבוע אחר · או חיצים במקלדת"><svg viewBox="0 0 12 18" aria-hidden="true"><circle cx="3" cy="3" r="1.6"/><circle cx="9" cy="3" r="1.6"/><circle cx="3" cy="9" r="1.6"/><circle cx="9" cy="9" r="1.6"/><circle cx="3" cy="15" r="1.6"/><circle cx="9" cy="15" r="1.6"/></svg></button>
      </div>`;
    }).join("");
    return `<section class="cat ${items.length && gDone === items.length ? "done" : ""}" data-cat="${esc(g.cat)}">
      <div class="cat-head"><span class="dot"></span><span class="cat-name">${esc(g.meet ? dlLabel(g.meet) : catLabel(g.cat))}</span><span class="cat-count" data-count="${esc(g.cat)}">${gDone}/${items.length}</span></div>${g.dl ? `<div class="cat-dl"><span>יעד</span><b>${esc(dlLabel(g.dl))}</b>${g.dlnote ? `<i>${esc(g.dlnote)}</i>` : ""}</div>` : ""}
      ${g.meet && DL_NOTE[g.meet] ? `<div class="cat-dl"><i>${esc(DL_NOTE[g.meet])}</i></div>` : ""}
      <div class="cat-body">${tasks}</div>
      <div class="cat-add"><button type="button" class="add-btn">+ הוספת משימה</button></div>
    </section>`;
  }).join("");

  return `<div class="vhead">
      <div class="vhead-main">
        <h2>${esc(phase.title)}</h2>
        <p>${esc(phase.desc)}</p>
      </div>
      <div class="vhead-side">
        <div class="vnum"><b data-vdone>${st.done}</b><span>מתוך ${st.total} הושלמו</span></div>
        <div class="bar"><i data-vbar style="width:${pct}%"></i></div>
      </div>
    </div>
    <div class="toolbar">
      <div class="search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
        <input type="search" placeholder="חיפוש משימה או נושא…" data-search-input>
      </div>
      <label class="switch"><input type="checkbox" data-only-open><span class="track"><span class="knob"></span></span>רק משימות פתוחות</label>
      <span class="rhint"><svg viewBox="0 0 12 18" aria-hidden="true"><circle cx="3" cy="3" r="1.6"/><circle cx="9" cy="3" r="1.6"/><circle cx="3" cy="9" r="1.6"/><circle cx="9" cy="9" r="1.6"/><circle cx="3" cy="15" r="1.6"/><circle cx="9" cy="15" r="1.6"/></svg>גוררים את הידית כדי להזיז משימה, גם לנושא או לשבוע אחר</span><span class="finfo" data-finfo></span>
    </div>
    <div class="cats">${cats}</div>`;
}

function wirePhase(host, pid){
  host.addEventListener("change", e => {
    const cb = e.target.closest("input[type=checkbox][data-id]");
    if (cb){
      const id = cb.dataset.id;
      if (cb.checked){ state[id] = 1; } else { delete state[id]; }
      save(); refreshAll();
      const row = cb.closest(".task");
      row.style.transition = "background .5s";
      row.style.background = cb.checked ? "#EAF8F1" : "";
      setTimeout(() => { row.style.background = ""; }, 550);
      // category completion toast
      const cat = cb.closest(".cat");
      const boxes = [...cat.querySelectorAll("input[data-id]")];
      if (cb.checked && boxes.length && boxes.every(b => b.checked)) toast(`הקטגוריה הושלמה — ${catLabel(cat.dataset.cat)}`);
    }
    const onlyOpen = e.target.closest("[data-only-open]");
    if (onlyOpen) applyFilter(host);
  });
  host.addEventListener("input", e => {
    if (e.target.matches("[data-search-input]")) applyFilter(host);
  });
}

function applyFilter(host){
  const q = (host.querySelector("[data-search-input]")?.value || "").trim().toLowerCase();
  const onlyOpen = host.querySelector("[data-only-open]")?.checked;
  let shown = 0;
  host.querySelectorAll(".task").forEach(row => {
    const txt = row.dataset.search || "";
    const open = !row.querySelector("input[data-id]").checked;
    const ok = (!q || txt.includes(q)) && (!onlyOpen || open);
    row.classList.toggle("hide", !ok);
    if (ok) shown++;
  });
  host.querySelectorAll(".cat").forEach(cat => {
    const rows = [...cat.querySelectorAll(".task")], any = rows.some(r => !r.classList.contains("hide"));
    cat.style.display = any || (!rows.length && !q) ? "" : "none";   /* an empty meeting box stays visible so tasks can be added to it */
  });
  const info = host.querySelector("[data-finfo]");
  if (info) info.textContent = `${shown} מוצגות`;
}

function refreshAll(){
  if (typeof splitRender === 'function') try { splitRender(); } catch(e){}
  const g = globalStats();
  const pct = g.total ? Math.round(g.done / g.total * 100) : 0;
  document.getElementById("ringPct").textContent = pct + "%";
  document.getElementById("ringFg").style.strokeDashoffset = String(119.4 * (1 - pct / 100));
  document.getElementById("heroDone").textContent = g.done;
  document.getElementById("heroTotal").textContent = g.total;
  { const mt = document.getElementById("heroMetaTotal"); if (mt && g.total) mt.textContent = g.total; }
  document.getElementById("heroOpen").textContent = g.total - g.done;

  PHASES.forEach(p => {
    const st = phaseStats(p.id);
    const el = document.getElementById("tab" + p.id.toUpperCase());
    if (el) el.textContent = `${st.done}/${st.total}`;
    const card = document.querySelector(`.pcard[data-phase="${p.id}"]`);
    if (card){
      card.querySelector("[data-cdone]").textContent = st.done;
      card.querySelector("[data-ctotal]").textContent = st.total;
      card.querySelector("[data-cbar]").style.width = (st.total ? (st.done / st.total * 100) : 0) + "%";
    }
    const host = document.getElementById("view-" + p.id);
    if (host && host.dataset.rendered){
      const vd = host.querySelector("[data-vdone]");
      if (vd) vd.textContent = st.done;
      const vb = host.querySelector("[data-vbar]");
      if (vb) vb.style.width = (st.total ? (st.done / st.total * 100) : 0) + "%";
      host.querySelectorAll(".cat").forEach(cat => {
        const boxes = [...cat.querySelectorAll("input[data-id]")];
        const done = boxes.filter(b => b.checked).length;
        const c = cat.querySelector("[data-count]");
        if (c) c.textContent = `${done}/${boxes.length}`;
        cat.classList.toggle("done", done === boxes.length && boxes.length > 0);
      });
    }
  });
}

let toastT;
function toast(msg){
  const el = document.getElementById("toast");
  document.getElementById("toastTxt").textContent = msg;
  el.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("show"), 2600);
}

/* phase cards */
document.getElementById("phaseCards").innerHTML = PHASES.map(p => {
  const st = phaseStats(p.id);
  return `<button class="pcard" data-phase="${p.id}" type="button">
    <div class="num">${p.num}</div>
    <h3>${esc(p.title)}</h3>
    <div class="desc">${esc(p.desc)}</div>
    <div class="bar"><i data-cbar style="width:${st.total ? st.done/st.total*100 : 0}%"></i></div>
    <div class="meta"><span><b data-cdone>${st.done}</b> / <span data-ctotal>${st.total}</span></span><span>${esc(p.note)}</span></div>
  </button>`;
}).join("");
document.querySelectorAll(".pcard").forEach(c => c.addEventListener("click", () => go(c.dataset.phase)));

/* render phase views once */
PHASES.forEach(p => {
  const host = document.getElementById("view-" + p.id);
  host.innerHTML = renderPhase(p.id);
  host.dataset.rendered = "1";
  wirePhase(host, p.id);
  applyFilter(host);
});

/* tabs */
function go(view){
  if (document.body.classList.contains("deck-mode") || document.body.classList.contains("film-mode")) setMode("board");
  document.querySelectorAll(".view").forEach(v => v.hidden = v.id !== "view-" + view);
  document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.view === view)));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => go(t.dataset.view)));

/* toolbar buttons */
function askConfirm(msg){
  return new Promise(res => {
    const box = document.getElementById("cfm"), ok = document.getElementById("cfmOk"), no = document.getElementById("cfmNo");
    document.getElementById("cfmTxt").textContent = msg;
    box.hidden = false; no.focus();
    const done = v => { box.hidden = true; ok.onclick = no.onclick = box.onclick = null; document.removeEventListener("keydown", esc, true); res(v); };
    const esc = e => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
    ok.onclick = () => done(true); no.onclick = () => done(false);
    box.onclick = e => { if (e.target === box) done(false); };
    document.addEventListener("keydown", esc, true);
  });
}
document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!PG_OWNER) return;
  if (!(await askConfirm("לאפס את כל הסימונים? כל ההתקדמות של הצוות תימחק."))) return;
  state = {}; save();
  document.querySelectorAll("input[data-id]").forEach(cb => cb.checked = false);
  refreshAll();
  toast("כל הסימונים אופסו");
});
