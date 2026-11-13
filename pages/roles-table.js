/* Responsibility table: who owns which area, a color per person. */
/* ================= deck: opening voices ================= */
bindFields("#view-deck textarea.vl, #view-deck textarea.vl2", TKEY.voices);
bindFields("#view-deck textarea.wl", TKEY.hw);
bindFields("#view-meetings textarea.wl2", TKEY.hw);

/* ================= responsibility table ================= */
const RESP_AREAS = [[11, "אוטובוסים צרפת", "hi"], [12, "לה מנואיר · אתר לווין", "hi"], [21, "תנ״ך", "hi"], [2, "מלון 1 · Montana Plein Sud", "hi"], [3, "מלון 2 · Le Cheval Blanc", "hi"], [4, "מלון 3 · Montana Soleil", "hi"], [5, "מלון 4 · Kashmir", "hi"], [6, "מלון 5 · L'Oxalys", "hi"], [1, "סקיפסים", "hi"], [24, "ראש צוות", "mid"], [25, "הודעות וואטצאפ", "mid"], [7, "הדרכות", "mid"], [8, "ציוד", "mid"], [10, "לו\"ז שבועי", "mid"], [9, "קופה קטנה", "lo"], [14, "ימי הולדת ואנשים חשובים", "lo"], [15, "רשתות חברתיות", "lo"], [17, "מעטפות", "mid"], [18, "הכנות להגעה + פקל שדה תעופה", "lo"], [19, "סידור הדרייב", "lo"], [20, "דו\"ח שבוע + סיכום הגעה", "lo"], [22, "מאפייה", "lo"], [23, "מסעדת ג׳אפסר", "lo"]];
window.PERSON_COLORS = { 'בן': '#6941C6', 'יותם': '#0E7490', 'דורון': '#8B5A2B', 'קרן': '#B42370' };
function updateResp(){
  const FIXED = {};   // everyone starts at 0
  const pts = Object.assign({}, FIXED), cnt = {}; let unset = 0, max = 0;
  document.querySelectorAll('#view-deck .rfix[data-w]').forEach(f => { const v = f.dataset.who, w = +f.dataset.w; pts[v] = (pts[v] || 0) + w; cnt[v] = (cnt[v] || 0) + 1; });
  document.querySelectorAll('#view-deck select.rw').forEach(sel => {
    const w = +sel.dataset.w, v = sel.value;
    sel.classList.toggle('empty', !v);
    if (!v) { unset++; return; }
    pts[v] = (pts[v] || 0) + w; cnt[v] = (cnt[v] || 0) + 1;
  });
  Object.values(pts).forEach(p => { if (p > max) max = p; });
  document.querySelectorAll('#view-deck .rload').forEach(el => {
    const n = el.dataset.who, p = pts[n] || 0;
    el.querySelector('.rbar i').style.width = (max ? p / max * 100 : 0) + '%';
    el.querySelector('span').textContent = p + ' נק׳ · ' + (cnt[n] || 0) + ' תחומים';
  });
  const u = document.getElementById('rUnset'); if (u) u.textContent = unset ? unset + ' תחומים עוד לא שובצו' : 'הכול שובץ';
  const PC = window.PERSON_COLORS || {};
  document.querySelectorAll('#view-deck select.rw, #view-deck .rfix').forEach(el => {
    const who = el.value || el.dataset.who || '';
    const row = el.closest('.rrow');
    [el, row].forEach(x => { if (!x) return; if (PC[who]) { x.style.setProperty('--pc', PC[who]); x.dataset.pc = '1'; } else { x.style.removeProperty('--pc'); delete x.dataset.pc; } });
  });
  document.querySelectorAll('#view-deck .rload').forEach(el => { const c = PC[el.dataset.who]; if (c) el.style.setProperty('--pc', c); });
}
window.updateResp = updateResp;
/* keep each column grouped by person: בן, יותם, דורון, קרן, then unassigned (fixed roles first) */
(function(){
  const ORDER = ['בן', 'יותם', 'דורון', 'קרן'];
  const rank = row => { const f = row.querySelector('.rfix'), s = row.querySelector('select.rw'); const who = f ? f.dataset.who : (s ? s.value : ''); const i = ORDER.indexOf(who); return (i < 0 ? 9 : i) * 10 + (f ? 0 : 1); };
  function groupResp(){
    document.querySelectorAll('#view-deck .resp-grid .rcol').forEach(col => {
      const rows = [...col.querySelectorAll(':scope > .rrow')];
      rows.forEach((r, i) => { if (r.dataset.o == null) r.dataset.o = i; });
      rows.sort((a, b) => rank(a) - rank(b) || a.dataset.o - b.dataset.o).forEach(r => col.appendChild(r));
    });
  }
  const _u = window.updateResp;
  window.updateResp = function(){ _u.apply(this, arguments); groupResp(); };
  document.querySelectorAll('#view-deck select.rw').forEach(sel => sel.addEventListener('change', groupResp));
  groupResp();
})();
bindFields("#view-deck .resp-f", TKEY.resp);
document.querySelectorAll('#view-deck select.rw').forEach(sel => sel.addEventListener('change', () => { const o = tstore(TKEY.resp); o[sel.id] = sel.value; tsave(TKEY.resp, o); updateResp(); }));
document.querySelectorAll('#view-deck .resp-f').forEach(el => el.addEventListener('input', updateResp));
updateResp();
const copyResp = document.getElementById('copyResp');
if (copyResp) copyResp.addEventListener('click', () => {
  const lv = { hi: 'תפקיד מרכזי', mid: 'תפקיד בינוני', lo: 'תפקיד קל' };
  const rows = [['תחום אחריות', 'אחראי', 'פירוט תחומי האחריות', 'רמה'].join('\t')].concat(
    RESP_AREAS.map(([i, a, l]) => [a, (document.getElementById('rw-' + i) || {}).value || ((document.getElementById('rw-' + i) || {}).dataset || {}).who || '', ((document.getElementById('rd-' + i) || {}).value || '').replace(/\s+/g, ' '), lv[l]].join('\t')));
  copyText(rows.join('\n'), 'הטבלה הועתקה, אפשר להדביק באקסל');
});

const copyVoices = document.getElementById("copyVoices");
if (copyVoices) copyVoices.addEventListener("click", () => {
  const people = [["בן","v-ben"],["יותם","v-yotam"],["דורון","v-doron"],["קרן","v-keren"]];
  const out = people.map(([n, id]) => n + ":\n" + (((document.getElementById(id) || {}).value || "").trim() || "—")).join("\n\n");
  copyText("מה זה בשבילכם צוות חזק?\n\n" + out, "התשובות הועתקו");
});
