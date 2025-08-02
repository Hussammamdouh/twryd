import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = ({ className = '', size = 'default', variant = 'buttons' }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const buttonSize = sizeClasses[size] || sizeClasses.default;

  // Modern dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          className={`${buttonSize} flex items-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm`}
          onClick={() => changeLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
          title={currentLanguage === 'en' ? t('language.switch_to_arabic') : t('language.switch_to_english')}
          aria-label={currentLanguage === 'en' ? t('language.switch_to_arabic') : t('language.switch_to_english')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="font-semibold">{currentLanguage === 'en' ? 'EN' : 'عربي'}</span>
          <svg className="w-3 h-3 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  // Compact pill variant
  if (variant === 'pill') {
    return (
      <div className={`flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 ${className}`}>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
            currentLanguage === 'en'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          title={t('language.english')}
          aria-label={t('language.english')}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('ar')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
            currentLanguage === 'ar'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          title={t('language.arabic')}
          aria-label={t('language.arabic')}
        >
          عربي
        </button>
      </div>
    );
  }

  // Default buttons variant
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