
const Shop = {
  items: [
    { id: 'frame-neon', name: 'Neon Frame', price: 500, type: 'frame', color: '#22d3ee' },
    { id: 'frame-gold', name: 'Gold Frame', price: 1500, type: 'frame', color: '#fbbf24' },
    { id: 'glow-blue', name: 'Azure Glow', price: 800, type: 'glow', color: '#3b82f6' },
    { id: 'glow-red', name: 'Crimson Glow', price: 800, type: 'glow', color: '#ef4444' },
    { id: 'chat-matrix', name: 'Matrix Chat', price: 300, type: 'chat', color: '#10b981' },
    { id: 'chat-vapor', name: 'Vaporwave Chat', price: 400, type: 'chat', color: '#a855f7' }
  ],

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('shop-items');
    if (!container) return;
    container.innerHTML = '';

    this.items.forEach(item => {
      const isOwned = MegaHub.state.inventory.includes(item.id);
      const isEquipped = MegaHub.state.equipped[item.type] === item.id;
      
      const card = document.createElement('div');
      card.className = 'glass shop-item';
      card.innerHTML = `
        <div class="item-preview" style="border: 4px solid ${item.type === 'frame' ? item.color : 'transparent'}; box-shadow: ${item.type === 'glow' ? '0 0 15px ' + item.color : 'none'}">
          <span style="color:${item.color}; font-weight:bold; text-shadow: 1px 1px 5px rgba(0,0,0,0.5)">${item.name}</span>
        </div>
        <div class="text-center">
          <p class="font-bold text-sm">${item.name}</p>
          <p class="text-xs text-slate-500 uppercase">${item.type}</p>
        </div>
        <button class="btn w-full justify-center ${isOwned ? (isEquipped ? 'btn-secondary' : 'btn-accent') : 'btn-primary'}" 
                onclick="Shop.handleAction('${item.id}')">
          ${isOwned ? (isEquipped ? 'EQUIPPED' : 'EQUIP') : '🪙 ' + item.price}
        </button>
      `;
      container.appendChild(card);
    });
  },

  handleAction(id) {
    const item = this.items.find(i => i.id === id);
    if (MegaHub.state.inventory.includes(id)) {
      // Equip
      MegaHub.state.equipped[item.type] = MegaHub.state.equipped[item.type] === id ? null : id;
      localStorage.setItem('mega_equipped', JSON.stringify(MegaHub.state.equipped));
      MegaHub.showNotification(MegaHub.state.equipped[item.type] ? `${item.name} equipped!` : `${item.name} unequipped.`);
    } else {
      // Buy
      if (MegaHub.state.coins >= item.price) {
        MegaHub.state.coins -= item.price;
        MegaHub.state.inventory.push(id);
        localStorage.setItem('mega_coins', MegaHub.state.coins);
        localStorage.setItem('mega_inventory', JSON.stringify(MegaHub.state.inventory));
        MegaHub.showNotification(`Purchased ${item.name}!`);
        if (window.Sound) Sound.playWin();
      } else {
        MegaHub.showNotification("Not enough coins!");
        if (window.Sound) Sound.playError();
      }
    }
    MegaHub.updateLevel();
    this.render();
  }
};

Shop.init();
