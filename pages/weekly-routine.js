/* עבודה שוטפת: weekly routine board, shared doc "weekly". */
/* עבודה שוטפת: weekly routine board. Shared doc "weekly" (penguin-weekly). Ticks for everyone, editing for Ben. */
(function(){
const WK_KEY = "penguin-weekly";
const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const WHO = {"בן":"#6941C6","יותם":"#0E7490","דורון":"#8B5A2B","קרן":"#B42370","כולם":"#475966"};
const LANES = [{id:"cl",n:"לו״ז עם הלקוחות"},{id:"tech",n:"משימות טכניות"},{id:"wa",n:"הודעות וואטצאפ"}];
const SEED = [
 {d:0,t:"סגירת קופה קטנה"},
 {d:0,t:"דוח סיכום הגעה ועזיבה"},
 {d:0,t:"גלישת היכרות",lane:"cl"},
 {d:1,t:"ריקו מלונות",k:"recap",items:["פליין סוד","מונטנה","לה שבאל בלאן","קשמיר","אוקסליס","שרפה","פשמינה","לה בלקון","פירנהייט","קואינור","טור הוטל","הוטל טרה וולה","הוטל דה וואלטורנס","פיצרוי"]},
 {d:1,t:"ריקו הדרכות",k:"recap",items:["סקי קול","ESF לה מנואיר"]},
 {d:1,t:"ריקו מאפייה",k:"recap",items:["מאפייה"]},
 {d:1,t:"ריקו ארוחות",k:"recap",items:["ארוחות"]},
 {d:1,t:"ריקו ציוד",k:"recap",items:["ספורט 2000 אסקיאדור","סקי סט","קשמיר ציוד","אוקסליס ציוד"]},
 {d:1,t:"הטענת סקיפסים"},
 {d:1,t:"רשימות אוטובוס והעברת פרטי אוטובוסים לספק"},
 {d:2,t:"יום כיף לצוות",k:"fun"},
 {d:3,t:"וידוא ריקו"},
 {d:3,t:"סגירת מעטפות"},
 {d:3,t:"הדפסות",items:["וואוצ׳רים סקי סט","ספורט 2000","הדרכות"],note:"בסוף היום"},
 {d:4,t:"יום כיף צוות",k:"fun"},
 {d:4,t:"פולידוס",lane:"cl"},
 {d:4,t:"פתק ושוקולד לפצועים / לקוחות VIP",note:"אם יש"},
 {d:5,t:"שלטים לאוטובוס: מספרים ושם האתר"},
 {d:5,t:"הדפסת רשימות אוטובוס"},
 {d:5,t:"בקבוקי מים ושוקולדים"},
 {d:5,t:"באפים"},
 {d:5,t:"מעטפות"},
 {d:5,t:"דגל טיפה"},
 {d:6,t:"צ׳ק אין במלונות",lane:"cl"},
 {d:2,t:"סבב ברים / באולינג",lane:"cl"}
].map((x,i)=>({id:"s"+i,d:x.d,t:x.t,k:x.k||"task",lane:x.lane||"tech",items:x.items||[],note:x.note||"",from:"",to:"",who:"",o:i}));
SEED.push(...WA_SEED);
const fresh = () => ({tasks:JSON.parse(JSON.stringify(SEED)),checks:{},sent:{},conf:{},n:SEED.length,v:1});
const S = () => { const s = tstore(WK_KEY); if (!Array.isArray(s.tasks)) return fresh();
  if (!s.waIn){ s.waIn = 1; WA_SEED.forEach(w => { if (!s.tasks.some(t => t.id === w.id)) s.tasks.push(JSON.parse(JSON.stringify(w))); }); }
  return s; };
const put = s => tsave(WK_KEY, s);
const E = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $ = id => document.getElementById(id);
const sorted = (s,d,l) => s.tasks.filter(x => x.d === d && (l == null || (x.lane || "tech") === l)).sort((a,b) => {
  if (a.from && b.from) return a.from.localeCompare(b.from) || a.o - b.o;
  if (a.from) return -1; if (b.from) return 1; return a.o - b.o; });

function card(s,x){
  const time = x.from ? `<span class="wk-time">${E(x.from)}${x.to ? "–" + E(x.to) : ""}</span>` : (x.note ? `<span class="wk-time none">${E(x.note)}</span>` : "");
  const who = x.who ? `<span class="wk-who" style="color:${WHO[x.who] || "inherit"}">${E(x.who)}</span>` : "";
  let body = "";
  if (x.k === "recap"){
    const its = x.items.length ? x.items : [x.t]; let sent = 0, conf = 0, need = 0, h = "";
    its.forEach(it => { const ck = x.id + "|" + it, st = s.sent[ck] || 0, c = !!s.conf[ck];
      if (st !== 2){ need++; if (st === 1) sent++; if (c) conf++; }
      const lbl = st === 1 ? "נשלח" : st === 2 ? "אין לקוחות השבוע" : "לא נשלח";
      h += `<div class="wk-rr ${st === 2 ? "nocl" : ""}"><button type="button" class="wk-sb s${st}" data-sent="${E(ck)}" aria-label="${E(it)}: ${lbl}" title="${lbl}">${st === 1 ? "✓" : st === 2 ? "✕" : ""}</button><input type="checkbox" class="wk-cf" data-conf="${E(ck)}" ${c ? "checked" : ""} ${st === 2 ? "disabled" : ""} aria-label="${E(it)}: הספק אישר"><span class="nm">${E(it)}</span></div>`; });
    body = `<span class="wk-prog ${need && conf === need ? "full" : ""}">נשלח ${sent}/${need} · אושר ${conf}/${need}</span><div class="wk-x"><div class="wk-rh"><span>נשלח</span><span>אושר</span><span></span></div>${h}</div>`;
  } else if (x.items.length) body = `<div class="wk-items">${x.items.map(E).join(" · ")}</div>`;
  if (x.lane === "wa" && !x.msg) body += `<span class="wk-time none">אין נוסח עדיין</span>`;
  if (x.msg || (x.lane === "wa" && PG_EDIT)) body += `<div class="wk-msg"><button type="button" class="wk-mb" data-msgv="${x.id}">נוסח</button><button type="button" class="wk-mb" data-msgc="${x.id}">העתקה</button></div>`;
  const dn = x.k !== "recap" && !!s.checks[x.id];
  const box = x.k === "recap" ? "" : `<span class="wk-x"><input type="checkbox" class="wk-dn" data-done="${x.id}" ${dn ? "checked" : ""} aria-label="${E(x.t)} בוצע"></span>`;
  const cls = x.k === "recap" ? "recap" : x.k === "fun" ? "fun" : "";
  return `<div class="wk-c ${cls} ${dn ? "isdone" : ""}" draggable="${PG_OWNER}" ${PG_OWNER ? 'tabindex="0" role="button"' : ""} data-id="${x.id}"><div class="wk-row">${box}<div class="wk-b">${time}<span class="wk-t">${E(x.t)}</span>${body}${who}</div></div></div>`;
}
function renderWk(){
  const g = $("wkGrid"); if (!g) return;
  const s = S(), today = new Date().getDay();
  let h = '<div class="wk-colh wk-corner"></div>' + DAYS.map((n,d) => `<div class="wk-colh ${d === today ? "today" : ""}" data-day="${d}">${n}</div>`).join("");
  if (g.dataset.show == null) g.dataset.show = String(today);
  paintDayBar(today, +g.dataset.show);
  LANES.forEach(L => {
    const all = s.tasks.filter(x => (x.lane || "tech") === L.id && x.k !== "recap"), dn = all.filter(x => s.checks[x.id]).length;
    h += `<div class="wk-lane">${L.n}<small>${all.length ? dn + "/" + all.length : ""}</small></div>`;
    DAYS.forEach((n,d) => { const ts = sorted(s,d,L.id);
      h += `<div class="wk-cell" data-day="${d}" data-lane="${L.id}">${ts.length ? ts.map(x => card(s,x)).join("") : '<div class="wk-empty">—</div>'}</div>`; });
  });
  g.innerHTML = h;
}
window.renderWk = renderWk;
/* phone: one day at a time */
const SH = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
function paintDayBar(today, show){
  const bar = $("wkDayBar"); if (!bar) return;
  bar.innerHTML = SH.map((n,d) => `<button type="button" data-d="${d}" aria-pressed="${d === show}" class="${d === today ? "today" : ""}" aria-label="${DAYS[d]}">${n}</button>`).join("");
}
$("wkDayBar").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
  $("wkGrid").dataset.show = b.dataset.d; renderWk(); });

