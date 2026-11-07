#!/usr/bin/env node
/* Characterization harness for index.html.
 *
 * Opens the site offline (the Google Sheet is replaced by a fixed answer), freezes the
 * clock, and for every tab and every deck slide x theme x screen size records:
 *   - the visible text                         -> <out>/<name>.txt
 *   - every element's computed style (hashed)  -> <out>/<name>.css.txt
 *   - a screenshot (for people; not a gate)    -> <out>/<name>.png
 *   - console / page errors                    -> <out>/errors.txt
 * The text and style files are the proof that a change kept behavior: they must match exactly.
 * Run it before and after a change and compare the two folders with tests/compare.cjs.
 *
 * Usage: node tests/snapshot.cjs <out-dir> [--team] [--full]
 *   --full writes every property instead of a hash (big files; for finding what changed)
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || 'snap');
const TEAM = process.argv.includes('--team');
const FULL = process.argv.includes('--full');
const NOW = new Date('2026-11-05T09:00:00+02:00');
const TABS = ['overview', 'plan', 'p1', 'p2', 'p3', 'wk', 'qs', 'inv', 'sum', 'contacts', 'team'];
const SIZES = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const THEMES = ['dark', 'light'];

/* the shared store answers "ok, no docs": the page falls back to its built-in seed */
const API_REPLY = JSON.stringify({ ok: true, owner: false, team: TEAM, docs: {} });

/* one line per element: its place in the tree, then a hash of its computed style
   (and of its ::before / ::after), so a dead CSS rule can be removed with proof */
function styleDump(full) {
  const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
  /* custom properties (--x) are skipped: they only matter through the real properties they feed,
     and one of them holds the 2.5 MB background photo */
  const flat = cs => { let o = ''; for (let i = 0; i < cs.length; i++) if (!cs[i].startsWith('--')) o += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';'; return o; };
  const where = el => { const p = []; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { let i = 0; for (let s = e; (s = s.previousElementSibling);) i++; p.unshift(e.tagName.toLowerCase() + i); } return p.join('/'); };
  const out = [];
  /* only what is drawn now: hidden tabs and slides are recorded when they are open */
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script,style') || !el.getClientRects().length) continue;
    const s = flat(getComputedStyle(el)) + '|' + flat(getComputedStyle(el, '::before')) + '|' + flat(getComputedStyle(el, '::after'));
    out.push(where(el) + ' ' + (el.id ? '#' + el.id + ' ' : '') + (full ? s : h(s)));
  }
  return out.join('\n') + '\n';
}

const settle = () => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { a.currentTime = 0; a.pause(); } });

async function record(page, name) {
  /* CSS animations run on real time, not on the frozen clock: jump each to its end (looping ones
     back to their start), then let the page's animationend handlers run, so two runs see the same frame */
  for (let k = 0; k < 3; k++) { await page.evaluate(settle); await page.waitForTimeout(100); }
  fs.writeFileSync(path.join(OUT, name + '.txt'), await page.evaluate(() => document.body.innerText));
  fs.writeFileSync(path.join(OUT, name + '.css.txt'), await page.evaluate(styleDump, FULL));
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true, animations: 'disabled' });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const errors = [];
  const browser = await chromium.launch();
  /* the four screen/theme runs are independent: run them side by side */
  const runs = Object.entries(SIZES).flatMap(([sizeName, viewport]) => THEMES.map(theme => [sizeName, viewport, theme]));
  await Promise.all(runs.map(async ([sizeName, viewport, theme]) => {
    {
      const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'he-IL', timezoneId: 'Europe/Paris' });
      await ctx.route('**/*', r => {
        const u = r.request().url();
        if (u.startsWith('file://')) return r.continue();
        if (u.includes('script.google.com')) return r.fulfill({ status: 200, contentType: 'application/json', body: API_REPLY });
        return r.abort(); /* fonts and anything else on the network: off, so runs match */
      });
      const page = await ctx.newPage();
      await page.clock.install({ time: NOW });
      page.on('console', m => { if (m.type() === 'error') errors.push(`[${sizeName}/${theme}] console: ${m.text()}`); });
      page.on('pageerror', e => errors.push(`[${sizeName}/${theme}] pageerror: ${e.message}`));
      await page.addInitScript(t => { try { localStorage.setItem('penguin-theme', t); } catch (e) {} }, theme);
      await page.goto('file://' + path.join(ROOT, 'index.html'));
      await page.clock.runFor(3000);
      for (const tab of TABS) {
        await page.evaluate(v => {
          const b = document.querySelector(`.tab[data-view="${v}"]`);
          if (b) b.click();
          window.scrollTo(0, 0);
        }, tab);
        await page.clock.runFor(1500);
        const name = `${sizeName}-${theme}-${tab}`;
        await record(page, name);
      }
      /* the deck ("מצגת" button): every slide */
      await page.evaluate(() => document.querySelector('.mode-btn[data-mode="deck"]').click());
      const slides = await page.evaluate(() => document.querySelectorAll('#ddots .ddot').length);
      for (let k = 0; k < slides; k++) {
        await page.evaluate(i => document.querySelectorAll('#ddots .ddot')[i].click(), k);
        await page.clock.runFor(1500);
        await record(page, `${sizeName}-${theme}-deck${String(k + 1).padStart(2, '0')}`);
      }
      await page.evaluate(() => document.querySelector('.mode-btn[data-mode="board"]').click());
      await ctx.close();
    }
  }));
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'errors.txt'), errors.sort().join('\n') + (errors.length ? '\n' : ''));
  console.log(`snapshot: ${fs.readdirSync(OUT).filter(f => f.endsWith('.css.txt')).length} views -> ${OUT} (${errors.length} errors)`);
}
main().catch(e => { console.error(e); process.exit(1); });
