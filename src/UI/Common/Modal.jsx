import React, { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, children, title, className = '' }) {
  const ref = useRef();
  const lastActiveElement = useRef(null);
  // Generate unique id for aria-labelledby
  const labelId = title ? `modal-title-${Math.random().toString(36).slice(2)}` : undefined;

  useEffect(() => {
    if (!open) return;
    // Save last focused element
    lastActiveElement.current = document.activeElement;
    // Focus modal
    ref.current?.focus();
    // Handle Esc key and focus trap
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // Focus trap
        const focusableEls = ref.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        } else if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      // Restore focus
      lastActiveElement.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      tabIndex={-1}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative outline-none ${className}`}
        aria-describedby={labelId ? `${labelId}-desc` : undefined}
      >
        {title && <h2 id={labelId} className="text-xl font-bold mb-4">{title}</h2>}
        {children}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
} 