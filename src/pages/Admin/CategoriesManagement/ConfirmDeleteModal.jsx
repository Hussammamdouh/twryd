import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import Modal from '../../../UI/Common/Modal';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, categoryName, loading }) {
  const { t } = useLanguage();

  return (
    <Modal open={open} onClose={onClose} title={t('categories.delete')} size="medium">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('categories.delete')}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('categories.delete_confirm')} <span className="font-semibold text-gray-900 dark:text-white">{categoryName}</span>? 
          {t('categories.delete_warning')}
        </p>
        <div className="flex gap-4 w-full">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            {t('form.cancel')}
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="flex-1 py-2 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-red-600 hover:bg-red-700 focus:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? t('common.delete') + '...' : t('common.delete')}
          </button>
        </div>
      </div>
    </Modal>
  );
} 