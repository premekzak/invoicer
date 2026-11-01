# Colour schemes

A scheme is one CSS file in `src/design/schemes/` that gives every slot of the contract a value, in light and dark. Components never change; the roles in [tokens.md](tokens.md) read the slots.

```css
@layer base {
  :root[data-scheme="zl-uredni"] { --scheme-page: #f6efd6; --scheme-card: #ffffff; … }
  :root.dark[data-scheme="zl-uredni"] { … }
}
```

The default scheme (`warm.css`) uses `:root:where(:not([data-scheme]), [data-scheme="warm"])`, so it applies with no attribute at all and never competes with another scheme's selectors.

## The contract

Every slot is required in both modes (`SLOTS` in `src/design/contrast.ts`; the test lists any that are missing). The contrast column is what the test checks (`PAIRS`); 4.5 is text, 3 is a field edge or a chart mark.

| Slot | Role | Must reach |
|---|---|---|
| `page` | `bg` | |
| `card` | `surface` | |
| `stripe` | `stripe` | |
| `fill` | `surface-2` | |
| `rule` | `rule` | |
| `line` | `line`, `surface-3` | |
| `field` | `field` | |
| `edge` | `input` | 3 on field |
| `muted` | `fg-muted`, `fg-subtle`, `fg-faint`, `line-strong` | 4.5 on page, card, fill, stripe, tint, track, line |
| `ink` | `fg`, `title`, `scrim` | 4.5 on page, card, fill, stripe, tint, track |
| `tint` | `tint` | 1.1 on card and 1.05 on stripe (not text: a hovered row must show) |
| `track` | `track` | |
| `action`, `on-action`, `action-deep` | `accent`, `accent-fg`, `accent-deep` | on-action 4.5 on action and action-deep |
| `link` | `link` | 4.5 on page, card, fill |
| `on-feature` | `feature-fg` | 4.5 on every colour of the feature motif, or on `action` without one |
| `danger`, `on-danger` | `danger`, `danger-fg` | danger 4.5 on page and card; on-danger 4.5 on danger |
| `warning`, `warning-chip` | `warning`, `warning-chip`, `warning-chip-fg` | warning 4.5 on page, card, fill, warning-chip |
| `success`, `success-chip` | `success`, `success-chip` | success 4.5 on card and success-chip |
| `series-1`, `series-2` | `series-1`, `series-2` | series-1 3 on card; series-2 is a pale companion, exempt |
| `cat-1` … `cat-3` | `cat-1` … `cat-3` | none: every part also has a labelled row |
| `brand`, `on-brand`, `brand-dot` | `brand`, `brand-fg`, `brand-dot` | brand 3 on header |
| `brand-inverse`, `on-brand-inverse`, `brand-dot-inverse` | the brand roles inside `.on-inverse` | brand-inverse 3 on footer |
| `header`, `on-header`, `on-header-muted` | `header`, `header-fg`, `header-muted` | both 4.5 on header, and on every colour of the header motif |
| `header-active`, `header-hover` | `header-active`, `header-hover` | |
| `footer`, `footer-deep`, `on-footer`, `on-footer-muted` | the footer roles | both texts 4.5 on footer and footer-deep |

### Motifs (optional)

| Variable | Effect |
|---|---|
| `--scheme-header-image` (+ `-repeat`, `-position`, `-size`) | paints the header (`.scheme-header`); unused while the header is the page colour |
| `--scheme-header-pad` | a strip under the header row, so a motif along the bottom edge isn't hidden |
| `--scheme-feature-image`, `--scheme-feature-image-hover` | paints the feature block (`.scheme-feature`) |
| `--scheme-footer-image` | replaces the footer's default `footer` → `footer-deep` gradient |

Text on a motif must reach 4.5:1 at every point. The test checks every hex colour of a gradient; a motif with transparent parts (a line) isn't checked.

## Making a scheme

