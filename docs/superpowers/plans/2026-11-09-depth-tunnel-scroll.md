# Depth Tunnel Scroll Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

This plan transforms the horizontal (X-axis) conveyor scrapbook into a cinematic **Z-Axis Depth Tunnel Scrapbook**. Scrolling down moves the camera forward into depth, folding down the active chapter, diving through the Polaroid portal led by the 3D Origami Rocket Navigator, and unfolding the next chapter dynamically.

---

### File Structure & Responsibilities

- **`src/data/chapters.ts`**: Update chapter coordinates from `baseX` to `baseZ` depth coordinates (spaced at -20 units per chapter). Center all layers around X=0.
- **`src/hooks/useScrollRig.ts`**: Replace horizontal camera pan with Z-axis depth dive, dynamic Swoop & Level camera trajectory, 1:1 scrub-linked fold progress calculations, and distance culling visibility flags.
- **`src/components/canvas/OrigamiRocketNavigator.tsx`** *(new)*: 3D paper plane/rocket model that flies ahead of the camera, tilting dynamically with scroll momentum.
- **`src/components/canvas/ChapterScene.tsx`**: Update positioning to `[0, 0, chapter.baseZ]`, integrate scrub-linked fold progress, and apply distance culling (`visible={isVisible}`).
- **`src/components/canvas/PaperCutout.tsx`**: Support scrub-linked 1:1 folding angles (`rotation.x`) with smooth lerp and bottom-edge pivot.
- **`src/components/canvas/ScrapbookSurface.tsx`**: Replace the wide horizontal paper runner with individual craft-paper pedestals/runner along the Z-axis.
- **`src/components/canvas/ScrapbookCanvas.tsx`**: Integrate the `OrigamiRocketNavigator`, depth lighting, camera swoop rig, and New Year fireworks trigger.
- **`src/utils/newYearFireworks.ts`** *(new)*: Multi-burst, multi-phase New Year's countdown celebration fireworks using synchronized spherical explosions and sparkling willow trails.
- **`src/components/ui/CaptionCard.tsx`**: Smooth slide-out / slide-in paper card transitions driven by chapter changes.
- **`src/components/ui/CoverScreen.tsx`**: Seamless flight animation into the screen towards Chapter 1.

---

### Task 1: Update Chapter Data Coordinates & Spacing (`src/data/chapters.ts`)

- [x] **Step 1.1**: Update `ChapterConfig` interface to include `baseZ: number` alongside `baseX?: number`.
- [x] **Step 1.2**: Update all 7 chapter definitions with `baseZ = -index * 20` (0, -20, -40, -60, -80, -100, -120).
- [x] **Step 1.3**: Center each chapter's layer `xOffset` around the center (X = 0) and maintain natural diorama depth (`zOffset` between -2 and +2 relative to `baseZ`).
- [x] **Step 1.4**: Run `npm run build` to verify type safety.

---

### Task 2: Build Origami Rocket Navigator 3D Component (`src/components/canvas/OrigamiRocketNavigator.tsx`)

- [x] **Step 2.1**: Create `OrigamiRocketNavigator.tsx` rendering a clean, stylized low-poly paper airplane/rocket with warm craft paper material (`#FDFBF7`, double-sided, subtle crease shadow).
- [x] **Step 2.2**: Bind its position to stay smoothly ahead of the camera along the dive trajectory with subtle floating bobbing (`Math.sin(time)`).
- [x] **Step 2.3**: Add roll and pitch banking based on scroll velocity (tilts smoothly into the dive).
- [x] **Step 2.4**: Run `npm run build` to verify syntax and types.

---

### Task 3: Refactor Scroll Rig Hook (`src/hooks/useScrollRig.ts`)

- [x] **Step 3.1**: Update `useScrollRig` to calculate camera position in `[0, targetY, targetZ]` based on scroll progress:
  - Base progress maps linearly to depth along Z from `CAMERA_START_Z = 12` to `CAMERA_END_Z = -120 + 12`.
  - In chapter focus: Camera sits at `Y = 7.5`, `pitch = -28°` (isometric overview).
  - During dive transition between chapters: Camera dips to `Y = 3.2`, `pitch = -8°` (eye-level level dive through portal).
