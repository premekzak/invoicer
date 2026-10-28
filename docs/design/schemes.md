# Colour schemes

A scheme is one CSS file in `src/design/schemes/` that gives every slot of the contract a value, in light and dark. Components never change; the roles in [tokens.md](tokens.md) read the slots.

```css
@layer base {
  :root[data-scheme="neon"] { --scheme-page: #f3f3f3; --scheme-card: #ffffff; … }
  :root.dark[data-scheme="neon"] { … }
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
| `ink` | `fg`, `title`, `scrim` | 4.5 on page, card, fill, stripe, tint, track, header-active |
| `tint` | `tint` | |
| `track` | `track` | |
| `action`, `on-action`, `action-deep` | `accent`, `accent-fg`, `accent-deep` | on-action 4.5 on action and action-deep |
| `link` | `link` | 4.5 on page, card, fill |
| `on-feature` | `feature-fg` | 4.5 on every colour of the feature motif, or on `action` without one |
| `danger`, `on-danger` | `danger`, `danger-fg` | danger 4.5 on page and card; on-danger 4.5 on danger |
| `warning`, `warning-chip` | `warning`, `warning-chip`, `warning-chip-fg` | warning 4.5 on page, card, fill, warning-chip |
| `success`, `success-chip` | `success`, `success-chip` | success 4.5 on card and success-chip |
| `series-1`, `series-2` | `series-1`, `series-2` | series-1 3 on card; series-2 is a pale companion, exempt |
| `cat-1` … `cat-3` | `cat-1` … `cat-3` | none: every part also has a labelled row |
| `brand`, `on-brand`, `brand-dot` | `brand`, `brand-fg`, `brand-dot` | |
| `brand-inverse`, `on-brand-inverse`, `brand-dot-inverse` | the brand roles inside `.on-inverse` | |
| `header`, `on-header`, `on-header-muted` | `header`, `header-fg`, `header-muted` | both 4.5 on header, and on every colour of the header motif |
| `header-active`, `header-hover` | `header-active`, `header-hover` | |
| `footer`, `footer-deep`, `on-footer`, `on-footer-muted` | the footer roles | both texts 4.5 on footer and footer-deep |

### Motifs (optional)

| Variable | Effect |
|---|---|
| `--scheme-header-image` (+ `-repeat`, `-position`, `-size`) | paints the header (`.scheme-header`): a gradient, or a 2 px line along its bottom |
| `--scheme-header-pad` | a strip under the header row, so a motif along the bottom edge isn't hidden; the current tab reaches down through it |
| `--scheme-tab-edge` | a box-shadow that outlines the current tab, for a header the same colour as the page |
| `--scheme-feature-image`, `--scheme-feature-image-hover` | paints the feature block (`.scheme-feature`) |
| `--scheme-footer-image` | replaces the footer's default `footer` → `footer-deep` gradient |

Text on a motif must reach 4.5:1 at every point. The test checks every hex colour of a gradient; a motif with transparent parts (a line) isn't checked.

## Making a scheme

1. **Brief.** Put a brief in `schemes/<name>/zadani.md` and any reference images next to it. Only the brief is committed: images may be under copyright.
2. **Structure first.** Decide the shares before the hues: how much of the page is white, grey, dark and accent; where the dark sits (header, feature block, footer, buttons); how the greys step (even, deep, none, cool). Two schemes that differ only in hue look alike. Build variants that differ in structure, the shares of colour and the greys. The owner, 2026-10-22: "liší se vlastně jen základní barvou" ("they really differ only in the base colour").
3. **Build the ramp in OKLCH:** neutrals in one hue at low chroma (C ≤ 0.035, or 0 for pure greys), lightness steps for page, card, stripe, fill, rule, line; `tint` at L ≈ 0.97 C ≈ 0.02 in the neutrals' hue; `track` at L ≈ 0.90 in the header's hue.
4. **One accent.** If it is too light for text (neon, cyan, amber), give it a dark label (`on-action`) and a darker `link`. Keep status hues apart from the accent (move success or warning away from it) and status chips pale (C ≤ 0.03).
5. **Gradients only from dark to slightly darker** in the same hue (about 0.03 L, top to bottom), on dark areas only: header, feature block, footer. Light areas and buttons stay flat. The owner, 2026-10-26: "jen z tmavé do ještě tmavší. Světlé gradienty nejsou hezké" ("only from dark to darker; light gradients aren't nice"); 0.09 L was too strong. Also:
   - **Headers are the safest place** for a gradient ([Designmodo](https://designmodo.com/gradients/), read 2026-10-28). That source also shows gradients on whole pages, sections and nav hovers, but as trends for marketing sites, not for an app.
   - **Keep the flat colour underneath** (`background-color` set to the gradient's first step), so the area still has its colour and contrast if the image doesn't paint ([Designmodo]).
   - **No gradient text, and no moving or scroll-following gradients.** Designmodo calls gradient text imperfect and leaves motion to agencies and portfolios: "design aesthetics should never come before the user experience."
6. **Dark header:** set `header-hover` to a shade of the header, because half the page colour (the default) only works on a light header. **White header the colour of the page:** draw a line with `--scheme-header-image` and outline the current tab with `--scheme-tab-edge`, or the tab vanishes.
7. **Dark mode** is designed, not inverted: near-black neutrals with lighter cards, softer accents so they don't vibrate.
8. **Check.** `npx vitest run src/design` (every slot, every pair). Then look at it in the app on real content, light and dark, before wiring it in.
9. **Wire it in** (app side): import the file in the app's CSS and add it to the app's list of schemes with a name in every language (Invojka: [../ui.md](../ui.md#schemes-in-the-app)).

**Never rename or remove a scheme id without a fallback:** the id is saved in the user's data. The app should turn an unknown saved id into the default rather than fail.

### Recorded exceptions

So nobody "fixes" them:
- A light accent (neon, cyan, amber, mandarin) has no 3:1 edge on white; its dark label carries it, as for any light-fill action.
- A white scheme's page may equal its cards (Křída, Lilek); the cards' `rule` ring parts them.
- `cat-1` … `cat-3` and `series-2` may be below 3:1; the values are always labelled, and charts have a table view.

## The schemes

| Id | Name | Structure | Light | Dark |
|---|---|---|---|---|
| `warm` | Teplý papír | the default; one hue family | a faintly cream page, white cards, warm greys, espresso ink; a flat peach header; burnt-orange buttons with white text, a darker orange `link`; charts orange and pale peach; ochre warnings, crimson errors; an espresso footer | a warm near-black, an espresso header |
| `neon` | Neon | lime + black, the base shares (≈ 70 % white and light grey, 20 % black, 10 % neon) | a light grey page (L 0.965), white cards, four even grey steps; black header and footer; neon lime feature block and buttons with black text; charts black and lime | near-black greys, neon fills |
| `grafit` | Grafit | greys carry it, neon under 2 % | a mid-grey page (L 0.91), white cards, a deep ramp; graphite header, footer and feature block (L 0.30) with neon text; neon only on buttons and the logo; charts in greys only | lighter grey steps (page 0.20, cards 0.26) |
| `vyboj` | Výboj | neon at its largest (≈ 30 %) | a neon header and footer with black text, a neon track and hover; black feature block and buttons with neon text; charts black and lime | keeps the neon header and footer |
| `krida` | Křída | almost all white, neon under 3 % | white page, cards and header, the header ruled off by a 2 px ink line (the current tab breaks it); a black footer; neon buttons and feature block; charts black and light grey | flat: page = cards, parted by the ring |
| `ocel` | Ocel | Neon's shares, cool greys | every grey, the ink and the chrome blue-grey (hue 250); neon feature block and buttons; charts steel and lime | cool near-black greys |
| `pulnoc` | Půlnoc | dark band, bright fill | navy header, footer and feature block, each a gentle gradient (L 0.31 falling 0.03); bright cyan buttons with navy text; a cool pale page; charts navy and cyan | a darker navy band, cyan fills |
| `les` | Les | dark band, bright feature block | forest header and footer (gradient from L 0.33); a flat amber feature block and buttons with forest text; a warm off-white page; charts forest and pale amber | a darker forest band, amber fills |
| `bordo` | Bordó | one hue, no light fill | claret header, footer, feature block (gradients from L 0.34) and claret buttons, all with white text; a pale warm-grey page, claret ink; charts in claret shades | pink-claret buttons with dark text |
| `uhel` | Uhel | deep grey page + mandarin | a deep warm-grey page (L 0.905) under white cards; warm charcoal header, footer and feature block (gradient from L 0.30); mandarin buttons with black text; charts charcoal and mandarin | mandarin fills |
| `lilek` | Lilek | light chrome, dark content | a white header ruled off by a 2 px aubergine line, page = cards; an aubergine feature block and footer (gradient from L 0.38) and aubergine buttons with white text; charts aubergine and pale lavender | flat near-black, lavender line and fills |

The Neon family (Neon, Grafit, Výboj, Křída, Ocel) shares one lime (OKLCH 0.9 / 0.21 / 128, black text 4.8:1) and one black; links and focus are a dark green step (L ≈ 0.5), success moves to hue 165 and warning to 65, away from the lime. The history of earlier rounds and why they were removed is in [../decisions.md](../decisions.md) (2026-10-21, 22 and 26).
