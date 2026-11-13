/* Deck: swipe between slides on touch screens. */
/* ================= deck: swipe (touch) ================= */
(function(){
  const host = document.getElementById('view-deck');
  let x0 = null, y0 = 0;
  host.addEventListener('touchstart', e => {
    if (e.target.closest('textarea,input,button,a')) { x0 = null; return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  host.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    showSlide(si + (dx < 0 ? 1 : -1));   /* RTL: swipe left = next */
  }, { passive: true });
})();
