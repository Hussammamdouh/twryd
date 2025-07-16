import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const SupplierForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/api/supplier/forgot-password', { identifier });
      if (res.success) {
        setSuccess('A reset code has been sent to your email or phone.');
        setTimeout(() => {
          navigate('/reset-password-supplier', { state: { identifier } });
        }, 1500);
      } else {
        setError(res.message || 'Failed to send reset code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6"
        aria-label="Forgot Password Form"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>
        <p className="text-gray-600 text-center text-sm mb-4">
          Enter your email or phone number to receive a password reset code.
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
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Code'}
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

export default SupplierForgotPassword; 