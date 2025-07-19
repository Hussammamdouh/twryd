import React, { Suspense, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../UI/admin/Sidebar';
import Topbar from '../../UI/admin/Topbar';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../UI/Common/ToastContext';
import { get } from '../../utils/api';

// Lazy load components for better performance
const ProfileCard = React.lazy(() => import('../../UI/admin/ProfileCard'));
const AdminsTable = React.lazy(() => import('../../UI/admin/AdminsTable'));
const SuppliersTable = React.lazy(() => import('../../UI/admin/SuppliersTable'));
const Categories = React.lazy(() => import('./Categories'));
const Governates = React.lazy(() => import('./Governates'));
const Areas = React.lazy(() => import('./Areas'));

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="min-h-screen bg-theme-bg flex flex-col">
    <Topbar title="Loading..." />
    <div className="flex-1 flex flex-row">
      <Sidebar open={false} onClose={() => {}} />
      <main className="flex-1 transition-all duration-300 pt-16 md:pl-64 px-2 md:px-8 relative z-0">
        <LoadingSkeleton type="dashboard" />
      </main>
    </div>
  </div>
);

// Error component for failed route loads
const RouteError = ({ error, retry }) => (
  <div className="min-h-screen bg-theme-bg flex items-center justify-center">
    <div className="theme-card p-8 max-w-md text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-theme-text mb-2">Failed to load page</h2>
      <p className="text-theme-text-secondary mb-4">Something went wrong while loading this page.</p>
      <button
        onClick={retry}
        className="theme-button"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Profile component with error handling
const ProfileComponent = () => {
  const { token, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get('/api/v1/profile', { token });
      setProfile(data.data);
    } catch (err) {
      setError(err.message);
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  React.useEffect(() => {
    if (token) fetchProfile();
  }, [token, fetchProfile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
        <LoadingSkeleton type="profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-theme-text mb-2">Failed to load profile</h3>
          <p className="text-theme-text-secondary mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="theme-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
      <div className="flex justify-center w-full">
        <ProfileCard
          name={profile?.name}
          email={profile?.email}
          phone={profile?.phone}
          onLogout={logout}
          role={profile?.role}
        />
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Performance: Memoize title calculation
  const title = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/admins')) return 'Admins';
    if (path.endsWith('/suppliers')) return 'Suppliers';
    if (path.endsWith('/categories')) return 'Categories';
    if (path.endsWith('/governates')) return 'Governates';
    if (path.endsWith('/areas')) return 'Areas';
    return 'Profile';
  }, [location.pathname]);

  // Performance: Memoize sidebar handlers
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-theme-bg flex flex-col">
        {/* Topbar always on top */}
        <Topbar title={title} onMenuClick={handleMenuClick} />
        <div className="flex-1 flex flex-row">
          {/* Sidebar overlays on mobile, static on desktop */}
          <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
          {/* Main content area */}
          <main className="flex-1 transition-all duration-300 pt-16 md:pl-64 px-2 md:px-8 relative z-0">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route index element={<Navigate to="profile" replace />} />
                <Route
                  path="profile"
                  element={
                    <ErrorBoundary>
                      <ProfileComponent />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="admins"
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="flex justify-center w-full">
                          <AdminsTable token={token} />
                        </div>
                      </div>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="suppliers"
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="flex justify-center w-full">
                          <SuppliersTable token={token} />
                        </div>
                      </div>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="categories"
                  element={
                    <ErrorBoundary>
                      <Categories />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="governates"
                  element={
                    <ErrorBoundary>
                      <Governates />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="areas"
                  element={
                    <ErrorBoundary>
                      <Areas />
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
} 