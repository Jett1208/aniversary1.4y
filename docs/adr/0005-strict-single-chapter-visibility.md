# ADR-0005: Strict Single-Chapter Isolation and Dive-Triggered Reveal

## Status
Accepted

## Context
In earlier iterations, the distance culling algorithm in `useScrollRig.ts` allowed chapters up to 32 units ahead along the Z-axis to remain rendered. Because chapters are spaced by 22 units, resting at any chapter (e.g., Chapter 3 Talad Noi) kept the subsequent chapter stage (Chapter 4 Lumpini Park), its folded cards, and floating HTML tooltip badges visible in the background depth tunnel. 

The user explicitly requested:
> "อยากแสดงแค่chapterหลัก chapterอื่นยังไม่ต้องแสดงจนกว่าจะเลื่อน"
> (I want to show ONLY the main chapter. Other chapters don't need to be shown until the user scrolls.)
> Accompanied by a screenshot crossing out all distant background stages and badges with a red "X".

Following the `/grill-with-docs` interview, the decisions were confirmed to enforce strict single-chapter isolation.

## Decision
1. **Strict Single-Chapter Isolation at Rest**:
   - When the user is viewing an active chapter at rest (`chapterProgress ≈ integer`), all other chapters (both prior and subsequent) are completely hidden (`isVisible = false`).
   - `ChapterScene` short-circuits with `if (!isVisible) return null;`, unmounting all 3D meshes and Drei `<Html>` tooltip overlays to eliminate any floating badges or distant cards.
   - `ScrapbookSurface` only renders the paper stage diorama for chapters where `isChapterVisible(index)` is true, keeping the background 100% clean and void of distant paper planes.
2. **Dive-Triggered Reveal**:
   - The threshold for visibility is refined to `Math.abs(chapterProgress - index) < 0.72`.
   - The subsequent chapter appears and begins its 1:1 unfolding animation only when the user scrolls past ~28% of the transition dive.
   - Once the camera settles into the new chapter, the previous chapter is immediately hidden.
3. **Tightened Depth Fog**:
   - Three.js fog range is adjusted to `['#F7F4EE', 18, 42]`.
   - Any geometry beyond 42 units seamlessly blends into the soft off-white background, guaranteeing an infinitely clean horizon.
4. **Removal of Infinite Floor Guide Strip**:
   - The global 140-unit floor stripe in `ScrapbookSurface.tsx` is removed so that inactive areas have no stray lines piercing into the distance.

## Consequences
- At rest, each chapter stands as a pristine, distraction-free pop-up stage with a clean, airy background.
- Floating badges from upcoming chapters (`เรือเป็ด + แตะเลย`, `แตะเพื่อพลิก`) are completely eliminated while reading the current chapter.
- Performance improves significantly as inactive chapters and their DOM overlays are completely unmounted.
