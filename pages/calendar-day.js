/* Day view of the schedule tab: one day's events on a scrollable 24-hour grid, France time (used by pages/calendar.js). */
window.CalDay = (function(){
  const H = 84; /* px per hour */
  const mins = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
  const hm = n => String(Math.floor(n / 60) % 24).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  /* now in France, minutes since midnight */
  const frNow = () => { try { return mins(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date())); } catch(e){ return null; } };

  /* evs: the day's events (normalized by calendar.js); o: { clr, esc, canEdit(x), isToday } */
  function html(evs, o){
    const esc = o.esc;
    const allDay = evs.filter(x => x.range || mins(x.tm) === null);
    const timed = evs.filter(x => !x.range && mins(x.tm) !== null).map(x => {
      const s = mins(x.tm), e0 = mins(x.em);
      return { x, s, e: e0 !== null && e0 > s ? e0 : (e0 === 0 ? 1440 : s + 60) };
    }).sort((a, b) => a.s - b.s || b.e - a.e);

    /* events that overlap share the width side by side */
    const groups = []; let cur = [], end = -1;
    timed.forEach(b => { if (cur.length && b.s >= end){ groups.push(cur); cur = []; end = -1; } cur.push(b); end = Math.max(end, b.e); });
    if (cur.length) groups.push(cur);
    groups.forEach(g => { const lanes = []; g.forEach(b => { let i = lanes.findIndex(t => t <= b.s); if (i < 0){ i = lanes.length; lanes.push(0); } lanes[i] = b.e; b.lane = i; }); g.forEach(b => b.n = lanes.length); });

    let rows = '';
    for (let h = 0; h < 24; h++) rows += `<div class="dv-h" style="top:${h * H}px"><span>${hm(h * 60)}</span></div>`;

    const blocks = timed.map(b => {
      const x = b.x, top = b.s / 60 * H, ht = Math.max(24, (b.e - b.s) / 60 * H - 3), c = o.clr(x);
      const size = ht < 40 ? ' xs' : ht < 62 ? ' sm' : '';
      const ed = o.canEdit(x) ? ` data-edit="${esc(x.id)}" role="button" tabindex="0" title="עריכה"` : '';
      return `<div class="dv-ev${size}${c === CalSource.none ? ' nc' : ''}" style="--c:${c};top:${top}px;height:${ht}px;--l:${b.lane};--n:${b.n}"${ed}>`
        + `<b><bdi dir="ltr" class="dv-tm">${hm(b.s)}–${hm(b.e)}</bdi> ${esc(x.t)}</b>`
        + (x.d ? `<small>${esc(x.d)}</small>` : '') + `</div>`;
    }).join('');

    const n = o.isToday ? frNow() : null;
    const now = n !== null ? `<div class="dv-now" style="top:${n / 60 * H}px"><span>${hm(n)}</span></div>` : '';
    /* open the scroll at "now" (today) or a bit before the first event, else 08:00 */
    const first = timed.length ? timed[0].s : 480;
    const at = Math.max(0, ((n !== null ? Math.min(n, first) : first) - 30) / 60 * H);

    const top = allDay.length ? `<div class="dv-all">${allDay.map(x => `<span class="dv-chip" style="--c:${o.clr(x)}"${o.canEdit(x) ? ` data-edit="${esc(x.id)}" role="button" tabindex="0"` : ''}><b>${esc(x.t)}</b>${x.d ? `<small>${esc(x.d)}</small>` : ''}</span>`).join('')}</div>` : '';
    const empty = !evs.length ? '<p class="cal-empty dv-empty">אין אירועים ביום הזה</p>' : '';
    return `<div class="dv">${top}${empty}<div class="dv-scroll" data-at="${Math.round(at)}"><div class="dv-body" style="height:${24 * H}px">${rows}<div class="dv-cols">${blocks}</div>${now}</div></div><p class="dv-note">שעון צרפת · גוללים בתוך הלו״ז לאורך היום${timed.some(b => o.canEdit(b.x)) ? ' · לחיצה על אירוע פותחת עריכה' : ''}</p></div>`;
  }
  /* after the html is in the page: scroll to the morning / now */
  function settle(root){ const s = root.querySelector('.dv-scroll'); if (s) s.scrollTop = +s.dataset.at || 0; }
  return { html, settle };
})();
