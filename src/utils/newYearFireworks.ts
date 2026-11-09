import confetti from 'canvas-confetti';

/**
 * launchNewYearFireworks — Grand Multi-Stage New Year Countdown Style Fireworks Show
 * 
 * Features:
 * 1. Initial ascension: High-velocity rocket sparks soaring up from bottom
 * 2. Peony & Chrysanthemum bursts: Spherical explosions at varying altitudes
 * 3. Golden willow cascade: Shimmering gold & glitter trails drifting downward
 * 4. Grand finale salvo: Multi-burst panoramic blast filling the sky
 */
export function launchNewYearFireworks(onComplete?: () => void) {
  const festiveColors = [
    '#F59E0B', // Bright Gold
    '#F43F5E', // Ruby Rose
    '#38BDF8', // Sky Cyan
    '#A855F7', // Royal Purple
    '#34D399', // Emerald Green
    '#FB7185', // Warm Coral
    '#FFFBEB', // Star Diamond White
  ];

  const duration = 4.2 * 1000;
  const animationEnd = Date.now() + duration;

  // Stage 1: Continuous multi-point burst volley
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      // Grand Finale Salvo!
      triggerGrandFinaleSalvo();
      if (onComplete) {
        setTimeout(onComplete, 1600);
      }
      return;
    }

    // Fire from 2 to 3 random epicentres across the sky
    const particleRatio = timeLeft / duration;
    const burstCount = Math.floor(40 * particleRatio) + 25;

    // Left-to-center burst
    confetti({
      particleCount: burstCount,
      spread: 100,
      startVelocity: 45,
      ticks: 280,
      gravity: 0.85,
      origin: {
        x: 0.2 + Math.random() * 0.25,
        y: 0.2 + Math.random() * 0.35,
      },
      colors: festiveColors,
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });

    // Right-to-center burst
    confetti({
      particleCount: burstCount,
      spread: 100,
      startVelocity: 45,
      ticks: 280,
      gravity: 0.85,
      origin: {
        x: 0.55 + Math.random() * 0.25,
        y: 0.2 + Math.random() * 0.35,
      },
      colors: festiveColors,
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
  }, 380);

  // Stage 2: Shimmering Golden Willow Trails
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 35,
      ticks: 360,
      gravity: 0.65,
      drift: 0.05,
      origin: { x: 0.5, y: 0.25 },
      colors: ['#FDE68A', '#F59E0B', '#FEF3C7', '#FFFBEB'],
      shapes: ['star', 'circle'],
      scalar: 1.3,
    });
  }, 1200);

  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 140,
      startVelocity: 38,
      ticks: 380,
      gravity: 0.6,
      origin: { x: 0.35, y: 0.2 },
      colors: ['#FDE68A', '#FBBF24', '#F43F5E'],
      shapes: ['circle'],
      scalar: 1.25,
    });
  }, 2200);

  function triggerGrandFinaleSalvo() {
    // Left mega burst
    confetti({
      particleCount: 120,
      spread: 160,
      startVelocity: 55,
      ticks: 350,
      gravity: 0.8,
      origin: { x: 0.25, y: 0.35 },
      colors: festiveColors,
      scalar: 1.2,
    });

    // Center golden crown burst
    confetti({
      particleCount: 160,
      spread: 180,
      startVelocity: 60,
      ticks: 400,
      gravity: 0.7,
      origin: { x: 0.5, y: 0.28 },
      colors: ['#FDE68A', '#F59E0B', '#FFFDF9', '#F43F5E', '#A855F7'],
      shapes: ['star', 'circle'],
      scalar: 1.35,
    });

    // Right mega burst
    confetti({
      particleCount: 120,
      spread: 160,
      startVelocity: 55,
      ticks: 350,
      gravity: 0.8,
      origin: { x: 0.75, y: 0.35 },
      colors: festiveColors,
      scalar: 1.2,
    });
  }
}
