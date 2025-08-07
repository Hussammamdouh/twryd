import React from 'react';
import SubscriptionsTableView from './SubscriptionsTableView';
import SubscriptionsGridView from './SubscriptionsGridView';

export default function SubscriptionsTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  if (viewMode === 'grid') {
    return (
      <SubscriptionsGridView data={data} onAction={onAction} />
    );
  }

  return (
    <SubscriptionsTableView
      data={data}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onAction={onAction}
    />
  );
}
