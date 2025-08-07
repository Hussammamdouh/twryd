import React from 'react';
import ViewModeToggle from './ViewModeToggle';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';

export default function TableHeader({
  data,
  totalData,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedRole,
  setSelectedRole,
  viewMode,
  setViewMode
}) {
  return (
    <div className="px-6 lg:px-8 py-6 lg:py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10">
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Top row - Title and stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Users Management
              </h2>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                Manage and monitor user accounts
              </p>
            </div>
          </div>
          
          {/* Stats badges */}
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="inline-flex items-center px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-sm lg:text-base font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm">
              {data.length} of {totalData.length} users
            </span>
            
            {/* Desktop-only additional info */}
            <div className="hidden lg:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-medium">{data.filter(u => u.status === 'active').length} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="font-medium">{data.filter(u => u.status === 'pending').length} Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">{data.filter(u => u.status === 'inactive').length} Inactive</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom row - Filters and search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6">
          {/* Left side - View toggle and filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            
            <FilterDropdown
              label="Role"
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'Supplier', label: 'Suppliers' },
                { value: 'Client', label: 'Clients' },
                { value: 'Admin', label: 'Admins' }
              ]}
            />

            <FilterDropdown
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />
          </div>
          
          {/* Right side - Search and additional filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 flex-1">
            <div className="flex-1 min-w-0">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search users by name or email..."
              />
            </div>
            
            {/* Desktop-only additional filters */}
            <div className="hidden lg:flex items-center gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>More Filters</span>
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Saved Views</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 