import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import ThemeToggle from '../../components/ThemeToggle';

// Lazy load components for better performance
const ClientInvitations = React.lazy(() => import('./ClientInvitations'));
const ClientProfile = React.lazy(() => import('../Auth/Client/ClientProfile'));
const ClientDashboardHome = React.lazy(() => import('./ClientDashboardHome'));
const ClientMarketplace = React.lazy(() => import('./ClientMarketplace'));

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="min-h-screen bg-theme-bg">
    <div className="flex">
      <ClientSidebar />
      <div className="flex-1 ml-64">
        <ClientTopbar title="Loading..." />
        <main className="pt-20 px-8 pb-8">
          <LoadingSkeleton type="dashboard" />
        </main>
      </div>
    </div>
  </div>
);

// Error component for failed route loads
const RouteError = ({ retry }) => (
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

// Client Sidebar Component
function ClientSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/client/dashboard/home', icon: 'grid', current: location.pathname === '/client/dashboard/home' },
    { name: 'Marketplace', href: '/client/dashboard/my-marketplace', icon: 'store', current: location.pathname.startsWith('/client/dashboard/my-marketplace') },
    { name: 'Cart', href: '/client/dashboard/cart', icon: 'cart', current: location.pathname.startsWith('/client/dashboard/cart') },
    { name: 'Orders', href: '/client/dashboard/orders', icon: 'orders', current: location.pathname.startsWith('/client/dashboard/orders') || location.pathname.startsWith('/client/dashboard/order-confirmation') },
    { name: 'My Suppliers', href: '/client/dashboard/invitations', icon: 'handshake', current: location.pathname === '/client/dashboard/invitations' },
    { name: 'Discounts', href: '/client/dashboard/discounts', icon: 'tag', current: location.pathname === '/client/dashboard/discounts' },
    { name: 'Settings', href: '/client/dashboard/settings', icon: 'gear', current: location.pathname === '/client/dashboard/settings' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      store: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
        </svg>
      ),
      cart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      orders: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      handshake: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      tag: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      gear: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.grid;
  };

  return (
    <div className="theme-sidebar fixed inset-y-0 left-0 w-64 shadow-xl z-30">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-theme-border bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
          <h1 className="text-xl font-bold text-primary-900 dark:text-primary-100">Client Portal</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.current
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-theme-text-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300'
              }`}
            >
              <span className="mr-3">{getIcon(item.icon)}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-theme-border">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-theme-text-secondary rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Client Topbar Component
function ClientTopbar({ title }) {
  return (
    <div className="theme-topbar fixed top-0 right-0 left-64 z-20">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-semibold text-theme-text">{title}</h1>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle variant="button" />
          
          {/* Notifications */}
          <button className="p-2 text-theme-text-secondary hover:text-primary-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 006 6h3a6 6 0 006-6V9.75a6 6 0 00-6-6h-3z" />
            </svg>
          </button>
          {/* Profile */}
          <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const location = useLocation();

  // Performance: Memoize title calculation
  const title = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/invitations')) return 'Invitation Management';
    if (path.endsWith('/profile')) return 'Profile';
    if (path.endsWith('/orders')) return 'Orders';
    if (path.endsWith('/discounts')) return 'Discounts';
    if (path.endsWith('/settings')) return 'Settings';
    return 'Dashboard';
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-theme-bg flex">
        <ClientSidebar />
        <div className="flex-1 min-h-screen ml-64">
          <ClientTopbar title={title} />
          <main className="pt-20 px-8 pb-8">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route index element={<Navigate to="home" replace />} />
                <Route 
                  path="home" 
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="flex justify-center w-full">
                          <ClientDashboardHome />
                        </div>
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="my-marketplace" 
                  element={
                    <ErrorBoundary>
                      <ClientMarketplace />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="flex justify-center w-full">
                          <ClientProfile />
                        </div>
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="invitations" 
                  element={
                    <ErrorBoundary>
                      <ClientInvitations />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="orders" 
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-theme-text mb-4">Orders</h2>
                          <p className="text-theme-text-secondary">Orders functionality coming soon!</p>
                        </div>
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="discounts" 
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-theme-text mb-4">Discounts</h2>
                          <p className="text-theme-text-secondary">Discounts functionality coming soon!</p>
                        </div>
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <ErrorBoundary>
                      <div className="flex flex-col items-center justify-center min-h-[70vh] theme-surface p-8">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-theme-text mb-4">Settings</h2>
                          <p className="text-theme-text-secondary">Settings functionality coming soon!</p>
                        </div>
                      </div>
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