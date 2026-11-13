# Rules for working on this code (Ben, 13.11.26)

Keep this app and its code organized so a beginner can read it.

1. **Screens go in `pages/`** — one file per tab/screen of the site.
2. **Shared pieces go in `components/`** — menu, theme, deck, animations: anything used by more than one screen.
3. **Saving and loading goes in `data/`** — seed data, the Google Sheet connection, localStorage/shared-store sync.
4. **One job per file.** A file does one thing, and its first line says what that is.
5. **No file over 300 lines.** If it grows past that, split it.
6. **Before writing anything new, check if it already exists.** Search the repo first.
7. **Never change what the app does while reorganizing.** Prove it with `tests/`: run `node tests/snapshot.cjs <dir>` before and after, then `node tests/compare.cjs <before> <after>` — text and styles must match exactly.

## How the site is built

- Static site on GitHub Pages (branch `main`, root). No build step: the browser loads `index.html`, which pulls in `css/`, `data/`, `pages/`, `components/` directly.
- `index.html` holds only the page markup (HTML) and the list of files to load, in order. **Load order matters** — the scripts are classic scripts that share one global scope and run top to bottom.
- Team data lives in a Google Sheet behind an Apps Script web app (`data/sheet-api.js` holds the URL). The Apps Script itself is deployed by Ben — do not touch it without need.
- Design rules are in `DESIGN.md`. Everything is RTL Hebrew.

## Git

- Backup branch before big changes: `backup/save-point-2026-11-13` (state before the 13.11.26 reorganization).
- Ben prefers few, bundled PRs.
