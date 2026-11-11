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

10. **Extension to Chapter 4 (Lumphini Park - ถีบเรือเป็ด & สวนสีเขียวใจกลางกรุง)**:
    - **Tier 1 (Monumental City Skyline, Park Bushes & Romantic Sky, Z = -2.8 to -2.2)**:
      - Anchored the classic Silom skyscraper spire (`skyline-classic.png` at `[-2.8, 0, -2.8]`, scale `[5.8, 5.98]`) on the rear left, framed by blooming white jasmine bushes (`bush.png` at `[-1.75, 0, -2.4]`) at the base.
      - Counterbalanced with floating watercolor clouds (`cloud-warm.png` and `cloud-blue.png`) and drifting pink heart balloons (`balloons.png` at `[3.9, 3.2, -1.8]`) in the upper sky with `'gentle-breeze'` animation.
    - **Tier 2 (Core Memories & 3D Spotlights, Z = -0.75 to +0.6)**:
      - Mounted 3D vintage brass gallery picture spotlights on all 3 Valentine's photo cards (`hasSpotlight: true`).
      - Coordinated fresh botanical washi tape accents (`#34D399` emerald, `#F472B6` rose pink, `#38BDF8` sky lake blue).
    - **Tier 3 (Foreground Wings, Lake Shoreline & Floating Duck Boat, Z = 1.15 to 1.45)**:
      - Upgraded `InteractiveProp` to the iconic white duck pedal boat (`duck-boat.png` at `[-3.55, 0.12, 1.25]`, scale `[1.85, 2.37]`) floating upon gently bobbing watercolor lake ripples (`water.png` at `[-3.4, 0.01, 1.38]`, animation `'water-bob'`).
      - Transferred the impressionist garden flower bed (`flower-bed.png` at `[-2.15, 0, 1.35]`, scale `[2.4, 1.17]`) to the inner bank between the duck boat and central photos, serving as the lush lake shoreline (analogous to the pottery placement in Chapter 1) and completely clearing the right polaroid.
      - Enhanced `'duck-paddle'` action with a squash-and-stretch water wobble, quack sound `sfx.playDuck()`, and splashing `🦆 💦 💖` particles.
      - Framed the right wing with the enlarged handmade Valentine's red rose bouquet (`rose-bouquet.png` at `[4.35, 0, 1.15]`, scale `[2.35, 2.55]`) and floating watercolor "Valentine's Day" calligraphy (`valentine.png` at `[4.3, 2.4, 1.35]`).
    - **Tier 4 (Interactive Memory Plaque, Z = 1.35)**:
      - Positioned the secret flippable Polaroid (`ch4-polaroid`) at `[3.25, 0.05, 1.35]` angled forward, keeping both the card and the "แตะเพื่อพลิก" flip badge 100% visible and unclipped by the lower viewport edge.

