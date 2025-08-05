import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmActionModal from './ConfirmActionModal';
import Spinner from './Spinner';
import EditDiscountModal from './EditDiscountModal';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

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
  const { t } = useSupplierTranslation();
  const { token } = useAuth();
  const [confirm, setConfirm] = useState({ open: false, type: '', client: null });
  const [editModal, setEditModal] = useState({ open: false, client: null });
  const toast = useToast();

  const handleAction = async (type, client) => {
    try {
      if (type === 'delete') {
        // Use the correct client ID - prefer client.client.id if it exists, otherwise use client.id
        const clientData = client.client || client;
        const clientId = clientData.id || client.id;
        
        await del(`/api/supplier-management/clients/${clientId}/default-discount`, { token });
        toast.show(t('client_discounts.discount_removed_successfully'), 'success');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || t('client_discounts.action_failed'), 'error');
    } finally {
      setConfirm({ open: false, type: '', client: null });
    }
  };

  const closeConfirm = () => setConfirm({ open: false, type: '', client: null });
  const openEditModal = (client) => setEditModal({ open: true, client });
  const closeEditModal = () => setEditModal({ open: false, client: null });



  if (loading) {
    return <div className="flex justify-center py-8 sm:py-12 text-gray-500"><Spinner size={24} /></div>;
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-400 gap-4 animate-fade-in">
        <svg className="w-12 h-12 mb-2 text-blue-200 dark:text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 9c-4.418 0-8-1.79-8-4V7a4 4 0 014-4h8a4 4 0 014 4v6c0 2.21-3.582 4-8 4z" />
        </svg>
        <div className="text-lg font-semibold text-center">{t('client_discounts.no_clients_found')}</div>
        <button
          className="theme-button px-4 py-2 rounded-lg font-bold shadow w-full sm:w-auto"
          onClick={onAdd}
        >
          {t('client_discounts.add_new_discount')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm bg-white dark:bg-gray-900 rounded-lg shadow-md" role="table" aria-label="Client Discounts Table">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200" role="rowgroup">
            <tr className="h-12" role="row">
              <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">{t('client_discounts.client_name')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">{t('client_discounts.discount_percentage')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">{t('client_discounts.start_date')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">{t('client_discounts.expiry_date')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">{t('client_discounts.status')}</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">{t('client_discounts.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
            {clients.map((client) => {
              // The actual client data is nested under the 'client' property
              const clientData = client.client || client;
              // Use the correct client ID - prefer client.client.id if it exists, otherwise use client.id
              const clientId = clientData.id || client.id;
              
              return (
                <tr
                  key={clientId}
                  className={`border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 ${recentlyUpdated[clientId] ? (actionResult[clientId] === 'success' ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') : ''}`}
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
                        {clientData.email || clientData.client_email || clientData.contact || t('client_discounts.no_email')}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {client.default_discount ? `${client.default_discount}%` : t('client_discounts.no_discount')}
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
                      disabled={rowLoading[clientId]}
                      tabIndex={0}
                      aria-label={`Edit discount for ${clientData.name || clientData.company_name || 'N/A'}`}
                    >
                      {t('client_discounts.edit')}
                    </button>
                    <button
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                      onClick={() => onRemoveDiscount(client)}
                      disabled={rowLoading[clientId]}
                      tabIndex={0}
                      aria-label={`Remove discount for ${clientData.name || clientData.company_name || 'N/A'}`}
                    >
                      {rowLoading[clientId] ? (
                        <svg className="w-4 h-4 animate-spin text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : t('client_discounts.delete')}
                    </button>
                    {actionResult[clientId] === 'success' && !rowLoading[clientId] && (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {actionResult[clientId] === 'error' && !rowLoading[clientId] && (
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => {
          // The actual client data is nested under the 'client' property
          const clientData = client.client || client;
          // Use the correct client ID - prefer client.client.id if it exists, otherwise use client.id
          const clientId = clientData.id || client.id;
          
          return (
            <div
              key={clientId}
              className={`theme-card p-4 sm:p-6 rounded-lg shadow-sm transition-all duration-300 ${
                recentlyUpdated[clientId] 
                  ? (actionResult[clientId] === 'success' 
                      ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' 
                      : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') 
                  : ''
              }`}
            >
              {/* Client Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-theme-text mb-1">
                  {clientData.name || clientData.company_name || 'N/A'}
                </h3>
                <p className="text-sm text-theme-text-secondary">
                  {clientData.email || clientData.client_email || clientData.contact || t('client_discounts.no_email')}
                </p>
              </div>

              {/* Discount Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-theme-text-muted mb-1">{t('client_discounts.discount_percentage')}</p>
                  <p className="text-sm font-medium text-theme-text">
                    {client.default_discount ? `${client.default_discount}%` : t('client_discounts.no_discount')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-theme-text-muted mb-1">{t('client_discounts.status')}</p>
                  <StatusBadge 
                    status={client.default_discount && client.default_discount > 0 ? 'active' : 'inactive'} 
                    aria-label={client.default_discount && client.default_discount > 0 ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-theme-text-muted mb-1">{t('client_discounts.start_date')}</p>
                  <p className="text-sm text-theme-text">
                    {formatDate(client.discount_start_date || client.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-theme-text-muted mb-1">{t('client_discounts.expiry_date')}</p>
                  <p className="text-sm text-theme-text">
                    {formatDate(client.discount_expiry_date)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg shadow text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
                  onClick={() => openEditModal(client)}
                  disabled={rowLoading[clientId]}
                  aria-label={`Edit discount for ${clientData.name || clientData.company_name || 'N/A'}`}
                >
                  {t('client_discounts.edit')}
                </button>
                <button
                  className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow text-sm font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                  onClick={() => onRemoveDiscount(client)}
                  disabled={rowLoading[clientId]}
                  aria-label={`Remove discount for ${clientData.name || clientData.company_name || 'N/A'}`}
                >
                  {rowLoading[clientId] ? (
                    <svg className="w-4 h-4 animate-spin text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : t('client_discounts.delete')}
                </button>
              </div>

              {/* Action Result Indicators */}
              <div className="flex justify-center mt-2">
                {actionResult[clientId] === 'success' && !rowLoading[clientId] && (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionResult[clientId] === 'error' && !rowLoading[clientId] && (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={() => handleAction(confirm.type, confirm.client)}
        title={t('client_discounts.remove_discount')}
        message={t('client_discounts.remove_discount_confirmation')}
        confirmText={t('client_discounts.remove_discount')}
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