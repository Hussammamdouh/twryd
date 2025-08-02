import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post } from '../../../utils/api';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const SupplierForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await post('/api/supplier/forgot-password', { data: { identifier: email } });
      toast.show(t('supplier_auth.reset_link_sent'), 'success');
      navigate('/reset-password-supplier', { state: { email } });
    } catch (err) {
      setError(err.message || t('supplier_auth.reset_link_failed'));
      toast.show(err.message || t('supplier_auth.reset_link_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-2 py-8" role="main">
      <div className="theme-card w-full max-w-md p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-theme-text">
          {t('supplier_auth.forgot_password_title')}
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-8" />
        <p className="text-theme-text-secondary text-center mb-6">
          {t('supplier_auth.forgot_password_description')}
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-base font-medium text-theme-text">{t('supplier_auth.email_address')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm0 0L12 13.25L21 6.75"/></svg>
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="theme-input w-full pl-10 pr-4 py-3 rounded-md text-base shadow-sm"
                placeholder={t('supplier_auth.email_placeholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'email-error' : undefined}
              />
            </div>
            {error && <div id="email-error" className="text-red-500 text-sm mt-1" role="alert">{error}</div>}
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label={t('supplier_auth.send_reset_link')}
            className="theme-button w-full py-3 font-bold rounded-lg shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {loading ? t('supplier_auth.sending') : t('supplier_auth.send_reset_link')}
          </button>
          <div className="text-center">
            <Link to="/login-supplier" className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded">
              {t('supplier_auth.back_to_login')}
            </Link>
          </div>
    </form>
      </div>
    </div>
  );
};

export default SupplierForgotPassword; 