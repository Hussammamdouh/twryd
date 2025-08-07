import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AreaAvatar from './AreaAvatar';
import AreaStatusBadge from './AreaStatusBadge';
import AreaGovernorateBadge from './AreaGovernorateBadge';
import ActionButtons from './ActionButtons';

export default function AreasGridView({ areas, governorates, loading, selectedGovernorate, onEdit, onDelete }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {selectedGovernorate === '' ? t('areas.select_governorate') : t('areas.no_areas')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          {selectedGovernorate === '' 
            ? t('areas.choose_governorate') 
            : t('messages.try_adjusting_filters')
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {areas.map((area) => {
        const governorate = governorates.find(g => g.id === area.governorate_id);
        
        return (
          <div key={area.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <AreaAvatar area={area} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {area.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <AreaStatusBadge isActive={area.is_active} />
                      <AreaGovernorateBadge 
                        governorateName={governorate?.name} 
                        governorateId={area.governorate_id} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {area.description && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {area.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('areas.polygon_points')}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {area.polygon?.length || 0}
                  </span>
                </div>

                {governorate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('areas.governorate')}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {governorate.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ActionButtons
                  onEdit={() => onEdit(area)}
                  onDelete={() => onDelete(area.id)}
                  showEdit={true}
                  showDelete={true}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
