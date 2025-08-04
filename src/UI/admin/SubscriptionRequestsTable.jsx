import React, { useState } from 'react';
import StatusBadge from '../supplier/StatusBadge';
import Spinner from '../supplier/Spinner';
import ConfirmActionModal from '../supplier/ConfirmActionModal';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

export default function SubscriptionRequestsTable({ 
  requests, 
  onApprove, 
  onReject,
  recentlyUpdated = {}, 
  actionResult = {}, 
  rowLoading = {} 
}) {
  const [confirm, setConfirm] = useState({ open: false, request: null, action: null });

  const handleApprove = (request) => {
    setConfirm({ open: true, request, action: 'approve' });
  };

  const handleReject = (request) => {
    setConfirm({ open: true, request, action: 'reject' });
  };

  const confirmAction = () => {
    if (confirm.request) {
      if (confirm.action === 'approve') {
        onApprove(confirm.request);
      } else if (confirm.action === 'reject') {
        onReject(confirm.request);
      }
    }
    setConfirm({ open: false, request: null, action: null });
  };

  const closeConfirm = () => setConfirm({ open: false, request: null, action: null });

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4 animate-fade-in">
        <svg className="w-12 h-12 mb-2 text-blue-200 dark:text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="text-lg font-semibold">No subscription requests found.</div>
        <p className="text-sm">When suppliers request subscriptions, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm md:table bg-white dark:bg-gray-900 rounded-lg shadow-md" role="table" aria-label="Subscription Requests Table">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200" role="rowgroup">
          <tr className="h-12" role="row">
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Supplier</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Plan</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Requested Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
          {requests.map((request) => (
            <tr
              key={request.id}
              className={`border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 ${
                recentlyUpdated[request.id] 
                  ? (actionResult[request.id] === 'success' 
                      ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' 
                      : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') 
                  : ''
              }`}
              role="row"
              tabIndex={0}
              aria-label={`Request: ${request.supplier?.name || request.supplier?.company_name}, Plan: ${request.plan?.name}, Status: ${request.status}`}
            >
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {request.supplier?.name || request.supplier?.company_name || 'N/A'}
                  </div>
                  {request.supplier?.email && (
                    <div className="text-gray-500 dark:text-gray-300 text-xs">
                      {request.supplier.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {request.plan?.name || 'N/A'}
                  </div>
                  <div className="text-gray-500 dark:text-gray-300 text-xs">
                    {request.plan?.is_custom ? 'Custom Plan' : 'Standard Plan'}
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <StatusBadge 
                  status={request.status} 
                  aria-label={`Status: ${request.status}`}
                />
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatDate(request.created_at)}
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2 items-center">
                {request.status === 'pending' && (
                  <>
                    <button
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded shadow text-xs font-bold hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-150"
                      onClick={() => handleApprove(request)}
                      disabled={rowLoading[request.id]}
                      tabIndex={0}
                      aria-label={`Approve request for ${request.supplier?.name || request.supplier?.company_name}`}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                      onClick={() => handleReject(request)}
                      disabled={rowLoading[request.id]}
                      tabIndex={0}
                      aria-label={`Reject request for ${request.supplier?.name || request.supplier?.company_name}`}
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {request.status !== 'pending' && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {request.status === 'approved' ? 'Already approved' : 'Already rejected'}
                  </span>
                )}
                
                {rowLoading[request.id] && (
                  <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                
                {actionResult[request.id] === 'success' && !rowLoading[request.id] && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionResult[request.id] === 'error' && !rowLoading[request.id] && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={confirmAction}
        title={confirm.action === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={
          confirm.action === 'approve' 
            ? `Are you sure you want to approve the subscription request for "${confirm.request?.supplier?.name || confirm.request?.supplier?.company_name}"?`
            : `Are you sure you want to reject the subscription request for "${confirm.request?.supplier?.name || confirm.request?.supplier?.company_name}"? This action cannot be undone.`
        }
        confirmText={confirm.action === 'approve' ? 'Approve Request' : 'Reject Request'}
        confirmColor={confirm.action === 'approve' ? 'green' : 'red'}
        loading={rowLoading[confirm.request?.id]}
      />
    </div>
  );
} 