/* Season timeline on the overview. */
/* ================= season timeline (overview) ================= */
(function(){
  const host = document.getElementById('ssn'); if (!host) return;
  const T0 = new Date(2026, 9, 21), SPAN = 166;
  const dOf = s => { const [d, m, y] = s.split('.').map(Number); return Math.round((new Date(2000 + y, m - 1, d) - T0) / 864e5); };
  const pct = d => (d / SPAN * 100).toFixed(2) + '%';
  const DOW = ['יום א׳','יום ב׳','יום ג׳','יום ד׳','יום ה׳','יום ו׳','שבת'];
  /* stops come from the team calendar (data/calendar-source.js): events marked key=... in their note, or the built-in seed until then */
  const fmtD = k => k.slice(8, 10) + '.' + k.slice(5, 7) + '.' + k.slice(2, 4);
  function marksFrom(evs){
    const keyed = evs.filter(x => /(^|\n)key=/.test(x.d || ''));
    const list = keyed.length
      ? keyed.map(x => { const m = x.d.match(/key=([^\n]*)/), lab = m[1].trim(); return [fmtD(x.s), lab && lab !== '1' ? lab : x.t, x.d.replace(/\n?key=[^\n]*/, '').trim()]; })
      : CalSource.seed.filter(x => x.mk).map(x => [fmtD(x.s), x.mk[0], x.mk[1]]);
    return list.sort((p, q) => dOf(p[0]) - dOf(q[0]));
  }
  let MARKS = marksFrom(CalSource.events());
  const SEGS = [['isr', 0, 36], ['prep', 36, 45], ['han', 45, 52], ['wk', 73, 109], ['vac', 109, 136], ['wk', 136, 165]];
  const band = document.getElementById('ssnBand');
  function draw(){
    band.innerHTML = SEGS.map((g, i) => `<i class="ssn-seg ${g[0]}" style="--i:${i};inset-inline-start:${pct(g[1])};width:${pct(g[2] - g[1])}"></i>`).join('')
      + MARKS.map((m, i) => `<i class="ssn-pin" data-i="${i}" style="--i:${i};inset-inline-start:${pct(dOf(m[0]))}"></i>`).join('');
    const now = new Date(), today = Math.floor((now - T0) / 864e5);
    if (today >= 0 && today <= SPAN) band.insertAdjacentHTML('beforeend', `<div class="ssn-today" style="inset-inline-start:${pct(today)}"><span>היום</span></div>`);
    const MON = [['01.11.26','נוב׳'],['01.12.26','דצמ׳'],['01.01.27','ינו׳'],['01.02.27','פבר׳'],['01.03.27','מרץ'],['01.04.27','אפר׳']];
    document.getElementById('ssnMonths').innerHTML = MON.map(m => `<span style="inset-inline-start:${pct(dOf(m[0]))}">${m[1]}</span>`).join('');
    let next = MARKS.findIndex(m => dOf(m[0]) >= today);
    document.getElementById('ssnList').innerHTML = MARKS.map((m, i) => {
      const [d, mo, y] = m[0].split('.').map(Number), wd = DOW[new Date(2000 + y, mo - 1, d).getDay()];
      const cls = i < next || next < 0 ? 'past' : (i === next ? 'next' : '');
      return `<li class="${cls}" data-i="${i}" style="--i:${i}"><span class="n">${i === next ? 'הבא' : String(i + 1).padStart(2, '0')}</span><span class="d">${m[0].slice(0, 5)}</span><span class="w">${wd} · ${m[0].slice(6) === '26' ? '2026' : '2027'}</span><b>${m[1]}</b><p>${m[2]}</p></li>`;
    }).join('');
    const nx = document.getElementById('ssnNext');
    if (next >= 0 && nx){ const m = MARKS[next], dd = dOf(m[0]) - today; nx.innerHTML = `<small>התחנה הבאה</small><b>${m[1]}</b><span>${m[0]} · ${dd === 0 ? 'היום' : dd === 1 ? 'מחר' : 'בעוד ' + dd + ' ימים'}</span>`; }
    else if (nx) nx.remove();
    const pins = [...band.querySelectorAll('.ssn-pin')];
    host.querySelectorAll('.ssn-list li').forEach(li => {
      li.addEventListener('mouseenter', () => pins[li.dataset.i].classList.add('hl'));
      li.addEventListener('mouseleave', () => pins[li.dataset.i].classList.remove('hl'));
    });
  }
  draw();
  CalSource.onChange(evs => { MARKS = marksFrom(evs); draw(); }, false);
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ host.classList.add('in'); io.disconnect(); } }), { threshold: .15 });
    io.observe(host);
  } else host.classList.add('in');
})();

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
