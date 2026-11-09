import { useState } from 'react';
import { ANNIVERSARY_META } from '../../data/chapters';
import { sfx } from '../../utils/sfx';
import CuteAmbientParticles from './CuteAmbientParticles';

interface CoverScreenProps {
  onOpenBook: () => void;
  onDismiss?: () => void;
  onUnlockAudio?: () => void;
}

/**
 * 3D Origami Paper Rocket / Airplane Component (Matching User Sketch 1 & 2)
 */
function OrigamiPaperRocket({ isLaunching }: { isLaunching: boolean }) {
  return (
    <div
      className={`relative cursor-pointer transition-transform duration-700 select-none ${
        isLaunching
          ? '-translate-y-[140vh] scale-125 ease-in'
          : 'hover:scale-105 active:scale-95 animate-gentle-float'
      }`}
      style={{
        transitionTimingFunction: isLaunching ? 'cubic-bezier(0.45, 0, 0.2, 1)' : undefined,
      }}
    >
      <svg
        viewBox="0 0 120 160"
        className="w-24 h-32 sm:w-28 sm:h-36 drop-shadow-[0_12px_24px_rgba(70,45,25,0.22)]"
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
  const [launchStage, setLaunchStage] = useState<'idle' | 'ignite' | 'launching' | 'clearing'>(
    'idle'
  );

  const handleLaunch = () => {
    if (launchStage !== 'idle') return;

    // Immediately unlock browser audio context synchronously on user click
    if (onUnlockAudio) {
      onUnlockAudio();
    }

    // Play synthesized rocket whoosh SFX
    sfx.playRocketWhoosh();

    // Stage 1: Quick playful anticipation wiggle
    setLaunchStage('ignite');

    setTimeout(() => {
      // Stage 2: Rocket shoots straight up + white smoke plumes explode outward
      setLaunchStage('launching');
    }, 120);

    setTimeout(() => {
      // Stage 3: Screen is fully blanketed by white clouds -> trigger 3D mount & audio unlock
      onOpenBook();
      setLaunchStage('clearing');
    }, 750);

    setTimeout(() => {
      // Stage 4: Smoke fully dissipated -> unmount cover cleanly
      if (onDismiss) {
        onDismiss();
      }
    }, 1450);
  };

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
      {/* Floating cozy pastel dust motes */}
      {!isClearing && <CuteAmbientParticles />}

      {/* Main Cute Postcard / Craft Card (Matching User Sketch 1) */}
      <div
        className={`relative z-20 w-full max-w-sm sm:max-w-md transition-all duration-600 ${
          isLaunching ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Soft Card Shadow */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-10 bg-[#7A5A40]/15 blur-xl rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Pastel Craft Envelope / Postcard Container */}
        <div className="relative w-full bg-[#FFFDF9] border border-[#EADBCC] rounded-3xl p-6 sm:p-9 shadow-[0_15px_35px_rgba(95,65,40,0.08),0_2px_8px_rgba(95,65,40,0.04)] text-center overflow-hidden">
          {/* Subtle Decorative Pastel Corner Stitching */}
          <div className="absolute top-3 left-4 text-xs font-sans text-amber-800/40 tracking-widest uppercase">
            ✦ OUR STORY ✦
          </div>
          <div className="absolute top-3 right-4 text-xs font-sans text-amber-800/40 tracking-widest">
            № 1.4 YRS
          </div>

          {/* Cute Main Title */}
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold font-handwritten text-[#4A3728] tracking-wide mb-3 leading-tight">
            {ANNIVERSARY_META.coverTitle}
          </h1>

          {/* Interactive Origami Rocket / Plane Centerpiece (User Sketch 1) */}
          <div
            onClick={handleLaunch}
            className="flex flex-col items-center justify-center my-1 cursor-pointer group"
            title="Click to launch!"
          >
            <OrigamiPaperRocket isLaunching={isLaunching} />
          </div>

          {/* Cute Couple Polaroid with Pastel Washi Tape */}
          <div className="relative w-32 sm:w-36 h-40 sm:h-44 mx-auto my-4 bg-[#FFFFFF] p-2 pb-6 rounded-lg shadow-[0_8px_20px_rgba(80,50,30,0.12)] border border-[#EFE6DC] transform -rotate-1 transition-transform hover:rotate-0 hover:scale-105">
            {/* Cute Pastel Peach Washi Tape at Top */}
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 shadow-sm opacity-85 rotate-1"
              style={{
                backgroundColor: 'rgba(251, 191, 160, 0.85)',
                maskImage:
                  'repeating-linear-gradient(90deg, #000 0px, #000 3px, transparent 3px, transparent 4px)',
              }}
            />

            <img
              src="/images/ch1-kohkret/photo-2.png"
              alt="Our Photo"
              className="w-full h-26 sm:h-28 object-cover rounded-sm shadow-inner"
            />
            <span className="block text-[10px] sm:text-[11px] font-sans text-[#7A695B] mt-1.5 font-medium tracking-wide">
              15 July 2025
            </span>
          </div>

          {/* Cute "Click !" Launch Button (Matching Small Box in Sketch 1) */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleLaunch}
              className="group relative px-9 py-2.5 bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#FB7185] hover:from-[#E48B00] hover:to-[#F43F5E] text-white rounded-full font-sans font-semibold text-sm tracking-[0.18em] uppercase shadow-[0_6px_18px_rgba(245,158,11,0.35)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.48)] transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Click !</span>
            </button>
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
