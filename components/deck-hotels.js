/* Deck: hotel drawer on the map slide. */
/* 28.11.26 (Ben): Kashmir, Plein Sud and Montana facts from the hotel meetings (rules, team notes). */
/* ================= DECK: hotel drawer on the map slide ================= */
(function(){
  const feat = document.querySelector('#stage .hotel-feat');
  const svg = document.querySelector('#stage .vtmap');
  if (!feat || !svg) return;
  const SRC = 'https://www.pingwin.co.il/%D7%97%D7%95%D7%A4%D7%A9%D7%AA+%D7%A1%D7%A7%D7%99+%D7%91%D7%A6%D7%A8%D7%A4%D7%AA+Val+Thorens.html';
  const H = {
    1: { name: 'Montana Plein Sud', sub: 'Village Montana · רובע Plein Sud', tags: ['מלון דירות', 'דירוג 8.5', 'סקי־אין סקי־אאוט'],
      lead: 'דירות גדולות עם 2–3 חדרי רחצה, ספא חופשי לאורחים וגישה ישירה למסלולים.',
      units: [['2 חדרי שינה וסלון', '50–60', '2–5'], ['3 חדרי שינה וסלון', '70–80', '4–6']],
      fac: ['ספא חופשי: בריכה מקורה, ג׳קוזי, סאונה, חמאם', 'חדר סקי פתוח תמיד, עם יציאה למסלול: כרטיס החדר פותח את החדר, וקוד פותח את ארון הציוד', 'לוקר מחומם לנעליים לכל דירה', 'קבלה 24 שעות', 'המעלית הקרובה: Péclet (כחולה)', 'אין מסעדה בבניין'],
      board: 'לינה בלבד, אין ארוחות במלון. לחם ומאפים לדירה (Bread in Bed) מזמינים דרכנו. ארוחת בוקר או חצי פנסיון בתוספת, במסעדות קרובות (כ־80 ו־200 מ׳).',
      local: 'מס עירוני 3.41 € לאדם ללילה (מגיל 18), משלמים בצ׳ק־אין · פיקדון 500 € באשראי · ניקיון יומי 100–120 € ליום',
      note: 'בדירה: מגבות, 3 גלילי נייר טואלט, שמפו ומרכך בגודל קטן (מי שרוצה עוד קונה). החלפת מגבות אחת באמצע השבוע. אורחי מלונות Montana האחרים יכולים להיכנס לספא ב־20 € אם יש מקום, ילד רק עם מבוגר.',
      rules: 'רק מיטות נפרדות: מי שרוצה לחבר מיטות מבקש מראש. מיטת תינוק וכיסא תינוק לפי בקשה מראש. דירות בדרך כלל ל־4, החמישי ישן על ספה נפתחת. הגעה בשבת אחרי 22:00: את המפתח לוקחים במלון Montana. צ׳ק־אאוט עד 10:00: לנקות את המטבח ולשים את הפח בפח הגדול. יוצאים מוקדם: בערב שלפני משאירים את הכרטיס בקופסה בקבלה.',
      team: 'איש קשר: לוקאס (הטלפון באנשי קשר) · ריקו עד שלישי, עם בקשות לחיבור מיטות ולציוד תינוק · מספרי הדירות נסגרים רק בהגעה',
      url: 'https://www.pingwin.co.il/Plein+Sud.html?siteID=1288' },
    2: { name: 'Le Cheval Blanc', sub: 'Village Montana · רובע Soleil', tags: ['רזידנס 3 כוכבים', 'דירוג 7.6', 'סקי־אין סקי־אאוט', '163 יחידות'],
      lead: 'הגדול מבין המובילים, עם יחידות קטנות ומשפחתיות ומרכז שעשועים לילדים צמוד למעלית.',
      units: [['חדר שינה וסלון', '27', '2–4'], ['חדר, נישה וסלון', '33', '4–6'], ['3 חדרים עם גלריה', '50', '6–8']],
      fac: ['כניסה אחת למרכז La Board: בריכות, סאונות, חמאם', 'ספא Plein Sud בכ־20 €', 'לובי עם אח וביליארד', 'חדר סקי פונה למסלולים', 'מרכז משפחות 600 מ״ר ליד המעלית'],
      board: 'לינה בלבד. אפשר להזמין מהארץ באגט וקרואסון, ארוחת בוקר או ארוחת ערב במסעדה מקומית (כ־50 מ׳).',
      local: 'מס עירוני 1.65 € לאדם ליום (מגיל 18) · פיקדון 500 € באשראי · ניקיון יומי לפי בקשה',
      note: 'יחידות "פריבילג׳" פונות למסלולים, "קלאסיק" לעיירה. אין החלפת מצעים ומגבות במהלך השבוע.',
      team: 'קבלה בשבת וראשון: 8:00–13:00, 15:00–03:00 · רשימה נפרדת, עד חמישי · מידע על תינוקות כמה שיותר מוקדם, כדי שיכינו לולים',
      url: 'https://www.pingwin.co.il/Cheval+Blanc.html?siteID=1292' },
    3: { name: 'Montana Soleil', sub: 'Residence Montana · מבנה Soleil', tags: ['רזידנס', 'דירוג 8.1', 'מרכז העיירה'],
      lead: 'חלק מ־Residence Montana (מבנים Soleil, Premier ו־Valbel) במרכז העיירה, קרוב לחנויות ולמסלולים.',
      units: [['חדר שינה וסלון', '32', '2–3'], ['2 חדרי שינה וסלון', '45', '2–4'], ['2 חדרים, נישה וסלון', '49', '4–6']],
      fac: ['Premier ו־Valbel סקי־אין סקי־אאוט, השאר בהליכה קצרה', 'מסעדה במבנה Premier', 'ספא Plein Sud בכ־20 €', 'כניסה אחת למרכז La Board', 'WiFi עד 4 מכשירים'],
      board: 'לינה בלבד. ארוחת ערב 3 מנות במבנה Premier, ארוחת בוקר במסעדה מקומית (כ־100 מ׳), בתוספת.',
      local: 'מס עירוני 2.64 € לאדם ללילה · פיקדון 500 € באשראי · ספא בכ־20 € · ניקיון יומי בתשלום',
      note: 'החלפת מגבות אחת באמצע השבוע, בלי החלפת מצעים. ניקוי המטבח באחריות הלקוח.',
      rules: 'הקבלה במונטנה פרימייר פתוחה 24/7, ואפשר להתקשר אליה מהדירה. בהגעה מאוחרת גם אורחי פליין סוד מגיעים קודם לפרימייר, ואחרי הצ׳ק־אין ממשיכים לדירה. מפתח ללוקר הציוד מקבלים בצ׳ק־אין, חדר הסקי פתוח תמיד. ספא בפליין סוד, 20 €. צ׳ק־אאוט ביום ראשון עד 10:00: לנקות מטבח, כלים במדיח, בלי זבל, מצעים בנקודה אחת. דירה מבולגנת: חיוב 100 €.',
      team: 'רשימה נפרדת לכל מלון מונטנה, עד חמישי · מידע על תינוקות כמה שיותר מוקדם, כדי שיכינו לולים · שבת עמוסה מאוד בקבלה',
      url: 'https://www.pingwin.co.il/Residence+Montana.html?siteID=1293' },
    4: { name: 'Kashmir', sub: 'Hotel Kashmir · הכניסה לוולטורנס', tags: ['מלון', 'דירוג 8.3', 'סקי־אין סקי־אאוט', 'לינה וארוחת בוקר'],
      lead: 'המלון היחיד מבין המובילים, עם ארוחת בוקר, ספא ומסעדה. צמוד למסלול שמוביל למעלית Plein Sud.',
      units: [['Family Suite', '45', '2–4'], ['Prestige Suite', '80', '3–5']],
      fac: ['ספא, בריכה וסאונה 10:00–20:00, גם לדירות וגם למלון. מתחת לגיל 16 אין כניסה לספא. כדאי לתאם מראש בקבלה', 'קבלה פתוחה 24/7', 'חדר סקי פתוח תמיד, עם יציאה למסלולים', 'חדר כושר, לובי ובר', 'מסעדת Beef & Lobster (המלצת הצוות)', 'מטבחון ומרפסת בכל סוויטה'],
      board: 'לינה וארוחת בוקר. חצי פנסיון בתוספת. אפשר להוסיף ארוחות במלון: ארוחת ערב 50 €, ארוחת בוקר 25 €.',
      local: 'מס עירוני 2.86 € לאדם ללילה (מגיל 18) · פיקדון 600 € ל־48 שעות · ניקיון יומי והחלפת מגבות כלולים',
      note: 'עד כ־10 דקות הליכה למרכז הקניות והבילוי. יש גם Residence Kashmir עם דירות, באותו מתחם.',
      rules: 'חדרים מ־17:00 (אפשר לנסות קודם), אפשר להשאיר מזוודות. מפתח החדר תמיד עליכם: הוא פותח את הדלתות הצדדיות. מפתח שאבד: לקבלה, פעם אחת חינם, אחר כך 10 €. הגעה מאוחרת מאוד: לעדכן את המלון במייל. צ׳ק־אאוט: לנקות מטבח ולרוקן פח (אחרת חיוב 100 € מהפיקדון), ולשלם בקבלה מס עירוני וחשבון בר.',
      team: 'איש קשר: אירנה, מנהלת הקבלה · ריקו עד רביעי, עם טלפון ומייל לכל אורח וימי הולדת בהערות · האוטובוס נכנס עד המלון',
      url: 'https://www.pingwin.co.il/Hotel+Kashmir.html?siteID=1665' },
    5: { name: "L'Oxalys", sub: 'Oxalys Residence · כ־300 מ׳ ממרכז העיירה', tags: ['רזידנס 4 כוכבים', 'דירוג 8.9', 'סקי־אין סקי־אאוט'],
      lead: 'הדירוג הגבוה מבין המובילים. שלושה מבנים שמחוברים במעבר תת־קרקעי, ודירות עם אח עצים.',
      units: [['חדר, נישה וסלון עם אח', '45', '2–4'], ['2 חדרי שינה (חלק דופלקס)', '65', '4–5'], ['דירה בשלוש קומות', '95', '6–8']],
      fac: ['ספא חופשי 10:30–20:00: בריכה, סאונה, חמאם, ג׳קוזי', 'מסעדה ובר', 'חדר סקי עם לוקר ומייבש נעליים', 'שקית עצים לאח חינם', 'חלוק ונעלי ספא'],
      board: 'לינה בלבד. אפשר להזמין מהארץ באגט וקרואסון וארוחת ערב במסעדה מקומית (5–10 דק׳ הליכה).',
      local: 'מס עירוני כ־3.5 € לאדם ללילה · פיקדון 650 € · ניקיון יומי והחלפת מגבות בתשלום',
      note: 'בדירות 45 מ״ר הנישה בלי חלון ואין מעלית (קומה אחת במדרגות). WiFi למשתמש אחד.',
      url: 'https://www.pingwin.co.il/Oxalys+Residence.html?siteID=1402' }
  };

  /* drawer */
  feat.style.position = 'relative';
  const dr = document.createElement('aside');
  dr.className = 'hdr'; dr.setAttribute('aria-live', 'polite'); dr.hidden = true;
  feat.appendChild(dr);
  let photos = {}, assets = null, db = null, cur = 0, locked = false, closeT = 0, busy = false;
  const esc2 = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render(n){
    const h = H[n]; if (!h) return;
    const ph = photos[n] || [];
    const gal = ph.length
      ? `<div class="hdr-gal"><img class="hdr-main" src="photos/${esc2(ph[0])}" alt="${esc2(h.name)}">${ph.length > 1 ? `<div class="hdr-th">${ph.slice(0, 4).map((id, k) => `<button type="button" class="${k ? '' : 'on'}" data-ph="${esc2(id)}"><img src="photos/${esc2(id)}" alt=""></button>`).join('')}</div>` : ''}${assets ? `<button type="button" class="hdr-del" data-del="${esc2(ph[0])}" title="הסרת התמונה">×</button>` : ''}</div>`
      : `<div class="hdr-gal empty"><span>${assets ? 'עוד אין תמונות למלון הזה.<br>לחצו על "הוספת תמונות" או גררו תמונות לכאן.' : 'תמונות המלון יופיעו כאן'}</span></div>`;
    dr.innerHTML = `<div class="hdr-top"><span class="hnum">${n}</span><div><h3>${esc2(h.name)}</h3><div class="loc">${esc2(h.sub)}</div></div>
      <button type="button" class="hdr-x" aria-label="סגירה">×</button></div>
      ${gal}
      ${assets ? `<label class="hdr-up"><input type="file" accept="image/*" multiple hidden><span>${busy ? 'מעלה…' : 'הוספת תמונות'}</span></label>` : ''}
      <div class="hdr-tags">${h.tags.map(t => `<span>${esc2(t)}</span>`).join('')}</div>
      <p class="hdr-lead">${esc2(h.lead)}</p>
      <div class="hdr-grid">
        <div><h4>יחידות</h4><table><thead><tr><th>סוג</th><th>מ״ר</th><th>אורחים</th></tr></thead><tbody>${h.units.map(u => `<tr><td>${esc2(u[0])}</td><td dir="ltr">${u[1]}</td><td dir="ltr">${u[2]}</td></tr>`).join('')}</tbody></table></div>
        <div><h4>במקום</h4><ul>${h.fac.map(f => `<li>${esc2(f)}</li>`).join('')}</ul></div>
      </div>
      <div class="hdr-row"><b>ארוחות</b><span>${esc2(h.board)}</span></div>
      <div class="hdr-row"><b>לתשלום במקום</b><span>${esc2(h.local)}</span></div>
      <div class="hdr-row note"><b>לשים לב</b><span>${esc2(h.note)}</span></div>
      ${h.rules ? `<div class="hdr-row"><b>כללי המלון</b><span>${esc2(h.rules)}</span></div>` : ''}
      ${h.team ? `<div class="hdr-row"><b>לצוות</b><span>${esc2(h.team)}</span></div>` : ''}
      <div class="hdr-src">בכל החבילות: טיסה לליון או גרנובל, העברות, נציג, 7 לילות וסקי פס · <a href="${h.url}" target="_blank" rel="noopener">מקור: אתר פינגווין</a></div>`;
  }
  function open(n, lock){
    clearTimeout(closeT);
    if (lock != null) locked = lock;
    if (cur !== n){ cur = n; render(n); }
    dr.hidden = false; feat.classList.add('hdr-on');
    marks.forEach(m => m.g.classList.toggle('on', m.n === n));
    rows.forEach(r => r.el.classList.toggle('on', r.n === n));
  }
  function close(){
    locked = false; cur = 0; dr.hidden = true; feat.classList.remove('hdr-on');
    marks.forEach(m => m.g.classList.remove('on')); rows.forEach(r => r.el.classList.remove('on'));
  }
  const soon = () => { if (locked) return; clearTimeout(closeT); closeT = setTimeout(close, 450); };

  /* map pins + list rows */
  const marks = [...svg.querySelectorAll('g.pm')].map(g => ({ g, n: +g.textContent.trim() })).filter(m => H[m.n]);
  marks.forEach(m => {
    m.g.setAttribute('tabindex', '0'); m.g.setAttribute('role', 'button'); m.g.setAttribute('aria-label', 'פרטים על ' + H[m.n].name);
    m.g.addEventListener('mouseenter', () => open(m.n));
    m.g.addEventListener('mouseleave', soon);
    m.g.addEventListener('focus', () => open(m.n));
    m.g.addEventListener('click', e => { e.stopPropagation(); (locked && cur === m.n) ? close() : open(m.n, true); });
    m.g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(m.n, true); } });
  });
  const rows = [...feat.querySelectorAll('.hf')].map(el => ({ el, n: +el.querySelector('.hnum').textContent.trim() })).filter(r => H[r.n]);
  rows.forEach(r => {
    r.el.addEventListener('mouseenter', () => open(r.n));
    r.el.addEventListener('mouseleave', soon);
    r.el.addEventListener('click', () => open(r.n, true));
  });
  dr.addEventListener('mouseenter', () => clearTimeout(closeT));
  dr.addEventListener('mouseleave', soon);
  dr.addEventListener('click', async e => {
    const t = e.target;
    if (t.closest('.hdr-x')) { close(); return; }
    const th = t.closest('[data-ph]');
    if (th){ const main = dr.querySelector('.hdr-main'); if (main) main.src = 'photos/' + th.dataset.ph; dr.querySelectorAll('[data-ph]').forEach(b => b.classList.toggle('on', b === th)); const d = dr.querySelector('[data-del]'); if (d) d.dataset.del = th.dataset.ph; return; }
    const del = t.closest('[data-del]');
    if (del && assets){
      const id = del.dataset.del, n = cur;
      if (del.dataset.armed !== '1'){ del.dataset.armed = '1'; del.textContent = 'למחוק?'; setTimeout(() => { if (del.isConnected){ del.dataset.armed = ''; del.textContent = '×'; } }, 3000); return; }
      photos[n] = (photos[n] || []).filter(x => x !== id);
      await savePhotos(); try { await assets.delete(id); } catch(err){}
      render(n);
    }
  });
  dr.addEventListener('change', e => { const inp = e.target; if (inp.type === 'file' && inp.files && inp.files.length) addFiles(inp.files); });
  dr.addEventListener('dragover', e => { if (assets){ e.preventDefault(); dr.classList.add('drop'); } });
  dr.addEventListener('dragleave', () => dr.classList.remove('drop'));
  dr.addEventListener('drop', e => { if (!assets) return; e.preventDefault(); dr.classList.remove('drop'); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !dr.hidden) close(); });
  document.addEventListener('click', e => { if (!dr.hidden && locked && !e.target.closest('.hdr, .vtmap g.pm, .hf')) close(); });

  async function addFiles(list){
    if (!assets || busy) return;
    const n = cur; busy = true; render(n);
    const ok = { 'image/jpeg': 1, 'image/png': 1, 'image/webp': 1, 'image/gif': 1 };
    try {
      for (const f of [...list].slice(0, 8)){
        if (!ok[f.type]) continue;
        const r = await assets.upload(f);
        photos[n] = (photos[n] || []).concat(r.id);
      }
      await savePhotos();
    } catch(err){ if (typeof toast === 'function') toast('ההעלאה לא הצליחה' + (err && err.code === 'too_large' ? ': הקובץ גדול מדי' : '')); }
    busy = false; if (cur === n) render(n);
  }
  async function savePhotos(){
    if (!db) return;
    try { await db.doc('hotels/photos').set({ items: photos, updatedAt: new Date().toISOString() }); }
    catch(err){ if (typeof toast === 'function') toast('התמונות לא נשמרו'); }
  }

  if (window.claude && claude.use){
    claude.use('db').then(d => {
      if (!d) return; db = d;
      db.doc('hotels/photos').onSnapshot(snap => {
        photos = snap.exists ? ((snap.data() || {}).items || {}) : {};
        if (cur) render(cur);
      }, () => {});
    });
    claude.use('assets').then(a => { assets = a; if (cur) render(cur); });
  }
  const _s = showSlide; showSlide = function(i){ _s(i); if (!dr.hidden) close(); };
  window.HotelDrawer = { open, close };
})();
