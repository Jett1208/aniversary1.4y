# ADR-0007: Chapter BGM Soundtrack Mapping, URL-Safe Slugs, and Dual-Asset Preloading

## Status
Accepted

## Context
Custom background music tracks were provided in the `public/audio/music/` directory to accompany each of the 7 location-based chapters in the scrapbook journey.

The source files had distinct names containing Thai script (`เกาะเกร็ด.mp3`, `ทรงวาด.mp3`, `ตลาดน้อย.mp3`, `สวนลุมพินี.mp3`, `ปาร์คนายเลิศ.mp3`, `พัทยา.mp3`) and varied nomenclature (`thelake.mp3` for The Lake Club, `ปาร์คนายเลิศ.mp3` for คาเฟ่นายปาร์คเลิศ).

Deploying files with raw non-ASCII characters introduces notable risks:
1. **URL Encoding / 404 Hazards**: Static web hosts (e.g. Vercel, Netlify, GitHub Pages, Nginx) and mobile browsers (notably WebKit / Safari on iOS) handle URI encoding of UTF-8 filenames inconsistently, often resulting in silent 404 load errors.
2. **Audio Streaming Latency**: The 7 audio files total ~6.7 MB. Streaming audio on-demand as each chapter is entered risks audio stutter or delay, breaking the emotional mood of the 3D pop-up animations.

## Decision
1. **Explicit 1:1 Chapter BGM Mapping**:
   - Chapter 1 (เกาะเกร็ด) $\rightarrow$ `bgm-kohkret.mp3`
   - Chapter 2 (ทรงวาด) $\rightarrow$ `bgm-songwat.mp3`
   - Chapter 3 (ตลาดน้อย) $\rightarrow$ `bgm-taladnoi.mp3`
   - Chapter 4 (สวนลุมพินี) $\rightarrow$ `bgm-lumphini.mp3`
   - Chapter 5 (คาเฟ่นายปาร์คเลิศ) $\rightarrow$ `bgm-nailert.mp3`
   - Chapter 6 (The Lake Club เมืองทอง) $\rightarrow$ `bgm-lakeclub.mp3`
   - Chapter 7 (พัทยา) $\rightarrow$ `bgm-pattaya.mp3`
2. **URL-Safe Slugs with Dual Retention**:
   - Created clean, ASCII-safe copies (`bgm-<slug>.mp3`) in both `public/audio/music/` and `public/audio/`.
   - Preserved all original source files in `public/audio/music/` to maintain data fidelity.
3. **Dual-Asset Preloading in JourneyPreloader**:
   - Expanded `JourneyPreloader` to preload all 7 chapter BGM tracks alongside high-resolution memory photos during the 7.8-second continuous milestone glide.
   - Leveraged browser media caching so tracks are ready in memory prior to the user reaching the Cover Screen.
4. **Web Audio API Engine & Synchronous Unlock on Launch**:
   - Disabled the temporary `AmbientChords` note-stepping synthesizer mock completely so that only authentic paired MP3 soundtracks play.
   - Initialized Howler with `html5: false` and `format: ['mp3']` to decode audio cleanly via Web Audio API. This enables sample-accurate volume fading (gain-node linear ramping) and gapless looping without HTML5 `<audio>` pooling limits.
   - Bound audio context unlock directly to the user's initial "Click !" launch button gesture on the Cover Screen, ensuring immediate browser audio playback authorization before entering Chapter 1.
   - Cleared internal Howl references upon unmount to eliminate React StrictMode state collision.

## Consequences
- **Rock-Solid Reliability**: Completely avoids 404 and encoding bugs across all browsers, operating systems, and deployment targets.
- **Immediate Chapter 1 Playback**: Clicking "Click !" directly unlocks Web Audio so Koh Kret's music begins playing smoothly as the smoke clears into the diorama.
- **Elimination of Mock Tones**: The confusing note-stepping sine waves are eliminated permanently in favor of authentic studio music.
