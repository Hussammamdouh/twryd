import React from 'react';

export default function AreaAvatar({ area }) {
  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAreaColor = (area) => {
    // Different colors based on area type or governorate
    const governorateId = area.governorate_id || 0;
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-yellow-500'
    ];
    
    return colors[governorateId % colors.length];
  };

  const color = getAreaColor(area);
  const initials = getInitials(area.name);

  return (
    <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
      {initials}
    </div>
  );
}

