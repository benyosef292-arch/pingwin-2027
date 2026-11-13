/* Deck: entrance animations. */
/* ================= DECK motion ================= */
(function(){
  const slides = [...document.querySelectorAll('#stage .sl')];
  slides.forEach(s => {
    const bg = s.style.backgroundImage;
    if (bg && s.classList.contains('photo')){
      const kb = document.createElement('div'); kb.className = 'sl-kb'; kb.style.backgroundImage = bg;
      s.insertBefore(kb, s.firstChild); s.classList.add('has-kb');
    }
    s.querySelectorAll('.sl-h').forEach(h => {
      let w = 0;
      [...h.childNodes].forEach(n => {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const sp = document.createElement('span'); sp.className = 'w'; sp.style.setProperty('--w', w++); sp.textContent = part; frag.appendChild(sp); }
        });
        n.replaceWith(frag);
      });
    });
    s.querySelectorAll('.sl-row3,.sl-row4,.sl-row6,.qgrid,.tl,.flights,.hotel-feat,.wks2,.resp-grid').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
    s.querySelectorAll('.tm').forEach((c, i) => c.style.setProperty('--i', i));
    s.querySelectorAll('.asc-card').forEach((c, i) => c.style.setProperty('--i', i));
    s.querySelectorAll('.lanes .ln').forEach((c, i) => c.style.setProperty('--i', i));
  });
  function laneProgress(){
    if (typeof allTasks === 'undefined') return;
    document.querySelectorAll('[data-lp]').forEach(el => {
      const k = el.dataset.lp + '|';
      const list = allTasks.filter(t => t.id.startsWith(k));
      const done = list.filter(t => isDone(t.id)).length;
      el.textContent = `${done} / ${list.length} הושלמו`;
      const bar = document.querySelector(`[data-lb="${el.dataset.lp}"]`);
      if (bar) bar.style.width = (list.length ? done / list.length * 100 : 0) + '%';
    });
  }
  document.addEventListener('change', () => setTimeout(laneProgress, 50));
  setInterval(() => { if (document.body.classList.contains('deck-mode')) laneProgress(); }, 4000);
  const _show = showSlide;
  let prev = -1;
  showSlide = function(i){
    _show(i);
    const cur = slides.findIndex(s => s.classList.contains('on'));
    if (cur !== prev){
      slides.forEach(s => s.classList.remove('enter'));
      const el = slides[cur]; if (el){ void el.offsetWidth; el.classList.add('enter'); }
      prev = cur;
    }
    laneProgress();
  };
  /* snow behind the stage */
  const host = document.getElementById('view-deck');
  const c = document.createElement('canvas'); c.id = 'deckSnow'; c.setAttribute('aria-hidden', 'true'); host.insertBefore(c, host.firstChild);
  const ctx = c.getContext('2d'); let fl = [], w = 0, h = 0;
  function size(){ const d = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; if (!w) return; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    fl = Array.from({ length: Math.min(90, Math.round(w * h / 16000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .5 + Math.random() * 1.8, v: .2 + Math.random() * .6, p: Math.random() * 6 })); }
  addEventListener('resize', size);
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(){
    if (document.body.classList.contains('deck-mode') && !document.hidden){
      if (!w || c.width === 0) size();
      ctx.clearRect(0, 0, w, h);
      for (const f of fl){ f.p += .012; f.y += f.v; f.x += Math.sin(f.p) * .3; if (f.y > h + 4){ f.y = -4; f.x = Math.random() * w; }
        ctx.fillStyle = `rgba(200,230,245,${(.18 + f.r * .14).toFixed(2)})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill(); }
    }
    requestAnimationFrame(tick);
  }
  if (!RM) requestAnimationFrame(tick);
  window.DeckMotion = { size };
})();
