/* Accent hue fixes. */
/* the body knows which tab is open, so the page takes that tab's hue */
(function(){
  const set = () => { const t = document.querySelector('#boardTabs .tab[aria-selected="true"]'); if (t) document.body.dataset.view = t.dataset.view; };
  const _go = go; go = function(v){ if (v === 'sup') v = 'contacts'; const r = _go.call(this, v); set(); return r; };
  set();
})();
