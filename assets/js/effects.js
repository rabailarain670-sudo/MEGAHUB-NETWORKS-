
const Effects = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,

  init() {
    this.canvas = document.getElementById('weather-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.update();
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  update() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    
    // Safety check for MegaHub state
    const season = (window.MegaHub && window.MegaHub.state) ? window.MegaHub.state.settings.season : 'off';
    const effectsEnabled = (window.MegaHub && window.MegaHub.state) ? window.MegaHub.state.settings.effects : false;

    if (season === 'off' || !effectsEnabled) {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }
    this.particles = [];
    this.loop();
  },

  loop() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const season = (window.MegaHub && window.MegaHub.state) ? window.MegaHub.state.settings.season : 'off';
    
    if (season === 'stars') this.drawStars();
    if (season === 'rain') this.drawRain();
    if (season === 'snow') this.drawSnow();
    
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  drawStars() {
    if (this.particles.length < 100) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        s: Math.random() * 2,
        o: Math.random(),
        v: Math.random() * 0.02
      });
    }
    this.ctx.fillStyle = 'white';
    this.particles.forEach(p => {
      p.o += p.v;
      this.ctx.globalAlpha = Math.abs(Math.sin(p.o));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      this.ctx.fill();
    });
  },

  drawRain() {
    if (this.particles.length < 50) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        l: Math.random() * 20 + 10,
        v: Math.random() * 5 + 10
      });
    }
    this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    this.ctx.lineWidth = 1;
    this.particles.forEach((p, i) => {
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x, p.y + p.l);
      this.ctx.stroke();
      p.y += p.v;
      if (p.y > this.canvas.height) this.particles.splice(i, 1);
    });
  },

  drawSnow() {
    if (this.particles.length < 50) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        r: Math.random() * 3 + 1,
        v: Math.random() * 1 + 0.5,
        o: Math.random() * 6
      });
    }
    this.ctx.fillStyle = 'white';
    this.particles.forEach((p, i) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x + Math.sin(p.o) * 20, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
      p.y += p.v;
      p.o += 0.02;
      if (p.y > this.canvas.height) this.particles.splice(i, 1);
    });
  }
};
window.Effects = Effects;
Effects.init();
