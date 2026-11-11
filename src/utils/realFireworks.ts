import { sfx } from './sfx';

interface Point {
  x: number;
  y: number;
}

interface RocketTrail {
  x: number;
  y: number;
  alpha: number;
  size: number;
}

class Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trails: RocketTrail[] = [];
  isHeavy: boolean;
  onExplode: (x: number, y: number, color: string, isHeavy: boolean) => void;

  constructor(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    color: string,
    isHeavy = false,
    onExplode: (x: number, y: number, color: string, isHeavy: boolean) => void
  ) {
    this.x = startX;
    this.y = startY;
    this.targetY = targetY;
    this.color = color;
    this.isHeavy = isHeavy;
    this.onExplode = onExplode;

    // Calculate initial launch velocities to reach target
    const gravity = 0.18;
    const dy = targetY - startY; // negative
    // vy^2 = 2 * g * |dy|
    const speedY = Math.sqrt(2 * gravity * Math.abs(dy)) * 1.05;
    this.vy = -speedY;
    const framesToApex = speedY / gravity;
    this.vx = (targetX - startX) / framesToApex;

    // Trigger launch whistle sound
    sfx.playRocketLaunchWhistle();
  }

  update(): boolean {
    // Add smoke/spark trail behind the ascending rocket
    this.trails.push({
      x: this.x + (Math.random() - 0.5) * 2,
      y: this.y + (Math.random() - 0.5) * 2,
      alpha: 0.9,
      size: this.isHeavy ? 3.0 : 2.0,
    });

    // Update trail particles
    for (let i = this.trails.length - 1; i >= 0; i--) {
      this.trails[i].alpha -= 0.055;
      this.trails[i].y += 0.35;
      if (this.trails[i].alpha <= 0) {
        this.trails.splice(i, 1);
      }
    }

    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.18; // gravity

    // Check if rocket has reached apex or target altitude
    if (this.vy >= -0.8 || this.y <= this.targetY) {
      this.onExplode(this.x, this.y, this.color, this.isHeavy);
      return false; // dead
    }
    return true; // alive
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw smoke & golden spark trail
    for (const t of this.trails) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 150, ${t.alpha})`;
      ctx.fill();
    }

    // Draw glowing rocket warhead
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.isHeavy ? 4.5 : 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFB266';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha = 1.0;
  decay: number;
  gravity: number;
  drag: number;
  size: number;
  trail: Point[] = [];
  maxTrailLength: number;
  isWillow: boolean;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    isWillow = false
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.isWillow = isWillow;

    if (isWillow) {
      this.gravity = 0.055;
      this.drag = 0.975;
      this.decay = 0.007 + Math.random() * 0.005; // Long lingering weeping trail
      this.maxTrailLength = 9;
      this.size = 2.4;
    } else {
      this.gravity = 0.045;
      this.drag = 0.965;
      this.decay = 0.012 + Math.random() * 0.008;
      this.maxTrailLength = 5;
      this.size = 2.2;
    }
  }

  update(): boolean {
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }

    this.vx *= this.drag;
    this.vy = this.vy * this.drag + this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Head spark with luminous bloom
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fill();
  }
}

/**
 * Realistic Firework Show Engine
 */
class RealFireworksEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rockets: Rocket[] = [];
  private sparks: Spark[] = [];
  private animationId: number | null = null;
  private isRunning = false;
  private onCompleteCallback?: () => void;

  private setupCanvas(): boolean {
    if (!this.canvas) {
      let el = document.getElementById('fireworks-fx-canvas') as HTMLCanvasElement;
      if (!el) {
        el = document.createElement('canvas');
        el.id = 'fireworks-fx-canvas';
        el.style.position = 'fixed';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '100vw';
        el.style.height = '100vh';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '35';
        document.body.appendChild(el);
      }
      this.canvas = el;
      this.ctx = el.getContext('2d');
    }

    if (!this.canvas || !this.ctx) return false;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    return true;
  }

  public launch(onComplete?: () => void) {
    if (!this.setupCanvas()) return;
    this.onCompleteCallback = onComplete;
    this.rockets = [];
    this.sparks = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mortar positions beside the wooden table:
    // Left mortar: X ~ 12% width, Y ~ 92% height
    // Right mortar: X ~ 88% width, Y ~ 92% height
    const leftMortarX = width * 0.14;
    const rightMortarX = width * 0.86;
    const launchY = height * 0.92;

    const fireShell = (
      fromLeft: boolean,
      targetRatioX: number,
      targetRatioY: number,
      color: string,
      isHeavy = false
    ) => {
      const startX = fromLeft ? leftMortarX + (Math.random() - 0.5) * 35 : rightMortarX + (Math.random() - 0.5) * 35;
      const targetX = width * targetRatioX;
      const targetY = height * targetRatioY;

      this.rockets.push(
        new Rocket(
          startX,
          launchY,
          targetX,
          targetY,
          color,
          isHeavy,
          (burstX, burstY, burstColor, heavy) => this.explode(burstX, burstY, burstColor, heavy)
        )
      );
    };

    // Choreographed 4-Stage Multi-Salvo Firework Show:
    // 1. Initial Left Mortar Ascension
    fireShell(true, 0.32, 0.28, '#FF3388', false); // Vibrant Sunset Coral Rose

    // 2. Right Mortar Counter-Ascension (+650ms)
    setTimeout(() => {
      fireShell(false, 0.68, 0.26, '#FFAA00', false); // Radiant Golden Amber
    }, 650);

    // 3. Synchronized Dual Flank Launch (+1450ms)
    setTimeout(() => {
      fireShell(true, 0.26, 0.22, '#A855F7', false); // Royal Violet
      fireShell(false, 0.74, 0.22, '#00E5FF', false); // Electric Cyan
    }, 1450);

    // 4. Triple Rapid Salvo (+2350ms)
    setTimeout(() => {
      fireShell(true, 0.38, 0.18, '#FF4D6D', false); // Hot Pink
      setTimeout(() => fireShell(false, 0.62, 0.19, '#34D399', false), 220); // Emerald Green
      setTimeout(() => fireShell(true, 0.50, 0.15, '#FBBF24', false), 450); // Gold
    }, 2350);

    // 5. Grand Finale Heavy Willow Salvo (+3300ms)
    setTimeout(() => {
      // Twin heavy shells from both flanks meeting in high center sky
      fireShell(true, 0.44, 0.18, '#FFE680', true); // Golden Weeping Willow
      fireShell(false, 0.56, 0.16, '#FFF0A0', true); // Golden Weeping Willow with Diamond Strobe
    }, 3300);

    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  private explode(x: number, y: number, color: string, isHeavy: boolean) {
    // Sound: Deep detonation bass thud + reverberant crackle
    sfx.playFireworkDetonation(isHeavy);

    const count = isHeavy ? 120 : 75;
    const baseSpeed = isHeavy ? 6.5 : 5.0;

    // Palette variants around the core theme
    const colors = [color, '#FFFFFF', '#FFE2A0', color];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const speed = (baseSpeed * (0.35 + Math.random() * 0.75));
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const sparkColor = colors[Math.floor(Math.random() * colors.length)];

      this.sparks.push(new Spark(x, y, vx, vy, sparkColor, isHeavy));
    }
  }

  private animate = () => {
    if (!this.canvas || !this.ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Semi-transparent fade clear for natural motion blur trails
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    this.ctx.fillRect(0, 0, width, height);

    // Switch to additive blending for realistic high-bloom fire
    this.ctx.globalCompositeOperation = 'lighter';

    // Update and draw ascending rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const alive = this.rockets[i].update();
      if (alive) {
        this.rockets[i].draw(this.ctx);
      } else {
        this.rockets.splice(i, 1);
      }
    }

    // Update and draw exploding sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const alive = this.sparks[i].update();
      if (alive) {
        this.sparks[i].draw(this.ctx);
      } else {
        this.sparks.splice(i, 1);
      }
    }

    // Check if show has concluded
    if (this.rockets.length === 0 && this.sparks.length === 0) {
      this.ctx.clearRect(0, 0, width, height);
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.onCompleteCallback) {
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = undefined;
        cb();
      }
      return;
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}

export const realFireworks = new RealFireworksEngine();

/**
 * Public trigger function matching the previous API signature
 */
export function launchNewYearFireworks(onComplete?: () => void) {
  realFireworks.launch(onComplete);
}
