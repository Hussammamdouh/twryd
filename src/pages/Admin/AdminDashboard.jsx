import React, { Suspense, useMemo, useCallback, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../UI/admin/Sidebar';
import Topbar from '../../UI/admin/Topbar';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { LayoutProvider } from '../../contexts/LayoutContext.jsx';
import { get } from '../../utils/api';

// Lazy load components for better performance
const ProfileCard = React.lazy(() => import('../../UI/admin/ProfileCard'));
const AdminsManagement = React.lazy(() => import('./AdminsManagement'));
const SuppliersManagement = React.lazy(() => import('./SuppliersManagement'));
const CategoriesManagement = React.lazy(() => import('./CategoriesManagement'));
const Governates = React.lazy(() => import('./Governates'));
const AreasManagement = React.lazy(() => import('./AreasManagement'));

// Subscription Management Components
const PlansManagement = React.lazy(() => import('./PlansManagement'));
const SubscriptionsManagement = React.lazy(() => import('./SubscriptionsManagement/SubscriptionsManagement'));
const SubscriptionRequestsManagement = React.lazy(() => import('./SubscriptionRequestsManagement'));

// Test Design Component
const TestDesign = React.lazy(() => import('./TestDesign'));

// Custom hook for safe language access
const useSafeLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a fallback function that just returns the key
    return { t: (key) => key, currentLanguage: 'en', changeLanguage: () => {} };
  }
  return context;
};

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="min-h-screen bg-theme-bg flex flex-col">
    <Topbar title="Loading..." sidebarCollapsed={false} />
    <div className="flex-1 flex flex-row">
      <Sidebar open={false} onClose={() => {}} isCollapsed={false} />
      <main className="flex-1 transition-all duration-300 pt-16 md:pl-64 px-2 sm:px-4 md:px-8 relative z-0">
        <LoadingSkeleton type="dashboard" />
      </main>
    </div>
  </div>
);

// Error component for failed route loads
const RouteError = ({ error, retry }) => {
  const { t } = useSafeLanguage();
  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-4">
      <div className="theme-card p-6 sm:p-8 max-w-sm sm:max-w-md text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-theme-text mb-2">{t('messages.failed_to_load')}</h2>
        <p className="text-sm sm:text-base text-theme-text-secondary mb-4">{error || t('messages.something_went_wrong')}</p>
        <button
          onClick={retry}
          className="theme-button px-4 py-2 text-sm sm:text-base"
        >
          {t('common.retry')}
        </button>
      </div>
    </div>
  );
};

// Profile component with error handling
const ProfileComponent = () => {
  const { token, logout } = useAuth();
  const toast = useToast();
  const { t } = useSafeLanguage();
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-4 sm:p-8">
        <LoadingSkeleton type="profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-4 sm:p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-theme-text mb-2">{t('profile.failed_to_load')}</h3>
          <p className="text-sm sm:text-base text-theme-text-secondary mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="theme-button px-4 py-2 text-sm sm:text-base"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-4xl">
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
  const location = useLocation();
  const { t } = useSafeLanguage();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Performance: Memoize title calculation
  const title = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/admin-dashboard/admins')) return t('nav.administrators');
    if (path.endsWith('/admin-dashboard/suppliers')) return t('nav.suppliers');
    if (path.endsWith('/admin-dashboard/categories')) return t('nav.categories');
    if (path.endsWith('/admin-dashboard/governates')) return t('nav.governorates');
    if (path.endsWith('/admin-dashboard/areas')) return t('nav.areas');
    if (path.endsWith('/admin-dashboard/plans')) return 'Plans Management';
    if (path.endsWith('/admin-dashboard/subscriptions')) return 'Subscriptions Management';
    if (path.endsWith('/admin-dashboard/subscription-requests')) return 'Subscription Requests';
    if (path.endsWith('/admin-dashboard/test-design')) return 'Design System Test';
    return t('nav.profile');
  }, [location.pathname, t]);

  // Performance: Memoize sidebar handlers
  const handleMenuClick = useCallback(() => setSidebarOpen(true), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);
  const handleToggleCollapse = useCallback(() => setSidebarCollapsed(prev => !prev), []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-theme-bg">
        {/* Topbar always on top */}
        <Topbar title={title} onMenuClick={handleMenuClick} sidebarCollapsed={sidebarCollapsed} />
        
        {/* Sidebar - Fixed position */}
        <Sidebar 
          open={sidebarOpen} 
          onClose={handleSidebarClose} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        
        {/* Main content area - Positioned next to sidebar */}
        <main className={`transition-all duration-300 pt-16 px-2 sm:px-4 md:px-8 relative z-0 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <LayoutProvider>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] p-2 sm:p-4">
                        <div className="w-full max-w-7xl">
                          <ProfileComponent />
                        </div>
                      </div>
                    </LayoutProvider>
                  </ErrorBoundary>
                }
              />
              <Route
                path="admins"
                element={
                  <ErrorBoundary>
                    <AdminsManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="suppliers"
                element={
                  <ErrorBoundary>
                    <SuppliersManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="categories"
                element={
                  <ErrorBoundary>
                    <CategoriesManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="governates"
                element={
                  <ErrorBoundary>
                    <div className="flex flex-col items-center justify-center min-h-[70vh] p-2 sm:p-4">
                      <div className="w-full max-w-7xl">
                        <Governates />
                      </div>
                    </div>
                  </ErrorBoundary>
                }
              />
              <Route
                path="areas"
                element={
                  <ErrorBoundary>
                    <AreasManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="plans"
                element={
                  <ErrorBoundary>
                    <LayoutProvider>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] p-2 sm:p-4">
                        <div className="w-full max-w-7xl">
                          <PlansManagement />
                        </div>
                      </div>
                    </LayoutProvider>
                  </ErrorBoundary>
                }
              />
              <Route
                path="subscriptions"
                element={
                  <ErrorBoundary>
                    <SubscriptionsManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="subscription-requests"
                element={
                  <ErrorBoundary>
                    <SubscriptionRequestsManagement />
                  </ErrorBoundary>
                }
              />
              <Route
                path="test-design"
                element={
                  <ErrorBoundary>
                    <div className="w-full">
                      <TestDesign />
                    </div>
                  </ErrorBoundary>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
} 