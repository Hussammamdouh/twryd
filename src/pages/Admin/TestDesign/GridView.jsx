import React from 'react';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';

export default function GridView({
  data,
  onAction,
  statusColors,
  roleColors,
  priorityColors
}) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div 
            key={item.id} 
            className="group relative bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fadeInUp"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-900/10 dark:via-indigo-900/5 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-6 w-1 h-1 bg-indigo-400/30 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-bounce"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <UserAvatar avatar={item.avatar} size="large" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ActionButtons item={item} onAction={onAction} compact />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {item.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    ID: {item.id}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="group-hover:scale-105 transition-transform duration-200">
                    <StatusBadge 
                      text={item.role} 
                      colorClass={roleColors[item.role]} 
                    />
                  </div>
                  <div className="group-hover:scale-105 transition-transform duration-200">
                    <StatusBadge 
                      text={item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
                      colorClass={statusColors[item.status]} 
                    />
                  </div>
                  <div className="group-hover:scale-105 transition-transform duration-200">
                    <StatusBadge 
                      text={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} 
                      colorClass={priorityColors[item.priority]} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Joined:</span>
                    <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {new Date(item.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last active:</span>
                    <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {new Date(item.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Days since join:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {Math.floor((new Date() - new Date(item.joinDate)) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Days inactive:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {Math.floor((new Date() - new Date(item.lastActive)) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Activity Level</span>
                    <span className="font-medium">
                      {item.status === 'active' ? 'High' : item.status === 'pending' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        item.status === 'active' 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                          : item.status === 'pending'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ 
                        width: `${item.status === 'active' ? 85 : item.status === 'pending' ? 60 : 25}%`,
                        animation: 'progressFill 2s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hover border effect */}
            <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-50 transition-all duration-300 ${
              item.status === 'active' 
                ? 'group-hover:border-emerald-500' 
                : item.status === 'pending'
                ? 'group-hover:border-amber-500'
                : 'group-hover:border-red-500'
            }`}></div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try adjusting your search or filter criteria to find the users you're looking for.
          </p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 