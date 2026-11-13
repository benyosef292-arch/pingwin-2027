/* Contacts tab (loaded from the shared store, team only). */
/* ================= contacts ================= */
(function(){
  const body = document.getElementById('ctBody'); if (!body) return;
  const ORDER = ['כללי','בתי ספר לסקי','חנויות ציוד','מלונות וולטורנס','מלונות לה מנואיר','מסעדה','מאפייה','מרכז ספורט'];
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const WA = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';
  let ALL = [], grp = '', q = '';
  function card(c){
    const ph = (c.p || []).map(p => `<span class="ct-l"><a href="tel:${esc(p.t)}">${esc(p.v)}</a>${p.w ? `<a class="wa" href="https://wa.me/${esc(p.t.slice(1))}" target="_blank" rel="noopener" aria-label="וואטצאפ">${WA}</a>` : ''}${p.l ? `<em>${esc(p.l)}</em>` : ''}</span>`).join('');
    const ml = c.m ? `<span class="ct-l"><span class="ml" dir="ltr">${esc(c.m)}</span></span><a class="ct-mail" href="mailto:${esc(c.m)}" aria-label="שליחת מייל ל${esc(c.n)}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>שליחת מייל</a>` : '';
    return `<div class="ct"><b>${esc(c.n)}</b><span class="ct-r">${esc(c.r)}</span>${ph}${ml}${!ph && !ml ? '<span class="ct-none">עוד אין פרטים</span>' : ''}</div>`;
  }
  function render(){
    const qq = q.trim().toLowerCase();
    const list = ALL.filter(c => (!grp || c.g === grp) && (!qq || [c.n, c.r, c.g, c.m].join(' ').toLowerCase().includes(qq)));
    const groups = ORDER.concat([...new Set(ALL.map(c => c.g))].filter(g => !ORDER.includes(g)));
    const h = groups.map(g => { const l = list.filter(c => c.g === g); return l.length ? `<div class="ct-g"><h3>${esc(g)} <small>${l.length}</small></h3><div class="ct-grid">${l.map(card).join('')}</div></div>` : ''; }).join('');
    body.innerHTML = h || '<p class="ct-msg">לא נמצאו אנשי קשר</p>';
  }
  function chips(){
    const groups = ORDER.filter(g => ALL.some(c => c.g === g));
    const el = document.getElementById('ctChips');
    el.innerHTML = ['<button type="button" data-g="" aria-pressed="true">הכול</button>'].concat(groups.map(g => `<button type="button" data-g="${esc(g)}" aria-pressed="false">${esc(g)}</button>`)).join('');
    el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; grp = b.dataset.g; el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(); });
  }
  document.getElementById('ctSearch').addEventListener('input', e => { q = e.target.value; render(); });
  if (!window.PENGUIN_API){ body.innerHTML = '<p class="ct-msg">אנשי הקשר זמינים רק באתר הצוות</p>'; return; }
  let busy = false;
  function load(){
  if (busy || ALL.length) return; busy = true;
  fetch(window.PENGUIN_API + '?a=contacts' + (window.PENGUIN_AUTH ? window.PENGUIN_AUTH() : '') + '&t=' + Date.now()).then(r => r.json()).then(j => {
    busy = false;
    if (!j || !j.ok){ window.TEAM_CONTACTS_ERR = 1; document.dispatchEvent(new Event('contacts-ready')); body.innerHTML = '<p class="ct-msg">' + (j && j.error === 'team_only' ? 'אנשי הקשר פתוחים רק לצוות. פתחו את האתר דרך קישור הצוות שבן שלח.' : 'אנשי הקשר עוד לא זמינים. נסו שוב בעוד רגע.') + '</p>'; return; }
    ALL = j.contacts || []; window.TEAM_CONTACTS = ALL; document.dispatchEvent(new Event('contacts-ready'));
    document.getElementById('ctCount').textContent = ALL.length;
    chips(); render();
  }).catch(() => { busy = false; body.innerHTML = '<p class="ct-msg">אנשי הקשר עוד לא זמינים. נסו שוב בעוד רגע.</p>'; });
  }
  load();
  document.querySelectorAll('[data-view="contacts"]').forEach(b => b.addEventListener('click', load));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
})();
