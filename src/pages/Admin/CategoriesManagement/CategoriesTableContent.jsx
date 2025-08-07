import React from 'react';
import CategoriesTableView from './CategoriesTableView';
import CategoriesGridView from './CategoriesGridView';

export default function CategoriesTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction,
  getIconUrl
}) {
  if (viewMode === 'table') {
    return (
      <CategoriesTableView
        data={data}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
        getIconUrl={getIconUrl}
      />
    );
  }

  return (
    <CategoriesGridView
      data={data}
      onAction={onAction}
      getIconUrl={getIconUrl}
    />
  );
} 