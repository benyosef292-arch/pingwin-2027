/* Board: appear-on-scroll animations. */
/* ================= BOARD motion ================= */
(function(){
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function enter(v){
    if (!v || RM) return;
    v.querySelectorAll('.phases,.cats,.mgrid,.wsum,.season-row,.dlgrid').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 14))));
    v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
    setTimeout(() => v.classList.remove('enter'), 1600);
  }
  const _go = go;
  go = function(view){ _go(view); enter(document.getElementById('view-' + view)); };
  window.BoardMotion = { enter: () => enter(document.querySelector('#boardMain .view:not([hidden])')) };
  /* snow burst when a task is checked */
  document.addEventListener('change', e => {
    const t = e.target;
    if (RM || !t || t.type !== 'checkbox' || !t.checked || t.closest('.switch')) return;
    const box = (t.nextElementSibling && t.nextElementSibling.getBoundingClientRect) ? t.nextElementSibling.getBoundingClientRect() : t.getBoundingClientRect();
    const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    for (let i = 0; i < 9; i++){
      const f = document.createElement('span'); f.className = 'flake'; f.textContent = '❄';
      const a = Math.random() * 6.283, d = 18 + Math.random() * 26;
      f.style.left = (cx - 6) + 'px'; f.style.top = (cy - 6) + 'px';
      f.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px'); f.style.setProperty('--dy', (Math.sin(a) * d - 10).toFixed(1) + 'px');
      f.style.fontSize = (8 + Math.random() * 7) + 'px';
      document.body.appendChild(f); setTimeout(() => f.remove(), 950);
    }
  });
})();

