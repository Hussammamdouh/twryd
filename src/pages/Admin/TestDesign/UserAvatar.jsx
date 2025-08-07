import React from 'react';

export default function UserAvatar({ avatar, size = "medium" }) {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-sm",
    large: "w-12 h-12 text-sm"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg`}>
      <span className="font-bold text-white">
        {avatar}
      </span>
    </div>
  );
} 