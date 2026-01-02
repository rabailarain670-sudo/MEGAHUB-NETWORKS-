
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, BookOpen, Info, MessageSquare, BookText, Wrench, Trophy, User, Settings, 
  Menu, X, Bell, Search, Play, Send, RefreshCw, ChevronRight, Star, Heart, 
  Dices, Zap, Brain, Volume2, Moon, Sun, Monitor, ShieldCheck, Share2, 
  ChevronLeft, ArrowRight, CheckCircle2, CloudRain, Snowflake, CloudLightning, Wind, Stars as StarsIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES & UTILS ---

interface Game {
  id: string;
  name: string;
  category: 'Solo' | 'Arena';
  icon: any;
  color: string;
  description: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  chapters: { title: string; content: string; quiz: { q: string; a: string[]; correct: number }[] }[];
}

// --- SOUND ENGINE ---
const SoundEngine = {
  ctx: null as AudioContext | null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  },
  playHeavyClick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },
  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },
  playError() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
};

// --- AD COMPONENTS ---
const AdUnit = ({ id, type, label = "Sponsored" }: { id: string, type: string, label?: string }) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (adRef.current && !adRef.current.innerHTML.includes('iframe')) {
      const script = document.createElement('script');
      // Mapping for the exact provided codes
      const config: Record<string, any> = {
        '728x90': { key: 'ca62188f74ef0038211200819287107d', height: 90, width: 728 },
        '160x600': { key: '3786c373fb067d1092814cd741ef7d0d', height: 600, width: 160 },
        '320x50': { key: '8b1e3d61861d1c17368c4fd4e1eecf52', height: 50, width: 320 },
        '300x250': { key: '4f52a4b1f5dba3d1b6bf80d44634631d', height: 250, width: 300 },
        '468x60': { key: 'c992751dba51ea4600c3e3b94c90b0af', height: 60, width: 468 },
        '160x300': { key: '6d30c2159793f3f5d0a2f28567d808d4', height: 300, width: 160 },
      };
      
      const c = config[type];
      if (c) {
        (window as any).atOptions = { key: c.key, format: 'iframe', height: c.height, width: c.width, params: {} };
        const s = document.createElement('script');
        s.src = `https://www.highperformanceformat.com/${c.key}/invoke.js`;
        adRef.current.appendChild(s);
      }
    }
  }, [type]);

  return (
    <div className="flex flex-col items-center my-4 overflow-hidden">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</span>
      <div ref={adRef} className="min-h-[50px] min-w-[320px] bg-slate-900/20 rounded flex items-center justify-center border border-slate-800" />
    </div>
  );
};

// --- DATA CONSTANTS ---
const SOLO_GAMES: Game[] = [
  { id: 'typing', name: 'Typing Speed', category: 'Solo', icon: KeyboardIcon, color: 'blue', description: 'Test your WPM in 60 seconds.' },
  { id: 'memory', name: 'Memory Match', category: 'Solo', icon: Brain, color: 'purple', description: 'Match SVG shapes in record time.' },
  { id: 'math', name: 'Math Sprint', category: 'Solo', icon: Zap, color: 'yellow', description: 'Infinite mental arithmetic.' },
  { id: 'aim', name: 'Aim Trainer', category: 'Solo', icon: TargetIcon, color: 'red', description: 'Precision clicking targets.' },
  { id: 'word', name: 'Word Unscramble', category: 'Solo', icon: BookText, color: 'emerald', description: 'Find the hidden vocabulary.' },
  { id: 'reaction', name: 'Reaction Time', category: 'Solo', icon: Zap, color: 'orange', description: 'Wait for green, then click!' },
  { id: 'slide', name: 'Sliding Puzzle', category: 'Solo', icon: GridIcon, color: 'pink', description: 'Reorder the grid blocks.' },
  { id: 'snake', name: 'Snake Arcade', category: 'Solo', icon: Dices, color: 'green', description: 'Classic retro snake.' },
  { id: 'flappy', name: 'Flappy Bird', category: 'Solo', icon: BirdIcon, color: 'cyan', description: 'Navigate the neon pipes.' },
  { id: 'quiz', name: 'Quiz Rush', category: 'Solo', icon: Trophy, color: 'indigo', description: 'General knowledge dash.' },
];

function KeyboardIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/></svg>; }
function TargetIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>; }
function GridIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>; }
function BirdIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 2.45-4.9a2 2 0 0 1 1.79-1.1H11a2 2 0 0 1 2 2v2"/><path d="M11 9h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9Z"/><path d="M15 13v4a2 2 0 0 1-2 2H9"/><path d="M13 9a2 2 0 0 1 2 2v2"/><circle cx="12" cy="12" r="1"/></svg>; }

