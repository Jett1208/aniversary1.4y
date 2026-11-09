import { useRef, useEffect } from 'react';

/**
 * Gentle floating pastel dust motes and soft warm light specks
 * High-performance HTML5 Canvas simulation with automatic resize & cleanup.
 */
export default function CuteAmbientParticles({
  className = 'absolute inset-0 pointer-events-none z-10',
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(38, Math.max(18, Math.floor((width * height) / 32000)));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1.2,
      speedY: Math.random() * 0.28 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      baseAlpha: Math.random() * 0.45 + 0.22,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      color: Math.random() > 0.5 ? '255, 214, 165' : '255, 238, 204',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin(p.phase) * 0.3 + p.speedX;
        p.phase += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(p.phase));

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${currentAlpha * 0.35})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
