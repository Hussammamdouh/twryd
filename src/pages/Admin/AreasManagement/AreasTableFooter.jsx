import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function AreasTableFooter({ data, totalData }) {
  const { t } = useLanguage();

  // Defensive check - ensure data is always an array
  const areas = Array.isArray(data) ? data : [];
  const totalAreas = Array.isArray(totalData) ? totalData : [];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          {t('areas.showing', { 
            from: areas.length > 0 ? 1 : 0, 
            to: areas.length, 
            total: totalAreas.length 
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">
            {t('common.total')}: {totalAreas.length}
          </span>
        </div>
      </div>
    </div>
  );
}
