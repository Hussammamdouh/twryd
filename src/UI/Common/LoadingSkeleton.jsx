import React from 'react';

// Table row skeleton
export const TableRowSkeleton = ({ columns = 6 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 md:px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        {index === 0 && (
          <div className="h-3 bg-gray-100 rounded w-1/2 mt-2"></div>
        )}
      </td>
    ))}
  </tr>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="overflow-x-auto rounded-lg shadow bg-white animate-pulse">
    <table className="min-w-full text-sm md:table">
      <thead>
        <tr className="bg-gray-50">
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-4 md:px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Card skeleton
export const CardSkeleton = ({ lines = 3 }) => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="h-4 bg-gray-200 rounded mb-2" style={{ width: `${80 - index * 10}%` }}></div>
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
    <div className="flex gap-3 pt-2">
      <div className="h-10 bg-gray-200 rounded flex-1"></div>
      <div className="h-10 bg-gray-200 rounded flex-1"></div>
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#f5f5f5] animate-pulse">
    <div className="pl-64 pt-20 pr-8">
      <div className="max-w-5xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <TableSkeleton rows={8} columns={7} />
      </div>
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4 animate-pulse">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Default loading skeleton
export default function LoadingSkeleton({ type = 'default' }) {
  if (type === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Welcome Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(6)].map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(6)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
    </div>
  );
} 