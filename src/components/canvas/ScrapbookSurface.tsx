import { useMemo } from 'react';
import * as THREE from 'three';
import { CHAPTERS } from '../../data/chapters';

interface ScrapbookSurfaceProps {
  width?: number;
  depth?: number;
  isChapterVisible?: (index: number) => boolean;
}

/**
 * ScrapbookSurface — Layered Craft-Paper Stages along the Depth Tunnel (Z-Axis)
 * 
 * Features:
 * - Dedicated textured craft paper diorama stage for each of the 7 chapters
 * - Procedural deckled paper grain, faint ruled grids, and warm corner washi tape
 * - Faint dashed dotted flight trail on the ground connecting the stages into the depth
 * - Distance culling: only stages near the camera are rendered for 60fps performance
 */
export default function ScrapbookSurface({ isChapterVisible }: ScrapbookSurfaceProps) {
  // Create realistic craft paper canvas texture with grain and subtle ruled grid
  const paperTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base paper color — warm cream craft paper
    ctx.fillStyle = '#F5EFE0';
    ctx.fillRect(0, 0, size, size);

    // Fine organic paper grain
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = 210 + Math.random() * 35;
      ctx.fillStyle = `rgba(${brightness}, ${brightness - 12}, ${brightness - 28}, 0.18)`;
      ctx.fillRect(x, y, 1.8, 1.8);
    }

    // Faint ruled horizontal lines
    ctx.strokeStyle = 'rgba(180, 165, 140, 0.14)';
    ctx.lineWidth = 1;
    const lineSpacing = size / 24;
    for (let y = lineSpacing; y < size; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Faint vertical grid lines
    ctx.strokeStyle = 'rgba(180, 165, 140, 0.08)';
    for (let x = lineSpacing; x < size; x += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group>
      {/* Chapter Stages along Z-axis */}
      {CHAPTERS.map((chapter, index) => {
        const isVisible = isChapterVisible ? isChapterVisible(index) : true;
        if (!isVisible) return null;

        return (
          <group key={chapter.id} position={[0, 0, chapter.baseZ]}>
            {/* Main Stage Paper Sheet */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.01, 0]}
              receiveShadow
            >
              <planeGeometry args={[13.5, 12]} />
              <meshStandardMaterial
                map={paperTexture}
                roughness={0.85}
                metalness={0.02}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Deckled Edge Border Layer (Soft Brown Paper Underlay) */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.018, 0]}
            >
              <planeGeometry args={[14.2, 12.7]} />
              <meshStandardMaterial
                color="#E2D4BF"
                roughness={0.95}
                metalness={0}
              />
            </mesh>

            {/* Cute Decorative Corner Washi Tapes */}
            {/* Top-Left Corner Tape */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0.55]}
              position={[-6.2, 0.005, -5.4]}
            >
              <planeGeometry args={[1.5, 0.5]} />
              <meshStandardMaterial
                color={chapter.themeColor}
                roughness={0.5}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Bottom-Right Corner Tape */}
            <mesh
              rotation={[-Math.PI / 2, 0, -0.45]}
              position={[6.2, 0.005, 5.4]}
            >
              <planeGeometry args={[1.5, 0.5]} />
              <meshStandardMaterial
                color="#FBBF24"
                roughness={0.5}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
