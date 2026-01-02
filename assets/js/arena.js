const Arena = {
  roomCode: null,
  isHost: false,

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      this.roomCode = joinCode;
      this.launchRoom();
    }
  },

  createRoom() {
    this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.isHost = true;
    this.launchRoom();
  },

  joinRoom() {
    const code = document.getElementById('room-code-input').value;
    if (code.length < 3) return MegaHub.showNotification("Invalid code");
    this.roomCode = code.toUpperCase();
    this.launchRoom();
  },

  quickPlay() {
    MegaHub.showNotification("Searching for public rooms...");
    setTimeout(() => {
      this.createRoom();
      MegaHub.showNotification("No rooms found, created new public room.");
    }, 1500);
  },

  launchRoom() {
    document.getElementById('arena-lobby').style.display = 'none';
    document.getElementById('room-view').style.display = 'block';
    document.getElementById('display-room-code').textContent = this.roomCode;
    this.simulateMatching();
  },

  simulateMatching() {
    const playerList = document.getElementById('player-list');
    const status = document.getElementById('match-status');
    
    setTimeout(() => {
      const p = document.createElement('div');
      p.style.cssText = 'display:flex; align-items:center; gap:8px; opacity:0; animation: fadeIn 0.5s forwards;';
      p.innerHTML = '<div class="avatar-mini" style="width:24px; height:24px; background:#e11d48"></div><span>Bot_Player_1</span>';
      playerList.appendChild(p);
      MegaHub.showNotification("Bot_Player_1 joined the room.");
    }, 2000);

    setTimeout(() => {
      status.textContent = "GET READY! STARTING IN 5...";
      if (window.Sound) Sound.playBeep();
    }, 4000);
  },

  shareRoom() {
    const url = `${window.location.origin}${window.location.pathname}?join=${this.roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      MegaHub.showNotification("Link copied to clipboard!");
    });
  }
};
Arena.init();