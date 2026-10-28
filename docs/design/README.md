# Design kit

A small design system for Tailwind 4 apps: colour roles, a scheme contract with eleven ready schemes, a type scale, shapes, form controls and layout patterns. It knows nothing about the app that uses it. Invojka is its first user; what Invojka adds on top is in [../ui.md](../ui.md).

| Page | What it covers |
|---|---|
| [tokens.md](tokens.md) | The colour roles components use, what each is for, and the state rules (hover, selected, focus, disabled) |
| [schemes.md](schemes.md) | The scheme contract (every slot, its contrast target), motifs, how to make a scheme, and the eleven schemes |
| [typography.md](typography.md) | Five sizes and their roles, three font roles, numbers, case, line length |
| [components.md](components.md) | Boxes and spacing, header and footer, the feature block, forms, buttons, tables, status labels, segmented controls, charts, phones |

## Files

| File | What it is |
|---|---|
| `src/design/theme.css` | Tailwind `@theme` roles, font roles, the radius scale, `.dark`, `.control`, the motif classes, `.mobile-stack`, `.animate-rise` |
| `src/design/schemes/*.css` | One scheme each: every `--scheme-*` slot in light and dark |
| `src/design/contrast.ts` | The slot list (`SLOTS`), the contrast pairs (`PAIRS`), a parser for scheme files |
| `src/design/schemes.test.ts` | Every scheme defines every slot and passes every pair, in both modes |

## Using it in another app

1. Copy `src/design/` and `docs/design/`.
2. In the app's CSS: `@import "tailwindcss";`, then `@import "./design/theme.css";`, then each scheme the app ships (`warm.css` is the default: it applies when `<html>` has no `data-scheme`).
3. Set the font faces in the app's own `@theme` (`--font-sans`, `--font-display`, `--font-nav`) and embed every weight it uses (see [typography.md](typography.md#fonts)).
4. Switch modes with a `dark` class on `<html>` and schemes with `<html data-scheme="…">`.
5. Style components with the role utilities only (`bg-surface`, `text-fg-muted`, `bg-accent text-accent-fg`…), never a hex or a `--scheme-*` slot.

The kit has no components of its own beyond `.control`; the patterns in [components.md](components.md) say how to build them. Invojka's are in `src/ui/primitives.tsx`.

## Principles

- **One accent.** One action colour for buttons and solid fills; everything else is neutrals and status. A second hue appears only where a scheme records it as an exception.
- **Hierarchy by lightness,** not by more hues: page, card, fill and line are steps of one neutral ramp.
- **Contrast is computed, not eyeballed:** 4.5:1 for text, 3:1 for field edges and chart marks, in light and dark, enforced by the test.
- **Colour never carries meaning alone:** status has a word, links are underlined, chart series differ in lightness.
- **Components never change for a scheme.** A scheme is only values for the slots and optional motifs.
- **Variants differ in structure,** not just hue: the share of each colour, how the greys are built, where the dark sits ([schemes.md](schemes.md#making-a-scheme)).
- **Few sizes, few faces, small corners, no shadows.**

The design system artifact ("Invoicer Ledger", https://claude.ai/artifact/Uy6dgG74ESca8FjsGKrVDN) states the same principles without colours; keep the two in step.
