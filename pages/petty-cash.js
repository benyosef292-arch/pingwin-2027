/* Petty-cash tab (קופה קטנה): each rep adds a purchase with a receipt photo; data lives only behind the Apps Script (PettyCash.gs), never in this repo. */
(function(){
  const view = document.getElementById('view-pc'); if (!view) return;
  const box = document.getElementById('pcBody');
  const TEAM = ['בן', 'יותם', 'דורון', 'קרן'], SKEY = 'penguin-pc-who';
  const MSG = {
    auth: 'שם או קוד שגויים', locked: 'יותר מדי ניסיונות. נסו שוב בעוד 15 דקות', amount: 'סכום לא תקין',
    date: 'תאריך לא תקין: בתוך העונה ולא בעתיד', desc: 'פירוט: 2 עד 100 תווים', photo: 'הקבלה לא תקינה: תמונה או PDF עד 8MB',
    dup_photo: 'הקבלה הזו כבר הועלתה', full: 'הטבלה מלאה. לפנות לבן', admin_only: 'רק בן', bad: 'שגיאה. רעננו את הדף',
    unknown_doc: 'הקופה עוד לא הופעלה בשרת', server: 'שגיאה בשרת. לא נשמר', net: 'אין חיבור. לא ידוע אם נשמר: לחצו שוב על שמירה (לא ייווצר כפל)'
  };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = n => '€' + (+n || 0).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
  const dm = s => s ? s.slice(8, 10) + '.' + s.slice(5, 7) : '';
  const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^\w-]/g, '');
  let me = null, pin = '', data = null, file = null, req = rid(), busy = false;
  try { const s = JSON.parse(sessionStorage.getItem(SKEY) || 'null'); if (s) { me = s.who; pin = s.pin; } } catch (e) {}

  function call(a, extra){
    if (!window.PENGUIN_API) return Promise.reject({ code: 'net' });
    return fetch(window.PENGUIN_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ a, who: me, pin }, extra || {})) })
      .then(r => r.json(), () => { throw { code: 'net' }; })
      .then(j => { if (!j || !j.ok) throw { code: (j && j.error) || 'server' }; return j; });
  }
  const say = (el, code, ok) => { el.textContent = ok ? code : (MSG[code] || MSG.server); el.className = 'pc-msg' + (ok ? ' ok' : ' err'); };

  /* ---------- sign in: name + own 6-digit code (kept only for this browser tab) ---------- */
  function login(err){
    box.innerHTML = `<form class="pc-card pc-login" autocomplete="off">
      <div class="pc-who" role="group" aria-label="מי">${TEAM.map(n => `<button type="button" data-who="${esc(n)}" aria-pressed="${n === me}">${esc(n)}</button>`).join('')}</div>
      <input class="pc-in pc-pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="קוד אישי" aria-label="קוד אישי" required>
      <button class="pc-btn pc-pri" type="submit">כניסה</button><p class="pc-msg" role="alert"></p></form>`;
    const f = box.querySelector('form'), m = f.querySelector('.pc-msg');
    if (err) say(m, err);
    f.querySelector('.pc-who').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; me = b.dataset.who; f.querySelectorAll('.pc-who button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    f.addEventListener('submit', e => {
      e.preventDefault(); pin = f.querySelector('.pc-pin').value.trim();
      if (!me) { m.textContent = 'בחרו שם'; m.className = 'pc-msg err'; return; }
      load(true);
    });
  }
  function logout(){ me = null; pin = ''; data = null; try { sessionStorage.removeItem(SKEY); } catch (e) {} login(); }

  function load(first, after){
    if (busy) return; busy = true;
    if (first) box.innerHTML = '<p class="pc-msg">טוען…</p>';
    call('pcList').then(j => {
      busy = false; data = j;
      try { sessionStorage.setItem(SKEY, JSON.stringify({ who: me, pin })); } catch (e) {}
      render(); if (after) after();
    }, e => { busy = false; if (e.code === 'auth' || e.code === 'locked') { pin = ''; try { sessionStorage.removeItem(SKEY); } catch (x) {} } login(e.code); });
  }

  /* ---------- main screen ---------- */
  function render(){
    const d = data, adm = d.admin;
    const bal = document.getElementById('pcBal'); bal.textContent = eur(d.bal); bal.classList.toggle('pc-neg', d.bal < 0);
    box.innerHTML = `
      <div class="pc-sum"><div><span>הכנסות</span><b>${eur(d.inc)}</b></div><div><span>הוצאות</span><b>${eur(d.exp)}</b></div></div>
      <form class="pc-card pc-new" autocomplete="off" novalidate>
        <div class="pc-h"><b>קנייה חדשה</b><span>${esc(me)}</span><button type="button" class="pc-q" data-out>יציאה</button></div>
        ${adm ? '<div class="pc-seg" role="group" aria-label="סוג"><button type="button" data-k="exp" aria-pressed="true">הוצאה</button><button type="button" data-k="inc" aria-pressed="false">הכנסה</button></div>' : ''}
        <div class="pc-row">
          <label>סכום €<input class="pc-in" name="amount" type="text" inputmode="decimal" placeholder="0.00" required></label>
          <label>תאריך<input class="pc-in" name="date" type="date" min="2026-11-01" max="${today()}" value="${today()}" required></label>
        </div>
        <label>פירוט<input class="pc-in" name="desc" maxlength="100" placeholder="מה נקנה ואיפה" required></label>
        <div class="pc-seg pc-src" role="group" aria-label="קבלה"><button type="button" data-s="photo" aria-pressed="true">צילום קבלה</button><button type="button" data-s="mail" aria-pressed="false">קבלה נשלחה למייל</button></div>
        <label class="pc-file"><input type="file" name="photo" accept="image/*,application/pdf" capture="environment"><span>צילום / בחירת קובץ</span><img alt="" hidden></label>
        <div class="pc-ok" hidden></div>
        <button class="pc-btn pc-pri" type="submit">שמירה</button><p class="pc-msg" role="alert"></p>
      </form>
      ${adm ? '<div class="pc-card pc-chk"><button type="button" class="pc-btn" data-check>בדיקת הטבלה</button><div class="pc-issues"></div></div>' : ''}
      <div class="pc-card pc-list"><div class="pc-h"><b>כל השורות</b><span>${d.rows.length}</span></div>
        ${d.rows.length ? `<table><thead><tr><th>מס'</th><th>תאריך</th><th>מי</th><th>פירוט</th><th>סכום</th><th>קבלה</th></tr></thead><tbody>${d.rows.slice().reverse().map(r => `<tr><td>${esc(r.n)}</td><td>${dm(r.date)}</td><td>${esc(r.who)}</td><td>${esc(r.desc)}</td><td class="${r.inc ? 'inc' : ''}">${r.inc ? '+' + eur(r.inc) : eur(r.exp)}</td><td>${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener">צפייה</a>` : esc(r.src || '')}</td></tr>`).join('')}</tbody></table>` : '<p class="pc-msg">עוד אין שורות</p>'}</div>`;
    wire();
  }

  function wire(){
    const f = box.querySelector('.pc-new'), m = f.querySelector('.pc-msg'), okb = f.querySelector('.pc-ok');
    let kind = 'exp', src = 'photo', sure = false; file = null;
    const srcBox = f.querySelector('.pc-src'), fileBox = f.querySelector('.pc-file'), img = fileBox.querySelector('img'), lab = fileBox.querySelector('span');
    f.querySelector('[data-out]').onclick = logout;
    f.addEventListener('click', e => {
      const k = e.target.closest('[data-k]'), s = e.target.closest('[data-s]');
      if (!k && !s) return;
      okb.hidden = true; sure = false;
      if (k) { kind = k.dataset.k; f.querySelectorAll('[data-k]').forEach(x => x.setAttribute('aria-pressed', String(x === k))); srcBox.hidden = kind === 'inc'; }
      if (s) { src = s.dataset.s; f.querySelectorAll('[data-s]').forEach(x => x.setAttribute('aria-pressed', String(x === s))); }
      fileBox.hidden = kind === 'inc' || src !== 'photo';
    });
    f.addEventListener('input', () => { okb.hidden = true; sure = false; });
    f.photo.addEventListener('change', () => {
      const x = f.photo.files[0]; file = null; img.hidden = true; lab.textContent = 'צילום / בחירת קובץ';
      if (!x) return;
      prep(x).then(p => { file = p; lab.textContent = x.name || 'קבלה'; if (p.preview) { img.src = p.preview; img.hidden = false; } }, () => say(m, 'photo'));
    });
    f.addEventListener('submit', e => {
      e.preventDefault(); if (busy) return;
      const amount = Math.round(parseFloat(String(f.amount.value).replace(',', '.')) * 100) / 100;
      const date = f.date.value, desc = f.desc.value.trim();
      if (!(amount > 0)) return say(m, 'amount');
      if (!date || date > today() || date < '2026-11-01') return say(m, 'date');
      if (desc.length < 2) return say(m, 'desc');
      const how = kind === 'inc' ? 'none' : src;
      if (how === 'photo' && !file) { m.textContent = 'חסרה תמונה של הקבלה'; m.className = 'pc-msg err'; return; }
      /* one look before it goes in: the table is the company's record */
      if (okb.hidden) {
        okb.innerHTML = `<b>${kind === 'inc' ? 'הכנסה' : 'הוצאה'} ${eur(amount)}</b> · ${dm(date)} · ${esc(desc)} · ${how === 'mail' ? 'קבלה במייל' : how === 'photo' ? 'עם צילום' : 'בלי קבלה'}<br>לחצו שוב על שמירה לאישור`;
        okb.hidden = false; m.textContent = ''; return;
      }
      busy = true; m.textContent = 'שומר…'; m.className = 'pc-msg';
      call('pcAdd', { kind, amount, date, desc, src: how, rid: req, sure, photo: how === 'photo' ? { b64: file.b64 } : null }).then(j => {
        busy = false; req = rid();
        load(false, () => { const mm = box.querySelector('.pc-new .pc-msg'); if (mm) say(mm, `נשמר כשורה ${j.n}. לכתוב ${j.n} על הקבלה.`, true); });
      }, er => {
        busy = false;
        if (er.code === 'dup') { sure = true; m.textContent = 'כבר יש שורה שלך עם אותו סכום ותאריך. אם זו קנייה נוספת, לחצו שוב על שמירה.'; m.className = 'pc-msg err'; return; }
        if (er.code === 'auth' || er.code === 'locked') return logout();
        say(m, er.code);
      });
    });
    const chk = box.querySelector('[data-check]');
    if (chk) chk.onclick = () => {
      const out = box.querySelector('.pc-issues'); out.textContent = 'בודק…';
      call('pcCheck').then(j => { out.innerHTML = j.issues.length ? '<ul>' + j.issues.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>' : '<p class="pc-msg ok">הטבלה תקינה</p>'; }, er => say(out, er.code));
    };
  }

  /* photo -> JPEG, longest side 2000px (keeps it readable, ~0.5MB); PDF as it is */
  function prep(x){
    const b64 = buf => { let s = '', a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
    if (x.type === 'application/pdf') return x.size > 8e6 ? Promise.reject() : x.arrayBuffer().then(buf => ({ b64: b64(buf) }));
    return new Promise((ok, no) => {
      const u = URL.createObjectURL(x), im = new Image();
      im.onerror = () => { URL.revokeObjectURL(u); no(); };
      im.onload = () => {
        const k = Math.min(1, 2000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        const url = c.toDataURL('image/jpeg', 0.85);
        ok({ b64: url.split(',')[1], preview: url });
      };
      im.src = u;
    });
  }

  if (!window.PENGUIN_API) { box.innerHTML = '<p class="pc-msg">הקופה זמינה רק באתר הצוות</p>'; return; }
  /* load only when the tab is opened */
  let started = false;
  new MutationObserver(() => { if (!view.hidden && !started) { started = true; me && pin ? load(true) : login(); } }).observe(view, { attributes: true, attributeFilter: ['hidden'] });
})();
