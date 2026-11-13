/* Weekly summaries and the 2027 weekly report form. */
/* ================= saved text fields ================= */
const TKEY = { voices: "penguin-voices", hw: "penguin-hw", sums: "penguin-sums", resp: "penguin-resp" };
const tstore = k => { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { return {}; } };
let tsave = (k, o) => { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} };

function bindFields(sel, key){
  const st = tstore(key);
  document.querySelectorAll(sel).forEach(el => {
    if (st[el.id] != null) el.value = st[el.id];
    el.addEventListener("input", () => { const o = tstore(key); o[el.id] = el.value; tsave(key, o); });
  });
}

/* ================= weekly summaries ================= */
const WEEKS = [
  { id: "hanuka", n: "חנוכה", d: "05.12 – 12.12.26", brk: false },
  { id: "w1", n: "שבוע 1", d: "02–09.01.27" },
  { id: "w2", n: "שבוע 2", d: "09–16.01.27" },
  { id: "w3", n: "שבוע 3", d: "16–23.01.27" },
  { id: "w4", n: "שבוע 4", d: "23–30.01.27" },
  { id: "w5", n: "שבוע 5", d: "30.01–06.02.27" },
  { id: "brk", n: "ואקאנס", d: "06.02 – 06.03.27", brk: true },
  { id: "w6", n: "שבוע 6", d: "06–13.03.27" },
  { id: "w7", n: "שבוע 7", d: "13–20.03.27" },
  { id: "w8", n: "שבוע 8", d: "20–27.03.27" },
  { id: "w9", n: "שבוע 9", d: "27.03–03.04.27" },
  { id: "end", n: "סיום העונה", d: "חזרה לארץ 04.04.27", brk: false }
];
/* ================= weekly summary form (format 2027) + Word export ================= */
TKEY.wform = "penguin-wform";
const WF_HOTELS = ["Montana Plein Sud", "Le Cheval Blanc", "Montana Soleil", "Kashmir", "L'Oxalys", "La Manoir"];
const WF = [
  { h: "פרטים כלליים", b: [
    { k: "gen", t: "table", cols: ["אתר", "תאריכי השבוע", "נציגים", "מספר לקוחות השבוע"], rows: [{}], free: true, def: w => ["וואלטורנס", w.d, "בן, יותם, דורון, קרן", ""] },
    { k: "sum", t: "text", l: "סיכום כללי של השבוע במלל" }
  ]},
  { h: "עזיבה", sub: "מתייחס לעזיבה של הלקוחות של השבוע", b: [
    { k: "dbus", t: "table", h3: "אוטובוסים לשדה", cols: ["אוטובוס", "כמות לקוחות", "יציאה מהאתר", "הגעה לשדה", "הערות"], rows: [{ l: "אוטובוס 1" }, { l: "אוטובוס 2" }] },
    { k: "dsum", t: "pair", h3: "סיכום עזיבות", l: ["תקלות שעלו / מקרים חריגים", "הערות + שיפור שימור"] }
  ]},
  { h: "הגעות", sub: "מתייחס להגעה החדשה", b: [
    { k: "land", t: "table", h3: "נחיתה", cols: ["טיסה / שדה תעופה", "שעת נחיתה", "לקוח ראשון שיצא מהשער", "האם היו תקלות?"], rows: [{ l: "טיסה 1" }, { l: "טיסה 2" }] },
    { k: "abus", t: "table", h3: "אוטובוסים מהשדה", cols: ["אוטובוס + שם נציג", "לאיזה מלונות", "יציאה מהשדה", "הגעה לאתר", "הערות"], rows: [{ p: "אוטובוס 1" }, { p: "אוטובוס 2" }] },
    { k: "noshow", t: "table", h3: "לקוחות שלא הגיעו על הטיסה והיו רשומים בתנ״ך", cols: ["מס' הזמנה", "שם הלקוח", "סיבה", "האם צפוי להצטרף?"], rows: [{}, {}, {}, {}], free: true },
    { k: "asum", t: "pair", h3: "סיכום הגעות", l: ["תקלות שעלו / מקרים חריגים", "הערות + שיפור שימור"] }
  ]},
  { h: "מלונות", sub: "הערות או תקלות שקרו עם המלון במהלך השבוע. מלון שלא מולא לא ייכנס לקובץ.", b: [
    { k: "hot", t: "hotels" }
  ]},
  { h: "חנויות השכרת ציוד", sub: "מקרים חריגים או דברים חיוביים, דרך התנהלות ומסקנות לשבוע הבא", b: [
    { k: "shop", t: "table", cols: ["חנות", "הערות לחיוב / שלילה"], rows: [{ p: "חנות 1" }, { p: "חנות 2" }, { p: "חנות 3" }], free: true }
  ]},
  { h: "בית הספר לסקי", sub: "מקרים חריגים או דברים חיוביים, דרך התנהלות ומסקנות לשבוע הבא", b: [
    { k: "school", t: "table", cols: ["בית ספר", "הערות לחיוב / שלילה"], rows: [{ p: "בית ספר 1" }, { p: "בית ספר 2" }], free: true }
  ]},
  { h: "גורמים נוספים", sub: "מסעדות, ספא, סקיפסים… אם רלוונטי ויש הערות", b: [
    { k: "ext", t: "table", cols: ["גורם", "פידבק לקוחות", "הערות להמשך עבודה"], rows: [{ p: "גורם 1" }, { p: "גורם 2" }, { p: "גורם 3" }], free: true }
  ]},
  { h: "השתתפות לקוחות בלו״ז שבועי", b: [
    { k: "act", t: "table", cols: ["אטרקציה", "כמות לקוחות שהשתתפו", "איך היה + הערות להמשך"], rows: [{ l: "גלישת היכרות" }, { l: "סבב עיירה / ברים" }, { l: "אפרה סקי" }, { p: "אטרקציה" }, { p: "נוסף 1" }, { p: "נוסף 2" }] }
  ]},
  { h: "אירועים חריגים", b: [
    { k: "evt", t: "table", cols: ["מס' הזמנה (אם רלוונטי)", "תאריך", "האירוע", "סיכום ומה נעשה", "איך נמנע בהמשך"], rows: [{}, {}, {}], free: true }
  ]},
  { h: "פציעות", b: [
    { k: "inj", t: "table", cols: ["מס' הזמנה", "שם הלקוח", "תאריך", "מה קרה", "המשך גלישה / חזרה מוקדמת…"], rows: [{}, {}, {}], free: true }
  ]},
  { h: "לקוחות", b: [
    { k: "neg", t: "table", h3: "לקוחות חריגים · שלילי", note: "לקוחות שכדאי שנלמד לגביהם ו/או להוסיף לרשימה השחורה", cols: ["מס' הזמנה", "שם הלקוח", "מה קרה", "המלצה (רשימה שחורה / לשים לב בעתיד)"], rows: [{}, {}], free: true },
    { k: "pos", t: "table", h3: "לקוחות שבלטו לטובה", note: "לקוחות וקבוצות ששיתפו פעולה באופן יוצא דופן", cols: ["מס' הזמנה", "שם הלקוח", "למה בלטו"], rows: [{}, {}], free: true }
  ]},
  { h: "הצעות ייעול לשבועות הבאים + בקשות מהמשרד", b: [
    { k: "imp", t: "table", cols: ["נושא", "הצעה"], rows: [{}, {}, {}], free: true }
  ]},
  { h: "מודיעין עסקי", b: [
    { k: "intel", t: "table", cols: ["חברה מתחרה", "הערות"], rows: [{ p: "חברה 1" }, { p: "חברה 2" }], free: true }
  ]}
];
const wfEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const wfId = (w, k, r, c) => `wf-${w}-${k}-${r}-${c}`;
let wfWeek = (() => { try { return localStorage.getItem("penguin-wf-week") || "w1"; } catch (e) { return "w1"; } })();
if (!WEEKS.some(x => x.id === wfWeek)) wfWeek = "w1";

