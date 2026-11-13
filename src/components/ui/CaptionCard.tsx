import { useEffect, useState } from 'react';
import type { ChapterConfig } from '../../data/chapters';
import { MapPin } from 'lucide-react';

interface CaptionCardProps {
  chapter: ChapterConfig;
  isDiving?: boolean;
}

/**
 * CaptionCard — Pinned note styled as a torn piece of notebook paper
 * with washi tape, describing the current chapter's memory.
 * Slides down smoothly during depth dives and pops back in with paper physics.
 */
export default function CaptionCard({ chapter, isDiving = false }: CaptionCardProps) {
  const [visible, setVisible] = useState(true);
  const [displayedChapter, setDisplayedChapter] = useState(chapter);

  // Smooth slide-out when diving or chapter changing
  useEffect(() => {
    if (chapter.id !== displayedChapter.id) {
      setVisible(false);
      const timer = setTimeout(() => {
        setDisplayedChapter(chapter);
        setVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [chapter, displayedChapter.id]);

  const isCardVisible = visible && !isDiving;

  return (
    <div
      className={`fixed bottom-20 left-6 sm:left-10 md:left-12 z-20 max-w-sm pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
        isCardVisible
          ? 'opacity-100 translate-y-0 scale-100 rotate-0'
          : 'opacity-0 translate-y-8 scale-95 -rotate-2'
      }`}
    >
      <div className="relative bg-[#FFFDF9] text-[#4A3728] p-6 rounded-2xl shadow-[0_12px_32px_rgba(95,65,40,0.12)] border border-[#EADBCC] transform -rotate-1 select-none pointer-events-auto">
        {/* Washi Tape Header */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 opacity-85 shadow-sm transform -rotate-1 rounded-sm"
          style={{
            backgroundColor: chapter.themeColor || '#FDE68A',
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)',
          }}
        />

        {/* Location Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-amber-800/80 mb-1">
          <MapPin size={13} className="text-[#F59E0B]" />
          <span>
            Chapter {displayedChapter.chapterNumber} • {displayedChapter.locationEn}
          </span>
        </div>

        {/* Location Name & Title */}
        <h3 className="text-2xl font-bold font-handwritten text-[#4A3728] leading-tight mb-1.5">
          {displayedChapter.locationName}
        </h3>
        {displayedChapter.title && (
          <p className="text-xs font-semibold text-[#8C7665] font-sans mb-3">
            {displayedChapter.title}
          </p>
        )}

        {/* Faint Ruled Line */}
        <div className="w-full h-px bg-[#EADBCC] mb-3" />

        {/* Memory Caption */}
        <p className="text-sm text-[#5C4533] leading-relaxed font-sans font-normal whitespace-pre-line">
          {displayedChapter.caption}
        </p>

        {/* Decorative corner fold / tape stamp */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#9E8B7C] font-sans border-t border-dashed border-[#EADBCC] pt-2">
          <span>Our Journey</span>
          <span>♡ 1.4 Years</span>
        </div>
      </div>
    </div>
  );
}
