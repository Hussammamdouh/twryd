import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '../Common/ToastContext';
import Modal from '../Common/Modal';
import Spinner from '../supplier/Spinner';
import { createFormChangeHandler } from '../../utils/formUtils';
import { useFormFocus } from '../../hooks/useFormFocus';
import { useLanguage } from '../../contexts/LanguageContext';

// Security: Enhanced validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/;
// Simplified password regex that requires: at least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

export default function AdminFormModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const formRef = useRef();
  const { handleInputFocus } = useFormFocus();
  const { t } = useLanguage();

  // Create memoized change handler
  const handleChange = useCallback(
    createFormChangeHandler(setForm, setFormErrors),
    []
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        password: '',
        password_confirmation: '',
        role: initialData?.role || '',
        is_active: initialData?.is_active ?? true,
      });
      setFormErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, initialData]);

  // Performance: Memoize form validation
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t('form.name_required');
        if (value.trim().length < 2) return t('form.name_min_length');
        if (value.trim().length > 50) return t('form.name_max_length');
        return '';
      case 'email':
        if (!value.trim()) return t('form.email_required');
        if (!EMAIL_REGEX.test(value)) return t('form.email_invalid');
        return '';
      case 'phone':
        if (!value.trim()) return t('form.phone_required');
        if (!PHONE_REGEX.test(value)) return t('form.phone_invalid');
        return '';
      case 'password':
        if (!isEdit && !value) return t('form.password_required');
        if (value && !PASSWORD_REGEX.test(value)) {
          return t('form.password_requirements');
        }
        return '';
      case 'password_confirmation':
        if (!isEdit && !value) return t('form.confirm_password_required');
        if (value && value !== form.password) return t('form.passwords_not_match');
        return '';
      case 'role':
        if (!value) return t('form.role_required');
        return '';
      default:
        return '';
    }
  }, [isEdit, form.password, t]);

  // Performance: Memoize form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.keys(form).forEach(key => {
      if (key !== 'password_confirmation' || !isEdit) {
        const error = validateField(key, form[key]);
        if (error) errors[key] = error;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.show(t('messages.please_fix_errors'), 'error');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  }, [form, validateField, onSubmit, onClose, isEdit, toast, t]);

  // Performance: Memoize close handler
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  return (
    <Modal open={open} onClose={handleClose} size="large">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1">
                  {isEdit ? t('modal.edit_administrator') : t('modal.add_administrator')}
                </h2>
                <p className="text-purple-100 text-xs sm:text-sm lg:text-base leading-tight">
                  {isEdit ? t('admins.update_administrator_info_settings') : t('admins.add_new_administrator_platform')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              disabled={loading}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-3 sm:p-4 lg:p-8 pt-6 sm:pt-8 lg:pt-12 bg-gray-50/30 dark:bg-gray-800/30">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8" noValidate>
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('admins.basic_information')}</h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Name Field */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.full_name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    required
                    maxLength={50}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base ${
                      formErrors.name 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? 'name-error' : undefined}
                    placeholder={t('form.placeholder.full_name')}
                    disabled={loading}
                  />
                  {formErrors.name && (
                    <div id="name-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                {!isEdit && (
                  <div className="space-y-2 sm:space-y-3">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('form.email_address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={handleInputFocus}
                      required
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base ${
                        formErrors.email 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? 'email-error' : undefined}
                      placeholder={t('form.placeholder.email')}
                      disabled={loading}
                    />
                    {formErrors.email && (
                      <div id="email-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                )}

                {/* Phone Field */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.phone_number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base ${
                      formErrors.phone 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    aria-invalid={!!formErrors.phone}
                    aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                    placeholder={t('form.placeholder.phone')}
                    disabled={loading}
                  />
                  {formErrors.phone && (
                    <div id="phone-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Information */}
            {!isEdit && (
              <div className="bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('admins.security_information')}</h3>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Password Field */}
                  <div className="space-y-2 sm:space-y-3">
                    <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('form.password')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        onFocus={handleInputFocus}
                        required
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base ${
                          formErrors.password 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        aria-invalid={!!formErrors.password}
                        aria-describedby={formErrors.password ? 'password-error' : undefined}
                        placeholder={t('form.placeholder.password')}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={showPassword ? t('form.hide_password') : t('form.show_password')}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <div id="password-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formErrors.password}
                      </div>
                    )}
                    {!formErrors.password && (
                      <div className="text-gray-500 text-xs sm:text-sm">
                        {t('form.password_requirements')}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2 sm:space-y-3">
                    <label htmlFor="password_confirmation" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('form.confirm_password')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.password_confirmation}
                        onChange={handleChange}
                        onFocus={handleInputFocus}
                        required
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base ${
                          formErrors.password_confirmation 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        aria-invalid={!!formErrors.password_confirmation}
                        aria-describedby={formErrors.password_confirmation ? 'password-confirmation-error' : undefined}
                        placeholder={t('form.placeholder.confirm_password')}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={showConfirmPassword ? t('form.hide_password') : t('form.show_password')}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password_confirmation && (
                      <div id="password-confirmation-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formErrors.password_confirmation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Role and Status */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900/20 p-3 sm:p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{t('admins.role_status')}</h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Role Field */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="role" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.role')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm sm:text-base ${
                      formErrors.role 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    aria-invalid={!!formErrors.role}
                    aria-describedby={formErrors.role ? 'role-error' : undefined}
                    disabled={loading}
                  >
                    <option value="">{t('form.select_role')}</option>
                    <option value="admin">{t('profile.administrator')}</option>
                    <option value="manager">{t('admins.manager')}</option>
                    <option value="support">{t('profile.it_support')}</option>
                  </select>
                  {formErrors.role && (
                    <div id="role-error" className="text-red-500 text-xs sm:text-sm flex items-center gap-2" role="alert">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.role}
                    </div>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                      {t('form.active_account')}
                    </label>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                      {t('admins.active_account_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('form.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm lg:text-base"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size={16} color="border-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isEdit ? t('form.update') + ' ' + t('profile.administrator') : t('form.create') + ' ' + t('profile.administrator')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
} 