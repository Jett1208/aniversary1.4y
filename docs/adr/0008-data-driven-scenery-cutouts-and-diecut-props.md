# ADR-0008: Data-Driven Scenery Cutouts and Die-Cut Illustrated Props

## Status
Accepted

## Context
Chapter 1 (เกาะเกร็ด) represents the couple's relaxing riverside day at Koh Kret ("วันชิลริมแม่น้ำเจ้าพระยา").
Previously, interactive props across all chapters were rendered merely as generic 3D cylinder coin badges bearing an emoji and Thai label (e.g., a coin badge with `🚲` for Chapter 1). Furthermore, the 3D scene lacked environmental context and regional depth, relying solely on three floating personal photo cards and a polaroid.

The user provided high-resolution illustrated assets in `asset(props)\เกาะเกร็ด`:
1. `จักรยาน.png` — A vintage coral-pink bicycle with sky-blue basket and accents
2. `kohkret.png` — A watercolor painting of the iconic Leaning Pagoda (เจดีย์เอียง วัดปรมัยยิกาวาส)
3. `boat.png` — A traditional wooden rowing boat with water ripples
4. `prop.png` — Traditional Koh Kret terracotta potteryware

Hardcoding these props directly into Chapter 1 would prevent reuse across other chapters (e.g. Song Wat, Talad Noi, Pattaya) and violate the established declarative configuration pattern in `CHAPTERS`.

## Decision
1. **Data-Driven `SceneryCutoutConfig` in `ChapterConfig`**:
   - Introduced `sceneryCutouts?: SceneryCutoutConfig[]` into `ChapterConfig` within `src/data/chapters.ts`.
   - Each scenery cutout defines an `imageUrl`, 3D `position`, `scale`, optional `rotationZ`, `foldable` status, and an `animationType` (`'none' | 'water-bob' | 'gentle-breeze'`).
   - Chapter 1 configures the Leaning Pagoda as a background landmark (`Z: -2.4`), the wooden boat as an animated floating foreground element (`Z: 1.3`, `water-bob`), and terracotta pottery as a ground accent (`Z: 0.95`).

2. **Dedicated `SceneryCutout` 3D Pop-Up Component & 32-bit Alpha Die-Cutting**:
   - Processed all raw props through an automated edge-aware die-cut pipeline, converting 24-bit RGB solid-white backgrounds into true 32-bit ARGB Transparent PNGs (`Alpha = 0`), preserving genuine internal whites (pagoda stucco, bicycle wheel rim, water spray).
   - Created `src/components/canvas/SceneryCutout.tsx` applying the project's bottom-edge hinge pivot rule (`rotation.x = -π/2` folded, `0` open).
   - Renders transparent PNG cutouts cleanly using Three.js SRGB texture encoding, `alphaTest: 0.02`, and optional ground contact shadows (`hasShadow: boolean`).
   - Handles frame-by-frame 60fps natural environmental motion (e.g., sine-wave water bobbing for boats).

3. **Pop-Up Amphitheater Arc & 4-Tier Depth Staging**:
   - Adopted the physical pop-up book diorama model (exemplified by classic Wat Phra Kaew pop-up books).
   - **Tier 1 (Left-Anchored Monumental Pagoda & Skyline Counterbalance Clouds, Z = -2.2 to -2.6)**: 
     - The Leaning Pagoda (`kohkret.png`) is anchored at `[-2.8, 0, -2.4]` and scaled to `[8.0, 6.32]`, ensuring at least 0.7 units of open sky ceiling margin below the viewport top frame (eliminating visual tangent).
     - Floating watercolor cumulus clouds (`cloud-warm.png` at `[3.2, 3.8, -2.2]` and `cloud-blue.png` at `[1.6, 4.5, -2.6]`) float with gentle breeze drifting in the upper-right sky to counterbalance the pagoda.
   - **Tier 2 (Core Memory Accordion Fan, Z = -0.8 to +0.6)**: The 3 memory photo cards stand prominent in the center stage ($X \in [-1.8, +2.15]$), with expanded spacing between Photo 2 and Photo 3.
   - **Tier 3 (Foreground Wing Framing, Z = 1.15 to 1.4)**: The vintage bicycle (`X: -3.55, Z: 1.15`) and terracotta pottery (`X: -2.55, Z: 1.4`) frame the lower-left bank, while the gently bobbing wooden boat (`X: 4.35, Z: 1.2`) frames the right riverbank without encroaching on photos.
   - **Tier 4 (Interactive Memory Plaque, Z = 1.55)**: The Polaroid secret card rests in the open front-right space (`X: 3.15, Z: 1.55`), angled invitingly towards the viewer like a descriptive pop-up plaque.

