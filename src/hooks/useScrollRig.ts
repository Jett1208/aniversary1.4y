import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTERS, SPACING_Z } from '../data/chapters';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollRigState {
  scrollProgress: number;
  targetCameraX: number;
  targetCameraY: number;
  targetCameraZ: number;
  lookAtTarget: [number, number, number];
  activeChapterIndex: number;
  chapterProgress: number;
  isDiving: boolean;
  diveVelocity: number;
  scrollToChapter: (index: number) => void;
  isChapterActive: (index: number) => boolean;
  isChapterVisible: (index: number) => boolean;
  getChapterFoldProgress: (index: number) => number;
}

const CAMERA_BASE_Y = 7.6;
const CAMERA_BASE_OFFSET_Z = 11.2;
const SWOOP_DIP_DEPTH = 4.2;

export function useScrollRig(containerRef: React.RefObject<HTMLDivElement | null>): ScrollRigState {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  const numChapters = CHAPTERS.length;
  const maxBaseZ = -SPACING_Z * (numChapters - 1); // e.g. -132

  useEffect(() => {
    // Initialize Lenis smooth scroll with responsive inertia
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      ScrollTrigger.update();
      setScrollVelocity(Math.abs(e.velocity || 0));
    });

    // Sync RAF with GSAP
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    // Create ScrollTrigger timeline
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        // Calculate continuous chapter progress (0 to numChapters - 1)
        const chapterIdx = Math.min(
          numChapters - 1,
          Math.max(0, Math.round(p * (numChapters - 1)))
        );
        setActiveChapterIndex(chapterIdx);
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(updateRaf);
      lenis.destroy();
    };
  }, [containerRef, numChapters]);

  // Continuous chapter progress: 0.0 to (numChapters - 1)
  const chapterProgress = scrollProgress * (numChapters - 1);

  // Depth along Z: from 0 down to maxBaseZ
  const currentDepthZ = (scrollProgress * maxBaseZ);

  // Dynamic Swoop & Level Camera Trajectory
  // Sub-progress between adjacent chapters [0, 1]
  const subProgress = chapterProgress % 1;
  // Dip camera in Y when diving between chapters (peaks at subProgress = 0.5)
  const isTransitioning = chapterProgress < numChapters - 1 && subProgress > 0.05 && subProgress < 0.95;
  const dipAmount = isTransitioning ? Math.sin(subProgress * Math.PI) * SWOOP_DIP_DEPTH : 0;

  const targetCameraX = 0;
  const targetCameraY = CAMERA_BASE_Y - dipAmount;
  const targetCameraZ = currentDepthZ + CAMERA_BASE_OFFSET_Z;

  // LookAt target: looks ahead into the scene
  const lookAtTarget: [number, number, number] = [
    0,
    1.2 - (dipAmount * 0.15),
    currentDepthZ - 0.5,
  ];

  const isDiving = dipAmount > 0.8 || scrollVelocity > 1.2;

  // Check if chapter is close enough to camera to be considered active
  const isChapterActive = useCallback(
    (index: number) => {
      const dist = Math.abs(chapterProgress - index);
      return dist < 0.5;
    },
    [chapterProgress]
  );

  // 1:1 Scrub-linked fold progress: 1 = fully standing, 0 = folded flat
  const getChapterFoldProgress = useCallback(
    (index: number) => {
      const dist = Math.abs(chapterProgress - index);
      if (dist <= 0.35) return 1.0;
      if (dist >= 0.85) return 0.0;
      // Smooth cosine falloff
      const norm = (dist - 0.35) / 0.5;
      return 0.5 * (1 + Math.cos(norm * Math.PI));
    },
    [chapterProgress]
  );

  // Strict Single-Chapter Isolation & Dive-Triggered Reveal:
  // At rest (dist = 0 for active, >= 1 for others): only current chapter is visible.
  // When scrolling/diving between chapters (dist < 0.72): smoothly reveals adjacent chapter.
  const isChapterVisible = useCallback(
    (index: number) => {
      const dist = Math.abs(chapterProgress - index);
      return dist < 0.72;
    },
    [chapterProgress]
  );

  // Programmatic smooth scroll to chapter
  const scrollToChapter = useCallback(
    (index: number) => {
      if (!lenisRef.current || !containerRef.current) return;
      const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
      const targetProgress = index / (numChapters - 1);
      const targetScroll = targetProgress * totalHeight;

      lenisRef.current.scrollTo(targetScroll, {
        duration: 1.6,
      });
    },
    [containerRef, numChapters]
  );

  return {
    scrollProgress,
    targetCameraX,
    targetCameraY,
    targetCameraZ,
    lookAtTarget,
    activeChapterIndex,
    chapterProgress,
    isDiving,
    diveVelocity: scrollVelocity,
    scrollToChapter,
    isChapterActive,
    isChapterVisible,
    getChapterFoldProgress,
  };
}
