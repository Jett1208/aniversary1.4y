import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

/**
 * OrientationGuard — Detects mobile portrait orientation
 * and prompts the user to rotate their device to landscape
 * for the intended 3D scrapbook panoramic experience.
 */
export default function OrientationGuard() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 820;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1F1813]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center text-paper-cream select-none animate-fadeIn">
      {/* Rotating Phone Animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center animate-pulse">
          <Smartphone size={40} className="text-amber-300 animate-spin-slow transform rotate-90" />
        </div>
      </div>

      <h2 className="text-2xl font-bold font-handwritten text-amber-200 mb-2">
        กรุณาหมุนจอเป็นแนวนอน
      </h2>
      <p className="text-stone-300 text-sm max-w-xs leading-relaxed font-sans mb-4">
        เพื่อเปิดสมุดความทรงจำ 3D ในมุมมองพาโนรามาที่สวยที่สุด แนะนำให้หมุนหน้าจอโทรศัพท์เป็นแนวนอน (Landscape) นะครับ ✨
      </p>

      <span className="text-xs px-3 py-1 rounded-full bg-stone-800/80 text-amber-300/80 border border-stone-700">
        Our 1.4 Years Journey 📖
      </span>
    </div>
  );
}