// Generate 50 courses
const COURSES: Course[] = Array.from({ length: 50 }, (_, i) => ({
  id: `c-${i}`,
  title: [
    'Advanced React Architecture', 'Python for AI', 'Cybersecurity 101', 'World War II Deep Dive', 'Quantum Physics',
    'Modern UI/UX', 'Cloud Computing', 'Ethical Hacking', 'Ancient Rome', 'Sustainable Energy'
  ][i % 10] + ` (Module ${Math.floor(i / 10) + 1})`,
  category: ['Web Dev', 'Programming', 'Science', 'History', 'Tech'][i % 5],
  chapters: [
    { title: 'Foundations', content: 'In this chapter, we explore the core principles...', quiz: [{ q: 'What is the root principle?', a: ['A', 'B', 'C'], correct: 0 }] },
    { title: 'Core Mechanics', content: 'Now we dive into the internal mechanisms...', quiz: [{ q: 'How does it function?', a: ['X', 'Y', 'Z'], correct: 1 }] },
    { title: 'Advanced Applications', content: 'Finally, we look at real-world usage...', quiz: [{ q: 'Where is it used?', a: ['Everywhere', 'Nowhere'], correct: 0 }] }
  ]
}));

// --- COMPONENTS ---

const Header = ({ onMenuClick, onOpenSection, user }: any) => (
  <header className="sticky top-0 z-50 glass h-16 px-4 md:px-8 flex items-center justify-between border-b border-slate-800 shadow-2xl">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="p-2 hover:bg-slate-800 rounded-full transition-colors lg:hidden">
        <Menu size={20} />
      </button>
      <div onClick={() => onOpenSection('dashboard')} className="flex items-center gap-2 cursor-pointer group">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all">
          <Gamepad2 size={20} className="text-white" />
        </div>
        <span className="font-heading font-bold text-lg hidden sm:block tracking-tighter">MEGA<span className="text-blue-500">HUB</span></span>
      </div>
    </div>

    <div className="flex-1 max-w-md mx-8 relative hidden md:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input 
        type="text" 
        placeholder="Search games, courses, info..." 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
      />
    </div>

    <div className="flex items-center gap-3">
      <button onClick={() => onOpenSection('arena')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold hover:bg-red-600/20 transition-all">
        <Zap size={14} /> ARENA
      </button>
      <button onClick={() => onOpenSection('notifications')} className="relative p-2 text-slate-400 hover:text-white transition-colors">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617]"></span>
      </button>
      <div onClick={() => onOpenSection('profile')} className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
          <User size={18} className="text-slate-400" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold leading-tight group-hover:text-blue-400 transition-colors">{user.name}</p>
          <p className="text-[10px] text-slate-500">Lv. {user.level}</p>
        </div>
      </div>
    </div>
  </header>
);

const Sidebar = ({ isOpen, onClose, activeSection, onOpenSection }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'games', label: 'Game Hub', icon: Gamepad2 },
    { id: 'arena', label: 'The Arena', icon: Zap },
    { id: 'learning', label: 'Learning Center', icon: BookOpen },
    { id: 'info', label: 'Info Hub', icon: Info },
    { id: 'ai', label: 'AI Companions', icon: MessageSquare },
    { id: 'stories', label: 'Story Engine', icon: BookText },
    { id: 'tools', label: 'Utility Tools', icon: Wrench },
    { id: 'halloffame', label: 'Hall of Fame', icon: Trophy },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>
      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed top-0 left-0 bottom-0 w-64 glass border-r border-slate-800 z-[70] lg:translate-x-0 pt-20"
      >
        <div className="px-4 py-2 flex flex-col gap-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onOpenSection(item.id); onClose(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === item.id 
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <AdUnit type="160x300" id="sidebar-ad" label="Partners" />
        </div>
      </motion.aside>
    </>
  );
};

const WeatherOverlay = ({ type }: { type: string }) => {
  if (type === 'none') return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-30">
      {type === 'rain' && <div className="absolute inset-0 animate-pulse bg-blue-500/5"><div className="w-full h-full" style={{ background: 'linear-gradient(transparent, rgba(255,255,255,0.1))', backgroundSize: '1px 100px' }} /></div>}
      {type === 'snow' && <div className="absolute inset-0 bg-white/5" />}
      {type === 'fog' && <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-[1px]" />}
    </div>
  );
};

