# Typography

Rules for type in an app interface: forms, tables, dashboards and short help text, not long-form reading. Sources are listed at the end; where they disagree, the choice made here is stated.

UI text is mostly isolated words (labels, buttons, column headers). We read an isolated word more slowly than the same word in a sentence, because the eye can't skip ahead, so every letter has to be recognised. That is why the typeface and its spacing matter more in an interface than in an article ([UI]).

## Five sizes

Only 36, 24, 18, 14 and 12 px. Don't add a sixth; pick the role instead. This is the classic typographic scale (12, 14, 18, 24, 36) that Bringhurst-derived guides use for the web ([WT] 3.1.1): a modest set of related intervals, not a computed ratio. `body` is `text-sm`, so text without a size class is body text, never the browser's 16 px.

| Size | Role | Classes | Line height | Use |
|---|---|---|---|---|
| 36 px | Page title | `font-display text-4xl leading-[1.2] font-bold tracking-[-0.01em]` | 1.2 | the `h1` of each screen |
| 24 px | Section title | `font-display text-2xl font-bold mb-3` | 1.33 (32 px) | the title above a box ([components.md](components.md#boxes)) |
| 24 px | Big number | `text-2xl font-semibold tabular-nums` | 1.33 | key figures |
| 18 px | Lead | `text-lg` | 1.56 (28 px) | a summary sentence, a total, the wordmark |
| 14 px | Body | `text-sm`, 400; 500 for titles inside cards, buttons and field labels | 1.43 (20 px) | default text, every button size |
| 12 px | Label and caption | `text-xs`, 500 or 400 | 1.33 (16 px) | hints, secondary lines, status labels, table headers, chart text |

- **Sizes are rem in code** (Tailwind's `text-sm` is 0.875rem), so they follow the user's browser font size and zoom. The px values are for talking about them. Never set a size in px, and never assume the root is 16 px ([ME], [GF]).
- **Body at 14 px is a soft rule, the default for dense screens** (forms, tables, lists). Most sources ask for 15–20 px or more, but for running text on content sites ([PT], [MI], [NT]); for interfaces 14–18 px is given as the comfortable range ([TK26]). Where a screen is mostly text meant to be *read* (onboarding, explanations, a longer help passage), use the lead size (18 px) instead, without adding a sixth size. Keep 14 px wherever text sits next to controls and data.
- **Headings stand out by size and weight.** A subhead may stay at body size and stand out by spacing and weight alone ([RA]).

## Line height

- Unitless, always (`leading-[1.2]`, never `leading-[20px]` for new styles): a fixed line height can overlap when the user enlarges text ([WT] 2.2.1, [TH]).
- Body text 1.4–1.5; the sources range from 1.2 to 1.5 and agree that longer lines need more ([PT], [CSST], [WT], [GF]). Tailwind's defaults give 1.43 for 14 px.
- Large type gets less: 1.2 at 36 px. Short display lines may go tighter as long as ascenders and descenders don't touch ([WT] 2.2.1).
- In dark mode light text on a dark ground looks bolder and tighter; a slightly larger line height (about +0.1) helps long text ([TH]). Not needed for labels.

## Spacing around text

- More space above a heading than below it, so the heading belongs to what follows ([WT] 2.2.2, [RA]). Here: 40 px between sections, 12 px from a section title to its box.
- Margins in one direction only, preferably bottom; vertical rhythm is a guide, not a pixel grid ([TH]). Spacing steps are multiples of 4 px.
- Space between letters < space between words < space between lines ([CB13]).

## Line length

- **Help text, hints and descriptions: at most 55 characters per line** (`max-w-[55ch]`). A compromise between the 35–50 suggested for UI text ([TH]) and the 65 of `max-w-prose`: short enough to take in at a glance next to a field, long enough that a two-sentence hint doesn't break into many short lines.
- Running text (a longer explanation, onboarding): 45–75 characters, about 66 ideal ([WT] 2.1.2, [TK26], [MI]); never more than about 90 ([PT], [NT]). Cap it with `max-w-prose` (65ch).
- Set widths in `ch` or `em`, not px, so the line length survives text zoom ([WT] 2.1.2, [GF]).

## Letter spacing

- **Lowercase text keeps the face's own spacing.** Tracking lowercase hampers legibility ([WT] 2.1.7, [TK26]); the exceptions are very small sizes ([CB13]) and condensed faces.
- **Large type gets slightly tighter:** −0.01em at 36 px. Sources suggest up to −0.025em ([TH], [TK26]); go no further than the face needs.
- **All caps and small caps get +0.05em to +0.1em** ([WT] 2.1.6, [PT], [TK26]). Long digit strings (codes, account numbers) may get a little too.
- Always in `em`, so tracking scales with the size ([WT] 2.1.7).
- Kerning stays on (`font-kerning: auto`, the default); turning it off makes other pairs worse ([PT], [TH], [CSST]). Don't kern by hand.

## Weights and emphasis

- Weights used: 400 body, 500 labels, buttons and card titles, 600 numbers and emphasis, 700 for display headings only.
- **With a sans-serif, emphasise with weight, not italic:** sans italics barely stand out ([PT-bi]). Never bold and italic together, never a whole paragraph in bold, never underline bold text ([PT-bi]).
- Semibold can stand in for bold in running text: easier to read, slightly less contrast ([PT-bi]).
- Heavy weights (800–900) only at large sizes ([PT-bi]).
- **Never let the browser fake a style.** A weight or italic that isn't embedded is synthesised by smearing or slanting the regular, and looks poor ([GF], [CB13], [TH]). Embed every weight and style the UI uses (also bold italic, if both are used: [GF]); `font-synthesis: none` makes a missing one obvious instead of faked.
- Use `strong` and `em` for meaning, not just looks; screen readers and the default styles depend on the markup ([GF]).

## Case

- **Sentence case** for titles, buttons, labels and menu items. No Title Case: we read the shape of a word, and capitals flatten it ([NT]).
- **No all-caps or small-caps labels in the UI.** Where caps are used anyway (a printed document's column headers, for example), keep them to under one line, letterspace them (+0.05–0.1em), and turn on the `case` feature if the font has it ([PT], [TK26]). Never caps for emphasis ([TK26]).
- Small caps only if the font has real ones ([PT], [WT] 3.2.2).

## Numbers

- **Tabular, lining figures wherever numbers are compared or stacked:** tables, amounts, dates, counters (`tabular-nums`) ([VS], [CB13]). Proportional figures are fine in running text. Old-style figures are a book choice and don't suit an app.
- Right-align numbers in columns, headers too ([components.md](components.md#tables-and-lists)).
- Not monospace: `font-mono` only for patterns and raw error text; monospace also renders smaller by default ([ME]).
- **The number first, its label second:** in a stat or a total, the value carries the visual weight and the label is quieter ([NT]).
- Prefer `font-variant-numeric` (and the other `font-variant-*` properties) over `font-feature-settings`: they combine instead of overriding each other ([TH]).

## Punctuation and characters

- Real quotes and apostrophes, not straight ones (straight only for feet and inches) ([PT]); in each language its own quotes.
- Hyphen, en dash and minus are different characters: hyphen in words, en dash for ranges (2014–2026, 9–12), minus sign (−) for negative numbers, em dash or spaced en dash for breaks ([PT], [VS-d]).
- The ellipsis character (…), not three dots; real ×, ©, ™ ([PT], [CB13]).
- Non-breaking spaces where a break would separate what belongs together: a number and its unit or currency, and whatever the language's rules require ([CB13]).
- One space between sentences ([PT]).

## Alignment and wrapping

- Left-aligned, ragged right. No justified text in the UI (it needs hyphenation and leaves gaps) ([PT], [TK26], [CB13]). Centred text only for a short standalone line.
- No hyphenation in the UI ([TK26]).
- `text-wrap: balance` for headings and short captions; `text-wrap: pretty` for paragraphs, to avoid a single word on the last line ([TH]).
- Button labels never wrap (`whitespace-nowrap`); a row of buttons wraps as a group.

## Choosing faces

**At most two families** ([NT], [TK26]); a third role (navigation, say) uses a weight of one of them. When the two differ, they should differ clearly (a contrast in structure or mood) and share a similar x-height ([NT], [TK26]).

What makes a typeface good for an interface ([VS], [CB15]):
- **Legibility:** letters that can't be confused, especially capital I, lowercase l and the digit 1, and 0 and O.
- **A large x-height**, but not so large that n and h blur.
- **Wide, open proportions** and loose enough spacing: the space between letters slightly smaller than the space inside them.
- **Low stroke contrast,** so thin strokes don't vanish at small sizes.
- **OpenType features,** above all tabular figures, and coverage of every language the app supports.
- **Good hinting:** test on Windows with a low-DPI monitor, where rendering is harshest ([VS], [CB15]).
- **Modesty:** the face shouldn't draw attention away from the task.

Before committing to a face, check its character set and features ([CB13]), and test it on real content at every size it will be used ([MI]).

## Fonts

- **Embed every weight and style the UI uses,** latin and latin-ext (for accented letters such as č, ř, ő), as woff2 subsets ([BP], [TH]). A missing weight silently falls back to another one: `font-medium` once rendered as 400 because 500 wasn't embedded.
- **Load as few files as possible:** each weight is bytes in the page for good ([NT], [GF]). A variable font pays off only when many weights are used ([BP], [ALA]).
- **Single offline file:** register faces with the `FontFace` API, call `load()` early, add them to `document.fonts` before the first render, and await `document.fonts.ready` before measuring text or drawing a PDF or a canvas. Network advice (preload, preconnect, cache headers, `font-display: optional`) doesn't apply.
- Set `display` explicitly on each `FontFace` (`'block'` or `'swap'`) rather than leaving it to the browser's default ([FD], [BP]).
- Give embedded faces a name that can't match an installed font, or a different local version could take over ([ZL]). Don't use `local()`.
- Keep a system fallback in every stack (`ui-sans-serif, system-ui, …`) ([GF]).

## Rendering

- `-webkit-font-smoothing: antialiased` (Tailwind's `antialiased`) affects macOS only and makes text thinner; the sources disagree on whether that is better ([DW], [CSST]). Windows is unaffected. Check light text on dark grounds on a Mac before relying on it.
- Test on Windows and macOS at normal and high pixel density ([DW], [VS], [CB15]).

## Contrast

Text roles are checked by the scheme test ([tokens.md](tokens.md#contrast)): 4.5:1 for all text, whatever its size. That is stricter than WCAG's 3:1 for large text, on purpose. Avoid pure black on pure white; a near-black ink is softer ([TH]). Never pick a text colour outside the roles.

## Sources

Read 2026-10-28.

| Key | Source |
|---|---|
| GF | Google Fonts, [The foundations of web typography](https://fonts.google.com/knowledge/using_type/the_foundations_of_web_typography) |
| NT | Nicholas Tart, [Perfecting Web Typography](https://medium.com/awesome-websites/perfecting-web-typography-432e00aae6ec) (2015) |
| VS | Viljami Salminen, [Typography for User Interfaces](https://web.archive.org/web/2022/https://viljamis.com/2016/typography-for-user-interfaces/) (2016) |
| VS-d | Viljami Salminen, [Dashes in Web Typography](https://web.archive.org/web/2022/https://viljamis.com/dashes/) |
| MI | Xtian Miller, [Your Body Text Is Too Small](https://medium.com/@xtianmiller/your-body-text-is-too-small-5e02d36dc902) (2016) |
| TK26 | Tom Koszyk, [26 Digital Typography Rules for Beginners](https://medium.com/product-design-ux-ui/26-digital-typography-rules-for-beginners-a04c6a5aaff3) (2015) |
| CB13 | Yves Peters, [Better web typography in 13 simple steps](https://www.creativebloq.com/typography/better-web-typography-few-simple-steps-5132803) |
| CB15 | Creative Bloq, [Choosing web fonts: 15 expert tips](https://www.creativebloq.com/web-design/choose-web-fonts-1233034) |
| PT, PT-bi | Matthew Butterick, Practical Typography: [Summary of key rules](https://practicaltypography.com/summary-of-key-rules.html), [Bold or italic](https://practicaltypography.com/bold-or-italic.html) |
| WT | [The Elements of Typographic Style Applied to the Web](http://webtypography.net/) (chapter numbers given) |
| TH | [The Typography Handbook](http://typographyhandbook.com/) |
| RA | [Typographic Scale](http://retinart.net/typography/typographicscale/) |
| CSST | CSS-Tricks, [Methods for Controlling Spacing in Web Typography](https://css-tricks.com/methods-controlling-spacing-web-typography/) |
| ME | Manish Goregaokar, [Font-size: An Unexpectedly Complex CSS Property](https://manishearth.github.io/blog/2017/08/10/font-size-an-unexpectedly-complex-css-property/) |
| DW | David Walsh, [Font Smoothing](https://davidwalsh.name/font-smoothing) |
| ALA | A List Apart, [Variable Fonts for Responsive Design](https://alistapart.com/blog/post/variable-fonts-for-responsive-design) |
| BP, FD | web.dev, [Best practices for fonts](https://web.dev/articles/font-best-practices); Chrome, [font-display](https://developer.chrome.com/blog/font-display) |
| ZL | Zach Leatherman, [Font Aliasing, or How to Rename a Font in CSS](https://www.zachleat.com/web/rename-font/) |

From the [deanhume/typography](https://github.com/deanhume/typography) list, also read but with little for an app UI: fluid and viewport type (Smashing, zellwk; fluid sizes don't suit a dense desktop UI), font-loading patterns from 2012–2016 (Bram Stein, Filament Group, igvita, A List Apart, CSS-Tricks, perfplanet; replaced by `font-display` and the `FontFace` API), normalize-opentype.css (an old `font-feature-settings` approach). Unreachable: stateofwebtype.com; the Typecast article on scales (gone); the Typekit pairing guide (a PDF).
