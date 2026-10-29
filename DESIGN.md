# DESIGN.md · Penguin Val Thorens 2027 team site

Internal work site for four Penguin reps and the office. Job: know what's mine, what's next, and by when.
Language: the resort's piste map and signage. Colors already mean something on a mountain, so they mean the same thing here.
Not based on UXKIN examples (the UXKIN connection was not available); based on the site's own history and Ben's feedback.

## Color

| Token | Value | Role |
|---|---|---|
| `--snow` | #F1F4F6 | page background (work board) |
| `--panel` | #FFFFFF | panels, cards |
| `--slate` | #1C2C37 | text, top bar, dark scenes' base |
| `--muted` | #536572 | secondary text (4.9:1 on white, 4.6:1 on #EDEDED) |
| `--hair` | #D3DCE2 | borders |
| `--run-blue` | #1858C4 | open / active / links / focus |
| `--run-red` | #C62A30 | due, overdue, red lines |
| `--run-green` | #1F8A55 | done, only done |
| `--marker` | #EE8418 | today, next, "you are here" (fills only; text uses `--marker-ink` #A4520A) |
| `--glow` | #F6C38B | the one warm tint on the dark photo scenes (replaces the old gold); goggle rim |

People have their own colors, chosen so none of them can be read as a run color:
בן #6941C6 · יותם #0E7490 · דורון #8B5A2B · קרן #B42370 · כולם #475966 · פתוח #8A6100.
People chips: tinted background, text in the person's color (all ≥4.5:1).

Dark photo scenes (goggles, gondola, team building): slate night + white type + `--glow` only for
the next/active thing. No gold eyebrows, no single word painted in an accent color.

## Typography
IBM Plex Sans Hebrew everywhere, 400/500/600/700, tabular numbers for dates and counts.
Frank Ruhl Libre only for the goggle hero title and the scene titles (the "poster" voice).
Scale: 12 / 13 / 14.5 / 16 / 20 / 28 / 32 / clamp(46–96) hero. Body 14.5–16px, lines under 75ch.

## Spacing, shape, depth
4px base: 4 8 12 16 20 24 32 40 56. Content width 1160px.
Radius by level: panels 10px, chips/rows 6px, people pills round. Borders instead of shadows;
one shadow only for floating menus and the search dialog.

## Components
- Tab header = sign plate: run-colored square with stage number, title, one line, a tick per task.
- Task row: checkbox (green when done), title, one quiet line of detail, owner chip. The deadline is shown
  once on the group, not repeated on every task (the owner's picker stays quiet until changed).
- Buttons: primary = slate fill; secondary = border; quiet = text. All show a 2px run-blue focus ring.
- Touch targets ≥ 40px on phones.

## Motion
Only the scroll scenes move, and only when scrolled. Everything else moves only in answer to an action.
`prefers-reduced-motion` turns all of it off.

## Never
Eyebrow labels with dots, `01/02/03` on things that aren't a sequence, cartoon skiers, a separate story
mode, frosted cards, falling snow, gold accents.
