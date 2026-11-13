/* WhatsApp group links on the overview (from the links sheet). */
(function(){
  const box = document.getElementById('waBox'), grid = document.getElementById('waGrid');
  if (!box || !window.PENGUIN_API) return;
  const E = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const SUB = {"וואלטורנס":"שבת עד שבת","לה מנואר":"ראשון עד ראשון"};
  /* "2.1–9.1.27" or "5.12-12.12" -> [start, end] */
  function span(d){
    const p = String(d).split(/[–—-]/).map(x => x.trim().split('.').map(Number)); if (p.length < 2) return null;
    const [a, b] = p; let y = b[2] ? 2000 + (b[2] % 100) : 2026;
    const end = new Date(y, (b[1] || a[1]) - 1, b[0]);
    const sm = a[1] || b[1]; const start = new Date(sm > end.getMonth() + 1 ? y - 1 : y, sm - 1, a[0]);
    return isNaN(start) || isNaN(end) ? null : [start, end];
  }
  function render(sites){
    const now = new Date(); now.setHours(0,0,0,0);
    grid.innerHTML = sites.map(st => {
      let mark = -1;
      st.weeks.forEach((w,i) => { const r = span(w.d); if (mark < 0 && r && now < r[1]) mark = i; });
      const rows = st.weeks.map((w,i) => {
        const r = span(w.d), cur = i === mark, tag = cur ? (r && now >= r[0] ? 'השבוע' : 'הבא') : '';
        const act = w.link
          ? `<a class="wa-j" href="${E(w.link)}" target="_blank" rel="noopener">הצטרפות</a><button type="button" class="wa-cp" data-l="${E(w.link)}" aria-label="העתקת הקישור לשבוע ${E(w.n)}">העתקה</button>`
          : '<span class="wa-none">אין קישור עדיין</span>';
        return `<div class="wa-r ${cur ? 'now' : ''}"><b>שבוע ${E(w.n)}</b><span class="wa-d"><bdi dir="ltr">${E(w.d)}</bdi>${tag ? `<span class="wa-tag">${tag}</span>` : ''}</span>${act}</div>`;
      }).join('');
      return `<div class="wa-c"><h3>${E(st.name)}</h3><p class="wa-s">${E(SUB[st.name] || '')}</p>${rows}</div>`;
    }).join('');
  }
  grid.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) copyText(b.dataset.l, 'הקישור הועתק'); });
  /* 10.11.26: say why the links are missing instead of hiding the section, for anyone with the team or owner key */
  let hasKey = false; try { hasKey = !!(localStorage.getItem('penguin-team-key') || localStorage.getItem('penguin-owner-key')); } catch(e){}
  const note = t => { box.hidden = false; grid.innerHTML = '<p class="wa-msg">' + t + '</p>'; };
  fetch(window.PENGUIN_API + '?a=wa' + (window.PENGUIN_AUTH ? window.PENGUIN_AUTH() : '') + '&t=' + Date.now()).then(r => r.json()).then(j => {
    if (j && j.ok && Array.isArray(j.sites)){ box.hidden = false; render(j.sites); return; }
    if (!hasKey && !(j && j.owner)) return;
    if (j && j.ok && !j.sites) note('השרת עוד לא מעודכן: ב־Apps Script צריך Deploy > Manage deployments > עריכה > Version: New version > Deploy.');
    else if (j && j.error === 'team_only') note('הקישור שנשמר בדפדפן הזה לא מזוהה כקישור הצוות. פתחו שוב את קישור הצוות.');
    else note('לא הצלחתי לטעון את הקישורים מהגיליון' + (j && j.error ? ' (' + String(j.error).replace(/[<>&]/g, '') + ')' : '') + '.');
  }).catch(() => { if (hasKey) note('לא הצלחתי לטעון את הקישורים. נסו לרענן.'); });
})();
