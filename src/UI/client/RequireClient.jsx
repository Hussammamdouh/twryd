import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RequireClient({ children }) {
  const { isClient } = useAuth();
  
  if (!isClient) {
    return <Navigate to="/" replace />;
  }
  
  return children;
} 