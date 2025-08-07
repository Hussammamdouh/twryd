import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function PlansStatsCards({ stats }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {stats.map((stat) => (
        <div key={stat.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer">
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-500 ${stat.bgGradient} dark:${stat.darkBgGradient}`}></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-6 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce"></div>
            {/* Additional particles for desktop */}
            <div className="hidden lg:block absolute top-1/4 left-4 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
            <div className="hidden lg:block absolute bottom-1/4 right-6 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            {/* Header with icon and title */}
            <div className="flex items-start justify-between mb-4 lg:mb-6">
              <div className="flex-1 min-w-0">
                <p className="text-sm lg:text-base font-medium text-gray-600 dark:text-gray-400 mb-1 lg:mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                  {stat.title}
                </p>
              </div>
              <div className={`flex-shrink-0 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                <div className="text-white group-hover:rotate-12 transition-transform duration-300">
                  <div className="w-5 h-5 lg:w-6 lg:h-6">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main value */}
            <div className="mb-4 lg:mb-6">
              <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300 leading-tight">
                {stat.value}
              </p>
            </div>
            
            {/* Change indicator and progress */}
            <div className="mt-auto space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center text-sm font-semibold transition-all duration-300 ${
                    stat.changeType === 'positive' 
                      ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300' 
                      : 'text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <svg className="w-4 h-4 mr-1 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    {stat.change}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {t('common.vs_last_month')}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 lg:h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    stat.changeType === 'positive' 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ 
                    width: `${Math.abs(parseFloat(stat.change)) * 2}%`,
                    animation: 'progressFill 2s ease-out'
                  }}
                ></div>
              </div>
              
              {/* Additional desktop-only info */}
              <div className="hidden lg:block pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t('common.trend')}</span>
                  <span className={`font-medium ${
                    stat.changeType === 'positive' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.changeType === 'positive' ? t('common.increasing') : t('common.decreasing')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
