import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../Common/ToastContext';
import Modal from '../Common/Modal';
import Spinner from '../supplier/Spinner';

// Security: Enhanced validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^01[0-9]{9}$|^\+?[0-9]{10,15}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
        if (!value.trim()) return 'Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (value.trim().length > 50) return 'Name must be less than 50 characters.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address.';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required.';
        if (!PHONE_REGEX.test(value)) return 'Please enter a valid phone number.';
        return '';
      case 'password':
        if (!isEdit && !value) return 'Password is required.';
        if (value && !PASSWORD_REGEX.test(value)) {
          return 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.';
        }
        return '';
      case 'password_confirmation':
        if (!isEdit && !value) return 'Password confirmation is required.';
        if (value && value !== form.password) return 'Passwords do not match.';
        return '';
      case 'role':
        if (!value) return 'Role is required.';
        return '';
      default:
        return '';
    }
  }, [isEdit, form.password]);

  // Performance: Memoize form change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setForm(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

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
      toast.show('Please fix the errors in the form.', 'error');
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
  }, [form, validateField, onSubmit, onClose, isEdit, toast]);

  // Performance: Memoize close handler
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  return (
    <Modal 
      open={open} 
      onClose={handleClose} 
      title={isEdit ? 'Edit Administrator' : 'Add New Administrator'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-theme-text mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={50}
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
              formErrors.name 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? 'name-error' : undefined}
            placeholder="Enter administrator's full name"
          />
          {formErrors.name && (
            <div id="name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {formErrors.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        {!isEdit && (
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-theme-text mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                formErrors.email 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? 'email-error' : undefined}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <div id="email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {formErrors.email}
              </div>
            )}
          </div>
        )}

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-theme-text mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
              formErrors.phone 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
            aria-invalid={!!formErrors.phone}
            aria-describedby={formErrors.phone ? 'phone-error' : undefined}
            placeholder="Enter phone number (e.g., 01234567890)"
          />
          {formErrors.phone && (
            <div id="phone-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {formErrors.phone}
            </div>
          )}
        </div>

        {/* Password Fields */}
        {!isEdit && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-theme-text mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                    formErrors.password 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? 'password-error' : undefined}
                  placeholder="Enter secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password && (
                <div id="password-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {formErrors.password}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-theme-text mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 pr-10 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                    formErrors.password_confirmation 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                  aria-invalid={!!formErrors.password_confirmation}
                  aria-describedby={formErrors.password_confirmation ? 'password_confirmation-error' : undefined}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password_confirmation && (
                <div id="password_confirmation-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {formErrors.password_confirmation}
                </div>
              )}
            </div>
          </>
        )}

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-theme-text mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
              formErrors.role 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/30 focus:ring-red-400 focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
            aria-invalid={!!formErrors.role}
            aria-describedby={formErrors.role ? 'role-error' : undefined}
          >
            <option value="">Select administrator role</option>
            <option value="it_support">IT Support</option>
            <option value="admin">Administrator</option>
            <option value="superadmin">Super Administrator</option>
          </select>
          {formErrors.role && (
            <div id="role-error" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {formErrors.role}
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-theme-text">
            Active Account
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (Inactive accounts cannot access the system)
          </span>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner size={14} color="border-white" />}
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Administrator')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 