import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import ActionButtons from './ActionButtons';

export default function AreasTableView({ areas, governorates, onAction }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {t('areas.table_name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {t('areas.table_governorate')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {t('areas.table_polygon_points')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {t('areas.table_actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {areas.map((area) => (
            <tr key={area.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {area.name}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {governorates.find(g => g.id === area.governorate_id)?.name || 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  {area.polygon?.length || 0} {t('areas.points')}
                </span>
              </td>
              <td className="px-4 py-3">
                <ActionButtons
                  onEdit={() => onAction('edit', area)}
                  onDelete={() => onAction('delete', area)}
                  editTitle={t('areas.edit')}
                  deleteTitle={t('areas.delete')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
