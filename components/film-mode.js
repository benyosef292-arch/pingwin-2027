/* Film mode (unused visual mode). */
/* ================= FILM MODE ================= */
(function(){
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  let HH = 0;
  const tabsEl = document.getElementById('boardTabs');
  function sizeHH(){ HH = 0; try { [document.querySelector('.topbar'), document.getElementById('snBar'), tabsEl].forEach(el => { if (!el) return; const cs = getComputedStyle(el); if (cs.position === 'sticky' && el.offsetHeight) HH = Math.max(HH, (parseFloat(cs.top) || 0) + el.offsetHeight); }); } catch(e){} document.documentElement.style.setProperty('--hh', HH + 'px'); }
  sizeHH();
  const prog = el => { const r = el.getBoundingClientRect(), vh = innerHeight - HH; const span = r.height - vh; return span > 0 ? clamp((HH - r.top) / span) : (r.top < innerHeight ? 1 : 0); };
  const isFilm = () => !document.body.classList.contains('deck-mode');

  /* --- 1 · goggle lens --- */
  const LENS = 'M-300 -110 C-300 -150 -262 -162 -200 -162 L200 -162 C262 -162 300 -150 300 -110 L300 58 C300 118 262 140 202 140 L92 140 C60 140 46 96 0 96 C-46 96 -60 140 -92 140 L-202 140 C-262 140 -300 118 -300 58 Z';
  document.querySelectorAll('#f-gog .lensP').forEach(p => p.setAttribute('d', LENS));
  const lensSvg = $('f-lens'), clip = $('f-lensClipPath'), gog = $('f-gog'), img = $('f-lensImg');
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--bg5');
    const m = /url\(["']?(data:[^"')]+)/.exec(v);
    if (m) img.setAttribute('href', m[1]);
  } catch(e){}
  let W = innerWidth, H = innerHeight;
  function sizeLens(){ sizeHH(); W = Math.round(lensSvg.getBoundingClientRect().width) || innerWidth; H = innerHeight - HH; lensSvg.setAttribute('viewBox', `0 0 ${W} ${H}`); }

  function drawLens(p){
    const mob = W < 760;
    const s0 = mob ? (W * .88) / 680 : Math.min(W * .44 / 680, H * .5 / 330);
    const cx0 = mob ? W / 2 : W * .33, cy0 = mob ? H * .27 : H * .5;
    const sEnd = Math.max((H / 2) / 78, (W / 2) / 240) * 1.25;
    const z = ease(seg(p, .04, .86));
    const s = s0 * Math.pow(sEnd / s0, z);
    const cx = lerp(cx0, W / 2, z), cy = lerp(cy0, H / 2, z);
    const tf = `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${s.toFixed(4)})`;
    clip.setAttribute('d', LENS); clip.setAttribute('transform', tf);
    gog.setAttribute('transform', tf);
    gog.style.opacity = String(1 - seg(z, .55, .9));
    const k = lerp(1.32, 1, z);
    img.setAttribute('x', ((W - W * k) / 2 + (cx0 - W/2) * (1 - z) * .25).toFixed(1));
    img.setAttribute('y', ((H - H * k) / 2).toFixed(1));
    img.setAttribute('width', (W * k).toFixed(1)); img.setAttribute('height', (H * k).toFixed(1));
    const sh = $('f-sheen'); if (sh) sh.setAttribute('transform', `translate(${(seg(p, 0, .5) * 420).toFixed(1)} 0)`);
    const t = $('f-heroTxt'); const tp = seg(p, 0, .28);
    t.style.opacity = String(1 - tp); t.style.transform = (mob ? '' : 'translateY(-50%) ') + `translateY(${(-tp * 60).toFixed(1)}px)`;
    $('f-cue').style.opacity = String(1 - seg(p, 0, .08));
  }

  function drawGondola(){} /* scene removed 5.11.26 */

  let pMob = null, rW = 0;
  /* --- 6 · phases --- */
  function updateStats(){
    if (typeof phaseStats !== 'function') return;
    ['p1','p2','p3'].forEach(pid => {
      const st = phaseStats(pid);
      const e = document.querySelector(`[data-fs="${pid}"]`); if (e) e.textContent = `${st.done} / ${st.total} הושלמו`;
      const m = document.querySelector(`[data-fm="${pid}"]`); if (m) m.style.width = (st.total ? st.done / st.total * 100 : 0) + '%';
    });
  }
  document.querySelectorAll('#f-acc details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll('#f-acc details').forEach(o => { if (o !== d) o.open = false; });
  }));
  document.querySelectorAll('#f-acc [data-board]').forEach(b => b.addEventListener('click', () => { setMode('board'); go(b.dataset.board); }));
  document.querySelectorAll('[data-mode-go]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.modeGo)));
  document.querySelectorAll('#view-film [data-go]').forEach(b => b.addEventListener('click', () => {
    const t = $(b.dataset.go); if (!t) return;
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY + (b.dataset.go === 'f-s1' ? 0 : 2), behavior: RM ? 'auto' : 'smooth' });
  }));

  /* --- snow --- */
  const snow = null, sctx = null; let flakes = [], sW = 0, sH = 0;
  function sizeSnow(){}
  let lastY = scrollY, drift = 0;
  function tickSnow(){
    sctx.clearRect(0, 0, sW, sH);
    const dy = scrollY - lastY; lastY = scrollY; drift = drift * .9 + dy * .1;
    for (const f of flakes){
      f.w += .01; f.y += f.v * (1 + f.r * .3) - drift * f.r * .12; f.x += Math.sin(f.w) * .35 - .15;
      if (f.y > sH + 5) { f.y = -5; f.x = Math.random() * sW; } if (f.y < -6) { f.y = sH + 4; }
      if (f.x < -5) f.x = sW + 5; if (f.x > sW + 5) f.x = -5;
      sctx.fillStyle = `rgba(255,255,255,${(.25 + f.r * .18).toFixed(2)})`;
      sctx.beginPath(); sctx.arc(f.x, f.y, f.r, 0, 6.283); sctx.fill();
    }
  }

  /* --- rail --- */
  const railBtns = [...document.querySelectorAll('#f-rail button')];
  const railSecs = railBtns.map(b => $(b.dataset.go));

  /* --- 3b · team building --- */
  const QS = [
    ['מה הופך צוות לחזק?', 'מה חייב להיות בינינו כדי שזה יעבוד'],
    ['מה אני צריך מהצוות?', 'גיבוי, ביטחון, מידע, סבלנות'],
    ['מה אני מביא איתי?', 'החוזקה האישית שאני שם על השולחן'],
    ['איך נראית תקשורת טובה?', 'מתי מעדכנים, איך מתלוננים, איך מבקשים עזרה'],
    ['מה קורה כשמישהו נבלע בעומס?', 'מי מרים, ומתי, בלי לחכות שיבקש'],
    ['מה אסור שיקרה בינינו?', 'הקווים האדומים של העונה']
  ];
  const qStack = $('f-qStack');
  qStack.innerHTML = QS.map((q, i) => `<div class="${i ? 'dn' : ''}"><h3>${q[0]}</h3><p>${q[1]}</p></div>`).join('');
  const qEls = [...qStack.children]; let qCur = -1;
  const rope = $('f-ropeLine'); let ropeL = 1; try { ropeL = rope.getTotalLength(); } catch(e){}
  rope.style.strokeDasharray = `${ropeL} ${ropeL}`;
  const TEAM = [['בן','ראש הצוות'],['יותם','לה מנואיר'],['דורון',''],['קרן','']];
  const KN = [[530,380],[400,290],[260,200],[120,104]];
  $('f-knots').innerHTML = KN.map((k, i) => `<g class="knot" data-i="${i}" opacity=".3"><circle cx="${k[0]}" cy="${k[1]}" r="9" fill="#0B1822" stroke="#E2B676" stroke-width="2.5"/><text x="${k[0]}" y="${k[1] + 34}" text-anchor="middle" fill="#fff" font-size="19" font-weight="700">${TEAM[i][0]}</text>${TEAM[i][1] ? `<text x="${k[0]}" y="${k[1] + 53}" text-anchor="middle" fill="#8FA8B5" font-size="13">${TEAM[i][1]}</text>` : ''}</g>`).join('');
  const knots = [...$('f-knots').children];
  function drawTeam(p){
    const r = seg(p, .06, .82);
    rope.style.strokeDashoffset = (ropeL * (1 - r)).toFixed(1);
    knots.forEach((k, i) => {
      const on = r >= i / 3.4 - .001;
      k.setAttribute('opacity', on ? '1' : '.3');
      const c = k.querySelector('circle'); c.setAttribute('r', on ? 11 : 8); c.setAttribute('fill', on ? '#E2B676' : '#0B1822');
    });
    $('f-flag').setAttribute('opacity', String(seg(r, .9, 1)));
    const qi = Math.min(QS.length - 1, Math.floor(seg(p, .04, .9) * QS.length));
    if (qi !== qCur){
      qEls.forEach((el, k) => el.className = k < qi ? 'up' : (k > qi ? 'dn' : ''));
      $('f-qIdx').textContent = '0' + (qi + 1) + ' / 06';
      [...$('f-qDots').children].forEach((d, k) => d.classList.toggle('on', k <= qi));
      qCur = qi;
    }
  }
  /* answers mirror the deck's team-building fields (same saved data) */
  const fvs = [...document.querySelectorAll('#f-team-ans textarea[data-src]')];
  function pullAnswers(){ fvs.forEach(f => { const s = $(f.dataset.src); if (s && f !== document.activeElement && f.value !== s.value) f.value = s.value; }); }
  fvs.forEach(f => f.addEventListener('input', () => { const s = $(f.dataset.src); if (!s) return; s.value = f.value; s.dispatchEvent(new Event('input', { bubbles: true })); }));
  $('f-copyVoices').addEventListener('click', () => { const b = $('copyVoices'); if (b) b.click(); });
  $('f-toVoices').addEventListener('click', () => {
    setMode('deck');
    const sl = [...document.querySelectorAll('#stage .sl')].findIndex(s => s.querySelector('#v-ben'));
    if (sl >= 0) showSlide(sl);
  });
  pullAnswers();

  /* --- loop --- */
  const sT = $('f-team'), sTA = $('f-team-ans'), s1 = $('f-s1'), s2 = $('f-s2'), s3 = $('f-s3'), s4 = $('f-s4'), s5 = $('f-s5'), s6 = $('f-s6');
  const inView = el => { if (!el || el.offsetParent === null) return false; const r = el.getBoundingClientRect(); return r.bottom > -50 && r.top < innerHeight + 50; };
  let raf = 0, statsT = 0;
  function frame(){
    raf = 0;
    if (!isFilm()) return;
    if (inView(s1)) drawLens(prog(s1));
    if (inView(s3)) drawGondola(prog(s3));
    if (inView(sT)) drawTeam(prog(sT));
    if (inView(sTA)) pullAnswers();
    if (inView(s6)){
      const r = s6.getBoundingClientRect();
      $('f-picImg').style.transform = `translateY(${(clamp((innerHeight - r.top) / (innerHeight + r.height)) * 12 - 6).toFixed(2)}%)`;
      if (!statsT){ updateStats(); statsT = 1; }
    } else statsT = 0;
    let on = 0; railSecs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= innerHeight * .45) on = i; });
    railBtns.forEach((b, i) => b.classList.toggle('on', i === on));
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', () => { sizeLens(); sizeSnow(); pMob = null; rW = 0; req(); });
  

  sizeLens(); sizeSnow();
    window.FilmMode = { enter(){ sizeLens(); sizeSnow(); pMob = null; rW = 0; updateStats(); req(); setTimeout(req, 60); } };
})();

