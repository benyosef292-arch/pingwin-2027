/* Right-side menu: groups, drawer on the phone. */
(function(){
  const nav = document.getElementById('boardTabs'), bar = document.getElementById('snBar'), btn = document.getElementById('snOpen'),
        back = document.getElementById('snBack'), cur = document.getElementById('snCur'), cpill = document.getElementById('snPill'),
        top = document.querySelector('.topbar'), main = document.getElementById('boardMain');
  const tabs = () => [...nav.querySelectorAll('.tab')];
  const isDrawer = () => matchMedia('(max-width:1023.98px)').matches;
  /* height of the sticky top bar, so the side column and the bar sit under it */
  function sizeTop(){ let h = 0; try { if (getComputedStyle(top).position === 'sticky') h = top.offsetHeight; } catch(e){} document.documentElement.style.setProperty('--tbh', h + 'px'); }
  /* the bar shows the current tab and its count */
  function label(){
    const t = nav.querySelector('.tab[aria-selected="true"]') || tabs()[0];
    cur.textContent = t.querySelector('.tl').textContent;
    const p = t.querySelector('.pill');
    cpill.hidden = !p; if (p) cpill.textContent = p.textContent;
  }
  function setOpen(on){
    document.body.classList.toggle('sn-on', on);
    btn.setAttribute('aria-expanded', String(on));
    back.hidden = !on;
    [main, top, bar].forEach(el => { if (el) el.inert = on; });
    if (on) (nav.querySelector('.tab[aria-selected="true"]') || tabs()[0]).focus();
  }
  btn.addEventListener('click', () => setOpen(true));
  back.addEventListener('click', () => { setOpen(false); btn.focus(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('sn-on')) { setOpen(false); btn.focus(); } });
  /* up/down arrows move between tabs */
  nav.addEventListener('keydown', e => {
    if (!['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
    const l = tabs(), i = l.indexOf(document.activeElement); if (i < 0) return;
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? l.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + l.length) % l.length;
    l[j].focus(); e.preventDefault();
  });
  const _go = go;
  go = function(){ const r = _go.apply(this, arguments); label(); if (document.body.classList.contains('sn-on')) { setOpen(false); btn.focus(); } return r; };
  /* tab counts change as tasks are ticked */
  new MutationObserver(label).observe(nav, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-selected'] });
  addEventListener('resize', () => { sizeTop(); if (!isDrawer() && document.body.classList.contains('sn-on')) setOpen(false); });
  sizeTop(); label();
  try { new ResizeObserver(sizeTop).observe(top); } catch(e){}
})();
