import React from 'react';

const statusStyles = {
  // Invitation statuses
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  declined: 'bg-red-100 text-red-700 border-red-200',
  
  // General statuses
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  
  // Product statuses
  available: 'bg-blue-100 text-blue-700 border-blue-200',
  out_of_stock: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  discontinued: 'bg-gray-100 text-gray-600 border-gray-200',
  
  // Warehouse statuses
  operational: 'bg-green-100 text-green-700 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons = {
  pending: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  accepted: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  declined: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  active: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  inactive: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  expired: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

export default function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'default',
  className = '' 
}) {
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  const style = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-600 border-gray-200';
  const icon = statusIcons[normalizedStatus];
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-xs',
    large: 'px-4 py-2 text-sm',
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.default;
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold border
        ${style} ${sizeClass} ${className}
      `}
      role="status"
      aria-label={`Status: ${normalizedStatus}`}
    >
      {showIcon && icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="capitalize">
        {normalizedStatus.replace(/_/g, ' ')}
      </span>
    </span>
  );
} 