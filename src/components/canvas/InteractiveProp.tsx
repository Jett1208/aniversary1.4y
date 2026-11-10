import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import type { InteractivePropConfig } from '../../data/chapters';
import { sfx } from '../../utils/sfx';

interface InteractivePropProps {
  prop: InteractivePropConfig;
  themeColor: string;
  onTriggerFireworks?: () => void;
  hideTooltip?: boolean;
}

/**
 * DieCutIllustratedMesh — Renders an authentic physical paper cutout of the prop
 * (e.g., the cute vintage pastel bicycle with basket for Koh Kret).
 */
function DieCutIllustratedMesh({
  imageUrl,
  width,
  height,
  rotationZ = 0,
  hovered,
  meshRef,
}: {
  imageUrl: string;
  width: number;
  height: number;
  rotationZ?: number;
  hovered: boolean;
  meshRef: React.RefObject<THREE.Mesh>;
}) {
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Soft contact shadow underneath the wheels on the scrapbook paper
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    gradient.addColorStop(0, 'rgba(40, 25, 15, 0.7)');
    gradient.addColorStop(0.5, 'rgba(50, 32, 20, 0.35)');
    gradient.addColorStop(1, 'rgba(60, 42, 24, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group rotation={[0, 0, rotationZ]}>
      {/* Ground contact shadow under wheels */}
      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[width * 1.05, 0.62, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </mesh>

      {/* Main die-cut illustrated standing paper cutout */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        renderOrder={12}
        scale={hovered ? [1.06, 1.06, 1.06] : [1, 1, 1]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          roughness={0.7}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * BadgeCoinMesh — Classic 3D embossed coin badge fallback for chapters
 * that use emoji icons.
 */
function BadgeCoinMesh({
  themeColor,
  actionType,
  label,
  badgeRef,
}: {
  themeColor: string;
  actionType: string;
  label: string;
  badgeRef: React.RefObject<THREE.Mesh>;
}) {
  const badgeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Outer scalloped/stitched border
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(256, 256, 240, 0, Math.PI * 2);
    ctx.fill();

    // Inner colored ring
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.fill();

    // Inner paper cream circle
    ctx.fillStyle = '#FAF7F0';
    ctx.beginPath();
    ctx.arc(256, 256, 195, 0, Math.PI * 2);
    ctx.fill();

    const emojiMap: Record<string, string> = {
      'pottery-spin': '🚲',
      'camera-flash': '📸',
      'car-honk': '🚗',
      'duck-paddle': '🦆',
      'tea-clink': '☕',
      'lake-lights': '💡',
      'fireworks': '🎆',
      'bicycle-ride': '🚲',
    };

    ctx.font = '130px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojiMap[actionType] || '✨', 256, 220);

    ctx.font = 'bold 36px "Kanit", sans-serif';
    ctx.fillStyle = '#44382F';
    ctx.fillText(label.split(' ')[1] || label, 256, 330);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [actionType, label, themeColor]);

  return (
    <mesh
      ref={badgeRef}
      rotation={[Math.PI / 4, 0, 0]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[0.7, 0.7, 0.08, 32]} />
      <meshStandardMaterial attach="material-0" color="#E6D7C3" roughness={0.8} />
      <meshStandardMaterial attach="material-1" map={badgeTexture} roughness={0.7} />
      <meshStandardMaterial attach="material-2" color="#D4C3AC" roughness={0.9} />
    </mesh>
  );
}

export default function InteractiveProp({
  prop,
  themeColor,
  onTriggerFireworks,
  hideTooltip = false,
}: InteractivePropProps) {
  const groupRef = useRef<THREE.Group>(null);
  const badgeRef = useRef<THREE.Mesh>(null);
  const cutoutMeshRef = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [popParticles, setPopParticles] = useState<
    { id: number; symbol: string; offset: number }[]
  >([]);

  useCursor(hovered);

  // Idle floating animation
  useFrame(({ clock }) => {
    if (!groupRef.current || isPlaying) return;
    const t = clock.getElapsedTime() + prop.position[0];
    // Gentle breathing float
    groupRef.current.position.y = prop.position[1] + Math.sin(t * 2.2) * 0.035;
  });

  // Handle click animations
  const handleClick = () => {
    if (isPlaying || !groupRef.current) return;
    setIsPlaying(true);
    setHasInteracted(true);

    switch (prop.actionType) {
      case 'bicycle-ride': {
        // 1. Play crisp vintage twin-ding bicycle bell ("กริ๊งๆ!")
        sfx.playBicycleBell();

        // 2. Spawn adorable floating hearts and sparkle particles
        const newId = Date.now();
        setPopParticles([
          { id: newId, symbol: '🔔', offset: -25 },
          { id: newId + 1, symbol: '💖', offset: 0 },
          { id: newId + 2, symbol: '✨', offset: 25 },
        ]);
        setTimeout(() => setPopParticles([]), 1300);

        // 3. Tactile GSAP spring bounce and micro-bell vibration
        const baseRotZ = prop.rotationZ || 0;
        const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });

        tl.to(groupRef.current.scale, {
          x: 1.08,
          y: 0.94,
          duration: 0.08,
          ease: 'power1.out',
        })
          // Bell vibration ringing
          .to(groupRef.current.rotation, {
            z: baseRotZ - 0.08,
            duration: 0.05,
          })
          .to(groupRef.current.rotation, {
            z: baseRotZ + 0.08,
            duration: 0.05,
            repeat: 3,
            yoyo: true,
          })
          .to(groupRef.current.rotation, {
            z: baseRotZ,
            duration: 0.06,
          })
          // Cheerful bicycle surge forward
          .to(groupRef.current.position, {
            x: prop.position[0] + 0.35,
            y: prop.position[1] + 0.12,
            duration: 0.28,
            ease: 'back.out(2)',
          })
          // Gentle elastic coast back to place
          .to(groupRef.current.position, {
            x: prop.position[0],
            y: prop.position[1],
            duration: 0.5,
            ease: 'elastic.out(1, 0.6)',
          })
          .to(
            groupRef.current.scale,
            { x: 1, y: 1, duration: 0.2 },
            '-=0.3'
          );
        break;
      }

      case 'pottery-spin': {
        sfx.playChime();
        gsap.to(groupRef.current.rotation, {
          y: '+=6.28',
          duration: 1.0,
          ease: 'back.out(2)',
          onComplete: () => setIsPlaying(false),
        });
        break;
      }

      case 'camera-flash': {
        sfx.playShutter();

        // 1. Flash of bright sunlight camera flash
        if (flashLightRef.current) {
          flashLightRef.current.intensity = 18;
          gsap.to(flashLightRef.current, {
            intensity: 0,
            duration: 0.45,
            ease: 'power2.out',
          });
        }

        // 2. Adorable floating camera particles
        const newId = Date.now();
        setPopParticles([
          { id: newId, symbol: '📸', offset: -26 },
          { id: newId + 1, symbol: '💖', offset: 0 },
          { id: newId + 2, symbol: '🎞️', offset: 26 },
        ]);
        setTimeout(() => setPopParticles([]), 1300);

        // 3. Tactile shutter click bounce
        const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
        tl.to(groupRef.current.scale, {
          x: 1.15,
          y: 0.9,
          duration: 0.08,
          ease: 'power1.out',
        })
          .to(groupRef.current.position, {
            y: prop.position[1] + 0.22,
            duration: 0.18,
            ease: 'back.out(2)',
          })
          .to(groupRef.current.position, {
            y: prop.position[1],
            duration: 0.35,
            ease: 'bounce.out',
          })
          .to(
            groupRef.current.scale,
            { x: 1, y: 1, duration: 0.15 },
            '-=0.2'
          );
        break;
      }

      case 'car-honk': {
        sfx.playHonk();

        // 1. Spawn floating honk notes & hearts
        const newId = Date.now();
        setPopParticles([
          { id: newId, symbol: '🚗', offset: -26 },
          { id: newId + 1, symbol: '💖', offset: 0 },
          { id: newId + 2, symbol: '💨', offset: 26 },
        ]);
        setTimeout(() => setPopParticles([]), 1300);

        // 2. Playful cartoon car suspension squish & bounce
        const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
        tl.to(groupRef.current.scale, { y: 0.78, x: 1.18, duration: 0.08 })
          .to(groupRef.current.position, {
            y: prop.position[1] + 0.38,
            duration: 0.18,
            ease: 'power2.out',
          })
          .to(groupRef.current.position, {
            y: prop.position[1],
            duration: 0.28,
            ease: 'bounce.out',
          })
          .to(groupRef.current.scale, { y: 1, x: 1, duration: 0.12 });
        break;
      }

      case 'duck-paddle': {
        sfx.playDuck();
        const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
        tl.to(groupRef.current.rotation, { z: -0.3, duration: 0.15 })
          .to(groupRef.current.rotation, { z: 0.3, duration: 0.2 })
          .to(groupRef.current.rotation, { z: -0.2, duration: 0.2 })
          .to(groupRef.current.rotation, {
            z: 0,
            duration: 0.2,
            ease: 'bounce.out',
          });
        break;
      }

      case 'tea-clink': {
        sfx.playClink();
        const tl = gsap.timeline({
          onComplete: () => {
            setIsPlaying(false);
          },
        });
        tl.to(groupRef.current.rotation, { z: -0.2, duration: 0.12 })
          .to(groupRef.current.rotation, { z: 0.2, duration: 0.15 })
          .to(groupRef.current.rotation, {
            z: 0,
            duration: 0.2,
            ease: 'bounce.out',
          });
        break;
      }

      case 'lake-lights': {
        sfx.playTwinkle();
        if (flashLightRef.current) {
          const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
          for (let i = 0; i < 5; i++) {
            tl.to(flashLightRef.current, { intensity: 8, duration: 0.1 }).to(
              flashLightRef.current,
              { intensity: 0.5, duration: 0.15 }
            );
          }
        }
        gsap.to(groupRef.current.rotation, {
          y: '+=3.14',
          duration: 1.2,
          ease: 'power2.inOut',
          onComplete: () => setIsPlaying(false),
        });
        break;
      }

      case 'fireworks': {
        sfx.playFirework();
        if (onTriggerFireworks) {
          onTriggerFireworks();
        }
        gsap.to(groupRef.current.scale, {
          x: 1.4,
          y: 1.4,
          z: 1.4,
          duration: 0.2,
          yoyo: true,
          repeat: 3,
          onComplete: () => setIsPlaying(false),
        });
        break;
      }

      default:
        setIsPlaying(false);
    }
  };

  const propWidth = prop.scale ? prop.scale[0] : 1.4;
  const propHeight = prop.scale ? prop.scale[1] : 1.4;

  return (
    <group
      ref={groupRef}
      position={prop.position}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Either render high-fidelity illustrated die-cut prop or coin badge */}
      {prop.imageUrl ? (
        <DieCutIllustratedMesh
          imageUrl={prop.imageUrl}
          width={propWidth}
          height={propHeight}
          rotationZ={prop.rotationZ}
          hovered={hovered}
          meshRef={cutoutMeshRef}
        />
      ) : (
        <BadgeCoinMesh
          themeColor={themeColor}
          actionType={prop.actionType}
          label={prop.label}
          badgeRef={badgeRef}
        />
      )}

      {/* Point light for flash / twinkle effects */}
      <pointLight
        ref={flashLightRef}
        position={[0, 0.5, 0.5]}
        intensity={0}
        color="#FFF9E6"
        distance={6}
      />

      {/* Floating Pop Particles (Hearts & Bell Chimes on tap) */}
      {popParticles.length > 0 && (
        <Html
          position={[0, propHeight + 0.4, 0]}
          center
          distanceFactor={14}
        >
          <div className="relative pointer-events-none select-none flex items-center justify-center">
            {popParticles.map((p) => (
              <span
                key={p.id}
                className="absolute text-xl font-bold animate-bounce drop-shadow-[0_2px_8px_rgba(255,100,120,0.6)]"
                style={{
                  transform: `translateX(${p.offset}px) translateY(-18px)`,
                  transition: 'all 0.9s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                }}
              >
                {p.symbol}
              </span>
            ))}
          </div>
        </Html>
      )}

      {/* Floating Tooltip Hint */}
      {!hideTooltip && (
        <Html
          position={[0, propHeight + 0.25, 0]}
          center
          distanceFactor={14}
        >
          <div
            className={`pointer-events-none select-none whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-sans font-medium shadow-xl transition-all duration-300 flex items-center gap-1.5 ${
              hovered || !hasInteracted
                ? 'opacity-100 scale-100 bg-amber-950/90 text-amber-200 border border-amber-400/50 shadow-amber-900/30 ring-2 ring-amber-300/30'
                : 'opacity-70 scale-90 bg-stone-900/80 text-stone-300'
            }`}
          >
            <span>{prop.label}</span>
            <span className="text-[11px] text-amber-300 font-bold">✦ แตะเลย!</span>
          </div>
        </Html>
      )}
    </group>
  );
}
