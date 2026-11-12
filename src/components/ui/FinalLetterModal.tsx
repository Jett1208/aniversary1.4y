import { ANNIVERSARY_META } from '../../data/chapters';
import RelationshipTimer from './RelationshipTimer';
import { X } from 'lucide-react';

interface FinalLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinalLetterModal({
  isOpen,
  onClose,
}: FinalLetterModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* Stationery Paper Sheet */}
      <div
        className="relative w-full max-w-xl bg-[#FAF8F5] border border-[#E5DFD5] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-8 sm:p-12 max-h-[90vh] overflow-y-auto transform transition-all animate-scaleUp text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Paper Texture Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#D6CEBF_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Minimal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded transition-colors"
          title="ปิด"
        >
          <X size={18} />
        </button>

        {/* Letterhead Date & Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4 mb-8 text-xs font-sans text-stone-400 tracking-wider">
          <span className="uppercase font-medium">Letter</span>
          <span>15.07.2025</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 font-sans mb-8 text-center">
          {ANNIVERSARY_META.finalLetterTitle}
        </h2>

        {/* Relationship Timer Section */}
        <div className="pt-2 pb-2">
          <RelationshipTimer />
        </div>
      </div>
    </div>
  );
}
