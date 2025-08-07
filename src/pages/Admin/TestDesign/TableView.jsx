import React from 'react';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';

export default function TableView({
  data,
  sortBy,
  sortOrder,
  onSort,
  onAction,
  statusColors,
  roleColors,
  priorityColors
}) {
  const SortableHeader = ({ column, children }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-200 group" 
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{children}</span>
        {sortBy === column && (
          <svg className={`w-4 h-4 text-blue-500 dark:text-blue-400 transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
        {sortBy !== column && (
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/10">
          <tr>
            <SortableHeader column="name">User</SortableHeader>
            <SortableHeader column="email">Email</SortableHeader>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Role & Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Priority
            </th>
            <SortableHeader column="joinDate">Join Date</SortableHeader>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Last Active
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr 
              key={item.id} 
              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-300 group animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* User Column */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="group-hover:scale-110 transition-transform duration-200">
                    <UserAvatar avatar={item.avatar} />
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {item.id}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Email Column */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.email.split('@')[1]}
                  </div>
                </div>
              </td>
              
              {/* Role & Status Column */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex flex-col gap-2">
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
                </div>
              </td>
              
              {/* Priority Column */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="group-hover:scale-105 transition-transform duration-200">
                  <StatusBadge 
                    text={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} 
                    colorClass={priorityColors[item.priority]} 
                  />
                </div>
              </td>
              
              {/* Join Date Column */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {new Date(item.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor((new Date() - new Date(item.joinDate)) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                </div>
              </td>
              
              {/* Last Active Column */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {new Date(item.lastActive).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {Math.floor((new Date() - new Date(item.lastActive)) / (1000 * 60 * 60 * 24))} days ago
                  </div>
                </div>
              </td>
              
              {/* Actions Column */}
              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ActionButtons item={item} onAction={onAction} />
                </div>
                <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Try adjusting your search or filter criteria.</p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 