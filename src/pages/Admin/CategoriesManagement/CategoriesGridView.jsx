import React from 'react';
import CategoryAvatar from './CategoryAvatar';
import CategoryStatusBadge from './CategoryStatusBadge';
import ActionButtons from './ActionButtons';

export default function CategoriesGridView({
  data,
  onAction,
  getIconUrl
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 lg:p-8">
      {data.map((category) => (
        <div
          key={category.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header with avatar and actions */}
          <div className="flex items-start justify-between mb-4">
            <CategoryAvatar category={category} getIconUrl={getIconUrl} />
            <ActionButtons
              onEdit={() => onAction('edit', category)}
              onDelete={() => onAction('delete', category)}
            />
          </div>

          {/* Category info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h3>
              {category.name_ar && (
                <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                  {category.name_ar}
                </p>
              )}
            </div>

            {/* Status badge */}
            <div className="flex flex-wrap gap-2">
              <CategoryStatusBadge 
                isActive={category.is_active}
                onToggle={() => onAction('toggle_status', category)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>ID: {category.id}</span>
              <span>Category</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 