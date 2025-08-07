import React from 'react';

export default function PlanAvatar({ plan }) {
  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanColor = (plan) => {
    if (plan.is_custom) {
      return 'bg-purple-500';
    }
    
    // Different colors based on plan type or price range
    const price = plan.price_per_month || 0;
    if (price < 50) return 'bg-green-500';
    if (price < 100) return 'bg-blue-500';
    if (price < 200) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const color = getPlanColor(plan);
  const initials = getInitials(plan.name);

  return (
    <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
      {initials}
    </div>
  );
}

