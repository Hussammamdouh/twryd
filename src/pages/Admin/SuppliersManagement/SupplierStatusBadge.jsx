import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function SupplierStatusBadge({ isActive }) {
  const { t } = useLanguage();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${
        isActive ? 'bg-green-400' : 'bg-gray-400'
      }`}></span>
      {isActive ? t('common.active') : t('common.inactive')}
    </span>
  );
} 