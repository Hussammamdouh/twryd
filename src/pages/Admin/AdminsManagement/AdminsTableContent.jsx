import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AdminsTableView from './AdminsTableView';
import AdminsGridView from './AdminsGridView';

export default function AdminsTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  if (viewMode === 'grid') {
    return (
      <AdminsGridView
        data={data}
        onAction={onAction}
      />
    );
  }

  return (
    <AdminsTableView
      data={data}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onAction={onAction}
    />
  );
} 