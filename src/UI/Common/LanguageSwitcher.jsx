import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = ({ className = '', size = 'default' }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const buttonSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => changeLanguage('en')}
        className={`${buttonSize} rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
          currentLanguage === 'en'
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        title={t('language.english')}
        aria-label={t('language.english')}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`${buttonSize} rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
          currentLanguage === 'ar'
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        title={t('language.arabic')}
        aria-label={t('language.arabic')}
      >
        عربي
      </button>
    </div>
  );
};

export default LanguageSwitcher; 