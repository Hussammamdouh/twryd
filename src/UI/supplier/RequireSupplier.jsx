import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RequireSupplier({ children }) {
  const { isSupplier } = useAuth();
  if (!isSupplier) {
    return <Navigate to="/" replace />;
  }
  return children;
} 