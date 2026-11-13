/* Team calendar on the overview: month/week/3-day views, add events. */
/* ================= team calendar (overview) ================= */
(function(){
  const grid = document.getElementById('calGrid'); if (!grid) return;
  const TYPES = {
    team:     { n: 'ישיבות צוות',  c: '#6B4FBB' },
    supplier: { n: 'פגישות ספקים', c: '#A35F00' },
    flight:   { n: 'טיסות',        c: '#0B5C8C' },
    work:     { n: 'עבודה והכנה',  c: '#3A78C2' },
    clients:  { n: 'לקוחות',       c: '#C0392B' },
    season:   { n: 'שבועות העונה', c: '#0B7A71' },
    vac:      { n: 'ואקאנס',       c: '#66727E' },
    other:    { n: 'אחר',          c: '#5B6B78' }
  };
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
    { t: 'חזרה לארץ · סיום העונה', s: '2027-04-04', type: 'flight', d: 'סוף העונה' }
  ];
  const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  const DAYS = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const p2 = n => (n < 10 ? '0' : '') + n;
  const key = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const parse = k => { const a = String(k).slice(0, 10).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  const fmt = d => p2(d.getDate()) + '.' + p2(d.getMonth() + 1);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const guess = t => /טיס|חזרה לארץ/.test(t) ? 'flight' : /ספק|מעליות|אוטובוס|הדרכ|חנות|ציוד/.test(t) ? 'supplier' : /ישיב|פגיש|צוות/.test(t) ? 'team' : /לקוחות|חנוכה/.test(t) ? 'clients' : 'other';
  const norm = x => { const o = Object.assign({}, x); o.e = o.e || o.s; o.type = TYPES[o.type] ? o.type : guess(o.t || ''); o.S = parse(o.s); o.E = parse(o.e); o.range = o.e !== o.s; return o; };

  /* only meetings and key days: long periods (season weeks, vacances, prep) are not shown unless added from the site */
  const keep = x => !x.range || x.site;
  let EV = SEED.map(norm).filter(keep), calId = '';
  const now = new Date(); let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let view = new Date(today.getFullYear(), today.getMonth(), 1), sel = new Date(today);

  const on = d => EV.filter(x => x.S <= d && d <= x.E).sort((a, b) => (a.range - b.range) || (a.S - b.S));
  const status = x => x.E < today ? 'past' : x.S <= today ? 'now' : 'soon';

  let mode = 'month'; try { if (localStorage.getItem('penguin-calmode') === 'week') mode = 'week'; } catch(e){}
  const wkStart = d => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); return x; };
  function renderWeek(){
    const st = wkStart(sel), en = new Date(st); en.setDate(st.getDate() + 6);
    document.getElementById('calTitle').innerHTML = `<bdi dir="ltr">${st.getDate()}.${st.getMonth() + 1} – ${en.getDate()}.${en.getMonth() + 1}</bdi>`;
    let h = '';
    for (let i = 0; i < 7; i++){
      const d = new Date(st); d.setDate(st.getDate() + i);
      const ev = on(d), k = key(d), cls = ['cal-c'];
      if (+d === +today) cls.push('today'); else if (d < today) cls.push('past');
      if (+d === +sel) cls.push('sel');
      const items = ev.map(x => `<span class="we${x.range ? ' rg' : ''}" style="--c:${TYPES[x.type].c}"><b>${esc(x.t)}</b>${x.tm ? `<small>${esc(x.tm)}</small>` : ''}${x.range ? `<small><bdi dir="ltr">${fmt(x.S)}–${fmt(x.E)}</bdi></small>` : (x.d ? `<small>${esc(x.d)}</small>` : '')}</span>`).join('');
      h += `<button type="button" class="${cls.join(' ')}" data-k="${k}" aria-label="יום ${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${ev.length ? ', ' + ev.length + ' אירועים' : ''}"><span class="cn"><i>${DAYS[d.getDay()]}</i>${d.getDate()}.${d.getMonth() + 1}</span><span class="chips">${items || '<span class="we-none">אין אירועים</span>'}</span></button>`;
    }
    grid.innerHTML = h;
    renderDay(); renderUp();
  }
  function render(){
    grid.classList.toggle('wk', mode === 'week');
    grid.closest('.cal').classList.toggle('is-wk', mode === 'week');
    document.querySelectorAll('[data-cm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cm === mode)));
    document.getElementById('calPrev').setAttribute('aria-label', mode === 'week' ? 'השבוע הקודם' : 'החודש הקודם');
    document.getElementById('calNext').setAttribute('aria-label', mode === 'week' ? 'השבוע הבא' : 'החודש הבא');
    if (mode === 'week') return renderWeek();
    document.getElementById('calTitle').textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    const last = new Date(view.getFullYear(), view.getMonth() + 1, 0);
    const weeks = Math.ceil((first.getDay() + last.getDate()) / 7);
    let h = '';
    for (let i = 0; i < weeks * 7; i++){
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ev = on(d), k = key(d);
      const cls = ['cal-c'];
      if (d.getMonth() !== view.getMonth()) cls.push('out');
      if (+d === +today) cls.push('today');
      else if (d < today) cls.push('past');
      if (+d === +sel) cls.push('sel');
      const chips = ev.slice(0, 3).map(x => {
        const head = !x.range || +d === +x.S || d.getDay() === 0 || d.getDate() === 1;
        return `<span class="ce${x.range ? ' rg' : ''}${+d === +x.S ? ' st' : ''}${+d === +x.E ? ' en' : ''}" style="--c:${TYPES[x.type].c}" title="${esc(x.t)}">${head ? esc(x.t) : '&nbsp;'}</span>`;
      }).join('') + (ev.length > 3 ? `<span class="ce more">+${ev.length - 3}</span>` : '');
      const dots = ev.slice(0, 4).map(x => `<i style="background:${TYPES[x.type].c}"></i>`).join('');
      h += `<button type="button" class="${cls.join(' ')}" data-k="${k}" aria-label="${d.getDate()} ${MONTHS[d.getMonth()]}${ev.length ? ' · ' + ev.length + ' אירועים' : ''}"><span class="cn">${d.getDate()}</span><span class="chips">${chips}</span><span class="dots">${dots}</span></button>`;
    }
    grid.innerHTML = h;
    renderDay(); renderUp();
  }
  function item(x, big){
    const st = status(x);
    const when = x.range ? fmt(x.S) + '–' + fmt(x.E) : fmt(x.S) + ' · יום ' + DAYS[x.S.getDay()];
    let tag = '';
    if (st === 'now') tag = `<em class="now">${x.range ? 'עכשיו' : 'היום'}</em>`;
    else if (st === 'soon'){ const n = Math.round((x.S - today) / 864e5); tag = `<em>${n === 1 ? 'מחר' : 'בעוד ' + n + ' ימים'}</em>`; }
    else tag = '<em class="done">✓ עבר</em>';
    return `<div class="ci ${st}" style="--c:${TYPES[x.type].c}"><span class="cbar"></span><div><b>${esc(x.t)}</b><small><bdi dir="ltr">${when}</bdi>${x.tm ? ' · ' + esc(x.tm) : ''}${big && x.d ? ' · ' + esc(x.d) : ''}</small>${big && x.id && (x.site || PG_EDIT) ? `<span class="ci-acts"><button type="button" class="ci-ed" data-edit="${esc(x.id)}">עריכה</button><button type="button" class="ci-del" data-del="${esc(x.id)}">מחיקה</button></span>` : ''}</div>${tag}</div>`;
  }
  function renderDay(){
    const ev = on(sel);
    const isT = +sel === +today;
    document.getElementById('calDay').innerHTML = `<h4>${isT ? 'היום · ' : ''}יום ${DAYS[sel.getDay()]} ${fmt(sel)}</h4>` +
      (ev.length ? ev.map(x => item(x, true)).join('') : '<p class="cal-empty">אין אירועים ביום הזה</p>');
  }
  function renderUp(){
    const list = EV.filter(x => x.E >= today && x.type !== 'season').sort((a, b) => a.S - b.S).slice(0, 6);
    document.getElementById('calUp').innerHTML = list.map(x => item(x, false)).join('') || '<p class="cal-empty">אין אירועים קרובים</p>';
    const nx = EV.filter(x => !x.range && x.S >= today && x.type !== 'season').sort((a, b) => a.S - b.S)[0];
    const T = document.getElementById('heroNextT');
    if (T && nx){
      const isT = +nx.S === +today, n = Math.round((nx.S - today) / 864e5);
      document.getElementById('heroNextK').textContent = isT ? 'היום' : 'המפגש הבא';
      T.textContent = nx.t;
      document.getElementById('heroNextD').textContent = fmt(nx.S) + ' · יום ' + DAYS[nx.S.getDay()] + (isT ? '' : ' · ' + (n === 1 ? 'מחר' : 'בעוד ' + n + ' ימים'));
    }
  }
  const legend = () => { document.getElementById('calLegend').innerHTML = Object.keys(TYPES).filter(t => t !== 'other' && EV.some(x => x.type === t)).map(t => `<span><i style="background:${TYPES[t].c}"></i>${TYPES[t].n}</span>`).join(''); };
  legend();
  grid.addEventListener('click', e => { const c = e.target.closest('.cal-c'); if (!c) return; sel = parse(c.dataset.k); if (mode === 'month' && sel.getMonth() !== view.getMonth()) view = new Date(sel.getFullYear(), sel.getMonth(), 1); render(); });
  document.getElementById('calPrev').addEventListener('click', () => { if (mode === 'week'){ sel = new Date(sel); sel.setDate(sel.getDate() - 7); view = new Date(sel.getFullYear(), sel.getMonth(), 1); } else view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); });
  document.getElementById('calNext').addEventListener('click', () => { if (mode === 'week'){ sel = new Date(sel); sel.setDate(sel.getDate() + 7); view = new Date(sel.getFullYear(), sel.getMonth(), 1); } else view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); });
  document.querySelectorAll('[data-cm]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.cm; try { localStorage.setItem('penguin-calmode', mode); } catch(e){} if (mode === 'month') view = new Date(sel.getFullYear(), sel.getMonth(), 1); render(); }));
  document.getElementById('calToday').addEventListener('click', () => { view = new Date(today.getFullYear(), today.getMonth(), 1); sel = new Date(today); render(); });
  render();

  /* add to the schedule: writes a real event into the team's Google Calendar through the sheet script */
  const pd2 = n => String(n).padStart(2, '0');
  const opts = (n, from, step) => Array.from({ length: n }, (_, i) => `<option value="${pd2(from + i * step)}">${pd2(from + i * step)}</option>`).join('');
  const YRS = [today.getFullYear(), today.getFullYear() + 1];
  const dsel = (n, opt) => `<div class="cadd-dt"><select name="${n}d" aria-label="יום">${opt ? '<option value="">יום</option>' : ''}${opts(31, 1, 1)}</select><select name="${n}m" aria-label="חודש">${opt ? '<option value="">חודש</option>' : ''}${MONTHS.map((m, i) => `<option value="${pd2(i + 1)}">${m}</option>`).join('')}</select><select name="${n}y" aria-label="שנה">${opt ? '<option value="">שנה</option>' : ''}${YRS.map(y => `<option>${y}</option>`).join('')}</select></div>`;
  const dlg = document.createElement('div'); dlg.className = 'cadd'; dlg.hidden = true;
  dlg.innerHTML = `<form class="cadd-box" role="dialog" aria-modal="true" aria-labelledby="caddH" novalidate>
    <h3 id="caddH">הוספה ללו״ז</h3>
    <label>מה<input name="t" required maxlength="120" placeholder="למשל: פגישה עם חנות הציוד" autocomplete="off"></label>
    <fieldset class="cadd-f"><legend>תאריך</legend>${dsel('s', false)}</fieldset>
    <fieldset class="cadd-f"><legend>עד תאריך <i>(לא חובה)</i></legend>${dsel('e', true)}</fieldset>
    <div class="cadd-row"><fieldset class="cadd-f"><legend>שעה <i>(לא חובה)</i></legend><div class="cadd-dt"><select name="th" aria-label="שעה"><option value="">שעה</option>${opts(24, 0, 1)}</select><select name="tmi" aria-label="דקות"><option value="">דקות</option>${opts(12, 0, 5)}</select></div></fieldset><label>לפי שעון<select name="zone"><option value="Asia/Jerusalem">ישראל</option><option value="Europe/Paris">צרפת</option></select></label></div>
    <label>סוג<select name="type">${Object.keys(TYPES).filter(k => k !== 'season' && k !== 'vac').map(k => `<option value="${k}">${TYPES[k].n}</option>`).join('')}</select></label>
    <label>הערה <i>(לא חובה)</i><input name="d" maxlength="300" autocomplete="off"></label>
    <p class="cadd-msg" role="status"></p>
    <div class="cadd-act"><button type="submit" class="pri">הוספה ללו״ז</button><button type="button" data-x>ביטול</button></div>
  </form>`;
  document.body.appendChild(dlg);
  const fm = dlg.querySelector('form'), msg = dlg.querySelector('.cadd-msg');
  const creds = () => { let tk = '', key = ''; try { tk = localStorage.getItem('penguin-team-key') || ''; key = localStorage.getItem('penguin-owner-key') || ''; } catch(e){} return { tk, key }; };
  let back = null, editing = null;
  const setD = (n, v) => { const [y, m, d] = v ? v.split('-') : ['', '', '']; if (y && !YRS.includes(+y)) fm[n + 'y'].insertAdjacentHTML('beforeend', `<option>${y}</option>`); fm[n + 'y'].value = y; fm[n + 'm'].value = m; fm[n + 'd'].value = d; };
  const getD = n => { const y = fm[n + 'y'].value, m = fm[n + 'm'].value, d = fm[n + 'd'].value; if (!y && !m && !d) return ''; if (!y || !m || !d) return 'bad'; const x = new Date(+y, +m - 1, +d); return x.getMonth() === +m - 1 ? `${y}-${m}-${d}` : 'bad'; };
  function openAdd(x){
    back = document.activeElement; fm.reset(); msg.textContent = ''; msg.className = 'cadd-msg';
    editing = x && x.id ? x : null;
    fm.type.querySelectorAll('[data-tmp]').forEach(o => o.remove());
    dlg.querySelector('#caddH').textContent = editing ? 'עריכת אירוע' : 'הוספה ללו״ז';
    fm.querySelector('.pri').textContent = editing ? 'שמירה' : 'הוספה ללו״ז';
    if (editing){
      fm.t.value = x.t; setD('s', x.s); setD('e', x.range ? x.e : ''); if (!fm.type.querySelector(`[value="${x.type}"]`)) fm.type.insertAdjacentHTML('beforeend', `<option value="${x.type}" data-tmp>${TYPES[x.type].n}</option>`); fm.type.value = x.type; fm.d.value = x.d || '';
      const hm = (x.tm || '').match(/(\d{2}):(\d{2})/);
      if (hm){ fm.th.value = hm[1]; fm.tmi.value = hm[2]; if (!fm.tmi.value) fm.tmi.insertAdjacentHTML('beforeend', `<option>${hm[2]}</option>`), fm.tmi.value = hm[2]; fm.zone.value = /צרפת/.test(x.tm) ? 'Europe/Paris' : 'Asia/Jerusalem'; }
    } else setD('s', key(sel));
    dlg.hidden = false; fm.t.focus();
  }
  function closeAdd(){ dlg.hidden = true; if (back) back.focus(); }
  const ERR = { team_only: 'אפשר להוסיף רק מהקישור של הצוות. פתחו את האתר מהקישור ששלחתי בוואטצאפ.', unknown_doc: 'עוד לא עדכנו את הסקריפט של הגיליון. בן צריך להדביק את הקוד החדש ולפרסם גרסה.', bad_event: 'חסרים שם או תאריך.', not_site_event: 'אפשר למחוק רק אירועים שנוספו מהאתר.' };
  fm.addEventListener('submit', e => {
    e.preventDefault();
    const bad = (t, el) => { msg.textContent = t; msg.className = 'cadd-msg err'; el.focus(); };
    const s0 = getD('s'), e0 = getD('e'), th = fm.th.value, tmi = fm.tmi.value;
    if (!fm.t.value.trim()) return bad('כתבו מה האירוע.', fm.t);
    if (!s0 || s0 === 'bad') return bad('תאריך לא תקין.', fm.sd);
    if (e0 === 'bad') return bad('תאריך הסיום לא תקין.', fm.ed);
    if (e0 && e0 < s0) return bad('תאריך הסיום לפני תאריך ההתחלה.', fm.ed);
    if (!th !== !tmi) return bad('בחרו שעה ודקות.', th ? fm.tmi : fm.th);
    const ev = { t: fm.t.value.trim(), s: s0, e: e0 === s0 ? '' : e0, tm: th ? th + ':' + tmi : '', zone: fm.zone.value, type: fm.type.value, d: fm.d.value.trim() };
    if (ev.tm && ev.e) return bad('שעה אפשר רק לאירוע של יום אחד.', fm.th);
    const btn = fm.querySelector('.pri'); btn.disabled = true; msg.textContent = editing ? 'שומר…' : 'מוסיף…'; msg.className = 'cadd-msg';
    const was = editing;
    fetch(window.PENGUIN_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign(was ? { a: 'editEvent', id: was.id, ev } : { a: 'addEvent', ev }, creds())) })
      .then(r => r.json()).then(j => {
        btn.disabled = false;
        if (!j || !j.ok){ msg.textContent = ERR[j && j.error] || (was ? 'לא נשמר. בדקו את החיבור ונסו שוב.' : 'לא נוסף. בדקו את החיבור ונסו שוב.'); msg.className = 'cadd-msg err'; return; }
        const tmTxt = ev.tm ? ev.tm + (ev.zone === 'Europe/Paris' ? ' צרפת' : '') : '';
        if (was) EV = EV.filter(v => v !== was);
        EV.push(norm({ id: j.id || (was && was.id), t: ev.t, s: ev.s, e: ev.tm ? ev.s : (ev.e || ev.s), type: ev.type, d: ev.d, tm: tmTxt, site: was ? was.site : true }));
        sel = parse(ev.s); view = new Date(sel.getFullYear(), sel.getMonth(), 1);
        closeAdd(); render(); setTimeout(load, 1500);
      }).catch(() => { btn.disabled = false; msg.textContent = 'לא נוסף. בדקו את החיבור ונסו שוב.'; msg.className = 'cadd-msg err'; });
  });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-x]')) closeAdd(); });
  dlg.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.stopPropagation(); closeAdd(); } });
  document.getElementById('calAdd').addEventListener('click', () => openAdd());
  document.getElementById('calDay').addEventListener('click', e => {
    const ed = e.target.closest('[data-edit]');
    if (ed){ const x = EV.find(v => v.id === ed.dataset.edit); if (x) openAdd(x); return; }
    const b = e.target.closest('[data-del]'); if (!b) return;
    const x = EV.find(v => v.id === b.dataset.del); if (!x) return;
    const go2 = () => fetch(window.PENGUIN_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ a: 'delEvent', id: x.id }, creds())) })
      .then(r => r.json()).then(j => { if (j && j.ok){ EV = EV.filter(v => v !== x); render(); setTimeout(load, 1500); } else alert(ERR[j && j.error] || 'לא נמחק. נסו שוב.'); }).catch(() => alert('לא נמחק. בדקו את החיבור ונסו שוב.'));
    (typeof askConfirm === 'function' ? askConfirm(`למחוק את "${x.t}" מהלו״ז של הצוות?`) : Promise.resolve(confirm(`למחוק את "${x.t}"?`))).then(ok => { if (ok) go2(); });
  });

  /* live: the team's Google Calendar through the sheet script */
  function load(){
    if (!window.PENGUIN_API) return;
    fetch(window.PENGUIN_API + '?a=cal&t=' + Date.now()).then(r => r.json()).then(j => {
      if (!j || !j.ok || !Array.isArray(j.events) || !j.events.length) return;
      EV = j.events.map(norm).filter(keep); calId = j.calId || ''; legend();
      const a = document.getElementById('calLink');
      if (calId){ a.href = 'https://calendar.google.com/calendar/u/0/r?cid=' + encodeURIComponent(calId); a.hidden = false; }
      render();
    }).catch(() => {});
  }
  load();
  setInterval(() => { const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate()); if (+t !== +today){ today = t; render(); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });

  /* person colour dots on the roles card */
  const PC = window.PERSON_COLORS || {};
  document.querySelectorAll('.roles [data-pc]').forEach(i => { i.style.background = PC[i.dataset.pc] || '#8AA3B0'; });
})();
