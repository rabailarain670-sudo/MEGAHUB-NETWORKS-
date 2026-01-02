
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Root element '#root' not found in DOM.");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("MEGAHUB: Application mounted successfully.");
  } catch (err) {
    console.error("MEGAHUB MOUNT ERROR:", err);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif; text-align: center;">
        <h1 style="color: #ef4444;">Initialization Failed</h1>
        <p style="color: #94a3b8;">The application could not be started. Check console for details.</p>
        <code style="display: block; background: #0f172a; padding: 10px; margin-top: 10px; font-size: 12px;">${err instanceof Error ? err.message : String(err)}</code>
      </div>`;
    }
  }
};

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
