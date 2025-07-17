import React, { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed top-6 right-6 z-[100] flex flex-col gap-3 items-end"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-lg shadow-lg text-white font-bold animate-fadeIn flex items-center gap-2
              ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            {t.type === 'success' && <span>✔️</span>}
            {t.type === 'error' && <span>❌</span>}
            {t.type === 'info' && <span>ℹ️</span>}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 