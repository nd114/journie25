import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Show a subtle notification instead of blocking confirm
                const updateBanner = document.createElement('div');
                updateBanner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#4f46e5;color:white;padding:12px;text-align:center;z-index:9999;';
                updateBanner.innerHTML = 'New version available! <button onclick="location.reload()" style="margin-left:10px;padding:4px 12px;background:white;color:#4f46e5;border:none;border-radius:4px;cursor:pointer;">Update Now</button>';
                document.body.appendChild(updateBanner);
                
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed: ', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)