const grid = $("wkGrid");
grid.addEventListener("change", e => { const t = e.target, s = S();
  if (t.dataset.conf){ if (t.checked) s.conf[t.dataset.conf] = 1; else delete s.conf[t.dataset.conf]; }
  else if (t.dataset.done){ if (t.checked) s.checks[t.dataset.done] = 1; else delete s.checks[t.dataset.done]; }
  else return;
  put(s); renderWk(); });
grid.addEventListener("click", e => {
  const b = e.target.closest("[data-sent]");
  if (b){ const s = S(), k = b.dataset.sent, n = ((s.sent[k] || 0) + 1) % 3;
    if (n) s.sent[k] = n; else delete s.sent[k]; if (n === 2) delete s.conf[k];
    put(s); renderWk(); const nb = grid.querySelector(`[data-sent="${CSS.escape(k)}"]`); if (nb) nb.focus(); return; }
  const mv = e.target.closest("[data-msgv],[data-msgc]");
  if (mv){ const x = S().tasks.find(t => t.id === (mv.dataset.msgv || mv.dataset.msgc)); if (!x) return;
    if (mv.dataset.msgc) copyText(x.msg, "ההודעה הועתקה"); else openMsg(x); return; }
  if (e.target.closest(".wk-x")) return;
  const c = e.target.closest(".wk-c"); if (c && PG_OWNER) openSheet(c.dataset.id);
});
/* message reader: full text + copy */
let msgX = null;
function openMsg(x){ msgX = x; $("wkMsgT").textContent = x.t; $("wkMsgN").textContent = x.note || ""; $("wkMsgB").textContent = x.msg;
  msgMode(false); $("wkScrim").hidden = false; $("wkMsg").hidden = false; $("wkMsgCopy").focus(); }
