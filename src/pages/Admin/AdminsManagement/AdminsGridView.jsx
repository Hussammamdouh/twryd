import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AdminAvatar from './AdminAvatar';
import AdminStatusBadge from './AdminStatusBadge';
import AdminRoleBadge from './AdminRoleBadge';
import ActionButtons from './ActionButtons';

export default function AdminsGridView({ data, onAction }) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 lg:p-8">
      {data.map((admin) => (
        <div
          key={admin.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header with avatar and actions */}
          <div className="flex items-start justify-between mb-4">
            <AdminAvatar admin={admin} />
            <ActionButtons admin={admin} onAction={onAction} />
          </div>

          {/* Admin info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {admin.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {admin.email}
              </p>
            </div>

            {admin.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{admin.phone}</span>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <AdminRoleBadge role={admin.role} />
              <AdminStatusBadge isActive={admin.is_active} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>ID: {admin.id}</span>
              <span>Admin</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 