3. **Transformation of `InteractiveProp` into Die-Cut Illustrated Prop**:
   - Enhanced `InteractiveProp.tsx` to accept optional `imageUrl`, `scale`, and custom click actions (`'bicycle-ride'`).
   - Renders the actual illustrated artwork as an authentic die-cut paper cutout standing on the scrapbook floor, equipped with a soft ground contact shadow.
   - Retains full backward compatibility with cylinder coin badges for chapters that do not provide custom image cutouts.

4. **Tactile Interaction and Synthesized Bicycle Bell SFX**:
   - Implemented `playBicycleBell()` in `src/utils/sfx.ts` synthesizing an authentic high-register brass twin chime ("Ding-Ding!", 2093 Hz and 2349 Hz with metallic overtones) via Web Audio API.
   - Clicking the bicycle triggers a springy forward bounce, bell vibration, floating heart/sparkle particles (`💖 ✨ 🔔`), and the twin-ding bicycle bell sound.

5. **URL-Safe Asset Slugs & Cache Preloading**:
   - Assets are copied to `public/images/ch1-kohkret/props/` with clean ASCII filenames (`bicycle.png`, `boat.png`, `kohkret.png`, `pottery.png`, `cloud-warm.png`, `cloud-blue.png`).
   - All scenery and prop URLs are preloaded automatically in `JourneyPreloader.tsx`.

6. **3D Gallery Picture Spotlights & Daylight Lumens Boost**:
   - Mounted 3D miniature brass gallery picture lamps to the top edge of each of the 3 photo cards in Chapter 1 (`PaperCutout.tsx`).
   - Each lamp features a brass clip, arched gooseneck arm, cylindrical hood, glowing bulb element, and a focused warm sunlight `pointLight` (intensity 3.6, color `#FFF5DB`) casting radiant light across the photo surface.
   - Boosted global daylight lumens (`ambientLight: 1.15`, `directionalLight: 1.45`) ensuring clean, warm, joyful illumination throughout the diorama.

7. **Tabletop Environment, Spine Crease & Atmospheric Overlays**:
   - **Warm Oak Wood Tabletop Surface**: Rendered an expansive $34 \times 26$ oak tabletop mesh under the book stage with procedural wood grain striations and plank dividers in `ScrapbookSurface.tsx`.
   - **Center Book Spine Crease**: Added a procedural vertical shadow crease strip along the center fold of the scrapbook pages.
   - **Physical Page Block Bulk**: Layered hardcover trim and deckled edge paper sheets underneath the open stage to give the scrapbook real physical page thickness.
   - **Golden Afternoon Sunbeams & Vignette**: Injected CSS radial gradients over the 3D viewport for warm golden sunbeams streaming from the upper-right corner and a gentle peripheral paper vignette.
   - **Multiplane Mouse Parallax**: Added smooth pointer tracking in `CameraRig` dampening subtle camera translation and look-at coordinates to bring multiplane paper depth to life.

8. **Extension to Chapter 2 (Song Wat Road - สตรีทวินเทจ & คาเฟ่ตึกเก่า)**:
   - **Tier 1 (Backdrop & Skyline)**: Deployed the monumental Brutalist old building (`building.png` at `[-3.0, 0, -2.4]`, scale `[5.5, 5.6]`) and floating watercolor clouds (`cloud-warm.png` and `cloud-teal.png` with `'gentle-breeze'` idle animation).
   - **Tier 2 (Core Memories)**: Configured 3D brass gallery picture spotlights on all 3 Song Wat photo cards (`hasSpotlight: true`).
   - **Tier 3 (Foreground Wings)**: Upgraded `InteractiveProp` to a vintage rangefinder camera (`camera.png` at `[-3.45, 0, 1.1]`) paired with a cassette tape (`cassette.png` at `[-2.25, 0, 1.35]`) on the left, and vintage newsprint pages (`newspaper.png` at `[4.55, 0, 1.15]`) with a fluttering paper butterfly (`butterfly.png` elevated at `[4.1, 2.3, 1.35]`) hovering freely in front on the right.
   - **Interactive Tactile Haptics**: Enhanced `camera-flash` action with a high-intensity 3D sunlight burst (`intensity: 18`), spring recoil bounce, and floating `📸 🎞️ 💖` particles.