const closeMsg = () => { $("wkMsg").hidden = true; if ($("wkSheet").hidden) $("wkScrim").hidden = true; msgX = null; };
$("wkMsgCopy").onclick = () => { if (msgX) copyText(msgX.msg, "ההודעה הועתקה"); };
/* 10.11.26 (Ben): team link and Ben can edit the message text */
const msgMode = ed => { $("wkMsgB").hidden = ed; $("wkMsgEd").hidden = !ed; $("wkMsgView").hidden = ed; $("wkMsgEdActs").hidden = !ed; $("wkMsgEdit").hidden = !PG_EDIT; };
$("wkMsgEdit").onclick = () => { if (!msgX || !PG_EDIT) return; $("wkMsgEd").value = msgX.msg || ""; msgMode(true); $("wkMsgEd").focus(); };
$("wkMsgCancel").onclick = () => msgMode(false);
$("wkMsgSave").onclick = () => { if (!msgX) return; const s = S(), x = s.tasks.find(t => t.id === msgX.id); if (!x) return;
  x.msg = $("wkMsgEd").value.replace(/\s+$/, ""); put(s); msgX = x; $("wkMsgB").textContent = x.msg; msgMode(false); renderWk(); toast("ההודעה נשמרה"); };
$("wkMsgClose").onclick = closeMsg;
grid.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("wk-c") && PG_OWNER){ e.preventDefault(); openSheet(e.target.dataset.id); } });
let dragId = null;
grid.addEventListener("dragstart", e => { const c = e.target.closest && e.target.closest(".wk-c"); if (!c || !PG_OWNER) return; dragId = c.dataset.id; c.classList.add("dragging"); try { e.dataTransfer.setData("text/plain", dragId); } catch(_){} });
grid.addEventListener("dragend", () => { dragId = null; grid.querySelectorAll(".over").forEach(x => x.classList.remove("over")); renderWk(); });
grid.addEventListener("dragover", e => { const d = e.target.closest(".wk-cell"); if (!d || !dragId) return; e.preventDefault();
  grid.querySelectorAll(".over").forEach(x => x !== d && x.classList.remove("over")); d.classList.add("over"); });
