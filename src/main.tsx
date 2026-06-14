import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource-variable/space-grotesk/index.css'
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import App from './App.tsx'
import { initializeFirewall } from './lib/requestFirewall'
import { initializeDOMMonitor } from './lib/domMonitor'

// Initialize security modules in production only
// Requirements 6.1: Intercept all fetch and XMLHttpRequest calls at startup
// Requirements 7.5: DOM Monitor only activates in production builds
const isProduction = import.meta.env.PROD;

// Initialize request firewall
initializeFirewall({
  enabled: isProduction,
  onBlocked: (url, method) => {
    console.warn(`[Security] Blocked ${method} request to: ${url}`);
    // TODO: Integrate with security logger when implemented (Task 12)
  },
});

import { analytics } from './services/analytics';

// Initialize Analytics
analytics.init();

// Initialize DOM integrity monitor
// Requirements 7.1, 7.2, 7.4: Monitor DOM for unauthorized script/iframe injections
initializeDOMMonitor({
  enabled: isProduction,
  onViolation: (_element, type) => {
    console.warn(`[Security] Removed unauthorized ${type} injection`);
    // TODO: Integrate with security logger when implemented (Task 12)
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // Prompt user to refresh
      if (confirm("New content available. Reload?")) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log("App is ready to work offline.");
    },
  });
}
