import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import Sidebar from '../../UI/client/Sidebar';
import Topbar from '../../UI/client/Topbar';

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
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-72">
        <Topbar title="Loading..." />
        <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8">
          <LoadingSkeleton type="dashboard" />
        </main>
      </div>
    </div>
  </div>
);

// Error component for failed route loads
const RouteError = ({ retry }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 max-w-md text-center border border-gray-200 dark:border-gray-700 w-full">
      <div className="text-red-500 mb-4">
        <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load page</h2>
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

export default function ClientDashboard() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-0 md:ml-72">
            <Topbar title="Client Dashboard" />
            <main className="pt-16 md:pt-20 px-4 sm:px-8 pb-8">
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
                          <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                            <div className="text-center">
                              <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mx-auto mb-4">
                                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
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
      </div>
    </ErrorBoundary>
  );
} 