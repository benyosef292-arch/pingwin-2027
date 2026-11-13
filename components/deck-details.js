/* Deck: person colors, role names, day-schedule slide. */
/* PERSON COLORS in split tab */
(function(){
  const paint = () => {
    const PC = window.PERSON_COLORS || {};
    document.querySelectorAll('#spPeople .sp-p').forEach(el => { const n = (el.querySelector('.sp-ph b') || {}).textContent; if (PC[n]) el.style.setProperty('--pc', PC[n]); });
    document.querySelectorAll('#spBody .sp-col').forEach(el => { const h = el.querySelector('.sp-ch'); const n = h && h.firstChild ? h.firstChild.textContent.trim() : ''; if (PC[n]) el.style.setProperty('--pc', PC[n]); });
    document.querySelectorAll('#spBody .sp-sel').forEach(el => { const c = PC[el.value]; if (c){ el.style.setProperty('--pc', c); el.dataset.pc = '1'; } else { el.style.removeProperty('--pc'); delete el.dataset.pc; } });
  };
  if (typeof splitRender === 'function'){ const _r = splitRender; splitRender = function(){ _r.apply(this, arguments); paint(); }; }
  paint();
})();

/* ROLES: each person's areas, read live from the responsibility table */
(function(){
  const FIX = {};
  const NAMES = { 24: 'ראש צוות', 11: 'אוטובוסים צרפת', 12: 'לה מנואיר' };
  const short = n => n.replace(/^מלון \d+ · /, '').replace(' · אתר לווין', '').replace(/ \+ סיכום הגעה$/, '').replace(/ \+ פקל שדה תעופה$/, ' ופק״ל');
  /* areas = the built-in list with Ben's renames, plus areas Ben added (resp doc keys rn-<id>; an empty name deletes an added area) */
  const readSt = () => { try { return JSON.parse(localStorage.getItem('penguin-resp') || '{}') || {}; } catch(e){ return {}; } };
  function areaList(st){
    const base = (typeof RESP_AREAS !== 'undefined') ? RESP_AREAS : [];
    const out = base.map(([i, n, pr]) => [i, (st['rn-' + i] || '').trim() || n, pr, false, !!(st['rn-' + i] || '').trim()]);
    Object.keys(st).filter(k => /^rn-c/.test(k) && String(st[k]).trim()).sort().forEach(k => out.push([k.slice(3), String(st[k]).trim(), 'mid', true, true]));
    return out;
  }
  const nm = a => a[4] ? a[1] : short(a[1]);
  function roles(){
    const st = readSt();
    const out = { 'בן': [], 'יותם': [], 'דורון': [], 'קרן': [] };
    const areas = areaList(st);
    const ord = { hi: 0, mid: 1, lo: 2 };
    areas.slice().sort((a, b) => ord[a[2]] - ord[b[2]]).forEach(a => {
      if (FIX[a[0]]) return;
      const who = st['rw-' + a[0]]; if (who && out[who]) out[who].push(nm(a));
    });
    return out;
  }

  const INFO = {
    11: 'תיאום ההסעות בצרפת: שדה התעופה, העברות ולוחות זמנים מול חברת האוטובוסים',
    12: 'האחראי באתר הלווין: קשר עם המלון והלקוחות בלה מנואיר',
    21: 'תחום התנ״ך של העונה',
    2: 'קשר שוטף עם המלון: חדרים, רשימות לקוחות, בקשות ובעיות',
    3: 'קשר שוטף עם המלון: חדרים, רשימות לקוחות, בקשות ובעיות',
    4: 'קשר שוטף עם המלון: חדרים, רשימות לקוחות, בקשות ובעיות',
    5: 'קשר שוטף עם המלון: חדרים, רשימות לקוחות, בקשות ובעיות',
    6: 'קשר שוטף עם המלון: חדרים, רשימות לקוחות, בקשות ובעיות',
    1: 'הזמנה, הפקה וחלוקה של הסקיפסים מול חברת המעליות',
    24: 'מוביל את הצוות, הישיבות והקשר עם המשרד',
    25: 'ההודעות לקבוצות הלקוחות בוואטצאפ',
    7: 'ההדרכות ללקוחות, מול בתי הספר לסקי והחנויות',
    8: 'הציוד מהארץ ובאתר: רשימות, אריזה ומלאי',
    10: 'בניית הלו״ז השבועי ופרסומו לצוות וללקוחות',
    9: 'ניהול הקופה הקטנה והקבלות',
    14: 'מעקב אחרי ימי הולדת ולקוחות שחשוב לשים לב אליהם',
    15: 'תוכן ותמונות מהאתר לרשתות החברתיות',
    17: 'הכנת המעטפות ללקוחות לפני ההגעה',
    18: 'כל מה שצריך להיות מוכן ליום ההגעה, כולל הפק״ל לשדה',
    19: 'סדר בתיקיות הצוות בדרייב',
    20: 'הדו״ח השבועי למשרד וסיכום כל הגעה',
    22: 'ההזמנות מהמאפייה',
    23: 'הקשר עם מסעדת ג׳אפסר'
  };
  const PRI = { hi: 'עדיפות גבוהה', mid: '', lo: '' };
  const escH = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let editing = false, pend = false;
  function full(){
    const box = document.getElementById('rolesFull'); if (!box) return;
    if (editing && box.contains(document.activeElement) && document.activeElement.matches('input')) { pend = true; return; }
    pend = false;
    const st = readSt(), ed = editing && typeof PG_OWNER !== 'undefined' && PG_OWNER;
    const areas = areaList(st);
    const ord = { hi: 0, mid: 1, lo: 2 };
    const PC = window.PERSON_COLORS || {};
    const people = ['בן', 'יותם', 'דורון', 'קרן'];
    const by = {}; people.forEach(p => by[p] = []);
    const open = [];
    areas.slice().sort((a, b) => ord[a[2]] - ord[b[2]]).forEach(a => { const w = st['rw-' + a[0]]; if (w && by[w]) by[w].push(a); else open.push(a); });
    const who = (i, cur) => `<select class="rf-w" data-id="${escH(i)}" aria-label="מי אחראי"><option value="">בלי אחראי</option>${people.map(p => `<option${p === cur ? ' selected' : ''}>${p}</option>`).join('')}</select>`;
    const edItem = (a, cur) => { const [i, , pr, custom] = a, note = (st['rd-' + i] || '').trim();
      return `<li class="${pr} ed" data-id="${escH(i)}"><input class="rf-n" data-id="${escH(i)}" value="${escH(nm(a))}" aria-label="שם התחום">${who(i, cur)}<input class="rf-d" data-id="${escH(i)}" value="${escH(note)}" placeholder="הערה (לא חובה)" aria-label="הערה"><button type="button" class="rf-x" data-id="${escH(i)}" data-custom="${custom ? 1 : ''}" aria-label="${custom ? 'מחיקת התחום' : 'הסרה מהאחראי'}" title="${custom ? 'מחיקת התחום' : 'הסרה מהאחראי'}">✕</button></li>`; };
    box.classList.toggle('editing', ed);
    box.innerHTML = people.map(p => {
      const l = by[p];
      const items = l.map(a => {
        if (ed) return edItem(a, p);
        const [i, , pr] = a, note = (st['rd-' + i] || '').trim(), n = nm(a);
        return `<li class="${pr}"><b>${escH(n)}</b>${PRI[pr] ? `<em>${PRI[pr]}</em>` : ''}<span>${escH(INFO[i] || '')}${note && note !== INFO[i] && !note.includes(n) ? `<i>${escH(note)}</i>` : ''}</span></li>`;
      }).join('');
      return `<article class="rf" style="--pc:${PC[p] || '#5B6B78'}"><header><span class="rf-av">${escH(p[0])}</span><div><h3>${escH(p)}${p === 'בן' ? ' <small>ראש הצוות</small>' : ''}</h3><p>${l.length} תחומי אחריות</p></div></header><ul>${items || '<li class="none">עוד לא שובצו תחומים</li>'}</ul>${ed ? `<button type="button" class="rf-add" data-who="${p}">+ תחום חדש ל${p}</button>` : ''}</article>`;
    }).join('') + (open.length ? (ed ? `<div class="rf-open ed"><b>בלי אחראי</b><ul>${open.map(a => edItem(a, '')).join('')}</ul></div>` : `<div class="rf-open"><b>עוד בלי אחראי:</b> ${open.map(a => escH(nm(a))).join(' · ')}</div>`) : '');
  }
  /* only Ben (owner key link) edits: button next to the section title */
  (function(){
    const box = document.getElementById('rolesFull'); if (!box) return;
    const h = box.previousElementSibling && box.previousElementSibling.classList.contains('sec-h') ? box.previousElementSibling : null;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'rf-edit'; btn.hidden = true; btn.textContent = 'עריכה';
    if (h) h.appendChild(btn);
    const sync = () => { const own = typeof PG_OWNER !== 'undefined' && PG_OWNER; btn.hidden = !own; if (!own && editing){ editing = false; full(); }
      /* the old table in presentation mode follows the same rule */
      document.querySelectorAll('#view-deck select.rw, #view-deck .resp-f').forEach(el => { el.disabled = !own; el.title = own ? '' : 'רק בן יכול לשנות'; }); };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] }); sync();
    btn.addEventListener('click', () => { editing = !editing; btn.textContent = editing ? 'סיום' : 'עריכה'; btn.setAttribute('aria-pressed', String(editing)); full(); });
    const save = (k, v) => { if (!(typeof PG_OWNER !== 'undefined' && PG_OWNER)) return; const o = tstore(TKEY.resp); if (v === null) delete o[k]; else o[k] = v; tsave(TKEY.resp, o); };
    box.addEventListener('change', e => { const t = e.target, id = t.dataset.id; if (!id) return;
      if (t.classList.contains('rf-w')) { save('rw-' + id, t.value); const sel = document.getElementById('rw-' + id); if (sel) sel.value = t.value; }
      else if (t.classList.contains('rf-n')) { const v = t.value.trim(); if (!v && /^c/.test(id)) return; save('rn-' + id, v); }
      else if (t.classList.contains('rf-d')) { save('rd-' + id, t.value.trim()); const f = document.getElementById('rd-' + id); if (f) f.value = t.value.trim(); }
      else return;
      if (window.updateResp) window.updateResp(); else paint(); });
    box.addEventListener('focusout', () => setTimeout(() => { if (pend && !box.contains(document.activeElement)) paint(); }, 60));
    box.addEventListener('click', async e => {
      const add = e.target.closest('.rf-add');
      if (add) { const id = 'c' + Date.now().toString(36); save('rn-' + id, 'תחום חדש'); save('rw-' + id, add.dataset.who); paint();
        const n = box.querySelector(`.rf-n[data-id="${id}"]`); if (n) { n.focus(); n.select(); } return; }
      const x = e.target.closest('.rf-x'); if (!x) return;
      const id = x.dataset.id;
      if (x.dataset.custom) { const n = box.querySelector(`.rf-n[data-id="${id}"]`); if (!(await (typeof askConfirm === 'function' ? askConfirm(`למחוק את התחום "${n ? n.value : ''}"?`) : Promise.resolve(confirm('למחוק?'))))) return; save('rn-' + id, ''); save('rw-' + id, ''); save('rd-' + id, ''); }
      else { save('rw-' + id, ''); const sel = document.getElementById('rw-' + id); if (sel) sel.value = ''; }
      if (window.updateResp) window.updateResp(); else paint();
    });
  })();
  function paint(){
    const r = roles();
    document.querySelectorAll('[data-roles]').forEach(el => {
      const all = r[el.dataset.roles] || [], mx = +el.dataset.max || 0;
      const list = mx && all.length > mx ? all.slice(0, mx).concat(['+' + (all.length - mx)]) : all;
      el.textContent = list.length ? list.join(' · ') : 'תחום אחריות ייקבע בטבלת האחריות';
      if (el.dataset.tag){ const i = document.createElement('i'); i.textContent = el.dataset.tag; el.appendChild(i); }
    });
    full();
    if (typeof SPLIT_PEOPLE !== 'undefined'){ let ch = false; SPLIT_PEOPLE.forEach(p => { const l = r[p[0]] || []; const t = l.slice(0, 3).join(' · ') + (l.length > 3 ? ' · +' + (l.length - 3) : ''); if (p[1] !== t){ p[1] = t; ch = true; } }); if (ch && typeof splitRender === 'function' && typeof SPLIT_READY !== 'undefined' && SPLIT_READY) splitRender(); }
  }
  const _u = window.updateResp;
  if (_u){ window.updateResp = function(){ _u.apply(this, arguments); paint(); }; }
  document.addEventListener('change', e => { if (e.target && e.target.classList && e.target.classList.contains('rw')) setTimeout(paint, 30); });
  paint();
  window.PenguinRoles = { roles, paint };
})();

/* DAY SCHEDULE slide: jump buttons + live "now" needle on the meeting day */
(function(){
  const sl = document.querySelector('#stage .dayslide'); if (!sl) return;
  sl.querySelectorAll('.dy-s').forEach((e, i) => e.style.setProperty('--i', i));
  sl.querySelectorAll('.dy-c').forEach((e, i) => e.style.setProperty('--i', i));
  sl.addEventListener('click', e => { const b = e.target.closest('.dy-go'); if (b) showSlide(+b.dataset.slide - 1); });
  const now = document.getElementById('dyNow');
  function tick(){
    const d = new Date();
    if (!(d.getFullYear() === 2026 && d.getMonth() === 9 && d.getDate() === 21)) { now.hidden = true; return; }
    const m = d.getHours() * 60 + d.getMinutes() - (10 * 60 + 30);
    if (m < 0 || m > 245) { now.hidden = true; return; }
    now.hidden = false; now.style.insetInlineStart = (m / 245 * 100) + '%';
    now.querySelector('b').textContent = 'עכשיו ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  tick(); setInterval(tick, 30000);
})();