11. **Extension to Chapter 5 (Nai Lert Park Heritage Cafe - คาเฟ่นายปาร์คเลิศ & กลาสเฮ้าส์ในสวนสวย)**:
    - **Tier 1 (Monumental European Glasshouse Cafe, Modern Glass Towers & Skyway Clouds, Z = -2.9 to -2.4)**:
      - Anchored the charming European garden glasshouse cafe storefront (`cafe.png` at `[-2.2, 0, -2.8]`, scale `[7.2, 5.43]`) on the rear left, showcasing classic blue-white striped awnings, blooming flower boxes, and heritage architecture.
      - Stationed the modern glass skyscraper cluster (`skyscrapers.png` at `[2.7, 0, -2.9]`, scale `[4.8, 4.77]`) on the rear right, perfectly exposed with 100% unobstructed visibility across all glass facades and architectural spires.
      - Suspended floating watercolor cumulus clouds (`cloud-warm.png` at `[3.5, 4.3, -2.4]` and `cloud-teal.png` at `[1.2, 4.7, -2.6]`) drifting gracefully in the upper sky with gentle breeze animation, creating an airy and open skyline counterbalance.
    - **Tier 2 (Core Memories & 3D Spotlights, Z = -0.75 to +0.6)**:
      - Mounted 3D miniature brass gallery picture spotlights on all 3 Nai Lert photo cards (`hasSpotlight: true`).
      - Coordinated fresh botanical cafe washi tape accents (`#6EE7B7` mint green, `#F472B6` rose macaron pink, `#FCD34D` pastry yellow).
    - **Tier 3 (Foreground Tabletop Treats & Right-Wing Transit Pop-Up, Z = 1.25 to 1.4)**:
      - Upgraded `InteractiveProp` to a hot steaming coffee/tea cup on saucer (`coffee-cup.png` at `[-3.55, 0, 1.25]`, scale `[1.8, 1.74]`), paired with a freshly baked golden croissant (`croissant.png` at `[-2.3, 0, 1.35]`, scale `[1.7, 1.48]`) on the left table wing.
      - Enhanced `'tea-clink'` action in `InteractiveProp.tsx` with porcelain clink chime `sfx.playClink()`, lively celebratory toast bounce, and floating cafe particles (`☕ 🥐 💖`).
      - Positioned the elevated BTS Skytrain (`bts-train.png` at `[4.75, 0, 1.35]`, scale `[2.2, 1.15]`) on the far-right wing of the scrapbook floor, equipped with soft drop shadow (`hasShadow: true`) and folding support (`foldable: true`). Stationary at the outer edge, it frames the diorama cleanly without overlapping either the central couple selfie (`ch5-photo-3`) or the Polaroid portrait.
    - **Tier 4 (Interactive Memory Plaque, Z = 1.4)**:
      - Placed the secret flippable Polaroid (`ch5-polaroid`) at `[3.05, 0.05, 1.4]` angled forward (`rotationZ: 0.07`), providing ample breathing room between the central photo cards and the right-wing BTS train while keeping the "แตะเพื่อพลิก" hint badge fully unclipped.

12. **Extension & Visual Polish for Chapter 6 (The Lake Club Muang Thong Thani - ดินเนอร์ริมทะเลสาบ & ไฟทไวไลท์)**:
    - **Tier 1 (Lakeside Clubhouse Venue, City Skyline Backdrop & Water Base, Z = -2.9 to -2.7)**:
      - Anchored the lakeside clubhouse venue (`clubhouse.png` at `[-2.4, 0, -2.8]`, scale `[6.8, 4.49]`) on the rear left. Enhanced the asset by lifting deep shadow brightness by 25% and applying a crisp ~12px white paper cutout outline via alpha dilation, unifying it with the authentic scrapbook paper craft aesthetic.
      - Removed the grounded duplicate blue cloud and elevated the city skyline (`ch6-scenery-skyline` at `[3.2, 0, -2.8]`, enlarged $1.8\times$ to `scale: [6.8, 1.98]`) across the rear right, serving as the monumental architectural counterpart to the left clubhouse.
      - Stationed the wide water ripple surface (`water-ripples.png` at `[3.2, 0.02, -2.7]`, scale `[5.6, 1.22]`, `water-bob`) along the lake base beneath the skyline.
      - Equipped both the city skyline and water ripples with crisp ~12px white paper cutout borders via C# alpha dilation to cleanly delineate layers.
      - Suspended floating twilight watercolor clouds high on the sky horizon (`cloud-warm.png` at `[2.0, 4.6, -2.5]` and `cloud-blue.png` at `[4.6, 4.3, -2.3]`) with gentle breeze drift animation, establishing a clear visual hierarchy from lake water (base) -> architecture (mid) -> sky (top).
    - **Tier 2 (Core Memories & 3D Spotlights, Z = -0.75 to +0.6)**:
      - Mounted 3D miniature brass gallery picture spotlights on all 3 Lake Club photo cards (`hasSpotlight: true`).
      - Coordinated warm evening washi tape accents (`#F59E0B` golden sunset amber, `#EC4899` romantic dusk rose, `#38BDF8` lakeside twilight blue).
    - **Tier 3 (Foreground Tabletop Treats & Left-Wing Breathing Room, Z = 1.25 to 1.45)**:
      - Shifted the glowing ping-pong fairy string lights (`fairy-lights.png` at `[-4.6, 0.15, 1.25]`, scale `[1.75, 1.67]`) to the far left stage margin.
      - Enhanced `'lake-lights'` action in `InteractiveProp.tsx` with a multi-stage warm twilight light burst (`intensity: 14`), crystalline chime `sfx.playTwinkle()`, springy sway bounce, and floating `✨ 💡 💛` sparkles.
      - Placed the refreshing evening dinner cocktail/flowers (`cocktail.png` at `[-2.75, 0, 1.35]`, scale `[1.6, 1.7]`) with contact drop shadow on the left table, creating generous breathing room between the lights, cocktail, and Photo 1.
    - **Tier 4 (Interactive Memory Plaque, Z = 1.4)**:
      - Placed the secret flippable Polaroid (`ch6-polaroid`) at `[3.1, 0.05, 1.4]` angled forward (`rotationZ: -0.07`), completely unobstructed by any city skyline or scenery props.
    - **UI Stability & Bottom Navigation Contrast**:
      - Relaxed the dive-hiding sensitivity in `useScrollRig.ts` so `CaptionCard` remains permanently and reliably visible whenever the user is viewing or slowly reading Chapter 6.
      - Upgraded the bottom chapter pill in `ScrapbookCanvas.tsx` to a solid cream card (`bg-[#FFFDF9]`, border `#D5C2AF`, text `#2E1E12`) with high contrast and explicit chapter badge, ensuring 100% legibility against the wooden tabletop.

