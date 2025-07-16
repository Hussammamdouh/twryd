import React from 'react';
import ProfileCard from '../../../UI/admin/ProfileCard';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function renderUserDetails(user) {
  const details = [];
  if (user.suppliers) {
    details.push(
      <div key="suppliers" className="mb-4">
        <span className="font-medium text-gray-700 capitalize block mb-1">Suppliers:</span>
        <pre className="bg-gray-50 rounded p-2 text-sm text-gray-900 overflow-x-auto">{JSON.stringify(user.suppliers, null, 2)}</pre>
      </div>
    );
  }
  if (user.invitations) {
    details.push(
      <div key="invitations" className="mb-4">
        <span className="font-medium text-gray-700 capitalize block mb-1">Invitations:</span>
        <pre className="bg-gray-50 rounded p-2 text-sm text-gray-900 overflow-x-auto">{JSON.stringify(user.invitations, null, 2)}</pre>
      </div>
    );
  }
  return details;
}

export default function ClientProfile() {
  const { user, logout, token } = useAuth();

  if (!token || !user) {
    // Not logged in, redirect to login
    return <Navigate to="/auth/client/login" replace />;
  }

  if (user.role !== 'client' && user.role !== 'supplier') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h2>
          <p className="text-gray-600">This page is only available for client or supplier users.</p>
        </div>
      </div>
    );
  }

  const details = renderUserDetails(user);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 gap-8">
      <ProfileCard
        name={user.name || user.full_name || 'User'}
        email={user.email}
        phone={user.phone}
        onLogout={logout}
        role={user.role}
      />
      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md w-full border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Other Details</h3>
        {details.length > 0 ? (
          <div className="flex flex-col gap-2">{details}</div>
        ) : (
          <div className="text-gray-500">No suppliers or invitations data available.</div>
        )}
      </div>
    </div>
  );
} 