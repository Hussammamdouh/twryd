import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmActionModal from './ConfirmActionModal';
import Spinner from './Spinner';
import EditDiscountModal from './EditDiscountModal';

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

export default function ClientDiscountsTable({ clients, loading, onAction, onAdd, onRemoveDiscount, recentlyUpdated = {}, actionResult = {}, rowLoading = {} }) {
  const { token } = useAuth();
  const [confirm, setConfirm] = useState({ open: false, type: '', client: null });
  const [editModal, setEditModal] = useState({ open: false, client: null });
  const toast = useToast();

  const handleAction = async (type, client) => {
    try {
      if (type === 'delete') {
        await del(`/api/supplier-management/clients/${client.id}/default-discount`, { token });
        toast.show('Discount removed successfully', 'success');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || 'Action failed', 'error');
    } finally {
      setConfirm({ open: false, type: '', client: null });
    }
  };

  const closeConfirm = () => setConfirm({ open: false, type: '', client: null });
  const openEditModal = (client) => setEditModal({ open: true, client });
  const closeEditModal = () => setEditModal({ open: false, client: null });



  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500"><Spinner size={24} /></div>;
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4 animate-fade-in">
        <svg className="w-12 h-12 mb-2 text-blue-200 dark:text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 9c-4.418 0-8-1.79-8-4V7a4 4 0 014-4h8a4 4 0 014 4v6c0 2.21-3.582 4-8 4z" />
        </svg>
        <div className="text-lg font-semibold">No clients found.</div>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-800 text-white rounded-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-150"
          onClick={onAdd}
        >
          + Add New Discount
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
      <table className="min-w-full text-sm md:table bg-white dark:bg-gray-900 rounded-lg shadow-md" role="table" aria-label="Client Discounts Table">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200" role="rowgroup">
          <tr className="h-12" role="row">
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Client Name</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Discount Percentage</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Start Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Expiry Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
          {clients.map((client) => {
            // The actual client data is nested under the 'client' property
            const clientData = client.client || client;
            
            return (
              <tr
                key={client.id}
                className={`border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 ${recentlyUpdated[client.id] ? (actionResult[client.id] === 'success' ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') : ''}`}
                role="row"
                tabIndex={0}
                aria-label={`Client: ${clientData.name || clientData.company_name || 'N/A'}, Email: ${clientData.email || clientData.client_email || clientData.contact || 'No email'}`}
              >
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {clientData.name || clientData.company_name || 'N/A'}
                    </div>
                    <div className="text-gray-500 dark:text-gray-300 text-xs">
                      {clientData.email || clientData.client_email || clientData.contact || 'No email'}
                    </div>
                  </div>
                </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {client.default_discount ? `${client.default_discount}%` : 'No discount'}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatDate(client.discount_start_date || client.created_at)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatDate(client.discount_expiry_date)}
              </td>
              <td className="px-4 md:px-6 py-4">
                <StatusBadge 
                  status={client.default_discount && client.default_discount > 0 ? 'active' : 'inactive'} 
                  aria-label={client.default_discount && client.default_discount > 0 ? 'Active' : 'Inactive'}
                />
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2 items-center">
                <button
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded shadow text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
                  onClick={() => openEditModal(client)}
                  disabled={rowLoading[client.id]}
                  tabIndex={0}
                  aria-label={`Edit discount for ${clientData.name || clientData.company_name || 'N/A'}`}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                  onClick={() => onRemoveDiscount(client)}
                  disabled={rowLoading[client.id]}
                  tabIndex={0}
                  aria-label={`Remove discount for ${clientData.name || clientData.company_name || 'N/A'}`}
                >
                  {rowLoading[client.id] ? (
                    <svg className="w-4 h-4 animate-spin text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : 'Delete'}
                </button>
                {actionResult[client.id] === 'success' && !rowLoading[client.id] && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionResult[client.id] === 'error' && !rowLoading[client.id] && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={() => handleAction(confirm.type, confirm.client)}
        title="Remove Discount"
        message="Are you sure you want to remove this client's discount? This action cannot be undone."
        confirmText="Remove Discount"
        confirmColor="red"
        loading={rowLoading[confirm.client?.id]}
      />
      <EditDiscountModal
        open={editModal.open}
        client={editModal.client}
        onClose={closeEditModal}
        onSuccess={() => {
          closeEditModal();
          onAction?.();
        }}
      />
    </div>
  );
} 