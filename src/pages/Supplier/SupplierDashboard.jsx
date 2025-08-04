import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LayoutProvider } from '../../contexts/LayoutContext.jsx';
import { useLayout } from '../../hooks/useLayout';
import Sidebar from '../../UI/supplier/Sidebar';
import Topbar from '../../UI/supplier/Topbar';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';

// Lazy load components for better performance
const SupplierProfile = React.lazy(() => import('../Auth/Supplier/SupplierProfile'));
const Products = React.lazy(() => import('./Products'));
const Warehouses = React.lazy(() => import('./Warehouses'));
const ShippingPeople = React.lazy(() => import('./ShippingPeople'));
const ClientDiscounts = React.lazy(() => import('./ClientDiscounts'));
const ProductDiscounts = React.lazy(() => import('./ProductDiscounts'));
const SupplierOrders = React.lazy(() => import('./SupplierOrders'));
const SupplierOrderDetails = React.lazy(() => import('./SupplierOrderDetails'));
const SupplierDashboardHome = React.lazy(() => import('./SupplierDashboardHome'));
const SupplierInstallments = React.lazy(() => import('./SupplierInstallments'));
const VirtualClientManagement = React.lazy(() => import('./VirtualClientManagement'));
const SupplierSubscriptions = React.lazy(() => import('./SupplierSubscriptions'));

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="min-h-screen bg-theme-bg">
    <div className="flex-1 min-h-screen ml-0 md:ml-64">
      <Topbar title="Loading..." />
      <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8">
        <LoadingSkeleton type="dashboard" />
      </main>
    </div>
  </div>
);

// Error component for failed route loads
const RouteError = ({ retry }) => (
  <div className="min-h-screen bg-theme-bg flex items-center justify-center">
    <div className="theme-card p-8 max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4 text-theme-text">Something went wrong</h2>
      <p className="text-theme-text-secondary mb-6">Failed to load this page. Please try again.</p>
      <button
        onClick={retry}
        className="theme-button px-6 py-2 font-medium"
      >
        Retry
      </button>
    </div>
  </div>
);

function SupplierDashboardContent() {
  const location = useLocation();
  const { sidebarCollapsed } = useLayout();

  // Performance: Memoize title based on current route
  const title = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/home')) return 'Dashboard Home';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/products')) return 'Product Management';
    if (path.includes('/warehouses')) return 'Warehouses';
    if (path.includes('/shipping-people')) return 'Delivery Personnel';
    if (path.includes('/client-discounts')) return 'Client-Based Discounts';
    if (path.includes('/product-discounts')) return 'Product Discounts';
    if (path.includes('/orders')) return 'Orders Management';
    if (path.includes('/installments')) return 'Installments Management';
    if (path.includes('/virtual-client-management')) return 'Virtual Client Management';
    if (path.includes('/subscriptions')) return 'Subscription Management';
    return 'Profile';
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-theme-bg flex">
        <Sidebar />
        <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'}`}>
          <Topbar title={title} />
          <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route index element={<Navigate to="home" replace />} />
                <Route 
                  path="home" 
                  element={
                    <ErrorBoundary>
                      <SupplierDashboardHome />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <ErrorBoundary>
                      <SupplierProfile />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="products" 
                  element={
                    <ErrorBoundary>
                      <Products />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="warehouses" 
                  element={
                    <ErrorBoundary>
                      <Warehouses />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="shipping-people" 
                  element={
                    <ErrorBoundary>
                      <ShippingPeople />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="client-discounts" 
                  element={
                    <ErrorBoundary>
                      <ClientDiscounts />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="product-discounts" 
                  element={
                    <ErrorBoundary>
                      <ProductDiscounts />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="orders" 
                  element={
                    <ErrorBoundary>
                      <SupplierOrders />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="orders/:id" 
                  element={
                    <ErrorBoundary>
                      <SupplierOrderDetails />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="installments" 
                  element={
                    <ErrorBoundary>
                      <SupplierInstallments />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="virtual-client-management" 
                  element={
                    <ErrorBoundary>
                      <VirtualClientManagement />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="subscriptions" 
                  element={
                    <ErrorBoundary>
                      <SupplierSubscriptions />
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

export default function SupplierDashboard() {
  return (
    <LayoutProvider>
      <SupplierDashboardContent />
    </LayoutProvider>
  );
} 