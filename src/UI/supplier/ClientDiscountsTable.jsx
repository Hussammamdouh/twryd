import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmModal from './ConfirmModal';
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

export default function ClientDiscountsTable({ clients, loading, onAction, onAdd }) {
  const { token } = useAuth();
  const [rowLoading, setRowLoading] = useState({});
  const [confirm, setConfirm] = useState({ open: false, type: '', client: null });
  const [editModal, setEditModal] = useState({ open: false, client: null });
  const toast = useToast();

  const handleAction = async (type, client) => {
    setRowLoading(l => ({ ...l, [client.id]: true }));
    try {
      if (type === 'delete') {
        await del(`/api/supplier-management/clients/${client.id}/default-discount`, { token });
        toast.show('Discount removed successfully', 'success');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || 'Action failed', 'error');
    } finally {
      setRowLoading(l => ({ ...l, [client.id]: false }));
      setConfirm({ open: false, type: '', client: null });
    }
  };

  const openConfirm = (type, client) => setConfirm({ open: true, type, client });
  const closeConfirm = () => setConfirm({ open: false, type: '', client: null });
  const openEditModal = (client) => setEditModal({ open: true, client });
  const closeEditModal = () => setEditModal({ open: false, client: null });

  const confirmMessage = {
    delete: 'Are you sure you want to remove this discount?'
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500"><Spinner size={24} /></div>;
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4">
        <div>No clients found.</div>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={onAdd}
        >
          + Add New Discount
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
      <table className="min-w-full text-sm md:table bg-white dark:bg-gray-900">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">Client Name</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">Discount Percentage</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">Start Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">Expiry Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {client.client?.name || client.name || client.company_name || 'N/A'}
                  </div>
                  <div className="text-gray-500 dark:text-gray-300 text-xs">
                    {client.client?.email || client.client_email || client.email || 'No email'}
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
                />
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded shadow text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => openEditModal(client)}
                  disabled={rowLoading[client.id]}
                  tabIndex={0}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => openConfirm('delete', client)}
                  disabled={rowLoading[client.id]}
                  tabIndex={0}
                >
                  {rowLoading[client.id] && <Spinner size={16} color="border-red-700" />}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmModal
        open={confirm.open}
        title={confirm.type.charAt(0).toUpperCase() + confirm.type.slice(1) + ' Confirmation'}
        message={confirmMessage[confirm.type]}
        onConfirm={() => handleAction(confirm.type, confirm.client)}
        onCancel={closeConfirm}
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