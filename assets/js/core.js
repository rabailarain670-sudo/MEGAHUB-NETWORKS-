// MegaHub Networks Core System - Global Immediate Definition
const getStorage = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    if (typeof fallback === 'object') return JSON.parse(val);
    return typeof fallback === 'number' ? parseInt(val) : val;
  } catch (e) {
    return fallback;
  }
};

// Immediate assignment to window to prevent "MegaHub is undefined" in React
window.MegaHub = {
  state: {
    nickname: getStorage('mh_nick', 'Operator_' + Math.floor(Math.random() * 9999)),
    xp: getStorage('mh_xp', 0),
    coins: getStorage('mh_coins', 1500),
    inventory: getStorage('mh_inv', []),
    equipped: getStorage('mh_eq', { frame: null, glow: null, badge: null }),
    settings: getStorage('mh_settings', {
      sound: true, volume: 50, effects: true, season: 'stars'
    })
  },

  init() {
    try {
      this.checkDaily();
      console.log("%c[SYSTEM] Core Engine Operational", "color: #3b82f6; font-weight: bold;");
    } catch (err) {
      console.error("[SYSTEM] Init Error:", err);
    }
  },

  addXP(amt) {
    this.state.xp += amt;
    localStorage.setItem('mh_xp', this.state.xp);
    this.notify(`+${amt} XP NODE UPLOADED`);
  },

  addCoins(amt) {
    this.state.coins += amt;
    localStorage.setItem('mh_coins', this.state.coins);
    this.notify(`CREDITS SECURED: +${amt}`);
  },

  showNotification(txt) {
    this.notify(txt);
  },

  notify(txt) {
    if (!document.body) return;
    const n = document.createElement('div');
    n.className = 'glass-notif';
    n.style.cssText = 'position:fixed; bottom:100px; left:50%; transform:translateX(-50%); padding:12px 24px; z-index:9999; border-left:4px solid #3b82f6; pointer-events:none; font-weight:950; letter-spacing: 2px; text-transform: uppercase; font-size: 0.75rem; color: white; background: rgba(15,23,42,0.95); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); opacity: 0; transition: all 0.3s ease;';
    n.textContent = txt;
    document.body.appendChild(n);
    
    // Force reflow
    n.offsetHeight;
    n.style.opacity = '1';
    n.style.bottom = '120px';

    setTimeout(() => { 
      n.style.opacity = '0'; 
      n.style.bottom = '100px';
      setTimeout(() => n.remove(), 500); 
    }, 3000);
  },

  checkDaily() {
    const last = localStorage.getItem('mh_last_login');
    const today = new Date().toDateString();
    if (last !== today) {
      localStorage.setItem('mh_last_login', today);
      this.addCoins(500);
      this.notify("Daily Node Connection Bonus: 500 Credits!");
    }
  },

  updateSetting(key, val) {
    this.state.settings[key] = val;
    localStorage.setItem('mh_settings', JSON.stringify(this.state.settings));
    this.notify(`Protocol ${key} updated`);
  }
};

window.Shop = {
  handleAction(id) {
    const items = [
      { id: 'frame-neon', price: 1000, type: 'frame' },
      { id: 'frame-gold', price: 2500, type: 'frame' },
      { id: 'glow-blue', price: 800, type: 'glow' },
      { id: 'badge-pro', price: 1500, type: 'badge' }
    ];
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (window.MegaHub.state.inventory.includes(id)) {
      window.MegaHub.state.equipped[item.type] = window.MegaHub.state.equipped[item.type] === id ? null : id;
      localStorage.setItem('mh_eq', JSON.stringify(window.MegaHub.state.equipped));
      window.MegaHub.notify("Identity Config Updated");
    } else {
      if (window.MegaHub.state.coins >= item.price) {
        window.MegaHub.state.coins -= item.price;
        window.MegaHub.state.inventory.push(id);
        window.MegaHub.state.equipped[item.type] = id;
        localStorage.setItem('mh_coins', window.MegaHub.state.coins);
        localStorage.setItem('mh_inv', JSON.stringify(window.MegaHub.state.inventory));
        localStorage.setItem('mh_eq', JSON.stringify(window.MegaHub.state.equipped));
        window.MegaHub.notify("Asset Acquired Successfully");
      } else {
        window.MegaHub.notify("Error: Insufficient Credits");
      }
    }
  }
};

// Start logic when possible
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => window.MegaHub.init());
} else {
  window.MegaHub.init();
}
