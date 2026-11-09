# ADR-0003: Depth Tunnel Z-Axis Transition Instead of X-Axis Layout

## Status
Accepted (Supersedes [ADR-0001](./0001-x-axis-scene-layout.md))

## Context
The project was originally designed as a horizontal X-axis scrapbook laid open wide across a table (ADR-0001). However, user feedback and creative direction required a much more surprising, exciting, and immersive interaction where scrolling down dives deep into the scrapbook layers. Instead of a sideways pan where scenes sit side-by-side:
- Chapter 1 starts as an open 3D pop-up diorama.
- Scrolling down directly folds down the active chapter.
- The camera plunges forward along the Z-axis (Depth Tunnel Dive) through the Polaroid frame portal.
- The next chapter unfolds dynamically right before the viewer's eyes.

## Decision
Adopt a **Z-Axis Depth Tunnel Architecture** with:
1. **Depth Staging (Z-Axis Stack)**: Chapters 1 through 7 are arranged along negative Z coordinates (Z = 0, -20, -40, -60, ...).
2. **Dynamic Swoop & Level Camera Rig**: Camera transitions from high isometric reading angle (Y=8, Pitch=40°) down to a level portal dive (Y=3.5, looking forward through the Polaroid cutout), then pulls back up into the newly unfolded chapter.
3. **Scrub-Linked 1:1 Folding**: Cutouts and pop-up elements are directly driven by scroll progress with soft magnetic snap points at chapter centers.
4. **Distance Culling**: Inactive/passed chapters are culled (`visible = false`) to maintain locked 60fps performance on mobile/iPad devices.
5. **Origami Rocket Navigator**: The paper rocket launched from the cover acts as the forward camera guide leading the dive path seamlessly into the 3D scene.
6. **New Year Countdown Style Fireworks**: Chapter 7 culminates in a grand multi-burst New Year's countdown firework celebration before transitioning to the floating stationery letter.
7. **Clean BGM Immersion**: Audio remains purely musical with smooth BGM crossfading, avoiding intrusive artificial wind whoosh sound effects.
8. **Animated Paper UI**: Caption note cards slide down and pop back in with paper rustle SFX synchronized with 3D chapter folds.

## Consequences
- `chapters.ts`: `baseX` coordinates are replaced with `baseZ` depth offsets.
- `useScrollRig.ts`: Camera math tracks Z-progress and dynamic Y/Pitch swoop instead of X dolly.
- `ScrapbookSurface.tsx`: Redesigned from a long single strip into individual textured paper bases or floating diorama pedestals per chapter stage.
- `PaperCutout.tsx` & `ChapterScene.tsx`: Pop-up fold angles map to entry/exit scrub progress for smooth unfolding and folding flat.
- Dramatically enhances user immersion and surprise factor while meeting 60fps performance requirements.
