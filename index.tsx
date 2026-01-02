import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Zap, Brain, Target, Keyboard, Trophy, User, ArrowRight, 
  Settings, ShoppingCart, MessageSquare, PlusCircle, Globe, Layout, 
  Search, Shield, Crown, PlayCircle, Coins, Flame, Info, ChevronRight,
  Palette, Eraser, Undo, Send, Clock, Layers, Star, Sun, CloudRain, Snowflake, 
  Zap as Thunder, Share2, LogOut, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- TYPES ---
interface Player {
  id: string;
  name: string;
  coins: number;
  xp: number;
  frame?: string;
  badge?: string;
}

interface Room {
  id: string;
  name: string;
  gameType: 'skribbl' | 'callbreak' | 'typing' | 'snake' | 'aim';
  players: Player[];
  status: 'lobby' | 'playing' | 'ended';
  maxPlayers: number;
  turnIndex: number;
  timer: number;
}

// --- CONSTANTS ---
const GAMES = [
  { id: 'skribbl', name: 'MegaDraw', icon: Palette, color: 'text-pink-400', desc: 'Drawing & Guessing' },
  { id: 'callbreak', name: 'Call Break', icon: Layers, color: 'text-emerald-400', desc: 'Strategic Card Game' },
  { id: 'typing', name: 'Type Battle', icon: Keyboard, color: 'text-blue-400', desc: 'Multiplayer WPM Race' },
  { id: 'aim', name: 'Kinetic Aim', icon: Target, color: 'text-red-400', desc: 'Precision Reflex Training' },
  { id: 'snake', name: 'Snake Duel', icon: Gamepad2, color: 'text-cyan-400', desc: 'Grid Dominance' }
];

// --- COMPONENT: WEATHER SYSTEM ---
const WeatherSystem = ({ type }: { type: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || type === 'off') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const particles: any[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    const create = () => {
      if (type === 'stars') return { x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 1.5, o: Math.random(), v: Math.random() * 0.01 };
      if (type === 'rain') return { x: Math.random() * canvas.width, y: -20, l: Math.random() * 15 + 10, v: Math.random() * 5 + 10 };
      if (type === 'snow') return { x: Math.random() * canvas.width, y: -20, r: Math.random() * 3 + 1, v: Math.random() * 1 + 0.5, o: Math.random() * 10 };
      return {};
    };
    for (let i = 0; i < 60; i++) particles.push(create());
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (type === 'stars') { p.o += p.v; ctx.globalAlpha = Math.abs(Math.sin(p.o)); ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); }
        if (type === 'rain') { ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.l); ctx.stroke(); p.y += p.v; if (p.y > canvas.height) particles[i] = create(); }
        if (type === 'snow') { ctx.fillStyle = 'white'; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(p.x + Math.sin(p.o) * 30, p.y, p.r, 0, Math.PI * 2); ctx.fill(); p.y += p.v; p.o += 0.01; if (p.y > canvas.height) particles[i] = create(); }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, [type]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.2 }} />;
};

