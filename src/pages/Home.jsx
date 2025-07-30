import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../UI/Common/ToastContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const { token, logout } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.show('Logged out successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-theme-bg">
      {/* Header with theme toggle */}
      <header className="bg-theme-card border-b border-theme-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-theme-text">Twryd</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="dropdown" />
            {token && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-theme-text">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Twryd
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-theme-text-secondary mb-8">
            Connect suppliers and clients seamlessly in one platform
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={import.meta.env.BASE_URL + 'login-client'}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Client Login
            </a>
            <a
              href={import.meta.env.BASE_URL + 'login-supplier'}
              className="px-8 py-3 bg-theme-surface border border-theme-border text-theme-text hover:bg-theme-card font-semibold rounded-lg transition-colors text-center"
            >
              Supplier Login
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="theme-card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text mb-2">Connect</h3>
              <p className="text-theme-text-secondary">Build relationships between suppliers and clients</p>
            </div>

            <div className="theme-card p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text mb-2">Manage</h3>
              <p className="text-theme-text-secondary">Efficiently manage invitations and relationships</p>
            </div>

            <div className="theme-card p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-theme-text mb-2">Grow</h3>
              <p className="text-theme-text-secondary">Scale your business with powerful tools</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}