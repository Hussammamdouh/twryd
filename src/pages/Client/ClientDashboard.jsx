import React, { Suspense, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSwitcher from '../../UI/Common/LanguageSwitcher';

// Lazy load components for better performance
const ClientInvitations = React.lazy(() => import('./ClientInvitations'));
const ClientProfile = React.lazy(() => import('../Auth/Client/ClientProfile'));
const ClientDashboardHome = React.lazy(() => import('./ClientDashboardHome'));
const ClientMarketplace = React.lazy(() => import('./ClientMarketplace'));
const ClientProductDetails = React.lazy(() => import('./ClientProductDetails'));
const ClientCart = React.lazy(() => import('./ClientCart'));
const ClientCheckout = React.lazy(() => import('./ClientCheckout'));
const ClientOrderConfirmation = React.lazy(() => import('./ClientOrderConfirmation'));
const ClientOrders = React.lazy(() => import('./ClientOrders'));
const ClientDiscounts = React.lazy(() => import('./ClientDiscounts'));
const ClientInstallments = React.lazy(() => import('./ClientInstallments'));

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load page</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Something went wrong while loading this page.</p>
      <button
        onClick={retry}
        className="px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 bg-primary-600 hover:bg-primary-700 focus:bg-primary-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Client Sidebar Component
function ClientSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/client/dashboard/home', icon: 'grid', current: location.pathname === '/client/dashboard/home' },
    { name: 'Marketplace', href: '/client/dashboard/my-marketplace', icon: 'store', current: location.pathname.startsWith('/client/dashboard/my-marketplace') },
    { name: 'Cart', href: '/client/dashboard/cart', icon: 'cart', current: location.pathname.startsWith('/client/dashboard/cart') },
    { name: 'Orders', href: '/client/dashboard/orders', icon: 'orders', current: location.pathname.startsWith('/client/dashboard/orders') || location.pathname.startsWith('/client/dashboard/order-confirmation') },
    { name: 'My Suppliers', href: '/client/dashboard/invitations', icon: 'handshake', current: location.pathname === '/client/dashboard/invitations' },
    { name: 'Discounts', href: '/client/dashboard/discounts', icon: 'tag', current: location.pathname === '/client/dashboard/discounts' },
    { name: 'Installments', href: '/client/dashboard/installments', icon: 'installments', current: location.pathname === '/client/dashboard/installments' },
    { name: 'Settings', href: '/client/dashboard/settings', icon: 'gear', current: location.pathname === '/client/dashboard/settings' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      store: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M5 7h14l1 5H4l1-5zm2 8a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
        </svg>
      ),
      cart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      orders: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      handshake: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      tag: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      installments: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      gear: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.grid;
  };

  // Calculate user initials for avatar
  const initials = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  return (
    <div className={`h-full bg-gradient-to-b from-primary-600 via-primary-500 to-primary-400 text-white flex flex-col py-8 px-6 fixed left-0 top-0 z-30 min-h-screen shadow-xl border-r border-primary-700 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`} style={{ width: sidebarOpen ? '18rem' : '5rem' }}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand and Toggle */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {sidebarOpen && <span className="ml-3 text-xl font-bold font-display">Twryd</span>}
          </div>
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-primary-400/40 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-transparent">
          <div className="space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-primary-700 text-white shadow border-l-4 border-white'
                    : 'text-primary-100 hover:bg-primary-400/40 hover:text-white focus:bg-primary-400/60 focus:text-white'
                }`}
                tabIndex={sidebarOpen ? 0 : -1}
              >
                <span className="flex-shrink-0">{getIcon(item.icon)}</span>
                {sidebarOpen && <span>{item.name}</span>}
                {item.current && sidebarOpen && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </nav>
        {/* User Info & Logout */}
        {sidebarOpen && (
          <div className="pt-6 border-t border-primary-700">
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Client User'}
                </p>
                <p className="text-xs text-primary-100 truncate">
                  {user?.email || 'client@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full gap-4 px-4 py-3 text-sm font-medium text-primary-100 rounded-xl hover:bg-primary-400/40 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Client Topbar Component
function ClientTopbar({ title, sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();
  
  // Calculate user initials for avatar
  const initials = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  return (
    <div className={`h-16 px-8 fixed ${sidebarOpen ? 'left-72' : 'left-20'} top-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300`}>
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center h-full gap-2">
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight drop-shadow-sm flex items-center h-full">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 h-full">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-56 h-10 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
              style={{ minWidth: '180px' }}
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="dropdown" size="small" />
          {/* Theme Toggle */}
          <ThemeToggle variant="button" />
          
          {/* Notifications */}
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 006 6h3a6 6 0 006-6V9.75a6 6 0 00-6-6h-3z" />
            </svg>
          </button>

          {/* User Avatar */}
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow">
              {initials}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 640);

  // Performance: Memoize title calculation
  const title = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/invitations')) return 'My Suppliers';
    if (path.endsWith('/profile')) return 'Profile';
    if (path.endsWith('/orders')) return 'My Orders';
    if (path.endsWith('/discounts')) return 'Discounts';
    if (path.endsWith('/installments')) return 'Installments';
    if (path.endsWith('/settings')) return 'Settings';
    if (path.endsWith('/cart')) return 'Shopping Cart';
    if (path.endsWith('/checkout')) return 'Checkout';
    if (path.includes('/order-confirmation')) return 'Order Confirmation';
    if (path.includes('/product/')) return 'Product Details';
    if (path.endsWith('/my-marketplace')) return 'Marketplace';
    return 'Dashboard';
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <ClientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}> 
          <ClientTopbar title={title} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="pt-20 px-8 pb-8">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route index element={<Navigate to="home" replace />} />
                <Route 
                  path="home" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientDashboardHome />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="my-marketplace" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientMarketplace />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="product/:productId" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientProductDetails />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="cart" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientCart />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="checkout" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientCheckout />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="order-confirmation/:orderId" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientOrderConfirmation />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientProfile />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="invitations" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientInvitations />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="orders" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientOrders />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="discounts" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientDiscounts />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="installments" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <ClientInstallments />
                      </div>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <ErrorBoundary>
                      <div className="w-full max-w-7xl mx-auto">
                        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                          <div className="text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mx-auto mb-4">
                              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
                            <p className="text-gray-600 dark:text-gray-400">Settings functionality coming soon!</p>
                          </div>
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