/**
 * FinPilot AI - Liquid Neon Canvas Background Engine
 * Creates subtle glowing orbs and futuristic particle constellations
 */

class NeonMeshBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.orbs = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();

    // Floating glowing light orbs
    this.orbs = [
      { x: this.width * 0.2, y: this.height * 0.25, radius: 280, color: 'rgba(123, 97, 255, 0.16)', vx: 0.3, vy: 0.2 },
      { x: this.width * 0.8, y: this.height * 0.4, radius: 340, color: 'rgba(94, 161, 255, 0.13)', vx: -0.25, vy: 0.35 },
      { x: this.width * 0.5, y: this.height * 0.8, radius: 300, color: 'rgba(168, 85, 247, 0.14)', vx: 0.2, vy: -0.3 },
      { x: this.width * 0.85, y: this.height * 0.85, radius: 220, color: 'rgba(16, 185, 129, 0.08)', vx: -0.15, vy: -0.2 }
    ];

    // Subtle stardust particles
    this.particles = [];
    const count = Math.min(45, Math.floor((this.width * this.height) / 25000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
      });
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Deep base gradient
    const bgGrad = this.ctx.createRadialGradient(
      this.width / 2, this.height * 0.3, 50,
      this.width / 2, this.height / 2, Math.max(this.width, this.height)
    );
    bgGrad.addColorStop(0, '#0F162E');
    bgGrad.addColorStop(0.6, '#0B1020');
    bgGrad.addColorStop(1, '#060914');

    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render & animate glowing orbs
    this.orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;

      if (orb.x < -orb.radius) orb.x = this.width + orb.radius;
      if (orb.x > this.width + orb.radius) orb.x = -orb.radius;
      if (orb.y < -orb.radius) orb.y = this.height + orb.radius;
      if (orb.y > this.height + orb.radius) orb.y = -orb.radius;

      const grad = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(0.7, orb.color.replace(/[\d\.]+\)$/, '0.04)'));
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Render stardust particles
    this.ctx.fillStyle = '#FFFFFF';
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1.0;
    requestAnimationFrame(() => this.animate());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new NeonMeshBackground('ambient-bg-canvas');
});
