import { Suspense, useRef, useCallback, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CHAPTERS } from '../../data/chapters';
import ScrapbookSurface from './ScrapbookSurface';
import ChapterScene from './ChapterScene';
import OrigamiRocketNavigator from './OrigamiRocketNavigator';
import { launchNewYearFireworks } from '../../utils/newYearFireworks';
import { useScrollRig } from '../../hooks/useScrollRig';
import { useAudioCrossfade } from '../../hooks/useAudioCrossfade';
import JourneyPreloader from '../ui/JourneyPreloader';
import CoverScreen from '../ui/CoverScreen';
import CaptionCard from '../ui/CaptionCard';
import FinalLetterModal from '../ui/FinalLetterModal';
import OrientationGuard from '../ui/OrientationGuard';
import CuteAmbientParticles from '../ui/CuteAmbientParticles';
import { Volume2, VolumeX, Mail } from 'lucide-react';

/**
 * CameraRig — Implements dynamic "Swoop & Level" trajectory along the Z-axis:
 * - High isometric viewing angle (Y=7.6, Pitch=-28°) when parked at a chapter
 * - Level eye dive (Y=3.4, looking directly forward) when plunging between chapters
 */
function CameraRig({
  targetY,
  targetZ,
  lookAtTarget,
}: {
  targetY: number;
  targetZ: number;
  lookAtTarget: [number, number, number];
}) {
  const { camera } = useThree();
  const currentY = useRef(targetY);
  const currentZ = useRef(targetZ);
  const currentLookAt = useRef(new THREE.Vector3(...lookAtTarget));
  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);

  useFrame((state, delta) => {
    // Smooth mouse-move parallax: slightly sway camera based on pointer
    const targetMouseX = state.pointer.x * 0.45;
    const targetMouseY = state.pointer.y * 0.22;
    currentMouseX.current = THREE.MathUtils.damp(currentMouseX.current, targetMouseX, 2.5, delta);
    currentMouseY.current = THREE.MathUtils.damp(currentMouseY.current, targetMouseY, 2.5, delta);

    // Smooth cinematic dampening for silky 60fps tracking
    currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 4.5, delta);
    currentZ.current = THREE.MathUtils.damp(currentZ.current, targetZ, 4.5, delta);

    currentLookAt.current.x = THREE.MathUtils.damp(
      currentLookAt.current.x,
      lookAtTarget[0] + currentMouseX.current * 0.15,
      4.5,
      delta
    );
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, lookAtTarget[1], 4.5, delta);
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, lookAtTarget[2], 4.5, delta);

    camera.position.x = currentMouseX.current;
    camera.position.y = currentY.current + currentMouseY.current;
    camera.position.z = currentZ.current;
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

/**
 * Dynamic Neutral Daylight & Sunset Lighting that tracks camera depth along Z-axis
 * and smoothly warms into a radiant Golden Hour glow as the user enters Chapter 7.
 */
