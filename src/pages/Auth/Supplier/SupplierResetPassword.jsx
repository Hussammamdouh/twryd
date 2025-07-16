import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const SupplierResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(location.state?.identifier || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier) {
      setError('Please enter your email or phone.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/supplier/reset-password', {
        identifier,
        code,
        password,
      });
      if (res.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login-supplier');
        }, 1500);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6"
        aria-label="Reset Password Form"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
        <p className="text-gray-600 text-center text-sm mb-4">
          Enter the code sent to your email or phone and set a new password.
        </p>
        <label htmlFor="identifier" className="block text-gray-700 font-medium">
          Email or Phone
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email or phone"
        />
        <label htmlFor="code" className="block text-gray-700 font-medium">
          Reset Code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter the code you received"
        />
        <label htmlFor="password" className="block text-gray-700 font-medium">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter new password"
        />
        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Confirm new password"
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className="flex justify-between text-sm mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => navigate('/login-supplier')}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierResetPassword; 