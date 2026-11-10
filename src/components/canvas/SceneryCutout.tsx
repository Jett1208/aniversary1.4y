import { useRef, useEffect, useState, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface SceneryCutoutProps {
  imageUrl: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotationZ?: number;
  isOpen: boolean;
  foldProgress?: number;
  hasShadow?: boolean;
  animationType?: 'none' | 'water-bob' | 'gentle-breeze';
  foldable?: boolean;
}

/**
 * SceneryCutout — Renders authentic transparent illustrated landmark and environment cutouts
 * (such as Koh Kret's leaning pagoda, riverside rowing boat, or pottery pots).
 *
 * Adheres strictly to the Scrapbook Bottom-Edge Pivot Rule:
 * - Base hinge rests at y = 0
 * - Unfolds from rotation.x = -π/2 (flat on paper) to 0 (perpendicular)
 * - Supports frame-rate independent gentle physics (e.g. water-bob for boats)
 */
export default function SceneryCutout({
  imageUrl,
  width,
  height,
  position,
  rotationZ = 0,
  isOpen,
  foldProgress,
  hasShadow = true,
  animationType = 'none',
  foldable = true,
}: SceneryCutoutProps) {
  const pivotRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Random phase seed so multiple props don't oscillate synchronously
  const phaseSeed = useMemo(() => Math.random() * 10, []);

  // Load transparent PNG cutout texture
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Soft oval contact shadow canvas texture
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    gradient.addColorStop(0, 'rgba(60, 42, 24, 0.35)');
    gradient.addColorStop(0.5, 'rgba(60, 42, 24, 0.15)');
    gradient.addColorStop(1, 'rgba(60, 42, 24, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Frame loop for 1:1 scrub folding and gentle environmental animations
  useFrame(({ clock }, delta) => {
    // 1. Scrub-linked bottom-edge folding
    if (pivotRef.current && foldable && foldProgress !== undefined) {
      const clamped = Math.max(0, Math.min(1, foldProgress));
      const targetX = -(1 - clamped) * (Math.PI / 2);
      pivotRef.current.rotation.x = THREE.MathUtils.damp(
        pivotRef.current.rotation.x,
        targetX,
        9.0,
        delta
      );
    }

    // 2. Gentle environmental motion (e.g., water ripples bobbing)
    if (meshRef.current) {
      const t = clock.getElapsedTime() + phaseSeed;
      if (animationType === 'water-bob') {
        // Natural gentle river wave bobbing & subtle roll
        meshRef.current.position.y = height / 2 + Math.sin(t * 1.9) * 0.04;
        meshRef.current.rotation.z = Math.sin(t * 1.3) * 0.022;
      } else if (animationType === 'gentle-breeze') {
        // Peaceful sky cloud drifting
        meshRef.current.position.x = Math.sin(t * 0.9) * 0.08;
        meshRef.current.position.y = height / 2 + Math.sin(t * 1.3) * 0.05;
        meshRef.current.rotation.z = Math.sin(t * 1.1) * 0.012;
      }
    }
  });

  // Fallback GSAP spring open/close when scrub progress is not passed
  useEffect(() => {
    if (!pivotRef.current || !foldable || foldProgress !== undefined) return;

    const targetRotX = isOpen ? 0 : -Math.PI / 2;

    if (!hasAnimated && !isOpen) {
      pivotRef.current.rotation.x = -Math.PI / 2;
      return;
    }

    setHasAnimated(true);

    gsap.to(pivotRef.current.rotation, {
      x: targetRotX,
      duration: 0.9,
      ease: isOpen ? 'back.out(1.5)' : 'power2.in',
      overwrite: 'auto',
    });
  }, [isOpen, foldable, foldProgress, hasAnimated]);

  return (
    <group position={position} rotation={[0, 0, rotationZ]}>
      {/* Soft ground contact shadow */}
      {hasShadow && (
        <mesh
          position={[0, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[width * 0.92, 0.45, 1]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Bottom-Edge Pivot Group */}
      <group ref={pivotRef}>
        <mesh
          ref={meshRef}
          position={[0, height / 2, 0]}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            roughness={0.75}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
