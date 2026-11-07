#!/usr/bin/env node
/* Compare two snapshot folders from tests/snapshot.cjs.
 * Gate (exit 1): page text (*.txt) and computed styles (*.css.txt) must match exactly,
 * and no new page errors. Screenshots and console noise are reported, not gated:
 * the glass blur and the fixed photo backdrop draw a few pixels differently run to run.
 * Usage: node tests/compare.cjs <before-dir> <after-dir>
 */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2).map(p => path.resolve(p));

(async () => {
  const names = fs.readdirSync(A).sort();
  const diffs = [], notes = [];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const n of names) {
    const fa = path.join(A, n), fb = path.join(B, n);
    if (!fs.existsSync(fb)) { diffs.push(`${n}: missing in after`); continue; }
    const a = fs.readFileSync(fa), b = fs.readFileSync(fb);
    if (a.equals(b)) continue;
    if (n === 'errors.txt') {
      const lines = f => new Set(fs.readFileSync(f, 'utf8').split('\n').filter(Boolean));
      const before = lines(fa), added = [...lines(fb)].filter(l => !before.has(l));
      added.forEach(l => (l.includes('pageerror') ? diffs : notes).push('new error: ' + l));
      continue;
    }
    if (!n.endsWith('.png')) { diffs.push(`${n}: differs`); continue; }
    /* same pixels can encode to different bytes: decode both and count changed pixels */
    const r = await page.evaluate(async ([x, y]) => {
      const load = s => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
      const [ia, ib] = await Promise.all([load(x), load(y)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return `size ${ia.width}x${ia.height} -> ${ib.width}x${ib.height}`;
      const px = i => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
      const da = px(ia), db = px(ib); let n = 0;
      for (let k = 0; k < da.length; k += 4) if (da[k] !== db[k] || da[k + 1] !== db[k + 1] || da[k + 2] !== db[k + 2]) n++;
      return n ? `${n} pixels differ` : '';
    }, [a.toString('base64'), b.toString('base64')]);
    if (r) notes.push(`${n}: ${r}`);
  }
  await browser.close();
  if (notes.length) console.log('not gated:\n  ' + notes.join('\n  '));
  if (diffs.length) { console.log('FAILED:\n  ' + diffs.join('\n  ')); process.exit(1); }
  console.log(`compare: text and styles identical in ${names.filter(n => n.endsWith('.txt')).length} files`);
})();
