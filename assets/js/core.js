
// Mega Hub Core Logic - Global Definitions First
window.RandomContent = {
  facts: [
    "The first computer mouse was made of wood.",
    "90% of the world's currency is digital.",
    "A computer's speed is measured in Hertz.",
    "Python was named after Monty Python, not the snake.",
    "The first bug in history was a literal moth.",
    "In 1971, the first ever email was sent.",
    "The average person blinks 20 times a minute.",
    "The first web page is still live at CERN."
  ],
  getFact() { return this.facts[Math.floor(Math.random() * this.facts.length)]; }
};

const MegaHub = {
  state: {
    nickname: localStorage.getItem('mega_nickname') || 'ProGamer',
    xp: parseInt(localStorage.getItem('mega_xp')) || 0,
    coins: parseInt(localStorage.getItem('mega_coins')) || 500,
    level: 1,
    inventory: JSON.parse(localStorage.getItem('mega_inventory')) || [],
    equipped: JSON.parse(localStorage.getItem('mega_equipped')) || { frame: null, glow: null, chat: 'standard' },
    settings: JSON.parse(localStorage.getItem('mega_settings')) || {
      sound: true,
      volume: 50,
      clickStyle: 'heavy',
      effects: true,
      season: 'stars',
      theme: 'dark',
      adDensity: 'normal',
      notifications: true
    }
  },

  init() {
    try {
      this.applySettings();
      this.updateLevel();
      this.bindEvents();
      this.checkDaily();
      console.log("MegaHub Core Initialized");
    } catch (e) {
      console.error("MegaHub Initialization Error:", e);
    }
  },

  updateLevel() {
    this.state.level = Math.floor(this.state.xp / 1000) + 1;
    document.querySelectorAll('.user-level').forEach(el => el.textContent = this.state.level);
    document.querySelectorAll('.user-nickname').forEach(el => el.textContent = this.state.nickname);
    document.querySelectorAll('.user-coins').forEach(el => el.textContent = this.state.coins);
  },

  addXP(amount) {
    this.state.xp += amount;
    localStorage.setItem('mega_xp', this.state.xp);
    this.updateLevel();
    if (this.state.settings.notifications) {
      this.showNotification(`+${amount} XP gained!`);
    }
  },

  addCoins(amount) {
    this.state.coins += amount;
    localStorage.setItem('mega_coins', this.state.coins);
    this.updateLevel();
    if (this.state.settings.notifications) {
      this.showNotification(`+${amount} Coins earned!`);
    }
  },

  checkDaily() {
    const last = localStorage.getItem('mega_last_daily');
    const now = new Date().toDateString();
    if (last !== now) {
      this.addCoins(100);
      localStorage.setItem('mega_last_daily', now);
      this.showNotification("Daily Reward: 100 Coins added!");
    }
  },

  applySettings() {
    const s = this.state.settings;
    document.body.classList.toggle('light-mode', s.theme === 'light');
    document.body.dataset.adDensity = s.adDensity;
    
    if (window.Effects && typeof window.Effects.update === 'function') {
      window.Effects.update();
    }
  },

  bindEvents() {
    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (menuBtn && sidebar && overlay) {
      menuBtn.onclick = () => {
        sidebar.classList.add('open');
        overlay.classList.add('open');
      };
      overlay.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      };
    }

    document.addEventListener('mousedown', () => {
      if (this.state.settings.sound && window.Sound && typeof window.Sound.playHeavyClick === 'function') {
        if (this.state.settings.clickStyle === 'heavy') window.Sound.playHeavyClick();
        else window.Sound.playLightClick();
      }
    });
  },

  showNotification(text) {
    const toast = document.createElement('div');
    toast.className = 'glass-notify';
    toast.style.cssText = `position:fixed; bottom:80px; left:50%; transform:translateX(-50%); padding:12px 24px; z-index:9999; border-radius:12px; background:rgba(15,23,42,0.9); color:white; border-left:4px solid #3b82f6; pointer-events:none; box-shadow:0 10px 30px rgba(0,0,0,0.5);`;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      toast.style.transition = 'all 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
};

window.MegaHub = MegaHub;
MegaHub.init();
