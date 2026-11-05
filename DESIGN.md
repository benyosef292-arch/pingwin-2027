# DESIGN.md · Penguin Val Thorens 2027 team site

Internal work site for four Penguin reps and the office. Job: know what's mine, what's next, and by when.
Based on the site's own history and Ben's feedback (not on UXKIN examples).
Ben's taste: order and uniformity, checkboxes on the right, few words. No white, no muddy green; matte, varied colors.

The CSS is built in layers; a later `<style>` overrides an earlier one. The look on screen today comes from
the last layers: `style#mood` (tokens), `style#hues` (per-tab colors), `style#sidenav`, `style#glass`.
The older tokens below (`--snow`, `--panel`, ...) are still defined and still feed components that the
`#mood` layer re-maps.

## Themes
Sun/moon button in the top bar (`#themeBtn`, added by `script#moodjs`) switches `html[data-theme]` between
dark (default) and light. The choice is saved per browser (`localStorage penguin-theme`) and applied in `<head>` before paint.

**Dark: night in the mountains.** Dark glass over a darkened season photo.
Cards `--m-glass` rgba(22,32,42,.74), side menu rgba(14,22,30,.82), inner surfaces `--m-fill` rgba(38,50,62,.82),
top bar rgba(9,14,20,.86). Ink #E8EDF1, muted #A9B5BF, lines rgba(255,255,255,.12). Tokens in `style#mood`.
`script#moodjs` turns leftover light surfaces dark, makes pastel badges solid, and re-inks dark text on dark surfaces
(colored text is lightened 55% toward white), so older components follow without rewrites.

**Light: soft snow.** Glass rgba(242,245,247,.86), fill rgba(234,239,243,.92), ink #1C2C37, muted #4A5B67.

## Five hues
One per tab (header band, badge, bar, menu icon) and rotating on task columns. `style#hues`.

| Hue | Dark theme | Light theme (white text on it) |
|---|---|---|
| moss | #9CBF88 | #4E6B40 |
| lake | #8DB4D6 | #3A6386 |
| clay | #E0A285 | #9A5136 |
| ochre | #E2BF78 | #85621C |
| heather | #C3A5D0 | #6D4B6B |

In the dark theme text on a hue stays ink.

## Glass and side menu
A season photo (`--bg1`) is fixed behind the board. Top bar, side menu and cards are glass over it (blur 22px, light rim).
Text always sits on glass, never on the bare photo. Floating dialogs and menus use `--glass-strong`.
`prefers-reduced-transparency` turns the glass solid. CSS in `style#glass`; `script#moodjs` marks leftover white cards at runtime (`.gl`).
Tabs live in a right side menu (≥1024px) or a drawer opened from the current-tab bar (smaller): `style#sidenav`.

## Base tokens (older layers)

| Token | Value | Role |
|---|---|---|
| `--slate` | #1C2C37 | text, dark scenes' base |
| `--muted` | #536572 | secondary text |
| `--hair` | #D3DCE2 | borders |
| `--run-blue` | #1858C4 | open / active / links / focus |
| `--run-red` | #C62A30 | due, overdue |
| `--run-green` | #1F8A55 | done, only done |
| `--marker` | #EE8418 | today, next (fills only; text uses `--marker-ink` #A4520A) |
| `--glow` | #F6C38B | the one warm tint on the dark photo scenes |

People colors, chosen so none reads as a status color:
בן #6941C6 · יותם #0E7490 · דורון #8B5A2B · קרן #B42370 · כולם #475966 · פתוח #8A6100.
People chips: tinted background, text in the person's color.

Calendar event colors (white text ≥4.5:1): ספקים #A35F00, לקוחות #C0392B, שבועות העונה #0B7A71, ואקאנס #66727E.

## Typography
Noto Sans Hebrew for everything (`--fd`, `--fb`), IBM Plex Sans Hebrew as fallback. 400/500/600/700,
tabular numbers for dates and counts. Frank Ruhl Libre (`--f-serif`) only for the hero and scene titles.
Text floor 12px for chips, counters and field labels. Body 14.5–16px, lines under 75ch.

## Spacing and shape
4px base: 4 8 12 16 20 24 32 40 56. Content width 1160px.
Radius: panels 8–10px, chips/rows 6px, people pills round.

## Components
- Tab header: hue band, stage number, title, one line, a tick per task.
- Task row: checkbox on the right (green when done), title, one quiet line of detail, owner chip.
  The deadline is shown once on the group, not on every task.
- Checkboxes: one box everywhere (tasks, open questions), 20px (24px on touch), border #7A8B98.
- Buttons: primary = filled; secondary = border; quiet = text. One focus ring: 2px run-blue.
- Touch targets ≥ 40px on phones. Footer is one line.
- Warehouse (`style#inv`, doc `inv`): one row per item (name, quantity with − / + when it is a plain number, note).
  Owner site is fixed in the seed. Items of other sites get an orange edge and a handover card per site at the top.

## Motion
Only the scroll scenes on the overview move, and only when scrolled. Everything else moves only in answer to an action.
`prefers-reduced-motion` turns all of it off.

## Never
Eyebrow labels with dots, `01/02/03` on things that aren't a sequence, cartoon skiers, a separate story
mode, falling snow (deck snow removed, Ben 5.11.26), gold accents, white or muddy-green surfaces.

## Removed (do not bring back without Ben)
Gondola scene "מוכנים לעלות", the suppliers tab (mail buttons are in אנשי קשר), the "my tasks" panel on the overview
(who-am-I is only in the top bar).
