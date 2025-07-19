import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireGuest({ children }) {
  const { token, user } = useAuth();
  if (token) {
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user?.role === 'client') return <Navigate to="/client/dashboard" replace />;
    if (user?.role === 'supplier') return <Navigate to="/supplier/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
} 