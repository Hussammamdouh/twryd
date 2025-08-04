import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { post } from '../../../utils/api';
import { useToast } from '../../../UI/Common/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const ClientResetPassword = () => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const toast = useToast();
  const { t } = useLanguage();

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push(t('client_auth.password_min_length'));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('client_auth.password_uppercase'));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('client_auth.password_lowercase'));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t('client_auth.password_symbol'));
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate reset code
    if (!code.trim()) {
      setError(t('client_auth.reset_code_required'));
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
      setError(t('client_auth.password_confirmation_mismatch'));
      setLoading(false);
      return;
    }

    try {
      await post('/api/client/reset-password', { 
        data: { 
          email_or_phone: email, 
          code,
          password,
          password_confirmation: confirmPassword 
        } 
      });
      toast.show(t('client_auth.reset_successful'), 'success');
      navigate('/login-client');
    } catch (err) {
      setError(err.message || t('client_auth.reset_failed'));
      toast.show(err.message || t('client_auth.reset_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-4 sm:px-6 py-4 sm:py-8" role="main">
      <div className="theme-card w-full max-w-sm sm:max-w-md p-6 sm:p-8 lg:p-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight text-theme-text">
          {t('client_auth.reset_password_title')}
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-6 sm:mb-8" />
        <p className="text-theme-text-secondary text-center mb-4 sm:mb-6 text-sm sm:text-base">
          {t('client_auth.reset_password_description')}
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 sm:gap-6" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm sm:text-base font-medium text-theme-text">{t('client_auth.reset_code')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </span>
              <input
                id="code"
                type="text"
                required
                className="theme-input w-full pl-10 pr-4 py-3 rounded-md text-base shadow-sm"
                placeholder={t('client_auth.reset_code_placeholder')}
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'code-error' : undefined}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm sm:text-base font-medium text-theme-text">{t('client_auth.new_password')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"/></svg>
              </span>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="theme-input w-full pl-10 pr-4 py-3 rounded-md text-base shadow-sm"
                placeholder={t('client_auth.new_password_placeholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              {t('client_auth.password_requirements')}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium text-theme-text">{t('client_auth.confirm_new_password')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"/></svg>
              </span>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="theme-input w-full pl-10 pr-4 py-3 rounded-md text-base shadow-sm"
                placeholder={t('client_auth.confirm_new_password_placeholder')}
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
            aria-label={t('client_auth.reset_password_button')}
            className="theme-button w-full py-3 font-bold rounded-lg shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {loading ? t('client_auth.resetting') : t('client_auth.reset_password_button')}
          </button>
          <div className="text-center">
            <Link to="/login-client" className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded text-sm sm:text-base">
              {t('client_auth.back_to_login')}
            </Link>
          </div>
    </form>
      </div>
    </div>
  );
};

export default ClientResetPassword; 