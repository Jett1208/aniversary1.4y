import { useEffect, useState, useRef } from 'react';
import { CHAPTERS } from '../../data/chapters';
import CuteAmbientParticles from './CuteAmbientParticles';

interface JourneyPreloaderProps {
  onComplete: () => void;
}

const MILESTONES = [
  '0m',
  '1m',
  '2m',
  '3m',
  '4m',
  '5m',
  '6m',
  '7m',
  '8m',
  '9m',
  '10m',
  '11m',
  '1.0y',
  '1.1y',
  '1.2y',
  '1.3y',
  '1.4y',
];

/**
 * Detailed Origami Paper Airplane with 3D folding facets and launch capability
 */
function ProminentPaperPlane({ isLaunching }: { isLaunching: boolean }) {
  return (
    <div
      className={`select-none pointer-events-none transition-all duration-700 ${
        isLaunching
          ? '-translate-y-[130vh] translate-x-20 scale-150 -rotate-45 ease-in'
          : 'transform rotate-12 -translate-y-1.5'
      }`}
      style={{
        transitionTimingFunction: isLaunching
          ? 'cubic-bezier(0.45, 0, 0.2, 1)'
          : undefined,
      }}
    >
      <svg
        viewBox="0 0 52 42"
        className="w-10 h-8 sm:w-12 sm:h-10 drop-shadow-[0_4px_10px_rgba(70,45,25,0.3)]"
        fill="none"
      >
        {/* Soft depth shadow underneath plane */}
        <polygon
          points="50,21 8,5 21,21 8,37"
          fill="rgba(50,30,15,0.18)"
          filter="blur(2px)"
          transform="translate(1.5, 3)"
        />
        {/* Top Main Wing (Bright folded paper highlight) */}
        <polygon points="50,21 8,5 21,21" fill="#FFFFFF" />
        {/* Bottom Main Wing (Subtly shaded paper crease) */}
        <polygon points="50,21 8,37 21,21" fill="#F3ECE1" />
        {/* Center Fold Crease Line */}
        <line x1="8" y1="21" x2="50" y2="21" stroke="#D1C0AC" strokeWidth="1.4" />
        {/* Underbody origami stabilizer fold */}
        <polygon points="21,21 13,31 29,21" fill="#DFD2C0" />
        {/* Wingtip aerodynamic accent */}
        <polygon points="50,21 44,18 42,21" fill="#FFFBF5" />
      </svg>
    </div>
  );
}

