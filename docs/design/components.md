# Components and layout

Patterns built on the roles in [tokens.md](tokens.md) and the sizes in [typography.md](typography.md). Class names are Tailwind 4.

## Shapes

- **Small corners.** The radius scale is capped in `theme.css`: `rounded-sm` 2 px, `rounded` and `rounded-md` 3 px, `rounded-lg` 4 px, `rounded-xl` 5 px, `rounded-2xl` 6 px. Status labels use the pill radius `rounded-[12px]`; `rounded-full` only for dots and avatars.
- **No shadows.** Depth comes from the page being a step darker than the cards.
- **Few borders.** A card has a 1 px hairline drawn outside it (`ring-1 ring-rule`), so nothing inside moves. Borders stay where they do a job: fields, secondary buttons, choice cards, and things floating over content (menus, pickers, tooltips).
- **One gradient by default,** on the footer. Schemes may add dark-to-darker motifs ([schemes.md](schemes.md#motifs-optional)).

## Boxes

- **The title goes above the box, never inside it.** A `<section>` holds an `h2` (section title) and then the box. Actions for the whole box sit at the right end of the title row. One title may cover a group of boxes.
- **The box holds content only:** fields, rows, a chart. A chart's legend and table toggle are content.
- **No bordered box inside a box.** A group inside a card is a filled panel: `rounded-lg bg-surface-2 p-4`.
- A box without a title is fine when its fields label themselves.

## Spacing

| What | Value |
|---|---|
| Page | `px-8 pt-12 pb-8`, content `max-w-6xl` centred; 16 px sides on phones |
| Between sections | 40 px (`space-y-10`) |
| Between boxes in a group | 20 px (`gap-5`, `space-y-5`) |
| Between side-by-side columns | 24 px (`gap-6`) |
| Title to its box | 12 px (`mb-3`) |
| Inside a content box | `px-6 py-5` |
| List boxes | no padding; rows and edge cells use `px-6`, so text lines up with the box edge |
| Dialogs | header, body and footer at 24 px; standalone centred screens (welcome, errors) `p-8` |

## Header

- A full-width band (`header`, optionally painted by `.scheme-header`), one row 48 px tall (`h-12`): logo and wordmark on the left, the pages as tabs in the middle, account or context on the right. All three fill the band's height and share one middle line.
- **Tabs** are square blocks, `px-4 text-sm`, no gap between them, in `font-nav` 500 with +0.02em tracking. Inactive: `header-muted`, hover `header-hover`. The current tab is `header-active` with `fg` text, from the top of the band down into the page, marked with `aria-current="page"`, the same weight as the rest.
- **Status in the header:** status colours rarely reach 4.5:1 on a tinted band, so show state as an icon in `header-fg` with a tooltip, and an error as a solid `danger` chip with words. Never an icon alone for an error.
- **Phones (below 768 px):** the header keeps one row with the logo, the context and a menu button; the button opens the pages as a list under the header (`surface`, current page `surface-2`); a page change or Escape closes it.

## Footer

`.scheme-footer` with `footer-fg` text, `mt-16`, as wide as the page, at the bottom of short pages too (the layout is a full-height column). Wrap it in `.on-inverse`, so the logo takes its inverse colours.

## Feature block

The one large call to action on a start screen: a solid `accent` block (`.scheme-feature`, hover `accent-deep`), `rounded-2xl px-6 py-5`, a large icon, the name at 18 px semibold and a one-line hint, text in `feature-fg`. One per screen. A scheme can paint it with a motif.

## Buttons

| Variant | Classes |
|---|---|
| primary | `bg-accent text-accent-fg hover:bg-accent-deep` |
| secondary | `bg-surface-2 text-fg border border-line hover:bg-surface-3` |
| ghost | `text-fg-muted hover:bg-tint hover:text-fg` |
| danger | `bg-danger text-danger-fg hover:bg-danger/90` |

Sizes `h-8 px-3`, `h-10 px-4`, `h-12 px-6`, all 14 px 500, `rounded-lg`, `whitespace-nowrap`, focus `outline-2 outline-offset-2 outline-link`. Flat, never a gradient.

**Order in a row:** the main action first, then secondary ones, then Delete or Archive, then a "more" menu; the group sits at the right of the title row and wraps as a whole (`flex-wrap`).

**Back button** on detail screens: a 40 px secondary icon button; from 1280 px up it hangs in the margin left of the title (`xl:absolute xl:right-full`), so the title lines up with the box below.

## Forms

- **Field box:** the `.control` class (inputs, selects, text areas, affix groups, pickers): `field` fill, an even 2 px `input` edge, hover `line-strong`, focus `link`, error `danger`, disabled `surface` with a `line` edge. Height 40 px (`h-10 px-3`). Selects draw their own chevron (`.control-select`).
- **Labels** above the field in 14 px 500 `fg`; a hint or an error under it (error: 12 px 500 `danger` with an alert icon). Wire `id`, `aria-describedby` and `aria-invalid`.
- **Required** fields get `*` in `fg-muted`; optional ones are not marked.
- **Units** sit inside the field (an affix), not in the label.
- **Saving with mistakes:** save buttons stay enabled (disabled only when nothing changed). Pressing one shows the errors and focuses the first wrong field; with more than one error an error summary sits above the form, its items buttons that focus the field. An error appears after a save attempt or after leaving the field, and goes as soon as the value is right.
- **Choices** are cards with `role="radio"` in a `role="radiogroup"`: `border-line`, hover `line-strong`, selected `surface-2` with a 2 px `link` edge.
- **Setting rows:** title and a one-line hint on the left (`max-w-prose`), the control on the right (`sm:w-56`), rows in one card divided by `rule`.

## Tables and lists

- **Soft stripes, no row lines:** even rows `stripe`, hover `tint`. The header row is 12 px `fg-muted` labels on the card, no fill and no line under it.
- Amounts, quantities and dates right-aligned with `tabular-nums`, their headers too; text and codes left-aligned.
- No empty trailing column: a row action sits in the last cell, shown on hover and on keyboard focus.
- A summary (count, total) closes the table as its last row, under the column it sums.
- On phones tables keep a minimum width (36 rem) and scroll sideways inside their box; the page itself never scrolls sideways.

## Status labels

One style for every state: a soft label (`rounded-[12px] px-2.5 py-0.5 text-xs font-medium`) with a 6 px dot and the word. Neutral states on `surface-2` (a hollow dot for a draft, a `line-strong` dot when active, struck through when cancelled), attention on `warning-chip` with `warning` text, done on `success-chip` with `success` text. Labels aren't clickable, so none uses the accent. The word always says it, so grayscale and colour blindness are fine.

## Segmented controls and filters

- A `track` with the chosen segment in `surface`; used for tabs inside a page and view switches. Settings-like tabs span the full width and share it evenly (`px-4 py-2`).
- **Quiet filters** in a list: one row, 32 px tall, of a search, status tabs as text with counts (the chosen one `fg` with a 2 px `link` underline) and a select at the right end. Hide a status with nothing in it unless it is chosen; hide the whole row of tabs when only one status exists.

## Links

Text links are underlined (`underline underline-offset-2 decoration-line-strong`, darker on hover), so colour alone doesn't mark them.

## Charts

- Hand-built SVG. Columns at most 24 px wide, a 2 px rounded top, square at the baseline, 2 px gaps; light 1 px gridlines in `line`, the baseline in `fg-subtle`.
- Two series: `series-1` (this period) and `series-2` (the one before), told apart by lightness. A legend only with two or more series.
- Selective value labels (the best and the current period), a tooltip per band with the whole band as the hover target, and a **table view** with the exact values.
- An incomplete period (this month) has a 45° striped texture and says "so far" in its tooltip; future periods have no bar, not a zero.
- Parts of a whole (a donut): `cat-1` … `cat-3` with 2 px gaps, the remainder as the bare `surface-3` track, each part also in a labelled row with its value.
- Chart text is 12 px.

## Motion

Short rise on page and section entry (`animate-rise`, 0.35 s). No page reloads.

## Modals and floating things

Menus and pickers float on `surface` with a `line` border and no shadow; Escape or a click outside closes them. Modals sit on the `scrim` at 50 %; in React render them through a portal to `document.body`, because an animated (transformed) ancestor traps `position: fixed`.

## Phones

Below 768 px: a grid marked `mobile-stack` becomes one column; column headers above form rows hide; pages use 16 px sides. Check every screen at 390 px for sideways scroll.
