# ADR-0004: Neutral Daylight Lighting and Raw Photo Fidelity

## Status
Accepted

## Context
In earlier iterations, the 3D diorama was lit with dynamic directional and ambient lights tinted according to each chapter's `themeColor` (e.g., bright yellow `#FDE68A` for Chapter 1 Koh Kret, and bright green `#86EFAC` for Chapter 4 Lumpini Park). Combined with `ACESFilmicToneMapping` and warm ambient lights, this caused the scenes, ground paper stages, and couple photos to be heavily washed in colored light tints (e.g., skin tones appearing green in Lumpini Park or yellow in Koh Kret).

The user explicitly requested:
> "แต่ละฉากมันดูแปลกๆเหมือนใส่ฟิลเตอร์ ผมไม่ต้องการให้ใส่ฟิลเตอร์เอาสีพวกนี้ออกด้วยใช้ภาพสดๆเลย"
> (Each scene looks weird, like a filter was applied. I don't want a filter applied; remove these colors and use fresh/natural/vibrant/original raw images/scenes!)

Following the `/grill-with-docs` interview, the decisions were confirmed to eliminate the perceived filter effect and restore true-to-life color rendering.

## Decision
1. **Neutral White Daylight Lighting**:
   - Replace dynamic `themeColor` light tinting in `ScrapbookLighting` with pure neutral white illumination (`#FFFFFF`) for the primary tracking `directionalLight`, `ambientLight`, and fill lights.
   - The directional light continues to smoothly track camera depth ($Z$-axis) for optimal shadow angles, but with constant neutral color `#FFFFFF`.
2. **Linear Tone Mapping for Raw Photo Fidelity**:
   - Switch Three.js tone mapping from `ACESFilmicToneMapping` to `LinearToneMapping` with calibrated exposure ($1.0$).
   - This eliminates the heavy filmic S-curve contrast and hue shifts, allowing photos to render with 100% color accuracy matching the source image files.
3. **Semi-Gloss Photo Paper Material**:
   - Reduce photo mesh material `roughness` from $0.75$ (dull matte) to $0.35$ (fine semi-gloss photo print) across `PaperCutout.tsx` and `InteractivePolaroid.tsx`.
   - Under neutral white light, this produces crisp, vibrant photographs with gentle specular highlights and realistic 3D paper drop shadows.
4. **Clean Craft Paper Stages & Airy Backdrop**:
   - The ground diorama stages retain uniform natural craft paper texture (`#F5EFE0`) across all 7 chapters without color bleeding.
   - Chapter `themeColor` is strictly reserved for subtle accent elements: decorative washi tape corner strips and UI navigation dots.
   - Canvas background and distance fog are elevated to clean, soft off-white (`#F7F4EE`) to avoid muddy sepia haze.

## Consequences
- Couple photos and polaroids appear completely natural, vibrant, and true to life with zero artificial color tint.
- Skin tones remain natural and flattering across all 7 chapters.
- The 3D pop-up scrapbook aesthetic is fully preserved through drop shadows, paper cardstock borders, and depth tunnel transitions without sacrificing photo fidelity.
