import { useRef, useEffect, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface PaperCutoutProps {
  imageUrl: string;
  /** Width of the photo card in 3D units */
  width: number;
  /** Height of the photo card in 3D units */
  height: number;
  /** World position [x, y, z] — y should be 0 (floor level, the hinge) */
  position: [number, number, number];
  /** Slight rotation around Z for natural look (radians) */
  rotationZ?: number;
  /** Whether this cutout is currently open (standing up) or closed (folded flat) */
  isOpen: boolean;
  /** Direct 1:1 scrub fold progress: 1.0 (open) to 0.0 (flat) */
  foldProgress?: number;
  /** Stagger delay in seconds before this cutout starts animating */
  staggerDelay?: number;
  /** Color of the washi tape accent */
  washiColor?: string;
  /** Rotation angle of the washi tape in degrees */
  washiAngle?: number;
  /** White border thickness around the photo */
  borderWidth?: number;
  /** Whether this cutout casts shadow */
  castShadow?: boolean;
  /** Whether this cutout receives shadow */
  receiveShadow?: boolean;
}

/**
 * PaperCutout — A 3D photo card that pivots from its BOTTOM EDGE.
 * 
 * BOTTOM-EDGE PIVOT RULE:
 * - The <group> sits at floor level (y = 0) — this is the hinge/pivot point.
 * - The <mesh> is pushed UPWARD by height/2 so the bottom edge is at y = 0.
 * - When folded flat: rotation.x = -π/2 (paper lies on the ground facing up)
 * - When standing up: rotation.x = 0 (paper stands perpendicular to the ground)
 * - GSAP animates with back.out(1.6) easing for a springy paper pop-up feel.
 */
export default function PaperCutout({
  imageUrl,
  width,
  height,
  position,
  rotationZ = 0,
  isOpen,
  foldProgress,
  staggerDelay = 0,
  washiColor = '#FBBF24',
  washiAngle = 0,
  borderWidth = 0.12,
  castShadow: shouldCastShadow = true,
  receiveShadow: shouldReceiveShadow = false,
}: PaperCutoutProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Load the photo texture
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Total card dimensions including the white border
  const totalWidth = width + borderWidth * 2;
  const totalHeight = height + borderWidth * 2;

  // 1:1 Scrub-linked folding when foldProgress is provided
  useFrame((_, delta) => {
    if (!pivotRef.current || foldProgress === undefined) return;
    const clampedProgress = Math.max(0, Math.min(1, foldProgress));
    // When foldProgress is 1: rotation.x = 0; when 0: rotation.x = -Math.PI / 2
    const targetX = -(1 - clampedProgress) * (Math.PI / 2);
    pivotRef.current.rotation.x = THREE.MathUtils.damp(
      pivotRef.current.rotation.x,
      targetX,
      9.0,
      delta
    );
  });

  // Animate open/close with GSAP fallback when foldProgress is not provided
  useEffect(() => {
    if (!pivotRef.current || foldProgress !== undefined) return;

    const targetRotX = isOpen ? 0 : -Math.PI / 2;

    // Skip animation on first render (start in closed position)
    if (!hasAnimated && !isOpen) {
      pivotRef.current.rotation.x = -Math.PI / 2;
      return;
    }

    setHasAnimated(true);

    gsap.to(pivotRef.current.rotation, {
      x: targetRotX,
      duration: isOpen ? 0.8 : 0.5,
      delay: staggerDelay,
      ease: isOpen ? 'back.out(1.6)' : 'power2.inOut',
      overwrite: true,
    });
  }, [isOpen, staggerDelay, hasAnimated]);

  // Initialize in closed position
  useEffect(() => {
    if (pivotRef.current) {
      pivotRef.current.rotation.x = -Math.PI / 2;
    }
  }, []);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, 0, rotationZ]}
    >
      {/* 
        Pivot group — rotation.x animates here.
        Position is at y=0 (floor level) so it rotates from the bottom edge.
      */}
      <group ref={pivotRef}>
        {/* 
          The mesh is pushed UP by totalHeight / 2.
          This places the bottom edge of the card exactly at y = 0 (the pivot).
        */}

        {/* White border / card backing */}
        <mesh
          position={[0, totalHeight / 2, -0.005]}
          castShadow={shouldCastShadow}
          receiveShadow={shouldReceiveShadow}
        >
          <planeGeometry args={[totalWidth, totalHeight]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.8}
            metalness={0}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Photo image on top of the white backing */}
        <mesh
          position={[0, totalHeight / 2, 0]}
          castShadow={shouldCastShadow}
        >
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.35}
            metalness={0}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Washi tape accent at the top of the card */}
        <mesh
          position={[0, totalHeight - 0.15, 0.01]}
          rotation={[0, 0, (washiAngle * Math.PI) / 180]}
        >
          <planeGeometry args={[totalWidth * 0.5, 0.18]} />
          <meshStandardMaterial
            color={washiColor}
            roughness={0.6}
            metalness={0}
            transparent
            opacity={0.75}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Card back — slightly darker paper visible when viewed from behind */}
        <mesh
          position={[0, totalHeight / 2, -0.01]}
        >
          <planeGeometry args={[totalWidth, totalHeight]} />
          <meshStandardMaterial
            color="#E8DED1"
            roughness={0.95}
            metalness={0}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
}
