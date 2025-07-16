import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClientVerify from './ClientVerify';

export default function ClientVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Try to get identifier from location.state or query params
  const identifier = location.state?.identifier || new URLSearchParams(location.search).get('identifier') || '';

  const handleVerified = () => {
    // Redirect to login or dashboard after successful verification
    navigate('/login-client');
  };

  return <ClientVerify identifier={identifier} onVerified={handleVerified} />;
} 