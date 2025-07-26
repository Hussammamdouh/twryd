import React from 'react';
import Modal from '../Common/Modal';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="medium">
      <div className="flex flex-col items-center text-center p-2">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-3 text-theme-text">{title}</h2>
        
        {/* Message */}
        <p className="text-theme-text-secondary mb-8 leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 px-6 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 focus:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 