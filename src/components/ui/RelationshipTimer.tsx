import { useEffect, useState } from 'react';
import { ANNIVERSARY_META } from '../../data/chapters';

interface TimeElapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

function calculateTimeElapsed(startDateStr: string): TimeElapsed {
  const start = new Date(startDateStr);
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours,
    minutes,
    seconds,
    totalDays,
  };
}

export default function RelationshipTimer({
  startDateISO = ANNIVERSARY_META.startDateISO,
  compact = false,
}: {
  startDateISO?: string;
  compact?: boolean;
}) {
  const [elapsed, setElapsed] = useState<TimeElapsed>(() =>
    calculateTimeElapsed(startDateISO)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(calculateTimeElapsed(startDateISO));
    }, 1000);

    return () => clearInterval(timer);
  }, [startDateISO]);

  if (compact) {
    return (
      <div className="text-xs font-sans text-stone-400">
        <span>{elapsed.totalDays} วัน ({elapsed.years} ปี {elapsed.months} เดือน)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none text-stone-700">
      {/* Clean Minimal Typography */}
      <div className="flex items-baseline justify-center gap-4 sm:gap-6 font-sans text-sm sm:text-base text-stone-800">
        <div>
          <span className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight font-serif mr-1">
            {elapsed.years}
          </span>
          <span className="text-xs text-stone-500 font-sans">ปี</span>
        </div>

        <div>
          <span className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight font-serif mr-1">
            {elapsed.months}
          </span>
          <span className="text-xs text-stone-500 font-sans">เดือน</span>
        </div>

        <div>
          <span className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight font-serif mr-1">
            {elapsed.days}
          </span>
          <span className="text-xs text-stone-500 font-sans">วัน</span>
        </div>

        <span className="text-stone-300 font-light">•</span>

        <div className="font-mono text-sm sm:text-base tracking-widest text-stone-600">
          {String(elapsed.hours).padStart(2, '0')}:
          {String(elapsed.minutes).padStart(2, '0')}:
          {String(elapsed.seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="text-xs text-stone-400 mt-2 font-sans tracking-wide">
        (รวมทั้งหมด {elapsed.totalDays} วัน)
      </div>
    </div>
  );
}
