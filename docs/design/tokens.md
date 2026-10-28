# Colour roles

Components use only these roles, as Tailwind utilities (`bg-surface`, `text-fg-muted`, `ring-rule`…). Each role reads one `--scheme-*` slot ([schemes.md](schemes.md#the-contract)), so a scheme changes every screen without touching a component. Defined in `src/design/theme.css`.

## Neutrals

| Role | Slot | Use |
|---|---|---|
| `bg` | page | the page behind the cards; normally a step darker than `surface`, so cards need no border |
| `surface` | card | cards, menus, dialogs, the chosen segment of a segmented control |
| `surface-2` | fill | filled panels inside a card, secondary buttons, selected choices, notice boxes |
| `surface-3` | line | hover on `surface-2`, the empty track of a chart ring |
| `stripe` | stripe | even rows of tables and lists |
| `tint` | tint | hover on anything clickable that isn't filled: rows, list and menu items, ghost and icon buttons, clickable cards. A faint tint of the neutrals' own hue (OKLCH L ≈ 0.97, C ≈ 0.02), not grey |
| `track` | track | the track of segmented controls; a light shade of the header's hue (L ≈ 0.90) |
| `rule` | rule | the 1 px hairline edge of cards, small dividers in menus and setting rows |
| `line` | line | stronger dividers, chart gridlines, the edge of disabled fields |
| `line-strong` | muted | hover borders |
| `field` | field | the faint fill inside fields |
| `input` | edge | the 2 px edge of fields, 3:1 on `field` |
| `fg`, `title` | ink | text and headings |
| `fg-muted`, `fg-subtle`, `fg-faint` | muted | secondary text, hints, captions, icons. One slot today, three names so a scheme can split them later |
| `scrim` | ink (dark: page) | behind modals, at 50 % |

## Accent

| Role | Slot | Use |
|---|---|---|
| `accent`, `accent-fg` | action, on-action | primary buttons and solid fills, with text on them |
| `accent-deep` | action-deep | hover on accent fills, one step darker |
| `link` | link | the accent as text or a thin line: links, text actions, selected edges, focus, checkboxes. A darker step whenever the action colour is below 4.5:1 on the page |
| `feature-fg` | on-feature | text on the feature block ([components.md](components.md#feature-block)) |

## Chrome

| Role | Slot | Use |
|---|---|---|
| `header`, `header-fg`, `header-muted` | header, on-header, on-header-muted | the app bar, its text, its secondary text and inactive tabs |
| `header-active` | header-active | the current tab; normally the page colour, so the tab runs into the page |
| `header-hover` | header-hover | a tab or a header button under the pointer |
| `footer`, `footer-deep`, `footer-fg`, `footer-muted` | footer, footer-deep, on-footer, on-footer-muted | the footer (a slight gradient from `footer` to `footer-deep`) and its text |
| `brand`, `brand-fg`, `brand-dot` | brand, on-brand, brand-dot | the logo's three parts; inside `.on-inverse` (an area that stays dark in both modes) they switch to the `*-inverse` slots |

## Status and data

| Role | Slot | Use |
|---|---|---|
| `danger`, `danger-fg` | danger, on-danger | errors and delete, as text or a solid chip. Rare, so it stands out |
| `warning`, `warning-chip`, `warning-chip-fg` | warning, warning-chip | things that need attention (overdue, missing data). Always with a word |
| `success`, `success-chip` | success, success-chip | short confirmations and a finished state |
| `series-1`, `series-2` | series-1, series-2 | two chart series (this period, the one before), told apart by lightness |
| `cat-1` … `cat-3` | cat-1 … cat-3 | parts of one whole (a donut). Shades of the series colour unless a scheme records otherwise |

## State rules

- A filled control hovers to its deep step (`accent` → `accent-deep`) or to `/90`.
- Rows, list and menu items, ghost and icon buttons hover to `tint`.
- Secondary (neutral filled) buttons hover one step: `surface-2` → `surface-3`.
- Outlined controls (fields, choices) darken the border to `line-strong` on hover.
- Selected is `surface-2` with a 2 px `link` edge.
- Focus is a `link` edge (fields) or a 2 px `link` outline with a 2 px offset (everything else).
- Disabled is `opacity-50`; a disabled field is `surface` with a `line` edge and muted text.
- No translucent surfaces. Only these state effects and the scrim are translucent.

## Contrast

Every text role reaches 4.5:1 on the surfaces it sits on, field edges and `series-1` reach 3:1, in light and dark. The exact pairs are `PAIRS` in `src/design/contrast.ts`; the test fails a scheme that misses one. When a new role pair appears in the UI (text on a new surface), add it to `PAIRS` first.

Dark mode sets `color-scheme: dark`, so native controls (date pickers, scrollbars) match.
