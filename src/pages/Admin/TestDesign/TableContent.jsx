import React from 'react';
import TableView from './TableView';
import GridView from './GridView';

export default function TableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction,
  statusColors,
  roleColors,
  priorityColors
}) {
  if (viewMode === 'table') {
    return (
      <TableView
        data={data}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
        statusColors={statusColors}
        roleColors={roleColors}
        priorityColors={priorityColors}
      />
    );
  }

  return (
    <GridView
      data={data}
      onAction={onAction}
      statusColors={statusColors}
      roleColors={roleColors}
      priorityColors={priorityColors}
    />
  );
} 