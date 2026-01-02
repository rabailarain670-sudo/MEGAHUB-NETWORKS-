const Profile = {
  parts: { head: 0, eyes: 0, mouth: 0, hair: 0 },
  
  init() {
    const s = MegaHub.state.settings;
    document.getElementById('nickname-input').value = MegaHub.state.nickname;
    document.getElementById('set-sound').checked = s.sound;
    document.getElementById('set-volume').value = s.volume;
    document.getElementById('set-theme').value = s.theme;
    document.getElementById('set-season').value = s.season;
    document.getElementById('vol-val').textContent = `${s.volume}%`;
    this.renderAvatar();
  },

  saveName() {
    const val = document.getElementById('nickname-input').value;
    if (val.length < 2) return;
    MegaHub.state.nickname = val;
    localStorage.setItem('mega_nickname', val);
    MegaHub.updateLevel();
    MegaHub.showNotification("Identity updated!");
  },

  updateSetting(key, val) {
    MegaHub.state.settings[key] = val;
    localStorage.setItem('mega_settings', JSON.stringify(MegaHub.state.settings));
    MegaHub.applySettings();
    if (key === 'volume') document.getElementById('vol-val').textContent = `${val}%`;
  },

  changePart(type) {
    this.parts[type] = (this.parts[type] + 1) % 6;
    this.renderAvatar();
  },

  randomize() {
    this.parts.head = Math.floor(Math.random() * 6);
    this.parts.eyes = Math.floor(Math.random() * 6);
    this.parts.mouth = Math.floor(Math.random() * 6);
    this.parts.hair = Math.floor(Math.random() * 6);
    this.renderAvatar();
  },

  renderAvatar() {
    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="hsl(${this.parts.head * 60}, 50%, 40%)" />
        <g stroke="white" stroke-width="2" fill="none">
          <circle cx="35" cy="40" r="${this.parts.eyes + 2}" />
          <circle cx="65" cy="40" r="${this.parts.eyes + 2}" />
        </g>
        <path d="M 35 70 Q 50 ${70 + this.parts.mouth * 2} 65 70" stroke="white" stroke-width="3" fill="none" />
        <rect x="25" y="10" width="50" height="${10 + this.parts.hair * 5}" fill="hsl(${this.parts.hair * 40}, 30%, 20%)" />
      </svg>
    `;
    document.getElementById('avatar-preview').innerHTML = svg;
    localStorage.setItem('mega_avatar_svg', svg);
    MegaHub.renderAvatars();
  }
};
Profile.init();