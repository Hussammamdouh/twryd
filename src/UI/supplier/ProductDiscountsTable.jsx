import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { del } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Common/ToastContext';
import ConfirmActionModal from './ConfirmActionModal';
import Spinner from './Spinner';
import EditProductDiscountModal from './EditProductDiscountModal';

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

export default function ProductDiscountsTable({ productDiscounts, loading, onAction, onAdd }) {
  const { token } = useAuth();
  const [rowLoading, setRowLoading] = useState({});
  const [confirm, setConfirm] = useState({ open: false, type: '', discount: null });
  const [editModal, setEditModal] = useState({ open: false, discount: null });
  const toast = useToast();

  const handleAction = async (type, discount) => {
    setRowLoading(l => ({ ...l, [discount.id]: true }));
    try {
      if (type === 'delete') {
        await del(`/api/supplier-management/products/${discount.product.id}/clients/${discount.client.id}/default-discount`, { token });
        toast.show('Product discount removed successfully', 'success');
      }
      onAction?.();
    } catch (err) {
      toast.show(err.message || 'Action failed', 'error');
    } finally {
      setRowLoading(l => ({ ...l, [discount.id]: false }));
      setConfirm({ open: false, type: '', discount: null });
    }
  };

  const openConfirm = (type, discount) => setConfirm({ open: true, type, discount });
  const closeConfirm = () => setConfirm({ open: false, type: '', discount: null });
  const openEditModal = (discount) => setEditModal({ open: true, discount });
  const closeEditModal = () => setEditModal({ open: false, discount: null });



  if (loading) {
    return <div className="flex justify-center py-8 sm:py-12 text-gray-500"><Spinner size={24} /></div>;
  }

  if (!productDiscounts || productDiscounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-400 gap-4">
        <div className="text-center">No product discounts found.</div>
        <button
          className="theme-button px-4 py-2 rounded-lg font-bold shadow w-full sm:w-auto"
          onClick={onAdd}
        >
          + Add Product Discount
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm bg-white dark:bg-gray-900" role="table" aria-label="Product Discounts Table">
          <thead>
            <tr className="bg-gray-50 text-gray-700" role="row">
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Product Name</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Discount %</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Applies To</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Start Date</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Expiry Date</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Status</th>
              <th className="px-4 md:px-6 py-3 text-left font-semibold" role="columnheader">Actions</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {productDiscounts.map((discount) => (
              <tr key={discount.id} className="border-b last:border-0" role="row" tabIndex={0} aria-label={`Product: ${discount.product?.name || 'N/A'}, Client: ${discount.client?.name || discount.client?.company_name || 'N/A'}`}> 
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">
                      {discount.product?.name || 'N/A'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {discount.product?.category?.name || 'No category'}
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  {discount.discount ? `${discount.discount}%` : 'No discount'}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">
                      {discount.client?.name || discount.client?.company_name || 'N/A'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {discount.client?.email || 'No email'}
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  {formatDate(discount.start_date)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  {formatDate(discount.expiry_date)}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <StatusBadge 
                    status={discount.status || (discount.discount && discount.discount > 0 ? 'active' : 'inactive')} 
                    aria-label={discount.status || (discount.discount && discount.discount > 0 ? 'active' : 'inactive')}
                  />
                </td>
                <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded shadow text-xs font-bold hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => openEditModal(discount)}
                    disabled={rowLoading[discount.id]}
                    tabIndex={0}
                    aria-label={`Edit product discount for ${discount.product?.name || 'N/A'} and ${discount.client?.name || discount.client?.company_name || 'N/A'}`}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-100 text-red-700 rounded shadow text-xs font-bold hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                    onClick={() => openConfirm('delete', discount)}
                    disabled={rowLoading[discount.id]}
                    tabIndex={0}
                    aria-label={`Remove product discount for ${discount.product?.name || 'N/A'} and ${discount.client?.name || discount.client?.company_name || 'N/A'}`}
                  >
                    {rowLoading[discount.id] && <Spinner size={16} color="border-red-700" />}
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {productDiscounts.map((discount) => (
          <div
            key={discount.id}
            className="theme-card p-4 sm:p-6 rounded-lg shadow-sm transition-all duration-300"
          >
            {/* Product Info */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-theme-text mb-1">
                {discount.product?.name || 'N/A'}
              </h3>
              <p className="text-sm text-theme-text-secondary">
                {discount.product?.category?.name || 'No category'}
              </p>
            </div>

            {/* Discount and Client Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-theme-text-muted mb-1">Discount</p>
                <p className="text-sm font-medium text-theme-text">
                  {discount.discount ? `${discount.discount}%` : 'No discount'}
                </p>
              </div>
              <div>
                <p className="text-xs text-theme-text-muted mb-1">Status</p>
                <StatusBadge 
                  status={discount.status || (discount.discount && discount.discount > 0 ? 'active' : 'inactive')} 
                  aria-label={discount.status || (discount.discount && discount.discount > 0 ? 'active' : 'inactive')}
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-4">
              <p className="text-xs text-theme-text-muted mb-1">Applies To</p>
              <div className="p-3 bg-theme-surface rounded-lg">
                <p className="text-sm font-medium text-theme-text">
                  {discount.client?.name || discount.client?.company_name || 'N/A'}
                </p>
                <p className="text-xs text-theme-text-secondary">
                  {discount.client?.email || 'No email'}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-theme-text-muted mb-1">Start Date</p>
                <p className="text-sm text-theme-text">
                  {formatDate(discount.start_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-theme-text-muted mb-1">Expiry Date</p>
                <p className="text-sm text-theme-text">
                  {formatDate(discount.expiry_date)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg shadow text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
                onClick={() => openEditModal(discount)}
                disabled={rowLoading[discount.id]}
                aria-label={`Edit product discount for ${discount.product?.name || 'N/A'} and ${discount.client?.name || discount.client?.company_name || 'N/A'}`}
              >
                Edit
              </button>
              <button
                className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow text-sm font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                onClick={() => openConfirm('delete', discount)}
                disabled={rowLoading[discount.id]}
                aria-label={`Remove product discount for ${discount.product?.name || 'N/A'} and ${discount.client?.name || discount.client?.company_name || 'N/A'}`}
              >
                {rowLoading[discount.id] ? (
                  <svg className="w-4 h-4 animate-spin text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={() => handleAction(confirm.type, confirm.discount)}
        title="Remove Product Discount"
        message="Are you sure you want to remove this product discount? This action cannot be undone."
        confirmText="Remove Discount"
        confirmColor="red"
        loading={rowLoading[confirm.discount?.id]}
      />
      
      <EditProductDiscountModal
        open={editModal.open}
        discount={editModal.discount}
        onClose={closeEditModal}
        onSuccess={() => {
          closeEditModal();
          onAction?.();
        }}
      />
    </div>
  );
} 