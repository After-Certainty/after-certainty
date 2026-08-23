# Site icons

Phosphor (`@phosphor-icons/react`) is the general-purpose icon library for Books, Patterns, and chrome.

## Conventions

- **Weight:** `light` by default (editorial). Use `regular` on small controls when visibility needs it.
- **Size:** `sm` 16 · `md` 20 · `lg` 24 · max ~28 for semantic accents (`sizes.ts`).
- **Color:** `currentColor` via `text-muted` / `text-accent` / inherit — no hard-coded hex.
- **Decorative:** `aria-hidden` when adjacent text already names the action.
- **Icon-only controls:** require `aria-label`, `min-h-11` touch targets, visible focus rings.
- **Motion:** caret rotation uses `motion-reduce:transition-none`.
- **Imports:** prefer `@phosphor-icons/react/ssr` through [`approved.ts`](./approved.ts) so RSC and client share one path.
- **Brand / social:** keep custom SVGs under [`social/`](./social/) (GitHub, Substack, Medium, LinkedIn, YouTube).

## Shared modules

| Module | Role |
| --- | --- |
| `SiteIcon` | Thin defaults wrapper |
| `approved.ts` | Named re-exports of the approved set |
| `semantic.ts` | Glance / book-action / dynamics / Observatory mappings |
| `DisclosureChevron` | Shared Books + Patterns caret (`components/ui/`) |

## At-a-glance (Patterns mobile Phase 3)

`patternGlanceIcons` in `semantic.ts` maps into `PatternAtAGlance`:

- What it does → `CompassIcon`
- Why it matters → `TargetIcon`
- Key risk → `WarningCircleIcon`
- Counterbalance → `ScalesIcon`

Slots come from `patternAtAGlance()` — omit empty sources; do not invent cards for icons alone.

## Non-goals

No icons on every eyebrow, force chip, or related-concept card. Force accordion headers stay typographic.
