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
        className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 sm:px-5 py-3 rounded-lg shadow-lg text-white font-semibold animate-fadeIn flex items-center gap-2 pointer-events-auto max-w-sm sm:max-w-md
              ${t.type === 'success' ? 'bg-green-600 border border-green-500' : 
                t.type === 'error' ? 'bg-red-600 border border-red-500' : 
                'bg-blue-600 border border-blue-500'}`}
            role="alert"
            aria-label={`${t.type} notification`}
          >
            {t.type === 'success' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {t.type === 'info' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm sm:text-base">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 