import React, { useEffect, useState } from 'react';
import ProfileCard from '../../../UI/admin/ProfileCard';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { get } from '../../../utils/api';

export default function SupplierProfile() {
  const { user, logout, token } = useAuth();
  const [invitations, setInvitations] = useState(null);
  const [clients, setClients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && user && user.role === 'supplier') {
      setLoading(true);
      Promise.all([
        get('/api/supplier/invitations?per_page=10&paginated=true', { token }),
        get('/api/supplier/invitations/clients', { token })
      ])
        .then(([invRes, clRes]) => {
          setInvitations(invRes.data?.invitations?.data || invRes.data?.invitations || []);
          setClients(clRes.data?.clients || []);
          setError('');
        })
        .catch(err => {
          setError(err.message || 'Failed to load supplier data');
        })
        .finally(() => setLoading(false));
    }
  }, [token, user]);

  if (!token || !user) {
    // Not logged in, redirect to login
    return <Navigate to="/login-supplier" replace />;
  }

  if (user.role !== 'supplier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h2>
          <p className="text-gray-600">This page is only available for supplier users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 gap-8">
      <ProfileCard
        name={user.name || user.full_name || 'Supplier'}
        email={user.email}
        phone={user.phone}
        onLogout={logout}
        role={user.role}
      />
      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl w-full border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Supplier Data</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-6">
              <h4 className="font-semibold text-blue-700 mb-2">Invitations</h4>
              {invitations && invitations.length > 0 ? (
                <pre className="bg-gray-50 rounded p-2 text-sm text-gray-900 overflow-x-auto max-h-48">{JSON.stringify(invitations, null, 2)}</pre>
              ) : (
                <div className="text-gray-500">No invitations found.</div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Connected Clients</h4>
              {clients && clients.length > 0 ? (
                <pre className="bg-gray-50 rounded p-2 text-sm text-gray-900 overflow-x-auto max-h-48">{JSON.stringify(clients, null, 2)}</pre>
              ) : (
                <div className="text-gray-500">No connected clients found.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 