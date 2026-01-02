
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("MEGAHUB: App Mounted");
  } catch (err) {
    console.error("MEGAHUB: Mounting Error", err);
    container.innerHTML = `<div style="color:white;text-align:center;padding:50px;font-family:sans-serif;">
      <h2 style="color:#f87171">Initialization Failed</h2>
      <p style="color:#94a3b8">${err instanceof Error ? err.message : 'Check console for details'}</p>
    </div>`;
  }
} else {
  console.error("MEGAHUB: Target container not found");
}
