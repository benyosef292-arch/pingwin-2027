/* Daily mail summary (encrypted file, opened with the team key). */
/* ================= daily mail summary (encrypted file, opened with the team key) ================= */
(function(){
  const b64 = x => Uint8Array.from(atob(x), c => c.charCodeAt(0));
  async function dec(o, pass){
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(o.salt), iterations: o.it, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(o.iv) }, k, b64(o.ct))));
  }
  const E = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PEOPLE = ['בן', 'יותם', 'דורון', 'קרן'];
  function render(){
    const box = document.getElementById('mailBox'), M = window.MAIL; if (!box || !M) return;
    const PC = window.PERSON_COLORS || {}, by = {}; PEOPLE.concat('ללא אחראי').forEach(p => by[p] = []);
    let st0 = {}; try { st0 = tstore(SUP_KEY) || {}; } catch(e){}
    SUPS.flatMap(g => g[1]).forEach(s => {
      const x = supEff(s, st0[s.id] || {}), m = supMail(s) || {};
      if (/meet|done/.test(x.st || '')) return;
      let cls, txt;
      if (m.turn === 'us') { cls = 'us'; txt = 'ענו ' + dm(m.in) + ' · לענות'; }
      else if (x.st === 'ans') { cls = 'us'; txt = 'ענו · לקבוע'; }
      else if (m.out || x.st === 'sent') { cls = 'out'; txt = m.out ? 'נשלח ' + dm(m.out) + ' · מחכים' : 'נשלח · מחכים'; }
      else { cls = 'none'; txt = s.late ? 'אחרי חנוכה' : s.wa ? 'לשלוח בוואטצאפ' : 'עוד לא נשלח'; }
      (by[x.who] || by['ללא אחראי']).push(`<li class="${cls}"><b>${E(s.n)}</b><span>${E(txt)}</span></li>`);
    });
    const ord = { us: 0, none: 1, out: 2 };
    const card = (p, rows) => `<div class="mx-card" style="--pc:${PC[p] || '#5F7280'}"><h3>${E(p)}</h3><ul>${rows.sort((a, b) => ord[a.match(/class="(\w+)"/)[1]] - ord[b.match(/class="(\w+)"/)[1]]).join('')}</ul></div>`;
    const msg = it => `<li class="msg"><b>${E(it.who || '')}${it.subj ? ' · ' + E(it.subj) : ''}</b><small>${E(dm(it.d))}${it.what ? ' · ' + E(it.what) : ''}</small></li>`;
    const at = M.at ? new Date(M.at) : null;
    let html = `<div class="mx-h"><h2>סיכום בוקר מהמייל</h2><small>${at ? 'עודכן ' + at.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) + ' ' + at.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''}</small></div><div class="mx-grid">`;
    if ((M.us || []).length) html += `<div class="mx-card alert"><h3>ממתין לתשובה שלנו</h3><ul>${M.us.map(msg).join('')}</ul></div>`;
    PEOPLE.forEach(p => { if (by[p].length) html += card(p, by[p]); });
    if (by['ללא אחראי'].length) html += card('ללא אחראי', by['ללא אחראי']);
    if ((M.new || []).length) html += `<div class="mx-card"><h3>חדש בתיבה</h3><ul>${M.new.map(msg).join('')}</ul></div>`;
    box.innerHTML = html + '</div>'; box.hidden = false;
  }
  window.renderMailBox = render;
  async function load(){
    let tk = ''; try { tk = localStorage.getItem('penguin-team-key') || ''; } catch(e){}
    if (!tk || !(window.crypto && crypto.subtle)) return;
    try {
      const r = await fetch('mail.enc.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return;
      window.MAIL = await dec(await r.json(), tk);
    } catch(e){ return; }
    render(); if (typeof renderSup === 'function') renderSup();
  }
  document.addEventListener('contacts-ready', render);
  window.addEventListener('storage', render);
  setInterval(render, 20000);
  load();
})();
