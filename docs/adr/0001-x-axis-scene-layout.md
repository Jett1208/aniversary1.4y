# ADR-0001: X-Axis Scene Layout Instead of Page-Flip Book

## Status
Superseded by [ADR-0003](./0003-depth-tunnel-z-axis-transition.md)

## Context
The project is a 3D pop-up scrapbook. The natural metaphor suggests a book you flip through page by page. Three layout approaches were considered:

1. **Z-axis (depth)** — camera moves forward through scenes like walking into a tunnel
2. **X-axis (horizontal)** — scenes are laid out left-to-right on a continuous paper surface, camera pans sideways
3. **Stacked (same position)** — scenes occupy the same 3D space and crossfade like page flips

## Decision
**X-axis horizontal layout** on a continuous scrapbook surface.

## Rationale
- **Simpler ScrollTrigger mapping**: horizontal camera pan maps 1:1 to scroll progress without complex page-turn physics or z-fighting issues.
- **"Unfolded scrapbook" metaphor**: feels like a craft book laid open wide on a table — matches the handmade DIY art direction better than a rigid book-flip.
- **Works on both Desktop scroll-wheel and iPad touch-swipe** without needing separate gesture handling for "flip" vs "scroll."
- **Allows seeing neighboring chapters**: as the camera pans, you glimpse the next chapter approaching, building anticipation.
- Trade-off: loses the "page flip" feel, but that effect is extremely complex to implement well in 3D (paper deformation, two-sided rendering, spine binding) for marginal benefit.

## Consequences
- All 7 chapters + intro + finale are positioned at increasing X coordinates.
- Camera path is a straight horizontal dolly (with slight Z/Y curves for cinematic feel).
- Chapter dividers (washi tape + stickers) are needed between scenes to visually separate them.
- Total 3D world width is ~35-50 units depending on chapter spacing.