9. **Extension & Aesthetic Overhaul for Chapter 3 (Talad Noi - รถเฟียตส้ม & กำแพงกราฟฟิตี้)**:
   - **Tier 1 (Panoramic Watercolor Architectural Backdrop & Skyline Polish)**:
     - Replaced the isolated 8-bit pixel tree with an enlarged panoramic watercolor Talad Noi streetscape cutout (`backdrop.png` at `[-0.2, 0.2, -2.8]`, scaled up 15% to `[10.1, 5.6]`) showcasing historic Chinese shophouses, traditional red lanterns, and dragon street art murals. The wider, elevated framing keeps the "ตลาดน้อย" signage and lanterns unobstructed by photos while masking the straight tabletop horizon.
     - Repositioned the white-bordered arcade coin sticker (`coin-sticker.png`) to `[4.5, 3.8, -1.8]`, providing ample ceiling clearance away from the shophouse roofline and nestling naturally under the warm watercolor cloud.
   - **White Paper Sticker Outline Pipeline**: Implemented a morphological alpha dilation pass generating crisp ~14px white paper sticker borders around all mixed-media elements (`pixel-heart-sticker.png`, `hp-bar-sticker.png`, `coin-sticker.png`, `controller-sticker.png`), seamlessly harmonizing retro arcade pixel art and 3D renders into a cohesive physical handmade scrapbook aesthetic.
   - **Three.js Explicit Render Order & Transparency Sorting**:
     - Enforced deterministic rendering order across components: `renderOrder: 1` (Backdrops & Sky cutouts, $Z \le -2.0$), `renderOrder: 10` (Photo cards and backing sheets), `renderOrder: 12` (Foreground interactive props and scenery), `renderOrder: 15` (Washi tape accents), and `renderOrder: 20` (3D brass gallery spotlights).
     - Pushed the backdrop back to $Z = -2.8$, mathematically eliminating all transparency sorting glitches where the backdrop pierced through brass clips or top washi tape.
   - **Stage Surface Cleanliness**: Removed the awkward top-left corner stage tape from `ScrapbookSurface.tsx`, eliminating the floating pink strip above the car badge.
   - **Frame-Clear Washi Tape Elevation**: Raised washi tape anchoring in `PaperCutout.tsx` to `totalHeight - 0.05` so the tape rests strictly on the top white margin, ensuring zero clipping or obscuring over faces/foreheads even in tight photo crops.
   - **Unobstructed Sightline Staging**:
     - Shifted left photo `ch3-photo-1` outward (`xOffset: -2.25, zOffset: -0.75, rotationZ: -0.08`) and the classic car leftward (`position: [-3.65, 0, 1.25]`) to fully expose the couple in the photo.
     - Shifted the game controller and status meters rightward (`position: [4.7, 0, 1.15]`) to eliminate overlap with the lying Polaroid plaque on the right page.
   - **Ground Contact Drop Shadows**: Darkened and widened ground contact shadows (`opacity: 0.88`, `rgba(40, 25, 15, 0.7)`, scale `width * 1.05`) in `InteractiveProp.tsx` and `SceneryCutout.tsx`, firmly grounding the classic car and controller to the scrapbook floor.

## Consequences
- **Vastly Superior Ambiance**: Chapters 1, 2 & 3 transform into rich, living 3D pop-up scenes with depth layers, regional landmarks, and interactive props.
- **Authentic Physical Scrapbook Feel**: The diorama feels grounded on a real wooden desk rather than floating in empty 3D space, with paper bulk, spine folds, and sunlight god rays.
- **Adorable Tactile Feedback**: Tapping the bicycle produces a bell chime, tapping the camera triggers a bright flash burst, and tapping the classic car triggers a playful honk and bounce.
- **Zero Regressions**: Architecture is fully data-driven; other chapters remain completely stable and can adopt custom scenery props with simple config entries.
