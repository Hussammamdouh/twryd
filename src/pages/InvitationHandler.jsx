import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { post } from '../utils/api';
import { useToast } from '../UI/Common/ToastContext';
import LoadingSkeleton from '../UI/Common/LoadingSkeleton';

export default function InvitationHandler() {
  const { token: invitationToken } = useParams();
  const { token: authToken, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleInvitation = async () => {
      console.log('InvitationHandler mounted with token:', invitationToken);
      console.log('Auth token present:', !!authToken);
      console.log('User present:', !!user);
      console.log('User role:', user?.role);
      
      if (!invitationToken) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      // If user is not logged in, redirect to client login with invitation token
      if (!authToken || !user) {
        console.log('User not logged in, redirecting to login with invitation token');
        navigate(`/login-client?invitation=${invitationToken}`);
        return;
      }

      // If user is not a client, show error
      if (user.role !== 'client') {
        setError('Only clients can accept supplier invitations');
        setLoading(false);
        return;
      }

      // If user is logged in as a client, accept the invitation
      try {
        setLoading(true);
        console.log('Attempting to accept invitation with token:', invitationToken);
        console.log('Auth token:', authToken ? 'Present' : 'Missing');
        
        const response = await post('/api/client/invitations/accept', { 
          token: authToken, 
          data: { token: invitationToken } 
        });
        
        console.log('Invitation accepted successfully:', response);
        toast.show('Invitation accepted successfully!', 'success');
        
        // Redirect to client dashboard after a short delay
        setTimeout(() => {
          navigate('/client/dashboard/invitations');
        }, 1500);
        
      } catch (err) {
        console.error('Error accepting invitation:', err);
        
        // Handle specific error cases
        if (err.message.includes('Session expired') || err.message.includes('401') || err.message.includes('403')) {
          setError('Your session has expired. Please log in again to accept the invitation.');
          toast.show('Session expired. Please log in again.', 'error');
        } else if (err.message.includes('Invalid') || err.message.includes('not found')) {
          setError('This invitation link is invalid or has expired. Please contact the supplier for a new invitation.');
          toast.show('Invalid or expired invitation link', 'error');
        } else {
          setError(err.message || 'Failed to accept invitation');
          toast.show(err.message || 'Failed to accept invitation', 'error');
        }
        setLoading(false);
      }
    };

    handleInvitation();
  }, [invitationToken, authToken, user, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Invitation</h2>
            <p className="text-gray-600 mb-4">Please wait while we process your invitation...</p>
            {invitationToken && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                <strong>Debug:</strong> Token: {invitationToken.substring(0, 20)}...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => navigate('/login-client')}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Login as Client
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 