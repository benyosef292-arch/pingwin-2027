/* v3 design pass: small interactions. */
/* v3: hide a task's deadline when it only repeats its group's meeting */
(function(){
  function mark(){
    document.querySelectorAll('select.dl-sel').forEach(sl => {
      const cat = (sl.closest('section.cat') || {}).dataset; const meet = cat && cat.cat && cat.cat.startsWith('m:') ? cat.cat.slice(2) : '';
      const pick = sl.closest('.dlpick'); if (!pick) return;
      pick.classList.toggle('same', !!sl.value && (sl.value === sl.dataset.gdl || sl.value === meet));
    });
  }
  let t = 0; const later = () => { clearTimeout(t); t = setTimeout(mark, 60); };
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('change', e => { if (e.target.matches && e.target.matches('select.dl-sel')) later(); });
  later();
  /* phones: while the top bar is still on screen the hero stage runs past the fold; lift the hero text so it stays visible */
  const st = document.querySelector('#f-s1 .f-stage'), tx = document.getElementById('f-heroTxt');
  if (st && tx){
    let raf = 0;
    const lift = () => { raf = 0; const r = st.getBoundingClientRect(); tx.style.setProperty('--heroLift', Math.max(0, Math.round(r.bottom - innerHeight)) + 'px'); };
    const req = () => { if (!raf) raf = requestAnimationFrame(lift); };
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); req();
  }
})();
