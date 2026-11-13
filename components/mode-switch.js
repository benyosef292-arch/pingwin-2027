// Switches between board mode and deck mode (mode buttons, resize refit).
window.addEventListener('resize', () => { if (document.body.classList.contains('deck-mode')) fitDeck(); });

function setMode(m){
  if (!['deck','board'].includes(m)) m = 'board';
  document.body.classList.toggle('deck-mode', m === 'deck');
  document.body.classList.toggle('film-mode', m === 'film');
  document.getElementById('view-deck').style.display = m === 'deck' ? 'flex' : 'none';
  document.querySelectorAll('.mode-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  if (m === 'deck') { fitDeck(); showSlide(si); if (window.DeckMotion) DeckMotion.size(); }
  try { localStorage.setItem('penguin-mode', m); } catch(e){}
  window.scrollTo({ top: 0 });
  if (m === 'board' && window.FilmMode) FilmMode.enter();
  if (m === 'board' && window.BoardMotion) BoardMotion.enter();
}
document.querySelectorAll('.mode-btn').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
