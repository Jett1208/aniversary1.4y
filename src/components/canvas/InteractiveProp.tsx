import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor, Html } from '@react-three/drei';
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

export default function InteractiveProp({
  prop,
  themeColor,
  onTriggerFireworks,
  hideTooltip = false,
}: InteractivePropProps) {
  const groupRef = useRef<THREE.Group>(null);
  const badgeRef = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useCursor(hovered);

  // Idle floating animation
  useFrame(({ clock }) => {
    if (!groupRef.current || isPlaying) return;
    const t = clock.getElapsedTime() + prop.position[0];
    groupRef.current.position.y = prop.position[1] + Math.sin(t * 2) * 0.05;
  });

  // Create badge canvas texture with illustrated icon and label
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

    // Icon emoji
    const emojiMap: Record<string, string> = {
      'pottery-spin': '🚲',
      'camera-flash': '📸',
      'car-honk': '🚗',
      'duck-paddle': '🦆',
      'tea-clink': '☕',
      'lake-lights': '💡',
      'fireworks': '🎆',
    };

    ctx.font = '130px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojiMap[prop.actionType] || '✨', 256, 220);

    // Label text
    ctx.font = 'bold 36px "Kanit", sans-serif';
    ctx.fillStyle = '#44382F';
    ctx.fillText(prop.label.split(' ')[1] || prop.label, 256, 330);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [prop.actionType, prop.label, themeColor]);

  // Handle click animations
  const handleClick = () => {
    if (isPlaying || !groupRef.current) return;
    setIsPlaying(true);
    setHasInteracted(true);

    switch (prop.actionType) {
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
        if (flashLightRef.current) {
          flashLightRef.current.intensity = 15;
          gsap.to(flashLightRef.current, {
            intensity: 0,
            duration: 0.4,
            ease: 'power2.out',
          });
        }
        gsap.to(groupRef.current.scale, {
          x: 1.25,
          y: 1.25,
          z: 1.25,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => setIsPlaying(false),
        });
        break;
      }

      case 'car-honk': {
        sfx.playHonk();
        const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
        tl.to(groupRef.current.scale, { y: 0.7, x: 1.3, duration: 0.08 })
          .to(groupRef.current.position, { y: prop.position[1] + 0.6, duration: 0.2, ease: 'power2.out' })
          .to(groupRef.current.position, { y: prop.position[1], duration: 0.25, ease: 'bounce.out' })
          .to(groupRef.current.scale, { y: 1, x: 1, duration: 0.1 });
        break;
      }

      case 'duck-paddle': {
        sfx.playDuck();
        const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
        tl.to(groupRef.current.rotation, { z: -0.3, duration: 0.15 })
          .to(groupRef.current.rotation, { z: 0.3, duration: 0.2 })
          .to(groupRef.current.rotation, { z: -0.2, duration: 0.2 })
          .to(groupRef.current.rotation, { z: 0, duration: 0.2, ease: 'bounce.out' });
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
          .to(groupRef.current.rotation, { z: 0, duration: 0.2, ease: 'bounce.out' });
        break;
      }

      case 'lake-lights': {
        sfx.playTwinkle();
        if (flashLightRef.current) {
          const tl = gsap.timeline({ onComplete: () => setIsPlaying(false) });
          for (let i = 0; i < 5; i++) {
            tl.to(flashLightRef.current, { intensity: 8, duration: 0.1 })
              .to(flashLightRef.current, { intensity: 0.5, duration: 0.15 });
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
      {/* 3D Round Badge Coin */}
      <mesh
        ref={badgeRef}
        rotation={[Math.PI / 4, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.7, 0.7, 0.08, 32]} />
        {/* Sides of badge */}
        <meshStandardMaterial attach="material-0" color="#E6D7C3" roughness={0.8} />
        {/* Top face with texture */}
        <meshStandardMaterial attach="material-1" map={badgeTexture} roughness={0.7} />
        {/* Bottom face */}
        <meshStandardMaterial attach="material-2" color="#D4C3AC" roughness={0.9} />
      </mesh>

      {/* Point light for flash / twinkle effects */}
      <pointLight
        ref={flashLightRef}
        position={[0, 0.5, 0.5]}
        intensity={0}
        color="#FFF9E6"
        distance={6}
      />

      {/* Floating Tooltip Hint */}
      {!hideTooltip && (
        <Html
          position={[0, 0.9, 0]}
          center
          distanceFactor={14}
        >
          <div
            className={`pointer-events-none select-none whitespace-nowrap px-3 py-1 rounded-full text-xs font-sans font-medium shadow-lg transition-all duration-300 flex items-center gap-1.5 ${
              hovered || !hasInteracted
                ? 'opacity-100 scale-100 bg-stone-900/90 text-amber-200 border border-amber-400/40 animate-pulse'
                : 'opacity-70 scale-90 bg-stone-800/80 text-stone-300'
            }`}
          >
            <span>{prop.label}</span>
            <span className="text-[10px] text-amber-300">✦ แตะเลย</span>
          </div>
        </Html>
      )}
    </group>
  );
}
