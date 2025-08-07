import React from 'react';
import SubscriptionRequestsTableView from './SubscriptionRequestsTableView';
import SubscriptionRequestsGridView from './SubscriptionRequestsGridView';

export default function SubscriptionRequestsTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onApprove,
  onReject,
  rowLoading,
  actionResult
}) {
  if (viewMode === 'grid') {
    return (
      <SubscriptionRequestsGridView
        data={data}
        onApprove={onApprove}
        onReject={onReject}
        rowLoading={rowLoading}
        actionResult={actionResult}
      />
    );
  }

  return (
    <SubscriptionRequestsTableView
      data={data}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onApprove={onApprove}
      onReject={onReject}
      rowLoading={rowLoading}
      actionResult={actionResult}
    />
  );
}
