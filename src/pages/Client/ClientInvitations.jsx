import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import StatusBadge from '../../UI/supplier/StatusBadge';
import Pagination from '../../UI/supplier/Pagination';
import ConfirmModal from '../../UI/supplier/ConfirmModal';

export default function ClientInvitations() {
  const { token } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [invitationToken, setInvitationToken] = useState('');

  // Helper function to extract token from URL or clean up input
  const extractInvitationToken = (input) => {
    // If it's a full URL, extract the token part
    if (input.includes('/invitation/')) {
      const urlParts = input.split('/invitation/');
      return urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    }
    // If it's just the token, return as is
    return input.trim();
  };

  // Fetch invitations
  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useQuery({
    queryKey: ['client-invitations', token],
    queryFn: async () => {
      if (!token) return { invitations: [] };
      const response = await get('/api/client/invitations', { token });
      return response.data || { invitations: [] };
    },
    enabled: !!token,
  });

  // Fetch relationships (accepted invitations)
  const {
    data: relationshipsData,
    isLoading: relationshipsLoading,
  } = useQuery({
    queryKey: ['client-relationships', token],
    queryFn: async () => {
      if (!token) return { relationships: { data: [] } };
      const response = await get('/api/client/invitations/relationships?per_page=100&paginated=true', { token });
      return response.data || { relationships: { data: [] } };
    },
    enabled: !!token,
  });

  // Fetch connected suppliers
  const {
    data: suppliersData,
    isLoading: suppliersLoading,
  } = useQuery({
    queryKey: ['client-suppliers', token],
    queryFn: async () => {
      if (!token) return { suppliers: [] };
      const response = await get('/api/client/invitations/suppliers', { token });
      return response.data || { suppliers: [] };
    },
    enabled: !!token,
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: async (invitationToken) => {
      return await post('/api/client/invitations/accept', { 
        token: token, // auth token from useAuth
        data: { token: invitationToken } // invitation token
      });
    },
    onSuccess: () => {
      toast.show('Invitation accepted successfully!', 'success');
      queryClient.invalidateQueries(['client-invitations']);
      queryClient.invalidateQueries(['client-relationships']);
      queryClient.invalidateQueries(['client-suppliers']);
    },
    onError: (error) => {
      toast.show(error.message || 'Failed to accept invitation', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (invitationToken) => {
      return await post('/api/client/invitations/reject', { 
        token: token, // auth token from useAuth
        data: { token: invitationToken } // invitation token
      });
    },
    onSuccess: () => {
      toast.show('Invitation rejected successfully!', 'success');
      queryClient.invalidateQueries(['client-invitations']);
      queryClient.invalidateQueries(['client-relationships']);
    },
    onError: (error) => {
      toast.show(error.message || 'Failed to reject invitation', 'error');
    },
  });

  // Disconnect functionality is not supported by the API, so no mutation is defined.

  // Combine data
  const allInvitations = useMemo(() => {
    const invitations = invitationsData?.invitations || [];
    const relationships = relationshipsData?.relationships?.data || [];
    const suppliers = suppliersData?.suppliers || [];

    // Create a map of supplier data for quick lookup
    const supplierMap = new Map();
    suppliers.forEach(supplier => {
      const supplierId = supplier.supplier_id || supplier.id;
      const supplierData = supplier.supplier || supplier;
      supplierMap.set(supplierId, supplierData);
    });

    // Combine invitations and relationships
    let combined = [
      ...invitations.map(inv => ({
        ...inv,
        type: 'invitation',
        supplier: inv.supplier || supplierMap.get(inv.supplier_id) || { name: 'Unknown Supplier', email: 'N/A' },
        sent_date: inv.created_at,
        status: inv.status,
        access: 'No Access'
      })),
      ...relationships.map(rel => ({
        ...rel,
        type: 'relationship',
        supplier: rel.supplier || supplierMap.get(rel.supplier_id) || { name: 'Unknown Supplier', email: 'N/A' },
        sent_date: rel.connected_at,
        status: rel.status === 'active' ? 'accepted' : rel.status,
        access: rel.status === 'active' ? 'Access Granted' : 'No Access'
      }))
    ];

    // Remove duplicates: keep only one entry per supplier_id and status
    const seen = new Set();
    combined = combined.filter(item => {
      const key = `${item.supplier_id}-${item.status}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return combined;
  }, [invitationsData, relationshipsData, suppliersData]);

  // Filter and search
  const filteredInvitations = useMemo(() => {
    let filtered = allInvitations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    return filtered;
  }, [allInvitations, searchTerm, statusFilter]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage);
  const paginatedInvitations = filteredInvitations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle actions
  const handleAccept = (invitation) => {
    setSelectedInvitation(invitation);
    setConfirmAction('accept');
    setShowConfirmModal(true);
  };

  const handleReject = (invitation) => {
    setSelectedInvitation(invitation);
    setConfirmAction('reject');
    setShowConfirmModal(true);
  };

  const handleResend = () => {
    // TODO: Implement resend functionality
    toast.show('Resend functionality coming soon!', 'info');
  };

  // Disconnect handler removed as not supported by API.

  const handleVisitStore = (invitation) => {
    const supplierId = invitation.supplier_id || invitation.supplier?.id;
    if (supplierId) {
      navigate(`/client/dashboard/my-marketplace?supplier=${supplierId}`);
    } else {
      toast.show('Supplier information not available', 'error');
    }
  };

  const handleAcceptByToken = () => {
    if (!invitationToken.trim()) {
      toast.show('Please enter an invitation token.', 'warning');
      return;
    }
    
    const cleanedToken = extractInvitationToken(invitationToken);
    
    acceptMutation.mutate(cleanedToken);
    setInvitationToken('');
  };

  const confirmActionHandler = () => {
    if (!selectedInvitation) return;

    switch (confirmAction) {
      case 'accept':
        acceptMutation.mutate(selectedInvitation.token);
        break;
      case 'reject':
        rejectMutation.mutate(selectedInvitation.token);
        break;
      case 'disconnect':
        // This case is removed as disconnect is not supported.
        break;
    }

    setShowConfirmModal(false);
    setSelectedInvitation(null);
    setConfirmAction(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Pending' },
      accepted: { color: 'green', text: 'Accepted' },
      rejected: { color: 'red', text: 'Rejected' },
      active: { color: 'green', text: 'Active' },
      suspended: { color: 'gray', text: 'Suspended' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status };
    return <StatusBadge status={config.text} color={config.color} />;
  };

  const getAccessBadge = (access) => {
    const color = access === 'Access Granted' ? 'green' : 'red';
    return <StatusBadge status={access} color={color} />;
  };

  const getActionButtons = (invitation) => {
    if (invitation.status === 'pending') {
      return (
        <>
          <button
            onClick={() => handleAccept(invitation)}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
          >
            ✓ Accept
          </button>
          <button
            onClick={() => handleReject(invitation)}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
          >
            ✕ Reject
          </button>
        </>
      );
    } else if (invitation.status === 'accepted' || invitation.status === 'active') {
      return (
        <button
          onClick={() => handleVisitStore(invitation)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Visit Store
        </button>
      );
    } else if (invitation.status === 'rejected') {
      return (
        <button
          onClick={() => handleResend(invitation)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {/* TODO: Implement resend if API supports it */}
          Resend Request
        </button>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (invitationsLoading || relationshipsLoading || suppliersLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (invitationsError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-theme-text mb-2">Failed to load invitations</h2>
        <p className="text-theme-text-secondary">{invitationsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <span className="text-gray-900 dark:text-white">Invitations</span>
            <span className="text-gray-500 dark:text-gray-400 font-normal text-lg sm:text-xl ml-2">Manage supplier invitations</span>
          </div>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Accept, reject, or visit your connected suppliers.</p>
      </div>

      {/* Invitation Token Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accept Invitation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you received an invitation link from a supplier, enter the invitation token here to accept it.
        </p>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter invitation token"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
            value={invitationToken}
            onChange={(e) => setInvitationToken(e.target.value)}
          />
          <button
            onClick={handleAcceptByToken}
            disabled={!invitationToken.trim() || acceptMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by supplier name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Supplier Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Supplier Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                  Access
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedInvitations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">No invitations found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvitations.map((inv) => (
                  <tr key={`${inv.type}-${inv.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {inv.supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {inv.supplier.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          return inv.supplier.categories ? inv.supplier.categories.map(cat => cat.name).join(', ') : 'N/A';
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(inv.sent_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        {getActionButtons(inv)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAccessBadge(inv.access)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedInvitation(null);
          setConfirmAction(null);
        }}
        onConfirm={confirmActionHandler}
        title={
          confirmAction === 'accept' ? 'Accept Invitation' :
          confirmAction === 'reject' ? 'Reject Invitation' :
          confirmAction === 'disconnect' ? 'Disconnect Supplier' : 'Confirm Action'
        }
        message={
          confirmAction === 'accept' ? `Are you sure you want to accept the invitation from ${selectedInvitation?.supplier?.name}?` :
          confirmAction === 'reject' ? `Are you sure you want to reject the invitation from ${selectedInvitation?.supplier?.name}?` :
          confirmAction === 'disconnect' ? `Are you sure you want to disconnect from ${selectedInvitation?.supplier?.name}?` : 'Are you sure you want to perform this action?'
        }
        confirmText={
          confirmAction === 'accept' ? 'Accept' :
          confirmAction === 'reject' ? 'Reject' :
          confirmAction === 'disconnect' ? 'Disconnect' : 'Confirm'
        }
        confirmColor={
          confirmAction === 'accept' ? 'green' :
          confirmAction === 'reject' ? 'red' :
          confirmAction === 'disconnect' ? 'red' : 'blue'
        }
        loading={acceptMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
} 