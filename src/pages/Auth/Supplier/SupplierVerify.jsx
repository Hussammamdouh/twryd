import React, { useState } from 'react';
import { post } from '../../../utils/api';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function SupplierVerify({ onVerified, identifier: initialIdentifier }) {
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const toast = useToast();
  const { t } = useLanguage();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Determine type based on identifier
      const type = identifier.includes('@') ? 'email' : 'phone';
      const data = await post('/api/supplier/verify', {
        data: {
          contact: identifier,
          code,
          type,
        },
      });
      if (data.success) {
        toast.show(t('supplier_auth.verification_successful'), 'success');
        if (onVerified) onVerified();
      } else {
        throw new Error(data.message || t('supplier_auth.verification_failed'));
      }
    } catch (err) {
      toast.show(err.message || t('supplier_auth.verification_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await post('/api/supplier/email/resend', { data: { email_or_phone: identifier } });
      toast.show(t('supplier_auth.code_resent'), 'success');
    } catch (err) {
      toast.show(err.message || t('supplier_auth.verification_failed'), 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-2 py-8">
      <div className="theme-card w-full max-w-md p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight text-theme-text">
          {t('supplier_auth.verify_title')}
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-8" />
        <form onSubmit={handleVerify} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="identifier" className="text-base font-medium text-theme-text">{t('supplier_auth.email_or_phone')}</label>
            <input
              id="identifier"
              type="text"
              required
              className="theme-input w-full px-4 py-3 rounded-md text-base"
              placeholder={t('supplier_auth.email_or_phone_placeholder')}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              disabled={!!initialIdentifier}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-base font-medium text-theme-text">{t('supplier_auth.verification_code')}</label>
            <input
              id="code"
              type="text"
              required
              className="theme-input w-full px-4 py-3 rounded-md text-base"
              placeholder={t('supplier_auth.verification_code_placeholder')}
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="theme-button w-full py-3 font-bold rounded-lg shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading ? t('supplier_auth.verifying') : t('supplier_auth.verify_button')}
          </button>
        </form>
        <button
          onClick={handleResend}
          disabled={resending || !identifier}
          className="mt-6 text-primary-600 hover:underline disabled:opacity-60"
        >
          {resending ? t('supplier_auth.resending') : t('supplier_auth.resend_code')}
        </button>
      </div>
    </div>
  );
} 