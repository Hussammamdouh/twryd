import React, { useMemo, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ProfileCard({ name, email, phone, onLogout, role }) {
  const { t } = useLanguage();
  
  // Performance: Memoize user initials
  const initials = useMemo(() => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [name]);

  // Performance: Memoize logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm(t('profile.logout_confirm'))) {
      onLogout();
    }
  }, [onLogout, t]);

  // Security: Sanitize contact information
  const sanitizedEmail = useMemo(() => {
    if (!email) return '';
    // Basic email sanitization - in production use proper sanitization
    return email.replace(/[<>]/g, '');
  }, [email]);

  const sanitizedPhone = useMemo(() => {
    if (!phone) return '';
    // Basic phone sanitization
    return phone.replace(/[<>]/g, '');
  }, [phone]);

  return (
    <div className="theme-card p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 max-w-xs sm:max-w-md w-full mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg">
          {initials}
        </div>
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="text-base sm:text-lg font-bold text-theme-text mb-1">
            {name || t('profile.default_name')}
          </div>
          {role && (
            <div className="text-xs text-primary-500 font-semibold mb-1 px-2 py-1 bg-primary-50 rounded-full dark:bg-primary-900/30 dark:text-primary-300">
              {role === 'admin' ? t('profile.administrator') : 
               role === 'superadmin' ? t('profile.super_administrator') : 
               role === 'it_support' ? t('profile.it_support') : role}
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        {sanitizedEmail && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-theme-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a 
              href={`mailto:${sanitizedEmail}`} 
              className="text-primary-600 hover:text-primary-800 hover:underline transition-colors break-all"
              aria-label={`Send email to ${sanitizedEmail}`}
            >
              {sanitizedEmail}
            </a>
          </div>
        )}
        
        {sanitizedPhone && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-theme-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a 
              href={`tel:${sanitizedPhone}`} 
              className="text-green-600 hover:text-green-800 hover:underline transition-colors"
              aria-label={`Call ${sanitizedPhone}`}
            >
              {sanitizedPhone}
            </a>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-theme-border my-2" />

      {/* Account Information */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-text-secondary">{t('profile.account_type')}:</span>
          <span className="font-semibold text-theme-text">{t('profile.administrator')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-text-secondary">{t('common.status')}:</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            {t('common.active')}
          </span>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 focus:bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
      >
        {t('nav.logout')}
      </button>

      {/* Security Note */}
      <div className="text-center text-xs text-theme-text-secondary mt-2">
        {t('profile.secure_admin_account')}
      </div>
    </div>
  );
} 