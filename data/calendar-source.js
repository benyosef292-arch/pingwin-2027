/* The one place every schedule view gets its dates from: the team's Google Calendar (built-in seed until it answers). */
/* Views: pages/calendar.js, pages/overview-timeline.js, pages/prep-week.js. Each calls CalSource.onChange(fn) and redraws. */
(function(){
  /* used until the team's Google Calendar answers; s/e are inclusive dates; mk = label + subtitle on the season timeline */
  const SEED = [
    { t: 'ישיבת צוות 1', s: '2026-10-21', type: 'team', d: 'חלוקת תפקידים ומשימות', mk: ['פגישה 1', 'שיחת צוות, תכנים, לפטופ'] },
    { t: 'ישיבה עם כרמל', s: '2026-10-28', type: 'team', d: 'שאלות לקראת הישיבה עם סמדר', mk: ['ישיבה עם כרמל', 'שאלות לקראת הישיבה עם סמדר'] },
    { t: 'ישיבה עם סמדר', s: '2026-11-01', type: 'team', d: 'עוברים על המשימות והלו״ז', mk: ['ישיבה עם סמדר', 'עוברים על המשימות והלו״ז'] },
    { t: 'שבוע עבודה על המשימות', s: '2026-11-05', e: '2026-11-10', type: 'work', d: 'ביצוע המשימות לפני הסגירה מול אורן וחן' },
    { t: 'אורן וחן · במשרד', s: '2026-11-11', type: 'team', d: 'פגישה פיזית · סגירת הלו״ז ואישורו', mk: ['אורן וחן במשרד', 'סגירת הלו״ז ואישורו'] },
    { t: 'פגישת נציגים והנהלה', s: '2026-11-24', type: 'team', d: 'פגישה אחרונה לפני הטיסה', mk: ['פגישת נציגים', 'ישיבה אחרונה עם ההנהלה'] },
    { t: 'טיסה לצרפת', s: '2026-11-26', type: 'flight', d: 'כל הצוות · באתר ברצף עד 06.02', mk: ['טיסה לצרפת', 'שבוע הכנה באתר עד 04.12'] },
    { t: 'הכנה באתר', s: '2026-11-26', e: '2026-12-04', type: 'work', d: 'כל התקופה עד הלקוחות היא הכנה' },
    { t: 'חברת המעליות (סקיפסים)', s: '2026-12-02', tm: '09:00 צרפת', type: 'supplier', d: 'פגישת ספק · 09:00 שעון צרפת' },
    { t: 'שבוע חנוכה · לקוחות', s: '2026-12-05', e: '2026-12-12', type: 'clients', d: 'וולטורנס בלבד', mk: ['שבוע חנוכה', 'וולטורנס בלבד, עד 12.12'] },
    { t: 'וולטורנס · שבועות 1–5', s: '2027-01-02', e: '2027-02-06', type: 'season', d: 'שבת–שבת', mk: ['פתיחת העונה', 'שבועות 1–5 · לה מנואיר מ־03.01'] },
    { t: 'לה מנואיר · שבועות 1–5', s: '2027-01-03', e: '2027-02-07', type: 'season', d: 'ראשון–ראשון' },
    { t: 'חזרה לארץ', s: '2027-02-06', type: 'flight', d: 'לברר: לה מנואיר מסיימת ב־07.02', mk: ['חזרה לארץ', 'ואקאנס עד 06.03'] },
    { t: 'ואקאנס', s: '2027-02-06', e: '2027-03-06', type: 'vac', d: 'החודש שבו לא עובדים' },
    { t: 'וולטורנס · שבועות 6–9', s: '2027-03-06', e: '2027-04-03', type: 'season', d: 'שבת–שבת', mk: ['חזרה לאתר', 'שבועות 6–9'] },
    { t: 'לה מנואיר · שבועות 6–9', s: '2027-03-07', e: '2027-04-04', type: 'season', d: 'ראשון–ראשון' },
    { t: 'חזרה לארץ · סיום העונה', s: '2027-04-04', type: 'flight', d: 'סוף העונה', mk: ['סיום העונה', 'חוזרים הביתה'] },
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
  window.CalSource = {
    seed: SEED,
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
