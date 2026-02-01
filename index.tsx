
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Système de secours pour les erreurs fatales
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error:", message, error);
  // On ne bloque plus l'affichage si c'est juste un avertissement
  if (message.toString().includes('Script error')) return;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
