/* Day view of the schedule tab: one day's events on an hour grid, France time (used by pages/calendar.js). */
window.CalDay = (function(){
  const H = 72; /* px per hour */
  const mins = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
  const hm = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  /* now in France, minutes since midnight */
  const frNow = () => { try { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); return mins(p); } catch(e){ return null; } };

  /* evs: the day's events (normalized by calendar.js); o: { clr, esc, acts(x) -> html, isToday } */
  function html(evs, o){
    const esc = o.esc;
    const allDay = evs.filter(x => x.range || mins(x.tm) === null);
    const timed = evs.filter(x => !x.range && mins(x.tm) !== null).map(x => {
      const s = mins(x.tm), e0 = mins(x.em);
      return { x, s, e: e0 !== null && e0 > s ? e0 : s + 60 };
    }).sort((a, b) => a.s - b.s || b.e - a.e);

    /* events that overlap share the width side by side */
    const groups = []; let cur = [], end = -1;
    timed.forEach(b => { if (cur.length && b.s >= end){ groups.push(cur); cur = []; end = -1; } cur.push(b); end = Math.max(end, b.e); });
    if (cur.length) groups.push(cur);
    groups.forEach(g => { const lanes = []; g.forEach(b => { let i = lanes.findIndex(t => t <= b.s); if (i < 0){ i = lanes.length; lanes.push(0); } lanes[i] = b.e; b.lane = i; }); g.forEach(b => b.n = lanes.length); });

    const h0 = Math.min(8, ...timed.map(b => Math.floor(b.s / 60)));
    const h1 = Math.max(20, ...timed.map(b => Math.ceil(b.e / 60)));
    let rows = '';
    for (let h = h0; h < h1; h++) rows += `<div class="dv-h" style="top:${(h - h0) * H}px"><span>${hm(h * 60)}</span></div>`;

    const blocks = timed.map(b => {
      const x = b.x, top = (b.s - h0 * 60) / 60 * H, ht = Math.max(26, (b.e - b.s) / 60 * H - 3);
      const short = ht < 46 ? ' sh' : '';
      return `<div class="dv-ev${short}" style="--c:${o.clr(x)};top:${top}px;height:${ht}px;--l:${b.lane};--n:${b.n}">`
        + `<span class="dv-tm"><bdi dir="ltr">${hm(b.s)}–${hm(b.e)}</bdi></span><b>${esc(x.t)}</b>`
        + (x.d ? `<small>${esc(x.d)}</small>` : '') + o.acts(x) + `</div>`;
    }).join('');

    let now = '';
    const n = o.isToday ? frNow() : null;
    if (n !== null && n >= h0 * 60 && n <= h1 * 60) now = `<div class="dv-now" style="top:${(n - h0 * 60) / 60 * H}px"><span>${hm(n)}</span></div>`;

    const top = allDay.length ? `<div class="dv-all">${allDay.map(x => `<span class="dv-chip" style="--c:${o.clr(x)}"><b>${esc(x.t)}</b>${x.d ? `<small>${esc(x.d)}</small>` : ''}${o.acts(x)}</span>`).join('')}</div>` : '';
    const empty = !evs.length ? '<p class="cal-empty dv-empty">אין אירועים ביום הזה</p>' : '';
    return `<div class="dv">${top}${empty}<div class="dv-body" style="height:${(h1 - h0) * H}px">${rows}<div class="dv-cols">${blocks}</div>${now}</div><p class="dv-note">שעון צרפת</p></div>`;
  }
  return { html };
})();
