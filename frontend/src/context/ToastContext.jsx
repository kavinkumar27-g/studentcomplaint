/**
 * ToastContext.jsx
 * 
 * Provides a global toast notification system.
 * Call showToast('message', 'success' | 'error' | 'info') from anywhere.
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast notification
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Manually dismiss a toast
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Icons for each toast type
  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container - renders toasts in top-right corner */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="alert"
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
              {icons[toast.type]}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                flexShrink: 0,
                padding: '2px 6px',
                borderRadius: '4px',
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast() - Custom hook to show toast notifications
 * Usage: const { showToast } = useToast();
 *        showToast('Complaint submitted!', 'success');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
