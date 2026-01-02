
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("MEGAHUB: Bootstrapping application...");

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
    console.log("MEGAHUB: Render initiated.");
  } catch (err) {
    console.error("MEGAHUB: Fatal error during mounting:", err);
    container.innerHTML = `
      <div style="color:white;text-align:center;padding:40px;font-family:sans-serif;">
        <h2 style="color:#f87171;font-size:1.5rem;margin-bottom:1rem;">System Error</h2>
        <p style="color:#94a3b8;margin-bottom:2rem;">Failed to initialize the core network interface.</p>
        <pre style="text-align:left;background:#0f172a;padding:20px;border-radius:8px;overflow:auto;font-size:11px;color:#60a5fa;border:1px solid #1e293b;">${err instanceof Error ? err.stack : String(err)}</pre>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#334155;color:white;border-radius:6px;border:none;cursor:pointer;">Retry Connection</button>
      </div>`;
  }
} else {
  console.error("MEGAHUB: DOM Root not found.");
}
