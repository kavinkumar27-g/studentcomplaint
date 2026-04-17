/**
 * main.jsx
 * 
 * Application entry point.
 * Wraps the App with all required Context Providers:
 *  - AuthProvider: handles JWT token & user session
 *  - ToastProvider: provides global toast notifications
 * 
 * Order matters: AuthProvider wraps everything so any component 
 * (including ToastProvider's children) can access auth state.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* AuthProvider: Must wrap everything so all components have user access */}
    <AuthProvider>
      {/* ToastProvider: Renders the toast container + provides showToast() */}
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
