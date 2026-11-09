# ADR-0002: Preload All Assets with Merged Loading/Cover Screen

## Status
Accepted

## Context
The site contains ~21-25 photo card / pop-up images (WebP, 1024px), 7 polaroid images, 7 BGM tracks (~2-4 MB each), and 9-10 SFX files. Total estimated payload: 40-60 MB.

Two strategies were considered:
1. **Preload everything** at startup behind a loading screen
2. **Lazy-load per chapter** — load assets as the user scrolls toward each chapter

## Decision
**Preload all assets** during the intro/cover screen, which doubles as both the loading indicator and the scrapbook cover.

## Rationale
- This is a **surprise gift website**, not a utility app. First-load speed matters less than **zero interruption** during the experience. Any loading stutter mid-scroll would break the emotional flow.
- The cover screen already requires a user tap (to unlock browser audio autoplay policy), so the user naturally waits while assets load.
- Merging the loading screen with the cover page means the user sees the scrapbook title and a progress bar (styled as washi tape peeling off) — setting the mood immediately.
- Total payload of ~30-50 MB is acceptable for a one-time experience on Wi-Fi (Desktop or home iPad).

## Consequences
- A `usePreloader` hook must track loading progress across Three.js textures (via `useTexture`) and Howler.js audio sprites.
- The "Open Book" button is disabled until all assets report ready.
- No lazy-loading logic or suspense boundaries are needed for chapter assets.
- Users on very slow connections may wait 10-20 seconds — the progress bar makes this tolerable.
