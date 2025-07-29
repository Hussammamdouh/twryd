import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../../utils/api';
import { useToast } from '../../../UI/Common/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export default function ClientLogin() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const invitationToken = new URLSearchParams(location.search).get('invitation_token');

  // Auto-accept invitation if user is already logged in and has invitation token
  useEffect(() => {
    const autoAcceptInvitation = async () => {
      if (token && invitationToken) {
        try {
          await post('/api/client/invitations/accept', { 
            token, 
            data: { token: invitationToken } 
          });
          toast.show('Invitation accepted successfully!', 'success');
          setTimeout(() => {
            navigate('/client/dashboard/invitations');
          }, 1500);
        } catch (err) {
          console.error('Error accepting invitation after login:', err);
          if (err.message.includes('Invalid') || err.message.includes('not found') || err.message.includes('expired')) {
            toast.show('This invitation link is invalid or has expired. Please contact the supplier for a new invitation.', 'error');
          } else {
            toast.show(err.message || 'Failed to accept invitation', 'error');
          }
          setTimeout(() => {
            navigate('/client/dashboard');
          }, 1000);
        }
      }
    };

    autoAcceptInvitation();
  }, [token, invitationToken, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await post('/api/client/login', { data: { email_or_phone: emailOrPhone, password } });
      
      if (data.data && data.data.token && data.data.client) {
        login(data.data.token, { ...data.data.client, role: 'client' });
        toast.show('Login successful!', 'success');
        
        // If there's an invitation token, accept it after login
        if (invitationToken) {
          try {
            console.log('Accepting invitation after login with token:', invitationToken);
            await post('/api/client/invitations/accept', { 
              token: data.data.token, 
              data: { token: invitationToken } 
            });
            toast.show('Invitation accepted successfully!', 'success');
            setTimeout(() => {
              navigate('/client/dashboard/invitations');
            }, 1500);
          } catch (err) {
            console.error('Error accepting invitation after login:', err);
            if (err.message.includes('Invalid') || err.message.includes('not found') || err.message.includes('expired')) {
              toast.show('This invitation link is invalid or has expired. Please contact the supplier for a new invitation.', 'error');
            } else {
              toast.show(err.message || 'Failed to accept invitation', 'error');
            }
            setTimeout(() => {
              navigate('/client/dashboard');
            }, 1000);
          }
        } else {
          // Use React Router navigation instead of window.location
          setTimeout(() => navigate('/client/dashboard'), 1000);
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-2 py-8" role="main">
      <div className="theme-card w-full max-w-md p-8 sm:p-10 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-theme-text">
          Client Login
        </h2>
        {invitationToken && (
          <div className="w-full mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg dark:bg-primary-900/30 dark:border-primary-700">
            <p className="text-sm text-primary-800 dark:text-primary-200">
              <strong>Invitation detected!</strong> After login, your invitation will be automatically accepted.
            </p>
          </div>
        )}
        <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-8" />
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-7" aria-busy={loading}>
          <div className="flex flex-col gap-2">
            <label htmlFor="emailOrPhone" className="text-base font-medium text-theme-text">Email or Phone</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm0 0L12 13.25L21 6.75"/></svg>
              </span>
              <input
                id="emailOrPhone"
                type="text"
                autoComplete="username"
                required
                className="theme-input w-full pl-10 pr-4 py-3 rounded-md text-base shadow-sm"
                placeholder="Enter your email or phone"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-base font-medium text-theme-text">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" aria-hidden="true">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H8V9Z"/></svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="theme-input w-full pl-10 pr-12 py-3 rounded-md text-base shadow-sm"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
          </div>
          <div className="flex justify-between text-sm mt-4">
            <Link to="/forgot-password-client" className="text-primary-600 hover:underline">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Login"
            className="theme-button w-full py-3 font-bold rounded-lg shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60 text-base mt-2 flex items-center justify-center gap-2"
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