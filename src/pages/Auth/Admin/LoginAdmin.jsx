import React, { useState, useCallback } from 'react';
import { useToast } from '../../../UI/Common/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { post } from '../../../utils/api';
import { Link } from 'react-router-dom';

// Security: Enhanced validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginAdmin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  // Performance: Memoize validation function
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
      default:
        return '';
    }
  }, []);

  // Performance: Memoize change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  }, [errors, validateField]);

  // Performance: Memoize submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      toast.show('Please fix the errors in the form.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Security: Sanitize form data before submission
      const sanitizedData = {
        email: formData.email.trim(),
        password: formData.password,
      };
      
      const data = await post('/api/v1/login', { data: sanitizedData });
      
      if (data.data && data.data.token && data.data.admin) {
        login(data.data.token, { ...data.data.admin, role: 'admin' });
        toast.show('Login successful! Welcome back!', 'success');
        setTimeout(() => window.location.href = '/admin-dashboard', 1000);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.show(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  }, [formData, validateField, login, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-2 py-8" role="main">
      <div className="theme-card w-full max-w-md p-8 sm:p-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-theme-text">
            Admin Login
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto mb-4" />
          <p className="text-theme-text-secondary text-sm">
            Access the administrative dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" aria-busy={loading} noValidate>
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-base font-medium text-theme-text">
              Email Address *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm0 0L12 13.25L21 6.75"/>
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className={`theme-input w-full pl-10 pr-4 py-3 rounded-lg text-base shadow-sm transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-400 focus:border-red-400' : ''
                }`}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <div id="email-error" className="text-red-500 dark:text-red-400 text-sm" role="alert">
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-base font-medium text-theme-text">
              Password *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className={`theme-input w-full pl-10 pr-12 py-3 rounded-lg text-base shadow-sm transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50 dark:bg-red-900/20 focus:ring-red-400 focus:border-red-400' : ''
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-theme-text-muted hover:text-theme-text hover:bg-theme-surface transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-theme-card"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {errors.password && (
              <div id="password-error" className="text-red-500 dark:text-red-400 text-sm" role="alert">
                {errors.password}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="theme-button w-full py-3 font-bold rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-theme-card disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105"
            aria-label="Sign in to admin account"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-theme-text-secondary text-sm">
            Need help? Contact your system administrator
          </p>
          <div className="mt-4 text-xs text-theme-text-muted">
            <div className="flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Admin Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 