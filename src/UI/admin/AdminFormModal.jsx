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

  // Performance: Memoize validation functions
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (value.trim().length > 50) return 'Name must be less than 50 characters.';
        return '';
      case 'email':
        if (!isEdit && !value) return 'Email is required.';
        if (value && !EMAIL_REGEX.test(value)) return 'Please enter a valid email address.';
        return '';
      case 'phone':
        if (!value) return 'Phone is required.';
        if (!PHONE_REGEX.test(value)) return 'Please enter a valid phone number.';
        return '';
      case 'password':
        if (!isEdit && !value) return 'Password is required.';
        if (value && !PASSWORD_REGEX.test(value)) {
          return 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.';
        }
        return '';
      case 'password_confirmation':
        if (!isEdit && !value) return 'Please confirm password.';
        if (value !== form.password) return 'Passwords do not match.';
        return '';
      case 'role':
        if (!value) return 'Role is required.';
        return '';
      default:
        return '';
    }
  }, [isEdit, form.password]);

  const validateAll = useCallback(() => {
    const errors = {};
    Object.keys(form).forEach(key => {
      errors[key] = validateField(key, form[key]);
    });
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  }, [form, validateField]);

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

  // Performance: Memoize change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setForm(prev => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ 
        ...prev, 
        [name]: validateField(name, newValue) 
      }));
    }
  }, [formErrors, validateField]);

  // Performance: Memoize submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast.show('Please fix the errors in the form.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Security: Sanitize form data before submission
      const sanitizedForm = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };
      
      await onSubmit(sanitizedForm);
      toast.show(isEdit ? 'Admin updated successfully!' : 'Admin created successfully!', 'success');
      onClose();
    } catch (err) {
      toast.show(err.message || 'Failed to submit', 'error');
    } finally {
      setLoading(false);
    }
  }, [form, validateAll, onSubmit, isEdit, onClose, toast]);

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
      title={isEdit ? 'Edit Admin' : 'Add New Admin'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-theme-text mb-1">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={50}
            className={`theme-input w-full px-3 py-2 rounded-lg transition-colors ${
              formErrors.name ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : ''
            }`}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? 'name-error' : undefined}
            placeholder="Enter admin name"
          />
          {formErrors.name && (
            <div id="name-error" className="text-red-500 text-xs mt-1" role="alert">
              {formErrors.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        {!isEdit && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-theme-text mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={`theme-input w-full px-3 py-2 rounded-lg transition-colors ${
                formErrors.email ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : ''
              }`}
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? 'email-error' : undefined}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <div id="email-error" className="text-red-500 text-xs mt-1" role="alert">
                {formErrors.email}
              </div>
            )}
          </div>
        )}

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-theme-text mb-1">
            Phone *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            className={`theme-input w-full px-3 py-2 rounded-lg transition-colors ${
              formErrors.phone ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : ''
            }`}
            aria-invalid={!!formErrors.phone}
            aria-describedby={formErrors.phone ? 'phone-error' : undefined}
            placeholder="Enter phone number"
          />
          {formErrors.phone && (
            <div id="phone-error" className="text-red-500 text-xs mt-1" role="alert">
              {formErrors.phone}
            </div>
          )}
        </div>

        {/* Password Fields */}
        {!isEdit && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-text mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`theme-input w-full px-3 py-2 pr-10 rounded-lg transition-colors ${
                    formErrors.password ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : ''
                  }`}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? 'password-error' : undefined}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password && (
                <div id="password-error" className="text-red-500 text-xs mt-1" role="alert">
                  {formErrors.password}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-theme-text mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  className={`theme-input w-full px-3 py-2 pr-10 rounded-lg transition-colors ${
                    formErrors.password_confirmation ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : ''
                  }`}
                  aria-invalid={!!formErrors.password_confirmation}
                  aria-describedby={formErrors.password_confirmation ? 'password_confirmation-error' : undefined}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password_confirmation && (
                <div id="password_confirmation-error" className="text-red-500 text-xs mt-1" role="alert">
                  {formErrors.password_confirmation}
                </div>
              )}
            </div>
          </>
        )}

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-theme-text mb-1">
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className={`theme-input w-full px-3 py-2 rounded-lg transition-colors ${
              formErrors.role ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : ''
            }`}
            aria-invalid={!!formErrors.role}
            aria-describedby={formErrors.role ? 'role-error' : undefined}
          >
            <option value="">Select role</option>
            <option value="it_support">IT Support</option>
            <option value="admin">Administrator</option>
            <option value="superadmin">Super Administrator</option>
          </select>
          {formErrors.role && (
            <div id="role-error" className="text-red-500 text-xs mt-1" role="alert">
              {formErrors.role}
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 bg-theme-surface border-theme-border rounded focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-theme-text">
            Active Account
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="theme-button-secondary flex-1 py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="theme-button flex-1 py-2 px-4 rounded-lg font-semibold shadow transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner size={16} color="border-white" />}
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Admin')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 