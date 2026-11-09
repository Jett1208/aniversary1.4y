# ADR-0006: Dedicated Journey Preloader Screen Before Cover Screen

## Status
Accepted

## Context
ADR-0002 initially merged preloading directly into the Cover Screen. However, to enhance emotional storytelling and mark the 1.4-year anniversary milestone, the user requested a distinct introductory loading screen prior to reaching the Cover Screen ("หน้ากด").

The user requested a loading bar progressing from 0% to 100%, where the timeline labels advance from `0m` through each month (`1m`, `2m`, ..., `11m`) into year increments (`1.0y`, `1.1y`, `1.2y`, `1.3y`, `1.4y`).

## Decision
Implement a standalone `<JourneyPreloader />` component mounted as the initial view before `<CoverScreen />`:

1. **Milestone Progression**: Maps progress (0% – 100%) to `0m` through `11m`, transitioning to `1.0y` up to `1.4y`.
2. **Paced Milestone Progression & Continuous Glide**: Drives the progress bar and milestone counter using an extended, continuous 60fps sub-pixel glide over ~7.5–8.0 seconds (~480ms per milestone step). Even when local image caches resolve instantaneously, the counter steadily glides with aerodynamic wing float, ensuring the entire 1.4 years journey is experienced with spacious relaxation.
3. **Expanded Card Canvas & Prominent Scale**: The preloader container is scaled up to `max-w-xl` / `max-w-2xl` (~680px) with a taller, spacious progress bar, larger origami airplane with paper crease depth, and prominent milestone typography.
4. **Milestone Micro-Pop Animation**: Each time the milestone increments (e.g. `2m` -> `3m`), the milestone badge triggers a springy micro-pop animation while the airplane glides forward without stuttering.
5. **Safety Timeout**: Enforces a 9.5-second maximum timeout to guarantee the user is never stranded on the preloader screen.
6. **Preloader Rocket Smoke Wipe**: Upon reaching 1.4y (100%), holds for ~350ms, then the origami rocket launches upward, unleashing billowing white smoke cloud plumes that sweep across the viewport. The smoke burst smoothly transitions the scene into the Cover Screen ("หน้ากด"), creating a completely seamless theatrical handover.
7. **Minimalist Header**: Removes the subtitle line to keep the preloader presentation clean, focused, and elegant.
5. **Visual Language**: Employs the Warm Craft Theme (cream `#FAF4EB`, warm paper borders, subtle ambient particles) featuring a miniature Origami Paper Airplane advancing along the progress bar.
6. **Seamless Transition**: Upon reaching 1.4y (100%), holds for 400ms, then fades out smoothly to unveil the Cover Screen with its interactive rocket and "Click !" button.

## Consequences
- Clean separation of concerns: `<JourneyPreloader />` handles asset preloading and milestone visualization; `<CoverScreen />` handles user interaction and audio unlocking.
- Zero audio policy issues: Preloader runs silently; browser audio unlock remains strictly on the Cover Screen's user gesture ("Click !").
- Smooth, guaranteed entry flow across both fast and slow network connections.
