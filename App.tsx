
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkBackground from './components/NetworkBackground.tsx';
import HubLogo from './components/HubLogo.tsx';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [tagline, setTagline] = useState("Architecting the Digital Backbone of Tomorrow");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTagline = async () => {
      // Check if API key is available and valid
      const apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey === '') {
        console.warn("MEGAHUB: API_KEY not found, using default tagline.");
        setIsLoading(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Write a powerful, short, futuristic 5-8 word tagline for a high-tech infrastructure company named "MEGAHUB NETWORKS". Do not include the name of the company in the tagline.',
        });
        if (response.text) {
          setTagline(response.text.trim().replace(/^"|"$/g, ''));
        }
      } catch (error) {
        console.error("AI Tagline Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagline();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      <NetworkBackground />

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <main className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <HubLogo />

          <div className="mt-8 mb-4 relative">
             <motion.h1 
                className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white font-heading"
                initial={{ letterSpacing: '0.1em', opacity: 0 }}
                animate={{ letterSpacing: '-0.02em', opacity: 1 }}
                transition={{ duration: 1.2, ease: "circOut" }}
             >
                MEGAHUB
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  NETWORKS
                </span>
             </motion.h1>
             <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
             />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex items-center space-x-3 text-cyan-400/80 uppercase tracking-[0.3em] font-bold text-sm md:text-base mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span>Coming Soon</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isLoading && (
              <motion.p
                key={tagline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-12 px-4"
              >
                {tagline}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-4 w-full max-w-md px-4"
          >
            <input 
              type="email" 
              placeholder="Enter email for early access" 
              className="px-6 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-full backdrop-blur-md transition-all duration-300 placeholder:text-slate-600"
            />
            <button className="w-full md:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-cyan-50 hover:scale-105 transition-all duration-300 shadow-xl active:scale-95 whitespace-nowrap">
              Notify Me
            </button>
          </motion.div>
        </motion.div>
      </main>

      <footer className="absolute bottom-8 w-full text-center px-4">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2.2 }}
          className="text-[10px] md:text-xs tracking-widest text-slate-500 uppercase"
        >
          &copy; {new Date().getFullYear()} MEGAHUB NETWORKS. Global Infrastructure Reimagined.
        </motion.p>
      </footer>
    </div>
  );
};

export default App;
