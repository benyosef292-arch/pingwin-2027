/* Standalone site: team data is shared through a Google Sheet (Apps Script web app). */
(function () {
  var API = 'https://script.google.com/macros/s/AKfycbyqqatC2XiOmIhWA87eirhEgAOrmfizKPLvPxOr_kR7lAYrmMXeeJGDnx3eHxWuhot0/exec';
  window.PENGUIN_API = API;
  var KEYK = 'penguin-owner-key';
  var PHOTOS = {"1": ["1bad2ed169c6af24a7cbc77276cf382d.jpg"], "2": ["63db9c98f11af489d205fa906c702cdf.jpg"], "3": ["65b466cd1056609c3d75eafde1bd86b6.jpg"], "4": ["522feee066fe6daf07a6ce138e97dd38.webp"], "5": ["6fabc72ab9fb6218c910cad6db03e0af.jpg"]};
  try {
    var m = location.search.match(/[?&]key=([^&]+)/), t = location.search.match(/[?&]team=([^&]+)/);
    if (m) localStorage.setItem(KEYK, decodeURIComponent(m[1]));
    if (t) localStorage.setItem('penguin-team-key', decodeURIComponent(t[1]));
    if (m || t) history.replaceState(null, '', location.pathname + location.hash);
  } catch (e) {}
  window.PENGUIN_AUTH = function () {
    var tk = ''; try { tk = localStorage.getItem('penguin-team-key') || ''; } catch (e) {}
    return '&tk=' + encodeURIComponent(tk) + '&key=' + encodeURIComponent(key());
  };
  function key() { try { return localStorage.getItem(KEYK) || ''; } catch (e) { return ''; } }
  function tkey() { try { return localStorage.getItem('penguin-team-key') || ''; } catch (e) { return ''; } }
  /* opened without the team link: say so, since contacts and editing need it */
  function noTeamBar(show) {
    var b = document.getElementById('noTeamBar');
    if (!show) { if (b) b.remove(); return; }
    if (b || !document.body) return;
    try { if (sessionStorage.getItem('penguin-noteam-x')) return; } catch (e) {}
    b = document.createElement('div'); b.id = 'noTeamBar'; b.setAttribute('role', 'status');
    b.innerHTML = '<span>פתחו מהקישור של הצוות שבן שלח בוואטצאפ, כדי לראות אנשי קשר ולערוך.</span><button type="button" aria-label="סגירה">×</button>';
    b.querySelector('button').onclick = function () { b.remove(); try { sessionStorage.setItem('penguin-noteam-x', '1'); } catch (e) {} };
    document.body.prepend(b);
  }

  var remote = {}, subs = {}, loaded = false, ownerOk = false, teamOk = false, inflight = null;
  var meta = { hasPendingWrites: false, fromCache: false };
  function nameOf(path) { return path.split('/')[1]; }
  function snapFor(path) {
    if (path === 'hotels/photos') return { exists: true, data: function () { return { items: PHOTOS }; }, metadata: meta };
    var d = remote[nameOf(path)];
    return { exists: !!d, data: function () { return d ? { items: d.items, updatedAt: d.updatedAt } : undefined; }, metadata: meta };
  }
  function fire(path) { (subs[path] || []).forEach(function (s) { try { s.cb(snapFor(path)); } catch (e) { console.error(e); } }); }

  function poll() {
    if (inflight) return inflight;
    inflight = fetch(API + '?t=' + Date.now() + window.PENGUIN_AUTH())
      .then(function (r) { return r.json(); })
      .then(function (j) {
        inflight = null;
        if (!j || !j.ok) throw new Error('bad_response');
        ownerOk = !!j.owner; teamOk = !!j.team;
        noTeamBar(!ownerOk && !teamOk);
        var changed = {};
        Object.keys(j.docs || {}).forEach(function (n) {
          if (!remote[n] || JSON.stringify(remote[n].items) !== JSON.stringify(j.docs[n].items)) { remote[n] = j.docs[n]; changed[n] = 1; }
        });
        var first = !loaded; loaded = true;
        Object.keys(subs).forEach(function (p) { if (first || changed[nameOf(p)]) fire(p); });
        return j;
      })
      .catch(function (e) {
        inflight = null;
        Object.keys(subs).forEach(function (p) { (subs[p] || []).forEach(function (s) { if (s.err) s.err(e); }); });
        throw e;
      });
    return inflight;
  }
  setInterval(function () { if (!document.hidden) poll().catch(function () {}); }, 15000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) poll().catch(function () {}); });

  function doc(path) {
    return {
      onSnapshot: function (cb, err) {
        (subs[path] = subs[path] || []).push({ cb: cb, err: err });
        if (loaded) setTimeout(function () { cb(snapFor(path)); }, 0); else poll().catch(function () {});
        return function () {};
      },
      set: function (data) {
        var name = nameOf(path);
        if (path === 'hotels/photos') return Promise.resolve();
        var items = (data && data.items) || {}, base = remote[name] ? remote[name].items : {};
        var set = {}, del = [], n = 0;
        Object.keys(items).forEach(function (k) { if (JSON.stringify(items[k]) !== JSON.stringify(base[k])) { set[k] = items[k]; n++; } });
        Object.keys(base).forEach(function (k) { if (!(k in items)) { del.push(k); n++; } });
        if (!n && remote[name]) return Promise.resolve();
        return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ doc: name, set: set, del: del, key: key(), tk: tkey() }) })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (!j || !j.ok) { var er = new Error((j && j.error) || 'save_failed'); er.code = (j && j.error) || 'save_failed'; throw er; }
            remote[name] = { items: j.items, updatedAt: j.updatedAt };
            if (JSON.stringify(j.items) !== JSON.stringify(items)) fire(path);
          });
      }
    };
  }

  var db = { doc: doc };
  var user = {
    isOwner: function () { return key() ? poll().then(function () { return ownerOk; }) : Promise.resolve(false); },
    canEdit: function () { return (key() || tkey()) ? poll().then(function () { return ownerOk || teamOk; }) : Promise.resolve(false); }
  };
  var downloads = {
    save: function (o) {
      var blob = o.data instanceof Blob ? o.data : new Blob([o.data], { type: 'application/octet-stream' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = o.filename;
      document.body.appendChild(a); a.click(); a.remove();
      return Promise.resolve();
    }
  };
  window.claude = {
    use: function (name) {
      return Promise.resolve(name === 'db' ? db : name === 'user' ? user : name === 'downloads' ? downloads : null);
    }
  };
})();
