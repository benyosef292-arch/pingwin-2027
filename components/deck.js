/* Deck (presentation) mode: slides, dots, keyboard. */
/* ================= deck ================= */
const deckSlides = [...document.querySelectorAll('#stage .sl')];
let si = 0;
try { si = parseInt(localStorage.getItem('penguin-slide') || '0', 10) || 0; } catch(e){}
const dotsHost = document.getElementById('ddots');
deckSlides.forEach((_, k) => {
  const d = document.createElement('button');
  d.className = 'ddot' + (k === 0 ? ' on' : '');
  d.setAttribute('aria-label', 'שקופית ' + (k + 1));
  d.addEventListener('click', () => showSlide(k));
  dotsHost.appendChild(d);
});
function showSlide(i){
  si = Math.max(0, Math.min(deckSlides.length - 1, i));
  deckSlides.forEach((s, k) => s.classList.toggle('on', k === si));
  [...dotsHost.children].forEach((d, k) => d.classList.toggle('on', k === si));
  document.getElementById('dcount').textContent = (si + 1) + ' / ' + deckSlides.length;
  { const pr = document.querySelector('#stage .dk-prog'); if (pr) { const n = deckSlides.length, f = n > 1 ? si / (n - 1) : 1;
    if (!pr.dataset.n) { pr.dataset.n = n; pr.querySelector('.dk-ticks').innerHTML = deckSlides.map((_, k) => `<span style="inset-inline-start:${n > 1 ? k / (n - 1) * 100 : 0}%"></span>`).join(''); }
    pr.style.setProperty('--p', f); pr.querySelectorAll('.dk-ticks span').forEach((t, k) => t.classList.toggle('past', k <= si));
    pr.classList.toggle('on-dark', deckSlides[si].matches('.dark, .photo.deep, .cvr-sl')); } }
  if (window.matchMedia('(max-width: 760px)').matches && document.body.classList.contains('deck-mode')) window.scrollTo({ top: 0 });
  try { localStorage.setItem('penguin-slide', String(si)); } catch(e){}
}
function fitDeck(){
  const stage = document.getElementById('stage');
  if (!stage) return;
  const host = document.getElementById('view-deck');
  if (window.matchMedia('(max-width: 760px)').matches) { stage.style.transform = 'none'; return; }
  const w = host.clientWidth - 96, h = host.clientHeight - 76;
  const s = Math.min(w / 1600, h / 900);
  stage.style.transform = 'scale(' + s.toFixed(4) + ')';
}
document.getElementById('dPrev').addEventListener('click', () => showSlide(si - 1));
document.getElementById('dNext').addEventListener('click', () => showSlide(si + 1));
document.getElementById('dFull').addEventListener('click', () => {
  const p = !document.fullscreenElement ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.();
  if (p && p.catch) p.catch(() => toast('מסך מלא לא זמין כאן'));
});
document.addEventListener('keydown', e => {
  if (!document.body.classList.contains('deck-mode')) return;
  const tg = e.target; if (tg && (tg.closest('input, textarea, select, button, [contenteditable]'))) return;
  if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); showSlide(si + 1); }
  else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); showSlide(si - 1); }
  else if (e.key === 'Home') { showSlide(0); }
  else if ((e.key === 'f' || e.key === 'F') && !/^(TEXTAREA|INPUT)$/.test(e.target.tagName)) { document.getElementById('dFull').click(); }
  else if (e.key === 'End') { showSlide(deckSlides.length - 1); }
});
