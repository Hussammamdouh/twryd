import React from 'react';
import TableHeader from './TableHeader';
import TableContent from './TableContent';
import TableFooter from './TableFooter';
import { statusColors, roleColors, priorityColors } from './mockData.jsx';

export default function UsersTable({
  data,
  totalData,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedRole,
  setSelectedRole,
  viewMode,
  setViewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <TableHeader
        data={data}
        totalData={totalData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <TableContent
        data={data}
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
        statusColors={statusColors}
        roleColors={roleColors}
        priorityColors={priorityColors}
      />
      
      <TableFooter data={data} totalData={totalData} />
    </div>
  );
} 