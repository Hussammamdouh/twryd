import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SupplierVerify from './SupplierVerify';

export default function SupplierVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Try to get identifier from location.state or query params
  const identifier = location.state?.identifier || new URLSearchParams(location.search).get('identifier') || '';

  const handleVerified = () => {
    // Redirect to login after successful verification
    navigate('/login-supplier');
  };

  return <SupplierVerify identifier={identifier} onVerified={handleVerified} />;
} 