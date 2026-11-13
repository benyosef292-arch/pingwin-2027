/* UX polish pass: small fixes. */
/* deep link: #tab in the address opens that tab, and switching tabs updates it */
(function(){
  const has = v => v && document.querySelector('.tab[data-view="' + v + '"]');
  const _go = go;
  go = function(view){ _go.apply(this, arguments);
    if (has(view) && location.hash !== '#' + view) try { history.replaceState(null, '', location.pathname + location.search + '#' + view); } catch(e){} };
  const open = () => { const v = decodeURIComponent(location.hash.slice(1)); if (has(v)) _go(v); };
  window.addEventListener('hashchange', open);
  open();
})();
