import React, { useState } from 'react';
import { post } from '../../../utils/api';
import toast from 'react-hot-toast';

export default function SupplierVerify({ onVerified, identifier: initialIdentifier }) {
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await post('/api/supplier/verify', { data: { identifier, verification_code: code } });
      if (data.success) {
        toast.success('Verification successful!');
        if (onVerified) onVerified();
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await post('/api/supplier/email/resend', { data: { email_or_phone: identifier } });
      toast.success('Verification code resent!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ef] to-[#f5f5f5] px-2 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight text-gray-900">
          Verify Your Supplier Account
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-[#0099FF] to-[#1E90FF] rounded-full mb-8" />
        <form onSubmit={handleVerify} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="identifier" className="text-base font-medium text-gray-700">Email or Phone</label>
            <input
              id="identifier"
              type="text"
              required
              className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400"
              placeholder="Enter your email or phone"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              disabled={!!initialIdentifier}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-base font-medium text-gray-700">Verification Code</label>
            <input
              id="code"
              type="text"
              required
              className="w-full bg-[#f7fafc] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base placeholder-gray-400"
              placeholder="Enter the code you received"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-[#0099FF] to-[#1E90FF] shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        <button
          onClick={handleResend}
          disabled={resending || !identifier}
          className="mt-6 text-blue-600 hover:underline disabled:opacity-60"
        >
          {resending ? 'Resending...' : 'Resend Verification Code'}
        </button>
      </div>
    </div>
  );
} 