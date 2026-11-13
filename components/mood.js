/* Matte accent color per area (reads the stylesheets). */
/* 5.11.26: adapts older components to the theme and marks glass cards (.gl) and text straight on the photo (.gt).
   Runs inside the MutationObserver callback, so new items get their colors before the first paint (no white flash),
   with transitions off while it samples. Hovered or toggled items are sampled again once their state changes. */
(function(){
  const main = document.getElementById('boardMain'); if (!main) return;
  const H = document.documentElement;
  const rgb = s => { let m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s); if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
    m = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(s); return m ? [m[1] * 255, m[2] * 255, m[3] * 255, m[4] === undefined ? 1 : +m[4]] : null; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const sat = c => (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
  const dark = () => H.dataset.theme !== 'light';
  const clear = c => !c || c[3] === 0;
  let seen = new WeakSet(), inked = new WeakSet();
  const undo = el => { if (el.dataset.mfix) el.dataset.mfix.split(' ').forEach(k => el.style.removeProperty(k));
    delete el.dataset.mfix; delete el.dataset.mood; delete el.dataset.ink; delete el.dataset.mh; el.classList.remove('gl', 'gt'); seen.delete(el); inked.delete(el); };
  const put = (el, k, v) => { el.style.setProperty(k, v, 'important'); el.dataset.mfix = (el.dataset.mfix ? el.dataset.mfix + ' ' : '') + k; };
  /* elements some :hover rule restyles (selector with :hover taken out) */
  let hov = '';
  try { const sel = new Set(); const walk = rs => { for (const r of rs) { if (r.cssRules && !r.selectorText) walk(r.cssRules);
      else if (r.selectorText && r.selectorText.includes(':hover')) r.selectorText.split(',').forEach(x => { if (x.includes(':hover')) sel.add(x.replace(/:hover/g, '').trim() || '*'); }); } };
    [...document.styleSheets].forEach(ss => { try { walk(ss.cssRules); } catch(e){} });
    hov = [...sel].filter(x => { try { document.querySelector(x); return true; } catch(e){ return false; } }).join(','); } catch(e){}
  /* dark mode: old :hover rules that paint a light background or dark text get a dark-safe twin, so hovering never lights up a row */
  try { const out = [], walk = rs => { for (const r of rs) { if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
      if (!r.selectorText || !r.selectorText.includes(':hover') || /boardTabs|topbar|sn-|th-btn|\.fx|f-/.test(r.selectorText)) continue;
      const bg = rgb(r.style.backgroundColor || r.style.background || ''), co = rgb(r.style.color || ''), sel = r.selectorText.split(',').map(x => 'html[data-theme="dark"] #boardMain ' + x.trim()).join(',');
      let d = '';
      if (bg && lum(bg) > .5 && sat(bg) < .25) d += 'background-color:var(--m-soft)!important;';
      if (co && lum(co) < .12) d += 'color:var(--m-ink)!important;';
      if (d) out.push(sel + '{' + d + '}'); } };
    [...document.styleSheets].forEach(ss => { try { walk(ss.cssRules); } catch(e){} });
    const st = document.createElement('style'); st.id = 'moodhover'; st.textContent = out.join('\n'); document.head.appendChild(st); } catch(e){}
  const skip = el => !el.isConnected || el.closest('.fx,.view[hidden]') || !main.contains(el);

  function scan(roots, fresh, only){
    const list = new Set();
    roots.forEach(r => { if (r.nodeType !== 1 || skip(r)) return; list.add(r); if (!only) r.querySelectorAll('*').forEach(e => { if (!e.closest('.fx')) list.add(e); }); });
    if (!list.size) return;
    H.classList.add('m-scan');
    if (fresh) list.forEach(undo);
    const els = [...list], d = dark(), writes = [], glass = new Set();
    /* 1. surfaces + glass cards (read everything, then write) */
    els.forEach(el => { if (seen.has(el)) return;
      const cs = getComputedStyle(el), gi = cs.backgroundImage, c = rgb(cs.backgroundColor), w = el.offsetWidth, h = el.offsetHeight;
      if (!w && !h) return;
      seen.add(el); if (hov && el.matches(hov) && el.matches(':hover')) writes.push([el, 'mh']);
      if (c && c[0] > 200 && c[1] > 200 && c[2] > 200 && c[3] >= .4 && w >= 120 && h >= 40 && el.tagName !== 'svg') {
        let p = el.parentElement, inner = false; for (; p && p !== main; p = p.parentElement) if (glass.has(p) || p.classList.contains('gl')) { inner = true; break; }
        if (!inner) { glass.add(el); writes.push([el, 'gl']); }
      }
      if (/^linear-gradient/.test(gi)) { const g = rgb(gi); if (g && lum(g) > .55 && sat(g) < .09) { writes.push([el, 'g']); return; } }
      if (!c || c[3] < .3) return;
      if (lum(c) > .55 && sat(c) < .09) writes.push([el, 's']);
      else if (d && lum(c) > .45 && h > 56) writes.push([el, 'w', `rgba(${c.slice(0, 3).join(',')},.12)`]);
      else if (d && lum(c) > .45 && c[3] < 1) writes.push([el, 'p', `rgb(${c.slice(0, 3).map(x => Math.round(x * c[3] + 245 * (1 - c[3]))).join(',')})`]);
      if (d) { const b = rgb(cs.borderTopColor); if (b && b[3] > .3 && lum(b) > .45 && sat(b) < .12 && parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) > 0) writes.push([el, 'b']); }
    });
    writes.forEach(([el, k, v]) => {
      if (k === 'mh') el.dataset.mh = '1';
      else if (k === 'gl') el.classList.add('gl');
      else if (k === 'g') { el.dataset.mood = 'g'; put(el, 'background-image', 'none'); put(el, 'background-color', 'var(--m-head)'); }
      else if (k === 's') { el.dataset.mood = 's'; put(el, 'background-color', 'var(--m-fill)'); }
      else if (k === 'w' || k === 'p') { el.dataset.mood = k; put(el, 'background-color', v); }
      else if (k === 'b') put(el, 'border-color', 'var(--m-line)');
    });
    /* 2. ink: dark text on a dark surface gets light ink; text straight on the photo gets .gt */
    const cs = new Map(), get = e => { let s = cs.get(e); if (!s) { s = getComputedStyle(e); cs.set(e, s); } return s; };
    const bgOf = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const c = rgb(get(e).backgroundColor); if (c && c[3] >= .5) return c; } return [20, 30, 40, 1]; };
    const cov = new Map(), covered = el => { if (!el || el === main || el.classList.contains('view')) return false; if (cov.has(el)) return cov.get(el);
      const s = get(el), v = s.backgroundImage !== 'none' || !clear(rgb(s.backgroundColor)) || covered(el.parentElement); cov.set(el, v); return v; };
    const iw = [];
    els.forEach(el => { if (inked.has(el) || /^(INPUT|TEXTAREA|SELECT|OPTION|svg)$/.test(el.tagName) || !(el.offsetWidth || el.offsetHeight)) return;
      inked.add(el);
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
      if (!/^(BUTTON|LABEL)$/.test(el.tagName) && !covered(el)) { iw.push([el, 'gt']); return; }
      if (!d) return;
      const t = rgb(get(el).color); if (!t || lum(t) > .3 || lum(bgOf(el)) > .25) return;
      iw.push([el, sat(t) < .2 ? (lum(t) < .03 ? 'var(--m-ink)' : 'var(--m-muted)') : `rgb(${t.slice(0, 3).map(x => Math.round(x * .45 + 255 * .55)).join(',')})`]);
    });
    iw.forEach(([el, v]) => { if (v === 'gt') el.classList.add('gt'); else { el.dataset.ink = '1'; put(el, 'color', v); } });
    void main.offsetWidth; /* settle styles before transitions come back, so nothing animates */
    H.classList.remove('m-scan');
    mo.takeRecords(); /* our own class changes are not news */
  }
  const view = () => main.querySelector('.view:not([hidden])');
  const mo = new MutationObserver(recs => {
    const roots = new Set(), fresh = new Set();
    recs.forEach(r => { const t = r.target; if (t.nodeType !== 1 || (t.closest && t.closest('.fx'))) return;
      if (r.type === 'childList') r.addedNodes.forEach(n => { if (n.nodeType === 1) roots.add(n); else if (n.nodeType === 3) fresh.add(t); });
      else if (r.attributeName === 'hidden') roots.add(t.classList.contains('view') ? t : t);
      else if (!t.classList.contains('view')) fresh.add(t);
    });
    if (fresh.size) scan([...fresh], true);
    if (roots.size) scan([...roots], false);
  });
  mo.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class', 'open', 'aria-pressed', 'aria-selected', 'aria-checked', 'aria-expanded', 'disabled'] });
  /* a checkbox or radio changes its look through CSS only: sample its row again */
  main.addEventListener('change', e => { const r = e.target.closest('label,li,tr,.row,.item') || e.target.parentElement; if (r) requestAnimationFrame(() => scan([r], true)); }, true);
  /* hover colors are not the item's own: once the pointer leaves, sample it again */
  let hr = 0; main.addEventListener('pointerout', () => { if (hr) return; hr = requestAnimationFrame(() => { hr = 0;
    const gone = [...main.querySelectorAll('[data-mh]')].filter(e => !e.matches(':hover')); if (gone.length) scan(gone, true, true); }); }, { passive: true });
  function reset(){ main.querySelectorAll('[data-mfix],[data-mood],[data-ink],[data-mh],.gl,.gt').forEach(undo); seen = new WeakSet(); inked = new WeakSet(); }
  window.setTheme = th => { H.dataset.theme = th; try { localStorage.setItem('penguin-theme', th); } catch(e){} reset(); const v = view(); if (v) scan([v], false); syncBtn(); };
  /* sun/moon button in the top bar */
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'icon-btn th-btn'; btn.id = 'themeBtn';
  btn.innerHTML = '<svg class="th-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg><svg class="th-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  function syncBtn(){ const d = dark(); btn.setAttribute('aria-label', d ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'); btn.title = d ? 'מצב בהיר' : 'מצב כהה'; }
  btn.addEventListener('click', () => setTheme(dark() ? 'light' : 'dark'));
  const host = document.querySelector('.top-right'); if (host) host.insertBefore(btn, host.firstChild);
  syncBtn();
  const v = view(); if (v) scan([v], false);
})();
