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

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
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
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">No subscription requests found</div>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-md">
          When suppliers request subscriptions, they will appear here for your review and approval.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full text-sm bg-white dark:bg-gray-900" role="table" aria-label="Subscription Requests Table">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700" role="rowgroup">
          <tr className="h-14" role="row">
            <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" role="columnheader">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Supplier
              </div>
            </th>
            <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" role="columnheader">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Plan
              </div>
            </th>
            <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" role="columnheader">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Price
              </div>
            </th>
            <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" role="columnheader">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </div>
            </th>
            <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" role="columnheader">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Requested Date
              </div>
            </th>
            <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" role="columnheader">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Actions
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
          {requests.map((request) => (
            <tr
              key={request.id}
              className={`border-b border-gray-100 dark:border-gray-800 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
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
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {(request.supplier?.name || request.supplier?.company_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {request.supplier?.name || request.supplier?.company_name || 'N/A'}
                    </div>
                    {request.supplier?.email && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.supplier.email}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {request.plan?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {request.plan?.is_custom ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        Custom Plan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Standard Plan
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(request.plan?.price_per_month)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/month</span>
                  </div>
                  {request.plan?.price_per_month && (
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <StatusBadge 
                  status={request.status} 
                  aria-label={`Status: ${request.status}`}
                />
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatDate(request.created_at)}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg shadow-sm text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-800/50 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 flex items-center gap-2"
                        onClick={() => handleApprove(request)}
                        disabled={rowLoading[request.id]}
                        tabIndex={0}
                        aria-label={`Approve request for ${request.supplier?.name || request.supplier?.company_name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg shadow-sm text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 flex items-center gap-2"
                        onClick={() => handleReject(request)}
                        disabled={rowLoading[request.id]}
                        tabIndex={0}
                        aria-label={`Reject request for ${request.supplier?.name || request.supplier?.company_name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </>
                  )}
                  
                  {request.status !== 'pending' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {request.status === 'approved' ? 'Already approved' : 'Already rejected'}
                    </span>
                  )}
                  
                  {rowLoading[request.id] && (
                    <Spinner size={16} />
                  )}
                  
                  {actionResult[request.id] === 'success' && !rowLoading[request.id] && (
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {actionResult[request.id] === 'error' && !rowLoading[request.id] && (
                    <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
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