function ScrapbookLighting({
  targetZ,
  sunsetFactor = 0,
}: {
  targetZ: number;
  sunsetFactor?: number;
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const fillDirRef = useRef<THREE.DirectionalLight>(null);
  const fillPointRef = useRef<THREE.PointLight>(null);
  const sunsetRimRef = useRef<THREE.DirectionalLight>(null);
  const currentLightZ = useRef(targetZ);

  // Light color interpolation definitions
  const dayAmbient = useMemo(() => new THREE.Color('#FFFFFF'), []);
  const sunsetAmbient = useMemo(() => new THREE.Color('#FFF5EB'), []); // Warm luminous sunlit cream
  const dayDir = useMemo(() => new THREE.Color('#FFFFFF'), []);
  const sunsetDir = useMemo(() => new THREE.Color('#FFF1DF'), []); // Radiant golden-hour sun

  useFrame((_, delta) => {
    currentLightZ.current = THREE.MathUtils.damp(currentLightZ.current, targetZ, 3.5, delta);

    if (lightRef.current) {
      // Keep directional light high and overhead [5, 12, Z+8] so standing photo cards
      // only cast natural small contact drop shadows directly beneath themselves,
      // avoiding massive side-shadow blockages across the open scrapbook pages!
      const dirX = 5;
      const dirY = 12;
      const dirZ = currentLightZ.current + 8;

      lightRef.current.position.set(dirX, dirY, dirZ);
      lightRef.current.target.position.set(0, 0, currentLightZ.current);
      lightRef.current.target.updateMatrixWorld();
      lightRef.current.color.lerpColors(dayDir, sunsetDir, sunsetFactor);
      lightRef.current.intensity = THREE.MathUtils.lerp(1.45, 1.55, sunsetFactor);
    }

    if (ambientRef.current) {
      // Keep ambient light luminous and warm so the craft paper remains bright and clean
      ambientRef.current.color.lerpColors(dayAmbient, sunsetAmbient, sunsetFactor);
      ambientRef.current.intensity = THREE.MathUtils.lerp(1.15, 1.20, sunsetFactor);
    }

    if (fillDirRef.current) {
      fillDirRef.current.intensity = 0.45;
      fillDirRef.current.position.set(-4, 6, currentLightZ.current - 5);
    }

    if (fillPointRef.current) {
      fillPointRef.current.intensity = 0.25;
      fillPointRef.current.position.set(0, 4, currentLightZ.current - 4);
    }

    if (sunsetRimRef.current) {
      // Warm golden sunset horizon rim light outlining tops/backs of pop-up cutouts
      sunsetRimRef.current.position.set(0, 4.5, currentLightZ.current - 12);
      sunsetRimRef.current.target.position.set(0, 1, currentLightZ.current);
      sunsetRimRef.current.target.updateMatrixWorld();
      sunsetRimRef.current.intensity = sunsetFactor * 0.95;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1.15} color="#FFFFFF" />
      <directionalLight
        ref={lightRef}
        position={[5, 12, 8]}
        intensity={1.45}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={45}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <directionalLight
        ref={fillDirRef}
        position={[-4, 6, -5]}
        intensity={0.45}
        color="#FFFFFF"
      />
      <pointLight
        ref={fillPointRef}
        position={[0, 4, -4]}
        intensity={0.25}
        color="#FFFFFF"
      />
      {/* Warm Golden Sunset Horizon Rim Light */}
      <directionalLight
        ref={sunsetRimRef}
        position={[0, 5, -14]}
        intensity={0}
        color="#FF7548"
      />
    </>
  );
}

/**
 * DynamicAtmosphere — Smoothly transitions Three.js fog color from
 * daylight craft cream (#EDE5D8) to sunset horizon coral (#D56B5C)
 * as the user approaches Chapter 7.
 */
function DynamicAtmosphere({ sunsetFactor }: { sunsetFactor: number }) {
  const { scene } = useThree();
  const dayFog = useMemo(() => new THREE.Color('#EDE5D8'), []);
  const sunsetFog = useMemo(() => new THREE.Color('#D56B5C'), []);

  useFrame(() => {
    if (scene.fog) {
      scene.fog.color.lerpColors(dayFog, sunsetFog, sunsetFactor);
    }
  });

  return null;
}

export default function ScrapbookCanvas() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPreloaderMounted, setIsPreloaderMounted] = useState(true);
  const [isBookOpened, setIsBookOpened] = useState(false);
  const [isCoverMounted, setIsCoverMounted] = useState(true);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  const {
    scrollProgress,
    targetCameraY,
    targetCameraZ,
    lookAtTarget,
    activeChapterIndex,
    chapterProgress,
    isDiving,
    diveVelocity,
    scrollToChapter,
    isChapterActive,
    isChapterVisible,
    getChapterFoldProgress,
  } = useScrollRig(scrollContainerRef);

  const { isMuted, isAudioUnlocked, unlockAudio, toggleMute } =
    useAudioCrossfade(activeChapterIndex);

  const currentChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  // Sunset transition factor for Chapter 7: smoothly morphs from 0.0 (daylight craft cream)
  // at chapter 1-6 up to 1.0 (rich sunset twilight) between chapter 6 and 7 (5.15 to 6.0)
  const sunsetFactor = Math.min(
    1,
    Math.max(0, (chapterProgress - 5.15) / 0.85)
  );

  const handleOpenBook = useCallback(() => {
    setIsBookOpened(true);
    unlockAudio();
    scrollToChapter(0);
  }, [unlockAudio, scrollToChapter]);

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloaderMounted(false);
  }, []);

  const handleDismissCover = useCallback(() => {
    setIsCoverMounted(false);
  }, []);

  // Grand New Year Countdown Fireworks
  const handleFireworks = useCallback(() => {
    launchNewYearFireworks(() => {
      // Automatically present the final love letter stationery
      setIsLetterOpen(true);
    });
  }, []);

  return (
    // Outer scroll track: 700vh provides spacious, cinematic scrolling
    <div
      ref={scrollContainerRef}
      className="relative w-full"
      style={{ height: '700vh' }}
    >
      {/* Mobile Orientation Guard */}
      <OrientationGuard />

      {/* 0m -> 1.4y Milestone Journey Preloader */}
      {isPreloaderMounted && (
        <JourneyPreloader onComplete={handlePreloaderComplete} />
      )}

      {/* Intro Craft Paper Rocket Screen */}
      {isCoverMounted && (
        <CoverScreen
          onOpenBook={handleOpenBook}
          onDismiss={handleDismissCover}
          onUnlockAudio={unlockAudio}
        />
      )}

      {/* Sticky full-screen 3D viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Base Daylight Craft Cream Background */}
        <div className="absolute inset-0 bg-[#EDE5D8]" />

        {/* Grand Finale Sunset Sky Gradient Layer (matching Chapter 7 sunset-sea.png) */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #442445 0%, #6E3054 18%, #9E3E5F 34%, #C45568 48%, #DF715E 64%, #F39462 78%, #FABD6E 90%, #FFE196 100%)',
            opacity: sunsetFactor,
          }}
        />

        {/* Warm Golden Sunbeams Overlay (Daylight God Rays) */}
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse 120% 80% at 92% 8%, rgba(255, 230, 160, 0.28) 0%, rgba(255, 210, 130, 0.12) 35%, transparent 70%)',
            mixBlendMode: 'screen',
            opacity: 1 - sunsetFactor * 0.45,
          }}
        />

        {/* Sunset Twilight Golden Hour God Rays Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse 130% 90% at 85% 15%, rgba(255, 175, 85, 0.45) 0%, rgba(255, 120, 70, 0.22) 35%, rgba(180, 70, 90, 0.12) 65%, transparent 85%)',
            mixBlendMode: 'screen',
            opacity: sunsetFactor,
          }}
        />

        {/* Cozy Warm Paper Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(55, 38, 22, 0.24) 100%)',
          }}
        />

        {/* Sunset Twilight Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, rgba(50, 18, 38, 0.38) 100%)',
            opacity: sunsetFactor,
          }}
        />

        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.LinearToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 160,
            position: [0, 8, 12],
          }}
        >
          <fog attach="fog" args={['#EDE5D8', 22, 55]} />
          <DynamicAtmosphere sunsetFactor={sunsetFactor} />

          {/* Dynamic "Swoop & Level" Depth Camera Rig */}
          <CameraRig
            targetY={targetCameraY}
            targetZ={targetCameraZ}
            lookAtTarget={lookAtTarget}
          />

          {/* Depth-Tracking Neutral Daylight & Sunset Lighting */}
          <ScrapbookLighting
            targetZ={currentChapter.baseZ}
            sunsetFactor={sunsetFactor}
          />

          <Suspense fallback={null}>
            {/* Origami Paper Airplane Companion leading the dive */}
            <OrigamiRocketNavigator
              targetZ={targetCameraZ}
              chapterProgress={chapterProgress}
              isDiving={isDiving}
              diveVelocity={diveVelocity}
            />

            {/* Layered Craft Paper Stages along Z */}
            <ScrapbookSurface isChapterVisible={isChapterVisible} />

            {/* 7 Chapter Pop-up Dioramas with 1:1 Scrub Folding & Distance Culling */}
            {CHAPTERS.map((chapter, index) => (
              <ChapterScene
                key={chapter.id}
                chapter={chapter}
                isActive={isChapterActive(index)}
                isVisible={isChapterVisible(index)}
                foldProgress={getChapterFoldProgress(index)}
                hideTooltips={isLetterOpen}
                onTriggerFireworks={
                  chapter.id === 'ch7-pattaya' ? handleFireworks : undefined
                }
              />
            ))}
          </Suspense>

          {/* Soft Ground Contact Shadows following Camera Depth */}
          <ContactShadows
            position={[0, 0, currentChapter.baseZ]}
            opacity={0.45}
            scale={22}
            blur={2.2}
            far={6}
            color="#4A3320"
          />
        </Canvas>

        {/* Floating cozy pastel dust motes over the 3D world */}
        <CuteAmbientParticles />

        {/* Current Chapter Memory Note Card (Slides out smoothly when diving) */}
        {isBookOpened && (
          <CaptionCard chapter={currentChapter} isDiving={isDiving} />
        )}

        {/* Top-Right Controls: Sound & Letter */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          {/* Read Love Letter Button */}
          <button
            onClick={() => setIsLetterOpen(true)}
            className="px-4 py-2 bg-[#FFFDF9]/90 backdrop-blur-md rounded-full border border-[#EADBCC] text-[#5C4533] hover:text-[#2E1E12] hover:bg-white transition-all shadow-[0_4px_16px_rgba(95,65,40,0.08)] flex items-center gap-2 text-xs font-sans font-medium"
            title="เปิดจดหมาย"
          >
            <Mail size={15} className="text-[#F59E0B]" />
            <span>จดหมาย</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2.5 bg-[#FFFDF9]/90 backdrop-blur-md rounded-full border border-[#EADBCC] text-[#5C4533] hover:text-[#2E1E12] hover:bg-white transition-all shadow-[0_4px_16px_rgba(95,65,40,0.08)] flex items-center justify-center"
            title={isMuted ? 'เปิดเสียงเพลง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} className="text-[#F59E0B]" />}
          </button>
        </div>

        {/* Right Side: Dot Navigator */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3.5 bg-[#FFFDF9]/90 backdrop-blur-md p-2.5 rounded-full border border-[#EADBCC] shadow-[0_6px_20px_rgba(95,65,40,0.09)]">
          {CHAPTERS.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            return (
              <button
                key={ch.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAudioUnlocked) unlockAudio();
                  scrollToChapter(idx);
                }}
                className="group relative flex items-center justify-end"
              >
                {/* Tooltip Label */}
                <span className="absolute right-8 px-2.5 py-1 rounded-md bg-[#FFFDF9] text-[#4A3728] text-xs font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md border border-[#EADBCC]">
                  {ch.chapterNumber}. {ch.locationName}
                </span>
                {/* Dot Indicator */}
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-3.5 h-3.5 bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#FB7185] ring-4 ring-amber-400/30 scale-110 shadow-sm'
                      : 'w-2.5 h-2.5 bg-[#D8C7B5] hover:bg-[#F59E0B]/70'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Bottom Banner: Current Chapter & Scroll Progress */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
          <div className="px-5 py-2.5 bg-[#FFFDF9] backdrop-blur-md rounded-full border border-[#D5C2AF] shadow-[0_8px_24px_rgba(40,25,15,0.16)] flex items-center gap-3 pointer-events-auto">
            <span className="text-xs font-sans font-semibold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full">
              {activeChapterIndex + 1} / {CHAPTERS.length}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span className="text-base font-handwritten text-[#2E1E12] font-bold tracking-wide">
              {currentChapter.locationName}
            </span>
            {currentChapter.title && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span className="text-xs font-sans text-[#5C4533] font-medium hidden sm:inline">
                  {currentChapter.title}
                </span>
              </>
            )}
          </div>

          {/* Minimal Scroll Progress Bar */}
          <div className="w-48 h-1 bg-[#EADBCC] rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#FB7185] transition-all duration-150"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </div>

        {/* Final Love Letter Modal */}
        <FinalLetterModal
          isOpen={isLetterOpen}
          onClose={() => setIsLetterOpen(false)}
        />
      </div>
    </div>
  );
}
