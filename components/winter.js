/* Piste-map system: who am I, my tasks, quick find, sign plates. */
/* ================= winter theme: falling snow  (replaced by the piste-map system: who am I, my tasks, quick find, sign plates) ================= */
(function(){
  const $ = id => document.getElementById(id);
  const PEOPLE = ['בן', 'יותם', 'דורון', 'קרן'];
  const PC = window.PERSON_COLORS || {};
  const ME_KEY = 'penguin-me';
  const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let me = ''; try { me = localStorage.getItem(ME_KEY) || ''; } catch(e){}
  if (!PEOPLE.includes(me)) me = '';

  /* ---------- flight countdown under the brand name ---------- */
  (function(){
    const sub = document.querySelector('.brand span'); if (!sub) return;
    const day = 864e5, t = new Date(); t.setHours(0, 0, 0, 0);
    const D = (d, m, y) => new Date(y, m - 1, d);
    const fly = D(26, 11, 2026), han = D(5, 12, 2026), open = D(2, 1, 2027), end = D(4, 4, 2027);
    const n = x => Math.round((x - t) / day);
    let txt;
    if (t < fly) txt = n(fly) === 1 ? 'הטיסה לצרפת <b>מחר</b>' : `עוד <b>${n(fly)} ימים</b> לטיסה לצרפת`;
    else if (t < han) txt = `באתר · עוד <b>${n(han)} ימים</b> ללקוחות חנוכה`;
    else if (t < open) txt = `עוד <b>${n(open)} ימים</b> לפתיחת העונה`;
    else if (t <= end) txt = `עונה · עוד <b>${n(end)} ימים</b> לסיום`;
    else txt = 'העונה הסתיימה';
    sub.classList.add('cd'); sub.innerHTML = txt;
  })();

  /* ---------- task index from the rendered boards ---------- */
  const PH = { p1: 'לפני היציאה', p2: 'שבוע ההכנה באתר', p3: 'ציוד מהארץ' };
  function tasks(){
    return [...document.querySelectorAll('#view-p1 .task[data-tid], #view-p2 .task[data-tid], #view-p3 .task[data-tid]')].map(row => {
      const id = row.dataset.tid, ph = id.split('|')[0];
      const tt = row.querySelector('.tt'), lab = row.querySelector('.tx label, .tx');
      const title = (tt ? tt.textContent : (lab ? lab.childNodes[0]?.textContent || lab.textContent : row.dataset.t || '')).trim();
      const cat = row.closest('.cat');
      const own = row.querySelector('.own');
      return { id, ph, row, title: title || row.dataset.t || '', cat: cat ? (cat.querySelector('.cat-name')?.textContent || '').trim() : '',
        who: own ? own.dataset.who || '' : '', done: !!row.querySelector('input[data-id]')?.checked,
        dl: cat ? (cat.querySelector('.cat-dl b')?.textContent || '').trim() : '' };
    });
  }
  function reveal(id){
    const ph = id.split('|')[0];
    if (typeof go === 'function') go(ph);
    setTimeout(() => {
      const row = document.querySelector(`#view-${ph} .task[data-tid="${CSS.escape(id)}"]`); if (!row) return;
      const host = $('view-' + ph);
      host.querySelectorAll('.task.hide, .task.notmine').forEach(r => r.classList.remove('hide', 'notmine'));
      host.querySelectorAll('.cat').forEach(c => c.style.display = '');
      const cb = host.querySelector('[data-only-open]'); if (cb && cb.checked && row.querySelector('input:checked')) cb.checked = false;
      const mn = host.querySelector('[data-only-mine]'); if (mn) mn.checked = false;
      row.scrollIntoView({ block: 'center' });
      row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
    }, 80);
  }

  /* ---------- who am I ---------- */
  const right = document.querySelector('.top-right');
  const meWrap = document.createElement('div'); meWrap.className = 'me';
  meWrap.innerHTML = `<button type="button" class="me-btn" aria-haspopup="menu" aria-expanded="false"></button>
    <div class="me-menu" role="menu" hidden><p>מי אתם? האתר יציג קודם את המשימות שלכם.</p>${PEOPLE.map(p => `<button type="button" role="menuitemradio" data-me="${p}" aria-checked="false"><span class="me-av" style="--pc:${PC[p]}">${p[0]}</span>${p}</button>`).join('')}<button type="button" role="menuitemradio" data-me="" aria-checked="false"><span class="me-av none"></span>אף אחד</button></div>`;
  const qfBtn = document.createElement('button'); qfBtn.type = 'button'; qfBtn.className = 'qf-btn'; qfBtn.title = 'חיפוש בכל האתר (/)';
  qfBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span>חיפוש</span><kbd>/</kbd>';
  if (right){ right.insertBefore(meWrap, right.firstChild); right.insertBefore(qfBtn, meWrap); }
  const meBtn = meWrap.querySelector('.me-btn'), meMenu = meWrap.querySelector('.me-menu');
  function paintMe(){
    meBtn.innerHTML = me ? `<span class="me-av" style="--pc:${PC[me]}">${me[0]}</span><span class="nm">${me}</span>` : `<span class="me-av none"></span><span class="nm">מי אני?</span>`;
    meBtn.setAttribute('aria-label', me ? 'אני ' + me + ', להחלפה' : 'בחירת מי אני');
    meMenu.querySelectorAll('[data-me]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.me === me)));
  }
  function setMe(p){ me = p; try { p ? localStorage.setItem(ME_KEY, p) : localStorage.removeItem(ME_KEY); } catch(e){} paintMe(); paintMine(); syncMineSwitches(); }
  meBtn.addEventListener('click', e => { e.stopPropagation(); const open = meMenu.hidden; meMenu.hidden = !open; meBtn.setAttribute('aria-expanded', String(open)); if (open) meMenu.querySelector('[aria-checked="true"]')?.focus(); });
  meMenu.addEventListener('click', e => { const b = e.target.closest('[data-me]'); if (!b) return; setMe(b.dataset.me); meMenu.hidden = true; meBtn.setAttribute('aria-expanded', 'false'); meBtn.focus(); });
  document.addEventListener('click', e => { if (!meWrap.contains(e.target)) { meMenu.hidden = true; meBtn.setAttribute('aria-expanded', 'false'); } });
  meMenu.addEventListener('keydown', e => { if (e.key === 'Escape'){ meMenu.hidden = true; meBtn.focus(); } });

  /* ---------- my tasks panel on the overview ---------- */
  const mine = document.createElement('section'); mine.className = 'mine'; mine.setAttribute('aria-label', 'המשימות שלי');
  const ov = $('view-overview');
  const anchor = ov && [...ov.children].find(c => c.classList.contains('sec-h'));
  /* 5.11.26 (Ben): no "my tasks" panel on the overview; who-am-I lives only in the top bar */
  function paintMine(){
    if (!me){
      mine.style.removeProperty('--pc');
      mine.innerHTML = `<div class="mine-h"><h2>המשימות שלי</h2></div><p class="empty">בוחרים מי אתם בכפתור "מי אני?" למעלה, והמשימות הפתוחות שלכם יופיעו כאן.</p>`;
      return;
    }
    mine.style.setProperty('--pc', PC[me]);
    const list = tasks().filter(t => !t.done && t.who === me);
    const together = tasks().filter(t => !t.done && t.who === 'כולם').length;
    const order = { p1: 0, p2: 1, p3: 2 };
    list.sort((a, b) => order[a.ph] - order[b.ph]);
    const show = list.slice(0, 8);
    mine.innerHTML = `<div class="mine-h"><span class="me-av" style="--pc:${PC[me]}">${me[0]}</span><h2>המשימות של ${me}</h2><span class="cnt">${list.length ? list.length + ' פתוחות' : ''}${together ? ` ועוד ${together} של כל הצוות` : ''}</span>${list.length > 8 ? `<button type="button" class="all" data-all>לכל ${list.length} המשימות</button>` : ''}</div>`
      + (show.length ? `<ol>${show.map(t => `<li tabindex="0" data-go="${E(t.id)}" class="${t.ph === 'p1' ? 'due' : ''}"><i class="k"></i><b>${E(t.title)}</b><span>${E(t.ph === 'p1' ? (t.cat || PH[t.ph]) : PH[t.ph] + (t.cat ? ', ' + t.cat : ''))}</span></li>`).join('')}</ol>`
        : `<p class="empty">אין משימות פתוחות על שמך. אפשר לעזור במשימות של כל הצוות.</p>`);
  }
  mine.addEventListener('click', e => {
    const p = e.target.closest('[data-me]'); if (p) return setMe(p.dataset.me);
    const li = e.target.closest('[data-go]'); if (li) return reveal(li.dataset.go);
    if (e.target.closest('[data-all]')){ const t = tasks().find(x => !x.done && x.who === me); if (t){ go(t.ph); setTimeout(() => { const s = document.querySelector(`#view-${t.ph} [data-only-mine]`); if (s){ s.checked = true; applyFilter($('view-' + t.ph)); } }, 60); } }
  });
  mine.addEventListener('keydown', e => { const li = e.target.closest('[data-go]'); if (li && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); reveal(li.dataset.go); } });

  /* ---------- "only mine" switch on every board ---------- */
  function syncMineSwitches(){
    document.querySelectorAll('.view .toolbar').forEach(tb => {
      let sw = tb.querySelector('[data-only-mine]');
      if (!sw){
        const lab = document.createElement('label'); lab.className = 'switch sw-mine';
        lab.innerHTML = '<input type="checkbox" data-only-mine><span class="track"><span class="knob"></span></span><span class="sw-t"></span>';
        const open = tb.querySelector('[data-only-open]')?.closest('.switch');
        open ? open.after(lab) : tb.appendChild(lab);
        sw = lab.querySelector('input');
      }
      const lab = sw.closest('.switch');
      lab.hidden = !me; lab.querySelector('.sw-t').textContent = me ? 'רק שלי' : '';
      if (!me && sw.checked){ sw.checked = false; const v = tb.closest('.view'); if (v) applyFilter(v); }
    });
  }
  if (typeof applyFilter === 'function'){
    const base = applyFilter;
    applyFilter = function(host){
      base(host);
      const on = me && host.querySelector('[data-only-mine]')?.checked;
      host.querySelectorAll('.task').forEach(r => { const w = r.querySelector('.own')?.dataset.who; r.classList.toggle('notmine', !!on && w !== me && w !== 'כולם'); });
      host.querySelectorAll('.cat').forEach(cat => { if (on) cat.style.display = [...cat.querySelectorAll('.task')].some(r => !r.classList.contains('hide') && !r.classList.contains('notmine')) ? '' : 'none'; });
    };
  }
  document.addEventListener('change', e => { if (e.target.matches('[data-only-mine]')){ const v = e.target.closest('.view'); if (v) applyFilter(v); } });

  /* ---------- sign plates: run marker + one tick per task ---------- */
  const MK = { p1: ['1', '#1858C4'], p2: ['2', '#C62A30'], p3: ['3', '#1C2C37'] };
  const ICON = {
    plan: '<path d="M4 6h16M4 12h16M4 18h10"/>', qs: '<circle cx="12" cy="12" r="8"/><path d="M9.8 9.6a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 .8-1 1.5M12 16.4v.1"/>',
    sum: '<path d="M7 4h10v16H7z"/><path d="M10 9h4M10 13h4"/>', contacts: '<circle cx="12" cy="9" r="3.4"/><path d="M5.5 19c1-3.2 3.6-4.6 6.5-4.6s5.5 1.4 6.5 4.6"/>',
    team: '<path d="M12 4l8 6.5V20H4v-9.5z"/>',
    sup: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>'
  };
  function plates(){
    document.querySelectorAll('.view .vhead').forEach(v => {
      const view = (v.closest('.view') || {}).id?.replace('view-', '') || '';
      const h = v.querySelector('h2'); if (!h) return;
      if (!h.querySelector('.mk') && (MK[view] || ICON[view])){
        const m = document.createElement('span'); m.className = 'mk' + (MK[view] ? '' : ' round'); m.setAttribute('aria-hidden', 'true');
        if (MK[view]){ m.textContent = MK[view][0]; m.style.setProperty('--mk', MK[view][1]); }
        else { m.style.setProperty('--mk', '#1C2C37'); m.innerHTML = `<svg viewBox="0 0 24 24">${ICON[view]}</svg>`; }
        h.insertBefore(m, h.firstChild);
      }
      if (MK[view]){
        const side = v.querySelector('.vhead-side'); if (!side) return;
        let tk = side.querySelector('.ticks');
        if (!tk){ tk = document.createElement('div'); tk.className = 'ticks'; tk.setAttribute('aria-hidden', 'true'); side.appendChild(tk); }
        const rows = [...document.querySelectorAll(`#view-${view} .task input[data-id]`)];
        const sig = rows.map(r => r.checked ? 1 : 0).join('');
        if (tk.dataset.sig !== sig){ tk.dataset.sig = sig; tk.innerHTML = rows.map(r => `<i${r.checked ? ' class="on"' : ''}></i>`).join(''); }
      }
    });
  }

  /* ---------- quick find ---------- */
  const qf = document.createElement('div'); qf.className = 'qf'; qf.hidden = true;
  qf.innerHTML = `<div class="qf-box" role="dialog" aria-modal="true" aria-label="חיפוש באתר"><div class="qf-in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input type="search" placeholder="משימה, איש קשר, מלון…" aria-label="חיפוש" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="qfList"><kbd>Esc</kbd></div><div class="qf-list" id="qfList" role="listbox"></div></div>`;
  document.body.appendChild(qf);
  const qin = qf.querySelector('input'), qlist = qf.querySelector('.qf-list');
  let res = [], sel = 0, lastFocus = null;
  const TABS = [['overview', 'סקירה'], ['p1', 'לפני היציאה'], ['sched', 'לו״ז'], ['p2', 'שבוע ההכנה באתר'], ['p3', 'ציוד מהארץ'], ['wk', 'עבודה שוטפת'], ['qs', 'שאלות פתוחות'], ['inv', 'מחסן'], ['sum', 'סיכומים שבועיים'], ['contacts', 'אנשי קשר'], ['team', 'הצוות שלנו']];
  const hl = (s, q) => { const i = s.toLowerCase().indexOf(q); return i < 0 ? E(s) : E(s.slice(0, i)) + '<mark>' + E(s.slice(i, i + q.length)) + '</mark>' + E(s.slice(i + q.length)); };
  function contacts(){
    return [...document.querySelectorAll('#ctBody .ct')].map(c => ({ name: (c.querySelector('b, h4, .ct-n')?.textContent || c.textContent).trim().split('\n')[0], text: c.textContent.replace(/\s+/g, ' ').trim(), el: c }));
  }
  function search(){
    const q = qin.value.trim().toLowerCase();
    if (!q){ qlist.innerHTML = '<p class="qf-none">מקלידים שם של משימה, איש קשר או מלון. Enter פותח את התוצאה.</p>'; res = []; return; }
    const T = tasks().filter(t => (t.title + ' ' + t.cat + ' ' + t.who).toLowerCase().includes(q)).sort((a, b) => a.done - b.done).slice(0, 12);
    const C = contacts().filter(c => c.text.toLowerCase().includes(q)).slice(0, 6);
    const V = TABS.filter(t => t[1].includes(q)).slice(0, 3);
    res = [...V.map(v => ({ k: 'v', v })), ...T.map(t => ({ k: 't', t })), ...C.map(c => ({ k: 'c', c }))];
    sel = 0;
    if (!res.length){ qlist.innerHTML = `<p class="qf-none">לא נמצא "${E(qin.value.trim())}". נסו מילה אחרת או חלק מהשם.</p>`; return; }
    let i = 0, html = '';
    if (V.length) html += '<h4>לשוניות</h4>' + V.map(v => `<button type="button" class="qf-it" role="option" data-i="${i++}"><i class="k"></i><b>${hl(v[1], q)}</b><small></small></button>`).join('');
    if (T.length) html += '<h4>משימות</h4>' + T.map(t => `<button type="button" class="qf-it${t.done ? ' done' : ''}" role="option" data-i="${i++}"><i class="k"></i><b>${hl(t.title, q)}</b><small>${E(PH[t.ph])}${t.who && t.who !== 'פתוח' ? ', ' + E(t.who === 'כולם' ? 'כולם' : t.who) : ''}</small></button>`).join('');
    if (C.length) html += '<h4>אנשי קשר</h4>' + C.map(c => `<button type="button" class="qf-it ct" role="option" data-i="${i++}"><i class="k"></i><b>${hl(c.name, q)}</b><small></small></button>`).join('');
    qlist.innerHTML = html; mark();
  }
  function mark(){ qlist.querySelectorAll('.qf-it').forEach(b => { const on = +b.dataset.i === sel; b.setAttribute('aria-selected', String(on)); if (on) b.scrollIntoView({ block: 'nearest' }); }); }
  function pick(i){
    const r = res[i]; if (!r) return; closeQf(false);
    if (r.k === 'v') go(r.v[0]);
    else if (r.k === 't') reveal(r.t.id);
    else { go('contacts'); setTimeout(() => { r.c.el.scrollIntoView({ block: 'center' }); r.c.el.classList.remove('flash'); void r.c.el.offsetWidth; r.c.el.classList.add('flash'); }, 80); }
  }
  function openQf(){ if (document.body.classList.contains('deck-mode')) return; lastFocus = document.activeElement; qf.hidden = false; qin.value = ''; search(); qin.focus(); }
  function closeQf(restore = true){ qf.hidden = true; if (restore && lastFocus) lastFocus.focus?.(); }
  qfBtn.addEventListener('click', openQf);
  qin.addEventListener('input', search);
  qin.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); if (res.length){ sel = (sel + 1) % res.length; mark(); } }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); if (res.length){ sel = (sel - 1 + res.length) % res.length; mark(); } }
    else if (e.key === 'Enter'){ e.preventDefault(); pick(sel); }
  });
  qlist.addEventListener('click', e => { const b = e.target.closest('.qf-it'); if (b) pick(+b.dataset.i); });
  qf.addEventListener('click', e => { if (e.target === qf) closeQf(); });
  document.addEventListener('keydown', e => {
    if (!qf.hidden && e.key === 'Escape'){ e.preventDefault(); closeQf(); return; }
    const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')){ e.preventDefault(); openQf(); }
  });

  /* ---------- keep everything in step with the boards ---------- */
  let curView = '', acc = 0, last = 0, sig = '';
  function scan(){
    plates(); syncMineSwitches();
    const s = tasks().map(t => t.id + (t.done ? 1 : 0) + t.who).join();
    if (s !== sig){ sig = s; paintMine(); }
    const v = document.querySelector('#boardMain .view:not([hidden])');
    const id = v ? v.id.replace('view-', '') : 'overview';
    if (id !== curView){ curView = id; if (window.FilmMode) FilmMode.enter(); }
  }
  function frame(ts){ acc += Math.min(.05, (ts - (last || ts)) / 1000); last = ts; if (acc > .4){ acc = 0; scan(); } requestAnimationFrame(frame); }
  paintMe(); scan(); requestAnimationFrame(frame);
})();


let startMode = 'board';
try { if (localStorage.getItem('penguin-mode') === 'deck') startMode = 'deck'; } catch(e){}
setMode(startMode);

