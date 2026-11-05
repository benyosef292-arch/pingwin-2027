# Penguin Val Thorens 2027 · team site

Work site for the Penguin Val Thorens team, season 2027: tasks from the prep period to season end,
work plan, calendar, open questions, warehouse, weekly summaries, contacts and roles.

Live: https://benyosef292-arch.github.io/pingwin-2027/ (GitHub Pages, from `main`).

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole site: markup, CSS and JS in one file, plus the built-in seed data. |
| `photos/` | Hotel photos, listed by name in `index.html` (`PHOTOS`). |
| `mail.enc.json` | The daily mail summary, encrypted. Built with `tools/mail_pack.py`. |
| `DESIGN.md` | Design rules: colors, type, components, and what not to do. |
| `tests/` | The check that a change kept the site the same (below). |

## Data and links

- Shared data lives in a Google Sheet behind an Apps Script web app (`API` at the top of `index.html`).
  The site reads it every 15 seconds and writes only the items that changed.
  The Apps Script code is not in this repo.
- The page also carries a seed of the team data, used until the Sheet answers.
- Three kinds of links:
  - plain link: read only, with a banner asking to open the team link;
  - team link (`?team=...`): edit tasks, questions, summaries, calendar; see contacts and the mail summary;
  - Ben's key link (`?key=...`): also due dates, resets, ongoing-work tasks and roles.
  The key is moved into `localStorage` and removed from the address bar.

## Mail summary

```
MAIL_KEY=<team key> python3 tools/mail_pack.py mail.json mail.enc.json
```

The repo is public, so the summary is stored encrypted (AES-GCM, key from the team key).
The site decrypts it in the browser only when opened from the team link.

## Checking a change

`tests/snapshot.cjs` opens the site offline with a fixed date, goes through every tab and every
deck slide in dark and light, desktop and phone, and records the visible text, every element's
computed style and a screenshot. `tests/compare.cjs` compares two such runs.

```
git stash && node tests/snapshot.cjs /tmp/before && git stash pop
node tests/snapshot.cjs /tmp/after
node tests/compare.cjs /tmp/before /tmp/after
```

Same text and same styles means the change did not move anything on screen.
A change that should look different will show up here as the views it changed.
Needs Node and Playwright with Chromium.
