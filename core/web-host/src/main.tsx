import React from 'react'
import ReactDOM from 'react-dom/client'

// Polyfill for Expo Modules in Vite Web environment
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).ExpoModules = (window as any).ExpoModules || {};
  (window as any).ExpoModules.modules = (window as any).ExpoModules.modules || {};
}

import './styles.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
