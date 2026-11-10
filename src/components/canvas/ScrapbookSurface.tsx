import { useMemo } from 'react';
import * as THREE from 'three';
import { CHAPTERS } from '../../data/chapters';

interface ScrapbookSurfaceProps {
  width?: number;
  depth?: number;
  isChapterVisible?: (index: number) => boolean;
}

/**
 * ScrapbookSurface — Layered Craft-Paper Stages Resting on an Authentic Wooden Desk
 * 
 * Features:
 * - Expansive warm oak wood tabletop surface underneath the open book
 * - Dedicated textured craft paper diorama stage with organic paper grain
 * - Center Book Spine Crease dividing the left and right pages
 * - Physical Page Block Bulk with stacked paper edges along the perimeter
 * - Distance culling: only stages near the camera are rendered for 60fps performance
 */
export default function ScrapbookSurface({ isChapterVisible }: ScrapbookSurfaceProps) {
  // 1. Procedural Craft Paper Canvas Texture
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

  // 2. Procedural Warm Oak Wood Desk Tabletop Texture
  const woodTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Rich warm oak background
    ctx.fillStyle = '#3E2F23';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle natural wood planks & grain striations
    for (let y = 0; y < 1024; y += 4) {
      const alpha = 0.04 + Math.sin(y * 0.05) * 0.02 + Math.random() * 0.03;
      ctx.fillStyle = `rgba(255, 215, 175, ${alpha})`;
      ctx.fillRect(0, y, 1024, 2);
    }

    // Faint vertical plank dividers
    ctx.strokeStyle = 'rgba(30, 20, 12, 0.35)';
    ctx.lineWidth = 2;
    for (let x = 256; x < 1024; x += 256) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // 3. Center Spine Fold Crease Gradient Texture
  const creaseTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, 'rgba(40, 25, 15, 0)');
    grad.addColorStop(0.42, 'rgba(40, 25, 15, 0.12)');
    grad.addColorStop(0.5, 'rgba(30, 18, 10, 0.38)');
    grad.addColorStop(0.58, 'rgba(40, 25, 15, 0.12)');
    grad.addColorStop(1, 'rgba(40, 25, 15, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 16);

    const texture = new THREE.CanvasTexture(canvas);
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
            {/* 1. Expansive Warm Wooden Desk Table Surface */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.08, 0]}
              receiveShadow
            >
              <planeGeometry args={[34, 26]} />
              <meshStandardMaterial
                map={woodTexture}
                roughness={0.75}
                metalness={0.03}
              />
            </mesh>

            {/* 2. Hardcover Leather/Fabric Scrapbook Outer Trim */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.05, 0]}
              receiveShadow
            >
              <planeGeometry args={[15.6, 13.8]} />
              <meshStandardMaterial
                color="#5C4033"
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>

            {/* 3. Physical Page Block Bulk (Layered paper sheets under the open pages) */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.035, 0]}
              receiveShadow
            >
              <planeGeometry args={[14.8, 13.0]} />
              <meshStandardMaterial
                color="#D9C9B4"
                roughness={0.9}
                metalness={0}
              />
            </mesh>

            {/* 4. Deckled Edge Underlay Layer */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.02, 0]}
              receiveShadow
            >
              <planeGeometry args={[14.2, 12.5]} />
              <meshStandardMaterial
                color="#E4D7C5"
                roughness={0.92}
                metalness={0}
              />
            </mesh>

            {/* 5. Main Open Stage Paper Sheet */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.008, 0]}
              receiveShadow
            >
              <planeGeometry args={[13.6, 12.0]} />
              <meshStandardMaterial
                map={paperTexture}
                roughness={0.88}
                metalness={0.02}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 6. Center Spine Fold Crease */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.001, 0]}
            >
              <planeGeometry args={[0.35, 12.0]} />
              <meshBasicMaterial
                map={creaseTexture}
                transparent
                depthWrite={false}
              />
            </mesh>

            {/* 7. Cute Corner Washi Tapes */}
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
