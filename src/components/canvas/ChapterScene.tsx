import { Suspense } from 'react';
import PaperCutout from './PaperCutout';
import InteractivePolaroid from './InteractivePolaroid';
import InteractiveProp from './InteractiveProp';
import type { ChapterConfig } from '../../data/chapters';

interface ChapterSceneProps {
  chapter: ChapterConfig;
  isActive: boolean;
  isVisible?: boolean;
  foldProgress?: number;
  onTriggerFireworks?: () => void;
  hideTooltips?: boolean;
}

/**
 * ChapterScene — Assembles the complete diorama for one chapter:
 * 1. Three PaperCutout photo cards with 1:1 scrub folding
 * 2. One InteractivePolaroid that flips 180° to reveal secret note
 * 3. One InteractiveProp that plays sound & unique animation on click
 * 4. Distance Culling enabled via isVisible prop
 */
export default function ChapterScene({
  chapter,
  isActive,
  isVisible = true,
  foldProgress,
  onTriggerFireworks,
  hideTooltips = false,
}: ChapterSceneProps) {
  // Strict Single-Chapter Isolation: completely unmount if not visible
  if (!isVisible) return null;

  const shouldHideTooltips = !isActive || hideTooltips;

  return (
    <group position={[0, 0, chapter.baseZ]}>
      <Suspense fallback={null}>
        {/* Layered Pop-up Photo Cards */}
        {chapter.layers.map((layer, index) => (
          <PaperCutout
            key={layer.id}
            imageUrl={layer.imageUrl}
            width={layer.scale[0]}
            height={layer.scale[1]}
            position={[layer.xOffset, 0, layer.zOffset]}
            rotationZ={layer.rotationZ}
            isOpen={isActive}
            foldProgress={foldProgress}
            staggerDelay={index * 0.15}
            washiColor={layer.washiColor}
            washiAngle={layer.washiAngle}
          />
        ))}

        {/* Secret Flippable Polaroid */}
        <InteractivePolaroid
          frontImageUrl={chapter.polaroid.frontImageUrl}
          backNote={chapter.polaroid.backNote}
          position={chapter.polaroid.position}
          rotationZ={chapter.polaroid.rotationZ}
          hideTooltip={shouldHideTooltips}
        />

        {/* Interactive Location Prop */}
        <InteractiveProp
          prop={chapter.prop}
          themeColor={chapter.themeColor}
          onTriggerFireworks={onTriggerFireworks}
          hideTooltip={shouldHideTooltips}
        />
      </Suspense>
    </group>
  );
}
