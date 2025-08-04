import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useFormFocus } from '../../hooks/useFormFocus';

const Modal = memo(({ 
  open, 
  onClose, 
  children, 
  title, 
  className = '',
  size = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}) => {
  const modalRef = useRef();
  const lastActiveElement = useRef(null);
  const labelId = title ? `modal-title-${Math.random().toString(36).slice(2)}` : undefined;
  const { focusFirstInput } = useFormFocus();

  // Performance: Memoize close handler
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Performance: Memoize overlay click handler
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  // Performance: Memoize keydown handler
  const handleKeyDown = useCallback((e) => {
    if (closeOnEscape && e.key === 'Escape') {
      handleClose();
    }
    
    if (e.key === 'Tab') {
      // Enhanced focus trap
      const focusableEls = modalRef.current?.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableEls || focusableEls.length === 0) return;
      
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
  }, [closeOnEscape, handleClose]);

  useEffect(() => {
    if (!open) return;

    // Save last focused element
    lastActiveElement.current = document.activeElement;
    
    // Focus modal
    modalRef.current?.focus();
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first input after a short delay to ensure DOM is ready
    const focusTimer = setTimeout(() => {
      focusFirstInput(modalRef);
    }, 100);
    
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      
      // Restore focus
      lastActiveElement.current?.focus();
    };
  }, [open, handleKeyDown, focusFirstInput]);

  // Size classes
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    default: 'max-w-md',
    large: 'max-w-lg',
    xlarge: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const modalSize = sizeClasses[size] || sizeClasses.default;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      aria-describedby={labelId ? `${labelId}-desc` : undefined}
      tabIndex={-1}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`theme-modal rounded-2xl shadow-2xl w-full ${modalSize} relative outline-none animate-scaleIn ${className} max-h-[90vh] flex flex-col`}
        role="document"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
            {title && (
              <h2 id={labelId} className="text-xl font-bold text-theme-text">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-surface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div 
          id={labelId ? `${labelId}-desc` : undefined}
          className="flex-1 overflow-y-auto px-6 pb-6"
        >
          {children}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal; 