function wfVal(id){
  if (id.startsWith("s-")) return (tstore(TKEY.sums)[id] || "");
  return (tstore(TKEY.wform)[id] || "");
}
function wfFilled(w){
  const o = tstore(TKEY.wform), p = `wf-${w}-`;
  return !!(tstore(TKEY.sums)["s-" + w] || "").trim() || Object.keys(o).some(k => k.startsWith(p) && String(o[k]).trim());
}
function wfField(id, ph, area, lab){
  const v = wfEsc(wfVal(id));
  const al = lab ? ` aria-label="${wfEsc(String(lab).replace(/<[^>]+>/g, ""))}"` : "";
  return area
    ? `<textarea class="wf-in wf-ta" id="${id}"${al} placeholder="${wfEsc(ph || "")}" rows="3">${v}</textarea>`
    : `<input class="wf-in" id="${id}"${al} value="${v}" placeholder="${wfEsc(ph || "")}" autocomplete="off">`;
}
function wfBlock(w, wk, b){
  let h = b.h3 ? `<h4 class="wf-h3">${b.h3}</h4>` : "";
  if (b.note) h += `<p class="wf-note">${b.note}</p>`;
  if (b.t === "text") return h + `<label class="wf-lab" for="s-${w}">${b.l}</label>` + wfField("s-" + w, "מה עבד, מה לא, ומה משנים לשבוע הבא… (בהיעדר פירוט אפשר לכתוב 'ללא')", true);
  if (b.t === "pair") return h + `<div class="wf-pair">${b.l.map((l, i) => `<div><label class="wf-lab" for="${wfId(w, b.k, 0, i)}">${l}</label>${wfField(wfId(w, b.k, 0, i), "", true)}</div>`).join("")}</div>`;
  if (b.t === "hotels") return h + `<div class="wf-hotels">${WF_HOTELS.map((n, r) => `
    <div class="wf-hotel"><div class="wf-hn">${wfField(wfId(w, b.k, r, 0), n, false, "שם המלון")}</div>
      ${["התנהלות כללית עם המלון ועבודה משותפת", "לקוחות", "דברים נוספים שעלו לחיוב / שלילה"].map((l, i) => `<label class="wf-lab" for="${wfId(w, b.k, r, i + 1)}">${l}</label>${wfField(wfId(w, b.k, r, i + 1), "הערות כלליות, מספר הזמנה אם רלוונטי", true)}`).join("")}
    </div>`).join("")}</div>`;
  const def = b.def ? b.def(wk) : null;
  const n = b.cols.length;
  return h + `<div class="wf-tw"><table class="wf-t" style="--n:${n}"><thead><tr>${b.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${
    b.rows.map((row, r) => `<tr>${b.cols.map((c, ci) => {
      if (ci === 0 && row.l) return `<th class="wf-rl">${row.l}</th>`;
      const ph = ci === 0 && row.p ? row.p : (def ? def[ci] : "");
      return `<td>${wfField(wfId(w, b.k, r, ci), ph, ci > 0 && n <= 3, c + (row.l ? " · " + row.l : ""))}</td>`;
    }).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}
function wfRender(){
  const host = document.getElementById("wfForm"), chips = document.getElementById("wfWeeks");
  if (!host) return;
  const wk = WEEKS.find(x => x.id === wfWeek);
  chips.innerHTML = WEEKS.map(x => `<button type="button" class="wf-chip ${x.id === wfWeek ? "on" : ""} ${x.brk ? "brk" : ""}" data-w="${x.id}" aria-pressed="${x.id === wfWeek}"><b>${x.n}</b><span dir="ltr">${x.d}</span>${wfFilled(x.id) ? '<i aria-label="יש תוכן">✓</i>' : ""}</button>`).join("");
  document.getElementById("wfTitle").textContent = `סיכום ${wk.n}`;
  document.getElementById("wfDates").textContent = wk.d;
  host.innerHTML = WF.map((s, i) => `
    <section class="wf-sec"><div class="wf-sh"><span class="wf-no">${String(i + 1).padStart(2, "0")}</span><h3>${s.h}</h3>${s.sub ? `<p>${s.sub}</p>` : ""}</div>
      ${s.b.map(b => wfBlock(wk.id, wk, b)).join("")}
    </section>`).join("");
}
function wfRefresh(){
  const a = document.activeElement;
  if (a && a.closest && a.closest("#wfForm")) {
    document.querySelectorAll("#wfWeeks .wf-chip").forEach(c => { const f = wfFilled(c.dataset.w), i = c.querySelector("i"); if (f && !i) c.insertAdjacentHTML("beforeend", "<i>✓</i>"); if (!f && i) i.remove(); });
    return;
  }
  wfRender();
}
window.wfRefresh = wfRefresh;

(function(){
  const host = document.getElementById("wfForm"); if (!host) return;
  wfRender();
  document.getElementById("wfWeeks").addEventListener("click", e => {
    const b = e.target.closest(".wf-chip"); if (!b) return;
    wfWeek = b.dataset.w; try { localStorage.setItem("penguin-wf-week", wfWeek); } catch (er) {}
    wfRender();
  });
  let t;
  host.addEventListener("input", e => {
    const el = e.target; if (!el.id) return;
    const key = el.id.startsWith("s-") ? TKEY.sums : TKEY.wform;
    const o = tstore(key); o[el.id] = el.value; tsave(key, o);
    const st = document.getElementById("wfSaved"); st.textContent = "נשמר ✓"; clearTimeout(t); t = setTimeout(() => { st.textContent = ""; }, 1600);
    const chip = document.querySelector(`#wfWeeks .wf-chip[data-w="${wfWeek}"]`);
    if (chip && !chip.querySelector("i") && el.value.trim()) chip.insertAdjacentHTML("beforeend", "<i>✓</i>");
  });
  document.getElementById("wfWord").addEventListener("click", () => wfDownload()); /* wfDownload lives in weekly-summary-docx.js, loaded right after this file */
})();
