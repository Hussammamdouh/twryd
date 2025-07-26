import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="min-h-screen bg-theme-bg">
    <Sidebar />
    <div className="flex-1 min-h-screen ml-64">
      <Topbar title="Loading..." />
      <main className="pt-20 px-8 pb-8">
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

export default function SupplierDashboard() {
  const location = useLocation();

  // Performance: Memoize title calculation
  const title = useMemo(() => {
    const path = location.pathname;
    if (path.endsWith('/products')) return 'Product Management';
    if (path.endsWith('/profile')) return 'Profile';
    if (path.endsWith('/warehouses')) return 'Warehouses';
    if (path.endsWith('/shipping-people')) return 'Delivery Personnel';
    if (path.endsWith('/client-discounts')) return 'Client-Based Discounts';
    if (path.endsWith('/product-discounts')) return 'Product Discounts';
    if (path.includes('/orders/') && path.split('/').length > 3) return 'Order Details';
    if (path.endsWith('/orders')) return 'Orders Management';
    return 'Profile';
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-theme-bg flex">
        <Sidebar />
        <div className="flex-1 min-h-screen ml-64">
          <Topbar title={title} />
          <main className="pt-20 px-8 pb-8">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route index element={<Navigate to="profile" replace />} />
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
                  path="orders/:orderId" 
                  element={
                    <ErrorBoundary>
                      <SupplierOrderDetails />
                    </ErrorBoundary>
                  } 
                />
                <Route path="*" element={<Navigate to="profile" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
} 