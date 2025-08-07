import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SuppliersTableView from './SuppliersTableView';
import SuppliersGridView from './SuppliersGridView';

export default function SuppliersTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  if (viewMode === 'grid') {
    return (
      <SuppliersGridView
        data={data}
        onAction={onAction}
      />
    );
  }

  return (
    <SuppliersTableView
      data={data}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onAction={onAction}
    />
  );
} 