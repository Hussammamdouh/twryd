import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { post } from '../../../utils/api';
import { useToast } from '../../../UI/Common/ToastContext';

const SupplierResetPassword = () => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const toast = useToast();

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one symbol');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate reset code
    if (!code.trim()) {
      setError('Reset code is required');
      setLoading(false);
      return;
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      setLoading(false);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError('Password confirmation does not match');
      setLoading(false);
      return;
    }

    try {
      await post('/api/supplier/reset-password', { 
        data: { 
          email, 
          code,
          password,
          password_confirmation: confirmPassword 
        } 
      });
      toast.show('Password reset successful!', 'success');
      navigate('/login-supplier');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      toast.show(err.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ef] to-[#f5f5f5] px-2 py-8" role="main">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-gray-900">
          Reset Password
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-[#0099FF] to-[#1E90FF] rounded-full mb-8" />
        <p className="text-gray-600 text-center mb-6">
          Enter the reset code sent to your email and your new password.
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-base font-medium text-gray-700">Reset Code</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </span>
              <input
                id="code"
                type="text"
                required
                className="w-full bg-[#f7fafc] pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm border border-gray-200 placeholder-gray-400"
                placeholder="Enter reset code"
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'code-error' : undefined}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-base font-medium text-gray-700">New Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"/></svg>
              </span>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full bg-[#f7fafc] pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm border border-gray-200 placeholder-gray-400"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters with uppercase, lowercase, and symbol
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"/></svg>
              </span>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full bg-[#f7fafc] pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm border border-gray-200 placeholder-gray-400"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
            </div>
          </div>
          {error && <div id="password-error" className="text-red-500 text-sm mt-1" role="alert">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            aria-label="Reset password"
            className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-[#0099FF] to-[#1E90FF] shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="text-center">
            <Link to="/login-supplier" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded">
              Back to Login
            </Link>
          </div>
    </form>
      </div>
    </div>
  );
};

export default SupplierResetPassword; 