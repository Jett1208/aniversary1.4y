import { useRef, useState, useMemo } from 'react';
import { useTexture, useCursor, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { sfx } from '../../utils/sfx';

interface InteractivePolaroidProps {
  frontImageUrl: string;
  backNote: string;
  position: [number, number, number];
  rotationZ?: number;
  hideTooltip?: boolean;
}

/**
 * InteractivePolaroid — A realistic two-sided polaroid card.
 * Front: Real photo in authentic polaroid frame with thick bottom chin.
 * Back: Handwritten memory note on warm cardstock.
 * Click/Tap: Flips 180° with natural Y-lift and paper flip sound.
 */
export default function InteractivePolaroid({
  frontImageUrl,
  backNote,
  position,
  rotationZ = 0,
  hideTooltip = false,
}: InteractivePolaroidProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useCursor(hovered);

  // Load photo texture
  const photoTexture = useTexture(frontImageUrl);
  photoTexture.colorSpace = THREE.SRGBColorSpace;
  photoTexture.minFilter = THREE.LinearFilter;
  photoTexture.magFilter = THREE.LinearFilter;

  // Generate high-resolution canvas texture for the back handwritten note
  const backTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d')!;

    // Warm aged cardstock background
    ctx.fillStyle = '#F8F4EB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const b = 230 + Math.random() * 25;
      ctx.fillStyle = `rgba(${b}, ${b - 8}, ${b - 20}, 0.15)`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Faint handwriting ruled line
    ctx.strokeStyle = 'rgba(190, 170, 150, 0.25)';
    ctx.lineWidth = 2;
    for (let y = 300; y < canvas.height - 200; y += 80) {
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(canvas.width - 100, y);
      ctx.stroke();
    }

    // Date stamp header
    ctx.font = '36px "Kanit", sans-serif';
    ctx.fillStyle = '#9C8573';
    ctx.textAlign = 'right';
    ctx.fillText('MEMORY NOTE ♡', canvas.width - 120, 140);

    // Thai handwritten message
    ctx.font = 'bold 52px "Charm", cursive';
    ctx.fillStyle = '#3A2E25';
    ctx.textAlign = 'center';

    // Word wrap function for Thai text
    const maxWidth = canvas.width - 240;
    const words = backNote.split(' ');
    let line = '';
    let startY = 380;
    const lineHeight = 80;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, startY);
        line = words[n] + ' ';
        startY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, startY);

    // Cute decorative heart doodle at bottom
    ctx.font = '64px sans-serif';
    ctx.fillStyle = '#E11D48';
    ctx.fillText('♥', canvas.width / 2, canvas.height - 130);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [backNote]);

  // Card dimensions
  const cardWidth = 2.1;
  const cardHeight = 2.6;
  const cardDepth = 0.015;

  // Photo dimensions (standard square-ish polaroid photo window)
  const photoWidth = 1.8;
  const photoHeight = 1.8;
  const photoOffsetY = 0.22; // Offset upward so bottom chin is larger

  const handleFlip = () => {
    if (!groupRef.current) return;
    setHasInteracted(true);
    sfx.playFlip();

    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    const targetRotY = nextFlipped ? Math.PI : 0;

    // Timeline for realistic flip: lift up, rotate, settle down
    const tl = gsap.timeline();

    tl.to(groupRef.current.position, {
      y: position[1] + 0.45,
      duration: 0.3,
      ease: 'power2.out',
    })
      .to(
        groupRef.current.rotation,
        {
          y: targetRotY,
          duration: 0.65,
          ease: 'power2.inOut',
        },
        0
      )
      .to(
        groupRef.current.position,
        {
          y: position[1],
          duration: 0.35,
          ease: 'bounce.out',
        },
        0.35
      );
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[-Math.PI / 2, 0, rotationZ]}
      onClick={(e) => {
        e.stopPropagation();
        handleFlip();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 
        Polaroid Body Box
      */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[cardWidth, cardHeight, cardDepth]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>

      {/* Front: Photo Window */}
      <mesh position={[0, photoOffsetY, cardDepth / 2 + 0.002]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshStandardMaterial
          map={photoTexture}
          roughness={0.35}
          metalness={0}
        />
      </mesh>

      {/* Back: Handwritten Note */}
      <mesh
        position={[0, 0, -cardDepth / 2 - 0.002]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[cardWidth - 0.08, cardHeight - 0.08]} />
        <meshStandardMaterial
          map={backTexture}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Cute Tooltip Hint */}
      {!hideTooltip && !hasInteracted && (
        <Html
          position={[0, -cardHeight / 2 - 0.25, 0.1]}
          center
          distanceFactor={14}
        >
          <div className="pointer-events-none select-none whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-sans font-medium shadow-md animate-bounce flex items-center gap-1">
            <span>แตะเพื่อพลิก</span>
            <span>💌</span>
          </div>
        </Html>
      )}
    </group>
  );
}