export default function JourneyPreloader({ onComplete }: JourneyPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [transitionStage, setTransitionStage] = useState<
    'gliding' | 'launching' | 'clearing'
  >('gliding');
  const [milestoneIndex, setMilestoneIndex] = useState(0);

  const animFrameRef = useRef<number | null>(null);
  const isFinishedRef = useRef(false);
  const assetsReadyRef = useRef(false);

  useEffect(() => {
    // 1. Gather all primary image & audio URLs across chapters
    const imageUrls = Array.from(
      new Set([
        '/images/ch1-kohkret/photo-2.png',
        ...CHAPTERS.flatMap((ch) => [
          ...ch.layers.map((l) => l.imageUrl),
          ch.polaroid.frontImageUrl,
          ...(ch.prop.imageUrl ? [ch.prop.imageUrl] : []),
          ...(ch.sceneryCutouts?.map((s) => s.imageUrl) || []),
        ]),
      ])
    );
    const audioUrls = Array.from(
      new Set(CHAPTERS.map((ch) => ch.bgmUrl).filter(Boolean))
    );

    let loadedCount = 0;
    const totalAssets = imageUrls.length + audioUrls.length || 1;

    const markLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= totalAssets) {
        assetsReadyRef.current = true;
      }
    };

    // Asynchronously preload all images into browser cache
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = markLoaded;
      img.onerror = markLoaded;
    });

    // Asynchronously preload chapter BGM tracks into browser audio cache
    audioUrls.forEach((url) => {
      fetch(url)
        .then(() => markLoaded())
        .catch(() => markLoaded());
    });

    // 2. Continuous Milestone Glide: 7.8 seconds for slow, relaxing, ultra-smooth progression
    const startTime = performance.now();
    const GLIDE_DURATION = 7800; // 7.8 seconds
    const SAFETY_TIMEOUT = 9500; // 9.5 seconds max limit

    const updateLoop = (now: number) => {
      const elapsed = now - startTime;

      // Frame-by-frame continuous 60fps linear glide
      const rawRatio = Math.min(1, elapsed / GLIDE_DURATION);
      const targetPercent = rawRatio * 100;

      // Compute current milestone index smoothly
      const currentIdx = Math.min(
        MILESTONES.length - 1,
        Math.floor(rawRatio * MILESTONES.length)
      );
      setMilestoneIndex(currentIdx);

      // Check if finished (time elapsed + assets cached, or safety timeout hit)
      if (
        (elapsed >= GLIDE_DURATION && assetsReadyRef.current) ||
        elapsed >= SAFETY_TIMEOUT
      ) {
        setProgress(100);
        setMilestoneIndex(MILESTONES.length - 1);

        if (!isFinishedRef.current) {
          isFinishedRef.current = true;

          // Step 1: Pause briefly at 1.4y (350ms) to savor 100% completion
          setTimeout(() => {
            // Step 2: Rocket launches upward & White Smoke Clouds erupt across viewport
            setTransitionStage('launching');

            // Step 3: Smoke blankets screen -> begin clearing into CoverScreen
            setTimeout(() => {
              setTransitionStage('clearing');

              // Step 4: Smoke fully dissipated -> unmount cleanly
              setTimeout(() => {
                onComplete();
              }, 700);
            }, 650);
          }, 350);
        }
        return;
      }

      // If glide reaches near 100% before assets finish, softly pause at 98%
      const effectiveProgress =
        rawRatio >= 0.98 && !assetsReadyRef.current ? 98 : targetPercent;

      setProgress(effectiveProgress);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [onComplete]);

  const currentMilestone = MILESTONES[milestoneIndex] || '0m';
  const isLaunching =
    transitionStage === 'launching' || transitionStage === 'clearing';
  const isClearing = transitionStage === 'clearing';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 select-none overflow-hidden transition-all duration-700 ${
        isClearing
          ? 'bg-transparent pointer-events-none'
          : 'bg-[#FAF4EB]'
      }`}
      style={{
        backgroundImage: isClearing
          ? 'none'
          : `radial-gradient(circle at 50% 45%, rgba(255, 243, 226, 0.95) 0%, rgba(246, 235, 220, 0.98) 55%, #E5D5C1 100%)`,
      }}
    >
      {/* Ambient floating dust particles (active until clearing) */}
      {!isClearing && <CuteAmbientParticles />}

      {/* Main Expanded Preloader Card: max-w-xl to max-w-2xl */}
      <div
        className={`relative z-20 w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-[#FFFDF9] border border-[#E8DACB] rounded-3xl sm:rounded-[36px] p-8 sm:p-11 md:p-14 shadow-[0_22px_55px_rgba(95,65,40,0.12),0_4px_14px_rgba(95,65,40,0.06)] text-center transition-all duration-600 ${
          isLaunching ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Subtle Decorative Header Tag */}
        <div className="text-xs sm:text-sm font-sans text-amber-900/40 tracking-[0.3em] uppercase font-bold mb-3">
          ✦ PREPARING OUR MEMORIES ✦
        </div>

        {/* Warm Handwritten Title - Clean & Minimalist without subtitle */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-handwritten text-[#4A3728] tracking-wide mb-8 sm:mb-10 leading-tight">
          Loading our memories...
        </h2>

        {/* Milestone Journey Header: Matching User Sketch "0m ─────────▸ 1.4y" */}
        <div className="relative w-full px-2 sm:px-4 mb-4 sm:mb-5">
          <div className="flex items-center justify-between font-sans font-bold text-[#8C6D52]">
            <span className="px-3.5 py-1 rounded-xl bg-[#F4EBE0] text-[#634832] text-sm sm:text-base shadow-inner border border-[#E4D7C8]">
              0m
            </span>

            {/* Connecting Journey Direction Line with Arrow */}
            <div className="relative flex-1 mx-4 sm:mx-6 flex items-center justify-center">
              <div className="w-full h-1 bg-gradient-to-r from-[#D8C7B3] via-[#E4A265] to-[#FB7185] opacity-70 rounded-full" />
              <span className="absolute right-0 -top-[9px] sm:-top-[11px] text-[#FB7185] text-sm sm:text-base font-black">
                ▸
              </span>
            </div>

            <span className="px-3.5 py-1 rounded-xl bg-[#FFE9D6] text-[#E0533C] text-sm sm:text-base shadow-inner border border-[#FFD5BA] font-extrabold">
              1.4y
            </span>
          </div>
        </div>

        {/* Progress Bar Container - Taller & Longer */}
        <div className="relative w-full my-6 sm:my-8">
          {/* Progress Bar Track */}
          <div className="relative w-full h-7 sm:h-8 md:h-9 bg-[#EFE6DC] rounded-full p-1 sm:p-1.5 border-2 border-[#DFCDBB] shadow-inner overflow-hidden">
            {/* Soft Warm Animated Gradient Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#FB7185] shadow-[0_3px_12px_rgba(249,115,22,0.45)] relative"
              style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
            >
              {/* Subtle glossy highlight shimmer on top edge of bar */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full pointer-events-none" />
            </div>
          </div>

          {/* Floating Miniature Paper Plane & Active Milestone Bubble */}
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{
              left: `${Math.max(5, Math.min(95, progress))}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Milestone Text Bubble above plane with Micro-Pop spring */}
            <div
              key={currentMilestone}
              className={`absolute -top-14 sm:-top-16 px-4 py-1.5 rounded-full bg-[#3D2C1E] text-white text-xs sm:text-sm font-bold shadow-xl tracking-wider whitespace-nowrap flex items-center gap-2 animate-milestone-pop border border-[#6D5441] transition-opacity duration-300 ${
                isLaunching ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <span className="text-amber-300 font-extrabold text-sm sm:text-base">
                {currentMilestone}
              </span>
              <span className="text-xs text-amber-100/75 font-normal">
                ({Math.round(progress)}%)
              </span>
            </div>

            {/* Flying Detailed Origami Paper Airplane with Launch Animation */}
            <ProminentPaperPlane isLaunching={isLaunching} />
          </div>
        </div>

        {/* Footnote status */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2.5 text-xs sm:text-sm text-[#8C7665] font-sans font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          <span>
            {progress < 100
              ? `กำลังเดินทางสู่ ${currentMilestone}...`
              : 'ครบ 1.4 ปีแล้ว ออกเดินทาง!'}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEAMLESS ROCKET SMOKE CLOUD SCREEN WIPE TRANSITION           */}
      {/* ============================================================ */}
      {transitionStage !== 'gliding' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Outward Flaring Smoke Plumes following Rocket trajectory */}
          <div
            className={`absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-96 transition-all duration-700 ease-out ${
              isLaunching ? 'opacity-90 scale-125 translate-y-8' : 'opacity-0 scale-50'
            }`}
          >
            {/* Left Smoke Plume Flare */}
            <div className="absolute top-10 left-4 w-36 h-64 bg-gradient-to-bl from-white/95 via-[#FFFBF5]/90 to-transparent rounded-full blur-xl transform -rotate-25 scale-y-125" />

            {/* Right Smoke Plume Flare */}
            <div className="absolute top-10 right-4 w-36 h-64 bg-gradient-to-br from-white/95 via-[#FFFBF5]/90 to-transparent rounded-full blur-xl transform rotate-25 scale-y-125" />
          </div>

          {/* Full Screen Soft White Cloud Burst (Seamless Screen Wipe) */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
              transitionStage === 'launching'
                ? 'opacity-100 scale-100'
                : transitionStage === 'clearing'
                ? 'opacity-0 scale-150'
                : 'opacity-0 scale-50'
            }`}
          >
            <div className="relative w-[140vw] h-[140vh] flex items-center justify-center">
              <div className="absolute w-[85vw] h-[85vw] max-w-[950px] max-h-[950px] bg-[#FFFFFF] rounded-full blur-2xl opacity-98" />
              <div className="absolute -top-10 left-10 w-[75vw] h-[75vw] max-w-[850px] max-h-[850px] bg-[#FFFDF9] rounded-full blur-3xl opacity-95" />
              <div className="absolute -bottom-10 right-10 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-[#FAF6F0] rounded-full blur-3xl opacity-95" />
              <div className="absolute top-1/3 -left-20 w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] bg-[#FFF8EE] rounded-full blur-2xl opacity-92" />
              <div className="absolute top-1/4 -right-20 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-[#FFFDF8] rounded-full blur-2xl opacity-92" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