// --- SECTION: GAMES ---
// Fixed TypeScript error for 'key' prop by explicitly using React.FC which handles React-specific props like key
const GameCard: React.FC<{ game: Game, onClick: () => void }> = ({ game, onClick }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="glass p-5 rounded-2xl cursor-pointer group border border-slate-700 hover:border-blue-500/50 transition-all relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${game.color}-500/10 blur-3xl -mr-12 -mt-12 group-hover:bg-${game.color}-500/20 transition-all`} />
    <div className={`w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all`}>
      <game.icon className={`text-slate-300 group-hover:text-white transition-colors`} />
    </div>
    <h3 className="font-heading font-bold text-lg mb-1">{game.name}</h3>
    <p className="text-slate-500 text-xs leading-relaxed">{game.description}</p>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-1 rounded">{game.category}</span>
      <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-500 translate-x-[-10px] group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
    </div>
  </motion.div>
);

// --- MAIN APP ---
const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'ProGamer_X', level: 12, xp: 450, coins: 2500 });
  const [settings, setSettings] = useState({ 
    sound: true, volume: 50, weather: 'stars', theme: 'dark', adDensity: 'normal' 
  });
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Sound triggers
  useEffect(() => {
    const handleGlobalClick = () => {
      if (settings.sound) SoundEngine.playHeavyClick();
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [settings.sound]);

  const openSection = (id: string) => {
    setActiveSection(id);
    setActiveGame(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden glass border border-slate-700 flex items-center px-8 md:px-12 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/20 z-0" />
        <div className="relative z-10 max-w-lg">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full mb-4 tracking-widest uppercase">Weekly Challenge</span>
          <h1 className="font-heading text-4xl md:text-5xl font-black mb-4 tracking-tight">SLIDING MASTERY EVENT</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">Complete the 4x4 sliding puzzle under 60 seconds to win a Neon Badge and 500 XP.</p>
          <button onClick={() => setActiveGame('slide')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30">
            <Play size={18} fill="currentColor" /> PLAY NOW
          </button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150 rotate-12" />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="text-blue-500" /> POPULAR GAMES
            </h2>
            <button onClick={() => openSection('games')} className="text-blue-400 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOLO_GAMES.slice(0, 6).map(game => (
              <GameCard key={game.id} game={game} onClick={() => setActiveGame(game.id)} />
            ))}
          </div>

          <AdUnit type="728x90" id="dash-mid" />

          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold flex items-center gap-2">
              <BookOpen className="text-emerald-500" /> RECOMMENDED COURSES
            </h2>
            <button onClick={() => openSection('learning')} className="text-emerald-400 text-sm font-medium hover:underline">View Library</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COURSES.slice(0, 4).map(course => (
              <div key={course.id} className="glass p-4 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <BookText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{course.title}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{course.category}</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-600" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800">
            <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" /> TOP LEADERS
            </h3>
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${i === 1 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{i}</span>
                    <span className="font-medium text-slate-300">User_{i}99</span>
                  </div>
                  <span className="font-mono text-blue-400">{(10-i)*1200} XP</span>
                </div>
              ))}
            </div>
          </div>
          <AdUnit type="160x600" id="side-rail" />
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <h2 className="font-heading text-3xl font-black mb-6">SYSTEM SETTINGS</h2>
      <div className="glass p-8 rounded-3xl border border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Volume2 /></div>
            <div>
              <p className="font-bold">Sound Effects</p>
              <p className="text-xs text-slate-500">Enable/Disable system UI sounds</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings(s => ({...s, sound: !s.sound}))}
            className={`w-14 h-7 rounded-full p-1 transition-all ${settings.sound ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all ${settings.sound ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Environment Effects</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['none', 'rain', 'snow', 'fog'].map(t => (
              <button 
                key={t}
                onClick={() => setSettings(s => ({...s, weather: t}))}
                className={`py-3 rounded-xl border text-sm font-bold capitalize transition-all ${settings.weather === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ad Density</p>
          <div className="flex gap-4">
            {['low', 'normal', 'high'].map(d => (
              <button 
                key={d}
                onClick={() => setSettings(s => ({...s, adDensity: d}))}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${settings.adDensity === d ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="w-full py-4 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> FACTORY RESET SYSTEM
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <WeatherOverlay type={settings.weather} />
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onOpenSection={openSection}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeSection={activeSection}
        onOpenSection={openSection}
      />

      <main className="lg:ml-64 p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-32">
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div 
              key="game-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-6 md:p-12 rounded-3xl border border-slate-700 min-h-[500px] flex flex-col items-center justify-center text-center space-y-8"
            >
              <button onClick={() => setActiveGame(null)} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={20} /> Exit Game
              </button>
              
              <div className="w-24 h-24 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-4 animate-bounce">
                <Gamepad2 size={48} />
              </div>
              <h2 className="font-heading text-4xl font-black">{SOLO_GAMES.find(g => g.id === activeGame)?.name}</h2>
              <p className="text-slate-400 max-w-md">Game core logic initializing... (Simulated game view for demo, fully functional engine in final deploy).</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Time Left</p>
                  <p className="text-2xl font-mono text-yellow-500">60:00</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Score</p>
                  <p className="text-2xl font-mono text-blue-500">0000</p>
                </div>
              </div>

              <AdUnit type="300x250" id="game-ad" />
            </motion.div>
          ) : (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'games' && (
                <div className="space-y-8">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-3xl font-black">SOLO ARCADE</h2>
                        <p className="text-slate-500">10 high-performance challenges for solo players.</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold border border-slate-700">Recent</button>
                        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold border border-slate-700">Hard</button>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {SOLO_GAMES.map(game => <GameCard key={game.id} game={game} onClick={() => setActiveGame(game.id)} />)}
                   </div>
                   <AdUnit type="Native" id="games-native" />
                </div>
              )}
              {activeSection === 'settings' && renderSettings()}
              {['arena', 'learning', 'info', 'ai', 'stories', 'tools', 'halloffame'].includes(activeSection) && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800 animate-pulse">
                    {activeSection === 'arena' && <Zap size={48} className="text-red-500" />}
                    {activeSection === 'learning' && <BookOpen size={48} className="text-emerald-500" />}
                    {activeSection === 'info' && <Info size={48} className="text-blue-500" />}
                    {activeSection === 'ai' && <MessageSquare size={48} className="text-purple-500" />}
                    {activeSection === 'stories' && <BookText size={48} className="text-pink-500" />}
                    {activeSection === 'tools' && <Wrench size={48} className="text-orange-500" />}
                    {activeSection === 'halloffame' && <Trophy size={48} className="text-yellow-500" />}
                  </div>
                  <h2 className="font-heading text-3xl font-black uppercase tracking-widest">{activeSection.replace(/([A-Z])/g, ' $1')}</h2>
                  <p className="text-slate-500 max-w-md">Section content is loading... High-quality modules for {activeSection} are being synchronized with your local vault.</p>
                  <AdUnit type="300x250" id="generic-section-ad" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 lg:hidden glass border-t border-slate-800 flex items-center justify-around z-[50] px-4">
        {[
          { id: 'dashboard', icon: Monitor },
          { id: 'games', icon: Gamepad2 },
          { id: 'arena', icon: Zap },
          { id: 'ai', icon: MessageSquare },
          { id: 'settings', icon: Settings },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => openSection(item.id)}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${activeSection === item.id ? 'text-blue-500 scale-110' : 'text-slate-500'}`}
          >
            <item.icon size={20} />
            <span className="text-[8px] mt-1 font-bold uppercase tracking-widest">{item.id === 'dashboard' ? 'Home' : item.id}</span>
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <footer className="lg:ml-64 p-8 glass border-t border-slate-800/50 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="text-blue-500" />
              <span className="font-heading font-bold text-xl">MEGAHUB</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">The ultimate gateway to gaming, learning, and AI interaction. Built for the modern gamer who never stops growing.</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-3">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</h4>
               <ul className="text-sm space-y-2">
                 <li className="hover:text-blue-400 cursor-pointer">Arena</li>
                 <li className="hover:text-blue-400 cursor-pointer">Live Hub</li>
                 <li className="hover:text-blue-400 cursor-pointer">Events</li>
               </ul>
             </div>
             <div className="space-y-3">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support</h4>
               <ul className="text-sm space-y-2">
                 <li className="hover:text-blue-400 cursor-pointer">Safety</li>
                 <li className="hover:text-blue-400 cursor-pointer">Terms</li>
                 <li className="hover:text-blue-400 cursor-pointer">API</li>
               </ul>
             </div>
          </div>
          <div>
            <AdUnit type="320x50" id="footer-ad" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">© 2025 MEGAHUB NETWORKS. All rights reserved.</p>
          <div className="flex gap-6">
            <Share2 size={16} className="text-slate-600 hover:text-white cursor-pointer" />
            <Monitor size={16} className="text-slate-600 hover:text-white cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
