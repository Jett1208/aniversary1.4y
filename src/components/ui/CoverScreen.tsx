import { useState, useRef, useEffect, useCallback } from 'react';
import { ANNIVERSARY_META } from '../../data/chapters';
import { sfx } from '../../utils/sfx';
import CuteAmbientParticles from './CuteAmbientParticles';

interface CoverScreenProps {
  onOpenBook: () => void;
  onDismiss?: () => void;
  onUnlockAudio?: () => void;
}

const HOLD_DURATION_MS = 1100;
const CIRCLE_RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * 3D Origami Paper Rocket / Airplane Component (Matching User Sketch 1 & 2)
 */
function OrigamiPaperRocket({
  isLaunching,
  isHolding,
}: {
  isLaunching: boolean;
  isHolding: boolean;
}) {
  return (
    <div
      className={`relative select-none transition-transform duration-300 ${
        isLaunching
          ? '-translate-y-[140vh] scale-125 ease-in duration-700'
          : isHolding
          ? 'scale-110 drop-shadow-[0_16px_32px_rgba(245,158,11,0.35)]'
          : 'hover:scale-105 animate-gentle-float'
      }`}
      style={{
        transitionTimingFunction: isLaunching ? 'cubic-bezier(0.45, 0, 0.2, 1)' : undefined,
      }}
    >
      <svg
        viewBox="0 0 120 160"
        className="w-28 h-36 sm:w-32 sm:h-40 drop-shadow-[0_14px_28px_rgba(70,45,25,0.22)]"
        fill="none"
      >
        {/* Soft shadow cast by the airplane on the card */}
        <polygon
          points="60,20 18,125 60,105 102,125"
          fill="rgba(50,30,15,0.12)"
          filter="blur(3px)"
          transform="translate(4, 10)"
        />

        {/* Left Wing (Bright folded paper highlight) */}
        <polygon points="60,10 14,120 60,100" fill="#FFFFFF" />

        {/* Right Wing (Slightly shaded paper for 3D crease) */}
        <polygon points="60,10 106,120 60,100" fill="#EDE7DC" />

        {/* Center Fold Crease Line */}
        <line x1="60" y1="10" x2="60" y2="100" stroke="#D3C7B6" strokeWidth="1.5" />

        {/* Left Origami Fin / Stabilizer */}
        <polygon points="60,100 24,116 46,142 60,122" fill="#E2D9CC" />

        {/* Right Origami Fin / Stabilizer */}
        <polygon points="60,100 96,116 74,142 60,122" fill="#CFBEAA" />

        {/* Center Paper Tip / Jet Exhaust Nozzle */}
        <polygon points="55,122 65,122 60,134" fill="#BFAFA0" />
      </svg>
    </div>
  );
}

