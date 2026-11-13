/* Overview card: suppliers who answered and meetings already set (France time). */
(function(){
  const E = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const key = w => { const m = /(\d{1,2})\.(\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/.exec(w || ''); return m ? +m[2] * 1e6 + +m[1] * 1e4 + (+m[3] || 0) * 100 + (+m[4] || 0) : 9e9; };
  function row(s, x, c){
    const who = x.who ? `<small>${E(x.who)}</small>` : '';
    const note = x.note ? `<small>${E(x.note)}</small>` : '';
    return `<li class="${c}"><label class="st-ck"><input type="checkbox" data-sid="${s.id}"${x.st === 'done' ? ' checked' : ''}></label><b>${E(s.n)}</b><span>${E(x.when || (c === 'us' ? 'לקבוע' : ''))}</span>${who}${note}</li>`;
  }
  function render(){
    const host = document.getElementById('supTrack'); if (!host) return;
    let st0 = {}; try { st0 = tstore(SUP_KEY) || {}; } catch(e){}
    const seed = typeof SUP_MEET_SEED === 'object' ? SUP_MEET_SEED : {};
    const all = SUPS.flatMap(g => g[1]).map(s => [s, supEff(s, Object.assign({}, seed[s.id], st0[s.id]))]);
    const meet = all.filter(([, x]) => /meet|done/.test(x.st || '')).sort((a, b) => key(a[1].when) - key(b[1].when));
    const ans = all.filter(([, x]) => x.st === 'ans');
    if (!meet.length && !ans.length) { host.hidden = true; return; }
    const sec = (h, list, c) => list.length ? `<div class="mx-card" style="--pc:#5F7280"><h3>${h}</h3><ul>${list.map(([s, x]) => row(s, x, c)).join('')}</ul></div>` : '';
    host.innerHTML = `<div class="mx-h"><h2>מעקב ספקים</h2><small>שעון צרפת</small></div><div class="mx-grid">${sec('פגישות שנקבעו', meet, 'meet')}${sec('ענו, עוד לא נקבע', ans, 'us')}</div>`;
    host.hidden = false;
  }
  document.addEventListener('change', e => {
    const t = e.target; if (!t.matches || !t.matches('#supTrack input[data-sid]')) return;
    supSave(t.dataset.sid, 'st', t.checked ? 'done' : 'meet'); render();
  });
  window.renderSupTrack = render;
  document.addEventListener('contacts-ready', render);
  window.addEventListener('storage', render);
  setInterval(render, 20000);
  render();
})();
