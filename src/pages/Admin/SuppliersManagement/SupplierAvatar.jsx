import React from 'react';

export default function SupplierAvatar({ supplier }) {
  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-blue-500';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getAvatarColor(supplier.name)} flex items-center justify-center`}>
      <span className="text-sm font-medium text-white">
        {getInitials(supplier.name)}
      </span>
    </div>
  );
} 