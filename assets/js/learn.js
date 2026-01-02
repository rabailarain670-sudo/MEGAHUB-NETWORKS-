const Learn = {
  courses: [],
  currentCourse: null,
  currentChapter: 0,

  init() {
    this.generateCourses();
    this.renderGrid();
  },

  generateCourses() {
    const topics = ['Coding', 'Biology', 'Chemistry', 'Physics', 'History', 'Cybersecurity'];
    for (let i = 1; i <= 50; i++) {
      const topic = topics[i % topics.length];
      this.courses.push({
        id: i,
        title: `${topic} Pro ${i}`,
        desc: `Master the fundamental pillars of ${topic} through deep architectural study.`,
        chapters: [
          { title: "Introduction", content: "The beginning of understanding is the definition of parameters. In this first stage, we define the scope of our research and the primary dependencies required for a stable system. Each element must be carefully selected to minimize technical debt and maximize throughput." },
          { title: "Core Mechanics", content: "Now we delve into the physical properties and the underlying mathematical models. Whether it is a line of script or a chemical reaction, the rules are deterministic. By manipulating these variables, we can achieve specific predictable outputs in any environment." },
          { title: "Practical Application", content: "Theory is only useful when applied. Here, we build a real-world project using the modules learned previously. We focus on scalability and reliability to ensure the final product meets industrial standards." }
        ],
        quiz: {
          q: "What is the primary focus of module 3?",
          o: ["Theory", "Scalability", "Definition", "Scopes"],
          a: 1
        }
      });
    }
  },

  renderGrid() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    this.courses.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card glass';
      card.innerHTML = `
        <h3 style="color:var(--secondary)">${c.title}</h3>
        <p style="font-size:0.9rem; color:#94a3b8; margin:8px 0">${c.desc}</p>
        <div style="margin-top:10px; font-weight:bold; font-size:0.75rem; color:var(--secondary)">PROGRESS: 0%</div>
      `;
      card.onclick = () => this.launch(c.id);
      grid.appendChild(card);
    });
  },

  launch(id) {
    this.currentCourse = this.courses.find(c => c.id === id);
    this.currentChapter = 0;
    document.getElementById('course-list-view').style.display = 'none';
    document.getElementById('chapter-view').style.display = 'block';
    this.renderChapter();
  },

  renderChapter() {
    const c = this.currentCourse;
    const chap = c.chapters[this.currentChapter];
    document.getElementById('course-title').textContent = c.title;
    document.getElementById('chapter-title').textContent = chap.title;
    document.getElementById('chapter-content').textContent = chap.content;
    
    const prog = ((this.currentChapter + 1) / c.chapters.length) * 100;
    document.getElementById('progress-fill').style.width = `${prog}%`;

    if (this.currentChapter === c.chapters.length - 1) {
      document.getElementById('quiz-area').style.display = 'block';
      this.renderQuiz();
      document.getElementById('next-chapter-btn').style.display = 'none';
    } else {
      document.getElementById('quiz-area').style.display = 'none';
      document.getElementById('next-chapter-btn').style.display = 'block';
    }
    window.scrollTo(0,0);
  },

  renderQuiz() {
    const q = this.currentCourse.quiz;
    document.getElementById('quiz-question').textContent = q.q;
    const options = document.getElementById('quiz-options');
    options.innerHTML = '';
    q.o.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn glass';
      btn.style.width = '100%'; btn.style.textAlign = 'left';
      btn.textContent = opt;
      btn.onclick = () => this.checkQuiz(i);
      options.appendChild(btn);
    });
  },

  checkQuiz(index) {
    const q = this.currentCourse.quiz;
    if (index === q.a) {
      MegaHub.showNotification("CORRECT! +100 XP");
      if (window.Sound) Sound.playCorrect();
      MegaHub.addXP(100);
      this.exit();
    } else {
      MegaHub.showNotification("Incorrect, try again.");
      if (window.Sound) Sound.playWrong();
    }
  },

  next() {
    this.currentChapter++;
    this.renderChapter();
  },

  exit() {
    document.getElementById('course-list-view').style.display = 'block';
    document.getElementById('chapter-view').style.display = 'none';
  }
};
Learn.init();