13. **Extension to Chapter 7 (Pattaya Beach & Grand Finale - ทะเล พระอาทิตย์ตก & พลุฉลอง 1.4 ปี)**:
    - **Tier 1 (Panoramic Sunset Bay, Skyline & Grand Sky Fireworks, Z = -2.9 to -2.4)**:
      - Anchored the wide panoramic sunset sea backdrop (`sunset-sea.png` / `news (1).png` at `[-0.4, 0.4, -2.9]`, scale `[11.5, 5.16]`), establishing the warm evening sea and sunlit horizon with puffy cloud outline.
      - Stationed the clean Pattaya skyline (`pattaya-skyline.png` / `news (3).png` at `[3.7, 0.05, -2.6]`, scale `[5.2, 4.9]`) on the rear right, showcasing the illuminated Pattaya hill and Pattaya Park Tower with the Ferris wheel cleanly removed.
      - Suspended the vibrant multi-color sky fireworks bouquet (`fireworks-sky.png` / `news (6).png` at `[1.8, 2.2, -2.4]`, scale `[6.8, 3.72]`, `gentle-breeze`) fanning across the upper twilight sky with pink, purple, golden yellow bursts, and sparkling stars.
    - **Tier 2 (Core Memories & 3D Spotlights, Z = -0.75 to +0.6)**:
      - Mounted 3D miniature brass gallery picture spotlights on all 3 Pattaya photo cards (`hasSpotlight: true`).
      - Fanned the cards harmoniously (`-2.15`, `0.15`, `2.2`) with coordinated washi tape accents (`#818CF8` periwinkle, `#F43F5E` sunset coral pink, `#FCD34D` warm golden amber).
    - **Tier 3 (Left Beach Oasis Uncluttered Staging & Right-Wing Sand Starfish, Z = 1.15 to 1.45)**:
      - Resolved left-wing crowding by reorganizing props into clear depth and horizontal tiers:
        - Coconut palm tree and wooden "PATTAYA" sign (`palm-sign.png` / `news (4).png` at `[-4.2, 0, 0.9]`, scale `[3.4, 3.43]`, `hasShadow: true`, `foldable: true`) placed cleanly in the rear-left corner.
        - Combined beach lounger set (`beach-oasis.png` / `news (5).png` at `[-3.8, 0.01, 1.45]`, scale `[3.3, 1.74]`, `hasShadow: true`, `foldable: true`) tucked under the sign with ample clearance from the photos.
        - Interactive wooden direction sign on post (`direction-sign.png` / `news (2).png` at `[-2.35, 0.05, 1.15]`, scale `[1.35, 0.75]`, label: `'🎆 แตะจุดพลุ'`) cleanly nestled between the oasis and the photos with a compact, non-intrusive tooltip badge.
        - Re-centered `ch7-photo-1` to `xOffset: -1.85`, establishing perfect 2.0-unit symmetry across all three photos and eliminating any overlapping with the beach oasis.
      - Enhanced `'fireworks'` action with **Real Aerial Firework Engine** (`realFireworks.ts`): Replaced birthday confetti paper poppers with realistic display fireworks. Shells launch from mortars beside the left ($X \approx 14\%$) and right ($X \approx 86\%$) edges of the wooden desk with sizzling ascension trails and synthesized launch whistles (`sfx.playRocketLaunchWhistle()`), soaring into the upper twilight sky and detonating with low-frequency bass thuds (`sfx.playFireworkDetonation()`) into 80–120 spherical sparks with additive bloom, motion blur trails, and cascading golden weeping willows across a 5-stage choreographed barrage.
      - Replaced the tropical cocktail on the right with a delicate sand dune patch with pink seashell and orange starfish (`sand-starfish-right.png` / `new (1).png` at `[4.4, 0.01, 1.35]`, scale `[1.8, 1.04]`), gently framing the right edge without visual clutter.
    - **Tier 4 (Interactive Memory Plaque, Z = 1.4)**:
      - Placed the secret flippable Polaroid (`ch7-polaroid`) at `[3.1, 0.05, 1.4]` angled forward (`rotationZ: 0.08`), keeping the secret note and hint badge completely unclipped.
    - **Dynamic Sunset Atmosphere & Enhanced 3D Lighting & Shadows**:
      - Calculated continuous scroll interpolation factor `sunsetFactor = clamp((chapterProgress - 5.15) / 0.85, 0, 1)`, smoothly morphing from Chapter 6 into Chapter 7.
      - Enabled Canvas `alpha: true` and rendered an authentic vertical sunset twilight gradient matching the sampled colors of `sunset-sea.png`: deep twilight violet (`#442445`) $\to$ twilight plum (`#6E3054`) $\to$ magenta (`#9E3E5F`) $\to$ coral-pink (`#C45568`) $\to$ peach (`#DF715E`) $\to$ golden orange (`#F39462`) $\to$ glowing horizon sun (`#FFE196`).
      - Created `DynamicAtmosphere` component to lerp Three.js `scene.fog.color` from daylight craft cream (`#EDE5D8`) to sunset horizon coral (`#D56B5C`), seamlessly dissolving distant 3D geometry into the sunset.
      - **Cutout Silhouette Shadow Mapping (`customDepthMaterial`)**: Deployed `THREE.MeshDepthMaterial` with `depthPacking: THREE.RGBADepthPacking`, `map: texture`, and `alphaTest: 0.35` across all `SceneryCutout` and `InteractiveProp` meshes. Instead of casting flat rectangular plane shadows, stickers now cast realistic, organic paper cutout shadows of palm fronds, beach chair slats, and signposts directly onto the scrapbook surface.
      - **Overhead Sunlight Projection**: Kept primary directional sunlight at high-angle overhead (`[5, 12, Z+8]`), ensuring standing photo cards and props only cast subtle, natural contact drop shadows beneath their bottom edges, completely eliminating the horizontal wall-shadow bug that previously occluded the right page.
      - **Warm Luminous Ambiance**: Maintained ambient light at a luminous, sunlit intensity (`1.15` to `1.20`, color `#FFF5EB`) and active fill lights (`0.45` and `0.25`), keeping both pages of the scrapbook clean, warm, bright cream paper.
      - **Tightened Shadow Map Bounds**: Tightened shadow camera bounds (`[-10, 10, 10, -10]`, `shadow-bias: -0.0003`, `shadow-normalBias: 0.025`) for crisp, high-definition shadows without acne.
      - **Pristine Paper Stage**: Removed experimental palm frond overlay to preserve a 100% clean, sunlit craft paper surface across both pages, featuring only natural 3D contact shadows anchored underneath physical props and polaroid frames.

## Consequences
- **Vastly Superior Ambiance**: Chapters 1 through 7 transform into rich, living 3D pop-up scenes with depth layers, regional landmarks, and interactive props.
- **Authentic Physical Scrapbook Feel**: The diorama feels grounded on a real wooden desk rather than floating in empty 3D space, with paper bulk, spine folds, and sunlight god rays.
- **Adorable Tactile Feedback**: Tapping the bicycle produces a bell chime, tapping the camera triggers a bright flash burst, and tapping the classic car triggers a playful honk and bounce.
- **Zero Regressions**: Architecture is fully data-driven; other chapters remain completely stable and can adopt custom scenery props with simple config entries.
