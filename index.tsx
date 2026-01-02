import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error("Critical Startup Error:", err);
    container.innerHTML = `<div style="color:white;text-align:center;padding:50px;font-family:sans-serif;">
      <h2 style="color:#f87171">Interface Offline</h2>
      <p style="color:#94a3b8">Error: ${err instanceof Error ? err.message : 'System Failure'}</p>
      <button onclick="window.location.reload()" style="margin-top:20px;padding:8px 16px;background:#1e293b;color:white;border-radius:4px;border:none;">Retry</button>
    </div>`;
  }
}