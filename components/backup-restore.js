/* Backup / restore of all saved data (owner). */
/* ================= backup / restore ================= */
(function(){
  const keys = [KEY, TKEY.voices, TKEY.hw, TKEY.sums, TKEY.wform, ORDER_KEY, TKEY.resp, 'penguin-owners', DL_KEY, CUSTOM_KEY, 'penguin-qs'];
  document.getElementById('backupBtn').addEventListener('click', async () => {
    const out = { app: 'penguin', v: 1, saved: new Date().toISOString(), data: {} };
    keys.forEach(k => { try { out.data[k] = localStorage.getItem(k); } catch(e){} });
    const dl = window.claude && claude.use ? await claude.use('downloads').catch(() => null) : null;
    if (!dl) { toast('הורדת קבצים לא זמינה בתצוגה הזו'); return; }
    try {
      await dl.save({ filename: 'penguin-backup-' + new Date().toISOString().slice(0, 10) + '.json', data: JSON.stringify(out, null, 2) });
      toast('קובץ הגיבוי נשמר');
    } catch(e){ toast('הגיבוי לא נשמר'); }
  });
  const fileIn = document.getElementById('restoreFile');
  document.getElementById('restoreBtn').addEventListener('click', () => { if (PG_OWNER) fileIn.click(); });
  fileIn.addEventListener('change', () => {
    const f = fileIn.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (j.app !== 'penguin' || !j.data) throw 0;
        askConfirm('לשחזר מהגיבוי? הסימונים והטקסטים הנוכחיים יוחלפו.').then(yes => {
          if (!yes) return;
          keys.forEach(k => { if (j.data[k] != null) { try { localStorage.setItem(k, j.data[k]); } catch(e){} } });
          if (window.PenguinSync) window.PenguinSync.pushAll().then(() => location.reload()); else location.reload();
        });
      } catch(e){ toast('הקובץ לא נראה כמו גיבוי של פינגווין'); }
      fileIn.value = '';
    };
    r.readAsText(f);
  });
})();