export default function CoverScreen({ onOpenBook, onDismiss, onUnlockAudio }: CoverScreenProps) {
  const [launchStage, setLaunchStage] = useState<'idle' | 'ignite' | 'launching' | 'clearing'>('idle');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Trigger the launch sequence once hold requirement is satisfied
  const triggerLaunch = useCallback(() => {
    if (launchStage !== 'idle') return;

    if (onUnlockAudio) {
      onUnlockAudio();
    }

    sfx.playRocketWhoosh();
    setLaunchStage('ignite');

    setTimeout(() => {
      setLaunchStage('launching');
    }, 120);

    setTimeout(() => {
      onOpenBook();
      setLaunchStage('clearing');
    }, 750);

    setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, 1450);
  }, [launchStage, onUnlockAudio, onOpenBook, onDismiss]);

  const startHold = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        // Prevent default touch scrolling/long-press menu
        if (e.cancelable) e.preventDefault();
      }
      if (launchStage !== 'idle') return;

      if (onUnlockAudio) {
        onUnlockAudio();
      }

      setIsHolding(true);
      holdStartRef.current = performance.now();

      const tick = (now: number) => {
        if (!holdStartRef.current) return;
        const elapsed = now - holdStartRef.current;
        const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
        setHoldProgress(progress);

        if (progress >= 100) {
          setIsHolding(false);
          holdStartRef.current = null;
          triggerLaunch();
        } else {
          animFrameRef.current = requestAnimationFrame(tick);
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [launchStage, onUnlockAudio, triggerLaunch]
  );

  const endHold = useCallback(() => {
    if (launchStage !== 'idle') return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    holdStartRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  }, [launchStage]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const isLaunching = launchStage === 'launching' || launchStage === 'clearing';
  const isClearing = launchStage === 'clearing';

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 select-none overflow-hidden transition-all duration-700 ${
        isClearing ? 'bg-transparent pointer-events-none' : 'bg-[#FAF4EB]'
      }`}
      style={{
        backgroundImage: isClearing
          ? 'none'
          : `radial-gradient(circle at 50% 40%, rgba(255, 238, 217, 0.75) 0%, rgba(246, 235, 220, 0.95) 70%, #E8DAC8 100%)`,
      }}
    >
      {/* Cover Background Video (Ambient Looping Wallpaper) */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${
          isClearing ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          src="/video/Background.mp4"
        />
      </div>

      {/* Floating cozy pastel dust motes */}
      {!isClearing && <CuteAmbientParticles />}

      {/* Main Solid Warm Cream Craft Card Container */}
      <div
        className={`relative z-20 w-full max-w-sm sm:max-w-md transition-all duration-600 ${
          isLaunching ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Soft Ambient Card Glow & Shadow for clean contrast against bright meadow */}
        <div
          className="absolute -inset-4 bg-amber-950/15 rounded-[36px] blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Soft Card Shadow */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-10 bg-[#7A5A40]/20 blur-xl rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Pastel Craft Envelope / Postcard Container (Solid Cream - No Glassmorphism) */}
        <div className="relative w-full bg-[#FFFDF9] border border-[#EADBCC] rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_rgba(80,50,30,0.14),0_2px_8px_rgba(80,50,30,0.06)] text-center overflow-hidden">
          {/* Subtle Decorative Pastel Corner Stitching */}
          <div className="absolute top-4 left-5 text-xs font-sans text-amber-800/45 tracking-widest uppercase font-medium">
            ✦ OUR STORY ✦
          </div>
          <div className="absolute top-4 right-5 text-xs font-sans text-amber-800/45 tracking-widest font-medium">
            № 1.4 YRS
          </div>

          {/* Cute Main Title */}
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold font-handwritten text-[#4A3728] tracking-wide mb-4 leading-tight">
            {ANNIVERSARY_META.coverTitle}
          </h1>

          {/* Interactive Hero Origami Rocket with Circular Hold-to-Launch Ring */}
          <div className="relative my-6 flex flex-col items-center justify-center">
            <div
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              onTouchCancel={endHold}
              onContextMenu={(e) => e.preventDefault()}
              className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center cursor-pointer select-none group touch-none"
              title="กดค้างที่จรวดเพื่อออกเดินทาง"
            >
              {/* Circular Charging Gauge SVG */}
              <svg
                viewBox="0 0 180 180"
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              >
                <defs>
                  <linearGradient id="rocketHoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#FB7185" />
                  </linearGradient>
                </defs>

                {/* Subtle Background Track */}
                <circle
                  cx="90"
                  cy="90"
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="#EFE6DA"
                  strokeWidth="3.5"
                  strokeDasharray="4 6"
                />

                {/* Dynamic Hold Progress Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="url(#rocketHoldGradient)"
                  strokeWidth={isHolding ? '4.5' : '3.5'}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - holdProgress / 100)}
                  style={{
                    filter: isHolding ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.55))' : 'none',
                    transition: isHolding ? 'none' : 'stroke-dashoffset 0.25s ease-out',
                  }}
                />
              </svg>

              {/* The Hero Origami Rocket Centerpiece */}
              <OrigamiPaperRocket
                isLaunching={isLaunching}
                isHolding={isHolding}
              />
            </div>

            {/* Instruction Prompt / Status Feedback */}
            <div className="mt-3 flex flex-col items-center select-none pointer-events-none">
              <span
                className={`text-xs sm:text-sm font-sans tracking-wider transition-all duration-300 font-medium ${
                  isHolding
                    ? 'text-[#F97316] scale-105 font-semibold'
                    : 'text-[#8A7565] animate-pulse'
                }`}
              >
                {isLaunching
                  ? 'ทะยานสู่อวกาศ! 🚀'
                  : isHolding
                  ? `กำลังเริ่มออกเดินทาง... ${Math.round(holdProgress)}%`
                  : 'กดค้างที่จรวดเพื่อออกเดินทาง ✦'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* WHITE SMOKE CLOUD SCREEN WIPE TRANSITION (Matching User Sketch 2) */}
      {/* ============================================================ */}
      {launchStage !== 'idle' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Outward Flaring Smoke Plumes (/ \ shaped trails matching drawing) */}
          <div
            className={`absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-96 transition-all duration-700 ease-out ${
              isLaunching ? 'opacity-90 scale-125 translate-y-12' : 'opacity-0 scale-50'
            }`}
          >
            {/* Left Smoke Plume Flare (Curving downward-left '/') */}
            <div className="absolute top-10 left-4 w-32 h-64 bg-gradient-to-bl from-white/95 via-[#FFFBF5]/90 to-transparent rounded-full blur-xl transform -rotate-25 scale-y-125" />

            {/* Right Smoke Plume Flare (Curving downward-right '\') */}
            <div className="absolute top-10 right-4 w-32 h-64 bg-gradient-to-br from-white/95 via-[#FFFBF5]/90 to-transparent rounded-full blur-xl transform rotate-25 scale-y-125" />
          </div>

          {/* Full Screen Puffy White Cloud Burst (Wiping the entire viewport) */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
              launchStage === 'launching'
                ? 'opacity-100 scale-100'
                : launchStage === 'clearing'
                ? 'opacity-0 scale-150'
                : 'opacity-0 scale-50'
            }`}
          >
            {/* Cluster of large soft white cloud circles that sweep across the screen */}
            <div className="relative w-[140vw] h-[140vh] flex items-center justify-center">
              <div className="absolute w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] bg-[#FFFFFF] rounded-full blur-2xl opacity-98" />
              <div className="absolute -top-10 left-10 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-[#FFFDF9] rounded-full blur-3xl opacity-95" />
              <div className="absolute -bottom-10 right-10 w-[75vw] h-[75vw] max-w-[850px] max-h-[850px] bg-[#FAF6F0] rounded-full blur-3xl opacity-95" />
              <div className="absolute top-1/3 -left-20 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[#FFF8EE] rounded-full blur-2xl opacity-90" />
              <div className="absolute top-1/4 -right-20 w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] bg-[#FFFDF8] rounded-full blur-2xl opacity-90" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
