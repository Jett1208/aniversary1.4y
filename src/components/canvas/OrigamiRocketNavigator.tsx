import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHAPTERS } from '../../data/chapters';

interface OrigamiRocketNavigatorProps {
  targetZ: number;
  chapterProgress?: number;
  isDiving: boolean;
  diveVelocity?: number;
}

/**
 * OrigamiRocketNavigator — 3D Paper Airplane Companion
 * 
 * Implements:
 * 1. High Sky Altitude (Y ≈ 3.65 - 4.75): Flies high above the photo diorama tops (which end at Y ≈ 3.2).
 * 2. Skyway Arc Clearance: During chapter crossover, arcs higher into the clear sky (Y ≈ 4.75)
 *    so it completely glides over the diorama with zero clipping or piercing through photos.
 * 3. Dominant Forward Glide: Sharp nose points directly forward into -Z depth (Yaw clamped ±12.5°).
 * 4. Scroll-Driven Thrust: Surges forward into depth when scrolling down.
 */
export default function OrigamiRocketNavigator({
  chapterProgress = 0,
  isDiving,
  diveVelocity = 0,
}: OrigamiRocketNavigatorProps) {
  const planeGroupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(-4.6, 3.65, 3.0));
  const currentRot = useRef(new THREE.Euler(0.16, 0, 0));

  // Build authentic low-poly origami dart geometry
  // Local -Z = Sharp Nose (Forward into scene)
  // Local +Z = Wings & Tail (Rear towards camera)
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      // Left Top Wing (from nose to left tip to inner crease)
      0, 0.15, -1.2,
      -1.3, 0.25, 1.0,
      -0.3, 0.05, 0.9,

      // Right Top Wing (from nose to inner crease to right tip)
      0, 0.15, -1.2,
      0.3, 0.05, 0.9,
      1.3, 0.25, 1.0,

      // Left Inner Crease
      0, 0.15, -1.2,
      -0.3, 0.05, 0.9,
      0, -0.28, 0.9,

      // Right Inner Crease
      0, 0.15, -1.2,
      0, -0.28, 0.9,
      0.3, 0.05, 0.9,

      // Bottom Keel Left
      0, 0.15, -1.2,
      0, -0.28, 0.9,
      -0.1, -0.05, 0.4,

      // Bottom Keel Right
      0, 0.15, -1.2,
      0.1, -0.05, 0.4,
      0, -0.28, 0.9,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!planeGroupRef.current) return;

    const time = state.clock.getElapsedTime();
    const numChapters = CHAPTERS.length;
    const clampedProg = Math.max(0, Math.min(numChapters - 1, chapterProgress));
    const chapterIdx = Math.floor(clampedProg);
    const t = clampedProg - chapterIdx; // 0.0 to 1.0 between chapters

    const currentChapter = CHAPTERS[chapterIdx] || CHAPTERS[0];
    const nextChapter = CHAPTERS[Math.min(numChapters - 1, chapterIdx + 1)] || currentChapter;

    // 1. Calculate Wide Flank Position (X ≈ ±4.6)
    // Stays well outside the central diorama box (photos are within |X| < 2.5)
    const smoothSide = Math.cos(clampedProg * Math.PI);
    const targetX = -smoothSide * 4.6;

    // 2. High Sky Altitude & Skyway Arc Clearance (Y ≈ 3.65 - 4.75)
    // Photos top out at Y ≈ 3.2. We cruise at Y ≈ 3.65 and arc up to Y ≈ 4.75 during crossover!
    const baseAltitude = 3.65;
    const skywayArc = Math.sin(t * Math.PI) * 1.1; // Soars higher during mid-flight
    const hoverY = Math.sin(time * 2.2) * 0.08;
    const targetY = baseAltitude + skywayArc + hoverY;

    // 3. Depth Z with Scroll-Driven Forward Thrust
    const startZ = currentChapter.baseZ + 3.0;
    const endZ = nextChapter.baseZ + 3.0;
    const baseZ = startZ + (endZ - startZ) * t;

    // Scrolling down surges the plane forward ahead into the 3D depth tunnel
    const forwardThrust = isDiving ? Math.min(3.2, diveVelocity * 0.75) : 0;
    const targetZ = baseZ - forwardThrust + Math.cos(time * 1.5) * 0.05;

    // Smooth position interpolation
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetX, 4.0, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetY, 4.0, delta);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetZ, 5.0, delta);

    planeGroupRef.current.position.copy(currentPos.current);

    // 4. Strict Dominant Forward Glide Orientation
    // Pitch (X): Subtle downward glide tilt ~9°, dips slightly during forward thrust
    const targetPitch = 0.16 + (isDiving ? Math.min(0.15, diveVelocity * 0.05) : 0);

    // Yaw (Y): Clamped strictly within ±12.5° (±0.22 rad) - ALWAYS points forward into scene depth
    const lateralVelocity = Math.sin(clampedProg * Math.PI) * (diveVelocity + 0.8);
    const targetYaw = Math.max(-0.22, Math.min(0.22, lateralVelocity * 0.16));

    // Roll (Z): Aerodynamic banking into lateral drift + subtle hover sway
    const targetRoll = Math.max(-0.35, Math.min(0.35, lateralVelocity * 0.28)) + Math.sin(time * 1.4) * 0.05;

    currentRot.current.x = THREE.MathUtils.damp(currentRot.current.x, targetPitch, 4.5, delta);
    currentRot.current.y = THREE.MathUtils.damp(currentRot.current.y, targetYaw, 4.5, delta);
    currentRot.current.z = THREE.MathUtils.damp(currentRot.current.z, targetRoll, 4.5, delta);

    planeGroupRef.current.rotation.copy(currentRot.current);
  });

  return (
    <group ref={planeGroupRef} scale={[0.52, 0.52, 0.52]}>
      {/* Main Folded Paper Mesh */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#FFFDF9"
          roughness={0.65}
          metalness={0.05}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Warm Golden Wing Decals / Crease Accents */}
      <mesh position={[0, 0.08, 0]} scale={[0.96, 0.96, 0.96]} geometry={geometry}>
        <meshBasicMaterial
          color="#FDE68A"
          wireframe={true}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Cute Coral Red Heart on the Wings */}
      <mesh
        position={[0, 0.16, 0.15]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.2, 0.2, 0.2]}
      >
        <circleGeometry args={[1, 16]} />
        <meshBasicMaterial color="#F43F5E" side={THREE.DoubleSide} />
      </mesh>

      {/* Soft Warm Navigation Glow */}
      <pointLight
        color="#FDE68A"
        intensity={0.4}
        distance={5}
        decay={2}
        position={[0, 0.2, 0]}
      />
    </group>
  );
}
