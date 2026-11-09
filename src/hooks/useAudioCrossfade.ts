import { useEffect, useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { CHAPTERS } from '../data/chapters';

export function useAudioCrossfade(activeChapterIndex: number) {
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const howlsRef = useRef<Record<string, Howl>>({});
  const currentTrackIdRef = useRef<string | null>(null);

  // Initialize and preload Howler tracks using Web Audio API
  useEffect(() => {
    CHAPTERS.forEach((ch) => {
      const existing = howlsRef.current[ch.id];
      if (!existing || existing.state() === 'unloaded') {
        howlsRef.current[ch.id] = new Howl({
          src: [ch.bgmUrl],
          format: ['mp3'],
          html5: false, // Use Web Audio API for seamless loop and smooth gain-node fade
          loop: true,
          volume: 0,
          preload: true,
          onload: () => {
            console.log(`[BGM] Loaded successfully: ${ch.id} (${ch.bgmUrl})`);
          },
          onloaderror: (_id, err) => {
            console.error(`[BGM] Load error for ${ch.id} (${ch.bgmUrl}):`, err);
          },
          onplayerror: (_id, err) => {
            console.warn(`[BGM] Play error for ${ch.id}:`, err);
            howlsRef.current[ch.id]?.once('unlock', () => {
              howlsRef.current[ch.id]?.play();
            });
          },
        });
      }
    });

    return () => {
      Object.values(howlsRef.current).forEach((h) => h.unload());
      howlsRef.current = {};
    };
  }, []);

  // Unlock audio context on user interaction (Click ! / Cover launch)
  const unlockAudio = useCallback(() => {
    setIsAudioUnlocked(true);

    // Resume Web Audio context immediately during user click gesture
    try {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
    } catch (e) {
      console.warn('[BGM] Could not resume Howler.ctx:', e);
    }

    const ch = CHAPTERS[activeChapterIndex] || CHAPTERS[0];
    if (ch) {
      currentTrackIdRef.current = ch.id;
      const howl = howlsRef.current[ch.id];
      if (howl) {
        if (!howl.playing()) {
          howl.play();
        }
        howl.fade(howl.volume(), isMuted ? 0 : 0.6, 1200);
      }
    }
  }, [activeChapterIndex, isMuted]);

  // Handle chapter changes with smooth crossfade
  useEffect(() => {
    if (!isAudioUnlocked) return;

    const nextChapter = CHAPTERS[activeChapterIndex];
    if (!nextChapter) return;

    const prevTrackId = currentTrackIdRef.current;
    const nextTrackId = nextChapter.id;

    if (prevTrackId === nextTrackId) return;

    // Fade out previous track
    if (prevTrackId && howlsRef.current[prevTrackId]) {
      const prevHowl = howlsRef.current[prevTrackId];
      if (prevHowl.playing()) {
        prevHowl.fade(prevHowl.volume(), 0, 1200);
        setTimeout(() => {
          if (currentTrackIdRef.current !== prevTrackId) {
            prevHowl.pause();
          }
        }, 1250);
      }
    }

    // Fade in new track
    const nextHowl = howlsRef.current[nextTrackId];
    if (nextHowl) {
      if (!nextHowl.playing()) {
        nextHowl.play();
      }
      nextHowl.fade(nextHowl.volume(), isMuted ? 0 : 0.6, 1200);
    }

    currentTrackIdRef.current = nextTrackId;
  }, [activeChapterIndex, isAudioUnlocked, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        Object.values(howlsRef.current).forEach((h) => {
          if (h.playing()) h.volume(0);
        });
      } else {
        const currentHowl = currentTrackIdRef.current
          ? howlsRef.current[currentTrackIdRef.current]
          : null;
        if (currentHowl) {
          if (!currentHowl.playing()) currentHowl.play();
          currentHowl.fade(0, 0.6, 600);
        }
      }
      return next;
    });
  }, []);

  return {
    isMuted,
    isAudioUnlocked,
    unlockAudio,
    toggleMute,
  };
}
