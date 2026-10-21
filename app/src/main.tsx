import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Production cache layer: after the first visit the whole site (murals included)
// loads from disk instead of re-downloading ~50 MB on every return visit.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const showUpdateToast = () => {
    if (document.getElementById('sw-update-toast')) return;
    const el = document.createElement('div');
    el.id = 'sw-update-toast';
    el.textContent = '✨ 有新内容 · 点我刷新';
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:calc(env(safe-area-inset-bottom) + 5.2rem)',
      'transform:translateX(-50%)',
      'z-index:99',
      'background:rgba(36,26,19,0.96)',
      'border:1px solid rgba(212,163,89,0.55)',
      'color:#f5d697',
      'padding:9px 16px',
      'borderRadius:999px',
      'fontSize:13px',
      'cursor:pointer',
      'boxShadow:0 8px 28px rgba(0,0,0,0.6)',
    ].join(';');
    el.onclick = () => window.location.reload();
    document.body.appendChild(el);
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((reg) => {
        // a new build is ready: offer a one-tap refresh
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw?.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast();
            }
          });
        });
        // a previous session may already have a waiting worker
        if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast();
      })
      .catch(() => {
        /* private mode or unsupported: the site still works, just uncached */
      });
  });
}
