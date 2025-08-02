import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider } from './contexts/LayoutContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import RequireGuest from './components/RequireGuest';
import NotFound from './pages/NotFound';
const LoginAdmin = lazy(() => import('./pages/Auth/Admin/LoginAdmin'));
const ClientsRegisteration = lazy(() => import('./pages/Auth/Client/ClientsRegisteration'));
const ClientLogin = lazy(() => import('./pages/Auth/Client/ClientLogin'));
const Home = lazy(() => import('./pages/Home'));
const SupplierRegisteration = lazy(() => import('./pages/Auth/Supplier/SupplierRegisteration'));
const SupplierLogin = lazy(() => import('./pages/Auth/Supplier/SupplierLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const ClientForgotPassword = lazy(() => import('./pages/Auth/Client/ClientForgotPassword'));
const ClientResetPassword = lazy(() => import('./pages/Auth/Client/ClientResetPassword'));
const ClientVerifyPage = lazy(() => import('./pages/Auth/Client/ClientVerifyPage'));
const SupplierVerifyPage = lazy(() => import('./pages/Auth/Supplier/SupplierVerifyPage'));
const SupplierForgotPassword = lazy(() => import('./pages/Auth/Supplier/SupplierForgotPassword'));
const SupplierResetPassword = lazy(() => import('./pages/Auth/Supplier/SupplierResetPassword'));
const ClientProfile = lazy(() => import('./pages/Auth/Client/ClientProfile'));
const SupplierProfile = lazy(() => import('./pages/Auth/Supplier/SupplierProfile'));
const SupplierInvitations = lazy(() => import('./pages/Supplier/SupplierInvitations'));
const Products = lazy(() => import('./pages/Supplier/Products'));
const RequireSupplier = lazy(() => import('./UI/supplier/RequireSupplier'));
const SupplierDashboard = lazy(() => import('./pages/Supplier/SupplierDashboard'));
const RequireClient = lazy(() => import('./UI/client/RequireClient'));
const ClientDashboard = lazy(() => import('./pages/Client/ClientDashboard'));
const InvitationHandler = lazy(() => import('./pages/InvitationHandler'));

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster 
              position="top-right" 
              toastOptions={{ 
                duration: 4000,
                className: 'dark:bg-dark-800 dark:text-white dark:border-dark-600',
              }} 
            />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-theme-bg text-theme-text">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/invitation/:token" element={<InvitationHandler />} />
                <Route path="/login-admin" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
                <Route path="/login-client" element={<RequireGuest><ClientLogin /></RequireGuest>} />
                <Route path="/register-client" element={<RequireGuest><ClientsRegisteration /></RequireGuest>} />
                <Route path="/register-supplier" element={<RequireGuest><SupplierRegisteration /></RequireGuest>} />
                <Route path="/login-supplier" element={<RequireGuest><SupplierLogin /></RequireGuest>} />
                <Route path="/forgot-password-client" element={<RequireGuest><ClientForgotPassword /></RequireGuest>} />
                <Route path="/reset-password-client" element={<RequireGuest><ClientResetPassword /></RequireGuest>} />
                <Route path="/verify-client" element={<RequireGuest><ClientVerifyPage /></RequireGuest>} />
                <Route path="/verify-supplier" element={<RequireGuest><SupplierVerifyPage /></RequireGuest>} />
                <Route path="/forgot-password-supplier" element={<RequireGuest><SupplierForgotPassword /></RequireGuest>} />
                <Route path="/reset-password-supplier" element={<RequireGuest><SupplierResetPassword /></RequireGuest>} />
                <Route path="/admin-dashboard/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/client-profile" element={<RequireAuth><ClientProfile /></RequireAuth>} />
                <Route path="/supplier/dashboard/*" element={
                  <RequireSupplier>
                    <LayoutProvider>
                      <SupplierDashboard />
                    </LayoutProvider>
                  </RequireSupplier>
                } />
                <Route path="/supplier/invitations" element={
                  <RequireSupplier>
                    <LayoutProvider>
                      <SupplierInvitations />
                    </LayoutProvider>
                  </RequireSupplier>
                } />
                <Route path="/client/dashboard/*" element={<RequireClient><ClientDashboard /></RequireClient>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}