grid.addEventListener("drop", e => { const d = e.target.closest(".wk-cell"); if (!d || !dragId) return; e.preventDefault();
  const s = S(), x = s.tasks.find(t => t.id === dragId); if (!x) return;
  const nd = +d.dataset.day, ln = d.dataset.lane, on = e.target.closest(".wk-c");
  const list = sorted(s,nd,ln).filter(t => t.id !== x.id);
  let i = on ? list.findIndex(t => t.id === on.dataset.id) : list.length; if (i < 0) i = list.length;
  list.splice(i, 0, x); x.d = nd; x.lane = ln; list.forEach((t,j) => t.o = j); put(s); renderWk(); });

/* edit sheet (Ben only) */
let cur = null, curDay = 0;
$("wkDays").innerHTML = DAYS.map((n,i) => `<button type="button" data-d="${i}" aria-pressed="false">${n}</button>`).join("");
$("wkDays").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; curDay = +b.dataset.d; markDay(); });
const markDay = () => $("wkDays").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.d === curDay));
function openSheet(id){
  if (!PG_OWNER) return;
  const s = S(); cur = id || null;
  const x = (id && s.tasks.find(t => t.id === id)) || {t:"",d:1,from:"",to:"",who:"",items:[],k:"task",lane:"tech"};
  $("wkSheetT").textContent = id ? "עריכת משימה" : "משימה חדשה";
  $("wkTitle").value = x.t; $("wkFrom").value = x.from; $("wkTo").value = x.to; $("wkWho").value = x.who;
  $("wkLaneSel").value = x.lane || "tech"; $("wkItems").value = x.items.join("\n"); $("wkKind").value = x.k;
  $("wkMsgTxt").value = x.msg || ""; $("wkNote").value = x.note || "";
  $("wkDel").hidden = !id; curDay = x.d; markDay();
  $("wkScrim").hidden = false; $("wkSheet").hidden = false; $("wkTitle").focus();
}
const closeSheet = () => { $("wkScrim").hidden = true; $("wkSheet").hidden = true; cur = null; };
$("wkCancel").onclick = closeSheet; $("wkScrim").onclick = () => { closeSheet(); closeMsg(); };
document.addEventListener("keydown", e => { if (e.key !== "Escape") return; if (!$("wkMsg").hidden) closeMsg(); else if (!$("wkSheet").hidden) closeSheet(); });
$("wkSave").onclick = () => {
  const t = $("wkTitle").value.trim(); if (!t){ $("wkTitle").focus(); return; }
  const s = S(); let x = cur && s.tasks.find(q => q.id === cur);
  if (!x){ x = {id:"n" + (s.n++), k:"task", note:"", o:999}; s.tasks.push(x); }
  if (x.d !== curDay) x.o = 999;
  Object.assign(x, {t, d:curDay, from:$("wkFrom").value, to:$("wkTo").value, who:$("wkWho").value, lane:$("wkLaneSel").value, k:$("wkKind").value,
    msg:$("wkMsgTxt").value.trim(), note:$("wkNote").value.trim(),
    items:$("wkItems").value.split("\n").map(v => v.trim()).filter(Boolean)});
  sorted(s,x.d).forEach((q,i) => q.o = i); put(s); closeSheet(); renderWk();
};
$("wkDel").onclick = async () => { if (!cur) return; if (!(await askConfirm("למחוק את המשימה?"))) return;
  const s = S(); s.tasks = s.tasks.filter(t => t.id !== cur); put(s); closeSheet(); renderWk(); };
$("wkAdd").onclick = () => openSheet(null);
$("wkNew").onclick = async () => { if (!(await askConfirm("שבוע חדש: לנקות את כל הסימונים?"))) return;
  const s = S(); s.checks = {}; s.sent = {}; s.conf = {}; put(s); renderWk(); toast("הסימונים נוקו"); };
$("wkReset").onclick = async () => { if (!(await askConfirm("לאפס את כל הלוח לטיוטה המקורית?"))) return; put(fresh()); renderWk(); };

document.querySelectorAll('[data-view="wk"]').forEach(b => b.addEventListener("click", renderWk));
(window.claude && claude.use ? claude.use("user") : Promise.resolve(null)).then(() => setTimeout(renderWk, 50)).catch(() => {});
renderWk();
})();