- [x] **Step 3.2**: Implement `getChapterFoldState(index)`: returns `{ foldAngle: number, isVisible: boolean, opacity: number }` for smooth scrub folding and distance culling (only render active and adjacent chapters).
- [x] **Step 3.3**: Configure Lenis smooth scroll and ScrollTrigger scrubbing for buttery 60fps tracking.
- [x] **Step 3.4**: Run `npm run build` to verify hook interface.

---

### Task 4: Update ChapterScene & PaperCutout for Scrub-Linked Folding & Distance Culling

- [x] **Step 4.1**: In `PaperCutout.tsx`, support direct `foldAngle` or smooth responsive lerp to target angle so paper folds smoothly as the user scrubs scroll.
- [x] **Step 4.2**: In `ChapterScene.tsx`, update position to `[0, 0, chapter.baseZ]`, accept `isVisible` prop to toggle `<group visible={isVisible}>` for distance culling.
- [x] **Step 4.3**: Pass smooth fold progress to the cutouts, polaroid, and interactive prop so the entire diorama folds flat when exiting.
- [x] **Step 4.4**: Run `npm run build` to verify zero regressions.

---

### Task 5: Redesign Scrapbook Surface for Depth Stages (`src/components/canvas/ScrapbookSurface.tsx`)

- [x] **Step 5.1**: Redesign `ScrapbookSurface` to render 7 textured craft paper stages/pedestals along Z (one under each chapter at `[0, -0.05, chapter.baseZ]`) with deckled edges, subtle grid texture, and washi tape corners.
- [x] **Step 5.2**: Add soft connecting paper paths or faint dotted flight trails between stages along the Z-axis.
- [x] **Step 5.3**: Run `npm run build` to verify surface rendering.

---

### Task 6: Animated Caption Card Slide & Pop (`src/components/ui/CaptionCard.tsx`)

- [x] **Step 6.1**: Update `CaptionCard.tsx` with GSAP or CSS transition to animate the note card sliding down when the active chapter begins to change, and sliding back up with an elastic bounce when the next chapter arrives.
- [x] **Step 6.2**: Add cute washi tape pins and chapter location badges that update cleanly.
- [x] **Step 6.3**: Run `npm run build` to verify UI behavior.

---

### Task 7: New Year Countdown Style Fireworks Utility & Trigger (`src/utils/newYearFireworks.ts`, `ScrapbookCanvas.tsx`)

- [x] **Step 7.1**: Create `src/utils/newYearFireworks.ts` with a multi-phase countdown firework show:
  - Phase 1: Rising rocket sparks with trails.
  - Phase 2: Simultaneous large spherical bursts (red, gold, cyan, purple, lime) at high particle counts with sparkling glitter tails.
  - Phase 3: Grand finale golden willow waterfall cascading down across the screen.
- [x] **Step 7.2**: Connect `launchNewYearFireworks()` to the Chapter 7 interaction in `ScrapbookCanvas.tsx`, smoothly opening `FinalLetterModal` after the grand finale.
- [x] **Step 7.3**: Run `npm run build` to verify firework logic.

---

### Task 8: Assemble ScrapbookCanvas & Seamless Cover Flight

- [x] **Step 8.1**: Integrate `OrigamiRocketNavigator` into `ScrapbookCanvas.tsx`.
- [x] **Step 8.2**: Link camera controller to the new `useScrollRig` Z-depth trajectory with dynamic swoop.
- [x] **Step 8.3**: Connect CoverScreen's "Click !" launch to trigger the seamless forward flight towards Chapter 1.
- [x] **Step 8.4**: Ensure audio crossfading functions cleanly on Chapter Z-zones without artificial wind whooshes (Option B as requested).

---

### Task 9: Verification Pass & Quality Gate

- [x] **Step 9.1**: Run `npm run build` (`tsc && vite build`) to confirm clean build with zero TypeScript errors.
- [x] **Step 9.2**: Verify that all 7 chapters fold up when entered, fold down when exiting, and camera swoops smoothly through the depth tunnel.
- [x] **Step 9.3**: Verify that New Year fireworks display triggers cleanly on Chapter 7 and opens the love letter.
- [x] **Step 9.4**: Confirm 60fps responsiveness and culling.
