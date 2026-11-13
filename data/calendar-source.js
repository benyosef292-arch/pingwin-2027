/* The one place every schedule view gets its dates from: the team's Google Calendar (built-in seed until it answers). */
/* Views: pages/calendar.js (month, week, overview strip), pages/prep-week.js. Each calls CalSource.onChange(fn) and redraws. */
(function(){
  /* used until the team's Google Calendar answers; s/e are inclusive dates */
  const SEED = [
    { t: 'ישיבת צוות 1', s: '2026-10-21', type: 'team', d: 'חלוקת תפקידים ומשימות' },
    { t: 'ישיבה עם כרמל', s: '2026-10-28', type: 'team', d: 'שאלות לקראת הישיבה עם סמדר' },
    { t: 'ישיבה עם סמדר', s: '2026-11-01', type: 'team', d: 'עוברים על המשימות והלו״ז' },
    { t: 'שבוע עבודה על המשימות', s: '2026-11-05', e: '2026-11-10', type: 'work', d: 'ביצוע המשימות לפני הסגירה מול אורן וחן' },
    { t: 'אורן וחן · במשרד', s: '2026-11-11', type: 'team', d: 'פגישה פיזית · סגירת הלו״ז ואישורו' },
    { t: 'פגישת נציגים והנהלה', s: '2026-11-24', type: 'team', d: 'פגישה אחרונה לפני הטיסה' },
    { t: 'טיסה לצרפת', s: '2026-11-26', type: 'flight', d: 'כל הצוות · באתר ברצף עד 06.02' },
    { t: 'הכנה באתר', s: '2026-11-26', e: '2026-12-04', type: 'work', d: 'כל התקופה עד הלקוחות היא הכנה' },
    { t: 'חברת המעליות (סקיפסים)', s: '2026-12-02', tm: '09:00 צרפת', type: 'supplier', d: 'פגישת ספק · 09:00 שעון צרפת' },
    { t: 'שבוע חנוכה · לקוחות', s: '2026-12-05', e: '2026-12-12', type: 'clients', d: 'וולטורנס בלבד' },
    { t: 'וולטורנס · שבועות 1–5', s: '2027-01-02', e: '2027-02-06', type: 'season', d: 'שבת–שבת' },
    { t: 'לה מנואיר · שבועות 1–5', s: '2027-01-03', e: '2027-02-07', type: 'season', d: 'ראשון–ראשון' },
    { t: 'חזרה לארץ', s: '2027-02-06', type: 'flight', d: 'לברר: לה מנואיר מסיימת ב־07.02' },
    { t: 'ואקאנס', s: '2027-02-06', e: '2027-03-06', type: 'vac', d: 'החודש שבו לא עובדים' },
    { t: 'וולטורנס · שבועות 6–9', s: '2027-03-06', e: '2027-04-03', type: 'season', d: 'שבת–שבת' },
    { t: 'לה מנואיר · שבועות 6–9', s: '2027-03-07', e: '2027-04-04', type: 'season', d: 'ראשון–ראשון' },
    { t: 'חזרה לארץ · סיום העונה', s: '2027-04-04', type: 'flight', d: 'סוף העונה' },
  ];
  let events = SEED.slice(), calId = '', live = false;
  const subs = [];
  const note = () => subs.forEach(fn => { try { fn(events, calId); } catch(e){} });
  function reload(){
    if (!window.PENGUIN_API) return;
    fetch(window.PENGUIN_API + '?a=cal&t=' + Date.now()).then(r => r.json()).then(j => {
      if (!j || !j.ok || !Array.isArray(j.events) || !j.events.length) return;
      events = j.events; calId = j.calId || ''; live = true; note();
    }).catch(() => {});
  }
  /* event colors: the shades Ben sees in his Google Calendar (sampled from his screenshot 13.11.26), by Google colorId */
  const GCOL = { 11: '#c30808', 6: '#dd7835', 4: '#dd7835', 7: '#4b99d2', 9: '#4b99d2', 2: '#489160', 10: '#489160', 1: '#a479b1', 3: '#a479b1', 8: '#ffffff', 5: '#e8c547' };
  /* Ben's names for his colors, in his order; "white" is assumed to be Graphite (8) */
  const LEGEND = [[11, 'פגישת ספקים שטרם נקבעה'], [6, 'פגישת ספקים שנקבעה'], [7, 'עבודה והכנת צוות'], [10, 'פנאי צוות'], [3, 'ישיבת צוות'], [8, 'גלישת צוות']];
  const GNAME = {}; LEGEND.forEach(([c, n]) => { GNAME[c] = n; }); GNAME[4] = GNAME[6]; GNAME[9] = GNAME[7]; GNAME[2] = GNAME[10]; GNAME[1] = GNAME[3];
  const NONE = '#7d8a96'; /* event with no color in the calendar */
  window.CalSource = {
    color: col => GCOL[col] || '',
    colorName: col => GNAME[col] || 'צבע ביומן',
    none: NONE,
    /* the legend: Ben's six colors always, plus "no color" when some event has none */
    legend: (evs) => LEGEND.map(([c, n]) => [GCOL[c], n]).concat(evs && evs.some(x => x.id && !GCOL[x.col]) ? [[NONE, 'ללא צבע ביומן']] : []),
    /* text color that reads on a full-color chip */
    ink: hex => { const v = parseInt(String(hex).slice(1), 16); return ((v >> 16) * .299 + ((v >> 8) & 255) * .587 + (v & 255) * .114) > 170 ? '#13232F' : '#fff'; },
    events: () => events,
    calId: () => calId,
    live: () => live,
    reload,
    /* run fn after every calendar answer (and right now unless now=false) */
    onChange: (fn, now = true) => { subs.push(fn); if (now) fn(events, calId); },
    /* France wall-clock "HH:MM" from an event's tm text (never converted) */
    frTime: t => { const m = String(t || '').match(/\d{1,2}:\d{2}/); return m ? m[0].padStart(5, '0') : ''; }
  };
  reload();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) reload(); });
})();