1. **Brief.** Put a brief in `schemes/<name>/zadani.md` and any reference images next to it. Only the brief is committed: images may be under copyright.
2. **Structure first.** Decide the shares before the hues: how much of the page is white, grey, dark and accent; where the dark sits (header, feature block, footer, buttons); how the greys step (even, deep, none, cool). Two schemes that differ only in hue look alike. Build variants that differ in structure, the shares of colour and the greys. The owner, 2026-10-22: "liší se vlastně jen základní barvou" ("they really differ only in the base colour").
3. **Build the ramp in OKLCH:** neutrals in one hue at low chroma (C ≤ 0.035, or 0 for pure greys), the hue moving at most about 5° from ink to white and always the same way, chroma lowest at both ends, lightness steps for page, card, stripe, fill, rule, line at least about 0.02 L apart, and page and card a step apart so a box isn't held up by its ring alone (Radix, IBM Carbon, Matthew Ström, read 2026-10-31; the `ui` skill's colour page has the sources); `tint` at L ≈ 0.97 C ≈ 0.02 in the neutrals' hue; `track` at L ≈ 0.90 in the header's hue.
4. **One accent.** If it is too light for text (neon, cyan, amber), give it a dark label (`on-action`) and a darker `link`. Keep status hues apart from the accent (move success or warning away from it) and status chips pale (C ≤ 0.03).
5. **Gradients diagonal and barely visible:** 135° (top left to bottom right), falling about 0.025 L in the same hue, on dark areas only: header, feature block, footer. Light areas, light tiles and buttons stay flat. The owner, 2026-10-26: "jen z tmavé do ještě tmavší. Světlé gradienty nejsou hezké" (0.09 L was too strong); 2026-11-01: "gradienty spíše přes uhlopříčku než zhora dolů, ale velmi jemné, aby skoro nebyly poznat". Also:
   - **Headers are the safest place** for a gradient ([Designmodo](https://designmodo.com/gradients/), read 2026-10-28). That source also shows gradients on whole pages, sections and nav hovers, but as trends for marketing sites, not for an app.
   - **Keep the flat colour underneath** (`background-color` set to the gradient's first step), so the area still has its colour and contrast if the image doesn't paint ([Designmodo]).
   - **No gradient text, and no moving or scroll-following gradients.** Designmodo calls gradient text imperfect and leaves motion to agencies and portfolios: "design aesthetics should never come before the user experience."
6. **Header = page by default:** set `header` to the page, `on-header` to the ink, `on-header-muted` to the muted grey, `header-hover` to the fill and `header-active` (the fill of the current page link) to `track`; check that it stands out from the page. **A coloured bar** is allowed when the scheme is built around it: then `header-active` is a step of the bar's own hue (lighter on a light bar, lighter on a dark one too), and `on-header` must reach 4.5 on `header`, `header-active` and `header-hover`.
7. **Dark mode** is designed, not inverted: near-black neutrals with lighter cards, softer accents so they don't vibrate.
8. **Check.** `npx vitest run src/design` (every slot, every pair). Then look at it in the app on real content, light and dark, before wiring it in.
9. **Wire it in** (app side): import the file in the app's CSS and add it to the app's list of schemes with a name in every language (Invojka: [../ui.md](../ui.md#schemes-in-the-app)).

**Never rename or remove a scheme id without a fallback:** the id is saved in the user's data. The app should turn an unknown saved id into the default rather than fail.

### Recorded exceptions

So nobody "fixes" them:
- A light accent (neon, cyan, amber, mandarin) has no 3:1 edge on white; its dark label carries it, as for any light-fill action.
- A white scheme's page may equal its cards; the cards' `rule` ring parts them.
- `cat-1` … `cat-3` and `series-2` may be below 3:1; the values are always labelled, and charts have a table view.
- **A scheme may break a rule on purpose** (the owner, 2026-10-31: "občas můžeš nějaké pravidlo porušit, když k tomu budeš mít důvod"). Its file then says, under "RULE BROKEN", which rule and why, and contrast still passes. None of the current schemes does.

## The schemes

**Protokol is the default since 2026-11-01.** On a blue bar the logo is a white square with blue letters; the tests check `brand` against `header` and `brand-inverse` against `footer` at 3:1. **On 2026-11-01 the owner kept only Warm paper and Úřední** and the rest are its variations: a CSS blue `#0000ff` bar with white text over a paper page and white cards, blue buttons and links, a pale blue row hover (the owner: "hover u tabulek může být modrý"). They differ in the paper (tone, lightness, chroma, ruling), the footer (paper or blue) and the tile. The "Nová faktura" tile is light and quiet, flat: a pale blue with blue text or a paper shade with ink text, never black or vivid (the owner: black "je to hrozně výrazné"). `#0000ff` is used exactly in light mode (white text 8.6:1); in dark mode text, buttons and charts take a lighter step of its hue (L 0.70) and the tile a dim blue a step above the cards. The blue bar and footer carry a 135° gradient falling 0.025 L, barely visible (rule 5).

| Id | Name | Structure | Light | Dark |
|---|---|---|---|---|
| `warm` | Teplý papír | the default; one hue family | a white page and header, white cards, warm greys, espresso ink; burnt-orange buttons with white text, a darker orange `link`; charts orange and pale peach; ochre warnings, crimson errors; an espresso footer and a pale apricot "new" tile with espresso text | a warm near-black, an espresso header |
| `zl-uredni` | Úřední | the base | a #0000ff bar with white text over a yellowed paper (C 0.034, h 90); a pale blue tile with blue text, a darker yellowed footer | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-formular` | Formulář | framed in blue | a paler ivory paper; a tile a step darker than the paper with ink text; a #0000ff footer | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-kolek` | Kolek | grey paper, a blue footer | a grey-beige recycled paper; a pale blue tile, a #0000ff footer | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-spis` | Spis | a deep folder paper, a light sheet | a manila-folder paper (L 0.93, C 0.05); a tile lighter than the page (a cream sheet) with ink text | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-obalka` | Obálka | paper in the blue's hue | a blue-grey envelope paper (h 250); a pale blue tile, a #0000ff footer | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-protokol` | Protokol | blue ruling | the yellowed paper with pale blue box rules and lines as on a printed form; a pale blue tile | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-archiv` | Archiv | a deeper yellow, a blue footer | an older yellow paper (L 0.935, C 0.045); a pale yellow tile lighter than the page; a #0000ff footer | warm near-black greys, a deep blue bar, lighter blue actions |
| `ur-svetla` | Světlá lišta | the quietest bar | a pale blue bar with #0000ff text instead of a solid one; a tile a step darker than the paper | warm near-black greys, a deep blue bar, lighter blue actions |
