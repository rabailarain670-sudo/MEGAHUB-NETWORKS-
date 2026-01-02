
// WebAudio SFX Engine
const Sound = {
  ctx: null,
  
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("WebAudio not supported");
    }
  },

  play(freq, type, duration, volume = 0.5) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    // Safety check for MegaHub state
    const settings = (window.MegaHub && window.MegaHub.state) ? window.MegaHub.state.settings : { volume: 50 };
    const masterVol = (settings.volume / 100) * volume;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(masterVol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playHeavyClick() {
    this.play(150, 'square', 0.1, 0.3);
  },

  playLightClick() {
    this.play(800, 'sine', 0.05, 0.1);
  },

  playCorrect() {
    this.play(523.25, 'sine', 0.2); // C5
    setTimeout(() => this.play(659.25, 'sine', 0.2), 100); // E5
  },

  playWrong() {
    this.play(110, 'sawtooth', 0.3, 0.6);
  },

  playBeep() {
    this.play(440, 'sine', 0.1);
  },

  playWin() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.play(f, 'sine', 0.4), i * 150);
    });
  }
};
window.Sound = Sound;
