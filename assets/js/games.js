
const Games = {
  list: [
    { id: 'typing', name: 'Typing Speed', desc: 'Test your WPM in technical paragraphs.', icon: '⌨️', color: 'var(--primary)' },
    { id: 'snake', name: 'Snake Arcade', desc: 'Classic retro snake logic.', icon: '🐍', color: 'var(--accent)' },
    { id: 'memory', name: 'Memory Match', desc: 'Match geometric shapes quickly.', icon: '🧩', color: 'var(--secondary)' },
    { id: 'math', name: 'Math Sprint', desc: 'Solve rapid math equations.', icon: '🧮', color: 'var(--primary)' },
    { id: 'aim', name: 'Aim Trainer', desc: 'Click the targets as fast as possible.', icon: '🎯', color: '#ff4444' }
  ],

  current: null,
  canvas: null,
  ctx: null,
  gameInterval: null,

  init() {
    this.renderGrid();
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    if (gameId) this.launch(gameId);
    this.renderHOF();
  },

  renderGrid() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;
    grid.innerHTML = '';
    this.list.forEach(g => {
      const card = document.createElement('div');
      card.className = 'card glass';
      card.innerHTML = `
        <div style="font-size:3rem; margin-bottom:15px">${g.icon}</div>
        <h3 style="color:${g.color}">${g.name}</h3>
        <p style="font-size:0.9rem; color:#94a3b8; margin:8px 0">${g.desc}</p>
      `;
      card.onclick = () => this.launch(g.id);
      grid.appendChild(card);
    });
  },

  launch(id) {
    this.current = this.list.find(g => g.id === id);
    if (!this.current) return;

    document.getElementById('game-selection').style.display = 'none';
    document.getElementById('game-player').style.display = 'block';
    document.getElementById('game-title').textContent = this.current.name;
    document.getElementById('game-title').style.color = this.current.color;

    this.canvas = document.getElementById('main-canvas');
    if (this.canvas) this.ctx = this.canvas.getContext('2d');
    
    window.scrollTo(0, 0);
    this.start();
  },

  exit() {
    document.getElementById('game-selection').style.display = 'block';
    document.getElementById('game-player').style.display = 'none';
    this.stop();
  },

  start() {
    const htmlContent = document.getElementById('html-game-content');
    if (htmlContent) htmlContent.style.display = 'none';
    if (this.canvas) this.canvas.style.display = 'none';
    document.getElementById('game-overlay').style.display = 'none';

    if (this.current.id === 'typing') this.runTyping();
    if (this.current.id === 'snake') this.runSnake();
    if (this.current.id === 'memory') this.runMemory();
    if (this.current.id === 'math') this.runMath();
  },

  stop() {
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = null;
  },

  runTyping() {
    const container = document.getElementById('html-game-content');
    container.style.display = 'block';
    const text = "Mega Hub Architecture involves high-speed data transmission and low-latency rendering loops. The core engine is built on standard Web APIs to ensure maximum compatibility across all modern desktop and mobile browsers. Developers must focus on efficiency and memory management for stable frames.";
    
    container.innerHTML = `
      <div class="typing-target">${text}</div>
      <input type="text" id="type-input" class="typing-input" placeholder="Start typing here...">
      <div id="type-result" style="margin-top:20px; font-weight:bold"></div>
    `;

    const input = document.getElementById('type-input');
    const startTime = Date.now();
    input.focus();

    input.oninput = () => {
      if (input.value === text) {
        const time = (Date.now() - startTime) / 1000;
        const wpm = Math.round((text.split(' ').length / time) * 60);
        document.getElementById('type-result').innerHTML = `<span style="color:var(--primary)">SUCCESS! WPM: ${wpm}</span>`;
        if (window.Sound) Sound.playWin();
        MegaHub.addXP(wpm * 10);
        MegaHub.addCoins(Math.floor(wpm / 2));
      }
    };
  },

  runSnake() {
    this.canvas.style.display = 'block';
    this.canvas.width = 400; this.canvas.height = 400;
    let snake = [{x: 10, y: 10}], food = {x: 5, y: 5}, dx = 1, dy = 0, score = 0;
    const size = 20;

    const gameLoop = () => {
      const head = {x: snake[0].x + dx, y: snake[0].y + dy};
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
        this.stop();
        this.showGameOver(score);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
        if (window.Sound) Sound.playCorrect();
      } else snake.pop();

      this.ctx.fillStyle = '#000'; this.ctx.fillRect(0,0,400,400);
      this.ctx.fillStyle = 'lime'; snake.forEach(s => this.ctx.fillRect(s.x*size, s.y*size, size-2, size-2));
      this.ctx.fillStyle = 'red'; this.ctx.fillRect(food.x*size, food.y*size, size-2, size-2);
      document.getElementById('game-stats').textContent = `SCORE: ${score}`;
    };

    window.onkeydown = e => {
      if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
      if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
      if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
      if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
    };

    this.gameInterval = setInterval(gameLoop, 100);
  },

  showGameOver(score) {
    const overlay = document.getElementById('game-overlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <h2 style="font-size:3rem">GAME OVER</h2>
      <p style="font-size:1.5rem">FINAL SCORE: ${score}</p>
      <button class="btn btn-primary" style="margin-top:20px" onclick="Games.start();">PLAY AGAIN</button>
      <button class="btn btn-secondary" style="margin-top:10px" onclick="window.location.href='https://www.effectivegatecpm.com/u4x97iz6?key=6a5487414458b848a32026ced886c85d'">CLAIM BONUS XP</button>
    `;
    MegaHub.addXP(score);
    MegaHub.addCoins(Math.floor(score / 5));
    if (window.Sound) Sound.playWrong();
  },

  renderHOF() {
    const list = document.getElementById('hof-list');
    if (!list) return;
    const scores = [
      { name: 'Elite_One', score: '2400', game: 'Snake' },
      { name: 'FastKeys', score: '120 WPM', game: 'Typing' },
      { name: 'No_Life', score: '1800', game: 'Snake' }
    ];
    list.innerHTML = scores.map(s => `
      <div class="hof-row">
        <span>${s.name} (${s.game})</span>
        <span style="color:var(--primary); font-weight:bold">${s.score}</span>
      </div>
    `).join('');
  }
};
Games.init();
