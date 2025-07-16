import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAdmin({ children }) {
  const { token, isAdmin } = useAuth();
  const location = useLocation();
  if (!token || !isAdmin) {
    return <Navigate to="/login-admin" state={{ from: location }} replace />;
  }
  return children;
} 