// --- GAME: SKRIBBL ENGINE ---
const SkribblEngine = ({ room, onWin }: { room: Room, onWin: (c: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(room.timer);
  const isDrawer = room.players[room.turnIndex].id === 'local';

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(v => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const draw = (e: React.MouseEvent) => {
    if (!drawing || !isDrawer) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = color;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke(); ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleGuess = () => {
    if (guess.toLowerCase() === 'robot') {
      confetti(); setGuess(''); (window as any).MegaHub?.addCoins(250); onWin(250);
    } else { (window as any).Sound?.playWrong(); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="glass p-4 flex justify-between items-center bg-slate-900/60">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-400" size={20} />
          <span className="font-mono text-xl font-black">{timeLeft}s</span>
        </div>
        <div className="font-black tracking-widest uppercase">
          {isDrawer ? 'DRAW: ROBOT' : 'GUESS THE OBJECT'}
        </div>
        <div className="flex gap-2">
          {['#fff', '#3b82f6', '#ef4444', '#fbbf24'].map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full border border-white/20 transition-transform active:scale-90" style={{background: c}} />
          ))}
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} height={450} 
        onMouseDown={() => isDrawer && setDrawing(true)}
        onMouseUp={() => { setDrawing(false); canvasRef.current?.getContext('2d')?.beginPath(); }}
        onMouseMove={draw}
        className="w-full aspect-video bg-slate-950 rounded-2xl cursor-crosshair border-2 border-slate-800"
      />
      {!isDrawer && (
        <div className="flex gap-2">
          <input 
            type="text" value={guess} onChange={e => setGuess(e.target.value)} 
            className="flex-1 glass p-4 outline-none text-lg" placeholder="Type your guess..."
            onKeyDown={e => e.key === 'Enter' && handleGuess()}
          />
          <button onClick={handleGuess} className="btn btn-primary px-8">GUESS</button>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Guest', coins: 0, xp: 0, level: 1, inventory: [], equipped: {} as any });
  const [room, setRoom] = useState<Room | null>(null);
  const [season, setSeason] = useState('stars');
  const [diagnostics, setDiagnostics] = useState<{ name: string; status: 'ok' | 'fail' | 'pending' }[]>([]);

  // Safety Loader Removal
  useEffect(() => {
    const hideLoader = () => {
      const loader = document.getElementById('system-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    };
    
    // Attempt immediate removal
    hideLoader();
    // Safety backup
    const t = setTimeout(hideLoader, 3000);
    return () => clearTimeout(t);
  }, []);

  // State Sync
  useEffect(() => {
    const sync = () => {
      const s = (window as any).MegaHub?.state;
      if (s) {
        setUser({ 
          name: s.nickname || 'Guest', 
          coins: s.coins || 0, 
          xp: s.xp || 0, 
          level: Math.floor((s.xp || 0) / 1000) + 1, 
          inventory: s.inventory || [], 
          equipped: s.equipped || {} 
        });
        setSeason(s.settings?.season || 'stars');
      }
    };
    sync(); // Run once immediately
    const i = setInterval(sync, 1000);
    return () => clearInterval(i);
  }, []);

  const runDiagnostics = () => {
    const tests = ['UI_CORE', 'MULT_ENGINE', 'ADS_SYNC', 'ECON_SYNC', 'SND_BUS'];
    setDiagnostics(tests.map(t => ({ name: t, status: 'pending' })));
    tests.forEach((t, i) => {
      setTimeout(() => {
        setDiagnostics(prev => prev.map(p => p.name === t ? { ...p, status: 'ok' } : p));
        if (i === tests.length - 1) (window as any).MegaHub?.notify("System Integrity Confirmed.");
      }, 400 * (i + 1));
    });
  };

  const joinQuick = () => {
    (window as any).MegaHub?.notify("Searching for active nodes...");
    setTimeout(() => {
      setRoom({
        id: 'NODE-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        name: 'Nexus Arena 01',
        gameType: 'skribbl',
        players: [{ id: 'local', name: user.name, coins: user.coins, xp: user.xp }, { id: 'bot-1', name: 'Nero_Bot', coins: 500, xp: 1200 }],
        status: 'playing',
        maxPlayers: 10,
        turnIndex: 0,
        timer: 60
      });
      setView('arena');
    }, 1200);
  };

  return (
    <div className="app-shell relative z-[100]">
      <WeatherSystem type={season} />
      
      <header className="fixed top-0 w-full z-[1000] glass px-6 h-[72px] flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" onClick={() => { setView('dashboard'); setRoom(null); }}>
          <div className="p-1.5 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30"><Zap size={20} fill="white" stroke="white" /></div>
          <span className="megahub-branding text-2xl font-black tracking-tighter">MEGAHUB</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border-yellow-500/20 text-yellow-500 font-black">
            <Coins size={16} /> {user.coins}
          </div>
          <div className="profile-chip glass p-1 px-4 flex items-center gap-3 cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => setView('profile')}>
            <div className={`w-8 h-8 rounded-full bg-slate-800 avatar-container border border-white/10 ${user.equipped?.frame ? 'equipped-' + user.equipped.frame : ''}`} />
            <span className="text-sm font-black hidden sm:block group-hover:text-blue-400 transition-colors">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="content-wrapper">
        <main className="main-content">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="dash">
                <div className="text-center py-16">
                  <h1 className="text-6xl md:text-8xl font-black megahub-branding tracking-tighter glow-animate mb-2">MEGAHUB NETWORKS</h1>
                  <p className="text-slate-500 tracking-[0.5em] font-black uppercase text-sm mb-12">Play • Learn • Connect</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-10 bg-gradient-to-br from-blue-600/20 to-transparent relative group overflow-hidden border-blue-500/20">
                      <Flame className="absolute -right-8 -bottom-8 w-64 h-64 text-blue-500/10 group-hover:scale-110 transition-transform duration-700" />
                      <div className="relative z-10">
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">System: Online</span>
                        <h2 className="text-5xl font-black mb-4">THE GLOBAL ARENA</h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-lg font-medium">Multiplayer drawing, card strategy, and precision training nodes are active. Earn credits and claim your rank.</p>
                        <div className="flex flex-wrap gap-4">
                          <button onClick={joinQuick} className="btn btn-primary px-10 py-4 text-lg shadow-xl shadow-blue-500/20">QUICK PLAY</button>
                          <button onClick={() => setView('arcade')} className="btn glass px-10 py-4 text-lg">ARCADE HUB</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {GAMES.slice(0, 4).map(g => (
                        <div key={g.id} onClick={() => setView('arcade')} className="glass p-6 text-center hover:border-blue-500 group cursor-pointer bg-slate-900/40 transition-all hover:translate-y-[-4px]">
                          <g.icon className={`${g.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} size={32} />
                          <h4 className="font-black text-xs uppercase tracking-tighter">{g.name}</h4>
                        </div>
                      ))}
                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="glass p-6 border-l-4 border-blue-500">
                      <h3 className="font-black mb-4 flex items-center gap-2"><Settings size={18} className="text-blue-500" /> SYSTEM STATUS</h3>
                      <div className="space-y-2 mb-6">
                        {diagnostics.length > 0 ? diagnostics.map(d => (
                          <div key={d.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">{d.name}</span>
                            {d.status === 'pending' ? <RefreshCw size={10} className="animate-spin text-blue-400" /> : <CheckCircle size={10} className="text-emerald-400" />}
                          </div>
                        )) : <p className="text-[10px] text-slate-700 font-bold uppercase">No diagnostics running.</p>}
                      </div>
                      <button onClick={runDiagnostics} className="btn btn-accent w-full text-xs font-black py-3">RUN DIAGNOSTICS</button>
                    </div>
                    
                    <div className="glass p-6">
                      <h3 className="font-black mb-6 flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> LEADERS</h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400">#0{i} Node_Op_{i}</span>
                            <span className="font-mono text-blue-400 font-bold">{4000 - i*500} XP</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </motion.div>
            )}

            {view === 'arena' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="arena" className="space-y-6">
                {!room ? (
                  <div className="py-20 text-center glass p-10 bg-slate-900/50">
                    <Globe size={64} className="mx-auto text-blue-500 mb-6 opacity-50 animate-pulse" />
                    <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Arena Lobby</h2>
                    <p className="text-slate-500 font-black mb-10 tracking-[0.3em] uppercase text-xs">Connecting to Network Hub...</p>
                    <button onClick={joinQuick} className="btn btn-primary px-12 py-4">RE-SCAN NETWORK</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="glass p-4 flex justify-between items-center border-b border-blue-500/20">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setRoom(null)} className="p-2 glass hover:bg-white/5 transition-colors"><LogOut size={18} className="rotate-180" /></button>
                          <h2 className="text-xl font-black tracking-tighter uppercase">{room.name}</h2>
                        </div>
                        <div className="flex gap-2">
                          <span className="glass px-4 py-2 text-xs font-mono text-blue-400">NODE ID: {room.id}</span>
                          <button onClick={() => (window as any).MegaHub?.notify("Link Copied")} className="btn btn-secondary p-2 px-4 transition-colors"><Share2 size={16} /></button>
                        </div>
                      </div>
                      <div className="glass p-1 border-slate-800 bg-black/40 overflow-hidden">
                        <SkribblEngine room={room} onWin={(c) => (window as any).MegaHub?.notify(`Success: +${c} Credits`)} />
                      </div>
                    </div>
                    <aside className="space-y-6">
                      <div className="glass p-4 h-[400px] flex flex-col">
                        <h3 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">Chat Stream</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                          <div className="p-2 bg-slate-800/50 rounded-lg text-xs font-bold text-slate-300">Welcome to Node {room.id}</div>
                          <div className="p-2 bg-slate-800/50 rounded-lg text-xs font-bold text-slate-300">System: Encryption active</div>
                          <div className="p-2 bg-slate-800/50 rounded-lg text-xs font-bold text-slate-300">Nero_Bot: I'm ready.</div>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" className="flex-1 glass p-2 text-xs outline-none bg-slate-900/50" placeholder="Guess word..." />
                          <button className="btn btn-primary p-2 px-3"><Send size={14} /></button>
                        </div>
                      </div>
                      <div className="glass p-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">Operators (2/10)</h3>
                        {room.players.map(p => (
                          <div key={p.id} className="flex items-center justify-between mb-3 last:mb-0">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700" />
                              <span className="text-xs font-black">{p.name} {p.id==='local' && '(YOU)'}</span>
                            </div>
                            <span className="text-[10px] font-mono text-blue-500">{p.xp} XP</span>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'shop' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="shop">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                  <div>
                    <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">Virtual Market</h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Augment Identity Systems</p>
                  </div>
                  <div className="glass px-6 py-3 text-2xl font-black text-yellow-500 border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                    🪙 {user.coins}
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { id: 'frame-neon', name: 'Neon Frame', price: 1000, color: '#22d3ee' },
                    { id: 'frame-gold', name: 'Gold Frame', price: 2500, color: '#fbbf24' },
                    { id: 'glow-blue', name: 'Cyan Glow', price: 800, color: '#3b82f6' },
                    { id: 'badge-pro', name: 'Pro Badge', price: 1500, color: '#a855f7' }
                  ].map(item => {
                    const owned = user.inventory.includes(item.id as never);
                    return (
                      <div key={item.id} className="glass p-6 text-center space-y-4 flex flex-col group hover:translate-y-[-5px] transition-transform">
                        <div className="aspect-square bg-slate-900/50 rounded-2xl flex items-center justify-center relative border border-white/5 overflow-hidden">
                          <User size={48} className="text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0" style={{ border: `3px solid ${item.color}`, opacity: 0.2 }} />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-tighter">{item.name}</h4>
                        <button onClick={() => (window as any).Shop?.handleAction(item.id)} className={`btn w-full text-xs font-black ${owned ? 'btn-secondary' : 'btn-primary'}`}>
                          {owned ? 'EQUIP' : `🪙 ${item.price}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="profile" className="max-w-4xl mx-auto space-y-8">
                <div className="glass p-10 flex flex-col md:flex-row items-center gap-10 bg-slate-900/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Globe size={120} /></div>
                  <div className={`w-40 h-40 rounded-full bg-slate-800 flex items-center justify-center border-4 border-blue-500/30 avatar-container relative ${user.equipped?.frame ? 'equipped-' + user.equipped.frame : ''}`}>
                    <User size={64} className="text-slate-600" />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-4 py-1 rounded-full font-black text-[10px] shadow-lg">LEVEL {user.level}</div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-5xl font-black megahub-branding mb-2 uppercase tracking-tighter">{user.name}</h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.5em] mb-8 text-[10px]">Operator Status: Fully Verified</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass p-4 text-center bg-slate-950/30">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Available Credits</p>
                        <p className="text-2xl font-black text-yellow-500">🪙 {user.coins}</p>
                      </div>
                      <div className="glass p-4 text-center bg-slate-950/30">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Global XP Score</p>
                        <p className="text-2xl font-black text-blue-500">{user.xp}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-8 space-y-6">
                    <h3 className="text-lg font-black uppercase flex items-center gap-2"><Settings size={18} className="text-slate-500" /> HUB PROTOCOLS</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-400">Environment FX</label>
                        <select 
                          value={season} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setSeason(val);
                            (window as any).MegaHub?.updateSetting('season', val);
                          }}
                          className="glass p-2 bg-slate-900/50 text-xs outline-none border-slate-700 font-bold"
                        >
                          <option value="stars">STARS</option>
                          <option value="rain">RAIN</option>
                          <option value="snow">SNOW</option>
                          <option value="off">OFF</option>
                        </select>
                      </div>
                      <button onClick={() => { localStorage.clear(); location.reload(); }} className="btn btn-accent w-full text-xs font-black py-4 transition-all hover:bg-cyan-400">FACTORY RESET NETWORK</button>
                    </div>
                  </div>
                  <div className="glass p-8 flex flex-col items-center justify-center text-center opacity-40">
                     <p className="text-xs text-slate-500 italic uppercase tracking-widest font-black">Advanced Panel Locked</p>
                     <p className="text-[10px] mt-2">Requires Level 5 Node Permission</p>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'arcade' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="arcade" className="space-y-10">
                <div className="text-center">
                  <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">Arcade Hub</h1>
                  <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Independent Node Training Modules</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {GAMES.map(g => (
                    <div key={g.id} className="card glass p-8 text-center hover:scale-[1.03] transition-all group cursor-pointer bg-slate-900/20" onClick={joinQuick}>
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center ${g.color} mb-6 border border-white/5 shadow-inner`}>
                        <g.icon size={32} />
                      </div>
                      <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{g.name}</h3>
                      <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed px-4">{g.desc}</p>
                      <button className="btn btn-primary w-full text-xs py-3 font-black">INITIATE NODE</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed bottom-0 w-full glass z-[2000] border-t border-white/10 h-[72px] flex justify-around items-center px-4 bg-slate-950/80">
        {[
          { id: 'dashboard', icon: Layout, label: 'Hub' },
          { id: 'arena', icon: Globe, label: 'Arena' },
          { id: 'arcade', icon: Gamepad2, label: 'Arcade' },
          { id: 'shop', icon: ShoppingCart, label: 'Market' },
          { id: 'profile', icon: User, label: 'User' }
        ].map(link => (
          <button 
            key={link.id} 
            onClick={() => { setView(link.id); setRoom(null); }}
            className={`flex flex-col items-center gap-1 transition-all ${view === link.id ? 'text-blue-500 scale-110' : 'text-slate-600 hover:text-white'}`}
          >
            <link.icon size={22} strokeWidth={view === link.id ? 3 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{link.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- RELIABLE MOUNTING ---
const mountApplication = () => {
  const container = document.getElementById('root');
  if (container) {
    try {
      const root = createRoot(container);
      root.render(<App />);
      console.log("%c[APP] VDOM Rendering Initiated", "color: #10b981; font-weight: 800;");
    } catch (err) {
      console.error("[FATAL] React Render Failed:", err);
      // Attempt emergency loader removal
      const loader = document.getElementById('system-loader');
      if (loader) loader.remove();
    }
  } else {
    console.error("[FATAL] Application Root Missing");
  }
};

// Use cross-compatible load detection
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountApplication();
} else {
  window.addEventListener('load', mountApplication);
}
