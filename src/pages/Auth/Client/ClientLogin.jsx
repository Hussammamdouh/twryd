import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { post } from '../../../utils/api';
import { Link } from 'react-router-dom';

export default function ClientLogin() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await post('/api/client/login', { data: { email_or_phone: emailOrPhone, password } });
      if (data.data && data.data.token && data.data.client) {
        login(data.data.token, { ...data.data.client, role: 'client' });
        toast.success('Login successful!');
        // Optionally redirect
        // setTimeout(() => window.location.href = '/client-dashboard', 1000);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ef] to-[#f5f5f5] px-2 py-8" role="main">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-gray-900">
          Client Login
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-[#0099FF] to-[#1E90FF] rounded-full mb-8" />
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-7" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="emailOrPhone" className="text-base font-medium text-gray-700">Email or Phone</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm0 0L12 13.25L21 6.75"/></svg>
              </span>
              <input
                id="emailOrPhone"
                type="text"
                autoComplete="username"
                required
                className="w-full bg-[#f7fafc] pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm border border-gray-200 placeholder-gray-400"
                placeholder="Enter your email or phone"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-base font-medium text-gray-700">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"/></svg>
              </span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-[#f7fafc] pl-10 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-base shadow-sm border border-gray-200 placeholder-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm mt-4">
            <Link to="/forgot-password-client" className="text-blue-600 hover:underline">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Login"
            className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-[#0099FF] to-[#1E90FF] shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 