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
  /** Whether to mount a cute 3D gallery clip-on spotlight */
  hasSpotlight?: boolean;
  /** Horizontal offset of the spotlight along the top edge */
  spotlightOffset?: number;
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
  hasSpotlight = false,
  spotlightOffset = 0,
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
          renderOrder={10}
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
          renderOrder={10}
        >
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.35}
            metalness={0}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Washi tape accent at the top edge of the card (grasps the top white frame, clean of photo) */}
        <mesh
          position={[0, totalHeight - 0.05, 0.01]}
          rotation={[0, 0, (washiAngle * Math.PI) / 180]}
          renderOrder={15}
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
          renderOrder={10}
        >
          <planeGeometry args={[totalWidth, totalHeight]} />
          <meshStandardMaterial
            color="#E8DED1"
            roughness={0.95}
            metalness={0}
            side={THREE.BackSide}
          />
        </mesh>

        {/* 3D Vintage Brass Gallery Picture Spotlight */}
        {hasSpotlight && (
          <group position={[spotlightOffset, totalHeight, 0]}>
            {/* 1. Brass Mounting Clip grasping the top frame */}
            <mesh position={[0, -0.04, 0.015]} castShadow={shouldCastShadow} renderOrder={20}>
              <boxGeometry args={[0.22, 0.09, 0.05]} />
              <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* 2. Curved Gooseneck Arm arching forward and down */}
            <mesh position={[0, 0.08, 0.12]} rotation={[0.6, 0, 0]} castShadow={shouldCastShadow} renderOrder={20}>
              <cylinderGeometry args={[0.02, 0.02, 0.28, 12]} />
              <meshStandardMaterial color="#C59B27" roughness={0.35} metalness={0.75} />
            </mesh>

            {/* 3. Cylindrical Picture Lamp Hood */}
            <group position={[0, 0.14, 0.24]} rotation={[0.4, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow={shouldCastShadow} renderOrder={20}>
                <cylinderGeometry args={[0.08, 0.08, 0.48, 16]} />
                <meshStandardMaterial color="#E6C687" roughness={0.3} metalness={0.65} />
              </mesh>

              {/* Glowing Warm Light Bar underneath hood */}
              <mesh position={[0, -0.05, 0]} renderOrder={20}>
                <boxGeometry args={[0.38, 0.03, 0.06]} />
                <meshBasicMaterial color="#FFF9E6" />
              </mesh>

              {/* Focused Warm Sunlight Spotlight illuminating the photo */}
              <pointLight
                position={[0, -0.08, 0.05]}
                intensity={3.6}
                distance={4.8}
                color="#FFF5DB"
                decay={2}
              />
            </group>
          </group>
        )}
      </group>
    </group>
  );
}
